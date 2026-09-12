#!/usr/bin/env bash
# DocAtlas bootstrap — https://github.com/JeeEko/DocAtlas
set -euo pipefail

TOOLKIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="${TOOLKIT_ROOT}/templates"
TARGET_DIR="${PWD}"

MINIMAL=false
WITH_GOVERNANCE=false
FORCE=false
JOURNEY_NAME=""

usage() {
  cat <<'EOF'
Usage: bootstrap.sh [options]

Scaffold DocAtlas documentation into the current directory.

Options:
  --minimal              Copy only core documentation files
  --with-governance      Include GOVERNANCE templates
  --force                Overwrite existing DocAtlas-managed files
  --journey-name NAME    Project name written into generated docs
  -h, --help             Show this message

Examples:
  ./bootstrap.sh --journey-name "My Project"
  ./bootstrap.sh --minimal --with-governance
EOF
}

log() {
  echo "[docatlas] $*"
}

warn() {
  echo "[docatlas] warning: $*" >&2
}

die() {
  echo "[docatlas] error: $*" >&2
  exit 1
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --minimal)
        MINIMAL=true
        shift
        ;;
      --with-governance)
        WITH_GOVERNANCE=true
        shift
        ;;
      --force)
        FORCE=true
        shift
        ;;
      --journey-name)
        [[ $# -ge 2 ]] || die "--journey-name requires a value"
        JOURNEY_NAME="$2"
        shift 2
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        die "unknown option: $1"
        ;;
    esac
  done
}

should_copy() {
  local dest="$1"
  if [[ -e "${dest}" && "${FORCE}" != "true" ]]; then
    warn "skipping existing file: ${dest} (use --force to overwrite)"
    return 1
  fi
  return 0
}

copy_file() {
  local src="$1"
  local dest="$2"
  [[ -f "${src}" ]] || die "missing template: ${src}"
  if should_copy "${dest}"; then
    mkdir -p "$(dirname "${dest}")"
    cp "${src}" "${dest}"
    log "copied $(basename "${dest}")"
  fi
}

substitute_journey_name() {
  local file="$1"
  [[ -n "${JOURNEY_NAME}" ]] || return 0
  if grep -q '__JOURNEY_NAME__' "${file}" 2>/dev/null; then
    sed -i "s/__JOURNEY_NAME__/${JOURNEY_NAME}/g" "${file}"
  fi
}

write_docatlas_json() {
  local dest="${TARGET_DIR}/.docatlas.json"
  if [[ -e "${dest}" && "${FORCE}" != "true" ]]; then
    warn "skipping existing .docatlas.json (use --force to regenerate)"
    return 0
  fi
  local name="${JOURNEY_NAME:-$(basename "${TARGET_DIR}")}"
  local version
  version="$(cat "${TOOLKIT_ROOT}/VERSION" 2>/dev/null || echo "1.0.0")"
  cat > "${dest}" <<EOF
{
  "toolkitVersion": "${version}",
  "journeyName": "${name}",
  "bootstrappedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "repository": "https://github.com/JeeEko/DocAtlas"
}
EOF
  log "wrote .docatlas.json"
}

bootstrap_core() {
  log "bootstrapping DocAtlas into ${TARGET_DIR}"

  copy_file "${TEMPLATES_DIR}/AGENTS.md" "${TARGET_DIR}/AGENTS.md"
  write_docatlas_json

  if [[ "${MINIMAL}" == "true" ]]; then
    log "minimal mode: skipping extended docs and integrations"
    return 0
  fi

  copy_file "${TEMPLATES_DIR}/docs/ARCHITECTURE.md" "${TARGET_DIR}/docs/ARCHITECTURE.md"
  copy_file "${TEMPLATES_DIR}/docs/ONBOARDING.md" "${TARGET_DIR}/docs/ONBOARDING.md"
  copy_file "${TEMPLATES_DIR}/docs/RUNBOOK.md" "${TARGET_DIR}/docs/RUNBOOK.md"
  copy_file "${TEMPLATES_DIR}/docs/GLOSSARY.md" "${TARGET_DIR}/docs/GLOSSARY.md"

  copy_file "${TEMPLATES_DIR}/.cursor/rules/docatlas-core.mdc" "${TARGET_DIR}/.cursor/rules/docatlas-core.mdc"
  copy_file "${TEMPLATES_DIR}/.cursor/rules/docatlas-docs.mdc" "${TARGET_DIR}/.cursor/rules/docatlas-docs.mdc"
  copy_file "${TEMPLATES_DIR}/.cursor/skills/docatlas-skill-discovery/SKILL.md" "${TARGET_DIR}/.cursor/skills/docatlas-skill-discovery/SKILL.md"

  copy_file "${TEMPLATES_DIR}/.github/pull_request_template.md" "${TARGET_DIR}/.github/pull_request_template.md"
  copy_file "${TEMPLATES_DIR}/.github/workflows/docatlas-drift-report.yml" "${TARGET_DIR}/.github/workflows/docatlas-drift-report.yml"
}

bootstrap_governance() {
  if [[ "${WITH_GOVERNANCE}" != "true" ]]; then
    return 0
  fi
  log "including governance templates"
  copy_file "${TOOLKIT_ROOT}/GOVERNANCE/CONFIDENCE_TAGS.md" "${TARGET_DIR}/GOVERNANCE/CONFIDENCE_TAGS.md"
  copy_file "${TOOLKIT_ROOT}/GOVERNANCE/PR_CHECKLIST.md" "${TARGET_DIR}/GOVERNANCE/PR_CHECKLIST.md"
  copy_file "${TOOLKIT_ROOT}/GOVERNANCE/WEEKLY_SYNC.md" "${TARGET_DIR}/GOVERNANCE/WEEKLY_SYNC.md"
  copy_file "${TOOLKIT_ROOT}/GOVERNANCE/README.md" "${TARGET_DIR}/GOVERNANCE/README.md"
}

apply_substitutions() {
  [[ -n "${JOURNEY_NAME}" ]] || return 0
  log "setting journey name to: ${JOURNEY_NAME}"
  local f
  for f in \
    "${TARGET_DIR}/AGENTS.md" \
    "${TARGET_DIR}/docs/ARCHITECTURE.md" \
    "${TARGET_DIR}/docs/ONBOARDING.md" \
    "${TARGET_DIR}/docs/RUNBOOK.md" \
    "${TARGET_DIR}/docs/GLOSSARY.md"
  do
    [[ -f "${f}" ]] && substitute_journey_name "${f}"
  done
}

main() {
  parse_args "$@"
  [[ -d "${TEMPLATES_DIR}" ]] || die "templates directory not found at ${TEMPLATES_DIR}"
  bootstrap_core
  bootstrap_governance
  apply_substitutions
  log "bootstrap complete"
  log "next: fill in docs/ and run 'docatlas drift' to check for gaps"
}

main "$@"

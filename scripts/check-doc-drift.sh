#!/usr/bin/env bash
# DocAtlas drift checker — https://github.com/JeeEko/DocAtlas
set -euo pipefail

ROOT="${DOCATLAS_TARGET:-${PWD}}"
STRICT=false
ISSUES=0

usage() {
  cat <<'EOF'
Usage: check-doc-drift.sh [options]

Check whether documentation matches the project structure.

Options:
  --strict    Exit with code 1 if any drift is found
  -h, --help  Show this message
EOF
}

log_issue() {
  echo "[drift] $*"
  ISSUES=$((ISSUES + 1))
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --strict)
        STRICT=true
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "unknown option: $1" >&2
        usage >&2
        exit 1
        ;;
    esac
  done
}

check_required_files() {
  local files=(
    "AGENTS.md"
    ".docatlas.json"
    "docs/ARCHITECTURE.md"
    "docs/ONBOARDING.md"
    "docs/RUNBOOK.md"
    "docs/GLOSSARY.md"
  )

  for f in "${files[@]}"; do
    if [[ ! -f "${ROOT}/${f}" ]]; then
      log_issue "missing required file: ${f}"
    fi
  done
}

check_placeholders() {
  local files=()
  while IFS= read -r -d '' f; do
    files+=("$f")
  done < <(find "${ROOT}/docs" -name '*.md' -print0 2>/dev/null || true)

  [[ -f "${ROOT}/AGENTS.md" ]] && files+=("${ROOT}/AGENTS.md")

  for f in "${files[@]}"; do
    [[ -f "${f}" ]] || continue
    if grep -qE 'TODO|TBD|__JOURNEY_NAME__|FILL_IN|PLACEHOLDER' "${f}" 2>/dev/null; then
      log_issue "unresolved placeholder in ${f#${ROOT}/}"
    fi
  done
}

check_stale_docs() {
  [[ -d "${ROOT}/docs" ]] || return 0

  local doc
  for doc in "${ROOT}"/docs/*.md; do
    [[ -f "${doc}" ]] || continue
    local doc_mtime
    doc_mtime=$(stat -c %Y "${doc}" 2>/dev/null || stat -f %m "${doc}" 2>/dev/null || echo 0)

    local newest_src=0
    local src
    for src in "${ROOT}"/src "${ROOT}"/lib "${ROOT}"/app; do
      [[ -d "${src}" ]] || continue
      local m
      m=$(find "${src}" -type f \( -name '*.ts' -o -name '*.js' -o -name '*.py' -o -name '*.go' \) -printf '%T@\n' 2>/dev/null | sort -n | tail -1 || echo 0)
      if [[ "${m}" != "0" && $(echo "${m} > ${newest_src}" | bc -l 2>/dev/null || echo 0) -eq 1 ]]; then
        newest_src="${m%.*}"
      fi
    done

    if [[ "${newest_src}" -gt 0 && "${doc_mtime}" -lt "${newest_src}" ]]; then
      log_issue "docs may be stale: ${doc#${ROOT}/} (source changed after last doc update)"
    fi
  done
}

check_docatlas_config() {
  if [[ ! -f "${ROOT}/.docatlas.json" ]]; then
    return 0
  fi
  if ! grep -q '"journeyName"' "${ROOT}/.docatlas.json" 2>/dev/null; then
    log_issue ".docatlas.json is missing journeyName"
  fi
}

main() {
  parse_args "$@"

  if [[ ! -f "${ROOT}/.docatlas.json" && ! -f "${ROOT}/AGENTS.md" ]]; then
    echo "[drift] no DocAtlas files found in ${ROOT}" >&2
    echo "[drift] run 'docatlas bootstrap' first" >&2
    exit 1
  fi

  echo "[drift] checking ${ROOT}"

  check_required_files
  check_placeholders
  check_stale_docs
  check_docatlas_config

  if [[ "${ISSUES}" -eq 0 ]]; then
    echo "[drift] no issues found"
    exit 0
  fi

  echo "[drift] found ${ISSUES} issue(s)"
  if [[ "${STRICT}" == "true" ]]; then
    exit 1
  fi
  exit 0
}

main "$@"

#!/usr/bin/env bash
# DocAtlas installer — https://github.com/JeeEko/DocAtlas
set -euo pipefail

TOOLKIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="${HOME}/.local/bin"
CLI_SOURCE="${TOOLKIT_ROOT}/bin/docatlas"
CLI_TARGET="${INSTALL_DIR}/docatlas"

log() {
  echo "[docatlas] $*"
}

die() {
  echo "[docatlas] error: $*" >&2
  exit 1
}

main() {
  [[ -f "${CLI_SOURCE}" ]] || die "CLI not found at ${CLI_SOURCE}"
  mkdir -p "${INSTALL_DIR}"

  ln -sf "${CLI_SOURCE}" "${CLI_TARGET}"
  chmod +x "${CLI_SOURCE}" "${TOOLKIT_ROOT}/bootstrap.sh"
  chmod +x "${TOOLKIT_ROOT}/scripts/"*.sh 2>/dev/null || true

  log "installed docatlas CLI to ${CLI_TARGET}"
  log "toolkit root: ${TOOLKIT_ROOT}"

  if ! echo "${PATH}" | tr ':' '\n' | grep -qx "${INSTALL_DIR}"; then
    log "add ${INSTALL_DIR} to your PATH if docatlas is not found:"
    echo "  export PATH=\"${INSTALL_DIR}:\$PATH\""
  fi

  log "run 'docatlas help' to get started"
}

main "$@"

#!/usr/bin/env bash
# Install DocAtlas toolkit from GitHub — https://github.com/JeeEko/DocAtlas
set -euo pipefail

REPO_URL="https://github.com/JeeEko/DocAtlas.git"
INSTALL_DIR="${DOCATLAS_HOME:-${HOME}/.docatlas}"
BRANCH="${DOCATLAS_BRANCH:-main}"

log() {
  echo "[docatlas] $*"
}

die() {
  echo "[docatlas] error: $*" >&2
  exit 1
}

main() {
  if [[ -d "${INSTALL_DIR}/.git" ]]; then
    log "updating existing toolkit at ${INSTALL_DIR}"
    git -C "${INSTALL_DIR}" fetch origin "${BRANCH}"
    git -C "${INSTALL_DIR}" checkout "${BRANCH}"
    git -C "${INSTALL_DIR}" pull origin "${BRANCH}"
  else
    log "cloning DocAtlas to ${INSTALL_DIR}"
    git clone --branch "${BRANCH}" --depth 1 "${REPO_URL}" "${INSTALL_DIR}"
  fi

  chmod +x "${INSTALL_DIR}/bootstrap.sh" \
            "${INSTALL_DIR}/install.sh" \
            "${INSTALL_DIR}/bin/docatlas" \
            "${INSTALL_DIR}/scripts/"*.sh

  log "running installer"
  "${INSTALL_DIR}/install.sh"

  log "toolkit ready at ${INSTALL_DIR}"
  log "run 'docatlas bootstrap --journey-name \"Your Project\"' in your repo"
}

main "$@"

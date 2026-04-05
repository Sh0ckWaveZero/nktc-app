#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_DIR="$ROOT_DIR/deploy"
TARGET="${1:-x86}"
ACTION="${2:-deploy}"

log() {
  printf '[deploy] %s\n' "$1"
}

fail() {
  printf '[deploy] %s\n' "$1" >&2
  exit 1
}

require_file() {
  local file_path="$1"

  [[ -f "$file_path" ]] || fail "Missing required file: $file_path"
}

detect_compose() {
  if command -v podman-compose >/dev/null 2>&1; then
    CONTAINER_BIN="podman"
    COMPOSE_BIN=("podman-compose")
    return
  fi

  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    CONTAINER_BIN="docker"
    COMPOSE_BIN=("docker" "compose")
    return
  fi

  if command -v podman >/dev/null 2>&1 && podman compose version >/dev/null 2>&1; then
    CONTAINER_BIN="podman"
    COMPOSE_BIN=("podman" "compose")
    return
  fi

  fail "No supported compose provider found. Install podman-compose, docker compose, or podman compose."
}

compose() {
  "${COMPOSE_BIN[@]}" "${COMPOSE_FILES[@]}" "$@"
}

ensure_network() {
  if "$CONTAINER_BIN" network inspect app-net >/dev/null 2>&1; then
    log "Network app-net already exists"
    return
  fi

  log "Creating shared network app-net"
  "$CONTAINER_BIN" network create app-net >/dev/null
}

build() {
  log "Building images for target: $TARGET"
  compose build
}

migrate() {
  log "Running prisma migrate deploy"
  compose run --rm backend bun run prisma:migrate:deploy
}

up() {
  log "Starting services"
  compose up -d --no-build
}

down() {
  log "Stopping services"
  compose down
}

status() {
  compose ps
}

logs() {
  compose logs -f
}

case "$TARGET" in
  x86)
    COMPOSE_FILES=("-f" "$DEPLOY_DIR/compose.app.yml" "-f" "$DEPLOY_DIR/compose.x86.override.yml")
    ;;
  pi4)
    COMPOSE_FILES=("-f" "$DEPLOY_DIR/compose.app.yml" "-f" "$DEPLOY_DIR/compose.pi4.override.yml")
    ;;
  *)
    fail "Unknown target: $TARGET. Use x86 or pi4."
    ;;
esac

require_file "$DEPLOY_DIR/env/frontend.env"
require_file "$DEPLOY_DIR/env/backend.env"
detect_compose

case "$ACTION" in
  deploy)
    ensure_network
    build
    migrate
    up
    status
    ;;
  build)
    ensure_network
    build
    ;;
  migrate)
    ensure_network
    migrate
    ;;
  up)
    ensure_network
    up
    status
    ;;
  down)
    down
    ;;
  ps)
    status
    ;;
  logs)
    logs
    ;;
  *)
    fail "Unknown action: $ACTION. Use deploy, build, migrate, up, down, ps, or logs."
    ;;
esac

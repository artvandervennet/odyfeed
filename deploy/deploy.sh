#!/usr/bin/env bash
# Auto-deploy for the Raspberry Pi. A systemd timer runs this every minute.
# It asks GitHub for the newest release: the highest tag named vMAJOR.MINOR.PATCH, which
# deploy/release.sh makes. If that one is live, it stops there. If not, it checks that release
# out, installs, builds and reloads the site in pm2. GitHub never has to reach the Pi.
# A tag with more after the version (v1.2.0-rc.1) is never deployed, and neither is main.
#
#   deploy/deploy.sh           deploy the newest release if it isn't live
#   deploy/deploy.sh --force   build and restart even if nothing changed
#
# Deleting a release's tag on GitHub takes it back: the newest release left goes live.
#
# The folders the running site writes to (data/ and logs/) are ignored by git, so a deploy
# never touches them.
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/odyfeed}"
ENV_FILE="${ENV_FILE:-$HOME/.config/odyfeed.env}"
cd "$APP_DIR"

# one deploy at a time: a build can take longer than the minute between checks
exec 9>"$APP_DIR/.deploy.lock"
flock -n 9 || exit 0

# --force: a tag that was moved on GitHub moves here too; --prune-tags: a deleted one goes
git fetch --quiet --force --prune --prune-tags --tags origin
tag="$(git tag --list 'v*' | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -n 1 || true)"
# nothing released yet: the site stays as it is
[ -n "$tag" ] || exit 0
target="$(git rev-parse --verify "$tag^{commit}")"
if [ "$(git rev-parse HEAD)" = "$target" ] && [ -f .output/server/index.mjs ] && [ "${1:-}" != "--force" ]; then
  exit 0
fi

echo "$(date '+%F %T') Deploying $tag ($(git rev-parse --short "$target")): $(git log -1 --format=%s "$target")"
# build exactly that release; if someone edited files on the Pi, stop and say so instead of overwriting
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "$(date '+%F %T') FAILED $tag: the checkout on the Pi has its own changes."
  exit 1
fi
git checkout --quiet --detach "$target"

# the build reads the same settings as the server
set -a; [ -f "$ENV_FILE" ] && . "$ENV_FILE"; set +a

# pnpm comes from corepack, at the version package.json asks for; nothing to install on the Pi
corepack pnpm install --frozen-lockfile
corepack pnpm build

# pm2 runs the site: start it the first time, reload it after that
pm2 startOrReload deploy/ecosystem.config.cjs --update-env
pm2 save
echo "$(date '+%F %T') Deployed $tag ($(git rev-parse --short HEAD))"

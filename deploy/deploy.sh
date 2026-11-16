#!/usr/bin/env bash
# Auto-deploy for the Raspberry Pi. A systemd timer runs this every minute.
# It asks GitHub whether main has moved. If not, it stops there. If it has, it pulls,
# installs, builds and reloads the site in pm2. GitHub never has to reach the Pi.
#
#   deploy/deploy.sh           deploy if there is something new
#   deploy/deploy.sh --force   build and restart even if nothing changed
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

git fetch --quiet origin main
if [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] && [ -f .output/server/index.mjs ] && [ "${1:-}" != "--force" ]; then
  exit 0
fi

echo "Deploying $(git rev-parse --short origin/main): $(git log -1 --format=%s origin/main)"
# only ever fast-forward: if someone edited files on the Pi, stop and say so instead of overwriting
git merge --quiet --ff-only origin/main

# the build reads the same settings as the server
set -a; [ -f "$ENV_FILE" ] && . "$ENV_FILE"; set +a

# pnpm comes from corepack, at the version package.json asks for; nothing to install on the Pi
corepack pnpm install --frozen-lockfile
corepack pnpm build

# pm2 runs the site: start it the first time, reload it after that
pm2 startOrReload deploy/ecosystem.config.cjs --update-env
pm2 save
echo "Deployed $(git rev-parse --short HEAD)"

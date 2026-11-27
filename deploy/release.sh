#!/usr/bin/env bash
# Makes a release: tags what is on GitHub's main with the next version and puts a release page
# on GitHub listing what changed. The Pi deploys the newest release within a few minutes
# (deploy/deploy.sh); nothing else goes live.
#
#   deploy/release.sh patch    v1.2.3 to v1.2.4: fixes
#   deploy/release.sh minor    v1.2.3 to v1.3.0: something new
#   deploy/release.sh major    v1.2.3 to v2.0.0: a change in how the site is used
#   deploy/release.sh v1.0.0   exactly that version, for the first release
#
# Run it from the main branch, with everything committed and pushed. It shows what goes into
# the release and asks before it tags anything.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

want="${1:-}"
if [ -z "$want" ]; then sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 1; fi

# a release is exactly what is on GitHub's main
[ "$(git branch --show-current)" = main ] || { echo "Releases are made from main."; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "There are changes that aren't committed."; exit 1; }
git fetch --quiet --tags origin main
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] || { echo "main here is not main on GitHub: push or pull first."; exit 1; }

# only tags that deploy.sh deploys count: vMAJOR.MINOR.PATCH and nothing after it
last="$(git tag --list 'v*' | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -n 1 || true)"
if [[ "$want" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  next="$want"
elif [ -z "$last" ]; then
  echo "There is no release yet: name the first version, as in deploy/release.sh v1.0.0"; exit 1
else
  IFS=. read -r major minor patch <<< "${last#v}"
  case "$want" in
    major) next="v$((major + 1)).0.0" ;;
    minor) next="v$major.$((minor + 1)).0" ;;
    patch) next="v$major.$minor.$((patch + 1))" ;;
    *) echo "Unknown: $want. Give patch, minor, major or a version such as v1.0.0."; exit 1 ;;
  esac
fi
if git rev-parse --quiet --verify "refs/tags/$next" > /dev/null; then echo "$next exists already."; exit 1; fi
# the Pi deploys the highest version, so a lower one would never go live
if [ -n "$last" ] && [ "$(printf '%s\n' "$last" "$next" | sort -V | tail -n 1)" != "$next" ]; then
  echo "$next is not higher than $last."; exit 1
fi

if [ -n "$last" ]; then
  [ "$(git rev-list --count "$last..HEAD")" -gt 0 ] || { echo "Nothing new since $last."; exit 1; }
  changes="$(git log --reverse --no-merges --format='- %s' "$last..HEAD")"
  notes="$changes"$'\n\n'"All changes: $(gh repo view --json url --jq .url)/compare/$last...$next"
else
  changes="(the first release)"
  notes="The first release."
fi

echo "$next${last:+, after $last}:"
echo "$changes"
read -r -p "Release $next? [y/N] " answer
[ "$answer" = y ] || { echo "Nothing was tagged."; exit 1; }

git tag --annotate "$next" --message "$next"
git push --quiet origin "refs/tags/$next"
gh release create "$next" --verify-tag --title "$next" --notes "$notes"
echo "Released $next. The Pi deploys it within a few minutes."

#!/bin/sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
test_home=${DSH_HOME:-"$repo_root/.dsh-test-home"}
export DSH_HOME="$test_home"
export DSH_WORKSPACE_ROOT="$repo_root/fairy-voice"
export DSH_FAIRY_REPO_ROOT="$repo_root"
export DSH_FAIRY_TEST_HOME="$test_home"
export DSH_FAIRY_PROFILE_ROOT="$repo_root/profiles/web"
export DSH_ACCEPTED_BASELINE_ROOT="$test_home/accepted-baselines"

expected_dsh_version="0.2.1-alpha.5"
if ! command -v dsh >/dev/null 2>&1; then
  echo "dsh CLI is required for the isolated smoke test." >&2
  exit 1
fi
installed_dsh_version=$(dsh --version 2>/dev/null | head -n 1 || true)
if [ "$installed_dsh_version" != "$expected_dsh_version" ] && [ "${DSH_ALLOW_UNSUPPORTED:-0}" != "1" ]; then
  echo "DSH $expected_dsh_version is required; found ${installed_dsh_version:-none}." >&2
  echo "This suite depends on the 0.2 Remote settings API and client module loader." >&2
  echo "Install the pinned CLI, or set DSH_ALLOW_UNSUPPORTED=1 to continue anyway." >&2
  exit 1
fi

mkdir -p "$DSH_HOME"
mkdir -p "$DSH_HOME/.agent-presets" "$DSH_HOME/accepted-baselines"
preset_target="$DSH_HOME/.agent-presets/fairy"
if [ -e "$preset_target" ]; then
  mv "$preset_target" "$preset_target.previous.$$"
fi
cp -R "$repo_root/.agent-presets/fairy" "$preset_target"

# Keep the profile in the candidate repository while presenting it at the
# location expected by the DSH CLI. The symlink makes package link: entries
# resolve back to this repository, never to the production checkout.
mkdir -p "$DSH_HOME/profiles"
if [ -e "$DSH_HOME/profiles/web" ] && [ ! -L "$DSH_HOME/profiles/web" ]; then
  mv "$DSH_HOME/profiles/web" "$DSH_HOME/profiles/web.previous.$$"
fi
if [ ! -L "$DSH_HOME/profiles/web" ]; then
  ln -s "$repo_root/profiles/web" "$DSH_HOME/profiles/web"
fi

packages="fairy-visual/dsh-fairy-visual fairy-voice/dsh-fairy-voice fairy-startup/dsh-fairy-startup browser-dock/dsh-browser-dock balance-meter/dsh-balance-meter"

echo "[1/4] package dependencies"
for package in $packages; do
  (cd "$repo_root/$package" && pnpm install --frozen-lockfile --ignore-scripts --reporter=append-only)
done

echo "[2/4] package tests"
for package in $packages; do
  (cd "$repo_root/$package" && npm test)
done

echo "[3/4] profile dependency check"
if command -v pnpm >/dev/null 2>&1; then
  (cd "$repo_root/profiles/web" && pnpm install --frozen-lockfile --ignore-scripts --reporter=append-only)
else
  echo "pnpm is required for profile installation" >&2
  exit 1
fi

echo "[4/4] isolated profile smoke test"
if command -v dsh >/dev/null 2>&1; then
  if command -v gtimeout >/dev/null 2>&1; then
    gtimeout 8 dsh --profile web --no-open --port 0 || test $? -eq 124
  else
    smoke_log="$DSH_HOME/dsh-smoke.log"
    dsh --profile web --no-open --port 0 >"$smoke_log" 2>&1 &
    smoke_pid=$!
    trap 'kill "$smoke_pid" 2>/dev/null || true' EXIT INT TERM
    sleep 6
    if ! kill -0 "$smoke_pid" 2>/dev/null; then
      echo "DSH exited during isolated smoke test" >&2
      sed -n '1,160p' "$smoke_log" >&2
      exit 1
    fi
    grep -Eq '^dsh web: http://127\.0\.0\.1:[0-9]+' "$smoke_log"
    kill "$smoke_pid" 2>/dev/null || true
    wait "$smoke_pid" 2>/dev/null || true
    trap - EXIT INT TERM
  fi
else
  echo "dsh CLI is required for the live smoke test" >&2
  exit 1
fi

# DSH 0.2.1 port notes

This branch retargets the plugin suite from DSH `0.1.1-rc.2` to
`0.2.1-alpha.5`. It is intended as an upstream proposal; the author decides
whether to merge it.

## Runtime changes

- **Settings.** `settingsNamespace` / `ctx.settingsScope` are gone. The visual
  plugin now exports a `Config` schema whose user fields are `.volatile()`, and
  the client reads/writes it through `ctx.remote.settings`. Writes persist into
  the active profile's `cordis.patch.yml`.
- **Session selection.** `sessions.list.current` and `sessions.clear()` are
  gone. Visual derives the current session from `retainedBy.mainView`;
  `dsh-fairy-startup` clears the restored selection through
  `uiWorkspace.clearMain()` and opens a fresh blank through
  `uiWorkspace.startSession()` when the restored session is not blank.
- **DOM.** The separate `[data-slot="conversation"]` surface is replaced by the
  current `[data-phase]` root. The composer input is a Lexical
  `[data-composer-input="true"]` element with
  `[data-composer-placeholder="true"]`, not a `<textarea>`.
- **MCP environment.** DSH scrubs `DSH_*` variables from MCP children. The
  profile passes `DSH_HOME` and the profile root explicitly, and Browser Dock
  resolves the Playwright package entry instead of a POSIX `.bin` shim.

## Deliberately omitted

`dsh-message-edit@0.2.3` and `dsh-reasoning-effort@0.6.2` import the 0.1
client-runtime module table and fail during 0.2.x boot. They are removed from
the default profile rather than force-loaded. Re-add them as optional overlays
after upstream publishes 0.2-compatible builds.

## Verification

```sh
DSH_HOME="$PWD/.dsh-test-home" ./scripts/test-isolated.sh
```

Windows:

```powershell
pwsh -File .\scripts\test-isolated.ps1
```

The package suites pass on Windows: visual 130, voice 55, startup 4,
browser-dock 12, balance-meter 9. A live 0.2.1 profile boots every plugin,
renders the HDD stage, persists settings, and exposes the custom Settings
section.

## Not re-baselined

`fairy-system` still describes the author's 0.1.1 live-workspace baseline
(private runtime hash, accepted baselines, and deployment-specific launchers).
Those checks need a fresh 0.2.1 acceptance run before they can be treated as
evidence for this branch.

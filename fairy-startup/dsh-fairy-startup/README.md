# DSH Fairy Startup

This client-only plugin owns one policy: each new browser document starts on
the official blank-session screen instead of restoring the previously selected
conversation. It clears the restored selection through
`uiWorkspace.clearMain()`, waits for the Workspace and Session projections to
be ready, keeps an already blank session, and otherwise opens a fresh blank
through `uiWorkspace.startSession()`.

It does not render UI, alter visual settings, inspect language presets, or
control voice playback. Its only document marker prevents duplicate execution
within one page. Cordis disposal unsubscribes a pending workspace wait.

```sh
node --check lib/client.js
node --test test/*.test.js
```

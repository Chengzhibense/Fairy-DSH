# DSH Fairy Visual

`dsh-fairy-visual` is the upgrade-safe replacement path for the legacy HDD
compiled-runtime patch. It owns visual presentation only: the HDD switch,
Fairy stage, activity expression, low-power presentation, and its own settings
page. It does not read or change agent presets, language prompt state, TTS
playback, or session selection.

## 0.2.x settings contract

This port targets DSH `0.2.1-alpha.5`. Preferences live in the `fairy-visual`
profile entry's `Config`; every user-facing field is `.volatile()`, so the
official Settings page and `remote.settings` can read and mutate it. The client
uses `ctx.remote.settings.describe()` / `mutate()` through
`src/client/settings-bridge.js`; `ctx.settingsScope` and
`settingsNamespace` no longer exist in this runtime. Writes are persisted into
the active profile's `cordis.patch.yml`, not `~/.dsh/settings.yaml`.

The session identity comes from the session list's `retainedBy.mainView`
retention (0.2.x no longer exposes `list.current`). Visual does not select,
create, or clear sessions; `dsh-fairy-startup` owns that policy through
`uiWorkspace`.

## Registration

The web profile links this package through `profiles/web/package.json` and
registers it from `profiles/web/cordis.patch.yml` with `clientModules`.
It uses the documented client contracts:

- `ctx.sessions` for the selected session's read-only snapshot.
- `conversation.session.header.utilities` for the active-session HDD toggle and
  session metrics. On the Hero surface, a fallback toggle is rendered from the
  `shell.overlay` contribution because no session header exists.
- `shell.overlay` for the persistent big-eye stage. This root-level slot
  survives sidebar column transitions, so the mascot is never owned by the
  sidebar lifecycle.
- One plugin-owned, pointer-transparent `.dsh-hdd-background-host` is inserted
  before `body > #root` only while HDD is enabled. It is a plain paint owner,
  not a React root or a second stage; `#root` stays above it at z-index 1.
- `settings.section` and `ctx.settingsScope` for the settings UI and durable
  preference transport.

## State

In 0.2.x the shape below is the `fairy-visual` profile entry's `Config`, not a
separate host settings namespace:

```json
{
  "version": 2,
  "enabled": true,
  "theme": "dark",
  "mascotVisible": true,
  "powerMode": "normal"
}
```

`enabled` defaults to `true`, so a fresh profile starts in HDD mode. Existing
stored preferences still win. Fresh-document session selection belongs to the separate
`dsh-fairy-startup` plugin; this package never starts, clears, or opens a
session.

The visual controller projects one activity value from the active session:
`normal`, `thinking`, or `comforting`. Its current session lifecycle projection
is `idle`, `running`, or `completed`. Subscriptions, document attributes,
content-mask styles, visual timers, observers, listeners, and mounted slot
contributions are removed when the Cordis plugin fiber disposes.

## Compatibility Boundary

The plugin uses official slots and semantic `data-*`/ARIA anchors. Its HDD
overlay scrollbar binds the workspace `[role="tree"][aria-label="会话"]`, the
main `[data-conversation-scroll]`, and the input `[data-input-scroll]`; native
new-session and
selected rows use `aria-label`/`aria-selected`. No generated DSH class and no
CSS `:has(...)` selector remains in the custom visual source except for the
documented `.toBottomSlot` wrapper dependency below.

The to-bottom control itself is resolved by its localized ARIA label, but its
official wrapper is still identified with `.toBottomSlot` before the Fairy
position marker is applied. That official class-name dependency is a known DSH
upgrade risk and must be revalidated during runtime compatibility review.

Where CSS needs a parent/relationship state that the public DOM does not expose
directly, one plugin-owned `MutationObserver` projects short-lived
`data-dsh-fairy-*` markers from public slots and ARIA state. It marks the Hero
native copy, version navigator, header layout clusters, composer controls row,
the full-page background surface, the actual sidebar surface/layer, native
new-session button, and current workspace folder. The full frame and sidebar
column never share the
same marker. The observer is RAF
coalesced, watches only sidebar/header/Hero structures, ignores chat streaming,
and removes every owned marker on plugin disposal. Missing semantic anchors
fail closed while core controls remain usable.

The expanded top-left Fairy brand and native new-session button have a strict
ownership invariant: exactly one expanded top brand owns
`data-dsh-fairy-brand-anchor`, while every other new-session button may own
`data-dsh-fairy-native-new-session`. Brand ownership is projected by the
plugin-level marker controller even while HDD is off; it is not tied to the
React `BrandHost` lifecycle. Mode-transition clones remove any stale native
marker from brand anchors, and a specific transparent background/border rule
is the final guard. This prevents rapid HDD toggles from painting the light
native-button rectangle beneath the Fairy mark.

Sidebar collapse/reopen controls are explicit semantic-marker watch targets.
Brand ownership depends only on expanded/collapsed semantics and DOM order,
never on a one-shot width/height measurement. `BrandHost` alone owns the
`>=160px` display threshold and has a `ResizeObserver`, so reopening the sidebar
cannot deadlock in a missing-marker/missing-observer state.

HDD sidebar base colors are intentionally neutral and slightly moderated from
the earlier extremes: dark uses `#3b4148` and light uses `#d9dde1`. Related
hover/active surfaces use `#454c55`/`#515a64` and
`#d0d5da`/`#c6ccd2`. These rules are gated by
`html[data-dsh-fairy-visual]`; normal mode is untouched.

The HDD-owned sidebar layer also suppresses the official layout
`border-right`; this removes the one-pixel divider between the sidebar and the
main page only while HDD is active. Normal mode retains the official divider.

## Static polymer sidebar and real background cutout

The HDD sidebar is a matte, rough polymer plate rather than metal. Its material
owner is the plugin-owned sidebar layer `::before`; official sidebar surfaces
are transparent so they cannot paint a second plate. The material is entirely
static CSS: two tiny speckle fields, one restrained broad roughness field, and a
neutral vertical base gradient. It uses no image asset, filter, backdrop filter,
canvas, animation, timer, or perpetual RAF loop.

A 10 px flat molded ridge is the only right-edge geometry. Sidebar content width
is reduced by the same 10 px in both expanded and collapsed states, keeping the
content centered in the usable plate instead of under the ridge. The official
one-pixel divider remains removed only in HDD mode; normal mode is untouched.

The conversation-history viewport is a real hole in the polymer plate. A
`ResizeObserver` measures the semantic history surface and writes one even-odd
`--dsh-sidebar-board-clip` path to the plate owner. The history surface itself
is transparent and adds only static inset shadows, so the same real HDD grid and
glows used by the main page remain visible through the opening. When the sidebar
collapses, the history surface disappears and the board clip becomes the outer
plate only.

The HDD grid and glows are owned by exactly one
`.dsh-hdd-background-host` below `body > #root`. In HDD mode only, the full
layout frame, sidebar structural surfaces, and the direct conversation
`[data-phase]` surface are transparent so they cannot cover that host. The
sidebar plate `::before`, composer, cards, menus, and module surfaces keep their
own backgrounds. The official composer remains inside `#root`, so it naturally
paints above the background. Do not move this background back into
`shell.overlay`, cut a composer-shaped path from it, create a persistent
composer clone, or compensate with an extreme z-index: each recreates the false
second-input outline or crosses the official stacking context incorrectly.

The global layer ladder is fixed: background host `0`, application root `1`;
inside the official shell overlay, Hero copy `9`, Fairy stage `10`, and
interactive fixed controls `20`. Inside the sidebar layer, board `0`, native
content `1`, history inset shadow `3`, floating scrollbars `4`, and molded ridge
`5`. The Fairy SVG root uses only local z-index `1` inside its stage.

Every HDD scrollbar is a plugin-owned fixed overlay over its official scroll
surface. Native scrollbar painting is hidden only under
`html[data-dsh-fairy-visual]`; the overlay thumb is 6 px wide, translucent,
does not reserve layout space, and stays about 3 px inside the measured content
edge so it is easy to grab without touching the panel boundary. It supports
wheel scrolling, pointer dragging, and keyboard paging. Normal mode keeps the
official scrollbar implementation.

The Hero copy remains in `shell.overlay` for lifecycle continuity, so its local
z-index alone cannot place it behind the sidebar. `HeroHost` centers the copy on
the live Hero surface and owns a computed `clip-path`: its bottom edge follows
the composer card, while its left edge follows the sidebar paint layer. The
right edge deliberately extends beyond the intrinsic text width so the enlarged
text shadows remain intact. Resize and targeted sidebar-layout mutations are
coalesced into one frame before this geometry is recomputed.

Mode switching may retain the original three inert full-frame glitch slices.
Those clones live only inside `.dsh-hdd-mode-transition`, are clipped and
pointer-transparent, and are deleted after the animation. Because the real HDD
FX now lives below `#root`, the transition also takes an FX-only background
snapshot; it contains no composer and fades with the old frame. Theme fallback
uses the same FX-only snapshot. Live `body > #root` still owns exactly one
composer throughout.

The native new-session and balance cards use paired light/dark outset shadows
plus a small inset highlight. The selected conversation row is a flat,
theme-scoped solid token with no gradient, texture, border, or shadow.

In the expanded HDD sidebar, the balance card keeps the same total 16 px vertical
margin footprint but uses `margin-top: 10px` and `margin-bottom: 6px` instead of
the native 8/8 split. This moves the balance card and its geometry-anchored
low-power control down by exactly 2 px without moving the Settings row. The
collapsed sidebar marker excludes this rule, and normal mode keeps the native
margins.


## Persistent HDD bottom composer dock

HDD uses the same official InputBar and textarea in both Hero and Active. The
single InputBar root is fixed to the measured conversation rect rather than
recreated, so sidebar collapse and details-column changes update the same dock.
Hero's custom Hollow/Fairy title remains in the upper stage while its workspace
and Agent-preset row is visually anchored to the dock's left wing.

The card is a three-column grid:

- left wing: the workspace/agent row at the upper edge, with command at the
  lower-left and access mode at the lower-right;
- center display: the native `[data-input-scroll]`, backdrop, mirror, textarea,
  attachments, and notices;
- right wing: model, context meter, Fairy Voice, and send/stop.
- HDD model control: the official model/reasoning control is projected into the
  left wing between workspace and Full access. The official control remains
  authoritative for both model and reasoning selection.

Fairy Voice keeps its official `conversation.input.left` registration and owns
all voice state. Visual marks the real semantic `role="group"` control and only
positions it in the HDD right wing; normal mode keeps the official left-slot
layout. The shipped session StatsLine remains mounted in
`conversation.composer.dock` but the public dock is hidden in HDD, preserving
`sessionStats` and `tokenUsage` for later relocation.

`composerDockHeight` is a backward-compatible Visual setting (schema version
remains 2). The default is the 132 px desktop minimum, with a 132–420 px desktop range. Conversation
widths below 600 px use a dynamic 260 px minimum and a two-row layout so the
central display remains usable. The official `conversation.input.dock` owns an
accessible horizontal separator: pointer capture adjusts one CSS variable,
Arrow keys step by 8 px (Shift by 24), Home/End choose bounds, and Enter or a
double-click restores the 132 px desktop minimum. Orphaned pointer capture, window blur, pagehide,
and plugin disposal all clear drag state.

The Active composer seat explicitly reserves the dock height so messages are
not covered. HeroHost now owns only the Hollow title and Hero placeholder; it
never marks, translates, or measures the native composer stack. The same
semantic InputBar root is the sole HDD bottom-dock owner in Hero and Active.
Hero keeps the official workspace/agent row and its real click behavior. When
the official Active composer does not provide that row, Visual creates one
small, explicitly marked read-only projection from the captured official row;
its buttons are disabled and carry no event handlers. It is not a second
composer or input surface. Normal mode restores the official centered Hero
card, compact Active card, StatsLine, and Voice placement.

The expanded Fairy brand is an enhancement of the semantic `新建会话` button,
not an independent sidebar item. It is shown only while the native
`打开侧边栏` control is absent and that anchor is wide enough for the complete
brand. When the sidebar collapses, the brand host hides, its replacement marker
is removed, and the native new-session SVG is restored. Brand and hero-toggle
visibility are React-owned state; geometry observers only update that state and
never mutate the hosts' `hidden` properties directly.

The visual stage uses the original Fairy SVG, animation state machine, halo,
and glitches. It is mounted only in the persistent shell overlay, never
in `document.body`; the separate plain background paint host described above
contains no mascot or React tree. Stage geometry binds to the semantic
conversation surface. Content-fade scroll events are read from
`[data-conversation-scroll]`, but the radial mask is owned only by its descendant
`[data-chat-flow]`, which never contains the composer; a fail-closed guard clears
the fade if that invariant changes. The active/hero composer seat is projected
as `data-dsh-fairy-composer-seat`, and HDD removes only its native opaque bottom
gradient so the real global FX remains visible around a growing composer.
Disabling the plugin hides and pauses the mascot, removes
the HDD background and content mask, and disconnects its observers/listeners.
Hiding the Fairy, hiding the document, or entering `pagehide` freezes every
mascot CSS animation, cancels the randomized glitch scheduler and any pending
resume frame, and invalidates queued callbacks. `visibilitychange`/`pageshow`
resumes only when both the persisted setting and document visibility allow it.

The compiled-runtime patch has been removed after browser cutover validation.
The previously referenced pre-cutover and audit archives are not part of this
repository and must not be treated as rollback evidence. No verified Visual
source/configuration rollback archive is currently available. If recovery is
requested, stop and obtain a user-selected, independently verified source;
never reconstruct or restore from historical documentation automatically. Do
not run the legacy patch install script during normal operation, and do not treat
`fairy-hdd/verify-live-runtime.js` as a current-health check: it verifies the
retired patch fingerprint.

## Verification

```sh
node --test fairy-visual/dsh-fairy-visual/test/contract.test.js
node --check fairy-visual/dsh-fairy-visual/lib/index.js
node --check fairy-visual/dsh-fairy-visual/lib/client.js
dsh plugin --profile web list
```

An upgrade smoke test must additionally boot a disposable `dsh --profile web
--port <free-port>` instance and verify the loaded DOM contracts: exactly one
`.dsh-fairy-stage`, exactly one `#dsh-fairy-root`, no `body >
#dsh-fairy-root`, one Fairy Visual toggle, no console warnings/errors, and no
horizontal overflow. Fold and reopen the sidebar and confirm the stage remains
mounted, visible, and centered on the semantic chat surface. Also confirm the
expanded Fairy brand hides in the collapsed rail, its native new-session icon
returns, and both reverse when the sidebar reopens. This DSH build exposes `window.__DSH_BOOT__` as bootstrap metadata, but it does
not prove that a client module mounted or remained healthy. Semantic DOM/plugin
registration therefore remains the authoritative browser-level acceptance
signal. In HDD mode also
verify exactly one `.dsh-hdd-background-host`, one `.dsh-hdd-fx`, one native
`[data-composer-card="true"]`, and one `textarea`; the background host must
precede `#root` at z-index 0 while `#root` is z-index 1. Normal mode must have no
background host and must restore the official root stacking styles. The
full-page frame must own only `data-dsh-fairy-background-surface`; the actual
sidebar column alone owns `data-dsh-fairy-sidebar-surface` and
`data-dsh-fairy-sidebar-layer`. During mode transition, count live composer
nodes under `body > #root` separately from inert transition-frame clones; after
settling, all transition frames and `data-dsh-transition-background` nodes must
be zero.

## Errors, rollback, and maintenance

The plugin fails closed: missing optional semantic DOM anchors disable only the
related layout enhancement. Settings schema version mismatches are rejected by
the host registration. The client does not issue network requests and does not
silently select or create sessions.

On disable or disposal, it disconnects ResizeObservers and MutationObservers,
removes scroll/resize/media-query listeners, cancels pending animation frames
and timers, clears the content mask and semantic markers, removes its styles,
and removes all owned root attributes. Session snapshot projections notify React only when visual
state actually changes. There are no intervals, audio objects, network
requests, browser-storage keys, or cross-plugin mutable globals in the visual
client.

No verified rollback archive or recovery manifest is present on the current
disk. Do not attempt an automatic rollback; recovery requires an explicit user
choice of source plus independent manifest and SHA-256 verification. The
retired runtime patch is not an install path; its scripts refuse execution
unless the explicit rollback environment guard is set. After a DSH upgrade,
run the full system check and a disposable-port browser smoke before restarting
the normal profile.

## 2026-08-21 observer and cleanup audit

DOM observation remains event-driven but is now scoped to each paint owner's
real surface. The overlay scrollbar ignores main-conversation mutations,
coalesces sidebar rebinds through one RAF, and detaches its DOM/listeners while
HDD is disabled. Short-chat docking relies on `ResizeObserver` for streamed
text growth and uses a filtered, RAF-coalesced structure observer only for
surface replacement. The sidebar cutout and Hero toggle likewise ignore
unrelated message mutations.

The audit also removed two stale `HeroToggleHost` cleanup references
(`motionFrame` and `composerPositionObserver`). Those names no longer had
owners and could throw during Hero/Active teardown before the real observers
and resize listener were released. Contract tests reject their reintroduction.
No Fairy artwork, animation, glow, layout, composer ownership, or normal-mode
behavior changed.

## 2026-08-21 composer session-switch race hardening

During an official history-session switch, React can commit one frame where the
old conversation phase is gone and the new `[data-composer-card="true"]` has not
mounted yet. The marker projection now preserves only the previous composer
markers during that empty commit and replaces them as soon as the new native
card exists. This keeps the HDD fixed dock owner continuous without cloning,
reparenting, or proxying the textarea. All non-composer semantic markers still
clear normally, and ordinary mode remains outside the HDD CSS gate.

## 2026-08-21 card-owner fallback for the remaining switch gap

The first marker-preservation fix prevented stale ownership from being cleared,
but live sampling found a second commit ordering: the new native composer card
could exist before its new root/seat markers were projected. During that frame
the card was still in its official y-position and the textarea was visually
lost. HDD now gives the real native card itself the same bottom fixed geometry
as a temporary owner-independent fallback. The rule is gated by
`data-dsh-fairy-visual` and the Hero/Active phase; marker projection still owns
the complete three-column wrapper and is replaced normally once React settles.
Normal mode remains official and static.


## 2026-08-21 flush bottom equipment bay

The HDD composer is no longer presented as a floating rounded outer card. Its
root is flush with the conversation left/right/bottom edges, the native outer
card has no margin, outer radius, four-sided border, or shadow, and one top
border spans the full conversation width. The resizer occupies the same top
boundary rather than creating a second floating frame. Internal display and
control ownership are unchanged; normal mode is unaffected.

## Pending question cards

When DSH replaces the composer bar with an `ask_user_question` card, HDD sizes
the fixed composer seat to the card's natural height instead of the persisted
input-bar height. The complete card and its footer stay inside the viewport,
long option lists retain their own scroll body, and the normal pointer events
and keyboard controls remain usable. The input-bar resize handle is hidden
while this card owns the seat and returns with the native composer.

After the user answers a question, DSH can briefly drop its own follow-tail
state while the card is removed and the dock shrinks back to the configured
height. Visual bridges that transition until the answer settles so the newest
streamed text remains at the scroll floor. Explicit wheel-up, touch, Page Up,
Home, and Arrow Up input cancels the bridge, preserving the reader's chosen
position.

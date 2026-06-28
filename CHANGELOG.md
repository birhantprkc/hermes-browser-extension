# Changelog

## v0.1.6 — 2026-06-28

- Added built-in quick commands such as `/summarize`, `/explain`, `/rewrite`, `/tabs`, and `/action-items`, with slash dispatch and command suggestions in the side panel.
- Added a composer-header tab-context control so Hermes can follow the active tab or pin to a specific tab without adding extra lower composer chrome.
- Isolated pinned-tab conversations with per-tab local message caches and per-tab Hermes session bindings.
- Added selected-tab filtering for the open-tabs context list inside the same upward context card, including all/none controls.
- Reworked unpacked-build update checks to compare the loaded build commit against GitHub main instead of mislabeling post-release commits as unpulled.
- Added privacy redaction for sensitive tab titles/URLs before prompt assembly, including restricted active tabs and open-tab summaries.
- Preserved contributor work from @iruzen-dono's quick-command and multi-tab context PRs, with follow-up hardening and tests.
- Deferred the broad optional-host-permissions migration to a later release so v0.1.6 does not change the permission surface while shipping context-control improvements.

## v0.1.5 — 2026-06-27

- Added a Hermes compatibility panel backed by `/v1/capabilities`, with legacy fallback when older gateways do not advertise feature support.
- Made first-run Connect avoid missing pairing routes: unsupported runtimes now go straight to Manual setup with Gateway URL/token guidance.
- Added capability-gated voice dictation: Hermes STT is used when advertised, otherwise the side panel and visible voice page use Browser speech fallback when available.
- Added token hygiene UI with masked token state, connection mode, last-tested timestamp, and one-click token clearing.
- Added a collapsible “What Hermes saw” receipt after each sent turn so users can inspect tab/context/attachment/redaction payloads.
- Gated image upload and profile APIs behind capabilities so missing routes become clear fallback warnings instead of broken UX.
- Added public permissions, data-flow, and privacy docs for shipped behavior.
- Clarified remote API setup so same-LAN `http://host:8642` works in Remote gateway mode when an API key is present, while dashboard WebSocket mode remains HTTPS-only.
- Documented how to reload/remove/reload unpacked when Chrome still shows an older extension version after update.

## v0.1.4 — 2026-06-26

- Added editable Hermes session titles, including first-message auto-naming for new Browser sessions.
- Reworked connection state so the side panel uses live gateway reachability instead of treating a saved API key as connected.
- Added commit-aware update checks for unpacked builds, including same-version "unpulled commits" guidance.
- Expanded agent discovery to trusted remote hosts while keeping bearer tokens off non-Hermes probe targets.
- Refined the default Nous palette toward the ink-blue/soft-white Desktop look.

## v0.1.1 — 2026-06-24

- Added drag/drop attachments directly into the composer, including PDFs and files.
- Added Stop and Queue Message controls while Hermes is responding.
- Added `/` and `@` skill command autocomplete backed by Hermes skills.
- Added Agent Profile settings section with graceful fallback for gateways without profile APIs.
- Replaced the large Refresh button with a compact refresh icon.
- Improved streaming completion handling so final answers replace partial deltas.

## v0.1.0-alpha — 2026-06-24

- First public alpha preparation for Hermes Browser Extension.
- Chrome/Edge MV3 side panel.
- Local Hermes Gateway/API connection.
- Active page context capture.
- Streaming response support with fallback.
- Read-only browser context model.
- Load-unpacked install path; not yet on the Chrome Web Store.

# Hermes Browser Extension v0.1.11 — Hermes Web Alpha

Hermes now has a full browser workspace.

v0.1.11 introduces **Hermes Web Alpha** alongside the side panel, with canonical Hermes sessions, rich conversation rendering, session-scoped runtime controls, generated media, accurate context telemetry, and the same tools, skills, attachments, and voice workflow you expect from Hermes.

Hermes Web Alpha currently runs over token-backed **Local or Remote API** connections. Hermes Cloud Preview and ticketed remote-dashboard transports remain Chat-only in the side panel; live full-view dashboard handoff is not shipped yet.

This is also the final broad hardening pass for the 0.1.x line: Local, Cloud Preview, and Remote connections are explicit; nine themes work across Light and Dark modes; Firefox gets a preview package; and credential-bearing URLs are omitted before browser context reaches Hermes.

## Highlights

### Hermes Web Alpha

- Full-page browser-native Hermes workspace.
- Canonical Hermes session rail and history.
- User messages on the right; Hermes responses on the left.
- Safe rich Markdown, code, tables, links, generated images, and artifacts.
- Model, provider, reasoning effort, tools, skills, attachments, voice, steering, and stop controls.
- Activity, context, compaction, payload, and diagnostics inspection.
- Fresh Hermes Web drafts from the extension's full-view button.

### Three connection modes

- **Local gateway** — the default, offline-capable connection to Hermes on the same machine.
- **Hermes Cloud Preview** — attaches a trusted, signed-in HTTPS Hermes Cloud agent tab with a one-use ticket and Chat-only browser context.
- **Remote gateway** — connects to a self-hosted API or trusted remote dashboard through an explicit URL/token.

Connection migration, validation, settings copy, compatibility diagnostics, and dispatch behavior now follow the selected mode instead of relying on ambiguous legacy settings.

### Nine complete themes

Every shipped theme supports Light and Dark modes across the side panel and Hermes Web:

- Nous
- Midnight
- Ember
- Mono
- Cyberpunk
- Slate
- Senter Space
- Aphrodite
- Solstice

Cyberpunk Light includes its own dark-to-light green Hermes Web mark, while Nous Light remains the first-launch Hermes Web default.

### Rich media and generated images

- Diffusion-style generated-image reveal.
- Full image lightbox.
- Zoom, reset, open, and explicit download controls.
- Better final-image completion and echoed-image cleanup.
- Improved artifact discovery and attachment rendering.

### Context you can trust

- Accurate context-window usage and compaction telemetry.
- Compact context chip with a detailed payload/telemetry popover.
- Runtime accounting is session-gated and prefers authoritative persisted data.
- Browser Context receipts show what Hermes saw.
- Restricted and credential-bearing tab URLs are omitted across active, selected, open-tab, pinned-scope, prompt, receipt, and payload-hash surfaces.

### Runtime and session integrity

- Backend-acknowledged session model lock.
- Model/provider/reasoning/skill choices stay scoped to the active browser session.
- Canonical model catalog survives partial gateway updates.
- Better side-panel ↔ Hermes Web session continuity.
- Browser session source metadata and context persistence are preserved.
- Duplicate browser-turn retries are prevented.

### Browser and side-panel updates

- Firefox preview build via `npm run build:firefox`.
- Opera sidebar support.
- Scoped element picker for explicit page-element context.
- Updated side-panel header, Hermes Agent mark, icon layout, composer, runtime footer, and settings.
- Refreshed public visual tour and compatibility documentation.

## Privacy and security hardening

v0.1.11 adds one canonical decoded credential-URL policy shared by the Browser Context Protocol and legacy context path. It blocks common API keys, tokens, client secrets, private keys, credentials, signatures, and signed-URL fields even when parameter names are encoded or nested.

The extension remains read-only. It does not request debugger, native-messaging, cookie, history, bookmark, or browser-control permissions. The `downloads` permission is used only when the user explicitly saves a generated image or artifact.

## Fixes

- Browser context now survives OpenAI-style content arrays in the optional companion plugin.
- Generated-image finalization no longer leaves incomplete/duplicated media states.
- Session model and context state stay aligned across gateway refreshes.
- Runtime options remain attached to the correct browser session.
- Duplicate browser-turn retries are suppressed.
- Element-picker icon styling matches the attachment menu.
- Star-history URLs correctly encode repository paths and sealed tokens.
- Remote auth and runtime failures produce clearer redacted diagnostics without misreporting gateway reachability.

## Contributors

Thank you to the contributors who improved this release:

- [@bradlishman](https://github.com/bradlishman) — contributed the scoped, read-only page element picker and safe browser-context integration incorporated from [#29](https://github.com/abundantbeing/hermes-browser-extension/pull/29).
- [@barteqpl](https://github.com/barteqpl) — contributed native Opera sidebar support and cross-browser panel-opening compatibility work incorporated from [#30](https://github.com/abundantbeing/hermes-browser-extension/pull/30).
- [@Doom-pixel-alt](https://github.com/Doom-pixel-alt) — reported security issues that informed restricted-URL, Windows command-resolution, and setup-secret hardening incorporated from [#33](https://github.com/abundantbeing/hermes-browser-extension/pull/33).
- [@iruzen-dono](https://github.com/iruzen-dono) — fixed companion-plugin browser-context extraction for OpenAI-style content arrays in [#36](https://github.com/abundantbeing/hermes-browser-extension/pull/36).
- [@HuntIntegrativeSolutions](https://github.com/HuntIntegrativeSolutions) — reported the credential-bearing URL privacy gap and contributed the initial fix direction/regression coverage in [#38](https://github.com/abundantbeing/hermes-browser-extension/issues/38) and [#39](https://github.com/abundantbeing/hermes-browser-extension/pull/39). The final v0.1.11 integration expands that policy across decoded/nested parameters, signed URLs, pinned scope, prompts, receipts, and payload hashes.

## Install / update

1. Download and extract the Chromium release archive.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select the extracted `dist/` folder.
5. If updating an existing unpacked copy, select the new folder and click **Reload** on the extension card.

Firefox users can load the preview package from `dist/firefox/` through `about:debugging` → **This Firefox** → **Load Temporary Add-on**.

## Compatibility

- Primary: Chrome / Edge / Chromium 114+.
- Best effort: Brave, Comet, and Chromium forks with the Side Panel API.
- Preview: Firefox package.
- Not shipped: Safari.
- Hermes connection: Local gateway, trusted Hermes Cloud Preview tab, or explicit Remote gateway.
- Hermes Web full view: token-backed Local/Remote API connections in this alpha; Cloud Preview and ticketed dashboard transports remain Chat-only in the side panel.

## Verification

- `npm test`: **385/385 passed**.
- JavaScript syntax checks: passed.
- Manifest validation: **Hermes Browser Extension 0.1.11**.
- ESLint: 0 errors; 11 existing warnings.
- `git diff --check`: passed.
- Chromium build and versioned release archive: passed.
- Firefox preview build and versioned release archive: passed.
- Exact archive manifests re-read as v0.1.11; no `.env`, `.git`, `node_modules`, internal plans, Hermes artifacts, or agent-context files found in either archive.
- Five README product screenshots were render-checked visually.
- SHA-256 checksums are included in `SHA256SUMS-v0.1.11.txt`.

## Links

- Repository: https://github.com/abundantbeing/hermes-browser-extension
- Changelog: https://github.com/abundantbeing/hermes-browser-extension/blob/main/CHANGELOG.md
- Security: https://github.com/abundantbeing/hermes-browser-extension/blob/main/SECURITY.md
- Privacy: https://github.com/abundantbeing/hermes-browser-extension/blob/main/PRIVACY.md

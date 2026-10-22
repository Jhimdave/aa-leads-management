# AI changelog

## 2026-10-23 — Document project setup and maintenance instructions

- Added `README.md` with local setup, Script Properties, deployment, and validation instructions.
- Added `AGENTS.md` with repository-specific safety and contribution guidance.
- Added `docs/PROJECT_CONTEXT.md` and `docs/ROADMAP.md` based on the current source and manifest.
- No application behavior or configuration was changed.
- Validation: documentation/source inspection only; syntax and integration checks were not run as no code was modified. The current environment has `clasp` 3.3.0.
- Remaining risks: webhook caller authentication and the complete upstream payload contract are not documented in code.

## 2026-10-23 — Route all notification DMs to Jim through the bot

- Updated `Helpers.js` so channel posts and channel-thread replies remain bot-authored, while regular-recipient and Melissa heads-up DMs use the user token.
- Added a separate bot-authored DM to Jim for both channel notification types and direct notification/reminder types; reminder and channel paths include the details reply.
- Removed Jim from the regular-recipient lists in `Code.js` to avoid duplicate sends and ensure his messages always use the bot token.
- Documented the sender routing in `README.md` and `docs/PROJECT_CONTEXT.md`.
- Validation: `node --check` passed for all JavaScript files; mocked Slack routing checks passed for channel posts, regular DMs, Jim's bot-authored DMs, details replies, and cancellation greetings. Live Slack/Sheets integrations were not invoked.

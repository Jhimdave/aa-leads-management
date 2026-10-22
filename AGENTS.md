# Repository instructions

- Treat the Apps Script source as the behavior contract; keep changes focused and preserve existing webhook payloads, Slack routing, and sheet-column mappings unless the task explicitly changes them.
- Do not replace or commit `.clasp.json`, credentials, or secret values. Slack tokens and the spreadsheet ID belong in Apps Script Script properties.
- Before changing behavior, inspect the relevant handler, template, and sheet-logging path. Update `docs/PROJECT_CONTEXT.md` and this project's setup documentation when architecture, configuration, or workflow changes.
- Use `node --check` on changed JavaScript files for syntax validation. There is no automated test runner; functions in `Test.js` call real Slack/Sheets services, so do not run them without approved test resources and authorization.
- Treat message-deletion and bulk-update helpers in `Loggers.js` as destructive operations; do not invoke them without explicit approval.
- Never deploy or push to the linked Apps Script project unless the user explicitly requests it.

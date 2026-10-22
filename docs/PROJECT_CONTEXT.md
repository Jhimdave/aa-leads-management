# Project context

## Purpose and stack

This repository contains a Google Apps Script V8 webhook that routes appointment and lead events to Slack and writes selected event data to Google Sheets. It uses the Apps Script services (`PropertiesService`, `UrlFetchApp`, `SpreadsheetApp`, and `ContentService`) and has no package manifest or automated test runner.

## Entry point and flow

`Code.js` exposes `doPost(e)`. It reads `notif` from the query string (default `1`), parses the JSON request body, records execution metadata in script properties, dispatches notification types `1`–`12` through `sendSlackMessage`, then returns a JSON response. Slack calls and message construction are in `Helpers.js` and `Templates.js`; supported channel notification types also write to Sheets through `SheetLogging.js`. `Loggers.js` contains diagnostics and Slack history maintenance functions.

## Configuration and integrations

- `appsscript.json`: V8 runtime, `Asia/Singapore` timezone, and web app configured to execute as the deploying user with anonymous access.
- Apps Script Script properties consumed by `Config.js`: `BOT_TOKEN`, `USER_TOKEN`, and `SPREADSHEET_ID`.
- Slack channel and user IDs and sheet IDs/header definitions are also in `Config.js`.
- Slack channel announcements and their thread replies use `BOT_TOKEN`; DMs to other configured recipients and Melissa's channel heads-up use `USER_TOKEN`. Jim (`U08Q4T74NCU`) receives a separate bot-token DM for every notification type.
- Appointment dates are formatted using the `America/Denver` timezone in `Helpers.js`.
- `.clasp.json` is local-only and ignored by Git; it links the working folder to an Apps Script project.

The webhook currently has no caller authentication in `doPost`. Review deployment access and add/confirm an appropriate caller control before exposing it to untrusted callers.

## Development and validation

Use `clasp push` only when an upload is explicitly authorized. Deploy the web app through the Apps Script editor. Use `node --check` to validate JavaScript syntax locally; Apps Script service behavior requires an Apps Script environment. `Test.js` contains manual checks, some of which send real Slack messages or change spreadsheet headers.

## Constraints and unknowns

- The upstream webhook provider and its complete payload contract are not documented in this repository.
- No automated test suite or isolated mock harness is configured.
- Slack tokens and spreadsheet values must remain in Apps Script Script properties, not source control.

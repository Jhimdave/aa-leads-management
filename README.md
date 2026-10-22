# Appointment Slack Reminder

Google Apps Script webhook that sends appointment and lead notifications to Slack and records supported lead types in Google Sheets.

## Setup

### Prerequisites

- A Google Apps Script project linked to this local directory with `clasp`.
- Node.js/npm if you need to install `clasp`. It is already available in the current development environment.
- Access to the Slack workspace and spreadsheet configured for this script.

Install and authenticate `clasp` if needed:

```powershell
npm install --global @google/clasp
clasp login
```

The local `.clasp.json` maps this folder to its Apps Script project and is ignored by Git. Preserve the existing file; do not commit its project ID.

### Configure script properties

In the Apps Script editor, open **Project Settings → Script properties** and set:

| Property | Purpose |
| --- | --- |
| `BOT_TOKEN` | Slack bot token used for channel posts and bot-authored DMs |
| `USER_TOKEN` | Slack user token used for DMs sent as other configured users |
| `SPREADSHEET_ID` | Google Sheets spreadsheet used for lead logging |

These values are read in `Config.js`; do not store tokens in source files or commit them.

### Push and deploy

1. Run `clasp push` to upload the local Apps Script files.
2. In the Apps Script editor, choose **Deploy → New deployment → Web app**.
3. The checked-in manifest runs as the deploying user and permits anonymous access. Review this access setting and the webhook's caller/authentication controls before production deployment.
4. Ensure the deploying account can access the configured spreadsheet and Slack credentials.

The web app accepts a JSON `POST`; the notification type is the `notif` query parameter and defaults to `1`. Types `1` through `12` are routed by `doPost` in `Code.js`. Keep payload shapes aligned with the notification handlers and logging functions.

### Slack sender routing

- Channel announcements and their channel-thread replies use `BOT_TOKEN`.
- Channel-notification heads-up DMs and their detail replies to Melissa use `USER_TOKEN`.
- DMs to configured recipients other than Jim use `USER_TOKEN`.
- Jim (`U08Q4T74NCU`) receives a separate DM for every notification type using `BOT_TOKEN`; reminder and channel-notification DMs include the appointment/lead details in a reply.

## Local checks

Check JavaScript syntax without calling Google or Slack services:

```powershell
Get-ChildItem -Filter *.js | ForEach-Object { node --check $_.FullName; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE } }
```

There is no automated unit-test runner configured. Functions in `Test.js` are manual integration helpers: `testNotif1` through `testNotif4` send real Slack messages, and `testEnsureHeaders` can modify spreadsheet headers. Run them only against approved test resources.

## Project layout

- `Code.js` — webhook entry point and notification routing.
- `Config.js` — Slack/Sheets settings, script-property lookups, and payload examples.
- `Helpers.js` — message composition, Slack API calls, and date formatting.
- `Templates.js` — notification message templates.
- `SheetLogging.js` — spreadsheet headers and lead/appointment row logging.
- `Loggers.js` — execution diagnostics and Slack message maintenance helpers.
- `Test.js` — manual integration/test functions.
- `appsscript.json` — Apps Script runtime, timezone, and web-app deployment defaults.

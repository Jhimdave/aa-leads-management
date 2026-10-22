# Roadmap

## Current state

- **Operational maintenance — ongoing.** The repository contains a V8 Apps Script webhook, Slack message routing for notification types `1`–`12`, and Sheets logging for supported channel events.
- **Local setup guidance — complete.** Repository setup, configuration, deployment cautions, and safe validation steps are documented.

## Next steps

1. Confirm and document the upstream webhook payload contract and expected notification-type mapping.
2. Review how callers are authenticated before deploying the anonymously accessible web app to production.
3. Add an isolated test harness if notification logic needs repeatable automated coverage.

No release milestones or target dates are defined in the repository.

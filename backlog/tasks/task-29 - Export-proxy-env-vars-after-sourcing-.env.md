---
id: TASK-29
title: Export proxy env vars after sourcing .env
status: Done
assignee:
  - '@claude'
created_date: '2026-04-21 08:10'
updated_date: '2026-04-21 08:16'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
After sourcing .env, proxy variables (NO_PROXY, no_proxy, HTTPS_PROXY, HTTP_PROXY) are not exported to subprocesses like curl. Add export for proxy-related vars so curl respects them.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 curl respects NO_PROXY set in .env without requiring export keyword in .env file
- [x] #2 Existing tests pass
- [x] #3 shellcheck passes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Merged NO_PROXY into lowercase no_proxy before export, since curl prefers lowercase. Fixed .env to use .alfaintra.net (leading dot) instead of *.alfaintra.net (wildcard doesn't match nested subdomains in curl).
<!-- SECTION:NOTES:END -->

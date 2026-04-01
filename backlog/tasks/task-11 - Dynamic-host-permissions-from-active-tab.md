---
id: TASK-11
title: Dynamic host permissions from active tab
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 19:19'
updated_date: '2026-04-01 20:29'
labels: []
dependencies:
  - TASK-10
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When user clicks Export, check if host_permissions exist for the Confluence host from the active tab URL. If not, request via chrome.permissions.request(). Permission is remembered by Chrome automatically.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Host extracted from active tab URL
- [x] #2 If permission missing — chrome.permissions.request() with origin from URL
- [x] #3 Browser shows standard prompt; on approval permission is remembered
- [x] #4 On repeat use with same host — no prompt shown
- [x] #5 Works with multiple Confluence instances without extra configuration
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Create src/permissions.ts with ensureHostPermission(url) that extracts origin, checks chrome.permissions.contains(), and requests via chrome.permissions.request() if missing. Integrate into popup.ts export click handler. Add tests for the permissions module.

Commit: `eb383a4` - task-11: Dynamic host permissions from active tab URL

Implemented: src/permissions.ts with getOriginFromUrl() and ensureHostPermission(). Integrated into popup.ts export click handler. Added permissions.test.ts (9 tests) and 2 new popup tests. All 30 tests pass.
<!-- SECTION:NOTES:END -->

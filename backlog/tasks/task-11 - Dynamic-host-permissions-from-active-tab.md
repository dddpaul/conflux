---
id: TASK-11
title: Dynamic host permissions from active tab
status: To Do
assignee: []
created_date: '2026-04-01 19:19'
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
- [ ] #1 Host extracted from active tab URL
- [ ] #2 If permission missing — chrome.permissions.request() with origin from URL
- [ ] #3 Browser shows standard prompt; on approval permission is remembered
- [ ] #4 On repeat use with same host — no prompt shown
- [ ] #5 Works with multiple Confluence instances without extra configuration
<!-- AC:END -->

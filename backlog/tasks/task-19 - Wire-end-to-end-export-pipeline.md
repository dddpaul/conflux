---
id: TASK-19
title: Wire end-to-end export pipeline
status: To Do
assignee: []
created_date: '2026-04-01 20:08'
labels: []
dependencies:
  - TASK-16
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Connect all extension modules into a working pipeline. Implement chrome.runtime messaging between popup and background service worker. Full flow: button click → parse URL → request permission → fetch API → convert → download/clipboard.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 chrome.runtime.sendMessage from popup to service worker on Export click
- [ ] #2 Service worker orchestrates: parse URL → check permission → fetch → convert → return result
- [ ] #3 chrome.runtime.onMessage in popup to receive result and update UI state
- [ ] #4 Error at any step propagates back to popup and shows in UI
- [ ] #5 Full flow works: click Export → file downloads
- [ ] #6 Full flow works: click Copy → markdown in clipboard
<!-- AC:END -->

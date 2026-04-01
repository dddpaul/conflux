---
id: TASK-19
title: Wire end-to-end export pipeline
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 20:08'
updated_date: '2026-04-01 21:05'
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
- [x] #1 chrome.runtime.sendMessage from popup to service worker on Export click
- [x] #2 Service worker orchestrates: parse URL → check permission → fetch → convert → return result
- [x] #3 chrome.runtime.onMessage in popup to receive result and update UI state
- [x] #4 Error at any step propagates back to popup and shows in UI
- [x] #5 Full flow works: click Export → file downloads
- [x] #6 Full flow works: click Copy → markdown in clipboard
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Move FetchPageMessage/FetchPageResponse types to types.ts (shared between popup and background). Wire popup.ts export button: sendMessage to background → loadSettings → convertHtmlToMarkdown → downloadMarkdown → render done. Wire copy button: same fetch → convert → copyToClipboard → showCopiedConfirmation. Wrap each pipeline in try/catch propagating errors to render(error). Update background.ts to import types from types.ts. Update popup.test.ts with full pipeline tests mocking chrome.runtime.sendMessage, chrome.downloads.download, navigator.clipboard.

Commit: `9be5ea1` - task-19: Wire end-to-end export pipeline

Implemented full end-to-end export pipeline. Moved FetchPageMessage/FetchPageResponse types to types.ts (shared). Wired popup.ts export button: sendMessage → loadSettings → convertHtmlToMarkdown → downloadMarkdown → render done. Wired copy button: same fetch → convert → copyToClipboard → showCopiedConfirmation. All errors propagate to popup UI. Updated popup.test.ts with 8 new pipeline tests (export success, copy success, fetch error, sendMessage error, download error, clipboard error, settings loading). 103 tests passing.
<!-- SECTION:NOTES:END -->

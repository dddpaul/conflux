---
id: TASK-10
title: Popup UI with export button and status states
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 19:19'
updated_date: '2026-04-01 20:26'
labels: []
dependencies:
  - TASK-9
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create popup.html and popup.ts with Export to Markdown button. Show status states: idle, loading (spinner), done (filename), error (message). Disable button on non-Confluence pages with explanation text.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Export to Markdown button in popup
- [x] #2 States: idle → loading (spinner) → done (filename) → error (message)
- [x] #3 On non-Confluence pages button is disabled with text Not a Confluence page
- [x] #4 Minimal clean design
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Redesign popup.html with proper styled states (idle/loading/done/error). Add CSS for spinner, status states, disabled button. Rewrite popup.ts to query active tab URL via chrome.tabs, use parseConfluenceUrl to detect Confluence pages, disable button with message on non-Confluence pages. Implement state machine with idle→loading→done/error transitions. Add tests for popup logic.

Commit: `d1ac6e0` - task-10: Popup UI with export button and status states

Commit: `2725e24` - task-10: Add done/error state tests and export render function

Implemented popup UI with full state machine (idle/loading/done/error/disabled). Confluence URL detection via parseConfluenceUrl. 6 tests covering all states. Files: popup.html, popup.ts, popup.test.ts. Added jsdom dev dependency for DOM testing.
<!-- SECTION:NOTES:END -->

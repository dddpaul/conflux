---
id: TASK-16
title: Copy markdown to clipboard
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 19:20'
updated_date: '2026-04-01 20:49'
labels: []
dependencies:
  - TASK-15
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add Copy to Clipboard button in popup. Copy converted markdown via navigator.clipboard.writeText(). Show visual confirmation.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Copy to Clipboard button next to Export to Markdown in popup
- [x] #2 Markdown copied via navigator.clipboard.writeText()
- [x] #3 Visual confirmation Copied! shown for 2 seconds
- [x] #4 Works independently from file download
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Add #copy-btn button in popup.html next to #export-btn. In popup.ts, add copyBtn element reference, a new PopupState kind "copied", and a click handler that sends message to background to get markdown, then copies via navigator.clipboard.writeText(). Show "Copied!" for 2s then revert to idle. The copy button works independently from export. Add CSS for copy button and copied state.

Commit: `fea7e80` - task-16: Copy to Clipboard button with confirmation

Implemented Copy to Clipboard button in popup alongside Export button. Created src/clipboard.ts with copyToClipboard() using navigator.clipboard.writeText(). Added 'copied' PopupState with showCopiedConfirmation() that shows 'Copied!' for 2s then reverts to idle. Both buttons work independently. 14 tests (2 clipboard, 12 popup).
<!-- SECTION:NOTES:END -->

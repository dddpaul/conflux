---
id: TASK-36
title: Fix table conversion for cells with block-level elements in conflux.sh
status: Done
assignee:
  - '@claude'
created_date: '2026-04-24 15:26'
updated_date: '2026-04-24 15:36'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
html2markdown drops table formatting entirely when cells contain block-level elements (br, p, div). Section 5.1 of the test page (chats.html) has a table with br and p inside td cells — output loses all pipe/separator formatting. Fix: add --opt-table-newline-behavior=preserve flag to the html2markdown call in conflux.sh.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 html2markdown call includes --opt-table-newline-behavior=preserve
- [x] #2 Table with br inside td cells converts to valid markdown table
- [x] #3 Table with p inside td cells converts to valid markdown table
- [x] #4 shellcheck passes
- [x] #5 Tests pass
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Add --opt-table-newline-behavior=preserve flag to the html2markdown call on line 129 of conflux.sh. Update the existing flag-checking test (mock_html2markdown_check_flags) to also verify the new flag. Run shellcheck and tests to verify.

Commit: `0465898` - task-36: Pass --opt-table-newline-behavior=preserve to html2markdown

Implemented: Added --opt-table-newline-behavior=preserve to html2markdown call. Updated flag-checking test to verify all three flags. Files changed: conflux.sh, test_conflux.sh. All 58 tests pass, shellcheck clean.
<!-- SECTION:NOTES:END -->

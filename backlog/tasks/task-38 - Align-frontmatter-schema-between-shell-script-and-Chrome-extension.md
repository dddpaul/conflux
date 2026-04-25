---
id: TASK-38
title: Align frontmatter schema between shell script and Chrome extension
status: Done
assignee:
  - '@claude'
created_date: '2026-04-25 09:50'
updated_date: '2026-04-25 17:40'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Both tools produce YAML frontmatter but with subtle differences: shell escapes only double-quotes while extension escapes backslashes too; shell leaves published empty when missing while extension defaults to created date; date truncation methods differ (head -c 10 vs slice). Unify the schema, escaping rules, and default handling so both produce identical frontmatter for the same page.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 YAML escaping rules are identical (both escape backslash and double-quote)
- [x] #2 Published date default behavior is identical when API field is missing
- [x] #3 Date formatting produces identical output for the same input
- [x] #4 A shared fixture test confirms both tools produce matching frontmatter for the same page data
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Fix shell script to align with extension behavior:
1. AC#1: Add backslash escaping to shell frontmatter (extension already escapes both \ and "). Fix: add backslash escape in bash parameter expansion before the quote escape.
2. AC#2: When published is empty in shell, default to today's date (created) — matching extension's fallback behavior.
3. AC#3: Date formatting already equivalent (head -c 10 vs slice(0,10)) — no change needed, just verify.
4. AC#4: Add a shared fixture test in converter.test.ts that verifies the extension produces frontmatter matching a reference output, and a corresponding test in test_conflux.sh that verifies the shell produces the same output for the same input data.

Commit: `0907fe1` - task-38: Align frontmatter escaping and defaults between shell and extension

Implemented: (1) Shell script now escapes backslashes in YAML string values, matching extension's escapeYamlString(). (2) Shell published field defaults to created date when API field missing, matching extension's || created fallback. (3) Added // empty to jq queries for author and published to handle null gracefully. (4) Added shared fixture tests in both test_conflux.sh and converter.test.ts verifying identical frontmatter output for same input data. Files: conflux.sh, test_conflux.sh, chrome-extension/tests/converter.test.ts
<!-- SECTION:NOTES:END -->

---
id: TASK-38
title: Align frontmatter schema between shell script and Chrome extension
status: To Do
assignee: []
created_date: '2026-04-25 09:50'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Both tools produce YAML frontmatter but with subtle differences: shell escapes only double-quotes while extension escapes backslashes too; shell leaves published empty when missing while extension defaults to created date; date truncation methods differ (head -c 10 vs slice). Unify the schema, escaping rules, and default handling so both produce identical frontmatter for the same page.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 YAML escaping rules are identical (both escape backslash and double-quote)
- [ ] #2 Published date default behavior is identical when API field is missing
- [ ] #3 Date formatting produces identical output for the same input
- [ ] #4 A shared fixture test confirms both tools produce matching frontmatter for the same page data
<!-- AC:END -->

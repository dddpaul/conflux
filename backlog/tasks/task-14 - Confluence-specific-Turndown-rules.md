---
id: TASK-14
title: Confluence-specific Turndown rules
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 19:20'
updated_date: '2026-04-01 20:40'
labels: []
dependencies:
  - TASK-13
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add custom Turndown rules for Confluence-specific HTML elements: info/warning/note panels, expand macro, TOC macro, status labels, user mentions.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Info/warning/note panels → blockquote with prefix (> **Info:** ...)
- [x] #2 Expand macro → details/summary HTML in markdown
- [x] #3 Table of contents macro — removed
- [x] #4 Status macro (colored labels) → **[STATUS]**
- [x] #5 User mention → plain text name
- [x] #6 Unit tests for custom rules pass
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Add custom Turndown rules to converter.ts for Confluence-specific HTML elements. Each rule targets specific CSS class patterns used by Confluence's storage/export format: (1) Panel macros (confluence-information-macro with type variants) → blockquotes with bold prefix; (2) Expand macro (expand-container/expand-control/expand-content) → HTML details/summary; (3) TOC macro (toc-macro class) → removed entirely; (4) Status labels (status-macro/aui-lozenge) → **[STATUS]** format; (5) User mentions (confluence-userlink) → plain text name. Add unit tests for each rule.

Commit: `8feea90` - task-14: Confluence-specific Turndown rules for panels, expand, TOC, status, and mentions

Implemented 5 custom Turndown rules in converter.ts: confluencePanel (info/warning/note/tip → blockquotes), confluenceExpand (→ details/summary), confluenceToc (removed), confluenceStatus (→ **[STATUS]**), confluenceUserMention (→ plain text). 10 new unit tests. Files: converter.ts, converter.test.ts.
<!-- SECTION:NOTES:END -->

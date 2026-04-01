---
id: TASK-14
title: Confluence-specific Turndown rules
status: To Do
assignee: []
created_date: '2026-04-01 19:20'
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
- [ ] #1 Info/warning/note panels → blockquote with prefix (> **Info:** ...)
- [ ] #2 Expand macro → details/summary HTML in markdown
- [ ] #3 Table of contents macro — removed
- [ ] #4 Status macro (colored labels) → **[STATUS]**
- [ ] #5 User mention → plain text name
- [ ] #6 Unit tests for custom rules pass
<!-- AC:END -->

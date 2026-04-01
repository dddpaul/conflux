---
id: TASK-9
title: Parse Confluence URL from active tab
status: To Do
assignee: []
created_date: '2026-04-01 19:19'
labels: []
dependencies:
  - TASK-8
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement url-parser.ts that extracts host and pageId from a Confluence URL. Support both Server/DC and Cloud URL formats. Export a function usable from popup and background.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Extracts host and pageId from URL
- [ ] #2 Supports /pages/viewpage.action?pageId=123 (Server/DC)
- [ ] #3 Supports /wiki/spaces/SPACE/pages/123/Title (Cloud)
- [ ] #4 Returns null for non-Confluence URLs
- [ ] #5 Unit tests pass
<!-- AC:END -->

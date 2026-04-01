---
id: TASK-15
title: Download markdown file via chrome.downloads
status: To Do
assignee: []
created_date: '2026-04-01 19:20'
labels: []
dependencies:
  - TASK-13
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
After conversion, download markdown as a file using chrome.downloads API. Sanitize filename from page title.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 File downloaded via chrome.downloads API
- [ ] #2 Filename: {pageId} - {sanitized_title}.md
- [ ] #3 Special characters removed from title (/ : ? * < > | \)
- [ ] #4 Download goes to default downloads directory
<!-- AC:END -->

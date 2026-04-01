---
id: TASK-15
title: Download markdown file via chrome.downloads
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 19:20'
updated_date: '2026-04-01 20:43'
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
- [x] #1 File downloaded via chrome.downloads API
- [x] #2 Filename: {pageId} - {sanitized_title}.md
- [x] #3 Special characters removed from title (/ : ? * < > | \)
- [x] #4 Download goes to default downloads directory
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Create src/downloader.ts with sanitizeTitle() and downloadMarkdown() functions. sanitizeTitle strips /:\?*<>|\ from title. downloadMarkdown creates a Blob URL from markdown content, triggers chrome.downloads.download with filename '{pageId} - {sanitized_title}.md', then revokes the blob URL. Add tests for sanitizeTitle and downloadMarkdown.

Commit: `5cf7ade` - task-15: Download markdown file via chrome.downloads API

Implemented sanitizeTitle(), buildFilename(), and downloadMarkdown() in src/downloader.ts. sanitizeTitle strips /:?*<>|\ chars. buildFilename formats as '{pageId} - {sanitized_title}.md'. downloadMarkdown uses Blob + chrome.downloads.download with saveAs:false. 14 tests added.
<!-- SECTION:NOTES:END -->

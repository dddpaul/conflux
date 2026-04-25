---
id: TASK-39
title: Download and embed page attachments and images in Chrome extension
status: To Do
assignee: []
created_date: '2026-04-25 17:01'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Chrome extension counterpart to task-37. Add image download/inline so exported markdown from the extension includes actual images instead of dead Confluence URLs. Extension can use browser fetch with existing cookies for authentication. Consider: base64-inline for small images, download alongside .md for larger ones. Design to be brainstormed separately.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Extension downloads or inlines images referenced in export_view HTML
- [ ] #2 Extension rewrites img src in markdown to local paths or base64 data URIs
- [ ] #3 Extension authenticates when fetching attachment URLs (browser cookies)
- [ ] #4 Non-image attachments are skipped gracefully
<!-- AC:END -->

---
id: TASK-12
title: Fetch page content via Confluence REST API
status: To Do
assignee: []
created_date: '2026-04-01 19:19'
labels: []
dependencies:
  - TASK-11
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
From background service worker, make GET request to Confluence REST API with browser cookies. Extract title and HTML body from JSON response. Report errors to popup.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 GET request to /rest/api/content/{pageId}?expand=body.export_view from service worker
- [ ] #2 Browser cookies attached automatically via host_permissions
- [ ] #3 title and body.export_view.value extracted from JSON response
- [ ] #4 On HTTP error (401, 403, 404, 5xx) — clear error message shown in popup
<!-- AC:END -->

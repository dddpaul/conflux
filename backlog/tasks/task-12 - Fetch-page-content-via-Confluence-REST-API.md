---
id: TASK-12
title: Fetch page content via Confluence REST API
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 19:19'
updated_date: '2026-04-01 20:33'
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
- [x] #1 GET request to /rest/api/content/{pageId}?expand=body.export_view from service worker
- [x] #2 Browser cookies attached automatically via host_permissions
- [x] #3 title and body.export_view.value extracted from JSON response
- [x] #4 On HTTP error (401, 403, 404, 5xx) — clear error message shown in popup
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Create confluence-api.ts module in src/ that exports fetchPageContent(pageInfo). It will build the REST API URL from baseUrl and pageId, call fetch() with credentials:'include' for cookie auth, parse JSON response to extract title and body.export_view.value, and throw typed errors for HTTP failures (401/403/404/5xx). Background.ts will get a message listener to handle export requests from popup. Tests will mock fetch() and verify success/error paths.

Commit: `82db5e3` - task-12: Fetch Confluence page content via REST API

Implemented confluence-api.ts with fetchPageContent() that calls REST API with credentials:include. background.ts now has message listener for fetchPage action. All HTTP error codes mapped to user-friendly messages. 9 tests covering success/error paths.
<!-- SECTION:NOTES:END -->

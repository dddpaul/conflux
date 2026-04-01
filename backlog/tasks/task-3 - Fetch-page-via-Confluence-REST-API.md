---
id: TASK-3
title: Fetch page via Confluence REST API
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 14:08'
updated_date: '2026-04-01 14:20'
labels: []
dependencies:
  - TASK-2
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Добавить curl-запрос к Confluence REST API для получения title и HTML body страницы. Использовать expand=body.export_view и Basic Auth с учётными данными из pass.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 GET-запрос к https://{host}/rest/api/content/{pageId}?expand=body.export_view с Basic Auth
- [x] #2 Из JSON-ответа извлекаются title и body.export_view.value через jq
- [x] #3 При HTTP-ошибке или невалидном JSON — выход с ненулевым кодом и сообщением в stderr
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Add curl GET to /rest/api/content/{pageId}?expand=body.export_view with Basic Auth (login:password). Use -sf --write-out for HTTP status checking. Parse JSON response with jq to extract .title and .body.export_view.value. On HTTP error or jq parse failure, print error to stderr and return 1. Replace the current echo statements with the API call. Add tests with mock curl.

Commit: `b0da42a` - task-3: fetch Confluence page via REST API with jq parsing

Implemented curl GET to /rest/api/content/{pageId}?expand=body.export_view with Basic Auth. Parses title and body.export_view.value via jq -re. Error handling for curl failure, non-200 HTTP status, and missing/invalid JSON fields. 19 tests pass with mock curl/pass functions.
<!-- SECTION:NOTES:END -->

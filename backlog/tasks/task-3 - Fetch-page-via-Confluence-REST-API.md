---
id: TASK-3
title: Fetch page via Confluence REST API
status: To Do
assignee: []
created_date: '2026-04-01 14:08'
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
- [ ] #1 GET-запрос к https://{host}/rest/api/content/{pageId}?expand=body.export_view с Basic Auth
- [ ] #2 Из JSON-ответа извлекаются title и body.export_view.value через jq
- [ ] #3 При HTTP-ошибке или невалидном JSON — выход с ненулевым кодом и сообщением в stderr
<!-- AC:END -->

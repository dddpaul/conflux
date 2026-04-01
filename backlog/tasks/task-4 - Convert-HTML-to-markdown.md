---
id: TASK-4
title: Convert HTML to markdown
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 14:08'
updated_date: '2026-04-01 14:24'
labels: []
dependencies:
  - TASK-3
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Добавить конвертацию HTML body страницы в markdown через html2markdown с параметрами --plugin-table --exclude-selector=br. Ссылки на изображения остаются как оригинальные URL Confluence.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 HTML конвертируется через html2markdown --plugin-table --exclude-selector=br
- [x] #2 Ссылки на изображения и вложения остаются как оригинальные URL Confluence
- [x] #3 При ошибке html2markdown — выход с ненулевым кодом и сообщением в stderr
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Pipe the $html variable through html2markdown --plugin-table --exclude-selector=br via stdin. On failure, print error to stderr and return 1. Image/attachment URLs pass through html2markdown unchanged. Add tests with mocked html2markdown.

Commit: `5ac8c12` - task-4: convert HTML body to markdown via html2markdown

Implemented html2markdown conversion: pipes HTML body through html2markdown --plugin-table --exclude-selector=br. Error handling returns 1 with stderr message. 6 new tests covering flags, stdin, image URL preservation, and failure handling. All 24 tests pass.
<!-- SECTION:NOTES:END -->

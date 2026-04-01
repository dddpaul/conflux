---
id: TASK-4
title: Convert HTML to markdown
status: To Do
assignee: []
created_date: '2026-04-01 14:08'
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
- [ ] #1 HTML конвертируется через html2markdown --plugin-table --exclude-selector=br
- [ ] #2 Ссылки на изображения и вложения остаются как оригинальные URL Confluence
- [ ] #3 При ошибке html2markdown — выход с ненулевым кодом и сообщением в stderr
<!-- AC:END -->

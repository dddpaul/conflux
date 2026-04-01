---
id: TASK-5
title: Save markdown to file with sanitized name
status: To Do
assignee: []
created_date: '2026-04-01 14:08'
labels: []
dependencies:
  - TASK-4
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Сохранить сконвертированный markdown в файл с именем '{pageId} - {sanitized_title}.md' в текущей директории. Из title удалить спецсимволы, недопустимые в именах файлов.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Файл сохраняется в текущей директории
- [ ] #2 Имя файла: {pageId} - {sanitized_title}.md
- [ ] #3 Из title удаляются символы / : ? * " < > | \
- [ ] #4 Функция выводит путь к сохранённому файлу в stdout
<!-- AC:END -->

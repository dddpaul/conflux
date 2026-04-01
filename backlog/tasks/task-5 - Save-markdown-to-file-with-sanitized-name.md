---
id: TASK-5
title: Save markdown to file with sanitized name
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 14:08'
updated_date: '2026-04-01 14:27'
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
- [x] #1 Файл сохраняется в текущей директории
- [x] #2 Имя файла: {pageId} - {sanitized_title}.md
- [x] #3 Из title удаляются символы / : ? * " < > | \
- [x] #4 Функция выводит путь к сохранённому файлу в stdout
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: After html2markdown conversion, sanitize title by removing /:\?*"<>|\ characters using tr -d. Construct filename as '{pageId} - {sanitized_title}.md'. Write markdown content (with title as h1 heading) to that file. Print file path to stdout. Add tests for sanitization and file creation.

Commit: `ab8bc63` - task-5: save markdown to file with sanitized filename

Implemented file saving with sanitized filenames. Sanitizes title via tr -d removing /:?*"<>|\. Writes markdown with h1 title heading to {pageId} - {sanitized_title}.md. Prints filename to stdout. 31 tests pass (4 new + 6 updated).
<!-- SECTION:NOTES:END -->

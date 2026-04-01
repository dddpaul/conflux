---
id: TASK-2
title: Authenticate via pass utility
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 14:08'
updated_date: '2026-04-01 14:17'
labels: []
dependencies:
  - TASK-1
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Добавить в функцию получение учётных данных из pass. PASS_PATH задаётся как константа. Логин — последний сегмент пути, пароль — значение из pass show.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 PASS_PATH задана как константа внутри функции
- [x] #2 Логин извлекается как последний сегмент PASS_PATH (basename)
- [x] #3 Пароль извлекается командой pass show PASS_PATH
- [x] #4 При ошибке pass — выход с ненулевым кодом и сообщением в stderr
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Move CONFLUENCE_PASS_PATH inside the function as a local constant. Extract login via basename of path. Extract password via pass show. If pass fails, return 1 with stderr message. Add tests using a mock pass command.

Commit: `d4c2ab3` - task-2: authenticate via pass utility

Implemented pass authentication inside confluence-to-markdown function. PASS_PATH is a local constant. Login extracted via basename, password via pass show. Error handling on pass failure returns 1 with stderr message. 15 tests pass including mock-based auth tests.
<!-- SECTION:NOTES:END -->

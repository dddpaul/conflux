---
id: TASK-2
title: Authenticate via pass utility
status: To Do
assignee: []
created_date: '2026-04-01 14:08'
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
- [ ] #1 PASS_PATH задана как константа внутри функции
- [ ] #2 Логин извлекается как последний сегмент PASS_PATH (basename)
- [ ] #3 Пароль извлекается командой pass show PASS_PATH
- [ ] #4 При ошибке pass — выход с ненулевым кодом и сообщением в stderr
<!-- AC:END -->

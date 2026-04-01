---
id: TASK-6
title: Configure PASS_PATH via CONFLUENCE_PASS_PATH env variable
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 14:36'
updated_date: '2026-04-01 14:43'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Заменить захардкоженную константу PASS_PATH на переменную окружения CONFLUENCE_PASS_PATH. Добавить поддержку .env файла и исключить его из git.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Функция читает путь из переменной окружения CONFLUENCE_PASS_PATH вместо локальной константы
- [x] #2 При отсутствии CONFLUENCE_PASS_PATH — выход с ненулевым кодом и сообщением в stderr
- [x] #3 Функция загружает .env из текущей директории (source), если файл существует
- [x] #4 .env добавлен в .gitignore
- [x] #5 .env.example создан с примером CONFLUENCE_PASS_PATH=ORG/username
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Replace hardcoded PASS_PATH with CONFLUENCE_PASS_PATH env var. Source .env if present. Error on missing var. Add .env to .gitignore. Create .env.example.

Commit: `e61b6b1` - task-6: configure PASS_PATH via CONFLUENCE_PASS_PATH env variable

Implemented: replaced hardcoded PASS_PATH with CONFLUENCE_PASS_PATH env var. Added .env sourcing, error on missing var, .env in .gitignore, .env.example. Files: confluence-to-markdown.sh, test_confluence_to_markdown.sh, .gitignore, .env.example. All 34 tests pass.
<!-- SECTION:NOTES:END -->

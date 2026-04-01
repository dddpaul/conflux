---
id: TASK-6
title: Configure PASS_PATH via CONFLUENCE_PASS_PATH env variable
status: To Do
assignee: []
created_date: '2026-04-01 14:36'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Заменить захардкоженную константу PASS_PATH на переменную окружения CONFLUENCE_PASS_PATH. Добавить поддержку .env файла и исключить его из git.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Функция читает путь из переменной окружения CONFLUENCE_PASS_PATH вместо локальной константы
- [ ] #2 При отсутствии CONFLUENCE_PASS_PATH — выход с ненулевым кодом и сообщением в stderr
- [ ] #3 Функция загружает .env из текущей директории (source), если файл существует
- [ ] #4 .env добавлен в .gitignore
- [ ] #5 .env.example создан с примером CONFLUENCE_PASS_PATH=ORG/username
<!-- AC:END -->

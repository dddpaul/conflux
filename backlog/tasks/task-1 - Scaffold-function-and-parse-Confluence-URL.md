---
id: TASK-1
title: Scaffold function and parse Confluence URL
status: To Do
assignee: []
created_date: '2026-04-01 14:08'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Создать bash-функцию confluence-to-markdown, которая принимает URL Confluence и извлекает host и pageId. Функция размещается в отдельном .sh файле, пригодном для source в .bashrc/.zshrc.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Функция confluence-to-markdown определена и доступна после source файла
- [ ] #2 Принимает один аргумент — URL вида https://host/pages/viewpage.action?pageId=123
- [ ] #3 Корректно извлекает host и pageId из URL
- [ ] #4 При вызове без аргумента или с невалидным URL — выход с ненулевым кодом и сообщением в stderr
<!-- AC:END -->

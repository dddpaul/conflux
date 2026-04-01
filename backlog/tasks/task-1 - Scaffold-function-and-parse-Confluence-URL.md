---
id: TASK-1
title: Scaffold function and parse Confluence URL
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 14:08'
updated_date: '2026-04-01 14:14'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Создать bash-функцию confluence-to-markdown, которая принимает URL Confluence и извлекает host и pageId. Функция размещается в отдельном .sh файле, пригодном для source в .bashrc/.zshrc.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Функция confluence-to-markdown определена и доступна после source файла
- [x] #2 Принимает один аргумент — URL вида https://host/pages/viewpage.action?pageId=123
- [x] #3 Корректно извлекает host и pageId из URL
- [x] #4 При вызове без аргумента или с невалидным URL — выход с ненулевым кодом и сообщением в stderr
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Create confluence-to-markdown.sh with function confluence-to-markdown. Parse URL using bash parameter expansion/regex to extract host and pageId from https://host/pages/viewpage.action?pageId=123 format. Validate input: no args or missing pageId -> exit 1 with stderr message. Write tests using bats-core. Function will be sourceable from .bashrc/.zshrc.

Commit: `b6f2a16` - task-1: bash function to parse Confluence URL into host and pageId

Implemented confluence-to-markdown bash function in confluence-to-markdown.sh. Extracts host and pageId from Confluence URLs using bash regex. Test suite with 11 tests in test_confluence_to_markdown.sh. All tests pass.
<!-- SECTION:NOTES:END -->

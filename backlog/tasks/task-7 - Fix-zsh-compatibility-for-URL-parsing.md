---
id: TASK-7
title: Fix zsh compatibility for URL parsing
status: To Do
assignee: []
created_date: '2026-04-01 15:04'
updated_date: '2026-04-01 15:23'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Скрипт использует BASH_REMATCH для извлечения host и pageId из URL (строки 25-26). При source в zsh BASH_REMATCH пуст — zsh кладёт capture groups в массив match. В результате host и pageId пустые, curl запрашивает https:///rest/api/content/?expand=body.export_view. Нужно заменить парсинг URL на способ, работающий в обоих shells (bash и zsh).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Парсинг URL корректно извлекает host и pageId при source в zsh
- [ ] #2 Парсинг URL корректно извлекает host и pageId при source в bash
- [ ] #3 Валидация невалидного URL по-прежнему работает
- [ ] #4 Существующие тесты проходят
- [ ] #5 Тест: URL с хостом confluence.domain.tld корректно парсится (host и pageId извлекаются верно)
<!-- AC:END -->

---
id: TASK-7
title: Fix zsh compatibility for URL parsing
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 15:04'
updated_date: '2026-04-01 15:27'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Скрипт использует BASH_REMATCH для извлечения host и pageId из URL (строки 25-26). При source в zsh BASH_REMATCH пуст — zsh кладёт capture groups в массив match. В результате host и pageId пустые, curl запрашивает https:///rest/api/content/?expand=body.export_view. Нужно заменить парсинг URL на способ, работающий в обоих shells (bash и zsh).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Парсинг URL корректно извлекает host и pageId при source в zsh
- [x] #2 Парсинг URL корректно извлекает host и pageId при source в bash
- [x] #3 Валидация невалидного URL по-прежнему работает
- [x] #4 Существующие тесты проходят
- [x] #5 Тест: URL с хостом confluence.domain.tld корректно парсится (host и pageId извлекаются верно)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Keep regex validation (works in both shells), remove capture groups from it. Replace BASH_REMATCH extraction with parameter expansion (works identically in bash and zsh). Add test for confluence.domain.tld host parsing.

Commit: `b4aac3c` - task-7: replace BASH_REMATCH with parameter expansion for zsh compatibility

Replaced BASH_REMATCH with parameter expansion for zsh compatibility. Added test for multi-level subdomain host. Files changed: confluence-to-markdown.sh, test_confluence_to_markdown.sh.
<!-- SECTION:NOTES:END -->

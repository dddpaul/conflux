---
id: doc-1
title: Project Overview
type: overview
created_date: '2026-04-01 14:07'
---

## Goal

Bash-функция `confluence-to-markdown` для экспорта отдельных страниц Confluence в markdown-файлы через REST API.

## Tech Stack

- Bash (функция для `.bashrc`/`.zshrc`)
- curl — HTTP-запросы к Confluence REST API
- jq — парсинг JSON-ответов
- html2markdown — конвертация HTML в markdown
- pass — хранение учётных данных

## Architecture

Одна bash-функция, линейный пайплайн:
```
URL → parse(host, pageId) → pass(credentials) → curl(API) → jq(title, html) → html2markdown → file
```

## Scope

**In scope:** экспорт одной страницы по URL, sanitization имени файла, минимальная обработка ошибок.
**Out of scope:** массовый экспорт, скачивание вложений, retry, кэширование.

## Task Dependency Graph

1. task-1: Scaffold function + URL parsing
2. task-2: Authentication via pass (depends on task-1)
3. task-3: Fetch page via REST API (depends on task-2)
4. task-4: Convert HTML to markdown (depends on task-3)
5. task-5: Save to file with sanitized name (depends on task-4)

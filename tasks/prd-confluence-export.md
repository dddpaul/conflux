# PRD: Confluence Page Export to Markdown

## Introduction

Shell-функция для экспорта отдельных страниц из Confluence в markdown-формат. Пользователь копирует URL страницы из браузера, вызывает функцию — и получает локальный `.md` файл с содержимым страницы. Функция предназначена для интерактивного использования из терминала (`.bashrc`/`.zshrc`).

## Goals

- Экспортировать содержимое страницы Confluence в чистый markdown по одной команде
- Сохранять файл с понятным именем: `pageId - title.md`
- Использовать существующие инструменты (curl, html2markdown, pass) без дополнительных зависимостей

## User Stories

### US-001: Parse Confluence URL
**Description:** As a user, I want to pass a full Confluence URL so that the function extracts pageId automatically.

**Acceptance Criteria:**
- [ ] Функция принимает URL вида `https://host/pages/viewpage.action?pageId=123`
- [ ] Из URL корректно извлекаются host и pageId
- [ ] При невалидном URL функция завершается с ошибкой и понятным сообщением

### US-002: Authenticate via pass
**Description:** As a user, I want credentials to be fetched from `pass` so that I don't enter them manually.

**Acceptance Criteria:**
- [ ] Путь в pass задается через переменную окружения `CONFLUENCE_PASS_PATH` (формат: `ORG/username`)
- [ ] Поддержка `.env` файла в текущей директории
- [ ] `.env` исключен из git
- [ ] Логин извлекается как последний сегмент пути (username)
- [ ] Пароль извлекается командой `pass show $PASS_PATH`
- [ ] При ошибке получения пароля функция завершается с сообщением об ошибке

### US-003: Fetch page via Confluence REST API
**Description:** As a user, I want the function to fetch page content via REST API so that I get the full HTML body.

**Acceptance Criteria:**
- [ ] Запрос к `https://{host}/rest/api/content/{pageId}?expand=body.export_view` с Basic Auth
- [ ] Из JSON-ответа извлекаются title и body.export_view.value
- [ ] При ошибке HTTP-запроса функция завершается с сообщением об ошибке

### US-004: Convert HTML to Markdown
**Description:** As a user, I want HTML content converted to clean markdown so that the result is readable.

**Acceptance Criteria:**
- [ ] HTML конвертируется через `html2markdown` с флагами `--plugin-table --exclude-selector=br`
- [ ] Ссылки на изображения и вложения остаются как оригинальные URL Confluence
- [ ] При ошибке конвертации функция завершается с сообщением об ошибке

### US-005: Save to file with sanitized name
**Description:** As a user, I want the result saved to a file named `pageId - title.md` so that I can easily find it later.

**Acceptance Criteria:**
- [ ] Файл сохраняется в текущей директории
- [ ] Имя файла: `{pageId} - {sanitized_title}.md`
- [ ] Из title удаляются спецсимволы, недопустимые в именах файлов (`/`, `:`, `?`, `*`, `"`, `<`, `>`, `|`, `\`)
- [ ] Функция выводит путь к сохраненному файлу

## Functional Requirements

- FR-1: Функция называется `confluence-to-markdown` и доступна после source в `.bashrc`/`.zshrc`
- FR-2: Единственный аргумент — полный URL страницы Confluence
- FR-3: Путь в pass задается через `CONFLUENCE_PASS_PATH` env (поддержка `.env` файла)
- FR-4: Для парсинга JSON из ответа API использовать `jq`
- FR-5: Конвертация HTML в markdown через `html2markdown --plugin-table --exclude-selector=br`
- FR-6: Имя выходного файла: `{pageId} - {sanitized_title}.md`
- FR-7: При любой ошибке — немедленный выход с ненулевым кодом и сообщением в stderr

## Non-Goals

- Массовый экспорт (деревья страниц, пространства)
- Скачивание вложений и изображений локально
- Retry при сетевых ошибках
- Поддержка других форматов кроме markdown
- Кэширование или инкрементальный экспорт
- Поддержка shell отличных от bash

## Technical Considerations

- Зависимости: `curl`, `jq`, `html2markdown`, `pass`
- `html2markdown` — https://github.com/JohannesKaufmann/html-to-markdown
- Confluence REST API v1: `GET /rest/api/content/{id}?expand=body.export_view`
- Basic Auth: `curl -u username:password`
- Bash only — никаких Python/Perl/etc.

## Success Metrics

- Функция экспортирует страницу за один вызов без ручных шагов
- Полученный markdown корректно отображает таблицы и форматирование

## Open Questions

Нет открытых вопросов.

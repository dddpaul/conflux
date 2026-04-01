# PRD: Chrome Extension — Confluence to Markdown

## Introduction

Chrome-расширение для экспорта страниц Confluence в markdown одним кликом из браузера. Расширение использует REST API Confluence с авторизацией через session cookies браузера и конвертирует HTML в markdown через Turndown.js. Результат скачивается как `.md` файл.

## Goals

- Экспортировать страницу Confluence в markdown без выхода из браузера
- Не требовать ввода логина/пароля — использовать существующую сессию браузера
- Получать чистый HTML через REST API (export_view), а не парсить DOM страницы
- Корректно конвертировать таблицы, code-блоки и Confluence-специфичные элементы

## User Stories

### US-001: Extension manifest and project scaffold
**Description:** As a developer, I need the project structure and manifest.json so that the extension can be loaded in Chrome.

**Acceptance Criteria:**
- [ ] manifest_version: 3
- [ ] permissions: activeTab, downloads, storage
- [ ] host_permissions пустой по умолчанию — запрашивается динамически из URL вкладки
- [ ] Структура: manifest.json, background.js, popup.html, popup.js, converter.js, options.html, options.js
- [ ] Расширение загружается в Chrome через chrome://extensions в режиме разработчика без ошибок

### US-002: Parse Confluence URL from active tab
**Description:** As a user, I want the extension to automatically detect that I'm on Confluence page and extract pageId.

**Acceptance Criteria:**
- [ ] Из URL вкладки извлекаются host и pageId
- [ ] Поддерживается формат /pages/viewpage.action?pageId=123
- [ ] Поддерживается формат /wiki/spaces/SPACE/pages/123/Title (Confluence Cloud)
- [ ] При открытии popup на не-Confluence странице — кнопка Export неактивна с пояснением

### US-003: Fetch page content via REST API
**Description:** As a user, I want the extension to fetch page content using my existing browser session.

**Acceptance Criteria:**
- [ ] GET-запрос к /rest/api/content/{pageId}?expand=body.export_view из background service worker
- [ ] Cookies браузера подставляются автоматически через host_permissions
- [ ] Из JSON-ответа извлекаются title и body.export_view.value
- [ ] При HTTP-ошибке (401, 403, 404, 5xx) — понятное сообщение в popup

### US-004: Convert HTML to Markdown with Turndown.js
**Description:** As a user, I want the HTML content converted to clean markdown with proper formatting.

**Acceptance Criteria:**
- [ ] Базовая конвертация через Turndown.js (заголовки, списки, ссылки, bold/italic)
- [ ] Таблицы конвертируются через turndown-plugin-gfm
- [ ] Code-блоки Confluence (<pre> с классами) конвертируются в fenced code blocks с указанием языка
- [ ] Изображения остаются как оригинальные URL Confluence
- [ ] Пустые строки и лишние пробелы нормализуются

### US-005: Confluence-specific Turndown rules
**Description:** As a user, I want Confluence-specific elements (panels, macros) converted to meaningful markdown.

**Acceptance Criteria:**
- [ ] Info/warning/note panels → blockquote с префиксом (> **Info:** ...)
- [ ] Expand macro → <details><summary> (HTML в markdown)
- [ ] Table of contents macro — удаляется (markdown-рендереры сами генерируют TOC)
- [ ] Status macro (цветные лейблы) → **[STATUS]**
- [ ] User mention → plain text имени

### US-006: Download markdown file
**Description:** As a user, I want the markdown saved as a file with a meaningful name.

**Acceptance Criteria:**
- [ ] Файл скачивается через chrome.downloads API
- [ ] Имя файла: {pageId} - {sanitized_title}.md
- [ ] Из title удаляются спецсимволы (/ : ? * " < > | \)
- [ ] Скачивание происходит в директорию загрузок по умолчанию

### US-007: Popup UI
**Description:** As a user, I want a simple popup with an export button and status feedback.

**Acceptance Criteria:**
- [ ] Кнопка "Export to Markdown"
- [ ] Состояния: idle → loading (спиннер) → done (имя файла) → error (сообщение)
- [ ] На не-Confluence страницах — кнопка неактивна с текстом "Not a Confluence page"
- [ ] Минимальный дизайн, без лишних настроек в MVP

### US-008: Copy markdown to clipboard
**Description:** As a user, I want to copy the converted markdown to clipboard so that I can paste it directly into another tool.

**Acceptance Criteria:**
- [ ] Кнопка "Copy to Clipboard" рядом с "Export to Markdown" в popup
- [ ] Markdown копируется через navigator.clipboard.writeText()
- [ ] После копирования — визуальное подтверждение ("Copied!") на 2 секунды
- [ ] Работает независимо от скачивания файла

### US-009: Dynamic host permissions from active tab
**Description:** As a user, I want the extension to automatically request access to the Confluence host I'm on, without manual configuration.

**Acceptance Criteria:**
- [ ] Host извлекается из URL текущей вкладки
- [ ] Если permission на этот host отсутствует — chrome.permissions.request() с origin из URL
- [ ] Браузер показывает стандартный prompt; при подтверждении — permission запоминается
- [ ] При повторном использовании на том же хосте — permission уже есть, prompt не показывается
- [ ] Работает с несколькими Confluence-инстансами без дополнительной настройки

### US-010: Options page — Turndown settings
**Description:** As a user, I want to customize markdown conversion settings from the browser so that I can adjust output without editing code.

**Acceptance Criteria:**
- [ ] Options page доступна через правый клик на иконке расширения → "Options" и через ссылку в popup
- [ ] Настройка headingStyle: atx (# H1) / setext (underline)
- [ ] Настройка bulletListMarker: - / * / +
- [ ] Настройка codeBlockStyle: fenced (```) / indented
- [ ] Настройка обработки `<br>`: удалять / заменять на \n / оставлять
- [ ] Переключатели для Confluence-макросов: panels (on/off), expand (on/off), TOC (remove/keep), status (on/off)
- [ ] Настройки сохраняются в chrome.storage.sync и применяются при следующем экспорте
- [ ] Кнопка "Reset to defaults" для сброса настроек

### US-011: Project README
**Description:** As a user, I want a README that describes both ways to export Confluence pages so that I can choose the right approach.

**Acceptance Criteria:**
- [ ] README.md в корне проекта
- [ ] Описан способ 1: shell-функция (зависимости, настройка PASS_PATH, пример использования)
- [ ] Описан способ 2: Chrome-расширение (установка, настройка домена, использование)
- [ ] Сравнительная таблица двух подходов (авторизация, конвертер, где запускается)
- [ ] Описан общий принцип работы (REST API, export_view, формат имени файла)

## Functional Requirements

- FR-1: Manifest V3, service worker архитектура
- FR-2: Авторизация через session cookies браузера (host_permissions), без отдельного ввода credentials
- FR-3: REST API: GET /rest/api/content/{pageId}?expand=body.export_view
- FR-4: Конвертация HTML → Markdown через Turndown.js + turndown-plugin-gfm
- FR-5: Кастомные Turndown rules для Confluence-специфичных элементов
- FR-6: Скачивание файла через chrome.downloads API
- FR-7: Имя файла: {pageId} - {sanitized_title}.md
- FR-8: Popup с кнопкой экспорта и индикацией статуса
- FR-9: Host извлекается из URL вкладки, permission запрашивается динамически через chrome.permissions.request()
- FR-10: Options page с настройками Turndown.js, сохраняемыми в chrome.storage.sync

## Non-Goals

- Массовый экспорт (дерево страниц, пространство)
- Скачивание вложений и изображений локально
- Редактирование markdown перед сохранением
- Синхронизация или кэширование
- Поддержка Firefox / Safari (только Chrome, Manifest V3)
- Публикация в Chrome Web Store в рамках MVP

## Technical Considerations

- **Turndown.js** (~30KB) — bundled в расширение, не загружается с CDN
- **turndown-plugin-gfm** — для таблиц и strikethrough
- **Confluence URL форматы:**
  - Server/DC: `/pages/viewpage.action?pageId=123`
  - Cloud: `/wiki/spaces/SPACE/pages/123/Page+Title`
- Поддержка только REST API v1 (общий для Server/DC и Cloud). Cloud API v2 — out of scope
- **Manifest V3 ограничения:** service worker вместо background page, нет persistent state в background
- **chrome.permissions.request()** — для динамического добавления host_permissions без перезагрузки расширения
- **CSP расширения:** Turndown.js должен быть в bundle, eval() запрещён

## Success Metrics

- Экспорт страницы за один клик (открыл popup → нажал Export → файл скачан)
- Таблицы и code-блоки корректно отображаются в markdown
- Работает без ввода пароля на любом Confluence, где пользователь авторизован

## Open Questions

Нет открытых вопросов.

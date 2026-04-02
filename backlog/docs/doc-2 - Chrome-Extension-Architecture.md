---
id: doc-2
title: Chrome Extension Architecture
type: architecture
created_date: '2026-04-02 16:24'
---

## Overview

Manifest V3 Chrome extension. Popup triggers export, service worker orchestrates the pipeline, converter transforms HTML to Markdown.

## Data Flow

```
User clicks Export/Copy
        |
        v
+-------------------+     chrome.runtime       +---------------------+
|    popup.ts       | -----------------------> |   background.ts     |
|                   |     sendMessage          |   (service worker)  |
| - Export button   |     {action:"fetchPage"} |                     |
| - Copy button     |                          | 1. parseConfluence  |
| - Status display  |                          |    Url(tab.url)     |
| - Settings link   |                          |                     |
+-------------------+                          | 2. ensureHost       |
        ^                                      |    Permission()     |
        |                                      |                     |
        |           chrome.runtime             | 3. fetchPage()      |
        +------ onMessage(response) <--------- |    GET /rest/api/   |
                                               |    content/{id}     |
                                               |    ?expand=body.    |
                                               |    export_view      |
                                               +---------------------+
        |
        v  (popup receives title + html)
+-------------------+
|  converter.ts     |
|                   |
| Turndown.js + GFM |
| + custom rules:   |
|  - panels         |
|  - expand         |
|  - TOC (remove)   |
|  - status badges  |
|  - user mentions  |
|  - code blocks    |
|  - <style> strip  |
|                   |
| collapseTableRows |
| normalizeWspace   |
+-------------------+
        |
        v  markdown string
   +----+----+
   |         |
   v         v
Export     Copy
   |         |
   v         v
+--------+ +-------------+
|download| |clipboard.ts |
|er.ts   | |navigator.   |
|chrome. | |clipboard.   |
|downloads| |writeText() |
+--------+ +-------------+
```

## Components

```
chrome-extension/
src/
  background.ts    Service worker. Listens for "fetchPage" messages.
                   Orchestrates: parse URL -> check permissions -> fetch API.

  popup.ts         Popup UI logic. Sends "fetchPage" to background,
                   receives result, calls converter, triggers download/copy.

  converter.ts     HTML -> Markdown via Turndown.js + turndown-plugin-gfm.
                   Custom rules for Confluence macros. Table row collapsing.
                   Configurable: headingStyle, codeBlockStyle, brHandling, macros.

  url-parser.ts    Extracts host + pageId from Confluence URL.
                   Supports Server/DC, Cloud, and display URL formats.

  permissions.ts   Dynamic host_permissions via chrome.permissions.request().
                   Host derived from active tab URL, no manual config needed.

  confluence-api.ts  fetch() to REST API with credentials:"include" (cookies).
                     Returns {title, html} from body.export_view.value.

  downloader.ts    Blob -> chrome.downloads.download(). Sanitized filename.

  clipboard.ts     navigator.clipboard.writeText(). Returns success/failure.

  settings.ts      chrome.storage.sync for Turndown options + macro toggles.

  options.ts       Options page UI binding. Reads/writes settings.

  types.ts         Shared TypeScript interfaces.

public/
  manifest.json    MV3. permissions: activeTab, downloads, storage.
                   optional_host_permissions: ["https://*/"]

  popup.html       320px popup. Export + Copy buttons, status indicator.

  options.html     Settings form. Markdown formatting + macro toggles.
```

## Auth

No credentials needed. The extension uses `optional_host_permissions` + `chrome.permissions.request()`. On first use with a new Confluence host, Chrome shows a standard permission prompt. After approval, browser attaches session cookies to fetch() automatically.

## Key Decisions

- **REST API over DOM scraping**: `body.export_view` returns clean rendered HTML without UI artifacts
- **Service worker for fetch**: avoids CORS issues (background has host_permissions)
- **Turndown.js bundled**: ~30KB in output, no CDN dependency, CSP-safe
- **Dynamic permissions**: no hardcoded hosts, works with any Confluence instance

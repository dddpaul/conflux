---
id: doc-1
title: Project Overview
type: overview
created_date: '2026-04-01 14:07'
---

## Goal

Conflux — export Confluence pages to Markdown. Two tools: shell function for terminal, Chrome extension for browser.

## Tech Stack

**Shell function (`conflux.sh`):** Bash, curl, jq, html2markdown, pass
**Chrome extension (`chrome-extension/`):** TypeScript, esbuild, Turndown.js, turndown-plugin-gfm, vitest

## Architecture

**Shell:** `URL → parse(host, pageId) → pass(credentials) → curl(API) → jq(title, html) → html2markdown → file`
**Extension:** `Tab URL → parse(host, pageId) → permissions → fetch(API + cookies) → Turndown.js → download/clipboard`

Both use the same Confluence REST API endpoint: `GET /rest/api/content/{pageId}?expand=body.export_view`

## Scope

**In scope:** single page export, table/macro conversion, configurable Turndown settings, copy to clipboard, filename sanitization (Unicode-safe).
**Out of scope:** batch export, attachment download, retry, caching, Firefox/Safari.

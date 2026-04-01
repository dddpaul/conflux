---
id: TASK-13
title: Convert HTML to Markdown with Turndown.js
status: To Do
assignee: []
created_date: '2026-04-01 19:19'
labels: []
dependencies:
  - TASK-12
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement converter.ts with Turndown.js and turndown-plugin-gfm. Configure for headings (atx), fenced code blocks, GFM tables. Handle br elements. Normalize whitespace.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Basic conversion via Turndown.js (headings, lists, links, bold/italic)
- [ ] #2 Tables converted via turndown-plugin-gfm
- [ ] #3 Confluence code blocks (<pre> with classes) converted to fenced code blocks with language
- [ ] #4 Images remain as original Confluence URLs
- [ ] #5 Empty lines and extra whitespace normalized
- [ ] #6 Unit tests for converter pass
<!-- AC:END -->

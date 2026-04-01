---
id: TASK-13
title: Convert HTML to Markdown with Turndown.js
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 19:19'
updated_date: '2026-04-01 20:37'
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
- [x] #1 Basic conversion via Turndown.js (headings, lists, links, bold/italic)
- [x] #2 Tables converted via turndown-plugin-gfm
- [x] #3 Confluence code blocks (<pre> with classes) converted to fenced code blocks with language
- [x] #4 Images remain as original Confluence URLs
- [x] #5 Empty lines and extra whitespace normalized
- [x] #6 Unit tests for converter pass
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Implement converter.ts using TurndownService with atx headings, fenced code blocks, GFM plugin for tables. Add custom rule for Confluence code blocks (<pre> with language classes). Normalize whitespace (collapse blank lines). Generate filename from title. Write comprehensive unit tests covering all AC.

Commit: `25ff356` - task-13: Convert HTML to Markdown with Turndown.js and GFM plugin

Implemented converter.ts with TurndownService + GFM plugin. Custom rules for Confluence code blocks (brush:, language-, known language classes) and plain pre blocks. Whitespace normalization and title slugification for filenames. 19 unit tests covering all AC.
<!-- SECTION:NOTES:END -->

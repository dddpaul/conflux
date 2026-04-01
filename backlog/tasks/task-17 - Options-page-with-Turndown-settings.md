---
id: TASK-17
title: Options page with Turndown settings
status: To Do
assignee: []
created_date: '2026-04-01 19:20'
labels: []
dependencies:
  - TASK-14
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create options.html and options.ts with configurable Turndown settings. Save to chrome.storage.sync. Converter reads settings before each export.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Options page accessible via right-click extension icon → Options and via link in popup
- [ ] #2 Setting: headingStyle — atx / setext
- [ ] #3 Setting: bulletListMarker — - / * / +
- [ ] #4 Setting: codeBlockStyle — fenced / indented
- [ ] #5 Setting: br handling — remove / replace with newline / keep
- [ ] #6 Toggles for Confluence macros: panels, expand, TOC, status (on/off)
- [ ] #7 Settings saved in chrome.storage.sync and applied on next export
- [ ] #8 Reset to defaults button
<!-- AC:END -->

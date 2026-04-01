---
id: TASK-17
title: Options page with Turndown settings
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 19:20'
updated_date: '2026-04-01 20:55'
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
- [x] #1 Options page accessible via right-click extension icon → Options and via link in popup
- [x] #2 Setting: headingStyle — atx / setext
- [x] #3 Setting: bulletListMarker — - / * / +
- [x] #4 Setting: codeBlockStyle — fenced / indented
- [x] #5 Setting: br handling — remove / replace with newline / keep
- [x] #6 Toggles for Confluence macros: panels, expand, TOC, status (on/off)
- [x] #7 Settings saved in chrome.storage.sync and applied on next export
- [x] #8 Reset to defaults button
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: 1) Add ExtensionSettings type to types.ts with all Turndown + macro toggle settings. 2) Create settings.ts utility module for load/save/defaults using chrome.storage.sync. 3) Build options.html form with select/radio controls for Turndown settings and checkboxes for macro toggles + Reset button. 4) Implement options.ts to bind form to storage. 5) Update converter.ts to accept macro toggle settings. 6) Add link in popup.html to options page. 7) Write tests for settings load/save/defaults. 8) Build/lint/test.

Commit: `e81e19c` - task-17: Options page with Turndown and macro settings

Implemented options page with Turndown settings (headingStyle, bulletListMarker, codeBlockStyle, brHandling) and Confluence macro toggles (panels, expand, toc, status). Settings stored in chrome.storage.sync. Reset to defaults button. Settings link added to popup. New settings.ts module for load/save. Tests for settings and macro toggles.
<!-- SECTION:NOTES:END -->

---
id: TASK-18
title: Project README with both export methods
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 19:20'
updated_date: '2026-04-01 20:59'
labels: []
dependencies:
  - TASK-17
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Write README.md in project root describing both export methods: shell function and Chrome extension. Include comparison table and common architecture.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 README.md in project root
- [x] #2 Method 1 described: shell function (dependencies, CONFLUENCE_PASS_PATH setup, usage example)
- [x] #3 Method 2 described: Chrome extension (installation, host setup, usage)
- [x] #4 Comparison table of both approaches (auth, converter, runtime)
- [x] #5 Common principle explained (REST API, export_view, filename format)
- [x] #6 Chrome dev mode installation steps: chrome://extensions → Developer mode → Load unpacked → select dist/
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Write README.md covering: 1) Project intro with common principle (REST API, export_view, pageId-based filename). 2) Comparison table (auth, converter, runtime, settings). 3) Shell function section (deps, CONFLUENCE_PASS_PATH, usage). 4) Chrome extension section (build, install in dev mode, usage, settings). 5) Development section (build/test/lint commands).

Commit: `abfa418` - task-18: Project README with both export methods

Commit: `af64233` - task-18: Fix html2markdown repository URL

Wrote comprehensive README.md with: project intro explaining shared REST API approach, comparison table (auth, converter, runtime, settings, URL formats, output), shell function section (deps, pass setup, usage), Chrome extension section (build, dev-mode install, usage, settings), development commands, and How It Works section. Fixed html2markdown repo URL after code review.
<!-- SECTION:NOTES:END -->

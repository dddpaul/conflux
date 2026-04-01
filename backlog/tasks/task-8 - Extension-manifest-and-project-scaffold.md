---
id: TASK-8
title: Extension manifest and project scaffold
status: To Do
assignee: []
created_date: '2026-04-01 19:19'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create Chrome extension project structure under chrome-extension/. Set up manifest.json (MV3), package.json, tsconfig.json, esbuild build script. Create stub files for all modules. Extension must load in Chrome without errors.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 manifest_version: 3
- [ ] #2 permissions: activeTab, downloads, storage
- [ ] #3 host_permissions empty by default
- [ ] #4 Files: manifest.json, background.ts, popup.html, popup.ts, converter.ts, options.html, options.ts, url-parser.ts, types.ts
- [ ] #5 package.json with typescript, esbuild, eslint, vitest, @types/chrome, turndown, turndown-plugin-gfm
- [ ] #6 npm run build produces dist/ that loads in Chrome without errors
<!-- AC:END -->

---
id: TASK-8
title: Extension manifest and project scaffold
status: Done
assignee:
  - '@claude'
created_date: '2026-04-01 19:19'
updated_date: '2026-04-01 20:17'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create Chrome extension project structure under chrome-extension/. Set up manifest.json (MV3), package.json, tsconfig.json, esbuild build script. Create stub files for all modules. Extension must load in Chrome without errors.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 manifest_version: 3
- [x] #2 permissions: activeTab, downloads, storage
- [x] #3 host_permissions empty by default
- [x] #4 Files: manifest.json, background.ts, popup.html, popup.ts, converter.ts, options.html, options.ts, url-parser.ts, types.ts
- [x] #5 package.json with typescript, esbuild, eslint, vitest, @types/chrome, turndown, turndown-plugin-gfm
- [x] #6 npm run build produces dist/ that loads in Chrome without errors
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Create chrome-extension/ with full MV3 scaffold. package.json (ts, esbuild, eslint, vitest, @types/chrome, turndown, turndown-plugin-gfm). tsconfig.json (strict). build.ts (esbuild bundler copying public/ to dist/). manifest.json in public/ (MV3, permissions: activeTab/downloads/storage, empty host_permissions). Stub src/ files (background.ts, popup.ts, converter.ts, options.ts, url-parser.ts, types.ts). popup.html + options.html in public/. tests/converter.test.ts stub. .gitignore for dist/. Verify npm run build produces loadable dist/.

Commit: `7882216` - task-8: Chrome extension MV3 scaffold with TypeScript build pipeline

Implemented full MV3 scaffold: manifest.json, package.json with all deps, tsconfig.json (strict), esbuild build script, stub source files, ESLint flat config, vitest test. Build produces clean dist/.
<!-- SECTION:NOTES:END -->

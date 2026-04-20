---
id: TASK-25
title: Support /spaces/SPACE/pages/ID URL format without /wiki/ prefix
status: To Do
assignee: []
created_date: '2026-04-20 11:54'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The URL parser currently only handles Cloud URLs with /wiki/ prefix (/wiki/spaces/SPACE/pages/ID/Title). Some Confluence instances use /spaces/SPACE/pages/ID or /spaces/SPACE/pages/ID/Title without the /wiki/ prefix. Examples: https://confluence.example.com/spaces/ARCH/pages/3299440290 and https://confluence.example.com/spaces/ARCH/pages/3285278961/%D0%9F%D1%80%D0%BE%D0%B4%D1%83%D0%BA%D1%82%D0%BE%D0%B2%D1%8B%D0%B5+%D1%84%D0%B0%D0%B1%D1%80%D0%B8%D0%BA%D0%B8. Affected file: chrome-extension/src/url-parser.ts — the CLOUD_PAGES_PATTERN regex needs to make the /wiki prefix optional.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 URLs like /spaces/SPACE/pages/ID are parsed correctly (spaceKey and pageId extracted)
- [ ] #2 URLs like /spaces/SPACE/pages/ID/encoded-title are parsed correctly (title decoded)
- [ ] #3 Existing /wiki/spaces/... URLs still work (no regression)
- [ ] #4 Tests added for new URL format
- [ ] #5 shellcheck passes on conflux.sh if shell function is also updated
<!-- AC:END -->

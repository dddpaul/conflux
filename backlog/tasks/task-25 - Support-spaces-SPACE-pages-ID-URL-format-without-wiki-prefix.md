---
id: TASK-25
title: Support /spaces/SPACE/pages/ID URL format without /wiki/ prefix
status: Done
assignee:
  - '@claude'
created_date: '2026-04-20 11:54'
updated_date: '2026-04-20 20:16'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The URL parser currently only handles Cloud URLs with /wiki/ prefix (/wiki/spaces/SPACE/pages/ID/Title). Some Confluence instances use /spaces/SPACE/pages/ID or /spaces/SPACE/pages/ID/Title without the /wiki/ prefix. Examples: https://confluence.example.com/spaces/ARCH/pages/3299440290 and https://confluence.example.com/spaces/ARCH/pages/3285278961/%D0%9F%D1%80%D0%BE%D0%B4%D1%83%D0%BA%D1%82%D0%BE%D0%B2%D1%8B%D0%B5+%D1%84%D0%B0%D0%B1%D1%80%D0%B8%D0%BA%D0%B8. Affected file: chrome-extension/src/url-parser.ts — the CLOUD_PAGES_PATTERN regex needs to make the /wiki prefix optional.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 URLs like /spaces/SPACE/pages/ID are parsed correctly (spaceKey and pageId extracted)
- [x] #2 URLs like /spaces/SPACE/pages/ID/encoded-title are parsed correctly (title decoded)
- [x] #3 Existing /wiki/spaces/... URLs still work (no regression)
- [x] #4 Tests added for new URL format
- [x] #5 shellcheck passes on conflux.sh if shell function is also updated
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Make /wiki prefix optional in CLOUD_PAGES_PATTERN regex by changing '/wiki/spaces/' to '(?:/wiki)?/spaces/'. This is a single regex change in url-parser.ts line 7. Add tests for /spaces/SPACE/pages/ID and /spaces/SPACE/pages/ID/title URLs. Verify existing tests still pass.

Commit: `f02005c` - task-25: Support /spaces/SPACE/pages/ID URL format without /wiki/ prefix

Implemented by making /wiki prefix optional in CLOUD_PAGES_PATTERN regex. Files changed: url-parser.ts (regex + comment), url-parser.test.ts (3 new tests). All 144 tests pass, build clean, lint clean.
<!-- SECTION:NOTES:END -->

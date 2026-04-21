---
id: TASK-34
title: Use original tab URL as source in Chrome extension frontmatter
status: Done
assignee:
  - '@claude'
created_date: '2026-04-21 14:36'
updated_date: '2026-04-21 16:33'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
buildSourceUrl in chrome-extension/src/confluence-api.ts synthesizes a viewpage.action?pageId= URL instead of using the URL the user was viewing. If user is on /spaces/ARCH/pages/123/Title, the frontmatter shows /pages/viewpage.action?pageId=123 — a different URL. Fix: pass the original tab URL through from popup.ts (it's discarded after parseConfluenceUrl). Shell script uses the exact URL passed to it — extension should do the same. URL should be decoded for readability (Cyrillic etc.).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Frontmatter source field contains the original URL the user was viewing, not a synthesized one
- [x] #2 URL is decoded for readability (percent-encoded UTF-8 shown as actual chars)
- [x] #3 Tests updated to verify original URL is used
- [x] #4 Build and lint pass
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Add originalUrl field to ConfluencePageInfo type. Set it in parseConfluenceUrl from the input URL. In fetchPageContent, use decodeURIComponent(pageInfo.originalUrl) instead of the synthesized buildSourceUrl. Remove buildSourceUrl. Update tests.

Commit: `ca86a9a` - task-34: Use original tab URL as source in frontmatter

Implemented: Added originalUrl field to ConfluencePageInfo, set in parseConfluenceUrl from the input URL, used decodeURIComponent(pageInfo.originalUrl) in fetchPageContent instead of synthesized buildSourceUrl. Removed buildSourceUrl. Files changed: types.ts, url-parser.ts, confluence-api.ts, url-parser.test.ts, confluence-api.test.ts, integration.test.ts. All 161 tests pass, build and lint clean.
<!-- SECTION:NOTES:END -->

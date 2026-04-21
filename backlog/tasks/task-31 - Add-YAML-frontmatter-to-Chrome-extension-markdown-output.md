---
id: TASK-31
title: Add YAML frontmatter to Chrome extension markdown output
status: Done
assignee:
  - '@claude'
created_date: '2026-04-21 08:50'
updated_date: '2026-04-21 12:25'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Chrome extension should produce the same YAML frontmatter as conflux.sh: title, source (url-decoded), author (from API history.createdBy.displayName), published (from API history.createdDate, date only), created (today), id (pageId), tags (confluence). Requires expanding API call to include history and space. Frontmatter should appear before the # heading in both download and clipboard output.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Frontmatter block with --- delimiters appears before the # heading
- [x] #2 All frontmatter fields present: title, source, author, published, created, id, tags
- [x] #3 source field is url-decoded
- [x] #4 author comes from API history.createdBy.displayName
- [x] #5 published is date-only from API history.createdDate
- [x] #6 API expand includes history
- [x] #7 Graceful fallback when history data is missing
- [x] #8 Tests cover frontmatter generation
- [x] #9 Build and lint pass
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: 1) Expand ConfluenceApiResponse type to include history (createdBy.displayName, createdDate) 2) Update confluence-api.ts API URL to expand=body.export_view,history 3) Expand PageContent to carry author/published/pageId/sourceUrl 4) Add frontmatter generation in converter.ts (new FrontmatterMeta interface, buildFrontmatter function) 5) Update convertHtmlToMarkdown to accept optional metadata and prepend frontmatter 6) Update popup.ts to pass metadata through 7) Add tests 8) Build + lint

Commit: `3f408ac` - task-31: Add YAML frontmatter to Chrome extension markdown output

Implemented YAML frontmatter for Chrome extension. Added FrontmatterMeta interface and buildFrontmatter() in converter.ts. Expanded API to fetch history data. Updated popup.ts to pass metadata to converter. Files changed: types.ts, confluence-api.ts, converter.ts, popup.ts, and 4 test files.
<!-- SECTION:NOTES:END -->

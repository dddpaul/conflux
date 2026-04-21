---
id: TASK-32
title: Change Chrome extension filename to Space - Title.md
status: Done
assignee:
  - '@claude'
created_date: '2026-04-21 08:50'
updated_date: '2026-04-21 12:34'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Chrome extension filename is currently just Title.md (converter.ts line 229). Should match shell script format: SPACE - Title.md. Space key is already available from URL parser (ConfluencePageInfo.spaceKey) and can also come from API response (space.key). Requires expanding API to include space, passing spaceKey through to converter/downloader, and updating buildFilename in downloader.ts. Falls back to pageId if space is unavailable. Depends on TASK-31 (API expand change).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Filename format is SpaceKey - Title.md
- [x] #2 API call expanded to fetch space data
- [x] #3 Fallback to pageId - Title.md when space key is empty
- [x] #4 buildFilename in downloader.ts updated
- [x] #5 Tests updated for new filename format
- [x] #6 Build and lint pass
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: 1) Add spaceKey to PageContent and space to ConfluenceApiResponse types 2) Expand API call to body.export_view,history,space and extract space.key with fallback to pageInfo.spaceKey 3) Update buildFilename in downloader.ts to use spaceKey prefix with pageId fallback 4) Add spaceKey to FrontmatterMeta in converter.ts, use it for filename as 'SpaceKey - Title.md' 5) Update popup.ts to pass spaceKey through meta 6) Update tests for new filename format 7) Build + lint

Commit: `0845934` - task-32: Filename format SpaceKey - Title.md with pageId fallback

Implemented SpaceKey - Title.md filename format. Added space to API expand, spaceKey to PageContent and FrontmatterMeta. buildFilename accepts (spaceKey, pageId, title) with pageId fallback. Files: types.ts, confluence-api.ts, downloader.ts, converter.ts, popup.ts + 5 test files.
<!-- SECTION:NOTES:END -->

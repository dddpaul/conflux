---
id: TASK-30
title: Change markdown filename to Space - Title.md
status: Done
assignee:
  - '@claude'
created_date: '2026-04-21 08:26'
updated_date: '2026-04-21 08:49'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Currently filename is pageId - Title.md. Since pageId is now in frontmatter, change to SpaceKey - Title.md. Need to get space key from API response (expand=space) since not all URL formats include space key in the URL.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Filename format is SpaceKey - Title.md
- [x] #2 API call expanded to fetch space data
- [x] #3 Existing tests updated for new filename format
- [x] #4 shellcheck passes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Add space to API expand (body.export_view,history,space), extract space.key via jq, change filename from pageId - Title.md to SpaceKey - Title.md

Commit: `7909d2b` - task-30: Filename uses space key instead of pageId

Filename now uses space.key from API. Falls back to pageId when space is absent. jq uses // empty to handle null.
<!-- SECTION:NOTES:END -->

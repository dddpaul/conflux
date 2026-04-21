---
id: TASK-28
title: Add YAML frontmatter to conflux.sh markdown output
status: Done
assignee:
  - '@claude'
created_date: '2026-04-21 06:08'
updated_date: '2026-04-21 06:42'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add Obsidian-style YAML frontmatter to exported markdown files. Fields: title (from API), source (original URL, url-decoded), author (plain text from API version.by.displayName), published (page creation date from API history.createdDate), created (today's date), tags (confluence), id (pageId). Requires expanding API call to include version and history fields. URL decoding needed for source field in bash (no native support - use printf/sed or perl).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Frontmatter block with --- delimiters appears before the # heading
- [x] #2 title field contains page title
- [x] #3 source field contains url-decoded original URL
- [x] #4 author field contains page author from API
- [x] #5 published field contains page creation date from API
- [x] #6 created field contains today's date (YYYY-MM-DD)
- [x] #7 tags field contains confluence
- [x] #8 id field contains pageId
- [x] #9 API call expanded to fetch version and history data
- [x] #10 Tests cover frontmatter generation
- [x] #11 shellcheck passes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan:
1. API call: expand=body.export_view,history (adds createdBy and createdDate)
2. Extract author: jq -re '.history.createdBy.displayName'
3. Extract published: jq -re '.history.createdDate' | truncate to YYYY-MM-DD (first 10 chars)
4. URL decode source: python3 -c 'import sys,urllib.parse;print(urllib.parse.unquote(sys.argv[1]))' "$url"
5. Created date: date +%Y-%m-%d
6. Frontmatter block before # heading, all string values double-quoted for YAML safety:
   ---
   title: "Page Title"
   source: "https://decoded-url..."
   author: "Author Name"
   published: 2024-01-15
   created: 2026-04-21
   id: 12345
   tags:
     - "confluence"
   ---
7. Tests: mock curl to return history fields, verify frontmatter appears in output file
8. Caveats addressed: YAML escaping via double-quoting, python3 for URL decode, date-only for published/created

Commit: `0d231f8` - task-28: Add YAML frontmatter to markdown output

Implemented YAML frontmatter with title, source (url-decoded), author, published, created, id, tags fields. Used pure bash URL decoding (printf/sed) instead of python3. API call expanded with history parameter. 14 new tests added (54 total). Shellcheck clean.
<!-- SECTION:NOTES:END -->

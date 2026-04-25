---
id: TASK-37
title: Download and embed page attachments and images in conflux.sh
status: To Do
assignee: []
created_date: '2026-04-25 09:50'
updated_date: '2026-04-25 17:05'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add image download to conflux.sh so exported markdown includes actual images instead of dead Confluence URLs.

**Pipeline integration:** After html2markdown produces the markdown string and before writing to file, a new download_images() function:
1. Scans markdown for ![...](url) where URL matches */download/attachments/*
2. Creates attachments-${page_id}/ directory (only if matches found)
3. Downloads each image with curl -sf -u "${login}:${password}"
4. Rewrites the URL in markdown to relative local path
5. Returns modified markdown string

**Image extraction:** Regex pattern: !\[([^]]*)\]\((https?://[^)]*/(download/attachments/[^)]+))\). Only /download/attachments/ URLs — skip thumbnails, generated previews, UI icons.

**Storage:** attachments-{pageId}/ sibling folder next to the .md file. Folder only created when images exist.

**Filenames:** Original filename from URL path, URL-decoded (printf '%b' trick already in script), query parameters stripped (everything after ?). Deduplication: image.png, image-2.png, image-3.png using string accumulator + grep (no associative arrays — bash 3.2 compat on macOS).

**Failure handling:** Per-image. On download failure: warn to stderr, replace markdown ref with ![image unavailable](original-url). Export always completes.

**Edge cases:** No images = no-op. URL-encoded filenames (spaces, Cyrillic) decoded. Query params stripped before filename extraction.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Shell script downloads images referenced in export_view HTML to attachments-{pageId}/ folder
- [ ] #2 Shell script rewrites img src in markdown to relative local paths (attachments-{pageId}/filename.png)
- [ ] #3 Download authenticates with same pass credentials as page fetch
- [ ] #4 Original filenames preserved, URL-decoded, with -2/-3 suffix for collisions
- [ ] #5 Failed downloads warn to stderr and replace ref with ![image unavailable](url)
- [ ] #6 Non-image attachment URLs and thumbnail URLs are skipped
- [ ] #7 No folder created when page has no downloadable images
- [ ] #8 Compatible with bash 3.2 (no associative arrays)
- [ ] #9 test_conflux.sh includes tests for image download: successful download with path rewrite, download failure with placeholder, no-images no-op, filename deduplication, query param stripping
<!-- AC:END -->

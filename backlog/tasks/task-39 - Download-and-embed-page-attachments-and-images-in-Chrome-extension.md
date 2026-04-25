---
id: TASK-39
title: Download and embed page attachments and images in Chrome extension
status: Done
assignee:
  - '@claude'
created_date: '2026-04-25 17:01'
updated_date: '2026-04-25 17:50'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Chrome extension counterpart to task-37. Add image download/inline so exported markdown from the extension includes actual images instead of dead Confluence URLs. Extension can use browser fetch with existing cookies for authentication. Consider: base64-inline for small images, download alongside .md for larger ones. Design to be brainstormed separately.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Extension downloads or inlines images referenced in export_view HTML
- [x] #2 Extension rewrites img src in markdown to local paths or base64 data URIs
- [x] #3 Extension authenticates when fetching attachment URLs (browser cookies)
- [x] #4 Non-image attachments are skipped gracefully
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Add image download/inline support to Chrome extension.

Approach: base64 data URI inlining for all attachment images.
- Create image-processor.ts module that extracts Confluence attachment URLs from HTML, fetches each with credentials:'include' (browser cookies), converts to base64 data URI, replaces in HTML before Turndown conversion.
- Process images in background.ts service worker after fetching page content but before sending to popup.
- Skip thumbnails (/thumbnails/) and generated previews (/generated/).
- Skip non-image content types (check response content-type header).
- Handle fetch failures gracefully (leave original URL).
- Fetch images in parallel for performance.
- Works for both download and clipboard export paths since processing happens in the HTML before conversion.

Commit: `e127479` - task-39: Download and inline Confluence attachment images in Chrome extension

Commit: `da978e1` - task-39: Use split/join instead of replaceAll for ES2020 compat

Implemented image download and inline for Chrome extension. Created image-processor.ts module with extractAttachmentUrls, arrayBufferToBase64, and processImages functions. Integrated into background.ts service worker pipeline. Images fetched in parallel with browser cookies auth, converted to base64 data URIs, and inlined in HTML before Turndown conversion. 23 tests added. Works for both download and clipboard export paths.
<!-- SECTION:NOTES:END -->

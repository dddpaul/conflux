---
id: TASK-26
title: Support /spaces/SPACE/pages/ID URL format in shell function
status: Done
assignee:
  - '@claude'
created_date: '2026-04-21 04:46'
updated_date: '2026-04-21 05:03'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The shell function conflux.sh currently only accepts viewpage.action?pageId=123 URLs. It should also support /spaces/SPACE/pages/ID and /spaces/SPACE/pages/ID/Title URLs (with or without /wiki/ prefix), matching what the Chrome extension already supports after TASK-25.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 URLs like /spaces/SPACE/pages/ID extract pageId correctly
- [x] #2 URLs like /wiki/spaces/SPACE/pages/ID/Title extract pageId correctly
- [x] #3 Existing viewpage.action?pageId= URLs still work
- [x] #4 Tests added for new URL formats
- [x] #5 shellcheck passes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Option A — two-branch validation with parameter expansion.

1. Replace single if/else validation (line 28) with if/elif/else: try pageId= regex first, then /spaces/ regex, else error
2. Host extraction stays shared (before the branch). pageId extraction differs per branch:
   - pageId= branch: existing parameter expansion (_tmp="${url#*pageId=}")
   - /spaces/ branch: trim path segments to isolate numeric ID after /pages/
3. No regex capture groups — all parameter expansion, zsh-safe
4. Update usage/error messages to show both URL formats
5. Tests: add cases for /spaces/SPACE/pages/ID, /wiki/spaces/SPACE/pages/ID, /spaces/SPACE/pages/ID/encoded-title, verify mock curl receives correct API URL
6. Out of scope: /display/SPACE/Title URLs (no pageId available)

Commit: `557d2e0` - task-26: Support /spaces/SPACE/pages/ID URL format in shell function

Implemented two-branch URL validation with parameter expansion. Added elif branch for /spaces/ format with optional /wiki/ prefix. 6 new tests verify pageId extraction for all URL variants. Shellcheck clean.
<!-- SECTION:NOTES:END -->

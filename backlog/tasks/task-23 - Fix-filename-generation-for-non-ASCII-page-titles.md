---
id: TASK-23
title: Fix filename generation for non-ASCII page titles
status: Done
assignee:
  - '@claude'
created_date: '2026-04-02 15:09'
updated_date: '2026-04-02 15:13'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
slugifyTitle in src/converter.ts uses /[^\w\s-]/g which strips all non-ASCII characters (Cyrillic, CJK, etc). Title '2. Варианты интеграции' becomes '2', saving as '2.md'.

The shell function correctly handles this by only removing filesystem-unsafe characters: / : ? * " < > | \

Fix: replace slugifyTitle to only strip filesystem-unsafe characters, preserving Unicode. Should match the shell approach:
- Remove: / : ? * " < > | \
- Keep: everything else including Cyrillic, spaces, dots, dashes

Current code (converter.ts line 203-210):
  function slugifyTitle(title: string): string {
    return title.toLowerCase()
      .replace(/[^\w\s-]/g, '')  // BUG: kills all non-ASCII
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

Fix should NOT lowercase or replace spaces with dashes — just sanitize unsafe chars like the shell does.

Write test in tests/converter.test.ts (add to existing file):
1. Title '2. Варианты интеграции' → filename preserves Cyrillic
2. Title 'Page with / and : chars' → slashes and colons removed
3. Title 'Simple English Title' → works as before
4. Title with all unsafe chars → all removed, rest preserved
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 slugifyTitle (or replacement function) preserves non-ASCII characters (Cyrillic, etc.)
- [x] #2 Only filesystem-unsafe characters removed: / : ? * < > | \ "
- [x] #3 Title '2. Варианты интеграции' produces filename containing 'Варианты интеграции'
- [x] #4 New tests added to tests/converter.test.ts
- [x] #5 All existing tests pass
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Replace slugifyTitle to only strip filesystem-unsafe characters (/:\?*"<>|\) instead of stripping all non-word chars. Remove lowercasing and space-to-dash conversion to match shell behavior. Add 4 tests for non-ASCII, unsafe chars, English titles, and all-unsafe-chars edge case.

Commit: `20c6c05` - task-23: Preserve non-ASCII characters in generated filenames

Replaced slugifyTitle with sanitizeTitle in converter.ts. Now only strips filesystem-unsafe chars (/\:?*"<>|) instead of all non-word chars. Added 4 new tests and updated 3 existing test files.
<!-- SECTION:NOTES:END -->

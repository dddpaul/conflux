---
id: TASK-24
title: Support direct script execution for conflux.sh
status: Done
assignee:
  - '@claude'
created_date: '2026-04-02 16:31'
updated_date: '2026-04-02 16:34'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add dual-mode support: conflux.sh works both when sourced (function) and when executed directly as a script with URL parameter
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Running 'bash conflux.sh <url>' invokes the conflux function
- [x] #2 Sourcing still works as before
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Add a guard at the bottom of conflux.sh that detects direct execution vs sourcing using '(return 0 2>/dev/null) || conflux "$@"'. This is portable across bash and zsh.

Commit: `3da1289` - task-24: Support direct script execution for conflux.sh

Implemented dual-mode via (return 0 2>/dev/null) || conflux "$@" guard. All 35 tests pass.
<!-- SECTION:NOTES:END -->

---
id: TASK-27
title: Fix test isolation from real pass store and .env
status: Done
assignee:
  - '@claude'
created_date: '2026-04-21 05:06'
updated_date: '2026-04-21 05:42'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
4 test failures occur because: (1) conflux() sources .env on every call, re-setting CONFLUENCE_PASS_PATH even when tests unset it, (2) the pass failure test expects ORG/username but .env sets a real path. Tests must run independently of the host environment.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All tests pass regardless of whether .env exists in the working directory
- [x] #2 All tests pass regardless of whether a real pass store exists
- [x] #3 shellcheck passes on test_conflux.sh
- [x] #4 No test relies on hardcoded pass path matching env
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: Add environment isolation to test_conflux.sh. At the start of the test file, save and unset any .env-sourced variables (backup and remove .env if it exists), and restore at exit via trap. This prevents conflux()'s 'source .env' from overriding test-controlled environment variables. The pass failure test should use the test's CONFLUENCE_PASS_PATH value rather than a real one from .env.

Commit: `20da8e9` - task-27: Isolate tests from host .env and pass store

Implemented: Added environment isolation block at the top of test_conflux.sh that (1) hides .env by renaming it before tests run, (2) restores it via EXIT trap, (3) unsets CONFLUENCE_PASS_PATH from the host environment. This ensures conflux()'s 'source .env' is a no-op during tests. Files changed: test_conflux.sh. 41/41 tests pass.
<!-- SECTION:NOTES:END -->

---
id: TASK-35
title: Add .env loading with script-directory fallback
status: Done
assignee:
  - '@claude'
created_date: '2026-04-24 14:44'
updated_date: '2026-04-24 15:00'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Load .env from script directory as default config, override completely with CWD .env if present. Script directory resolved at load time via BASH_SOURCE[0] (bash) / ${(%):-%x} (zsh), stored in _CONFLUX_SCRIPT_DIR. If CWD .env exists it wins entirely (no merge). Silent if neither exists — existing CONFLUENCE_PASS_PATH check handles missing config. Proxy normalization unchanged.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Script dir resolved at load time into _CONFLUX_SCRIPT_DIR, works for both sourced and direct execution
- [x] #2 CWD .env completely replaces script-dir .env when present
- [x] #3 Falls back to script-dir .env when no CWD .env exists
- [x] #4 Silent when neither .env exists
- [x] #5 Proxy normalization logic preserved
- [x] #6 Works in both bash and zsh
- [x] #7 shellcheck passes
- [x] #8 Tests pass
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan: 1) Add _CONFLUX_SCRIPT_DIR resolution at top of file (outside function) using BASH_SOURCE[0] with fallback to ${(%):-%x} for zsh. 2) Inside conflux(), check CWD .env first — if exists, source it and skip script-dir. Else check script-dir .env — if exists, source it. 3) Proxy normalization runs after whichever .env was sourced. 4) Silent if neither exists. 5) Add tests: script-dir fallback, CWD override, no .env silence, proxy normalization preserved.

Commit: `99e8c53` - task-35: Add .env loading with script-directory fallback

Implemented: _CONFLUX_SCRIPT_DIR resolved at file load time via BASH_SOURCE[0] (bash) / $0 (zsh). CWD .env takes full precedence; script-dir .env used as fallback. Silent when neither exists. Proxy normalization preserved. Files changed: conflux.sh, test_conflux.sh. 4 new tests added (58 total, all passing).
<!-- SECTION:NOTES:END -->

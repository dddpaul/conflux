---
id: TASK-35
title: Add .env loading with script-directory fallback
status: To Do
assignee: []
created_date: '2026-04-24 14:44'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Load .env from script directory as default config, override completely with CWD .env if present. Script directory resolved at load time via BASH_SOURCE[0] (bash) / ${(%):-%x} (zsh), stored in _CONFLUX_SCRIPT_DIR. If CWD .env exists it wins entirely (no merge). Silent if neither exists — existing CONFLUENCE_PASS_PATH check handles missing config. Proxy normalization unchanged.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Script dir resolved at load time into _CONFLUX_SCRIPT_DIR, works for both sourced and direct execution
- [ ] #2 CWD .env completely replaces script-dir .env when present
- [ ] #3 Falls back to script-dir .env when no CWD .env exists
- [ ] #4 Silent when neither .env exists
- [ ] #5 Proxy normalization logic preserved
- [ ] #6 Works in both bash and zsh
- [ ] #7 shellcheck passes
- [ ] #8 Tests pass
<!-- AC:END -->

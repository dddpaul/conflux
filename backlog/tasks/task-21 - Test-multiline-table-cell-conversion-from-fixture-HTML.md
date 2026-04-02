---
id: TASK-21
title: Test multiline table cell conversion from fixture HTML
status: To Do
assignee: []
created_date: '2026-04-02 05:26'
updated_date: '2026-04-02 05:28'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Write a vitest test file chrome-extension/tests/table-multiline.test.ts that tests conversion of the fixture file chrome-extension/tests/fixtures/table-with-multiline-cells.html using convertHtmlToMarkdown from src/converter.ts.

The fixture contains a Confluence-style table with 3 columns (No, Function, Description) and 5 data rows. The Description column has multiline content using <br> tags, <strong> tags, and numbered lists as plain text.

Key context for implementation:
- convertHtmlToMarkdown(html, title, options?) is in src/converter.ts
- It returns ExportResult { markdown, filename }
- brHandling option: 'remove' | 'newline' | 'keep' (default: 'newline')
- The fixture file is at tests/fixtures/table-with-multiline-cells.html
- Read fixture via fs.readFileSync in the test
- Existing test patterns: see tests/converter.test.ts for import style and assertion patterns
- Table is wrapped in <div class='table-wrap'><table class='wrapped confluenceTable'> with confluenceTh/confluenceTd classes

Tests must verify:
1. Row count: number of data rows in markdown table equals number of <tr> in tbody (5 rows)
2. All function names present in markdown output (calculateDailyTurnover, validateTransaction, generateReport, reconcileAccounts, applyExchangeRate)
3. Header row present (No | Function | Description)
4. brHandling='newline' mode: <br> replaced with space or stripped inside table cells (markdown tables cannot contain literal newlines within a cell)
5. brHandling='remove' mode: <br> removed, content joined without newline
6. brHandling='keep' mode: <br> kept as literal <br> in cell content
7. <strong> tags converted to **bold** in table cells
8. Table separator row exists (| --- | --- | --- |)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Test file created at chrome-extension/tests/table-multiline.test.ts
- [ ] #2 Test reads fixture from chrome-extension/tests/fixtures/table-with-multiline-cells.html via fs.readFileSync
- [ ] #3 Test verifies row count: 5 data rows in markdown table matching 5 tbody tr elements in HTML
- [ ] #4 Test verifies all 5 function names present in markdown output
- [ ] #5 Test verifies brHandling=newline mode produces valid single-line table cells
- [ ] #6 Test verifies brHandling=remove mode removes br without adding newlines
- [ ] #7 Test verifies brHandling=keep mode preserves literal <br> in cells
- [ ] #8 All tests pass via npm run test
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
IMPORTANT: If tests fail because of converter behavior (e.g. br handling inside table cells produces invalid markdown tables), fix the converter code in src/converter.ts to make tests pass. The goal is correct behavior, not tests matching broken output.
<!-- SECTION:NOTES:END -->

---
id: TASK-22
title: Strip style tags from Confluence export_view HTML
status: To Do
assignee: []
created_date: '2026-04-02 05:59'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Confluence export_view includes <style> tags with CSS for TOC macro (div.rbtocNNNN). The TOC div is removed by the confluenceToc rule, but the <style> tag is a sibling — Turndown passes it through as text, resulting in raw CSS like:
/*<![CDATA[*/ div.rbtoc1234567890 {padding: 0px;} ... /*]]>*/
appearing in the markdown output.

Fix: add a Turndown rule (or pre-process HTML) in src/converter.ts to strip all <style> tags before conversion.

Test fixture already exists: tests/fixtures/page-with-toc-style.html — contains a <style> tag with CDATA-wrapped CSS for div.rbtocNNNN, followed by a toc-macro div, then two h1 headings with paragraphs.

Write test in a new file tests/toc-style-strip.test.ts:
1. Convert fixture with convertHtmlToMarkdown(html, 'Test Page')
2. Assert markdown does NOT contain 'CDATA'
3. Assert markdown does NOT contain 'rbtoc'
4. Assert markdown does NOT contain 'padding'
5. Assert markdown DOES contain '# Overview' and '# Configuration' (content preserved)
6. Assert TOC links are removed (no 'section1', no 'toc-link')

Context:
- convertHtmlToMarkdown is in src/converter.ts, signature: convertHtmlToMarkdown(html, title, options?) => ExportResult {markdown, filename}
- Existing TOC rule filters on div.toc-macro class — it does NOT handle <style> siblings
- Fix the converter, not just the test. Both must pass.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Turndown rule or HTML pre-processing in src/converter.ts strips all <style> tags
- [ ] #2 Test file created at tests/toc-style-strip.test.ts
- [ ] #3 Test reads fixture from tests/fixtures/page-with-toc-style.html
- [ ] #4 Test asserts no CDATA, rbtoc, or CSS properties in markdown output
- [ ] #5 Test asserts content headings (Overview, Configuration) are preserved
- [ ] #6 All existing tests still pass
<!-- AC:END -->

# Conflux

Export Confluence pages to Markdown. Two tools, same principle: fetch the page via the Confluence REST API (`body.export_view`), convert HTML to Markdown, save as `{pageId} - {title}.md`.

## Comparison

| | Shell function | Chrome extension |
|---|---|---|
| **Runtime** | Bash (terminal) | Chrome browser |
| **Authentication** | `pass` password manager | Browser session cookies |
| **HTML-to-Markdown** | `html2markdown` (CLI) | Turndown.js + GFM plugin |
| **Confluence macros** | Not handled | Panels, expand, code blocks, status, TOC, mentions |
| **Settings** | None | Heading style, list markers, code blocks, macro toggles |
| **URL formats** | `viewpage.action?pageId=` only | Server, Cloud, and display URLs |
| **Output** | File in current directory | Download or clipboard |

## Shell Function

### Dependencies

- [curl](https://curl.se/) -- HTTP requests
- [jq](https://jqlang.github.io/jq/) -- JSON parsing
- [html-to-markdown](https://github.com/JohannesKaufmann/html-to-markdown) -- HTML to Markdown conversion
- [pass](https://www.passwordstore.org/) -- password manager for Confluence credentials

### Setup

1. Source the function in your shell profile:

```bash
source /path/to/conflux.sh
```

2. Set `CONFLUENCE_PASS_PATH` to your `pass` store entry. The last path segment is used as the login username, and the stored value is the password:

```bash
export CONFLUENCE_PASS_PATH=confluence/john.doe
# login: john.doe
# password: $(pass show confluence/john.doe)
```

Alternatively, create a `.env` file in the working directory -- it will be sourced automatically.

### Usage

```bash
conflux "https://confluence.example.com/pages/viewpage.action?pageId=12345"
# Output: 12345 - Page Title.md
```

## Chrome Extension

### Build

```bash
cd chrome-extension
npm install
npm run build
```

### Install (developer mode)

1. Open `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `chrome-extension/dist` directory

### Usage

1. Navigate to a Confluence page in Chrome
2. Click the extension icon in the toolbar
3. Click **Export** to download as `.md` or **Copy** to copy Markdown to clipboard

The extension works with:
- **Server/Data Center:** `https://host/pages/viewpage.action?pageId=123`
- **Cloud:** `https://host/wiki/spaces/SPACE/pages/123/Title`
- **Display URLs:** `https://host/display/SPACE/Page+Title`

### Settings

Right-click the extension icon and select **Options**, or click the settings link in the popup.

**Markdown formatting:**
- Heading style: ATX (`# Heading`) or Setext (underlines)
- Bullet list marker: `-`, `*`, or `+`
- Code block style: fenced (triple backticks) or indented
- Line break handling: convert to newline, remove, or keep as `<br>`

**Confluence macros:**
- Info/Warning/Tip/Note panels (converted to blockquotes)
- Expand sections (converted to `<details>` tags)
- Table of Contents (removed)
- Status badges (converted to `[STATUS]` text)

## Development

### Shell function

```bash
# Run tests
bash test_confluence_to_markdown.sh

# Lint
shellcheck conflux.sh
```

### Chrome extension

```bash
cd chrome-extension

npm run build    # Build to dist/
npm run test     # Run tests (vitest)
npm run lint     # Lint (eslint)
```

## Architecture

See [Chrome Extension Architecture](backlog/docs/doc-2%20-%20Chrome-Extension-Architecture.md) for data flow diagrams, component descriptions, and key design decisions.

## How It Works

Both tools call the same Confluence REST API endpoint:

```
GET /rest/api/content/{pageId}?expand=body.export_view
```

The `export_view` representation returns fully rendered HTML (macros expanded, includes resolved). This HTML is then converted to Markdown and saved with the filename format `{pageId} - {title}.md`.

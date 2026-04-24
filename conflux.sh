#!/usr/bin/env bash

# Confluence page export to markdown
# Source this file in .bashrc/.zshrc to use the conflux function

# Resolve script directory for .env fallback (bash: BASH_SOURCE, zsh: $0)
if [[ -n "${BASH_SOURCE[0]:-}" ]]; then
    _CONFLUX_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
else
    _CONFLUX_SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
fi

conflux() {
    # Load .env: CWD .env wins entirely, falls back to script-dir .env
    local _env_file=""
    if [[ -f .env ]]; then
        _env_file=".env"
    elif [[ -n "${_CONFLUX_SCRIPT_DIR:-}" && -f "$_CONFLUX_SCRIPT_DIR/.env" ]]; then
        _env_file="$_CONFLUX_SCRIPT_DIR/.env"
    fi

    if [[ -n "$_env_file" ]]; then
        # shellcheck source=/dev/null
        source "$_env_file"
        # Merge NO_PROXY into no_proxy (curl prefers lowercase) and export
        if [[ -n "${NO_PROXY:-}" && -n "${no_proxy:-}" ]]; then
            no_proxy="${no_proxy},${NO_PROXY}"
        elif [[ -n "${NO_PROXY:-}" ]]; then
            no_proxy="${NO_PROXY}"
        fi
        export no_proxy="${no_proxy:-}" \
               HTTPS_PROXY="${HTTPS_PROXY:-}" HTTP_PROXY="${HTTP_PROXY:-}" \
               https_proxy="${https_proxy:-}" http_proxy="${http_proxy:-}"
    fi

    # Path in pass store: login is the last segment, password is the stored value
    if [[ -z "${CONFLUENCE_PASS_PATH:-}" ]]; then
        echo "Error: CONFLUENCE_PASS_PATH environment variable is not set" >&2
        return 1
    fi
    local PASS_PATH="$CONFLUENCE_PASS_PATH"

    local url="${1:-}"

    if [[ -z "$url" ]]; then
        echo "Usage: conflux <confluence-url>" >&2
        echo "  URL formats:" >&2
        echo "    https://host/pages/viewpage.action?pageId=123" >&2
        echo "    https://host/wiki/spaces/SPACE/pages/123/Title" >&2
        echo "    https://host/spaces/SPACE/pages/123" >&2
        return 1
    fi

    # Extract host via parameter expansion (works in both bash and zsh)
    local _tmp="${url#*://}"
    local host="${_tmp%%/*}"
    local page_id

    # Validate URL and extract pageId
    if [[ "$url" =~ ^https?://[^/]+/.*pageId=[0-9]+ ]]; then
        # Server/DC: /pages/viewpage.action?pageId=123
        _tmp="${url#*pageId=}"
        page_id="${_tmp%%[!0-9]*}"
    elif [[ "$url" =~ ^https?://[^/]+/(wiki/)?spaces/[^/]+/pages/[0-9]+ ]]; then
        # Cloud: /spaces/SPACE/pages/123 or /wiki/spaces/SPACE/pages/123/Title
        _tmp="${url#*/pages/}"
        page_id="${_tmp%%[!0-9]*}"
    else
        echo "Error: invalid Confluence URL" >&2
        echo "  Expected formats:" >&2
        echo "    https://host/pages/viewpage.action?pageId=123" >&2
        echo "    https://host/wiki/spaces/SPACE/pages/123/Title" >&2
        echo "    https://host/spaces/SPACE/pages/123" >&2
        return 1
    fi

    # Authenticate via pass utility
    local login password
    login="$(basename "$PASS_PATH")"

    if ! password="$(pass show "$PASS_PATH" 2>&1)"; then
        echo "Error: failed to retrieve password from pass at '$PASS_PATH'" >&2
        return 1
    fi

    # Fetch page via Confluence REST API
    local api_url="https://${host}/rest/api/content/${page_id}?expand=body.export_view,history,space"
    local response http_code body

    response="$(curl -sf -u "${login}:${password}" -w '\n%{http_code}' "$api_url" 2>&1)" || {
        echo "Error: failed to fetch page from Confluence API (URL: $api_url)" >&2
        return 1
    }

    http_code="$(tail -n1 <<< "$response")"
    body="$(sed '$ d' <<< "$response")"

    if [[ "$http_code" -ne 200 ]]; then
        echo "Error: Confluence API returned HTTP $http_code" >&2
        return 1
    fi

    local title html
    if ! title="$(jq -re '.title' <<< "$body" 2>&1)"; then
        echo "Error: failed to parse title from API response" >&2
        return 1
    fi

    if ! html="$(jq -re '.body.export_view.value' <<< "$body" 2>&1)"; then
        echo "Error: failed to parse body from API response" >&2
        return 1
    fi

    # Extract metadata for frontmatter
    local space_key author published
    space_key="$(jq -re '.space.key // empty' <<< "$body" 2>/dev/null || echo "")"
    author="$(jq -re '.history.createdBy.displayName' <<< "$body" 2>/dev/null || echo "")"
    published="$(jq -re '.history.createdDate' <<< "$body" 2>/dev/null | head -c 10 || echo "")"

    # URL-decode the source URL (pure bash: convert + to space, %XX to bytes)
    local source_url
    source_url="$(printf '%b' "$(echo "$url" | sed 's/+/ /g; s/%\([0-9A-Fa-f][0-9A-Fa-f]\)/\\x\1/g')")"

    local created
    created="$(date +%Y-%m-%d)"

    # Convert HTML to markdown
    local markdown
    if ! markdown="$(echo "$html" | html2markdown --plugin-table --exclude-selector=br 2>&1)"; then
        echo "Error: html2markdown conversion failed" >&2
        return 1
    fi

    # Sanitize title for use in filename: remove / : ? * " < > | \
    local sanitized_title
    sanitized_title="$(echo "$title" | tr -d '/:?*"<>|\\')"

    # Build YAML frontmatter
    # Double-quote string values for YAML safety
    local frontmatter
    frontmatter="$(printf -- '---\ntitle: "%s"\nsource: "%s"\nauthor: "%s"\npublished: %s\ncreated: %s\nid: %s\ntags:\n  - "confluence"\n---' \
        "${title//\"/\\\"}" \
        "${source_url//\"/\\\"}" \
        "${author//\"/\\\"}" \
        "$published" \
        "$created" \
        "$page_id")"

    # Save markdown to file
    local filename
    if [[ -n "$space_key" ]]; then
        filename="${space_key} - ${sanitized_title}.md"
    else
        filename="${page_id} - ${sanitized_title}.md"
    fi
    printf '%s\n\n# %s\n\n%s\n' "$frontmatter" "$title" "$markdown" > "$filename"

    echo "$filename"
}

# Run as script when executed directly, no-op when sourced
(return 0 2>/dev/null) || conflux "$@"

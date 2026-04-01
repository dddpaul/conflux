#!/usr/bin/env bash

# Confluence page export to markdown
# Source this file in .bashrc/.zshrc to use the confluence-to-markdown function

confluence-to-markdown() {
    # Path in pass store: login is the last segment, password is the stored value
    local PASS_PATH="ORG/username"

    local url="${1:-}"

    if [[ -z "$url" ]]; then
        echo "Usage: confluence-to-markdown <confluence-url>" >&2
        echo "  URL format: https://host/pages/viewpage.action?pageId=123" >&2
        return 1
    fi

    # Validate URL format and extract components
    if [[ ! "$url" =~ ^https?://([^/]+)/.*pageId=([0-9]+) ]]; then
        echo "Error: invalid Confluence URL" >&2
        echo "  Expected format: https://host/pages/viewpage.action?pageId=123" >&2
        return 1
    fi

    local host="${BASH_REMATCH[1]}"
    local page_id="${BASH_REMATCH[2]}"

    # Authenticate via pass utility
    local login password
    login="$(basename "$PASS_PATH")"

    if ! password="$(pass show "$PASS_PATH" 2>&1)"; then
        echo "Error: failed to retrieve password from pass at '$PASS_PATH'" >&2
        return 1
    fi

    # Fetch page via Confluence REST API
    local api_url="https://${host}/rest/api/content/${page_id}?expand=body.export_view"
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

    # Convert HTML to markdown
    local markdown
    if ! markdown="$(echo "$html" | html2markdown --plugin-table --exclude-selector=br 2>&1)"; then
        echo "Error: html2markdown conversion failed" >&2
        return 1
    fi

    echo "$title"
    echo "$markdown"
}

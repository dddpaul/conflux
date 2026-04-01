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

    echo "Host: $host"
    echo "Page ID: $page_id"
}

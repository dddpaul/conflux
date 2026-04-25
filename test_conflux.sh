#!/usr/bin/env bash
# Tests for conflux function

set -uo pipefail

PASS=0
FAIL=0

assert_eq() {
    local description="$1" expected="$2" actual="$3"
    if [[ "$expected" == "$actual" ]]; then
        echo "PASS: $description"
        ((PASS++))
    else
        echo "FAIL: $description"
        echo "  expected: $expected"
        echo "  actual:   $actual"
        ((FAIL++))
    fi
}

assert_contains() {
    local description="$1" expected="$2" actual="$3"
    if [[ "$actual" == *"$expected"* ]]; then
        echo "PASS: $description"
        ((PASS++))
    else
        echo "FAIL: $description"
        echo "  expected to contain: $expected"
        echo "  actual:              $actual"
        ((FAIL++))
    fi
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Environment isolation ---
# Hide .env so conflux()'s `source .env` cannot override test variables
_test_env_hidden=0
if [[ -f "$SCRIPT_DIR/.env" ]]; then
    mv "$SCRIPT_DIR/.env" "$SCRIPT_DIR/.env.test-backup"
    _test_env_hidden=1
fi
# shellcheck disable=SC2154
trap '[ "$_test_env_hidden" -eq 1 ] && mv "$SCRIPT_DIR/.env.test-backup" "$SCRIPT_DIR/.env"' EXIT

# Clear any host-environment CONFLUENCE_PASS_PATH so tests control it
unset CONFLUENCE_PASS_PATH

source "$SCRIPT_DIR/conflux.sh"

# --- Mock setup ---

# Mock pass to succeed by default
mock_pass_success() {
    pass() {
        if [[ "$1" == "show" ]]; then
            echo "s3cret"
            return 0
        fi
        return 1
    }
    export -f pass
}

# Mock pass to fail
mock_pass_failure() {
    pass() {
        echo "Error: ORG/username is not in the password store." >&2
        return 1
    }
    export -f pass
}

# Mock curl to return a valid Confluence API response
mock_curl_success() {
    curl() {
        local json='{"title":"Test Page","body":{"export_view":{"value":"<p>Hello</p>"}},"history":{"createdBy":{"displayName":"John Doe"},"createdDate":"2024-01-15T10:30:00.000Z"},"space":{"key":"TST"}}'
        printf '%s\n%s' "$json" "200"
    }
    export -f curl
}

# Mock curl to return HTTP error
mock_curl_http_error() {
    curl() {
        # curl -sf fails on HTTP errors, so simulate that
        return 22
    }
    export -f curl
}

# Mock curl to return invalid JSON
mock_curl_invalid_json() {
    curl() {
        printf '%s\n%s' "not valid json" "200"
    }
    export -f curl
}

# Mock curl to return JSON missing title
mock_curl_missing_title() {
    curl() {
        local json='{"body":{"export_view":{"value":"<p>Hello</p>"}},"history":{"createdBy":{"displayName":"John Doe"},"createdDate":"2024-01-15T10:30:00.000Z"},"space":{"key":"TST"}}'
        printf '%s\n%s' "$json" "200"
    }
    export -f curl
}

# Mock curl to return JSON missing body
mock_curl_missing_body() {
    curl() {
        local json='{"title":"Test Page","history":{"createdBy":{"displayName":"John Doe"},"createdDate":"2024-01-15T10:30:00.000Z"},"space":{"key":"TST"}}'
        printf '%s\n%s' "$json" "200"
    }
    export -f curl
}

# Mock html2markdown to succeed
mock_html2markdown_success() {
    html2markdown() {
        # Read stdin and convert simple HTML to markdown-like output
        local input
        input="$(cat)"
        # Simple mock: strip tags for testing
        echo "$input" | sed 's/<[^>]*>//g'
        return 0
    }
    export -f html2markdown
}

# Mock html2markdown to fail
mock_html2markdown_failure() {
    html2markdown() {
        echo "Error: conversion failed" >&2
        return 1
    }
    export -f html2markdown
}

# Set up default mocks
mock_pass_success
mock_curl_success
mock_html2markdown_success

# Set CONFLUENCE_PASS_PATH for all tests
export CONFLUENCE_PASS_PATH="ORG/username"

# --- CONFLUENCE_PASS_PATH env variable tests ---

# Test: missing CONFLUENCE_PASS_PATH returns non-zero and prints error to stderr
saved_pass_path="$CONFLUENCE_PASS_PATH"
unset CONFLUENCE_PASS_PATH
ret=0; conflux "https://wiki.example.com/pages/viewpage.action?pageId=100" 2>/dev/null || ret=$?
assert_eq "Missing CONFLUENCE_PASS_PATH returns non-zero exit code" "1" "$ret"
assert_contains "Missing CONFLUENCE_PASS_PATH prints error to stderr" "CONFLUENCE_PASS_PATH" "$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=100" 2>&1 || true)"
export CONFLUENCE_PASS_PATH="$saved_pass_path"

# Test: empty CONFLUENCE_PASS_PATH returns non-zero
export CONFLUENCE_PASS_PATH=""
ret=0; conflux "https://wiki.example.com/pages/viewpage.action?pageId=100" 2>/dev/null || ret=$?
assert_eq "Empty CONFLUENCE_PASS_PATH returns non-zero exit code" "1" "$ret"
export CONFLUENCE_PASS_PATH="$saved_pass_path"

# --- URL parsing tests ---

# Test: no arguments -> exit 1
ret=0; conflux 2>/dev/null || ret=$?
assert_eq "No args returns non-zero exit code" "1" "$ret"
assert_contains "No args prints usage to stderr" "Usage:" "$(conflux 2>&1 || true)"

# Test: invalid URL -> exit 1
ret=0; conflux "not-a-url" 2>/dev/null || ret=$?
assert_eq "Invalid URL returns non-zero exit code" "1" "$ret"
assert_contains "Invalid URL prints error to stderr" "Error:" "$(conflux "not-a-url" 2>&1 || true)"

# Test: URL without pageId -> exit 1
ret=0; conflux "https://wiki.example.com/pages/viewpage.action" 2>/dev/null || ret=$?
assert_eq "URL without pageId returns non-zero exit code" "1" "$ret"

# --- Authentication via pass tests ---

# Test: pass success returns zero exit code
mock_pass_success
mock_curl_success
ret=0; conflux "https://wiki.example.com/pages/viewpage.action?pageId=100" >/dev/null 2>&1 || ret=$?
assert_eq "pass success returns zero exit code" "0" "$ret"

# Test: pass failure returns non-zero and prints error to stderr
mock_pass_failure
ret=0; conflux "https://wiki.example.com/pages/viewpage.action?pageId=100" 2>/dev/null || ret=$?
assert_eq "pass failure returns non-zero exit code" "1" "$ret"
assert_contains "pass failure prints error to stderr" "Error:" "$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=100" 2>&1 || true)"
assert_contains "pass failure mentions pass path" "ORG/username" "$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=100" 2>&1 || true)"

# Restore default mocks
mock_pass_success
mock_curl_success

# --- API fetch tests ---

# Test: successful fetch saves file and outputs filename
output=$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1)
assert_eq "Successful fetch outputs filename" "TST - Test Page.md" "$output"
assert_eq "Saved file exists" "0" "$([[ -f "TST - Test Page.md" ]] && echo 0 || echo 1)"
file_content="$(cat "TST - Test Page.md")"
assert_contains "Saved file contains title as h1" "# Test Page" "$file_content"
assert_contains "Saved file contains converted markdown" "Hello" "$file_content"
rm -f "TST - Test Page.md"

# Test: curl failure returns non-zero and prints error
mock_curl_http_error
ret=0; conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>/dev/null || ret=$?
assert_eq "curl HTTP error returns non-zero exit code" "1" "$ret"
assert_contains "curl HTTP error prints error to stderr" "Error:" "$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1 || true)"

# Test: invalid JSON returns non-zero and prints error
mock_curl_invalid_json
ret=0; conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>/dev/null || ret=$?
assert_eq "Invalid JSON returns non-zero exit code" "1" "$ret"
assert_contains "Invalid JSON prints error to stderr" "Error:" "$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1 || true)"

# Test: missing title in JSON returns non-zero
mock_curl_missing_title
ret=0; conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>/dev/null || ret=$?
assert_eq "Missing title returns non-zero exit code" "1" "$ret"
assert_contains "Missing title prints error to stderr" "Error:" "$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1 || true)"

# Test: missing body in JSON returns non-zero
mock_curl_missing_body
ret=0; conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>/dev/null || ret=$?
assert_eq "Missing body returns non-zero exit code" "1" "$ret"
assert_contains "Missing body prints error to stderr" "Error:" "$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1 || true)"

# --- HTML to markdown conversion tests ---

# Restore default mocks
mock_pass_success
mock_curl_success
mock_html2markdown_success

# Test: html2markdown is called with correct flags
mock_html2markdown_check_flags() {
    html2markdown() {
        local has_plugin_table=0
        local has_exclude_br=0
        local has_table_newline=0
        for arg in "$@"; do
            [[ "$arg" == "--plugin-table" ]] && has_plugin_table=1
            [[ "$arg" == "--exclude-selector=br" ]] && has_exclude_br=1
            [[ "$arg" == "--opt-table-newline-behavior=preserve" ]] && has_table_newline=1
        done
        if [[ $has_plugin_table -eq 1 && $has_exclude_br -eq 1 && $has_table_newline -eq 1 ]]; then
            echo "flags-ok"
        else
            echo "flags-missing: $*" >&2
            return 1
        fi
    }
    export -f html2markdown
}
mock_html2markdown_check_flags
output=$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1)
file_content="$(cat "TST - Test Page.md" 2>/dev/null || true)"
assert_contains "html2markdown called with --plugin-table, --exclude-selector=br, --opt-table-newline-behavior=preserve" "flags-ok" "$file_content"
rm -f "TST - Test Page.md"

# Restore default mocks
mock_pass_success
mock_curl_success
mock_html2markdown_success

# Test: html2markdown receives HTML body via stdin
mock_html2markdown_echo_stdin() {
    html2markdown() {
        cat
    }
    export -f html2markdown
}
mock_html2markdown_echo_stdin
conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
file_content="$(cat "TST - Test Page.md" 2>/dev/null || true)"
assert_contains "html2markdown receives HTML body via stdin" "<p>Hello</p>" "$file_content"
rm -f "TST - Test Page.md"

# Test: image URLs are preserved (html2markdown passes them through)
mock_curl_with_image() {
    curl() {
        local json='{"title":"Image Page","body":{"export_view":{"value":"<p><img src=\"https://wiki.example.com/download/attachments/123/image.png\" /></p>"}},"history":{"createdBy":{"displayName":"John Doe"},"createdDate":"2024-01-15T10:30:00.000Z"},"space":{"key":"TST"}}'
        printf '%s\n%s' "$json" "200"
    }
    export -f curl
}
mock_curl_with_image
mock_html2markdown_echo_stdin
conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
file_content="$(cat "TST - Image Page.md" 2>/dev/null || true)"
assert_contains "Image URLs preserved as original Confluence URLs" "https://wiki.example.com/download/attachments/123/image.png" "$file_content"
rm -f "TST - Image Page.md"

# Restore default mocks
mock_pass_success
mock_curl_success
mock_html2markdown_success

# Test: html2markdown failure returns non-zero and prints error
mock_html2markdown_failure
ret=0; conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>/dev/null || ret=$?
assert_eq "html2markdown failure returns non-zero exit code" "1" "$ret"
assert_contains "html2markdown failure prints error to stderr" "Error:" "$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1 || true)"

# --- File saving and sanitization tests ---

# Restore default mocks
mock_pass_success
mock_html2markdown_success

# Test: special characters are removed from filename
mock_curl_special_title() {
    curl() {
        local json='{"title":"Test/Page: A?B*C\"D<E>F|G\\H","body":{"export_view":{"value":"<p>content</p>"}},"history":{"createdBy":{"displayName":"John Doe"},"createdDate":"2024-01-15T10:30:00.000Z"},"space":{"key":"TST"}}'
        printf '%s\n%s' "$json" "200"
    }
    export -f curl
}
mock_curl_special_title
output=$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=456" 2>&1)
assert_eq "Special chars removed from filename" "TST - TestPage ABCDEFGH.md" "$output"
assert_eq "Sanitized file exists" "0" "$([[ -f "TST - TestPage ABCDEFGH.md" ]] && echo 0 || echo 1)"
rm -f "TST - TestPage ABCDEFGH.md"

# Test: file contains title heading with original (unsanitized) title
mock_curl_special_title
conflux "https://wiki.example.com/pages/viewpage.action?pageId=456" >/dev/null 2>&1
file_content="$(cat "TST - TestPage ABCDEFGH.md" 2>/dev/null || true)"
assert_contains "File heading uses original title" 'Test/Page: A?B*C"D<E>F|G\H' "$file_content"
rm -f "TST - TestPage ABCDEFGH.md"

# Test: filename uses pageId from URL
mock_pass_success
mock_curl_success
mock_html2markdown_success
output=$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=99999" 2>&1)
assert_eq "Filename uses space key" "TST - Test Page.md" "$output"
rm -f "TST - Test Page.md"

# Test: output is the file path (stdout)
mock_pass_success
mock_curl_success
mock_html2markdown_success
output=$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=100" 2>&1)
assert_eq "Stdout is the file path" "TST - Test Page.md" "$output"
rm -f "TST - Test Page.md"

# Test: URL with multi-level subdomain host parses correctly
mock_curl_check_host() {
    curl() {
        local url=""
        for arg in "$@"; do url="$arg"; done
        if [[ "$url" == "https://confluence.domain.tld/rest/api/content/555?expand=body.export_view,history,space" ]]; then
            local json='{"title":"Host Test","body":{"export_view":{"value":"<p>ok</p>"}},"history":{"createdBy":{"displayName":"Jane Smith"},"createdDate":"2023-06-01T08:00:00.000Z"},"space":{"key":"HOST"}}'
            printf '%s\n%s' "$json" "200"
        else
            echo "Wrong API URL: $url" >&2
            return 22
        fi
    }
    export -f curl
}
mock_pass_success
mock_curl_check_host
mock_html2markdown_success
output=$(conflux "https://confluence.domain.tld/pages/viewpage.action?pageId=555" 2>&1)
assert_eq "Multi-level subdomain host parsed correctly" "HOST - Host Test.md" "$output"
rm -f "HOST - Host Test.md"

# --- /spaces/ URL format tests ---

# Restore default mocks
mock_pass_success
mock_curl_success
mock_html2markdown_success

# Test: /spaces/SPACE/pages/ID extracts pageId correctly
mock_curl_check_spaces_pageid() {
    curl() {
        local url=""
        for arg in "$@"; do url="$arg"; done
        if [[ "$url" == "https://wiki.example.com/rest/api/content/789?expand=body.export_view,history,space" ]]; then
            local json='{"title":"Spaces Page","body":{"export_view":{"value":"<p>spaces</p>"}},"history":{"createdBy":{"displayName":"John Doe"},"createdDate":"2024-03-10T12:00:00.000Z"},"space":{"key":"TEAM"}}'
            printf '%s\n%s' "$json" "200"
        else
            echo "Wrong API URL: $url" >&2
            return 22
        fi
    }
    export -f curl
}
mock_pass_success
mock_curl_check_spaces_pageid
mock_html2markdown_success
output=$(conflux "https://wiki.example.com/spaces/TEAM/pages/789" 2>&1)
assert_eq "/spaces/SPACE/pages/ID extracts pageId" "TEAM - Spaces Page.md" "$output"
rm -f "TEAM - Spaces Page.md"

# Test: /wiki/spaces/SPACE/pages/ID/Title extracts pageId correctly
mock_pass_success
mock_curl_check_spaces_pageid
mock_html2markdown_success
output=$(conflux "https://wiki.example.com/wiki/spaces/TEAM/pages/789/My+Page+Title" 2>&1)
assert_eq "/wiki/spaces/SPACE/pages/ID/Title extracts pageId" "TEAM - Spaces Page.md" "$output"
rm -f "TEAM - Spaces Page.md"

# Test: /spaces/SPACE/pages/ID with encoded title extracts pageId correctly
mock_pass_success
mock_curl_check_spaces_pageid
mock_html2markdown_success
output=$(conflux "https://wiki.example.com/spaces/DEV/pages/789/Some%20Encoded%20Title" 2>&1)
assert_eq "/spaces/SPACE/pages/ID/encoded-title extracts pageId" "TEAM - Spaces Page.md" "$output"
rm -f "TEAM - Spaces Page.md"

# Test: /wiki/spaces/SPACE/pages/ID (no title) extracts pageId correctly
mock_pass_success
mock_curl_check_spaces_pageid
mock_html2markdown_success
output=$(conflux "https://wiki.example.com/wiki/spaces/TEAM/pages/789" 2>&1)
assert_eq "/wiki/spaces/SPACE/pages/ID (no title) extracts pageId" "TEAM - Spaces Page.md" "$output"
rm -f "TEAM - Spaces Page.md"

# Test: existing viewpage.action URL still works after changes
mock_pass_success
mock_curl_success
mock_html2markdown_success
output=$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1)
assert_eq "viewpage.action URL still works" "TST - Test Page.md" "$output"
rm -f "TST - Test Page.md"

# Test: /spaces/ URL with multi-level subdomain host
mock_curl_check_spaces_host() {
    curl() {
        local url=""
        for arg in "$@"; do url="$arg"; done
        if [[ "$url" == "https://confluence.domain.tld/rest/api/content/321?expand=body.export_view,history,space" ]]; then
            local json='{"title":"Host Spaces","body":{"export_view":{"value":"<p>ok</p>"}},"history":{"createdBy":{"displayName":"Jane Smith"},"createdDate":"2023-06-01T08:00:00.000Z"},"space":{"key":"PROJ"}}'
            printf '%s\n%s' "$json" "200"
        else
            echo "Wrong API URL: $url" >&2
            return 22
        fi
    }
    export -f curl
}
mock_pass_success
mock_curl_check_spaces_host
mock_html2markdown_success
output=$(conflux "https://confluence.domain.tld/wiki/spaces/PROJ/pages/321/Page+Title" 2>&1)
assert_eq "/spaces/ URL with multi-level subdomain" "PROJ - Host Spaces.md" "$output"
rm -f "PROJ - Host Spaces.md"

# --- YAML frontmatter tests ---

# Restore default mocks
mock_pass_success
mock_curl_success
mock_html2markdown_success

# Test: frontmatter block with --- delimiters appears before the heading
conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
file_content="$(cat "TST - Test Page.md" 2>/dev/null || true)"
assert_contains "Frontmatter starts with ---" "---" "$file_content"
# Check that frontmatter appears before the heading
first_delimiter_line="$(grep -n '^---$' "TST - Test Page.md" | head -1 | cut -d: -f1)"
heading_line="$(grep -n '^# ' "TST - Test Page.md" | head -1 | cut -d: -f1)"
assert_eq "Frontmatter appears before heading" "1" "$([[ "$first_delimiter_line" -lt "$heading_line" ]] && echo 1 || echo 0)"
rm -f "TST - Test Page.md"

# Test: title field in frontmatter
mock_pass_success
mock_curl_success
mock_html2markdown_success
conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
file_content="$(cat "TST - Test Page.md" 2>/dev/null || true)"
assert_contains "Frontmatter contains title field" 'title: "Test Page"' "$file_content"
rm -f "TST - Test Page.md"

# Test: source field contains url-decoded original URL
mock_pass_success
mock_curl_success
mock_html2markdown_success
conflux "https://wiki.example.com/spaces/DEV/pages/123/Some%20Encoded%20Title" >/dev/null 2>&1
file_content="$(cat "TST - Test Page.md" 2>/dev/null || true)"
assert_contains "Source field contains url-decoded URL" 'source: "https://wiki.example.com/spaces/DEV/pages/123/Some Encoded Title"' "$file_content"
rm -f "TST - Test Page.md"

# Test: author field from API history
mock_pass_success
mock_curl_success
mock_html2markdown_success
conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
file_content="$(cat "TST - Test Page.md" 2>/dev/null || true)"
assert_contains "Frontmatter contains author field" 'author: "John Doe"' "$file_content"
rm -f "TST - Test Page.md"

# Test: published field from API history (date only)
mock_pass_success
mock_curl_success
mock_html2markdown_success
conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
file_content="$(cat "TST - Test Page.md" 2>/dev/null || true)"
assert_contains "Frontmatter contains published date" "published: 2024-01-15" "$file_content"
rm -f "TST - Test Page.md"

# Test: created field contains today's date
mock_pass_success
mock_curl_success
mock_html2markdown_success
conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
file_content="$(cat "TST - Test Page.md" 2>/dev/null || true)"
today="$(date +%Y-%m-%d)"
assert_contains "Frontmatter contains today's created date" "created: $today" "$file_content"
rm -f "TST - Test Page.md"

# Test: tags field contains confluence
mock_pass_success
mock_curl_success
mock_html2markdown_success
conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
file_content="$(cat "TST - Test Page.md" 2>/dev/null || true)"
assert_contains "Frontmatter contains tags with confluence" '- "confluence"' "$file_content"
rm -f "TST - Test Page.md"

# Test: id field contains pageId
mock_pass_success
mock_curl_success
mock_html2markdown_success
conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
file_content="$(cat "TST - Test Page.md" 2>/dev/null || true)"
assert_contains "Frontmatter contains id field" "id: 123" "$file_content"
rm -f "TST - Test Page.md"

# Test: API call includes history expand
mock_curl_check_expand() {
    curl() {
        local url=""
        for arg in "$@"; do url="$arg"; done
        if [[ "$url" == *"expand=body.export_view,history,space"* ]]; then
            local json='{"title":"Expand Test","body":{"export_view":{"value":"<p>ok</p>"}},"history":{"createdBy":{"displayName":"Test User"},"createdDate":"2024-02-20T09:00:00.000Z"},"space":{"key":"TST"}}'
            printf '%s\n%s' "$json" "200"
        else
            echo "Missing history expand: $url" >&2
            return 22
        fi
    }
    export -f curl
}
mock_pass_success
mock_curl_check_expand
mock_html2markdown_success
ret=0; conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1 || ret=$?
assert_eq "API call includes history in expand parameter" "0" "$ret"
rm -f "TST - Expand Test.md"

# Test: frontmatter handles missing history gracefully (empty author/published)
mock_curl_no_history() {
    curl() {
        local json='{"title":"No History","body":{"export_view":{"value":"<p>content</p>"}}}'
        printf '%s\n%s' "$json" "200"
    }
    export -f curl
}
mock_pass_success
mock_curl_no_history
mock_html2markdown_success
ret=0; conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1 || ret=$?
assert_eq "Missing history does not cause failure" "0" "$ret"
file_content="$(cat "123 - No History.md" 2>/dev/null || true)"
assert_contains "Frontmatter still present without history" "---" "$file_content"
rm -f "123 - No History.md"

# Test: title with double quotes is escaped in frontmatter
mock_curl_quoted_title() {
    curl() {
        local json='{"title":"Page \"with\" quotes","body":{"export_view":{"value":"<p>ok</p>"}},"history":{"createdBy":{"displayName":"John Doe"},"createdDate":"2024-01-15T10:30:00.000Z"},"space":{"key":"TST"}}'
        printf '%s\n%s' "$json" "200"
    }
    export -f curl
}
mock_pass_success
mock_curl_quoted_title
mock_html2markdown_success
conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
file_content="$(cat "TST - Page with quotes.md" 2>/dev/null || true)"
assert_contains "Title with quotes is escaped in frontmatter" 'title: "Page \"with\" quotes"' "$file_content"
rm -f "TST - Page with quotes.md"

# --- .env loading with script-dir fallback tests ---

# Save state and create temp dirs
_saved_conflux_script_dir="$_CONFLUX_SCRIPT_DIR"
_test_script_dir="$(mktemp -d)"

# Restore default mocks
mock_pass_success
mock_curl_success
mock_html2markdown_success

# Test: falls back to script-dir .env when CWD .env absent
rm -f .env
printf '_CONFLUX_TEST_SOURCE=scriptdir\nCONFLUENCE_PASS_PATH="ORG/username"\n' > "$_test_script_dir/.env"
_CONFLUX_SCRIPT_DIR="$_test_script_dir"
unset _CONFLUX_TEST_SOURCE
conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
assert_eq "Falls back to script-dir .env when CWD .env absent" "scriptdir" "${_CONFLUX_TEST_SOURCE:-unset}"
rm -f "TST - Test Page.md"

# Test: CWD .env overrides script-dir .env
printf '_CONFLUX_TEST_SOURCE=cwd\nCONFLUENCE_PASS_PATH="ORG/username"\n' > .env
printf '_CONFLUX_TEST_SOURCE=scriptdir\nCONFLUENCE_PASS_PATH="ORG/username"\n' > "$_test_script_dir/.env"
_CONFLUX_SCRIPT_DIR="$_test_script_dir"
unset _CONFLUX_TEST_SOURCE
conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
assert_eq "CWD .env overrides script-dir .env" "cwd" "${_CONFLUX_TEST_SOURCE:-unset}"
rm -f "TST - Test Page.md"
rm -f .env

# Test: silent when neither .env exists
rm -f .env "$_test_script_dir/.env"
_CONFLUX_SCRIPT_DIR="$_test_script_dir"
export CONFLUENCE_PASS_PATH="ORG/username"
ret=0; conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1 || ret=$?
assert_eq "Silent when neither .env exists" "0" "$ret"
rm -f "TST - Test Page.md"

# Test: proxy normalization works with script-dir .env
rm -f .env
printf 'CONFLUENCE_PASS_PATH="ORG/username"\nNO_PROXY=".example.com"\n' > "$_test_script_dir/.env"
_CONFLUX_SCRIPT_DIR="$_test_script_dir"
unset NO_PROXY no_proxy 2>/dev/null || true
conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
assert_eq "Proxy normalization works with script-dir .env" ".example.com" "${no_proxy:-unset}"
rm -f "TST - Test Page.md"
unset NO_PROXY no_proxy 2>/dev/null || true

# Cleanup
rm -rf "$_test_script_dir"
_CONFLUX_SCRIPT_DIR="$_saved_conflux_script_dir"
export CONFLUENCE_PASS_PATH="ORG/username"

# --- Image download tests ---

# Restore default mocks
mock_pass_success

# Helper: mock html2markdown that outputs markdown with image refs
mock_html2markdown_with_images() {
    html2markdown() {
        echo '![diagram](https://wiki.example.com/download/attachments/123/diagram.png?version=1)'
        return 0
    }
    export -f html2markdown
}

# Helper: mock curl that handles both API call and image download
mock_curl_with_image_download() {
    curl() {
        local args=("$@")
        local url="${args[${#args[@]}-1]}"
        # API call returns page JSON
        if [[ "$url" == *"/rest/api/content/"* ]]; then
            local json='{"title":"Img Page","body":{"export_view":{"value":"<p><img src=\"https://wiki.example.com/download/attachments/123/diagram.png?version=1\" /></p>"}},"history":{"createdBy":{"displayName":"John Doe"},"createdDate":"2024-01-15T10:30:00.000Z"},"space":{"key":"TST"}}'
            printf '%s\n%s' "$json" "200"
        # Image download — check for -o flag and write fake image data
        elif [[ "$url" == *"/download/attachments/"* ]]; then
            local output_file=""
            local i=0
            for arg in "${args[@]}"; do
                if [[ "$arg" == "-o" ]]; then
                    output_file="${args[$((i+1))]}"
                    break
                fi
                ((i++))
            done
            if [[ -n "$output_file" ]]; then
                echo "FAKE_PNG_DATA" > "$output_file"
            fi
            return 0
        else
            return 22
        fi
    }
    export -f curl
}

# Test: successful image download rewrites URL to local path
mock_pass_success
mock_curl_with_image_download
mock_html2markdown_with_images
rm -rf attachments-123
output=$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1)
assert_eq "Image download outputs filename" "TST - Img Page.md" "$output"
file_content="$(cat "TST - Img Page.md" 2>/dev/null || true)"
assert_contains "Image URL rewritten to local path" "attachments-123/diagram.png" "$file_content"
# Verify the image file was created
assert_eq "Image file exists in attachments dir" "0" "$([[ -f "attachments-123/diagram.png" ]] && echo 0 || echo 1)"
img_content="$(cat "attachments-123/diagram.png" 2>/dev/null || true)"
assert_contains "Image file has content" "FAKE_PNG_DATA" "$img_content"
rm -f "TST - Img Page.md"
rm -rf attachments-123

# Test: query params stripped from filename
file_content="$(cat "TST - Img Page.md" 2>/dev/null || true)"
# Already tested above — the URL had ?version=1 and the saved file is diagram.png (no query params)

# Test: failed image download produces warning and placeholder
mock_curl_image_download_fail() {
    curl() {
        local args=("$@")
        local url="${args[${#args[@]}-1]}"
        if [[ "$url" == *"/rest/api/content/"* ]]; then
            local json='{"title":"Fail Img","body":{"export_view":{"value":"<p>img</p>"}},"history":{"createdBy":{"displayName":"John Doe"},"createdDate":"2024-01-15T10:30:00.000Z"},"space":{"key":"TST"}}'
            printf '%s\n%s' "$json" "200"
        elif [[ "$url" == *"/download/attachments/"* ]]; then
            return 22
        else
            return 22
        fi
    }
    export -f curl
}
mock_html2markdown_with_fail_images() {
    html2markdown() {
        echo '![my diagram](https://wiki.example.com/download/attachments/456/fail.png)'
        return 0
    }
    export -f html2markdown
}
mock_pass_success
mock_curl_image_download_fail
mock_html2markdown_with_fail_images
rm -rf attachments-456
stderr_output=""
stderr_output="$(conflux "https://wiki.example.com/pages/viewpage.action?pageId=456" 2>&1 1>/dev/null || true)"
assert_contains "Failed download warns to stderr" "Warning:" "$stderr_output"
file_content="$(cat "TST - Fail Img.md" 2>/dev/null || true)"
assert_contains "Failed download inserts unavailable placeholder" "![image unavailable]" "$file_content"
assert_contains "Failed download preserves original URL" "https://wiki.example.com/download/attachments/456/fail.png" "$file_content"
rm -f "TST - Fail Img.md"
rm -rf attachments-456

# Test: no images — no attachments directory created
mock_pass_success
mock_curl_success
mock_html2markdown_success
rm -rf attachments-100
conflux "https://wiki.example.com/pages/viewpage.action?pageId=100" >/dev/null 2>&1
assert_eq "No images: attachments dir not created" "1" "$([[ -d "attachments-100" ]] && echo 0 || echo 1)"
rm -f "TST - Test Page.md"

# Test: filename deduplication with -2/-3 suffix
mock_html2markdown_duplicate_images() {
    html2markdown() {
        printf '%s\n%s\n%s\n' \
            '![first](https://wiki.example.com/download/attachments/789/photo.png?v=1)' \
            '![second](https://wiki.example.com/download/attachments/789/photo.png?v=2)' \
            '![third](https://wiki.example.com/download/attachments/789/photo.png?v=3)'
        return 0
    }
    export -f html2markdown
}
mock_curl_dedup_download() {
    curl() {
        local args=("$@")
        local url="${args[${#args[@]}-1]}"
        if [[ "$url" == *"/rest/api/content/"* ]]; then
            local json='{"title":"Dedup Page","body":{"export_view":{"value":"<p>img</p>"}},"history":{"createdBy":{"displayName":"John Doe"},"createdDate":"2024-01-15T10:30:00.000Z"},"space":{"key":"TST"}}'
            printf '%s\n%s' "$json" "200"
        elif [[ "$url" == *"/download/attachments/"* ]]; then
            local output_file=""
            local i=0
            for arg in "${args[@]}"; do
                if [[ "$arg" == "-o" ]]; then
                    output_file="${args[$((i+1))]}"
                    break
                fi
                ((i++))
            done
            if [[ -n "$output_file" ]]; then
                echo "IMG" > "$output_file"
            fi
            return 0
        else
            return 22
        fi
    }
    export -f curl
}
mock_pass_success
mock_curl_dedup_download
mock_html2markdown_duplicate_images
rm -rf attachments-789
conflux "https://wiki.example.com/pages/viewpage.action?pageId=789" >/dev/null 2>&1
assert_eq "Dedup: first image has original name" "0" "$([[ -f "attachments-789/photo.png" ]] && echo 0 || echo 1)"
assert_eq "Dedup: second image has -2 suffix" "0" "$([[ -f "attachments-789/photo-2.png" ]] && echo 0 || echo 1)"
assert_eq "Dedup: third image has -3 suffix" "0" "$([[ -f "attachments-789/photo-3.png" ]] && echo 0 || echo 1)"
file_content="$(cat "TST - Dedup Page.md" 2>/dev/null || true)"
assert_contains "Dedup: markdown references photo.png" "attachments-789/photo.png" "$file_content"
assert_contains "Dedup: markdown references photo-2.png" "attachments-789/photo-2.png" "$file_content"
assert_contains "Dedup: markdown references photo-3.png" "attachments-789/photo-3.png" "$file_content"
rm -f "TST - Dedup Page.md"
rm -rf attachments-789

# Test: query params stripped from downloaded filename
mock_html2markdown_query_params() {
    html2markdown() {
        echo '![chart](https://wiki.example.com/download/attachments/321/chart.jpg?version=2&modificationDate=1234567890)'
        return 0
    }
    export -f html2markdown
}
mock_curl_query_download() {
    curl() {
        local args=("$@")
        local url="${args[${#args[@]}-1]}"
        if [[ "$url" == *"/rest/api/content/"* ]]; then
            local json='{"title":"Query Page","body":{"export_view":{"value":"<p>img</p>"}},"history":{"createdBy":{"displayName":"John Doe"},"createdDate":"2024-01-15T10:30:00.000Z"},"space":{"key":"TST"}}'
            printf '%s\n%s' "$json" "200"
        elif [[ "$url" == *"/download/attachments/"* ]]; then
            local output_file=""
            local i=0
            for arg in "${args[@]}"; do
                if [[ "$arg" == "-o" ]]; then
                    output_file="${args[$((i+1))]}"
                    break
                fi
                ((i++))
            done
            if [[ -n "$output_file" ]]; then
                echo "IMG" > "$output_file"
            fi
            return 0
        else
            return 22
        fi
    }
    export -f curl
}
mock_pass_success
mock_curl_query_download
mock_html2markdown_query_params
rm -rf attachments-321
conflux "https://wiki.example.com/pages/viewpage.action?pageId=321" >/dev/null 2>&1
assert_eq "Query params stripped: file saved as chart.jpg" "0" "$([[ -f "attachments-321/chart.jpg" ]] && echo 0 || echo 1)"
file_content="$(cat "TST - Query Page.md" 2>/dev/null || true)"
assert_contains "Query params stripped: markdown refs local path" "attachments-321/chart.jpg" "$file_content"
rm -f "TST - Query Page.md"
rm -rf attachments-321

# Test: non-attachment URLs and thumbnail URLs are skipped
mock_html2markdown_mixed_urls() {
    html2markdown() {
        printf '%s\n%s\n' \
            '![real](https://wiki.example.com/download/attachments/555/real.png)' \
            '![icon](https://wiki.example.com/images/icons/icon.png)'
        return 0
    }
    export -f html2markdown
}
mock_curl_mixed_download() {
    curl() {
        local args=("$@")
        local url="${args[${#args[@]}-1]}"
        if [[ "$url" == *"/rest/api/content/"* ]]; then
            local json='{"title":"Mixed Page","body":{"export_view":{"value":"<p>img</p>"}},"history":{"createdBy":{"displayName":"John Doe"},"createdDate":"2024-01-15T10:30:00.000Z"},"space":{"key":"TST"}}'
            printf '%s\n%s' "$json" "200"
        elif [[ "$url" == *"/download/attachments/"* ]]; then
            local output_file=""
            local i=0
            for arg in "${args[@]}"; do
                if [[ "$arg" == "-o" ]]; then
                    output_file="${args[$((i+1))]}"
                    break
                fi
                ((i++))
            done
            if [[ -n "$output_file" ]]; then
                echo "IMG" > "$output_file"
            fi
            return 0
        else
            return 22
        fi
    }
    export -f curl
}
mock_pass_success
mock_curl_mixed_download
mock_html2markdown_mixed_urls
rm -rf attachments-555
conflux "https://wiki.example.com/pages/viewpage.action?pageId=555" >/dev/null 2>&1
assert_eq "Mixed URLs: attachment image downloaded" "0" "$([[ -f "attachments-555/real.png" ]] && echo 0 || echo 1)"
file_content="$(cat "TST - Mixed Page.md" 2>/dev/null || true)"
assert_contains "Mixed URLs: attachment URL rewritten" "attachments-555/real.png" "$file_content"
assert_contains "Mixed URLs: non-attachment URL preserved" "https://wiki.example.com/images/icons/icon.png" "$file_content"
rm -f "TST - Mixed Page.md"
rm -rf attachments-555

# Test: URL-encoded filenames are decoded
mock_html2markdown_encoded_filename() {
    html2markdown() {
        echo '![doc](https://wiki.example.com/download/attachments/444/%D1%81%D1%85%D0%B5%D0%BC%D0%B0.png)'
        return 0
    }
    export -f html2markdown
}
mock_curl_encoded_download() {
    curl() {
        local args=("$@")
        local url="${args[${#args[@]}-1]}"
        if [[ "$url" == *"/rest/api/content/"* ]]; then
            local json='{"title":"Encoded Page","body":{"export_view":{"value":"<p>img</p>"}},"history":{"createdBy":{"displayName":"John Doe"},"createdDate":"2024-01-15T10:30:00.000Z"},"space":{"key":"TST"}}'
            printf '%s\n%s' "$json" "200"
        elif [[ "$url" == *"/download/attachments/"* ]]; then
            local output_file=""
            local i=0
            for arg in "${args[@]}"; do
                if [[ "$arg" == "-o" ]]; then
                    output_file="${args[$((i+1))]}"
                    break
                fi
                ((i++))
            done
            if [[ -n "$output_file" ]]; then
                echo "IMG" > "$output_file"
            fi
            return 0
        else
            return 22
        fi
    }
    export -f curl
}
mock_pass_success
mock_curl_encoded_download
mock_html2markdown_encoded_filename
rm -rf attachments-444
conflux "https://wiki.example.com/pages/viewpage.action?pageId=444" >/dev/null 2>&1
# схема.png is the URL-decoded form of %D1%81%D1%85%D0%B5%D0%BC%D0%B0.png
assert_eq "URL-encoded filename decoded" "0" "$([[ -f "attachments-444/схема.png" ]] && echo 0 || echo 1)"
rm -f "TST - Encoded Page.md"
rm -rf attachments-444

# Test: same credentials used for image download as page fetch
mock_html2markdown_with_images
mock_curl_check_auth() {
    curl() {
        local args=("$@")
        local url="${args[${#args[@]}-1]}"
        if [[ "$url" == *"/rest/api/content/"* ]]; then
            local json='{"title":"Auth Page","body":{"export_view":{"value":"<p>img</p>"}},"history":{"createdBy":{"displayName":"John Doe"},"createdDate":"2024-01-15T10:30:00.000Z"},"space":{"key":"TST"}}'
            printf '%s\n%s' "$json" "200"
        elif [[ "$url" == *"/download/attachments/"* ]]; then
            # Check that -u flag has correct credentials
            local auth=""
            local i=0
            for arg in "${args[@]}"; do
                if [[ "$arg" == "-u" ]]; then
                    auth="${args[$((i+1))]}"
                    break
                fi
                ((i++))
            done
            if [[ "$auth" == "username:s3cret" ]]; then
                local output_file=""
                i=0
                for arg in "${args[@]}"; do
                    if [[ "$arg" == "-o" ]]; then
                        output_file="${args[$((i+1))]}"
                        break
                    fi
                    ((i++))
                done
                if [[ -n "$output_file" ]]; then
                    echo "AUTH_OK" > "$output_file"
                fi
                return 0
            else
                return 22
            fi
        else
            return 22
        fi
    }
    export -f curl
}
mock_pass_success
mock_curl_check_auth
rm -rf attachments-123
conflux "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
assert_eq "Image download uses same credentials" "0" "$([[ -f "attachments-123/diagram.png" ]] && echo 0 || echo 1)"
auth_content="$(cat "attachments-123/diagram.png" 2>/dev/null || true)"
assert_contains "Image download authenticated correctly" "AUTH_OK" "$auth_content"
rm -f "TST - Auth Page.md"
rm -rf attachments-123

echo ""
echo "Results: $PASS passed, $FAIL failed"
[[ "$FAIL" -eq 0 ]] || exit 1

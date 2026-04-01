#!/usr/bin/env bash
# Tests for confluence-to-markdown function

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

source /workspace/confluence-to-markdown.sh

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
        local json='{"title":"Test Page","body":{"export_view":{"value":"<p>Hello</p>"}}}'
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
        local json='{"body":{"export_view":{"value":"<p>Hello</p>"}}}'
        printf '%s\n%s' "$json" "200"
    }
    export -f curl
}

# Mock curl to return JSON missing body
mock_curl_missing_body() {
    curl() {
        local json='{"title":"Test Page"}'
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

# --- URL parsing tests ---

# Test: no arguments -> exit 1
ret=0; confluence-to-markdown 2>/dev/null || ret=$?
assert_eq "No args returns non-zero exit code" "1" "$ret"
assert_contains "No args prints usage to stderr" "Usage:" "$(confluence-to-markdown 2>&1 || true)"

# Test: invalid URL -> exit 1
ret=0; confluence-to-markdown "not-a-url" 2>/dev/null || ret=$?
assert_eq "Invalid URL returns non-zero exit code" "1" "$ret"
assert_contains "Invalid URL prints error to stderr" "Error:" "$(confluence-to-markdown "not-a-url" 2>&1 || true)"

# Test: URL without pageId -> exit 1
ret=0; confluence-to-markdown "https://wiki.example.com/pages/viewpage.action" 2>/dev/null || ret=$?
assert_eq "URL without pageId returns non-zero exit code" "1" "$ret"

# --- Authentication via pass tests ---

# Test: pass success returns zero exit code
mock_pass_success
mock_curl_success
ret=0; confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=100" >/dev/null 2>&1 || ret=$?
assert_eq "pass success returns zero exit code" "0" "$ret"

# Test: pass failure returns non-zero and prints error to stderr
mock_pass_failure
ret=0; confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=100" 2>/dev/null || ret=$?
assert_eq "pass failure returns non-zero exit code" "1" "$ret"
assert_contains "pass failure prints error to stderr" "Error:" "$(confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=100" 2>&1 || true)"
assert_contains "pass failure mentions pass path" "ORG/username" "$(confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=100" 2>&1 || true)"

# Restore default mocks
mock_pass_success
mock_curl_success

# --- API fetch tests ---

# Test: successful fetch saves file and outputs filename
output=$(confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1)
assert_eq "Successful fetch outputs filename" "123 - Test Page.md" "$output"
assert_eq "Saved file exists" "0" "$([[ -f "123 - Test Page.md" ]] && echo 0 || echo 1)"
file_content="$(cat "123 - Test Page.md")"
assert_contains "Saved file contains title as h1" "# Test Page" "$file_content"
assert_contains "Saved file contains converted markdown" "Hello" "$file_content"
rm -f "123 - Test Page.md"

# Test: curl failure returns non-zero and prints error
mock_curl_http_error
ret=0; confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>/dev/null || ret=$?
assert_eq "curl HTTP error returns non-zero exit code" "1" "$ret"
assert_contains "curl HTTP error prints error to stderr" "Error:" "$(confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1 || true)"

# Test: invalid JSON returns non-zero and prints error
mock_curl_invalid_json
ret=0; confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>/dev/null || ret=$?
assert_eq "Invalid JSON returns non-zero exit code" "1" "$ret"
assert_contains "Invalid JSON prints error to stderr" "Error:" "$(confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1 || true)"

# Test: missing title in JSON returns non-zero
mock_curl_missing_title
ret=0; confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>/dev/null || ret=$?
assert_eq "Missing title returns non-zero exit code" "1" "$ret"
assert_contains "Missing title prints error to stderr" "Error:" "$(confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1 || true)"

# Test: missing body in JSON returns non-zero
mock_curl_missing_body
ret=0; confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>/dev/null || ret=$?
assert_eq "Missing body returns non-zero exit code" "1" "$ret"
assert_contains "Missing body prints error to stderr" "Error:" "$(confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1 || true)"

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
        for arg in "$@"; do
            [[ "$arg" == "--plugin-table" ]] && has_plugin_table=1
            [[ "$arg" == "--exclude-selector=br" ]] && has_exclude_br=1
        done
        if [[ $has_plugin_table -eq 1 && $has_exclude_br -eq 1 ]]; then
            echo "flags-ok"
        else
            echo "flags-missing: $*" >&2
            return 1
        fi
    }
    export -f html2markdown
}
mock_html2markdown_check_flags
output=$(confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1)
file_content="$(cat "123 - Test Page.md" 2>/dev/null || true)"
assert_contains "html2markdown called with --plugin-table and --exclude-selector=br" "flags-ok" "$file_content"
rm -f "123 - Test Page.md"

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
confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
file_content="$(cat "123 - Test Page.md" 2>/dev/null || true)"
assert_contains "html2markdown receives HTML body via stdin" "<p>Hello</p>" "$file_content"
rm -f "123 - Test Page.md"

# Test: image URLs are preserved (html2markdown passes them through)
mock_curl_with_image() {
    curl() {
        local json='{"title":"Image Page","body":{"export_view":{"value":"<p><img src=\"https://wiki.example.com/download/attachments/123/image.png\" /></p>"}}}'
        printf '%s\n%s' "$json" "200"
    }
    export -f curl
}
mock_curl_with_image
mock_html2markdown_echo_stdin
confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=123" >/dev/null 2>&1
file_content="$(cat "123 - Image Page.md" 2>/dev/null || true)"
assert_contains "Image URLs preserved as original Confluence URLs" "https://wiki.example.com/download/attachments/123/image.png" "$file_content"
rm -f "123 - Image Page.md"

# Restore default mocks
mock_pass_success
mock_curl_success
mock_html2markdown_success

# Test: html2markdown failure returns non-zero and prints error
mock_html2markdown_failure
ret=0; confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>/dev/null || ret=$?
assert_eq "html2markdown failure returns non-zero exit code" "1" "$ret"
assert_contains "html2markdown failure prints error to stderr" "Error:" "$(confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1 || true)"

# --- File saving and sanitization tests ---

# Restore default mocks
mock_pass_success
mock_html2markdown_success

# Test: special characters are removed from filename
mock_curl_special_title() {
    curl() {
        local json='{"title":"Test/Page: A?B*C\"D<E>F|G\\H","body":{"export_view":{"value":"<p>content</p>"}}}'
        printf '%s\n%s' "$json" "200"
    }
    export -f curl
}
mock_curl_special_title
output=$(confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=456" 2>&1)
assert_eq "Special chars removed from filename" "456 - TestPage ABCDEFGH.md" "$output"
assert_eq "Sanitized file exists" "0" "$([[ -f "456 - TestPage ABCDEFGH.md" ]] && echo 0 || echo 1)"
rm -f "456 - TestPage ABCDEFGH.md"

# Test: file contains title heading with original (unsanitized) title
mock_curl_special_title
confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=456" >/dev/null 2>&1
file_content="$(cat "456 - TestPage ABCDEFGH.md" 2>/dev/null || true)"
assert_contains "File heading uses original title" 'Test/Page: A?B*C"D<E>F|G\H' "$file_content"
rm -f "456 - TestPage ABCDEFGH.md"

# Test: filename uses pageId from URL
mock_pass_success
mock_curl_success
mock_html2markdown_success
output=$(confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=99999" 2>&1)
assert_eq "Filename uses correct pageId" "99999 - Test Page.md" "$output"
rm -f "99999 - Test Page.md"

# Test: output is the file path (stdout)
mock_pass_success
mock_curl_success
mock_html2markdown_success
output=$(confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=100" 2>&1)
assert_eq "Stdout is the file path" "100 - Test Page.md" "$output"
rm -f "100 - Test Page.md"

echo ""
echo "Results: $PASS passed, $FAIL failed"
[[ "$FAIL" -eq 0 ]] || exit 1

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

# Set up default mocks
mock_pass_success
mock_curl_success

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

# Test: successful fetch extracts title and HTML body
output=$(confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=123" 2>&1)
assert_contains "Successful fetch outputs title" "Test Page" "$output"
assert_contains "Successful fetch outputs HTML body" "<p>Hello</p>" "$output"

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

echo ""
echo "Results: $PASS passed, $FAIL failed"
[[ "$FAIL" -eq 0 ]] || exit 1

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

# Test: no arguments -> exit 1
output=$(confluence-to-markdown 2>&1 || true)
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

# Test: valid URL extracts host and pageId
output=$(confluence-to-markdown "https://wiki.example.com/pages/viewpage.action?pageId=12345" 2>&1)
assert_contains "Valid URL extracts host" "Host: wiki.example.com" "$output"
assert_contains "Valid URL extracts pageId" "Page ID: 12345" "$output"

# Test: valid URL with extra query params
output=$(confluence-to-markdown "https://confluence.corp.net/pages/viewpage.action?pageId=99&spaceKey=DEV" 2>&1)
assert_contains "URL with extra params extracts host" "Host: confluence.corp.net" "$output"
assert_contains "URL with extra params extracts pageId" "Page ID: 99" "$output"

# Test: URL with port
output=$(confluence-to-markdown "https://wiki.local:8443/pages/viewpage.action?pageId=42" 2>&1)
assert_contains "URL with port extracts host:port" "Host: wiki.local:8443" "$output"
assert_contains "URL with port extracts pageId" "Page ID: 42" "$output"

echo ""
echo "Results: $PASS passed, $FAIL failed"
[[ "$FAIL" -eq 0 ]] || exit 1

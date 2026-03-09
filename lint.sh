#!/usr/bin/env bash

set -euo pipefail

target="${1:-all}"

lint_ejs() {
  while IFS= read -r -d '' file; do
    echo "$file"
    npx --no-install ejslint "$file"
  done < <(find ./layout -type f -name '*.ejs' -print0)
}

lint_css() {
  while IFS= read -r -d '' file; do
    echo "$file"
    npx --no-install stylelint "$file"
  done < <(find ./source/css -type f -name '*.css' ! -name '*.min.css' ! -path './source/css/material-icons.css' -print0)
}

lint_js() {
  while IFS= read -r -d '' file; do
    echo "$file"
    npx --no-install eslint "$file"
  done < <(find ./scripts -type f -name '*.js' -print0)
}

case "$target" in
  ejs)
    lint_ejs
    ;;
  css)
    lint_css
    ;;
  js)
    lint_js
    ;;
  all)
    lint_ejs
    lint_css
    lint_js
    ;;
  *)
    echo "Usage: $0 [ejs|css|js|all]" >&2
    exit 1
    ;;
esac

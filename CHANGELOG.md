# Changelog

## Unreleased

### Compatibility

- Validate the theme against `Hexo 8.1.1` on `Node.js 24`.
- Fix RSS link rendering when `config.feed` is not defined in the site config.
- Confirm the theme can generate successfully in a real Hexo 8 test site.

### Tooling

- Replace the legacy lint stack with `ESLint 10`, `ejs-lint 2`, and `Stylelint 17`.
- Update lint scripts to work on modern Node versions without reinstalling dependencies on each run.
- Modernize the helper scripts used by Hexo so they pass the new lint rules on Node 24.

### Frontend Assets

- Upgrade the vendored `jQuery` bundle to `3.7.1`.
- Upgrade the vendored `jquery-lazyload` bundle to `1.9.7`.
- Upgrade the vendored `MathJax` bundle to `2.7.9`.
- Update the gallery script to use jQuery 3 compatible image load event bindings.

### CSS Fixes

- Fix malformed declarations in `source/css/style.css` and `source/css/duoshuo.css` that were surfaced by the new parser-based lint checks.

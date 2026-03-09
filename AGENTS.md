# Repository Guidelines

## Project Structure & Module Organization
This repository is a Hexo theme. Core templates live in `layout/`, with shared partials under `layout/_partial/` and feature widgets under `layout/_widget/`. Static assets are in `source/`: styles in `source/css/`, scripts in `source/js/`, images in `source/img/`, and fonts in `source/fonts/`. Theme configuration starts from `_config.template.yml`; copy it to `_config.yml` when testing the theme in a Hexo site. Translation strings live in `languages/`, and maintenance scripts live in `scripts/`.

## Build, Test, and Development Commands
Install dependencies with `npm install`.

- `npm run lint`: reinstalls dependencies and runs the repository lint pipeline.
- `bash lint.sh`: lints EJS, CSS, and JS files without reinstalling packages first.
- `npm test`: placeholder only; it currently exits with `"Error: no test specified"`.

For local theme validation, link or copy this repo into a Hexo site’s `themes/` directory, enable the theme in the site-level `_config.yml`, then run Hexo commands from the site repo such as `hexo clean && hexo g && hexo s`.

## Coding Style & Naming Conventions
Follow the existing style in each asset type. JavaScript uses ESLint with `airbnb-base` (`.eslintrc.json`), so prefer 2-space indentation, single quotes, and semicolons where the linter expects them. Keep EJS partials small and composable, and name new partials/widgets by feature, for example `layout/_widget/comment/<provider>/main.ejs`. Avoid editing generated or minified files (`*.min.js`, `*.min.css`) unless the source file is updated alongside them.

## Testing Guidelines
There is no automated unit-test suite in this repository. Treat linting plus manual Hexo rendering as the required validation path. Before opening a PR, run `bash lint.sh` and verify the affected pages in a local Hexo preview. For config-sensitive changes, test against `_config.template.yml` and any touched language file such as `languages/en.yml`.

## Commit & Pull Request Guidelines
Commits should follow the convention documented in `CONTRIBUTING.md`: `type(scope): subject`, for example `fix(sns): handle empty twitter link`. Use lowercase imperative subjects under 50 characters. Valid types include `feat`, `fix`, `docs`, `style`, `refactor`, `test`, and `chore`. Pull requests should explain the user-visible change, list any config or migration impact, link related issues, and include screenshots for layout or styling updates.

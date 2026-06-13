# freefsm.org

Source for the [FreeFSM](https://github.com/MartialM1nd/freefsm) project website.

## Quick Start

```bash
node build.js           # Build → dist/
npx serve dist/         # Preview at http://localhost:3000
```

Open `http://localhost:3000` in your browser.

## Project Structure

```
src/
├── layouts/            # Shared HTML shells (base.html, docs.html)
├── pages/              # Page content partials
│   └── docs/           # Documentation pages
└── assets/             # CSS, JS, images
build.js                # Zero-dependency build script
```

## Build

```bash
node build.js    # Outputs flat HTML to dist/
```

Edit files in `src/` then re-run `node build.js` to regenerate `dist/`. The `dist/` directory is gitignored — rebuild before deploying.

## Deploy

Serve `dist/` with any static server — Caddy, Nginx, GitHub Pages, Netlify, or Cloudflare Pages.

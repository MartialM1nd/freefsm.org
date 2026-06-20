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

### Nginx

1. Build the site and copy `dist/` to your server:

```bash
node build.js
rsync -avz dist/ user@vps:/opt/freefsm.org/dist/
```

2. Copy the Nginx config and enable it:

```bash
sudo cp deploy/freefsm.org.nginx.conf /etc/nginx/sites-available/freefsm.org
sudo ln -s /etc/nginx/sites-available/freefsm.org /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

3. Obtain an SSL certificate via Certbot:

```bash
sudo certbot --nginx -d freefsm.org -d www.freefsm.org
```

4. Certbot auto-reloads Nginx. The config handles `www.freefsm.org` → `freefsm.org` redirect, Gzip, cache headers, and security headers.

### Any static server

Serve `dist/` with Caddy, GitHub Pages, Netlify, or Cloudflare Pages.

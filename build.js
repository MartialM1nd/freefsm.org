const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

const DEFAULT_DESCRIPTION = 'Self-hosted, open-source field service management for FreeBSD and Linux. Single static Go binary, PostgreSQL backend, zero npm dependencies.';
const DOCS_DESCRIPTION = 'Documentation for installing, configuring, developing, deploying, and using FreeFSM.';

const PAGE_META = {
  'index.html': {
    title: 'FreeFSM — Free Field Service Manager',
    description: DEFAULT_DESCRIPTION,
    section: 'home',
  },
  'features.html': {
    title: 'Features — FreeFSM',
    description: 'A comprehensive field service management platform for self-hosted FreeBSD and Linux deployments.',
    bodyClass: 'features-page',
    section: 'features',
  },
};

function toUrlPath(...segments) {
  return segments.join('/').replaceAll(path.sep, '/');
}

function walkFiles(dir, baseDir = dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(file, baseDir));
    else files.push({ file, rel: path.relative(baseDir, file) });
  }

  return files;
}

function fingerprintAssets(srcDir, destDir) {
  const files = walkFiles(srcDir);
  const rawManifest = {};
  const finalContents = new Map();
  const finalManifest = {};

  for (const { file, rel } of files) {
    const buffer = fs.readFileSync(file);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 10);
    const ext = path.extname(rel);
    const dir = path.dirname(rel) === '.' ? '' : path.dirname(rel);
    const base = path.basename(rel, ext);
    const hashedRel = path.join(dir, `${base}.${hash}${ext}`);

    rawManifest[toUrlPath('/assets', rel)] = toUrlPath('/assets', hashedRel);
  }

  for (const { file, rel } of files) {
    const rawContent = fs.readFileSync(file);
    const finalContent = isTextAsset(rel)
      ? Buffer.from(replaceAssetRefs(rawContent.toString('utf-8'), rawManifest))
      : rawContent;
    const hash = crypto.createHash('sha256').update(finalContent).digest('hex').slice(0, 10);
    const ext = path.extname(rel);
    const dir = path.dirname(rel) === '.' ? '' : path.dirname(rel);
    const base = path.basename(rel, ext);
    const hashedRel = path.join(dir, `${base}.${hash}${ext}`);

    finalContents.set(rel, finalContent);
    finalManifest[toUrlPath('/assets', rel)] = toUrlPath('/assets', hashedRel);
  }

  for (const { rel } of files) {
    const outPath = path.join(destDir, finalManifest[toUrlPath('/assets', rel)].replace('/assets/', ''));
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    if (isTextAsset(rel)) {
      fs.writeFileSync(outPath, replaceAssetRefs(finalContents.get(rel).toString('utf-8'), finalManifest));
    } else {
      fs.writeFileSync(outPath, finalContents.get(rel));
    }
  }

  return finalManifest;
}

function isTextAsset(file) {
  return /\.(css|js|html|svg)$/.test(file);
}

function replaceAssetRefs(content, manifest) {
  return Object.entries(manifest)
    .sort((a, b) => b[0].length - a[0].length)
    .reduce((out, [from, to]) => out.split(from).join(to), content);
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function textFromFirstTag(content, tag) {
  const match = content.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match) return '';
  return match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function renderShell(layout, options) {
  const classAttr = value => value ? ` class="${escapeHtml(value)}"` : '';
  return layout
    .replaceAll('{{title}}', escapeHtml(options.title))
    .replaceAll('{{description}}', escapeHtml(options.description))
    .replaceAll('{{bodyClassAttr}}', classAttr(options.bodyClass))
    .replaceAll('{{homeActiveAttr}}', classAttr(options.section === 'home' ? 'active' : ''))
    .replaceAll('{{featuresActiveAttr}}', classAttr(options.section === 'features' ? 'active' : ''))
    .replaceAll('{{docsActiveAttr}}', classAttr(options.section === 'docs' ? 'active' : ''))
    .replaceAll('{{navToggleControls}}', escapeHtml(options.navToggleControls || 'site-nav'))
    .replaceAll('{{mainContent}}', options.mainContent);
}

function renderPage(layout, content, meta) {
  return renderShell(layout, {
    title: meta.title,
    description: meta.description,
    bodyClass: meta.bodyClass,
    section: meta.section,
    mainContent: `<main>\n${content}\n</main>`,
  });
}

function pageMetaFor(file, content) {
  if (PAGE_META[file]) return PAGE_META[file];

  const heading = textFromFirstTag(content, 'h1') || path.basename(file, '.html');
  return {
    title: `${heading} — FreeFSM`,
    description: DEFAULT_DESCRIPTION,
    section: '',
  };
}

function renderDocsPage(layout, content) {
  const heading = textFromFirstTag(content, 'h1') || 'Documentation';
  const title = heading === 'Documentation' ? 'Documentation — FreeFSM' : `${heading} — FreeFSM Docs`;

  return renderShell(layout, {
    title,
    description: DOCS_DESCRIPTION,
    bodyClass: 'docs-page',
    section: 'docs',
    navToggleControls: 'docs-sidebar',
    mainContent: `<div class="docs-layout container">
    <aside class="docs-sidebar" id="docs-sidebar">
      <nav class="docs-nav">
        <a href="/docs/" class="docs-nav-title">Documentation</a>
        <a href="/docs/getting-started.html">Getting Started</a>
        <a href="/docs/configuration.html">Configuration</a>
        <a href="/docs/user-guide.html">User Guide</a>
        <a href="/docs/deployment.html">Deployment</a>
        <a href="/docs/development.html">Development</a>
        <a href="/docs/architecture.html">Architecture</a>
        <a href="/docs/roadmap.html">Roadmap</a>
        <a href="/docs/api.html">API Reference</a>
      </nav>
    </aside>
    <main class="docs-content">
      ${content}
    </main>
  </div>`,
  });
}

function build() {
  console.log('Building freefsm.org...\n');

  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
  }

  const assetManifest = fingerprintAssets(path.join(SRC, 'assets'), path.join(DIST, 'assets'));

  const layout = fs.readFileSync(path.join(SRC, 'layouts', 'site.html'), 'utf-8');
  const pagesDir = path.join(SRC, 'pages');
  for (const file of fs.readdirSync(pagesDir)) {
    if (!file.endsWith('.html')) continue;
    const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
    const html = replaceAssetRefs(renderPage(layout, content, pageMetaFor(file, content)), assetManifest);
    const out = path.join(DIST, file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
    console.log(`  ${file}`);
  }

  const docsDir = path.join(SRC, 'pages', 'docs');
  const docsDist = path.join(DIST, 'docs');
  fs.mkdirSync(docsDist, { recursive: true });
  for (const file of fs.readdirSync(docsDir)) {
    if (!file.endsWith('.html')) continue;
    const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
    const html = replaceAssetRefs(renderDocsPage(layout, content), assetManifest);
    fs.writeFileSync(path.join(docsDist, file), html);
    console.log(`  docs/${file}`);
  }

  console.log('\nDone! Output in dist/');
}

build();

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function build() {
  console.log('Building freefsm.org...\n');

  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
  }

  copyDir(path.join(SRC, 'assets'), path.join(DIST, 'assets'));

  const baseLayout = fs.readFileSync(path.join(SRC, 'layouts', 'base.html'), 'utf-8');
  const pagesDir = path.join(SRC, 'pages');
  for (const file of fs.readdirSync(pagesDir)) {
    if (!file.endsWith('.html')) continue;
    const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
    const html = baseLayout.replace('{{content}}', content);
    const out = path.join(DIST, file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
    console.log(`  ${file}`);
  }

  const docsLayout = fs.readFileSync(path.join(SRC, 'layouts', 'docs.html'), 'utf-8');
  const docsDir = path.join(SRC, 'pages', 'docs');
  const docsDist = path.join(DIST, 'docs');
  fs.mkdirSync(docsDist, { recursive: true });
  for (const file of fs.readdirSync(docsDir)) {
    if (!file.endsWith('.html')) continue;
    const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
    const html = docsLayout.replace('{{content}}', content);
    fs.writeFileSync(path.join(docsDist, file), html);
    console.log(`  docs/${file}`);
  }

  console.log('\nDone! Output in dist/');
}

build();

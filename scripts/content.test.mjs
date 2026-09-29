import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve('dist');
async function filesIn(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory() ? filesIn(join(dir, entry.name)) : join(dir, entry.name),
      ),
    )
  ).flat();
}
const htmlFiles = (await filesIn(root)).filter((file) => file.endsWith('.html'));

test('all eight static pages build with one main heading and descriptive metadata', async () => {
  assert.equal(htmlFiles.length, 8);
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, file);
    assert.match(html, /<html lang="en"/, file);
    assert.match(html, /<meta name="description" content=".{40,}"/, file);
    assert.match(html, /<main id="main"/, file);
    assert.doesNotMatch(html, /\[Add metric|Lorem ipsum|TODO|\/Users\//i, file);
  }
});

test('internal links resolve to built pages or real section anchors', async () => {
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
      if (!href.startsWith('/') && !href.startsWith('#')) continue;
      const [pathname, hash] = href.split('#');
      const target = pathname
        ? join(root, pathname, pathname.endsWith('/') ? 'index.html' : '')
        : file;
      assert.ok((await stat(target)).isFile(), `${file}: ${href}`);
      if (hash)
        assert.ok(
          (await readFile(target, 'utf8')).includes(`id="${hash}"`),
          `${file}: missing ${href}`,
        );
    }
  }
});

test('confidential work is anonymized and public project attribution is present', async () => {
  const html = await readFile(join(root, 'index.html'), 'utf8');
  assert.match(html, /CONFIDENTIAL CLIENT/);
  assert.match(html, /Client identity and implementation details are kept private/);
  assert.match(html, /https:\/\/easygen.io\//);
  assert.match(html, /contributing across most of its features/);
  assert.doesNotMatch(html, /github\.com\/[^/]+\/[^/]+\/pull\/\d+/);
});

test('sharing metadata is available without JavaScript and points to a real preview image', async () => {
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    const meta = new Map(
      [...html.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)"/g)].map(
        ([, key, value]) => [key, value],
      ),
    );
    const canonical = new URL(meta.get('og:url'));
    const image = new URL(meta.get('og:image'));
    assert.equal(canonical.protocol, 'https:', file);
    assert.notEqual(canonical.hostname, 'localhost', file);
    assert.equal(image.origin, canonical.origin, file);
    assert.equal(meta.get('twitter:image'), image.href, file);
    assert.equal(meta.get('twitter:card'), 'summary_large_image', file);
    assert.ok(meta.get('og:title')?.includes('Saloni Saraiya'), file);
    assert.equal(meta.get('twitter:title'), meta.get('og:title'), file);
    assert.equal(meta.get('twitter:description'), meta.get('og:description'), file);
    const png = await readFile(join(root, image.pathname));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', file);
    assert.equal(png.readUInt32BE(16), Number(meta.get('og:image:width')), file);
    assert.equal(png.readUInt32BE(20), Number(meta.get('og:image:height')), file);
    assert.equal(png.readUInt32BE(16), 1200, file);
    assert.equal(png.readUInt32BE(20), 630, file);
  }
});

test('llms.txt is discoverable and its portfolio links resolve to built pages', async () => {
  const text = await readFile(join(root, 'llms.txt'), 'utf8');
  assert.match(text, /^# Saloni Saraiya\n\n> /);
  assert.match(text, /## Case studies/);
  assert.match(text, /client identity and implementation details are not public/);
  const home = await readFile(join(root, 'index.html'), 'utf8');
  const origin = new URL(home.match(/property="og:url" content="([^"]+)"/)[1]).origin;
  let portfolioLinks = 0;
  for (const [, href] of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const url = new URL(href);
    if (url.origin !== origin) continue;
    const target = join(root, url.pathname, url.pathname.endsWith('/') ? 'index.html' : '');
    assert.ok((await stat(target)).isFile(), href);
    portfolioLinks++;
  }
  assert.equal(portfolioLinks, 8);
  for (const file of htmlFiles) {
    assert.match(await readFile(file, 'utf8'), /rel="describedby"[^>]+href="\/llms.txt"/, file);
  }
});

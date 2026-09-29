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

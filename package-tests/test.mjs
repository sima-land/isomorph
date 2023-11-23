import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs/promises';

/** Тесты экспортов пакета. */
async function main() {
  const pkg = JSON.parse(await fs.readFile('../package.json', 'utf-8'));

  assert.equal(pkg.name, '@sima-land/isomorph');

  for (const pathname of Object.keys(pkg.exports)) {
    if (pathname.startsWith('./preset/bun')) {
      continue;
    }

    const specifier = path.join(pkg.name, pathname);

    await assert.doesNotReject(async () => await import(specifier));
  }
}

main();

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs/promises');

/** Тесты экспортов пакета. */
async function main() {
  const pkg = JSON.parse(await fs.readFile('../package.json', 'utf-8'));

  assert.equal(pkg.name, '@sima-land/isomorph');

  for (const pathname of Object.keys(pkg.exports)) {
    const specifier = path.join(pkg.name, pathname);

    assert.doesNotThrow(() => require(specifier));
  }
}

main();

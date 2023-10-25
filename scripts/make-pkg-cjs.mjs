/* eslint-disable no-console */
import fs from 'fs-extra';

fs.readFile('./package.json', 'utf-8')
  .then(JSON.parse)
  .then(({ name, version, dependencies, peerDependencies }) => ({
    type: 'commonjs',

    // ВАЖНО: копируем эти поля для того чтобы устранить warning'и ModuleFederationPlugin
    name,
    version,
    dependencies,
    peerDependencies,
  }))
  .then(data => fs.outputFile('dist/cjs/package.json', JSON.stringify(data, null, 2)))
  .then(() => console.log('[ui-quarks] CJS pkg emit done'));

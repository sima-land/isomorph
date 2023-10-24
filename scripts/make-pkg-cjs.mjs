/* eslint-disable no-console */
import fs from 'fs-extra';

fs.readFile('./package.json', 'utf-8')
  .then(JSON.parse)
  .then(({ name, version }) => ({ name, version, type: 'commonjs' }))
  .then(data => fs.outputFile('dist/cjs/package.json', JSON.stringify(data, null, 2)))
  .then(() => console.log('[ui-quarks] CJS pkg emit done'));

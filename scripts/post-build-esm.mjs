import fs from 'node:fs/promises';
import glob from 'fast-glob';

/**
 * Добавляет контент в начало файла.
 * @param {string} path Путь до файла.
 * @param {string} content Контент для добавления в начало.
 */
async function prependFile(path, content) {
  const data = await fs.readFile(path);
  const handle = await fs.open(path, 'w+');
  const insert = Buffer.from(content);

  await handle.write(insert, 0, insert.length, 0);
  await handle.write(data, 0, data.length, insert.length);
  await handle.close();
}

const react = `import * as React from 'react';\n`;

await glob('./dist/esm/**/*.js')
  .then(items =>
    Promise.all(
      items.map(item => fs.readFile(item, 'utf-8').then(content => ({ filename: item, content }))),
    ),
  )
  .then(files => files.filter(item => item.content.includes('React.createElement')))
  .then(files => Promise.all(files.map(file => prependFile(file.filename, react))));

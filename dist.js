/* eslint-disable require-jsdoc */
const copyfiles = require('copyfiles');

async function main () {
  const copy = (p, o = {}) => new Promise(r => copyfiles(p, o, r));

  // копируем остальные файлы из исходников т.к. tsc прогнал только скрипты
  await copy(['./src/**/*', 'build'], {
    up: 1,
    exclude: [
      './src/**/*.js',
      './src/**/*.jsx',
      './src/**/*.ts',
      './src/**/*.tsx',
      './src/**/__test__/**',
    ],
  });

  // копируем исходники (только для просмотра)
  await copy(['./src/**/*', './build'], {
    exclude: [
      './src/**/__test__/**',
    ],
  });

  // формируем пакет
  await copy(['package.json', 'build']);
  await copy(['README.md', 'build']);
}

main();

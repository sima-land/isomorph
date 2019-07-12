const { src, dest, series } = require('gulp');
const del = require('del');

/**
 * Clean fn.
 * @return {*} Test.
 */
const clean = () => del(['build']);

/**
 * Move fn.
 * @return {*} Test.
 */
const move = () => src([
  'package.json',
  'README.md',
  './src/**/*',
  '!./src/**/__test__/**',
  '!./src/**/*.test.js',
]).pipe(dest('build'));

const build = series(clean, move);

exports.build = build;
exports.default = build;

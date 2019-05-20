const { src, dest, series } = require('gulp');
const del = require('del');

/**
 * clean fn
 * @return {*} test
 */
const clean = () => del(['build']);

/**
 * move fn
 * @return {*} test
 */
const move = () => src(['./src/**/*', '!**/*.test.js']).pipe(dest('build'));

const build = series(clean, move);

exports.build = build;
exports.default = build;

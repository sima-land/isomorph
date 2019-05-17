const { src, dest, series } = require('gulp');
const del = require('del');

const clean = () => del(['build']);
const move = () => src(['./src/**/*', '!**/*.test.js']).pipe(dest('build'));

const build = series(clean, move);

exports.build = build;
exports.default = build;
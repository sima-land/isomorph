const { src, dest } = require('gulp');
const build = () => src('src/**/*').pipe(dest('build'));

exports.build = build;
exports.default = build;
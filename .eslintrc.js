module.exports = {
  plugins: [
    'jest',
  ],
  extends: require.resolve('@dev-dep/linters/eslint'),
  overrides: [{
    files: ['__mocks__/*.js'],
    env: {
      'jest/globals': true,
    },
  }],
};

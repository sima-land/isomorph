module.exports = {
  root: true,
  extends: require.resolve('@sima-land/linters/eslint'),
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        'jsdoc/check-tag-names': [
          'error',
          {
            definedTags: ['internal'],
          },
        ],
      },
    },
  ],
};

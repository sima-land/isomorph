module.exports = {
  root: true,
  extends: [require.resolve('@sima-land/linters/eslint'), 'plugin:react/jsx-runtime'],
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

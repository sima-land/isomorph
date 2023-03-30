module.exports = {
  root: true,
  extends: [require.resolve('@sima-land/linters/eslint'), 'plugin:react/jsx-runtime'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          { accessibility: 'no-public' },
        ],
      },
    },
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

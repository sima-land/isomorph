import simaland from '@sima-land/linters/eslint';

export default [
  ...simaland,

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

  {
    files: ['*.ts', '*.tsx'],
    rules: {
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'no-public',
        },
      ],
    },
  },
];

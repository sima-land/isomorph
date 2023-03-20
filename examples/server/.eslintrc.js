module.exports = {
  overrides: [
    {
      files: ['*.{js,jsx,ts,tsx}'],
      rules: {
        'require-jsdoc': 'off',
        'jsdoc/require-jsdoc': 'off',
      },
    },

    // allow use only typed-redux-saga/macro
    {
      files: ['./**/*.{ts,tsx}'],
      rules: {
        '@jambit/typed-redux-saga/use-typed-effects': ['error', 'macro'],
        '@jambit/typed-redux-saga/delegate-effects': 'error',
      },
    },
  ],
};

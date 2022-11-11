module.exports = {
  extends: ['plugin:react/jsx-runtime'],
  overrides: [
    {
      files: ['*.{js,jsx,ts,tsx}'],
      rules: {
        'require-jsdoc': 'off',
        'jsdoc/require-jsdoc': 'off',
      },
    },
  ],
};

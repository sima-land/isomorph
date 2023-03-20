module.exports = {
  presets: [
    // presets
    '@babel/preset-env',
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [
    // plugins
    'babel-plugin-macros',
  ],
};

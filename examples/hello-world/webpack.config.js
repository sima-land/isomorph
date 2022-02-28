const path = require('path');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = {
  name: 'server',
  mode: 'development',
  target: 'node',
  devtool: 'source-map',
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './build/'),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
        },
      },
    ],
  },
  plugins: [
    new NodemonPlugin(),
  ],
};

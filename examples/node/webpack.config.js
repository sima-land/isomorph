const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const { EnvPlugin } = require('@sima-land/isomorph/utils/webpack');

module.exports = {
  mode: 'development',
  target: 'node',
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                localIdentName: '[name]__[local]--[hash:hex:3]',
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new EnvPlugin(),
    new NodemonPlugin({
      script: './dist/index.js',
      exec: 'node --inspect',
      watch: path.resolve('./dist'),
    }),
    new MiniCssExtractPlugin({
      filename: 'static/index.css',
    }),
  ],
};

const path = require('path');
const dotenv = require('dotenv');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { EnvPlugin } = require('@sima-land/isomorph/utils/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

dotenv.config({ path: './.env.development' });

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  target: 'web',
  entry: './src/index.tsx',
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
        use: {
          loader: 'swc-loader',
        },
      },
      {
        test: /\.css$/,
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
    new EnvPlugin({
      additional: ['APP_NAME', 'APP_VERSION', 'SENTRY_RELEASE'],
    }),
    new MiniCssExtractPlugin({
      filename: 'index.css',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.ejs'),
      templateParameters: {
        options: {
          rootElementId: process.env.APP_NAME,
        },
      },
    }),
  ],
  devServer: {
    host: '0.0.0.0',
    compress: true,
    allowedHosts: ['.sima-land.ru'],
    proxy: [
      {
        context: ['/api/v3', '/api/v4', '/api/v6', '/iapi', '/sapi'],
        target: 'https://testben.sima-land.ru',
        secure: false,
        changeOrigin: true,
      },
    ],
  },
};

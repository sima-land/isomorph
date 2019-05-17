const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const Dotenv = require('dotenv-webpack');
require('dotenv').config();

const buildVersion = process.env.CI_COMMIT_REF_NAME || 'development';

module.exports = {
	name: 'server',
	mode: 'development',
	target: 'node',
	devtool: 'source-map',
	externals: nodeExternals(),
	entry: ['./src/index.js'],
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, './build/'),
	},
	resolve: {
		extensions: ['.js', '.json', '.jsx', '.css'],
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.css$/,
				include: /(Sprite)/,
				use: [
					'isomorphic-style-loader',
					{
						loader: 'css-loader'
					}
				]
			},
			{
				test: /\.css$/,
				exclude: /(Sprite)/,
				use: [
					'isomorphic-style-loader',
					{
						loader: 'css-loader',
						options: {
							modules: true,
							importLoaders: 1,
							localIdentName: '[name]__[local]'
						}
					},
					{
						loader: 'postcss-loader'
					}
				]
			},
			{
				test: /\.(png|jpg|jpeg|gif)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 8192,
							fallback: 'file-loader',
							name: `/page-header/${buildVersion}/images/[name].[ext]`,
							emitFile: false
						}
					}
				]
			},
			{
				test: /\.(eot|ttf|woff|woff2)$/,
				use: [
					{
						loader: 'ignore-loader'
					}
				]
			}
		]
	},
	plugins: [
		new Dotenv({
			systemvars: true
		}),
		new webpack.DefinePlugin({
			BUILD_VERSION: JSON.stringify(buildVersion),
		}),
	],
};

const path = require('path');
const nodeExternals = require('webpack-node-externals');

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
		extensions: ['.js', '.json', '.jsx'],
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			}
		]
	}
};

module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				targets: [
					'maintained node versions'
				],
				useBuiltIns: 'usage',
			}
		],
		'@babel/preset-react',
	],
	plugins: [
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-proposal-object-rest-spread',
		'lodash',
	]
};
module.exports = {
	presets: [
		['@babel/preset-env', { targets: { node: 'current' } }],
		'@babel/preset-typescript',
	],
	plugins: [
		[
			'module-resolver',
			{
				alias: {
					'~types': '../app/src/@types',
					'@project': '../..',
					'@admin': './src',
					'@controllers': '../app/src/App/Controllers',
					'@middlewares': '../app/src/App/Middlewares',
					'@models': '../app/src/App/Models',
					'@utils': '../app/src/Utils',
					'@functions': '../app/src/Functions',
					'@config': '../app/src/Config',
					'@services': '../app/src/Services',
					'@jobs': '../app/src/Jobs',
					'@errors': '../app/src/Errors',
				},
			},
		],
		'babel-plugin-transform-typescript-metadata',
		['@babel/plugin-proposal-decorators', { legacy: true }],
		['@babel/plugin-proposal-class-properties', { loose: true }],
	],
};

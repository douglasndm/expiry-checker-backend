module.exports = {
    presets: [
        ['@babel/preset-env', { targets: { node: 'current' }}],
        '@babel/preset-typescript'
    ],
    plugins: [
        ['module-resolver', {
            alias: {
                "@controllers": "./src/App/Controllers",
                "@models": "./src/App/Models",
                "@utils": "./src/Functions",
                "@config": "./src/Config"
            }
        }],
        "babel-plugin-transform-typescript-metadata",
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": true }]
    ],
}

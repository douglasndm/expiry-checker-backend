module.exports = {
    presets: [
        ["@babel/preset-env", { targets: { node: "current" }}],
        "@babel/preset-typescript"
    ],
    plugins: [
        ["module-resolver", {
            alias: {
                "~types": "./src/@types",
                "@controllers": "./src/App/Controllers",
                "@middlewares": "./src/App/Middlewares",
                "@models": "./src/App/Models",
                "@utils": "./src/Utils",
                "@functions": "./src/Functions",
                "@config": "./src/Config",
                "@services": "./src/Services",
                "@jobs": "./src/Jobs",
                "@errors": "./src/Errors"
            }
        }],
        "babel-plugin-transform-typescript-metadata",
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": true }]
    ],
}

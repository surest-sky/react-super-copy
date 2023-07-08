var webpack = require('webpack'),
    path = require('path'),
    fileSystem = require('fs-extra'),
    env = require('./utils/env'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    TerserPlugin = require('terser-webpack-plugin')
var { CleanWebpackPlugin } = require('clean-webpack-plugin')

const ASSET_PATH = process.env.ASSET_PATH || '/'

var alias = {
    'react-dom': '@hot-loader/react-dom',
}

// load the secrets
var secretsPath = path.join(__dirname, 'secrets.' + env.NODE_ENV + '.js')
const logoPngPath = process.env.EXTENSION_MODE === 'production' ? 'logo.png' : 'logo.png'
const logoPngActivePath = process.env.EXTENSION_MODE === 'production' ? 'logo_active.png' : 'logo_active.png'
var fileExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'eot',
    'otf',
    'svg',
    'ttf',
    'woff',
    'woff2',
]

if (fileSystem.existsSync(secretsPath)) {
    alias['secrets'] = secretsPath
}

const pluginEnvs = {
    EXTENSION_MODE: process.env.EXTENSION_MODE,
    EXTENSION_BASE_API: process.env.EXTENSION_BASE_API,
    EXTENSION_PAGE: process.env.EXTENSION_PAGE,
}

var options = {
    mode: pluginEnvs.EXTENSION_MODE || 'development',
    entry: {
        // newtab: path.join(__dirname, 'src', 'pages', 'Newtab', 'index.jsx'),
        options: path.join(__dirname, 'src', 'pages', 'Options', 'index.jsx'),
        popup: path.join(__dirname, 'src', 'pages', 'Popup', 'index.jsx'),
        background: path.join(__dirname, 'src', 'pages', 'Background',
            'index.js'),
        contentScript: path.join(__dirname, 'src', 'pages', 'Content',
            'index.js'),
        // devtools: path.join(__dirname, 'src', 'pages', 'Devtools', 'index.js'),
        // panel: path.join(__dirname, 'src', 'pages', 'Panel', 'index.jsx'),
        // web: path.join(__dirname, 'src', 'pages', 'Web', 'index.jsx'),
    },
    chromeExtensionBoilerplate: {
        notHotReload: ['background', 'contentScript', 'devtools'],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'build'),
        clean: true,
        publicPath: ASSET_PATH,
    },
    module: {
        rules: [
            {
                test: /\.(css)$/,
                // in the `src` directory
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'postcss-loader',
                    },
                ],
            },
            {
                test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
                type: 'asset/resource',
                exclude: /node_modules/,
                // loader: 'file-loader',
                // options: {
                //   name: '[name].[ext]',
                // },
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(ts|tsx)$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(js|jsx)$/,
                use: [
                    {
                        loader: 'source-map-loader',
                    },
                    {
                        loader: 'babel-loader',
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        alias: alias,
        extensions: fileExtensions.map((extension) => '.' + extension).
            concat(['.js', '.jsx', '.ts', '.tsx', '.css', '.scss']),
    },
    plugins: [
        new CleanWebpackPlugin({ verbose: false }),
        new webpack.ProgressPlugin(),
        // expose and write the allowed env vars on the compiled bundle
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(pluginEnvs),
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/manifest.json',
                    to: path.join(__dirname, 'build'),
                    force: true,
                    transform: function (content, path) {
                        const _content = JSON.parse(content.toString());
                        const action = Object.assign({}, _content.action)
                        return Buffer.from(
                            JSON.stringify({
                                ..._content,
                                name: process.env.EXTENSION_NAME,
                                description: process.env.npm_package_description,
                                version: process.env.EXTENSION_VERSION ||
                                    process.env.npm_package_version,
                                action: action,
                            }),
                        )
                    },
                },
            ],
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/pages/Content/content.styles.css',
                    to: path.join(__dirname, 'build'),
                    force: true,
                },
            ],
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: `src/assets/icons`,
                    to: path.join(__dirname, 'build'),
                    force: true,
                }
            ],
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'pages', 'Options',
                'index.html'),
            filename: 'options.html',
            chunks: ['options'],
            cache: false,
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'pages', 'Popup',
                'index.html'),
            filename: 'popup.html',
            chunks: ['popup'],
            cache: false,
        }),
    ],
    infrastructureLogging: {
        level: 'info',
    },
}

if (env.NODE_ENV === 'development') {
    options.devtool = 'cheap-module-source-map'
} else {
    options.optimization = {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    }
}

module.exports = options

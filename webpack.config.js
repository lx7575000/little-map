const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const safeParser = require('postcss-safe-parser')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const pkg = require('./package.json')

let commonPlugins = []
const pkgName = pkg.name.split('/')[1]
const __DEV__ = process.env.NODE_ENV === 'development'

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    demo: './demo/index.js',
    index: './src/index.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/dist/',
    library: pkgName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    pathinfo: false,
  },
  devServer: {
    contentBase: [path.join(__dirname, '/demo'), path.join(__dirname, 'node_modules')],
    compress: true,
    inline: true,
    hot: true,
    port: 1234,
    host: '127.0.0.1',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessorOptions: {
          parser: safeParser,
          discardComments: {
            removeAll: true,
          },
        },
      }),
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader?cacheDirectory'],
        exclude: /node_modules/,
      },
      {
        test: /\.styl$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'stylus-loader',
        ],
        include: [path.resolve(__dirname, 'src')],
        exclude: /node_modules/,
      },
      {
        test: /\.(le|c)ss$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'less-loader',
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg)$/,
        use: [{
          loader: 'url-loader',
          query: {
            name: '[name].[hash:8].[ext]',
            limit: 1024 * 10,
          },
        }],
      },
    ],
  },
  plugins: [],
  externals: {
    antd: {
      root: 'antd',
      commonjs: 'antd',
      commonjs2: 'antd',
      amd: 'antd',
    },
    mobx: {
      root: 'mobx',
      commonjs: 'mobx',
      commonjs2: 'mobx',
      amd: 'mobx',
    },
    lodash: {
      root: '_',
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
    },
    react: {
      root: 'React',
      var: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom',
    },
    'mobx-react': {
      root: 'mobxReact',
      commonjs2: 'mobx-react',
      commonjs: 'mobx-react',
      amd: 'mobx-react',
    },
    moment: {
      root: 'moment',
      commonjs2: 'moment',
      commonjs: 'moment',
      amd: 'moment',
    },
  },
}

if (__DEV__) {
  commonPlugins = [
    new webpack.HotModuleReplacementPlugin(),
  ]
  module.exports.devtool = 'eval-cheap-module-source-map'
} else {
  commonPlugins = [
    new CleanWebpackPlugin([path.join(__dirname, 'dist')]),
  ]
}

module.exports.plugins = module.exports.plugins.concat(commonPlugins)

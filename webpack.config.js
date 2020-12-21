const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const APP_PATH = path.resolve(__dirname, 'src')

module.exports = {
  entry: APP_PATH,

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].js',
    publicPath: '/'
  },
  devtool: 'source-map',

  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      components: path.resolve(__dirname, './src/components/'),
      src: path.resolve(__dirname, './src/'),
      'react-dom': '@hot-loader/react-dom'
    }
  },

  module: {
    rules: [
      {
        test: /\.(js)x?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          cacheDirectory: true
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(APP_PATH, 'index.html')
    })
  ]
}

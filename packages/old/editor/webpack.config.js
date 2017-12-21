const path = require('path');
// const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: './src/test.ts',
  output: {
    filename: 'test.js',
    path: path.resolve(__dirname, 'lib')
  },
  devtool: 'inline-source-map',
  resolve: {
    extensions: [ ".tsx", ".ts", ".js" ]
  },
  module: {
    rules: [
      { test: /\.css$/,  use: ['style-loader', 'css-loader' ] },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
      // new CleanWebpackPlugin('dist')
  ]
};

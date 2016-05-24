var path = require('path');

module.exports = {
  entry: path.resolve(__dirname, "src", "js", "app.ts"),
  output: {
    path: path.resolve(__dirname, "build", "js"),
    publicPath: "/js/",
    filename: "app.js"
  },
  externals: {
    'browserfs': 'BrowserFS',
    'doppiojvm': 'Doppio'
  },
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  debug: true,
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.resolve(__dirname, "build"),
    publicPath: "/js/"
  },
  node: {
    console: false,
    global: true,
    process: false,
    Buffer: false,
    __filename: "mock",
    __dirname: "mock",
    setImmediate: false
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        exclude: /(node_modules)/,
        loader: 'ts-loader'
      }
    ]
  }
};

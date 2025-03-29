const path = require("path")
// const Dotenv = require("dotenv-webpack")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const webpack = require("webpack")
require("dotenv").config()

module.exports = {
  entry: "./src/main.js",
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "build"),
    chunkFilename: "[name].[contenthash].chunk.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/[name][ext]",
        },
      },
      {
        test: /\.wasm$/,
        type: "asset/resource",
      },
    ],
  },
  optimization: {
    minimize: false,
    moduleIds: "deterministic",
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
      publicPath: "/",
      watch: true,
    },
    client: {
      logging: "none",
      overlay: true,
      progress: false,
    },
    server: {
      type: "https",
    },
    compress: true,
    port: 9000,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Access-Control-Allow-Origin": "*",
    },
    onListening: function (devServer) {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined")
      }

      const addr = devServer.server.address()
      const localUrl = `https://localhost:${addr.port}`
      const networkUrl = `https://${getLocalIP()}:${addr.port}`

      console.clear()
      console.log("\n🚀 Server started successfully!\n")
      console.log("You can view the app at:")
      console.log("\n   Local:  \x1b[36m%s\x1b[0m", localUrl)
      console.log("   Network (view on phone):\x1b[36m%s\x1b[0m\n", networkUrl)
    },
    devMiddleware: {
      stats: "minimal",
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined")
      }

      devServer.app.get("*", (_, __, next) => next())

      return middlewares
    },
  },
  plugins: [
    // new Dotenv(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./src/assets",
          to: "assets",
        },
        {
          from: "./public/ffmpeg",
          to: "ffmpeg",
        },
      ],
    }),
    new webpack.DefinePlugin({
      "process.env.API_TOKEN": JSON.stringify(process.env.API_TOKEN),
      "process.env.LENS_ID": JSON.stringify(process.env.LENS_ID),
      "process.env.GROUP_ID": JSON.stringify(process.env.GROUP_ID),
    }),
  ],
}

function getLocalIP() {
  const { networkInterfaces } = require("os")
  const nets = networkInterfaces()

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address
      }
    }
  }
  return "localhost"
}

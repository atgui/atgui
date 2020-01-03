const path = require('path')
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname, '..'),
  entry: "./src/Main.ts",  // 入口文件
  output: {
    path: path.resolve(__dirname, '..', 'bin', 'js'), // __dirname 是指webpack.config.js的绝对路径  dist 是指出口的目录
    filename: '[name]_'+getVersion()+'.js', // 打包输出的文件夹的文件名
    publicPath: './js/',// 打包后的文件夹 __dirname + '/dist/'
    chunkFilename: '[name]_'+getVersion()+'.js' // 代码拆分后的文件名
  },
  module: {
    rules: [
      {
        test: /\.js$/, // 使用正则来匹配js文件
        exclude: /node_modules/, // 排除依赖包文件
        use: {
          loader: 'babel-loader' //使用babel-loader
        }
      },
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(), // 热部署模块
  ],
  resolve: {//加这句才行...
    extensions: [".ts", ".js"]
  },
  optimization: {
    splitChunks: {//提取公共部分代码
      cacheGroups: {
        common: {
          name: 'Acommon', //分离出的公共模块的名字，如果没写就默认是上一层的名字
          chunks: 'all', //在哪些js范围内寻找公共模块，可以是src下的文件里，也可以是node_modules中的js文件
          minSize: 30, //抽离出的包的最小体积，默认30kb
          minChunks: 2,//当前公共模块出现的最少次数，
        },
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/, //在node_modules范围内进行匹配
          priority: 10, //优先级，先抽离公共的第三方库，再抽离业务代码，值越大优先级越高
          chunks: 'all'
        }
      }
    }
  },

}

function getVersion(){
  return "1.2.3";
}
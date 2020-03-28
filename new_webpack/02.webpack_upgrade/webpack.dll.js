/**
 * DLL 对某些第三方库(jquery,vue,react...)进行单独打包
 * 当运行 webpack 时，默认查找 webpack.config.js 配置文件
 * 运行 webpack.dll.js 文件  -->>> webpack --config webpack.dll.js
 */
const { resolve } = require("path");
const webpack = require("webpack");

module.exports = {
    entry: {
        jquery: ["jquery", /**jquery 的其他库可以写在这里,打包成一个文件 */ ],
    },
    output: {
        filename: '[name].dll.js',
        path: resolve(__dirname, "dll"),
        library: '[name]_[hash]', //打包库里面向外暴露出去的内容叫什么名字
    },
    plugins: [
        new webpack.DllPlugin({
            name: '[name]_[hash]', //映射库的暴露内容名称
            path: resolve(__dirname, "dll/[name].manifest.json"), //输出文件路径
        })
    ],
    mode: "production", //devlopment
}
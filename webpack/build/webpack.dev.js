const config=require("./webpack.config")
// const path=require("path")
var merge = require('webpack-merge');

module.exports = merge(config,{
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        contentBase: './dist',//path.join(__dirname, 'dist'),//将使用当前工作目录作为提供内容的目录
        compress: true,//一切服务都启用 gzip 压缩：
        port: 1234, // 本地服务器端口号
        host:'0.0.0.0',//默认是 localhost。如果你希望服务器外部可访问，指定如下
        hot: true, // 热重载 必须有 webpack.HotModuleReplacementPlugin
        // inline: false,//推荐使用 模块热替换 的内联模式，因为它包含来自 websocket 的 HMR 触发器。
        // lazy: true,//只有在请求时才编译包(bundle)
        noInfo: false,//告诉 dev-server 隐藏 webpack bundle 信息之类的消息        
        // overlay: true, // 如果代码出错，会在浏览器页面弹出“浮动层”。类似于 vue-cli 等脚手架
        // allowedHosts: ['host.com'],//此选项允许你添加白名单服务，允许一些开发服务器访问
        // after: function (app, server) {
        //     // 做些有趣的事
        // },
        // headers: {//在所有响应中添加首部内容
        //     'X-Custom-Foo': 'bar'
        // },
        writeToDisk: true,
        disableHostCheck: true,
    }
}
)
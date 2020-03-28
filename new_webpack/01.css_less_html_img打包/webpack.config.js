const { resolve } = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); //引入清除文件插件
//单独提取css插件
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");


//设置 nodejs 环境变量 为开发环境  production:生产环境
process.env.NODE_ENV = "development";

//压缩 css optimize-css-assets-webpack-plugin 插件


//css loader 复用
const commonCss = [
    //创建 style 标签
    // 'style-loader',
    //替代 style-loader,提取 js 中的css 为单独文件
    process.env.NODE_ENV == "production" ? MiniCssExtractPlugin.loader : "style-loader",
    //将 css 整合到 打包的 js 文件中
    'css-loader',
    //默认配置
    // 'postcss-loader',
    //如果要修改配置
    //帮 postcss 找到package.json 中browserslist里面的配置,通过配置加载指定的css 兼容样式
    { //默认为 生产环境,设置 NODEJS 环境变量 process.env.NODE_ENV = "development"
        loader: "postcss-loader",
        options: {
            ident: 'postcss',
            plugins: () => [
                require('postcss-preset-env')(),
            ]
        }
    }
];

module.exports = {
    entry: "./src/js/index.js",
    output: {
        filename: "js/[hash].js",
        path: resolve(__dirname, "build")
    },
    module: {
        rules: [ //打包css 样式
            { //下载 style-loader   css-loader 包
                test: /\.css$/,
                use: [...commonCss]
            },
            { //打包less 样式
                test: /\.less$/,
                use: [...commonCss, 'less-loader']
            },
            { //处理图片资源,处理不了 html 中的img 图片
                test: /\.(jpg|png|gif)/,
                //只使用一个 Loader,多个可以用 use
                loader: "url-loader",
                options: {
                    //图片大小小于 8K 就会被 base64来处理
                    //优点:减少请求数量(减轻服务器压力)
                    //缺点:图片体积会更大(文件请求速度更慢些)
                    limit: 8 * 1024,
                    // url-loader 默认是使用es6模块解析,而html-lader 引入图片是commonjs
                    //解析时会出问题:图片处会是 [object Module]
                    //解决:关闭 url-loader 的es6模块解析,使用 commonjs 解析
                    esModule: false,
                    name: "[hash:10].[ext]",
                    outputPath: "imgs"
                }
            },
            {
                //处理 html 中的img图片,负责引入 img 从而能被 url-loader 处理
                test: /\.html$/,
                loader: "html-loader"
            },
            //打包其他资源 font...
            {
                //排除 css js html 的其他资源,配置一个静态资源目录,不然有些静态资源(图片)不在同一起会报错
                exclude: /\.(css|js|html|png|jpg|gif|less|)$/,
                // test: /\.(eot|ttf|woff|svg)$/,
                loader: "file-loader",
                options: {
                    name: "[hash:10].[ext]",
                    //配置输出目录
                    outputPath: "media"
                }
            },
            /*
            //js 语法检查 eslint-loader  eslint  
            //注意: 只检查自己写的原代码,第三方的库不用检查,要排除
            //设置检查规则：
            //package.json 中 eslintConfig中设置
            // "eslintConfig": {
            //     "extends": "airbnb-base"
            // }
            //airbnb --> eslint-config-airbnb-base eslint eslint-plugin-import
            */

            /**
             * 正常情况下 一个文件只能被一个 loader 处理
             * 当一个文件被多个loader 处理时,要设置优先级,
             * 如下面的 js 文件被 eslint-loader / babel-loader 两个loader 处理
             * 是要先 进行语法检查然后才进行语法的转换,所以 eslint 要先执行
             * enforce:"pre" 设置优先执行
             */
            {
                test: /\.js$/,
                loader: "eslint-loader",
                exclude: /node_modules/,
                //优先执行
                enforce: 'pre',
                options: {
                    //自动修复 eslint 的格式报错,如js 文件中没有写空格(格式化)
                    fix: true
                }
            },
            /*
                js 兼容性处理:babel-loader @babel/core @babel/preset-env
                    1.进行语法转换,如 es6 转成 es5 js代码,使其兼容 ie ... 
                    @babel/preset-env：只能转换基本语法,promise 不能转换。 
                    2.全部的 js 兼容性处理 : @babel/polyfill 
                        在js 中引入即可：import '@babel/polyfill'
                    3.需要做兼容性处理的才做:按需加载 -> core-js,使用这种 第2 种就不能用了
            */
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                //按需加载
                                useBuiltIns: 'usage',
                                corejs: { //指定core-js 版本
                                    version: 3
                                },
                                targets: {
                                    chrome: '60',
                                    ie: '9',
                                    firefox: "60",
                                    edge: "17",
                                }
                            }
                        ]
                    ]
                }
            }
        ]
    },
    plugins: [
        //默认会创建一个空的 HTML 文件和打包的css/js 资源,template:配置模板
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            minify: { //html 压缩
                //把生成的 index.html 文件的内容的没用空格去掉，减少空间
                collapseWhitespace: true,
                //移除注释
                removeComments: true,
            },
            hash: true, //为了更好的 cache，可以在文件名后加个 hash。
        }),
        new CleanWebpackPlugin(), //实例化，参数为目录
        new webpack.ProgressPlugin(), //打包进度
        //提取css 文件
        new MiniCssExtractPlugin({
            filename: "css/[hash:10].css"
        }),
        //压缩 css
        new OptimizeCssAssetsWebpackPlugin(),
    ],
    //js 压缩:改为 production 生产环境会自动压缩js代码
    mode: "development",
    //开发服务器 devServer:用来自动化(自动编译,自动打开浏览器,自动刷新浏览器~~~)
    //只会在内存中编译打包,不会有任何输出
    //webpack-dev-server   启动:npx webpack-dev-server
    devServer: {
        //项目构建后的根目录路径,不会在 build 下生成文件
        contentBase: resolve(__dirname, "build"),
        //启动 gzip 压缩
        compress: true,
        //端口号
        port: 3000,
        //自动打开浏览器
        open: true,
    }
}
const { resolve } = require("path");
const webpack = require("webpack");
const fs = require('fs');
const HtmlWebpackPlugin = require("html-webpack-plugin");

//引入清除文件插件
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

//单独提取css插件
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

//压缩 css optimize-css-assets-webpack-plugin 插件
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");

//将某个文件打包输出支,并在 html中自动引入该资源
const AddAssetHtmlWebpackPlugin = require("add-asset-html-webpack-plugin");

//渐进式网络开发应用程序(离线可访问)
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

const TerserWebpackPlugin = require("terser-webpack-plugin");

//设置 nodejs 环境变量 development 为开发环境  production:生产环境
//devServer 的hot:true 时,为开发环境才可用
process.env.NODE_ENV = "production";

//css loader 复用
const commonCss = [
    //style-loader 会创建 style 标签
    //MiniCssExtractPlugin.loader 替代 style-loader,提取 js 中的css 为单独文件
    process.env.NODE_ENV == "development" ? "style-loader" : {
        loader: MiniCssExtractPlugin.loader,
        options: {
            //设置路径到根目录,防止less 文件中有引入图片 打包后找不到图片路径
            publicPath: "../",
        }
    },
    //将 css 整合到 打包的 js 文件中
    'css-loader',

    // css兼容 默认配置
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
const devToolStr = process.env.NODE_ENV == "production" ? "source-map" : "eval-source-map";

//插件
const plugins = [
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
        filename: "./css/[contenthash:15].css",
        chunkFilename: './css/[contenthash:15].css',
    }),
    //压缩 css
    new OptimizeCssAssetsWebpackPlugin(),
    //离线可访问插件
    new WorkboxWebpackPlugin.GenerateSW({
        /**
         * 1.帮助 serviceWorker 快速启动
         * 2.删除旧的 serviceWorker
         * 
         * 生成一个 serviceWorker 配置文件~~
         * 使用时要在入口文件中注册使用
         */
        // if ('serviceWorker' in navigator) {
        //     window.addEventListener("load", () => {
        //         navigator.serviceWorker.register('/service-worker.js').then(() => {
        //             console.log("注册成功了");
        //         }).catch(() => {
        //             console.log("注册失败了");
        //         });
        //     });
        // }

        clientsClaim: true,
        skipWaiting: true,
    }),
];

const files = fs.readdirSync(resolve(__dirname, "dll"));
files.forEach(file => {
    if (/.*\.dll.js/.test(file)) {
        //将某个文件打包输出支,并在 html中自动引入该资源
        plugins.push(new AddAssetHtmlWebpackPlugin({
            filepath: resolve(__dirname, `dll/${file}`)
        }));
    }
    if (/.*\.manifest.json/.test(file)) {
        //告诉webpack哪些库不参与打包,同时使用的名字也得变~
        plugins.push(new webpack.DllReferencePlugin({
            manifest: resolve(__dirname, `dll/${file}`)
        }));
    }
});

module.exports = {
    entry: "./src/js/entity.js",
    output: {
        filename: "js/[name].[contenthash:15].js",
        path: resolve(__dirname, "build")
    },
    devtool: devToolStr,
    module: {
        rules: [
            // {
            //     //已安装格式化插件,eslint 不认识 window/navigator/document...等浏览器对象,
            //     //在package.json 的eslintConfig添加以下配置即可
            //     // "env": {
            //     //     "browser": true
            //     // }
            //     test: /\.js$/,
            //     loader: "eslint-loader",
            //     exclude: /node_modules/,
            //     //优先执行
            //     enforce: 'pre',
            //     options: {
            //         //自动修复 eslint 的格式报错,如js 文件中没有写空格(格式化)
            //         fix: true
            //     }
            // },
            {
                //oneOf 如果有多个loader同时处理一个文件,只会执行一个loader
                oneOf: [
                    //打包css 样式
                    { //下载 style-loader   css-loader 包
                        test: /\.css$/,
                        use: [...commonCss]
                    },
                    {
                        test: /\.less$/,
                        use: [...commonCss,
                            'less-loader'
                        ]
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
                            name: "[contenthash:15].[ext]",
                            outputPath: "./imgs"
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
                            name: "[contenthash:15].[ext]",
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
                    // {//暂时注释,已安装格式化插件
                    //     test: /\.js$/,
                    //     loader: "eslint-loader",
                    //     exclude: /node_modules/,
                    //     //优先执行
                    //     enforce: 'pre',
                    //     options: {
                    //         //自动修复 eslint 的格式报错,如js 文件中没有写空格(格式化)
                    //         fix: true
                    //     }
                    // },
                    /*
                        js 兼容性处理:babel-loader @babel/core @babel/preset-env
                            1.进行语法转换,如 es6 转成 es5 js代码,使其兼容 ie ... 
                            @babel/preset-env：只能转换基本语法,promise 不能转换。 
                            2.全部的 js 兼容性处理 : @babel/polyfill 
                                在js 中引入即可：import '@babel/polyfill'
                            3.需要做兼容性处理的才做:按需加载 -> core-js,使用这种 第2 种就不能用了
                    */
                    /**
                     * 开启多进程打包:thread-loader,文件多的话可以开启,
                     * 少的话打包时间会比一般的稍微长点
                     */
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: [
                            // {
                            //     loader: "thread-loader",
                            //     options: {
                            //         workers: 2 //开启2个进程
                            //     }
                            // },
                            {
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
                                    ],
                                    cacheDirectory: true
                                }
                            }
                        ]
                    }
                ]

            }
        ]
    },
    plugins: plugins,
    /**
     * 1. 自动将 node_modules中用到的代码单独打包一个chunk 最终输出
     * 2. 自动分析多入口chunk 中,有没有公共的文件,如果有会单独打包成一个chunk
     */
    optimization: {
        splitChunks: {
            chunks: "all"
        },
        //将当前模块的记录其他模块的hash单独打包为一个文件 runtime
        //解决:修改 a 文件 导致b文件的contenthash 变化
        runtimeChunk: {
            name: entrypoint => `runtime-${entrypoint.name}`
        },
        //不配置就会使用默认的压缩方式
        minimizer: [
            //配置生产环境的压缩方案：js和css
            new TerserWebpackPlugin({
                cache: true, //开启缓存
                parallel: true, //开启多进程打包
                sourceMap: true, //开启source-map,否则默认会去掉
            }),
        ]
    },
    //js 压缩:改为 production 生产环境会自动压缩js代码
    mode: process.env.NODE_ENV,
    externals: {
        //拒绝 jQuery 被打包进来,通过 cdn 的方式引入的可以在这里配置不打包进来。
        // jquery: "jQuery"
    },
    //开发服务器 devServer:用来自动化(自动编译,自动打开浏览器,自动刷新浏览器~~~)
    //只会在内存中编译打包,不会有任何输出
    //webpack-dev-server   启动:npx webpack-dev-server
    devServer: {
        //项目构建后的根目录路径,不会在 build 下生成文件
        contentBase: resolve(__dirname, "build"),
        //启动 gzip 压缩
        compress: true,
        //端口号
        port: 8080,
        //自动打开浏览器
        open: true,
        hot: true,
    }
}



// ::::::::::::: 备注 :::::::::::::
/**
 * 开发环境优化: devServer 开启 HMR: hot:true 即可
 *      HMR:hot module replacement 热模块替换/模块热替换
 *      作用:一个模块发生变化,只会打包这个模块(不是打包所有模块),提升构建速度
 *      > 样式文件:可以使用HMR功能,style-loader 内部实现了
 *      > js文件:默认不能使用 >>需要修改js 代码来支持HMR功能实现
 *          > 只能处理非入口js 文件,因为入口js变化的话,会重新加载整个js,其他引入的js模块也会重新加载
 *          if (module.hot) {
                module.hot.accept("./print.js", function() {
                    // print();
                });
            }
 *      > html 文件:默认不能使用HMR功能,同时也会导致hmtl 不能热更新了 (不用做HMR功能)
 *          >>> 解决:修改 entry 入口,将 html 文件引入到entry:
 *              entry:['../src/js/index.js','./index.html']
 *
 *
 *  生产环境优化:
 *      > oneOf:  提升构建速度
 *      > 缓存: 提升第二次的构建速度
 *          >>> babel-loader 缓存 : cacheDirectory:true
 *      > 资源文件缓存:js/css/img ...
 *          >>> 给文件名加hash/chunkhash/contenthash
 *          >>> 使用contenthash 内容来生成 hash 值,内容改过的才重新生成
 *          >>> 帮助上线更新缓存
 */

/**
 * tree shaking : 去除无用代码(定义了没有使用的方法/变量...),减少代码体积
 *      > 必须使用es6 模块化
 *      > 开启 production 生产模式
 *  注:版本不同时可能会出现 把在 js 中引入的 css 文件干掉,模拟：
 *      在package.json 中配置："sideEffects": false,index.js中引入的css/less 文件就不会被打包
 *      > 解决: "sideEffects":["*.css","*.less"] 配置过滤
 */
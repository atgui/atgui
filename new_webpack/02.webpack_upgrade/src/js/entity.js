import ( /* webpackChunkName:'test' */ './test').then();
import ( /* webpackChunkName:'index' */ './index').then();
import ( /* webpackChunkName:'print' */ './print').then();




//注册 serviceWorker
//处理兼容问题
//serviceWorker 代码必须运行在服务器上。
//npm i serve -g  全局安装 :
//serve -s build 启动服务器,将build目录下所有资源作为静态资源暴露出去
if ('serviceWorker' in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register('/service-worker.js').then(() => {
            console.log("注册成功了");
        }).catch(() => {
            console.log("注册失败了");
        });
    });
}
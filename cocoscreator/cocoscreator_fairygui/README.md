# 2020-02-14

cocos creator + FairyGUI 热更新demo

1. 使用 android studio 打开 build 目录下的 android 项目,并安装到手机或模拟器上
2. 使用cocoscreator 打开项目
3. 打开 login.scene 场景,添加一个按钮,点击跳转到 game_hall.scene 场景
4. 构建项目(android)完成后,运行 node version_generator.js -v 0.0.2 -u http://192.168.3.108/remote-assets/HotUpdateDemo/ -s build/jsb-link/ -d assets/
5. 把 build/jsb-link/ 下面的 res 和 src 目录拷贝到 对的服务器的 remote-assets/HotUpdateDemo/ 目录
   把 项目 assets/ 下生成的 version.manifest/project.manifest 两个文件也拷贝到 对的服务器的 remote-assets/HotUpdateDemo/ 目录
6. 重新打开手机或模拟器上项目,点击开始更新,更新成功后会显示有新添加的按钮,点击后会跳转到新的场景
7. 完成


必须:不然无法热更新
注: 每次构建的时候,如果是重新安装的要在 build/jsb-link/main.js 的最上面加上
if (jsb) {
        var hotUpdateSearchPaths = localStorage.getItem('HotUpdateSearchPaths');
        if (hotUpdateSearchPaths) {
            jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths));
        }
}
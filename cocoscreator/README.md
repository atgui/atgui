# 2020-02-24
NewProject:
	1:更新 cocos creator 热更新 + native 友盟微信
	热更新说明:
		(1) 先用 android studio 运行 android_base 安卓项目,安装到手机
		(2) 使用 cocos creator 工具打开 NewProject cocos 项目
		(3) 随便修改点东西,构建发布 android
		(4) android_base 版本号为:0.0.1 运行 node version_generator.js -v 0.0.2 -u http://192.168.3.108/remote-assets/HotUpdateDemo/ -s build/jsb-link/ -d assets/
		(5) 把assets 生成的 version.manifest和project.manifest 和 build 下的 res/src  复制到对应的服务器目录即可
		(6) 重新打开手机上的app, 点 热更新
		
注: 初始项目在 main.js 最上面一定要加:		
if (jsb) {
        var hotUpdateSearchPaths = localStorage.getItem('HotUpdateSearchPaths');
        if (hotUpdateSearchPaths) {
            jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths));
        }
}


	微信登录说明:
		(1) 安装后直接点微信登录即可
		(2) 如果已经授权了,第二次点会取消授权,再点一次会重新授权
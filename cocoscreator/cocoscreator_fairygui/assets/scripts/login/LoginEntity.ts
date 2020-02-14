const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginEntity extends cc.Component {

    private _view: fgui.GComponent;

    onLoad() {
        fgui.addLoadHandler();
        fgui.GRoot.create();

        //这里填写的是相对于resources里的路径
        let res = [
            "login/ui/Login",  //描述文件
            "login/ui/Login_atlas0" //纹理集
        ];
        let self = this;
        cc.loader.loadResArray(res, (err, assets) => {
            //都加载完毕后再调用addPackage
            fgui.UIPackage.addPackage("login/ui/Login");

            //下面就可以开始创建包里的界面了。
            self._startLoader();
        });
    }

    private _startLoader() {
        let view: fgui.GComponent = fgui.UIPackage.createObject("Login", "Login").asCom;
        //1，直接加到GRoot显示出来
        fgui.GRoot.inst.addChild(view);
        view.makeFullScreen();

        view.getChild("checkButton").onClick(this._onCheckButton);
        view.getChild("startButton").onClick(this._onStartButton);
    }

    private _onCheckButton() {
        console.log("TAG check button...");
    }

    private _onStartButton() {
        console.log("TAG start button...");
    }

    start() {

    }

    onDestroy() {
        console.log("销毁....");
    }

    // update (dt) {}
}

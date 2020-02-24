import SceneManager from "../code/manager/SceneManager";
import NativeHelper from "../code/native/NativeHelper";
import SocketManager from "../code/socket/SocketManager";
import HttpHelper from "../code/net/HttpHelper";
var HotUpdate = require("HotUpdate");
var NativeJs=require("NativeJs");

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginTs extends cc.Component {

    @property(cc.Node)
    wxLoginButton: cc.Node = null;

    @property(cc.Node)
    accountBtn: cc.Node = null;

    @property(cc.Node)
    hotButton: cc.Node = null;

    onLoad() {       

        this.wxLoginButton.on(cc.Node.EventType.TOUCH_END,
            function (t) {
                console.log("登录信息:");
                NativeHelper.weixinLogin(function (loginData) {
                    console.log("登录信息:", JSON.stringify(loginData));
                }.bind(this));
            });
        this.accountBtn.on(cc.Node.EventType.TOUCH_END, function () {
            SocketManager.instance.client.onReady(function (client1) {
                console.log("准备好了...");
                client1.proxy.hello("fasfasfklfaslfjaslfkjsalfkjal", 123, function (data) {
                    console.log(data.msg);
                    if (data.msg == "success") {
                        SceneManager.instance.toScene("game_hall", true, function (count, totalCount, item) {
                            console.log(count, totalCount, item);
                        }.bind(this), function (data) {
                            console.log(data);
                        }.bind(this));
                    }
                }.bind(this));
            }.bind(this), this);
        }.bind(this), this);


        this.hotButton.on(cc.Node.EventType.TOUCH_END, function () {
            console.log("TAG 热更新...");
            let hot = this.node.getComponent(HotUpdate);
            hot["hotUpdate"]();
        }.bind(this), this);

        SocketManager.instance.connect("ws://192.168.3.108:36502");

        HttpHelper.instance.get("http://192.168.3.108/remote-assets/HotUpdateDemo/version.manifest", function (data) {
            console.log("TAG:获取资源:", JSON.stringify(data));
        }.bind(this));

    }

    onDestroy() {

    }
    // update (dt) {}
}

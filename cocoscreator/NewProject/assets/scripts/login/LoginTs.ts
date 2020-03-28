import NativeHelper from "../code/native/NativeHelper";
import UIManager from "../code/base/UIManager";
import SocketManager from "../code/network/SocketManager";
import { SocketNode } from "../code/network/SocketNode";
import { DefStringProtocol, NetData } from "../code/network/INetInterface";
import Socket from "../code/network/Socket";
import UserManager from "../managers/UserManager";
import LoadingProgress from "../code/common/LoadingProgress";
import ActionIds from "../code/common/ActionIds";
import NetTips from "../code/network/NetTips";
var HotUpdate = require("HotUpdate");
var NativeJs = require("NativeJs");

const { ccclass, property } = cc._decorator;


@ccclass
export default class LoginTs extends cc.Component {

    @property(cc.Node)
    wxLoginButton: cc.Node = null;

    @property(cc.Node)
    accountBtn: cc.Node = null;

    @property(cc.Node)
    hotButton: cc.Node = null;

    @property(cc.Node)
    guestButton: cc.Node = null;

    onLoad() {
        console.log("TAG login...");
        this.wxLoginButton.on(cc.Node.EventType.TOUCH_END,
            function (t) {
                console.log("登录信息:");
                NativeHelper.weixinLogin(function (loginData) {
                    console.log("登录信息:", JSON.stringify(loginData));
                }.bind(this));
            });

        this.hotButton.on(cc.Node.EventType.TOUCH_END, function () {
            let hot = this.node.getComponent(HotUpdate);
            hot["hotUpdate"]();
        }.bind(this), this);

        this.wxLoginButton.active = this.hotButton.active = cc.sys.isNative;

        let __self = this;
        this.accountBtn.on(cc.Node.EventType.TOUCH_END, async function () {
            UIManager.loadPrefab("./prefab/login/accountbg", function (res) {
                let accountNode = cc.instantiate(res);
                __self.node.addChild(accountNode);
            }, this);
        }.bind(this), this);

        this.guestButton.on(cc.Node.EventType.TOUCH_END, function () {
            SocketManager.instance.send(JSON.stringify({ cmd: ActionIds.Login, type: 1, username: "atgui2", password: "123456" }));
        }.bind(this), this);


        let netNode: SocketNode = SocketManager.instance.getNetNode();
        netNode.addResponeHandler(ActionIds.Login, this._loginSuccess.bind(this), this);
    }

    private _loginSuccess(cmd, e) {
        let loginData = JSON.parse(e);
        UserManager.instance.self.createUser(loginData);

        let __self = this;
        UIManager.loadPrefab("./prefab/Loading", (resource) => {
            let accountNode = cc.instantiate(resource);
            __self.node.addChild(accountNode);

            let progress = accountNode.getComponent(LoadingProgress);
            UIManager.loadScene("hall_scene", true, (count, totalCount, item) => {
                progress.setProgress(count / totalCount);
            }, () => {
                progress.onDestroy();
                console.log("加载完成了...");
            });
        }, this);
    }

    onDestroy() {
        let netNode: SocketNode = SocketManager.instance.getNetNode();
        netNode.cleanListeners(ActionIds.Login);
    }
    // update (dt) {}
}

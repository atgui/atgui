import UIController from "../code/base/UIController";
import SocketManager from "../code/network/SocketManager";
import ActionIds from "../code/common/ActionIds";
const { ccclass, property } = cc._decorator;

@ccclass
export default class AccountLoginTs extends UIController {

    onLoad() {
        this.init(this.node, "");
        console.log(this.view);

        this.view["closeButton"].on(cc.Node.EventType.TOUCH_END, function () {
            this.node.destroy();
        }.bind(this), this);

        let editBox: cc.EditBox = this.view["DL_button/accountEdit"].getComponent(cc.EditBox);

        this.view["loginButton"].on(cc.Node.EventType.TOUCH_END, () => {
            let username = editBox.string;
            SocketManager.instance.send(JSON.stringify({ cmd: ActionIds.Login, type: 0, username: username, password: "123456" }));
        }, this);
    }

    start() {

    }
}

import UIController from "../code/base/UIController";
import isarray = require("isarray");
import UIManager from "../code/base/UIManager";
import { Socket } from "dgram";
import SocketManager from "../code/network/SocketManager";
import ActionIds from "../code/common/ActionIds";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Menu extends UIController {

    onLoad() {
        this.init(this.node, "");
        console.log("TAG MENU=", this.view);
        let btn: cc.Button = this.view["menuButton"].getComponent(cc.Button);
        let subMenu: cc.Node = this.view["subMenu"];
        let isActive: boolean = false;
        subMenu.active = isActive;

        this.view["subMenu/back"].on(cc.Node.EventType.TOUCH_END, function () {
            console.log("TAG 点击返回");
            SocketManager.instance.send(JSON.stringify({ cmd: ActionIds.EXIT_ROOM }));
        }.bind(this), this);

        btn.node.on(cc.Node.EventType.TOUCH_END, function () {
            console.log("TAG 点击菜单...");
            isActive = !isActive;
            subMenu.active = isActive;
        }.bind(this), this);

        let netNode = SocketManager.instance.getNetNode();
        netNode.addResponeHandler(ActionIds.EXIT_ROOM, this._exitRoom, this);
    }



    private _exitRoom() {
        UIManager.loadScene("hall_scene", true);
    }

    onDestroy() {
        let netNode = SocketManager.instance.getNetNode();
        netNode.cleanListeners(ActionIds.EXIT_ROOM);
    }
    // update (dt) {}
}

import UIManager from "../code/base/UIManager";
import LoadingProgress from "../code/common/LoadingProgress";
import UIController from "../code/base/UIController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RoomTs extends UIController {

    onLoad() {
        this.init(this.node, "");
        this.node.on(cc.Node.EventType.TOUCH_END, function () {
            console.log("TAG 点击房间信息:", this._room);
            this._touchRoom();
        }.bind(this), this);
    }

    private _callback: Function;

    public setCallback(call: Function) {
        this._callback = call;
    }

    private _touchRoom() {
        let __self = this;
        this._callback(this._room);
    }

    start() {

    }

    private _room: any;

    public setRoom(room: any) {
        this._room = room;
        console.log("TAG 房间信息:", room);

        let enterLabel: cc.Label = this.view["enterLabel"].getComponent(cc.Label);
        enterLabel.string = `进入:${room.init}`;

        let playerLabel: cc.Label = this.view["playerLabel"].getComponent(cc.Label);
        playerLabel.string = room.playerCount;

        let iconNode: cc.Node = this.view["iconNode"];
        let roomRes = this._getRoomRes(room.level);
        cc.loader.loadRes(roomRes, sp.SkeletonData, function (err, data) {
            let sk = iconNode.addComponent(sp.Skeleton);
            sk.skeletonData = data;
            sk.setAnimation(0, "animation", true);
            sk.premultipliedAlpha = false;
        }.bind(this));
    }

    private _getRoomRes(level: number): string {
        let res = "";
        switch (level) {
            case 0:
                res = "FJ_LHD_TYC"
                break;
            case 1:
                res = "FJ_LHD_CJC";
                break;
            case 2:
                res = "FJ_LHD_ZJC";
                break;
            case 3:
                res = "FJ_LHD_GJC";
                break;
            case 4:
                res = "FJ_LHD_SSC"
                break;
        }
        console.log("TAG LEVEL=", level, "---- RES=", res);
        return `./hall/roomSpines/${res}`;
    }

    // update (dt) {}
}

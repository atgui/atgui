import UIController from "../code/base/UIController";
import UIManager from "../code/base/UIManager";
import RoomTs from "./RoomTs";
import SocketManager from "../code/network/SocketManager";
import { SocketNode } from "../code/network/SocketNode";
import ActionIds from "../code/common/ActionIds";
import GameManager from "../managers/GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainRoomTs extends UIController {

    public closeFun: Function=null;

    onLoad() {
        this.init(this.node, "");
        console.log("TAG ROOM:", this.view);

        this.view["room_bg6/backButton"].on(cc.Node.EventType.TOUCH_END, function () {
            //返回大厅
            GameManager.instance.curRoom = null;
            GameManager.instance.curGame = null;
            this.node.destroy();
            if (this.closeFun) {
                this.closeFun();
            }
        }.bind(this), this);

        let netNode: SocketNode = SocketManager.instance.getNetNode();
        netNode.addResponeHandler(ActionIds.RoomList, function (cmd, msg) {
            let dataJson = JSON.parse(msg);
            this._getRooms(dataJson["data"]);
        }.bind(this), this);
    }

    private _call: Function;
    public setCallback(call: Function) {
        this._call = call;
    }

    getRoomList(gameId: number) {
        SocketManager.instance.send(JSON.stringify({ cmd: ActionIds.RoomList, gameId: gameId }));
    }

    private async _getRooms(data: any) {
        console.log(data);
        let rooms = data.rooms;
        for (let i: number = 0; i < rooms.length; i++) {
            await this._loadRoom(rooms[i]);
        }
    }

    private _prefab: cc.Prefab;

    private async  _loadRoom(room: any) {
        let scrollView: cc.ScrollView = this.view["roomList"].getComponent(cc.ScrollView);
        return new Promise((r, j) => {
            if (this._prefab) {
                let roomNode = cc.instantiate(this._prefab);
                scrollView.content.addChild(roomNode);

                let roomTs: RoomTs = roomNode.getComponent(RoomTs);
                roomTs.setCallback(this._call);
                roomTs.setRoom(room);
                r();
            } else {
                UIManager.loadPrefab("prefab/hall/room_bg", function (data) {
                    this._prefab = data;
                    let roomNode = cc.instantiate(data);
                    scrollView.content.addChild(roomNode);

                    let roomTs: RoomTs = roomNode.getComponent(RoomTs);
                    roomTs.setCallback(this._call);
                    roomTs.setRoom(room);
                    r();
                }.bind(this), this);
            }
        });
    }

    start() {

    }

    onDestroy() {
        let netNode: SocketNode = SocketManager.instance.getNetNode();
        netNode.cleanListeners(ActionIds.RoomList);
    }

}

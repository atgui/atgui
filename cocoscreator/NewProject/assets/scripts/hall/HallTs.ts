import UIManager from "../code/base/UIManager";
import UIController from "../code/base/UIController";
import MainHallTs from "./MainHallTs";
import MainRoomTs from "./MainRoomTs";
import LoadingProgress from "../code/common/LoadingProgress";
import SocketManager from "../code/network/SocketManager";
import ActionIds from "../code/common/ActionIds";
import GameManager from "../managers/GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HallTs extends UIController {

    private _mainHallTs: MainHallTs;

    onLoad() {////////////////////////  游戏列表返回大厅时 数据没显示  ////////////////////////

        this.init(this.node, "");

        UIManager.loadPrefab("prefab/hall/main_hall", function (data) {
            let hallNode = cc.instantiate(data);
            this.view["hallNode"].addChild(hallNode);
            this._mainHallTs = hallNode.getComponent(MainHallTs);
            this._mainHallTs.setGameCallback(this._gameCallback.bind(this));
            this._mainHallTs.getInfos();
            //如果有列表信息就进入列表

            setTimeout(() => {
                if (GameManager.instance.curRoom && GameManager.instance.curGame) {
                    this._gameCallback(GameManager.instance.curGame);
                }
            }, 300);
        }.bind(this), this);
    }

    private _gameCallback(gameMod: { gameId: number, status: number }) {
        console.log("TAG 准备进入房间...", gameMod);

        GameManager.instance.curGame = gameMod;

        let scrollView: cc.ScrollView = this._mainHallTs.view["gameList"].getComponent(cc.ScrollView);
        let topBg = this._mainHallTs.view["topBg"].getComponent(cc.Sprite);

        let __self = this;
        UIManager.loadPrefab("prefab/hall/main_room", function (data) {
            cc.tween(scrollView.node).to(0.5, { position: cc.v2(-1920 - 960, 0), opacity: 0 }).start();
            cc.tween(topBg.node).to(0.5, { position: cc.v2(0, 700), opacity: 0 }).start();

            let hallNode: cc.Node = cc.instantiate(data);
            hallNode.x = 1920;
            hallNode.opacity = 0;
            this.node.addChild(hallNode);

            let mainRoomTs: MainRoomTs = hallNode.getComponent(MainRoomTs);
            mainRoomTs.setCallback(this.changeScene.bind(this));
            mainRoomTs.getRoomList(gameMod.gameId);

            mainRoomTs.closeFun = function () {
                let scrollView: cc.ScrollView = __self._mainHallTs.view["gameList"].getComponent(cc.ScrollView);
                let topBg = __self._mainHallTs.view["topBg"];

                cc.tween(scrollView.node).to(0.5, { position: __self._mainHallTs.gameListPosition, opacity: 255 }).start();
                cc.tween(topBg).to(0.5, { position: __self._mainHallTs.topPosition, opacity: 255 }).start();
            };
            cc.tween(hallNode).to(0.5, { x: 0, opacity: 255 }).start();
        }.bind(this), this);
    }


    public changeScene(room: any) {
        GameManager.instance.curRoom = room;
        //进入房间
        UIManager.loadPrefab("./prefab/Loading", (resource) => {
            let accountNode = cc.instantiate(resource);
            this.node.addChild(accountNode);
            let progress = accountNode.getComponent(LoadingProgress);
            UIManager.loadScene("lhd_scene", true, (count, totalCount, item) => {
                progress.setProgress(count / totalCount);
            }, () => {
                progress.onDestroy();
                console.log("加载完成了...");
                SocketManager.instance.send(JSON.stringify({ cmd: ActionIds.LOGIN_ROOM, roomId: GameManager.instance.curRoom.roomId }))
            });
        }, this);
    }

    start() {

    }

    // update (dt) {}
}

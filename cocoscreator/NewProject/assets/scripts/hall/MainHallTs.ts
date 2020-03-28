import HttpHelper from "../code/net/HttpHelper";
import UIController from "../code/base/UIController";
import UserManager from "../managers/UserManager";
import UserEntity from "../models/UserEntity";
import UIManager from "../code/base/UIManager";
import ActivityButtonTs from "./ActivityButtonTs";
import GameListIcon from "./GameListIcon";
import SocketManager from "../code/network/SocketManager";
import { SocketNode } from "../code/network/SocketNode";
import ActionIds from "../code/common/ActionIds";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainHallTs extends UIController {

    public gameListPosition: cc.Vec2;
    public topPosition: cc.Vec2;

    onLoad() {
        this.init(this.node, "");

        let scrollView: cc.ScrollView = this.view["gameList"].getComponent(cc.ScrollView);
        this.gameListPosition = scrollView.node.position;

        this.topPosition = this.view["topBg"].position;

        console.log("TAG V=", this.view);
        let self: UserEntity = UserManager.instance.self;

        this.view["topBg/userGroup/goldLabel"].getComponent(cc.Label).string = self.selfGold;
        this.view["topBg/userGroup/nicknameLabel"].getComponent(cc.Label).string = self.username;

        let headUI = this.view["topBg/userGroup/headUI"].getComponent(cc.Sprite);
        // //加载网络图片
        var url = "head/test";//self.headUrl;
        cc.loader.loadRes(url, cc.SpriteFrame, function (err, texture) {
            headUI.spriteFrame = texture;
        });

        let netNode: SocketNode = SocketManager.instance.getNetNode();
        netNode && netNode.setResponeHandler(ActionIds.HallList, function (cmd, data) {
            console.log("TAG HALL=", cmd, data);
            let dataJson = JSON.parse(data);
            this._callback(dataJson);
        }.bind(this), this);
    }

    private _gameCallback: Function;

    setGameCallback(_callback: Function) {
        this._gameCallback = _callback;
    }

    getInfos() {
        SocketManager.instance.send(JSON.stringify({ cmd: ActionIds.HallList }));
    }

    private async _callback(data) {
        let value = data.data;

        for (let i: number = 0; i < value.activitys.length; i++) {
            this._addActivity(value.activitys[i]);
        }

        for (let i: number = 0; i < value.gameLists.length; i++) {
            await this._addGameList(value.gameLists[i]);
        }

    }

    private _addGameList(gameMod: { gameId: number, status: number }) {
        return new Promise((r, j) => {
            let scrollView: cc.ScrollView = this.view["gameList"].getComponent(cc.ScrollView);
            UIManager.loadPrefab("./prefab/hall/gameListItem", function (params) {
                let gameNode = cc.instantiate(params);
                scrollView.content.addChild(gameNode);
                let gameListTs: GameListIcon = gameNode.getComponent(GameListIcon);
                gameListTs.setGameCallback(this._gameCallback);
                gameListTs.setGameId(gameMod);
                r();
            }, this);
        });
    }


    private _addActivity(activityMod: { activityId: number, status: number }) {
        if (activityMod.activityId == 10) {//充值

            cc.loader.loadRes("common/spines/DT_CZ", sp.SkeletonData, function (err, data) {
                let node = this.view["buttonBg/chongzhi"];
                let sk = node.addComponent(sp.Skeleton);
                sk.skeletonData = data;
                sk.setAnimation(0, "animation", true);
                sk.premultipliedAlpha = false;
            }.bind(this));
            return;
        }

        let layout: cc.Layout = this.view["topBg/activityLayout"].getComponent(cc.Layout);
        UIManager.loadPrefab("./prefab/hall/activityButton", function (params) {
            console.log("TAG Activity:", params);
            let activityNode = cc.instantiate(params);
            layout.node.addChild(activityNode);

            let acTs: ActivityButtonTs = activityNode.getComponent(ActivityButtonTs);
            acTs.setActivityId(activityMod);
        }, this);
    }

    start() {
    }


    onDestroy() {
        let netNode: SocketNode = SocketManager.instance.getNetNode();
        netNode.cleanListeners(ActionIds.HallList);
    }
    // update (dt) {}
}

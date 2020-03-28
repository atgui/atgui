import UIController from "../../code/base/UIController";
import UIManager from "../../code/base/UIManager";
import LhdManager from "./LhdManager";
import LHDEvent from "./events/LHDEvent";
import { ServerStuts } from "../../code/network/debug/game_server/ServerStuts";
import ChipList from "../../common/ChipList";
import ResItem from "./draw/ResItem";
import Chouma from "../../common/Chouma";
import SocketManager from "../../code/network/SocketManager";
import ActionIds from "../../code/common/ActionIds";
import GameManager from "../../managers/GameManager";
import Piaofen from "../../common/Piaofen";
import TimerTs from "./TimerTs";
import Poker from "../../common/poker/Poker";


const { ccclass, property } = cc._decorator;

@ccclass
export default class LhdTs extends UIController {

    onLoad() {
        this.init(this.node, "");
        console.log("TS=", this.view);

        (this.view["lhd_pailu/historyButton"] as cc.Node).on(cc.Node.EventType.TOUCH_END, this._touchHistory.bind(this), this);
        let betNodeArr = ["lhd_contentbg/longNode", "lhd_contentbg/heNode",
            "lhd_contentbg/huNode", "xuyaButton"];
        for (let i: number = 0; i < betNodeArr.length; i++) {
            (function (i) {
                let vNode: cc.Node = (this.view[betNodeArr[i] + "/shansuo"] as cc.Node);
                vNode && (vNode.opacity = 0);
                (this.view[betNodeArr[i]] as cc.Node).on(cc.Node.EventType.TOUCH_END, function () {
                    vNode && cc.tween(vNode).to(0.1, { opacity: 255 }).to(0.1, { opacity: 0 }).start();
                    this._touchBet(i);
                }.bind(this), this);
            }.bind(this))(i);
        }

        let netNode = SocketManager.instance.getNetNode();
        netNode.setResponeHandler(ActionIds.MATCH, this._onMatch.bind(this));
        netNode.setResponeHandler(ActionIds.LOGIN_ROOM, this._joinRoom.bind(this), this);
        netNode.setResponeHandler(ActionIds.GAME_START, this._startGame.bind(this), this);
        netNode.setResponeHandler(ActionIds.CD_TIME, this._cdTime.bind(this), this);
        netNode.setResponeHandler(ActionIds.BET, this._bet.bind(this), this);
        netNode.setResponeHandler(ActionIds.GAME_OVER, this._gameOver.bind(this), this);
        netNode.setResponeHandler(ActionIds.UPDATE_BET, this._updateBet.bind(this), this);
    }

    private _touchBet(type: number) {
        if (LhdManager.instance.status != ServerStuts.START_BET) {
            console.log("TAG 不是下注状态");
            return;
        }
        if (type == 3) {//续押
            let xuyaBets: Array<number> = LhdManager.instance.xuyaBets;
            let total = 0;
            let types = [];
            let golds = [];
            xuyaBets.forEach((value, index) => {
                total += value;
                if (value > 0) {
                    types.push(index);
                    golds.push(value);
                }
            });
            if (total <= 0) {
                console.log("TAG 上一局未下注");
            } else {
                let cmd: any = new Object();
                cmd["data"] = { types: types, golds: golds };
                cmd["cmd"] = ActionIds.BET;
                SocketManager.instance.send(JSON.stringify(cmd));
            }
            return;
        }
        //获取当前选中的筹码值
        let chipList: ChipList = this.view["chipsLayout"].getComponent(ChipList);
        let value = chipList.curValue;

        let cmd: any = new Object();
        cmd["data"] = { types: [type], golds: [value] };
        cmd["cmd"] = ActionIds.BET;
        SocketManager.instance.send(JSON.stringify(cmd));
    }

    private _bet(cmd, ev) {
        console.log("TAG 下注返回:", ev);
        let e = JSON.parse(ev);
        let types: Array<number> = e["data"]["types"];

        for (let i: number = 0; i < types.length; i++) {
            let areaNode = this._getAreaByType(types[i]);
            let value = e["data"]["golds"][i];
            this._flyChouma(value, areaNode, types[i]);
        }

        //更新自己下注
        let bets = e["data"]["self"];
        LhdManager.instance.selfBets = bets;
        this._updateSelf();
    }

    private _updateBet(cmd, ev) {
        let e = JSON.parse(ev);

        console.log("TAG 下注更新:", e);
        //更新自己下注,更新总下注
        let totalBets = e["total"];
        let selfBets = e["self"];

        LhdManager.instance.selfBets = selfBets;
        LhdManager.instance.totalBets = totalBets;
        this._updateSelf();
        this._updateTotal();
    }

    private _updateSelf() {
        let selfBets = LhdManager.instance.selfBets;
        let betNodes = ["lhd_contentbg/longNode/selfLabel", "lhd_contentbg/heNode/selfLabel", "lhd_contentbg/huNode/selfLabel"];
        for (let i: number = 0; i < betNodes.length; i++) {
            let label: cc.Label = this.view[betNodes[i]].getComponent(cc.Label);
            label.string = selfBets[i] + "";
        }
    }

    private _updateTotal() {
        let totalBets = LhdManager.instance.totalBets;
        let betNodes = ["lhd_contentbg/longNode/totalLabel", "lhd_contentbg/heNode/totalLabel", "lhd_contentbg/huNode/totalLabel"];
        for (let i: number = 0; i < betNodes.length; i++) {
            let label: cc.Label = this.view[betNodes[i]].getComponent(cc.Label);
            label.string = totalBets[i] + "";
        }
    }

    private _chouma: cc.Prefab;

    //飞筹码
    private _flyChouma(value: number, areaNode: cc.Node, type: number = 1) {
        let head: cc.Node = this.view["head"];

        if (this._chouma) {
            let cmNode = cc.instantiate(this._chouma);
            let _cdNode: cc.Node = this.view["choumaNode"];
            _cdNode.addChild(cmNode);
            cmNode.position = new cc.Vec2(head.x, head.y);
            cmNode.scaleX = 0.3;
            cmNode.scaleY = 0.3;
            cmNode.name = "Chip";

            let chouma = cmNode.getComponent(Chouma);
            chouma.setResult(value);

            let vX = Math.floor(Math.random() * (areaNode.width - cmNode.width * 2));
            vX = areaNode.x + vX;

            let y = Math.floor(Math.random() * (280 - 120)) + 120;
            if (type == 1) {
                let vY = areaNode.height - cmNode.height;
                y = -Math.floor(Math.random() * (170 - cmNode.height / 2)) - 20;
            }

            cc.tween(cmNode).to(0.5, { x: vX + cmNode.width, y: -y, scaleX: 0.5, scaleY: 0.5 }).start();
            return;
        }

        UIManager.loadPrefab("./prefab/common/chouma", function (prefab) {
            this._chouma = prefab;
            let cmNode: cc.Node = cc.instantiate(prefab);
            cmNode.scaleX = 0.3;
            cmNode.scaleY = 0.3;
            cmNode.name = "Chip";

            let _cdNode = this.view["choumaNode"];
            _cdNode.addChild(cmNode);
            cmNode.position = new cc.Vec2(head.x, head.y);


            //要根据类型判断是加还是减
            let chouma = cmNode.getComponent(Chouma);
            chouma.setResult(value);

            let vX = Math.floor(Math.random() * (areaNode.width - cmNode.width * 2));
            vX = areaNode.x + vX;

            let y = Math.floor(Math.random() * (280 - 120)) + 120;
            if (type == 1) {
                let vY = areaNode.height - (cmNode.height * 0.5);
                y = -Math.floor(Math.random() * vY);
            }
            cc.tween(cmNode).to(0.5, { x: vX + cmNode.width, y: -y, scaleX: 0.5, scaleY: 0.5 }).start();
        }.bind(this), this);
    }

    private _getAreaByType(type: number): cc.Node {
        let node: cc.Node;
        switch (type) {
            case 0:
                node = (this.view["lhd_contentbg/longNode"] as cc.Node);
                break;
            case 1:
                node = (this.view["lhd_contentbg/heNode"] as cc.Node)
                break;
            case 2:
                node = (this.view["lhd_contentbg/huNode"] as cc.Node)
                break;
        }
        return node;
    }

    private async _joinRoom(cmd, ev) {
        console.log("TAG 进入房间:", ev);
        let e = JSON.parse(ev);
        let data = e["data"];

        let chipList: ChipList = this.view["chipsLayout"].getComponent(ChipList);
        chipList.setResult(data["chips"]);

        let records: Array<number> = data["records"];
        LhdManager.instance.record = records;
        // LhdManager.instance.server.emit(LHDEvent.UPDATE_RECORD, e["result"]);

        //初始化路单
        for (let i: number = 0; i < records.length; i++) {
            await this._loadItem(records[i]);
        }
    }


    private async _loadItem(id: number) {
        let rId: number = id;
        let scrollView: cc.ScrollView = this.view["lhd_pailu/recordList"].getComponent(cc.ScrollView);
        return new Promise((r, j) => {
            UIManager.loadPrefab("prefab/games/lhd/zpItem", async function (res) {
                let itemNode: cc.Node = cc.instantiate(res);
                scrollView.content.addChild(itemNode);
                let zpItem: ResItem = itemNode.getComponent(ResItem);
                await zpItem.setResult(rId, 3);
                r();
            }.bind(this), this);
        });

    }

    private _startGame(cmd, ev) {
        console.log("TAG 开始游戏:", ev);
        let e = JSON.parse(ev);
        LhdManager.instance.init();
        let _cdNode: cc.Node = this.view["choumaNode"];
        let children = _cdNode.children;
        _cdNode.removeAllChildren();

        this._updateSelf();
        this._updateTotal();

        let longPoker: Poker = this.view["lhd_rbg0/longPoker"].getComponent(Poker);
        longPoker.showBg();

        let huPoker: Poker = this.view["lhd_rbg0/huPoker"].getComponent(Poker);
        huPoker.showBg();

        //显示 vs 动画
        if (!this._cdGuangNode) {
            let _cdNode = this.view["animationNode"];
            this._cdNode = new cc.Node();
            _cdNode.addChild(this._cdNode);

            this._cdGuangNode = new cc.Node();
            _cdNode.addChild(this._cdGuangNode);
        }

        let skin = "default";
        UIManager.loadSpine("games/lhd/spines/LHD_vs", this._cdNode, function (sk) {
            // console.log("TAG 主SK=", sk);
        }.bind(this), skin, 0, "animation", false);

        UIManager.loadSpine("games/lhd/spines/LHD_vs_guang", this._cdGuangNode, function (sk) {
            // console.log("TAG 光SK:", sk);
        }.bind(this), skin, 0, "animation", false);

    }

    private _cdGuangNode: cc.Node;
    private _cdNode: cc.Node;

    private _cdTime(cmd, ev) {
        let e = JSON.parse(ev);
        let cdType = e.cd_type;
        LhdManager.instance.status = cdType;
        if (!this._cdGuangNode) {
            let _cdNode = this.view["animationNode"];
            this._cdNode = new cc.Node();
            _cdNode.addChild(this._cdNode);

            this._cdGuangNode = new cc.Node();
            _cdNode.addChild(this._cdGuangNode);
        }

        let timeTs: TimerTs = this.view["lhd_rbg0/time"].getComponent(TimerTs);
        timeTs.showTimer(e.cd_time);

        let skin = cdType == ServerStuts.START_BET ? "kaishixiazhu" : "tingzhixiazhu";
        UIManager.loadSpine("games/lhd/spines/LHD_xiazhu", this._cdNode, function (sk) {
            // console.log("TAG 主SK=", sk);
        }.bind(this), skin, 0, "animation", false);

        UIManager.loadSpine("games/lhd/spines/LHD_xiazhu_guang", this._cdGuangNode, function (sk) {
            // console.log("TAG 光SK:", sk);
        }.bind(this), "default", 0, "animation", false);
    }



    private async _gameOver(cmd, ev) {
        console.log("TAG 结算:", ev);
        let e = JSON.parse(ev);

        //1.开牌

        let longPoker: Poker = this.view["lhd_rbg0/longPoker"].getComponent(Poker);
        await longPoker.setValue(e.cards[0]);

        let huPoker: Poker = this.view["lhd_rbg0/huPoker"].getComponent(Poker);
        await huPoker.setValue(e.cards[1]);

        //1.1 赢的区域闪烁
        let betNodeArr = ["lhd_contentbg/longNode", "lhd_contentbg/heNode",
            "lhd_contentbg/huNode"];
        let winArea: Array<boolean> = e.winArea;
        let index = winArea.indexOf(true);
        let sRes = betNodeArr[index] + "/shansuo";
        this.view[sRes].opacity = 0;
        let tw: cc.Tween = cc.tween(this.view[sRes])
        for (let i: number = 0; i < 10; i++) {
            tw.to(0.2, { opacity: i % 2 == 0 ? 255 : 0 });
        }
        tw.start();

        //2.更新路单
        LhdManager.instance.record.push(e["result"]);
        this._loadItem(e["result"]);

        //3.飘分
        let winGold = e["wGold"];
        if (winGold != 0) {
            let headNode: cc.Node = this.view["head"]; headNode.opacity
            UIManager.loadPrefab("prefab/common/piaofen", function (data) {
                let pfNode = cc.instantiate(data);
                pfNode.opacity = 0;
                headNode.addChild(pfNode);

                let piaofen: Piaofen = pfNode.getComponent(Piaofen);
                piaofen.setResult(winGold);

                cc.tween(pfNode).to(0.3, { y: 110, opacity: 255 }).to(1, { y: 110 }).to(0.5, { opacity: 0 }).call(() => {
                    pfNode.destroy();
                }).start();
            }.bind(this), this);
        }
    }

    private _touchHistory() {
        UIManager.loadPrefab("prefab/games/lhd/historybg", function (res) {
            let history = cc.instantiate(res);
            this.node.addChild(history);
        }.bind(this), this);
    }

    private _loginRoom(cmd, e) {
        console.log("TAG 登录房间成功", e);
    }

    private _onMatch() {

    }

    start() {

    }

    onDestroy() {
        let netNode = SocketManager.instance.getNetNode();
        netNode.cleanListeners(ActionIds.MATCH);
        netNode.cleanListeners(ActionIds.LOGIN_ROOM);
        netNode.cleanListeners(ActionIds.GAME_START);
        netNode.cleanListeners(ActionIds.CD_TIME);
        netNode.cleanListeners(ActionIds.BET);
        netNode.cleanListeners(ActionIds.GAME_OVER);
        netNode.cleanListeners(ActionIds.UPDATE_BET);
    }

}

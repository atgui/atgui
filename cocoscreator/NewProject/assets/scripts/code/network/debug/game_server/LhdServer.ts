import IServer from "../IServer";
import { ISocket } from "../../INetInterface";
import { ServerStuts } from "./ServerStuts";
import IGameServer from "./IGameServer";
import ServerIds from "./ServerIds";

export default class LhdServer implements IServer, IGameServer {

    socket: ISocket;
    constructor(_socket: ISocket) {
        this.socket = _socket;
    }

    //0  方块   1 梅花   2 红桃   3 黑桃
    private CARD_LIST = [
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, //方块 A - K
        0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, //梅花 A - K
        0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D, //红桃 A - K
        0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x3B, 0x3C, 0x3D, //黑桃 A - K
        // 0x4E, 0x4F //大王，小王
    ];

    private cards = [];

    private _status: number = 0;
    private _fun: Array<Function> = new Array();
    private _funIndex: number = 0;

    public bets: Array<number>;

    initServer() {
        this.joinRoom();
        this.match();

        this._fun.push(this._startGame.bind(this));
        this._fun.push(this._startBet.bind(this));
        this._fun.push(this._stopBet.bind(this));
        this._fun.push(this._gameOver.bind(this));
        this.__next__();
    }

    private __next__() {
        if (!this._fun) return;
        this._fun[this._funIndex]();
        this._funIndex++;
        if (this._funIndex >= this._fun.length) {
            this._funIndex = 0;
        }
    }


    public send(obj: any) {
        let cmd = obj["cmd"];
        switch (cmd) {
            case ServerIds.BET:
                let types = obj["data"]["types"];
                for (let i: number = 0; i < types.length; i++) {
                    this.bets[types[i]] += obj["data"]["golds"][i];
                }
                obj["data"]["self"] = this.bets;
                obj.cmd = ServerIds.BET;
                this.socket.onMessage(JSON.stringify(obj));
                break;
        }
    }


    public joinRoom() {
        console.log("TAG 进入房间");

        let obj = new Object();
        obj["cmd"] = ServerIds.LOGIN_ROOM;//画和数量有问题。。
        obj["data"] = {
            free: 0,
            chips: [1, 10, 50, 100, 200, 500],
            records: [1, 1, 1, 1, 2, 0, 1, 2, 1, 0]
        };
        this.socket.onMessage(JSON.stringify(obj));
    }

    public match() {
        let obj = new Object();
        obj["cmd"] = ServerIds.MATCH;
        this.socket.onMessage(JSON.stringify(obj));
    }

    private _startGame() {
        this.bets = [0, 0, 0];
        this._status = ServerStuts.START;
        let cmd = new Object();
        cmd["cmd"] = ServerIds.GAME_START;
        cmd["game_num"] = "AZ897DFLFKFIO9087KKZ";
        this.socket.onMessage(JSON.stringify(cmd));
        setTimeout(() => {
            this.__next__();
        }, 2000);

        for (let i: number = 0; i < this.CARD_LIST.length; i++) {
            this.cards.push(this.CARD_LIST[i]);
        }
    }

    private _startBet() {
        this._status = ServerStuts.START_BET;
        let cmd = new Object();
        cmd["cmd"] = ServerIds.CD_TIME;
        cmd["cd_time"] = 15;
        cmd["cd_type"] = this._status;
        this.socket.onMessage(JSON.stringify(cmd));
        setTimeout(() => {
            this.__next__();
        }, 15000);

        this._betUdpate();
    }

    private _stopBet() {
        if (this._betTime)
            clearInterval(this._betTime);

        this._emitBet();

        this._status = ServerStuts.STOP_BET;
        let cmd = new Object();
        cmd["cmd"] = ServerIds.CD_TIME;
        cmd["cd_time"] = 10;
        cmd["cd_type"] = this._status;
        this.socket.onMessage(JSON.stringify(cmd));
        setTimeout(() => {
            this.__next__();
        }, 1000);
    }

    private _gameOver() {
        this._status = ServerStuts.STOP_BET;
        let cmd = new Object();
        cmd["cmd"] = ServerIds.GAME_OVER;

        let cardList = [];
        for (let i: number = 0; i < 2; i++) {
            let index = Math.floor(Math.random() * this.cards.length);
            let value = this.cards.splice(index, 1)[0];
            cardList.push(value);
        }

        let result = cardList[0] > cardList[1] ? 0 : cardList[0] == cardList[1] ? 1 : 2;
        cmd["result"] = result;
        let winGold = this.bets[result] * (result == 1 ? 9 : 2);
        let total = this.bets[0] + this.bets[1] + this.bets[2];
        let win = winGold - total;
        cmd["winArea"] = [result == 0, result == 1, result == 2];
        cmd["wGold"] = win;
        cmd["cards"] = cardList;

        this.socket.onMessage(JSON.stringify(cmd));
        setTimeout(() => {
            this.__next__();
        }, 9000);
    }

    private _betTime: any;

    private _betUdpate() {
        this._betTime = setInterval(() => {
            this._emitBet();
        }, 1000);
    }
    private _emitBet() {
        let obj: any = new Object();
        obj["total"] = this.bets;
        obj["self"] = this.bets;
        obj.cmd = ServerIds.UPDATE_BET;

        this.socket.onMessage(JSON.stringify(obj));
    }

    parse(json: any) {
        switch (json["cmd"]) {
            case ServerIds.BET:
                console.log("TAG Server 下注:", json);

                let types = json["data"]["types"];
                for (let i: number = 0; i < types.length; i++) {
                    this.bets[types[i]] += json["data"]["golds"][i];
                }
                let obj: any = new Object();
                obj.data = { self: this.bets, types: json["data"]["types"], golds: json["data"]["golds"] };
                obj.cmd = ServerIds.BET;
                this.socket.onMessage(JSON.stringify(obj));
                break;
        }
    }

    public destroy() {
        clearInterval(this._betTime);
        this.socket.onMessage(JSON.stringify({ cmd: ServerIds.EXIT_ROOM, msg: "退出成功" }));
        this.socket = null;
        this._fun = null;
    }

}
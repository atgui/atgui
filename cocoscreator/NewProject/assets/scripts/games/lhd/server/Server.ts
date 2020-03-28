import EventEmitter from "../../../code/events/EventEmitter";
import { ServerStuts } from "../../../code/network/debug/game_server/ServerStuts";
import LHDEvent from "../events/LHDEvent";


export default class Server extends EventEmitter {
    constructor() {
        super();
    }

    private _status: number = 0;
    private _fun: Array<Function> = new Array();
    private _funIndex: number = 0;

    public bets: Array<number>;

    initServer() {
        this.match();
        this.joinRoom();

        this._fun.push(this._startGame.bind(this));
        this._fun.push(this._startBet.bind(this));
        this._fun.push(this._stopBet.bind(this));
        this._fun.push(this._gameOver.bind(this));
        this.__next__();
    }

    private __next__() {
        this._fun[this._funIndex]();
        this._funIndex++;
        if (this._funIndex >= this._fun.length) {
            this._funIndex = 0;
        }
    }


    public send(obj: any) {
        let cmd = obj["cmd"];
        switch (cmd) {
            case 100001:
                let types = obj["data"]["types"];
                for (let i: number = 0; i < types.length; i++) {
                    this.bets[types[i]] += obj["data"]["golds"][i];
                }
                obj["data"]["self"] = this.bets;
                this.emit(LHDEvent.BET, obj);
                break;
        }
    }


    public joinRoom() {
        console.log("TAG 进入房间");

        let obj = new Object();
        obj["cmd"] = 100000;//画和数量有问题。。
        obj["data"] = { free: 0, chips: [1, 10, 50, 100, 200, 500], records: [2, 1, 2, 2, 0, 0, 1, 2, 0, 1] };

        this.emit(LHDEvent.JOIN_ROOM, obj);
    }

    public match() {
        this.emit(LHDEvent.MATCH);
    }

    private _startGame() {
        this.bets = [0, 0, 0];
        this._status = ServerStuts.START;
        let cmd = new Object();
        cmd["cmd"] = 100001;
        cmd["game_num"] = "AZ897DFLFKFIO9087KKZ";
        this.emit(LHDEvent.START, cmd);
        setTimeout(() => {
            this.__next__();
        }, 1000);
    }

    private _startBet() {
        this._status = ServerStuts.START_BET;
        let cmd = new Object();
        cmd["cmd"] = 100002;
        cmd["cd_time"] = 5;
        cmd["cd_type"] = this._status;
        this.emit(LHDEvent.CD, cmd);
        setTimeout(() => {
            this.__next__();
        }, 5000);

        this._betUdpate();
    }

    private _stopBet() {
        if (this._betTime)
            clearInterval(this._betTime);

        this._emitBet();

        this._status = ServerStuts.STOP_BET;
        let cmd = new Object();
        cmd["cmd"] = 100003;
        cmd["cd_time"] = 5;
        cmd["cd_type"] = this._status;
        this.emit(LHDEvent.CD, cmd);
        setTimeout(() => {
            this.__next__();
        }, 1000);
    }

    private _gameOver() {
        this._status = ServerStuts.STOP_BET;
        let cmd = new Object();
        cmd["cmd"] = 100004;
        let result = Math.floor(Math.random() * 3);
        cmd["result"] = result;

        let winGold = this.bets[result] * (result == 1 ? 9 : 2);
        let total = this.bets[0] + this.bets[1] + this.bets[2];
        let win = winGold - total;
        cmd["winArea"] = [result == 0, result == 1, result == 2];
        cmd["win"] = win;

        this.emit(LHDEvent.GAME_OVER, cmd);
        setTimeout(() => {
            this.__next__();
        }, 3000);
    }

    private _betTime: any;

    private _betUdpate() {
        this._betTime = setInterval(() => {
            this._emitBet();
        }, 1000);
    }
    private _emitBet() {
        let obj = new Object();
        obj["total"] = this.bets;
        obj["self"] = this.bets;
        this.emit(LHDEvent.UPDATE_BET, obj);
    }

}
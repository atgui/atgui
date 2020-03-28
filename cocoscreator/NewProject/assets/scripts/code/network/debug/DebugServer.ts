import { ISocket } from "../INetInterface";
import DebugLoginServer from "./DebugLoginServer";
import DebugHallServer from "./DebugHallServer";
import DebugGameServer from "./DebugGameServer";

/**
 * 本地服务
 */
export default class DebugServer implements ISocket {

    private _loginServer: DebugLoginServer;
    private _hallServer: DebugHallServer;
    private _gameServer: DebugGameServer;
    constructor() {
        this._loginServer = new DebugLoginServer(this);
        this._hallServer = new DebugHallServer(this);
        this._gameServer = new DebugGameServer(this);
    }

    onConnected(event: any) {
    }
    onMessage(msg: import("../INetInterface").NetData) {
    }
    onError(event: any) {
    }
    onClosed(event: any) {
    }

    connect(options: any): boolean {
        this.onConnected(null);
        return true;
    }
    send(buffer: import("../INetInterface").NetData) {
        console.log("TAG DebugServer send..", buffer);
        if (typeof (buffer) == "string") {
            let data = JSON.parse(buffer);
            let cmd = data["cmd"];
            if (cmd > 0 && cmd <= 100) {//登录服务
                this._loginServer.parse(data);
            } else if (cmd > 100 && cmd <= 200) {//大厅
                this._hallServer.parse(data);
            } else if (cmd > 200 && cmd <= 1000) {//游戏
                this._gameServer.parse(data);
            } else if (cmd > 1000 && cmd < 10000) {//公共
                
            } else {//其他

            }
            // this.onMessage(buffer);
        }
    }
    close(code?: number, reason?: string) {
    }

}
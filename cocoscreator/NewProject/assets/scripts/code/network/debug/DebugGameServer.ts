import IServer from "./IServer";
import LhdServer from "./game_server/LhdServer";
import HallData from "./HallData";
import IGameServer from "./game_server/IGameServer";
import { ISocket } from "../INetInterface";
import ServerIds from "./game_server/ServerIds";

export default class DebugGameServer implements IServer {
    private _gameServer: IGameServer;
    private socket: ISocket;
    constructor(_socket: ISocket) {
        this.socket = _socket;
    }
    //201-1000
    parse(json: any) {
        switch (json["cmd"]) {
            case ServerIds.LOGIN_ROOM://进入房间
                let roomId = json["roomId"];
                HallData.roomId = roomId;
                switch (HallData.curGame.gameId) {
                    case 10001:
                        if (this._gameServer && this._gameServer["destroy"]) this._gameServer["destroy"]();
                        this._gameServer = new LhdServer(this.socket);
                        this._gameServer.initServer();
                        break;
                }
                break;
            case ServerIds.EXIT_ROOM:
                HallData.curGame = null;
                HallData.roomId = 0;
                if (this._gameServer && this._gameServer["destroy"]) this._gameServer["destroy"]();
                this._gameServer = null;
                this.socket = null;
                break;
            default:
                this._gameServer["parse"] && this._gameServer["parse"](json);
                break;
        }
    }
}
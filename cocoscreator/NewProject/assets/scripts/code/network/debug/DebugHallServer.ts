import { ISocket } from "../INetInterface";
import IServer from "./IServer";
import HallData from "./HallData";

export default class DebugHallServer implements IServer {

    socket: ISocket;
    constructor(_socket: ISocket) {
        this.socket = _socket;
    }

    private _players: Map<string, any> = new Map();

    //101-200
    parse(json: any) {
        switch (json["cmd"]) {
            case 101:
                this.getGameInfos();
                break;
            case 102://进入房间获取房间列表
                let gameId = json["gameId"];
                // HallData.gameId = gameId;
                this._getRooms(gameId);
                break;
        }
    }

    public getGameInfos() {
        let obj: any = new Object();
        obj.cmd = 101;
        let games = [];
        HallData.games.forEach(value => {
            let obj = { status: value.status, gameId: value.gameId };
            games.push(obj);
        });

        obj.data = { gameLists: games, activitys: HallData.actitys };
        this.socket.onMessage(JSON.stringify(obj));
    }

    private _getRooms(gameId: number) {
        let games = HallData.games.filter(value => {
            return value.gameId == gameId;
        });
        let rooms = [];
        if (games.length > 0) {
            HallData.curGame = games[0];
            rooms = games[0].rooms;
        }
        let obj: any = new Object();
        obj.cmd = 102;
        obj.data = { rooms: rooms };
        this.socket.onMessage(JSON.stringify(obj));
    }
}
import { ISocket, NetData } from "../INetInterface";
import IServer from "./IServer";

export default class DebugLoginServer implements IServer {
    socket: ISocket;
    public constructor(_socket: ISocket) {
        this.socket = _socket;
    }


    //1-100
    parse(json: any) {
        if (json["cmd"] == 1) {
            this.login(json);
        } else if (json["cmd"] == 2) {
            this.register(json);
        }
    }

    /**
     * buffer.type==1   游客方式
     * @param buffer    登录数据
     */
    public login(buffer: any) {
        let loginObj: any = new Object();
        loginObj.username = buffer["type"] ? this._createUserName() : buffer.username;
        loginObj.gold = 99999999;
        loginObj.sex = 1;
        loginObj.headUrl = "test";
        loginObj.cmd = 1;
        this.socket.onMessage(JSON.stringify(loginObj));
    }

    public register(buffer: any) {

    }

    private _createUserName() {
        var chars = 'ABCDEFGHJKMNPQRSTWXYZ234567890';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var pwd = '';
        for (let i = 0; i < 6; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pwd;
    }

}
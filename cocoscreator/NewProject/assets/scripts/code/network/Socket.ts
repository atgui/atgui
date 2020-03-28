import { ISocket, NetData } from "./INetInterface";

export default class Socket implements ISocket {
    onConnected(event: any) {
        throw new Error("Method not implemented.");
    }
    onMessage(msg: NetData) {
        throw new Error("Method not implemented.");
    }
    onError(event: any) {
        throw new Error("Method not implemented.");
    }
    onClosed(event: any) {
        throw new Error("Method not implemented.");
    }

    private _ws: WebSocket = null;
    connect(options: any): boolean {
        if (this._ws) {
            if (this._ws.readyState === WebSocket.CONNECTING) {
                console.log("websocket connecting, wait for a moment...");
                return false;
            }
        }
        let url = null;
        if (options.url) {
            url = options.url;
        } else {
            let ip = options.ip;
            let port = options.port;
            let protocol = options.protocol;
            url = `${protocol}://${ip}:${port}`;
        }

        this._ws = new WebSocket(url);
        this._ws.binaryType = options.binaryType ? options.binaryType : "arraybuffer";
        this._ws.onmessage = (event) => {
            this.onMessage(event.data);
        };
        this._ws.onopen = this.onConnected;
        this._ws.onerror = this.onError;
        this._ws.onclose = this.onClosed;
        return true;
    }
    send(buffer: NetData) {
        if (this._ws && this._ws.readyState == WebSocket.OPEN) {
            this._ws.send(buffer);
            return true;
        }
        return false;
    }

    close(code?: any, reason?: any) {
        this._ws && this._ws.close(code, reason);
    }


}
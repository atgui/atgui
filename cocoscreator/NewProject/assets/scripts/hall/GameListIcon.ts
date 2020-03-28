const { ccclass, property } = cc._decorator;

@ccclass
export default class GameListIcon extends cc.Component {

    start() {

    }

    private _gameModel: { gameId: number, status: number };

    onLoad() {
        console.log("TAG: GameListIcon...");
        this.node.on(cc.Node.EventType.TOUCH_END, function (params) {
            console.log("TAG 点击。。。：：", this._gameModel.gameId, this._gameModel.status);
            this._gameCallback(this._gameModel);
        }.bind(this), this);
    }

    private _gameCallback: Function;

    setGameCallback(_callback: Function) {
        this._gameCallback = _callback;
    }

    //设置id
    public setGameId(gameMod: { gameId: number, status: number }) {
        this._gameModel = gameMod;
        console.log("TAG: 游戏ID=", gameMod.gameId);
        let __self = this;
        let res = this.getGameRes(gameMod.gameId);
        console.log(res);
        cc.loader.loadRes(res, sp.SkeletonData, function (err, data) {
            console.log("TAG::::", data);
            let sk = __self.node.addComponent(sp.Skeleton);
            sk.skeletonData = data;
            sk.defaultSkin = "default";
            sk.setAnimation(0, "animation", true);
            sk.premultipliedAlpha = false;
        }.bind(this));
    }

    getGameRes(gameId: number) {
        let spineRes = "";
        switch (gameId) {
            case 10001:
                spineRes = "DT_LHD";
                break;
            case 10002:
                spineRes = "DT_RRMJ";
                break;
            case 10003:
                spineRes = "DT_ZJH";
                break;
        }
        return "hall/spines/" + spineRes;
    }

    // update (dt) {}
}

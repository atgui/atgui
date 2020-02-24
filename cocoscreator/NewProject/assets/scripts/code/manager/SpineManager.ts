/**
 * spine 动画加载管理
 * Created by atgui on 2020/2/21
 */
export default class SpineManager {
    private static _instance: SpineManager;
    public static get instance(): SpineManager {
        if (!this._instance) {
            this._instance = new SpineManager();
        }
        return this._instance;
    }
    public async loadSpine(url: string, node: cc.Node, skin: string = "default", playIndex: number = 0, animation: string = "animation", loop: boolean = true) {
        return new Promise((r, j) => {
            cc.loader.loadRes(url, sp.SkeletonData, (err, spData) => {
                if (err) {
                    cc.log("err ", err);
                    r(null);
                } else {
                    if (!node) { return; }
                    let spCmpt = node.addComponent(sp.Skeleton);
                    spCmpt.skeletonData = spData;
                    spCmpt.premultipliedAlpha = false;
                    spCmpt.setSkin(skin);
                    spCmpt.setAnimation(playIndex, animation, loop);
                    r(spCmpt);
                }
            })
        });
    }
}
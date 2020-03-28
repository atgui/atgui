import LoginTs from "../../login/LoginTs";

export default class UIManager {
    //加载scene
    /**
     * 
     * @param sceneName 
     * @param isAtOnce 
     * @param progress  count, totalCount, item  三个参数
     * @param onLoad 
     */
    static loadScene(sceneName: string, isAtOnce: boolean = true, progress?: (count, totalCount, item) => void, onLoad?: Function) {
        cc.director.preloadScene(sceneName, (count, totalCount, item) => {
            progress && progress.apply(progress, [count, totalCount, item]);
        }, (err, assets) => {
            if (err) {
                onLoad && onLoad.apply(onLoad, [false]);
                return;
            }
            if (isAtOnce) {
                cc.director.loadScene(sceneName, () => {
                    onLoad && onLoad.apply(onLoad, [true]);
                });
            } else {
                onLoad && onLoad.apply(onLoad, [true]);
            }
        });
    }

    //加载prefab
    static loadPrefab(url, callback: Function, taget: any) {
        cc.loader.loadRes(url, cc.Prefab, (err, res) => {
            if (err) {
                console.log("TAG:加载出错了.", err);
                callback.apply(taget, [null]);
            } else {
                callback.apply(taget, [res]);
            }
        });
    }

    //加载spine 动画
    static loadSpine(url: string, node: cc.Node, callback: Function, skin: string = "default", playIndex: number = 0, animation: string = "animation", loop: boolean = true) {
        cc.loader.loadRes(url, sp.SkeletonData, (err, spData) => {
            if (err) {
                console.log("TAG 加载出错 ", err);
                callback(null);
            } else {
                if (!node) {
                    console.log("TAG NODE 没有。。");
                    return;
                }
                let spCmpt = node.addComponent(sp.Skeleton);
                spCmpt.skeletonData = spData;
                spCmpt.premultipliedAlpha = false;
                spCmpt.setSkin(skin);
                spCmpt.setAnimation(playIndex, animation, loop);
                callback(spCmpt);
            }
        })
    }
}
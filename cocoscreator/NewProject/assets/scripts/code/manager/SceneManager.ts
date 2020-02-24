/**
 * 场景管理
 * Created by atgui on 2020/2/21
 */
export default class SceneManager {
    private static _instance: SceneManager;
    public static get instance(): SceneManager {
        if (!this._instance) {
            this._instance = new SceneManager();
        }
        return this._instance;
    }

    /**
     * 预加载/跳转场景
     * @param sceneName 场景名称
     * @param isAtOnce  加载完成后是否马上跳转到该场景
     * @param progress  加载进度回调三个参数: count/totalCount/item
     * @param onLoad    加载完成回调
     */
    public toScene(sceneName: string, isAtOnce: boolean = true, progress?: (count, totalCount, item) => {}, onLoad?: Function) {
        cc.director.preloadScene(sceneName, (count, totalCount, item) => {
            progress.apply(progress, [count, totalCount, item]);
        }, (err, assets) => {
            if (err) {
                onLoad.apply(onLoad, [false]);
                return;
            }
            if (isAtOnce) {
                cc.director.loadScene(sceneName, () => {
                    onLoad.apply(onLoad, [true]);
                });
            } else {
                onLoad.apply(onLoad, [true]);
            }
        });
    }

}
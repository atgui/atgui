/**
 * 资源加载管理
 * Created by atgui on 2020/2/21
 */
export default class ResLoaderManager {
    private static _instance: ResLoaderManager;
    public static get instance(): ResLoaderManager {
        if (!this._instance) {
            this._instance = new ResLoaderManager();
        }
        return this._instance;
    }

    /**
     * 加载 prefab,返回成功
     * @param url 相对于resouces 目录下的路径
     */
    public async loadPrefab(url) {
        return new Promise((r, j) => {
            cc.loader.loadRes(url, cc.Prefab, (err, resource) => {
                if (err) {
                    console.log("TAG:加载出错了.", err);
                    r(null);
                } else {
                    r(resource);
                }
            });
        });
    }

}

const { ccclass, property } = cc._decorator;

@ccclass
export default class ActivityButtonTs extends cc.Component {


    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, function (params) {
            console.log("点击。。。");
        }.bind(this), this);
    }

    public async setActivityId(activityMod: { activityId: number, status: number }) {
        let __self = this;
        //先加载显示静态图片

        cc.loader.loadRes("hall/activitySpines/DT_jilu", sp.SkeletonData, function (err, data) {
            let sk = __self.node.addComponent(sp.Skeleton);
            sk.skeletonData = data;
            sk.setAnimation(0, "animation", true);
            sk.premultipliedAlpha = false;
        }.bind(this));
    }

    getResName(activityId: number) {

    }

}
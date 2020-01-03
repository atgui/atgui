//只引入就会自动分包
import GameEntities from "./GameEntities";
import Common from "./Common";

export default class Main {
    constructor() {
        this._sayHello();
        this.getPersion();

        //new Common();//在分包中的不能这样用.这样就会打包到main.js 中了 GameEntities分包就没用了
        //使用分包中的数据时,用到的时候才会加载
        setTimeout(() => {
            GameEntities.Config().then(value => {
                console.log("TAGfsdafasfasf");
                new value.default();
            });
        }, 2000);

    }
    private _sayHello() {
        console.log("Say hello..fdsfsaf");
    }

    private async getPersion() {
        return new Promise((resolve, reject) => {
            console.log("promise...1111");
            resolve();
        });
    }
}
new Main();
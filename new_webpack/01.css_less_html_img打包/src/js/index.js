// import '@babel/polyfill'

import css from "../css/index.css";
import less from "../css/index.less"
import font from "../css/iconfont.css"


const add = (a, b) => {
    return a + b;
}

//下一行 eslint 不进行检查(eslint 所有规则都失效)
//eslint-disable-next-line : 可以忽略eslint 检查
console.log(add(1, 2));


const promise = new Promise((r) => {
    setTimeout(() => {
        console.log("定时器执行完了!!!");
    }, 1000);
});
console.log(promise);
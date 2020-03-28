import '../css/iconfont.css';
import '../css/test.css';

import $ from 'jquery';
console.log($);

console.log("index.js");

window.document.getElementById("btn").onclick = function() {
    console.log("点击懒加载了");
    //引入 lazy.js  这种方式实现懒加载
    //webpackPrefetch 预加载,先加载完其他的再加载这个。等浏览器空闲了,再偷偷加载
    import ( /* webpackChunkName:'lazy',webpackPrefetch:true */ './lazy.js').then(({ add }) => {
        console.log(add(1, 2, 3, 4));
    })
}

/**
 * 下一行 eslint 不进行检查(eslint 所有规则都失效) : 可以忽略eslint 检查
 */

// const promise = new Promise((r) => {
//     setTimeout(() => {
//         // eslint-disable-next-line
//         console.log('定时器执行完了!!!~~~');
//         r();
//     }, 1000);
// });
// promise.then();

// if (module.hot) {
//     module.hot.accept('./print.js', () => {
//         // print();
//     });
// }
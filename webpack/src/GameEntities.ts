export default {
    Config: () => import(/* webpackChunkName: "Config" */ "./Config"),
    Common: () => import(/* webpackChunkName: "Common" */ "./Common"),
}
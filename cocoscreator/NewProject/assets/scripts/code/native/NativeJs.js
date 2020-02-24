function NativeJs() { }
//原生平台加调
NativeJs.onSuccess = function (isOK, data) {
    console.log("TAG:微信登录返回:", isOK, data);
    // var data: any = {};
    // data.isOK = isOK;
    // data["openid"] = data["openid"];
    // data["unionid"] = data["unionid"];
    // data["access_token"] = access_token;
    // data["refresh_token"] = refresh_token;
    // data["expires_in"] = expires_in;
    // data["screen_name"] = screen_name;
    // data["city"] = city;
    // data["prvinice"] = prvinice;
    // data["country"] = country;
    // data["gender"] = gender;
    // data["profile_image_url"] = profile_image_url;
    // NativeHelper.onLoginSuceessCb(data);
    //调用全局事件来把数据传出去
}
//用户取消
NativeJs.onCancel=function(){
    console.log("TAG:用户取消授权了...");
}
//授权出错
NativeJs.onError=function(msg){
    console.log("TAG:用户授权出错了...");
}
NativeJs.onStart=function(){
    console.log("TAG:准备开始授权...");
}

window.NativeJs = NativeJs;
module.exports = NativeJs;
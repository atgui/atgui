import PlatForm from "./Platform";

/**
 * 原生调用
 * Created by atgui on 2020/2/20
 */
export default class NativeHelper {
    private static onLoginSuceessCb: Function;

    //调用原生微信登录
    public static weixinLogin(cb: Function) {
        NativeHelper.onLoginSuceessCb = cb;
        PlatForm.androidWithNoArgs("com/umeng/soexample/umeng/UmengManager", "weixinLogin");
    }

    //原生平台加调
    // public static weixinLoginSuccess = function (isOK, data) {
    //     console.log("TAG:微信登录返回:", data);
    //     // var data: any = {};
    //     // data.isOK = isOK;
    //     // data["openid"] = data["openid"];
    //     // data["unionid"] = data["unionid"];
    //     // data["access_token"] = access_token;
    //     // data["refresh_token"] = refresh_token;
    //     // data["expires_in"] = expires_in;
    //     // data["screen_name"] = screen_name;
    //     // data["city"] = city;
    //     // data["prvinice"] = prvinice;
    //     // data["country"] = country;
    //     // data["gender"] = gender;
    //     // data["profile_image_url"] = profile_image_url;
    //     // NativeHelper.onLoginSuceessCb(data);
    // }

}
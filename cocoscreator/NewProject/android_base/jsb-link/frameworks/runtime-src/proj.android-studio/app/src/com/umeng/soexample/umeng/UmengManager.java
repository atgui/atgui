package com.umeng.soexample.umeng;

import android.app.Activity;
import android.content.Context;
import android.util.Log;

import com.umeng.socialize.UMAuthListener;
import com.umeng.socialize.UMShareAPI;
import com.umeng.socialize.bean.SHARE_MEDIA;

import com.umeng.soexample.wxcallback.IWxListenner;
import com.umeng.soexample.wxcallback.WxListenner;
import java.util.Map;

/**
 * 友盟api操作
 */
public class UmengManager {
    public static Activity activity;

    public static IWxListenner wxListenner;

    public static void setActivity(Activity _activity){
        activity=_activity;
        wxListenner=new WxListenner(_activity);
    }


    public  static void weixinLogin(){
        Context context=activity.getApplicationContext();

        final boolean isauth = UMShareAPI.get(context).isAuthorize(activity, SHARE_MEDIA.WEIXIN);
        if(isauth){
            UMShareAPI.get(context).deleteOauth(activity, SHARE_MEDIA.WEIXIN, authListener);
            return;
        }
        UMShareAPI.get(context)
                .getPlatformInfo(activity, SHARE_MEDIA.WEIXIN, authListener);
    }
   static UMAuthListener authListener=new UMAuthListener() {
        @Override
        public void onStart(SHARE_MEDIA share_media) {
            Log.e("TAG","准备开始授权登录");
            if(wxListenner!=null)wxListenner.onStart();
        }

        @Override
        public void onComplete(SHARE_MEDIA share_media, int i, Map<String, String> map) {
            Log.e("TAG","登录成功");
            if(map!=null) {
                String result="{";
                for (String key : map.keySet()) {
                    String value = map.get(key);
                    System.out.println(key + ":" + value);
                    result+=key+":"+value+",";
                }
                String token=map.get("access_token");
                result=result.substring(0,result.length()-1);
                result+="}";
                if(wxListenner!=null)wxListenner.onSuccess(result);
            }
        }

        @Override
        public void onError(SHARE_MEDIA share_media, int i, Throwable throwable) {
            String errMsg=throwable.getMessage();
            Log.e("TAG","登录失败"+i+"::: ===== :::"+errMsg);
            if(wxListenner!=null)wxListenner.onError(errMsg);
        }

        @Override
        public void onCancel(SHARE_MEDIA share_media, int i) {
            Log.e("TAG","取消授权"+i);
            if(wxListenner!=null)wxListenner.onCancel();
        }
    };
}

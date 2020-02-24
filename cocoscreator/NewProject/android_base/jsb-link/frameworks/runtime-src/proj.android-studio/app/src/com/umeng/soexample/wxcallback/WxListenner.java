package com.umeng.soexample.wxcallback;

import android.app.Activity;

import org.cocos2dx.lib.Cocos2dxHelper;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

public class WxListenner implements IWxListenner {

    public WxListenner(Activity activity){
        this.activity=activity;
    }

    private Activity activity;

    @Override
    public void onStart() {
        String msg= "window.NativeJs.onStart()";
        this._run(msg);
    }

    @Override
    public void onSuccess(String data) {
       String msg= "window.NativeJs.onSuccess(\"true\",\""+data+"\")";
       this._run(msg);
    }

    @Override
    public void onError(String data) {
        String msg= "window.NativeJs.onError(\""+data+"\")";
        this._run(msg);
    }

    @Override
    public void onCancel() {
        String msg= "window.NativeJs.onCancel()";
        this._run(msg);
    }

    private void _run(final String data){
        Cocos2dxHelper.runOnGLThread(new Runnable() {
            @Override
            public void run() {
                Cocos2dxJavascriptJavaBridge.evalString(data);
            }
        });
    }

}

package com.umeng.soexample.wxcallback;
public interface IWxListenner {
    void onStart();
    void onSuccess(String data);
    void onError(String data);
    void onCancel();

}

package com.umeng.soexample;

import android.app.Application;
import com.umeng.commonsdk.UMConfigure;
import com.umeng.socialize.PlatformConfig;
import com.umeng.soexample.exceptions.MyUncaughtExceptionHandler;


public class App extends Application {

    @Override
    public void onCreate() {
        super.onCreate();

        //设置该类为系统默认处理类
        Thread.setDefaultUncaughtExceptionHandler(new MyUncaughtExceptionHandler());

        //友盟测试的
        UMConfigure.init(this, "59892f08310c9307b60023d0", "Umeng", UMConfigure.DEVICE_TYPE_PHONE,
                "669c30a9584623e70e8cd01b0381dcb4");
    }

    {
        //友盟测试的
        PlatformConfig.setWeixin("wxdc1e388c3822c80b", "3baf1193c85774b3fd9d18447d76cab0");
    }

}

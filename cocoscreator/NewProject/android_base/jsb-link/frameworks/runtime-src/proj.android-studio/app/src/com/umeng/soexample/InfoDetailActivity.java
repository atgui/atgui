package com.umeng.soexample;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.umeng.socialize.UMAuthListener;
import com.umeng.socialize.UMShareAPI;
import com.umeng.socialize.bean.SHARE_MEDIA;

import java.util.Map;

public class InfoDetailActivity extends Activity {

    private SHARE_MEDIA share_media;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        share_media = (SHARE_MEDIA) getIntent().getSerializableExtra("platform");

        UMShareAPI.get(InfoDetailActivity.this).getPlatformInfo(InfoDetailActivity.this, share_media, new UMAuthListener() {
            @Override
            public void onStart(SHARE_MEDIA share_media) {
                Log.e("TAG","开始获取信息");
            }

            @Override
            public void onComplete(SHARE_MEDIA share_media, int i, Map<String, String> map) {
                StringBuilder sb = new StringBuilder();
                for (String key : map.keySet()) {
                    sb.append(key).append(" : ").append(map.get(key)).append("\n");
                }
//                    result.setText(sb.toString());
                Log.e("TAG 成功:",sb.toString());
            }

            @Override
            public void onError(SHARE_MEDIA share_media, int i, Throwable throwable) {
//                    result.setText("错误" + throwable.getMessage());
                Log.e("TAG 错误:","错误" + throwable.getMessage());
            }

            @Override
            public void onCancel(SHARE_MEDIA share_media, int i) {
//                    result.setText("用户已取消");
                Log.e("TAG ","用户已取消");
            }

        });

    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        UMShareAPI.get(this).onActivityResult(requestCode,resultCode,data);
    }
}

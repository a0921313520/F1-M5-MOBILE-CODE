import HostConfig from '@/server/Host.config';
import { checkIsLogin } from '$SBTWOLIB/js/util';

/**
 * 後台推送
 *
 * window.signalR_connectFlag  //防止同時多個連線
 * window.signalR_connection    //當前使用的連線
 * window.signalR_onGetBroadcastSBMessage //獲取到全站群發訊息
 * window.signalR_onGetPrivateSBMessage  //獲取到單發個人訊息
 *
 **/
export function signalRConnect(forceReconnect = false) {
  if ((typeof window !== "undefined")) {
    const isLogin = checkIsLogin();
    if (!isLogin) {
      return;  //沒登入不使用
    }

    //懶加載script
    const existScript = document.getElementById("signalRLib");
    if (!existScript) {
      let signalRLib = document.createElement('script');
      signalRLib.id = 'signalRLib';
      signalRLib.src = process.env.BASE_PATH + '/js/jquery.signalR.min.js';
      document.getElementsByTagName('body')[0].appendChild(signalRLib);
    }
    if (typeof jQuery === "undefined" || !jQuery.hubConnection) {
      setTimeout(() => signalRConnect(forceReconnect), 1000);  //1秒後檢查是否加載完成
      return;
    }
  }
  if ((typeof window !== "undefined") && (typeof jQuery !== "undefined") && jQuery.hubConnection) {

    console.log('===signalRConnect with forceReconnect:',forceReconnect);

    if (window.signalR_connectFlag) { //防止重複連線
      console.log('===signalR hasOtherConnecting=>break');
      return true;
    }
    window.signalR_connectFlag = true;

    //有已存在的連線
    if (window.signalR_connection) {
      if (!forceReconnect) { //已存在，不用重連，直接返回
        console.log('===signalR exists=>break');
        window.signalR_connectFlag = false;
        return true;
      } else { //強制重連，先把目前的連線停掉
        try{
          window.signalR_connection.stop();
          console.log('===signalR stop ok');
        } catch (e) {
          console.log('===signalR stop has error??',e);
        }
      }
    }

    let connection = jQuery.hubConnection(HostConfig.Config.SignalRUrl);

    //收到推送的處理
    var proxy = connection.createHubProxy("ChatHub");
    proxy.on("broadcastSBMessage", function (messageID, messageTitle, messageContent, messageLanguage, messageCategoryId) {
      console.log('===signalR get broadcastSBMessage',messageID, messageTitle, messageContent, messageLanguage, messageCategoryId);

      const isLogin = checkIsLogin();
      if (!isLogin) {
        console.log('===signalR get broadcastSBMessage but exit due to not login...',messageID, messageTitle, messageContent, messageLanguage, messageCategoryId);
        return;
      }

      if (messageLanguage && (messageLanguage.toLowerCase() !== 'zh-cn')) {
        console.log('===signalR get broadcastSBMessage but exit due to language not match...',messageID, messageTitle, messageContent, messageLanguage, messageCategoryId);
        return;
      }

      if (window.signalR_onGetBroadcastSBMessage) {
        console.log('===signalR get broadcastSBMessage before raise event',messageID, messageTitle, messageContent, messageLanguage, messageCategoryId);
        window.signalR_onGetBroadcastSBMessage(messageID, messageTitle, messageContent, messageLanguage, messageCategoryId);
        console.log('===signalR get broadcastSBMessage after raise event',messageID, messageTitle, messageContent, messageLanguage, messageCategoryId);
      } else {
        console.log('===signalR get broadcastSBMessage but no event handler???',messageID, messageTitle, messageContent, messageLanguage, messageCategoryId);
      }
    });
    proxy.on("privateSBMessage", function (messageID, messageTitle, messageContent, messageLanguage, messageCategoryId) {
      console.log('===signalR get privateSBMessage',messageID, messageTitle, messageContent, messageLanguage, messageCategoryId);

      const isLogin = checkIsLogin();
      if (!isLogin) {
        console.log('===signalR get privateSBMessage but exit due to not login...',messageID, messageTitle, messageContent, messageLanguage, messageCategoryId);
        return;
      }

      if (messageLanguage && (messageLanguage.toLowerCase() !== 'zh-cn')) {
        console.log('===signalR get privateSBMessage but exit due to language not match...',messageID, messageTitle, messageContent, messageLanguage, messageCategoryId);
        return;
      }

      if (window.signalR_onGetPrivateSBMessage) {
        console.log('===signalR get privateSBMessage before raise event',messageID, messageTitle, messageContent, messageLanguage, messageCategoryId);
        window.signalR_onGetPrivateSBMessage(messageID, messageTitle, messageContent, messageLanguage, messageCategoryId);
        console.log('===signalR get privateSBMessage after raise event',messageID, messageTitle, messageContent, messageLanguage, messageCategoryId);
      } else {
        console.log('===signalR get privateSBMessage but no event handler???',messageID, messageTitle, messageContent, messageLanguage, messageCategoryId);
      }
    });

    console.log('===signalR start connect...');

    connection.start().done(function () {
      const token = localStorage.getItem("memberToken");
      token && proxy.invoke("MapMemberCode", token.replace(/Bearer\s|\"/g, ""), "zh-cn");
      proxy.invoke("JoinGroup", "SB");
      console.log("===signalR connected!!!",token);
      window.signalR_connection = connection;
      window.signalR_connectFlag = false;
    }).fail(function () {
      console.log("===signalR connect fail??? reconnect after 10 seconds...");
      window.signalR_connectFlag = false;
      setTimeout(() => signalRConnect(forceReconnect), 10000);  //10秒後重連
    });
  } else {
    console.log('===signalRConnect with forceReconnect:',forceReconnect,' but window not ready????');
    setTimeout(() => signalRConnect(forceReconnect), 10000);  //10秒後重連
  }
}

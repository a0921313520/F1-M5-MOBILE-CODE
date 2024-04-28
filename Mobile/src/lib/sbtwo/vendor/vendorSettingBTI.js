/*
* vendor設置，單獨分離 token,語言等 環境配置
*
* 在各產品/語言端，視實際狀況修改
*/

import {fetchRequest} from "../SportRequest";
import {ApiPort} from "../SPORTAPI";
import {vendorStorage} from "./vendorStorage";

//語言配置
export const vendorSettings = {
  LanguageCode: 'zh',  //中文
  //LanguageCode: 'en',  //英文
  //LanguageCode: 'vi',  //越南
  //LanguageCode: 'th',  //泰文
  //LanguageCode: 'in',  //印尼
}

//世界杯2022 默認配置
export const WCP2022SettingsDefault = {
  LeagueIds: ["297809749905506304"], //聯賽ID
}

//從gateway獲取登入token
export const getTokenFromGatewayImpl = (vendorInstance) => {
  vendorInstance.loginPromise =  new Promise(function (resolve, reject) {
    const hostname = 'imnative';
    fetchRequest(ApiPort.GETSBTToken + 'hostname=' + hostname + '&', 'GET')
      .then((data) => {

        //console.log('BTI token', data);

        if (!data.isSuccess) {
          vendorInstance.isGameLock = true;
          vendorInstance.loginPromise = null; //結束前清理掉
          reject('gameIsLoecked');
          return;
        }

        vendorInstance.isGameLock = false;
        if (data.result) {
          const btiToken = data.result;
          vendorStorage.setItem(
            "BTI_Token",
            JSON.stringify(btiToken)
          );

          const memberCode = vendorStorage.getItem('memberCode');
          if (memberCode) {
            vendorStorage.setItem(
              "BTI_MemberCode",
              memberCode
            );
          }

          vendorStorage.setItem(
            "BTI_Token_ExpireTime",
            JSON.stringify(new Date().getTime() + 10*60*1000) //10分鐘內有效
          );

          //調用BTI接口獲取jwt
          vendorInstance.BTILogin(btiToken)
            .then(r => {
              vendorInstance.loginPromise = null; //結束前清理掉
              resolve( { token: btiToken, jwt: r});
            })
            .catch(e =>{
              vendorInstance.loginPromise = null; //結束前清理掉
              reject('bti login error');
            });
        } else {
          vendorInstance.loginPromise = null; //結束前清理掉
          reject('no token?');
        }
      })
      .catch((error) => {
        vendorInstance.loginPromise = null; //結束前清理掉
        reject(error);
      })
  });

  return vendorInstance.loginPromise;
}


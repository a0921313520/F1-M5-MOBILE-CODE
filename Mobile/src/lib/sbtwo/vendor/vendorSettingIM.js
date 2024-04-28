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
  LanguageCode: 'CHS',  //中文
  //LanguageCode: 'ENG',  //英文
  //LanguageCode: 'VN',  //越南
  //LanguageCode: 'TH',  //泰文
  //LanguageCode: 'ID',  //印尼
}

//世界杯2022 默認配置
export const WCP2022SettingsDefault = {
  LeagueIds: [34055], //聯賽ID
}

//從gateway獲取登入token
export const getTokenFromGatewayImpl = (vendorInstance) => {
  vendorInstance.loginPromise =  new Promise(function(resolve, reject) {
    const hostname = 'imnative';
    fetchRequest( ApiPort.GetIMToken + 'hostname='+hostname+'&', 'GET')
      .then((data) => {

        //console.log('IM token',data);

        if (!data.isSuccess) {
          vendorInstance.isGameLocked = true;
          vendorInstance.loginPromise = null; //結束前清理掉
          reject('game Is Locked');
          return;
        }

        vendorInstance.isGameLocked = false;
        if (data.result) {
          const imToken = data.result;
          vendorStorage.setItem(
            "IM_Token",
            JSON.stringify(imToken)
          );

          const memberCode = vendorStorage.getItem('memberCode');
          if (memberCode) {
            vendorStorage.setItem(
              "IM_MemberCode",
              memberCode
            );
          }

          vendorStorage.setItem(
            "IM_Token_ExpireTime",
            JSON.stringify(new Date().getTime() + 10*60*1000) //10分鐘內有效
          );

          vendorInstance.loginPromise = null; //結束前清理掉

          vendorInstance._queryIMmemberType(); //獲取用戶水位

          resolve(imToken);
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


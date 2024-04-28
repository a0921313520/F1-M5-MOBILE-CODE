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
  LanguageCode: 'cs',  //中文
  //LanguageCode: 'en',  //英文
  //LanguageCode: 'vn',  //越南
  //LanguageCode: 'th',  //泰文
  //SABA 無印尼
}

//世界杯2022 默認配置
export const WCP2022SettingsDefault = {
  LeagueIds: [110287], //聯賽ID
  OutrightLeagueGroupName: 'World Cup Specials', //猜冠軍用的過濾條件
}

//從gateway獲取登入token
export const getTokenFromGatewayImpl = (vendorInstance) => {
  vendorInstance.loginPromise =  new Promise(function(resolve, reject) {
    const hostname = 'imnative';
    fetchRequest( ApiPort.GetSABAToken + 'hostname='+hostname+'&', 'GET')
      .then((data) => {

        //console.log('=====SABA token',data);

        // debug用 模擬 token獲取失敗
        // if (VendorSABAInstance && VendorSABAInstance.tokenerr) {
        //   console.log('=====SABA token 500');
        //   reject(500);
        //   VendorSABAInstance.tokenerr = false;
        // }

        // let data = {
        //   isGameLocked:false,
        //   memberCode: JSON.parse(localStorage.getItem('memberCode')),
        //   token: 'not implement la',
        // }

        if (!data.isSuccess) {
          vendorInstance.isGameLocked = true;
          vendorInstance.loginPromise = null; //結束前清理掉
          reject('game Is Locked');
          return;
        }

        vendorInstance.isGameLocked = false;
        if (data.result) {
          const sabaToken = data.result;
          vendorStorage.setItem(
            "SABA_Token",
            JSON.stringify(sabaToken)
          );

          const memberCode = vendorStorage.getItem('memberCode');
          if (memberCode) {
            vendorStorage.setItem(
              "SABA_MemberCode",
              memberCode
            );
          }

          vendorStorage.setItem(
            "SABA_Token_ExpireTime",
            JSON.stringify(new Date().getTime() + 10*60*1000) //10分鐘內有效
          );

          vendorInstance.loginPromise = null; //結束前清理掉

          resolve( { token: sabaToken });
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


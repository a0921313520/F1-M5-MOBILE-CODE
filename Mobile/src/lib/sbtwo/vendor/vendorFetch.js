/**
* Vendor fetch共用模組
* 此模組封裝了 fetch 函數，並增加了日誌記錄功能。
* 目前僅下注、cash out、get token會進行日誌記錄。
* 
* - fetchRequestSBVendor： 用於sb vendor API。
* - fetchRequestSBT：用於使用 sbtFetch() 函數的地方。
*/
import {sbtFetch} from 'sbtech-general-api-client';
import { LogPost } from '@/server/Log';
const from = "SB";

const sbSharedFetchRequest = (url, requestConfig, isSbtFetch = false) => {
  console.log('requestConfig ', requestConfig);

  const { options = "", method, params = "" } = requestConfig;
  let logData = { method: params?.method, responseStatus: 0, request_time: new Date(), responseData: null };

  return new Promise((resolve, reject) => {
    const fetchAction = isSbtFetch ? sbtFetch(url, options)[method](params) : fetch(url, options);

    fetchAction
      .then(async (response) => {

        // 僅單純包裝fetch，這裡返回raw response，讓調用方處理後續
        resolve(response);

        if(isSbtFetch){
          // sbtFetch()返回的會是已解析的資料，取不到status，用預設0
          // 要取到可能得改sbtech-general-api-client套件，比較麻煩
          logData.responseStatus = 0;
          logData.responseData = response;
          logData.log_level = ""; //直接指定空
        } else {
          logData.responseStatus = response.status

          const headers = response.headers;
          const contentType = headers?.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            /*
              因為調用方會 .json() 解析 response，
              所以這裡不能直接用 response.json() 解析數據 (不能解析兩次)。
              為了解決這個問題，這裡使用 response.clone() 創建一個新的響應對象副本，
              然後再用 .json() 從副本解析數據給 log 紀錄。
            */
            logData.responseData = await response.clone().json();
          }
        }

        LogPost(url, params, logData, {from});
      })
      .catch((err) => {
        reject(err);
        logData.error = err;
        if (err && (JSON.stringify(err) === '{}')) {
          let newError = {};
          if (err.message) {
            newError.message = err.message;
          }
          if (err.stack) {
            newError.stack = err.stack;
          }
          if (JSON.stringify(newError) !== '{}') {
            logData.error = newError;
          }
        }
        LogPost(url, params, logData, {from});
      });
  });
};

export const fetchRequestSBVendor = (url, params = "") => {
  return sbSharedFetchRequest(url, { options: params, method: params?.method }, false);
};

export const fetchRequestSBT = (requestConfig) => {
  return sbSharedFetchRequest(requestConfig.url, requestConfig, true);
};

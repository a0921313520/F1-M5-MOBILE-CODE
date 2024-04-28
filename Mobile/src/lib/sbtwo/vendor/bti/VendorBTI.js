import HostConfig from '../vendorHostConfig';
import {vendorSettings, WCP2022SettingsDefault, getTokenFromGatewayImpl} from '../vendorSettingBTI';
import {envSettings} from '../vendorSetting';
import i18n from '../vendori18n';
import md5 from "crypto-js/md5";
import moment from 'moment';
import SportData from '../data/SportData'
import MarketData from "../data/MarketData";
import LeagueData from "../data/LeagueData";
import EventData from "../data/EventData";
import LineData from "../data/LineData";
import SelectionData from "../data/SelectionData";
import OddsData from "../data/OddsData";
import {
  CashOutStatusType,
  EventChangeType,
  OddsType,
  SelectionStatusType,
  SortWays, SpecialUpdateType,
  VendorConfigs,
  VendorErrorType, VendorMarketNames, VendorMarkets,
  WagerType
} from "../data/VendorConsts";
import EventChangeData from "../data/EventChangeData";
import PollingResult from "../data/PollingResult";
import SearchEventData from "../data/SearchEventData";
import SearchLeagueData from "../data/SearchLeagueData";
import BetSettingData from "../data/BetSettingData";
import BetSelectionResultData from "../data/BetSelectionResultData";
import BetResultData from "../data/BetResultData";
import WagerData from "../data/WagerData";
import WagerItemData from "../data/WagerItemData";
import { SportsDataApiClient, TimeRange, tokenService, Query } from 'sbtech-sports-data-api-client';
import {sbtFetch} from 'sbtech-general-api-client'
import {
  BTIAcceptMode,
  BTIDataTypes, BTIForceDecimalBetTypeIds,
  BTIOddsType, BTIOddsTypeForBet, BTIOddsTypeToNumber,
  BTISelectionStatus,
  BTISports,
} from "./BTIConsts";
import AnnouncementData from "../data/AnnouncementData";
import VendorError from "../data/VendorError";
import BetInfoData from "../data/BetInfoData";
import SelectionChangeData from "../data/SelectionChangeData";
import VendorBase from "../data/VendorBase";
import EventInfo from "../data/EventInfo";
import FreeBetData from "../data/FreeBetData";
import {Decimal} from "decimal.js";
import {v4 as uuidv4} from "uuid";
import {vendorStorage} from '../vendorStorage';
import SearchSportData from "../data/SearchSportData";
import CashOutResultData from "../data/CashOutResultData";
import { fetchRequestSBT, fetchRequestSBVendor } from "../vendorFetch";

/**
 * BTI 體育接口
 */
class VendorBTI extends VendorBase {
  //Singleton
  constructor () {
    if (!VendorBTI._instance) {
      super({
        MaxParlay: 20, //串關最多選幾個
        VendorName: 'BTI', //供應商名稱
        VendorPage: '/sports-bti', //主頁鏈接
        EventIdType: 'string', //EventId數據形態: int/string
        HasLeagueIcon: true, //是否有聯賽Icon
        HasTeamIcon: true, //是否有隊伍Icon
        HasCashOut: true, //是否支持提前兌現
      });
      this.WCP2022Settings = Object.assign({},WCP2022SettingsDefault); //WCP2022 複製配置，支持從CACHE API即時覆蓋
      this.tokenServiceInstance = tokenService;
      console.log('VendorBTI new instance');
      VendorBTI._instance = this;
    }
    return VendorBTI._instance
  }

  _getLoginInfo(){
    if (typeof window !== "undefined") {
      if (vendorStorage.getItem("loginStatus") == 1) {
        const token = JSON.parse(vendorStorage.getItem("BTI_Token"));
        const memberCode = JSON.parse(vendorStorage.getItem("BTI_MemberCode"));
        const jwt = JSON.parse(vendorStorage.getItem("BTI_JWT"));

        //jwt是另外獲取的 不一定要同時有
        if (token && memberCode) return {token, memberCode, jwt};
      }
    }
    return null
  }

  //renew節流，避免短時間重複執行多次，被bti擋下來
  _renewToken_throttle() {
    if (this._renewToken_throttle_handle) {
      //console.log('===太頻繁...不執行renew...')
      return false;
    }

    let that = this;
    this._renewToken_throttle_handle = setTimeout(function () {
      clearTimeout(that._renewToken_throttle_handle);
      that._renewToken_throttle_handle = null;
      //console.log('===clear renew handle',JSON.stringify(that._renewToken_throttle_handle));
    }, 60*1000); //1分鐘節流

    //console.log('===可以執行renew...')

    return true;
  }

  //從gateway獲取登入token
  getTokenFromGateway() {
    return getTokenFromGatewayImpl(this);
  }

  //檢查已存在的jwt是否可用 - 避免異步同時請求問題
  _checkAndReGetJWTPromise = null;

  //檢查已存在的jwt是否可用
  _checkAndReGetJWT(jwt, gatewayToken=null) {

    //避免異步同時請求問題
    if (this._checkAndReGetJWTPromise) {
      return this._checkAndReGetJWTPromise;
    }

    //console.log('check JWT of ',jwt);

    tokenService.stopAutoRenew();  //先暫停刷新token

    let that =this;
    this._checkAndReGetJWTPromise = new Promise((resolve, reject) => {
      if (!that._renewToken_throttle()) {
        //視為renew成功
        vendorStorage.setItem(
          "BTI_JWT",
          JSON.stringify(jwt)
        );

        that._checkAndReGetJWTPromise = null; //結束前清理掉
        return resolve(jwt);
      }

      const tokenFetchParams = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          //domainid: HostConfig.Config.BTIDomainId,
          Authorization: 'Bearer ' + jwt,
        },
      };
      fetchRequestSBVendor(HostConfig.Config.BTIAuthApiProxy + 'auth/v2/renew', tokenFetchParams)
        .then(function (renewResponse) {
          if([200,201].indexOf(renewResponse.status) === -1)
          {
            throw renewResponse.status //丟出異常
          }
          return renewResponse.json();
        })
        .then(function (renewJsonData) {

          //renew成功
          vendorStorage.setItem(
            "BTI_JWT",
            JSON.stringify(renewJsonData.jwt)
          );

          that._checkAndReGetJWTPromise = null; //結束前清理掉
          resolve(renewJsonData.jwt);
        })
        .catch(err => {
          if (err === 401) {
            //處理401 token過期
            console.log('renew token got 401');

            vendorStorage.removeItem("BTI_JWT"); //刪除已存的token

            //匿名token過期，嘗試重新獲取
            that.BTILogin(gatewayToken).then(r => {
              that._checkAndReGetJWTPromise = null; //結束前清理掉
              resolve(r)
            }).catch(err2 => reject(err2));
          } else {
            that._checkAndReGetJWTPromise = null; //結束前清理掉
            reject(err);
          }
        });
    })

    return this._checkAndReGetJWTPromise;
  }

  //配置token service - 避免異步同時請求問題
  _initTokenServicePromise = null;

  //配置token service
  _initTokenService(jwt) {

    //避免異步同時請求問題
    if (this._initTokenServicePromise) {
      return this._initTokenServicePromise;
    }

    //console.log('initTokenService of ',jwt);

    tokenService.stopAutoRenew();  //先暫停刷新token

    let that =this;
    //token會過期，配置token刷新(renew)的請求
    const renewTokenRequest = () => {
      return new Promise(resolve => {

        if (!that._renewToken_throttle()) {
          //視為renew成功
          vendorStorage.setItem(
            "BTI_JWT",
            JSON.stringify(jwt)
          );

          //從token-service renew token源碼反推  要提供的數據形態
          return resolve({access_token: jwt});
        }


        const tokenFetchParams = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            //domainid: HostConfig.Config.BTIDomainId,
            Authorization: 'Bearer ' + tokenService.apiAccessToken,
          },
        };
        fetchRequestSBVendor(HostConfig.Config.BTIAuthApiProxy + 'auth/v2/renew', tokenFetchParams)
          .then(function (renewResponse) {
            return renewResponse.json();
          }).then(function (renewJsonData) {

          vendorStorage.setItem(
            "BTI_JWT",
            JSON.stringify(renewJsonData.jwt)
          );

          //從token-service renew token源碼反推  要提供的數據形態
          resolve({access_token: renewJsonData.jwt});
        })
      })
    }

    const tokenConfig = {
      tokenRenewInterval: 10 * 60 * 1000,  //10分renew一次
      tokenRenewProvider: renewTokenRequest,
    }
    //配置取到的jwt
    tokenService.apiAccessToken = jwt;

    this._initTokenServicePromise = new Promise(resolve => {
      tokenService.init(tokenConfig)
        .then(() => {

          vendorStorage.setItem(
            "BTI_JWT",
            JSON.stringify(jwt)
          );

          //開始自動刷新token
          tokenService.startAutoRenew();

          that._initTokenServicePromise = null; //結束前清理掉
          resolve(jwt);
        })
    });

    return this._initTokenServicePromise;
  }

  //離開SB2.0時，中止自動刷新token程序
  async stopTokenRenewWhenLeave() {
    let that = this;
    if (this._initTokenServicePromise) {
      return this._initTokenServicePromise
        .then(newtoken => {
          that.tokenServiceInstance.stopAutoRenew();
          that.tokenServiceInstance.isInitialized = false;
        })
    } else {
      return new Promise(resolve => {
        that.tokenServiceInstance.stopAutoRenew();
        that.tokenServiceInstance.isInitialized = false;
        resolve();
      })
    }
  }

  //需要先登入，獲取jwt，才能查詢SportsData接口
  BTILogin(token = null) {
    let that = this;
    const canUseLoginPromise = (this.loginPromise === null); //判斷可不可以使用loginPromise
    const thisPromise = new Promise(function(resolve, reject) {
      const fetchParams = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          //domainid: HostConfig.Config.BTIDomainId,
        },
      };

      let apiName = 'auth/v2/anonymous';
      if (token) {
        apiName = 'auth/v2/login';
        fetchParams.body = JSON.stringify({'token': token});
      }

      tokenService.stopAutoRenew();  //先暫停刷新token
      that._renewToken_throttle(); //登入也會獲取token，所以也要併入renew節流，但是不用判斷，單純觸發一下，避免頻繁調用renew

      const url = HostConfig.Config.BTIAuthApiProxy + apiName;
      fetchRequestSBVendor(url, fetchParams)
        .then(function (response) {
          return response.json();
        }).then(function (jsonData) {
          //console.log('BTI LOGIN', url, fetchParams, jsonData);

          if (jsonData && jsonData.success == true) {
            const jwt_token = jsonData.jwt;
            //登入後配置tokenservice

            that._initTokenService(jwt_token)
              .then(r => {
                if (canUseLoginPromise) {
                  that.loginPromise = null; //結束前清理掉
                }
                resolve(r)
              });

          } else {
            let thiserror = 'unknown error';
            if (jsonData.message) {
              thiserror = jsonData.message
            }
            console.log('BTI LOGIN', url, fetchParams,'get error:', thiserror);
            if (canUseLoginPromise) {
              that.loginPromise = null; //結束前清理掉
            }
            reject(thiserror);
          }
        })
        .catch((error) => {
          console.log('BTI LOGIN', url, fetchParams, 'has error', error);
          if (canUseLoginPromise) {
            that.loginPromise = null; //結束前清理掉
          }
          reject(error);
        });
    })

    if(canUseLoginPromise) {
      this.loginPromise = thisPromise;
    }
    return thisPromise;
  }

  //檢查登入和token - 避免異步同時請求問題
  _checkAndWaitLoginPromise = null;

  //等待登入完成
  //如果沒有登入，獲取匿名token
  _checkAndWaitLogin(){

    //避免異步同時請求問題
    if (this._checkAndWaitLoginPromise) {
      return this._checkAndWaitLoginPromise;
    }

    // 分三步
    //
    // 1.登入
    // 2.取gateway token
    // 3.取Vendor jwt + 需要把 jwt 配置到 tokenservice 且頁面刷新後，需要重新配置tokenservice
    //
    // 2.3都是異步請求，有可能失敗，或被刷新頁面中斷，所以才有下面這堆複雜的檢查
    this._checkAndWaitLoginPromise = new Promise((resolve,reject) => {
      if (vendorStorage.getItem("loginStatus") == 1) {
        //有登入
        if (this.loginPromise) {
          // 如果在登入中，等待登入完成
          this.loginPromise.then(result => {
            if (!tokenService.isInitialized) { //必須檢查tokenService是否配置
              this._initTokenService(result.jwt).then(r => resolve(r));
            } else {
              resolve(result.jwt);
            }
          });
        }else {
          //沒有loginPromise則檢查緩存數據
          const loginInfo = this._getLoginInfo();
          if (loginInfo) {
            //有緩存數據，檢查是否有拿到jwt
            if (loginInfo.jwt) {
              //有jwt
              if (!tokenService.isInitialized) { //必須檢查tokenService是否配置
                //檢查緩存的jwt是否可用
                this._checkAndReGetJWT(loginInfo.jwt,loginInfo.token).then(newJwt => {
                  if (tokenService.isInitialized) {
                    //如果token過期，會直接配置tokenService，直接返回即可
                    resolve(newJwt);
                  } else {
                    this._initTokenService(newJwt).then(r => resolve(r))
                  }
                })
                } else {
                resolve(loginInfo.jwt);
              }
            } else {
              //沒有jwt，可能登入後還沒來得及拿到jwt就刷新了，嘗試用token重新獲取
              this.BTILogin(loginInfo.token).then(r => resolve(r)).catch(err => reject(err));
            }
          } else {
            //沒有緩存數據,可能登入後還沒來得及拿到token就刷新了，嘗試重新獲取
            this.getTokenFromGateway().then(r => resolve(r))
          }
        }
      } else {
        //沒登入(guest view) 檢查是否有拿到匿名token
        const jwt = JSON.parse(vendorStorage.getItem("BTI_JWT"));
        if (jwt) {
          if (!tokenService.isInitialized) { //必須檢查tokenService是否配置
            //檢查緩存的jwt是否可用
            this._checkAndReGetJWT(jwt).then(newJwt => {
              if (tokenService.isInitialized) {
                //如果token過期，會直接配置tokenService，直接返回即可
                resolve(newJwt);
              } else {
                this._initTokenService(newJwt).then(r => resolve(r))
              }
            })
          } else {
            resolve(jwt);
          }
        } else {
          //沒有匿名token，嘗試重新獲取
          this.BTILogin().then(r => resolve(r));
        }
      }
    })

    return this._checkAndWaitLoginPromise;
  }

  /**
   * 調用 BTI 數據 接口
   *
   * @param dataName
   * @param queryOptions
   * @param onUpdate
   * @param onError
   * @returns {Promise<unknown>}
   * @private
   */
  async _btiDataFetch(dataName, queryOptions, onUpdate = null, onError = null) {

    await this._checkAndWaitLogin(); //需要等待登入後才能查詢

    const isPush = (onUpdate !== null);

    if (!queryOptions['query']) {
      queryOptions['query'] = '';
    }

    if (!queryOptions['params']) {
      queryOptions['params'] = {};
    }

    if(isPush) {
      if (queryOptions['params']['initialData'] !== false) {
        queryOptions['params']['initialData'] = true;
      }
    }

    if (!queryOptions['locale']) {
      queryOptions['locale'] = vendorSettings.LanguageCode;
    }

    let that = this;
    return new Promise(function(resolve, reject) {
      const config = { sportsApiUrl: HostConfig.Config.BTIApi + 'sportsdata/v2' }
      const sbtClient = new SportsDataApiClient(config);

      if (!isPush) {
        //查詢-拉模式
        return sbtClient[dataName].pull(queryOptions).then((response) => {
          //console.log('_btiDataFetch QUERY', dataName, queryOptions, response);
          resolve(response);
        }).catch(error => {
          console.log('_btiDataFetch QUERY has error', dataName, queryOptions, error);
          let thiserror = new VendorError();
          if (error.status === 401) { //未登入
            thiserror = VendorError.fromBTIError(error.status);
          }
          reject(thiserror);
        });
      } else {
        //推送模式
        const subscription = sbtClient[dataName].subscribe(queryOptions,
          (response) => {
            //console.log('_btiDataFetch GETPUSH', dataName, queryOptions, response);
            if (onUpdate) {
              onUpdate(response);
            }
          },
          (error) => {
            console.log('_btiDataFetch GETPUSH has error', dataName, queryOptions, error);
            if (onError) {
              onError(error);
            }
          }
        );
        resolve(subscription);
      }

    });
  }

  /**
   * 調用 BTI 數據 接口 自己實現的版本 只支持pull
   *
   * @param dataName
   * @param queryOptions
   * @returns {Promise<unknown>}
   * @private
   */
  async _btiDataPull(dataName, queryOptions) {

    await this._checkAndWaitLogin(); //需要等待登入後才能查詢

    if (!queryOptions['query']) {
      queryOptions['query'] = '';
    }

    if (!queryOptions['params']) {
      queryOptions['params'] = {};
    }

    if (!queryOptions['locale']) {
      queryOptions['locale'] = vendorSettings.LanguageCode;
    }

    const fetchParams = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        //domainid: HostConfig.Config.BTIDomainId,
        Authorization: 'Bearer ' + tokenService.apiAccessToken,
      },
    };

    //這段從BTI官方庫的 query.js抄來的，並加上count支持
    const composeQueryUrl = (query) => {
      var includeMarketsParam = query.params["includeMarkets"] ? "&includeMarkets=" + encodeURIComponent("" + query.params["includeMarkets"]) : "";
      var fromParam = query.params["from"] ? "&from=" + DurationFilter.formatDate(query.params["from"]) : "";
      var untilParam = query.params["until"] ? "&until=" + DurationFilter.formatDate(query.params["until"]) : "";
      var timeRangeParam = query.params["timeRange"] ? "&timeRange=" + query.params["timeRange"] : "";
      var initialData = query.params["initialData"] ? "&initialData=" + query.params["initialData"] : "";
      var format = query.format ? "&format=" + query.format : "";
      var locale = "&locale=" + (query.locale || defaultLocale);
      var projection = query.params["projection"] ? "&projection=" + query.params["projection"] : "";
      var count = query.params["count"] ? "&count=" + query.params["count"] : "";
      var queryUrl = "?query=" + encodeURIComponent(query.query) + projection + includeMarketsParam + locale + fromParam + timeRangeParam + initialData + untilParam + format + count;
      return queryUrl;
    }

    const url = HostConfig.Config.BTIApi + 'sportsdata/v2/' + dataName + composeQueryUrl(queryOptions);

    let that = this;
    return new Promise(function(resolve, reject) {
      //只支持查詢-拉模式
      return fetch(url, fetchParams)
        .then(function (response) {
          return response.json();
        }).then(function (jsonResponse) {
          //console.log('_btiDataFetch QUERY', dataName, queryOptions, jsonResponse);
          resolve(jsonResponse);
        }).catch(error => {
          console.log('_btiDataPull QUERY has error', dataName, queryOptions, error);
          let thiserror = new VendorError();
          if (error.status === 401) { //未登入
            thiserror = VendorError.fromBTIError(error.status);
          }
          reject(thiserror);
        });
    });
  }

  /**
   * BTI搜尋接口
   *
   * @param queryText
   * @private
   */
  async _btiSearchFetch(queryText) {
    if (!queryText || queryText.length < 3) {
      throw i18n.BTI.SEARCH_NOTICE;
    }

    await this._checkAndWaitLogin(); //需要等待登入後才能查詢

    let that = this;
    return new Promise(function(resolve, reject) {
      const url =  HostConfig.Config.BTIApi + 'sportsdata/v2/search?locale=' + vendorSettings.LanguageCode + '&query=' + queryText;

      sbtFetch(url).get()
        .then(function(jsonData){
          if (jsonData) {
            //console.log('_btiSearchFetch', url, jsonData);
            resolve(jsonData);
          } else {
            let thiserror = '999';
            if (jsonData && jsonData.description) {
              thiserror = jsonData.description
            }
            console.log('_btiSearchFetch', url, 'get error:', thiserror);
            reject(thiserror);
          }
        })
        .catch((error) => {
          console.log('_btiSearchFetch', url, 'has error', error);
          reject(error);
        });
    });
  }

  async _btiAnnouncementFetch(limit =500) {
    return new Promise(function(resolve, reject) {
      const url =  HostConfig.Config.BTIAnnouncements + '?lang=' + vendorSettings.LanguageCode  + '&limit=' + limit

      const fetchParams = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      };

      fetch(url,fetchParams)
        .then(response => response.json())
        .then(jsonData => {
          //console.log('_btiAnnouncementFetch', url, jsonData);
          resolve(jsonData);
        })
        .catch((error) => {
          console.log('_btiAnnouncementFetch', url, 'has error', error);
          reject(error);
        });
    });
  }

  /**
   * BTI投注接口
   *
   * @param dataName 接口名
   * @private
   */
  async _btiBettingFetch(dataName, params, method='post') {

    await this._checkAndWaitLogin(); //需要等待登入後才能查詢

    let that = this;
    return new Promise(function(resolve, reject) {
      const url =  HostConfig.Config.BTIApi + 'betting/v2/' + dataName;
      let options = null;
      if (envSettings.isApp //變更user-agent 只有app有用, mobile因為chrome限制無法改
        && (dataName === BTIDataTypes.PLACEBETS)) {
        options = {headers: {"User-Agent":"MobileApp"}}  //BTI官方要求修改Header判斷投注來源
      }

      // 需要紀錄log的api，下注和cash out
      const functionName = (dataName === BTIDataTypes.PLACEBETS) ? fetchRequestSBT({
        url,
        options,
        method,
        params
      }) : sbtFetch(url,options)[method](params);

      functionName.then(function(jsonData){
          if (jsonData && !jsonData.description) {
            //console.log('_btiBettingFetch', url, params, jsonData);
            resolve(jsonData);
          } else {
            let thiserror = '999';
            if (jsonData && jsonData.description) {
              thiserror = jsonData.description
            }
            console.log('_btiBettingFetch get error', url, params, thiserror);
            reject(thiserror);
          }
        })
        .catch((error) => {
          console.log('_btiBettingFetch has error', url, params, error);
          let thiserror = new VendorError();
          if (error.status === 401) { //未登入
            thiserror = VendorError.fromBTIError(error.status);
          } else if (error.status === 400 || error.status === 422 ) { //報錯，查看statusCode
            return error.json.then(jsonData => {
              thiserror = VendorError.fromBTIError(jsonData.statusCode,'',jsonData);
              reject(thiserror);
            })
          }
          reject(thiserror);
        });
    });
  }

  /**
   * BTI注單接口
   *
   * @param dataName
   * @param startDate
   * @param endDate
   * @private
   */
  async _btiWagerFetch(dataName, startDate = null, endDate = null, purchaseId = null) {

    await this._checkAndWaitLogin(); //需要等待登入後才能查詢

    let that = this;
    return new Promise(function(resolve, reject) {
      let url =  HostConfig.Config.BTIApi + 'betsreporting/v1/bets/' + dataName + '?locale=' + vendorSettings.LanguageCode + '&projection=details';

      if (startDate !== null) {
        url += '&fromDate=' + moment(startDate).toISOString();
      }

      if (endDate !== null) {
        url += '&toDate=' + moment(endDate + ' 23:59:59.999').toISOString(); //結束日期要帶到23:59:59
      }

      if (purchaseId !== null) {
        url += '&purchaseId=' + purchaseId;
      }

      sbtFetch(url).get()
        .then(function(jsonData){
          if (jsonData && jsonData.bets) {
            //console.log('_btiWagerFetch', url, jsonData);
            resolve(jsonData);
          } else {
            let thiserror = '999';
            if (jsonData && jsonData.description) {
              thiserror = jsonData.description
            }
            console.log('_btiWagerFetch', url, 'get error:', thiserror);
            reject(thiserror);
          }
        })
        .catch((error) => {
          console.log('_btiWagerFetch', url, 'has error', error);
          reject(error);
        });
    });
  }

  /**
   * bti cashout接口
   *
   * @param dataName 接口名
   * @private
   */
  async _btiCashOutFetch(dataName, queryOptions={}) {

    await this._checkAndWaitLogin(); //需要等待登入後才能查詢

    let fetchMethod = 'GET';
    if (queryOptions.POST) {
      fetchMethod = 'POST';
    }

    let fetchParams = {
      method: fetchMethod,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + tokenService.apiAccessToken,
      },
    };

    if (queryOptions.POST && queryOptions.jsonBody) { //GetParlayTickets使用
      fetchParams.body = queryOptions.jsonBody;
    }

    const url = HostConfig.Config.BTIRougeApi + 'cashout/' + dataName;

    return new Promise(function(resolve, reject) {
      return fetchRequestSBVendor(url, fetchParams)
        .then(function (response) {
          if([401].indexOf(response.status) !== -1)
          {
            throw response.status //丟出異常
          }
          return response.json();
        }).then(function (jsonResponse) {
          //console.log('===_btiCashOutFetch QUERY', dataName, queryOptions, jsonResponse);
          if (jsonResponse.statusCode && jsonResponse.statusCode === 400 && jsonResponse.errorCode) { //處理報錯
            throw jsonResponse.errorCode;
          }
          resolve(jsonResponse);
        }).catch(error => {
          //console.log('===_btiCashOutFetch QUERY has error', dataName, queryOptions, error);
          let thiserror = new VendorError();
          if (error) {
            thiserror = VendorError.fromBTIError(error);
          }
          reject(thiserror);
        });
    });
  }

  //獲取體育項目，返回為 PollingResult 格式
  async getSports() {

    //獲取收藏賽事
    const favEvents = await this.getFavouriteEvents();

    const SportAllPromise = this._btiDataFetch(BTIDataTypes.SPORTS,{});

    const oneDayAfter = moment().add(1,'day').toISOString();

    //今日 要另外算
    const SportTodayPromise = this._btiDataFetch(BTIDataTypes.SPORTS,{
      params: {
        from: '',
        until: oneDayAfter,
      }
    });

    return Promise.all([SportAllPromise,SportTodayPromise]).then(async values => {
      const sportAll = values[0].data;
      const sportToday = values[1].data;

      let SportDatas = sportAll.map(sportsAll => {
        const SportsTodays = sportToday.filter(todayitem => todayitem.id === sportsAll.id);
        const sportsToday = SportsTodays[0];

        //原本bti api 返回count是有live總數的，不知道何時改了
        //fixturesTotalCount 無視時間條件, "不含"live的總數，但是不包含冠軍賽
        //fixturesCount 當前時間條件,"不含"live的總數，但是不包含冠軍賽

        //以這個時間條件，sportsToday.fixturesCount 不包含live , [今日]需要包含滾球，要加上去
        let todayCount = (sportsToday ? sportsToday.fixturesCount : 0) + sportsAll.liveFixturesTotalCount;
        //總數不包含滾球，所以只扣sportsToday.fixturesCount，不使用上面包含滾球的數量
        const earlyCount = sportsAll.fixturesTotalCount - (sportsToday ? sportsToday.fixturesCount : 0);

        const favEventsForThisSport = favEvents.filter(favItem => parseInt(sportsAll.id) === favItem.SportId);

        return new SportData(
          parseInt(sportsAll.id),
          sportsAll.name,
          sportsAll.fixturesTotalCount,
          [ //順序 滾球 今天 早盤 關注 優勝冠軍
            new MarketData(VendorMarkets.RUNNING, VendorMarketNames[VendorMarkets.RUNNING], sportsAll.liveFixturesTotalCount ),
            new MarketData(VendorMarkets.TODAY, VendorMarketNames[VendorMarkets.TODAY], todayCount ),
            new MarketData(VendorMarkets.EARLY, VendorMarketNames[VendorMarkets.EARLY], earlyCount ),
            new MarketData(VendorMarkets.FAVOURITE, VendorMarketNames[VendorMarkets.FAVOURITE], favEventsForThisSport.length ),
            new MarketData(VendorMarkets.OUTRIGHT, VendorMarketNames[VendorMarkets.OUTRIGHT], sportsAll.outrightsTotalCount)
          ]
        )
      });

      //世界杯2022Tab數據
      await this.addWCP2022SportData(favEvents, SportDatas);

      return new PollingResult(SportDatas);
    })
  }

  //獲取聯賽，search用
  async getLeagues() {

    //先獲取數量
    let leagueCount = await this._btiDataPull(BTIDataTypes.LEAGUES,{
      query: "$filter=sportId ne 'xxx'",  //必須帶filter，用 != 一個不存在的 來帶出全部數據
      params: {count: true}
    }).then(function (jsonData) {
      return jsonData.data ?? 0;
    });

    leagueCount = parseInt(leagueCount);

    console.log('===getLeagues',leagueCount);

    if (leagueCount <=0) {
      return [];  //沒數據返回空數組
    }

    //然後分頁查
    let queryString = "$filter=sportId ne 'xxx'";
    const pageSize = 80; //一頁80
    const maxPageNo = Math.ceil(leagueCount / pageSize);

    let queryPromises = [];
    for (let currentPageNo = 1; currentPageNo <= maxPageNo; currentPageNo++) {
      let thisSkipValue = (currentPageNo - 1) * pageSize;
      let thisQueryString = queryString + `&$skip=${thisSkipValue}&$top=${pageSize}`;

      let thisPromise = this._btiDataPull(BTIDataTypes.LEAGUES, {
        query: thisQueryString,
      })

      queryPromises.push(thisPromise);
    }

    return Promise.all(queryPromises).then(resultArray => {
      let allDatas = [];
      resultArray.map(jsonData => {
        const data = jsonData.data;
        allDatas = allDatas.concat(data);
      })
      return allDatas;
    });
  }

  //獲取比賽列表 公用查詢參數 返回 {queryString, params}
  _getEventQueryInfo(SportId = BTISports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null, EventIds = [], IsRunningToday = false, favEvents=[]) {

    //世界杯2022處理
    let isWCP2022 = false;
    if (SportId === BTISports.WCP2022) {
      isWCP2022 = true;
      SportId = BTISports.SOCCER; //改回查足球數據
    }

    let params = {
      //限縮投注線，減少數據量
      includeMarkets: "$filter=marketType/id in ('2_0','2_1','2_2','2_39','3_0','3_1','3_2','3_39','60')",  //2表示讓球盤 3表示大小盤  後面的012表示全 上半 下半 場 39為滾球投注 60波膽(bti叫正確比分)
    }

    //優勝冠軍不用過濾投注線
    if (MarketId === VendorMarkets.OUTRIGHT) {
      delete params['includeMarkets'];
    }

    const oneDayAfter = moment().add(1,'day').toISOString();

    let queryString = '$filter=';
    //體育類型
    queryString += `sportId eq '${SportId}'`;

    if (MarketId === VendorMarkets.OUTRIGHT) {
      //只選猜冠軍
      queryString += " and type eq 'Outright'";
    } else {
      //其他所有市場：包含關注(收藏)，都排除猜冠軍
      queryString += " and type eq 'Fixture'";
    }

    //世界杯2022過濾聯賽
    if (isWCP2022) {
      if (this.WCP2022Settings.LeagueIds && this.WCP2022Settings.LeagueIds.length === 1) {
        queryString += ` and leagueId eq '${this.WCP2022Settings.LeagueIds[0]}'`;
      } else {
        queryString += ` and leagueId in (${this.WCP2022Settings.LeagueIds.join('\',\'')})`;
      }
    }

    //市場
    if (MarketId === VendorMarkets.EARLY) {
      //早盤-一天後
      queryString += ' and isLive eq false';
      params.from = oneDayAfter;
      params.until = moment().add(10,'year').toISOString();

      if (!isWCP2022) { //世界杯早盤不用過濾日期，其他的要
        if (startDate) {
          const targetDate = moment(startDate + ' 00:00:00' + VendorConfigs.TIMEZONEFULL).toISOString();
          if (moment(targetDate).isAfter(moment(oneDayAfter))) { //目標日期要比一天後晚
            params.from = targetDate;
          }
        }

        if (endDate) {
          const targetDate = moment(endDate + ' 23:59:59' + VendorConfigs.TIMEZONEFULL).toISOString();
          if (moment(targetDate).isAfter(moment(oneDayAfter))) { //目標日期要比一天後晚
            params.until = targetDate;
          }
        }
      }
    } else if (MarketId === VendorMarkets.TODAY && IsRunningToday !== false) {
      //今日-一天內(包含滾球)
      //queryString += ' and isLive eq false'; //需要包含滾球，不可過濾
      params.from = moment().add(-1,'day').toISOString(); //如果不帶 默認是now，會拿不到滾球，所以必須帶一個過去的時間，設置為1天(24小時)前
      params.until = oneDayAfter;
    } else if (MarketId === VendorMarkets.TODAY && IsRunningToday === false) {
      //今日-一天內(不含滾球)
      queryString += ' and isLive eq false';
      params.from = '';
      params.until = oneDayAfter;
    } else if (MarketId === VendorMarkets.RUNNING) {
      //滾球
      queryString += ' and isLive eq true';
    } else if (MarketId === VendorMarkets.FAVOURITE) { //關注(收藏) 排除優勝冠軍，優勝冠軍另外用EventIds處理
      const favEventsForThisSport = favEvents.filter(favItem => parseInt(SportId) === favItem.SportId && !favItem.IsOutRightEvent);
      const favEventIdsForThisSport = favEventsForThisSport.map(item => item.EventId);
      //逗號分隔，單引號包起來
      const eventIdsJoins = favEventIdsForThisSport.join("','");
      //比賽id
      queryString += ` and Id in ('${eventIdsJoins}')`;
    }

    //額外指定EventId查詢，關注(收藏)的 優勝冠軍 單獨查詢使用
    if (EventIds.length > 0) {
      //逗號分隔，單引號包起來
      const eventIdsJoins = EventIds.join("','");
      //比賽id
      queryString += ` and Id in ('${eventIdsJoins}')`;
    }

    //排序(全部都要加上id 用以穩定排序，不然在分頁獲取中會拿到重複Event)
    if (sortWay === SortWays.EventTime) {
      queryString += '&$orderby=startEventDate asc,leagueOrder asc,id asc'  //開賽時間 正序(早開的在上)
    } else if(sortWay === SortWays.LeagueName) {
      if (MarketId === VendorMarkets.TODAY && IsRunningToday !== false) {
        queryString += '&$orderby=isLive desc,leagueOrder asc,id asc' //聯賽名 正序，把live game放前面
      } else {
        queryString += '&$orderby=leagueOrder asc,id asc' //聯賽名 正序
      }
    }

    return {queryString, params};
  }

  //獲取比賽列表 返回為 PollingResult 格式(只有 關注/收藏 使用輪詢，所以會支持比對數據變化)
  //extraConfigs.MaxCount 支持指定獲取前幾個賽事 banner使用
  //extraConfigs.getViewScope 函數，(IM專用)目前只用來指定早盤 全場波膽需要載入多少數據
  //extraConfigs.cacheSeconds 緩存數據秒數，給今日使用
  async getEvents(SportId = BTISports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null
            , extraConfigs ={}) {

    //世界杯2022處理
    let isWCP2022 = false;
    if (SportId === BTISports.WCP2022) {
      isWCP2022 = true;
      //SportId = BTISports.SOCCER; //不取代SportId，因為很多用於緩存判斷
    }

    const getCacheKey = () => {
      return 'getEventsInnerCache_' + SportId + '_' + MarketId + '_' + sortWay + '_' + md5(JSON.stringify({SportId, MarketId, sortWay, startDate, endDate, extraConfigs})).toString();
    }

    //內部緩存 給server端使用，降低請求頻率
    if (extraConfigs['cacheSeconds']) {
      const cacheKey = getCacheKey();
      const cachedData = this._cacheGet(cacheKey);
      if (cachedData) {
        const cloneEventDatas = cachedData.map(ev => EventData.clone(ev)); //複製一份
        console.log('===getEvents FROM CACHE:', this.configs.VendorName + '_' + SportId + '_' + MarketId,sortWay,startDate,endDate,extraConfigs);
        return new PollingResult(cloneEventDatas)
      } else {
        console.log('===getEvents FROM API:', this.configs.VendorName + '_' + SportId + '_' + MarketId,sortWay,startDate,endDate,extraConfigs);
      }
    }

    const pageSize = 50; //BTI固定一頁50

    const favEvents = await this.getFavouriteEvents();
    const memberOddsType = this.getMemberSetting().oddsType;

    let {queryString, params} = this._getEventQueryInfo(SportId,MarketId,sortWay,startDate,endDate,[],false, favEvents);

    //關注(收藏) 單獨處理
    if(MarketId === VendorMarkets.FAVOURITE) {

      let favEventsForThisSport = favEvents.filter(item => item.SportId === SportId);
      if (isWCP2022) {  //世界杯2022處理
        favEventsForThisSport = favEvents.filter(item => item.SportId === BTISports.SOCCER); //換成足球
      }

      //沒數據直接返回空
      if (favEventsForThisSport.length <=0) {
        return new Promise(resolve => resolve(new PollingResult([], [], true))); //額外設定已加載完畢
      }

      //分開一般賽事和優勝冠軍
      let eventIdsCate = {normal:[],outright:[]};
      favEventsForThisSport.map(item => {
        if (item.IsOutRightEvent) {
          eventIdsCate.outright.push(item.EventId);
        } else {
          eventIdsCate.normal.push(item.EventId);
        }
      })

      let queryPromises = [];

      //查一般賽事 分頁查
      if (eventIdsCate.normal.length > 0) {
        const eventCount = eventIdsCate.normal.length;
        const maxPageNo = Math.ceil(eventCount / pageSize);
        for (let currentPageNo = 1; currentPageNo <= maxPageNo; currentPageNo++) {
          let thisSkipValue = (currentPageNo - 1) * pageSize;
          let thisQueryString = queryString + `&$skip=${thisSkipValue}&$top=${pageSize}`;

          let thisPromise = this._btiDataFetch(BTIDataTypes.EVENTS, {
            query: thisQueryString,
            params: params
          })

          queryPromises.push(thisPromise);
        }
      }

      //查優勝冠軍
      if (eventIdsCate.outright.length > 0) {
        //market直接用OUTRIGHT
        const {queryString, params} = this._getEventQueryInfo(SportId, VendorMarkets.OUTRIGHT, sortWay, null, null, eventIdsCate.outright);

        let thisPromiseOR = this._btiDataFetch(BTIDataTypes.EVENTS, {
          query: queryString,
          params: params
        })
        queryPromises.push(thisPromiseOR);
      }

      return Promise.all(queryPromises).then(async resultArray => {
        let AllEventDatas = [];
        let changes = [];
        const favEvents = await this.getFavouriteEvents();
        resultArray.map(jsonData => {
          const data = jsonData.data;
          const EventDatas = data.events.map(eventDataSource => {
            const newData = EventData.createFromBTISource(eventDataSource, data.markets, MarketId, favEvents, memberOddsType)

            const cacheKey = this._getDataCacheKey('getEventsFavourite', {EventId: newData.EventId});
            const oldData = this._DataCache[cacheKey];
            if (oldData) {
              if (JSON.stringify(oldData) !== JSON.stringify(newData)) {  //有變化才提交change
                changes.push(new EventChangeData(newData.EventId, EventChangeType.Update, oldData, newData, eventDataSource));
              }
            }
            //保存查詢結果
            this._DataCache[cacheKey] = newData;

            return newData;
          });
          AllEventDatas = AllEventDatas.concat(EventDatas);
        })

        //排序投注線
        if (AllEventDatas && AllEventDatas.length > 0) {
          AllEventDatas.map(item => {
            item.sortLines();
            item.BTIFilterMainLineOnly(); //BTI還要額外去除多餘的線路
          })

          //重新排序
          EventData.sortEvents(AllEventDatas,sortWay);
        }

        //移除 沒有數據的 關注比賽
        let existEventIds = [];
        if (AllEventDatas && AllEventDatas.length >0) {
          existEventIds = AllEventDatas.map(e => e.EventId);
        }

        const notExistEventIds = favEventsForThisSport.filter(e => existEventIds.indexOf(e.EventId) === -1).map(e => e.EventId);

        let hasDeletedFavourite = false; //關注比賽 是否有被刪除
        if (notExistEventIds && notExistEventIds.length >0) {
          hasDeletedFavourite = await this.removeFavouriteEvent(notExistEventIds);
        }
        if (hasDeletedFavourite){ //關注比賽 有被刪除
          //強制刷新 體育計數
          if (typeof window !== "undefined" && window.eventListing_updateSportsCount) {
            window.eventListing_updateSportsCount(this.configs.VendorName);
          }
        }

        return new PollingResult(AllEventDatas, changes, true); //額外設定已加載完畢
      });

    }

    //下面是 關注(收藏) 以外的查詢方式
    //先取數量
    let eventCount = 0;
    if (extraConfigs['MaxCount']) { //有帶入最大查詢數量
      eventCount = parseInt(extraConfigs['MaxCount']);
    } else { //沒帶入數量，直接查count
      const sportsCountPR = await this.getSports();
      let sportDatas = sportsCountPR.NewData.filter(item => parseInt(item.SportId) === SportId);
      if (isWCP2022) {  //世界杯2022處理
        sportDatas = sportsCountPR.NewData.filter(item => parseInt(item.SportId) === BTISports.SOCCER); //換成足球
      }

      if (sportDatas && sportDatas.length > 0 && sportDatas[0].Markets) {
        const marketDatas = sportDatas[0].Markets.filter(item => item.MarketId === MarketId)
        if (marketDatas && marketDatas.length > 0) {
          eventCount = marketDatas[0].Count;
        }
      }
    }

    //console.log('===GET Events of ',MarketId,VendorMarketNames[MarketId],',Count:',eventCount);

    //算出頁數之後 分頁查
    const maxPageNo = Math.ceil(eventCount / pageSize);

    let promiseBucketSize = 10; //最多同時幾個請求
    let promiseBucketCount = 0;
    const checkPromiseBucket = (resolve) => {
      if (promiseBucketCount < promiseBucketSize) {
        resolve(true);
      } else {
        setTimeout(() => checkPromiseBucket(resolve), 500);
      }
    }

    let queryPromises = [];
    for(let currentPageNo=1;currentPageNo <= maxPageNo; currentPageNo++) {
      //限流桶，限制同時請求量
      await (new Promise(resolve => checkPromiseBucket(resolve)));

      promiseBucketCount = promiseBucketCount+1; //放入桶

      let thisSkipValue = (currentPageNo - 1) * pageSize;
      let thisQueryString = queryString + `&$skip=${thisSkipValue}&$top=${pageSize}`;

      let thisPromise = this._btiDataFetch(BTIDataTypes.EVENTS, {
        query: thisQueryString,
        params: params
      }).finally(() => {
        promiseBucketCount = promiseBucketCount -1; //移出桶
      })

      queryPromises.push(thisPromise);
    }

    return Promise.all(queryPromises).then(async resultArray => {
      let AllEventDatas = [];
      const favEvents = await this.getFavouriteEvents();
      resultArray.map(jsonData => {
        const data = jsonData.data;
        const EventDatas = data.events.map(eventData => {
          return EventData.createFromBTISource(eventData, data.markets, MarketId, favEvents, memberOddsType)
        });
        AllEventDatas = AllEventDatas.concat(EventDatas);
      })

      //排序投注線
      if (AllEventDatas && AllEventDatas.length > 0) {
        AllEventDatas.map(item => {
          item.sortLines();
          item.BTIFilterMainLineOnly(); //BTI還要額外去除多餘的線路
        })

        //重新排序
        EventData.sortEvents(AllEventDatas,sortWay);
      }

      //內部緩存
      if (extraConfigs['cacheSeconds']) {
        const cloneEventDatas = AllEventDatas.map(ev => EventData.clone(ev)); //複製一份
        const cacheKey = getCacheKey();
        this._cacheSet(cacheKey, cloneEventDatas, extraConfigs['cacheSeconds']);
      }

      return new PollingResult(AllEventDatas, [], true) //額外設定已加載完畢
    });
  }

  //獲取 單一個 比賽信息 返回為 PollingResult 格式(支持比對數據變化)
  //額外提供一個noMarkets參數，用來單純查詢event數據(只需要查詢球賽狀況，不用看投注)
  async getEventDetail(SportId= BTISports.SOCCER, EventId, isOutRightEvent= false, noMarkets= false) {
    let queryString = '$filter=';
    //體育類型 BTI不用傳
    //isOutRightEvent BTI不用判斷

    //比賽id
    queryString += `Id eq '${EventId}'`;

    let params = {
      includeMarkets: "$filter=marketType/id ne 'XXX'",  //用 != 一個不存在的玩法 去選出所有投注玩法(默認只會返回獨贏大小讓球3種)
    }
    if (noMarkets) {
      params.includeMarkets = "$filter=marketType/id eq 'XXX'";  //用 = 一個不存在的玩法 去過濾掉所有market
    }

    return this._btiDataFetch(BTIDataTypes.EVENTS,{query:queryString, params})
      .then(async jsonData => {
        const data = jsonData.data;

        const favEvents = await this.getFavouriteEvents();
        const memberOddsType = this.getMemberSetting().oddsType;

        const EventDatas = data.events.map(eventData => {
          return EventData.createFromBTISource(eventData, data.markets, null, favEvents, memberOddsType);
        });
        if (EventDatas && EventDatas.length > 0) {
          let thisEventData =  EventDatas[0];
          thisEventData.BTISortLinesAndSelections(); //排序

          const cahceKey = this._getDataCacheKey('getEventDetail',{SportId,EventId,noMarkets})
          const oldDatas = this._DataCache[cahceKey];

          //比對差異
          let changes = [];
          if (oldDatas) {
            //變更 有變化的才紀錄
            if (JSON.stringify(oldDatas) !== JSON.stringify(thisEventData)) {
              changes.push(new EventChangeData(thisEventData.EventId, EventChangeType.Update, oldDatas, thisEventData));
            }
          }

          //記錄新數據
          this._DataCache[cahceKey] = thisEventData;
          //複製一份 不要和保存的內容共用實例
          const cloneEventDatas = EventData.clone(thisEventData);

          return new PollingResult(cloneEventDatas,changes);
        } else {
          return new PollingResult(null);
        }
      });
  }

  //獲取多個比賽信息，傳入為EventInfo數組(支持不同體育項目和 一般/優勝冠軍 賽事混查)， 返回為 PollingResult 格式(支持比對數據變化)
  //(因為BTI架構限制，不返回所有玩法，只返回主要玩法)
  // 額外提供一個noMarkets參數，用來單純查詢event數據(只需要查詢球賽狀況，不用看投注)
  async getEventsDetail(EventInfos = [], noMarkets= false) {

    //支持傳入動態的EventInfo
    if (typeof EventInfos === 'function') {
      EventInfos = EventInfos();
      if (!!EventInfos && typeof EventInfos.then === 'function') {
        EventInfos = await EventInfos;
      }
    }

    //語法糖支持：單個改為數組
    if (!Array.isArray(EventInfos)) {
      EventInfos = [EventInfos];
    }

    //空查詢數據 直接返回
    if (EventInfos.length <=0) {
      return new Promise(resolve => resolve(new PollingResult([])));
    }

    //由於bti根本不用特別判斷 sport 和 優勝冠軍，所以直接把傳入數據 再改回EventId數組 就好了
    const EventIds = EventInfos.map(ei => ei.EventId);

    let queryString = '$filter=';
    //體育類型 BTI不用傳
    //isOutRightEvent BTI不用判斷

    //逗號分隔，單引號包起來
    const eventIdsJoins = EventIds.join("','");

    //比賽id
    queryString += `Id in ('${eventIdsJoins}')`;

    let params = {};

    if (noMarkets) {
      params.includeMarkets = "$filter=marketType/id eq 'XXX'";  //用 = 一個不存在的玩法 去過濾掉所有market
    }

    //先取比賽數量
    const eventCount = EventIds.length;
    const pageSize = 50; //BTI固定一頁50 因為最高返回300投注線
    //算出頁數之後 分頁查
    const maxPageNo = Math.ceil(eventCount / pageSize);
    //console.log('getEventsDetail: EVENT COUNT IS',eventCount, 'MAX PAGE IS', maxPageNo)

    let queryPromises = [];
    for(let currentPageNo=1;currentPageNo <= maxPageNo; currentPageNo++) {
      let thisSkipValue = (currentPageNo - 1) * pageSize;
      let thisQueryString = queryString + `&$skip=${thisSkipValue}&$top=${pageSize}`;

      let thisQueryOptions = {
        query: thisQueryString,
        params: params
      };

      let thisPromise = this._btiDataFetch(BTIDataTypes.EVENTS, thisQueryOptions);
      queryPromises.push(thisPromise);
    }

    return Promise.all(queryPromises).then(async resultArray => {

      //獲取收藏賽事
      const favEvents = await this.getFavouriteEvents();
      const memberOddsType = this.getMemberSetting().oddsType;

      let AllEventDatas = [];
      let changes = [];
      resultArray.map(jsonData => {
        const data = jsonData.data;
        const EventDatas = data.events.map(eventDataSource => {
          const newData = EventData.createFromBTISource(eventDataSource, data.markets, null, favEvents, memberOddsType)

          const cacheKey = this._getDataCacheKey('getEventsDetail', {EventId: newData.EventId});
          const oldData = this._DataCache[cacheKey];
          if (oldData) {
            if (JSON.stringify(oldData) !== JSON.stringify(newData)) {  //有變化才提交change
              changes.push(new EventChangeData(newData.EventId, EventChangeType.Update, oldData, newData, eventDataSource));
            }
          }
          //保存查詢結果
          this._DataCache[cacheKey] = newData;

          return newData;
        });
        AllEventDatas = AllEventDatas.concat(EventDatas);
      })
      return new PollingResult(AllEventDatas,changes);
    });
  }

  //推送數據緩存
  _PushCache = {}
  //推送共用函數
  _initialPush(dataName, uniqueName = '') {
    const cacheKey = dataName + '_' + uniqueName;

    let cacheInfo = this._PushCache[cacheKey];
    if (cacheInfo) {
      //有舊的

      //先停止push
      if (cacheInfo.subscriptions && cacheInfo.subscriptions.length > 0) {
        cacheInfo.subscriptions.map(subscriptionPromise => {
          subscriptionPromise.then(subscription => {
            subscription.unsubscribe();
            //console.log('unsubscribed', subscription);
          });
        });
      }

      //清理舊的緩存數據
      delete this._PushCache[cacheKey];
    }

    //配置一個唯一key，用於推送取代後，判斷是新的還是舊的推送
    const uniqueid = moment().format('YYYYMMDDHHmmssSSS') + uuidv4();

    //重新初始化配置
    this._PushCache[cacheKey] = {uniqueid, params: {}, data: [], subscriptions: [], isPullFinished: false, updateStack: [], isFirstUpdate: true, throttleHandle : null, debounceHandle: null, debounceReject: null};

    return cacheKey; //返回key
  }

  /**
   * 刪除輪詢，在componentWillUnmount時調用，避免堆積太多無用輪詢
   *
   * @param key
   */
  deletePolling(key) {
    //處理輪詢
    super.deletePolling(key);

    //處理推送
    const cacheInfo = this._PushCache[key];
    //停止push
    if (cacheInfo && cacheInfo.subscriptions && cacheInfo.subscriptions.length > 0) {
      cacheInfo.subscriptions.map(subscriptionPromise => {
        subscriptionPromise.then(subscription => {
          subscription.unsubscribe();
          //console.log('unsubscribed', subscription);
        });
      });
    }
    //刪除數據
    if (cacheInfo) {
      delete this._PushCache[key];
    }
  }

  /**
   * 全局 輪詢獲取體育項目
   *
   * @param subscriberName     訂閱者名稱，用來處理重複訂閱的狀況
   * @param onUpdateCallback   輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData:SportData數組, Changes:空數組}
   * @param uniqueName         用來判斷是否使用同一個推送數據，配置不同名字，可以同時開多個推送
   */
  getSportsPollingGlobal(subscriberName, onUpdateCallback, uniqueName = '') {
    return this._subscribeGlobalPolling('getSportsPolling', subscriberName, onUpdateCallback,{},uniqueName,true);
  }


  /**
   * 輪詢獲取體育項目
   *
   * @param onUpdateCallback   輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData:SportData數組, Changes:空數組}
   * @param uniqueName         用來判斷是否使用同一個推送數據，配置不同名字，可以同時開多個推送
   */
  getSportsPolling(onUpdateCallback, uniqueName = '') {
    //推送，會以同樣的查詢條件去推。不會更新查詢時間段，導致"本日"的count不會刷新
    //改用輪詢 獲取正確數據
    const dataQuery = () => this.getSports();
    return this._registerPolling('getSportsPolling',{}, dataQuery, onUpdateCallback, 30, uniqueName, true);
  }

  /**
   * 全局 輪詢獲取比賽數據(BTI是推送)
   *
   * @param subscriberName     訂閱者名稱，用來處理重複訂閱的狀況
   * @param onUpdateCallback   輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData:EventData數組, Changes:EventChangeData數組}
   * @param SportId            體育項目ID
   * @param MarketId           市場ID
   * @param sortWay            排序方式 1聯賽 2時間
   * @param startDate          比賽日期過濾 YYYY-MM-DD 格式(只有MarketId = 早盤(1)才有效)
   * @param endDate            比賽日期過濾 YYYY-MM-DD 格式(只有MarketId = 早盤(1)才有效)
   * @param extraConfigs       傳入getEvents的參數，詳情參考getEvents
   * @param uniqueName         用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventsPollingGlobal(subscriberName, onUpdateCallback, SportId = BTISports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null, extraConfigs= {}, uniqueName = '') {
    return this._subscribeGlobalPolling('getEventsPolling', subscriberName, onUpdateCallback,{SportId,MarketId,sortWay,startDate,endDate,extraConfigs},uniqueName,true);
  }

  /**
   * 獲取比賽數據 GET版本，用於API Server端
   *
   * @param onUpdateCallback   輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData:EventData數組, Changes:EventChangeData數組}
   * @param SportId            體育項目ID
   * @param MarketId           市場ID
   * @param sortWay            排序方式 1聯賽 2時間
   * @param startDate          比賽日期過濾 YYYY-MM-DD 格式(只有MarketId = 早盤(1)才有效)
   * @param endDate            比賽日期過濾 YYYY-MM-DD 格式(只有MarketId = 早盤(1)才有效)
   * @param extraConfigs       傳入getEvents的參數，詳情參考getEvents
   * @param uniqueName         用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventsPolling_GET(onUpdateCallback, SportId = BTISports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null, extraConfigs= {}, uniqueName = '') {
    const dataQuery = () => {
      if (MarketId === VendorMarkets.TODAY) { //今日包含滾球
        let favPromise = new Promise(resolve => resolve(null));
        if (!this.isAPIServer()) { //API服務器不需要查看關注比賽
          favPromise = this.getEvents(SportId, VendorMarkets.FAVOURITE, sortWay, startDate, endDate, extraConfigs);
        }
        const runningPromise = this.getEvents(SportId, VendorMarkets.RUNNING, sortWay, startDate, endDate, extraConfigs);
        let todayExtraConfigs = JSON.parse(JSON.stringify(extraConfigs));
        if (this.isAPIServer()) {
          todayExtraConfigs.cacheSeconds = 60; //今日改為60秒才查一次 (10秒輪詢一次，大概六次後才查，查詢也會耗時，沒辦法精準，差不多即可)
        }
        const todayPromise = this.getEvents(SportId, VendorMarkets.TODAY, sortWay, startDate, endDate, todayExtraConfigs);

        let that =this;
        return Promise.all([favPromise,runningPromise,todayPromise]).then(async values => {
          const prFav = values[0];
          const prRunning = values[1];
          const prToday = values[2];

          const runningEvents = prRunning.NewData ?? [];
          const runningChanges = prRunning.Changes ?? [];
          const todayEvents = prToday.NewData ?? [];
          const todayChanges = prToday.Changes ?? [];

          //順序 關注 => 滾球 => 今日
          const runningAndTodayEvents = runningEvents.concat(todayEvents);
          const runningAndTodayChanges = runningChanges.concat(todayChanges);

          //API服務器不用處理收藏賽事
          if (that.isAPIServer()) {
            return new PollingResult(runningAndTodayEvents,runningAndTodayChanges);
          }

          //處理收藏賽事
          //等待查詢完成的時間差，可能會點擊新增/刪除收藏賽事，需要額外處理
          const currentFavEvents = await this.getFavouriteEvents();
          const currentFavEventsForThisSport = currentFavEvents.filter(item => item.SportId === SportId);
          const currentFavEventIdsForThisSport = currentFavEventsForThisSport.map(item => item.EventId);

          let favEvents = prFav ? (prFav.NewData ?? []) : [] ;

          const thisFavEventIds = favEvents.map(ev => ev.EventId);

          //處理新增收藏賽事
          let extraFavEventIds = currentFavEventIdsForThisSport.filter(evid => thisFavEventIds.indexOf(evid) === -1);
          if (extraFavEventIds && extraFavEventIds.length > 0) {
            //console.log('====extraFavEventIds',extraFavEventIds);
            //從現有數據找出對應比賽
            const extraFavEvents = runningAndTodayEvents.filter(ev => extraFavEventIds.indexOf(ev.EventId) !== -1)
              .map(ev => {
                ev.IsFavourite = true;  //先加上星號，確保原本的數據也標記上
                //console.log('====extraFavEvent',ev.EventId,ev.LeagueName,ev.HomeTeamName,ev.AwayTeamName);
                return ev;
              })
              .map(ev => EventData.clone(ev)); //複製一份
            //添加額外的關注比賽
            favEvents = favEvents.concat(extraFavEvents);
            //重新排序
            EventData.sortEvents(favEvents,sortWay);
          }

          //處理刪除收藏賽事
          let deletedFavEventIds = thisFavEventIds.filter(evid => currentFavEventIdsForThisSport.indexOf(evid) === -1);
          if (deletedFavEventIds && deletedFavEventIds.length > 0) {
            //console.log('====deletedFavEventIds',deletedFavEventIds);
            //從現有數據找出對應比賽 移除星號
            runningAndTodayEvents.filter(ev => deletedFavEventIds.indexOf(ev.EventId) !== -1)
              .map(ev => {
                ev.IsFavourite = false;  //移除星號
                //console.log('====deletedFavEvent',ev.EventId,ev.LeagueName,ev.HomeTeamName,ev.AwayTeamName);
                return ev;
              })
            //刪除關注比賽
            favEvents = favEvents.filter(ev => deletedFavEventIds.indexOf(ev.EventId) === -1);
          }

          if (favEvents && favEvents.length > 0) {
            favEvents.map(fev => fev.MarketIdForListing = VendorMarkets.FAVOURITE); //額外增加字段用於UI判斷
          }

          const favChanges = prFav ? (prFav.Changes ?? []) : [] ; //changes不用動，因為是by EventId去處理的

          //順序 關注 => 滾球 => 今日
          const eventDatas = favEvents.concat(runningAndTodayEvents);
          const eventChanges = favChanges.concat(runningAndTodayChanges);

          return new PollingResult(eventDatas,eventChanges);
        });
      } else {
        return this.getEvents(SportId, MarketId, sortWay, startDate, endDate, extraConfigs);
      }
    }
    //分頁查詢 加速
    const preCacheQuery = () => {
      if (this.isAPIServer()) { //API服務器不需要preCache
        return new Promise(resolve => resolve(null));
      }

      if (MarketId === VendorMarkets.FAVOURITE) {
        //關注比賽 不加速，因為無法直接用分頁查詢
        return new Promise(resolve => resolve(null));
      }

      if ([BTISports.SOCCER, BTISports.BASKETBALL, BTISports.WCP2022].indexOf(SportId) === -1) {
        //只有足球和籃球支持緩存 世界杯2022也支持
        return new Promise(resolve => resolve(null));
      }

      //用緩存API 加速
      return this.getPreCacheEventsFromCacheAPI(SportId, MarketId, sortWay, startDate, endDate);
    }
    let intervalSeconds = 10;
    if (MarketId === VendorMarkets.EARLY) {
      intervalSeconds = 4*60; //BTI早盤更新頻率改為4分一次
    }
    return this._registerPolling('getEventsPolling', {SportId, MarketId, sortWay, startDate, endDate, extraConfigs}, dataQuery, onUpdateCallback, intervalSeconds, uniqueName, true, 9*60, preCacheQuery);

  }

  //獲取 預緩存 賽事 返回為 PollingResult 格式(不支持比對數據變化)
  async getPreCacheEventsFromCacheAPI(SportId = BTISports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null) {
    const OddsType = this.getMemberSetting().oddsType;

    //獲取收藏賽事
    const favEvents = await this.getFavouriteEvents();
    const favEventsForThisSport = favEvents.filter(item => item.SportId === SportId);
    const favEventIdsForThisSport = favEventsForThisSport.map(item => item.EventId);

    const eventDatas = await fetch(HostConfig.Config.CacheApi + '/events/bti/'
      + SportId + '/' + MarketId + '/' + sortWay
      + ((startDate !== null && MarketId === VendorMarkets.EARLY) ? ('/' + startDate) : '')
      + ((endDate !== null && MarketId === VendorMarkets.EARLY)? ('/' + endDate): '')
    )
      .then(response => response.json())
      .then(jsonData => {
        let events = [];
        if (jsonData && jsonData.data && jsonData.data.length > 0) {
          events = jsonData.data.map(ev => EventData.clone(ev, OddsType)); //需要轉換一下
          //更新收藏狀態
          events.map(item => {
            if (favEventIdsForThisSport.indexOf(item.EventId) !== -1) {
              item.IsFavourite = true;
            } else {
              item.IsFavourite = false;
            }
          });
        }
        return events;
      }).catch(e => {
        console.log('===getPreCacheEventsFromCacheAPI has error',e);
        return null;
      })

    if (eventDatas) {
      return new PollingResult(eventDatas);
    } else {
      return null;
    }
  }


  //賽事歷史
  _eventHistory = {};
  //投注線歷史
  _lineHistory ={};
  //是否啟用紀錄(除錯用)
  _logHistory = false;

  /**
   * 輪詢獲取比賽數據(BTI是推送)
   *
   * @param onUpdateCallback   輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData:EventData數組, Changes:EventChangeData數組}
   * @param SportId            體育項目ID
   * @param MarketId           市場ID
   * @param sortWay            排序方式 1聯賽 2時間
   * @param startDate          比賽日期過濾 YYYY-MM-DD 格式(只有MarketId = 早盤(1)才有效)
   * @param endDate            比賽日期過濾 YYYY-MM-DD 格式(只有MarketId = 早盤(1)才有效)
   * @param extraConfigs       傳入getEvents的參數，詳情參考getEvents
   * @param uniqueName         用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventsPolling(onUpdateCallback, SportId = BTISports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null, extraConfigs= {}, uniqueName = '') {
    //API緩存，BTI的推送似乎會影響IM獲取數據，所以改成用輪詢
    if (this.isAPIServer()) {
      return this.getEventsPolling_GET(onUpdateCallback, SportId, MarketId, sortWay, startDate, endDate, extraConfigs, uniqueName);
    }

    //世界杯2022處理
    let isWCP2022 = false;
    if (SportId === BTISports.WCP2022) {
      isWCP2022 = true;
      //SportId = BTISports.SOCCER; //不取代SportId，因為很多用於緩存判斷
    }

    //由於 關注(收藏) 用的是輪詢，其他Market用的是推送，這裡還要特別處理market更換時，先把現有的 輪詢/推送 清除
    const oldCacheKey =  'getEventsPolling' + '_' + uniqueName;
    this.deletePolling(oldCacheKey);

    if (MarketId === VendorMarkets.FAVOURITE) { //關注(收藏)另外處理
      return this._getEventsPollingForFavourite(onUpdateCallback,SportId,sortWay,startDate,endDate,uniqueName);
    }

    //加速:從緩存中優先獲取數據
    const queryParams = {SportId,MarketId,sortWay,startDate,endDate,extraConfigs};
    const cachedResultKey = 'getEventsPolling' + '_' + uniqueName + '_' + md5(JSON.stringify(queryParams));
    const cachedResult = this._cacheGet(cachedResultKey , null);
    if (cachedResult) {
      //console.log(this.configs.VendorName,'===use Cached data for getEventsPolling:',cachedResultKey,JSON.parse(JSON.stringify(queryParams)));
      //回調通知數據更新
      if (onUpdateCallback) {
        try {
          onUpdateCallback(cachedResult);
        } catch (e) {
          console.log('callback error', e);
        }
      }
    } else {
      //console.log(this.configs.VendorName,'===DO NOT HAVE Cached data for getEventsPolling:',cachedResultKey,JSON.parse(JSON.stringify(queryParams)));
    }

    //公用函數:查詢完成後，更新關注比賽
    //等待查詢完成的時間差，可能會點擊新增/刪除收藏賽事，需要額外處理
    const updateFavEvents = (latestFavList, srcFavEvents, srcEvents) => {
      if (this.isAPIServer()) { //API服務器不需要查看關注比賽
        return srcFavEvents;
      }

      let currentFavEventsForThisSport = latestFavList.filter(item => item.SportId === SportId);
      if (isWCP2022) {  //世界杯2022處理
        currentFavEventsForThisSport = latestFavList.filter(item => item.SportId === BTISports.SOCCER); //換成足球
      }
      const currentFavEventIdsForThisSport = currentFavEventsForThisSport.map(item => item.EventId);

      //先更新比賽收藏狀態
      srcEvents.map(item => {
        if (currentFavEventIdsForThisSport.indexOf(item.EventId) !== -1) {
          item.IsFavourite = true;
        } else {
          item.IsFavourite = false;
        }
      });

      const thisFavEventIds = srcFavEvents.map(ev => ev.EventId);

      let favEvents = srcFavEvents.map(ev => EventData.clone(ev));

      //處理新增收藏賽事
      let extraFavEventIds = currentFavEventIdsForThisSport.filter(evid => thisFavEventIds.indexOf(evid) === -1);
      if (extraFavEventIds && extraFavEventIds.length > 0) {
        //console.log('====extraFavEventIds',extraFavEventIds);
        //從現有數據找出對應比賽
        const extraFavEvents = srcEvents.filter(ev => extraFavEventIds.indexOf(ev.EventId) !== -1)
          .map(ev => EventData.clone(ev)); //複製一份
        if (extraFavEvents && extraFavEvents.length > 0) {
          //添加額外的關注比賽
          favEvents = favEvents.concat(extraFavEvents);
          //重新排序
          EventData.sortEvents(favEvents, sortWay);
        }
      }

      //處理刪除收藏賽事
      let deletedFavEventIds = thisFavEventIds.filter(evid => currentFavEventIdsForThisSport.indexOf(evid) === -1);
      if (deletedFavEventIds && deletedFavEventIds.length > 0) {
        //console.log('====deletedFavEventIds',deletedFavEventIds);
        //刪除關注比賽
        favEvents = favEvents.filter(ev => deletedFavEventIds.indexOf(ev.EventId) === -1);
      }

      if (favEvents && favEvents.length > 0) {
        favEvents.map(fev => fev.MarketIdForListing = VendorMarkets.FAVOURITE); //額外增加字段用於UI判斷
      }
      return favEvents;
    }

    const cacheKey = this._initialPush('EVENTS',uniqueName);
    const cacheInfo = this._PushCache[cacheKey];
    const thisUniqueId = cacheInfo.uniqueid;

    //用來處理 關注(收藏) 的緩存key
    const cachedResultKeyOnlyForRunningAndToday = cachedResultKey + '_' + 'RunningAndToday';
    const cachedResultKeyForFav = 'getEventsPolling' + '_' + uniqueName + '_' + md5(JSON.stringify({SportId, MarketId:  VendorMarkets.FAVOURITE, sortWay, startDate, endDate}));

    //今日 也包含 關注(收藏)
    if (MarketId === VendorMarkets.TODAY
      && !this.isAPIServer() //API服務器不需要查看關注比賽
    ) {

      //收到 關注(收藏) 輪詢數據 處理函數
      const favUpdateHandler = async (prFav) => {

        //檢查推送是否還存在，可能剛好在異步查詢完成之後就被刪除了
        if (!cacheInfo || (cacheInfo.uniqueid !== thisUniqueId)) { //推送存在 才繼續回調
          //console.log('===cancel update due to the old push has been deleted(getEventsPolling=>updateHandler)',thisUniqueId,cacheInfo ? cacheInfo.uniqueid : 'null_cacheInfo');
          return;
        }

        const cachedPRRunningAndToday = this._cacheGet( cachedResultKeyOnlyForRunningAndToday, null);
        if (!cachedPRRunningAndToday) {
          return; //今日和滾球還沒有緩存數據，直接返回
        }

        if (!prFav || !prFav.NewData || prFav.NewData.length <=0) {
          return; //沒有 關注(收藏) 數據，直接返回
        }

        let runningAndTodayEvents = cachedPRRunningAndToday ? (cachedPRRunningAndToday.NewData ?? []) : [] ;
        const runningAndTodayChanges = cachedPRRunningAndToday ? (cachedPRRunningAndToday.Changes ?? []) : [] ;

        //處理收藏賽事
        //等待查詢完成的時間差，可能會點擊新增/刪除收藏賽事，需要額外處理
        const currentFavEvents = await this.getFavouriteEvents();
        let favEvents = prFav ? (prFav.NewData ?? []) : [] ;
        favEvents = updateFavEvents(currentFavEvents,favEvents,runningAndTodayEvents);
        const favChanges = prFav ? (prFav.Changes ?? []) : [] ; //changes不用動，因為是by EventId去處理的

        //順序 關注 => 滾球 => 今日
        const eventDatas = favEvents.concat(runningAndTodayEvents);
        const eventChanges = favChanges.concat(runningAndTodayChanges);

        const favMergedResult = new PollingResult(eventDatas, eventChanges, true); //額外設定已加載完畢

        //檢查推送是否還存在，可能剛好在異步查詢完成之後就被刪除了
        if (!cacheInfo || (cacheInfo.uniqueid !== thisUniqueId)) { //推送存在 才繼續回調
          //console.log('===cancel update due to the old push has been deleted(getEventsPolling=>updateHandler)',thisUniqueId,cacheInfo ? cacheInfo.uniqueid : 'null_cacheInfo');
          return;
        }
        //console.log(this.configs.VendorName,'===polling set Cached data From Fav for ',cachedResultKey, JSON.parse(JSON.stringify(queryParams)));
        this._cacheSet(cachedResultKey, favMergedResult); //加速:緩存

        //回調通知數據更新
        if (onUpdateCallback) {
          try {
            //console.log(this.configs.VendorName,'===getEventsPolling Fav UPDATE',cachedResultKey,JSON.parse(JSON.stringify(queryParams)));
            onUpdateCallback(favMergedResult);
          } catch (e) {
            console.log('callback error', e);
          }
        }
      }

      const favPollingKey = this._getEventsPollingForFavourite(favUpdateHandler,SportId,sortWay,startDate,endDate,uniqueName);
      this._childPollingMap[cacheKey] = favPollingKey;
    }

    //策略：先訂閱變更，然後pull分頁拉數據，拉完數據之後，再把堆積的變更套用

    /*----------- 訂閱 開始 -------- */

    //收到推送數據 處理函數
    const updateHandler = async (updates) => {
      const cacheInfo = this._PushCache[cacheKey];

      //檢查推送是否還存在，可能剛好在異步查詢完成之後就被刪除了
      if (!cacheInfo || (cacheInfo.uniqueid !== thisUniqueId)) { //推送存在 才繼續回調
        //console.log('===cancel update due to the old push has been deleted(getEventsPolling=>updateHandler)',thisUniqueId,cacheInfo ? cacheInfo.uniqueid : 'null_cacheInfo');
        return;
      }

      //檢查初始數據是否已拉完
      if (!cacheInfo.isPullFinished) {
        //初始數據還沒拉完，先存下
        cacheInfo.updateStack.push(updates);
        //console.log('pull is not finished, cache push data to stack',updates);
        return;
      }

      if (cacheInfo.isFirstUpdate) {
        // 如果是第一次触发，直接执行
        cacheInfo.isFirstUpdate = false;
        //console.log('isFirstUpdate', updates);
      } else {
        //節流
        if (cacheInfo.throttleHandle) {
          cacheInfo.updateStack.push(updates);
          //console.log('throttleHandle exists, cache push data to stack', updates);
          return;
        }

        //console.log('pass throttle', updates);
        if (cacheInfo.throttleHandle) {
          clearTimeout(cacheInfo.throttleHandle);
          cacheInfo.throttleHandle = null;
        }

        cacheInfo.throttleHandle = setTimeout(function() {
          clearTimeout(cacheInfo.throttleHandle);
          cacheInfo.throttleHandle = null;
        }, 5000); //5秒節流，不要更新得太頻繁
      }

      //開始處理數據

      //之前堆積的 加上這次推送的
      const updateStacks = cacheInfo.updateStack.concat([updates]);

      //紀錄EventChangeData
      let eventChanges = [];

      const favEvents = await this.getFavouriteEvents();
      const memberOddsType = this.getMemberSetting().oddsType;

      const favEventIds = favEvents.map(item => item.EventId);

      //更新收藏狀態(下面只會處理變更項目，不會更新全部數據，所以要在這裡 直接全部處理)
      cacheInfo.data.map(item => {
        if (favEventIds.indexOf(item.EventId) !== -1) {
          item.IsFavourite = true;
        } else {
          item.IsFavourite = false;
        }
      });

      //刪除比賽
      let hasDeletedFavourite = false; //關注比賽 是否有被刪除

      for(let thisUpdates of updateStacks) {
        const data = thisUpdates.data;
        //取出儲存的數據
        let CachedData = cacheInfo.data;

        //套用差異更新

        //先處理比賽，再處理市場(=LINE投注線)

        //刪除比賽
        const DeletedEIds = data.remove.events.map(remove => {

          if (this._logHistory) {
            //賽事歷史
            if (this._eventHistory[remove]) {
              this._eventHistory[remove].push({data: null, src: {remove}})
            } else {
              console.log('====remove event but no history???', remove)
            }
          }
          //紀錄EventChangeData
          eventChanges.push(new EventChangeData(remove,EventChangeType.Delete));
          return remove;
        })
        if (DeletedEIds && DeletedEIds.length > 0) {
          //刪除收藏
          //console.log('====remove fav event from getEventsPolling->updateHandler')
          hasDeletedFavourite = await this.removeFavouriteEvent(DeletedEIds);

          CachedData = CachedData.filter(eventData => {
            return (DeletedEIds.indexOf(eventData.EventId) === -1);
          })
        }

        //新增比賽
        data.add.events.map(add => {
          //先檢查是否存在
          let targetIndex = null;

          //不能用entires寫法 RN安卓不支持
          //for (const [index, eventData] of CachedData.entries()) {
          if (CachedData && CachedData.length > 0) {
            for (let ii = 0; ii < CachedData.length; ii++) {
              const index = ii;
              const eventData = CachedData[ii];
              if (eventData.EventId === add.id) {
                targetIndex = index;
                break;
              }
            }
          }

          if (targetIndex !== null) {
            const oldData = EventData.clone(CachedData[targetIndex]);
            const newData = EventData.createFromBTIChange(add, oldData, favEvents);
            CachedData[targetIndex] = newData;

            if (this._logHistory) {
              //賽事歷史
              if (this._eventHistory[newData.EventId]) {
                this._eventHistory[newData.EventId].push({data: EventData.clone(newData), src: {add}})
              } else {
                console.log('====update event but no history???', newData.EventId, oldData, add)
              }
            }

            //有變化的才紀錄EventChangeData
            if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
              eventChanges.push(new EventChangeData(add.id, EventChangeType.Update, oldData, newData, add));
            } else {
              //console.log('===GOT Event add=>Change BUT NO CHANGES?',oldData,add)
            }
          } else {
            //不存在 才新增 (投注線先放空，後面會處理)
            const addData = EventData.createFromBTISource(add, [], null, favEvents, memberOddsType);
            CachedData.push(addData);

            if (this._logHistory) {
              //賽事歷史
              //有可能會把比賽刪了再重新加回來，所以要判斷
              if (!this._eventHistory[addData.EventId]) {
                this._eventHistory[addData.EventId] = [];
              }
              this._eventHistory[addData.EventId].push({data: EventData.clone(addData), src: {add}});
            }

            //紀錄EventChangeData
            eventChanges.push(new EventChangeData(add.id,EventChangeType.New,null,addData));
          }
        })

        //更新比賽
        data.change.events.map(change => {
          let targetIndex = null;

          //不能用entires寫法 RN安卓不支持
          //for (const [index, eventData] of CachedData.entries()) {
          if (CachedData && CachedData.length > 0) {
            for (let ii = 0; ii < CachedData.length; ii++) {
              const index = ii;
              const eventData = CachedData[ii];
              if (eventData.EventId === change.id) {
                targetIndex = index;
                break;
              }
            }
          }

          if (targetIndex !== null) {
            const oldData = EventData.clone(CachedData[targetIndex]);
            const newData = EventData.createFromBTIChange(change, oldData, favEvents);
            CachedData[targetIndex] = newData;

            if (this._logHistory) {
              //賽事歷史
              if (this._eventHistory[newData.EventId]) {
                this._eventHistory[newData.EventId].push({data: EventData.clone(newData), src: {change}})
              } else {
                console.log('====update event but no history???', newData.EventId, oldData, change)
              }
            }

            //有變化的才紀錄EventChangeData
            if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
              eventChanges.push(new EventChangeData(change.id, EventChangeType.Update, oldData, newData, change));
            } else {
              //console.log('===GOT Event Change BUT NO CHANGES?', oldData, change)
            }
          } else {
            //console.log('====GOT Event Change BUT Event NOT FOUND??', change.id, change)
          }
        })

        //刪除Market(LINE投注線)
        const DeletedMIds = data.remove.markets.map(remove => {
          return remove;
        })
        if (DeletedMIds && DeletedMIds.length > 0) {
          CachedData.map((eventData,eventIndex) => {
            const NewLines = eventData.Lines.filter(lineData => {
              return (DeletedMIds.indexOf(lineData.LineId) === -1);
            })

            //有變化
            if (NewLines.length !== eventData.Lines.length) {
              const oldEventData = EventData.clone(eventData);
              CachedData[eventIndex].Lines = NewLines; //更新投注線
              CachedData[eventIndex].updateLineGroupCount();

              if (this._logHistory) {
                const removedLines = oldEventData.Lines.filter(l => {
                  return (DeletedMIds.indexOf(l.LineId) !== -1);
                })

                if (removedLines && removedLines.length > 0) {
                  removedLines.map(rl => {
                    //投注線歷史
                    const linekey = oldEventData.EventId + '|||' + rl.LineId;
                    if (this._lineHistory[linekey]) {
                      this._lineHistory[linekey].push({
                        data: null,
                        src: {removeLine: LineData.clone(rl)}
                      })
                    } else {
                      console.log('====remove line but no line history???', linekey, LineData.clone(rl), DeletedMIds)
                    }
                  });
                } else {
                  //console.log('==== remove line but removes not found???', oldEventData.Lines, EventData.clone(CachedData[eventIndex]).Lines, DeletedMIds)
                }
              }

              //紀錄EventChangeData
              eventChanges.push(new EventChangeData(oldEventData.EventId,EventChangeType.Update,oldEventData,CachedData[eventIndex],{removeLine:data.remove.markets}));
            }
          })
        }

        //新增Market(LINE投注線)
        data.add.markets.map(add => {
          //先檢查是Event是否存在
          let eventIndex = null;
          //不能用entires寫法 RN安卓不支持
          //for (const [cachedEventIndex, cachedEventData] of CachedData.entries()) {
          if (CachedData && CachedData.length > 0) {
            for (let ii = 0; ii < CachedData.length; ii++) {
              const cachedEventIndex = ii;
              const cachedEventData = CachedData[ii];
              if (cachedEventData.EventId === add.eventId) {
                eventIndex = cachedEventIndex;
                break;
              }
            }
          }

          if (eventIndex !== null) {
            let eventData = CachedData[eventIndex];

            //然後檢查line是否存在
            let targetIndex = null;
            //不能用entires寫法 RN安卓不支持
            //for (const [index, lineData] of eventData.Lines.entries()) {
            if (eventData.Lines && eventData.Lines.length > 0) {
              for (let ii = 0; ii < eventData.Lines.length; ii++) {
                const index = ii;
                const lineData = eventData.Lines[ii];
                if (lineData.LineId === add.id) {
                  targetIndex = index;
                  break;
                }
              }
            }

            const oldEventData = EventData.clone(eventData);

            if (targetIndex !== null) {
              const oldLineData = LineData.clone(eventData.Lines[targetIndex]);
              CachedData[eventIndex].Lines[targetIndex] = LineData.createFromBTIChange(add, oldEventData, memberOddsType);

              if (this._logHistory) {
                //投注線歷史
                const linekey = oldEventData.EventId + '|||' + oldLineData.LineId;
                if (this._lineHistory[linekey]) {
                  this._lineHistory[linekey].push({
                    data: LineData.clone(CachedData[eventIndex].Lines[targetIndex]),
                    src: {addChangeLine: add}
                  })
                } else {
                  this._lineHistory[linekey] = [{
                    data: LineData.clone(CachedData[eventIndex].Lines[targetIndex]),
                    src: {addChangeLine: add}
                  }]
                  console.log('====add=>Change line but no line history???', linekey, oldLineData, add)
                }
              }

              //有變化的才紀錄EventChangeData
              if (JSON.stringify(oldLineData) !== JSON.stringify(CachedData[eventIndex].Lines[targetIndex])) {
                eventChanges.push(new EventChangeData(oldEventData.EventId, EventChangeType.Update, oldEventData, CachedData[eventIndex], {addLine:add}));
              } else {
                //console.log('===GOT Event-LINE add=>Change BUT NO CHANGES?', oldLineData, add);
              }
            } else {
              //不存在 才新增
              const addLineData = LineData.createFromBTIChange(add, oldEventData, memberOddsType)
              CachedData[eventIndex].Lines.push(addLineData);

              if (this._logHistory) {
                //投注線歷史
                const linekey = oldEventData.EventId + '|||' + addLineData.LineId;
                //有可能會把投注線刪了再重新加回來，所以要判斷
                if (!this._lineHistory[linekey]) {
                  this._lineHistory[linekey] = [];
                }
                this._lineHistory[linekey].push({data: LineData.clone(addLineData), src: {addLine: add}});
              }

              //紀錄EventChangeData
              eventChanges.push(new EventChangeData(oldEventData.EventId, EventChangeType.Update, oldEventData, CachedData[eventIndex], {addLine:add}));
            }

          } else {
            //console.log('==== GOT Event-Line add BUT Event NOT FOUND??', change)
          }
        })

        //更新Market(LINE投注線)
        data.change.markets.map(change => {
          //先檢查是Event是否存在
          let eventIndex = null;
          //不能用entires寫法 RN安卓不支持
          //for (const [cachedEventIndex, cachedEventData] of CachedData.entries()) {
          if (CachedData && CachedData.length > 0) {
            for (let ii = 0; ii < CachedData.length; ii++) {
              const cachedEventIndex = ii;
              const cachedEventData = CachedData[ii];
              if (cachedEventData.EventId === change.eventId) {
                eventIndex = cachedEventIndex;
                break;
              }
            }
          }

          if (eventIndex !== null) {
            let eventData = CachedData[eventIndex];

            //然後檢查line是否存在
            let targetIndex = null;
            //不能用entires寫法 RN安卓不支持
            //for (const [index, lineData] of eventData.Lines.entries()) {
            if (eventData.Lines && eventData.Lines.length > 0) {
              for (let ii = 0; ii < eventData.Lines.length; ii++) {
                const index = ii;
                const lineData = eventData.Lines[ii];
                if (lineData.LineId === change.id) {
                  targetIndex = index;
                  break;
                }
              }
            }

            if (targetIndex !== null) {
              const oldEventData = EventData.clone(eventData);

              const oldLineData = LineData.clone(eventData.Lines[targetIndex]);
              CachedData[eventIndex].Lines[targetIndex] = LineData.createFromBTIChange(change, oldEventData, memberOddsType);

              if (this._logHistory) {
                //投注線歷史
                const linekey = oldEventData.EventId + '|||' + oldLineData.LineId;
                if (this._lineHistory[linekey]) {
                  this._lineHistory[linekey].push({
                    data: LineData.clone(CachedData[eventIndex].Lines[targetIndex]),
                    src: {changeLine: change}
                  })
                } else {
                  console.log('====change line but no line history???', linekey, oldLineData, change)
                }
              }

              //有變化的才紀錄EventChangeData
              if (JSON.stringify(oldLineData) !== JSON.stringify(CachedData[eventIndex].Lines[targetIndex])) {
                eventChanges.push(new EventChangeData(oldEventData.EventId, EventChangeType.Update, oldEventData, CachedData[eventIndex], {changeLine: change}));
              } else {
                //console.log('=== GOT Event-LINE Change BUT NO CHANGES?', oldLineData, change);
              }
            } else {
              //console.log('==== GOT Event-Line Change BUT Line NOT FOUND??', change.id, change)
            }
          } else {
            //console.log('==== GOT Event-Line Change BUT Event NOT FOUND??', change.eventId, change)
          }
        })

        //儲存套用差異更新後的結果
        this._PushCache[cacheKey].data = CachedData;
      }

      //處理完之後清空
      cacheInfo.updateStack = [];

      if (hasDeletedFavourite){ //關注比賽 有被刪除
        //強制刷新 體育計數
        if (typeof window !== "undefined" && window.eventListing_updateSportsCount) {
          window.eventListing_updateSportsCount(this.configs.VendorName);
        }
      }

      if (eventChanges.length > 0) {  //有變化才通知更新

        let eventDatas = this._PushCache[cacheKey].data;

        //排序投注線(注意這個在return前才最後處理，不要動到Cache的數據)
        if (eventDatas && eventDatas.length > 0) {
          const cloneEventDatas =eventDatas.map(ev => EventData.clone(ev))

          cloneEventDatas.map(item => {
            item.sortLines();
            item.BTIFilterMainLineOnly(); //BTI還要額外去除多餘的投注線

            //因為最後才去除多餘的投注線，所以也會列出多餘投注線的變更
            //過濾賠率上升和下降，避免賽事列表多餘刷新

            //先獲取目前的投注選項
            let thisLinesAndSelection = []
            if (item.Lines && item.Lines.length > 0) {
              item.Lines.map(l => {
                if (l.Selections && l.Selections.length > 0) {
                  l.Selections.map(s => {
                    thisLinesAndSelection.push(s.LineId + '|||' + s.SelectionId);
                  })
                }
              })
            }

            //找出這個比賽的變更，過濾掉 不屬於目前投注選項 的 賠率變更
            const changesOfThisEvent = eventChanges.filter(ec => ec.EventId === item.EventId);
            changesOfThisEvent.map(ec => {
              if (ec.ChangeType === EventChangeType.Update
                && ec.SpecialUpdates && ec.SpecialUpdates.length >0) {
                ec.SpecialUpdates = ec.SpecialUpdates.filter(su => {
                  if (su.UpdateType === SpecialUpdateType.OddsUp || su.UpdateType === SpecialUpdateType.OddsDown) {
                    const thisKey = su.LineId + '|||' + su.SelectionId;
                    if (thisLinesAndSelection.indexOf(thisKey) === -1) {
                      return false;
                    }
                  }
                  return true;
                })
              }
            })

            if (this._logHistory) {
              //檢查多重投注線問題
              if (item.Lines && item.Lines.length > 2) {
                item.Lines.map(l => {
                   const sameAsThis = item.Lines.filter(ll => ll.BetTypeId === l.BetTypeId);
                   if (sameAsThis && sameAsThis.length > 1 ) {
                     console.log('====multiple lines??',item.EventId);
                   }
                })
              }
            }
          })

          eventDatas = cloneEventDatas;

          //重新排序
          EventData.sortEvents(eventDatas,sortWay);
        }else {
          eventDatas = []; //0數據還是要set一個新的，不然按照前面的寫法會讓result byref mapping到 this._PushCache[cacheKey].data 的記憶體位置上
        }

        if (MarketId === VendorMarkets.TODAY) {
          //今日 也包含 關注(收藏)
          const currentFavEvents = await this.getFavouriteEvents();
          const cachedPRFav = this._cacheGet(cachedResultKeyForFav, null);

          //console.log('====cachedPRFav',JSON.parse(JSON.stringify(cachedPRFav)));

          let favEvents = cachedPRFav ? (cachedPRFav.NewData ?? []) : [] ;
          favEvents = updateFavEvents(currentFavEvents,favEvents,eventDatas);
          const favChanges = cachedPRFav ? (cachedPRFav.Changes ?? []) : [] ; //changes不用動，因為是by EventId去處理的

          //今日 要把滾球往前放
          const runningEvents = eventDatas.filter(ed => ed.IsRB === true);
          const todayEvents = eventDatas.filter(ed => ed.IsRB !== true);
          const runningAndTodayEvents = runningEvents.concat(todayEvents);

          //console.log('====runningAndTodayEvents',JSON.parse(JSON.stringify(runningAndTodayEvents)));

          //額外緩存  今日+滾球 的數據，給  關注(收藏) 輪詢使用
          const runningAndTodayResult = new PollingResult(runningAndTodayEvents, eventChanges);
          this._cacheSet(cachedResultKeyOnlyForRunningAndToday,runningAndTodayResult);

          eventDatas = favEvents.concat(runningAndTodayEvents);
          eventChanges = favChanges.concat(eventChanges);
        }

        const result = new PollingResult(eventDatas, eventChanges, true); //額外設定已加載完畢

        //檢查推送是否還存在，可能剛好在異步查詢完成之後就被刪除了
        if (!cacheInfo || (cacheInfo.uniqueid !== thisUniqueId)) { //推送存在 才繼續回調
          //console.log('===cancel update due to the old push has been deleted(getEventsPolling=>updateHandler)',thisUniqueId,cacheInfo ? cacheInfo.uniqueid : 'null_cacheInfo');
          return;
        }
        //console.log(this.configs.VendorName,'===polling set Cached data From SSE for ',cachedResultKey, JSON.parse(JSON.stringify(queryParams)));
        this._cacheSet(cachedResultKey,result); //加速:緩存9分

        //回調通知數據更新
        if (onUpdateCallback) {
          try {
            //console.log(this.configs.VendorName,'===getEventsPolling SSE UPDATE',cachedResultKey,JSON.parse(JSON.stringify(queryParams)));
            onUpdateCallback(result);
          } catch (e) {
            console.log('callback error', e);
          }
        }
      }
    }

    let {queryString, params} = this._getEventQueryInfo(SportId,MarketId,SortWays.None,startDate,endDate,[],true);  //訂閱不能排序

    params.initialData = false; //不返回初始數據，另外用pull自己拉

    const queryOptions = {
      query: queryString,
      params: params
    }

    //紀錄查詢參數
    cacheInfo.params = [{SportId,MarketId,sortWay,startDate,endDate},queryOptions];

    const subscriptionPromise =  this._btiDataFetch(BTIDataTypes.EVENTS,queryOptions,updateHandler);

    //紀錄推送訂閱
    cacheInfo.subscriptions = [subscriptionPromise];

    /*----------- 訂閱 結束 -------- */

    /*----------- 自己分頁拉數據，一樣用updateCallback方式提交更新 -------- */

    this.getSports().then(async pollingResult => {
      const cacheInfo = this._PushCache[cacheKey];
      //檢查推送是否還存在，可能剛好在異步查詢完成之後就被刪除了
      if (!cacheInfo || (cacheInfo.uniqueid !== thisUniqueId)) { //推送存在 才繼續回調
        //console.log('===cancel update due to the old push has been deleted(getEventsPolling=>getSports)',thisUniqueId,cacheInfo ? cacheInfo.uniqueid : 'null_cacheInfo');
        return;
      }

      //先取比賽數量
      let sportDatas = pollingResult.NewData.filter(item => parseInt(item.SportId) === SportId);
      if (isWCP2022) {  //世界杯2022處理
        sportDatas = pollingResult.NewData.filter(item => parseInt(item.SportId) === BTISports.SOCCER); //換成足球
      }
      let eventCount = 0;
      if (sportDatas && sportDatas.length > 0 && sportDatas[0].Markets) {
        const marketDatas = sportDatas[0].Markets.filter(item => item.MarketId === MarketId)
        if(marketDatas && marketDatas.length > 0) {
          eventCount = marketDatas[0].Count;
        }
      }

      const pageSize = 50; //BTI固定一頁50 因為最高返回300投注線
      const memberOddsType = this.getMemberSetting().oddsType;


      //算出頁數之後 分頁查
      const maxPageNo = Math.ceil(eventCount / pageSize);

      //console.log('PULL: EVENT COUNT IS',eventCount, 'MAX PAGE IS', maxPageNo)

      let {queryString, params} = this._getEventQueryInfo(SportId,MarketId,sortWay,startDate,endDate,[],true);

      let queryPromises = [];

      //今日 也包含 關注(收藏)
      let favPromise = new Promise(resolve => resolve(null));
      if (MarketId === VendorMarkets.TODAY) {
        if (!this.isAPIServer()) { //API服務器不需要查看關注比賽
          favPromise = this.getEvents(SportId, VendorMarkets.FAVOURITE, sortWay, startDate, endDate);
        }
        queryPromises.push(favPromise);
      }

      for(let currentPageNo=1;currentPageNo <= maxPageNo; currentPageNo++) {
        let thisSkipValue = (currentPageNo - 1) * pageSize;
        let thisQueryString = queryString + `&$skip=${thisSkipValue}&$top=${pageSize}`;

        let thisQueryOptions = {
          query: thisQueryString,
          params: params
        };

        //加速：第一頁優先處理 拿到結果先回調展示
        if (currentPageNo === 1) {
          let firstPromise = this._btiDataFetch(BTIDataTypes.EVENTS, thisQueryOptions);
          queryPromises.push(firstPromise);
          let resultArray = await Promise.all(queryPromises);
          const cacheInfo = this._PushCache[cacheKey];
          //檢查推送是否還存在，可能剛好在異步查詢完成之後就被刪除了
          if (!cacheInfo || (cacheInfo.uniqueid !== thisUniqueId)) { //推送存在 才繼續回調
            //console.log('===cancel update due to the old push has been deleted(getEventsPolling=>firstPromise)',thisUniqueId,cacheInfo ? cacheInfo.uniqueid : 'null_cacheInfo');
            return;
          }

          //今日 也包含 關注(收藏)
          let prFav = null;
          if (MarketId === VendorMarkets.TODAY) {
            prFav = resultArray[0]; //第一個是 關注(收藏) 的promise
            //console.log('===first_resultArray',JSON.parse(JSON.stringify(resultArray)))
            resultArray = resultArray.slice(1); //第二個以後才是查 一般比賽 的
          }

          const currentFavEvents = await this.getFavouriteEvents();

          let first_jsonData = resultArray[0];
          const data = first_jsonData.data;
          let eventDatas = data.events.map(eventData => {
            return EventData.createFromBTISource(eventData, data.markets, null, currentFavEvents, memberOddsType)
          });
          //排序投注線(注意這個在return前才最後處理，不要動到Cache的數據)
          if (eventDatas && eventDatas.length > 0) {
            const cloneEventDatas =eventDatas.map(ev => EventData.clone(ev))

            cloneEventDatas.map(item => {
              item.sortLines();
              item.BTIFilterMainLineOnly(); //BTI還要額外去除多餘的線路
            })

            eventDatas = cloneEventDatas;

            //重新排序
            EventData.sortEvents(eventDatas,sortWay);
          } else {
            eventDatas = []; //0數據還是要set一個新的，不然按照前面的寫法會讓result byref mapping到 this._PushCache[cacheKey].data 的記憶體位置上
          }

          if (MarketId === VendorMarkets.TODAY) {
            //今日 也包含 關注(收藏)
            let favEvents = prFav ? (prFav.NewData ?? []) : [] ;
            favEvents = updateFavEvents(currentFavEvents,favEvents,eventDatas);

            //今日 要把滾球往前放
            const runningEvents = eventDatas.filter(ed => ed.IsRB === true);
            const todayEvents = eventDatas.filter(ed => ed.IsRB !== true);
            const runningAndTodayEvents = runningEvents.concat(todayEvents);

            //額外緩存  今日+滾球 的數據，給  關注(收藏) 輪詢使用
            const runningAndTodayResult = new PollingResult(runningAndTodayEvents);
            this._cacheSet(cachedResultKeyOnlyForRunningAndToday,runningAndTodayResult); //加速:緩存9分

            eventDatas = favEvents.concat(runningAndTodayEvents);
          }

          const first_result = new PollingResult(eventDatas);

          //檢查推送是否還存在，可能剛好在異步查詢完成之後就被刪除了
          if (!cacheInfo || (cacheInfo.uniqueid !== thisUniqueId)) { //推送存在 才繼續回調
            //console.log('===cancel update due to the old push has been deleted(getEventsPolling=>updateHandler)',thisUniqueId,cacheInfo ? cacheInfo.uniqueid : 'null_cacheInfo');
            return;
          }
          //console.log(this.configs.VendorName,'===polling set Cached data From FirstPage for ',cachedResultKey, JSON.parse(JSON.stringify(queryParams)));
          this._cacheSet(cachedResultKey,first_result); //加速:緩存9分

          //回調通知數據更新
          if (onUpdateCallback) {
            try {
              //console.log(this.configs.VendorName,'===getEventsPolling FirstPage UPDATE',cachedResultKey,JSON.parse(JSON.stringify(queryParams)));
              onUpdateCallback(first_result);
            } catch (e) {
              console.log('callback error', e);
            }
            await new Promise(r => setTimeout(r, 1000)); //停一下，讓前端優先render
          }

        } else {
          let thisPromise = this._btiDataFetch(BTIDataTypes.EVENTS, thisQueryOptions);
          queryPromises.push(thisPromise);
        }
      }

      Promise.all(queryPromises).then(async resultArray => {
        const cacheInfo = this._PushCache[cacheKey];
        //檢查推送是否還存在，可能剛好在異步查詢完成之後就被刪除了
        if (!cacheInfo || (cacheInfo.uniqueid !== thisUniqueId)) { //推送存在 才繼續回調
          //console.log('===cancel update due to the old push has been deleted(getEventsPolling=>Promise.all)',thisUniqueId,cacheInfo ? cacheInfo.uniqueid : 'null_cacheInfo');
          return;
        }

        //今日 也包含 關注(收藏)
        let prFav = null;
        if (MarketId === VendorMarkets.TODAY) {
          prFav = resultArray[0]; //第一個是 關注(收藏) 的promise
          resultArray = resultArray.slice(1); //第二個以後才是查 一般比賽 的
        }

        const currentFavEvents = await this.getFavouriteEvents();

        let AllEventDatas = [];
        resultArray.map(jsonData => {
          const data = jsonData.data;
          const EventDatas = data.events.map(eventData => {
            return EventData.createFromBTISource(eventData, data.markets, null, currentFavEvents, memberOddsType)
          });
          AllEventDatas = AllEventDatas.concat(EventDatas);
        })

        //緩存數據
        this._PushCache[cacheKey].data = AllEventDatas;

        let eventDatas = this._PushCache[cacheKey].data;

        if (this._logHistory) {
          //賽事歷史
          this._eventHistory = {};
          //投注線歷史
          this._lineHistory = {};
          AllEventDatas.map(ev => {
            this._eventHistory[ev.EventId] = [{data: EventData.clone(ev), src: null}];
            if (ev.Lines && ev.Lines.length > 0) {
              ev.Lines.map(l => {
                this._lineHistory[ev.EventId + '|||' + l.LineId] = [{data: LineData.clone(l), src: null}];
              })
            }
          })
        }

        //排序投注線(注意這個在return前才最後處理，不要動到Cache的數據)
        if (eventDatas && eventDatas.length > 0) {
          const cloneEventDatas =eventDatas.map(ev => EventData.clone(ev))

          cloneEventDatas.map(item => {
            item.sortLines();
            item.BTIFilterMainLineOnly(); //BTI還要額外去除多餘的線路
          })

          eventDatas = cloneEventDatas;

          //重新排序
          EventData.sortEvents(eventDatas,sortWay);
        } else {
          eventDatas = []; //0數據還是要set一個新的，不然按照前面的寫法會讓result byref mapping到 this._PushCache[cacheKey].data 的記憶體位置上
        }

        if (MarketId === VendorMarkets.TODAY) {
          //今日 也包含 關注(收藏)
          let favEvents = prFav ? (prFav.NewData ?? []) : [] ;
          favEvents = updateFavEvents(currentFavEvents,favEvents,eventDatas);

          //今日 要把滾球往前放
          const runningEvents = eventDatas.filter(ed => ed.IsRB === true);
          const todayEvents = eventDatas.filter(ed => ed.IsRB !== true);
          const runningAndTodayEvents = runningEvents.concat(todayEvents);
          eventDatas = favEvents.concat(runningAndTodayEvents);

          //額外緩存  今日+滾球 的數據，給  關注(收藏) 輪詢使用
          const runningAndTodayResult = new PollingResult(runningAndTodayEvents);
          this._cacheSet(cachedResultKeyOnlyForRunningAndToday,runningAndTodayResult); //加速:緩存9分
        }

        const result = new PollingResult(eventDatas, [], true); //額外設定已加載完畢

        //檢查推送是否還存在，可能剛好在異步查詢完成之後就被刪除了
        if (!cacheInfo || (cacheInfo.uniqueid !== thisUniqueId)) { //推送存在 才繼續回調
          //console.log('===cancel update due to the old push has been deleted(getEventsPolling=>Promise.all)',thisUniqueId,cacheInfo ? cacheInfo.uniqueid : 'null_cacheInfo');
          return;
        }
        //console.log(this.configs.VendorName,'===polling set Cached data From Initial for ',cachedResultKey, JSON.parse(JSON.stringify(queryParams)));
        this._cacheSet(cachedResultKey,result); //加速:緩存9分

        //回調通知數據更新
        if (onUpdateCallback) {
          try {
            //console.log(this.configs.VendorName,'===getEventsPolling Initial UPDATE',cachedResultKey,JSON.parse(JSON.stringify(queryParams)));
            onUpdateCallback(result);
          } catch (e) {
            console.log('callback error', e);
          }
        }

        //標記為處理完成
        this._PushCache[cacheKey].isPullFinished = true;
        //手動觸發一次，處理堆積的push內容
        const emptyUpdates = { data: { add: {events:[],markets:[]}, change:{events:[],markets:[]}, remove:{events:[],markets:[]} }};
        updateHandler(emptyUpdates);
      });
    });

    return cacheKey; //返回key
  }

  //輪詢獲取比賽數據(BTI是推送) 關注(收藏)專用版
  _getEventsPollingForFavourite(onUpdateCallback, SportId = BTISports.SOCCER, sortWay = SortWays.LeagueName, startDate = null, endDate = null, uniqueName = '') {
    const MarketId = VendorMarkets.FAVOURITE;
    //推送無法更新推送條件，這在收藏比賽的變更偵測  會有問題，改成用輪詢處理
    const dataQuery = () => this.getEvents(SportId, MarketId, sortWay, startDate, endDate);
    return this._registerPolling('getEventsPolling', {SportId, MarketId, sortWay, startDate, endDate}, dataQuery, onUpdateCallback, 10, uniqueName, true);
  }

  /**
   * API專用 輪詢獲取比賽數據 10秒一次，每10分自動清理一次數據
   * 服務端專用，不會返回pollingkey
   *
   * @param onUpdateCallback   輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData:EventData數組, Changes:EventChangeData數組}
   * @param SportId            體育項目ID
   * @param MarketId           市場ID
   * @param sortWay            排序方式 1聯賽 2時間
   * @param startDate          比賽日期過濾 YYYY-MM-DD 格式(只有MarketId = 早盤(1)才有效)
   * @param endDate            比賽日期過濾 YYYY-MM-DD 格式(只有MarketId = 早盤(1)才有效)
   * @param uniqueName         用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  APIEventsPollingWithAutoClean(onUpdateCallback, SportId = BTISports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null, uniqueName = '') {
    const callWithAutoClean = (btiPollingKey = null) => {
      if (btiPollingKey) {
        //console.log('BTI delete polling...');
        this.deletePolling(btiPollingKey);
      }
      //console.log('BTI start polling...');
      const thisPollingKey = this.getEventsPolling(onUpdateCallback,SportId,MarketId,sortWay,startDate,endDate,{},uniqueName);
      //暫定10分刷新一次
      setTimeout(() => callWithAutoClean(thisPollingKey), 10*60*1000);
    }
    callWithAutoClean();
  }

  /**
   * 獲取 單個 比賽數據 (因為BTI push回應異常緩慢，只能改成GET 如果後面恢復了再換回push)
   *
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData: 單個EventData數據, Changes: 單個EventChangeData數據}
   * @param SportId           體育項目ID
   * @param EventId           比賽ID
   * @param isOutRightEvent   是否優勝冠軍賽事
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventDetailPolling(onUpdateCallback, SportId = BTISports.SOCCER, EventId, isOutRightEvent= false, uniqueName = '') {
    return this.getEventDetailPolling_GET(onUpdateCallback, SportId, EventId, isOutRightEvent, uniqueName);
  }


  /**
   * 輪詢獲取 單個 比賽數據
   *
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData: 單個EventData數據, Changes: 單個EventChangeData數據}
   * @param SportId           體育項目ID
   * @param EventId           比賽ID
   * @param isOutRightEvent   是否優勝冠軍賽事
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventDetailPolling_GET(onUpdateCallback, SportId = BTISports.SOCCER, EventId, isOutRightEvent= false, uniqueName = '') {
    const dataQuery = () => this.getEventDetail(SportId, EventId, isOutRightEvent);
    return this._registerPolling('getEventDetailPolling', {SportId, EventId, isOutRightEvent}, dataQuery, onUpdateCallback, 10, uniqueName, true);
  }

  /**
   * 推送獲取 單個 比賽數據
   *
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData: 單個EventData數據, Changes: 單個EventChangeData數據}
   * @param SportId           體育項目ID
   * @param EventId           比賽ID
   * @param isOutRightEvent   是否優勝冠軍賽事
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventDetailPolling_PUSH(onUpdateCallback, SportId = BTISports.SOCCER, EventId, isOutRightEvent= false, uniqueName = '') {
    //加速:從緩存中優先獲取數據
    const queryParams = {SportId,EventId,isOutRightEvent};
    const cachedResultKey = 'getEventDetailPolling' + '_' + uniqueName + '_' + md5(JSON.stringify(queryParams));
    const cachedResult = this._cacheGet(cachedResultKey , null);
    if (cachedResult) {
      //console.log('===use Cached data for getEventDetailPolling');
      //回調通知數據更新
      if (onUpdateCallback) {
        try {
          onUpdateCallback(cachedResult);
        } catch (e) {
          console.log('callback error', e);
        }
      }
    }

    const cacheKey = this._initialPush('getEventDetailPolling',uniqueName);
    const cacheInfo = this._PushCache[cacheKey];
    const thisUniqueId = cacheInfo.uniqueid;

    //收到推送數據 處理函數
    const updateHandler = async (updates) => {
      const cacheInfo = this._PushCache[cacheKey];
      //檢查推送是否還存在，可能剛好在異步查詢完成之後就被刪除了
      if (!cacheInfo || (cacheInfo.uniqueid !== thisUniqueId)) { //推送存在 才繼續回調
        //console.log('===cancel update due to the old push has been deleted(getEventDetailPolling=>updateHandler)',thisUniqueId,cacheInfo ? cacheInfo.uniqueid : 'null_cacheInfo');
        return;
      }

      const data = updates.data;
      //取出儲存的數據
      let CachedData = cacheInfo.data;

      let eventChanges =[];

      //套用差異更新
      let eventNotFound = false;
      if (Array.isArray(CachedData)) {  //_initialPush的時候是一個數組
        //處理第一次返回的初始數據(新增比賽)
        if (data.add.events && data.add.events.length  === 1) {
          const favEvents = await this.getFavouriteEvents();
          const memberOddsType = this.getMemberSetting().oddsType;
          const addData = EventData.createFromBTISource(data.add.events[0], data.add.markets, null, favEvents, memberOddsType);
          this._PushCache[cacheKey].data = addData;
          //紀錄EventChangeData
          eventChanges.push(new EventChangeData(addData.EventId, EventChangeType.New, null, addData));
        } else {
          eventNotFound = true;
        }
      } else {
        //有數據

        //這裡要用防抖，和賽事列表用的不一樣
        //因為會短時間內大量請求，然後卡一陣子都沒有更新，所以要用防抖，在最後請求時更新數據

        //都是一律先推到stack再處理
        cacheInfo.updateStack.push(updates);

        //防抖
        if (cacheInfo.debounceHandle) {
          clearTimeout(cacheInfo.debounceHandle); //結束前一個的settimout
          cacheInfo.debounceHandle = null;
        }
        if (cacheInfo.debounceReject) {
          cacheInfo.debounceReject(false); //結束前一個promise
          cacheInfo.debounceReject = null;
        }
        const later = new Promise((resolve,reject) => {
          cacheInfo.debounceReject = reject;
          cacheInfo.debounceHandle = setTimeout(() => {
            clearTimeout(cacheInfo.debounceHandle);
            cacheInfo.debounceHandle = null;
            cacheInfo.debounceReject = null;
            resolve(true);
          }, 500) //防抖時間
        }).catch(error => {
          return error;
        });

        const canRun = await later;
        if (!canRun) {
          //console.log('===debounce triggered', updates);
          return;
        } else {
          //console.log('===pass debounce', JSON.parse(JSON.stringify(cacheInfo.updateStack)));
        }

        //因為前面有防抖會等一下才執行，這期間有可能就停止polling了，所以需要檢查一下狀態
        if (!this._PushCache[cacheKey]) {
          //console.log('===ABORT UPDATE due to deletePolling',cacheKey);
          return;
        }

        //刪除比賽
        let hasDeletedFavourite = false; //關注比賽 是否有被刪除

        //開始處理數據
        for(let thisUpdates of cacheInfo.updateStack) {
          const data = thisUpdates.data;
          //取出儲存的數據
          let CachedData = cacheInfo.data;

          // const cloneData = {};
          // let datastatus = {};
          // if (data) {
          //   ['add','change','remove'].map(p1 => {
          //     if (data[p1]) {
          //       ['events','markets'].map(p2 => {
          //         if (data[p1][p2] && data[p1][p2].length > 0) {
          //           if (!cloneData[p1]) {
          //             cloneData[p1] = {};
          //             datastatus[p1] = {};
          //           }
          //           cloneData[p1][p2] = JSON.parse(JSON.stringify(data[p1][p2]));
          //           datastatus[p1][p2] = cloneData[p1][p2].length;
          //         }
          //       });
          //     }
          //   })
          // }
          // console.log('===handle SSE PUSH',JSON.stringify(datastatus),cloneData);

          //刪除比賽
          if (data.remove.events && data.remove.events.length === 1
            && data.remove.events[0] === CachedData.EventId
          ) {
            //刪除收藏
            //console.log('====remove fav event from getEventDetailPolling->updateHandler')
            hasDeletedFavourite = await this.removeFavouriteEvent(CachedData.EventId);

            eventChanges.push(new EventChangeData(CachedData.EventId, EventChangeType.Delete));
            this._PushCache[cacheKey].data = []; //清空數據
            eventNotFound = true;
          } else {
            //更新比賽
            if (data.change.events && data.change.events.length === 1
              && data.change.events[0] && data.change.events[0].id === CachedData.EventId) {
              const change = data.change.events[0];
              const oldData = EventData.clone(CachedData);
              const favEvents = await this.getFavouriteEvents();
              const newData = EventData.createFromBTIChange(change, oldData, favEvents);
              this._PushCache[cacheKey].data = newData;
              //有變化的才紀錄EventChangeData
              if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
                eventChanges.push(new EventChangeData(change.id, EventChangeType.Update, oldData, newData, change));
              } else {
                //console.log('GOT Event Change BUT NO CHANGES?', oldData, change)
              }
            }

            const eventData = cacheInfo.data;
            const memberOddsType = this.getMemberSetting().oddsType;

            //刪除Market(LINE投注線)
            if (data.remove.markets && data.remove.markets.length > 0 && eventData && eventData.Lines && eventData.Lines.length > 0) {
              let NewLines = [];
              eventData.Lines.map(lineData => {
                if (data.remove.markets.indexOf(lineData.LineId) !== -1) {
                  //緩存 要刪掉的Line投注線數據，因為後面可能重新發add過來，新的數據group為空，要從舊數據補
                  this._cacheSet('LINE_GROUP_' +  lineData.LineId,lineData.LineGroupIds,180) //保留3分鐘
                } else {
                  NewLines.push(lineData);
                }
              })

              //有變化
              if (NewLines.length !== eventData.Lines.length) {
                const oldEventData = EventData.clone(eventData);
                eventData.Lines = NewLines; //更新投注線
                eventData.updateLineGroupCount();
                //紀錄EventChangeData
                eventChanges.push(new EventChangeData(oldEventData.EventId, EventChangeType.Update, oldEventData, eventData, {removeLine: data.remove.markets}));
              }
            }

            //新增Market(LINE投注線)
            data.add.markets.map(add => {
              //先檢查是否存在

              let targetIndex = null;
              //不能用entires寫法 RN安卓不支持
              //for (const [index, lineData] of eventData.Lines.entries()) {
              if (eventData.Lines && eventData.Lines.length > 0) {
                for (let ii = 0; ii < eventData.Lines.length; ii++) {
                  const index = ii;
                  const lineData = eventData.Lines[ii];
                  if (lineData.LineId === add.id) {
                    targetIndex = index;
                    break;
                  }
                }
              }

              const oldEventData = EventData.clone(eventData);

              if (targetIndex !== null) {
                const oldData = LineData.clone(eventData.Lines[targetIndex]);
                eventData.Lines[targetIndex] = LineData.createFromBTIChange(add, oldEventData, memberOddsType);
                //有變化的才紀錄EventChangeData
                if (JSON.stringify(oldData) !== JSON.stringify(eventData.Lines[targetIndex])) {
                  eventChanges.push(new EventChangeData(oldEventData.EventId, EventChangeType.Update, oldEventData, eventData, {addLine: add}));
                } else {
                  //console.log('GOT Event-LINE Change BUT NO CHANGES?', oldData, add);
                }
              } else {
                //不存在 才新增
                const cachedLineGroupIds = this._cacheGet('LINE_GROUP_' +  add.id);
                // if (cachedLineGroupIds) {
                //   console.log('===got cached groupids for ', add.id, cachedLineGroupIds);
                // }
                const addData = LineData.createFromBTIChange(add, oldEventData, memberOddsType, cachedLineGroupIds)
                eventData.Lines.push(addData);
                eventData.updateLineGroupCount();
                //紀錄EventChangeData
                eventChanges.push(new EventChangeData(oldEventData.EventId, EventChangeType.Update, oldEventData, eventData, {addLine: add}));
              }
            })

            //更新Market(LINE投注線)
            data.change.markets.map(change => {
              let targetIndex = null;

              //不能用entires寫法 RN安卓不支持
              //for (const [index, lineData] of eventData.Lines.entries()) {
              if (eventData.Lines && eventData.Lines.length > 0) {
                for (let ii = 0; ii < eventData.Lines.length; ii++) {
                  const index = ii;
                  const lineData = eventData.Lines[ii];
                  if (lineData.LineId === change.id) {
                    targetIndex = index;
                    break;
                  }
                }
              }

              if (targetIndex !== null) {
                const oldEventData = EventData.clone(eventData);

                const oldData = LineData.clone(eventData.Lines[targetIndex]);
                eventData.Lines[targetIndex] = LineData.createFromBTIChange(change, oldEventData, memberOddsType);

                //有變化的才紀錄EventChangeData
                if (JSON.stringify(oldData) !== JSON.stringify(eventData.Lines[targetIndex])) {
                  eventChanges.push(new EventChangeData(oldEventData.EventId, EventChangeType.Update, oldEventData, eventData, {changeLine: change}));
                } else {
                  //console.log('GOT Event-LINE Change BUT NO CHANGES?', oldData, change);
                }
              }
            })

            //更新數據
            this._PushCache[cacheKey].data = eventData;
          }
        }

        if (hasDeletedFavourite){ //關注比賽 有被刪除
          //強制刷新 體育計數
          if (typeof window !== "undefined" && window.eventListing_updateSportsCount) {
            window.eventListing_updateSportsCount(this.configs.VendorName);
          }
        }
      }

      //處理完之後清空
      cacheInfo.updateStack = [];

      if (eventChanges.length > 0 || eventNotFound) {  //有變化 或者 沒有賽事數據 才通知更新
        let result = null;
        if (eventNotFound) {
          result = new PollingResult(null);
        } else {
          const cachedEventData = this._PushCache[cacheKey].data;
          const cloneEventData = EventData.clone(cachedEventData); //複製一份 不要和保存的內容共用實例
          cloneEventData.BTISortLinesAndSelections();  //排序

          result = new PollingResult(cloneEventData, eventChanges);
        }

        //console.log('===set Cached data for getEventDetailPolling');
        this._cacheSet(cachedResultKey,result); //加速:緩存9分

        //回調通知數據更新
        if (onUpdateCallback) {
          try {
            onUpdateCallback(result);
          } catch (e) {
            console.log('callback error', e);
          }
        }
      }
    }

    let query = '$filter=';
    //體育類型 BTI不用傳
    //isOutRightEvent BTI不用判斷

    //比賽id
    query += `Id eq '${EventId}'`;

    let params = {
      includeMarkets: "$filter=marketType/id ne 'XXX'",  //用 != 一個不存在的玩法 去選出所有投注玩法(默認只會返回獨贏大小讓球3種)
    }

    let queryOptions = {
      query,
      params,
    }

    //紀錄查詢參數
    cacheInfo.params = [{SportId,EventId},queryOptions];

    const subscriptionPromise =  this._btiDataFetch(BTIDataTypes.EVENTS,queryOptions,updateHandler);

    //紀錄推送訂閱
    cacheInfo.subscriptions = [subscriptionPromise];

    return cacheKey;//返回key
  }

  /**
   * 全局 輪詢獲取 多個 比賽數據 (因為BTI架構限制，不返回所有玩法，只返回主要玩法)
   *
   * @param subscriberName    訂閱者名稱，用來處理重複訂閱的狀況
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData: EventData數組, Changes: EventChangeData 數組}
   * @param EventInfos        要輪詢的比賽，EventInfo數組(支持不同體育項目和 一般/優勝冠軍 賽事混查)
   * @param noMarkets         BTI額外提供一個noMarkets參數，用來單純查詢event數據(只需要查詢球賽狀況，不用看投注)
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventsDetailPollingGlobal(subscriberName, onUpdateCallback, EventInfos = [], noMarkets= false, uniqueName = '') {
    return this._subscribeGlobalPolling('getEventsDetailPolling', subscriberName, onUpdateCallback, {EventInfos, noMarkets}, uniqueName);
  }

  /**
   * 輪詢獲取 多個 比賽數據 (因為BTI架構限制，不返回所有玩法，只返回主要玩法)
   *
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData: EventData數組, Changes: EventChangeData 數組}
   * @param EventInfos        要輪詢的比賽，EventInfo數組(支持不同體育項目和 一般/優勝冠軍 賽事混查)
   * @param noMarkets         BTI額外提供一個noMarkets參數，用來單純查詢event數據(只需要查詢球賽狀況，不用看投注)
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventsDetailPolling(onUpdateCallback, EventInfos = [], noMarkets= false, uniqueName = '') {
    //推送無法更新推送條件，這在收藏比賽的變更偵測  會有問題，改成用輪詢處理
    const dataQuery = () => this.getEventsDetail(EventInfos, noMarkets);
    return this._registerPolling('getEventsDetailPolling', {EventInfos, noMarkets}, dataQuery, onUpdateCallback, 10, uniqueName);
  }

  /**
   *
   * 聯賽搜尋，返回為SearchSportData數組
   *
   * @param keyword 關鍵字
   */
  async search_old(keyword) {
    //加速:從緩存中優先獲取數據
    const cachedResultKey = 'search@' + keyword;
    const cachedResult = this._cacheGet(cachedResultKey , null);
    if (cachedResult) {
      return cachedResult;
    }

    let searchResult = await this._btiSearchFetch(keyword);

    //大小寫不敏感
    const keywordUpper = keyword.toUpperCase();
    const keywordLower = keyword.toLowerCase();

    let sportDataMap = {};
    let leagueDataMap = {};
    //由聯賽數據生成 體育->聯賽->賽事
    if (searchResult && searchResult.leagues && searchResult.leagues.length > 0) {
      //因為查詢結果會返回一大堆沒有關聯的數據???，只保留名稱符合的
      searchResult.leagues = searchResult.leagues.filter(l =>
        (l.name.indexOf(keyword) >= 0) || (l.name.indexOf(keywordUpper) >= 0) || (l.name.indexOf(keywordLower) >= 0)
      )

      for (const l of searchResult.leagues) {
        const thisSportId = parseInt(l.sportId);
        let thisSportData = sportDataMap[thisSportId];
        if (!thisSportData) {
          thisSportData = new SearchSportData(thisSportId, l.sportName, l.sportOrder, []);
          sportDataMap[thisSportId] = thisSportData;
        }

        const thisLeagueId = l.id;
        let thisLeagueData = leagueDataMap[thisLeagueId];
        if (!thisLeagueData) {
          thisLeagueData = new SearchLeagueData(l.id, l.name, l.sportId, []);
          leagueDataMap[thisLeagueId] = thisLeagueData;
          thisSportData.Leagues.push(thisLeagueData);
        }

        //搜尋聯賽下的比賽
        let query = '$filter=';
        //體育類型 BTI不用傳

        //聯賽id
        query += `leagueId eq '${l.id}'`;
        //排除猜冠軍
        query += " and type eq 'Fixture'";

        let params = {
          includeMarkets: "$filter=marketType/id eq 'XXX'",  //只需要比賽信息，不返回市場
        }

        const eventDatas = await this._btiDataFetch(BTIDataTypes.EVENTS, {query, params})
          .then(jsonData => {
            const data = jsonData.data;
            return data.events.map(item => {

              //處理主隊名稱
              const homeTeams = item.participants.filter(item => item.venueRole === 'Home');
              let homeTeam = {
                id: 0,
                name: 'not set',
              };
              if (homeTeams && homeTeams.length > 0) {
                const homeTeamData = homeTeams[0];
                homeTeam.id = homeTeamData.id;
                homeTeam.name = homeTeamData.name;
              }

              //處理客隊名稱
              const awayTeams = item.participants.filter(item => item.venueRole === 'Away');
              let awayTeam = {
                id: 0,
                name: 'not set',
              };
              if (awayTeams && awayTeams.length > 0) {
                const awayTeamData = awayTeams[0];
                awayTeam.id = awayTeamData.id;
                awayTeam.name = awayTeamData.name;
              }

              return new SearchEventData(
                item.id, item.startEventDate,
                homeTeam.id, homeTeam.name, awayTeam.id, awayTeam.name,
                thisSportId, thisLeagueId
              )
            });
          });

        if (eventDatas && eventDatas.length > 0) {
          thisLeagueData.Events = eventDatas;
        }
      }
    }

    //由賽事數據生成 體育->聯賽->賽事
    if (searchResult && searchResult.events && searchResult.events.length > 0) {
      //因為查詢結果會返回一大堆沒有關聯的數據???，只保留名稱符合的
      //順便過濾掉猜冠軍
      searchResult.events = searchResult.events.filter(ev => {
        if (ev.isOutright) { //猜冠軍先跳過
          return false;
        }
        const names = ev.participantsData.filter(item => (item.venueRole === 'Home') || (item.venueRole === 'Away'));
        let matchNames = names.filter(n =>
          (n.name.indexOf(keyword) >= 0) || (n.name.indexOf(keywordUpper) >= 0) || (n.name.indexOf(keywordLower) >= 0)
        )
        return (matchNames && matchNames.length > 0);
      })

      //獲取體育名，因為search的events沒有返回體育名稱，只能自己拿
      let sportNameMap = {};
      const sportCountData = await this._btiDataFetch(BTIDataTypes.SPORTS,{});
      if (sportCountData && sportCountData.data && sportCountData.data.length > 0){
        sportCountData.data.map(scd => {
          const thisId = parseInt(scd.id);
          sportNameMap[thisId] = scd.name;
        })
      }

      searchResult.events.map(ev => {
        const thisSportId = parseInt(ev.sportId);
        let thisSportData = sportDataMap[thisSportId];
        if (!thisSportData) {
          const thisSportName = sportNameMap[thisSportId] ?? 'not set';
          thisSportData = new SearchSportData(thisSportId, thisSportName, ev.sportOrder,[]);
          sportDataMap[thisSportId] = thisSportData;
        }

        const thisLeagueId = ev.leagueId;
        let thisLeagueData = leagueDataMap[thisLeagueId];
        if (!thisLeagueData) {
          thisLeagueData = new SearchLeagueData(ev.leagueId,ev.leagueName,ev.sportId,[]);
          leagueDataMap[thisLeagueId] = thisLeagueData;
          thisSportData.Leagues.push(thisLeagueData);
        }

        let thisExistEvent = null;
        if (thisLeagueData.Events && thisLeagueData.Events.length > 0) {
          const existEvents = thisLeagueData.Events.filter(existEv => existEv.EventId === ev.id);
          if (existEvents && existEvents.length > 0) {
            thisExistEvent = existEvents[0];
          }
        }

        if (!thisExistEvent) {
          //不存在比賽 添加一個新的

          //處理主隊名稱(注意這裡數據結構 和 上面直接查event數據不一樣 上面是用participants 這裡用participantsData)
          const homeTeams = ev.participantsData.filter(item => item.venueRole === 'Home');
          let homeTeam = {
            id: 0,
            name: 'not set',
          };
          if (homeTeams && homeTeams.length > 0) {
            const homeTeamData = homeTeams[0];
            homeTeam.id = homeTeamData.id;
            homeTeam.name = homeTeamData.name;
          }

          //處理客隊名稱(注意這裡數據結構 和 上面直接查event數據不一樣 上面是用participants 這裡用participantsData)
          const awayTeams = ev.participantsData.filter(item => item.venueRole === 'Away');
          let awayTeam = {
            id: 0,
            name: 'not set',
          };
          if (awayTeams && awayTeams.length > 0) {
            const awayTeamData = awayTeams[0];
            awayTeam.id = awayTeamData.id;
            awayTeam.name = awayTeamData.name;
          }

          const thisEventData = new SearchEventData(
            ev.id, ev.startEventDate,
            homeTeam.id, homeTeam.name, awayTeam.id, awayTeam.name,
            thisSportId, thisLeagueId
          )

          thisLeagueData.Events.push(thisEventData);
        }
      })
    }

    //排除下面沒有比賽的聯賽，並把object數據轉為數組
    let sportDatas = [];
    for(let prop in sportDataMap) {
      let thisSportData = sportDataMap[prop];
      thisSportData.Leagues = thisSportData.Leagues.filter(l => l.Events && l.Events.length > 0)
      if (thisSportData.Leagues && thisSportData.Leagues.length > 0) {
        sportDatas.push(thisSportData);
      }
    }

    if (sportDatas.length > 0) {
      //排序體育項目
      const compareSports = (a,b) => {
        if (a.DisplayOrder < b.DisplayOrder ) {
          return -1; //小于 0 ，那么 a 会被排列到 b 之前
        }
        if (a.DisplayOrder > b.DisplayOrder) {
          return 1; //大于 0 ， b 会被排列到 a 之前。
        }
        return 0;
      }
      sportDatas = sportDatas.sort(compareSports);
    }

    this._cacheSet(cachedResultKey,sportDatas, 3*60); //加速:緩存3分

    return sportDatas;
  }

  /**
   * 因為search api被關閉，改用events查詢
   * 聯賽搜尋，返回為SearchSportData數組
   *
   * @param keyword 關鍵字
   */
  async search(keyword) {
    //加速:從緩存中優先獲取數據
    const cachedResultKey = 'search@' + keyword;
    const cachedResult = this._cacheGet(cachedResultKey , null);
    if (cachedResult) {
      return cachedResult;
    }

    //先查體育count
    const sportsArr = await this._btiDataFetch(BTIDataTypes.SPORTS,{})
      .then(jsonData => {
        const data = jsonData.data;
        return data.map(d => ({
            SportId: parseInt(d.id),
            SportName: d.name,
            Count: d.fixturesTotalCount,
            DisplayOrder: d.order,
          }))
      });

    //大小寫不敏感
    const keywordUpper = keyword.toUpperCase();
    const keywordLower = keyword.toLowerCase();

    //組成數據
    let handleDataPromises = [];

    //做成異步，需要等待每個體育項目分開查詢完成
    const getSeachSportData = async (SportInfo, keyword) => {
      //分頁查比賽數據
      let queryString = "$filter=sportId eq '" + SportInfo.SportId + "' and type eq 'Fixture'";
      const pageSize = 90; //一頁90
      const maxPageNo = Math.ceil(SportInfo.Count / pageSize);

      let queryPromises = [];
      for (let currentPageNo = 1; currentPageNo <= maxPageNo; currentPageNo++) {
        let thisSkipValue = (currentPageNo - 1) * pageSize;
        let thisQueryString = queryString + `&$skip=${thisSkipValue}&$top=${pageSize}`;

        let thisPromise = this._btiDataPull(BTIDataTypes.EVENTS, {
          query: thisQueryString,
          params: {includeMarkets: 'none',}
        })

        queryPromises.push(thisPromise);
      }

      const eventDatas = await Promise.all(queryPromises).then(resultArray => {
        let allDatas = [];
        resultArray.map(jsonData => {
          const data = jsonData.data ? jsonData.data.events : [];
          const info = data.map(item => {
            const homeTeams = item.participants.filter(item => item.venueRole === 'Home');
            let homeTeam = {
              id: 0,
              name: 'not set',
            };
            if (homeTeams && homeTeams.length > 0) {
              const homeTeamData = homeTeams[0];
              homeTeam.id = homeTeamData.id;
              homeTeam.name = homeTeamData.name;
            }

            const awayTeams = item.participants.filter(item => item.venueRole === 'Away');
            let awayTeam = {
              id: 0,
              name: 'not set',
            };
            if (awayTeams && awayTeams.length > 0) {
              const awayTeamData = awayTeams[0];
              awayTeam.id = awayTeamData.id;
              awayTeam.name = awayTeamData.name;
            }
            return {
              LeagueId : item.leagueId,
              LeagueName: item.leagueName,
              LeagueOrder: item.leagueOrder,
              EventId: item.id,
              EventDate: item.startEventDate,
              HomeTeamId: homeTeam.id,
              HomeTeamName: homeTeam.name,
              AwayTeamId: awayTeam.id,
              AwayTeamName: awayTeam.name,
            }
          })

          allDatas = allDatas.concat(info);
        })
        return allDatas;
      });

      console.log('===eventDatas',eventDatas);

      //按照聯賽分組
      let LeagueMap = {}
      eventDatas.map(ev => {
        if (!LeagueMap[ev.LeagueId]) {
          LeagueMap[ev.LeagueId] = {
            LeagueId: ev.LeagueId,
            LeagueName: ev.LeagueName,
            LeagueOrder: ev.LeagueOrder,
            events:[]
          }
        }
        LeagueMap[ev.LeagueId].events.push(ev);
      })

      //關鍵字查詢
      let leagueArr = [];
      for(let lid in LeagueMap) {
        const thisL = LeagueMap[lid];
        if ((thisL.LeagueName.indexOf(keyword) >= 0) || (thisL.LeagueName.indexOf(keywordUpper) >= 0) || (thisL.LeagueName.indexOf(keywordLower) >= 0)) {
          //聯賽名符合=>保留整個聯賽包含下面比賽
        } else {
          //聯賽名不符合=>只保留下面隊名符合的比賽
          thisL.events = thisL.events.filter(ev =>
            (ev.HomeTeamName.indexOf(keyword) >= 0) || (ev.HomeTeamName.indexOf(keywordUpper) >= 0) || (ev.HomeTeamName.indexOf(keywordLower) >= 0)
            ||
            (ev.AwayTeamName.indexOf(keyword) >= 0) || (ev.AwayTeamName.indexOf(keywordUpper) >= 0) || (ev.AwayTeamName.indexOf(keywordLower) >= 0)
          )
        }

        //有數據才展示
        //生成 SearchLeagueData => SearchEventData
        if(thisL.events && thisL.events.length > 0) {
          leagueArr.push(
            new SearchLeagueData(
              thisL.LeagueId,
              thisL.LeagueName,
              thisL.LeagueOrder,
              SportInfo.SportId,
              thisL.events.map(ev => new SearchEventData(
                ev.EventId,
                ev.EventDate,
                ev.HomeTeamId,
                ev.HomeTeamName,
                ev.AwayTeamId,
                ev.AwayTeamName,
                SportInfo.SportId,
                thisL.LeagueId,
              ))
            )
          )
        }
      }

      //有數據才展示
      //生成 SearchSportData
      if (leagueArr && leagueArr.length > 0) {
        return new SearchSportData(
          SportInfo.SportId,
          SportInfo.SportName,
          SportInfo.DisplayOrder,
          leagueArr,
        )
      } else {
        return null;
      }
    };

    sportsArr.map(s => {
      const thisPromise = getSeachSportData(s,keyword);
      handleDataPromises.push(thisPromise);
    })

    //等待結果
    const sportDatas = await Promise.all(handleDataPromises).then(resultArray => {
      let allDatas = [];
      resultArray.map(SSD => {
        if (SSD) {
          allDatas.push(SSD);
        }
      })
      return allDatas;
    });

    //處理排序
    if (sportDatas && sportDatas.length > 0) {
      //排序 by DisplayOrder 小到大
      const compareDisplayOrder = (a,b) => {
        if (a.DisplayOrder < b.DisplayOrder ) {
          return -1; //小于 0 ，那么 a 会被排列到 b 之前
        }
        if (a.DisplayOrder > b.DisplayOrder) {
          return 1; //大于 0 ， b 会被排列到 a 之前。
        }
        return 0;
      }
      sportDatas.sort(compareDisplayOrder); //排序體育
      sportDatas.map(spd => spd.Leagues.sort(compareDisplayOrder)) //排序聯賽

      //排序 by EventDate 近到遠
      const compareEventDate = (a,b) => {
        const mA = a.getEventDateMoment();
        const mB = b.getEventDateMoment();

        if (mA.isBefore(mB)) {
          return -1; //小于 0 ，那么 a 会被排列到 b 之前
        }
        if (mA.isAfter(mB)) {
          return 1; //大于 0 ， b 会被排列到 a 之前。
        }
        return 0;
      }

      sportDatas.map(spd => spd.Leagues.map(l => l.Events.sort(compareEventDate))) //排序比賽
    }

    console.log('===sportDatas',sportDatas);

    this._cacheSet(cachedResultKey,sportDatas, 3*60); //加速:緩存3分

    return sportDatas;
  }

  //數據緩存(用 查詢參數 當key)
  _DataCache = {}
  _getDataCacheKey(name, params = {}) {
    let params4md5 = Object.assign({},params);
    //清掉 額外添加 或是 查詢過程中會變化 的參數
    // delete params4md5['TimeStamp'];
    // delete params4md5['Delta'];
    // delete params4md5['Token'];
    const paramsMD5 = md5(JSON.stringify(params4md5)).toString();
    //console.log('params4md5',params4md5,'md5value---',paramsMD5,'---md5value');
    return name + '_' + paramsMD5;
  }

  /**
   * 獲取投注前(檢查)信息，返回為SelectionData數組
   *
   * @param wagerType 下注方式，1單注 2串關
   * @param Selections SelectionData 格式，如果下注方式 選擇1單注，直接傳入SelectionData ，如果是２串關，則傳入SelectionData數組
   */
  async getBetInfo(wagerType = WagerType.SINGLE, Selections = []) {
    //語法糖支持：單注改為數組
    if (wagerType === WagerType.SINGLE && !Array.isArray(Selections)) {
      Selections = [Selections];
    }
    //檢查單注
    if (wagerType === WagerType.SINGLE && Selections.length !== 1 ) {
      throw new VendorError(VendorErrorType.DATA_Error,null, { info: 'single bet but multi selection?'});
    } else {
      //串關檢查
      //一個賽事(Event)只能選一個 投注選項(Selection)
      let eventTmp = [];
      let multiEvents = [];
      Selections.map(item => {
        if (eventTmp.indexOf(item.EventId) === -1) {
          eventTmp.push(item.EventId);
        } else {
          multiEvents.push(item);
        }
      });

      if (multiEvents.length > 0) {
        throw new VendorError(VendorErrorType.BET_Selection_Parlay_Error, null, {info: multiEvents})
      }
    }

    let memberOddsType = this.getMemberSetting().oddsType;

    //單注 處理固定歐洲盤玩法
    if (wagerType === WagerType.SINGLE) {
      const thisSelection = Selections[0];
      const forceDecimalBetTypeIds = BTIForceDecimalBetTypeIds[parseInt(thisSelection.SportId)];
      if(forceDecimalBetTypeIds && forceDecimalBetTypeIds.indexOf(thisSelection.BetTypeId) !== -1) {
        //console.log('===bet info force decimal',thisSelection.BetTypeId,JSON.parse(JSON.stringify(thisSelection)))
        memberOddsType = 'decimal';
      }
    }

    const params = {
      oddsStyle: BTIOddsTypeForBet[memberOddsType], //需要再轉一次 這邊用的type 和 查詢數據用的type 字不一樣
      selections: Selections.map(item => { return { id:item.SelectionId }; }),
    }

    const betInfoData = await this._btiBettingFetch(BTIDataTypes.CALCULATEBETS, params)
      .then(jsonData => {

        let filtereddBets = jsonData.bets;
        if (wagerType === WagerType.COMBO) { //串關會返回單注的投注法，這邊用不到，去掉
          filtereddBets = jsonData.bets.filter(item => item.type !== 'Single');
        }

        // let zeroBets = filtereddBets.filter(item => (parseInt(item.minStake) === 0 && parseInt(item.maxStake) === 0));
        // if (zeroBets && zeroBets.length > 0) {
        //   console.log('===zeroBets',zeroBets);
        // }

        //過濾掉上下限為0的投注選項
        filtereddBets = filtereddBets.filter(item => !(parseInt(item.minStake) === 0 && parseInt(item.maxStake) === 0));

        let betSettings = filtereddBets.map(item => {
          const hasComboBonus = !!item.comboBonusPercentage && !!item.trueOddsComboBonusIncluded;
          const estimatedPayoutRate = hasComboBonus ? item.trueOddsComboBonusIncluded : item.trueOdds;

          // BTI維護後已停用freebet 先禁用，後面看情況開
          // let freebets = (item.freeBets && !hasComboBonus) //有串關獎勵就不可以使用freebet
          //   ? item.freeBets.map(fb => new FreeBetData(fb.freeBetType,fb.freeBetToken,fb.freeBetName,fb.freeBetAmount))
          //   : [];
          // //freebet過濾掉freeBetAmount不在投注上下限範圍內的 因為免費投注需要一次用完，上下限不滿足 根本無法投
          // freebets = freebets.filter(fb => {
          //   const deciamlFBAmount = new Decimal(fb.FreeBetAmount);
          //   return deciamlFBAmount.greaterThanOrEqualTo(item.minStake) && deciamlFBAmount.lessThanOrEqualTo(item.maxStake);
          // });

          return new BetSettingData(
            item.minStake,
            item.maxStake,
            estimatedPayoutRate,
            item.type,
            item.numberOfBets,
            'bti',
            hasComboBonus,
            hasComboBonus ? item.comboBonusPercentage : 0,
            hasComboBonus ? item.trueOdds : 0,
            [], //freebets,
            false, //負水盤問題後面 BetInfoData.createFromBTISource會處理，這裡先放默認就行
            1,
            {bet: JSON.parse(JSON.stringify(item)), returnRoundingMode: jsonData.returnRoundingMode},
          )
        });

        //過濾掉不認識的玩法(ComboTypeName為undefined)
        if (betSettings && betSettings.length > 0) {
          betSettings = betSettings.filter(bs => bs.ComboTypeName);
        }

        const selections = jsonData.selections.map(item => {
          //獲取原始selection數據，用來補缺少的字段
          const sourceSelections = Selections.filter(selection => selection.SelectionId === item.id);
          let sourceSelectionData = null;
          if (sourceSelections && sourceSelections.length > 0) {
            sourceSelectionData = sourceSelections[0];
          } else {
            throw new VendorError(VendorErrorType.DATA_Error,null,{info: 'source selection not found??: ' + item.id});
          }

          if ((item.points !== undefined)
            && (sourceSelectionData.Handicap !== undefined)
            && (item.points != sourceSelectionData.Handicap))
          {
            console.log('====hadicap changed!!!!!!',sourceSelectionData.Handicap, ' => ', item.points)
          }

          //bti回傳的信息很少，直接把sourceSelection複製一份拿出來改
          //let selectionClone = JSON.parse(JSON.stringify(sourceSelectionData)); 不能使用JSON處理，會遺失class特性
          return new SelectionData(
            sourceSelectionData.SelectionId,
            sourceSelectionData.SelectionType,
            sourceSelectionData.SelectionName,
            sourceSelectionData.SelectionGroup,
            item.points ?? sourceSelectionData.Handicap,
            item.points ?? sourceSelectionData.Handicap,
            sourceSelectionData.Specifiers,
            sourceSelectionData.SportId,
            sourceSelectionData.MarketId,
            sourceSelectionData.MarketName,
            sourceSelectionData.LeagueId,
            sourceSelectionData.LeagueName,
            sourceSelectionData.HomeTeamId,
            sourceSelectionData.HomeTeamName,
            null,  //HomeScore下面會另外查詢補上
            sourceSelectionData.AwayTeamId,
            sourceSelectionData.AwayTeamName,
            null, //AwayScore下面會另外查詢補上
            sourceSelectionData.EventId,
            sourceSelectionData.IsOpenParlay,
            sourceSelectionData.LineId,
            sourceSelectionData.BetTypeId,
            sourceSelectionData.BetTypeName,
            sourceSelectionData.PeriodId,
            sourceSelectionData.PeriodName,
            sourceSelectionData.TargetTeamId,
            sourceSelectionData.TargetTeamName,
            sourceSelectionData.IsOutRightEvent,
            sourceSelectionData.OutRightEventName,
            item.displayOdds ?? sourceSelectionData.Odds,  //有可能返回空的Odds
            BTIOddsTypeToNumber[memberOddsType],
            sourceSelectionData.OddsList.map(oddsItem => {
              return new OddsData(
                oddsItem.OddsType,
                oddsItem.OddsValues,
              )
            }),
            item.displayOdds ?? sourceSelectionData.DisplayOdds,  //有可能返回空的Odds
            sourceSelectionData.SelectionIsLocked,
            1, //盘口狀態 1開2關，投注時使用
            SelectionStatusType.OK, //投注選項(檢查)狀態，投注時使用
            {selection: JSON.parse(JSON.stringify(item))},
          )
        })

        return BetInfoData.createFromBTISource(
          betSettings.length >0 ? betSettings : null, //偶發性會不提供bet數據
          selections,
        )
      })
      .catch(async error => {
        if (typeof error  === 'object' && error.isVendorError === true) {
          if (error.ErrorType === VendorErrorType.BET_Event_Error) {
            let newData = null;
            //處理selectionId不正確問題
            if (wagerType === WagerType.SINGLE) {
              const thisSelections = Selections.map(item => {
                const copy = JSON.parse(JSON.stringify(item));
                copy.SelectionStatus = SelectionStatusType.NOTAVIILABLE //標記為不可用
                return SelectionData.clone(copy) //利用clone重新配置數據
              });

              newData = BetInfoData.createFromBTISource(
                null,
                thisSelections,
              )
            } else {
              //自己查，把不可用的列出來
              const thisSelections = await Promise.all(Selections.map(async item => {
                const thisPR = await this.getEventDetail(item.SportId,item.EventId);
                let thisSelection = null;
                if (thisPR && thisPR.NewData) {
                  const thisEvent = thisPR.NewData;
                  thisSelection = thisEvent.getChildSelection(item.SelectionId, item.LineId, item.EventId);
                }

                if (thisSelection) {
                  const copy = JSON.parse(JSON.stringify(thisSelection));
                  copy.SelectionStatus = SelectionStatusType.OK; //設置為ok
                  return SelectionData.clone(copy) //利用clone重新配置數據
                } else {
                  const copy = JSON.parse(JSON.stringify(item));
                  copy.SelectionStatus = SelectionStatusType.NOTAVIILABLE //標記為不可用
                  return SelectionData.clone(copy) //利用clone重新配置數據
                }
              }));

              newData = BetInfoData.createFromBTISource(
                null,
                thisSelections,
              )
            }
            return newData;
          }
        }
        throw error; //沒有特別指定要處理的 就繼續往外丟出例外
      })

    //注意這裡拿到的betInfoData的BetSettings和Selections都是數組型態

    //處理 可用投注方式(betSetting) 為空 的問題(只有單注需要如此處理，串關 直接不展示串關方式就行 )
    if(wagerType === WagerType.SINGLE && !betInfoData.BetSettings) {
      betInfoData.Selections = betInfoData.Selections.map(item => {
        //如果有可用的 投注選項，設置為更新中(總之就是不給投注)
        if (item.SelectionStatus === SelectionStatusType.OK) {
          const copy = JSON.parse(JSON.stringify(item));
          copy.SelectionStatus = SelectionStatusType.UPDATING; //設置為更新中
          return SelectionData.clone(copy) //利用clone重新配置數據
        } else {
          return item;
        }
      });
    }

    //更新賽事比分
    //利用getEventsDetail一次查詢
    const eventInfos = betInfoData.Selections.map(item => new EventInfo(item.EventId,item.SportId,item.IsOutRightEvent));
    const pollingResult = await this.getEventsDetail(eventInfos,true) //只要比分，返回沒有投注線的數據
    //更新比分數據
    betInfoData.Selections.map((item,index) => {
      const thisEvents = pollingResult.NewData.filter(eitem => eitem.EventId === item.EventId);
      if (thisEvents.length > 0) {
        const thisEvent = thisEvents[0];
        betInfoData.Selections[index].HomeScore = thisEvent.HomeScore;
        betInfoData.Selections[index].AwayScore = thisEvent.AwayScore;
      }
    })

    //語法糖支持：單注返回單個Object，串關才返回數組
    let newData = null;
    if (wagerType === WagerType.SINGLE) {
      newData = new BetInfoData(
        (betInfoData.BetSettings && betInfoData.BetSettings.length >0) ? betInfoData.BetSettings[0] : null,
        null,
        (betInfoData.Selections && betInfoData.Selections.length >0) ? betInfoData.Selections[0] : null,
      )
    } else {
      newData = betInfoData;
    }

    //比對新舊差異
    const SelectionIds = Selections.map(item => item.SelectionId);
    const cacheKey = this._getDataCacheKey('getBetInfo', {wagerType, SelectionIds});
    const oldData = this._DataCache[cacheKey];
    let changes = [];
    if (oldData) {
      //語法糖支持：單注返回單個Object，串關才返回數組
      if (wagerType === WagerType.SINGLE) {
        const oldItem = oldData.Selections;
        const newItem = newData.Selections;
        if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {  //有變化才提交change
          changes.push(new SelectionChangeData(oldItem.SelectionId, oldItem, newItem))
        }
      } else {
        oldData.Selections.map(oldItem => {
          const newSelections = newData.Selections.filter(newItem => newItem.SelectionId === oldItem.SelectionId);
          if (newSelections && newSelections.length > 0) {
            const newItem = newSelections[0];
            if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {  //有變化才提交change
              changes.push(new SelectionChangeData(oldItem.SelectionId, oldItem, newItem))
            }
          }
        })
      }
    }

    //保存查詢結果
    this._DataCache[cacheKey] = newData;

    return new PollingResult(newData, changes);
  }

  /**
   * 輪詢獲取投注前(檢查)信息 10秒一次
   *
   * 注意
   * 1. 一次只能一個單注/串關，所以 多個單注 需要分開調用這個接口
   * 2. 一個比賽 同時只能選一個投注選項，後面選的要覆蓋之前的
   * 3. EventData.IsOpenParlay === true 才可以加入串關
   *
   * @param onUpdateCallback 輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData: 單個BetInfoData數據, Changes: SelectionChangeData 數組}
   * @param wagerType 下注方式，1單注 2串關
   * @param Selections 格式，如果下注方式 選擇1單注，直接傳入SelectionData ，如果是２串關，則傳入SelectionData數組
   * @param uniqueName         用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   * @returns 輪詢key
   */
  getBetInfoPolling(onUpdateCallback, wagerType = WagerType.SINGLE, Selections = [], uniqueName = '') {
    const dataQuery = () => this.getBetInfo(wagerType, Selections);
    //存在多個同時調用，不可以互相覆蓋，需要用下注參數添加 uniqueName
    let array_selections = Selections;
    if (!Array.isArray(Selections)) {
      array_selections = [Selections];
    }
    const selectionIds = array_selections.map(s => s.SelectionId);
    const selectionIdJoins = selectionIds.join('|');
    const betInfo_and_uniqueName =  wagerType + '_' + selectionIdJoins + '_' + uniqueName;
    return this._registerPolling('BETINFO', {wagerType, Selections}, dataQuery, onUpdateCallback, 10, betInfo_and_uniqueName);
  }

  //輪詢getPurchase緩存，目前只拿來記錄重試次數
  _getPurchasesCache = {}

  //輪詢 getPurchase 查詢滾球注單狀態
  async _getPurchasesPolling(waitingBetId, testFuncs = [], maxRetryCount = 30, uniqueName = ''){
    const thisCacheKey = waitingBetId + uniqueName;
    this._getPurchasesCache[thisCacheKey] = {retryCount:0};
    return new Promise(resolve => {
      const query = () => {
        this._btiBettingFetch(BTIDataTypes.GETPURCHASES, {Ids:waitingBetId}, 'get')
          .then(jsonData => {
            if (jsonData.purchases && jsonData.purchases.length > 0) {
              const targetPurchases = jsonData.purchases.filter(item => item.waitingBetId && item.waitingBetId === waitingBetId);
              if (targetPurchases && targetPurchases.length > 0) {
                const targetPurchase = targetPurchases[0];
                for(let testf of testFuncs) {
                  if (testf.func(targetPurchase)) {
                    delete this._getPurchasesCache[thisCacheKey]
                    //console.log('_getPurchasesPolling', testf.status , jsonData)
                    return resolve({status:testf.status, purchase: targetPurchase}); //成功
                  }
                }
              }
            }
            if (this._getPurchasesCache[thisCacheKey].retryCount < maxRetryCount) {
              this._getPurchasesCache[thisCacheKey].retryCount = this._getPurchasesCache[thisCacheKey].retryCount +1;
              //console.log('_getPurchasesPolling', 'RETRY', this._getPurchasesCache[thisCacheKey] , jsonData)
              setTimeout(query, 1000); //建議一秒一次
            } else {
              delete this._getPurchasesCache[thisCacheKey]
              //console.log('_getPurchasesPolling', 'EXPIRE' , jsonData)
              return resolve({status:'EXPIRE', purchase: jsonData}); //超時
            }
          })
      };

      query();
    });
  }

  //輪詢getPurchase緩存，目前只拿來記錄重試次數
  _UnSettleWagerCache = {}

  //輪詢 getUnSettleWagers 查詢滾球注單紀錄(因為可能會獲取不到，需要嘗試多次
  async _getUnSettleWagerPolling(purchaseId, maxRetryCount = 10){
    const thisCacheKey = purchaseId;
    this._UnSettleWagerCache[thisCacheKey] = {retryCount:0};
    return new Promise(resolve => {
      const query = () => {
        //注意不要直接用getUnsettleWagers()去拿 wagerData，因為拿到的wagerid是purchaseId 這裡需要的是betid才對
        const unSettleWagers = this._btiWagerFetch(BTIDataTypes.WAGERUNSETTLE,null,null, purchaseId)
          .then(jsonData => {
             if (jsonData.bets && jsonData.bets.length >0 && jsonData.bets[0]) {
               delete this._UnSettleWagerCache[thisCacheKey]
               return resolve(jsonData.bets[0].betId);
             } else { //沒查到，重試
               if (this._UnSettleWagerCache[thisCacheKey].retryCount < maxRetryCount) {
                 this._UnSettleWagerCache[thisCacheKey].retryCount = this._UnSettleWagerCache[thisCacheKey].retryCount +1;
                 console.log('_getUnSettleWagerPolling', 'RETRY', this._UnSettleWagerCache[thisCacheKey].retryCount)
                 setTimeout(query, 1000); //1秒一次
               } else {
                 delete this._getPurchasesCache[thisCacheKey]
                 console.log('_getUnSettleWagerPolling', 'EXPIRE')
                 return resolve(purchaseId); //超時就還是給purchaseId
               }
             }
          })
      };

      query();
    });
  }

  /**
   * 投注，返回為 BetResultData 格式
   * 注意需要async開頭  不然前面丟出來的VendorError 會需要try...catch去接，更麻煩
   *
   * @param wagerType 下注方式，1單注 2串關
   * @param betInfoData BetInfoData 格式，從getBetInfo獲取的,
   * @param betAmount 下注金額
   * @param comboType 串關類型，選填，默認單注填0，串關需要從BetInfoData裡面的BetSettingData數組 選擇一個
   * @param forceAcceptAnyOdds  強制接受所有賠率變更 默認false
   * @param extraConfigs.freeBetToken BTI獨有:免費投注id，有用到才填
   */
  async placeBet(wagerType = WagerType.SINGLE, betInfoData, betAmount, comboType = 0, forceAcceptAnyOdds = false, extraConfigs ={}) {
    //語法糖支持：單注改為數組
    let selections = betInfoData.Selections;
    if (wagerType === WagerType.SINGLE && !Array.isArray(selections)) {
      selections = [selections];
    }
    //檢查單注
    if (wagerType === WagerType.SINGLE && selections.length !== 1) {
      throw new VendorError(VendorErrorType.DATA_Error,null, { info: 'single bet but multi selection?'});
    }

    let selectedBetSetting = betInfoData.BetSettings;
    //檢查串關類型(ComboType)，必須從BetInfoData裡面的BetSettingData/SystemParlayBetSettings數組 選擇一個
    if(wagerType === WagerType.COMBO) {
      const selectedBetSettings = betInfoData.BetSettings.filter(item => item.ComboType === comboType);
      const selectedSystemBetSettings = betInfoData.SystemParlayBetSettings.filter(item => item.ComboType === comboType);
      if (selectedBetSettings.length <=0 && selectedSystemBetSettings.length <=0) {
        throw new VendorError(VendorErrorType.DATA_Error,null, { info: 'comboType incorrect'});
      }
      if (selectedBetSettings.length >0) {
        selectedBetSetting = selectedBetSettings[0];
      } else if (selectedSystemBetSettings.length > 0) {
        selectedBetSetting = selectedSystemBetSettings[0];
      }
    }

    //適配alan寫法 單注也傳入數組
    if (Array.isArray(selectedBetSetting) && selectedBetSetting.length > 0) {
      selectedBetSetting = selectedBetSetting[0];
    }

    let freeBetToken = extraConfigs.freeBetToken;
    //檢查freebetToken(如果有)，必須從選擇的BetInfoData裡面的FreeBets選擇一個
    if (freeBetToken && selectedBetSetting) {
      if (!selectedBetSetting.FreeBets || selectedBetSetting.FreeBets.length <=0) {
        throw new VendorError(VendorErrorType.DATA_Error,null, { info: 'no freebet?'});
      }

      const selectedFreebets = selectedBetSetting.FreeBets.filter(fb => fb.FreeBetToken === freeBetToken);
      let selectedFreebet = null
      if (selectedFreebets && selectedFreebets.length > 0) {
        selectedFreebet = selectedFreebets[0];
      } else {
        throw new VendorError(VendorErrorType.DATA_Error,null, { info: 'freebet not found?'});
      }

      //檢查freebet必須一次用完
      if (new Decimal(selectedFreebet.FreeBetAmount).greaterThan(betAmount) ) {
        throw new VendorError(VendorErrorType.DATA_Error,null, { info: 'must use full freebet amount'});
      }

      //檢查freebet不能和comboBonus一起用
      if (selectedFreebet && selectedBetSetting.HasComboBonus) {
        throw new VendorError(VendorErrorType.BET_Place_NO_COMBO_FREE,null, { info: 'NO_COMBO_FREE'});
      }
    }

    //轉成BTI格式
    const BTIbets = selectedBetSetting.toBTIBets(betAmount,freeBetToken);
    const BTIselections = selections.map(item => item.toBTIWager());

    const memberSetting = this.getMemberSetting();

    //兩種配置 接受全部變化(false) 跟 只接受賠率上升(true)
    let acceptMode = memberSetting.alwaysAcceptBetterOdds ? BTIAcceptMode.HIGHER : BTIAcceptMode.ANY;
    //強制接受賠率變更
    if (forceAcceptAnyOdds) {
      acceptMode = BTIAcceptMode.ANY;
    }

    let memberOddsType = memberSetting.oddsType;

    //單注 處理固定歐洲盤玩法
    if (wagerType === WagerType.SINGLE) {
      const thisSelection = selections[0];
      const forceDecimalBetTypeIds = BTIForceDecimalBetTypeIds[parseInt(thisSelection.SportId)];
      if(forceDecimalBetTypeIds && forceDecimalBetTypeIds.indexOf(thisSelection.BetTypeId) !== -1) {
        //console.log('===place bet force decimal',thisSelection.BetTypeId,JSON.parse(JSON.stringify(thisSelection)))
        memberOddsType = 'decimal';
      }
    }

    let params = {
      bets:BTIbets,
      selections:BTIselections,
      locale: vendorSettings.LanguageCode,
      oddsStyle: BTIOddsTypeForBet[memberOddsType], //需要再轉一次 這邊用的type 和 查詢數據用的type 字不一樣
      autoAcceptMode: acceptMode,
    }

    //日志用
    const postJSON = JSON.parse(JSON.stringify(params));

    return this._btiBettingFetch(BTIDataTypes.PLACEBETS,params)
      .then(async jsonData => {
        //日志用
        let logData = { placeBet: JSON.parse(JSON.stringify(jsonData)) }

        //不管是不是串關，都只會有一個bet數據返回
        let bet = jsonData.bets[0];

        //處理live delay,需要等待成單或拒絕
        if (bet && (bet.status === 'LiveDelay' || bet.status ==='TraderDelay')  && jsonData.waitingBetId) {
          const betResult = await this._getPurchasesPolling(jsonData.waitingBetId,
            [
              { status:'OK' ,func: (purchaseData) => purchaseData.status && purchaseData.status === 'Open'},
              { status:'ODDS', func: (purchaseData) => purchaseData.status && purchaseData.status === 'NewOffer'}, //NewOffer表示賠率變化，且不能autoAccept
              { status:'FAIL', func: (purchaseData) => purchaseData.status && purchaseData.status === 'Declined'},
            ], 60
          );

          if (betResult.status === 'OK') {
            //日志用
            logData.getPurchases = JSON.parse(JSON.stringify(betResult.purchase))

            //用purchase查詢到的數據取代
            jsonData = betResult.purchase;
            bet = jsonData.bets[0];
            //console.log('get new bet result', jsonData, bet);
          } else if(betResult.status === 'ODDS') {
            throw new VendorError(VendorErrorType.BET_Place_OddChanged, null, {info: betResult})
          } else if (betResult.status === 'EXPIRE') { //特別處理超時
            throw new VendorError(VendorErrorType.BET_Place_Expire, null, {info: betResult})
          } else {
            throw new VendorError(VendorErrorType.BET_Place_Error, null, {info: betResult})
          }
        }

        //查詢投注記錄 purchaseId 轉為 betid
        let wagerId = jsonData.id;
        if (jsonData.id !== 0) {
          await new Promise(resolve => {setTimeout(resolve,1000)}); //需要等一下才會有投注記錄
          const betid = await this._getUnSettleWagerPolling(jsonData.id);
          wagerId = betid;
          console.log('===BTI betId',wagerId,'purchaseId',jsonData.id);
        }

        return new BetResultData(
          0,
          wagerId,
          bet.status,
          bet.status,
          false, //bti沒有pending的投注記錄 無法支持
          null,
          bet.type,
          bet.potentialReturns,
          jsonData.selections.map(item => {
            return new BetSelectionResultData(
              null,  //bti沒有這個數據，反正也沒用到
              item.displayOdds,
              null, //bti沒有這個數據，反正也沒用到
            )
          }),
          JSON.stringify({ request: postJSON, response:logData }),
        )
      })
      .catch(error => {
        if (typeof error  === 'object' && error.isVendorError === true) {
          let thiserror = error;
          //額外處理 422(PurchaseNotAccepted) => BET_Place_Error
          if (error.ErrorType === VendorErrorType.BET_Place_Error) {
             if(error.ErrorInfo.errorJSON) {
               if (error.ErrorInfo.errorJSON.response
                 && error.ErrorInfo.errorJSON.response.bets
                 && error.ErrorInfo.errorJSON.response.bets.length > 0
                 && error.ErrorInfo.errorJSON.response.bets[0]
                 && error.ErrorInfo.errorJSON.response.bets[0].declineReasons
                 && error.ErrorInfo.errorJSON.response.bets[0].declineReasons.length > 0
               ){
                 error.ErrorInfo.errorJSON.response.bets[0].declineReasons.map(dReason => {
                   if (dReason.name === 'CustomerLimitsError') {
                     //低於下限
                     if (dReason.reason === 'Deposit amount is too low' || dReason.reason === 'StakeTooLow') {
                       thiserror = new VendorError(VendorErrorType.BET_Place_LimitMin,null,error.ErrorInfo);
                     }
                     //高於上限
                     if (dReason.reason === 'DespositeBig' || dReason.reason === 'StakeTooHigh') {
                       thiserror = new VendorError(VendorErrorType.BET_Place_LimitMax,null,error.ErrorInfo);
                     }
                   } else if (dReason.name === 'InsufficientFunds') { //餘額不足
                     thiserror = new VendorError(VendorErrorType.BET_Place_Balance,null,error.ErrorInfo);
                   } else if (dReason.name === 'OddsNotMatch' || dReason.name === 'PointsNotMatch') { //賠率已變化,點位已變化
                     //按bti的說明，如果 1.比賽不是進行中 2.同一個投注選項投第二次以上 賠率變化配置 就會無效
                     //所以遇到這個信息要自己處理

                     //判斷要不要重新嘗試投注
                     let canBet = false;
                     if (acceptMode === BTIAcceptMode.ANY) {
                       canBet = true;
                     } else if (acceptMode === BTIAcceptMode.HIGHER) {
                       if (dReason.name === 'OddsNotMatch') {
                         const newOdds = new Decimal(error.ErrorInfo.errorJSON.response.bets[0].newTrueOdds);
                         const thisOdds = new Decimal(error.ErrorInfo.errorJSON.response.bets[0].receivedTrueOdds);
                         if (newOdds.greaterThan(thisOdds)) {
                           canBet = true;
                         }
                       }
                       if (dReason.name === 'PointsNotMatch') {
                         //點位不用判斷，一律視為賠率變化
                       }
                     }

                     if (canBet) {
                       //如果要重新投 流程太複雜不搞，直接提示稍後重試投注
                       thiserror = new VendorError(VendorErrorType.BET_Place_UpdateInfoRequired, null, error.ErrorInfo);
                     } else {
                       thiserror = new VendorError(VendorErrorType.BET_Place_OddChanged, null, error.ErrorInfo);
                     }
                   } else if (dReason.name === 'SelectionClosed') { //投注選項已不可用
                     thiserror = new VendorError(VendorErrorType.BET_Selection_Error, null, error.ErrorInfo);
                   }
                 })
               }
             }
          }
          if (thiserror) {
            throw thiserror; //繼續往外丟出例外
          }
        }
      })
  }

  /**
   * 補查可CashOut的注單數據，返回為WagerData數組
   */
  decorateCashOutAbleWagers(wagerDatas = []) {
    return this._btiCashOutFetch(BTIDataTypes.CASHOUT_GETINFO)
      .then(jsonData => {
        Object.keys(jsonData).map(key => {
          //console.log('===decorateCashOutAbleWagers',key)
            wagerDatas.map(wd => {
              if (wd.WagerId == key && jsonData[key]) {
                const info = jsonData[key];
                if (info.Status === 'Available')
                {
                  wd.CanCashOut = true;
                  wd.CashOutStatus = CashOutStatusType.NOTYET;
                  wd.CashOutPriceId = null;
                  wd.CashOutPrice = info.Amount;
                } else if (info.Status === 'Pending') {
                  wd.CanCashOut = true
                  wd.CashOutStatus = CashOutStatusType.PROCESS;
                } else if (info.Status === 'NewOffer') {
                  wd.CanCashOut = true
                  wd.CashOutStatus = CashOutStatusType.NOTYET; //當作一般處理
                  wd.CashOutPriceId = 'NEWPRICE'; //這裡記錄他是newOffer，在place bet時處理
                  wd.CashOutPrice = info.Amount;
                } else if (info.Status === 'Declined') { //視為無法兌現
                  wd.CanCashOut = false;
                  wd.CashOutStatus = CashOutStatusType.NOTYET;
                  wd.CashOutPriceId = null;
                  wd.CashOutPrice = null;
                }
              }
            })
        })

        return wagerDatas;
      })
      .catch(error => {
        return wagerDatas;
      })
  }

  /**
   * 查詢未結算注單，返回為WagerData數組
   */
  getUnsettleWagers(purchaseId = null){
    return this._btiWagerFetch(BTIDataTypes.WAGERUNSETTLE,null,null,purchaseId)
      .then(async jsonData => {
        let wagerDatas = jsonData.bets.map(item => {
          return WagerData.createFromBTISource(item);
        })

        if (wagerDatas && wagerDatas.length > 0) {
          let EventIdList = [];
          wagerDatas.map(item => {
            if (item.WagerItems && item.WagerItems.length > 0) {
              item.WagerItems.map(ii => {
                if (EventIdList.indexOf(ii.EventId) === -1) {
                  EventIdList.push(ii.EventId);
                }
              })
            }
          })

          //getEventsDetail需要傳入EventInfo數組(為了適配IM的查詢)，這邊直接包裝一下給EventId就可以，因為BTI查詢也只會用到EventId
          let EventInfos = EventIdList.map(eid => ({ EventId:eid }));
          await this.getEventsDetail(EventInfos,true)
            .then(pr => {
              const evDatas = pr.NewData;
              let matchedResults = {};
              evDatas.map(ev => {
                if (ev.IsRB) {
                  matchedResults[ev.EventId] = {
                    RBMinute:ev.RBMinute,
                    RBPeriodName:ev.RBPeriodName,
                    RBHomeScore:ev.HomeScore,
                    RBAwayScore:ev.AwayScore
                  };
                }
              })

              if (JSON.stringify(matchedResults) != '{}') {

                console.log('====matchedResults',matchedResults);

                wagerDatas.map(item => {
                  if (item.WagerItems && item.WagerItems.length > 0) {
                    item.WagerItems.map(ii => {
                      if (matchedResults[ii.EventId]) {
                        const thisR = matchedResults[ii.EventId];
                        ii.IsRB = true;
                        ii.RBMinute = thisR.RBMinute;
                        ii.RBPeriodName = thisR.RBPeriodName;
                        ii.RBHomeScore = thisR.RBHomeScore;
                        ii.RBAwayScore = thisR.RBAwayScore;
                      }
                    });
                  }
                })
              }
            })
        }

        return this.decorateCashOutAbleWagers(wagerDatas);
      })
  }

  /**
   * 輪詢未結算注單 10秒一次
   *
   * @param onUpdateCallback   輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData:SportData數組, Changes:空數組}
   * @param uniqueName         用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getUnsettleWagersPolling(onUpdateCallback, uniqueName = '') {
    const dataQuery = () => this.getUnsettleWagers();
    return this._registerPolling('getUnsettleWagersPolling',{}, dataQuery, onUpdateCallback, 10, uniqueName, true);
  }

  /**
   * 提交 提前兌現
   * @param wagerData 要提前兌現的投注，WagerData格式
   */
  async cashOut(wagerData) {
    let cloneWagerData = WagerData.clone(wagerData); //複製一份

    //日志用
    let postJSON = { PurchaseId:wagerData.WagerId, CashOutAmount:wagerData.CashOutPrice}

    if(wagerData.CashOutPriceId && wagerData.CashOutPriceId === 'NEWPRICE') {
      //如果拿到 NEWPRICE 表示正在NEWOFFER狀態，需要查一次GetUpdate去拿到WaitingBetId
      let waittingBetId = await this._btiCashOutFetch(BTIDataTypes.CASHOUT_GETUPDATES)
        .then(jsonData => {
          if (jsonData && Array.isArray(jsonData) && jsonData.length > 0) {
            const targetDatas = jsonData.filter(item => item.WaitingBetId && item.PurchaseId && item.PurchaseId === wagerData.WagerId);
            if (targetDatas && targetDatas.length > 0) {
              const targetData = targetDatas[0];
              return targetData.WaitingBetId;
            }
          }
        });
      if (waittingBetId) {
        wagerData.CashOutPriceId = waittingBetId;
      } else {
        //無法成功取到WaitingBetId 就視為失敗
        cloneWagerData.CashOutStatus = CashOutStatusType.FAIL; //視為兌現失敗
        return new CashOutResultData(
          cloneWagerData,
          false,
          null,
          JSON.stringify({ request: postJSON , response: "can't get WaitingBetId " }),
        )
      }
    }


    if(wagerData.CashOutPriceId) { //NEW OFFER 提交

      let postJSON = { WaitingBetId:wagerData.CashOutPriceId, Accepted:true }

      return this._btiCashOutFetch(BTIDataTypes.CASHOUT_PLACENEWOFFER,
        {
          POST: true,
          jsonBody: JSON.stringify({ WaitingBetId:wagerData.CashOutPriceId, Accepted:true })
        })
        .then(async jsonData => {

          //日志用
          let logData = {placeNewOffer: JSON.parse(JSON.stringify(jsonData))}


          //更新結果
          if (jsonData.IsSuccess) {
            cloneWagerData.CashOutStatus = CashOutStatusType.DONE;
          } else if (jsonData.CashOutStatus === 'Declined') {
            cloneWagerData.CashOutStatus = CashOutStatusType.FAIL; //視為兌現失敗
          }

          return new CashOutResultData(
            cloneWagerData,
            false,
            null,
            JSON.stringify({request: postJSON, response: logData}),
          )
        })
        .catch(async error => {
          //所有其他錯誤直接視為失敗
          cloneWagerData.CashOutStatus = CashOutStatusType.FAIL;
          return new CashOutResultData(
            cloneWagerData,
            false,
            null,
            JSON.stringify({request: postJSON, response: {error: error}}),
          )
        })
    } else {
      //一般提交

      return this._btiCashOutFetch(BTIDataTypes.CASHOUT_PLACE,
        {
          POST: true,
          jsonBody: JSON.stringify({PurchaseId: wagerData.WagerId, CashOutAmount: wagerData.CashOutPrice})
        })
        .then(async jsonData => {

          //日志用
          let logData = {place: JSON.parse(JSON.stringify(jsonData))}

          //處理pending
          if (jsonData && jsonData.CashOutStatus === 'Pending' && jsonData.WaitingBetId) {
            const updateResult = await this._getCashOutUpdatePolling(jsonData.WaitingBetId,
              [
                {status: 'DONE', func: (data) => data.Status && data.Status === 'Accepted'},
                {status: 'NEWPRICE', func: (data) => data.Status && data.Status === 'NewOffer'},
                {status: 'FAIL', func: (data) => data.Status && data.Status === 'Declined'},
              ], 60
            );

            //日志用
            logData.getUpdate = JSON.parse(JSON.stringify(updateResult.data))

            if (updateResult.status === 'DONE') {
              jsonData.CashOutStatus = updateResult.data.Status;
            } else if (
              updateResult.status === 'NEWPRICE'
              && updateResult.data && updateResult.data.NewOffer && updateResult.data.NewOffer.Amount
            ) {
              jsonData.CashOutStatus = updateResult.data.Status;
              //直接更新價格
              cloneWagerData.CashOutStatus = CashOutStatusType.NEWPRICE;
              cloneWagerData.CashOutPriceId = jsonData.WaitingBetId;
              cloneWagerData.CashOutPrice = updateResult.data.NewOffer.Amount;
            } else { //FAIL 和 EXPIRE
              //超時不做額外處理，也算失敗
              jsonData.CashOutStatus = 'Declined'
            }
          }

          //更新結果
          if (jsonData.CashOutStatus === 'Accepted') {
            cloneWagerData.CashOutStatus = CashOutStatusType.DONE;
          } else if (jsonData.CashOutStatus === 'Declined') {
            cloneWagerData.CashOutStatus = CashOutStatusType.FAIL; //視為兌現失敗
          }

          return new CashOutResultData(
            cloneWagerData,
            false,
            null,
            JSON.stringify({request: postJSON, response: logData}),
          )
        })
        .catch(async error => {
          //所有其他錯誤直接視為失敗
          cloneWagerData.CashOutStatus = CashOutStatusType.FAIL;
          return new CashOutResultData(
            cloneWagerData,
            false,
            null,
            JSON.stringify({request: postJSON, response: {error: error}}),
          )
        })
    }
  }

  //輪詢getCashOutUpdate緩存，目前只拿來記錄重試次數
  _getCashOutUpdateCache = {}

  //輪詢 getCashOutUpdate 查詢 cashout 狀況
  async _getCashOutUpdatePolling(waitingBetId, testFuncs = [], maxRetryCount = 121, uniqueName = ''){
    const thisCacheKey = 'CashOutUpdate_' + waitingBetId + uniqueName;
    this._getCashOutUpdateCache[thisCacheKey] = {retryCount:0};
    return new Promise(resolve => {
      const query = () => {
        this._btiCashOutFetch(BTIDataTypes.CASHOUT_GETUPDATES)
          .then(jsonData => {
            if (jsonData && Array.isArray(jsonData) && jsonData.length > 0) {
              const targetDatas = jsonData.filter(item => item.WaitingBetId && item.WaitingBetId === waitingBetId);
              if (targetDatas && targetDatas.length > 0) {
                const targetData = targetDatas[0];
                for(let testf of testFuncs) {
                  if (testf.func(targetData)) {
                    delete this._getCashOutUpdateCache[thisCacheKey]
                    //console.log('_getPurchasesPolling', testf.status , jsonData)
                    return resolve({status:testf.status, data: targetData}); //成功
                  }
                }
              }
            }
            if (this._getCashOutUpdateCache[thisCacheKey].retryCount < maxRetryCount) {
              this._getCashOutUpdateCache[thisCacheKey].retryCount = this._getCashOutUpdateCache[thisCacheKey].retryCount +1;
              //console.log('_getPurchasesPolling', 'RETRY', this._getPurchasesCache[thisCacheKey] , jsonData)
              setTimeout(query, 1000); //建議一秒一次
            } else {
              delete this._getCashOutUpdateCache[thisCacheKey]
              //console.log('_getPurchasesPolling', 'EXPIRE' , jsonData)
              return resolve({status:'EXPIRE', data: jsonData}); //超時
            }
          })
      };

      query();
    });
  }

  /**
   * 提交 提前兌現 拒絕新價格
   * @param wagerData 要拒絕提前兌現的投注，WagerData格式
   */
  async cashOutDeclineNewOffer(wagerData) {
    let postJSON = { WaitingBetId:wagerData.CashOutPriceId, Accepted:true }

    return this._btiCashOutFetch(BTIDataTypes.CASHOUT_PLACENEWOFFER,
      {
        POST: true,
        jsonBody: JSON.stringify({ WaitingBetId:wagerData.CashOutPriceId, Accepted:false })
      })
      .then(async jsonData => {
        return true;
      })
      .catch(async error => {
        return false;
      })
  }

  /**
   * 查詢已結算注單，返回為WagerData數組
   *
   * @param StartDate 開始日期 YYYY-MM-DD 格式 默認今天
   * @param EndDate  結束日期 YYYY-MM-DD 格式 默認今天
   */
  getSettledWagers(StartDate = moment().format('YYYY-MM-DD'), EndDate = moment().format('YYYY-MM-DD')){
    return this._btiWagerFetch(BTIDataTypes.WAGERSETTLED, StartDate, EndDate)
      .then(jsonData => {
        return jsonData.bets.map(item => {
          return WagerData.createFromBTISource(item);
        })
      })
  }

  //獲取用戶配置
  getMemberSetting() {
    let result = super.getMemberSetting();

    //把oddsType轉為BTI格式
    result.oddsType = BTIOddsType[result.oddsType];

    //debug
    // result.oddsType = BTIOddsType.EU;

    return result;
  }

  /**
   * 獲取供應商公告
   */
  getAnnouncements() {
    return this._btiAnnouncementFetch()
      .then(jsonData => {
        //考慮沒有數據的情況，返回空數組
        if (!jsonData || jsonData.length <= 0) {
          return [];
        }

        return jsonData.map(item=> {

          const postingDate = moment(item.dateTime).format('YYYY/MM/DD HH:mm');

          return new AnnouncementData(
            item.aid,
            item.content,
            postingDate,
            {index: item.index}
          );
        });
      });
  }

  //判斷是否波膽Line
  isCorrectScoreLine(lineData) {
    return (parseInt(lineData.BetTypeId) === 60)
  }

  //判斷是否[全場]波膽Line
  isFTCorrectScoreLine(lineData) {
    return this.isCorrectScoreLine(lineData); //BTI只有全場波膽
  }

  //從LineData獲取 波膽投注分類數據 分 主 和 客 三條
  splitCorrectScoreSelectionsFromLine(lineData) {
    if (!lineData || !lineData.Selections || lineData.Selections.length <=0) {
      return null;
    }

    const seprator = ':'; //BTI用冒號
    //按 比分 分組
    let homes = [];
    let homeNumbers = {};
    let ties = [];
    let tieNumbers = {};
    let aways = [];
    let awayNumbers = {};
    let other = null; //BTI沒有其他 這裡注定為空
    let maxPoint = 0;
    lineData.Selections.map(sel => {
      if (sel.SelectionId == 0 || sel.DisplayOdds === '0.00') {
        sel.SelectionIsLocked = true; //額外標記投注選項已鎖定 無法使用
      }
      if (sel.SelectionName && sel.SelectionName.indexOf(seprator) !== -1) {
        let points = sel.SelectionName.split(seprator);
        let leftPoint = parseInt(points[0]);
        let rightPoint = parseInt(points[1]);
        if (leftPoint > rightPoint) {
          if (leftPoint > maxPoint) {
            maxPoint = leftPoint;
          }
          homes.push(sel);
          homeNumbers[sel.SelectionName] = true;
        } else if (rightPoint > leftPoint) {
          if (rightPoint > maxPoint) {
            maxPoint = rightPoint;
          }
          sel.SelectionNameForSort = rightPoint + seprator + leftPoint; //客場特殊，要把數字反過來排，保留後面排序用
          aways.push(sel);
          awayNumbers[sel.SelectionName] = true;
        } else {
          maxPoint = leftPoint;
          ties.push(sel);
          tieNumbers[sel.SelectionName] = true;
        }
      }
    })

    //BTI不需要補空

    //排序
    //主&和 直接用數值自然小->大排
    const homeAndTieSortFunc = (a,b) => {
      if (a.SelectionName < b.SelectionName) {
        return -1; //小于 0 ，那么 a 会被排列到 b 之前
      } else if (a.SelectionName > b.SelectionName) {
        return 1; //大于 0 ， b 会被排列到 a 之前。
      }
      return 0;
    }

    //客 需要把數字反過來排(用前面準備好的SelectionNameForSort)
    const awaySortFunc = (a,b) => {
      if (a.SelectionNameForSort < b.SelectionNameForSort) {
        return -1; //小于 0 ，那么 a 会被排列到 b 之前
      } else if (a.SelectionNameForSort > b.SelectionNameForSort) {
        return 1; //大于 0 ， b 会被排列到 a 之前。
      }
      return 0;
    }

    homes.sort(homeAndTieSortFunc);
    ties.sort(homeAndTieSortFunc);
    aways.sort(awaySortFunc);

    return {lineData, homes,ties,aways, other}
  }

  //是否為世界杯2022比賽，給關注比賽(addFavouriteEvent)使用
  isWCP2022Event(eventData) {
    return (this.WCP2022Settings.LeagueIds.indexOf(eventData.LeagueId) !== -1);
  }
}

const vendorBTISingleton = new VendorBTI();
if (typeof window !== "undefined") {
  window.VendorBTIInstance = vendorBTISingleton;
}

export default vendorBTISingleton;

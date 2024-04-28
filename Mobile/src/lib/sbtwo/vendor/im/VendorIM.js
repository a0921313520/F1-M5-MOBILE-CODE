import HostConfig from '../vendorHostConfig';
import {vendorSettings, WCP2022SettingsDefault, getTokenFromGatewayImpl} from '../vendorSettingIM';
import md5 from "crypto-js/md5";
import aes from 'crypto-js/aes';
import ecb from 'crypto-js/mode-ecb';
import pkcs7 from 'crypto-js/pad-pkcs7';
import base64 from 'crypto-js/enc-base64';
import moment from 'moment';
import {
  IMAPIStatus,
  IMWagerStatus,
  IMBetType,
  IMEventType,
  IMPeriodType,
  IMRBPeriodNames,
  IMSports,
  IMOddsType, IMDeltaAction, IMWagerSortWay,
} from "./IMConsts";
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
  SortWays, VendorConfigs,
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
import AnnouncementData from "../data/AnnouncementData";
import BetInfoData from "../data/BetInfoData";
import VendorError from "../data/VendorError";
import {Decimal} from "decimal.js";
import SelectionChangeData from "../data/SelectionChangeData";
import VendorBase from "../data/VendorBase";
import natureCompare from 'natural-compare';
import EventInfo from "../data/EventInfo";
import BetStatusData from "../data/BetStatusData";
import {vendorStorage} from '../vendorStorage';
import SearchSportData from "../data/SearchSportData";
import CashOutResultData from "../data/CashOutResultData";
import { v4 as uuidv4 } from 'uuid';
import i18n from '../vendori18n';
import promiseWithTimeout from "../data/promiseWithTimeout";
import { fetchRequest, fetchRequestSBNew } from '$SBTWOLIB/SportRequest';
import { ApiPort } from '$SBTWOLIB/SPORTAPI';
import { getSbToken } from "../../js/util";
import { vendorLangSettings } from "../vendorSetting";
import {fetchRequestSBVendor} from '../vendorFetch';

/**
 * IM 體育接口
 */
class VendorIM extends VendorBase {
  //Singleton
  constructor () {
    if (!VendorIM._instance) {
      super({
        MaxParlay: 10, //串關最多選幾個
        VendorName: 'IM', //供應商名稱
        VendorPage: '/sports-im', //主頁鏈接
        EventIdType: 'int', //EventId數據形態: int/string
        HasLeagueIcon: true, //是否有聯賽Icon
        HasTeamIcon: true, //是否有隊伍Icon
        HasCashOut: true, //是否支持提前兌現
        VL: true, //虛擬列表開關
      });
      this.WCP2022Settings = Object.assign({},WCP2022SettingsDefault); //WCP2022 複製配置，支持從CACHE API即時覆蓋
      console.log('VendorIM new instance');
      VendorIM._instance = this;

      if (vendorSettings.PageMode === true) {
        this._DeltaAPIMapping = {}; //P1全拉模式，不支持delta查詢
      }
    }
    return VendorIM._instance;
  }

  _getUID() {
    const thisKey = 'IM_UID';
    if (typeof window !== "undefined") {
      const thisUID = vendorStorage.getItem(thisKey);
      if (thisUID) {
        return thisUID
      } else {
        const newUID = uuidv4();
        vendorStorage.setItem(thisKey,newUID);
        return newUID;
      }
    }
    return '';
  }

  _getLoginInfo(){
    if (typeof window !== "undefined") {
      if (vendorStorage.getItem("loginStatus") == 1) {
        const token = JSON.parse(vendorStorage.getItem("IM_Token"));
        const memberCode = JSON.parse(vendorStorage.getItem("IM_MemberCode"));
        const memberType = JSON.parse(vendorStorage.getItem("IM_MemberType")); //用戶水位
        if (token && memberCode) return {token, memberCode, memberType};
      }
    }
    return null
  }

  //獲取用戶水位
  _getMemberType() {
    let memberType = 'A';
    if (typeof window !== "undefined") {
      if (vendorStorage.getItem("loginStatus") == 1) {
        const thisMemberType = JSON.parse(vendorStorage.getItem("IM_MemberType")); //用戶水位
        if (thisMemberType) {
          memberType = thisMemberType;
        }
      }
    }
    return memberType;
  }

  //獲取用戶水位
  _queryIMmemberType() {
    const loginInfo = this._getLoginInfo();
    //查詢用戶等級
    //console.log('===getLoginInfo',loginInfo);
    if (loginInfo.token && loginInfo.memberCode && !loginInfo.memberType) {
      let params = {};
      params['TimeStamp'] = this._getTimestamp();
      params['Token'] = loginInfo.token;
      params['MemberCode'] = loginInfo.memberCode;

      const apiName = 'GETMEMBERBYTOKEN'
      const fetchParams = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(params),
      };

      const url =  HostConfig.Config.IMApi + apiName;

      promiseWithTimeout(
        fetchRequestSBVendor(url, fetchParams)
        .then(function(response) {
          return response.json();
        }).then(function(jsonData){
          console.log('===GetMemberByToken',jsonData)
          if (jsonData && jsonData.SpreadGroup) {
            vendorStorage.setItem(
              "IM_MemberType",
              JSON.stringify(jsonData.SpreadGroup)
            );
          }
        }).catch(e => {})
        ,
        60*1000, //1分超時
      ).catch(e => console.log('_queryIMmemberType query timeout error'));
    }
  }

  //從gateway獲取登入token
  getTokenFromGateway() {
    return getTokenFromGatewayImpl(this);
  }

  //等待登入完成
  _checkAndWaitLogin(){
    return new Promise(resolve => {
      if (vendorStorage.getItem("loginStatus") == 1) {
        if (this.loginPromise) {
          this.loginPromise.then(r => resolve(r)); // 如果在登入中，等待登入完成
        } else {
          //沒有loginPromise則檢查緩存數據
          const loginInfo = this._getLoginInfo();
          if (loginInfo) {
            //有數據，返回
            resolve(loginInfo.token);
          } else {
            //沒有緩存數據,可能登入後還沒來得及拿到token就刷新了，嘗試重新獲取
            this.getTokenFromGateway().then(r => resolve(r))
          }
        }
      } else {
        resolve(true); //沒登入(guest view)不需處理
      }
    })
  }

  /**
   * 生成調用接口的timestamp
   */
  _getTimestamp() {
    const key = md5(HostConfig.Config.IMAccessCode);

    //格式 Wed, 19 Jun 2019 07:59:41 GMT
    let currentTimeStamp = moment().utcOffset(0).format("ddd, DD MMM YYYY HH:mm:ss [GMT]");
    const cipher = aes.encrypt(currentTimeStamp, key, {
      mode: ecb,
      padding: pkcs7,
      iv: '',
    });
    // 将加密后的数据转换成 Base64
    const base64Cipher = cipher.ciphertext.toString(base64);
    //console.log(key,currentTimeStamp, base64Cipher);
    return base64Cipher;
  }

  //儲存接口Delta數值
  _APIDeltas = {}

  _getDeltaKey(name, params = {}) {
    let params4md5 = Object.assign({},params);
    //清掉 額外添加 或是 查詢過程中會變化 的參數
    delete params4md5['TimeStamp'];
    delete params4md5['Delta'];
    delete params4md5['Token'];
    const paramsMD5 = md5(JSON.stringify(params4md5)).toString();
    //console.log('params4md5',params4md5,'md5value---',paramsMD5,'---md5value');
    return name + '_' + paramsMD5;
  }

  /**
   * 清理delta緩存，相當於刷新數據
   * 注意這個清理函數是異步 所以需要await，不然還沒清完就往後執行了，會出現奇怪的問題
   *
   * @param apiName 等同_imFetch的參數
   * @param params 等同_imFetch的參數
   * @private
   */
  async ClearDeltaCache(apiName, params) {
    //這裡也是抄的_imFetch的處理code
    if (!params['TimeStamp']) {
      params['TimeStamp'] = this._getTimestamp();
    }
    if (!params['LanguageCode']) {
      params['LanguageCode'] = vendorSettings.LanguageCode;
    }

    if(this._supportLoginAPIs[apiName]) {
      await this._checkAndWaitLogin();

      const loginInfo = this._getLoginInfo();

      if (loginInfo !== null) {
        if (!params['Token']) {
          params['Token'] = loginInfo.token;
        }

        if (!params['MemberCode']) {
          params['MemberCode'] = loginInfo.memberCode;
        }
      }
    }

    //支持delta查詢的API
    const deltaName = this._DeltaAPIMapping[apiName];
    if (deltaName) {
      const thisDeltaKey = this._getDeltaKey(deltaName,params);

      //console.log('===ClearDeltaCache',thisDeltaKey,deltaName,JSON.stringify(params));

      //清理delta數據
      if (this._APIDeltas[thisDeltaKey]) {
        //等待上一個相同參數的請求完成(加上超時處理，避免卡住數據不更新)
        if (
          this._APIDeltas[thisDeltaKey].queryPromise
          //&& retryCount <=0 //排除delta過期重試retryCount>0的，不然會死鎖卡住
        ) {
          await promiseWithTimeout(
            this._APIDeltas[thisDeltaKey].queryPromise,
            60*1000, //1分超時
            '请求超时2'
          ).catch(e => console.log('_imFetch await before cancel',apiName, params ,'get error:', e));
          //.catch(e => {});
        }

        delete this._APIDeltas[thisDeltaKey];
      }
    }
  }

  /**
   * 調用IM接口
   *
   * @param apiName
   * @param params
   * @param method
   * @param retryCount
   * @returns {Promise<unknown>}
   * @private
   */
  async _imFetch(apiName, params, method='POST' , retryCount = 0) {

    let apiLog = null;
    let isPlaceBet = false;
    //記錄投注日誌
    if (apiName === 'PLACEBET') {
      isPlaceBet = true;
      apiLog = { request: JSON.parse(JSON.stringify(params))};
    }

    //紀錄原始的參數，遇到delta過期時 使用
    const originAPIName = apiName;
    const originParams = JSON.parse(JSON.stringify(params));

    if (!params['TimeStamp']) {
      params['TimeStamp'] = this._getTimestamp();
    }
    if (!params['LanguageCode']) {
      params['LanguageCode'] = vendorSettings.LanguageCode;
    }

    if(this._supportLoginAPIs[apiName]
    ) {
      await this._checkAndWaitLogin();

      const loginInfo = this._getLoginInfo();

      if (loginInfo !== null) {
        if (!params['Token']) {
          params['Token'] = loginInfo.token;
        }

        if (!params['MemberCode']) {
          params['MemberCode'] = loginInfo.memberCode;
        }

        if (loginInfo.token && loginInfo.memberCode && !loginInfo.memberType) {
          this._queryIMmemberType(); //獲取用戶水位
        }
      }
    }

    //支持delta查詢的API
    const deltaName = this._DeltaAPIMapping[apiName];
    const thisDeltaKey = this._getDeltaKey(deltaName,params);
    if (deltaName) {
      //檢查是否已有數據
      if (!this._APIDeltas[thisDeltaKey]) {
        this._APIDeltas[thisDeltaKey] = { delta: null, params: null, full: null};
      } else {
        //等待上一個相同參數的請求完成(加上超時處理，避免卡住數據不更新)
        if (
          this._APIDeltas[thisDeltaKey].queryPromise
          && retryCount <=0 //排除delta過期重試retryCount>0的，不然會死鎖卡住
        ) {
          await promiseWithTimeout(
            this._APIDeltas[thisDeltaKey].queryPromise,
            60*1000, //1分超時
            '请求超时1'
          ).catch(e => console.log('_imFetch await',apiName,'get error:', e, JSON.stringify(params)));
          //.catch(e => {});
        }

        //結束後有可能被清空
        if (!this._APIDeltas[thisDeltaKey] || !this._APIDeltas[thisDeltaKey].delta ) {
          this._APIDeltas[thisDeltaKey] = { delta: null, params: null, full: null};
        } else {
          //使用保存的delta數值
          params['Delta'] = this._APIDeltas[thisDeltaKey].delta;
          //改成調用delta接口
          apiName = deltaName;
        }
      }
    }
    const isAPIServerCall = this.isAPIServer();
    // if (apiName === 'GETEVENTINFOMBT') {
    //   if (isAPIServerCall) {
    //     console.log('====GETEVENTINFOMBT DELTA', thisDeltaKey, deltaName, JSON.stringify(params));
    //   }
    // }


    let that = this;
    let thisQueryPromise = new Promise(function(resolve, reject) {
      if (apiName === 'GETEVENTINFOMBT') {
        const thisUuid = that._getUID();
        if (thisUuid && thisUuid.length > 1) {
          params.uuid = thisUuid;
        }
      }

      const fetchParams = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(params),
      };

      let GETEVENTINFOMBT_START = new Date().getTime();

      const url =  HostConfig.Config.IMApi + apiName;

      let cachedKey = '';

      //GETEVENTINFOMBT緩存1分鐘
      if (apiName === 'GETEVENTINFOMBT') {
        if (isAPIServerCall) {
          console.log('====GETEVENTINFOMBT STRART', JSON.stringify(params));
        }

        let clonedParams = JSON.parse(JSON.stringify(params));
        delete clonedParams['TimeStamp'];
        delete clonedParams['uuid'];

        cachedKey = 'CACHE_GETEVENTINFOMBT_' + md5(JSON.stringify(clonedParams)).toString();

        ///console.log('===== GETEVENTINFOMBT',JSON.parse(JSON.stringify(clonedParams)),cachedKey);
        const cachedJsonData = vendorStorage.getItem(cachedKey);
        if (cachedJsonData) {
          const cachedInfo = JSON.parse(cachedJsonData);
          //檢查是否過期
          const nowTime = new Date().getTime();
          if (nowTime > cachedInfo.expTime) {
            //console.log('===== GETEVENTINFOMBT remove expired cache',cachedKey,moment(cachedInfo.expTime).toISOString(),' <= ',moment(nowTime).toISOString());
            vendorStorage.removeItem(cachedKey) //過期刪除
          } else {
            //console.log('===== GETEVENTINFOMBT using cache',cachedKey,moment(cachedInfo.expTime).toISOString(),' > ',moment().toISOString(), JSON.stringify(params));
            resolve(cachedInfo.data); //未過期直接用
            return;
          }
        } else {
          //console.log('===== GETEVENTINFOMBT do not have cache',cachedKey,moment().toISOString());
        }
      }

      // 需要紀錄log的api，下注、cash out、get token
      const needLogApis = ['PLACEBET', 'SUBMITBUYBACK', 'GETDELTABETTRADE', 'GETMEMBERBYTOKEN'];
      const functionName = needLogApis.includes(apiName) ? fetchRequestSBVendor : fetch;
      console.log('needLogApis 需要紀錄log的api ',apiName, needLogApis.includes(apiName))
      promiseWithTimeout(
        functionName(url, fetchParams)
          .then(function(response) {
            if(apiLog !== null) {
              apiLog.responseStatus = response.status;
            }
            return response.json();
          }).then(function(jsonData){
          //console.log('_imFetch',apiName, method ,fetchParams,'getData', jsonData);
          if(apiLog !== null) {
            apiLog.response = jsonData;
          }

          if (jsonData && jsonData.StatusCode && jsonData.StatusCode === IMAPIStatus.OK) {
            if (isAPIServerCall && apiName === 'GETEVENTINFOMBT' && jsonData.Sports && jsonData.Sports.length > 0 && jsonData.Sports[0] && jsonData.Sports[0].Events) {
              console.log('====GETEVENTINFOMBT RESULT:', 'cost', (new Date().getTime() - GETEVENTINFOMBT_START)/1000 , ' seconds,' , jsonData.Sports[0].Events.length, JSON.stringify(params));
            }

            //保存Delta數值
            if (jsonData.Delta && deltaName) {

              //判斷是不是 delta查詢
              jsonData.isDeltaQuery = false;
              if (params['Delta']) {
                jsonData.isDeltaQuery = true;  //額外加一個參數，後面數據處理會用到
              }

              jsonData.deltaKey = thisDeltaKey; //後面數據處理會用到

              //初始化配置
              that._APIDeltas[thisDeltaKey].delta = jsonData.Delta; //保存delta數值
              that._APIDeltas[thisDeltaKey].params = params; //保存查詢參數
            }

            if (apiName === 'GETEVENTINFOMBT'
              && (params.Market !== VendorMarkets.EARLY) //早盤不存本地緩存 數據太大
            ) {
              const cacheObject = {
                data: jsonData,
                expTime: ((new Date()).getTime() + 60 * 1000), //GETEVENTINFOMBT緩存1分鐘
                params,
              };
              //存之前清理所有已過期的(瀏覽器有容量限制)
              let removeKeys = [];
              for(let ii = 0; ii<vendorStorage.length(); ii++) {
                const thisKey = vendorStorage.key(ii);
                if (thisKey.indexOf('CACHE_GETEVENTINFOMBT_') !== -1) {
                  const cachedJsonData = vendorStorage.getItem(thisKey);
                  const cachedInfo = JSON.parse(cachedJsonData);
                  //檢查是否過期
                  const nowTime = new Date().getTime();
                  if (nowTime > cachedInfo.expTime) {
                    removeKeys.push(removeKeys);
                  }
                }
              }
              removeKeys.map(thisKey => {
                vendorStorage.removeItem(thisKey) //過期刪除
              })
              vendorStorage.setItem(cachedKey,JSON.stringify(cacheObject));
              //console.log('===== GETEVENTINFOMBT save cache',cachedKey,moment(cacheObject.expTime).toISOString(), ' > ' ,moment().toISOString());
            }

            resolve(jsonData);
          } else if (jsonData && jsonData.StatusCode && jsonData.StatusCode === IMAPIStatus.DeltaExpire) {
            //處理delta過期 - 重新調用主查詢
            delete that._APIDeltas[thisDeltaKey]; //刪除delta數據

            //最多重試3次 避免無窮循環
            if (retryCount >= 3) {
              //重試超過3次，按一般錯誤方式返回
              let thiserror = new VendorError();
              if (jsonData && jsonData.StatusCode) {
                thiserror = VendorError.fromIMError(jsonData.StatusCode,jsonData.StatusDesc)
              }
              console.log('_imFetch',apiName, method ,fetchParams,'get error:', thiserror);
              reject(thiserror);
            } else {
              //重試次數+1
              let thisRetryCount = retryCount + 1;
              console.log('_imFetch',apiName, method ,fetchParams,'delta expire retry', thisRetryCount);
              that._imFetch(originAPIName, originParams, method, thisRetryCount)
                .then(jsonData => { resolve(jsonData) })
                .catch(error => reject(error));
            }

          } else {
            let thiserror = new VendorError();
            if (jsonData && jsonData.StatusCode) {
              //特別處理投注錯誤信息
              if (jsonData.StatusCode === 350) { //投注檢查失敗，每個投注選項，分別列出無效原因
                resolve(jsonData); //直接視為成功，在投注檢查函數(getbetInfo)裡面處理
                return true;
              } else if (jsonData.StatusCode === 370) { //查滾球注單狀態失敗
                resolve(jsonData); //直接視為成功，在_getWagerStatusPolling輪詢裡面處理
                return true;
              } else if (jsonData.StatusCode === 1000) { //投注失敗
                if (jsonData.WagerSelectionInfos && jsonData.WagerSelectionInfos.length>0) {
                  const errorInfo = jsonData.WagerSelectionInfos[0];
                  //直接從BetStatusMessage拿出錯誤碼
                  thiserror = VendorError.fromIMError(parseInt(errorInfo.BetStatusMessage), jsonData.StatusDesc);
                }
              } else {
                thiserror = VendorError.fromIMError(jsonData.StatusCode, jsonData.StatusDesc)
              }
            }
            console.log('_imFetch',apiName, method ,fetchParams,'get error:', thiserror);
            if (apiLog!== null) {
              thiserror.apiLog = apiLog;
            }
            reject(thiserror);
          }
        })
        ,
        ( (isAPIServerCall || isPlaceBet) ? 5*60*1000 : 2*60*1000), //2分超時,在api server或投注，提高到5分
        '_imFetch请求超时'
      ).catch((error) => {
        console.log('_imFetch',apiName, method ,fetchParams,'has error', error);
        let errorWrapper = { error: error };
        if (apiLog!== null) {
          //避免後面日誌拿到空的error
          if (error && (JSON.stringify(error) === '{}')) {
            let newError = {};
            if (error.message) {
              newError.message = error.message;
            }
            if (error.stack) {
              newError.stack = error.stack;
              //限制長度，不然無法送出
              if (newError.stack && newError.stack.length > 200) {
                newError.stack = newError.stack.substring(0,200);
              }
            }
            if (JSON.stringify(newError) !== '{}') {
              errorWrapper.error = newError;
            }
          }
          errorWrapper.apiLog = apiLog;
        }
        reject(errorWrapper);
      })
    });

    if (deltaName) {
      if (!this._APIDeltas[thisDeltaKey]) {
        this._APIDeltas[thisDeltaKey] = {delta: null, params: null, full: null};
      }
      this._APIDeltas[thisDeltaKey].queryPromise = thisQueryPromise;
    }

    return thisQueryPromise;
  }

  //接口函數定義
  _APIs = {
    //2.1 索取所有体育计数
    getAllSportCount : (IsCombo=false) => this._imFetch('GETALLSPORTCOUNT', {IsCombo}),

    //2.2 索取所有竞赛计数  注意IsCombo 必須為 true 或 false
    getAllCompetitionCount: (SportId = IMSports.SOCCER, Market = VendorMarkets.EARLY, IsCombo = false,IncludeCloseEvent = false) =>
      this._imFetch('GETALLCOMPETITIONCOUNT', {SportId, Market, IsCombo, IncludeCloseEvent}),

    //2.3 索取赛事和主要玩法资料
    getEventInfoMBT:
      (SportId = IMSports.SOCCER, Market = VendorMarkets.EARLY, BetTypeIds = [IMBetType.HANDICAP,IMBetType.OVERUNDER, IMBetType.CORRECTSCORE], MarketlineLevels = [1], EventGroupTypeIds = [1], PeriodIds = [IMPeriodType.FH] ) => {
        if (Market === VendorMarkets.EARLY) { //早盤不主動查波膽，數據量太大
          BetTypeIds = [IMBetType.HANDICAP,IMBetType.OVERUNDER];
        }
        return this._imFetch('GETEVENTINFOMBT', {SportId, Market, BetTypeIds, MarketlineLevels, EventGroupTypeIds, PeriodIds});
      },
    //2.31 索取赛事和主要玩法资料
    getEventInfoMBT_VL: (
      SportId = IMSports.SOCCER,
      Market = VendorMarkets.EARLY,
      extraConfigs,
      BetTypeIds = [IMBetType.HANDICAP, IMBetType.OVERUNDER, IMBetType.CORRECTSCORE]
    ) => {
      extraConfigs.SportId = SportId;

      // if (Market === VendorMarkets.OUTRIGHT) {
      //   extraConfigs.startDate = moment().format('YYYYMMDD');
      //   extraConfigs.endDate = moment().add(15, 'months').format('YYYYMMDD');
      // }

      const { countsPerPage, page, startDate, endDate, sortWay = 1, pagePull } = extraConfigs;
      let queryString = "";
      if (Market === VendorMarkets.RUNNING) {
        queryString = `MarketId=${Market}&CountsPerPage=${countsPerPage}&SortWay=${sortWay}&SportId=${SportId}&Timezone=${encodeURIComponent("+08:00")}`;
      } else if (Market === VendorMarkets.OUTRIGHT){
        queryString = `MarketId=${Market}&CountsPerPage=${countsPerPage}&SortWay=${sortWay}&SportId=${SportId}&Timezone=${encodeURIComponent("+08:00")}`;
      } else {
        queryString = `StartDate=${startDate.replace(/-/g, "")}&EndDate=${endDate.replace(/-/g, "")}&MarketId=${Market}&CountsPerPage=${countsPerPage}&SortWay=${sortWay}&SportId=${SportId}&Timezone=${encodeURIComponent("+08:00")}`;
      }
      let queryParams = this.parseQueryParameters(`apiName?${queryString}`);
      const thisDiffKey = this._getDataCacheKey("events", { ...queryParams });

      // cachePage目前頁數, page欲更新頁數
      const cachePage = this._NewDataCache[thisDiffKey]?.PageNumber;
      // 是否为更新下一页
      let isPagePull = cachePage !== undefined && cachePage < page && cachePage !== page;
      return this._newImFetch(`events?${queryString}`, null, "GET", 0, page, isPagePull);
    },




    //2.4 索取 DELTA 赛事和主要玩法详情
    getDeltaEventInfoMBT:
      (SportId = IMSports.SOCCER, Market = VendorMarkets.EARLY, BetTypeIds = [IMBetType.HANDICAP,IMBetType.OVERUNDER, IMBetType.CORRECTSCORE], MarketlineLevels = [1], EventGroupTypeIds = [1], PeriodIds = [IMPeriodType.FH], Delta =  'Y') => {
        if (Market === VendorMarkets.EARLY) { //早盤不主動查波膽，數據量太大
          BetTypeIds = [IMBetType.HANDICAP,IMBetType.OVERUNDER];
        }
        return this._imFetch('GETDELTAEVENTINFOMBT', {SportId, Market, BetTypeIds, MarketlineLevels, EventGroupTypeIds, PeriodIds, Delta})
      },

    //2.5 索取其他玩法资料
    getMLInfoOBT: (SportId= IMSports.SOCCER, Market= VendorMarkets.EARLY) =>
      this._imFetch('GETMLINFOOBT', {SportId, Market}),

    //2.6 索取 DELTA 其他玩法详情
    getDeltaMLInfoOBT: (SportId= IMSports.SOCCER, Market= VendorMarkets.EARLY, Delta= 'Y') =>
      this._imFetch('GETDELTAMLINFOOBT', {SportId, Market, Delta} ),

    //2.7 以页数索取赛事资料
    getEventInfoBYPAGE:
      (SportId = IMSports.SOCCER, Market = VendorMarkets.EARLY, Page = 1, PageRecords = 100,
       OrderBy = 1, BetTypeIds = [IMBetType.HANDICAP,IMBetType.OVERUNDER, IMBetType.CORRECTSCORE], MarketlineLevels = [1], EventGroupTypeIds = [1], PeriodIds = [IMPeriodType.FH],
       IsCombo = false,) => {
        if (Market === VendorMarkets.EARLY) { //早盤不主動查波膽，數據量太大
          BetTypeIds = [IMBetType.HANDICAP,IMBetType.OVERUNDER];
        }
        return this._imFetch('GETEVENTINFOBYPAGE', {SportId, Market, Page, PageRecords, OrderBy, BetTypeIds, MarketlineLevels, EventGroupTypeIds, PeriodIds, IsCombo });
      },

    //2.8 索取特定比賽資料  注意IsCombo 必須為 true 或 false 注意OddsType必帶，這個不像 GETEVENTINFOMBT 會返回全部OddsType，只會返回指定的盤口
    getSelectedEventInfo: (SportId= IMSports.SOCCER, EventIds= [123,456], OddsType= IMOddsType.HK, IsCombo= false, IncludeGroupEvents= true, BetTypeIds = null, PeriodIds = null, MarketlineLevels = null) => {
      let params = {SportId, EventIds, OddsType , IsCombo, IncludeGroupEvents};
      if (BetTypeIds !== null) {
        params.BetTypeIds = BetTypeIds;
      }
      if (PeriodIds !== null) {
        params.PeriodIds = PeriodIds;
      }
      if (MarketlineLevels !== null) {
        params.MarketlineLevels = MarketlineLevels;
      }

      // 一次5個，超過分頁查，目前收藏、進球通知、早盤會用到
      const pageSize = 5;
      if (EventIds.length > pageSize) {
        const queryPromises = [];

        // 計算要分成多少頁
        const maxPageNo = Math.ceil(EventIds.length / pageSize);

        for (let currentPageNo = 1; currentPageNo <= maxPageNo; currentPageNo++) {
          const startIndex = (currentPageNo - 1) * pageSize;
          const endIndex = Math.min(startIndex + pageSize, EventIds.length);

          // 取出這一頁的EventIds
          const currentIds = EventIds.slice(startIndex, endIndex);

          const currentParams = { ...params, EventIds: currentIds };
          const queryPromise = this._imFetch('GETSELECTEDEVENTINFO', currentParams);

          queryPromises.push(queryPromise);
        }

        // 等待所有分頁的請求都完成，並且處理返回的資料
        return Promise.all(queryPromises)
          .then(results => {

            const firstResult = results[0];
            // 檢查資料是否存在，且不為空
            const sportsExist = firstResult.Sports && Array.isArray(firstResult.Sports) && firstResult.Sports.length > 0;

            if(sportsExist){
              const events = results
                .map(result => result.Sports?.[0]?.Events)
                .filter(Boolean) // 去除空值
                .reduce((acc, curr) => {
                  return acc.concat(curr);
                }, []); // 合併多個數組為一個數組

              // 合併後放在第一個的Events
              firstResult.Sports[0].Events = events;
            }

            return firstResult;
          })
          .catch(error => {
            console.error('getSelectedEventInfo error ', error)
            throw error
          });
      }

      return this._imFetch('GETSELECTEDEVENTINFO', params);
    },


    //2.9 索取虚拟赛事列表
    getVSEventInfo: (SportId= IMSports.VIRTUALSOCCER, Season= 123, MatchDay= 123) =>
      this._imFetch('GETVSEVENTINFO', {SportId, Season, MatchDay}),

    //2.10 索取 DELTA 虚拟赛事列表
    getDeltaVSEventInfo: (SportId= IMSports.VIRTUALSOCCER, Season= 123, MatchDay= 123, Delta= 'Y') =>
      this._imFetch('GETDELTAVSEVENTINFO', {SportId, Season, MatchDay, Delta}, ),

    //2.11 索取虚拟赛事资料
    getVSEventDetails: (SportId= IMSports.VIRTUALSOCCER, EventId= 123) =>
      this._imFetch('GETVSEVENTDETAILS', {SportId, EventId}),

    //2.12 索取优胜冠军赛事
    getOutRightEvents: (SportId= IMSports.SOCCER, LeagueIds = null) => {
      let params = {SportId};
      if (LeagueIds !== null) {
        params.CompetitionIds = LeagueIds;
      }
      return this._imFetch('GETOUTRIGHTEVENTS', params);
    },


    //2.13 索取 DELTA 优胜冠军赛事
    getDeltaOutRightEventInfo: (SportId= IMSports.SOCCER, LeagueIds = null, Delta= 'Y') => {
      let params = {SportId, Delta};
      if (LeagueIds !== null) {
        params.CompetitionIds = LeagueIds;
      }
      return this._imFetch('GETDELTAOUTRIGHTEVENTINFO', params);
    },

    //2.14 索取现场赛果
    getLiveResults: (SportId= IMSports.SOCCER, ViewingCompetitionIds = []) =>
      this._imFetch('GETLIVERESULTS', {SportId, ViewingCompetitionIds} ),

    //2.15 SEARCH 搜索
    search : (filter, SportId= null, IsCombo=false, EventGroupTypeIds = [1]) =>
      this._imFetch('SEARCH', SportId ? {filter,SportId,IsCombo,EventGroupTypeIds} : {filter,IsCombo,EventGroupTypeIds}),

    //2.16 索取本地化翻譯
    getLocalizations: (LocalizationType= IMLocalizationType.ALL) =>
      this._imFetch('GETLOCALIZATIONS', {LocalizationType}),

    //2.17 索取 DELTA 本地化翻譯
    getDeltaLocalizations : (LocalizationType= IMLocalizationType.ALL, Delta= 'Y') =>
      this._imFetch('GETDELTALOCALIZATIONS ', {LocalizationType, Delta}, ),

    //2.18 索取完整赛果
    getCompletedResults: (SportId= IMSports.SOCCER, EventTypeId= IMEventType.FIXTURE, StartDate= '2020-09-15', EndDate= '2020-09-16') =>
      this._imFetch('GETCOMPLETEDRESULTS', {SportId, EventTypeId, StartDate, EndDate} ),

    //2.19 LOGOUT
    logOut: () =>
      this._imFetch('LOGOUT', {} ),

    //2.20 索取投注信息
    getBetInfo: (WagerType= WagerType.SINGLE, Selections= []) =>
      this._imFetch('GETBETINFO', {WagerType, WagerSelectionInfos: Selections} ),

    //2.21 投注
    placeBet: (WagerType= WagerType.SINGLE, Selections= [], ComboSelections = [], IsComboAcceptAnyOdds= false) =>
      this._imFetch('PLACEBET', {WagerType, WagerSelectionInfos: Selections, ComboSelections, IsComboAcceptAnyOdds, CustomerIP:'127.0.0.1', ServerIP:'192.168.88.88'} ),

    //2.22 索取投注明细
    getBetList: (BetConfirmationStatus= [IMWagerStatus.PENDING,IMWagerStatus.CONFIRMED,IMWagerStatus.REJECTED, IMWagerStatus.CANCELLED]) =>
      this._imFetch('GETBETLIST', {BetConfirmationStatus} ),

    //2.23 索取投注账目
    getStatement: (StartDate= '2020-09-15', EndDate= '2020-09-16', StartTime = '00:00:00', EndTime= '23:59:59', DateType = IMWagerSortWay.BETDATE) =>
      this._imFetch('GETSTATEMENT', {StartDate, EndDate, StartTime, EndTime, DateType} ),

    //2.24 索取余额
    getBalance: () =>
      this._imFetch('GETBALANCE', {} ),

    //2.25 索取待处理赌注状态
    getPendingWagerStatus: (WagerIds= []) =>
      this._imFetch('GETPENDINGWAGERSTATUS', {WagerIds} ),

    //2.26 索取通告
    getAnnouncement: () =>
      this._imFetch('GETANNOUNCEMENT', {OrderBy : 2} ),  //1升序 2降序

    //2.27 索取会员信息
    getMemberByToken: () =>
      this._imFetch('GETMEMBERBYTOKEN', {} ),

    //2.28 索取用户自定义
    getUserPreferences: () =>
      this._imFetch('GETUSERPREFERENCES', {} ),

    //TODO 用戶自定義應該用不到，後面看是否需要
    //2.29UPDATEUSERPREFERENCES 更新用户自定义
    //2.30GETFAVOURITEEVENT 索取所有收藏赛事资料
    //2.31ADDFAVOURITEEVENT 加收藏赛事
    //2.32REMOVEFAVOURITEEVENT 删除收藏赛事

    //2.33 提前兑现 DELTA
    getDeltaBetTrade: (WagerIds= []) =>
      this._imFetch('GETDELTABETTRADE', {WagerIds} ),

    //2.34 SUBMITBUYBACK 提交回购 (提前兌現)
    submitBuyBack: (WagerId, BuyBackPricing, PricingId) =>
      this._imFetch('SUBMITBUYBACK', {WagerId, BuyBackPricing, PricingId}),

    //2.35 索取赛事直播资料
    getLiveStreamingInfo: (SportId= IMSports.SOCCER, EventId= 123) =>
      this._imFetch('GETLIVESTREAMINGINFO', {SportId, EventId}),

    //TODO 用途不明，待確認
    //2.36 GETCOMPANYBYID 以 COMPANYID 索取公司设定
  };

  //哪些接口使用delta，主查詢和delta查詢  都配置指向delta查詢
  _DeltaAPIMapping = {
    //2.3 索取赛事和主要玩法资料
    GETEVENTINFOMBT:'GETDELTAEVENTINFOMBT',
    //2.4 索取 DELTA 赛事和主要玩法详情
    GETDELTAEVENTINFOMBT: 'GETDELTAEVENTINFOMBT',
    //2.5 索取其他玩法资料
    GETMLINFOOBT:'GETDELTAMLINFOOBT',
    //2.6 索取 DELTA 其他玩法详情,
    GETDELTAMLINFOOBT:'GETDELTAMLINFOOBT',
    //2.9 索取虚拟赛事列表
    GETVSEVENTINFO:'GETDELTAVSEVENTINFO',
    //2.10 索取 DELTA 虚拟赛事列表
    GETDELTAVSEVENTINFO:'GETDELTAVSEVENTINFO',
    //2.12 索取优胜冠军赛事
    GETOUTRIGHTEVENTS:'GETDELTAOUTRIGHTEVENTINFO',
    //2.13 索取 DELTA 优胜冠军赛事
    GETDELTAOUTRIGHTEVENTINFO:'GETDELTAOUTRIGHTEVENTINFO',
    //2.16 索取本地化翻譯
    GETLOCALIZATIONS:'GETDELTALOCALIZATIONS',
    //2.17 索取 DELTA 本地化翻譯
    GETDELTALOCALIZATIONS:'GETDELTALOCALIZATIONS',
  }

  //哪些接口支持登入後查詢(自動帶MemberCode和Token)
  _supportLoginAPIs = {
    GETEVENTINFOMBT:true,
    GETDELTAEVENTINFOMBT:true,
    GETEVENTINFOBYPAGE:true,
    GETSELECTEDEVENTINFO:true,
    GETVSEVENTINFO:true,
    GETDELTAVSEVENTINFO:true,
    GETOUTRIGHTEVENTS:true,
    GETDELTAOUTRIGHTEVENTINFO:true,
    LOGOUT:true,
    GETBETINFO:true,
    PLACEBET:true,
    GETBETLIST:true,
    GETSTATEMENT:true,
    GETBALANCE:true,
    GETPENDINGWAGERSTATUS:true,
    GETMEMBERBYTOKEN:true,
    GETUSERPREFERENCES:true,
    UPDATEUSERPREFERENCES:true,
    GETFAVOURITEEVENT:true,
    ADDFAVOURITEEVENT:true,
    REMOVEFAVOURITEEVENT:true,
    GETDELTABETTRADE:true,
    SUBMITBUYBACK:true,
  }

  //獲取體育項目，返回為 PollingResult 格式
  async getSports() {
    //獲取收藏賽事
    if(this.configs.VL){
      return this.getSportsNew();
    }
    const favEvents = await this.getFavouriteEvents();

    return this._APIs.getAllSportCount()
      .then(async jsonData => {
        const data = jsonData.SportCount;
        let SportDatas = data.map(item => {

          const favEventsForThisSport = favEvents.filter(favItem => item.SportId === favItem.SportId);

          const targetEventGroup = item.EventGroupTypes[0]; //只獲取主要的count

          return new SportData(
            item.SportId,
            item.SportName,
            targetEventGroup.Count,
            [  //順序 滾球 今天 早盤 關注 優勝冠軍
              new MarketData(VendorMarkets.RUNNING, VendorMarketNames[VendorMarkets.RUNNING], targetEventGroup.RBFECount ),
              //今日包含滾球
              new MarketData(VendorMarkets.TODAY, VendorMarketNames[VendorMarkets.TODAY], (targetEventGroup.TodayFECount ?? 0) + (targetEventGroup.RBFECount ?? 0) ),
              new MarketData(VendorMarkets.EARLY, VendorMarketNames[VendorMarkets.EARLY], targetEventGroup.EarlyFECount ),
              new MarketData(VendorMarkets.FAVOURITE, VendorMarketNames[VendorMarkets.FAVOURITE], favEventsForThisSport.length ),
              new MarketData(VendorMarkets.OUTRIGHT, VendorMarketNames[VendorMarkets.OUTRIGHT], targetEventGroup.ORCount ),
            ]
          )
        });

        //世界杯2022Tab數據
        await this.addWCP2022SportData(favEvents, SportDatas);

        return new PollingResult(SportDatas);
      })
  }

  //獲取聯賽(好像沒有用)
  getLeagues(SportId = IMSports.SOCCER, MarketId = VendorMarkets.EARLY) {
    //注意聯賽在IM 叫 Competition 統一修正為 League
    return this._APIs.getAllCompetitionCount(SportId, MarketId)
      .then(jsonData => {
        const data = jsonData.CompetitionCount;
        return data.map(item => {
          return new LeagueData(
            item.CompetitionId,
            item.CompetitionName,
            item.Count,
            item.SportId,
            item.Market,
          )
        });
      })
  }

  //數據緩存(用 查詢參數 當key) 給分頁查詢專用
  _DataCache = {}
  _NewDataCache = {}
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

  //用於get events
  async _newImFetch(apiName, params, method = 'POST', retryCount = 0, pageNumber, isPagePull = false) {
    // console.table({ apiName, params, method, retryCount, pageNumber });
    let hasCacheData = false;
    // 參數是query，轉換為物件
    const queryParams = this.parseQueryParameters(apiName)
    // 取sb api token
    await getSbToken();

    const VendorName = this.configs.VendorName;

    let allQueries = [];
    let that = this;
    let cachedKey = '';

    const path = apiName.split("?")[0];
    //支持diffkey(delta)查詢的API
    const thisDiffKey = this._getDataCacheKey(path,queryParams);
    //檢查是否已有數據
    if (!this._NewDataCache[thisDiffKey]) {
      this._NewDataCache[thisDiffKey] = { delta: null, params: null, full: null};
    } else {
      //等待上一個相同參數的請求完成(加上超時處理，避免卡住數據不更新)

      // cache資料頁數比較多
      // if(this._NewDataCache[thisDiffKey].queryPromise?.PageNumber > pageNumber){
      //   pageNumber = this._NewDataCache[thisDiffKey].queryPromise.PageNumber;
      // }

      if (
        this._NewDataCache[thisDiffKey].queryPromise
        && retryCount <=0 //排除delta過期重試retryCount>0的，不然會死鎖卡住
      ) {
        await promiseWithTimeout(
          this._NewDataCache[thisDiffKey].queryPromise,
          60*1000, //1分超時
          '请求超时1'
        ).catch(e => console.log('_imFetch await',apiName,'get error:', e, JSON.stringify(params)));
        //.catch(e => {});
      }
      if (!this._NewDataCache[thisDiffKey]) {
        this._NewDataCache[thisDiffKey] = { delta: null, params: null, full: null};
      } else {
        hasCacheData = true
      }
    }
    const fetchData = async (apiName, params, method, VendorName, pageNumber) => {
      // 根據 pageNumber 取得 thisDiffKey
      const currentDiffKey = this._getDataCacheKey(path, { ...queryParams });
      let apiUrl = apiName;
      const separator = apiName.includes("?") ? "&" : "?";

      apiUrl = apiUrl + separator + `Lang=${vendorLangSettings.Lang}&Vendor=` + VendorName;

      apiUrl += "&PageNumber=" + pageNumber;

      return new Promise(function (resolve, reject) {
        promiseWithTimeout(fetchRequestSBNew(apiUrl, method, params)
          .then(function (jsonData) {
            jsonData.hasCacheData = false;
            if (hasCacheData) {
              jsonData.hasCacheData = true;  //額外加一個參數，後面數據處理會用到
            }
            //初始化配置
            that._NewDataCache[currentDiffKey].params = queryParams; //保存查詢參數
            resolve(jsonData);
          })
        ).catch((error) => {
          console.log('error ', error);
          let errorWrapper = { error: error };
          reject(errorWrapper);
        });
      });
    };

    const handleResults = async (results, hasCacheData = false) => {
      const index = results.length - 1;
      this._NewDataCache[thisDiffKey].PageNumber = results[index].PageNumber;

      return {
        allData: results,
        isPagePull: isPagePull,
        hasCacheData: hasCacheData,
        MaxPageCount: results[index].MaxPageCount,
        PageNumber: results[index].PageNumber,
        TotalCount: results[index].TotalCount,
      };
    };
    // 有Cache資料
    if (!isPagePull && hasCacheData) {
      const maxPageNumber = Math.max(this._NewDataCache[thisDiffKey].PageNumber, pageNumber);
      if (maxPageNumber > 1) {
        // 有多頁資料
        for (let i = 1; i <= maxPageNumber; i++) {
          allQueries.push(fetchData(apiName, params, method, VendorName, i));
        }

        const results = await Promise.all(allQueries);
        return handleResults(results);
      }

      if (pageNumber === 1) {
        let thisQueryPromise = await fetchData(apiName, params, method, VendorName, pageNumber);
        if (!this._NewDataCache[thisDiffKey]) {
          this._NewDataCache[thisDiffKey] = {delta: null, params: null, full: null};
        }
        this._NewDataCache[thisDiffKey].queryPromise = thisQueryPromise;
        return handleResults([thisQueryPromise]);
      }

    } else {
      // 下拉更新下一頁
      return fetchData(apiName, params, method, VendorName, pageNumber)
        .then(results => {
          return handleResults([results], false); // 下拉更新一定不是Delta
        });
    }
  }

  //獲取比賽列表 新api
  async getEventsVL(SportId = IMSports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null
    , extraConfigs = {}) {
    const OddsType = this.getMemberSetting().oddsType;
    const MemberType = this._getMemberType(); //水位
    //獲取收藏賽事
    const favEvents = await this.getFavouriteEvents();

    const favEventsForThisSport = favEvents.filter(item => item.SportId === SportId);
    const favEventIdsForThisSport = favEventsForThisSport.map(item => item.EventId);

    let allEventsCount = null; //用於在有ViewScope情況下判斷是否已經加載完成

    let queryPromise = null;

    //關注(收藏)
    if(MarketId === VendorMarkets.FAVOURITE) {
      //沒數據直接返回空
      if (favEventsForThisSport.length <=0) {
        return new Promise(resolve => resolve(new PollingResult([], [], true))); //額外設定已加載完畢
      }
      //轉成EventInfo格式
      const favEventInfos = favEventsForThisSport.map(fe => {
        return new EventInfo(fe.EventId,fe.SportId,(fe.IsOutRightEvent === true ? true : false));
      })
      queryPromise = this.getEventsDetail(favEventInfos, false,{
        MainMarketOnly: true,
        uniqueName: 'getEvents_FAVOURITE'
      }).then(async pr => {
        pr.NewData.map(item => {
          if (item.IsOutRightEvent) {
            //猜冠軍，自動切selection只保留前４個
            if (item.Lines && item.Lines.length > 0) {
              item.Lines.map(l => {
                if (l.Selections && l.Selections.length > 4) {
                  l.Selections = l.Selections.filter((s,index) => index < 4);
                }
              })
            }
          }
        })

        //移除 沒有數據的 關注比賽
        let existEventIds = [];
        const AllEventDatas =  pr.NewData;
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
        return pr;
      });

    } else {
      extraConfigs.startDate = startDate;
      extraConfigs.endDate = endDate;
      extraConfigs.sortWay = sortWay;
      queryPromise = this._APIs.getEventInfoMBT_VL(SportId, MarketId, extraConfigs)
        .then(async jsonData => {

          const { countsPerPage, endDate, startDate, sortWay, page, SportId } = extraConfigs
          let queryString = "";
          if (MarketId === VendorMarkets.RUNNING) {
            queryString = `MarketId=${MarketId}&CountsPerPage=${countsPerPage}&SortWay=${sortWay}&SportId=${SportId}&Timezone=${encodeURIComponent("+08:00")}`;
          } else if (MarketId === VendorMarkets.OUTRIGHT){
            queryString = `MarketId=${MarketId}&CountsPerPage=${countsPerPage}&SortWay=${sortWay}&SportId=${SportId}&Timezone=${encodeURIComponent("+08:00")}`;
          } else {
            queryString = `StartDate=${startDate.replace(/-/g, "")}&EndDate=${endDate.replace(/-/g, "")}&MarketId=${MarketId}&CountsPerPage=${countsPerPage}&SortWay=${sortWay}&SportId=${SportId}&Timezone=${encodeURIComponent("+08:00")}`;
          }
          let queryParams = this.parseQueryParameters(`apiName?${queryString}`);
          const thisDiffKey = this._getDataCacheKey("events", { ...queryParams });
          let cacheData = this._NewDataCache[thisDiffKey].full;
          const favEvents = await this.getFavouriteEvents();

          //主查詢
          if(jsonData.isPagePull || !cacheData){
            const allData = jsonData.allData[0];
            const PageNumber = allData.PageNumber

            let cloneEventDatas; //複製一份 不要和保存的內容共用實例


            //考慮沒有盤口的情況，返回空數組
            if (!allData.Data || allData.Data.length <= 0) {
              cloneEventDatas = []
              if(page > 1){
                cloneEventDatas = this.mergePreviousPagesData(queryParams);
              }
              return new PollingResult(cloneEventDatas,
                [],
                false, {
                  MaxPageCount: jsonData.MaxPageCount,
                  PageNumber: jsonData.PageNumber,
                  TotalCount: jsonData.TotalCount
                });
            }

            const EventDatas = allData.Data.map((item, index) => {
              //console.log('handle',index, item.EventId)
              if (MarketId === VendorMarkets.OUTRIGHT){
                return EventData.createFromNewIMOutRightSource(item, SportId, favEvents, OddsType, MemberType);
              } else {
                return EventData.createFromNewIMSource(item, SportId, favEvents, OddsType, MemberType);
              }
            });
            // 如果page>1，取前面的資料回來合併
            let newData;
            if(page > 1){
              // 將 EventDatas（即最新一頁的資料）添加到 mergedResults 的後面
              newData = cacheData.concat(EventDatas);
            } else {
              newData = EventDatas.map(ed => EventData.clone(ed))
            }

            if (this._NewDataCache[thisDiffKey]) {
              this._NewDataCache[thisDiffKey].full = newData;
            }
            cloneEventDatas = newData.map(ed => EventData.clone(ed))
            return new PollingResult(cloneEventDatas,
              [],
              false, {
                MaxPageCount: jsonData.MaxPageCount,
                PageNumber: jsonData.PageNumber,
                TotalCount: jsonData.TotalCount
              });
          } else {
            //有hasCacheData資料，拿出之前的資料比較
            const { countsPerPage, endDate, startDate, sortWay, page } = extraConfigs
            let queryString = "";
            if (MarketId === VendorMarkets.RUNNING) {
              queryString = `MarketId=${MarketId}&CountsPerPage=${countsPerPage}&SortWay=${sortWay}&SportId=${SportId}&Timezone=${encodeURIComponent("+08:00")}`;
            } else if (MarketId === VendorMarkets.OUTRIGHT){
              queryString = `MarketId=${MarketId}&CountsPerPage=${countsPerPage}&SortWay=${sortWay}&SportId=${SportId}&Timezone=${encodeURIComponent("+08:00")}`;
            } else {
              queryString = `StartDate=${startDate.replace(/-/g, "")}&EndDate=${endDate.replace(/-/g, "")}&MarketId=${MarketId}&CountsPerPage=${countsPerPage}&SortWay=${sortWay}&SportId=${SportId}&Timezone=${encodeURIComponent("+08:00")}`;
            }
            let queryParams = this.parseQueryParameters(`apiName?${queryString}`);

            // 新資料
            let AllEventDatas = [];
            // 舊資料
            let oldDatas = [];
            const thisDiffKey = this._getDataCacheKey("events", { ...queryParams });

            // 合併新資料和舊資料
            if (jsonData.allData.length === 1) {
              const singleData = jsonData.allData[0];
              const EventDatas = singleData.Data.map((eventData) => {
                  if (MarketId === VendorMarkets.OUTRIGHT) {
                    return EventData.createFromNewIMOutRightSource(eventData, SportId, favEvents, OddsType, MemberType);
                  } else {
                    return EventData.createFromNewIMSource(eventData, SportId, favEvents, OddsType, MemberType);
                  }
                }
              );
              AllEventDatas.push(...EventDatas);

              const originalData = this._NewDataCache[thisDiffKey]?.full || [];
              oldDatas.push(...originalData);
            } else {
              // 合併多頁資料
              jsonData.allData.forEach((data, i) => {
                const EventDatas = data.Data.map((eventData) => {
                    if (MarketId === VendorMarkets.OUTRIGHT) {
                      return EventData.createFromNewIMOutRightSource(eventData, SportId, favEvents, OddsType, MemberType);
                    } else {
                      return EventData.createFromNewIMSource(eventData, SportId, favEvents, OddsType, MemberType);
                    }
                  }
                );
                AllEventDatas.push(...EventDatas);
              });
              const originalData = this._NewDataCache[thisDiffKey]?.full || [];
              oldDatas.push(...originalData);
            }


            let hasDeletedFavourite = false; //關注比賽 是否有被刪除
            let deleteEventIds = [];

            //比對差異
            let changes = [];
            if (oldDatas) {
              let newEventIds = AllEventDatas.map(ev => ev.EventId);
              let oldEventMap = {}
              oldDatas.map(oev => {
                oldEventMap[oev.EventId] = oev;
                //已刪除
                if (newEventIds.indexOf(oev.EventId) === -1) {
                  deleteEventIds.push(oev.EventId);
                  changes.push(new EventChangeData(oev.EventId, EventChangeType.Delete, oev));
                }
              });
              AllEventDatas.map(ev => {
                let oev = oldEventMap[ev.EventId];
                if (oev) {
                  //變更 有變化的才紀錄
                  if (JSON.stringify(oev) !== JSON.stringify(ev)) {
                    changes.push(new EventChangeData(ev.EventId, EventChangeType.Update, oev, ev));
                  }
                } else {
                  //新增
                  changes.push(new EventChangeData(ev.EventId, EventChangeType.New, null, ev));
                }
              })
            }

            if (deleteEventIds && deleteEventIds.length > 0) {
              //刪除收藏
              //console.log('====remove fav event from getEvents->queryPromise for VendorMarkets.NORMALs')
              hasDeletedFavourite = await this.removeFavouriteEvent(deleteEventIds);
            }

            if (hasDeletedFavourite) { //關注比賽 有被刪除
              //強制刷新 體育計數
              if (typeof window !== "undefined" && window.eventListing_updateSportsCount) {
                window.eventListing_updateSportsCount(this.configs.VendorName);
              }
            }

            // console.log('changes ',changes)
            //記錄新數據
            this._NewDataCache[thisDiffKey].full = AllEventDatas
            const cloneEventDatas = AllEventDatas.map(ed => EventData.clone(ed)); //複製一份 不要和保存的內容共用實例
            return new PollingResult(cloneEventDatas, changes, false, {
              MaxPageCount: jsonData.MaxPageCount,
              PageNumber: jsonData.PageNumber,
              TotalCount: jsonData.TotalCount
            });
          }

        })
        .then(async result => {
          // console.log('result ',result)
          const Events = result.NewData;
          const Changes = result.Changes;
          const extraConfigs = result.extraConfigs;
          let filteredEvents;
          if (MarketId === VendorMarkets.OUTRIGHT) { //早盤不主動查波膽，數據量太大
            filteredEvents = Events;
          } else {
            filteredEvents = Events !== null ? Events.filter(item => {
              if (endDate == null) {
                return (startDate <= item.EventDateLocal);
              } else {
                return (startDate <= item.EventDateLocal) && (item.EventDateLocal <= endDate);
              }
            }) : []
          }

          const filteredChanges = Changes.filter(item => {
            if (item.ChangeType !== EventChangeType.Delete) {
              if (endDate == null) {
                return (startDate <= item.NewValue.EventDateLocal);
              } else {
                return (startDate <= item.NewValue.EventDateLocal) && (item.NewValue.EventDateLocal <= endDate);
              }
            }
          });
          allEventsCount = filteredEvents.length; //先記下總比賽量
          //沒指定可視範圍，則按原本方式處理
          return new PollingResult(filteredEvents, filteredChanges, false, {
            MaxPageCount: extraConfigs.MaxPageCount,
            PageNumber: extraConfigs.PageNumber,
            TotalCount: extraConfigs.TotalCount
          });
        })

    }

    return queryPromise
      .then(result => {

        if(MarketId === VendorMarkets.OUTRIGHT){
          //如果是 列表頁展示，自動切selection只保留前４個
          //目前這裡一定是列表展示
          if (result.NewData && result.NewData.length > 0) {
            result.NewData.map(e => {
              if (e.Lines && e.Lines.length > 0) {
                e.Lines.map(l => {
                  if (l.Selections && l.Selections.length > 4) {
                    l.Selections = l.Selections.filter((s,index) => index < 4);
                  }
                })
              }
            })
          }
        }

        //處理排序
        // result.NewData = EventData.sortEvents(result.NewData, sortWay);
        //排序投注線
        if (result.NewData && result.NewData.length > 0) {
          result.NewData.map(item => {
            item.sortLines();
          })
        }
        result.IsFullLoaded = true;
        return result;
      })
  }

  mergePreviousPagesData(queryParams) {
    const thisDiffKey = this._getDataCacheKey("events", { ...queryParams });
    return this._NewDataCache[thisDiffKey].full;
  }

  //獲取比賽列表 返回為 PollingResult 格式(支持比對數據變化)
  //extraConfigs.MaxCount 支持指定獲取前幾個賽事 banner使用 這個IM無法用，接口不支持，不影響 就是會多返回數據
  //extraConfigs.getViewScope 函數，目前只用來指定早盤 全場波膽需要載入多少數據
  async getEvents(SportId = IMSports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null
            , extraConfigs = {}) {

    let isWCP2022 = false;
    if (SportId === IMSports.WCP2022) {
      isWCP2022 = true;
      SportId = IMSports.SOCCER; //改回查足球數據
    }

    const OddsType = this.getMemberSetting().oddsType;
    const MemberType = this._getMemberType(); //水位

    //獲取收藏賽事
    const favEvents = await this.getFavouriteEvents();
    const favEventsForThisSport = favEvents.filter(item => item.SportId === SportId);
    const favEventIdsForThisSport = favEventsForThisSport.map(item => item.EventId);

    //可視範圍，用來縮減數據量，目前只用來指定早盤 全場波膽需要載入多少數據
    let viewScope = null;
    let allEventsCount = null; //用於在有ViewScope情況下判斷是否已經加載完成
    if ((MarketId === VendorMarkets.EARLY) && extraConfigs.getViewScope) {
      viewScope = extraConfigs.getViewScope();
    }

    let queryPromise = null;

    //關注(收藏)
    if(MarketId === VendorMarkets.FAVOURITE) {

      //沒數據直接返回空
      if (favEventsForThisSport.length <=0) {
        return new Promise(resolve => resolve(new PollingResult([], [], true))); //額外設定已加載完畢
      }

      //轉成EventInfo格式
      const favEventInfos = favEventsForThisSport.map(fe => {
        return new EventInfo(fe.EventId,fe.SportId,(fe.IsOutRightEvent === true ? true : false));
      })

      queryPromise = this.getEventsDetail(favEventInfos, false,{
        MainMarketOnly: true,
        uniqueName: 'getEvents_FAVOURITE'
      }).then(async pr => {
        pr.NewData.map(item => {
          if (item.IsOutRightEvent) {
            //猜冠軍，自動切selection只保留前４個
            if (item.Lines && item.Lines.length > 0) {
              item.Lines.map(l => {
                if (l.Selections && l.Selections.length > 4) {
                  l.Selections = l.Selections.filter((s,index) => index < 4);
                }
              })
            }
          }
        })

        //移除 沒有數據的 關注比賽
        let existEventIds = [];
        const AllEventDatas =  pr.NewData;
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

        //2022世界杯特殊處理
        if (isWCP2022) {
          const Events = pr.NewData;
          const Changes = pr.Changes;
          //console.log(startDate,endDate);
          const wcp2022FilteredEvents = Events !== null ? Events.filter(item => {
            return this.WCP2022Settings.LeagueIds.indexOf(item.LeagueId) !== -1;
          }) : []

          const wcp2022FilteredChanges = Changes.filter(item => {
            if (item.ChangeType !== EventChangeType.Delete) {
              return this.WCP2022Settings.LeagueIds.indexOf(item.LeagueId) !== -1;
            }
            return true;
          });

          return new PollingResult(wcp2022FilteredEvents, wcp2022FilteredChanges);
        }

        return pr;
      });

    } else if (MarketId === VendorMarkets.OUTRIGHT) {  //優勝冠軍

      queryPromise = this._getOutRightEvents(SportId, null, true, {isWCP2022});

    } else {

      let getEventPromise = null;
      if (vendorSettings.PageMode === true) { //P1要改用分頁查詢
        //需要分頁查

        //先取數量
        let eventCount = 0;
        const sportsCountPR = await this.getSports();
        let sportDatas = sportsCountPR.NewData.filter(item => parseInt(item.SportId) === SportId);
        if (isWCP2022) {  //世界杯2022處理
          sportDatas = sportsCountPR.NewData.filter(item => parseInt(item.SportId) === IMSports.SOCCER); //換成足球
        }
        if (sportDatas && sportDatas.length > 0 && sportDatas[0].Markets) {
          const marketDatas = sportDatas[0].Markets.filter(item => item.MarketId === MarketId)
          if (marketDatas && marketDatas.length > 0) {
            eventCount = marketDatas[0].Count;
          }
        }
        //分頁查
        const pageSize = 100;
        let queryPromises = [];
        const maxPageNo = Math.ceil(eventCount / pageSize);
        for (let currentPageNo = 1; currentPageNo <= maxPageNo; currentPageNo++) {
          let thisPromise = this._APIs.getEventInfoBYPAGE(SportId, MarketId, currentPageNo);
          queryPromises.push(thisPromise);
        }

        getEventPromise = Promise.all(queryPromises).then(async resultArray => {
          let AllEventDatas = [];
          const favEvents = await this.getFavouriteEvents();
          resultArray.map((jsonData, resultIndex) => {
            //考慮沒有盤口的情況，返回空數組
            if (!jsonData.Sports || jsonData.Sports.length <= 0) {
              return;
            }

            const data = jsonData.Sports[0].Events;
            const SportId = jsonData.Sports[0].SportId;
            const EventDatas = data.map((item, index) => {
              //console.log('handle',index, item.EventId)
              return EventData.createFromIMSource(item, SportId, favEvents, OddsType, MemberType);
            });

            AllEventDatas = AllEventDatas.concat(EventDatas);
          })

          const cahceKey = this._getDataCacheKey('getEvents',{SportId,MarketId,startDate,endDate})
          const oldDatas = this._DataCache[cahceKey];

          let hasDeletedFavourite = false; //關注比賽 是否有被刪除
          let deleteEventIds = [];

          //比對差異
          let changes = [];
          if (oldDatas) {
            let newEventIds = AllEventDatas.map(ev => ev.EventId);
            let oldEventMap = {}
            oldDatas.map(oev => {
              oldEventMap[oev.EventId] = oev;
              //已刪除
              if (newEventIds.indexOf(oev.EventId) === -1) {
                deleteEventIds.push(oev.EventId);
                changes.push(new EventChangeData(oev.EventId, EventChangeType.Delete, oev));
              }
            });
            AllEventDatas.map(ev => {
              let oev = oldEventMap[ev.EventId];
              if (oev) {
                //變更 有變化的才紀錄
                if (JSON.stringify(oev) !== JSON.stringify(ev)) {
                  changes.push(new EventChangeData(ev.EventId, EventChangeType.Update, oev, ev));
                }
              } else {
                //新增
                changes.push(new EventChangeData(ev.EventId, EventChangeType.New, null, ev));
              }
            })
          }

          if (deleteEventIds && deleteEventIds.length > 0) {
            //刪除收藏
            //console.log('====remove fav event from getEvents->queryPromise for VendorMarkets.NORMALs')
            hasDeletedFavourite = await this.removeFavouriteEvent(deleteEventIds);
          }

          if (hasDeletedFavourite) { //關注比賽 有被刪除
            //強制刷新 體育計數
            if (typeof window !== "undefined" && window.eventListing_updateSportsCount) {
              window.eventListing_updateSportsCount(this.configs.VendorName);
            }
          }

          //記錄新數據
          this._DataCache[cahceKey] = AllEventDatas;

          const cloneEventDatas = AllEventDatas.map(ev => EventData.clone(ev)); //複製一份 不要和保存的內容共用實例

          return new PollingResult(cloneEventDatas, changes);
        });
      } else {
        //除了P1以外還是都用getEventInfoMBT
        getEventPromise = this._APIs.getEventInfoMBT(SportId, MarketId)
          .then(async jsonData => {

            if (!jsonData.isDeltaQuery) {
              //主查詢

              //考慮沒有盤口的情況，返回空數組
              if (!jsonData.Sports || jsonData.Sports.length <= 0) {
                //記得額外儲存一個空的主查詢結果，不然後面調用delta查詢 會報錯
                if (jsonData.deltaKey && this._APIDeltas[jsonData.deltaKey]) {
                  this._APIDeltas[jsonData.deltaKey].full = [];
                }
                return new PollingResult([]);
              }

              const data = jsonData.Sports[0].Events;
              const SportId = jsonData.Sports[0].SportId;
              const EventDatas = data.map((item, index) => {
                //console.log('handle',index, item.EventId)
                return EventData.createFromIMSource(item, SportId, favEvents, OddsType, MemberType);
              });

              //儲存主查詢結果
              if (jsonData.deltaKey && this._APIDeltas[jsonData.deltaKey]) {
                this._APIDeltas[jsonData.deltaKey].full = EventDatas;
              }

              const cloneEventDatas = EventDatas.map(ed => EventData.clone(ed)); //複製一份 不要和保存的內容共用實例

              return new PollingResult(cloneEventDatas);
            } else {
              //Delta查詢
              //拿出之前存的主查詢結果
              let SavedEventDatas = [];
              if (jsonData.deltaKey && this._APIDeltas[jsonData.deltaKey] && this._APIDeltas[jsonData.deltaKey].full) {
                SavedEventDatas = this._APIDeltas[jsonData.deltaKey].full;
              }

              //更新收藏狀態(下面只會處理變更項目，不會更新全部數據，所以要在這裡 直接全部處理)
              SavedEventDatas.map(item => {
                if (favEventIdsForThisSport.indexOf(item.EventId) !== -1) {
                  item.IsFavourite = true;
                } else {
                  item.IsFavourite = false;
                }
              });

              let hasDeletedFavourite = false; //關注比賽 是否有被刪除

              const data = jsonData.DeltaChanges;
              let deleteEventIds = [];
              const EventChanges = data.map((item, index) => {
                if (item.Action === IMDeltaAction.DELETE) {
                  deleteEventIds.push(item.EventId);
                  //刪除比賽
                  return new EventChangeData(
                      item.EventId,
                      EventChangeType.Delete
                  );
                } else {
                  const existEvents = SavedEventDatas.filter(existItem => {
                    return existItem.EventId === item.EventId
                  })
                  const newEventSource = JSON.parse(item.Value);
                  //console.log('newEventSource',newEventSource);
                  const newEvent = EventData.createFromIMSource(newEventSource[0].Events[0], newEventSource[0].SportId, favEvents, OddsType, MemberType);
                  if (!existEvents || existEvents.length <= 0) {
                    //新增比賽
                    return new EventChangeData(
                        item.EventId,
                        EventChangeType.New,
                        null,
                        newEvent,
                    );
                  } else {
                    //修改比賽
                    return new EventChangeData(
                        item.EventId,
                        EventChangeType.Update,
                        existEvents[0],
                        newEvent,
                    );
                  }
                }
              });

              if (deleteEventIds && deleteEventIds.length > 0) {
                //刪除收藏
                //console.log('====remove fav event from getEvents->queryPromise for VendorMarkets.NORMALs')
                hasDeletedFavourite = await this.removeFavouriteEvent(deleteEventIds);
              }

              if (hasDeletedFavourite) { //關注比賽 有被刪除
                //強制刷新 體育計數
                if (typeof window !== "undefined" && window.eventListing_updateSportsCount) {
                  window.eventListing_updateSportsCount(this.configs.VendorName);
                }
              }

              //套用差異更新
              //刪除
              const DeletedEventIds = EventChanges.map(change => {
                if (change.ChangeType === EventChangeType.Delete) {
                  return change.EventId;
                }
              })
              if (DeletedEventIds && DeletedEventIds.length > 0) {
                SavedEventDatas = SavedEventDatas.filter(event => {
                  return (DeletedEventIds.indexOf(event.EventId) === -1);
                })
              }

              EventChanges.map(change => {
                //更新
                if (change.ChangeType === EventChangeType.Update) {
                  let targetIndex = null;
                  SavedEventDatas.map((event, index) => {
                    if (event.EventId === change.EventId) {
                      targetIndex = index;
                    }
                  })

                  if (targetIndex !== null) {
                    SavedEventDatas[targetIndex] = change.NewValue;
                  }

                  //新增
                } else if (change.ChangeType === EventChangeType.New) {
                  SavedEventDatas.push(change.NewValue);
                }
              })

              //儲存套用差異更新後的結果
              if (jsonData.deltaKey && this._APIDeltas[jsonData.deltaKey]) {
                this._APIDeltas[jsonData.deltaKey].full = SavedEventDatas;
              }

              const cloneEventDatas = SavedEventDatas.map(ed => EventData.clone(ed)); //複製一份 不要和保存的內容共用實例
              // console.log('EventChanges ',EventChanges)
              return new PollingResult(cloneEventDatas, EventChanges);
            }
          })
      }

      queryPromise = getEventPromise.then(async result => {
        //2022世界杯特殊處理
        if (isWCP2022) {
          const Events = result.NewData;
          const Changes = result.Changes;
          //console.log(startDate,endDate);
          const wcp2022FilteredEvents = Events !== null ? Events.filter(item => {
            return this.WCP2022Settings.LeagueIds.indexOf(item.LeagueId) !== -1;
          }) : []

          const wcp2022FilteredChanges = Changes.filter(item => {
            if (item.ChangeType !== EventChangeType.Delete) {
              return this.WCP2022Settings.LeagueIds.indexOf(item.LeagueId) !== -1;
            }
            return true;
          });

          allEventsCount = wcp2022FilteredEvents.length; //先記下總比賽量

          //沒指定可視範圍，則按原本方式處理
          if (!viewScope) {
            return new PollingResult(wcp2022FilteredEvents, wcp2022FilteredChanges);
          } else {
            const eventsInViewScope = wcp2022FilteredEvents.slice(viewScope.startIndex ?? 0, viewScope.endIndex + 1 ?? wcp2022FilteredEvents.length); //注意slice不包含endIndex，要自己+1
            //沒數據直接返回空
            if (eventsInViewScope.length <= 0) {
              return new PollingResult([]);
            }

            //早盤的波膽：如果查詢範圍都沒變，3分鐘才更新一次
            const cacheKey = 'getEvents_CorrectScore' + '_' + md5(JSON.stringify({
              SportId: IMSports.WCP2022,
              MarketId,
              sortWay
            }));
            const cachedData = this._cacheGet(cacheKey);
            const eventsHash = md5(JSON.stringify(eventsInViewScope.map(ev => ev.EventId))).toString();
            if (cachedData) {
              if (eventsHash === cachedData.eventsHash) {
                let cloneEventDatas = cachedData.pr.NewData.map(ed => EventData.clone(ed)); //複製一份 不要和保存的內容共用實例

                //更新收藏狀態(這是緩存數據，需要即時更新收藏狀態)
                cloneEventDatas.map(item => {
                  if (favEventIdsForThisSport.indexOf(item.EventId) !== -1) {
                    item.IsFavourite = true;
                  } else {
                    item.IsFavourite = false;
                  }
                });

                return new PollingResult(cloneEventDatas, cachedData.pr.Changes); //有緩存，且event範圍沒變，直接返回緩存
              }
            }

            //轉成EventInfo格式
            const eventInfos = eventsInViewScope.map(ev => {
              return new EventInfo(ev.EventId, ev.SportId, false);
            })

            const prResult = await this.getEventsDetail(eventInfos, false, {
              MainMarketOnly: true,
              uniqueName: 'getEvents_EARLY_WCP2022'
            })

            //寫入緩存
            this._cacheSet(cacheKey, {eventsHash, pr: prResult}, 3 * 60); //緩存3分

            const cloneEventDatas = prResult.NewData.map(ed => EventData.clone(ed)); //複製一份 不要和保存的內容共用實例

            return new PollingResult(cloneEventDatas, prResult.Changes);
          }
        }

        //按配置的時間區段過濾
        if ((startDate == null && endDate == null) || MarketId !== VendorMarkets.EARLY) {
          return result;
        }

        const Events = result.NewData;
        const Changes = result.Changes;
        //console.log(startDate,endDate);
        const filteredEvents = Events !== null ? Events.filter(item => {
          if (endDate == null) {
            return (startDate <= item.EventDateLocal);
          } else {
            return (startDate <= item.EventDateLocal) && (item.EventDateLocal <= endDate);
          }
        }) : []

        const filteredChanges = Changes.filter(item => {
          if (item.ChangeType !== EventChangeType.Delete) {
            if (endDate == null) {
              return (startDate <= item.NewValue.EventDateLocal);
            } else {
              return (startDate <= item.NewValue.EventDateLocal) && (item.NewValue.EventDateLocal <= endDate);
            }
          }
        });

        allEventsCount = filteredEvents.length; //先記下總比賽量

        //沒指定可視範圍，則按原本方式處理
        if (!viewScope) {
          return new PollingResult(filteredEvents, filteredChanges);
        } else {
          const eventsInViewScope = filteredEvents.slice(viewScope.startIndex ?? 0, viewScope.endIndex + 1 ?? filteredEvents.length); //注意slice不包含endIndex，要自己+1
          //沒數據直接返回空
          if (eventsInViewScope.length <= 0) {
            return new PollingResult([]);
          }

          //早盤的波膽：如果查詢範圍都沒變，3分鐘才更新一次
          const cacheKey = 'getEvents_CorrectScore' + '_' + md5(JSON.stringify({
            SportId,
            MarketId,
            sortWay,
            startDate,
            endDate
          }));
          const cachedData = this._cacheGet(cacheKey);
          const eventsHash = md5(JSON.stringify(eventsInViewScope.map(ev => ev.EventId))).toString();
          if (cachedData) {
            if (eventsHash === cachedData.eventsHash) {
              const cloneEventDatas = cachedData.pr.NewData.map(ed => EventData.clone(ed)); //複製一份 不要和保存的內容共用實例

              //更新收藏狀態(這是緩存數據，需要即時更新收藏狀態)
              cloneEventDatas.map(item => {
                if (favEventIdsForThisSport.indexOf(item.EventId) !== -1) {
                  item.IsFavourite = true;
                } else {
                  item.IsFavourite = false;
                }
              });

              return new PollingResult(cloneEventDatas, cachedData.pr.Changes); //有緩存，且event範圍沒變，直接返回緩存
            }
          }

          //轉成EventInfo格式
          const eventInfos = eventsInViewScope.map(ev => {
            return new EventInfo(ev.EventId, ev.SportId, false);
          })

          const prResult = await this.getEventsDetail(eventInfos, false, {
            MainMarketOnly: true,
            uniqueName: 'getEvents_EARLY_' + (startDate ?? '') + '_' + (endDate ?? '')
          })

          //寫入緩存
          this._cacheSet(cacheKey, {eventsHash, pr: prResult}, 3 * 60); //緩存3分

          const cloneEventDatas = prResult.NewData.map(ed => EventData.clone(ed)); //複製一份 不要和保存的內容共用實例

          return new PollingResult(cloneEventDatas, prResult.Changes);
        }
      })
    }

    return queryPromise
      .then(result => {
        //處理排序
        result.NewData = EventData.sortEvents(result.NewData, sortWay);

        //排序投注線
        if (result.NewData && result.NewData.length > 0) {
          result.NewData.map(item => {
            item.sortLines();
          })
        }

        //沒指定可視範圍，則按原本方式處理
        if (!viewScope) {
          //額外設定已加載完畢
          result.IsFullLoaded = true;
        } else if (allEventsCount !== null) {
          //有指定可視範圍，用總數量判斷是否全部加載完畢
          if (result.NewData && result.NewData.length >= allEventsCount) {
            //額外設定已加載完畢
            result.IsFullLoaded = true;
          }
        }

        return result;
      })
  }

  //獲取優勝冠軍賽事 返回為 PollingResult 格式(支持比對數據變化)
  //IM強制歐洲盤，所以沒有盤口可選
  //排序在getEvents統一處理
  //因為IM沒有提供單個查詢的函數，這裏額外加一個eventIds參數，用來過濾數據，獲取特定單個或多個
  //ForListing用來提供列表頁的數據，自動切selection只保留前４個
  //extraConfigs.isWCP2022 2022世界杯特殊過濾
  async _getOutRightEvents(SportId = IMSports.SOCCER, eventIds = null, ForListing = false, extraConfigs = {}) {

    if (eventIds !== null && eventIds.length > 0) {
      eventIds = eventIds.map(e => parseInt(e)); //轉換一下
    }

    const OddsType = this.getMemberSetting().oddsType;
    const MemberType = this._getMemberType(); //水位

    //獲取收藏賽事
    const favEvents = await this.getFavouriteEvents();
    const favEventsForThisSport = favEvents.filter(item => item.SportId === SportId);
    const favEventIdsForThisSport = favEventsForThisSport.map(item => item.EventId);

    //2022世界杯特殊處理
    let LeagueIds = null;
    if (extraConfigs.isWCP2022) {
      LeagueIds = this.WCP2022Settings.LeagueIds;
    }

    return this._APIs.getOutRightEvents(SportId, LeagueIds)
      .then(async jsonData => {
        //注意優勝冠軍的接口不一樣，返回結構也和Events不一樣  都要特別處理

        if (!jsonData.isDeltaQuery) {
          //主查詢

          //考慮沒有盤口的情況，返回空數組
          if (!jsonData.Events || jsonData.Events.length <= 0) {  //直接返回Events 沒有Sports這層
            //記得額外儲存一個空的主查詢結果，不然後面調用delta查詢 會報錯
            if (jsonData.deltaKey && this._APIDeltas[jsonData.deltaKey]) {
              this._APIDeltas[jsonData.deltaKey].full = [];
            }
            return new PollingResult([]);
          }

          const data = jsonData.Events;
          const EventDatas = data.map((item, index) => {
            //console.log('handle',index, item.EventId)
            return EventData.createFromIMOutRightSource(item, SportId, favEvents, OddsType, MemberType);
          });

          // console.log('outright ',EventDatas)

          //儲存主查詢結果
          if (jsonData.deltaKey && this._APIDeltas[jsonData.deltaKey]) {
            this._APIDeltas[jsonData.deltaKey].full = EventDatas;
          }

          //複製一份 不要和保存的內容共用實例
          let cloneEventDatas = EventDatas.map(ed => EventData.clone(ed));

          //過濾
          if (eventIds !== null && eventIds.length > 0) {
            cloneEventDatas = cloneEventDatas.filter(ed => eventIds.indexOf(ed.EventId) !== -1 );
          }

          return new PollingResult(cloneEventDatas);
        } else {
          //Delta查詢
          //拿出之前存的主查詢結果
          let SavedEventDatas = [];
          if (jsonData.deltaKey && this._APIDeltas[jsonData.deltaKey] && this._APIDeltas[jsonData.deltaKey].full) {
            SavedEventDatas = this._APIDeltas[jsonData.deltaKey].full;
          }

          //更新收藏狀態(下面只會處理變更項目，不會更新全部數據，所以要在這裡 直接全部處理)
          SavedEventDatas.map(item => {
            if (favEventIdsForThisSport.indexOf(item.EventId) !== -1) {
              item.IsFavourite = true;
            } else {
              item.IsFavourite = false;
            }
          });

          //優勝冠軍的delta分開 InsertUpdateEvent 和 RemoveEvent

          let hasDeletedFavourite = false; //關注比賽 是否有被刪除
          let deleteEventIds = [];
          const RemoveChanges = jsonData.RemoveEvent.map(item => {
            deleteEventIds.push(item);
            //刪除比賽
            return new EventChangeData(
              item, //優勝冠軍給的是 直接 item = EventId
              EventChangeType.Delete
            );
          })

          if (deleteEventIds && deleteEventIds.length > 0) {
            //刪除收藏
            //console.log('====remove fav event from _getOutRightEvents')
            hasDeletedFavourite = await this.removeFavouriteEvent(deleteEventIds);
          }

          if (hasDeletedFavourite){ //關注比賽 有被刪除
            //強制刷新 體育計數
            if (typeof window !== "undefined" && window.eventListing_updateSportsCount) {
              window.eventListing_updateSportsCount(this.configs.VendorName);
            }
          }

          const InsertUpdateChanges = jsonData.InsertUpdateEvent.map(item => {
            const existEvents = SavedEventDatas.filter(existItem => {
              return existItem.EventId === item.EventId
            })
            //console.log('newEventSource',newEventSource);
            const newEvent = EventData.createFromIMOutRightSource(item, SportId, favEvents, OddsType, MemberType);
            if (!existEvents || existEvents.length <= 0) {
              //新增比賽
              return new EventChangeData(
                item.EventId,
                EventChangeType.New,
                null,
                newEvent,
              );
            } else {
              //修改比賽
              return new EventChangeData(
                item.EventId,
                EventChangeType.Update,
                existEvents[0],
                newEvent,
              );
            }
          });

          let EventChanges = InsertUpdateChanges.concat(RemoveChanges);

          //套用差異更新
          //刪除
          const DeletedEventIds = EventChanges.map(change => {
            if (change.ChangeType === EventChangeType.Delete) {
              return change.EventId;
            }
          })
          if (DeletedEventIds && DeletedEventIds.length > 0) {
            SavedEventDatas = SavedEventDatas.filter(event => {
              return (DeletedEventIds.indexOf(event.EventId) === -1);
            })
          }

          EventChanges.map(change => {
            //更新
            if (change.ChangeType === EventChangeType.Update) {
              let targetIndex = null;
              SavedEventDatas.map((event, index) => {
                if (event.EventId === change.EventId) {
                  targetIndex = index;
                }
              })

              if (targetIndex !== null) {
                SavedEventDatas[targetIndex] = change.NewValue;
              }

              //新增
            } else if (change.ChangeType === EventChangeType.New) {
              SavedEventDatas.push(change.NewValue);
            }
          })

          //儲存套用差異更新後的結果
          if (jsonData.deltaKey && this._APIDeltas[jsonData.deltaKey]) {
            this._APIDeltas[jsonData.deltaKey].full = SavedEventDatas;
          }

          //複製一份 不要和保存的內容共用實例
          let cloneEventDatas = SavedEventDatas.map(ed => EventData.clone(ed));

          //過濾
          if (eventIds !== null && eventIds.length > 0) {
            cloneEventDatas = cloneEventDatas.filter(ed => eventIds.indexOf(ed.EventId) !== -1 );
            EventChanges = EventChanges.filter(ec => eventIds.indexOf(ec.EventId) !== -1 )
          }

          return new PollingResult(cloneEventDatas, EventChanges);
        }
      }).then(pr => {
        //如果是 列表頁展示，自動切selection只保留前４個
        if (ForListing && pr.NewData && pr.NewData.length > 0) {
          pr.NewData.map(e => {
            if (e.Lines && e.Lines.length > 0) {
              e.Lines.map(l => {
                if (l.Selections && l.Selections.length > 4) {
                  l.Selections = l.Selections.filter((s,index) => index < 4);
                }
              })
            }
          })
        }

        //額外設定已加載完畢
        pr.IsFullLoaded = true;

        return pr;
      })
      //優勝冠軍沒有時間過濾
  }

  //獲取分頁後的賽事 返回為 PollingResult 格式(不支持比對數據變化)
  async getEventsPaged(SportId = IMSports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null,
                       page =1, pageRecords= 30, extraConfigs = {}) {

    const OddsType = this.getMemberSetting().oddsType;
    const MemberType = this._getMemberType(); //水位

    //獲取收藏賽事
    const favEvents = await this.getFavouriteEvents();

    let pagedDataOrderBy = 2; //1 = 赛事日期时间顺序 2 = IM 体育顺序
    if (sortWay === SortWays.EventTime) {
      pagedDataOrderBy = 1;
    }
    return this._APIs.getEventInfoBYPAGE(SportId, MarketId, page, pageRecords, pagedDataOrderBy)
      .then(jsonData => {
        //考慮沒有盤口的情況，返回空數組
        if (!jsonData.Sports || jsonData.Sports.length <= 0) {
          return new PollingResult([]);
        }

        const data = jsonData.Sports[0].Events;
        const SportId = jsonData.Sports[0].SportId;
        const eventDatas = data.map((item, index) => {
          return EventData.createFromIMSource(item, SportId, favEvents, OddsType, MemberType);
        });

        return new PollingResult(eventDatas);
      })
      .then(result => { //按配置的時間區段過濾
        if ((startDate == null && endDate == null) || MarketId !== VendorMarkets.EARLY) {
          return result;
        }

        const Events = result.NewData;
        const filteredEvents = Events !== null ? Events.filter(item => {
          if (endDate == null) {
            return (startDate <= item.EventDateLocal);
          } else {
            return (startDate <= item.EventDateLocal) && (item.EventDateLocal <= endDate);
          }
        }) : []

        return new PollingResult(filteredEvents);
      })
      .then(result => {
        //處理排序
        result.NewData = EventData.sortEvents(result.NewData, sortWay);

        //排序投注線
        if (result.NewData && result.NewData.length > 0) {
          result.NewData.map(item => {
            item.sortLines();
          })
        }

        return result;
      })
  }

  //獲取 預緩存 賽事 返回為 PollingResult 格式(不支持比對數據變化)
  async getPreCacheEventsFromCacheAPI(SportId = IMSports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null) {
    const OddsType = this.getMemberSetting().oddsType;
    const MemberType = this._getMemberType(); //水位

    //獲取收藏賽事
    const favEvents = await this.getFavouriteEvents();
    const favEventsForThisSport = favEvents.filter(item => item.SportId === SportId);
    const favEventIdsForThisSport = favEventsForThisSport.map(item => item.EventId);

    const eventDatas = await fetch(HostConfig.Config.CacheApi + '/events/im/'
        + SportId + '/' + MarketId + '/' + sortWay
        + ((startDate !== null && MarketId === VendorMarkets.EARLY) ? ('/' + startDate) : '')
        + ((endDate !== null && MarketId === VendorMarkets.EARLY)? ('/' + endDate): '')
      )
      .then(response => response.json())
      .then(jsonData => {
        let events = [];
        if (jsonData && jsonData.data && jsonData.data.length > 0) {
          events = jsonData.data.map(ev => EventData.clone(ev, OddsType, MemberType)); //需要轉換一下
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
      return new PollingResult(eventDatas,[], false, {
        MaxPageCount: eventDatas?.MaxPageCount,
        PageNumber: eventDatas?.PageNumber,
        TotalCount: eventDatas?.TotalCount
      });
    } else {
      return null;
    }
  }

  //獲取歐洲杯比賽列表 返回為 PollingResult 格式(支持比對數據變化)
  async getEUROCUP202021Events() {
    const OddsType = this.getMemberSetting().oddsType;
    const MemberType = this._getMemberType(); //水位

    //獲取收藏賽事
    const favEvents = await this.getFavouriteEvents();
    const favEventsForThisSport = favEvents.filter(item => item.SportId === 1);
    const favEventIdsForThisSport = favEventsForThisSport.map(item => item.EventId);

    let eventDatas = await fetch(HostConfig.Config.CacheApi + '/eurocup202021')
        .then(response => response.json())
        .then(jsonData => {
          let events = [];
          if (jsonData && jsonData.eurocup202021 && jsonData.eurocup202021.length > 0) {
            events = jsonData.eurocup202021.map(ev => EventData.clone(ev, OddsType, MemberType)); //需要轉換一下
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
        })
        .catch(e => {
          console.log('===getEUROCUP202021Events has error',e);
          return [];
        })

    const cahceKey = 'getEUROCUP202021Events';
    const oldDatas = this._cacheGet(cahceKey);

    //比對差異
    let changes = [];
    if (oldDatas !== null) {
      let newEventIds = eventDatas.map(ev => ev.EventId);
      let oldEventMap = {}
      oldDatas.map(oev => {
        oldEventMap[oev.EventId] = oev;
        //已刪除
        if (newEventIds.indexOf(oev.EventId) === -1) {
          changes.push(new EventChangeData(oev.EventId, EventChangeType.Delete, oev));
        }
      });
      eventDatas.map(ev => {
        let oev = oldEventMap[ev.EventId];
        if (oev) {
          //變更 有變化的才紀錄
          if (JSON.stringify(oev) !== JSON.stringify(ev)) {
            changes.push(new EventChangeData(ev.EventId, EventChangeType.Update, oev, ev));
          }
        } else {
          //新增
          changes.push(new EventChangeData(ev.EventId, EventChangeType.New, null, ev));
        }
      })
    }

    //記錄新數據
    this._cacheSet(cahceKey,eventDatas)
    //複製一份 不要和保存的內容共用實例
    const cloneEventDatas = eventDatas.map(ev => EventData.clone(ev));
    return new PollingResult(cloneEventDatas,changes,false, {
      MaxPageCount: cloneEventDatas?.MaxPageCount,
      PageNumber: cloneEventDatas?.PageNumber,
      TotalCount: cloneEventDatas?.TotalCount
    });
  }

  //獲取 單一個 比賽信息 返回為 PollingResult 格式(支持比對數據變化)
  //(這個IM先不支持，只是和其他Vendor同步參數)額外提供一個noMarkets參數，用來單純查詢event數據(只需要查詢球賽狀況，不用看投注)
  async getEventDetail(SportId= IMSports.SOCCER, EventId, isOutRightEvent = false, noMarkets= false) {

    const OddsType = this.getMemberSetting().oddsType;
    const MemberType = this._getMemberType(); //水位

    //優勝冠軍另外查
    if (isOutRightEvent) {
      return this._getOutRightEvents(SportId,[EventId]).then(pr => {
        if (pr.NewData && pr.NewData.length > 0) {
          return new PollingResult(pr.NewData[0]); //只要返回單個
        } else {
          return new PollingResult(null);
        }
      })
    }

    return this._APIs.getSelectedEventInfo(SportId, [EventId], OddsType)
      .then(async jsonData => {

        //考慮沒有盤口的情況，返回空
        if (!jsonData.Sports || jsonData.Sports.length <= 0 || !jsonData.Sports[0] || jsonData.Sports[0].Events.length <=0) {
          return new PollingResult(null);
        }

        //獲取收藏賽事
        const favEvents = await this.getFavouriteEvents();

        //現在 getSelectedEventInfo 開啟了 IncludeGroupEvents=true
        //可能會返回多個，包含不同EventGroup的數據
        const mainEvents = jsonData.Sports[0].Events.filter(ev => ev.EventGroupTypeId === 1); //EventGroupTypeId === 1的才是主要比賽

        const item = (mainEvents && mainEvents.length > 0) ? mainEvents[0] : null;
        if (item) {
          const SportId = jsonData.Sports[0].SportId;
          const eventData = EventData.createFromIMSource(item,SportId,favEvents, OddsType, MemberType);

          //合併eventGroup的投注數據
          eventData.IMMergeSideEvents(jsonData.Sports[0].Events,favEvents, OddsType, MemberType);

          const deltaKey = this._getDeltaKey('GETSELECTEDEVENTINFO', {EventId});
          const oldEventData = this._APIDeltas[deltaKey];
          let eventChanges = [];
          if (oldEventData) {
            //有變化的才紀錄EventChangeData
            if (JSON.stringify(oldEventData) !== JSON.stringify(eventData)) {
              eventChanges.push(new EventChangeData(eventData.EventId, EventChangeType.Update, oldEventData, eventData));
            }
          } else {
            eventChanges.push(new EventChangeData(eventData.EventId, EventChangeType.New, null, eventData));
          }

          //保存查詢結果
          this._APIDeltas[deltaKey] = eventData;

          //複製一份 不要和保存的內容共用實例
          let thisEventData = EventData.clone(eventData);

          //排序投注線
          if (thisEventData) {
            thisEventData.IMSortLinesAndSelections();
          }

          return new PollingResult(thisEventData, eventChanges);
        } else {
          return new PollingResult(null);
        }
      })
      .catch(error => {
        //處理比賽結束 or 找不到數據
        if (typeof error === 'object' && error.isVendorError === true) {
          if (error.ErrorType === VendorErrorType.BET_Event_Error) {
            return new PollingResult(null);
          }
        } else {
          throw error;
        }
      })
  }

  //獲取多個比賽信息，傳入為EventInfo數組(支持不同體育項目和 一般/優勝冠軍 賽事混查)， 返回為 PollingResult 格式(支持比對數據變化)
  //額外提供一個noMarkets參數，用來單純查詢event數據(只需要查詢球賽狀況，不用看投注)
  //extraConfigs.MainMarketOnly 只查詢主要市場(包含波膽)，只在noMarkets!=true時生效
  //extraConfigs.uniqueName 用來處理緩存分區(for數據變化)，只在noDiff!=true時生效
  //extraConfigs.noDiff 不進行數據變化比對，pr.changes會返回[]，適用於單純獲取數據的場合(API server)
  async getEventsDetail(EventInfos = [], noMarkets= false, extraConfigs = {}) {

    const OddsType = this.getMemberSetting().oddsType;
    const MemberType = this._getMemberType(); //水位

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

    //按體育和優勝冠軍分組
    let eventIdsBySportAndOutRight = {};
    EventInfos.map(item => {
      //SportId另外存，因為放在prop會被自動轉型為string，可能造成後面的問題
      const thisCategory = 'S_' + item.SportId;
      if (!eventIdsBySportAndOutRight[thisCategory]) {
        eventIdsBySportAndOutRight[thisCategory] = {sportId: item.SportId, normal: [], outright: []}; //裡面還要分 一般賽事 跟 優勝冠軍賽事
      }
      if (item.IsOutRightEvent) {
        eventIdsBySportAndOutRight[thisCategory].outright.push(item.EventId);
      } else {
        eventIdsBySportAndOutRight[thisCategory].normal.push(item.EventId);
      }
    })

    let promiseArr = [];
    for(let category in eventIdsBySportAndOutRight) {
      if (eventIdsBySportAndOutRight[category]) {
        //分體育項目
        const eventIds = eventIdsBySportAndOutRight[category];
        const sportId = eventIds.sportId;
        //查優勝冠軍
        if (eventIds.outright && eventIds.outright.length >0) {
          const outrightPromise = this._getOutRightEvents(sportId,eventIds.outright);
          promiseArr.push(outrightPromise);
        }
        //查一般比賽
        if (eventIds.normal && eventIds.normal.length >0) {
          let BetTypeIds = null;
          let PeriodIds = null;
          let IncludeGroupEvents = true;
          let MarketlineLevels = null;
          if (noMarkets) {
            BetTypeIds = [-999]; //查詢一個不存在的玩法
            IncludeGroupEvents = false;
          } else if (extraConfigs && extraConfigs.MainMarketOnly) {
            BetTypeIds = [IMBetType.HANDICAP, IMBetType.OVERUNDER, IMBetType.CORRECTSCORE];
            PeriodIds = [IMPeriodType.FH] //只查全場
            IncludeGroupEvents = false;
            MarketlineLevels = [1];
          }

          const normalPromise = this._APIs.getSelectedEventInfo(sportId, eventIds.normal, OddsType, false, IncludeGroupEvents, BetTypeIds, PeriodIds,MarketlineLevels)
            .then(async jsonData => {

              //考慮沒有盤口的情況，返回空數組
              if (!jsonData.Sports || jsonData.Sports.length <= 0) {
                return new PollingResult([]);
              }

              //獲取收藏賽事
              const favEvents = await this.getFavouriteEvents();

              //現在 getSelectedEventInfo 開啟了 IncludeGroupEvents=true
              //可能會返回多個，包含不同EventGroup的數據

              const mainEvents = jsonData.Sports[0].Events.filter(ev => ev.EventGroupTypeId === 1); //EventGroupTypeId === 1的才是主要比賽

              const eventDatas = mainEvents.map((item, index) => {
                //console.log('handle',index, item.EventId)
                const eventData = EventData.createFromIMSource(item, sportId, favEvents, OddsType, MemberType);

                //合併eventGroup的投注數據
                eventData.IMMergeSideEvents(jsonData.Sports[0].Events,favEvents, OddsType, MemberType);

                //排序投注線
                eventData.IMSortLinesAndSelections();

                return eventData;
              });

              if (extraConfigs.noDiff) {
                return new PollingResult(eventDatas);
              }

              const uniqueName = extraConfigs.uniqueName ?? '';
              const cacheKey = 'getEventsDetail' + '_' + uniqueName + '_' + md5(JSON.stringify({sportId, OddsType, BetTypeIds})); //不要使用eventId，因為使用這個函數的賽事範圍，通常會動態變化，只能以uniqueName去判斷是否不同查詢
              const oldDatas = this._cacheGet(cacheKey);

              //比對差異
              let changes = [];
              if (oldDatas !== null) {
                let newEventIds = eventDatas.map(ev => ev.EventId);
                let oldEventMap = {}
                oldDatas.map(oev => {
                  oldEventMap[oev.EventId] = oev;
                  //已刪除
                  if (newEventIds.indexOf(oev.EventId) === -1) {
                    changes.push(new EventChangeData(oev.EventId, EventChangeType.Delete, oev));
                  }
                });
                eventDatas.map(ev => {
                  let oev = oldEventMap[ev.EventId];
                  if (oev) {
                    //變更 有變化的才紀錄
                    if (JSON.stringify(oev) !== JSON.stringify(ev)) {
                      changes.push(new EventChangeData(ev.EventId, EventChangeType.Update, oev, ev));
                    }
                  } else {
                    //新增
                    changes.push(new EventChangeData(ev.EventId, EventChangeType.New, null, ev));
                  }
                })
              }

              //記錄新數據
              this._cacheSet(cacheKey,eventDatas)
              //複製一份 不要和保存的內容共用實例
              const cloneEventDatas = eventDatas.map(ev => EventData.clone(ev));
              return new PollingResult(cloneEventDatas,changes);
            })
            .catch(error => {
              //處理比賽結束 or 找不到數據
              if (typeof error  === 'object' && error.isVendorError === true) {
                if (error.ErrorType === VendorErrorType.BET_Event_Error) {
                  return new PollingResult([]);
                }
              } else {
                throw error;
              }
            })
          promiseArr.push(normalPromise);
        }
      }
    }

    return Promise.all(promiseArr).then(PRsArray => {
      let events = [];
      let changes = [];
      PRsArray.map(pr => {
        if (pr.NewData && pr.NewData.length > 0) {
          events = events.concat(pr.NewData);
        }
        if (pr.Changes && pr.Changes.length > 0) {
          changes = changes.concat(pr.Changes);
        }
      })

      return new PollingResult(events,changes);
    });
  }

  /**
   * 全局 輪詢獲取體育項目 30秒一次
   *
   * @param subscriberName     訂閱者名稱，用來處理重複訂閱的狀況
   * @param onUpdateCallback   輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData:SportData數組, Changes:空數組}
   * @param uniqueName         用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getSportsPollingGlobal(subscriberName, onUpdateCallback, uniqueName = '') {
    return this._subscribeGlobalPolling('getSportsPolling', subscriberName, onUpdateCallback,{}, uniqueName, true);
  }

  /**
   * 輪詢獲取體育項目 30秒一次
   *
   * @param onUpdateCallback   輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData:SportData數組, Changes:空數組}
   * @param uniqueName         用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getSportsPolling(onUpdateCallback, uniqueName = '') {
    const dataQuery = () => this.configs.VL ? this.getSportsNew() : this.getSports();
    return this._registerPolling('getSportsPolling',{}, dataQuery, onUpdateCallback, 30, uniqueName, true);
  }

  /**
   * 全局 輪詢獲取比賽數據 10秒一次
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
  getEventsPollingGlobal(subscriberName, onUpdateCallback, SportId = IMSports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null, extraConfigs= {}, uniqueName = '') {
    return this._subscribeGlobalPolling('getEventsPolling', subscriberName, onUpdateCallback,{SportId, MarketId, sortWay, startDate, endDate, extraConfigs}, uniqueName, true);
  }

  /**
   * 輪詢獲取比賽數據 10秒一次
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
  getEventsPolling(onUpdateCallback, SportId = IMSports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null, extraConfigs= {}, uniqueName = '') {
    let getEventsFunc;
    if (MarketId === VendorMarkets.FAVOURITE) {
      getEventsFunc = "getEvents";
    } else if (this.configs.VL) {
      getEventsFunc = "getEventsVL";
    } else {
      getEventsFunc = "getEvents";
    }
    const dataQuery = () => {
      if (MarketId === VendorMarkets.TODAY) { //今日包含滾球
        let favPromise = new Promise(resolve => resolve(null));
        if (!this.isAPIServer()) { //API服務器不需要查看關注比賽
          favPromise = this[getEventsFunc](SportId, VendorMarkets.FAVOURITE, sortWay, startDate, endDate, extraConfigs);
        }

        const runningPromise = this[getEventsFunc](SportId, VendorMarkets.RUNNING, sortWay, startDate, endDate, extraConfigs);
        const todayPromise = this[getEventsFunc](SportId, VendorMarkets.TODAY, sortWay, startDate, endDate, extraConfigs);

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

          return new PollingResult(eventDatas,eventChanges, true, {
            MaxPageCount: prToday.extraConfigs?.MaxPageCount,
            PageNumber: prToday.extraConfigs?.PageNumber,
            TotalCount: prToday.extraConfigs?.TotalCount
          }); //額外設定已加載完畢
        });
      } else {
        return this[getEventsFunc](SportId, MarketId, sortWay, startDate, endDate, extraConfigs);
      }
    }
    //分頁查詢 加速
    const preCacheQuery = () => {
      if(this.configs.VL){ return null }
      if (this.isAPIServer()) { //API服務器不需要preCache
        return new Promise(resolve => resolve(null));
      }

      if (MarketId === VendorMarkets.FAVOURITE) {
        //關注比賽 不加速，因為無法直接用分頁查詢
        return new Promise(resolve => resolve(null));
      }

      if ([IMSports.SOCCER, IMSports.BASKETBALL, IMSports.WCP2022].indexOf(SportId) === -1) {
        //只有足球和籃球支持緩存 世界杯2022也支持
        return new Promise(resolve => resolve(null));
      }

      //用緩存API 加速
      return this.getPreCacheEventsFromCacheAPI(SportId, MarketId, sortWay, startDate, endDate);
    }

    let intervalSeconds = 10;
    if (MarketId === VendorMarkets.EARLY && this.isAPIServer()) {
      intervalSeconds = 1*60; //IM早盤更新頻率，在Server端改為1分一次(因為IM有delta機制，消耗不大) 客戶端仍維持10秒一次，因為有ViewScope機制，需要比較頻繁更新
    }

    if (vendorSettings.PageMode === true && MarketId === VendorMarkets.OUTRIGHT && this.isAPIServer()) {
      intervalSeconds = 1*60; //P1全拉模式，在Server端延長為1分一次(因為不支持delta查詢)
    }

    const useCache = this.configs.VL ? false : true;
    return this._registerPolling('getEventsPolling', {SportId, MarketId, sortWay, startDate, endDate, extraConfigs}, dataQuery, onUpdateCallback, intervalSeconds, uniqueName, useCache, 9*60, preCacheQuery);
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
  APIEventsPollingWithAutoClean(onUpdateCallback, SportId = IMSports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null, uniqueName = '') {
    const callWithAutoClean = async (imPollingKey = null, firstTime = false) => {
      if (imPollingKey) {
        //console.log('IM delete polling...');
        this.deletePolling(imPollingKey);
      }

      if (!firstTime) { //第一次 不清理數據
        const BetTypeIds = [IMBetType.HANDICAP, IMBetType.OVERUNDER];
        const BetTypeIdsCC = [IMBetType.HANDICAP,IMBetType.OVERUNDER, IMBetType.CORRECTSCORE]
        const MarketlineLevels = [1];
        const EventGroupTypeIds = [1];
        const PeriodIds = [IMPeriodType.FH];

        // const dumpDeltaInfo = () => {
        //   let deltaInfo = { count: 0 }
        //   for(let prop in this._APIDeltas) {
        //     deltaInfo.count = deltaInfo.count + 1;
        //     deltaInfo[prop] = {
        //       full: this._APIDeltas[prop] && this._APIDeltas[prop].full ? this._APIDeltas[prop].full.length : 'null',
        //       params: this._APIDeltas[prop] && this._APIDeltas[prop].params ? JSON.stringify(this._APIDeltas[prop].params) : 'null',
        //     };
        //   }
        //   return deltaInfo;
        // }
        //
        // if (MarketId !== VendorMarkets.RUNNING) {
        //   console.log('IM delta BEFORE clear', SportId, MarketId, dumpDeltaInfo())
        // }

        if (MarketId === VendorMarkets.TODAY) {
          //今日包含滾球，要一起清理
          await this.ClearDeltaCache('GETEVENTINFOMBT', {
            SportId,
            Market: VendorMarkets.RUNNING,
            BetTypeIds: BetTypeIdsCC,
            MarketlineLevels,
            EventGroupTypeIds,
            PeriodIds,
          }).catch(e => console.log('ClearDeltaCache await RUNNING error:', e));
          await this.ClearDeltaCache('GETEVENTINFOMBT', {
            SportId,
            Market: VendorMarkets.TODAY,
            BetTypeIds: BetTypeIdsCC,
            MarketlineLevels,
            EventGroupTypeIds,
            PeriodIds,
          }).catch(e => console.log('ClearDeltaCache await TODAY error:', e));

        } else if (MarketId === VendorMarkets.EARLY) {
          //早盤
          await this.ClearDeltaCache('GETEVENTINFOMBT', {
            SportId,
            Market: VendorMarkets.EARLY,
            BetTypeIds,
            MarketlineLevels,
            EventGroupTypeIds,
            PeriodIds,
          }).catch(e => console.log('ClearDeltaCache await EARLY error:', e));
        } else if (MarketId === VendorMarkets.OUTRIGHT) {
          //猜冠軍
          await this.ClearDeltaCache('GETOUTRIGHTEVENTS', {
            SportId,
          }).catch(e => console.log('ClearDeltaCache await OUTRIGHT error:', e));
        }

        // if (MarketId !== VendorMarkets.RUNNING) {
        //   console.log('IM delta AFTER clear', SportId, MarketId, dumpDeltaInfo())
        // }
      }

      //console.log('IM start polling...');
      const thisPollingKey = this.getEventsPolling(onUpdateCallback,SportId,MarketId,sortWay,startDate,endDate,{},uniqueName);
      //暫定10分刷新一次
      setTimeout(() => callWithAutoClean(thisPollingKey), 10*60*1000);
    }
    callWithAutoClean(null, true);
  }


  /**
   * 全局 輪詢獲取 歐洲杯2020-21 比賽數據 10秒一次
   *
   * @param subscriberName     訂閱者名稱，用來處理重複訂閱的狀況
   * @param onUpdateCallback   輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData:EventData數組, Changes:EventChangeData數組}
   * @param uniqueName         用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEUROCUP202021EventsPollingGlobal(subscriberName, onUpdateCallback, uniqueName = '') {
    return this._subscribeGlobalPolling('getEUROCUP202021EventsPolling', subscriberName, onUpdateCallback,{}, uniqueName, false);
  }

  /**
   * 輪詢獲取 歐洲杯2020-21 比賽數據 10秒一次
   *
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData:EventData數組, Changes:EventChangeData數組}
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEUROCUP202021EventsPolling(onUpdateCallback, uniqueName = '') {
    const dataQuery = () => this.getEUROCUP202021Events();
    return this._registerPolling('getEUROCUP202021EventsPolling', {}, dataQuery, onUpdateCallback, 10, uniqueName, true);
  }

  /**
   * 輪詢獲取 單個 比賽數據 10秒一次
   *
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData: 單個EventData數據, Changes: EventChangeData 數組}
   * @param SportId           體育項目ID
   * @param EventId           比賽ID
   * @param isOutRightEvent   是否優勝冠軍賽事
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventDetailPolling(onUpdateCallback, SportId = IMSports.SOCCER, EventId, isOutRightEvent = false, uniqueName = '') {
    const dataQuery = () => this.getEventDetail(SportId, EventId, isOutRightEvent);
    return this._registerPolling('getEventDetailPolling', {SportId, EventId, isOutRightEvent}, dataQuery, onUpdateCallback, 10, uniqueName, true);
  }

  /**
   * 全局 輪詢獲取 多個 比賽數據 10秒一次
   *
   * @param subscriberName    訂閱者名稱，用來處理重複訂閱的狀況
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData: EventData數組, Changes: EventChangeData 數組}
   * @param EventInfos        要輪詢的比賽，EventInfo數組(支持不同體育項目和 一般/優勝冠軍 賽事混查)
   * @param noMarkets         額外提供一個noMarkets參數，用來單純查詢event數據(只需要查詢球賽狀況，不用看投注)
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventsDetailPollingGlobal(subscriberName, onUpdateCallback, EventInfos = [], noMarkets= false, uniqueName = '') {
    return this._subscribeGlobalPolling('getEventsDetailPolling', subscriberName, onUpdateCallback,{EventInfos, noMarkets}, uniqueName);
  }

  /**
   * 輪詢獲取 多個 比賽數據 10秒一次
   *
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData: EventData數組, Changes: EventChangeData 數組}
   * @param EventInfos        要輪詢的比賽，EventInfo數組(支持不同體育項目和 一般/優勝冠軍 賽事混查)
   * @param noMarkets         額外提供一個noMarkets參數，用來單純查詢event數據(只需要查詢球賽狀況，不用看投注)
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventsDetailPolling(onUpdateCallback, EventInfos = [], noMarkets= false, uniqueName = '') {
    const dataQuery = () => this.getEventsDetail(EventInfos, noMarkets, { uniqueName });
    return this._registerPolling('getEventsDetailPolling', {EventInfos, noMarkets}, dataQuery, onUpdateCallback, 10, uniqueName);
  }

  /**
   *
   * 聯賽搜尋，返回為SearchSportData數組
   *
   * @param keyword 關鍵字
   */
  async search(keyword) {
    if (!keyword || keyword.length <=0) {
      return [];
    }

    //檢查單個特殊符號
    if (keyword.length === 1) {
      const regex = /^[\~\!\@\#\$\%\^\&\*\(\)\-\_\+\=\{\}\[\]\|\\\:\;\"\'\<\,\>\.\?\/]$/gm;
      if (regex.exec(keyword) !== null) {
        return [];
      }
    }

    //加速:從緩存中優先獲取數據
    const cachedResultKey = 'search@' + keyword;
    const cachedResult = this._cacheGet(cachedResultKey , null);
    if (cachedResult) {
      return cachedResult;
    }

    let searchResult = await this._APIs.search(keyword);

    //大小寫不敏感
    const keywordUpper = keyword.toUpperCase();
    const keywordLower = keyword.toLowerCase();

    let sportDataMap = {};
    let leagueDataMap = {};
    //由數據生成 體育->聯賽->賽事
    if (searchResult && searchResult.Competitions && searchResult.Competitions.length > 0) {
      //因為查詢結果可能會返回不相關數據(可能時間也當關鍵字搜尋)，只保留名稱符合的
      let leagueDatas = []
      for(let l of searchResult.Competitions){
        const existInLeagueName = (l.CompetitionName.indexOf(keyword) >= 0) || (l.CompetitionName.indexOf(keywordUpper) >= 0) || (l.CompetitionName.indexOf(keywordLower) >= 0);
        let cloneLeagueData = JSON.parse(JSON.stringify(l));
        if (existInLeagueName) {
          leagueDatas.push(cloneLeagueData); //聯賽名稱符合 就直接使用
        } else {
          if (l.Events && l.Events.length > 0) {
            const matchedEvents = l.Events.filter(ev => {
              const names = [ev.HomeTeam, ev.AwayTeam];
              const matchNames = names.filter(n =>
                (n.indexOf(keyword) >= 0) || (n.indexOf(keywordUpper) >= 0) || (n.indexOf(keywordLower) >= 0)
              )
              return (matchNames && matchNames.length > 0);
            });
            cloneLeagueData.Events = matchedEvents;
            leagueDatas.push(cloneLeagueData);
          }
        }
      }

      //獲取體育名和排序，因為search的events沒有返回體育名稱，只能自己拿
      let sportInfoMap = {};
      const sportCountData = await this._APIs.getAllSportCount();
      if (sportCountData && sportCountData.SportCount && sportCountData.SportCount.length > 0){
        sportCountData.SportCount.map(scd => {
          const thisId = parseInt(scd.SportId);
          sportInfoMap[thisId] = { name: scd.SportName, order: scd.OrderNumber};
        })
      }

      for (const l of leagueDatas) {
        const thisSportId = parseInt(l.SportId);
        let thisSportData = sportDataMap[thisSportId];
        if (!thisSportData) {
          const thisSportInfo = sportInfoMap[thisSportId] ?? { name: 'not set', order: 99999 };
          thisSportData = new SearchSportData(thisSportId, thisSportInfo.name, thisSportInfo.order, []);
          sportDataMap[thisSportId] = thisSportData;
        }

        const thisLeagueId = l.CompetitionId;
        let thisLeagueData = leagueDataMap[thisLeagueId];
        if (!thisLeagueData) {
          thisLeagueData = new SearchLeagueData(thisLeagueId, l.CompetitionName, 0,thisSportId, []);
          leagueDataMap[thisLeagueId] = thisLeagueData;
          thisSportData.Leagues.push(thisLeagueData);
        }

        if (l.Events && l.Events.length > 0) {
          const eventDatas = l.Events.map(ev => {
            return new SearchEventData(
              ev.EventId, ev.EventDate,
              0, ev.HomeTeam, 0, ev.AwayTeam,
              thisSportId,thisLeagueId
            )
          })

          if (eventDatas && eventDatas.length > 0) {
            thisLeagueData.Events = eventDatas;
          }
        }
      }
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
      //sportDatas.map(spd => spd.Leagues.sort(compareDisplayOrder)) //排序聯賽  //IM沒提供聯賽排序順序，不排

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

    this._cacheSet(cachedResultKey,sportDatas, 3*60); //加速:緩存3分

    return sportDatas;
  }


  //獲取投注前(檢查)信息，返回為PollingResult格式，支持比對數據變化
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

    //後面有過濾，過濾完再取，會不正確  在這裡先存下
    const SelectionIds = Selections.map(item => item.SelectionId);

    let notOpenParlySelections = []; //先記錄起來，最後要返回
    let notEUSelections = [];
    if(wagerType === WagerType.COMBO) {
      //IM串關需要過濾未開放串關的投注選項
      notOpenParlySelections = Selections.filter(s => !s.IsOpenParlay);
      const openParlaySelections = Selections.filter(s => s.IsOpenParlay);
      Selections = openParlaySelections;

      //IM串關需要全部轉為歐洲盤
      const MemberType = this._getMemberType(); //水位
      const euSelections = Selections.map(sel => SelectionData.clone(sel, IMOddsType.EU, MemberType));
      //過濾掉沒有成功轉為歐洲盤的選項
      notEUSelections = euSelections.filter(s => s.OddsType !== IMOddsType.EU).map(s => {
        const copy = JSON.parse(JSON.stringify(s));
        copy.SelectionStatus = SelectionStatusType.EUODDSONLY; //設置為歐洲盤限定
        return SelectionData.clone(copy) //利用clone重新配置數據
      })
      Selections = euSelections.filter(s => s.OddsType === IMOddsType.EU); //換成歐洲盤
    }

    //過濾完之後可能Selections會沒數據
    let newData = null
    if (Selections && Selections.length > 0) {
      //轉成IM格式
      const IMSelectionInfos = Selections.map(item => item.toIMBetInfo());
      newData = await this._APIs.getBetInfo(wagerType, IMSelectionInfos)
        .then(jsonData => {
          let betSettings = jsonData.BetSetting.map(item => {
            return new BetSettingData(
              item.MinStakeAmount,
              item.MaxStakeAmount,
              item.EstimatedPayoutAmount,
              item.ComboSelection,
              item.NoOfCombination,
              'im',
            )
          });

          //過濾掉不認識的玩法(ComboTypeName為undefined)
          if (betSettings && betSettings.length > 0) {
            betSettings = betSettings.filter(bs => bs.ComboTypeName);
            if (wagerType === WagerType.COMBO) { //串關會返回單注的投注法，這邊用不到，去掉
              betSettings = betSettings.filter(item => item.ComboType != 0);
            }
          }

          let newSelections = [];
          if (!jsonData.WagerSelectionInfos || (Array.isArray(jsonData.WagerSelectionInfos) && jsonData.WagerSelectionInfos.length <= 0)) {
            //處理已結束比賽WagerSelectionInfos返回為空數組的問題
            //直接使用傳入的Selections參數去返回
            newSelections = Selections.map(item => {
              //設置為不可用
              const copy = JSON.parse(JSON.stringify(item));
              copy.SelectionStatus = SelectionStatusType.NOTAVIILABLE; //設置為不可用
              return SelectionData.clone(copy) //利用clone重新配置數據
            })
          } else {
            newSelections = Selections.map(sourceSelectionData => {
              //注意不能使用WagerSelectionId=SelectionId去判斷，api返回之後有可能會變，只能用EventId去對
              const targetWagerSelectionInfos = jsonData.WagerSelectionInfos.filter(wsi => sourceSelectionData.EventId == wsi.EventId);
              if (targetWagerSelectionInfos && targetWagerSelectionInfos.length > 0) {
                //有對應的返回數據
                let item = targetWagerSelectionInfos[0];
                if (parseInt(item.Market) === 0) {
                  item.Market = sourceSelectionData.MarketId;
                }

                const MarketName = VendorMarketNames[item.Market];

                const oddsDeciaml = Decimal.clone({rounding: 3}) //無條件捨去

                return new SelectionData(
                  item.WagerSelectionId ? item.WagerSelectionId : sourceSelectionData.SelectionId,
                  sourceSelectionData.IsOutRightEvent ? item.OutrightTeamId : item.BetTypeSelectionId,
                  sourceSelectionData.SelectionName,
                  sourceSelectionData.SelectionGroup,
                  sourceSelectionData.Handicap, //展示用
                  item.Handicap, //投注用
                  item.Specifiers,
                  item.SportId,
                  item.Market,
                  MarketName,
                  sourceSelectionData.LeagueId,
                  sourceSelectionData.LeagueName,
                  sourceSelectionData.HomeTeamId,
                  sourceSelectionData.HomeTeamName,
                  item.HomeScore,
                  sourceSelectionData.AwayTeamId,
                  sourceSelectionData.AwayTeamName,
                  item.AwayScore,
                  item.EventId,
                  sourceSelectionData.IsOpenParlay,
                  item.MarketlineId,
                  sourceSelectionData.BetTypeId,
                  sourceSelectionData.BetTypeName,
                  sourceSelectionData.PeriodId,
                  sourceSelectionData.PeriodName,
                  sourceSelectionData.TargetTeamId,
                  sourceSelectionData.TargetTeamName,
                  sourceSelectionData.IsOutRightEvent,
                  sourceSelectionData.OutRightEventName,
                  item.Odds,
                  item.OddsType,
                  sourceSelectionData.OddsList.map(oddsItem => {
                    return new OddsData(
                      oddsItem.OddsType,
                      oddsItem.OddsValues,
                    )
                  }),
                  new oddsDeciaml(item.Odds).toFixed(2),
                  sourceSelectionData.SelectionIsLocked,
                  item.MarketlineStatusId,
                  item.Status === 381 ? 100 : item.Status, //當作賠率沒有變化，反正投注的時候還會檢查
                )
              } else {
                //找不到就直接複製，然後設置為不可用
                const copy = JSON.parse(JSON.stringify(sourceSelectionData));
                copy.SelectionStatus = SelectionStatusType.NOTAVIILABLE; //設置為不可用
                return SelectionData.clone(copy) //利用clone重新配置數據
              }
            })
          }

          //IM串關 補回之前過濾掉的投注選項(不支持串關+不是歐洲盤)
          if (wagerType === WagerType.COMBO) {
            if (notOpenParlySelections && notOpenParlySelections.length > 0) {
              newSelections = newSelections.concat(notOpenParlySelections);
            }
            if (notEUSelections && notEUSelections.length > 0) {
              newSelections = newSelections.concat(notEUSelections);
            }
          }

          return BetInfoData.createFromIMSource(
            betSettings.length > 0 ? betSettings : null, //考慮statusCode = 350 會返回空的betSetting
            newSelections,
          )
        });

    } else {
      //Selections為空  不用查  直接返回

      let newSelections = [];
      //IM串關 補回之前過濾掉的投注選項(不支持串關+不是歐洲盤)
      if (wagerType === WagerType.COMBO) {
        if (notOpenParlySelections && notOpenParlySelections.length > 0) {
          newSelections = newSelections.concat(notOpenParlySelections);
        }
        if (notEUSelections && notEUSelections.length > 0) {
          newSelections = newSelections.concat(notEUSelections);
        }
      }

      newData = BetInfoData.createFromIMSource(
        null,
        newSelections,
      )
    }

    //注意這裡拿到的newData的BetSettings和Selections都是數組型態

    //處理 可用投注方式(betSetting) 為空 的問題(只有單注需要如此處理，串關 直接不展示串關方式就行 )
    if(wagerType === WagerType.SINGLE && !newData.BetSettings) {
      newData.Selections = newData.Selections.map(item => {
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

    //語法糖支持：單注返回單個Object，串關才返回數組
    if (wagerType === WagerType.SINGLE) {
      newData = new BetInfoData(
        (newData.BetSettings && newData.BetSettings.length >0) ? newData.BetSettings[0] : null,
        null,
        (newData.Selections && newData.Selections.length >0) ? newData.Selections[0] : null,
      )
    }

    //比對新舊差異
    const deltaKey = this._getDeltaKey('getBetInfo', {wagerType, SelectionIds});
    const oldData = this._APIDeltas[deltaKey];
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
    this._APIDeltas[deltaKey] = newData;

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

  //輪詢 滾球注單狀態 緩存，目前只拿來記錄重試次數
  _getWagerStatusCache = {}

  //輪詢 滾球注單狀態
  async _getWagerStatusPolling(wagerId, testFuncs = [], maxRetryCount = 30, uniqueName = ''){
    const thisCacheKey = wagerId + uniqueName;
    this._getWagerStatusCache[thisCacheKey] = {retryCount:0};
    return new Promise(resolve => {
      const query = () => {
        this._APIs.getPendingWagerStatus([wagerId])
          .then(async jsonData => {
            if (jsonData.StatusCode === 370) { //接口返回找不到注單
              //改查詢未結算注單
              const betListJsonData = await this._APIs.getBetList([IMWagerStatus.PENDING,IMWagerStatus.CONFIRMED,IMWagerStatus.REJECTED,IMWagerStatus.CANCELLED])
              if (betListJsonData.WagerList && betListJsonData.WagerList.length > 0) {
                const targets = betListJsonData.WagerList.filter(w => w.WagerId === wagerId)
                if (targets && targets.length > 0 ) {
                  const target = targets[0];
                  for(let testf of testFuncs) {
                    if (testf.func(target)) {
                      delete this._getWagerStatusCache[thisCacheKey]
                      console.log('_getWagerStatusPolling', testf.status , jsonData)
                      return resolve({status:testf.status, data: target}); //成功
                    }
                  }
                }
              }
            }
            if (jsonData.PendingWagerStatusList && jsonData.PendingWagerStatusList.length > 0) {
              const targets = jsonData.PendingWagerStatusList.filter(item => item.WagerID === wagerId);
              if (targets && targets.length > 0) {
                const target = targets[0];
                for(let testf of testFuncs) {
                  if (testf.func(target)) {
                    delete this._getWagerStatusCache[thisCacheKey]
                    console.log('_getWagerStatusPolling', testf.status , jsonData)
                    return resolve({status:testf.status, data: target}); //成功
                  }
                }
              }
            }
            if (this._getWagerStatusCache[thisCacheKey].retryCount < maxRetryCount) {
              this._getWagerStatusCache[thisCacheKey].retryCount = this._getWagerStatusCache[thisCacheKey].retryCount +1;
              console.log('_getWagerStatusPolling', 'RETRY', this._getWagerStatusCache[thisCacheKey] , jsonData)
              setTimeout(query, 1000); //建議一秒一次
            } else {
              delete this._getWagerStatusCache[thisCacheKey]
              console.log('_getWagerStatusCache', 'EXPIRE' , jsonData)
              return resolve({status:'EXPIRE',  data: jsonData}); //超時
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
   */
  async placeBet(wagerType = WagerType.SINGLE, betInfoData, betAmount, comboType = 0,forceAcceptAnyOdds = false) {
    //語法糖支持：單注改為數組
    let selections = betInfoData.Selections;
    if (wagerType === WagerType.SINGLE && !Array.isArray(selections)) {
      selections = [selections];
    }
    //檢查單注
    if (wagerType === WagerType.SINGLE && selections.length !== 1) {
      throw new VendorError(VendorErrorType.DATA_Error,null, { info: 'single bet but multi selection?'});
    }

    //檢查串關類型(ComboType)，必須從BetInfoData裡面的BetSettingData/SystemParlayBetSettings數組 選擇一個
    if(wagerType === WagerType.COMBO) {
      const selectedBetSettings = betInfoData.BetSettings.filter(item => item.ComboType === comboType);
      const selectedSystemBetSettings = betInfoData.SystemParlayBetSettings.filter(item => item.ComboType === comboType);
      if (selectedBetSettings.length <=0 && selectedSystemBetSettings.length <=0) {
        throw new VendorError(VendorErrorType.DATA_Error,null, { info: 'comboType incorrect'});
      }

      //selections需要過濾 只留下 支持串關 和 狀態正常的選項
      selections = betInfoData.getSelectionsForCombo();
    }

    //轉成IM格式
    const IMWagerSelections = selections.map(item => item.toIMWager());
    const IMComboSelections = [{ComboSelection: comboType, StakeAmount: betAmount}];

    const alwaysAcceptBetterOdds = this.getMemberSetting().alwaysAcceptBetterOdds;

    //兩種配置 接受全部變化(false) 跟 只接受賠率上升(true)
    let isAcceptAnyOdds = !alwaysAcceptBetterOdds;
    //強制接受賠率變更
    if (forceAcceptAnyOdds) {
      isAcceptAnyOdds = true;
    }

    //日志用
    const postJSON = { WagerType:wagerType, WagerSelectionInfos: IMWagerSelections, ComboSelections:IMComboSelections, IsComboAcceptAnyOdds:isAcceptAnyOdds};

    return this._APIs.placeBet(wagerType, IMWagerSelections, IMComboSelections, isAcceptAnyOdds)
      .then(async jsonData => {
        //不管是不是串關，都只會有一個WagerSelectionInfos返回
        const wagerSelectionInfo = jsonData.WagerSelectionInfos[0];

        // 加速投注：移除pending等待
        // //處理pending,需要等待成單或拒絕
        // if (wagerSelectionInfo && (wagerSelectionInfo.BetConfirmationStatus === 1)) {
        //   const betResult = await this._getWagerStatusPolling(wagerSelectionInfo.WagerId,
        //     [
        //       { status:'OK' ,func: (data) => data.BetConfirmationStatus === 2}, //確認
        //       { status:'REJECT', func: (data) => data.BetConfirmationStatus === 3}, //拒絕
        //       { status:'CANCEL', func: (data) => data.BetConfirmationStatus === 4}, //取消
        //     ],60
        //   );
        //
        //   if (betResult.status === 'OK') {
        //     wagerSelectionInfo.BetConfirmationStatus = 2; //狀態改為確認
        //   } else if (betResult.status === 'EXPIRE') { //特別處理超時
        //     throw new VendorError(VendorErrorType.BET_Place_Expire, null, {info: betResult})
        //   } else {
        //     throw new VendorError(VendorErrorType.BET_Place_Error, null, {info: betResult})
        //   }
        // }

        const isPending = wagerSelectionInfo && (wagerSelectionInfo.BetConfirmationStatus === 1);
        let pendingQueryId = null;
        if (isPending) {
          pendingQueryId = wagerSelectionInfo.WagerId;
        }

        return new BetResultData(
          jsonData.AvailableBalance,
          wagerSelectionInfo.WagerId,
          wagerSelectionInfo.BetConfirmationStatus,
          parseInt(wagerSelectionInfo.BetStatusMessage),
          isPending,
          pendingQueryId,
          wagerSelectionInfo.ComboSelectionId,
          wagerSelectionInfo.EstimatedPayoutFullAmount,
          jsonData.AcceptedWagerSelectionList.map(item => {
            return new BetSelectionResultData(
              item.EventId,
              item.StakeOdds,
              item.BetTypeSelectionId,
            )
          }),
          JSON.stringify({ request: postJSON, response:jsonData }),
        )
      });
  }

  /**
   * 查詢pending bet 的投注結果
   *
   * @param pendingQueryId
   */
  async queryPendingBetStatus(pendingQueryId) {

    const betResult = await this._getWagerStatusPolling(pendingQueryId,
      [
        { status:'OK' ,func: (data) => data.BetConfirmationStatus === 2}, //確認
        { status:'REJECT', func: (data) => data.BetConfirmationStatus === 3}, //拒絕
        { status:'CANCEL', func: (data) => data.BetConfirmationStatus === 4}, //取消
      ],60
    );

    if (betResult.status === 'EXPIRE') { //特別處理超時
      return new BetStatusData(
        betResult.status === 'OK',
        pendingQueryId,
        1, //超時當作待確認
      )
    } else {
      return new BetStatusData(
        betResult.status === 'OK',
        pendingQueryId,
        betResult.data.BetConfirmationStatus,
      )
    }
  }

  /**
   * 查詢未結算注單，返回為WagerData數組
   */
  getUnsettleWagers(){
    return this._APIs.getBetList()
      .then(async jsonData => {
        let wagerDatas = jsonData.WagerList.map(item => {
          return WagerData.createFromIMSource(item);
        })

        if (wagerDatas && wagerDatas.length > 0) {
          let EventIdMap = {};
          //按sportId: [leagueId] 去分組
          let groupedQueryParams = {};
          wagerDatas.map(item => {
            if (item.WagerItems && item.WagerItems.length > 0) {
              item.WagerItems.map(ii => {
                if (!groupedQueryParams[ii.SportId]) {
                  groupedQueryParams[ii.SportId] = [];
                }
                if (groupedQueryParams[ii.SportId].indexOf(ii.LeagueId) === -1) {
                  groupedQueryParams[ii.SportId].push(ii.LeagueId);
                }
                if (!EventIdMap[ii.EventId]) {
                  EventIdMap[ii.EventId] = true;
                }
              })
            }
          })

          let prs = [];
          for(let sid in groupedQueryParams) {
            const lids = groupedQueryParams[sid];
            const pr = this._APIs.getLiveResults(sid,lids) //查詢現場賽果
            prs.push(pr);
          }

          await Promise.all(prs).then(resultArray => {
            let matchedResults = {};
            resultArray.map(jsonData => {
              const lresults = jsonData.LiveResults;
              if (lresults && lresults.length>0) {
                lresults.map(item => {
                  //只取有用到的比賽數據
                  if (EventIdMap[item.EventId]) {

                    //處理滾球時間(從eventData抄來的)
                    let rbMinute = '';
                    let rbPeriod = '';
                    if (item.RBTime) {
                      //有空白 表示為 1H 12:34 這種格式
                      const blankIndex = item.RBTime.indexOf(' ');
                      if (blankIndex !== -1) {
                        const toIndex = item.RBTime.indexOf(':');
                        if (toIndex !== -1) {
                          const minuteLength = toIndex - blankIndex - 1;
                          if (blankIndex >= 0 && minuteLength > 0) {
                            rbMinute = item.RBTime.substr(blankIndex + 1, minuteLength);
                          }
                        } else { //沒有帶秒數的，直接切分鐘
                          if (blankIndex >= 0) {
                            rbMinute = item.RBTime.substr(blankIndex + 1);
                          }
                        }
                        if (blankIndex >= 0) {
                          rbPeriod = item.RBTime.substr(0, blankIndex);
                        }
                      } else if(item.RBTime.length === 2) {
                        rbPeriod = item.RBTime;
                      }

                      if (rbPeriod && rbPeriod.length > 0) {
                        const rbname = IMRBPeriodNames[rbPeriod];  //中文名
                        if (rbname) {
                          rbPeriod = rbname;  //有對到才用中文名，沒對到 就直接用原本的字
                        }
                      }
                    }

                    matchedResults[item.EventId] = {
                      RBMinute:rbMinute,
                      RBPeriodName:rbPeriod,
                      RBHomeScore:item.HomeScore,
                      RBAwayScore:item.AwayScore
                    };
                  }
                })
              }
            })

            if (JSON.stringify(matchedResults) != '{}') {

              //console.log('====matchedResults',matchedResults);

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
          });

        }
        return wagerDatas;
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
    const postJSON = { WagerId:wagerData.WagerId, BuyBackPricing:wagerData.CashOutPrice, PricingId:wagerData.CashOutPriceId }

    return this._APIs.submitBuyBack(wagerData.WagerId, wagerData.CashOutPrice, wagerData.CashOutPriceId)
      .then(jsonData => {
        //更新結果
        cloneWagerData.CashOutStatus = (jsonData.PricingId && jsonData.BuyBackPricing) ? CashOutStatusType.DONE : CashOutStatusType.FAIL;
        if (cloneWagerData.CashOutStatus == CashOutStatusType.DONE) {
          cloneWagerData.CashOutAmount = jsonData.BuyBackPricing;
        }
        return new CashOutResultData(
          cloneWagerData,
          false, //IM不會有pending
          null,
          JSON.stringify({ request: postJSON, response:jsonData }),
          )
      })
      .catch(async error => {
        if (typeof error === 'object' && error.isVendorError === true) {
          //特別處理新價格 IM是價格過期(error code:367)
          if (error.ErrorType === VendorErrorType.CASHOUT_NEWPRICE) {

            //日誌用
            let newPriceJSON = null;

            //查詢提前兌現delta 獲取新價格
            const newPriceInfo = await this._APIs.getDeltaBetTrade([cloneWagerData.WagerId])
              .then(jsonData => {
                //日誌用
                newPriceJSON = JSON.parse(JSON.stringify(jsonData));
                //注意這個數據結構和文件寫的不一樣
                //實際Value是在DeltaChanges[]裡面，而且是一個json string，需要額外處理parse
                if (jsonData && jsonData.DeltaChanges && jsonData.DeltaChanges[0] && jsonData.DeltaChanges[0].Value) {
                  const srcData = jsonData.DeltaChanges[0].Value
                  let thisData = srcData;
                  if (typeof thisData === 'string') {
                    thisData = JSON.parse(srcData);
                  }
                  //檢查新價格
                  if (
                    //新價格狀態 數據要對
                    thisData.BetTradeStatus == CashOutStatusType.NOTYET
                    && thisData.CanSell
                    && thisData.PricingId
                    && thisData.BuyBackPricing
                    //新價格要有變化，沒變化直接返回空，視為失敗
                    && thisData.PricingId != cloneWagerData.CashOutPriceId
                    && thisData.BuyBackPricing != cloneWagerData.CashOutPrice
                  ) {
                    return {
                      PricingId: thisData.PricingId,
                      BuyBackPricing: thisData.BuyBackPricing,
                    }
                  } else {
                    return null;
                  }
                }
              })
              .catch(error => {
                //只是避免往外丟出錯誤
                return null;
              })

            if (newPriceInfo) {
              //更新價格
              cloneWagerData.CashOutStatus = CashOutStatusType.NEWPRICE;
              cloneWagerData.CashOutPriceId = newPriceInfo.PricingId;
              cloneWagerData.CashOutPrice = newPriceInfo.BuyBackPricing;
            } else {
              //沒有獲取到新價格 就視為失敗
              cloneWagerData.CashOutStatus = CashOutStatusType.FAIL;
            }
            return new CashOutResultData(
              cloneWagerData,
              false, //IM不會有pending
              null,
              JSON.stringify({ request: postJSON, response: {newPrice: newPriceJSON} }),
            )
          }
        }
        //所有其他錯誤直接視為失敗
        cloneWagerData.CashOutStatus = CashOutStatusType.FAIL;
        return new CashOutResultData(
          cloneWagerData,
          false, //IM不會有pending
          null,
          JSON.stringify({ request: postJSON, response: {error: error} }),
        )
      })
  }

  /**
   * 提交 提前兌現 拒絕新價格
   * @param wagerData 要拒絕提前兌現的投注，WagerData格式
   */
  async cashOutDeclineNewOffer(wagerData) {
    return true; //IM不用實現這個
  }

  /**
   * 查詢已結算注單，返回為WagerData數組
   * IM用的是投注時間
   *
   * @param StartDate 開始日期 YYYY-MM-DD 格式 默認今天
   * @param EndDate  結束日期 YYYY-MM-DD 格式 默認今天
   * @param WagerSortWay
   */
  getSettledWagers(StartDate = moment().format('YYYY-MM-DD'), EndDate = moment().format('YYYY-MM-DD'), WagerSortWay = IMWagerSortWay.BETDATE){
    //im注單需要轉為-4時間去查詢
    const startDateWithTZ = moment(StartDate + ' 00:00:00').utcOffset(-4);
    const endDateWithTZ = moment(EndDate + ' 23:59:59').utcOffset(-4);

    return this._APIs.getStatement(
      startDateWithTZ.format('YYYY-MM-DD'),endDateWithTZ.format('YYYY-MM-DD')
      ,startDateWithTZ.format('HH:mm:ss'),endDateWithTZ.format('HH:mm:ss')
      ,WagerSortWay
    )
      .then(jsonData => {
        return jsonData.WagerList.map(item => {
          return WagerData.createFromIMSource(item);
        })
      })
  }

  //獲取用戶配置
  getMemberSetting() {
    let result = super.getMemberSetting();

    //把oddsType轉為IM格式
    result.oddsType = IMOddsType[result.oddsType];

    //debug
    // result.oddsType = IMOddsType.EU;

    return result;
  }

  /**
   * 獲取供應商公告
   */
  getAnnouncements() {
    return this._APIs.getAnnouncement()
      .then(jsonData => {
        //考慮沒有數據的情況，返回空數組
        if (!jsonData.Announcement || jsonData.Announcement.length <= 0) {
          return [];
        }

        return jsonData.Announcement.map(item=> {

          const postingDate = moment(item.PostingDate).utcOffset(VendorConfigs.TIMEZONE).format('YYYY/MM/DD HH:mm');

          return new AnnouncementData(
            item.AnnouncementId,
            item.AnnouncementDetail[0].Content,
            postingDate,
            {PostingDate:item.PostingDate, ExpiryDate: item.ExpiryDate, UpdateDate: item.DateUpdated}
          );
        });
      });
  }

  //判斷是否波膽Line
  isCorrectScoreLine(lineData) {
    return (parseInt(lineData.BetTypeId) === IMBetType.CORRECTSCORE)
  }

  //判斷是否[全場]波膽Line
  isFTCorrectScoreLine(lineData) {
    return this.isCorrectScoreLine(lineData) && (parseInt(lineData.PeriodId) === 1)
  }

  //從LineData獲取 波膽投注分類數據 分 主 和 客 三條
  splitCorrectScoreSelectionsFromLine(lineData) {
    if (!lineData || !lineData.Selections || lineData.Selections.length <=0) {
      return null;
    }

    const seprator = '-';
    //按 比分 分組
    let homes = [];
    let homeNumbers = {};
    let ties = [];
    let tieNumbers = {};
    let aways = [];
    let awayNumbers = {};
    let other = null;
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
      } else if (sel.SelectionName && sel.SelectionName.indexOf(i18n.IM.CORRECT_SCORE_OTHER_FILTER) !== -1) {
        other = sel;
      }
    })

    //檢查數量，沒給夠要補滿
    const FakeLockedSelection = {EventId: lineData.EventId, LineId: lineData.LineId, SelectionId: 0, SelectionIsLocked: true}
    const numberArr = [];
    for(let p = 0;p<=maxPoint;p++) {
      numberArr.push(p);
    }
    const pN_2 = this._permutation(numberArr,2); //用排列獲取波膽 主客 組合
    if ((homes.length + aways.length) < pN_2.length ) {
      //主客需要補
      pN_2.map(nums => {
        const leftP = nums[0];
        const rightP = nums[1];
        const targetSelectionName = leftP + seprator + rightP;
        if (leftP > rightP && !homeNumbers[targetSelectionName]) {
          //給一個假的Selection，用來展示 鎖定
          homes.push(Object.assign({},FakeLockedSelection,{SelectionName: targetSelectionName}));
        } else if (rightP > leftP && !awayNumbers[targetSelectionName]) {
          //給一個假的Selection，用來展示 鎖定，注意客場需要提供反向的SelectionNameForSort
          aways.push(Object.assign({},FakeLockedSelection,{SelectionName: targetSelectionName, SelectionNameForSort: rightP + seprator + leftP}));
        }
      })
    }
    if (ties.length < maxPoint+1) {
      //和需要補
      numberArr.map(num => {
        const targetSelectionName = num + seprator + num;
        if (!tieNumbers[targetSelectionName]) {
          //給一個假的Selection，用來展示 鎖定
          ties.push(Object.assign({},FakeLockedSelection,{SelectionName: targetSelectionName}));
        }
      })
    }

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
    let r =  (this.WCP2022Settings.LeagueIds.indexOf(eventData.LeagueId) !== -1);
    console.log('====isWCP2022Event',eventData.LeagueId,r)
    return r;
  }
}

const vendorIMSingleton = new VendorIM();
if (typeof window !== "undefined") {
  window.VendorIMInstance = vendorIMSingleton;
}

export default vendorIMSingleton;

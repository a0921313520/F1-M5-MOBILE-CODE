import HostConfig from '../vendorHostConfig';
import {SortWays, VendorMarketNames, VendorMarkets} from "./VendorConsts";
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import md5 from "crypto-js/md5";
import {vendorStorage} from "../vendorStorage";
import {timeout_fetch, fetchRequestSBNew} from "../../SportRequest";
import { defaultMemberSetting, vendorLangSettings } from "../vendorSetting";
import EventData from "./EventData";
import PollingResult from "./PollingResult";
import SportData from "./SportData";
import MarketData from "./MarketData";
import promiseWithTimeout from "./promiseWithTimeout";
import { ApiPort } from '../../SPORTAPI';
import { getSbToken, getValueFromQueryString} from "../../js/util";
import { IMBetType, IMSports } from "../im/IMConsts";

/**
 * Vendor共用父類
 */
export default class VendorBase {
  constructor (configs) {
    this.configs = Object.assign(this.configs,configs);
  }

  configs = {
    MaxParlay: 10, //串關最多選幾個
    VendorName: 'NOTSET', //供應商名稱
    VendorPage: 'NOTSET', //主頁鏈接
    EventIdType: 'NOTSET', //EventId數據形態: int/string
    HasLeagueIcon: false, //是否有聯賽Icon
    HasTeamIcon: false, //是否有隊伍Icon
    HasCashOut: false, //是否支持提前兌現
  }

  isGameLocked = false; //保留字段，遊戲鎖定
  loginPromise = null; //登入的Promise

  WCP2022Settings = {}; //世界杯2022配置

  _getLoginInfo(){
    throw '_getLoginInfo needs implement!!!';
  }

  //子查詢，一起清除(for bti 關注輪詢＋一般賽事推送 的情況)
  _childPollingMap = {}

  /**
   * 刪除輪詢，在componentWillUnmount時調用，避免堆積太多無用輪詢
   *
   * @param key
   */
  deletePolling(key) {
    //console.log('===deletePolling',key);
    if (key && typeof key === 'object' && Object.keys(key).length === 2) {
      return this._unsubscribeGlobalPolling(key);
    }

    const childPolling = this._childPollingMap[key];
    if (childPolling) {
      this.deletePolling(childPolling); //刪除輪詢
      delete this._childPollingMap[key]; //移除關聯
    }

    //處理輪詢
    const pollingCacheInfo = this._PollingCache[key];
    //停止輪詢
    if (pollingCacheInfo && pollingCacheInfo.handle) {
      clearTimeout(pollingCacheInfo.handle);
    }
    //刪除數據
    if (pollingCacheInfo) {
      delete this._PollingCache[key];
    }
  }

  //輪詢數據緩存
  _PollingCache = {}
  //輪詢共用函數
  _registerPolling(dataName, queryParams, queryFunction, onUpdateCallback, intervalSeconds = 10, uniqueName = '', useResultCache = false, resultCacheExpireSeconds=9*60, preCacheFunction = null) {
    //console.log(this.configs.VendorName,'===registerPolling===',dataName,JSON.stringify(queryParams))
    //加速:從緩存中優先獲取數據
    let cachedResultKey;
    let usedCachedResult = false; //是否使用緩存數據加速
    // preCacheFunction = null
    console.log('useResultCache ',useResultCache)
    if (useResultCache) {
      cachedResultKey = dataName + '_' + uniqueName + '_' + md5(JSON.stringify(queryParams));
      const cachedResult = this._cacheGet(cachedResultKey, null);
      if (cachedResult) {
        //console.log(this.configs.VendorName,'===use Cached data for _registerPolling:',cachedResultKey,JSON.parse(JSON.stringify(queryParams)));
        //回調通知數據更新
        if (onUpdateCallback) {
          try {
            onUpdateCallback(cachedResult);
          } catch (e) {
            console.log('Polling onUpdateCallback error', e);
          }
        }
        usedCachedResult = true;
      } else {
        //console.log(this.configs.VendorName,'===DO NOT HAVE Cached data for _registerPolling:',cachedResultKey,JSON.parse(JSON.stringify(queryParams)));
      }
    }

    const cacheKey =  dataName + '_' + uniqueName;

    let cacheInfo = this._PollingCache[cacheKey];
    if (cacheInfo) {
      //有舊的

      //先停止輪詢
      if (cacheInfo && cacheInfo.handle) {
        clearTimeout(cacheInfo.handle);
      }

      //清理緩存數據
      delete this._PollingCache[cacheKey];
    }

    //重新初始化配置
    //配置一個唯一key，用於輪詢取代後，判斷是新的還是舊的輪詢
    const uniqueid = moment().format('YYYYMMDDHHmmssSSS') + uuidv4();
    //console.log('===Polling uniqueid',uniqueid)
    this._PollingCache[cacheKey] = { handle: null, params: null, uniqueid};
    cacheInfo = this._PollingCache[cacheKey];

    //檢查interval數值
    intervalSeconds = parseInt(intervalSeconds);
    if (!intervalSeconds || isNaN(intervalSeconds) || intervalSeconds<=0) {
      intervalSeconds = 15;
    }

    //用async包裹，因為需要使用到await 按順序執行
    (async () => {
      //沒有緩存數據，才利用preCacheFunction去獲取初始數據
      if (!usedCachedResult && preCacheFunction) {
        const data = await timeout_fetch(preCacheFunction(),2000).catch(e => {}); //初始數據兩秒必須返回 超過放棄
        //檢查輪詢是否還存在，可能剛好在異步查詢完成之後就被刪除了
        if (this._PollingCache[cacheKey] && this._PollingCache[cacheKey].uniqueid === uniqueid) { //輪詢存在 才繼續回調
          if (data && onUpdateCallback) {
            if (useResultCache) {
              //console.log(this.configs.VendorName,'===polling set Cached data from preCacheFunction for ',cachedResultKey, JSON.parse(JSON.stringify(queryParams)));
              this._cacheSet(cachedResultKey, data, resultCacheExpireSeconds); //加速:緩存
            } else {
              //console.log(this.configs.VendorName,'===polling DO NOT set Cached from preCacheFunction data for ',cachedResultKey, JSON.parse(JSON.stringify(queryParams)));
            }

            try {
              onUpdateCallback(data);
            } catch (e) {
              console.log('Polling onUpdateCallback from precache error',this.configs.VendorName, e);
            }
            await new Promise(r => setTimeout(r, 1000)); //停一下，讓前端優先render
          }
        } else {
          console.log('abort polling onUpdateCallback from precache due to the polling has been deleted',this.configs.VendorName,cacheKey);
        }
      }

      //配置輪詢函數
      const queryAndCallback = (thisUniqueId) => {
        //console.log(this.configs.VendorName,'===queryFunction===',dataName,thisUniqueId,JSON.stringify(queryParams))
        queryFunction().then(data => {
          //檢查輪詢是否還存在，可能剛好在異步查詢完成之後就被刪除了
          if (this._PollingCache[cacheKey] && this._PollingCache[cacheKey].uniqueid === thisUniqueId) { //輪詢存在 才繼續回調
            if (useResultCache) {
              //console.log(this.configs.VendorName,'===polling set Cached data for ',cachedResultKey, JSON.parse(JSON.stringify(queryParams)));
              this._cacheSet(cachedResultKey, data, resultCacheExpireSeconds); //加速:緩存
            } else {
              //console.log(this.configs.VendorName,'===polling DO NOT set Cached data for ',cachedResultKey, JSON.parse(JSON.stringify(queryParams)));
            }

            if (onUpdateCallback) {
              try {
                onUpdateCallback(data);
              } catch (e) {
                console.log('Polling onUpdateCallback error',this.configs.VendorName, e);
              }
            }
          } else {
            console.log('abort polling onUpdateCallback due to the polling has been deleted',this.configs.VendorName,cacheKey);
          }
        }).catch(e => {console.log('polling has error',cacheKey, e )})
          .finally(() => {
          if (this._PollingCache[cacheKey] && this._PollingCache[cacheKey].uniqueid === thisUniqueId) { //輪詢存在 才繼續回調
            //console.log('register next polling setTimeout',this.configs.VendorName,cacheKey);
            //使用setTimeout而不是interval，這樣可以避免- 查詢返回很慢，造成輪詢堆積的問題
            this._PollingCache[cacheKey].handle = setTimeout(() => {
              queryAndCallback(thisUniqueId)
            }, intervalSeconds * 1000);
          } else {
            console.log('abort polling setTimeout due to the polling has been deleted',this.configs.VendorName,cacheKey);
          }
        });
      };

      //紀錄查詢參數
      cacheInfo.params = queryParams;

      //先調用一次獲取數據，並開始輪詢
      queryAndCallback(uniqueid);
    })();

    return cacheKey; //返回key
  }

  _getFavouriteStorageKey(type = 'EVENTS') {
    const loginInfo = this._getLoginInfo();
    let memberCode = '';
    if (loginInfo) {
      memberCode = loginInfo.memberCode;
    }
    return 'FAV-' + memberCode + '-' + this.configs.VendorName + '-' + type;
  }

  _cleanFavouriteEventTimeoutHandler = null;

  /**
   * 添加收藏賽事
   *
   * @param EventId
   */
  async addFavouriteEvent(eventData) {
    const key = this._getFavouriteStorageKey();
    const savedFavEvents = await this.getFavouriteEvents(key);
    let SportId = parseInt(eventData.SportId);//固定轉為int
    let EventId = eventData.EventId
    let IsOutRightEvent = eventData.IsOutRightEvent;
    if (this.configs.EventIdType === 'string') {
      EventId = EventId + '';//固定轉為string
    }
    if (this.configs.EventIdType === 'int') {
      EventId = parseInt(EventId);//固定轉為int
    }
    //去除已經有的數據
    let favEvents = savedFavEvents.filter(item => item.EventId !== EventId)

    //世界杯2022特殊處理，判斷是否為世界杯比賽
    const IsWCP2022Event = this.isWCP2022Event(eventData);

    //添加
    favEvents.push({EventId,SportId,IsOutRightEvent,IsWCP2022Event});
    await vendorStorage.setItemAsync(key, JSON.stringify(favEvents));

    //配置過期清理
    if (!this._cleanFavouriteEventTimeoutHandler) {
      const doClean = async () => {
        const key = this._getFavouriteStorageKey();
        const currentFavEvents = await this.getFavouriteEvents(key);

        let pr = await this.getEventsDetail(currentFavEvents);
        const thisEvents = pr.NewData;
        let existEventIds = [];
        if (thisEvents && thisEvents.length >0) {
          existEventIds = thisEvents.map(e => e.EventId);
        }
        const notExistEventIds = currentFavEvents.filter(e => existEventIds.indexOf(e.EventId) === -1).map(e => e.EventId);
        //console.log('===need clean fav events',notExistEventIds);

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

        const currentFavEvents3 = await this.getFavouriteEvents(key);

        if (currentFavEvents3.length > 0) {
          this._cleanFavouriteEventTimeoutHandler = setTimeout(doClean,10*60*1000); //10分檢查一次
        } else {
          clearTimeout(this._cleanFavouriteEventTimeoutHandler);
          this._cleanFavouriteEventTimeoutHandler = null;
        }
      }

      this._cleanFavouriteEventTimeoutHandler = setTimeout(doClean,10*60*1000); //10分檢查一次
    }
  }

  /**
   * 刪除收藏賽事
   *
   * @param EventId 支持數組型態
   */
  async removeFavouriteEvent(EventId) {
    const key = this._getFavouriteStorageKey();
    const savedFavEvents = await this.getFavouriteEvents(key);

    //強制轉array
    let EventIdArr = EventId;
    if (!Array.isArray(EventId)) {
      EventIdArr = [EventId];
    }

    let removeEventIdArr = EventIdArr.map(eid => {
      let convertedEventId = eid;
      if (this.configs.EventIdType === 'string') {
        convertedEventId = eid + '';//固定轉為string
      }
      if (this.configs.EventIdType === 'int') {
        convertedEventId = parseInt(eid);//固定轉為int
      }
      return convertedEventId;
    })

    let favEvents = savedFavEvents.filter(item => removeEventIdArr.indexOf(item.EventId) === -1);
    const isChanged = (savedFavEvents.length !== favEvents.length);

    //console.log('===remove fav event',removeEventIdArr,isChanged);

    if (isChanged) {
      await vendorStorage.setItemAsync(key, JSON.stringify(favEvents));
    }
    return isChanged;
  }

  /**
   * 獲取收藏賽事
   *
   * @param key
   * @returns {*[]|any}
   */
  async getFavouriteEvents(key = null) {
    if (key === null) {
      key = this._getFavouriteStorageKey();
    }
    if (typeof window !== 'undefined') {
      const jsonString = await vendorStorage.getItemAsync(key);
      if (jsonString) {
        const jsonData = JSON.parse(jsonString);
        if (jsonData) {
          return jsonData;
        }
      }
    }
    return [];
  }

  //獲取用戶配置
  getMemberSetting() {
    const loginInfo = this._getLoginInfo();
    let memberCode = '';
    if (loginInfo) {
      memberCode = loginInfo.memberCode;
    }

    const defaultSetting = defaultMemberSetting;
    let result = Object.assign({},defaultSetting); //要做新的Object 後面轉換成通用OddsType會改到

    //從緩存獲取
    if (typeof window !== 'undefined') {
      const jsonString = vendorStorage.getItem('NotificationSetting-' + memberCode)
      if (jsonString) {
        const jsonData = JSON.parse(jsonString);
        if (jsonData) {
          result = Object.assign({},defaultSetting,jsonData);
        }
      }
    }

    return result;
  }

  /**
   * 根據體育項目獲取，最多8個，返回為 EventData數組
   *
   * @param sportId 體育id
   * @param NEventCount 要返回前幾個比賽 默認8
   * @returns {Promise<*[]|*>}
   */
  async getBannerData(sportId, NEventCount = 8 ) {
    //足球 直接從api緩存服務 獲取數據
    if (!this.isAPIServer() //只有在客戶端 才從API服務器獲取
      && parseInt(sportId) === 1 //足球才支持調用api服務器
    ) {
      const vendorNameLower = this.configs.VendorName.toLowerCase();
      const eventDatas = await fetch(HostConfig.Config.CacheApi + '/appbanners/' + vendorNameLower +'/')
        .then(response => response.json())
        .then(jsonData => {
          let events = [];
          if (jsonData && jsonData.data && jsonData.data.length > 0) {
            events = jsonData.data.map(ev => EventData.clone(ev)); //需要轉換一下
          }
          return events;
        }).catch(e => {
          console.log('===getBannerDataFromCacheAPI has error',e);
          return [];
        })

      return eventDatas;
    }

    sportId = parseInt(sportId);
    if(sportId === 1) {
      // 足球按以下三個優先序排，如果同等級  就用vendor的默認排序
      // 滾球
      // a. 第一級: 高進球可能性的賽事 優先 (賽事進行到第75分鐘前 OR 縂進球 > 1 OR 紅卡 > 0)
      // b. 第二級: 縂進球 降序排序
      // c. 第三級: 根據賽事開始時間 升序排序
      //
      // 按此順序找到前８
      const runningEventsPR = await this.getEvents(sportId,VendorMarkets.RUNNING,SortWays.LeagueName); //先用默認聯賽排序，拿到Vendor定義的順序
      let runningEvents = runningEventsPR.NewData;

      //a. 第一級: 高進球可能性的賽事 優先 (賽事進行到第75分鐘前 OR 縂進球 > 1 OR 紅卡 > 0)
      const rule1 = (event) => {
        return (event.RBMinute !== null && event.RBMinute !== '' && parseInt(event.RBMinute) <= 75)
          || event.HomeScore !== null && event.HomeScore !== ''&&  parseInt(event.HomeScore) > 0
          || event.AwayScore !== null && event.AwayScore !== ''&&  parseInt(event.AwayScore) > 0
          || event.HomeRedCard !== null && event.HomeRedCard !== ''&& parseInt(event.HomeRedCard) > 0
          || event.AwayRedCard !== null && event.AwayRedCard !== ''&& parseInt(event.AwayRedCard) > 0
      }

      //b. 第二級: 縂進球 降序排序
      const rule2 = (event) => {
        const HomeScore = (event.HomeScore !== null && event.HomeScore !== '') ? parseInt(event.HomeScore) : 0;
        const AwayScore = (event.AwayScore !== null && event.AwayScore !== '') ? parseInt(event.AwayScore) : 0;
        return HomeScore+AwayScore;
      }

      const compareFunc = (left,right) => {
        //a. 第一級: 高進球可能性的賽事 優先 (賽事進行到第75分鐘前 OR 縂進球 > 1 OR 紅卡 > 0)
        const a1 = rule1(left);
        const b1 = rule1(right);

        if (a1 === true && b1 === false) {
          return -1; //小于 0 ，那么 a 会被排列到 b 之前
        }

        if (b1 === true && a1 === false) {
          return 1; //大于 0 ， b 会被排列到 a 之前。
        }

        //b. 第二級: 縂進球 降序排序
        const a2 = rule2(left);
        const b2 = rule2(right);

        if (a2 > b2 ) {
          return -1; //小于 0 ，那么 a 会被排列到 b 之前
        }
        if (a2 < b2 ) {
          return 1; //大于 0 ， b 会被排列到 a 之前。
        }

        //c. 第三級: 根據賽事開始時間 升序排序
        const a3 = left.EventDate;
        const b3 = right.EventDate;
        if (a3 < b3 ) {
          return -1; //小于 0 ，那么 a 会被排列到 b 之前
        }
        if (a3 > b3 ) {
          return 1; //大于 0 ， b 会被排列到 a 之前。
        }
        // a must be equal to b
        return 0;
      }

      runningEvents = runningEvents.sort(compareFunc);

      if (runningEvents.length >= NEventCount) {
        return runningEvents.slice(0,NEventCount);
      } else {
        const leftCount = NEventCount - runningEvents.length;
        const leftEvents = await this._getFirstNEvents(sportId,leftCount,SortWays.EventTime, [],[VendorMarkets.TODAY,VendorMarkets.EARLY]);
        return runningEvents.concat(leftEvents).slice(0,NEventCount); //返回切好的N個比賽
      }
    } else {
      //其他體育項目
      //根據開賽時間排序 近->遠
      return this._getFirstNEvents(sportId,NEventCount,SortWays.EventTime);
    }
  }

  /**
   * 全局 輪詢獲取 banner數據 20秒一次
   *
   * @param subscriberName    訂閱者名稱，用來處理重複訂閱的狀況
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 EventData數組
   * @param sportId           體育id
   * @param NEventCount       要返回前幾個比賽 默認8
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getBannerDataPollingGlobal(subscriberName, onUpdateCallback, sportId , NEventCount = 8, uniqueName = '') {
    return this._subscribeGlobalPolling('getBannerDataPolling', subscriberName, onUpdateCallback,{sportId, NEventCount}, uniqueName, true);
  }

  /**
   * 輪詢獲取 banner數據 20秒一次
   *
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 EventData數組
   * @param sportId           體育id
   * @param NEventCount       要返回前幾個比賽 默認8
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getBannerDataPolling(onUpdateCallback, sportId , NEventCount = 8, uniqueName = '') {
    const dataQuery = () => this.getBannerData(sportId, NEventCount);
    return this._registerPolling('getBannerDataPolling', {sportId, NEventCount}, dataQuery, onUpdateCallback, 20, uniqueName, true);
  }

  //按體育項目+排序 返回前幾個比賽
  async _getFirstNEvents(sportId = 1, NEventCount = 8, sortWay = SortWays.EventTime, excludeEventIds= [],
                         markets= [VendorMarkets.RUNNING,VendorMarkets.TODAY,VendorMarkets.EARLY] //滾球->今日->早盤 的順序
  ) {
    let resultEvents = [];
    for(let market of markets) {
      const thisEventPR = await this.getEvents(sportId,market,sortWay,null,null,{MaxCount:NEventCount}); //bti加上最大數量限制 加速查詢
      let thisEvents = thisEventPR.NewData;

      if (excludeEventIds && excludeEventIds.length >0) {
        //排除不要的比賽
        thisEvents = thisEvents.filter(ev => excludeEventIds.indexOf(ev.EventId) === -1);
      }

      //去除已經在清單裡面的比賽
      if (resultEvents.length > 0) {
        thisEvents = thisEvents.filter(ev => resultEvents.indexOf(ev.EventId) === -1);
      }

      //接起來
      resultEvents = resultEvents.concat(thisEvents);

      if (resultEvents.length >= NEventCount) {
        break; //超過數量就可以退出
      }
    }

    return resultEvents.slice(0,NEventCount); //返回切好的N個比賽
  }

  /**
   * 獲取聯賽下的滾球賽事，額外傳入EventId，會把該Event放在數組的第一個，返回為 EventData數組
   *
   * @param sportId 體育id
   * @param leagueId 聯賽id
   * @param eventId 本賽事id
   * @returns {Promise<*[]|*>}
   */
  async getLiveEventsInSameLeague(sportId, leagueId, eventId = null) {
    sportId = parseInt(sportId);
    leagueId = parseInt(leagueId);

    if (this.configs.EventIdType === 'string') {
      eventId = eventId + '';//固定轉為string
    }
    if (this.configs.EventIdType === 'int') {
      eventId = parseInt(eventId);//固定轉為int
    }

    const runningEventsPR = await this.getEvents(sportId, VendorMarkets.RUNNING, SortWays.EventTime);
    let runningEvents = runningEventsPR.NewData;

    runningEvents = runningEvents.filter(re => parseInt(re.LeagueId) === parseInt(leagueId)); //獲取同聯賽


    //把目標賽事移到第一個
    if (eventId !== null) {
      const compareFunc = (left, right) => {
        const a = left.EventId === eventId;
        const b = right.EventId === eventId;

        if (a === true && b === false) {
          return -1; //小于 0 ，那么 a 会被排列到 b 之前
        }

        if (b === true && a === false) {
          return 1; //大于 0 ， b 会被排列到 a 之前。
        }

        return 0;
      }
      runningEvents = runningEvents.sort(compareFunc);
    }

    return runningEvents;
  }

  /**
   * 獲取熱門比賽-足球 今日+早盤，按開賽時間排序 選３個
   *
   * @param NEventCount 要返回前幾個比賽 默認3
   * @returns {Promise<*[]|*>}
   */
  async getHotEvents(NEventCount =3){
    return this._getFirstNEvents(1,3,SortWays.EventTime,[],[VendorMarkets.TODAY,VendorMarkets.EARLY]);
  }

  /**
   * 全局 輪詢獲取 熱門比賽 數據 20秒一次
   *
   * @param subscriberName    訂閱者名稱，用來處理重複訂閱的狀況
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 EventData數組
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getHotEventsPollingGlobal(subscriberName, onUpdateCallback, uniqueName = '') {
    return this._subscribeGlobalPolling('getBannerDataPolling', subscriberName, onUpdateCallback,{}, uniqueName);
  }

  /**
   * 輪詢獲取 熱門比賽 數據 20秒一次
   *
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 EventData數組
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getHotEventsPolling(onUpdateCallback, uniqueName = '') {
    const dataQuery = () => this.getHotEvents();
    return this._registerPolling('getHotEventsPolling', {}, dataQuery, onUpdateCallback, 20, uniqueName);
  }


  //數據緩存 有保質期
  _cacheWithExpiration = {}
  //數據緩存清理
  _cacheCleanTimeoutHandler = null

  /**
   * 設置緩存數據，保存秒數
   *
   * @param key 唯一key
   * @param data 數據
   * @param expireSeconds 緩存秒數 默認9分(因為10分清理一次)
   */
  _cacheSet(key, data, expireSeconds =9*60) {
    this._cacheWithExpiration[key] = { data, expTime: ((new Date()).getTime() + expireSeconds * 1000), expSec:expireSeconds}

    //配置過期清理
    if (!this._cacheCleanTimeoutHandler) {
      const doClean = () => {
        const nowTime = new Date().getTime();
        for(let propName in this._cacheWithExpiration) {
          const info = this._cacheWithExpiration[propName];
          if (nowTime > info.expTime) {
            console.log('=== remove expired cache by timeoutHandler',propName);
            delete this._cacheWithExpiration[propName]
          } else {
            //console.log('=== checked cache but not expire yet by timeoutHandler',propName);
          }
        }
        if (Object.keys(this._cacheWithExpiration).length > 0) {
          this._cacheCleanTimeoutHandler = setTimeout(doClean,10*60*1000); //10分檢查一次
        } else {
          clearTimeout(this._cacheCleanTimeoutHandler);
          this._cacheCleanTimeoutHandler = null;
        }
      }

      this._cacheCleanTimeoutHandler = setTimeout(doClean,10*60*1000); //10分檢查一次
    }
  }

  /**
   * 獲取緩存數據
   * 注意此操作單純獲取數據，不會延長緩存時間
   *
   * @param key 唯一key
   * @param defaultValue 沒有數據或數據已過期，返回的默認值
   */
  _cacheGet(key, defaultValue= null) {
    //檢查是否存在
    const info = this._cacheWithExpiration[key];
    if(info === undefined){
      return defaultValue;
    }

    //檢查是否過期
    const nowTime = new Date().getTime();
    if (nowTime > info.expTime) {
      delete this._cacheWithExpiration[key]
      console.log('=== remove expired cache by cacheGet',key);
      return defaultValue
    }

    return info.data;
  }
  

  //刪除緩存數據
  _cacheDelete(key) {
    delete this._cacheWithExpiration[key];
  }

  //API緩存也加入polling數據緩存機制
  storeInitialCacheToPollingCache(cacheData, type) {
    const uniqueName = '';

    if (type === 'count') {
      //處理count
      const cachedResultKeyForCount = 'getSportsPolling' + '_' + uniqueName + '_' + md5(JSON.stringify({}));
      //console.log(this.configs.VendorName,'===set InitialCache-Count data for ', cachedResultKeyForCount);
      this._cacheSet(cachedResultKeyForCount, new PollingResult(cacheData.count), 30); //加速:緩存
    }

    if (type === 'event') {
      //處理Events
      const theDayAfterTenDays = moment().add(10, 'days').format('YYYY-MM-DD');
      const theDaytoday = moment().format('YYYY-MM-DD');
      const defaultQuery = {
        SportId: 1, /* 体育类型 不分Vendor 1 都是默認足球 */
        MarketId: VendorMarkets.RUNNING, /* 市场类型 */ //默認選 滾球
        sortWay: SortWays.LeagueName, /* 排序 */ //默認聯賽排序
        startDate: theDaytoday, /* 开始时间 */
        endDate: theDayAfterTenDays, /* 结束时间 */
        extraConfigs: {},
      };

      const cachedResultKeyForEvents = 'getEventsPolling' + '_' + uniqueName + '_' + md5(JSON.stringify(defaultQuery));
      //console.log(this.configs.VendorName,'===set InitialCache-Event data for ', cachedResultKeyForEvents,JSON.parse(JSON.stringify(defaultQuery)));
      this._cacheSet(cachedResultKeyForEvents, new PollingResult(cacheData.list), 9 * 60); //加速:緩存
    }
  }

  //全局輪詢數據
  _globalPollingCache = {}

  //訂閱全局輪詢
  _subscribeGlobalPolling(funcName, subscriberName, onUpdateCallback, params, uniqueName, keepAlive=false) {
    const pollingKey = funcName + '_' + uniqueName;

    let newPolling = false;
    let oldCallbacks = {};
    if (!this._globalPollingCache[pollingKey]) {
      newPolling = true;
    } else {
      //檢查參數是否變化了
      const thisPollingInfo = this._globalPollingCache[pollingKey];
      const thisParaJSON = JSON.stringify(params);
      const currentParaJSON = JSON.stringify(thisPollingInfo.params);

      // if (funcName === "getEventsPolling" && this.configs.VL) {
      //   let paramsCopy = {...params};
      //   let thisPollingParamsCopy = {...thisPollingInfo.params};
      //
      //   delete paramsCopy.extraConfigs;
      //   delete thisPollingParamsCopy.extraConfigs;
      //
      //   // 參數變化，清空Cache，重置 讓頁數從1開始
      //   if (paramsCopy.MarketId != VendorMarkets.TODAY && JSON.stringify(paramsCopy) !== JSON.stringify(thisPollingParamsCopy)) {
      //     this._NewDataCache = {};
      //   }
      // }

      if (thisParaJSON !== currentParaJSON) {
        console.log('參數變化，需要重起輪詢 ')
        //參數變化，需要重起輪詢
        newPolling = true;
        //刪除現有的輪詢
        this.deletePolling(thisPollingInfo.pollingKey);
        //保留原有的回調
        oldCallbacks = {...thisPollingInfo.updateCallBacks}
      }
    }

    //不分新舊polling，緩存有數據就用
    const cachedResultKey = funcName + '_' + uniqueName + '_' + md5(JSON.stringify(params));
    const cachedResult = this._cacheGet(cachedResultKey, null);
    if (cachedResult) {
      //console.log(this.configs.VendorName,'===use Cached data for _subscribeGlobalPolling:',cachedResultKey,JSON.parse(JSON.stringify(params)));
      //回調通知數據更新
      if (onUpdateCallback) {
        try {
          onUpdateCallback(cachedResult);
        } catch (e) {
          console.log('Global Polling onUpdateCallback error', e);
        }
      }
    } else {
      //console.log(this.configs.VendorName,'===DO NOT HAVE Cached data for Global:',cachedResultKey,JSON.parse(JSON.stringify(params)));
    }
    if (newPolling) {
      console.log('=== new polling of',pollingKey);

      this._globalPollingCache[pollingKey] = { pollingKey:null, updateCallBacks:{...oldCallbacks}, params, keepAlive }

      const updateCallBackAdapter = (result) => {
        for(let uniqueKey in this._globalPollingCache[pollingKey].updateCallBacks) {
          const thisCallBack = this._globalPollingCache[pollingKey].updateCallBacks[uniqueKey];
          if (thisCallBack) {
            try {
              thisCallBack(result);
            } catch (e) {
              console.log('callback error', e);
            }
          }
        }
      }

      this._globalPollingCache[pollingKey].updateCallBacks[subscriberName] = onUpdateCallback; //在開始輪詢前就配置好，這樣首次輪詢才會調用到

      const arrayParams = Object.values(params);
      this._globalPollingCache[pollingKey].pollingKey = this[funcName](updateCallBackAdapter,...arrayParams,uniqueName);
    } else {
      console.log('=== old polling of',pollingKey);
      if (keepAlive === true) {
        this._globalPollingCache[pollingKey].keepAlive = true;
      }

      this._globalPollingCache[pollingKey].updateCallBacks[subscriberName] = onUpdateCallback;
    }

    return {
      pollingKey,
      subscriberName
    }
  }
  //解除訂閱全局輪詢
  _unsubscribeGlobalPolling(globalPollingKey) {
    //console.log('===_unsubscribeGlobalPolling',globalPollingKey);
    const {pollingKey,subscriberName} = globalPollingKey;
    if (pollingKey && this._globalPollingCache[pollingKey]) {
      if (subscriberName && this._globalPollingCache[pollingKey].updateCallBacks && this._globalPollingCache[pollingKey].updateCallBacks[subscriberName]) {
        console.log('===_unsubscribeGlobalPolling',pollingKey,subscriberName, this.configs.VendorName);
        delete this._globalPollingCache[pollingKey].updateCallBacks[subscriberName];
      }

      //沒有訂閱者就把輪詢刪掉
      if (Object.keys(this._globalPollingCache[pollingKey].updateCallBacks).length <=0) {
        //if (!this._globalPollingCache[pollingKey].keepAlive) { //如果配置keepAlive=true 不會刪除輪詢 //暫時先移除 keep alive
          //刪除現有的輪詢
          if (this._globalPollingCache[pollingKey].pollingKey) {
            this.deletePolling(this._globalPollingCache[pollingKey].pollingKey);
          }
          this.deletePolling(pollingKey);
          delete this._globalPollingCache[pollingKey];
        //}
      }
    }
  }

  /**
   * API專用 調用輪詢函數，每10分自動清理(重置)
   * 服務端專用，不會返回pollingkey
   *
   * @param pollingFunc  輪詢函數，返回pollingkey
   * @param cleanConfigs 清理配置, autoCleanSeconds指定自動清理秒數, cleanFunc 指定額外清理函數
   */
  APIPollingWithAutoClean(pollingFunc, cleanConfigs = null) {
    const callWithAutoClean = (cleanConfigsInner = null) => {
      if (cleanConfigsInner && cleanConfigsInner.pollingKey) {
        //console.log('delete polling...');
        this.deletePolling(cleanConfigsInner.pollingKey);
      }
      if (cleanConfigsInner && cleanConfigsInner.cleanFunc) {
        cleanConfigsInner.cleanFunc();
      }
      //console.log('start polling...');
      const thisPollingKey = pollingFunc();
      if (cleanConfigsInner === null) {
        cleanConfigsInner = { autoCleanSeconds: 10*60 } //默認10分清理一次
      }
      cleanConfigsInner.pollingKey = thisPollingKey;
      //暫定10分刷新一次
      setTimeout(() => callWithAutoClean(cleanConfigsInner), cleanConfigsInner.autoCleanSeconds*1000);
    }
    callWithAutoClean();
  }

  isAPIServer() {
    return (HostConfig.Config.nodePort || HostConfig.Config.nodeCenterPort) ? true : false;
  }

  //從EventData獲取 [全場]波膽投注分類數據 分 主 和 客 三條
  getFTCorrectScoreSelectionsFromEvent(eventData) {
    if(!eventData || !eventData.Lines || eventData.Lines.length <=0) {
      return null;
    }
    const targetLines =  eventData.Lines.filter(l => this.isFTCorrectScoreLine(l));
    if (!targetLines || targetLines.length <=0) {
      return null;
    }
    const targetLine = targetLines[0];

    return this.splitCorrectScoreSelectionsFromLine(targetLine);
  }

  //排列，用於計算波膽Selection數量
  _permutation(arr, size) {
    if (size > arr.length) { return; }
    let allResult = [];

    const executor = (arr, size, result) => {
      if (result.length == size) {
        allResult.push(result);
      } else {
        for (var i = 0, len = arr.length; i < len; i++) {
          let newArr = [].concat(arr);
          let	curItem = newArr.splice(i, 1);
          executor(newArr, size, [].concat(result, curItem));
        }
      }
    }

    executor(arr, size, []);

    return allResult;
  }

  //通用的處理WCP2022 TAB數據的函數
  async addWCP2022SportData(favEvents, srcSportData) {
    if (!this.isAPIServer()) { //API服務器不需要查自己的世界杯API
      let wcp2022CountsInfo =
        await promiseWithTimeout(
          fetch(HostConfig.Config.CacheApi + '/wcp2022/counts/' + this.configs.VendorName.toLowerCase())
            .then(response => response.json())
            .catch(e => null)
          , 5 * 1000, //5秒超時
        ).catch(e => {
          console.log(`wcp2022/counts ${this.configs.VendorName.toLowerCase()} query timeout error`);
          return null;
        });

      const cacheKey = 'WCP2022CountsCache_' + this.configs.VendorName;
      let infoDataIsFromCache = false;
      //找不到，嘗試從緩存獲取
      if (!wcp2022CountsInfo) {
        const cachedJson = vendorStorage.getItem(cacheKey);
        if (cachedJson) {
          wcp2022CountsInfo = JSON.parse(cachedJson);
        }

        //緩存也沒有，就直接返回
        if (!wcp2022CountsInfo) {
          return false;
        }
        infoDataIsFromCache = true;
      }

      if (wcp2022CountsInfo) {

        if (!infoDataIsFromCache) { //緩存來的就不用再保存
          vendorStorage.setItem(cacheKey, JSON.stringify(wcp2022CountsInfo));
        }

        let showWCP2022 = false;
        if (wcp2022CountsInfo.settings) {
          showWCP2022 = wcp2022CountsInfo.settings.showWCP2022;

          if (!infoDataIsFromCache) { //緩存來的就不用更新
            const favUpgradedFlagKey = this.configs.VendorName + '_WCP2022FavUpgraded';
            //更新配置
            if (JSON.stringify(this.WCP2022Settings.LeagueIds) !== JSON.stringify(wcp2022CountsInfo.settings.LeagueIds)) {
              this.WCP2022Settings.LeagueIds = wcp2022CountsInfo.settings.LeagueIds;
              await vendorStorage.removeItemAsync(favUpgradedFlagKey) //配置已透過API修改，刪掉已升級的flag，後面會自動重新檢查
            }
            if (this.configs.VendorName === 'SABA') { //沙巴額外更新優勝冠軍的判斷基準
              if (this.WCP2022Settings.OutrightLeagueGroupName != wcp2022CountsInfo.settings.OutrightLeagueGroupName) {
                this.WCP2022Settings.OutrightLeagueGroupName = wcp2022CountsInfo.settings.OutrightLeagueGroupName;
                await vendorStorage.removeItemAsync(favUpgradedFlagKey) //配置已透過API修改，刪掉已升級的flag，後面會自動重新檢查
              }
            }
          }
        }
        if (showWCP2022) {
          const hasUpdate = await this.upgradeWCP2022FavouriteEvents(); //先升級關注比賽數據版本
          if (hasUpdate) {
            favEvents = await this.getFavouriteEvents(); //重新獲取
          }
          const favEventsForWCP2022 = favEvents.filter(favItem => 1 === parseInt(favItem.SportId) && favItem.IsWCP2022Event);

          const WCP2022SportData = new SportData(
            2022, //寫死2022
            '世界杯', //只有SB2.0有mobile顯示文字，所以寫死就可以
            wcp2022CountsInfo.countsData.totalCount,
            [  //順序 滾球 今天 早盤 關注 優勝冠軍
              new MarketData(VendorMarkets.RUNNING, VendorMarketNames[VendorMarkets.RUNNING], wcp2022CountsInfo.countsData.marketMap[VendorMarkets.RUNNING]),
              new MarketData(VendorMarkets.TODAY, VendorMarketNames[VendorMarkets.TODAY], wcp2022CountsInfo.countsData.marketMap[VendorMarkets.TODAY]),
              new MarketData(VendorMarkets.EARLY, VendorMarketNames[VendorMarkets.EARLY], wcp2022CountsInfo.countsData.marketMap[VendorMarkets.EARLY]),
              new MarketData(VendorMarkets.FAVOURITE, VendorMarketNames[VendorMarkets.FAVOURITE], favEventsForWCP2022.length),
              new MarketData(VendorMarkets.OUTRIGHT, VendorMarketNames[VendorMarkets.OUTRIGHT], wcp2022CountsInfo.countsData.marketMap[VendorMarkets.OUTRIGHT]),
            ]
          )
          let insertIndex = 0;
          const soccerIndex = srcSportData.findIndex(sd => parseInt(sd.SportId) === 1)
          if (soccerIndex !== -1) {
            insertIndex = soccerIndex + 1;
          }
          srcSportData.splice(insertIndex, 0, WCP2022SportData);
        }
      }
    }
  }

  //檢查所有關注比賽，升級為WCP2022版本(是世界杯比賽就標記ISWCP2022Event = TRUE)
  async upgradeWCP2022FavouriteEvents() {
    const flagKey = this.configs.VendorName + '_WCP2022FavUpgraded';
    const flagDoneValue = 'DONE';
    const hasUpgraded = await vendorStorage.getItemAsync(flagKey);
    //寫在localStorage，全局只執行一次
    if (hasUpgraded === flagDoneValue) {
      return false;
    }

    const key = this._getFavouriteStorageKey();
    const currentFavEvents = await this.getFavouriteEvents(key);
    let hasUpdate = false;

    if (currentFavEvents && currentFavEvents.length > 0) {
      const pr = await this.getEventsDetail(currentFavEvents);
      const thisEvents = pr.NewData;
      if (thisEvents && thisEvents.length > 0) {
        let wcpEventIds = [];
        thisEvents.forEach(ev => {
          if (this.isWCP2022Event(ev)) {
            wcpEventIds.push(ev.EventId);
          }
        })

        if (wcpEventIds && wcpEventIds.length > 0) {
          currentFavEvents.forEach(fav => {
            if (wcpEventIds.indexOf(fav.EventId) !== -1) {
              fav.IsWCP2022Event = true;
            } else {
              fav.IsWCP2022Event = false;
            }
          })
          hasUpdate = true;
          await vendorStorage.setItemAsync(key, JSON.stringify(currentFavEvents));
        }
      }
    }
    
    await vendorStorage.setItemAsync(flagKey, flagDoneValue);
    return hasUpdate;
  }
  
  // 處理新api的SportsData
  async getSportsNew() {
    //獲取收藏賽事
    const favEvents = await this.getFavouriteEvents();

    return this._newNormalImFetch('sportData', "", "GET")
      .then(async jsonData => {
        const data = jsonData.Data;
        let SportDatas = data.map(item => {
          
          const favEventsForThisSport = favEvents.filter(favItem => item.SportId == favItem.SportId);
          const earlyCount = item.Markets.filter(v => v.MarketId == 1)[0].Count;
          const todayCount = item.Markets.filter(v => v.MarketId == 2)[0].Count;
          const runningCount = item.Markets.filter(v => v.MarketId == 3)[0].Count;
          const outrightCount = item.Markets.filter(v => v.MarketId == 5)[0].Count;
          
          return new SportData(
            parseInt(item.SportId),
            item.SportName,
            item.Count,
            [  //順序 滾球 今天 早盤 關注 優勝冠軍
              new MarketData(VendorMarkets.RUNNING, VendorMarketNames[VendorMarkets.RUNNING], runningCount ),
              //今日包含滾球
              new MarketData(VendorMarkets.TODAY, VendorMarketNames[VendorMarkets.TODAY], todayCount+runningCount ),
              new MarketData(VendorMarkets.EARLY, VendorMarketNames[VendorMarkets.EARLY], earlyCount),
              new MarketData(VendorMarkets.FAVOURITE, VendorMarketNames[VendorMarkets.FAVOURITE], favEventsForThisSport.length ),
              new MarketData(VendorMarkets.OUTRIGHT, VendorMarketNames[VendorMarkets.OUTRIGHT], outrightCount ),
            ]
          )
        })
        // await this.addWCP2022SportData(favEvents, SportDatas);
        return new PollingResult(SportDatas);
      }).catch(e => {
        console.log('e ',e)
      })
  }
  
  async _newNormalImFetch(apiName, params, method = 'POST', retryCount = 0, pageNumber, isPagePull = false) {
    console.table({ apiName, params, method, retryCount, pageNumber });

    // check sb api token
    await getSbToken();

    const VendorName = this.configs.VendorName;
    
    const fetchData = async (apiName, params, method, VendorName, pageNumber) => {
      let apiUrl = apiName;
      const separator = apiName.includes("?") ? "&" : "?";
      apiUrl = apiUrl + separator + `Lang=${vendorLangSettings.Lang}&Vendor=` + VendorName;
      return new Promise(function (resolve, reject) {
        promiseWithTimeout(fetchRequestSBNew(apiUrl, method, params)
          .then(function (jsonData) {
            resolve(jsonData);
          })
        ).catch((error) => {
          console.log('error ', error);
          let errorWrapper = { error: error };
          reject(errorWrapper);
        });
      });
    };

    return fetchData(apiName, params, method, VendorName, pageNumber)
      .then(results => {
        return results;
      });
  }
  
  /**
   * SABA 查詢體育數據 接口 只支持GET
   *
   * @param dataName
   * @param queryOptions
   * @returns {Promise<unknown>}
   * @private
   */
  async SportFetchVL(queryOptions, onUpdate = null, onError = null) {
    const queryString = Object.keys(queryOptions)
      .map((key) => key + "=" + queryOptions[key])
      .join("&");

    return this._newNormalImFetch(`events?${queryString}`, null, "GET", 0)
      .then(async jsonData => {
        console.log('jsonData ',jsonData.Data)
        return Promise.resolve(jsonData.Data)
      });
  }

  parseQueryParameters(url) {
    const queryString = url.split('?')[1];
    const queryParameters = {};

    if (queryString) {
      const keyValuePairs = queryString.split('&');

      keyValuePairs.forEach(pair => {
        const [key, value] = pair.split('=');
        queryParameters[decodeURIComponent(key)] = decodeURIComponent(value);
      });
    }

    return queryParameters;
  }
}




import HostConfig from '../vendorHostConfig';
import {vendorSettings, WCP2022SettingsDefault, getTokenFromGatewayImpl} from '../vendorSettingSABA';
import i18n from '../vendori18n';
import md5 from "crypto-js/md5";
import sha1 from "crypto-js/sha1";
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
import BetStatusData from "../data/BetStatusData";
import WagerData from "../data/WagerData";
import WagerItemData from "../data/WagerItemData";
import TokenManager from "../data/TokenManager";
import {
  SABAAcceptMode,
  SABADataTypes,
  SABAOddsType, SABAOddsTypeToNumber,
  SABASports,
} from "./SABAConsts";
import AnnouncementData from "../data/AnnouncementData";
import VendorError from "../data/VendorError";
import BetInfoData from "../data/BetInfoData";
import SelectionChangeData from "../data/SelectionChangeData";
import VendorBase from "../data/VendorBase";
import EventInfo from "../data/EventInfo";
import FreeBetData from "../data/FreeBetData";
import {Decimal} from "decimal.js";
import {v4 as uuidv4} from "uuid";
import {envSettings} from '../vendorSetting';

import {vendorStorage} from '../vendorStorage';
import SearchSportData from "../data/SearchSportData";
import SseSubscription from "../data/SseSubscription";
import CashOutResultData from "../data/CashOutResultData";
import promiseWithTimeout from "../data/promiseWithTimeout";
import { fetchRequest, fetchRequestSBNew } from '$SBTWOLIB/SportRequest';
import { getSbToken } from "../../js/util";
import { IMSports } from "../im/IMConsts";
import { vendorLangSettings } from "../vendorSetting";
import {fetchRequestSBVendor} from '../vendorFetch';

/**
 * 沙巴 體育接口
 */
class VendorSABA extends VendorBase {
  //Singleton
  constructor () {
    if (!VendorSABA._instance) {
      super({
        MaxParlay: 20, //串關最多選幾個
        VendorName: 'SABA', //供應商名稱
        VendorPage: '/sports-saba', //主頁鏈接
        EventIdType: 'int', //EventId數據形態: int/string
        HasLeagueIcon: false, //是否有聯賽Icon
        HasTeamIcon: true, //是否有隊伍Icon
        HasCashOut: true, //是否支持提前兌現
        VL: true, //虛擬列表開關
      });
      this.tokenService = new TokenManager();
      this.WCP2022Settings = Object.assign({},WCP2022SettingsDefault); //WCP2022 複製配置，支持從CACHE API即時覆蓋
      console.log('VendorSABA new instance');
      VendorSABA._instance = this;
    }
    return VendorSABA._instance
  }

  _getLoginInfo(){
    if (typeof window !== "undefined") {
      if (vendorStorage.getItem("loginStatus") == 1) {
        const token = JSON.parse(vendorStorage.getItem("SABA_Token"));
        const memberCode = JSON.parse(vendorStorage.getItem("SABA_MemberCode"));

        if (token && memberCode) return {token, memberCode};
      }
    }
    return null
  }

  //儲存接口Diff數值
  _NewDataCache = {}

  // events用
  async _newSABAFetch(apiName, params, method = 'POST', retryCount = 0, pageNumber, isPagePull = false) {
    // console.table({ apiName, params, method, retryCount, pageNumber });
    let hasCacheData = false;
    // 參數是query，轉換為物件
    const queryParams = this.parseQueryParameters(apiName)
    // check sb api token
    await getSbToken();

    const VendorName = this.configs.VendorName;

    let allQueries = [];
    let that = this;
    let clonedParams = JSON.parse(JSON.stringify(queryParams));
    let cachedKey = '';

    const path = apiName.split("?")[0];

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

    // 非下拉載下一頁，並且有cacheData
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
      // 下拉載下一頁
      return fetchData(apiName, params, method, VendorName, pageNumber)
        .then(results => {
          return handleResults([results], false);
        });
    }
  }

  mergePreviousPagesData(queryParams) {
    const thisDiffKey = this._getDataCacheKey("events", { ...queryParams });
    return this._NewDataCache[thisDiffKey].full;
  }

  //獲取比賽列表 新api
  async getEventsVL(SportId = IMSports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null
    , extraConfigs = {}) {
    const OddsType = this.getMemberSetting().oddsType;
    const MemberType = null; //水位
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
          // console.log('cacheData ',cacheData)
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
                return EventData.createFromNewSABAOutRightSource(item, favEvents);
              } else {
                return EventData.createFromNewSABASource(item, item.Lines, MarketId, favEvents, OddsType);
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
            const favEvents = await this.getFavouriteEvents();
            const thisDiffKey = this._getDataCacheKey("events", { ...queryParams });

            // 合併新資料和舊資料
            if (jsonData.allData.length === 1) {
              const singleData = jsonData.allData[0];
              const EventDatas = singleData.Data.map((eventData) => {
                  if (MarketId === VendorMarkets.OUTRIGHT) {
                    return EventData.createFromNewSABAOutRightSource(eventData, favEvents);
                  } else {
                    return EventData.createFromNewSABASource(eventData, eventData.Lines, MarketId, favEvents, OddsType);
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
                      return EventData.createFromNewSABAOutRightSource(eventData, favEvents);
                    } else {
                      return EventData.createFromNewSABASource(eventData, eventData.Lines, MarketId, favEvents, OddsType);
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
                    // console.log('JSON.stringify(oev) ', JSON.stringify(oev))
                    // console.log('JSON.stringify(ev) ', JSON.stringify(ev))
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
            //儲存套用差異更新後的結果
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
        //處理排序
        // result.NewData = EventData.sortEvents(result.NewData, sortWay);
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

  //renew節流，避免短時間重複執行多次，被擋下來
  _renewToken_throttle({source, isAnonymous, createHandle = true}) {
    //把匿名跟非匿名的節流分開
    let handleName = '_renewToken_throttle_handle' + (isAnonymous ? '_Anonymous' : '');

    if (this[handleName]) {
      //console.log('===pass renewToken...', handleName, source)
      return false;
    }

    let that = this;
    if (createHandle) {
      //console.log('===create renewToken handle', handleName, source);
      this[handleName] = setTimeout(function () {
        clearTimeout(that[handleName]);
        that[handleName] = null;
        //console.log('===clear renewToken handle', handleName, source, JSON.stringify(that[handleName]));
      }, 60 * 1000); //1分鐘節流
    }

    //console.log('===can do renewToken...', handleName, source)

    return true;
  }

  //從gateway獲取登入token
  getTokenFromGateway() {
    return getTokenFromGatewayImpl(this);
  }

  //_checkAndReGetJWT棄用，因為會造成多餘的get，改成類似IM的處理方式，在fetch時候遇到401，就重新獲取token
  //檢查已存在的jwt是否可用 - 避免異步同時請求問題
  //_checkAndReGetJWTPromise = null;
  //檢查已存在的jwt是否可用(需要處理token過期401問題)
  // _checkAndReGetJWT(jwt, isAnonymous = false) {
  //
  //   //避免異步同時請求問題
  //   if (this._checkAndReGetJWTPromise) {
  //     return this._checkAndReGetJWTPromise;
  //   }
  //
  //   //console.log('check JWT of ',jwt);
  //
  //   this.tokenService.stopAutoRenew();  //先暫停刷新token， 後面接續的外部代碼會再恢復tokenservice
  //
  //   let that =this;
  //   this._checkAndReGetJWTPromise = new Promise((resolve, reject) => {
  //     if (!that._renewToken_throttle({source:'_checkAndReGetJWT', createHandle: false})) {
  //       //視為renew成功 不做任何變更
  //       that._checkAndReGetJWTPromise = null; //結束前清理掉
  //       return resolve(jwt);
  //     }
  //
  //     //用get sports測試token是否過期
  //     //為何不直接用_SABASportFetch ?
  //     // - 因為裡面也有調用_checkAndReGetJWT()，會造成循環call
  //     // - 而且用的jwt是tokenservice帶的，在service還沒初始化之前，會誤判401，造成重複獲取token
  //     const fetchParams = {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Accept: 'application/json',
  //         Authorization: 'Bearer ' + jwt,
  //       },
  //     };
  //
  //     const url = HostConfig.Config.SABAApi + 'sports/v1/' + SABADataTypes.SPORTS + '?language=cs';
  //
  //     fetch(url, fetchParams)
  //       .then(function (response) {
  //         if (response.status !== 200) {
  //           throw response.status //丟出異常
  //         }
  //         return response.json();
  //       }).then(function (jsonData) {
  //         if (jsonData && jsonData.sports) {
  //           //token可用，不做任何變更
  //           that._checkAndReGetJWTPromise = null; //結束前清理掉
  //           resolve(jwt);
  //         } else {
  //           let thiserror = 'unknown error:';
  //           if (jsonData.errorCode) {
  //             thiserror += jsonData.errorCode + '|'
  //           }
  //           if (jsonData.message) {
  //             thiserror += jsonData.message
  //           }
  //           throw thiserror //丟出異常
  //         }
  //       }).catch(error => {
  //         console.log('===_checkAndReGetJWT test token error', url, error);
  //         let thiserror = new VendorError();
  //         if (error) {
  //           thiserror = VendorError.fromSABAError(error);
  //         }
  //         if (typeof thiserror  === 'object' && thiserror.isVendorError === true && thiserror.ErrorType === VendorErrorType.VENDOR_Auth_Error) {
  //           //處理401 token過期
  //           console.log('_checkAndReGetJWT got 401');
  //
  //           vendorStorage.removeItem("SABA_Token"); //刪除已存的token
  //
  //           //token過期，嘗試重新獲取
  //           that.SABALogin(isAnonymous).then(r => {
  //             that._checkAndReGetJWTPromise = null; //結束前清理掉
  //             resolve(r)
  //           }).catch(err2 => {
  //             that._checkAndReGetJWTPromise = null; //結束前清理掉
  //             reject(err2)
  //           });
  //         } else {
  //           that._checkAndReGetJWTPromise = null; //結束前清理掉
  //           reject(thiserror);
  //         }
  //       });
  //   })
  //
  //   return this._checkAndReGetJWTPromise;
  // }

  //配置token service - 避免異步同時請求問題
  _initTokenServicePromise = null;

  //配置token service(沒有token過期問題 不用處理401)
  //增加一個isAnonymous判斷當前是否匿名登入
  //forceRenew=true表示強制在initService的時候重新獲取token，用於刷新頁面後不確定token效期時使用
  _initTokenService(jwt, isAnonymous = false, forceRenew = false) {

    //避免異步同時請求問題
    if (this._initTokenServicePromise) {
      return this._initTokenServicePromise;
    }

    //console.log('====start initTokenService of ',jwt, "isAnonymous", isAnonymous);

    this.tokenService.stopAutoRenew();  //先暫停刷新token

    let that =this;
    //token會過期，配置token刷新(renew)的請求
    const renewTokenRequest = () => {
      return new Promise(resolve => {

        if (!that._renewToken_throttle({source:'renewTokenRequest', isAnonymous})) {
          //視為renew成功 不做任何變更
          //從token-service renew token源碼反推  要提供的數據形態
          //console.log('====token un-update by _renewToken_throttle');
          return resolve({access_token: jwt});
        }

        if (isAnonymous) { //匿名走自己的通道
          const tokenFetchParams = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          };

          let fetchBody = {
            "vendor_member_id":"anonymous", //匿名
          }
          tokenFetchParams.body = JSON.stringify(fetchBody);
          fetch(HostConfig.Config.SABAAuthApi + 'login',tokenFetchParams)
            .then(function (renewResponse) {
              if(renewResponse.status!==200)
              {
                throw renewResponse.status //丟出異常
              }
              return renewResponse.json();
            }).then(function (renewJsonData) {
              if (renewJsonData && renewJsonData.access_token) {
                vendorStorage.setItem(
                  "SABA_Token",
                  JSON.stringify(renewJsonData.access_token)
                );

                //從token-service renew token源碼反推  要提供的數據形態
                resolve({access_token: renewJsonData.access_token});
              } else {
                let thiserror = 'unknown error:';
                if (renewJsonData.errorCode) {
                  thiserror += renewJsonData.errorCode + '|'
                }
                if (renewJsonData.message) {
                  thiserror += renewJsonData.message
                }
                throw thiserror //丟出異常
              }
            })
        } else {
          //一般登入
          that.getTokenFromGateway()
            .then(function (jsonData) {
              if (jsonData && jsonData.token) {
                //getTokenFromGateway本身就有存 不需要再存一次
                // vendorStorage.setItem(
                //   "SABA_Token",
                //   JSON.stringify(renewJsonData.access_token)
                // );

                //從token-service renew token源碼反推  要提供的數據形態
                resolve({access_token: jsonData.token});
              } else {
                throw 'empty token' //丟出異常
              }
            })
            // .catch(err => { //debug用 模擬token獲取失敗
            //   vendorStorage.setItem(
            //     "SABA_Token",
            //     JSON.stringify('XXX')
            //   );
            //   resolve({access_token: 'XXX'});
            // })
        }
      })
    }

    const tokenConfig = {
      tokenRenewInterval: 9 * 60 * 1000,  //9分renew一次 因為10分鐘就過期
      tokenRenewProvider: renewTokenRequest,
      isAnonymous,
    }
    //配置登入後取到的jwt
    this.tokenService.apiAccessToken = jwt;

    this._initTokenServicePromise = new Promise((resolve,reject) => {
      that.tokenService.init(tokenConfig, forceRenew ? null : jwt)
        .then((newToken) => {
          if (newToken) {
            //開始自動刷新token
            that.tokenService.startAutoRenew();

            that._initTokenServicePromise = null; //結束前清理掉
            resolve(newToken);
          } else {
            that._initTokenServicePromise = null; //結束前清理掉
            reject('empty token');
          }
        })
    });

    return this._initTokenServicePromise;
  }

  //離開SB2.0時，中止自動刷新token程序
  async stopTokenRenewWhenLeave() {
    if (this._initTokenServicePromise) {
      return this._initTokenServicePromise
        .then(newtoken => {
          this.tokenService.stopAutoRenew();
          this.tokenService.isInitialized = false;
        })
    } else {
      return new Promise(resolve => {
        this.tokenService.stopAutoRenew();
        this.tokenService.isInitialized = false;
        resolve();
      })
    }
  }


  //避免異步同時請求問題
  _SABALoginPromise = null;

  //登入獲取JWT(token) 並起 token service
  SABALogin(isAnonymous = false) {

    //避免異步同時請求問題
    if (this._SABALoginPromise) {
      return this._SABALoginPromise;
    }

    let that = this;
    this._SABALoginPromise = new Promise(function(resolve, reject) {

      that.tokenService.stopAutoRenew();  //先暫停刷新token
      that._renewToken_throttle({source:'SABALogin', isAnonymous}); //登入也會獲取token，所以也要併入renew節流，但是不用判斷，單純觸發一下，避免頻繁調用renew

      let fetchPromise = null;
      if (isAnonymous) { //匿名走自己的通道
        const tokenFetchParams = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        };

        let fetchBody = {
          "vendor_member_id":"anonymous", //匿名
        }
        tokenFetchParams.body = JSON.stringify(fetchBody);
        fetchPromise = fetch(HostConfig.Config.SABAAuthApi + 'login',tokenFetchParams)
          .then(function (response) {
            if(response.status!==200)
            {
              throw response.status //丟出異常
            }
            return response.json();
          }).then(function (jsonData) {
            if (jsonData && jsonData.access_token) {
              vendorStorage.setItem(
                "SABA_Token",
                JSON.stringify(jsonData.access_token)
              );
              return jsonData.access_token;
            } else {
              let thiserror = 'unknown error:';
              if (jsonData.errorCode) {
                thiserror += jsonData.errorCode + '|'
              }
              if (jsonData.message) {
                thiserror += jsonData.message
              }
              throw thiserror //丟出異常
            }
          })
      } else {
        //一般登入
        fetchPromise = that.getTokenFromGateway()
          .then(function (jsonData) {
            if (jsonData && jsonData.token) {
              //getTokenFromGateway本身就有存 不需要再存一次
              // vendorStorage.setItem(
              //   "SABA_Token",
              //   JSON.stringify(renewJsonData.access_token)
              // );

              //從token-service renew token源碼反推  要提供的數據形態
              return jsonData.token;
            } else {
              throw 'empty token' //丟出異常
            }
          });
      }

      fetchPromise
        .then(token => {
          if (token) {
            const jwt_token = token;
            //登入後配置tokenservice
            that._initTokenService(jwt_token, isAnonymous)
              .then(r => {
                that._SABALoginPromise = null; //結束前清理掉
                resolve(r)
              })
              .catch(error => {
                that._SABALoginPromise = null; //結束前清理掉
                reject(error);
              })
          } else {
            let thiserror = 'empty token';
            console.log('SABA LOGIN Anonymous=' + isAnonymous + 'get error:', thiserror);
            that._SABALoginPromise = null; //結束前清理掉
            reject(thiserror);
          }
        })
        .catch((error) => {
          console.log('SABA LOGIN Anonymous=' + isAnonymous + 'has error', error);
          that._SABALoginPromise = null; //結束前清理掉
          reject(error);
        });
    })

    return this._SABALoginPromise;
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

    // 分2步
    //
    // 1.登入
    // 2.取gateway token=jwt  需要把 jwt 配置到 tokenservice 且頁面刷新後，需要重新配置tokenservice
    //
    // 2是異步請求，有可能失敗，或被刷新頁面中斷，所以才有下面這堆複雜的檢查
    let that = this;
    this._checkAndWaitLoginPromise = new Promise((resolve,reject) => {
      if (vendorStorage.getItem("loginStatus") == 1) {
        //有登入
        if (that.loginPromise) {
          // 如果在登入中，等待登入完成
          that.loginPromise.then(token => {
            if (!that.tokenService.isInitialized //檢查tokenService是否配置
              || that.tokenService.isAnonymous() //如果原本是匿名token也要換掉
            ) {
              that._initTokenService(token,false, that.tokenService.isAnonymous()) //如果原本是匿名token 需要重新獲取
                .then(r => {
                  that._checkAndWaitLoginPromise = null; //結束前清理掉
                  resolve(r)
                })
                .catch(err => {
                  that._checkAndWaitLoginPromise = null; //結束前清理掉
                  reject(err)
                });
            } else {
              that._checkAndWaitLoginPromise = null; //結束前清理掉
              resolve(token);
            }
          });
        }else {
          //沒有loginPromise則檢查緩存數據
          const loginInfo = that._getLoginInfo();
          if (loginInfo && loginInfo.token) {
            //有token
            if (!that.tokenService.isInitialized //檢查tokenService是否配置
              || that.tokenService.isAnonymous() //如果原本是匿名token也要換掉
            ) {
              that._initTokenService(loginInfo.token, false, that.tokenService.isAnonymous()) //匿名token 需要重新獲取
                .then(r => {
                  that._checkAndWaitLoginPromise = null; //結束前清理掉
                  resolve(r)
                })
                .catch(err => {
                  that._checkAndWaitLoginPromise = null; //結束前清理掉
                  reject(err)
                });
            } else {
              setTimeout(() => { //需要延遲，不延遲會造成Promise沒有被正常清理掉
                that._checkAndWaitLoginPromise = null; //結束前清理掉
                resolve(loginInfo.token);
              },10);
            }
          } else {
            //沒有token,可能登入後還沒來得及拿到token就刷新了，嘗試重新獲取
            that.SABALogin(false)
              .then(r => {
                that._checkAndWaitLoginPromise = null; //結束前清理掉
                resolve(r)
              })
              .catch(err => {
                that._checkAndWaitLoginPromise = null; //結束前清理掉
                reject(err)
              });
          }
        }
      } else {
        //沒登入(guest view) 檢查是否有拿到匿名token
        const jwt = JSON.parse(vendorStorage.getItem("SABA_Token"));
        if (jwt) {
          if (!that.tokenService.isInitialized //檢查tokenService是否配置
            || !that.tokenService.isAnonymous() //不是匿名token也要更換(for登出的情況)
          ) {
            that._initTokenService(jwt, true, !that.tokenService.isAnonymous()) //不是匿名token 需要重新獲取
              .then(r => {
                that._checkAndWaitLoginPromise = null; //結束前清理掉
                resolve(r)
              })
              .catch(err => {
                that._checkAndWaitLoginPromise = null; //結束前清理掉
                reject(err)
              });
          } else {
            setTimeout(() => { //需要延遲，不延遲會造成Promise沒有被正常清理掉
              that._checkAndWaitLoginPromise = null; //結束前清理掉
              resolve(jwt);
            },10);
          }
        } else {
          //沒有匿名token，嘗試重新獲取
          that.SABALogin(true)
            .then(r => {
              that._checkAndWaitLoginPromise = null; //結束前清理掉
              resolve(r)
            })
            .catch(err => {
              that._checkAndWaitLoginPromise = null; //結束前清理掉
              reject(err)
            });
        }
      }
    })

    return this._checkAndWaitLoginPromise;
  }

  _SABA_SSE_subscribe(dataName, queryString, onNext, onError) {
    let that = this;
    let getToken = () => { return that.tokenService.apiAccessToken; };
    var queryUrl = HostConfig.Config.SABAApi + 'sports/stream/v1/' + dataName + queryString + "&token=[TOKEN]"; //token在SseSubscription裡面會自動被取代
    var handleMessage = function (rawData) {
        var payload = JSON.parse(rawData);
        onNext(payload);
    };
    var subscription = new SseSubscription(queryUrl, getToken, handleMessage, onError);
    subscription.run();
    return subscription;
  }

  //不重試的url 投注/cashout等
  _notAllowRetryUrls = [
    'betting/v1/' + SABADataTypes.PLACEBET,
    'betting/v1/' + SABADataTypes.PLACEOUTRIGHTBETS,
    'betting/v1/' + SABADataTypes.PLACEPARLAYBETS,
    'cashout/v1/' + SABADataTypes.SELLBACK,
  ]

  //專門包一層，用來處理401 token過期問題
  async _SABAFetch(url, fetchParams, retryCount = 0) {
    const notAllowRetryUrls = this._notAllowRetryUrls.map(v => HostConfig.Config.SABAApi + v);
    let that = this;

    // 需要紀錄log的api，下注和cash out
    const needLogApis = this._notAllowRetryUrls.some(api => url.includes(api));
    const functionName = needLogApis ? fetchRequestSBVendor : fetch;

    return new Promise(function(resolve, reject) {
      return functionName(url, fetchParams)
        .then(function (response) {
          if([401].indexOf(response.status) !== -1)
          {
            throw response.status //丟出異常
          }
          resolve(response);
        }).catch(error => {
          let thiserror = new VendorError();
          if (error) {
            thiserror = VendorError.fromSABAError(error);
          }
          if (typeof thiserror  === 'object' && thiserror.isVendorError === true && thiserror.ErrorType === VendorErrorType.VENDOR_Auth_Error) {
            //處理401 token過期
            console.log('_SABAFetch got 401', url, JSON.parse(JSON.stringify(fetchParams)));

            vendorStorage.removeItem("SABA_Token"); //刪除已存的token

            //最多重試3次 避免無窮循環
            if (retryCount >= 3) {
              //重試超過3次，按一般錯誤方式返回
              console.log('_SABAFetch 401', url, JSON.parse(JSON.stringify(fetchParams)), 'has re-tried 3 times...abort');
              reject(error);
              return;
            }

            const isAnonymous =  !(vendorStorage.getItem("loginStatus") == 1)
            //token過期，嘗試重新獲取
            that.SABALogin(isAnonymous)
              .then(r => {

                //不重試的url，只單純更新token
                let purifiedurl =  url;
                if (purifiedurl.indexOf('?')) {
                  purifiedurl = purifiedurl.substr(0,purifiedurl.indexOf('?'));
                }
                if (notAllowRetryUrls && notAllowRetryUrls.indexOf(purifiedurl) !== -1) {
                  console.log('_SABAFetch 401 but notallow retry',purifiedurl,url);
                  reject(error);
                  return;
                }

                //重試次數+1
                let thisRetryCount = retryCount + 1;

                //更新AccessToken
                let newFetchParams = JSON.parse(JSON.stringify(fetchParams));
                if (newFetchParams && newFetchParams.headers && newFetchParams.headers.Authorization) {
                  newFetchParams.headers.Authorization = 'Bearer ' + that.tokenService.apiAccessToken;
                }
                console.log('_SABAFetch 401', url, JSON.parse(JSON.stringify(newFetchParams)), ' try: ', thisRetryCount);
                that._SABAFetch(url, newFetchParams, thisRetryCount)
                  .then(response => { resolve(response) })
                  .catch(err3 => reject(err3));
              }).catch(err2 => {
                reject(err2)
              });
          } else {
            reject(error);
          }
        });
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
  async _SABASportFetch(dataName, queryOptions, onUpdate = null, onError = null) {

    await this._checkAndWaitLogin(); //需要等待登入後才能查詢

    if (!queryOptions['params']) {
      queryOptions['params'] = {};
    }

    if (!queryOptions['language']) {
      queryOptions['language'] = vendorSettings.LanguageCode;
    }

    const fetchParams = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + this.tokenService.apiAccessToken,
      },
    };

    const composeQueryUrl = (queryOptions) => {
      let paramArr = [];
      let paramConfigs = [
        { name: 'includeMarkets', htmlEncode: true },
        { name: 'from'},
        { name: 'until'},
        { name: 'sportType'}, //GetStreaming
        { name: 'streamingOption', htmlEncode: true}, //GetStreaming
        { name: 'channelCode', htmlEncode: true}, //GetStreaming
      ];

      paramConfigs.map(config => {
        let thisValue = queryOptions.params[config.name];
        if (thisValue !== undefined) {
          if (config.htmlEncode) {
            thisValue = encodeURIComponent( '' + thisValue);
          }
          paramArr.push(config.name + '=' + thisValue);
        }
      })

      if (queryOptions['query']) {
        paramArr.push('query=' + encodeURIComponent( queryOptions['query']));
      }

      if (queryOptions['language']) {
        paramArr.push('language=' + queryOptions['language']);
      }

      let queryUrl = '';
      if (paramArr && paramArr.length > 0 ) {
        queryUrl = '?' + paramArr.join('&');
      }

      return queryUrl;
    }

    const queryStrings = composeQueryUrl(queryOptions);

    const url = HostConfig.Config.SABAApi + 'sports/v1/' + dataName + queryStrings;

    const isSSE = (onUpdate !== null);

    let that = this;
    return new Promise(function(resolve, reject) {
      if (!isSSE) { //GET/pull模式
        return that._SABAFetch(url, fetchParams)
          .then(function (response) {
            if (response.status !== 200) {
              throw response.status //丟出異常
            }
            return response.json();
          }).then(function (jsonResponse) {
            //console.log('===SABASportFetch QUERY', dataName, queryOptions, jsonResponse);
            resolve(jsonResponse);
          }).catch(error => {
            console.log('===SABASportFetch QUERY has error', dataName, queryOptions, error);
            let thiserror = new VendorError();
            if (error) {
              thiserror = VendorError.fromSABAError(error);
            }
            reject(thiserror);
          });
      } else {
        //推送模式
        const subscription = that._SABA_SSE_subscribe(dataName, queryStrings,
          (response) => {
            //console.log('===SABASportFetch SSE', dataName, queryOptions, response);
            if (onUpdate) {
              onUpdate(response);
            }
          },
          (error) => {
            console.log('===SABASportFetch SSE has error', dataName, queryOptions, error);
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
   * SABA 查詢體育數據 接口 只支持GET
   *
   * @param dataName
   * @param queryOptions
   * @returns {Promise<unknown>}
   * @private
   */
  async _SABAHandleBigInt (response) {
    //console.log('===transId replace: start');
    //沙巴需要額外處理 transId 溢位問題 => 加雙引號改為string
    const jsonText = await response.text();
    if (jsonText.length > 0 && jsonText.indexOf('transId') !== -1) {
      // const regex = /(?<="transId":)\d+(?=,)/g; //注意不能用左右合寫法 safari不支持
      const regex = /"transId":\d+,/g; //先取整個
      const founds = jsonText.match(regex);
      if(founds && founds.length > 0) {
        let newJSONText = jsonText;
        founds.forEach(fo => {
          const regexInner = /("transId":)(\d+)(,)/g; //然後才用group切，取到訂單號 注意:不能復用這個變數 要一直重新定義，不然下面match會拿不到東西
          const matches = regexInner.exec(fo);
          //console.log('===trans ', fo ,matches);
          if (matches && matches.length === 4) {
            const thisTransId = matches[2];
            newJSONText = newJSONText.replace(`"transId":${thisTransId}`, `"transId":"${thisTransId}"`);
          }
        })
        //console.log('===transId replace:',founds,'before:',jsonText, 'after:',JSON.parse(newJSONText));
        return JSON.parse(newJSONText);
      }
    }
    //console.log('===transId replace: notfound!!');
    return JSON.parse(jsonText);
  }

  /**
   * SABA 查詢投注/投注 接口
   *
   * @param dataName 接口名
   * @private
   */
  async _SABABettingFetch(dataName, queryOptions) {

    await this._checkAndWaitLogin(); //需要等待登入後才能查詢

    if (!queryOptions['params']) {
      queryOptions['params'] = {};
    }

    let fetchMethod = 'GET';
    if (queryOptions.POST) {
      fetchMethod = 'POST';
    }

    let fetchParams = {
      method: fetchMethod,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + this.tokenService.apiAccessToken,
      },
    };

    if (queryOptions.POST && queryOptions.jsonBody) { //GetParlayTickets使用
      fetchParams.body = queryOptions.jsonBody;
    }

    const composeQueryUrl = (queryOptions) => {
      let paramArr = [];
      let paramConfigs = [
        { name: 'sportType'}, //GetSingleTicket ,PlaceBet, PlaceOutrightBet
        { name: 'marketId'},  //GetSingleTicket ,PlaceBet
        { name: 'key'},       //GetSingleTicket ,PlaceBet
        { name: 'oddsType'},  //GetSingleTicket ,PlaceBet
        { name: 'vendorTransId'}, //PlaceBet/PlaceOutrightBet/CheckPlaceBet
        { name: 'price'}, //PlaceBet/PlaceOutrightBet
        { name: 'point'}, //PlaceBet
        { name: 'stake'}, //PlaceBet/PlaceOutrightBet
        { name: 'oddsOption'}, //PlaceBet
        { name: 'orid'}, //GetOutrightTicket /PlaceBet/PlaceOutrightBet
        { name: 'transId'}, //CheckWaitingTicketStatus
      ];

      paramConfigs.map(config => {
        let thisValue = queryOptions.params[config.name];
        if (thisValue !== undefined) {
          if (config.htmlEncode) {
            thisValue = encodeURIComponent( '' + thisValue);
          }
          paramArr.push(config.name + '=' + thisValue);
        }
      })

      let queryUrl = '';
      if (paramArr && paramArr.length > 0 ) {
        queryUrl = '?' + paramArr.join('&');
      }

      return queryUrl;
    }

    const url = HostConfig.Config.SABAApi + 'betting/v1/' + dataName + composeQueryUrl(queryOptions);

    let that = this;
    return new Promise(function(resolve, reject) {
      return that._SABAFetch(url, fetchParams)
        .then(function (response) {
          if ([401].indexOf(response.status) !== -1) {
            throw response.status //丟出異常
          }
          return response;
        })
        .then(that._SABAHandleBigInt)
        .then(function (jsonResponse) {
          //console.log('===SABABettingFetch QUERY', dataName, queryOptions, jsonResponse);
          if (jsonResponse.statusCode && (jsonResponse.statusCode === 400 || jsonResponse.statusCode === 403) && jsonResponse.errorCode) { //處理報錯
            throw jsonResponse.errorCode;
          }
          resolve(jsonResponse);
        }).catch(error => {
          console.log('===SABABettingFetch QUERY has error', dataName, queryOptions, error);
          let thiserror = new VendorError();
          if (error) {
            thiserror = VendorError.fromSABAError(error);
          }
          reject(thiserror);
        });
    });
  }

  /**
   * SABA 查注單 接口 只支持GET
   * (其實跟上面Betting用同一個api，不過結構比較簡單而且有語係配置，所以單獨拉出來)
   *
   * @param dataName
   * @param queryOptions
   * @returns {Promise<unknown>}
   * @private
   */
  async _SABAWagerFetch(dataName, queryOptions) {

    await this._checkAndWaitLogin(); //需要等待登入後才能查詢

    if (!queryOptions['params']) {
      queryOptions['params'] = {};
    }

    if (!queryOptions['language']) {
      queryOptions['language'] = vendorSettings.LanguageCode;
    }

    const fetchParams = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + this.tokenService.apiAccessToken,
      },
    };

    const composeQueryUrl = (queryOptions) => {
      let paramArr = [];
      let paramConfigs = [
        { name: 'start'},
        { name: 'end'},
        { name: 'isSettled'},
      ];

      paramConfigs.map(config => {
        let thisValue = queryOptions.params[config.name];
        if (thisValue !== undefined) {
          if (config.htmlEncode) {
            thisValue = encodeURIComponent( '' + thisValue);
          }
          paramArr.push(config.name + '=' + thisValue);
        }
      })

      if (queryOptions['language']) {
        paramArr.push('language=' + queryOptions['language']);
      }

      let queryUrl = '';
      if (paramArr && paramArr.length > 0 ) {
        queryUrl = '?' + paramArr.join('&');
      }

      return queryUrl;
    }

    const url = HostConfig.Config.SABAApi + 'betting/v1/' + dataName + composeQueryUrl(queryOptions);

    let that = this;
    return new Promise(function(resolve, reject) {
      return that._SABAFetch(url, fetchParams)
        .then(function (response) {
          if(response.status!==200)
          {
            throw response.status //丟出異常
          }
          return response;
        })
        .then(that._SABAHandleBigInt)
        .then(function (jsonResponse) {
          //console.log('===SABAWagerFetch QUERY', dataName, queryOptions, jsonResponse);
          resolve(jsonResponse);
        }).catch(error => {
          console.log('===SABAWagerFetch QUERY has error', dataName, queryOptions, error);
          let thiserror = new VendorError();
          if (error) {
            thiserror = VendorError.fromSABAError(error);
          }
          reject(thiserror);
        });
    });
  }

  /**
   * SABA cashout 接口
   *
   * @param dataName 接口名
   * @private
   */
  async _SABACashOutFetch(dataName, queryOptions) {

    await this._checkAndWaitLogin(); //需要等待登入後才能查詢

    if (!queryOptions['params']) {
      queryOptions['params'] = {};
    }

    let fetchMethod = 'GET';
    if (queryOptions.POST) {
      fetchMethod = 'POST';
    }

    let fetchParams = {
      method: fetchMethod,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + this.tokenService.apiAccessToken,
      },
    };

    if (queryOptions.POST && queryOptions.jsonBody) { //GetParlayTickets使用
      fetchParams.body = queryOptions.jsonBody;
    }

    const composeQueryUrl = (queryOptions) => {
      let paramArr = [];
      let paramConfigs = [
        { name: 'transIds'}, //GetCashoutPrice,
        { name: 'transId'}, //SellBack, CheckSellingStatus, ConfirmSellingResult
        { name: 'cashoutPrice'}, //SellBack
      ];

      paramConfigs.map(config => {
        let thisValue = queryOptions.params[config.name];
        if (thisValue !== undefined) {
          if (config.htmlEncode) {
            thisValue = encodeURIComponent( '' + thisValue);
          }
          paramArr.push(config.name + '=' + thisValue);
        }
      })

      let queryUrl = '';
      if (paramArr && paramArr.length > 0 ) {
        queryUrl = '?' + paramArr.join('&');
      }

      return queryUrl;
    }

    const url = HostConfig.Config.SABAApi + 'cashout/v1/' + dataName + composeQueryUrl(queryOptions);

    let that = this;
    return new Promise(function(resolve, reject) {
      return that._SABAFetch(url, fetchParams)
        .then(function (response) {
          if([401].indexOf(response.status) !== -1)
          {
            throw response.status //丟出異常
          }
          return response;
        })
        .then(that._SABAHandleBigInt)
        .then(function (jsonResponse) {
          //console.log('===SABACashOutFetch QUERY', dataName, queryOptions, jsonResponse);
          if (jsonResponse.statusCode && jsonResponse.statusCode === 400 && jsonResponse.errorCode) { //處理報錯
            throw jsonResponse.errorCode;
          }
          resolve(jsonResponse);
        }).catch(error => {
          console.log('===SABACashOutFetch QUERY has error', dataName, queryOptions, error);
          let thiserror = new VendorError();
          if (error) {
            thiserror = VendorError.fromSABAError(error);
          }
          reject(thiserror);
        });
    });
  }

  //獲取體育項目，返回為 PollingResult 格式
  async getSports() {
    if(this.configs.VL){
      return this.getSportsNew();
    }

    //獲取收藏賽事
    const favEvents = await this.getFavouriteEvents();

    const SportAllPromise = this._SABASportFetch(SABADataTypes.SPORTS,{});

    const oneDayAfter = moment().utc().add(1,'day').toISOString();

    //今日 要另外算
    const SportTodayPromise = this._SABASportFetch(SABADataTypes.SPORTS,{
      params: {
        until: oneDayAfter,
      }
    });

    return Promise.all([SportAllPromise,SportTodayPromise]).then(async values => {
      const sportAll = values[0].sports;
      const sportToday = values[1].sports;

      let SportDatas = sportAll.map(sportsAll => {
        const SportsTodays = sportToday.filter(todayitem => todayitem.sportType === sportsAll.sportType);
        const sportsToday = SportsTodays[0];

        //gameCount: 不含滾球
        //[今日]需要包含滾球，要加上去
        let todayCount = sportsToday ? sportsToday.gameCount + sportsAll.liveGameCount : sportsAll.liveGameCount;
        const earlyCount = sportsAll.gameCount - (sportsToday ? sportsToday.gameCount : 0);

        const favEventsForThisSport = favEvents.filter(favItem => parseInt(sportsAll.sportType) === favItem.SportId);

        return new SportData(
          parseInt(sportsAll.sportType),
          sportsAll.sportName,
          sportsAll.gameCount + sportsAll.liveGameCount + sportsAll.outrightGame,
          [ //順序 滾球 今天 早盤 關注 優勝冠軍
            new MarketData(VendorMarkets.RUNNING, VendorMarketNames[VendorMarkets.RUNNING], sportsAll.liveGameCount ),
            new MarketData(VendorMarkets.TODAY, VendorMarketNames[VendorMarkets.TODAY], todayCount ),
            new MarketData(VendorMarkets.EARLY, VendorMarketNames[VendorMarkets.EARLY], earlyCount ),
            new MarketData(VendorMarkets.FAVOURITE, VendorMarketNames[VendorMarkets.FAVOURITE], favEventsForThisSport.length ),
            new MarketData(VendorMarkets.OUTRIGHT, VendorMarketNames[VendorMarkets.OUTRIGHT], sportsAll.outrightGame)
          ]
        )
      });

      //世界杯2022Tab數據
      await this.addWCP2022SportData(favEvents, SportDatas);

      return new PollingResult(SportDatas);
    })
  }

  //獲取比賽列表 公用查詢參數 返回 {queryString, params}
  _getEventQueryInfo(SportId = SABASports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null, EventIds = [], IsRunningToday = false, favEvents=[], onlyMainEvents = true) {

    //世界杯2022處理
    let isWCP2022 = false;
    if (SportId === SABASports.WCP2022) {
      isWCP2022 = true;
      SportId = SABASports.SOCCER; //改回查足球數據
    }

    let params = {
      //限縮投注線，減少數據量
      includeMarkets: "$filter=bettype in ('1','7','17','3','8','18','413')",  //1 7 17 讓球_全上下  3 8 18大小_全上下 413全場波膽
    }

    //優勝冠軍不用過濾投注線
    if (MarketId === VendorMarkets.OUTRIGHT) {
      delete params['includeMarkets'];
    }

    const oneDayAfter = moment().add(1,'day').toISOString();

    let queryString = '$filter=';
    //體育類型
    queryString += `sportType eq ${SportId}`;

    //沙巴和im一樣 有特殊投注 會分成不同比賽，默認只取主比賽
    if (onlyMainEvents && (MarketId !== VendorMarkets.OUTRIGHT)) {
      queryString += ' and isMainMarket eq true';
    }

    //世界杯2022過濾聯賽
    if (isWCP2022) {
      if (MarketId !== VendorMarkets.OUTRIGHT) {
        if (this.WCP2022Settings.LeagueIds && this.WCP2022Settings.LeagueIds.length === 1) {
          queryString += ` and leagueId eq ${this.WCP2022Settings.LeagueIds[0]}`;
        } else {
          queryString += ` and leagueId in (${this.WCP2022Settings.LeagueIds.join(',')})`;
        }
      } else {
        //SABA猜冠軍 聯賽id不是固定 要改用leagueGroup去查
        queryString += ` and contains(leagueGroup,'${this.WCP2022Settings.OutrightLeagueGroupName}')`;
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
      //params.from = moment().add(-1,'day').toISOString(); //如果不帶 默認是now，會拿不到滾球，所以必須帶一個過去的時間，設置為1天(24小時)前
      params.until = oneDayAfter;
    } else if (MarketId === VendorMarkets.TODAY && IsRunningToday === false) {
      //今日-一天內(不含滾球)
      queryString += ' and isLive eq false';
      //params.from = '';
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
      queryString += ` and eventId in ('${eventIdsJoins}')`;
    }

    //額外指定EventId查詢，關注(收藏)的 優勝冠軍 單獨查詢使用
    if (EventIds && EventIds.length > 0) {
      if (MarketId === VendorMarkets.OUTRIGHT) {
        //優勝冠軍用leagueId當作id
        //逗號分隔，單引號包起來
        const eventIdsJoins = EventIds.join("','");
        //比賽id
        queryString += ` and leagueId in ('${eventIdsJoins}')`;
      } else {
        //逗號分隔，單引號包起來
        const eventIdsJoins = EventIds.join("','");
        //比賽id
        queryString += ` and eventId in ('${eventIdsJoins}')`;
      }
    }

    //TODO: SABA 聯賽排序??
    //排序(全部都要加上id 用以穩定排序，不然在分頁獲取中會拿到重複Event)
    if (MarketId === VendorMarkets.OUTRIGHT) { //優勝冠軍字段不一樣
      if (sortWay === SortWays.EventTime) {
        queryString += '&$orderby=eventDate asc,leagueId asc,eventCode asc'  //開賽時間 正序(早開的在上)
      } else if (sortWay === SortWays.LeagueName) {
        queryString += '&$orderby=leagueId asc,eventCode asc' //聯賽名 正序
      }
    } else {
      if (sortWay === SortWays.EventTime) {
        queryString += '&$orderby=globalShowTime asc,leagueId asc,eventCode asc'  //開賽時間 正序(早開的在上)
      } else if (sortWay === SortWays.LeagueName) {
        if (MarketId === VendorMarkets.TODAY && IsRunningToday !== false) {
          queryString += '&$orderby=isLive desc,eventCode asc' //聯賽名 正序，把live game放前面
        } else {
          queryString += '&$orderby=eventCode asc' //聯賽名 正序
        }
      }
    }

    return {queryString, params};
  }

  //獲取比賽列表 返回為 PollingResult 格式(支持比對數據變化)
  //extraConfigs.MaxCount 支持指定獲取前幾個賽事 banner使用
  //extraConfigs.getViewScope 函數，(IM專用)目前只用來指定早盤 全場波膽需要載入多少數據
  async getEvents(SportId = SABASports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null
            , extraConfigs ={}) {

    //世界杯2022處理
    let isWCP2022 = false;
    if (SportId === SABASports.WCP2022) {
      isWCP2022 = true;
      //SportId = SABASports.SOCCER; //不取代SportId，因為很多用於緩存判斷
    }

    //猜冠軍特別處理
    if (MarketId === VendorMarkets.OUTRIGHT) {
      return this._getOutRightEvents(SportId, sortWay,null,true);
    }

    const pageSize = 50; //SABA固定一頁50

    let needNormalQuery = true; //用來跳過無用查詢 : 查關注(收藏) 且 沒有一般賽事 => 跳過query
    const favEvents = await this.getFavouriteEvents();

    let eventIdsCate = {normal:[],outright:[]}; //分開一般賽事和優勝冠軍
    if(MarketId === VendorMarkets.FAVOURITE) {  //直接先判斷關注(收藏)數量，如果為0就返回空，不做後面無用查詢

      //關注(收藏) 單獨處理，因為需要合併猜冠軍的查詢結果
      let favEventsForThisSport = favEvents.filter(item => item.SportId === SportId);
      if (isWCP2022) {  //世界杯2022處理
        favEventsForThisSport = favEvents.filter(item => item.SportId === SABASports.SOCCER); //換成足球
      }

      //沒數據直接返回空
      if (favEventsForThisSport.length <=0) {
        return new Promise(resolve => resolve(new PollingResult([], [], true))); //額外設定已加載完畢
      }

      //分開一般賽事和優勝冠軍
      favEventsForThisSport.map(item => {
        if (item.IsOutRightEvent) {
          eventIdsCate.outright.push(item.EventId);
        } else {
          eventIdsCate.normal.push(item.EventId);
        }
      })

      //是否有一般賽事
      if (eventIdsCate.normal.length <= 0) {
        needNormalQuery=false; //用來跳過無用查詢 : 查關注(收藏) 且 沒有一般賽事 => 跳過query
      }
    }

    let queryPromiseNormal = null;
    if (needNormalQuery) { //用來跳過無用查詢 : 查關注(收藏) 且 沒有一般賽事 => 跳過query
      //需要分頁查

      //先取數量
      let eventCount = 0;
      if (extraConfigs['MaxCount']) { //有帶入最大查詢數量
        eventCount = parseInt(extraConfigs['MaxCount']);
      } else {
        //沒帶入數量，直接查count
        if(MarketId === VendorMarkets.FAVOURITE) { //關注數量已經算好
          eventCount = eventIdsCate.normal.length;
        } else {
          const sportsCountPR = await this.getSports();
          let sportDatas = sportsCountPR.NewData.filter(item => parseInt(item.SportId) === SportId);
          if (isWCP2022) {  //世界杯2022處理
            sportDatas = sportsCountPR.NewData.filter(item => parseInt(item.SportId) === SABASports.SOCCER); //換成足球
          }
          if (sportDatas && sportDatas.length > 0 && sportDatas[0].Markets) {
            const marketDatas = sportDatas[0].Markets.filter(item => item.MarketId === MarketId)
            if (marketDatas && marketDatas.length > 0) {
              eventCount = marketDatas[0].Count;
            }
          }
        }
      }

      const memberOddsType = this.getMemberSetting().oddsType;

      let {queryString, params} = this._getEventQueryInfo(SportId, MarketId, sortWay, startDate, endDate, [], false, favEvents);

      //分頁查
      let queryPromiseNormals = [];
      const maxPageNo = Math.ceil(eventCount / pageSize);
      for (let currentPageNo = 1; currentPageNo <= maxPageNo; currentPageNo++) {
        let thisSkipValue = (currentPageNo - 1) * pageSize;
        let thisQueryString = queryString + `&$skip=${thisSkipValue}&$top=${pageSize}`;

        let thisPromise = this._SABASportFetch(SABADataTypes.EVENTS, {
          query: thisQueryString,
          params: params
        })

        queryPromiseNormals.push(thisPromise);
      }

      queryPromiseNormal = Promise.all(queryPromiseNormals)
        .then(async resultArray => {
          let AllEventDatas = [];
          const favEvents = await this.getFavouriteEvents();
          resultArray.map((jsonData,resultIndex) => {
            const EventDatas = jsonData.events.map((eventData,itemIndex) => {
              return EventData.createFromSABASource(eventData, jsonData.markets, MarketId, favEvents, memberOddsType, (resultIndex*pageSize + itemIndex))
            });
            AllEventDatas = AllEventDatas.concat(EventDatas);
          })

          //排序投注線，整理聯賽和比賽排序
          if (AllEventDatas && AllEventDatas.length > 0) {
            let tmpLeagueMap = {}
            AllEventDatas.map(item => {
              //整理聯賽和比賽排序
              if (!tmpLeagueMap[item.LeagueId]) {
                tmpLeagueMap[item.LeagueId] = item.SortOrder; //用最早出現的比賽index作為 聯賽排序id
              }
              //更新排序id = 聯賽排序id_比賽index
              item.SortOrder = tmpLeagueMap[item.LeagueId] + '_' + item.SortOrder;

              //排序投注線
              item.SABASortLines(); //直接排序即可(主要lineLevel小排到大，UI會自動取第一個)
            })
          }

          //排序比賽
          EventData.sortEvents(AllEventDatas, sortWay);

          const cahceKey = this._getDataCacheKey('getEvents',{SportId,MarketId,startDate,endDate})
          const oldDatas = this._DataCache[cahceKey];

          //比對差異
          let changes = [];
          if (oldDatas) {
            let newEventIds = AllEventDatas.map(ev => ev.EventId);
            let oldEventMap = {}
            oldDatas.map(oev => {
              oldEventMap[oev.EventId] = oev;
              //已刪除
              if (newEventIds.indexOf(oev.EventId) === -1) {
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

          //記錄新數據
          this._DataCache[cahceKey] = AllEventDatas;
          //複製一份 不要和保存的內容共用實例
          const cloneEventDatas = AllEventDatas.map(ev => EventData.clone(ev));

          return new PollingResult(cloneEventDatas, changes, true); //額外設定已加載完畢
        });
    }

    if(MarketId !== VendorMarkets.FAVOURITE) {
      return queryPromiseNormal;
    } else {
      //關注(收藏) 單獨處理，因為需要合併猜冠軍的查詢結果
      let queryPromises = [];

      //查一般賽事
      if (eventIdsCate.normal.length > 0) {
        queryPromises.push(queryPromiseNormal);
      }

      //查優勝冠軍
      if (eventIdsCate.outright.length > 0) {
        const queryPromiseOR = this._getOutRightEvents(SportId, sortWay,eventIdsCate.outright,true);
        queryPromises.push(queryPromiseOR);
      }

      //合併結果返回
      return Promise.all(queryPromises).then(async resultArray => {
        if (resultArray.length === 1) {
          return resultArray[0];
        }

        const normalPR = resultArray[0];
        const outrightPR =  resultArray[1];

        const normalEvents = normalPR.NewData ?? [];
        const outrightEvents = outrightPR.NewData ?? [];
        const normalChanges = normalPR.Changes ?? [];
        const outrightChanges = outrightPR.Changes ?? [];
        const allEvents = normalEvents.concat(outrightEvents);
        const allChanges = normalChanges.concat(outrightChanges);

        return new PollingResult(allEvents, allChanges, true) //額外設定已加載完畢
      });

    }
  }

  //獲取優勝冠軍賽事 返回為 PollingResult 格式(支持比對數據變化)
  //強制歐洲盤，所以沒有盤口可選
  //eventIds參數，用來過濾數據，獲取特定單個或多個
  //ForListing用來提供列表頁的數據，自動切selection只保留前４個
  async _getOutRightEvents(SportId = SABASports.SOCCER, sortWay = SortWays.LeagueName, eventIds = null, ForListing = false) {

    //世界杯2022處理
    let isWCP2022 = false;
    if (SportId === SABASports.WCP2022) {
      isWCP2022 = true;
      //SportId = SABASports.SOCCER; //不取代SportId，因為很多用於緩存判斷
    }

    const pageSize = 50; //SABA固定一頁50

    //先取數量
    let eventCount = 0;
    //沒帶入數量，直接查count
    if(eventIds &&  eventIds.length > 0) { //數量已經算好
      eventCount = eventIds.length;
    } else {
      const sportsCountPR = await this.getSports();
      let sportDatas = sportsCountPR.NewData.filter(item => parseInt(item.SportId) === SportId);
      if (isWCP2022) {  //世界杯2022處理
        sportDatas = sportsCountPR.NewData.filter(item => parseInt(item.SportId) === SABASports.SOCCER); //換成足球
      }
      if (sportDatas && sportDatas.length > 0 && sportDatas[0].Markets) {
        const marketDatas = sportDatas[0].Markets.filter(item => item.MarketId === VendorMarkets.OUTRIGHT)
        if (marketDatas && marketDatas.length > 0) {
          eventCount = marketDatas[0].Count;
        }
      }
    }

    const {queryString, params} = this._getEventQueryInfo(SportId, VendorMarkets.OUTRIGHT, sortWay, null, null,  eventIds);

    //分頁查
    let queryPromises = [];
    const maxPageNo = Math.ceil(eventCount / pageSize);
    for (let currentPageNo = 1; currentPageNo <= maxPageNo; currentPageNo++) {
      let thisSkipValue = (currentPageNo - 1) * pageSize;
      let thisQueryString = queryString + `&$skip=${thisSkipValue}&$top=${pageSize}`;

      let thisPromise = this._SABASportFetch(SABADataTypes.OUTRIGHTS, {
        query: thisQueryString,
        params: params
      })

      queryPromises.push(thisPromise);
    }

    return Promise.all(queryPromises)
      .then(async resultArray => {
        //注意優勝冠軍的接口不一樣，返回結構也和Events不一樣  都要特別處理
        let AllEventDatas = [];
        const favEvents = await this.getFavouriteEvents();
        resultArray.map(jsonData => {
          const EventDatas = jsonData.outrights.map(eventData => {
            return EventData.createFromSABAOutRightSource(eventData, favEvents)
          });
          AllEventDatas = AllEventDatas.concat(EventDatas);
        })

        //排序比賽
        EventData.sortEvents(AllEventDatas,sortWay);

        const cahceKey = this._getDataCacheKey('_getOutRightEvents',{SportId,eventIds})
        const oldDatas = this._DataCache[cahceKey];

        //比對差異
        let changes = [];
        if (oldDatas) {
          let newEventIds = AllEventDatas.map(ev => ev.EventId);
          let oldEventMap = {}
          oldDatas.map(oev => {
            oldEventMap[oev.EventId] = oev;
            //已刪除
            if (newEventIds.indexOf(oev.EventId) === -1) {
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

        //記錄新數據
        this._DataCache[cahceKey] = AllEventDatas;
        //複製一份 不要和保存的內容共用實例
        const cloneEventDatas = AllEventDatas.map(ev => EventData.clone(ev));

        return new PollingResult(cloneEventDatas, changes);
      })
      .then(pr => {
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

  //獲取 單一個 比賽信息 返回為 PollingResult 格式(支持比對數據變化)
  //額外提供一個noMarkets參數，用來單純查詢event數據(只需要查詢球賽狀況，不用看投注)
  async getEventDetail(SportId= SABASports.SOCCER, EventId, isOutRightEvent= false, noMarkets= false) {

    if (isOutRightEvent) { //優勝冠軍單獨獲取
      const pr = await this._getOutRightEvents(SportId,null,[EventId],false);
      return new PollingResult(pr.NewData[0],pr.Changes);
    }

    let queryString = '$filter=';
    //體育類型
    queryString += `sportType eq ${SportId}`;

    //比賽id 也查出子比賽
    queryString += `and ( eventId eq ${EventId} or parentId eq ${EventId} )`;

    let params = {}
    if (noMarkets) {
      params.includeMarkets = "$filter=bettype eq 0";  //用 = 一個不存在的玩法 去過濾掉所有market
    }

    //分頁查
    const maxEventPageNo = 10; //最多查10頁
    const eventPageSize = 50; //1頁50筆
    let allEventsJsonData = {events: []};
    for (let currentEventPageNo = 1; currentEventPageNo <= maxEventPageNo; currentEventPageNo++) {
      let thisEventSkipValue = (currentEventPageNo - 1) * eventPageSize;
      let thisEventQueryString = queryString + `&$skip=${thisEventSkipValue}&$top=${eventPageSize}`;

      let thisEventJsonData = await this._SABASportFetch(SABADataTypes.EVENTS, {
        query: thisEventQueryString,
        params: params
      })

      if (thisEventJsonData && thisEventJsonData.events && thisEventJsonData.events.length > 0) {
        allEventsJsonData.events = allEventsJsonData.events.concat(thisEventJsonData.events);
      } else {
        break;
      }
    }

    //考慮沒有盤口的情況，返回空
    if (!allEventsJsonData.events || allEventsJsonData.events.length <= 0) {
      return new PollingResult(null);
    }

    const favEvents = await this.getFavouriteEvents();
    const memberOddsType = this.getMemberSetting().oddsType;

    //可能會返回多個，包含不同EventGroup的數據
    const srcMainEvents = allEventsJsonData.events.filter(ev => ev.isMainMarket); //主要比賽

    if (srcMainEvents && srcMainEvents.length >0) {
      let mainEvent = null;

      if (noMarkets) {
        //不要市場數據的話，只需要返回主比賽就好
        mainEvent = EventData.createFromSABASource(srcMainEvents[0], [], null, favEvents, memberOddsType);
      } else {
        //需要市場數據：另外用market獲取全部玩法
        const allEventIdsJoins = allEventsJsonData.events.map(ev => ev.eventId).join("','"); //逗號分隔，單引號包起來
        let queryStringMarket = '$filter=';
        queryStringMarket += `sportType eq ${SportId}`; //體育類型
        queryStringMarket += `and eventId in ('${allEventIdsJoins}')`; //比賽id

        //分頁查
        const maxMarketPageNo = 20; //最多查20頁
        const marketPageSize = 50; //1頁50筆
        let allMarketJsonData = {markets: []};
        for (let currentMarketPageNo = 1; currentMarketPageNo <= maxMarketPageNo; currentMarketPageNo++) {
          let thisMarketSkipValue = (currentMarketPageNo - 1) * marketPageSize;
          let thisMarketQueryString = queryStringMarket + `&$skip=${thisMarketSkipValue}&$top=${marketPageSize}`;

          let thisMarketJsonData = await this._SABASportFetch(SABADataTypes.MARKETS, {
            query: thisMarketQueryString,
            params: params
          })

          if (thisMarketJsonData && thisMarketJsonData.markets && thisMarketJsonData.markets.length > 0) {
            allMarketJsonData.markets = allMarketJsonData.markets.concat(thisMarketJsonData.markets);
          } else {
            break;
          }
        }

        //用全部玩法數據 生成主比賽
        mainEvent = EventData.createFromSABASource(srcMainEvents[0], allMarketJsonData.markets, null, favEvents, memberOddsType);
        //用全部玩法數據 生成子比賽
        const srcSideEvents = allEventsJsonData.events.filter(ev => !ev.isMainMarket); //子比賽
        const sideEvents = srcSideEvents.map(ev => EventData.createFromSABASource(ev, allMarketJsonData.markets, null, favEvents, memberOddsType));
        if (sideEvents && sideEvents.length > 0) {
          mainEvent.SABAMergeSideEvents(sideEvents);
        }

        //排序投注線
        mainEvent.SABASortLines();
      }

      //獲取直播數據
      if (!this.tokenService.isAnonymous() //匿名拿不到直播數據，不用查api，但是如果HasLiveStreaming=true要保持不動，這樣在UI上才可點->引導用戶去登入/註冊
        && mainEvent.HasLiveStreaming
        && mainEvent.ExtraInfo && mainEvent.ExtraInfo.streamingOption && mainEvent.ExtraInfo.channelCode //要有直播源參數
        && (!mainEvent.LiveStreamingUrl || mainEvent.LiveStreamingUrl.length <=0) //沒有直播鏈接才查詢
      ) {
        const queryOption = {
          params: {
            sportType: mainEvent.SportId,
            streamingOption: mainEvent.ExtraInfo.streamingOption,
            channelCode: mainEvent.ExtraInfo.channelCode,
          }
        }

        const jsonResult =
          await this._SABASportFetch(SABADataTypes.STREAMING, queryOption)
            .catch(e => {
              //忽略錯誤
            })

        if (jsonResult) {
          //數組格式
          let tmpUrls = [];
          if (jsonResult.streamingUrlCN) {
            tmpUrls.push({ type: 'CN', Url: jsonResult.streamingUrlCN });
          }
          if (jsonResult.streamingUrlNonCN) {
            tmpUrls.push({ type: 'NonCN', Url: jsonResult.streamingUrlNonCN});
          }
          //app不使用h5
          if (jsonResult.streamingUrlH5 && !envSettings.isApp) {
            tmpUrls.push({ type: 'H5', Url: jsonResult.streamingUrlH5});
          }
          if (jsonResult.streamingUrl) {
            tmpUrls.push({ type: 'URL', Url: jsonResult.streamingUrl});
          }
          if (tmpUrls.length > 0) {
            mainEvent.LiveStreamingUrl = tmpUrls;
          }
        }

        //找不到url 也視為無直播數據
        if (!mainEvent.LiveStreamingUrl) {
          mainEvent.HasLiveStreaming = false;
        }
      }

      const cahceKey = this._getDataCacheKey('getEventDetail',{SportId,EventId})
      const oldDatas = this._DataCache[cahceKey];

      //比對差異
      let changes = [];
      if (oldDatas) {
        //變更 有變化的才紀錄
        if (JSON.stringify(oldDatas) !== JSON.stringify(mainEvent)) {
          changes.push(new EventChangeData(mainEvent.EventId, EventChangeType.Update, oldDatas, mainEvent));
        }
      }

      //記錄新數據
      this._DataCache[cahceKey] = mainEvent;
      //複製一份 不要和保存的內容共用實例
      const cloneEventDatas = EventData.clone(mainEvent);

      return new PollingResult(cloneEventDatas,changes);

    } else {
      return new PollingResult(null);
    }
  }

  //獲取多個比賽信息，傳入為EventInfo數組(支持不同體育項目和 一般/優勝冠軍 賽事混查)， 返回為 PollingResult 格式(支持比對數據變化)
  //(按目前用法，這裡先不返回所有玩法，只返回主要玩法，之後如果有需求，再按上面getEventDetail的方式去額外調用GetMarkets)
  //額外提供一個noMarkets參數，用來單純查詢event數據(只需要查詢球賽狀況，不用看投注)
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

    //按體育和優勝冠軍分組
    let eventIdsBySportAndOutRight = {};
    EventInfos.map(item => {
      if (!eventIdsBySportAndOutRight[item.SportId]) {
        eventIdsBySportAndOutRight[item.SportId] = {normal: [], outright: []}; //裡面還要分 一般賽事 跟 優勝冠軍賽事
      }
      if (item.IsOutRightEvent) {
        eventIdsBySportAndOutRight[item.SportId].outright.push(item.EventId);
      } else {
        eventIdsBySportAndOutRight[item.SportId].normal.push(item.EventId);
      }
    })

    let promiseArr = [];
    for(let sportId in eventIdsBySportAndOutRight) {
      if (eventIdsBySportAndOutRight[sportId]) {
        //分體育項目

        //查優勝冠軍
        if (eventIdsBySportAndOutRight[sportId].outright && eventIdsBySportAndOutRight[sportId].outright.length >0) {
          const outrightPromise = this._getOutRightEvents(sportId, null, eventIdsBySportAndOutRight[sportId].outright);
          promiseArr.push(outrightPromise);
        }
        //查一般比賽
        if (eventIdsBySportAndOutRight[sportId].normal && eventIdsBySportAndOutRight[sportId].normal.length >0) {

          const pageSize = 50; //SABA固定一頁50

          const memberOddsType = this.getMemberSetting().oddsType;

          let queryString = '$filter=';
          //體育類型
          queryString += `sportType eq ${sportId}`;
          //逗號分隔，單引號包起來
          const eventIdsJoins = eventIdsBySportAndOutRight[sportId].normal.join("','");
          //比賽id
          queryString += `and eventId in ('${eventIdsJoins}')`;

          let params = {};
          if (noMarkets) {
            params.includeMarkets = "$filter=bettype eq 0";  //用 = 一個不存在的玩法 去過濾掉所有market
          }

          const eventCount = eventIdsBySportAndOutRight[sportId].normal.length;

          //分頁查
          let queryPromises = [];
          const maxPageNo = Math.ceil(eventCount / pageSize);
          for (let currentPageNo = 1; currentPageNo <= maxPageNo; currentPageNo++) {
            let thisSkipValue = (currentPageNo - 1) * pageSize;
            let thisQueryString = queryString + `&$skip=${thisSkipValue}&$top=${pageSize}`;

            let thisPromise = this._SABASportFetch(SABADataTypes.EVENTS, {
              query: thisQueryString,
              params: params
            })

            queryPromises.push(thisPromise);
          }

          const normalPromise = Promise.all(queryPromises)
            .then(async resultArray => {
              let AllEventDatas = [];
              const favEvents = await this.getFavouriteEvents();
              resultArray.map(jsonData => {
                const EventDatas = jsonData.events.map(eventData => {
                  return EventData.createFromSABASource(eventData, jsonData.markets, null, favEvents, memberOddsType)
                });
                AllEventDatas = AllEventDatas.concat(EventDatas);
              })

              if (!noMarkets) {
                //排序投注線
                if (AllEventDatas && AllEventDatas.length > 0) {
                  AllEventDatas.map(item => {
                    item.SABASortLines();
                  })
                }
              }

              const cahceKey = this._getDataCacheKey('getEventsDetail',{SportId:sportId,eventIds:eventIdsBySportAndOutRight[sportId].normal})
              const oldDatas = this._DataCache[cahceKey];

              //比對差異
              let changes = [];
              if (oldDatas) {
                let newEventIds = AllEventDatas.map(ev => ev.EventId);
                let oldEventMap = {}
                oldDatas.map(oev => {
                  oldEventMap[oev.EventId] = oev;
                  //已刪除
                  if (newEventIds.indexOf(oev.EventId) === -1) {
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

              //記錄新數據
              this._DataCache[cahceKey] = AllEventDatas;
              //複製一份 不要和保存的內容共用實例
              const cloneEventDatas = AllEventDatas.map(ev => EventData.clone(ev));

              return new PollingResult(cloneEventDatas, changes)
            });

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
    //改用輪詢 獲取正確數據
    const dataQuery = () => this.configs.VL ? this.getSportsNew() : this.getSports();
    return this._registerPolling('getSportsPolling',{}, dataQuery, onUpdateCallback, 30, uniqueName, true);
  }

  /**
   * 全局 輪詢獲取比賽數據
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
  getEventsPollingGlobal(subscriberName, onUpdateCallback, SportId = SABASports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null, extraConfigs= {}, uniqueName = '') {
    return this._subscribeGlobalPolling('getEventsPolling', subscriberName, onUpdateCallback,{SportId,MarketId,sortWay,startDate,endDate,extraConfigs},uniqueName,true);
  }

  /**
   * 獲取比賽數據 GET版本，SABA匿名不支持SSE所以要分開
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
  getEventsPolling_GET(onUpdateCallback, SportId = SABASports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null, extraConfigs= {}, uniqueName = '') {
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

          return new PollingResult(eventDatas, eventChanges, true, {
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

      if ([SABASports.SOCCER, SABASports.BASKETBALL, SABASports.WCP2022].indexOf(SportId) === -1) {
        //只有足球和籃球支持緩存 世界杯2022也支持
        return new Promise(resolve => resolve(null));
      }

      //用緩存API 加速
      return this.getPreCacheEventsFromCacheAPI(SportId, MarketId, sortWay, startDate, endDate);
    }

    let intervalSeconds = 10;
    if (MarketId === VendorMarkets.EARLY) {
      // 新api 早盤 60秒一次
      intervalSeconds = this.configs.VL ? 1*60 : 4*60; //SABA早盤更新頻率改為4分一次
    }
    const useCache = this.configs.VL ? false : true;
    return this._registerPolling('getEventsPolling', {SportId, MarketId, sortWay, startDate, endDate, extraConfigs}, dataQuery, onUpdateCallback, intervalSeconds, uniqueName, useCache, 9*60, preCacheQuery);

  }

  //獲取 預緩存 賽事 返回為 PollingResult 格式(不支持比對數據變化)
  async getPreCacheEventsFromCacheAPI(SportId = SABASports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null) {
    const OddsType = this.getMemberSetting().oddsType;

    //獲取收藏賽事
    const favEvents = await this.getFavouriteEvents();
    const favEventsForThisSport = favEvents.filter(item => item.SportId === SportId);
    const favEventIdsForThisSport = favEventsForThisSport.map(item => item.EventId);

    const eventDatas = await fetch(HostConfig.Config.CacheApi + '/events/saba/'
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


  /**
   * 獲取比賽數據 SSE版本，SABA匿名不支持SSE所以要分開
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
  getEventsPolling_SSE(onUpdateCallback, SportId = SABASports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null, extraConfigs= {}, uniqueName = '') {
    //由於 關注(收藏) 用的是輪詢，其他Market用的是推送，這裡還要特別處理market更換時，先把現有的 輪詢/推送 清除
    const oldCacheKey =  'getEventsPolling' + '_' + uniqueName;
    this.deletePolling(oldCacheKey);

    if (MarketId === VendorMarkets.FAVOURITE) { //關注(收藏)另外處理
      return this._getEventsPollingForFavourite(onUpdateCallback,SportId,sortWay,startDate,endDate,uniqueName);
    }

    //加速:從緩存中優先獲取數據
    const queryParams = {SportId,MarketId,sortWay,startDate,endDate};
    const cachedResultKey = 'getEventsPolling' + '_' + uniqueName + '_' + md5(JSON.stringify(queryParams));
    const cachedResult = this._cacheGet(cachedResultKey , null);
    if (cachedResult) {
      //回調通知數據更新
      if (onUpdateCallback) {
        try {
          //console.log('===from cache',JSON.parse(JSON.stringify(cachedResult)))
          onUpdateCallback(cachedResult);
        } catch (e) {
          console.log('callback error', e);
        }
      }
    }

    //公用函數:查詢完成後，更新關注比賽
    //等待查詢完成的時間差，可能會點擊新增/刪除收藏賽事，需要額外處理
    const updateFavEvents = (latestFavList, srcFavEvents, srcEvents) => {
      if (this.isAPIServer()) { //API服務器不需要查看關注比賽
        return srcFavEvents;
      }

      const currentFavEventsForThisSport = latestFavList.filter(item => item.SportId === SportId);
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
        //添加額外的關注比賽
        favEvents = favEvents.concat(extraFavEvents);
        //重新排序
        EventData.sortEvents(favEvents,sortWay);
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

        const favMergedResult = new PollingResult(eventDatas,eventChanges);

        //回調通知數據更新
        if (onUpdateCallback) {
          try {
            //console.log('===getEventsPolling Fav UPDATE',JSON.parse(JSON.stringify(favMergedResult)))
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

      //似乎會收到奇怪格式的update，放棄這個數據
      if (!updates || !updates.payload) {
        console.log('===abort update due to it is not correct format???',JSON.parse(JSON.stringify(updates)))
        return;
      }

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

      //開始處理數據
      for(let thisUpdates of updateStacks) {
        if (thisUpdates.status === 1) {
          //saba提供的initial data初始數據沒用，因為event最高只返回50個
          //console.log('====getEventsPolling ignore initial data',JSON.parse(JSON.stringify(thisUpdates)));
          continue;
        }

        const data = thisUpdates.payload;

        //取出儲存的數據
        let CachedData = cacheInfo.data;

        // const cloneData = {};
        // let datastatus = {};
        // if (data) {
        //   ['events','markets'].map(p1 => {
        //     if (data[p1]) {
        //       ['add','change','remove'].map(p2 => {
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

        //套用差異更新

        //先處理比賽，再處理市場(=LINE投注線)

        //刪除比賽
        const DeletedEIds = data.events.remove ? data.events.remove.map(remove => {
          //紀錄EventChangeData
          eventChanges.push(new EventChangeData(remove,EventChangeType.Delete));
          return remove;
        }) : [];
        if (DeletedEIds && DeletedEIds.length > 0) {
          //刪除收藏
          //console.log('====remove fav event from getEventsPolling->updateHandler')
          hasDeletedFavourite = await this.removeFavouriteEvent(DeletedEIds);

          CachedData = CachedData.filter(eventData => {
            return (DeletedEIds.indexOf(eventData.EventId) === -1);
          })
        }

        //新增比賽
        if (data.events.add && data.events.add.length >0) {
          data.events.add.map(add => {
            //先檢查是否存在
            let targetIndex = null;

            //不能用entires寫法 RN安卓不支持
            //for (const [index, eventData] of CachedData.entries()) {
            if (CachedData && CachedData.length > 0) {
              for (let ii = 0; ii < CachedData.length; ii++) {
                const index = ii;
                const eventData = CachedData[ii];
                if (eventData.EventId === add.eventId) {
                  targetIndex = index;
                  break;
                }
              }
            }

            if (targetIndex !== null) {
              const oldData = EventData.clone(CachedData[targetIndex]);
              const newData = EventData.createFromSABAChange(add, oldData, favEvents);
              CachedData[targetIndex] = newData;

              //有變化的才紀錄EventChangeData
              if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
                eventChanges.push(new EventChangeData(add.id, EventChangeType.Update, oldData, newData, add));
              } else {
                //console.log('===GOT Event add=>Change BUT NO CHANGES?',oldData,add)
              }
            } else {
              //不存在 才新增 (投注線先放空，後面會處理)
              const addData = EventData.createFromSABASource(add, [], null, favEvents, memberOddsType);
              CachedData.push(addData);
              //紀錄EventChangeData
              eventChanges.push(new EventChangeData(add.eventId, EventChangeType.New, null, addData));
            }
          })
        }
        //更新比賽
        if (data.events.change && data.events.change.length >0) {
          data.events.change.map(change => {
            let targetIndex = null;

            //不能用entires寫法 RN安卓不支持
            //for (const [index, eventData] of CachedData.entries()) {
            if (CachedData && CachedData.length > 0) {
              for (let ii = 0; ii < CachedData.length; ii++) {
                const index = ii;
                const eventData = CachedData[ii];
                if (eventData.EventId === change.eventId) {
                  targetIndex = index;
                  break;
                }
              }
            }

            if (targetIndex !== null) {
              const oldData = EventData.clone(CachedData[targetIndex]);
              const newData = EventData.createFromSABAChange(change, oldData, favEvents);
              CachedData[targetIndex] = newData;

              //有變化的才紀錄EventChangeData
              if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
                eventChanges.push(new EventChangeData(change.eventId, EventChangeType.Update, oldData, newData, change));
              } else {
                //console.log('===GOT Event Change BUT NO CHANGES?', oldData, change)
              }
            } else {
              //console.log('====GOT Event Change BUT Event NOT FOUND??', change.id, change)
            }
          })
        }

        //刪除Market(LINE投注線)
        const DeletedMIds = data.markets.remove ? data.markets.remove.map(remove => {
          return remove;
        }) : [];
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
              //紀錄EventChangeData
              eventChanges.push(new EventChangeData(oldEventData.EventId,EventChangeType.Update,oldEventData,CachedData[eventIndex],{removeLine:data.markets.remove}));
            }
          })
        }

        //新增Market(LINE投注線)
        if(data.markets.add && data.markets.add.length > 0) {
          data.markets.add.map(add => {
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
                  if (lineData.LineId === add.marketId) {
                    targetIndex = index;
                    break;
                  }
                }
              }

              const oldEventData = EventData.clone(eventData);

              if (targetIndex !== null) {
                const oldLineData = LineData.clone(eventData.Lines[targetIndex]);
                CachedData[eventIndex].Lines[targetIndex] = LineData.createFromSABAAdd(add, oldEventData, memberOddsType);
                //有變化的才紀錄EventChangeData
                if (JSON.stringify(oldLineData) !== JSON.stringify(CachedData[eventIndex].Lines[targetIndex])) {
                  eventChanges.push(new EventChangeData(oldEventData.EventId, EventChangeType.Update, oldEventData, CachedData[eventIndex], {addLine: add}));
                } else {
                  //console.log('===GOT Event-LINE add=>Change BUT NO CHANGES?', oldLineData, add);
                }
              } else {
                //不存在 才新增
                const addLineData = LineData.createFromSABAAdd(add, oldEventData, memberOddsType)
                CachedData[eventIndex].Lines.push(addLineData);
                CachedData[eventIndex].updateLineGroupCount();

                //紀錄EventChangeData
                eventChanges.push(new EventChangeData(oldEventData.EventId, EventChangeType.Update, oldEventData, CachedData[eventIndex], {addLine: add}));
              }

            } else {
              //console.log('==== GOT Event-Line add BUT Event NOT FOUND??', change)
            }
          })
        }
        //更新Market(LINE投注線)
        if (data.markets.change && data.markets.change.length > 0) {
          data.markets.change.map(change => {
            //先檢查是Event是否存在
            let eventIndex = null;
            //不能用entires寫法 RN安卓不支持
            //for (const [cachedEventIndex, cachedEventData] of CachedData.entries()) {
            if (CachedData && CachedData.length > 0) {
              for (let ii = 0; ii < CachedData.length; ii++) {
                const cachedEventIndex = ii;
                const cachedEventData = CachedData[ii];
                //if (cachedEventData.EventId === change.eventId) {  //change數據不會有evnetId 所以不能用這個寫法
                if (cachedEventData.Lines.filter(l => l.LineId === change.marketId).length > 0) {
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
                  if (lineData.LineId === change.marketId) {
                    targetIndex = index;
                    break;
                  }
                }
              }

              if (targetIndex !== null) {
                const oldEventData = EventData.clone(eventData);

                const oldLineData = LineData.clone(eventData.Lines[targetIndex]);
                CachedData[eventIndex].Lines[targetIndex] = LineData.createFromSABAChange(change, oldEventData, memberOddsType);

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
        }
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
            item.SABASortLines(); //直接排序即可(主要lineLevel小排到大，UI會自動取第一個)
          })

          eventDatas = cloneEventDatas;

          //重新排序
          EventData.sortEvents(eventDatas, sortWay);
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

        const result = new PollingResult(eventDatas, eventChanges);

        //console.log('===set Cached data for getEventsPolling');
        this._cacheSet(cachedResultKey,result); //加速:緩存9分

        //回調通知數據更新
        if (onUpdateCallback) {
          try {
            //console.log('===getEventsPolling SSE UPDATE',JSON.parse(JSON.stringify(result)))
            onUpdateCallback(result);
          } catch (e) {
            console.log('callback error', e);
          }
        }
      }
    }

    let {queryString, params} = this._getEventQueryInfo(SportId,MarketId,SortWays.None,startDate,endDate,[],true);  //訂閱不能排序

    const queryOptions = {
      query: queryString,
      params: params
    }

    //紀錄查詢參數
    cacheInfo.params = [{SportId,MarketId,sortWay,startDate,endDate},queryOptions];

    const subscriptionPromise =  this._SABASportFetch(SABADataTypes.EVENTS,queryOptions,updateHandler);

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
      const sportDatas = pollingResult.NewData.filter(item => parseInt(item.SportId) === SportId);
      let eventCount = 0;
      if (sportDatas && sportDatas.length > 0 && sportDatas[0].Markets) {
        const marketDatas = sportDatas[0].Markets.filter(item => item.MarketId === MarketId)
        if(marketDatas && marketDatas.length > 0) {
          eventCount = marketDatas[0].Count;
        }
      }

      const pageSize = 50; //SABA固定一頁50
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
          let firstPromise = this._SABASportFetch(SABADataTypes.EVENTS, thisQueryOptions);
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
          const data = first_jsonData;
          let eventDatas = data.events.map(eventData => {
            return EventData.createFromSABASource(eventData, data.markets, null, currentFavEvents, memberOddsType)
          });
          //排序投注線(注意這個在return前才最後處理，不要動到Cache的數據)
          if (eventDatas && eventDatas.length > 0) {
            const cloneEventDatas =eventDatas.map(ev => EventData.clone(ev))

            cloneEventDatas.map(item => {
              item.SABASortLines(); //直接排序即可(主要lineLevel小排到大，UI會自動取第一個)
            })

            eventDatas = cloneEventDatas;

            //重新排序
            EventData.sortEvents(eventDatas,sortWay);
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

          //回調通知數據更新
          if (onUpdateCallback) {
            try {
              //console.log('===first_result',JSON.parse(JSON.stringify(first_result)))
              onUpdateCallback(first_result);
            } catch (e) {
              console.log('callback error', e);
            }
            await new Promise(r => setTimeout(r, 1000)); //停一下，讓前端優先render
          }

        } else {
          let thisPromise = this._SABASportFetch(SABADataTypes.EVENTS, thisQueryOptions);
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
          const data = jsonData;
          const EventDatas = data.events.map(eventData => {
            return EventData.createFromSABASource(eventData, data.markets, null, currentFavEvents, memberOddsType)
          });
          AllEventDatas = AllEventDatas.concat(EventDatas);
        })

        //緩存數據
        this._PushCache[cacheKey].data = AllEventDatas;

        let eventDatas = this._PushCache[cacheKey].data;

        //排序投注線(注意這個在return前才最後處理，不要動到Cache的數據)
        if (eventDatas && eventDatas.length > 0) {
          const cloneEventDatas =eventDatas.map(ev => EventData.clone(ev))

          cloneEventDatas.map(item => {
            item.SABASortLines(); //直接排序即可(主要lineLevel小排到大，UI會自動取第一個)
          })

          eventDatas = cloneEventDatas;

          //重新排序
          EventData.sortEvents(eventDatas,sortWay);
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

        const result = new PollingResult(eventDatas);

        //console.log('===set Cached data for getEventsPolling init');
        this._cacheSet(cachedResultKey,result); //加速:緩存9分

        //回調通知數據更新
        if (onUpdateCallback) {
          try {
            //console.log('===initial_result',JSON.parse(JSON.stringify(result)))
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

  //輪詢獲取比賽數據(SABA是推送) 關注(收藏)專用版
  _getEventsPollingForFavourite(onUpdateCallback, SportId = SABASports.SOCCER, sortWay = SortWays.LeagueName, startDate = null, endDate = null, uniqueName = '') {
    const MarketId = VendorMarkets.FAVOURITE;
    //推送無法更新推送條件，這在收藏比賽的變更偵測  會有問題，改成用輪詢處理
    const dataQuery = () => this.getEvents(SportId, MarketId, sortWay, startDate, endDate);
    return this._registerPolling('getEventsPolling', {SportId, MarketId, sortWay, startDate, endDate}, dataQuery, onUpdateCallback, 10, uniqueName, true);
  }

  /**
   * 獲取比賽數據 SABA 分匿名(GET) 和登入後(SSE)
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
  getEventsPolling(onUpdateCallback, SportId = SABASports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null, extraConfigs= {}, uniqueName = '') {
    //暫時沒想到 怎麼不轉為async函數 又可以等待tokenservice判斷是否匿名
    //先統一用GET方式，等匿名也支持SSE再換
    return this.getEventsPolling_GET(onUpdateCallback, SportId, MarketId, sortWay, startDate, endDate, extraConfigs, uniqueName);
    //return this.getEventsPolling_SSE(onUpdateCallback, SportId, MarketId, sortWay, startDate, endDate, extraConfigs, uniqueName);
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
  APIEventsPollingWithAutoClean(onUpdateCallback, SportId = SABASports.SOCCER, MarketId = VendorMarkets.EARLY, sortWay = SortWays.LeagueName, startDate = null, endDate = null, uniqueName = '') {
    const callWithAutoClean = (currentPollingKey = null) => {
      if (currentPollingKey) {
        //console.log('SABA delete polling...');
        this.deletePolling(currentPollingKey);
      }

      //SABA是輪詢而且每次都取代全部數據，沒有差異pull/push，所以不用特別處理清空

      //console.log('SABA start polling...');
      const newPollingKey = this.getEventsPolling(onUpdateCallback,SportId,MarketId,sortWay,startDate,endDate,{},uniqueName);
      //暫定10分刷新一次
      setTimeout(() => callWithAutoClean(newPollingKey), 10*60*1000);
    }
    callWithAutoClean();
  }

  /**
   * 輪詢獲取 單個 比賽數據 GET版本，SABA匿名不支持SSE所以要分開
   *
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData: 單個EventData數據, Changes: 單個EventChangeData數據}
   * @param SportId           體育項目ID
   * @param EventId           比賽ID
   * @param isOutRightEvent   是否優勝冠軍賽事
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventDetailPolling_GET(onUpdateCallback, SportId = SABASports.SOCCER, EventId, isOutRightEvent= false, uniqueName = '') {
    const dataQuery = () => this.getEventDetail(SportId, EventId, isOutRightEvent);
    return this._registerPolling('getEventDetailPolling', {SportId, EventId, isOutRightEvent}, dataQuery, onUpdateCallback, 10, uniqueName, true);
  }

  /**
   * 獲取 單個 比賽數據 SSE版本，SABA匿名不支持SSE所以要分開
   *
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData: 單個EventData數據, Changes: 單個EventChangeData數據}
   * @param SportId           體育項目ID
   * @param EventId           比賽ID
   * @param isOutRightEvent   是否優勝冠軍賽事
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventDetailPolling_SSE(onUpdateCallback, SportId = SABASports.SOCCER, EventId, isOutRightEvent= false, uniqueName = '') {
    //優勝冠軍走原本的輪詢模式
    if (isOutRightEvent) {
      const dataQuery = () => this.getEventDetail(SportId, EventId, isOutRightEvent);
      return this._registerPolling('getEventDetailPolling', {SportId, EventId, isOutRightEvent}, dataQuery, onUpdateCallback, 10, uniqueName, true);
    }

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

      const data = updates.payload;

      let eventChanges =[];

      let eventNotFound = true;
      //處理初始數據
      if (updates.status === 1) {
        //處理第一次返回的初始數據(新增比賽)
        if (data.events && data.events.add.length >= 1) {
          //可能會返回多個，包含不同EventGroup的數據
          const srcMainEvents = data.events.add.filter(ev => ev.isMainMarket); //主要比賽
          const favEvents = await this.getFavouriteEvents();
          const memberOddsType = this.getMemberSetting().oddsType;
          if (srcMainEvents && srcMainEvents.length >0) {
            eventNotFound = false;
            const mainEvent = EventData.createFromSABASource(srcMainEvents[0], data.markets.add, null, favEvents, memberOddsType);
            //合併子比賽
            const srcSideEvents = data.events.add.filter(ev => !ev.isMainMarket); //子比賽
            const sideEvents = srcSideEvents.map(ev => EventData.createFromSABASource(ev, data.markets.add, null, favEvents, memberOddsType));
            if (sideEvents && sideEvents.length > 0) {
              mainEvent.SABAMergeSideEvents(sideEvents);
            }

            //排序投注線
            mainEvent.SABASortLines();

            //獲取直播數據
            if (!this.tokenService.isAnonymous() //匿名拿不到直播數據，不用查api，但是如果HasLiveStreaming=true要保持不動，這樣在UI上才可點->引導用戶去登入/註冊
              && mainEvent.HasLiveStreaming
              && mainEvent.ExtraInfo && mainEvent.ExtraInfo.streamingOption && mainEvent.ExtraInfo.channelCode //要有直播源參數
              && (!mainEvent.LiveStreamingUrl || mainEvent.LiveStreamingUrl.length <= 0) //沒有直播鏈接才查詢
            ) {
              const queryOption = {
                params: {
                  sportType: mainEvent.SportId,
                  streamingOption: mainEvent.ExtraInfo.streamingOption,
                  channelCode: mainEvent.ExtraInfo.channelCode,
                }
              }

              const jsonResult =
                await this._SABASportFetch(SABADataTypes.STREAMING, queryOption)
                  .catch(e => {
                    //忽略錯誤
                  })

              if (jsonResult) {
                //數組格式
                let tmpUrls = [];
                if (jsonResult.streamingUrlCN) {
                  tmpUrls.push({type: 'CN', Url: jsonResult.streamingUrlCN});
                }
                if (jsonResult.streamingUrlNonCN) {
                  tmpUrls.push({type: 'NonCN', Url: jsonResult.streamingUrlNonCN});
                }
                //app不使用h5
                if (jsonResult.streamingUrlH5 && !envSettings.isApp) {
                  tmpUrls.push({type: 'H5', Url: jsonResult.streamingUrlH5});
                }
                if (jsonResult.streamingUrl) {
                  tmpUrls.push({ type: 'URL', Url: jsonResult.streamingUrl});
                }
                if (tmpUrls.length > 0) {
                  mainEvent.LiveStreamingUrl = tmpUrls;
                }
              }
            }

            const addData = mainEvent;
            this._PushCache[cacheKey].data = addData;
            //紀錄EventChangeData
            eventChanges.push(new EventChangeData(addData.EventId, EventChangeType.New, null, addData));
          }
        }
      } else {
        //推送更新

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
          const data = thisUpdates.payload;
          //取出儲存的數據
          let CachedData = cacheInfo.data;

          // const cloneData = {};
          // let datastatus = {};
          // if (data) {
          //   ['events','markets'].map(p1 => {
          //     if (data[p1]) {
          //       ['add','change','remove'].map(p2 => {
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
          if (data.events.remove && data.events.remove.length >= 1
            && data.events.remove.filter(evid => evid === CachedData.EventId).length > 0
          ) {
            //刪除收藏
            //console.log('====remove fav event from getEventDetailPolling->updateHandler')
            hasDeletedFavourite = await this.removeFavouriteEvent(CachedData.EventId);

            eventChanges.push(new EventChangeData(CachedData.EventId, EventChangeType.Delete));
            this._PushCache[cacheKey].data = []; //清空數據
          } else {
            eventNotFound = false;
            //更新比賽
            if (data.events.change && data.events.change.length >= 1
              && data.events.change.filter(c => c.eventId === CachedData.EventId).length > 0) {
              const change = data.events.change.filter(c => c.eventId === CachedData.EventId)[0];
              const oldData = EventData.clone(CachedData);
              const favEvents = await this.getFavouriteEvents();
              const newData = EventData.createFromSABAChange(change, oldData, favEvents);
              this._PushCache[cacheKey].data = newData;

              //有變化的才紀錄EventChangeData
              if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
                eventChanges.push(new EventChangeData(change.eventId, EventChangeType.Update, oldData, newData, change));
              } else {
                //console.log('GOT Event Change BUT NO CHANGES?', oldData, change)
              }
            }

            const eventData = cacheInfo.data;
            const memberOddsType = this.getMemberSetting().oddsType;

            //刪除Market(LINE投注線)
            if (data.markets.remove && data.markets.remove.length > 0 && eventData && eventData.Lines && eventData.Lines.length > 0) {
              let NewLines = [];
              eventData.Lines.map(lineData => {
                if (data.markets.remove.indexOf(lineData.LineId) !== -1) {
                  //緩存 要刪掉的Line投注線數據，因為後面可能重新發add過來，新的數據group為空，要從舊數據補
                  //this._cacheSet('LINE_GROUP_' +  lineData.LineId,lineData.LineGroupIds,180) //保留3分鐘
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
                eventChanges.push(new EventChangeData(oldEventData.EventId, EventChangeType.Update, oldEventData, eventData, {removeLine: data.markets.remove}));
              }
            }

            //新增Market(LINE投注線)
            if(data.markets.add && data.markets.add.length > 0) {
              data.markets.add.map(add => {
                //先檢查是否存在

                let targetIndex = null;
                //不能用entires寫法 RN安卓不支持
                //for (const [index, lineData] of eventData.Lines.entries()) {
                if (eventData.Lines && eventData.Lines.length > 0) {
                  for (let ii = 0; ii < eventData.Lines.length; ii++) {
                    const index = ii;
                    const lineData = eventData.Lines[ii];
                    if (lineData.LineId === add.marketId) {
                      targetIndex = index;
                      break;
                    }
                  }
                }

                const oldEventData = EventData.clone(eventData);

                if (targetIndex !== null) {
                  const oldData = LineData.clone(eventData.Lines[targetIndex]);
                  eventData.Lines[targetIndex] = LineData.createFromSABAAdd(add, oldEventData, memberOddsType);
                  //有變化的才紀錄EventChangeData
                  if (JSON.stringify(oldData) !== JSON.stringify(eventData.Lines[targetIndex])) {
                    eventChanges.push(new EventChangeData(oldEventData.EventId, EventChangeType.Update, oldEventData, eventData, {addLine: add}));
                  } else {
                    //console.log('GOT Event-LINE Change BUT NO CHANGES?', oldData, add);
                  }
                } else {
                  //不存在 才新增
                  //const cachedLineGroupIds = this._cacheGet('LINE_GROUP_' +  add.id);
                  // if (cachedLineGroupIds) {
                  //   console.log('===got cached groupids for ', add.id, cachedLineGroupIds);
                  // }
                  const addData = LineData.createFromSABAAdd(add, oldEventData, memberOddsType)
                  eventData.Lines.push(addData);
                  eventData.updateLineGroupCount();
                  //紀錄EventChangeData
                  eventChanges.push(new EventChangeData(oldEventData.EventId, EventChangeType.Update, oldEventData, eventData, {addLine: add}));
                }
              })
            }
            //更新Market(LINE投注線)
            if (data.markets.change && data.markets.change.length > 0) {
              data.markets.change.map(change => {
                let targetIndex = null;

                //不能用entires寫法 RN安卓不支持
                //for (const [index, lineData] of eventData.Lines.entries()) {
                if (eventData.Lines && eventData.Lines.length > 0) {
                  for (let ii = 0; ii < eventData.Lines.length; ii++) {
                    const index = ii;
                    const lineData = eventData.Lines[ii];
                    if (lineData.LineId === change.marketId) {
                      targetIndex = index;
                      break;
                    }
                  }
                }

                if (targetIndex !== null) {
                  const oldEventData = EventData.clone(eventData);

                  const oldData = LineData.clone(eventData.Lines[targetIndex]);
                  eventData.Lines[targetIndex] = LineData.createFromSABAChange(change, oldEventData, memberOddsType);

                  //有變化的才紀錄EventChangeData
                  if (JSON.stringify(oldData) !== JSON.stringify(eventData.Lines[targetIndex])) {
                    eventChanges.push(new EventChangeData(oldEventData.EventId, EventChangeType.Update, oldEventData, eventData, {changeLine: change}));
                  } else {
                    //console.log('GOT Event-LINE Change BUT NO CHANGES?', oldData, change);
                  }
                }
              })
            }
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

    let queryString = '$filter=';
    //體育類型
    queryString += `sportType eq ${SportId}`;

    //比賽id 也查出子比賽
    queryString += `and ( eventId eq ${EventId} or parentId eq ${EventId} )`;

    let params = {}
    let queryOptions = {query:queryString, params}
    //紀錄查詢參數
    cacheInfo.params = [{SportId,EventId},queryOptions];

    const subscriptionPromise =  this._SABASportFetch(SABADataTypes.EVENTS,queryOptions,updateHandler);

    //紀錄推送訂閱
    cacheInfo.subscriptions = [subscriptionPromise];

    return cacheKey;//返回key
  }

  /**
   * 輪詢獲取 單個 比賽數據 SABA 分匿名(GET) 和登入後(SSE)
   *
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData: 單個EventData數據, Changes: 單個EventChangeData數據}
   * @param SportId           體育項目ID
   * @param EventId           比賽ID
   * @param isOutRightEvent   是否優勝冠軍賽事
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventDetailPolling(onUpdateCallback, SportId = SABASports.SOCCER, EventId, isOutRightEvent= false, uniqueName = '') {
    //暫時沒想到 怎麼不轉為async函數 又可以等待tokenservice判斷是否匿名
    //先統一用GET方式，等匿名也支持SSE再換
    return this.getEventDetailPolling_GET(onUpdateCallback, SportId, EventId, isOutRightEvent, uniqueName);
    //return this.getEventDetailPolling_SSE(onUpdateCallback, SportId, EventId, isOutRightEvent, uniqueName);
  }

  /**
   * 全局 輪詢獲取 多個 比賽數據
   *
   * @param subscriberName    訂閱者名稱，用來處理重複訂閱的狀況
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData: EventData數組, Changes: EventChangeData 數組}
   * @param EventInfos        要輪詢的比賽，EventInfo數組(支持不同體育項目和 一般/優勝冠軍 賽事混查)
   * @param noMarkets         額外提供一個noMarkets參數，用來單純查詢event數據(只需要查詢球賽狀況，不用看投注)
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventsDetailPollingGlobal(subscriberName, onUpdateCallback, EventInfos = [], noMarkets= false, uniqueName = '') {
    return this._subscribeGlobalPolling('getEventsDetailPolling', subscriberName, onUpdateCallback, {EventInfos, noMarkets}, uniqueName);
  }

  /**
   * 輪詢獲取 多個 比賽數據
   *
   * @param onUpdateCallback  輪詢後數據更新回調  (result) => {}  result 為 PollingResult格式 {NewData: EventData數組, Changes: EventChangeData 數組}
   * @param EventInfos        要輪詢的比賽，EventInfo數組(支持不同體育項目和 一般/優勝冠軍 賽事混查)
   * @param noMarkets         額外提供一個noMarkets參數，用來單純查詢event數據(只需要查詢球賽狀況，不用看投注)
   * @param uniqueName        用來判斷是否使用同一個輪詢，配置不同名字，可以同時開多個輪詢
   */
  getEventsDetailPolling(onUpdateCallback, EventInfos = [], noMarkets= false, uniqueName = '') {
    const dataQuery = () => this.getEventsDetail(EventInfos, noMarkets);
    return this._registerPolling('getEventsDetailPolling', {EventInfos, noMarkets}, dataQuery, onUpdateCallback, 10, uniqueName);
  }

  /**
   *
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

    //大小寫不敏感
    const keywordUpper = keyword.toUpperCase();
    const keywordLower = keyword.toLowerCase();

    //先獲取所有體育項目
    const sportsArr = await this._SABASportFetch(SABADataTypes.SPORTS,{})
      .then(jsonData => {
        const data = jsonData.sports;
        return data.map(d => ({
          SportId: parseInt(d.sportType),
          SportName: d.sportName,
          Count: d.gameCount + d.liveGameCount,
          DisplayOrder: 0,
        }))
      });

    //做成異步，需要等待每個體育項目分開查詢完成
    const getSearchSportData = async (SportInfo, keywordUpper, keywordLower ) => {

      let queryString = "$filter=sportType eq " + SportInfo.SportId
        + " and isMainMarket eq true";

      if (keywordUpper === keywordLower) {
        queryString = queryString + " and ("
        + " contains(leagueName,'" + keywordUpper + "')"
        + " or contains(homeName,'" + keywordUpper + "')"
        + " or contains(awayName,'" + keywordUpper + "')"
        + " or contains(leagueName,'" + keyword + "')"
        + " or contains(homeName,'" + keyword + "')"
        + " or contains(awayName,'" + keyword + "')"
        + ")"
      } else {
        queryString = queryString + " and ("
          + " contains(leagueName,'" + keywordUpper + "')"
          + " or contains(homeName,'" + keywordUpper + "')"
          + " or contains(awayName,'" + keywordUpper + "')"
          + " or contains(leagueName,'" + keywordLower + "')"
          + " or contains(homeName,'" + keywordLower + "')"
          + " or contains(awayName,'" + keywordLower + "')"
          + " or contains(leagueName,'" + keyword + "')"
          + " or contains(homeName,'" + keyword + "')"
          + " or contains(awayName,'" + keyword + "')"
          + ")"
      }

      let params = {};
      params.includeMarkets = "$filter=bettype eq 0";  //用 = 一個不存在的玩法 去過濾掉所有market

      //分頁查比賽數據
      const pageSize = 50; //SABA一頁50
      const maxPageNo = Math.ceil(SportInfo.Count / pageSize);
      //由於不知道count，只能一頁一頁查，用while條件去判斷要不要查下一頁

      let thisDataCount = 0;
      let currentPageNo = 1
      let allEvents = [];
      do {
        let thisSkipValue = (currentPageNo - 1) * pageSize;
        let thisQueryString = queryString + `&$skip=${thisSkipValue}&$top=${pageSize}`;

        const thisData = await this._SABASportFetch(SABADataTypes.EVENTS, { query: thisQueryString, params})
          .then(jsonData => {
            return jsonData.events;
          })
        if(thisData && Array.isArray(thisData) && thisData.length > 0) {
          allEvents = allEvents.concat(thisData);
        }
        thisDataCount = (thisData && Array.isArray(thisData)) ? thisData.length : 0;
        currentPageNo = currentPageNo +1;
      } while (thisDataCount >= 50 && currentPageNo <= maxPageNo) //最多50


      const eventDatas = allEvents.map(ev => {
        return {
          LeagueId : ev.leagueId,
          LeagueName: ev.leagueName,
          LeagueOrder: 0, //todo: saba排序
          EventId: ev.eventId,
          EventDate: EventData.getSABAEventDateUTC(ev.globalShowTime),
          HomeTeamId: ev.teamInfo ? ev.teamInfo.homeId : 0,
          HomeTeamName: ev.teamInfo ? ev.teamInfo.homeName : 'not set',
          AwayTeamId: ev.teamInfo ? ev.teamInfo.awayId : 0,
          AwayTeamName: ev.teamInfo ? ev.teamInfo.awayName : 'not set',
        }
      })

      //console.log('===eventDatas',eventDatas);

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

      let leagueArr = [];
      for(let lid in LeagueMap) {
        const thisL = LeagueMap[lid];
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

    //組成數據
    let handleDataPromises = [];
    sportsArr.map(s => {
      const thisPromise = getSearchSportData(s,keywordUpper,keywordLower);
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

    //console.log('===sportDatas',sportDatas);

    this._cacheSet(cachedResultKey,sportDatas, 3*60); //加速:緩存3分

    return sportDatas;
  }

  //數據緩存(用 查詢參數 當key)
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

    //後面有過濾，過濾完再取，會不正確  在這裡先存下
    const SelectionIds = Selections.map(item => item.SelectionId);

    //沙巴單注和串關用不同api
    let newData = null
    if(wagerType === WagerType.SINGLE) { //單注
      const thisSelection = Selections[0];
      let queryOption = {params: thisSelection.toSABASingleBetInfo()};
      let fetchUrl = SABADataTypes.SINGLETICKET;
      if (thisSelection.IsOutRightEvent) { //猜冠軍有自己的api
        queryOption = {params: thisSelection.toSABAOutRightBetInfo()};
        fetchUrl = SABADataTypes.OUTRIGHTTICKET;
      }
      newData = await this._SABABettingFetch(fetchUrl, queryOption)
        .then(jsonData => {
          const betSetting = new BetSettingData(
            jsonData.minBet,
            jsonData.maxBet,
            jsonData.price,
            0,
            1,
            'saba'
          );
          const copySelection = JSON.parse(JSON.stringify(thisSelection)); //先複製一份，改數據之後再用clone

          //更新數據
          if (jsonData.point !== undefined && jsonData.point !== '') {
            copySelection.Handicap = jsonData.point;
            copySelection.RealHandicap = jsonData.point;
          }
          if (jsonData.price !== undefined && jsonData.price !== '') {
            copySelection.Odds = jsonData.price;
            copySelection.DisplayOdds = jsonData.price;
            //更新oddsList
            copySelection.OddsList.map(item => {
              if (item.OddsType === queryOption.params.oddsType) {
                item.OddsValues = jsonData.price
              }
            })
          }
          let convertToEUOdds = false;
          if (jsonData.status) {
            copySelection.LineStatusId = (jsonData.status === 'running' ? 1 : 2); //盘口狀態 1開 2關
            copySelection.SelectionStatus = (jsonData.status === 'running' ? SelectionStatusType.OK : SelectionStatusType.NOTAVIILABLE);
            //處理 IsDecimalType 僅限歐洲盤
            if (jsonData.isDecimalType && queryOption.params.oddsType !== 3) {
              convertToEUOdds = true; //自動轉換為歐洲盤
            }
          } else {
            if (thisSelection.IsOutRightEvent) { //猜冠軍沒有回傳status
              copySelection.LineStatusId = 1; //盘口狀態 1開 2關
              copySelection.SelectionStatus = SelectionStatusType.OK;
            }
          }

          let selection = null;
          if (convertToEUOdds) {
            const euOddsNumber = SABAOddsTypeToNumber[SABAOddsType.EU];
            selection = SelectionData.clone(copySelection, euOddsNumber); //利用clone重新配置

            //如果自動轉換歐洲盤失敗，才報錯
            if (selection.OddsType !== euOddsNumber) {
              copySelection.SelectionStatus = SelectionStatusType.EUODDSONLY;
              selection = SelectionData.clone(copySelection); //利用clone重新配置
            }
          } else {
            selection = SelectionData.clone(copySelection); //利用clone重新配置
          }

          //要用數組型態傳入
          return BetInfoData.createFromSABASource([betSetting], [selection]);
        }).catch(async error => {
          if (typeof error === 'object' && error.isVendorError === true) {
            //報錯就視為關閉，文件沒提供可能的錯誤，後面有發現，再另外處理
            console.log('=== GET BET_Selection_Error');
            const thisSelections = Selections.map(item => {
              const copy = JSON.parse(JSON.stringify(item));
              copy.SelectionStatus = SelectionStatusType.NOTAVIILABLE //標記為不可用
              return SelectionData.clone(copy) //利用clone重新配置數據
            });

            return BetInfoData.createFromSABASource(
              null,
              thisSelections,
            )
          }
          throw error; //沒有特別指定要處理的 就繼續往外丟出例外
        })
    } else { //串關

      let notOpenParlySelections = []; //先記錄起來，最後要返回
      let notEUSelections = [];
      let need3ComboSelections = [];

      //console.log('====parlay Selections', JSON.parse(JSON.stringify(Selections)));

      //需要過濾未開放串關的投注選項
      notOpenParlySelections = Selections.filter(s => !s.IsOpenParlay);
      const openParlaySelections = Selections.filter(s => s.IsOpenParlay);
      Selections = openParlaySelections;

      //串關需要全部轉為歐洲盤
      const euOddsNumber = SABAOddsTypeToNumber[SABAOddsType.EU];
      const euSelections = Selections.map(sel => SelectionData.clone(sel, euOddsNumber));
      //過濾掉沒有成功轉為歐洲盤的選項
      notEUSelections = euSelections.filter(s => s.OddsType !== euOddsNumber).map(s => {
        const copy = JSON.parse(JSON.stringify(s));
        copy.SelectionStatus = SelectionStatusType.EUODDSONLY; //設置為歐洲盤限定
        return SelectionData.clone(copy) //利用clone重新配置數據
      })
      Selections = euSelections.filter(s => s.OddsType === euOddsNumber); //換成歐洲盤

      //赛事串关数量限制   0: 该盘口不支持串关 2: 下注时最少需要选2种组合  3: 下注时最少需要选3种组合
      //檢查有沒有需要3個才能串的Selection
      if (Selections && Selections.length > 0 && Selections.length <3) {
        need3ComboSelections = Selections.filter(s => s.ExtraInfo && s.ExtraInfo.combo && s.ExtraInfo.combo == 3).map(s => {
          const copy = JSON.parse(JSON.stringify(s));
          copy.SelectionStatus = SelectionStatusType.NEED3COMBO; //設置為 最少選3個
          return SelectionData.clone(copy) //利用clone重新配置數據
        })
        const noNeed3ComboSelections = Selections.filter(s => !s.ExtraInfo || !s.ExtraInfo.combo || s.ExtraInfo.combo != 3);
        Selections = noNeed3ComboSelections;
      }


      //過濾完之後可能Selections會沒數據
      if (Selections && Selections.length > 0) {
        const parlayTickets = Selections.map(s => s.toSABAParlayBetInfo());
        const queryOption = {POST: true, jsonBody: JSON.stringify({parlayTickets})}
        newData = await this._SABABettingFetch(SABADataTypes.PARLAYTICKETS, queryOption)
          .then(jsonData => {
            const betSettings = jsonData.combos.map(cb => {
              return new BetSettingData(
                cb.minBet,
                cb.maxBet,
                cb.price,
                cb.comboType,
                cb.betCount,
                'saba'
              );
            });

            let selections = Selections.map(sourceSelectionData => {
              const targetPriceInfos = jsonData.priceInfo ? jsonData.priceInfo.filter(wsi =>
                sourceSelectionData.SportId == wsi.sportType
                && sourceSelectionData.LineId == wsi.marketId
                && sourceSelectionData.SelectionType == wsi.key
                && sourceSelectionData.RealHandicap == wsi.point
              ) : null;

              if (targetPriceInfos && targetPriceInfos.length > 0) {
                //有對應的返回數據
                let priceInfo = targetPriceInfos[0];
                const copySelection = JSON.parse(JSON.stringify(sourceSelectionData)); //先複製一份，改數據之後再用clone
                //更新數據
                if (priceInfo.point !== undefined && priceInfo.point !== '') {
                  copySelection.Handicap = priceInfo.point;
                  copySelection.RealHandicap = priceInfo.point;
                }
                if (priceInfo.currentPrice !== undefined && priceInfo.currentPrice !== '') {
                  copySelection.Odds = priceInfo.currentPrice;
                  copySelection.DisplayOdds = priceInfo.currentPrice;
                  //更新oddsList
                  copySelection.OddsList.map(item => {
                    if (item.OddsType === euOddsNumber) { //串關統一為歐洲盤
                      item.OddsValues = priceInfo.currentPrice;
                    }
                  })
                }
                if (priceInfo.status) {
                  copySelection.LineStatusId = (priceInfo.status === 'running' ? 1 : 2); //盘口狀態 1開 2關
                  copySelection.SelectionStatus = (priceInfo.status === 'running' ? SelectionStatusType.OK : SelectionStatusType.NOTAVIILABLE);
                }

                if (copySelection.SelectionStatus === SelectionStatusType.OK) {
                  //stateCode
                  // 0：OK
                  // 6：Point is expired
                  // 12：Odds suspend
                  // 18：In play changed
                  // 22：Score change
                  // 23：Point change
                  if (priceInfo.stateCode !== undefined && priceInfo.stateCode != 0) { //不是零，就不能投注
                    copySelection.SelectionStatus = SelectionStatusType.NOTAVIILABLE;
                  }
                }

                return SelectionData.clone(copySelection); //利用clone重新配置
              } else {
                //找不到就直接複製，然後設置為不可用
                const copy = JSON.parse(JSON.stringify(sourceSelectionData));
                copy.SelectionStatus = SelectionStatusType.NOTAVIILABLE; //設置為不可用
                return SelectionData.clone(copy) //利用clone重新配置數據
              }
            });

            //檢查是否有stateCode不為零的，也不允許投注
            let allowToBet = true;
            if (jsonData.priceInfo && (jsonData.priceInfo.filter(pi => pi.stateCode !== undefined && pi.stateCode != 0).length > 0)) {
              allowToBet = false;
            }

            //串關 補回之前過濾掉的投注選項(不支持串關+不是歐洲盤)
            if (notOpenParlySelections && notOpenParlySelections.length > 0) {
              selections = selections.concat(notOpenParlySelections);
            }
            if (notEUSelections && notEUSelections.length > 0) {
              selections = selections.concat(notEUSelections);
            }
            if (need3ComboSelections && need3ComboSelections.length > 0) {
              selections = selections.concat(need3ComboSelections);
            }

            return BetInfoData.createFromSABASource(
              (betSettings.length > 0 && allowToBet) ? betSettings : null, //如果API返回的投注選項有問題，就禁止投注-視為沒有BetSettings
              selections
            );
          })
          .catch(e => {
            let errorSelections = Selections.map(item => {
              const copy = JSON.parse(JSON.stringify(item));
              copy.SelectionStatus = SelectionStatusType.NOTAVIILABLE //標記為不可用
              return SelectionData.clone(copy) //利用clone重新配置數據
            });

            //串關 補回之前過濾掉的投注選項(不支持串關+不是歐洲盤)
            if (notOpenParlySelections && notOpenParlySelections.length > 0) {
              errorSelections = errorSelections.concat(notOpenParlySelections);
            }
            if (notEUSelections && notEUSelections.length > 0) {
              errorSelections = errorSelections.concat(notEUSelections);
            }
            if (need3ComboSelections && need3ComboSelections.length > 0) {
              errorSelections = errorSelections.concat(need3ComboSelections);
            }

            return BetInfoData.createFromSABASource(
              null,
              errorSelections,
            )
          })
      } else {
        //Selections為空  不用查  直接返回

        let newSelections = [];
        //串關 補回之前過濾掉的投注選項(不支持串關+不是歐洲盤)
        if (notOpenParlySelections && notOpenParlySelections.length > 0) {
          newSelections = newSelections.concat(notOpenParlySelections);
        }
        if (notEUSelections && notEUSelections.length > 0) {
          newSelections = newSelections.concat(notEUSelections);
        }
        if (need3ComboSelections && need3ComboSelections.length > 0) {
          newSelections = newSelections.concat(need3ComboSelections);
        }
        newData = BetInfoData.createFromSABASource(
          null,
          newSelections,
        )
      }
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

  //輪詢 滾球注單狀態 緩存，目前只拿來記錄重試次數
  _getWagerStatusCache = {}

  //輪詢 滾球注單狀態
  async _getWagerStatusPolling(wagerId, testFuncs = [], maxRetryCount = 30, uniqueName = ''){
    const thisCacheKey = wagerId + uniqueName;
    this._getWagerStatusCache[thisCacheKey] = {retryCount:0};
    return new Promise(resolve => {
      const query = () => {
        //CheckPlaceBet是用於投注請求超時，但是都超時了，其實也不用再查狀態了
        //這邊用於在拿到ticketStatus = waiting的時候，去查注單狀態，不過目前沒有試出來
        this._SABABettingFetch(SABADataTypes.CHECKWAITINGTICKETSTATUS,{ params: { transId: wagerId } })
          .then(async jsonData => {
            if (jsonData) {
              for(let testf of testFuncs) {
                if (testf.func(jsonData)) {
                  delete this._getWagerStatusCache[thisCacheKey]
                  //console.log('_getWagerStatusPolling', testf.status , jsonData)
                  return resolve({status:testf.status, data: jsonData}); //成功
                }
              }
            }
            if (this._getWagerStatusCache[thisCacheKey].retryCount < maxRetryCount) {
              this._getWagerStatusCache[thisCacheKey].retryCount = this._getWagerStatusCache[thisCacheKey].retryCount +1;
              //console.log('_getWagerStatusPolling', 'RETRY', this._getWagerStatusCache[thisCacheKey] , jsonData)
              setTimeout(query, 1000); //建議一秒一次
            } else {
              delete this._getWagerStatusCache[thisCacheKey]
              //console.log('_getWagerStatusCache', 'EXPIRE' , jsonData)
              return resolve({status:'EXPIRE',  data: jsonData}); //超時
            }
          })
      };

      query();
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
        { status:'OK' ,func: (data) => data.ticketStatus == 'running'}, //確認
        { status:'REJECT', func: (data) => data.ticketStatus == 'reject' }, //拒絕
      ],60
    );

    //FinalWagerStatus
    //1 = 待处理
    //2 = 成功
    //3 = 已拒绝
    //4 = 已取消 <==沙巴沒有這個

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
        betResult.status === 'OK'
          ? 2
          : betResult.data.ticketStatus == 'reject' ? 3 : 1,
      )
    }
  }

  //SABA生成自定的 投注單號
  _generateVendorTransId(memberCode, sourceType = null) {
    if (sourceType === null || (['A','I','M'].indexOf(sourceType) === -1)) {
      sourceType = 'U';
    }

    // 4 + 1 + 4+2+2+2+2+2+3 = 22 + sha1(uuidv4)取前8 + membercode
    return 'SB20' + sourceType + moment().format('YYYYMMDDHHmmssSSS') + sha1(uuidv4()).toString().substr(0,8) + memberCode;
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
   * @param extraConfigs.sourceType 沙巴獨有:裝置類型 用來生成vendorTransId 標記投注來源 A=安卓 I=IOS M=Mobile
   */
  async placeBet(wagerType = WagerType.SINGLE, betInfoData, betAmount, comboType = 0, forceAcceptAnyOdds = false, extraConfigs) {

    //console.log('===SABA placebet',wagerType,betInfoData,betAmount,comboType,forceAcceptAnyOdds,extraConfigs);

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

    const alwaysAcceptBetterOdds = this.getMemberSetting().alwaysAcceptBetterOdds;

    //兩種配置 接受全部變化(false) 跟 只接受賠率上升(true)
    let isAcceptAnyOdds = !alwaysAcceptBetterOdds;
    //強制接受賠率變更
    if (forceAcceptAnyOdds) {
      isAcceptAnyOdds = true;
    }

    const { memberCode } = this._getLoginInfo();
    const thisVendorTransId = this._generateVendorTransId(memberCode,extraConfigs.sourceType);

    //日志用
    let postJSON = { WagerType:wagerType };

    //沙巴單注和串關用不同api
    if (wagerType === WagerType.SINGLE) { //單注
      const thisSelection = selections[0];
      //沙巴 猜冠軍 和 一般單注 也是分開投
      let fetchPromise = null;
      if( thisSelection.IsOutRightEvent ) { //猜冠軍 單注投注
        let params = thisSelection.toSABAPlaceOutRightBetParams(betAmount)
        params.vendorTransId = thisVendorTransId;

        //日誌用
        postJSON.params = JSON.parse(JSON.stringify(params));

        const queryOption = {
          params,
          POST: true,
        }
        fetchPromise = this._SABABettingFetch(SABADataTypes.PLACEOUTRIGHTBETS, queryOption)
      } else { //一般 單注投注
        let params = thisSelection.toSABAPlaceSingleBetParams(betAmount);
        params.vendorTransId = thisVendorTransId;
        params.oddsOption = isAcceptAnyOdds ? SABAAcceptMode.ANY : SABAAcceptMode.HIGHER;

        //日誌用
        postJSON.params = JSON.parse(JSON.stringify(params));

        const queryOption = {
          params,
          POST: true,
        }
        fetchPromise = this._SABABettingFetch(SABADataTypes.PLACEBET, queryOption)
      }

      //不同api 但是返回數據的 處理方式一樣
      if (fetchPromise) {
        return fetchPromise
          .then(jsonData => {
            if (!jsonData) {
              throw new VendorError(VendorErrorType.BET_Place_Error, null, {info: jsonData})
            }
            if (jsonData && jsonData.betStatus == 1) { //下注失敗
              throw new VendorError(VendorErrorType.BET_Place_Error, null, {info: jsonData})
            }
            if (jsonData && jsonData.ticketStatus == 'reject') { //下注失敗
              throw new VendorError(VendorErrorType.BET_Place_Error, null, {info: jsonData})
            }

            const isPending = jsonData && (jsonData.ticketStatus == 'waiting'); //waiting
            let pendingQueryId = null;
            if (isPending) {
              pendingQueryId = jsonData.transId;
            }

            return new BetResultData(
              0,
              jsonData.transId,
              jsonData.ticketStatus, //注单状态 running/reject/waiting
              jsonData.betStatus, //下注状态 0下注成功 ；1下注失败
              isPending,
              pendingQueryId,
              0,
              0, //saba未提供，不填(實際也沒用到)
              new BetSelectionResultData(
                null,  //saba沒有這個數據，反正也沒用到
                jsonData.betPrice,
                null, //saba沒有這個數據，反正也沒用到
              ),
              JSON.stringify({ request: postJSON, response:jsonData }),
            )
          })
      }
    } else { //串關
      let postData = {
        vendorTransId: thisVendorTransId,
        priceOption: isAcceptAnyOdds ? 1 : 0, //沙巴串關只有 不接受和 全接受這兩個選項(注意：和單注不同)   0：不接受盘口变更 (预设) ; 1：接受任何赔率
        tickets: selections.map(sel => sel.toSABAPlaceParlayBetParams()),
        combos: [{
          comboType,
          stake: new Decimal(betAmount),
        }]
      };

      //日誌用
      postJSON.params = JSON.parse(JSON.stringify({ betInfo: postData}));

      const queryOption = { POST:true, jsonBody: JSON.stringify({ betInfo: postData} ) };
      return this._SABABettingFetch(SABADataTypes.PLACEPARLAYBETS, queryOption)
        .then(jsonData => {
          if (!jsonData) {
            throw new VendorError(VendorErrorType.BET_Place_Error, null, {info: jsonData})
          }
          if (jsonData && jsonData.betStatus == 1) { //下注失敗
            throw new VendorError(VendorErrorType.BET_Place_Error, null, {info: jsonData})
          }
          if (jsonData && jsonData.parlayTicketStatus == 'reject') { //下注失敗
            throw new VendorError(VendorErrorType.BET_Place_Error, null, {info: jsonData})
          }

          const isPending = jsonData && (jsonData.parlayTicketStatus == 'waiting'); //waiting
          let pendingQueryId = null;
          if (isPending) {
            pendingQueryId = jsonData.transId;
          }

          return new BetResultData(
            0,
            jsonData.transId,
            jsonData.parlayTicketStatus, //注单状态 running / waiting
            jsonData.betStatus, //下注状态 0下注成功 ；1下注失败;
            isPending,
            pendingQueryId,
            jsonData.currentCombos ? jsonData.currentCombos[0].comboType : 0,
            0, //saba未提供，不填(實際也沒用到)
            jsonData.singleTickets.map(data =>
              new BetSelectionResultData(
                null,  //saba沒有這個數據，反正也沒用到
                data.price,
                null, //saba沒有這個數據，反正也沒用到
              )
            ),
            JSON.stringify({ request: postJSON, response:jsonData }),
          )
        })
    }
  }

  /**
   * 補查可CashOut的注單數據，返回為WagerData數組
   */
  decorateCashOutAbleWagers(wagerDatas = []) {
    if (!wagerDatas || wagerDatas.length <=0) {
      return wagerDatas;
    }

    const canCashoutWagers = wagerDatas.filter(wd => wd.CanCashOut);
    if (!canCashoutWagers || canCashoutWagers.length <=0) {
      return wagerDatas;
    }

    //先全部標記為不可cashout
    wagerDatas.map(wd => {
      wd.CanCashOut = false;
      wd.CashOutStatus = CashOutStatusType.NOTYET;
      wd.CashOutPriceId = null;
      wd.CashOutPrice = null;
    })

    const queryOptions = { params: { transIds: canCashoutWagers.map(wd => wd.WagerId).join(',') }};
    return this._SABACashOutFetch(SABADataTypes.CASHOUTPRICE, queryOptions)
      .then(jsonData => {
        if (jsonData && jsonData.priceInfo && Array.isArray(jsonData.priceInfo) && jsonData.priceInfo.length > 0) {
          let cashoutMap = {}
          jsonData.priceInfo.map(pi => {
            cashoutMap['TID_' + pi.transId] = JSON.parse(JSON.stringify(pi));
          })

          canCashoutWagers.map(wd => {
            const info = cashoutMap['TID_' + wd.WagerId]
            if (info) {
              if (info.cashoutStatus == 1) {
                wd.CanCashOut = true;
                wd.CashOutStatus = CashOutStatusType.NOTYET;
                wd.CashOutPriceId = null;
                wd.CashOutPrice = info.cashoutPrice;
              }
            }
          })
        }
        return wagerDatas;
      })
      .catch(error => {
        return wagerDatas;
      })
  }

  /**
   * 查詢未結算注單，返回為WagerData數組
   */
  getUnsettleWagers(){
    //日期必填，所以設定為1年前到２天後
    const queryOption = {
      params: {
        isSettled: false,
        start: moment().add(-1, 'year').format('YYYY-MM-DD'),
        end: moment().add(2, 'days').format('YYYY-MM-DD'),
      }
    }
    return this._SABAWagerFetch(SABADataTypes.BETDETAILS,queryOption)
      .then(async jsonData => {
        let wagerDatas = jsonData.map(item => {
          return WagerData.createFromSABASource(item);
        })

        //獲取比賽數據
        if (wagerDatas && wagerDatas.length > 0) {
          let EventIdList = [];
          let EventInfos = []; //getEventsDetail需要傳入EventInfo數組
          wagerDatas.map(item => {
            if (item.WagerItems && item.WagerItems.length > 0) {
              item.WagerItems.map(ii => {
                if (EventIdList.indexOf(ii.EventId) === -1) {
                  EventIdList.push(ii.EventId);
                  EventInfos.push(new EventInfo(ii.EventId, ii.SportId, ii.IsOutRightEvent))
                }
              })
            }
          })

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
            })
        }

        //獲取cashout數據
        let wagerDatas2= await this.decorateCashOutAbleWagers(wagerDatas);

        //按投注時間 近->遠 排序
        if (wagerDatas2 && wagerDatas2.length > 0) {
          //沙巴沒有settletime只有transtime，所以直接使用 CreateTime 字段
          //時間近(大)->遠(小) 排序
          const sortByCreateTime = (a,b) => {
            if (a.CreateTime > b.CreateTime) {
              return -1; //小于 0 ，那么 a 会被排列到 b 之前
            } else if (a.CreateTime < b.CreateTime) {
              return 1; //大于 0 ， b 会被排列到 a 之前。
            }
            return 0;
          }

          wagerDatas2.sort(sortByCreateTime);
        }

        return wagerDatas2;
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
    let postJSON = { transId:wagerData.WagerId, cashoutPrice:wagerData.CashOutPrice}
    return this._SABACashOutFetch(SABADataTypes.SELLBACK,
      {
        POST: true,
        params: { transId: wagerData.WagerId, cashoutPrice: wagerData.CashOutPrice}
      })
      .then(async jsonData => {

        //日志用
        let logData = {sellBack: JSON.parse(JSON.stringify(jsonData))}

        //默認失敗
        cloneWagerData.CashOutStatus = CashOutStatusType.FAIL;

        if (jsonData) {
          if (jsonData.sellingStatus == 1) { //先處理waiting，獲取到最終結果
            const statusResult = await this._getCheckSellingStatusPolling(wagerData.WagerId,
              [
                {status: 'ACCEPT', func: (data) => data.sellingStatus && data.sellingStatus == 2},
                {status: 'REJECT', func: (data) => data.sellingStatus && data.sellingStatus == 3},
                {status: 'ERROR', func: (data) => data.errorCode},
              ], 60
            );

            //日志用
            logData.CheckSellingStatus = JSON.parse(JSON.stringify(statusResult))

            if (statusResult.status === 'ACCEPT') {
              jsonData.sellingStatus = 2 //accept
            } else if (statusResult.status === 'REJECT') {
              jsonData.sellingStatus = 3 //reject
            } else { //錯誤或超時
              jsonData.sellingStatus = 99
            }
          }

          if (jsonData.sellingStatus == 2) { //accept
            cloneWagerData.CashOutStatus = CashOutStatusType.DONE;
          } else if(jsonData.sellingStatus == 3) { //reject
            cloneWagerData.CashOutStatus = CashOutStatusType.FAIL;
          } else if(jsonData.sellingStatus == 5 && jsonData.newPriceInfo && jsonData.newPriceInfo.cashoutStatus == 1) { //new offer
            cloneWagerData.CashOutStatus = CashOutStatusType.NEWPRICE;
            cloneWagerData.CashOutPrice = jsonData.newPriceInfo.cashoutPrice;
          }
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

  //輪詢CheckSellingStatus緩存，目前只拿來記錄重試次數
  _getCheckSellingStatusCache = {}

  //輪詢 CheckSellingStatus 查詢 cashout 狀況
  async _getCheckSellingStatusPolling(transId, testFuncs = [], maxRetryCount = 121, uniqueName = ''){
    const thisCacheKey = 'CheckSellingStatus_' + transId + uniqueName;
    this._getCheckSellingStatusCache[thisCacheKey] = {retryCount:0};
    return new Promise(resolve => {
      const query = () => {
        this._SABACashOutFetch(SABADataTypes.CHECKSELLINGSTATUS,{ params: { transId } })
          .then(jsonData => {
            if (jsonData) {
              for (let testf of testFuncs) {
                if (testf.func(jsonData)) {
                  delete this._getCheckSellingStatusCache[thisCacheKey]
                  //console.log('_getCheckSellingStatusPolling', testf.status , jsonData)
                  return resolve({status: testf.status, data: jsonData}); //成功
                }
              }
            }
            if (this._getCheckSellingStatusCache[thisCacheKey].retryCount < maxRetryCount) {
              this._getCheckSellingStatusCache[thisCacheKey].retryCount = this._getCheckSellingStatusCache[thisCacheKey].retryCount +1;
              //console.log('_getCheckSellingStatusPolling', 'RETRY', this._getPurchasesCache[thisCacheKey] , jsonData)
              setTimeout(query, 1000); //1秒1次
            } else {
              delete this._getCheckSellingStatusCache[thisCacheKey]
              //console.log('_getCheckSellingStatusPolling', 'EXPIRE' , jsonData)
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
    return true; //不用處理
  }

  /**
   * 查詢已結算注單，返回為WagerData數組
   *
   * @param StartDate 開始日期 YYYY-MM-DD 格式 默認今天
   * @param EndDate  結束日期 YYYY-MM-DD 格式 默認今天
   */
  getSettledWagers(StartDate = moment().format('YYYY-MM-DD'), EndDate = moment().format('YYYY-MM-DD')){
    //saba注單需要轉為UTC時間去查詢
    const queryOption = {
      params: {
        isSettled: true,
        start: moment(StartDate + ' 00:00:00'+VendorConfigs.TIMEZONEFULL).toISOString(),
        end: moment(EndDate + ' 23:59:59'+VendorConfigs.TIMEZONEFULL).toISOString(),
      }
    }
    return this._SABAWagerFetch(SABADataTypes.BETDETAILS, queryOption)
      .then(jsonData => {

        //沙巴沒有settletime只有transtime，所以直接使用 CreateTime 字段
        //時間近(大)->遠(小) 排序
        const sortByCreateTime = (a,b) => {
          if (a.CreateTime > b.CreateTime) {
            return -1; //小于 0 ，那么 a 会被排列到 b 之前
          } else if (a.CreateTime < b.CreateTime) {
            return 1; //大于 0 ， b 会被排列到 a 之前。
          }
          return 0;
        }

        return jsonData.map(item => {
          return WagerData.createFromSABASource(item);
        }).sort(sortByCreateTime);
      })
  }

  //獲取用戶配置
  getMemberSetting() {
    let result = super.getMemberSetting();

    //把oddsType轉為SABA格式
    result.oddsType = SABAOddsType[result.oddsType];

    //debug
    // result.oddsType = SABAOddsType.EU;

    return result;
  }

  /**
   * 獲取供應商公告
   */
  getAnnouncements() {

    const fetchAAnnouncements = async () => {

      await this._checkAndWaitLogin(); //需要等待登入後才能查詢

      let queryOptions = [];
      if (!queryOptions['language']) {
        queryOptions['language'] = vendorSettings.LanguageCode;
      }

      //* 查询最长为七天
      queryOptions.params = {
        start: moment().add(-7, 'days').format('YYYY-MM-DD'),
        end: moment().format('YYYY-MM-DD'),
      }

      const fetchParams = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + this.tokenService.apiAccessToken,
        },
      };

      const composeQueryUrl = (queryOptions) => {
        let paramArr = [];
        let paramConfigs = [
          {name: 'start'},
          {name: 'end'},
        ];

        paramConfigs.map(config => {
          let thisValue = queryOptions.params[config.name];
          if (thisValue !== undefined) {
            if (config.htmlEncode) {
              thisValue = encodeURIComponent('' + thisValue);
            }
            paramArr.push(config.name + '=' + thisValue);
          }
        })

        if (queryOptions['language']) {
          paramArr.push('language=' + queryOptions['language']);
        }

        let queryUrl = '';
        if (paramArr && paramArr.length > 0) {
          queryUrl = '?' + paramArr.join('&');
        }

        return queryUrl;
      }

      const url = HostConfig.Config.SABAApi + 'sports/v1/' + 'GetAnnouncement/' + composeQueryUrl(queryOptions);

      return new Promise(function (resolve, reject) {
        return fetch(url, fetchParams)
          .then(function (response) {
            if (response.status !== 200) {
              throw response.status //丟出異常
            }
            return response.json();
          }).then(function (jsonResponse) {
            //console.log('===SABAWagerFetch QUERY', dataName, queryOptions, jsonResponse);
            resolve(jsonResponse);
          }).catch(error => {
            console.log('===SABAWagerFetch QUERY has error', dataName, queryOptions, error);
            let thiserror = new VendorError();
            if (error) {
              thiserror = VendorError.fromSABAError(error);
            }
            reject(thiserror);
          });
      });
    }


    return fetchAAnnouncements()
      .then(jsonData => {
        //考慮沒有數據的情況，返回空數組
        if (!jsonData || jsonData.length <= 0) {
          return [];
        }

        return jsonData.map(item=> {

          const postingDate = moment(item.postTime).format('YYYY/MM/DD HH:mm');

          return new AnnouncementData(
            item.messageId,
            item.message,
            postingDate,
            {isSticky: item.isSticky}
          );
        });
      });
  }

  //判斷是否波膽Line
  isCorrectScoreLine(lineData) {
    return ([413,414,405].indexOf(parseInt(lineData.BetTypeId)) !== -1); //413波膽 414 上半場波膽 405下半場波膽
  }

  //判斷是否[全場]波膽Line
  isFTCorrectScoreLine(lineData) {
    return (parseInt(lineData.BetTypeId) === 413) //沙巴全場波膽只有413
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
      } else if (sel.SelectionName && sel.SelectionName.indexOf(i18n.SABA.CORRECT_SCORE_OTHER_FILTER) !== -1) {
        other = sel;
      }
    })

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
    if (eventData.IsOutRightEvent) {
      return (eventData.ExtraInfo && eventData.ExtraInfo.leagueGroup && eventData.ExtraInfo.leagueGroup == this.WCP2022Settings.OutrightLeagueGroupName);
    }
    return (this.WCP2022Settings.LeagueIds.indexOf(eventData.LeagueId) !== -1);
  }

  //哪些接口使用diffKey
  _DiffAPIMapping = {
    events:'events',
  }

  _APIs = {
    getEventInfoMBT_VL: (
      SportId = IMSports.SOCCER,
      Market = VendorMarkets.EARLY,
      extraConfigs
      ) => {
      extraConfigs.SportId = SportId;

      // if (Market === VendorMarkets.OUTRIGHT) {
      //   extraConfigs.startDate = moment().format('YYYYMMDD');
      //   extraConfigs.endDate = moment().add(15, 'months').format('YYYYMMDD');
      // }

      const { countsPerPage, page, startDate, endDate, sortWay = 1 } = extraConfigs;
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

      //目前頁數
      const cachePage = this._NewDataCache[thisDiffKey]?.PageNumber;
      // 是否为更新下一页
      let isPagePull = cachePage !== undefined && cachePage < page && cachePage !== page;
      return this._newSABAFetch(`events?${queryString}`, null, "GET", 0, page, isPagePull);
    }
  }
}

const vendorSABASingleton = new VendorSABA();
if (typeof window !== "undefined") {
  window.VendorSABAInstance = vendorSABASingleton;
}

export default vendorSABASingleton;

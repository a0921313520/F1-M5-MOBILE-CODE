//比賽數據
import moment from "moment";
import {
  SelectionStatusType,
  SortWays,
  VendorConfigs,
  VendorMarketNames,
  VendorMarkets,
  VendorPeriodName
} from "./VendorConsts";
import LineData from "./LineData";
import SelectionData from "./SelectionData";
import OddsData from "./OddsData";
import {
  BTIBetTypeNames,
  BTIComboTypeNames, BTIForceDecimalBetTypeIds,
  BTIMarketGroupTypeNames,
  BTIOddsType,
  BTIOddsTypeToNumber, BTIPeriodMapping, BTIRBPeriodNames
} from "../bti/BTIConsts";
import {
  SABAOddsType,
  SABAOddsTypeToNumber,
  SABARBPeriodNames,
  SABALineGroupNames,
  SABABetTypeNames,
  SABAPeriodMapping,
} from "../saba/SABAConsts";
import LineGroupData from "./LineGroupData";
import {IMEventGroupTypeNames, IMLineGroupNames, IMRBPeriodNames} from "../im/IMConsts";
import natureCompare from 'natural-compare';
import {Decimal} from "decimal.js";
import i18n from '../vendori18n';
import VendorIM from "../im/VendorIM";

export default class EventData {
  /**
   * @param EventId 比賽id
   * @param EventDate 比赛時間
   * @param EventStatusId 開盤狀態 1開2關
   * @param EventGroupId 比賽分組，用途不明
   * @param EventGroupTypeId 比賽分組類型，用途不明
   * @param HomeTeamId 主場球隊id
   * @param HomeTeamName 主場球隊名
   * @param HomeScore 主場得分
   * @param HomeRedCard 主場紅牌數
   * @param HomeCorner 主場角球數
   * @param HomeIconUrl 主隊ICON鏈接，SABA專用
   * @param AwayTeamId 客場球隊id
   * @param AwayTeamName 客場球隊名
   * @param AwayScore 客場得分
   * @param AwayRedCard 客場紅牌數
   * @param AwayCorner 客場角球數
   * @param AwayIconUrl 客隊ICON鏈接，SABA專用
   * @param HasCornerData 是否提供角球數據(im:false,  bti:true)
   * @param SortOrder 排序
   * @param RBTime 滾球時間,平台原始的滾球數據
   * @param RBMinute 滾球分鐘(開始到現在比賽進行了幾分鐘)
   * @param RBPeriodName 滾球時間段(中文)
   * @param RelatedScores 相關比分清單，用途不明
   * @param GroundTypeId 主場狀態 0在中立場比賽 1在主場比賽，用途不明
   * @param IsOpenParlay 是否支持串關
   * @param HasStatistic 是否有分析數據(BR)
   * @param HasVisualization 是否有可視化(動畫)(BR)
   * @param BREventId (BR)比賽Id
   * @param IsRB 是否比賽進行(滾球)中
   * @param HasLiveStreaming 是否有直播數據
   * @param LiveStreamingUrl 直播源列表 按照im格式 是數組 目前UI是會播放第一個數據
   * @param Season 賽日指標，用於虛擬體育
   * @param MatchDay 賽事指標，用於虛擬體育
   * @param ExtraInfo 額外信息
   * @param SportId 體育ID
   * @param MarketId 市場ID
   * @param LeagueId 聯賽id
   * @param LeagueName 聯賽名
   * @param TotalLineCount 玩法總數(查詢時可以過濾，這裡列出來的是過濾前的總數)
   * @param IsFavourite 是否收藏遊戲
   * @param IsOutRightEvent 是否為優勝冠軍賽事
   * @param OutRightEventName 優勝冠軍賽事名
   * @param LineGroups 玩法分組列表，LineGroupData數組
   * @param Lines 玩法列表，LineData數組
   * @param MarketIdForListing 市場ID for 首屏額外展示關注比賽 默認和MarketId相同，只對UI展示有用
   */
  constructor(
    EventId,
    EventDate,
    EventStatusId,
    EventGroupId,
    EventGroupTypeId,
    HomeTeamId,
    HomeTeamName,
    HomeScore,
    HomeRedCard,
    HomeCorner,
    HomeIconUrl,
    AwayTeamId,
    AwayTeamName,
    AwayScore,
    AwayRedCard,
    AwayCorner,
    AwayIconUrl,
    HasCornerData,
    SortOrder,
    RBTime,
    RBMinute,
    RBPeriodName,
    RelatedScores,
    GroundTypeId,
    IsOpenParlay,
    HasStatistic,
    HasVisualization,
    BREventId,
    IsRB,
    HasLiveStreaming,
    LiveStreamingUrl,
    MatchDay,
    Season,
    ExtraInfo,
    SportId,
    MarketId,
    LeagueId,
    LeagueName,
    TotalLineCount,
    IsFavourite,
    IsOutRightEvent,
    OutRightEventName,
    LineGroups,
    Lines = [],
    MarketIdForListing = null,
  )
  {
    Object.assign(this, {
      EventId,
      EventDate,
      EventStatusId,
      EventGroupId,
      EventGroupTypeId,
      HomeTeamId,
      HomeTeamName,
      HomeScore,
      HomeRedCard,
      HomeCorner,
      HomeIconUrl,
      AwayTeamId,
      AwayTeamName,
      AwayScore,
      AwayRedCard,
      AwayCorner,
      AwayIconUrl,
      HasCornerData,
      SortOrder,
      RBTime,
      RBMinute,
      RBPeriodName,
      RelatedScores,
      GroundTypeId,
      IsOpenParlay,
      HasStatistic,
      HasVisualization,
      BREventId,
      IsRB,
      HasLiveStreaming,
      LiveStreamingUrl,
      MatchDay,
      Season,
      ExtraInfo,
      SportId,
      MarketId,
      LeagueId,
      LeagueName,
      TotalLineCount,
      IsFavourite,
      IsOutRightEvent,
      OutRightEventName,
      LineGroups,
      Lines,
      MarketIdForListing,
    });

    //處理日期
    this.EventDateLocal = this.getEventDateMoment().format('YYYY-MM-DD'); //日期過濾用 for 早盤
    if (MarketIdForListing === null) {
      this.MarketIdForListing = MarketId; //默認和MarketId相同
    }
  }

  //獲取時區調整後的Moment類
  getEventDateMoment() {
    return moment(this.EventDate).utcOffset(VendorConfigs.TIMEZONE);
  }

  //由selectionId, lineId找內含的Selection數據
  getChildSelection(selectionId, lineId, eventId = null){
    if (eventId === this.EventId || eventId === null) {
      const thisLines = this.Lines.filter(l => l.LineId === lineId);
      if (thisLines.length > 0) {
        const thisLine = thisLines[0];
        const thisSelections = thisLine.Selections.filter(s => s.SelectionId === selectionId);
        if (thisSelections.length > 0) {
          return thisSelections[0];
        }
      }
    }
    return null
  }

  //更新投注分組計數(只有bti用到，因為bti會單獨修改Lines)
  updateLineGroupCount(){
    this.LineGroups.map(lg => {
      const linesInGroup = this.Lines.filter(l => {
        return (l.LineGroupIds && l.LineGroupIds.length > 0 && l.LineGroupIds.indexOf(lg.LineGroupId) !== -1)
      })
      lg.LineCount = linesInGroup.length;
    })
  }

  //排序投注線 按 讓球->大小  全場-上半場-下半場的順序(列表使用)
  sortLines() {
    const compareFunc = (left,right) => {
      const a = left.PeriodId + '_' + left.BetTypeId;
      const b = right.PeriodId + '_' + right.BetTypeId;
      return natureCompare(a,b); //自然排序
    }
    if (this.Lines && this.Lines.length > 1) {
      this.Lines = this.Lines.sort(compareFunc);
    }
  }

  //IM專用 排序投注線 EventGroupTypeId優先, 然後betType，再排全場上半下半，然後按linelevel順序小到大(詳情頁使用)
  IMSortLinesAndSelections() {
    const lineCompareFunc = (left, right) => {
      const a = left.EventGroupTypeId + '_' + left.BetTypeId + '_' + left.PeriodId + '_' + left.BetTypeName + '_' + left.LineLevel;
      const b = right.EventGroupTypeId + '_' + right.BetTypeId + '_' + right.PeriodId + '_' + right.BetTypeName + '_' + right.LineLevel;
      return natureCompare(a, b); //自然排序
    }

    //投注選項特別排序
    const selectionSpecialCompareFunc = (specialWords) => {
      return (left, right) => {
        let a1 = specialWords.indexOf(left.SelectionName);
        let b1 = specialWords.indexOf(right.SelectionName);

        if (a1 !== -1 && b1 !== -1) {
          if (a1 < b1) {
            return -1; //小于 0 ，那么 a 会被排列到 b 之前
          }

          if (a1 > b1) {
            return 1; //大于 0 ， b 会被排列到 a 之前。
          }
        }
        return 0; //沒找到不動
      }
    }

    const selectionCompareFunc = (left,right) => {
      //其他沒特別註明的直接用SelectionId排序
      const ax = left.SelectionId;
      const bx = right.SelectionId ;
      return natureCompare(ax,bx); //自然排序
    }

    if (this.Lines && this.Lines.length > 1) {
      this.Lines = this.Lines.sort(lineCompareFunc);
      this.Lines.map(l => {
        if (l.Selections && l.Selections.length > 1) {
          //按照name去分類
          const selectionNames = l.Selections.map(s => s.SelectionName);
          //去重複
          const uniqueSelectionNames = selectionNames.filter((item, index) => selectionNames.indexOf(item) === index);

          let specialSorted = false;
          //特殊排序的配置
          const specialSortConditions = [
            {
              uniqueSelectionCount: 2,
              sortWords: [
                [i18n.HOME,i18n.AWAY],
                [i18n.BIG,i18n.SMALL],
                [i18n.ODD,i18n.EVEN],
                [i18n.YES,i18n.NO],
                [i18n.HOME_YES,i18n.HOME_NO],
                [i18n.HOME_YES2,i18n.HOME_NO2],
                [i18n.AWAY_YES,i18n.AWAY_NO],
                [i18n.AWAY_YES2,i18n.AWAY_NO2],
                [i18n.HOME_ODD,i18n.HOME_EVEN],
                [i18n.AWAY_ODD,i18n.AWAY_EVEN],
                [i18n.HOME_WIN_YES,i18n.HOME_WIN_NO],
                [i18n.AWAY_WIN_YES,i18n.AWAY_WIN_NO],
                [i18n.TIE,i18n.HOME_WIN],
                [i18n.TIE,i18n.AWAY_WIN],
                [i18n.ANY_WIN_YES,i18n.ANY_WIN_NO],
                [i18n.HOME_PERFECT_WIN_YES,i18n.HOME_PERFECT_WIN_NO],
                [i18n.AWAY_PERFECT_WIN_YES,i18n.AWAY_PERFECT_WIN_NO],
              ]
            },
            {
              uniqueSelectionCount: 3,
              sortWords: [
                [i18n.HOME,i18n.TIE,i18n.AWAY],
                [i18n.HOME,i18n.NOT_HAVE,i18n.AWAY],
              ]
            }
          ]

          //wholeloop: //不能用label break在rn裡面會有問題
          for(let condition of specialSortConditions) {
            if (specialSorted) { //不能用label break的替代方案
              break;
            }
            //判斷不重複的seleciton數量
            if (uniqueSelectionNames.length === condition.uniqueSelectionCount) {
              for(let words of condition.sortWords) {
                //檢查selectionName要完全符合要求的字
                if (words.filter(w => uniqueSelectionNames.indexOf(w) !== -1).length === condition.uniqueSelectionCount) {
                  //使用特別排序
                  const specialSortFunc = selectionSpecialCompareFunc(words);
                  l.Selections = l.Selections.sort(specialSortFunc);
                  specialSorted = true; //標記已經特別排序過
                  //break wholeloop;  //不能用label break在rn裡面會有問題
                  break;
                }
              }
            }
          }

          //感覺不需要  先不排
          // if (!specialSorted) { //沒特別排序就用默認的
          //   l.Selections = l.Selections.sort(selectionCompareFunc);
          // }
        }
      })
    }
  }

  //IM專用，處理IM特殊結構 eventGroup，把特殊投注合併到 主Event 數據內
  IMMergeSideEvents(jsonEvents, FavoriteEvents, memberOddsType, memberType) {
    //處理sideEvents
    const sideEvents = jsonEvents.filter(ev => ev.EventGroupTypeId !== 1 && ev.EventGroupId === this.EventGroupId);
    let sideEventDatas = (sideEvents && sideEvents.length > 0) ?
      sideEvents.map(se => EventData.createFromIMSource(se, this.SportId, FavoriteEvents, memberOddsType, memberType))
      : []
    if (sideEventDatas && sideEventDatas.length > 0) {
      //先按 EventGroupTypeId 順序排序
      const natureCompFunc = (left,right) => {
        const a = left.EventGroupTypeId;
        const b = right.EventGroupTypeId;
        return natureCompare(a,b); //自然排序
      }
      sideEventDatas = sideEventDatas.sort(natureCompFunc);

      //把sideEvents合併到主比賽
      sideEventDatas.map(se => {
        if (se.Lines && se.Lines.length > 0) {
          if (!this.LineGroups && !Array.isArray(this.LineGroups)) {
            this.LineGroups = [];
          }

          const thisLineGroupId = 'SPECIAL_' + se.EventGroupTypeId;

          //有可能同一個EventGroupTypeId開了好幾個side event，需要判斷
          const existLineGroups = this.LineGroups.filter(lg => lg.LineGroupId === thisLineGroupId);

          if (!existLineGroups || existLineGroups.length <=0) {
            //新增一個分類
            this.LineGroups.push(
              new LineGroupData(
                thisLineGroupId, //群組id自己組一個
                IMEventGroupTypeNames[se.EventGroupTypeId], //名字用IM給的固定名稱
                se.Lines.length,
                99, //先放最後，後面再看怎麼調比較好
              )
            )
          } else {
            //分類已存在，把投注線 數量加上去
            existLineGroups[0].LineCount = existLineGroups[0].LineCount + se.Lines.length;
          }

          //特別投注(EventGroupTypeId=3) 增加說明
          let betTypeExtraName = '';
          if (se.EventGroupTypeId === 3 && se.LeagueName && (se.LeagueName.indexOf('-') !== -1) && (se.LeagueName.indexOf(this.LeagueName + ' - ') !== -1)) {
            betTypeExtraName = se.LeagueName.replace(this.LeagueName + ' - ', '');
            if (betTypeExtraName && betTypeExtraName.length >0) {
              //特定 xx 分鐘 增加說明
              //"Cả Trận特別投注 Specific 10 Mins Trên/Dưới"
              if (
                ((betTypeExtraName.indexOf('特定') !== -1) && (betTypeExtraName.indexOf('分钟') !== -1)) //中文
                || ((betTypeExtraName.indexOf('Specific') !== -1) && (betTypeExtraName.indexOf('Mins') !== -1)) //越南文
              ) {
                const rangeMatch = /[\d]{2}:[\d]{2}-[\d]{2}:[\d]{2}/gm;
                const homeMatch = se.HomeTeamName.match(rangeMatch);
                const awayMatch = se.AwayTeamName.match(rangeMatch);
                if (homeMatch && homeMatch.length === 1 && awayMatch && awayMatch.length === 1 && homeMatch[0] && homeMatch[0].length > 0 && homeMatch[0] === awayMatch[0]) {
                  betTypeExtraName = betTypeExtraName + ' ' + homeMatch[0];
                }
              } else if ( (se.HomeTeamName.indexOf(' - ') !== -1) && (se.AwayTeamName.indexOf(' - ') !== -1) ) {
                //away: 英格兰 - 角球总数 - (小)
                //home: 英格兰 - 角球总数 - (大)

                //奇怪的大小盤，增加說明
                const homeSplit = se.HomeTeamName.split(' - ');
                const awaySplit = se.AwayTeamName.split(' - ');
                if (homeSplit && homeSplit.length === 3 && awaySplit && awaySplit.length === 3
                  && homeSplit[0] && awaySplit[0] && homeSplit[0] === awaySplit[0]
                  && homeSplit[1] && awaySplit[1] && homeSplit[1] === awaySplit[1]
                ) {
                  betTypeExtraName = homeSplit[0] + ' ' + homeSplit[1];
                } else if (homeSplit && homeSplit.length === 2 && awaySplit && awaySplit.length === 2
                  //威尔士 - 最后角球
                  //美国 - 最后角球
                  && homeSplit[0] && homeSplit[0] === this.HomeTeamName
                  && awaySplit[0] && awaySplit[0] === this.AwayTeamName
                  && homeSplit[1] === awaySplit[1]
                ) {
                  betTypeExtraName = homeSplit[1];
                }
              }
            }
          }
          if (betTypeExtraName && betTypeExtraName.length >0) {
            betTypeExtraName = betTypeExtraName.trim() + ' '
          }

          //合併投注線
          se.Lines.map(sel => {
            sel.LineGroupIds = [thisLineGroupId]; //修改投注線分組
            //修改玩法名
            const newBetTypeName = IMEventGroupTypeNames[se.EventGroupTypeId] + ' ' + betTypeExtraName + sel.BetTypeName;
            sel.BetTypeName = newBetTypeName
            sel.resetLineDesc();
            if (sel.Selections && sel.Selections.length > 0) {
              sel.Selections.map(sels => {
                sels.BetTypeName = newBetTypeName //selection裡面的玩法名也要一起改
              })
            }
            this.Lines.push(sel);
          });
        }
      })
    }
  }

  //BTI專用，把多線Selection過濾，剩下主線Selection
  BTIFilterMainLineOnly() {
    if (this.Lines && this.Lines.length > 0) {
      if (this.IsOutRightEvent) {
        //猜冠軍 只留下前４個
        this.Lines.map(l => {
          if (l.Selections && l.Selections.length > 4) {
            l.Selections = l.Selections.filter((s,index) => index < 4);
          }
        });
      } else {
        //一般比賽
        this.Lines.map(l => {
          if (l.Selections && l.Selections.length > 2) { //2個以上才要篩選
            const newSelections = l.Selections.filter(s => {
              return s.Specifiers && s.Specifiers.length > 0 && s.Specifiers[0] && s.Specifiers[0] === 'MainPointLine';
            });
            //確認有MainPointLine才替換，找不到就不換了
            if (newSelections && newSelections.length > 0) {
              l.Selections = newSelections;
              l.updateSelectionAnalysis();
            } else {
              //如果沒有MainPointLine，嘗試找成對的 SelectionId 尾數為MM的
              const MMSelections = l.Selections.filter(s => {
                const str = s.SelectionId;
                const suffix = 'MM';
                return str.indexOf(suffix, str.length - suffix.length) !== -1; //尾數為MM
              })
              if (MMSelections && MMSelections.length >= 2) {
                l.Selections = MMSelections;
                l.updateSelectionAnalysis();
              } else {
                if (MMSelections.length === 1) {
                  console.log('====SingleMM????',JSON.stringify(MMSelections[0]))
                }
              }
            }
          }

          //排序主->客 大->小
          const compareFunc = (left, right) => {
            //特別處理主客大小，因為SelectionId排出來有時候不對
            const aType = left.SelectionType;
            const bType = right.SelectionType;

            //排主>客 , 大>小
            if (aType === 'Home' || aType === 'Over') {
              return -1; //小于 0 ，那么 a 会被排列到 b 之前
            }

            if (bType === 'Home' || bType === 'Over') {
              return 1; //大于 0 ， b 会被排列到 a 之前。
            }

            //可能出現奇怪的null 先不管
            if (left.RealHandicap === null || right.RealHandicap === null) {
              return 0;
            }

            //數值排序
            const aValue = new Decimal(left.RealHandicap);
            const bValue = new Decimal(right.RealHandicap);

            //只有客場讓球是數值大->小(要和主場正負相對)
            if (aType === 'Away') {
              if (aValue.greaterThan(bValue)) {
                return -1; //小于 0 ，那么 a 会被排列到 b 之前
              }

              if (aValue.lessThan(bValue)) {
                return 1; //大于 0 ， b 会被排列到 a 之前。
              }
            } else { //其他都是按 小->大
              if (aValue.lessThan(bValue)) {
                return -1; //小于 0 ，那么 a 会被排列到 b 之前
              }

              if (aValue.greaterThan(bValue)) {
                return 1; //大于 0 ， b 会被排列到 a 之前。
              }
            }

            return 0;
          }

          if (l.Selections && l.Selections.length > 1) {
            l.Selections = l.Selections.sort(compareFunc);
          }
        })
      }
    }
  }

  //BTI專用, line利用betTypeId排序, selection用group去排序，詳情頁專用
  BTISortLinesAndSelections() {
    const lineCompareFunc = (left,right) => {
      //有下滑線的優先
      const a = left.BetTypeId.indexOf('_') !== -1;
      const b = right.BetTypeId.indexOf('_') !== -1;

      if (a === true && b === false) {
        return -1; //小于 0 ，那么 a 会被排列到 b 之前
      }

      if (b === true && a === false) {
        return 1; //大于 0 ， b 会被排列到 a 之前。
      }

      //2表示讓球盤 3表示大小盤  後面的012表示全 上半 下半 場 39為滾球投注

      //把 1_0 轉為 0_1  這樣把全/上半/下半場優先排序
      const reverse = (s) => {
        return s.split("_").reverse().join("");
      }

      const a2 = reverse(left.BetTypeId);
      const b2 = reverse(right.BetTypeId);
      return natureCompare(a2,b2); //自然排序
    }

    const selectionCompareFuncWrap = (lineData) => {
      //額外添加參數lineData用來判斷是什麼投注線

      //是否為讓球盤
      const isHandicap = (lineData.BetTypeId.indexOf('2_') !== -1);

      // if (isHandicap) {
      //   console.log('===',lineData.BetTypeName,' is handicap!!!');
      // }

      return (left, right) => {
        //2021/7/28維護後新版 已經沒有提供group
        // const a = left.SelectionGroup;
        // const b = right.SelectionGroup;
        // if (a < b) {
        //   return -1; //小于 0 ，那么 a 会被排列到 b 之前
        // }
        //
        // if (a > b) {
        //   return 1; //大于 0 ， b 会被排列到 a 之前。
        // }

        //一般排序順序
        let aSortIndex = -1;
        let bSortIndex = -1;
        const commonMap = [['Home','Tie','Away'],['Over','Under']];  //主和客, 大小
        const aType = left.SelectionType;
        const bType = right.SelectionType;
        for(let thisMap of commonMap) {
          aSortIndex = thisMap.indexOf(aType);
          bSortIndex = thisMap.indexOf(bType);
          if (aSortIndex !== -1 && bSortIndex !== -1) {
            break;
          }
        }

        //不是處理範圍內，直接用SelectionId排序
        if (aSortIndex === -1 || bSortIndex === -1) {
          // if (aType || bType) {
          //   console.log('=====BTI unknown selection???', lineData.BetTypeName, aType, aSortIndex, bType, bSortIndex, JSON.stringify(left), JSON.stringify(right));
          // } else {
          //   console.log('=====BTI unknown selection???', lineData.BetTypeName);
          // }

          //直接用SelectionId排序
          const a2 = left.SelectionId;
          const b2 = right.SelectionId ;
          return natureCompare(a2,b2); //自然排序
        }

        //Handicap 可能出現null，直接按 一般排序規則進行
        if (left.RealHandicap === null || right.RealHandicap === null) {
          if (aSortIndex < bSortIndex) {
            return -1; //小于 0 ，那么 a 会被排列到 b 之前
          }

          if (aSortIndex > bSortIndex) {
            return 1; //大于 0 ， b 会被排列到 a 之前。
          }
          return 0;
        }

        //一般盤口 handicap乘1000 再把排序數加到個位數 就可以小->大 並且交錯排序

        let aValue = new Decimal(left.RealHandicap).mul(1000).add(aSortIndex) ;
        let bValue = new Decimal(right.RealHandicap).mul(1000).add(bSortIndex) ;

        //如果是讓球盤，需要特別處理排序數
        if (isHandicap
          && ['Home','Away'].indexOf(aType) !== -1 && ['Home','Away'].indexOf(bType) !== -1
        ) {
          /*
          * 讓球要排成
          *
          * 主 -1  客  1
          * 主  0  客  0
          * 主  1  客 -1
          *
          * 需要主客交錯擺放，且handicap值要從小->大
          * 客 因為要和 主 正負對應，所以直接乘-1 變號，就可以兩個排在一起，
          * handicap乘1000 再把主客加到個位數 就可以小->大並且交錯排序
          *
          * 主 -1  => -1 *1000      -2     = -1002  (主為負      => -2)
          * 客  1  =>  1 *(-1)*1000 -1     = -1001  (客乘-1後為負 => -1)
          * 主  0  =>  0 *1000      +1     = 1      (主為正      =>  +1)
          * 客  0  =>  0 *(-1)*1000 +2     = 2      (客乘-1後為正 => +2)
          * 主  1  =>  1 *1000      +1     = 1001   (主為正      =>  +1)
          * 客 -1  => -1 *(-1)*1000 +2     = 1002   (客乘-1後為正 => +2)
           */
          const getSortNumber = (handicap,sortIndex) => {
            let specialSortIndex = 0;
            let thisNumber = new Decimal(handicap).mul(1000); //先乘1000
            if (sortIndex === 0) { //主
              if (thisNumber.isNegative() && !thisNumber.isZero()) { //主為負(注意負零 算是負 要排除)
                specialSortIndex = -2;
              } else { //主為正
                specialSortIndex = 1;
              }
            }else if (sortIndex === 2) { //客
              thisNumber = thisNumber.mul(-1); //客 要乘-1
              if (thisNumber.isNegative() && !thisNumber.isZero()) { //客乘-1後為負(注意負零 算是負 要排除)
                specialSortIndex = -1;
              } else { //客乘-1後為正
                specialSortIndex = +2;
              }
            }
            return thisNumber.add(specialSortIndex);
          }
          aValue = getSortNumber(left.RealHandicap,aSortIndex);
          bValue = getSortNumber(right.RealHandicap,bSortIndex);
        }

        left._SORTVALUE = aValue.toNumber();
        right._SORTVALUE = bValue.toNumber();

        if (aValue.lessThan(bValue)) {
          return -1; //小于 0 ，那么 a 会被排列到 b 之前
        }

        if (aValue.greaterThan(bValue)) {
          return 1; //大于 0 ， b 会被排列到 a 之前。
        }
        return 0;
      }
    }
    if (this.Lines && this.Lines.length > 1) {

      //bti需要排除以下這四個投注線
      //Cash Out Soccer FT Asians 亚洲让分盘
      //Cash Out Soccer FT Asians 大小盘
      //Cash Out Basketball FT 让分盘
      //Cash Out Basketball FT 比赛进球

      const needFilterBetTypeNames = [
        'Cash Out Soccer FT Asians 亚洲让分盘',
        'Cash Out Soccer FT Asians 大小盘',
        'Cash Out Basketball FT 让分盘',
        'Cash Out Basketball FT 比赛进球',
      ]

      this.Lines = this.Lines.filter(l => needFilterBetTypeNames.indexOf(l.BetTypeName) === -1).sort(lineCompareFunc);
      this.Lines.map(l => {
        if (l.Selections && l.Selections.length > 1) {
          l.Selections = l.Selections.sort(selectionCompareFuncWrap(l));
        }
      })
    }
  }

  //SABA 排序投注線 詳情頁使用
  SABASortLines() {
    if (this.Lines && this.Lines.length > 0) {
      const lineCompareFunc = (left, right) => {
        //前面加上EventId 用來區隔sideEvent的投注線
        const a = left.EventId + '_' + left.BetTypeId + '_' + left.PeriodId + '_' + left.LineLevel;
        const b = right.EventId + '_' + right.BetTypeId + '_' + right.PeriodId + '_' + right.LineLevel;
        return natureCompare(a, b); //自然排序
      }
      this.Lines = this.Lines.sort(lineCompareFunc);
    }
  }

  SABAMergeSideEvents(sideEvents) {
    //處理sideEvents
    if (sideEvents && sideEvents.length > 0) {
      //把sideEvents合併到主比賽
      for(let se of sideEvents) {
        //因為sideEvent的玩法名似乎沒包含角球，可能會和現有的玩法混淆，所以先取出玩法 前綴名
        //*意大利甲组联赛 - 总角球数和总进球数
        //要取到 " - " 後面的字
        let sideEventName = '';
        if ((se.LeagueName.indexOf(' - ') === -1) || (se.LeagueName.indexOf(this.LeagueName + ' - ') === -1)) {
          console.log('====not useable? sideEvent???', JSON.parse(JSON.stringify(se)));
          continue; //跳過這一個sideEvent
        } else {
          sideEventName = se.LeagueName.replace(this.LeagueName + ' - ', '');
        }

        if (sideEventName && sideEventName.length >0) {
          //console.log('===sideEventName before ',sideEventName,se.HomeTeamName,se.AwayTeamName,se.HomeTeamName.indexOf(' - ') !== -1,se.AwayTeamName.indexOf(' - ') !== -1);

          //特定 xx 分鐘 增加說明
          //"Cả Trận特別投注 Specific 10 Mins Trên/Dưới"
          if (
            ((sideEventName.indexOf('特定') !== -1) && (sideEventName.indexOf('分钟') !== -1)) //中文
            || ((sideEventName.indexOf('TRONG') !== -1) && (sideEventName.indexOf('PHÚT') !== -1)) //越南文
          ) {
            const rangeMatch = /[\d]{2}:[\d]{2}-[\d]{2}:[\d]{2}/gm;
            const homeMatch = se.HomeTeamName.match(rangeMatch);
            const awayMatch = se.AwayTeamName.match(rangeMatch);
            if (homeMatch && homeMatch.length === 1 && awayMatch && awayMatch.length === 1 && homeMatch[0] && homeMatch[0].length > 0 && homeMatch[0] === awayMatch[0]) {
              sideEventName = sideEventName + ' ' + homeMatch[0];
              //console.log('===sideEventName1 after ',sideEventName);
            }
          } else if ( (se.HomeTeamName.indexOf(' - ') !== -1) && (se.AwayTeamName.indexOf(' - ') !== -1) ) {
            //away: 英格兰 - 大盘
            //home: 英格兰 - 小盘
            //away: 伊朗罚牌 - 大盘
            //home: 伊朗罚牌 - 小盘

            //奇怪的大小盤，增加說明
            const homeSplit = se.HomeTeamName.split(' - ');
            const awaySplit = se.AwayTeamName.split(' - ');
            if (homeSplit && homeSplit.length === 2 && awaySplit && awaySplit.length === 2
              && homeSplit[0] && awaySplit[0] && homeSplit[0] === awaySplit[0]
            ) {
              sideEventName = sideEventName + ' ' + homeSplit[0];
              //console.log('===sideEventName2 after ', sideEventName);
            }
          } else if (
            (se.HomeTeamName !== this.HomeTeamName && se.AwayTeamName !== this.AwayTeamName)  //隊伍名不同
            && (se.HomeTeamName.indexOf(this.HomeTeamName) !== -1) && (se.AwayTeamName.indexOf(this.AwayTeamName) !== -1) //有包含原本的隊伍名
            && (se.HomeTeamName !== (this.HomeTeamName + sideEventName) && se.AwayTeamName !== (this.AwayTeamName + sideEventName))  //隊伍名 不是 英格兰+罚牌
          ) {
            //罚牌 英格兰罚牌 伊朗罚牌 <==這種不用
            //罚牌 英格兰第一张牌 伊朗第一张牌
            const homeType =  se.HomeTeamName.replace(this.HomeTeamName, '');
            const awayType =  se.AwayTeamName.replace(this.AwayTeamName, '');
            if (homeType === awayType) {
              sideEventName = sideEventName + ' ' + homeType;
              //console.log('===sideEventName3 after ', sideEventName);
            }
          } else {
            //console.log('===sideEventName no after!!! ',sideEventName);
          }
        }

        if (se.Lines && se.Lines.length > 0) {
          if (!this.LineGroups && !Array.isArray(this.LineGroups)) {
            this.LineGroups = [];
          }

          se.LineGroups.map(selg => {
            const existLineGroups = this.LineGroups.filter(lg => lg.LineGroupId === selg.LineGroupId);
            if (!existLineGroups || existLineGroups.length <=0) {
              //不存在分類，就新增
              this.LineGroups.push(
                new LineGroupData(
                  selg.LineGroupId,
                  selg.LineGroupName,
                  selg.LineCount,
                  0,
                )
              )
            } else {
              //分類已存在，把投注線 數量加上去
              existLineGroups[0].LineCount = existLineGroups[0].LineCount + selg.LineCount;
            }
          })

          //合併投注線
          se.Lines.map(sel => {
            //修改玩法名
            const newBetTypeName = sideEventName + ' - ' + sel.BetTypeName;
            sel.BetTypeName = newBetTypeName
            sel.resetLineDesc();
            if (sel.Selections && sel.Selections.length > 0) {
              sel.Selections.map(sels => {
                sels.BetTypeName = newBetTypeName //selection裡面的玩法名也要一起改
              })
            }
            this.Lines.push(sel);
          });
        }
      }
    }
  }

  //越南語專用，首文字大寫
  static getAllFirstCharToUpperCase(str) {
    //越南每個字母首字大寫
    if (str) {
      if (str && str.indexOf(' ') !== -1) {
        let splitArr = str.split(' ');
        let newArr = splitArr.map(t => {
          if (t.length > 1) {
            return t[0].toUpperCase() + t.substring(1);
          } else if (t.length === 1) {
            return t.toUpperCase();
          }
        })
        return newArr.join(' ');
      } else if (str.length > 1) {
        return str[0].toUpperCase() + str.substring(1);
      } else if (str.length === 1) {
        return str.toUpperCase();
      }
    }
    return str
  }

  //安卓RN不能用 matchAll 需要自己寫一個
  static findAllMatches(pattern, str) {
    const regex = new RegExp(pattern)
    let m;
    let matches = [];
    while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      if (m) {
        matches.push([...m]);
      }
    }
    return matches;
  }
  
  //從IM數據生成EventData數據
  static createFromIMSource(item, SportId, FavoriteEvents, memberOddsType, memberType) {
    item.EventId = parseInt(item.EventId); //IM固定轉為int

    const isFavourite = FavoriteEvents.filter(favItem=>item.EventId === favItem.EventId).length > 0;

    //處理玩法分組
    let lineGroupDatas = [];
    for (let typeid in IMLineGroupNames) {

      const intTypeId = parseInt(typeid);
      //計算組內數量
      const linesInGroup = item.MarketLines.filter(l => {
        const groupid = (l.BetTypeId == 2 ? 1 : l.BetTypeId) //只有 2大/小 會併入 1讓分 ，需要特別處理
        return parseInt(groupid) === intTypeId;
      })

      lineGroupDatas.push(new LineGroupData(
        intTypeId,
        IMLineGroupNames[typeid],
        linesInGroup.length,
        intTypeId,
      ));
    }

    //市場名
    const MarketName = VendorMarketNames[item.Market];

    //是否滾球中
    const isRB = (item.Market === VendorMarkets.RUNNING) || (item.RBTime !== null);

    //處理滾球時間
    let rbMinute = '';
    let rbPeriod = '';
    if (isRB && item.RBTime) {
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

    //處理中立場
    if (item.GroundTypeId === 0 && item.HomeTeam) {
      item.HomeTeam = item.HomeTeam + '(' + i18n.NEUTRAL_GROUND + ')'
    }

    //處理角球
    let homeCorner = null;
    let awayCorner = null;
    if (isRB && item.RelatedScores && item.RelatedScores.length > 0) {
      const cornerData = item.RelatedScores.find(s => parseInt(s.EventGroupTypeId) === 2);
      if (cornerData) {
        homeCorner = cornerData.HomeScore ? cornerData.HomeScore : 0;
        awayCorner = cornerData.AwayScore ? cornerData.AwayScore : 0;
      }
    }

    return new EventData(
      item.EventId,
      item.EventDate,
      item.EventStatusId,
      item.EventGroupId,
      item.EventGroupTypeId,
      item.HomeTeamId,
      item.HomeTeam,
      item.HomeScore,
      item.HomeRedCard,
      homeCorner,
      null,//SABA專用
      item.AwayTeamId,
      item.AwayTeam,
      item.AwayScore,
      item.AwayRedCard,
      awayCorner,
      null,//SABA專用
      true,
      (isRB ? item.Competition.RBOrderNumber : item.Competition.PMOrderNumber) + '_' + item.OrderNumber,
      item.RBTime,
      rbMinute,
      rbPeriod,
      item.RelatedScores,
      item.GroundTypeId,
      item.OpenParlay,
      item.HasStatistic,
      item.HasVisualization,
      item.BREventId,
      isRB, //注意IM原始數據的isLive代表是否支持滾球投注，不是比賽進行中。不過BTI的isLive就是比賽進行中，所以乾脆統一改成isRB字段 比較不會混淆
      item.LiveStreaming === 1,
      item.LiveStreamingUrl,
      item.MatchDay,
      item.Season,
      item.ExtraInfo,
      SportId,
      item.Market,
      item.Competition.CompetitionId,
      item.Competition.CompetitionName,
      item.TotalMarketLineCount,
      isFavourite,
      false, //優勝冠軍有專用的create函數
      '', //優勝冠軍有專用的create函數
      lineGroupDatas,
      item.MarketLines.map(lineItem => {

        //IM的大/小 改成 大小 和mockup一致
        if (lineItem.BetTypeName === i18n.BIG_OR_SMALL) {
          lineItem.BetTypeName = i18n.BIG_SMALL
        }

        //處理IM的特殊玩法線名 - 第{goalnr}粒入球球队
        let thisBetTypeName = lineItem.BetTypeName;
        if (thisBetTypeName.indexOf('{') !== -1 && thisBetTypeName.indexOf('}') !== -1 ) {
          //從下面的selection找能用的替代文字(這到底是什麼神奇結構。。。)
          let childSelectionSpecifiers = []
          lineItem.WagerSelections.map(s => {
            if (s.Specifiers && (s.Specifiers.indexOf('=') !== -1)) {
              if (childSelectionSpecifiers.indexOf(s.Specifiers) === -1) {
                childSelectionSpecifiers.push(s.Specifiers);
              }
            }
          });
          if (childSelectionSpecifiers && childSelectionSpecifiers.length >0) {
            for (let chiildSpecifier of childSelectionSpecifiers) {
              let specifiersArr = []
              if (chiildSpecifier.indexOf('&') !== -1) {
                specifiersArr = chiildSpecifier.split('&');
              } else {
                specifiersArr = [chiildSpecifier];
              }
              specifiersArr.forEach(specifierV => {
                if (specifierV && (specifierV.indexOf('=') !== -1)) {
                  const spec_arr = specifierV.split('='); //用=切開
                  if (spec_arr && spec_arr.length === 2) {
                    const replaceTarget = '{' + spec_arr[0] + '}';
                    if (thisBetTypeName.indexOf(replaceTarget) !== -1) {
                      thisBetTypeName = thisBetTypeName.replace(replaceTarget, spec_arr[1]);
                      //console.log('===== LineBetTypeName replace!',lineItem.BetTypeName,thisBetTypeName,chiildSpecifier,lineItem.MarketlineId, item.EventId);
                    }
                  }
                }
              })
            }
          }
        }

        //betTypeName如果有兩個空白，取代成一個
        if (thisBetTypeName.indexOf('  ') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('  ',' ');
        }
        //IM 越南 BetTypeName 上下半場翻譯 和 periodName 不一致，直接取代
        if (thisBetTypeName.indexOf('Hiệp Một') !== -1 ) {
          thisBetTypeName = thisBetTypeName.replace('Hiệp Một',VendorPeriodName[2])
        } else if (thisBetTypeName.indexOf('Hiệp Hai') !== -1 ) {
          thisBetTypeName = thisBetTypeName.replace('Hiệp Hai',VendorPeriodName[3])
        }
        //IM越南BetTypeName翻譯更換
        //雙重機會
        if ([8,56,57,58,59].indexOf(lineItem.BetTypeId) !== -1 && thisBetTypeName.indexOf('Nhân Đôi Cơ Hội') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Nhân Đôi Cơ Hội','Cơ Hội Kép');
        }
        //第x球进球时分 (间隔)
        if (lineItem.BetTypeId === 47 && thisBetTypeName.indexOf('Phút (Phạm Vi) Ghi Bàn') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Phút (Phạm Vi) Ghi Bàn','Phút Ghi Bàn');
        }
        //全場第x球 & 1x2
        if (lineItem.BetTypeId === 55 && thisBetTypeName.indexOf('Bàn Thắng #') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Bàn Thắng #','Bàn Số #');
        }
        //全場波膽 多重投注
        if (lineItem.BetTypeId === 62 && thisBetTypeName.indexOf('Đa Tỷ Số Chính Xác') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Đa Tỷ Số Chính Xác','Đa Cược Tỷ Số Chính Xác');
        }
        //足球 主/客隊大小(160,161 有改過，在excel表原本是31,32), 籃球 主/客隊大小(93,94)
        if ([93,94,160,161].indexOf(lineItem.BetTypeId) !== -1 && thisBetTypeName.indexOf('Trên/Dưới Của Đội') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Trên/Dưới Của Đội','Trên/Dưới');
        }
        //第x粒入球球隊(現在是 159 之前號碼是 37)
        if (lineItem.BetTypeId === 159) {
          const regex = /Đội Ghi ([0-9]{1,2}) Bàn Thắng/gm;
          const matches = EventData.findAllMatches(regex, thisBetTypeName);
          if (matches && matches[0] && matches[0].length === 2) { //[array[2]] 結果會是兩層array，內層的[1]才是數字
            thisBetTypeName = thisBetTypeName.replace(regex, 'Đội Ghi Bàn Số ' + matches[0][1]);
          }
        }

        //籃球 哪一隊首先獲得x分
        if (lineItem.BetTypeId === 81 && thisBetTypeName.indexOf('Đội Nào Dạt Tới Diểm') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Đội Nào Dạt Tới Diểm','Đội Đạt Điểm');
        }

        //全場更換為全大寫
        let thisPeriodName = lineItem.PeriodName;
        if (thisPeriodName === 'Cả trận') {
          thisPeriodName = 'Cả Trận';
        }

        return new LineData(
          //IM的BetTypeId就是玩法分組，只有 2大/小 會併入 1讓分 ，需要特別處理
          //BTI的１個玩法 可能同時屬於多個分類，所以這裡也一起改成數組格式
          lineItem.BetTypeId == 2 ? [1] : [lineItem.BetTypeId],
          lineItem.BetTypeId,
          thisBetTypeName,
          lineItem.IsLocked,
          lineItem.MarketlineId,
          lineItem.MarketLineLevel,
          lineItem.MarketlineStatusId,
          lineItem.PeriodId,
          thisPeriodName,
          item.EventId,
          item.EventGroupTypeId,
          item.HomeTeam,
          item.AwayTeam,
          lineItem.WagerSelections.map(selectionItem => {

            let thisSelectionName = selectionItem.SelectionName;

            //如果有兩個空白，取代成一個
            if (thisSelectionName.indexOf('  ') !== -1) {
              thisSelectionName = thisSelectionName.replace('  ',' ');
            }

            //處理IM的特殊投注選項名
            if (selectionItem.Specifiers) {
              let specifiersArr = []
              if (selectionItem.Specifiers.indexOf('&') !== -1) {
                specifiersArr = selectionItem.Specifiers.split('&');
              } else {
                specifiersArr = [selectionItem.Specifiers];
              }
              specifiersArr.forEach(specifierV => {
                if (specifierV && (specifierV.indexOf('=') !== -1)) {
                  const spec_arr = specifierV.split('='); //用=切開
                  if (spec_arr && spec_arr.length === 2) {
                    if (spec_arr[0] === 'hcp') { //三項讓球，特別處理
                      //hcp=0:2
                      if (spec_arr[1].indexOf(':') !== -1) {
                        const xy_arr = spec_arr[1].split(':'); //後面的數字用:切開
                        if (xy_arr && xy_arr.length === 2) {
                          const thisx = parseInt(xy_arr[0]);
                          const thisy = parseInt(xy_arr[1]);
                          //分別取代 x-y 或者 y-x 讓分盤
                          if (thisSelectionName.indexOf('{x-y}') !== -1) {
                            thisSelectionName = thisSelectionName.replace('{x-y}', thisx - thisy);
                            //console.log('===== selectionName replace(x-y)!',selectionItem.SelectionName,thisSelectionName,selectionItem.Specifiers);
                          } else if (thisSelectionName.indexOf('{y-x}') !== -1) {
                            thisSelectionName = thisSelectionName.replace('{y-x}', thisy - thisx);
                            //console.log('===== selectionName replace!(y-x)',selectionItem.SelectionName,thisSelectionName,selectionItem.Specifiers);
                          } else {
                            //console.log('===== selectionName NOT replace??????',selectionItem.SelectionName,thisSelectionName,selectionItem.Specifiers);
                          }
                        }
                      }
                    } else {
                      //total=1.5 這種，直接取代
                      const replaceTarget = '{' + spec_arr[0] + '}';
                      if (thisSelectionName.indexOf(replaceTarget) !== -1) {
                        thisSelectionName = thisSelectionName.replace(replaceTarget, spec_arr[1]);
                        //console.log('===== selectionName replace!', selectionItem.SelectionName, thisSelectionName, selectionItem.Specifiers);
                      } else {
                        //console.log('===== selectionName NOT replace??????',selectionItem.SelectionName,thisSelectionName,selectionItem.Specifiers);
                      }
                    }
                  }
                }
              })
            }

            //處理讓球和大小的特殊展示方式

            let thisHandiCap = selectionItem.Handicap;

            //處理讓球
            if (lineItem.BetTypeId === 1 && thisHandiCap !== null) {
              let thisHandicapDecimal = new Decimal(thisHandiCap);
              if (selectionItem.SelectionId === 1) { //主場
                thisHandicapDecimal = thisHandicapDecimal.mul(-1);  //主場先乘-1
              }
              //如果是0.25或0.75，
              if (thisHandicapDecimal.abs().mod(1).eq(0.25) || thisHandicapDecimal.abs().mod(1).eq(0.75)) {
                // 0.75 改成 +0.5/1
                if (thisHandicapDecimal.greaterThan(0)) {
                  thisHandiCap = '+' + thisHandicapDecimal.sub(0.25).toNumber() + '/' + thisHandicapDecimal.add(0.25).toNumber();
                }
                // -0.75 改成 -0.5/1  前面統一加負號 記得負數最後用abs消掉負號
                if (thisHandicapDecimal.lessThan(0)) {
                  thisHandiCap = '-' + thisHandicapDecimal.add(0.25).abs().toNumber() + '/' + thisHandicapDecimal.sub(0.25).abs().toNumber();
                }
              } else {
                //直接加正負號
                if (thisHandicapDecimal.greaterThan(0)) {
                  thisHandiCap = '+' +  thisHandicapDecimal.toNumber();
                }
                if (thisHandicapDecimal.lessThan(0)) {
                  thisHandiCap = '-' +  thisHandicapDecimal.abs().toNumber();
                }
              }
            }

            //處理大小
            if (lineItem.BetTypeId === 2 && thisHandiCap !== null) {
              let thisHandicapDecimal = new Decimal(thisHandiCap);
              //如果是0.25或0.75，
              if (thisHandicapDecimal.abs().mod(1).eq(0.25) || thisHandicapDecimal.abs().mod(1).eq(0.75)) {
                // 0.75 改成 0.5/1
                if (thisHandicapDecimal.greaterThan(0)) {
                  thisHandiCap = thisHandicapDecimal.sub(0.25).toNumber() + '/' + thisHandicapDecimal.add(0.25).toNumber();
                }
              }
            }

            const oddsDeciaml = Decimal.clone({ rounding: 3 }) //無條件捨去

            //判斷投注目標球隊，IM利用selectionName判斷
            let targetTeamId = null;
            let targetTeamName = '';
            if ((item.HomeTeam && thisSelectionName.indexOf(item.HomeTeam) !== -1) //玩法名包含隊名
              || thisSelectionName === i18n.HOME) //或者玩法名就是一個「主」字
            {
              targetTeamId = item.HomeTeamId;
              targetTeamName = item.HomeTeam;
            } else if ((item.AwayTeam && thisSelectionName.indexOf(item.AwayTeam) !== -1) //玩法名包含隊名
              || thisSelectionName === i18n.AWAY)//或者玩法名就是一個「客」字
            {
              targetTeamId = item.AwayTeamId;
              targetTeamName = item.AwayTeam;
            }

            //從OddsList獲取賠率
            let thisOddsType = null;
            let thisOddsValue = null;
            if (selectionItem.OddsList && selectionItem.OddsList.length > 0) {
              let targetOddsInfo = selectionItem.OddsList[0]; //默認選第一個賠率
              const matchOddsInfos = selectionItem.OddsList.filter(oInfo => parseInt(oInfo.OddsType) === memberOddsType);
              if (matchOddsInfos && matchOddsInfos.length > 0) { //如果有找到跟會員設置的盤口一樣的，就使用這個
                targetOddsInfo = matchOddsInfos[0];
              }
              thisOddsType = targetOddsInfo.OddsType;
              thisOddsValue = targetOddsInfo.OddsValues[memberType]; //根據水位選擇賠率
            }
            //如果沒獲取到就用默認值
            thisOddsValue = thisOddsValue ?? selectionItem.Odds;
            thisOddsType = thisOddsType ?? selectionItem.OddsType;

            const thisDisplayOdds = new oddsDeciaml(thisOddsValue).toFixed(2);
            //檢查是否可以使用
            let thisSelectionIsLocked = false;
            if (selectionItem.WagerSelectionId == 0 || thisDisplayOdds === '0.00') {
              thisSelectionIsLocked = true; //標記投注選項已鎖定 無法使用
            }

            //IM 越南 翻譯調整
            //單/雙 文字錯誤
            if (lineItem.BetTypeId === 5
              && thisBetTypeName
              && (thisBetTypeName.indexOf('Lẻ/Chẵn') !== -1)
              && ([10,11].indexOf(selectionItem.SelectionId) !== -1)
            ){
              if (thisSelectionName === 'Trên' && selectionItem.SelectionId === 10) {
                thisSelectionName = 'Lẻ';
              }
              if (thisSelectionName === 'Dưới' && selectionItem.SelectionId === 11) {
                thisSelectionName = 'Chẵn';
              }
            }

            //雙重機會
            if (lineItem.BetTypeId === 8
              && thisBetTypeName
              && (thisBetTypeName.indexOf('Cơ Hội Kép') !== -1)
              && ([43,44,45].indexOf(selectionItem.SelectionId) !== -1)
            ){
              if (thisSelectionName === 'Nhà/Hòa' && selectionItem.SelectionId === 43) {
                thisSelectionName = 'Đội Nhà hoặc Hòa';
              }
              if (thisSelectionName === 'Hòa/Khách' && selectionItem.SelectionId === 44) {
                thisSelectionName = 'Hòa hoặc Đội Khách';
              }
              if (thisSelectionName === 'Nhà/Khách' && selectionItem.SelectionId === 45) {
                thisSelectionName = 'Đội Nhà hoặc Đội Khách';
              }
            }
            //第x球 & 1x2
            if (lineItem.BetTypeId === 55
              && thisBetTypeName
              && (thisBetTypeName.indexOf('Bàn Số #') !== -1)
              && ([186,187,188,189,190,191,192].indexOf(selectionItem.SelectionId) !== -1)
            ){
              if (thisSelectionName.indexOf('bàn thắng &') !== -1) {
                thisSelectionName = thisSelectionName.replace('bàn thắng &','bàn số');
              }
            }
            //雙重機會 & 雙方球隊皆進球
            if ([56,57,58].indexOf(lineItem.BetTypeId) !== -1
              && thisBetTypeName
              && (thisBetTypeName.indexOf('Cả Hai Đội Ghi Bà') !== -1) //最後n不要 有幾個玩法 給到大寫
              && (selectionItem.SelectionId >= 193 && selectionItem.SelectionId <= 210)
            ){
              //全大寫 + 把 "/" 換成 hoặc
              thisSelectionName = EventData.getAllFirstCharToUpperCase(thisSelectionName);
              if (thisSelectionName.indexOf(' / ') !== -1) {
                thisSelectionName = thisSelectionName.replace(' / ',' hoặc ')
              }
            }
            //雙重機會 & 大小
            if (lineItem.BetTypeId === 59
              && thisBetTypeName
              && (thisBetTypeName.indexOf('Trên/Dưới') !== -1)
              && ([211,212,213,241,215,216].indexOf(selectionItem.SelectionId) !== -1)
            ){
              //全大寫 + 把 "/" 換成 hoặc
              thisSelectionName = EventData.getAllFirstCharToUpperCase(thisSelectionName);
              if (thisSelectionName.indexOf(' / ') !== -1) {
                thisSelectionName = thisSelectionName.replace(' / ',' hoặc ')
              }
            }
            //半場/全場 & 大小/總進球
            if ([63,64,65].indexOf(lineItem.BetTypeId) !== -1
              && thisBetTypeName
              && (thisBetTypeName.indexOf('Nửa Trận/Hết Trận') !== -1)
              && (selectionItem.SelectionId >= 238 && selectionItem.SelectionId <= 309)
            ){
              //全大寫 + 把 "/" 換成 hoặc
              thisSelectionName = EventData.getAllFirstCharToUpperCase(thisSelectionName);
              if (thisSelectionName.indexOf(' / ') !== -1) {
                thisSelectionName = thisSelectionName.replace(' / ',' hoặc ')
              }
            }

            return new SelectionData(
              selectionItem.WagerSelectionId,
              selectionItem.SelectionId,
              thisSelectionName,
              0, //IM沒有selection group
              thisHandiCap,
              selectionItem.Handicap,
              selectionItem.Specifiers,
              SportId,
              item.Market,
              MarketName,
              item.Competition.CompetitionId,
              item.Competition.CompetitionName,
              item.HomeTeamId,
              item.HomeTeam,
              item.HomeScore,
              item.AwayTeamId,
              item.AwayTeam,
              item.AwayScore,
              item.EventId,
              item.OpenParlay,
              lineItem.MarketlineId,
              lineItem.BetTypeId,
              thisBetTypeName,
              lineItem.PeriodId,
              thisPeriodName,
              targetTeamId,
              targetTeamName,
              false,
              '',
              thisOddsValue,
              thisOddsType,
              selectionItem.OddsList ? selectionItem.OddsList.map(oddsItem => {
                return new OddsData(
                  oddsItem.OddsType,
                  oddsItem.OddsValues,
                )
              }) : [],
              thisDisplayOdds,
              thisSelectionIsLocked,
            )
          })
        )
      })
    )
  }
  
  //從IM優勝冠軍數據 生成EventData數據
  static createFromIMOutRightSource(item, SportId, FavoriteEvents, memberOddsType , memberType ) {
    item.EventId = parseInt(item.EventId); //IM固定轉為int

    const isFavourite = FavoriteEvents.filter(favItem=>item.EventId === favItem.EventId).length > 0;

    //市場名
    const MarketName = VendorMarketNames[VendorMarkets.OUTRIGHT];

    const oddsDeciaml = Decimal.clone({ rounding: 3 }) //無條件捨去

    return new EventData(
      item.EventId,
      item.EventDate,
      item.EventStatusId,
      null, //比賽分組 優勝冠軍沒有
      null, //比賽分組類型 優勝冠軍沒有
      null,  //主隊數據 優勝冠軍沒有
      null,
      null,
      null,
      null,
      null,//SABA專用
      null, //客隊數據 優勝冠軍沒有
      null,
      null,
      null,
      null,
      null,//SABA專用
      false,
      item.Competition.PMOrderNumber + '_' + item.OrderNumber,
      null, //滾球時間,平台原始的滾球數據 優勝冠軍沒有
      '',
      '',
      null, //相關比分清單  優勝冠軍沒有
      null, //主場狀態  優勝冠軍沒有
      false, //只能單注，不能串
      false,  //是否有分析數據(BR) 優勝冠軍沒有
      false, //是否有可視化 優勝冠軍沒有
      null, //BREventId 可視化(BR)比賽Id 優勝冠軍沒有
      false, //是否滾球中  優勝冠軍沒有
      false, //是否有直播數據 優勝冠軍沒有
      null, //直播源列表
      null, //賽日指標，用於虛擬體育
      null, //賽事指標，用於虛擬體育
      null, //額外信息
      SportId,
      VendorMarkets.OUTRIGHT,
      item.Competition.CompetitionId,
      item.Competition.CompetitionName,
      1, //玩法總數 都只有一種  就是 優勝冠軍
      isFavourite,
      true, //是 優勝冠軍賽事
      item.OutrightEventName,
      [], //玩法分組列表 優勝冠軍沒有
      item.MarketLines.map(lineItem => {
        return new LineData(
          [], //玩法分組 優勝冠軍沒有
          lineItem.BetTypeId,
          lineItem.BetTypeName,
          lineItem.IsLocked,
          lineItem.MarketlineId,
          lineItem.MarketLineLevel,
          lineItem.MarketlineStatusId,
          lineItem.PeriodId,
          lineItem.PeriodName,
          item.EventId,
          null,
          null,
          null,
          lineItem.WagerSelections.map(selectionItem => {

            //從OddsList獲取賠率
            let thisOddsType = null;
            let thisOddsValue = null;
            if (selectionItem.OddsList && selectionItem.OddsList.length > 0) {
              let targetOddsInfo = selectionItem.OddsList[0]; //默認選第一個賠率
              const matchOddsInfos = selectionItem.OddsList.filter(oInfo => parseInt(oInfo.OddsType) === memberOddsType);
              if (matchOddsInfos && matchOddsInfos.length > 0) { //如果有找到跟會員設置的盤口一樣的，就使用這個
                targetOddsInfo = matchOddsInfos[0];
              }
              thisOddsType = targetOddsInfo.OddsType;
              thisOddsValue = targetOddsInfo.OddsValues[memberType]; //根據水位選擇賠率
            }

            //如果沒獲取到就用默認值
            thisOddsValue = thisOddsValue ?? selectionItem.Odds;
            thisOddsType = thisOddsType ?? selectionItem.OddsType;

            const thisDisplayOdds = new oddsDeciaml(thisOddsValue).toFixed(2);
            //檢查是否可以使用
            let thisSelectionIsLocked = false;
            if (selectionItem.WagerSelectionId == 0 || thisDisplayOdds === '0.00') {
              thisSelectionIsLocked = true; //標記投注選項已鎖定 無法使用
            }

            return new SelectionData(
              selectionItem.WagerSelectionId,
              selectionItem.SelectionId,
              selectionItem.SelectionName,
              0, //IM沒有selection group
              selectionItem.Handicap,
              selectionItem.Handicap,
              selectionItem.Specifiers,
              SportId,
              VendorMarkets.OUTRIGHT,
              MarketName,
              item.Competition.CompetitionId,
              item.Competition.CompetitionName,
              null,
              null,
              null,
              null,
              null,
              null,
              item.EventId,
              false,
              lineItem.MarketlineId,
              lineItem.BetTypeId,
              lineItem.BetTypeName,
              lineItem.PeriodId,
              lineItem.PeriodName,
              selectionItem.SelectionId, //優勝冠軍的目標隊就是selectionItem
              selectionItem.SelectionName,
              true,
              item.OutrightEventName,
              thisOddsValue,
              thisOddsType,
              selectionItem.OddsList ? selectionItem.OddsList.map(oddsItem => {
                return new OddsData(
                  oddsItem.OddsType,
                  oddsItem.OddsValues,
                )
              }) : [],
              thisDisplayOdds,
              thisSelectionIsLocked,
            )
          })
        )
      })
    )
  }

  //新api 從IM數據生成EventData數據
  static createFromNewIMSource(item, SportId, FavoriteEvents, memberOddsType, memberType) {
    item.EventId = parseInt(item.EventId); //IM固定轉為int
    const isFavourite = FavoriteEvents.filter(favItem=>item.EventId === favItem.EventId).length > 0;

    //處理玩法分組
    let lineGroupDatas = [];
    for (let typeid in IMLineGroupNames) {

      const intTypeId = parseInt(typeid);
      //計算組內數量
      const linesInGroup = item.Lines.filter(l => {
        const groupid = (l.BetTypeId == 2 ? 1 : l.BetTypeId) //只有 2大/小 會併入 1讓分 ，需要特別處理
        return parseInt(groupid) === intTypeId;
      })

      lineGroupDatas.push(new LineGroupData(
        intTypeId,
        IMLineGroupNames[typeid],
        linesInGroup.length,
        intTypeId,
      ));
    }

    //市場名
    const MarketName = VendorMarketNames[item.MarketId];

    //是否滾球中
    const isRB = (item.MarketId === VendorMarkets.RUNNING) || (item.RBTime !== null);

    //處理滾球時間
    let rbMinute = '';
    let rbPeriod = '';
    if (isRB && item.RBTime) {
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

    //處理中立場
    if (!item.IsGround && item.HomeTeamName) {
      item.HomeTeamName = item.HomeTeamName + '(' + i18n.NEUTRAL_GROUND + ')'
    }

    //處理角球
    let homeCorner = null;
    let awayCorner = null;
    if (isRB) {
      homeCorner = item.HomeCorner ?? homeCorner;
      awayCorner = item.AwayCorner ?? awayCorner;
    }
    return new EventData(
      item.EventId,
      item.EventDate,
      null,
      null,
      null,
      item.HomeTeamId,
      item.HomeTeamName,
      item.HomeScore,
      item.HomeRedCard,
      homeCorner,
      null,//SABA專用
      item.AwayTeamId,
      item.AwayTeamName,
      item.AwayScore,
      item.AwayRedCard,
      awayCorner,
      null,//SABA專用
      true,
      item.SortOrder,
      item.RBTime,
      rbMinute,
      rbPeriod,
      null,
      null,
      item.IsOpenParlay,
      null,
      item.HasVisualization,
      item.BREventId,
      isRB, //注意IM原始數據的isLive代表是否支持滾球投注，不是比賽進行中。不過BTI的isLive就是比賽進行中，所以乾脆統一改成isRB字段 比較不會混淆
      item.HasLiveStreaming,
      item.LiveStreamingUrl,
      null,
      null,
      null,
      SportId,
      item.MarketId,
      item.LeagueId,
      item.LeagueName,
      item.TotalLineCount,
      isFavourite,
      false, //優勝冠軍有專用的create函數
      '', //優勝冠軍有專用的create函數
      lineGroupDatas,
      item.Lines.map(lineItem => {
        lineItem.BetTypeId = parseInt(lineItem.BetTypeId)
        //IM的大/小 改成 大小 和mockup一致
        if (lineItem.BetTypeName === i18n.BIG_OR_SMALL) {
          lineItem.BetTypeName = i18n.BIG_SMALL
        }

        //處理IM的特殊玩法線名 - 第{goalnr}粒入球球队
        let thisBetTypeName = lineItem.BetTypeName;
        if (thisBetTypeName.indexOf('{') !== -1 && thisBetTypeName.indexOf('}') !== -1 ) {

          //從下面的selection找能用的替代文字(這到底是什麼神奇結構。。。)
          let childSelectionSpecifiers = []
          lineItem.Selections && lineItem.Selections.map(s => {
            if (s.ExtraData.Specifiers && (s.ExtraData.Specifiers.indexOf('=') !== -1)) {
              if (childSelectionSpecifiers.indexOf(s.ExtraData.Specifiers) === -1) {
                childSelectionSpecifiers.push(s.ExtraData.Specifiers);
              }
            }
          });
          if (childSelectionSpecifiers && childSelectionSpecifiers.length >0) {
            for (let chiildSpecifier of childSelectionSpecifiers) {
              let specifiersArr = []
              if (chiildSpecifier.indexOf('&') !== -1) {
                specifiersArr = chiildSpecifier.split('&');
              } else {
                specifiersArr = [chiildSpecifier];
              }
              specifiersArr.forEach(specifierV => {
                if (specifierV && (specifierV.indexOf('=') !== -1)) {
                  const spec_arr = specifierV.split('='); //用=切開
                  if (spec_arr && spec_arr.length === 2) {
                    const replaceTarget = '{' + spec_arr[0] + '}';
                    if (thisBetTypeName.indexOf(replaceTarget) !== -1) {
                      thisBetTypeName = thisBetTypeName.replace(replaceTarget, spec_arr[1]);
                      //console.log('===== LineBetTypeName replace!',lineItem.BetTypeName,thisBetTypeName,chiildSpecifier,lineItem.MarketlineId, item.EventId);
                    }
                  }
                }
              })
            }
          }
        }

        //betTypeName如果有兩個空白，取代成一個
        if (thisBetTypeName.indexOf('  ') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('  ',' ');
        }
        //IM 越南 BetTypeName 上下半場翻譯 和 periodName 不一致，直接取代
        if (thisBetTypeName.indexOf('Hiệp Một') !== -1 ) {
          thisBetTypeName = thisBetTypeName.replace('Hiệp Một',VendorPeriodName[2])
        } else if (thisBetTypeName.indexOf('Hiệp Hai') !== -1 ) {
          thisBetTypeName = thisBetTypeName.replace('Hiệp Hai',VendorPeriodName[3])
        }
        //IM越南BetTypeName翻譯更換
        //雙重機會
        if ([8,56,57,58,59].indexOf(lineItem.BetTypeId) !== -1 && thisBetTypeName.indexOf('Nhân Đôi Cơ Hội') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Nhân Đôi Cơ Hội','Cơ Hội Kép');
        }
        //第x球进球时分 (间隔)
        if (lineItem.BetTypeId === 47 && thisBetTypeName.indexOf('Phút (Phạm Vi) Ghi Bàn') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Phút (Phạm Vi) Ghi Bàn','Phút Ghi Bàn');
        }
        //全場第x球 & 1x2
        if (lineItem.BetTypeId === 55 && thisBetTypeName.indexOf('Bàn Thắng #') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Bàn Thắng #','Bàn Số #');
        }
        //全場波膽 多重投注
        if (lineItem.BetTypeId === 62 && thisBetTypeName.indexOf('Đa Tỷ Số Chính Xác') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Đa Tỷ Số Chính Xác','Đa Cược Tỷ Số Chính Xác');
        }
        //足球 主/客隊大小(160,161 有改過，在excel表原本是31,32), 籃球 主/客隊大小(93,94)
        if ([93,94,160,161].indexOf(lineItem.BetTypeId) !== -1 && thisBetTypeName.indexOf('Trên/Dưới Của Đội') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Trên/Dưới Của Đội','Trên/Dưới');
        }
        //第x粒入球球隊(現在是 159 之前號碼是 37)
        if (lineItem.BetTypeId === 159) {
          const regex = /Đội Ghi ([0-9]{1,2}) Bàn Thắng/gm;
          const matches = EventData.findAllMatches(regex, thisBetTypeName);
          if (matches && matches[0] && matches[0].length === 2) { //[array[2]] 結果會是兩層array，內層的[1]才是數字
            thisBetTypeName = thisBetTypeName.replace(regex, 'Đội Ghi Bàn Số ' + matches[0][1]);
          }
        }

        //籃球 哪一隊首先獲得x分
        if (lineItem.BetTypeId === 81 && thisBetTypeName.indexOf('Đội Nào Dạt Tới Diểm') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Đội Nào Dạt Tới Diểm','Đội Đạt Điểm');
        }

        //全場更換為全大寫
        // SABA PeriodName會傳null，擋一下，防後續出錯
        let thisPeriodName = lineItem.PeriodName ?? "";
        if (thisPeriodName === 'Cả trận') {
          thisPeriodName = 'Cả Trận';
        }

        return new LineData(
          //IM的BetTypeId就是玩法分組，只有 2大/小 會併入 1讓分 ，需要特別處理
          //BTI的１個玩法 可能同時屬於多個分類，所以這裡也一起改成數組格式
          lineItem.BetTypeId == 2 ? [1] : [lineItem.BetTypeId],
          lineItem.BetTypeId,
          thisBetTypeName,
          lineItem.IsLocked,
          parseInt(lineItem.LineId),
          parseInt(lineItem.LineLevel),
          null,
          parseInt(lineItem.PeriodId),
          thisPeriodName,
          parseInt(item.EventId),
          null,
          item.HomeTeamName ,
          item.AwayTeamName ,
          lineItem.Selections.map(selectionItem => {
            selectionItem.SelectionType = parseInt(selectionItem.SelectionType)
            let thisSelectionName = selectionItem.SelectionName;

            //如果有兩個空白，取代成一個
            if (thisSelectionName.indexOf('  ') !== -1) {
              thisSelectionName = thisSelectionName.replace('  ',' ');
            }

            //處理IM的特殊投注選項名
            if (selectionItem.ExtraData.Specifiers) {
              let specifiersArr = []
              if (selectionItem.ExtraData.Specifiers.indexOf('&') !== -1) {
                specifiersArr = selectionItem.ExtraData.Specifiers.split('&');
              } else {
                specifiersArr = [selectionItem.ExtraData.Specifiers];
              }
              specifiersArr.forEach(specifierV => {
                if (specifierV && (specifierV.indexOf('=') !== -1)) {
                  const spec_arr = specifierV.split('='); //用=切開
                  if (spec_arr && spec_arr.length === 2) {
                    if (spec_arr[0] === 'hcp') { //三項讓球，特別處理
                      //hcp=0:2
                      if (spec_arr[1].indexOf(':') !== -1) {
                        const xy_arr = spec_arr[1].split(':'); //後面的數字用:切開
                        if (xy_arr && xy_arr.length === 2) {
                          const thisx = parseInt(xy_arr[0]);
                          const thisy = parseInt(xy_arr[1]);
                          //分別取代 x-y 或者 y-x 讓分盤
                          if (thisSelectionName.indexOf('{x-y}') !== -1) {
                            thisSelectionName = thisSelectionName.replace('{x-y}', thisx - thisy);
                            //console.log('===== selectionName replace(x-y)!',selectionItem.SelectionName,thisSelectionName,selectionItem.Specifiers);
                          } else if (thisSelectionName.indexOf('{y-x}') !== -1) {
                            thisSelectionName = thisSelectionName.replace('{y-x}', thisy - thisx);
                            //console.log('===== selectionName replace!(y-x)',selectionItem.SelectionName,thisSelectionName,selectionItem.Specifiers);
                          } else {
                            //console.log('===== selectionName NOT replace??????',selectionItem.SelectionName,thisSelectionName,selectionItem.Specifiers);
                          }
                        }
                      }
                    } else {
                      //total=1.5 這種，直接取代
                      const replaceTarget = '{' + spec_arr[0] + '}';
                      if (thisSelectionName.indexOf(replaceTarget) !== -1) {
                        thisSelectionName = thisSelectionName.replace(replaceTarget, spec_arr[1]);
                        //console.log('===== selectionName replace!', selectionItem.SelectionName, thisSelectionName, selectionItem.Specifiers);
                      } else {
                        //console.log('===== selectionName NOT replace??????',selectionItem.SelectionName,thisSelectionName,selectionItem.Specifiers);
                      }
                    }
                  }
                }
              })
            }

            //處理讓球和大小的特殊展示方式
            let thisHandiCap = selectionItem.Handicap;
            
            //處理讓球
            if (lineItem.BetTypeId === 1 && thisHandiCap !== null) {
              let thisHandicapDecimal = new Decimal(thisHandiCap);
              if (selectionItem.SelectionType === 1) { //主場
                thisHandicapDecimal = thisHandicapDecimal.mul(-1);  //主場先乘-1
              }
              //如果是0.25或0.75，
              if (thisHandicapDecimal.abs().mod(1).eq(0.25) || thisHandicapDecimal.abs().mod(1).eq(0.75)) {
                // 0.75 改成 +0.5/1
                if (thisHandicapDecimal.greaterThan(0)) {
                  thisHandiCap = '+' + thisHandicapDecimal.sub(0.25).toNumber() + '/' + thisHandicapDecimal.add(0.25).toNumber();
                }
                // -0.75 改成 -0.5/1  前面統一加負號 記得負數最後用abs消掉負號
                if (thisHandicapDecimal.lessThan(0)) {
                  thisHandiCap = '-' + thisHandicapDecimal.add(0.25).abs().toNumber() + '/' + thisHandicapDecimal.sub(0.25).abs().toNumber();
                }
              } else {
                //直接加正負號
                if (thisHandicapDecimal.greaterThan(0)) {
                  thisHandiCap = '+' +  thisHandicapDecimal.toNumber();
                }
                if (thisHandicapDecimal.lessThan(0)) {
                  thisHandiCap = '-' +  thisHandicapDecimal.abs().toNumber();
                }
              }
            }

            //處理大小
            if (lineItem.BetTypeId === 2 && thisHandiCap !== null) {
              let thisHandicapDecimal = new Decimal(thisHandiCap);
              //如果是0.25或0.75，
              if (thisHandicapDecimal.abs().mod(1).eq(0.25) || thisHandicapDecimal.abs().mod(1).eq(0.75)) {
                // 0.75 改成 0.5/1
                if (thisHandicapDecimal.greaterThan(0)) {
                  thisHandiCap = thisHandicapDecimal.sub(0.25).toNumber() + '/' + thisHandicapDecimal.add(0.25).toNumber();
                }
              }
            }
            
            const oddsDeciaml = Decimal.clone({ rounding: 3 }) //無條件捨去

            //判斷投注目標球隊，IM利用selectionName判斷
            let targetTeamId = null;
            let targetTeamName = '';
            if ((item.HomeTeamName  && thisSelectionName.indexOf(item.HomeTeamName) !== -1) //玩法名包含隊名
              || thisSelectionName === i18n.HOME) //或者玩法名就是一個「主」字
            {
              targetTeamId = item.HomeTeamId;
              targetTeamName = item.HomeTeamName ;
            } else if ((item.AwayTeamName  && thisSelectionName.indexOf(item.AwayTeamName) !== -1) //玩法名包含隊名
              || thisSelectionName === i18n.AWAY)//或者玩法名就是一個「客」字
            {
              targetTeamId = item.AwayTeamId;
              targetTeamName = item.AwayTeamName;
            }

            //從OddsList獲取賠率
            let thisOddsType = null;
            let thisOddsValue = null;

            if (selectionItem.OddsList && selectionItem.OddsList.length > 0) {
              let targetOddsInfo = selectionItem.OddsList[0]; //默認選第一個賠率
              const matchOddsInfos = selectionItem.OddsList.filter(oInfo => parseInt(oInfo.OddsType) === memberOddsType);
              if (matchOddsInfos && matchOddsInfos.length > 0) { //如果有找到跟會員設置的盤口一樣的，就使用這個
                targetOddsInfo = matchOddsInfos[0];
              }
              thisOddsType = targetOddsInfo.OddsType;
              thisOddsValue = targetOddsInfo.OddsValues[memberType]; //根據水位選擇賠率
            }
            // console.log('thisOddsType ',thisOddsType)
            // console.log('thisOddsValue ',thisOddsValue)
            //如果沒獲取到就用默認值
            thisOddsValue = thisOddsValue ?? selectionItem.Odds;
            thisOddsType = thisOddsType ?? selectionItem.OddsType;
            const thisDisplayOdds = new oddsDeciaml(thisOddsValue).toFixed(2);

            //檢查是否可以使用
            let thisSelectionIsLocked = false;

            if (selectionItem.SelectionType == 0 || thisDisplayOdds === '0.00') {
              thisSelectionIsLocked = true; //標記投注選項已鎖定 無法使用
            }

            //IM 越南 翻譯調整
            //單/雙 文字錯誤
            if (lineItem.BetTypeId === 5
              && thisBetTypeName
              && (thisBetTypeName.indexOf('Lẻ/Chẵn') !== -1)
              && ([10,11].indexOf(selectionItem.SelectionType) !== -1)
            ){
              if (thisSelectionName === 'Trên' && selectionItem.SelectionType === 10) {
                thisSelectionName = 'Lẻ';
              }
              if (thisSelectionName === 'Dưới' && selectionItem.SelectionType === 11) {
                thisSelectionName = 'Chẵn';
              }
            }

            //雙重機會
            if (lineItem.BetTypeId === 8
              && thisBetTypeName
              && (thisBetTypeName.indexOf('Cơ Hội Kép') !== -1)
              && ([43,44,45].indexOf(selectionItem.SelectionType) !== -1)
            ){
              if (thisSelectionName === 'Nhà/Hòa' && selectionItem.SelectionType === 43) {
                thisSelectionName = 'Đội Nhà hoặc Hòa';
              }
              if (thisSelectionName === 'Hòa/Khách' && selectionItem.SelectionType === 44) {
                thisSelectionName = 'Hòa hoặc Đội Khách';
              }
              if (thisSelectionName === 'Nhà/Khách' && selectionItem.SelectionType === 45) {
                thisSelectionName = 'Đội Nhà hoặc Đội Khách';
              }
            }
            //第x球 & 1x2
            if (lineItem.BetTypeId === 55
              && thisBetTypeName
              && (thisBetTypeName.indexOf('Bàn Số #') !== -1)
              && ([186,187,188,189,190,191,192].indexOf(selectionItem.SelectionType) !== -1)
            ){
              if (thisSelectionName.indexOf('bàn thắng &') !== -1) {
                thisSelectionName = thisSelectionName.replace('bàn thắng &','bàn số');
              }
            }
            //雙重機會 & 雙方球隊皆進球
            if ([56,57,58].indexOf(lineItem.BetTypeId) !== -1
              && thisBetTypeName
              && (thisBetTypeName.indexOf('Cả Hai Đội Ghi Bà') !== -1) //最後n不要 有幾個玩法 給到大寫
              && (selectionItem.SelectionType >= 193 && selectionItem.SelectionType <= 210)
            ){
              //全大寫 + 把 "/" 換成 hoặc
              thisSelectionName = EventData.getAllFirstCharToUpperCase(thisSelectionName);
              if (thisSelectionName.indexOf(' / ') !== -1) {
                thisSelectionName = thisSelectionName.replace(' / ',' hoặc ')
              }
            }
            //雙重機會 & 大小
            if (lineItem.BetTypeId === 59
              && thisBetTypeName
              && (thisBetTypeName.indexOf('Trên/Dưới') !== -1)
              && ([211,212,213,241,215,216].indexOf(selectionItem.SelectionType) !== -1)
            ){
              //全大寫 + 把 "/" 換成 hoặc
              thisSelectionName = EventData.getAllFirstCharToUpperCase(thisSelectionName);
              if (thisSelectionName.indexOf(' / ') !== -1) {
                thisSelectionName = thisSelectionName.replace(' / ',' hoặc ')
              }
            }
            //半場/全場 & 大小/總進球
            if ([63,64,65].indexOf(lineItem.BetTypeId) !== -1
              && thisBetTypeName
              && (thisBetTypeName.indexOf('Nửa Trận/Hết Trận') !== -1)
              && (selectionItem.SelectionType >= 238 && selectionItem.SelectionType <= 309)
            ){
              //全大寫 + 把 "/" 換成 hoặc
              thisSelectionName = EventData.getAllFirstCharToUpperCase(thisSelectionName);
              if (thisSelectionName.indexOf(' / ') !== -1) {
                thisSelectionName = thisSelectionName.replace(' / ',' hoặc ')
              }
            }

            return new SelectionData(
              parseInt(selectionItem.SelectionId),
              parseInt(selectionItem.SelectionType),
              thisSelectionName,
              0, //IM沒有selection group
              thisHandiCap,
              selectionItem.Handicap,
              null,
              parseInt(SportId),
              parseInt(item.MarketId),
              MarketName,
              parseInt(item.LeagueId),
              item.LeagueName,
              parseInt(item.HomeTeamId),
              item.HomeTeamName,
              item.HomeScore,
              parseInt(item.AwayTeamId),
              item.AwayTeamName,
              item.AwayScore,
              item.EventId,
              item.IsOpenParlay,
              parseInt(lineItem.LineId),
              parseInt(lineItem.BetTypeId),
              thisBetTypeName,
              parseInt(lineItem.PeriodId),
              thisPeriodName,
              targetTeamId,
              targetTeamName,
              false,
              '',
              thisOddsValue,
              thisOddsType,
              selectionItem.OddsList ? selectionItem.OddsList.map(oddsItem => {
                return new OddsData(
                  oddsItem.OddsType,
                  oddsItem.OddsValues,
                )
              }) : [],
              thisDisplayOdds,
              thisSelectionIsLocked,
            )
          })
        )
      })
    )
  }
  
  //新api 從IM優勝冠軍數據 生成EventData數據
  static createFromNewIMOutRightSource(item, SportId, FavoriteEvents, memberOddsType , memberType ) {
    item.EventId = parseInt(item.EventId); //IM固定轉為int

    const isFavourite = FavoriteEvents.filter(favItem=>item.EventId === favItem.EventId).length > 0;

    //市場名
    const MarketName = VendorMarketNames[VendorMarkets.OUTRIGHT];

    const oddsDeciaml = Decimal.clone({ rounding: 3 }) //無條件捨去

    return new EventData(
      item.EventId,
      item.EventDate,
      item.EventStatusId,
      null, //比賽分組 優勝冠軍沒有
      null, //比賽分組類型 優勝冠軍沒有
      null,  //主隊數據 優勝冠軍沒有
      null,
      null,
      null,
      null,
      null,//SABA專用
      null, //客隊數據 優勝冠軍沒有
      null,
      null,
      null,
      null,
      null,//SABA專用
      false,
      item.SortOrder,
      null, //滾球時間,平台原始的滾球數據 優勝冠軍沒有
      '',
      '',
      null, //相關比分清單  優勝冠軍沒有
      null, //主場狀態  優勝冠軍沒有
      false, //只能單注，不能串
      false,  //是否有分析數據(BR) 優勝冠軍沒有
      false, //是否有可視化 優勝冠軍沒有
      null, //BREventId 可視化(BR)比賽Id 優勝冠軍沒有
      false, //是否滾球中  優勝冠軍沒有
      false, //是否有直播數據 優勝冠軍沒有
      null, //直播源列表
      null, //賽日指標，用於虛擬體育
      null, //賽事指標，用於虛擬體育
      null, //額外信息
      SportId,
      VendorMarkets.OUTRIGHT,
      item.LeagueId,
      item.LeagueName,
      1, //玩法總數 都只有一種  就是 優勝冠軍
      isFavourite,
      true, //是 優勝冠軍賽事
      item.OutRightEventName,
      [], //玩法分組列表 優勝冠軍沒有
      item.Lines.length > 0 && item.Lines.map(lineItem => {
        return new LineData(
          [], //玩法分組 優勝冠軍沒有
          parseInt(lineItem.BetTypeId),
          lineItem.BetTypeName,
          lineItem.IsLocked,
          parseInt(lineItem.LineId),
          parseInt(lineItem.LineLevel),
          null,
          parseInt(lineItem.PeriodId),
          lineItem.PeriodName,
          parseInt(item.EventId),
          null,
          null,
          null,
          lineItem.Selections.map(selectionItem => {
            selectionItem.SelectionType = parseInt(selectionItem.SelectionType)
            //從OddsList獲取賠率
            let thisOddsType = null;
            let thisOddsValue = null;
            if (selectionItem.OddsList && selectionItem.OddsList.length > 0) {
              let targetOddsInfo = selectionItem.OddsList[0]; //默認選第一個賠率
              const matchOddsInfos = selectionItem.OddsList.filter(oInfo => parseInt(oInfo.OddsType) === memberOddsType);
              if (matchOddsInfos && matchOddsInfos.length > 0) { //如果有找到跟會員設置的盤口一樣的，就使用這個
                targetOddsInfo = matchOddsInfos[0];
              }
              thisOddsType = targetOddsInfo.OddsType;
              thisOddsValue = targetOddsInfo.OddsValues[memberType]; //根據水位選擇賠率
            }

            //如果沒獲取到就用默認值
            thisOddsValue = thisOddsValue ?? selectionItem.Odds;
            thisOddsType = thisOddsType ?? selectionItem.OddsType;

            const thisDisplayOdds = new oddsDeciaml(thisOddsValue).toFixed(2);
            //檢查是否可以使用
            let thisSelectionIsLocked = false;
            if (selectionItem.SelectionType == 0 || thisDisplayOdds === '0.00') {
              thisSelectionIsLocked = true; //標記投注選項已鎖定 無法使用
            }

            return new SelectionData(
              parseInt(selectionItem.SelectionId),
              selectionItem.SelectionType,
              selectionItem.SelectionName,
              0, //IM沒有selection group
              selectionItem.Handicap,
              selectionItem.Handicap,
              selectionItem.ExtraData.Specifiers,
              SportId,
              VendorMarkets.OUTRIGHT,
              MarketName,
              parseInt(item.LeagueId),
              item.LeagueName,
              null,
              null,
              null,
              null,
              null,
              null,
              item.EventId,
              false,
              parseInt(lineItem.LineId),
              parseInt(lineItem.BetTypeId),
              lineItem.BetTypeName,
              parseInt(lineItem.PeriodId),
              lineItem.PeriodName,
              selectionItem.SelectionType, //優勝冠軍的目標隊就是selectionItem
              selectionItem.SelectionName,
              true,
              item.OutRightEventName,
              thisOddsValue,
              thisOddsType,
              selectionItem.OddsList ? selectionItem.OddsList.map(oddsItem => {
                return new OddsData(
                  oddsItem.OddsType,
                  oddsItem.OddsValues,
                )
              }) : [],
              thisDisplayOdds,
              thisSelectionIsLocked,
            )
          })
        )
      })
    )
  }

  //新api 從SABA數據生成EventData數據
  static createFromNewSABASource(item, lines, marketId = null, FavoriteEvents, memberOddsType, itemIndex= null) {
    item.EventId = parseInt(item.EventId);  //saba固定轉為int
    item.HomeScore = parseInt(item.HomeScore);
    item.AwayScore = parseInt(item.AwayScore);
    item.SportId = parseInt(item.SportId)
    
    const thisEventDate = EventData.getSABAEventDateUTC(item.EventDate);

    //判斷市場
    if (marketId === null || marketId === VendorMarkets.FAVOURITE) {  //關注(收藏) 實際不算一種Market 只是下拉選項 另外有一個MarketIdForListing字段 負責處理UI問題
      if(item.IsRB == true) {
        //滾球
        marketId = VendorMarkets.RUNNING;
      } else {
        //今日早盤 由日期判斷
        const oneDayAfter = moment().add(1,'day').utcOffset(VendorConfigs.TIMEZONE);
        const eventDate = moment(item.startEventDate).utcOffset(VendorConfigs.TIMEZONE);
        if (eventDate > oneDayAfter) {
          marketId = VendorMarkets.EARLY;
        } else {
          marketId = VendorMarkets.TODAY;
        }
      }
    }

    const marketName = VendorMarketNames[marketId];

    const isFavourite = FavoriteEvents.filter(favItem=>item.EventId === favItem.EventId).length > 0;

    const thisLines = lines;
    
    let oddsTypePropList = [];
    for (let oddsPropName in SABAOddsTypeToNumber) {
      oddsTypePropList.push({name: oddsPropName, number: SABAOddsTypeToNumber[oddsPropName]});
    }

    const ExtraData = item.ExtraData;
    const GameInfo = ExtraData?.gameInfo;
    
    //判斷隊名
    let homeTeamId = 0;
    let awayTeamId = 0;
    let homeTeamName = 'not set';
    let awayTeamName = 'not set';
    
    // 用isNaN檢查是否為有效數字，避免falsy情況
    const homeTeamScore = isNaN(item.HomeScore) ? null : item.HomeScore;
    const awayTeamScore = isNaN(item.AwayScore) ? null : item.AwayScore;
    
    if (ExtraData.teamInfo) {
      homeTeamId = parseInt(ExtraData.teamInfo.homeId);
      awayTeamId = parseInt(ExtraData.teamInfo.awayId);
      homeTeamName = ExtraData.teamInfo.homeName;
      awayTeamName = ExtraData.teamInfo.awayName;
    }


    //處理滾球時間
    let rbMinute = '';
    let rbPeriod = ''; //原始數據
    let rbPeroidName = ''; //中文
    if (item.IsRB && GameInfo) {
      rbPeriod = GameInfo.inPlayTime;
      if(rbPeriod === undefined || rbPeriod === null) {
        rbPeriod = '';//空字符串 避免報錯
      }

      //按照saba提供的表去處理比賽時段名
      let rbPeriodKey = null;
      if (item.SportId == 1) { //足球
        if (GameInfo.livePeriod == 0 && GameInfo.delayLive && !GameInfo.isHt) {
          rbPeriodKey = 'Delayed'; //延遲開賽
        } else if (GameInfo.livePeriod == 1 && !GameInfo.delayLive && !GameInfo.isHt) {
          rbPeriodKey = '1H'; //上半场
        } else if (GameInfo.livePeriod == 2 && !GameInfo.delayLive && !GameInfo.isHt) {
          rbPeriodKey = '2H'; //下半场
        } else if (GameInfo.livePeriod == 0 && !GameInfo.delayLive && GameInfo.isHt) {
          rbPeriodKey = 'HT'; //中场休息
        }
      } else if (item.SportId == 2) { //篮球
        if (GameInfo.livePeriod == 0 && GameInfo.delayLive && !GameInfo.isHt) {
          rbPeriodKey = 'Delayed'; //延遲開賽
        } else if (GameInfo.livePeriod == 1 && !GameInfo.delayLive && !GameInfo.isHt) {
          rbPeriodKey = '1Q'; //第 1 节
        } else if (GameInfo.livePeriod == 2 && !GameInfo.delayLive && !GameInfo.isHt) {
          rbPeriodKey = '2Q'; //第 2 节
        } else if (GameInfo.livePeriod == 2 && !GameInfo.delayLive && !GameInfo.isHt) {
          rbPeriodKey = '3Q'; //第 3 节
        } else if (GameInfo.livePeriod == 2 && !GameInfo.delayLive && !GameInfo.isHt) {
          rbPeriodKey = '4Q'; //第 4 节
        } else if (GameInfo.livePeriod == 99 && !GameInfo.delayLive && !GameInfo.isHt) {
          rbPeriodKey = 'QT'; //延长赛
        } else if (GameInfo.livePeriod == 0 && !GameInfo.delayLive && GameInfo.isHt) {
          rbPeriodKey = 'HT'; //中场休息
        }
      } else if (item.SportId == 5) { //网球
        if (ExtraData.gameSession == 5 && ExtraData.tennisInfo && ExtraData.tennisInfo.currentSet) {
          rbPeriodKey = ExtraData.tennisInfo.currentSet + 'S'; //第 N 盘
        }
      } else if (item.SportId == 9) { //羽毛球
        if (ExtraData.gameSession == 3 && GameInfo.livePeriod) {
          rbPeriodKey = GameInfo.livePeriod + 'G'; //第 N 局
        }
      } else if (item.SportId == 43) { //电子竞技
        if (ExtraData.eSportInfo && ExtraData.eSportInfo.bestOfMap == 3) {
          rbPeriodKey = GameInfo.livePeriod + 'M' + (ExtraData.eSportInfo.isStartingSoon ? 'S' : 'G');
        }
      }

      if (rbPeriodKey === null && rbPeriod && rbPeriod.length > 0) { //前面沒對上 且有原始數據 嘗試切字串
        //有空白 表示為 1H 12 這種格式
        const blankIndex = rbPeriod.indexOf(' ');
        if (blankIndex !== -1) { //有空白，切到空白處
          if (blankIndex >= 0) {
            rbPeriodKey = rbPeriod.substr(0,blankIndex);
          }
        } else {
          rbPeriodKey = rbPeriod;
        }
      }

      if (rbPeriodKey && rbPeriodKey.length > 0) {
        const rbname = SABARBPeriodNames[rbPeriodKey];  //中文名
        if (rbname) {
          rbPeroidName = rbname;  //有對到才用中文名，沒對到 就直接用原本的字
        }
      }

      //處理分鐘數
      if (GameInfo.seconds) {
        rbMinute = new Decimal(GameInfo.seconds).dividedToIntegerBy(60).toString();
      }

    }

    let extraInfo = {};
    //保存直播源查詢參數
    extraInfo = Object.assign(extraInfo,ExtraData.channelCode != '' ? {streamingOption: ExtraData.streamingOption, channelCode: ExtraData.channelCode} : {});
    //保存gameSession
    extraInfo = Object.assign(extraInfo, {gameSession: ExtraData.gameSession})
    //保存bestOfMap
    extraInfo = Object.assign(extraInfo, ExtraData.esportInfo ? {bestOfMap: ExtraData.eSportInfo.bestOfMap} : {})

    //參考
    //https://github.com/Saba-sports/OddsDirectAPI/wiki/BetType-Selection-Information
    //找出有指定隊伍的玩法(betType)
    const teamBetTypes = [
      1,5,7,15,17,20,21,22,25,27,28,
      122,124,125,153,154,155,160,164,167,168,170,176,177,180,185,191,
      206,207,208,209,383,385,396,
      411,422,423,425,430,432,448,453,458,459,460,477,478,486,487,488,489,490,491,492,
      501,603,604,605,606,607,609,612,613,617,630,635,636,637,
      701,704,707,708,712,713,1301,1303,1305,1308,1311,1316,1324,
      9001,9002,9004,9006,9007,9008,9010,9011,9012,9014,9015,9016,9017,9018,9020,9021,9022,9023,9024,9026,9027,9028,9030,
      9031,9032,9033,9034,9036,9037,9038,9039,9040,9042,9043,9044,9045,9046,9048,9049,9050,9051,9052,9054,9055,9056,9057,9059,
      9062,9063,9064,9065,9066,9067,9068,9069,9072,9076,9077,
      9400,9401,
    ];
    // console.log('thisLines ',thisLines)
    return new EventData(
      item.EventId,
      thisEventDate,
    item.IsRB ? 1 : 2, //開盤狀態 1開2關
      0, //分組? saba沒有
      0, //分組類型? saba沒有
      homeTeamId,
      homeTeamName,
      homeTeamScore,
      item.HomeRedCard ? item.HomeRedCard : null,
      null, //SABA沒角球
      ExtraData.teamInfo ? ExtraData.teamInfo.homeIconUrl : null,
      awayTeamId,
      awayTeamName,
      awayTeamScore,
      item.AwayRedCard ? item.AwayRedCard : null,
      null, //SABA沒角球
      ExtraData.teamInfo ? ExtraData.teamInfo.awayIconUrl : null,
      false,
      itemIndex ? itemIndex : 0, //TODO: SABA 問排序
      rbPeriod, //原始滾球數據
      rbMinute, //分鐘
      rbPeroidName, //滾球時間段(中文)
      null,
      GameInfo && !GameInfo.isNeutral ? 0 : 1, //主場狀態 0在中立場比賽 1在主場比賽
      item.IsOpenParlay, //是否支持串關
      false, //是否有分析數據(BR) saba沒有
      false, //是否有分析數據(BR) saba沒有
      null, //可視化(BR)比賽Id saba沒有
      item.IsRB, //是否比賽進行(滾球)中
      ExtraData.channelCode != '', //是否有直播數據
      null, //直播源列表 這個先傳null，saba要另外call api查
      null, //賽日指標，用於虛擬體育 saba沒有
      null,   //賽事指標，用於虛擬體育 saba沒有
      extraInfo,
      parseInt(item.SportId),
      marketId,
      parseInt(item.LeagueId),
      item.LeagueName,
      item.TotalLineCount,
      isFavourite,
      false,
      null,
      ExtraData.marketCategories.map(cateId => {
        //計算組內數量
        
        //注意這個marketGroup.id不是固定，要獲取中文名，只能用英文名去對照中文
        let thisMarketGroupTypeName = SABALineGroupNames[cateId];
        if (!thisMarketGroupTypeName) { //對應不到就先放id
          thisMarketGroupTypeName = cateId ;
        }

        return new LineGroupData(
          cateId,
          thisMarketGroupTypeName,
          thisLines.length,
          0,
        )
      }),
      thisLines.map(lineItem => {
        const BetTypeId = parseInt(lineItem.BetTypeId)
        //處理特殊玩法 名稱統一(讓分 大小)
        let thisBetTypeName = lineItem.BetTypeName;
        let periodData = {PeriodId: 0, PeriodName : ''}
        const specialBetTypeName = SABABetTypeNames[BetTypeId];
        if (specialBetTypeName) {
          thisBetTypeName = specialBetTypeName;
          periodData = SABAPeriodMapping[BetTypeId];
        }
        return new LineData(
          [lineItem.category], //玩法分組 數組格式
          BetTypeId,
          thisBetTypeName,
          lineItem.IsLocked, //盘口是否封盘
          lineItem.LineId,
          lineItem.LineLevel, //盘口级别 類似IM的linelevel
          item.IsRB ? 1 : 2, //盘口狀態 1開 2關
          periodData.PeriodId, //比赛时段 ID  1全場 2上半 3下半
          periodData.PeriodName, //比赛时段名
          item.EventId,
          0, //分組類型? SABA沒有?
          homeTeamName,
          awayTeamName,
          lineItem.Selections.map(selectionItem => {

            //特別處理讓分大小的selectionName
            if (specialBetTypeName) {
              if ([1,7,17].indexOf(BetTypeId) !== -1) {
                if (selectionItem.SelectionType == 'h') {
                  selectionItem.SelectionName = i18n.HOME
                }
                if (selectionItem.SelectionType == 'a') {
                  selectionItem.SelectionName = i18n.AWAY
                }
              }
              if ([2,8,18].indexOf(BetTypeId) !== -1) {
                if (selectionItem.SelectionType == 'h') {
                  selectionItem.SelectionName = i18n.BIG
                }
                if (selectionItem.SelectionType == 'a') {
                  selectionItem.SelectionName = i18n.SMALL
                }
              }
            }

            const oddsDeciaml = Decimal.clone({ rounding: 3 }) //無條件捨去

            const isTeamBet = (teamBetTypes.indexOf(BetTypeId) !== -1)

            //判斷投注目標球隊，SABA利用selectionName判斷
            let targetTeamId = null;
            let targetTeamName = '';
            if ((homeTeamName && selectionItem.SelectionName.indexOf(homeTeamName) !== -1) //玩法名包含隊名
              || selectionItem.SelectionName === i18n.HOME //或者玩法名就是一個「主」字
              || (isTeamBet && (selectionItem.SelectionType == 'h' || selectionItem.SelectionType == '1')) //或者 玩法是隊伍bet 且玩法Key = h 或 1
            ) {
              targetTeamId = homeTeamId;
              targetTeamName = homeTeamName;
            } else if ((awayTeamName && selectionItem.SelectionName.indexOf(awayTeamName) !== -1) //玩法名包含隊名
              || selectionItem.SelectionName === i18n.AWAY //或者玩法名就是一個「客」字
              || (isTeamBet && (selectionItem.SelectionType == 'a' || selectionItem.SelectionType == '2')) //或者 玩法是隊伍bet 且玩法Key = a 或 2
            ) {
              targetTeamId = awayTeamId;
              targetTeamName = awayTeamName;
            }

            //從OddsList獲取賠率
            let thisOddsType = null;
            let thisOddsValue = null;
            if (selectionItem.OddsList && selectionItem.OddsList.length > 0) {
              const oddsType = SABAOddsTypeToNumber[memberOddsType];
              // console.log('oddsType ', oddsType)
              let targetOddsInfo = selectionItem.OddsList[0]; //默認選第一個賠率
              const matchOddsInfos = selectionItem.OddsList.filter(oInfo => parseInt(oInfo.OddsType) === oddsType);
              if (matchOddsInfos && matchOddsInfos.length > 0) { //如果有找到跟會員設置的盤口一樣的，就使用這個
                targetOddsInfo = matchOddsInfos[0];
              }
              thisOddsType = targetOddsInfo.OddsType;
              thisOddsValue = targetOddsInfo.OddsValues; //根據水位選擇賠率
            }
            //如果沒獲取到就用默認值
            thisOddsValue = thisOddsValue ?? selectionItem.Odds;
            thisOddsType = thisOddsType ?? selectionItem.OddsType;
            const thisDisplayOdds = new oddsDeciaml(thisOddsValue).toFixed(2);

            //檢查是否可以使用
            let thisSelectionIsLocked = false;
            if (thisOddsValue === '0') {
              thisSelectionIsLocked = true; //標記投注選項已鎖定 無法使用
            }
            // console.log('abc ')
            
            return new SelectionData(
              item.EventId + '_' + lineItem.LineId + '_' + selectionItem.SelectionType, //key太簡單，加上eventId和marketid作為唯一值 這個id不用於投注
              selectionItem.SelectionType,  //實際只拿這個SelectionType去投注
              selectionItem.SelectionName,
              0,
              selectionItem.Handicap,
              selectionItem.Handicap,
              null,
              parseInt(item.SportId),
              marketId,
              marketName,
              parseInt(item.LeagueId),
              item.LeagueName,
              homeTeamId,
              homeTeamName,
              homeTeamScore,
              awayTeamId,
              awayTeamName,
              awayTeamScore,
              item.EventId,
              item.IsOpenParlay, //是否支持串關
              parseInt(lineItem.LineId),
              BetTypeId,
              thisBetTypeName,
              periodData.PeriodId, //比赛时段 ID  1全場 2上半 3下半 BTI沒有 只有特殊玩法(讓分,大小)有提供，其他帶0
              periodData.PeriodName,
              targetTeamId,
              targetTeamName,
              false,
              null,
              thisOddsValue,
              SABAOddsTypeToNumber[thisOddsType],
              selectionItem.OddsList ? selectionItem.OddsList.map(oddsItem => {
                return new OddsData(
                  oddsItem.OddsType,
                  oddsItem.OddsValues,
                )
              }) : [],
              thisDisplayOdds,
              thisSelectionIsLocked,
              1, //投注用 給默認值 LineStatusId = 1,
              SelectionStatusType.NOTSET, //投注用 給默認值 SelectionStatus = SelectionStatusType.NOTSET,
              { combo: ExtraData.combo } //赛事串关数量限制   0: 该盘口不支持串关 2: 下注时最少需要选2种组合  3: 下注时最少需要选3种组合
            )
          })
        )
      })
    )
  }

  static createFromNewSABAOutRightSource(item, FavoriteEvents) {
    item.EventId = parseInt(item.EventId); //IM固定轉為int
    item.SportId = parseInt(item.SportId)
    
    let memberOddsType = SABAOddsTypeToNumber[SABAOddsType.EU];
    const isFavourite = FavoriteEvents.filter(favItem=>item.EventId === favItem.EventId).length > 0;

    //市場名
    const MarketName = VendorMarketNames[VendorMarkets.OUTRIGHT];

    const oddsDeciaml = Decimal.clone({ rounding: 3 }) //無條件捨去
    const thisEventId = item.EventId; //沙巴猜冠軍用 leagueId 作為唯一key

    return new EventData(
      thisEventId,
      item.EventDate,
      !item.IsLocked ? 1 : 2, //開盤狀態 1開2關
      null, //比賽分組 優勝冠軍沒有
      null, //比賽分組類型 優勝冠軍沒有
      null,  //主隊數據 優勝冠軍沒有
      null,
      null,
      null,
      null,
      null,
      null, //客隊數據 優勝冠軍沒有
      null,
      null,
      null,
      null,
      null,
      false,
      0, //TODO: saba 問排序?
      null, //滾球時間,平台原始的滾球數據 優勝冠軍沒有
      '',
      '',
      null, //相關比分清單  優勝冠軍沒有
      null, //主場狀態  優勝冠軍沒有
      false, //只能單注，不能串
      false,  //是否有分析數據(BR) 優勝冠軍沒有
      false, //是否有可視化 優勝冠軍沒有
      null, //BREventId 可視化(BR)比賽Id 優勝冠軍沒有
      false, //是否滾球中  優勝冠軍沒有
      false, //是否有直播數據 優勝冠軍沒有
      null, //直播源列表
      null, //賽日指標，用於虛擬體育
      null, //賽事指標，用於虛擬體育
      {leagueGroup: item.ExtraData.leagueGroup}, //額外信息
      item.SportId,
      VendorMarkets.OUTRIGHT,
      item.LeagueId,
      item.LeagueName,
      1, //玩法總數 都只有一種  就是 優勝冠軍
      isFavourite,
      true, //是 優勝冠軍賽事
      item.LeagueName,
      [], //玩法分組列表 優勝冠軍沒有
      item.Lines.length > 0 && item.Lines.map(lineItem => {
        return new LineData(
          [], //玩法分組 優勝冠軍沒有
          'OUTRIGHT',
          '', //留空白即可
          lineItem.IsLocked,
          thisEventId,
          0,
          !lineItem.IsLocked? 1 : 2, //盘口狀態 1開 2關
          1,
          VendorPeriodName["1"],
          thisEventId,
          null,
          null,
          null,
          lineItem.Selections.map(selectionItem => {

            //從OddsList獲取賠率
            let thisOddsType = null;
            let thisOddsValue = null;
            if (selectionItem.OddsList && selectionItem.OddsList.length > 0) {
              let targetOddsInfo = selectionItem.OddsList[0]; //默認選第一個賠率
              const matchOddsInfos = selectionItem.OddsList.filter(oInfo => parseInt(oInfo.OddsType) === memberOddsType);
              if (matchOddsInfos && matchOddsInfos.length > 0) { //如果有找到跟會員設置的盤口一樣的，就使用這個
                targetOddsInfo = matchOddsInfos[0];
              }
              thisOddsType = targetOddsInfo.OddsType;
              thisOddsValue = targetOddsInfo.OddsValues; //根據水位選擇賠率
            }

            //如果沒獲取到就用默認值
            thisOddsValue = thisOddsValue ?? selectionItem.Odds;
            const thisDisplayOdds = new oddsDeciaml(thisOddsValue).toFixed(2);
            //檢查是否可以使用
            let thisSelectionIsLocked = false;
            if (selectionItem.WagerSelectionId == 0 || thisDisplayOdds === '0.00') {
              thisSelectionIsLocked = true; //標記投注選項已鎖定 無法使用
            }

            return new SelectionData(
              parseInt(selectionItem.SelectionId),
              parseInt(selectionItem.SelectionType),
              selectionItem.SelectionName,
              0, //沒有selection group
              '',
              '',
              null,
              item.SportId,
              VendorMarkets.OUTRIGHT,
              MarketName,
              parseInt(item.LeagueId),
              item.LeagueName,
              null,
              null,
              null,
              null,
              null,
              null,
              thisEventId,
              false,
              thisEventId,
              'OUTRIGHT',
              '', //留空白即可
              1,
              VendorPeriodName["1"],
              selectionItem.SelectionType, //優勝冠軍的目標隊就是selectionItem
              selectionItem.LeagueName,
              true,
              item.LeagueName,
              thisOddsValue,
              SABAOddsTypeToNumber[SABAOddsType.EU],
              [
                new OddsData(
                  SABAOddsTypeToNumber[SABAOddsType.EU],
                  thisDisplayOdds,
                )
              ],
              thisDisplayOdds,
            )
          })
        )
      })
    )
  }
  
  //從BTI數據生成EventData數據
  static createFromBTISource(item, lines, marketId = null, FavoriteEvents, memberOddsType) {
    item.id = item.id + ''; //BTI固定轉為string

    //判斷市場
    if (marketId === null || marketId === VendorMarkets.FAVOURITE) {  //關注(收藏) 實際不算一種Market 只是下拉選項 另外有一個MarketIdForListing字段 負責處理UI問題
      if (item.type === 'Outright') {
        //優勝冠軍
        marketId = VendorMarkets.OUTRIGHT;
      } else if(item.isLive == true) {
        //滾球
        marketId = VendorMarkets.RUNNING;
      } else {
        //今日早盤 由日期判斷
        const oneDayAfter = moment().add(1,'day').utcOffset(VendorConfigs.TIMEZONE);
        const eventDate = moment(item.startEventDate).utcOffset(VendorConfigs.TIMEZONE);
        if (eventDate > oneDayAfter) {
          marketId = VendorMarkets.EARLY;
        } else {
          marketId = VendorMarkets.TODAY;
        }
      }
    }

    const marketName = VendorMarketNames[marketId];

    const isFavourite = FavoriteEvents.filter(favItem=>item.id === favItem.EventId).length > 0;

    const homeTeams = item.participants.filter(item => item.venueRole === 'Home');
    let homeTeam = {
      id: 0,
      name: 'not set',
      score: (item.score ? item.score.homeScore : null),
      redCard : ((item.score && item.score.additionalScores) ? item.score.additionalScores.redCardsTeam1 : null),
      corner : ((item.score && item.score.additionalScores) ? item.score.additionalScores.cornersTeam1 : null),
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
      score: (item.score ? item.score.awayScore : null),
      redCard : ((item.score && item.score.additionalScores) ? item.score.additionalScores.redCardsTeam2 : null),
      corner : ((item.score && item.score.additionalScores) ? item.score.additionalScores.cornersTeam2 : null),
    };
    if (awayTeams && awayTeams.length > 0) {
      const awayTeamData = awayTeams[0];
      awayTeam.id = awayTeamData.id;
      awayTeam.name = awayTeamData.name;
    }

    const thisLines = lines.filter(line => {
      return line.eventId == item.id;
    });

    let oddsTypePropList = [];
    for (let oddsPropName in BTIOddsTypeToNumber) {
      oddsTypePropList.push({name: oddsPropName, number: BTIOddsTypeToNumber[oddsPropName]});
    }

    //排序玩法分組
    let compareLineGroupFunc = (left,right) => {
      const a = left.SortNumber;
      const b = right.SortNumber;
      if (a < b ) {// 按某种排序标准进行比较, a 小于 b
        return -1;
      }
      if (a > b ) {
        return 1;
      }
      // a must be equal to b
      return 0;
    }

    //處理滾球時間
    let rbMinute = '';
    let rbPeriod = '';
    if (item.isLive && item.liveGameState) {
      rbPeriod = item.liveGameState.gamePart;
      if (rbPeriod && rbPeriod.length > 0) {
        const rbname = BTIRBPeriodNames[rbPeriod];  //中文名
        if (rbname) {
          rbPeriod = rbname;  //有對到才用中文名，沒對到 就直接用原本的字
        }
      }
      if (item.liveGameState.gameTime) {
        rbMinute = new Decimal(item.liveGameState.gameTime).dividedToIntegerBy(60).toString();
      }
      if(rbPeriod === undefined || rbPeriod === null) {
        rbPeriod = '';//空字符串 避免報錯
      }
    }

    //處理優勝冠軍
    let isOutRightEvent = false;
    let outRightEventName = '';
    if (item.type === 'Outright') {
      isOutRightEvent = true;
      outRightEventName = item.eventName;
    }

    //判斷強制歐洲盤的玩法
    const forceDecimalBetTypeIds = BTIForceDecimalBetTypeIds[parseInt(item.sportId)];

    //處理排序
    let thisSortOrder = item.leagueOrder;
    if (thisSortOrder === 0 || !thisSortOrder) {
      thisSortOrder = 9999999; //排到最後面
    }

    return new EventData(
      item.id,
      item.startEventDate,
      1, //開盤狀態？ BTI沒有
      0, //分組? BTI沒有
      0, //分組類型? BTI沒有
      homeTeam.id,
      homeTeam.name,
      homeTeam.score,
      homeTeam.redCard,
      homeTeam.corner,
      null,//SABA專用
      awayTeam.id,
      awayTeam.name,
      awayTeam.score,
      awayTeam.redCard,
      awayTeam.corner,
      null,//SABA專用
      true,
      thisSortOrder,
      item.liveGameState, //原始滾球數據
      rbMinute,
      rbPeriod,
      item.score ? item.score.additionalScores: null,
      1, //主場狀態 BTI沒有
      true, //是否支持串關 BTI沒有
      false, //是否有分析數據(BR) BTI沒有
      false, //是否有可視化 BTI沒有
      null, //可視化(BR)比賽Id BTI沒有
      item.isLive,
      false, //是否有直播數據 //TODO:待確認
      null, //直播源列表 //TODO:待確認
      null, //賽日指標，用於虛擬體育 BTI沒有? //TODO:待確認
      null,   //賽事指標，用於虛擬體育 BTI沒有? //TODO:待確認
      { tags: item.tags, metadata: item.metadata },
      parseInt(item.sportId),
      marketId,
      item.leagueId,
      item.leagueName,
      item.totalActiveMarketsCount,
      isFavourite,
      isOutRightEvent,
      outRightEventName,
      item.marketGroups.map(mgitem => {
        //計算組內數量
        const linesInGroup = thisLines.filter(l => {
          return l.groups.indexOf(mgitem.id) !== -1;
        })

        //注意這個marketGroup.id不是固定，要獲取中文名，只能用英文名去對照中文
        let thisMarketGroupTypeName = BTIMarketGroupTypeNames[mgitem.name];
        if (!thisMarketGroupTypeName) { //對應不到就先放英文名
          thisMarketGroupTypeName = mgitem.name;
        }

        return new LineGroupData(
          mgitem.id,
          thisMarketGroupTypeName,
          linesInGroup.length,
          mgitem.order,
        )
      }).sort(compareLineGroupFunc),
      thisLines.map(lineItem => {

        //處理特殊玩法 名稱統一(讓分 大小)
        let thisBetTypeName = lineItem.name; //直接用name比用marketType.name完整
        let periodData = {PeriodId: 0, PeriodName : ''}
        const specialBetTypeName = BTIBetTypeNames[lineItem.marketType.id];
        if (specialBetTypeName) {
          thisBetTypeName = specialBetTypeName;
          periodData = BTIPeriodMapping[lineItem.marketType.id];
        }

        return new LineData(
          lineItem.groups ? lineItem.groups : [], //玩法分組
          lineItem.marketType.id,
          thisBetTypeName,
          lineItem.isSuspended, //盘口是否封盘
          lineItem.id,
          1, //盘口级别 BTI沒有
          1, //盘口狀態 1開 2關 BTI沒有
          periodData.PeriodId, //比赛时段 ID  1全場 2上半 3下半 BTI沒有
          periodData.PeriodName, //比赛时段名  BTI沒有
          item.id,
          0, //分組類型? BTI沒有
          homeTeam.name,
          awayTeam.name,
          lineItem.selections.map(selectionItem => {

            //特別處理讓分大小的selectionName
            if (specialBetTypeName) {
              if (selectionItem.outcomeType == 'Home') {
                selectionItem.name = i18n.HOME
              }
              if (selectionItem.outcomeType == 'Away') {
                selectionItem.name = i18n.AWAY
              }
              if (selectionItem.outcomeType == 'Over') {
                selectionItem.name = i18n.BIG
              }
              if (selectionItem.outcomeType == 'Under') {
                selectionItem.name = i18n.SMALL
              }
            }

            //判斷投注目標球隊，BTI利用participantMapping判斷
            let targetTeamId = null;
            let targetTeamName = '';
            if (selectionItem.participantMapping) {
              const filtedTeams = item.participants.filter(item => item.id === selectionItem.participantMapping);
              if (filtedTeams.length > 0) {
                targetTeamId = filtedTeams[0].id;
                targetTeamName = filtedTeams[0].name;
              }
            }

            //如果用participantMapping沒有對到，改用selectionName判斷
            if (targetTeamId === null) {
              if ((homeTeam.name && selectionItem.name.indexOf(homeTeam.name) !== -1) //玩法名包含隊名
                || selectionItem.name === i18n.HOME) //或者玩法名就是一個「主」字
              {
                targetTeamId = homeTeam.id;
                targetTeamName = homeTeam.name;
              } else if ((awayTeam.name && selectionItem.name.indexOf(awayTeam.name) !== -1) //玩法名包含隊名
                || selectionItem.name === i18n.AWAY)//或者玩法名就是一個「客」字
              {
                targetTeamId = awayTeam.id;
                targetTeamName = awayTeam.name;
              }
            }

            let thisOddsType = memberOddsType;
            if(forceDecimalBetTypeIds && forceDecimalBetTypeIds.indexOf(lineItem.marketType.id) !== -1) {
              //console.log('===force decimal',lineItem.marketType.id,JSON.parse(JSON.stringify(selectionItem)))
              thisOddsType = 'decimal';
            }

            //處理特殊投注
            let thisSelectionName = selectionItem.name;
            if ((selectionItem.name !== selectionItem.betslipLine) && (selectionItem.points === undefined || selectionItem.points === null)) {
              thisSelectionName = selectionItem.betslipLine;
            }

            return new SelectionData(
              selectionItem.id,
              selectionItem.outcomeType,
              thisSelectionName,
              selectionItem.group,
              selectionItem.points,
              selectionItem.points,
              selectionItem.tags,
              item.sportId,
              marketId,
              marketName,
              item.leagueId,
              item.leagueName,
              homeTeam.id,
              homeTeam.name,
              homeTeam.score,
              awayTeam.id,
              awayTeam.name,
              awayTeam.score,
              item.id,
              true, //是否支持串關 BTI沒有
              lineItem.id,
              lineItem.marketType.id,
              thisBetTypeName,
              periodData.PeriodId, //比赛时段 ID  1全場 2上半 3下半 BTI沒有 只有特殊玩法(讓分,大小)有提供，其他帶0
              periodData.PeriodName,
              targetTeamId,
              targetTeamName,
              isOutRightEvent,
              outRightEventName,
              selectionItem.displayOdds[thisOddsType],
              BTIOddsTypeToNumber[thisOddsType],
              oddsTypePropList.map(oddsTypeData => {
                return new OddsData(
                  oddsTypeData.number,
                  selectionItem.displayOdds[oddsTypeData.name],
                )
              }),
              selectionItem.displayOdds[thisOddsType],
              selectionItem.isDisabled === true
            )
          })
        )
      })
    )
  }

  static createFromBTIChange(item, oldData, FavoriteEvents) {
    item.id = item.id + ''; //BTI固定轉為string

    const isFavourite = FavoriteEvents.filter(favItem=>item.id === favItem.EventId).length > 0;

    let homeScore = oldData.HomeScore;
    let homeRedCard = oldData.HomeRedCard;
    let homeCorner = oldData.HomeCorner;
    let awayScore = oldData.AwayScore;
    let awayRedCard = oldData.AwayRedCard;
    let awayCorner = oldData.AwayCorner;
    if (item.score) {
      if (item.score.homeScore) {
        homeScore = item.score.homeScore;
      }
      if(item.score.additionalScores && item.score.additionalScores.redCardsTeam1) {
        homeRedCard = item.score.additionalScores.redCardsTeam1;
      }
      if(item.score.additionalScores && item.score.additionalScores.cornersTeam1) {
        homeCorner = item.score.additionalScores.cornersTeam1;
      }

      if (item.score.awayScore) {
        awayScore = item.score.awayScore;
      }
      if(item.score.additionalScores && item.score.additionalScores.redCardsTeam2) {
        awayRedCard = item.score.additionalScores.redCardsTeam2;
      }
      if(item.score.additionalScores && item.score.additionalScores.cornersTeam2) {
        awayCorner = item.score.additionalScores.cornersTeam2;
      }
    }

    //處理滾球時間
    let rbMinute = oldData.RBMinute;
    let rbPeriod = oldData.RBPeriodName;
    if(!item.liveGameState) {
      item.liveGameState = oldData.RBTime;
    }
    if (item.isLive && item.liveGameState) {
      rbPeriod = item.liveGameState.gamePart;
      if (rbPeriod && rbPeriod.length > 0) {
        const rbname = BTIRBPeriodNames[rbPeriod];  //中文名
        if (rbname) {
          rbPeriod = rbname;  //有對到才用中文名，沒對到 就直接用原本的字
        }
      }
      if (item.liveGameState.gameTime) {
        rbMinute = new Decimal(item.liveGameState.gameTime).dividedToIntegerBy(60).toString();
      }
      if(rbPeriod === undefined || rbPeriod === null) {
        rbPeriod = '';//空字符串 避免報錯
      }
    }

    //注意這個BTI的change只有更新Event本身，下屬的數組(投注線Lines,投注分組LineGroups等) 是另外處理，這裡只要拿舊數據複製就可以
    return new EventData(
      oldData.EventId,
      item.startEventDate ?? oldData.EventDate,
      1, //開盤狀態？ BTI沒有
      0, //分組? BTI沒有
      0, //分組類型? BTI沒有
      oldData.HomeTeamId,
      oldData.HomeTeamName,
      homeScore,
      homeRedCard,
      homeCorner,
      null,//SABA專用
      oldData.AwayTeamId,
      oldData.AwayTeamName,
      awayScore,
      awayRedCard,
      awayCorner,
      null,//SABA專用
      true,
      oldData.SortOrder,
      item.liveGameState, //滾球時間
      rbMinute,
      rbPeriod,
      item.score ? item.score.additionalScores : oldData.RelatedScores,
      1, //主場狀態 BTI沒有
      true, //是否支持串關 BTI沒有
      false, //是否有分析數據(BR) BTI沒有
      false, //是否有可視化 BTI沒有
      null, //可視化(BR)比賽Id BTI沒有
      item.isLive,
      false, //是否有直播數據 //TODO:待確認
      null, //直播源列表 //TODO:待確認
      null, //賽日指標，用於虛擬體育 BTI沒有? //TODO:待確認
      null,   //賽事指標，用於虛擬體育 BTI沒有? //TODO:待確認
      { tags: item.tags ?? oldData.ExtraInfo.tags,  metadata: item.metadata ?? oldData.ExtraInfo.metadata },
      oldData.SportId,
      oldData.MarketId,
      oldData.LeagueId,
      oldData.LeagueName,
      item.totalActiveMarketsCount ?? oldData.TotalLineCount,
      isFavourite,
      oldData.IsOutRightEvent,
      oldData.OutRightEventName,
      oldData.LineGroups.map(lgItem => {
        return new LineGroupData(
          lgItem.LineGroupId,
          lgItem.LineGroupName,
          lgItem.LineCount,
          lgItem.SortNumber,
        )
      }),
      oldData.Lines.map(lineItem => {
        return LineData.clone(lineItem)
      })
    )
  }

  static getSABAEventDateUTC(globalShowTime) {
    let thisEventDate = globalShowTime;
    if (thisEventDate && thisEventDate.indexOf('T') !== -1 && thisEventDate.indexOf('Z') === -1 ) {
      thisEventDate = thisEventDate + 'Z'; //尾端加Z = UTC+0
    }
    return thisEventDate;
  }

  //從沙巴數據生成EventData數據
  static createFromSABASource(item, lines, marketId = null, FavoriteEvents, memberOddsType, itemIndex= null) {
    item.EventId = parseInt(item.EventId);  //saba固定轉為int

    const thisEventDate = EventData.getSABAEventDateUTC(item.globalShowTime);

    //判斷市場
    if (marketId === null || marketId === VendorMarkets.FAVOURITE) {  //關注(收藏) 實際不算一種Market 只是下拉選項 另外有一個MarketIdForListing字段 負責處理UI問題
      if(item.isLive == true) {
        //滾球
        marketId = VendorMarkets.RUNNING;
      } else {
        //今日早盤 由日期判斷
        const oneDayAfter = moment().add(1,'day').utcOffset(VendorConfigs.TIMEZONE);
        const eventDate = moment(item.startEventDate).utcOffset(VendorConfigs.TIMEZONE);
        if (eventDate > oneDayAfter) {
          marketId = VendorMarkets.EARLY;
        } else {
          marketId = VendorMarkets.TODAY;
        }
      }
    }

    const marketName = VendorMarketNames[marketId];

    const isFavourite = FavoriteEvents.filter(favItem=>item.eventId === favItem.EventId).length > 0;

    const thisLines = lines.filter(line => {
      return line.eventId == item.eventId;
    });

    let oddsTypePropList = [];
    for (let oddsPropName in SABAOddsTypeToNumber) {
      oddsTypePropList.push({name: oddsPropName, number: SABAOddsTypeToNumber[oddsPropName]});
    }

    //判斷隊名
    let homeTeamId = 0;
    let awayTeamId = 0;
    let homeTeamName = 'not set';
    let awayTeamName = 'not set';
    const homeTeamScore = item.gameInfo ? item.gameInfo.liveHomeScore : null;
    const awayTeamScore = item.gameInfo ? item.gameInfo.liveAwayScore : null;
    if (item.teamInfo) {
      homeTeamId = item.teamInfo.homeId;
      awayTeamId = item.teamInfo.awayId
      homeTeamName = item.teamInfo.homeName;
      awayTeamName = item.teamInfo.awayName;
    }


    //處理滾球時間
    let rbMinute = '';
    let rbPeriod = ''; //原始數據
    let rbPeroidName = ''; //中文
    if (item.isLive && item.gameInfo) {
      rbPeriod = item.gameInfo.inPlayTime;
      if(rbPeriod === undefined || rbPeriod === null) {
        rbPeriod = '';//空字符串 避免報錯
      }

      //按照saba提供的表去處理比賽時段名
      let rbPeriodKey = null;
      if (item.sportType == 1) { //足球
        if (item.gameInfo.livePeriod == 0 && item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = 'Delayed'; //延遲開賽
        } else if (item.gameInfo.livePeriod == 1 && !item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = '1H'; //上半场
        } else if (item.gameInfo.livePeriod == 2 && !item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = '2H'; //下半场
        } else if (item.gameInfo.livePeriod == 0 && !item.gameInfo.delayLive && item.gameInfo.isHt) {
          rbPeriodKey = 'HT'; //中场休息
        }
      } else if (item.sportType == 2) { //篮球
        if (item.gameInfo.livePeriod == 0 && item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = 'Delayed'; //延遲開賽
        } else if (item.gameInfo.livePeriod == 1 && !item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = '1Q'; //第 1 节
        } else if (item.gameInfo.livePeriod == 2 && !item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = '2Q'; //第 2 节
        } else if (item.gameInfo.livePeriod == 2 && !item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = '3Q'; //第 3 节
        } else if (item.gameInfo.livePeriod == 2 && !item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = '4Q'; //第 4 节
        } else if (item.gameInfo.livePeriod == 99 && !item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = 'QT'; //延长赛
        } else if (item.gameInfo.livePeriod == 0 && !item.gameInfo.delayLive && item.gameInfo.isHt) {
          rbPeriodKey = 'HT'; //中场休息
        }
      } else if (item.sportType == 5) { //网球
        if (item.gameSession == 5 && item.tennisInfo && item.tennisInfo.currentSet) {
          rbPeriodKey = item.tennisInfo.currentSet + 'S'; //第 N 盘
        }
      } else if (item.sportType == 9) { //羽毛球
        if (item.gameSession == 3 && item.gameInfo.livePeriod) {
          rbPeriodKey = item.gameInfo.livePeriod + 'G'; //第 N 局
        }
      } else if (item.sportType == 43) { //电子竞技
        if (item.eSportInfo && item.eSportInfo.bestOfMap == 3) {
          rbPeriodKey = item.gameInfo.livePeriod + 'M' + (item.eSportInfo.isStartingSoon ? 'S' : 'G');
        }
      }

      if (rbPeriodKey === null && rbPeriod && rbPeriod.length > 0) { //前面沒對上 且有原始數據 嘗試切字串
        //有空白 表示為 1H 12 這種格式
        const blankIndex = rbPeriod.indexOf(' ');
        if (blankIndex !== -1) { //有空白，切到空白處
          if (blankIndex >= 0) {
            rbPeriodKey = rbPeriod.substr(0,blankIndex);
          }
        } else {
          rbPeriodKey = rbPeriod;
        }
      }

      if (rbPeriodKey && rbPeriodKey.length > 0) {
        const rbname = SABARBPeriodNames[rbPeriodKey];  //中文名
        if (rbname) {
          rbPeroidName = rbname;  //有對到才用中文名，沒對到 就直接用原本的字
        }
      }

      //處理分鐘數
      if (item.gameInfo.seconds) {
        rbMinute = new Decimal(item.gameInfo.seconds).dividedToIntegerBy(60).toString();
      }

    }

    let extraInfo = {};
    //保存直播源查詢參數
    extraInfo = Object.assign(extraInfo,item.channelCode != '' ? {streamingOption: item.streamingOption, channelCode: item.channelCode} : {});
    //保存gameSession
    extraInfo = Object.assign(extraInfo, {gameSession: item.gameSession})
    //保存bestOfMap
    extraInfo = Object.assign(extraInfo, item.eSportInfo ? {bestOfMap: item.eSportInfo.bestOfMap} : {})

    //參考
    //https://github.com/Saba-sports/OddsDirectAPI/wiki/BetType-Selection-Information
    //找出有指定隊伍的玩法(betType)
    const teamBetTypes = [
      1,5,7,15,17,20,21,22,25,27,28,
      122,124,125,153,154,155,160,164,167,168,170,176,177,180,185,191,
      206,207,208,209,383,385,396,
      411,422,423,425,430,432,448,453,458,459,460,477,478,486,487,488,489,490,491,492,
      501,603,604,605,606,607,609,612,613,617,630,635,636,637,
      701,704,707,708,712,713,1301,1303,1305,1308,1311,1316,1324,
      9001,9002,9004,9006,9007,9008,9010,9011,9012,9014,9015,9016,9017,9018,9020,9021,9022,9023,9024,9026,9027,9028,9030,
      9031,9032,9033,9034,9036,9037,9038,9039,9040,9042,9043,9044,9045,9046,9048,9049,9050,9051,9052,9054,9055,9056,9057,9059,
      9062,9063,9064,9065,9066,9067,9068,9069,9072,9076,9077,
      9400,9401,
    ];

    return new EventData(
      item.eventId,
      thisEventDate,
      (['running','postponed'].indexOf(item.eventStatus) !== -1) ? 1 : 2, //開盤狀態 1開2關
      0, //分組? saba沒有
      0, //分組類型? saba沒有
      homeTeamId,
      homeTeamName,
      homeTeamScore,
      item.soccerInfo ? item.soccerInfo.homeRedCard : null,
      null, //SABA沒角球
      item.teamInfo ? item.teamInfo.homeIconUrl : null,
      awayTeamId,
      awayTeamName,
      awayTeamScore,
      item.soccerInfo ? item.soccerInfo.awayRedCard : null,
      null, //SABA沒角球
      item.teamInfo ? item.teamInfo.awayIconUrl : null,
      false,
      itemIndex ? itemIndex : 0, //TODO: SABA 問排序
      rbPeriod, //原始滾球數據
      rbMinute, //分鐘
      rbPeroidName, //滾球時間段(中文)
      null,
      item.gameInfo && item.gameInfo.isNeutral ? 0 : 1, //主場狀態 0在中立場比賽 1在主場比賽
      item.isParlay, //是否支持串關
      false, //是否有分析數據(BR) saba沒有
      false, //是否有分析數據(BR) saba沒有
      null, //可視化(BR)比賽Id saba沒有
      item.isLive, //是否比賽進行(滾球)中
      item.channelCode != '', //是否有直播數據
      null, //直播源列表 這個先傳null，saba要另外call api查
      null, //賽日指標，用於虛擬體育 saba沒有
      null,   //賽事指標，用於虛擬體育 saba沒有
      extraInfo,
      parseInt(item.sportType),
      marketId,
      item.leagueId,
      item.leagueName,
      item.marketCount,
      isFavourite,
      false,
      null,
      item.marketCategories.map(cateId => {
        //計算組內數量
        const linesInGroup = thisLines.filter(l => {
          return l.category == cateId;
        })

        //注意這個marketGroup.id不是固定，要獲取中文名，只能用英文名去對照中文
        let thisMarketGroupTypeName = SABALineGroupNames[cateId];
        if (!thisMarketGroupTypeName) { //對應不到就先放id
          thisMarketGroupTypeName = cateId ;
        }

        return new LineGroupData(
          cateId,
          thisMarketGroupTypeName,
          linesInGroup.length,
          0,
        )
      }),
      thisLines.map(lineItem => {

        //處理特殊玩法 名稱統一(讓分 大小)
        let thisBetTypeName = lineItem.betTypeName;
        let periodData = {PeriodId: 0, PeriodName : ''}
        const specialBetTypeName = SABABetTypeNames[lineItem.betType];
        if (specialBetTypeName) {
          thisBetTypeName = specialBetTypeName;
          periodData = SABAPeriodMapping[lineItem.betType];
        }

        return new LineData(
          [lineItem.category], //玩法分組 數組格式
          lineItem.betType,
          thisBetTypeName,
          lineItem.marketStatus !== 'running', //盘口是否封盘
          lineItem.marketId,
          lineItem.sort, //盘口级别 類似IM的linelevel
          lineItem.marketStatus === 'running' ? 1 : 2, //盘口狀態 1開 2關
          periodData.PeriodId, //比赛时段 ID  1全場 2上半 3下半
          periodData.PeriodName, //比赛时段名
          item.eventId,
          0, //分組類型? SABA沒有?
          homeTeamName,
          awayTeamName,
          lineItem.selections.map(selectionItem => {

            //特別處理讓分大小的selectionName
            if (specialBetTypeName) {
              if ([1,7,17].indexOf(lineItem.betType) !== -1) {
                if (selectionItem.key == 'h') {
                  selectionItem.keyName = i18n.HOME
                }
                if (selectionItem.key == 'a') {
                  selectionItem.keyName = i18n.AWAY
                }
              }
              if ([2,8,18].indexOf(lineItem.betType) !== -1) {
                if (selectionItem.key == 'h') {
                  selectionItem.keyName = i18n.BIG
                }
                if (selectionItem.key == 'a') {
                  selectionItem.keyName = i18n.SMALL
                }
              }
            }

            const oddsDeciaml = Decimal.clone({ rounding: 3 }) //無條件捨去

            const isTeamBet = (teamBetTypes.indexOf(lineItem.betType) !== -1)

            //判斷投注目標球隊，SABA利用selectionName判斷
            let targetTeamId = null;
            let targetTeamName = '';
            if ((homeTeamName && selectionItem.keyName.indexOf(homeTeamName) !== -1) //玩法名包含隊名
              || selectionItem.keyName === i18n.HOME //或者玩法名就是一個「主」字
              || (isTeamBet && (selectionItem.key == 'h' || selectionItem.key == '1')) //或者 玩法是隊伍bet 且玩法Key = h 或 1
            ) {
              targetTeamId = homeTeamId;
              targetTeamName = homeTeamName;
            } else if ((awayTeamName && selectionItem.keyName.indexOf(awayTeamName) !== -1) //玩法名包含隊名
              || selectionItem.keyName === i18n.AWAY //或者玩法名就是一個「客」字
              || (isTeamBet && (selectionItem.key == 'a' || selectionItem.key == '2')) //或者 玩法是隊伍bet 且玩法Key = a 或 2
            ) {
              targetTeamId = awayTeamId;
              targetTeamName = awayTeamName;
            }

            //從OddsList獲取賠率
            let thisOddsType = null;
            let thisOddsValue = null;
            if (selectionItem.oddsPrice && Object.keys(selectionItem.oddsPrice)) {
              let targetOddsValue = selectionItem.oddsPrice[memberOddsType];
              if (targetOddsValue !== undefined) {
                thisOddsType = memberOddsType;
                thisOddsValue = targetOddsValue;
              }
            }
            //如果沒獲取到就默認用歐洲盤
            thisOddsValue = thisOddsValue ?? selectionItem.oddsPrice[SABAOddsType.EU];
            thisOddsType = thisOddsType ?? SABAOddsType.EU;

            const thisSelectionIsLocked = (thisOddsValue == 0);

            return new SelectionData(
              item.eventId + '_' + lineItem.marketId + '_' + selectionItem.key, //key太簡單，加上eventId和marketid作為唯一值 這個id不用於投注
              selectionItem.key,  //實際只拿這個SelectionType去投注
              selectionItem.keyName,
              0,
              selectionItem.point,
              selectionItem.point,
              null,
              parseInt(item.sportType),
              marketId,
              marketName,
              item.leagueId,
              item.leagueName,
              homeTeamId,
              homeTeamName,
              homeTeamScore,
              awayTeamId,
              awayTeamName,
              awayTeamScore,
              item.eventId,
              item.isParlay, //是否支持串關
              lineItem.marketId,
              lineItem.betType,
              thisBetTypeName,
              periodData.PeriodId, //比赛时段 ID  1全場 2上半 3下半 BTI沒有 只有特殊玩法(讓分,大小)有提供，其他帶0
              periodData.PeriodName,
              targetTeamId,
              targetTeamName,
              false,
              null,
              thisOddsValue,
              SABAOddsTypeToNumber[thisOddsType],
              oddsTypePropList.map(oddsTypeData => {
                return new OddsData(
                  oddsTypeData.number,
                  selectionItem.oddsPrice[oddsTypeData.name],
                )
              }),
              thisOddsValue,
              thisSelectionIsLocked,
              1, //投注用 給默認值 LineStatusId = 1,
              SelectionStatusType.NOTSET, //投注用 給默認值 SelectionStatus = SelectionStatusType.NOTSET,
              { combo: lineItem.combo } //赛事串关数量限制   0: 该盘口不支持串关 2: 下注时最少需要选2种组合  3: 下注时最少需要选3种组合
            )
          })
        )
      })
    )
  }

  static createFromSABAChange(item, oldData, FavoriteEvents) {
    item.EventId = parseInt(item.EventId);  //saba固定轉為int

    const thisEventDate = EventData.getSABAEventDateUTC(item.globalShowTime);

    const isFavourite = FavoriteEvents.filter(favItem=>item.eventId === favItem.EventId).length > 0;

    const homeTeamScore = item.gameInfo ? item.gameInfo.liveHomeScore : null;
    const awayTeamScore = item.gameInfo ? item.gameInfo.liveAwayScore : null;

    //處理滾球時間
    let rbMinute = '';
    let rbPeriod = ''; //原始數據
    let rbPeroidName = ''; //中文
    if (item.gameInfo) {
      rbPeriod = item.gameInfo.inPlayTime;
      if(rbPeriod === undefined || rbPeriod === null) {
        rbPeriod = '';//空字符串 避免報錯
      }

      //按照saba提供的表去處理比賽時段名
      let rbPeriodKey = null;
      if (oldData.SportId == 1) { //足球
        if (item.gameInfo.livePeriod == 0 && item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = 'Delayed'; //延遲開賽
        } else if (item.gameInfo.livePeriod == 1 && !item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = '1H'; //上半场
        } else if (item.gameInfo.livePeriod == 2 && !item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = '2H'; //下半场
        } else if (item.gameInfo.livePeriod == 0 && !item.gameInfo.delayLive && item.gameInfo.isHt) {
          rbPeriodKey = 'HT'; //中场休息
        }
      } else if (oldData.SportId == 2) { //篮球
        if (item.gameInfo.livePeriod == 0 && item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = 'Delayed'; //延遲開賽
        } else if (item.gameInfo.livePeriod == 1 && !item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = '1Q'; //第 1 节
        } else if (item.gameInfo.livePeriod == 2 && !item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = '2Q'; //第 2 节
        } else if (item.gameInfo.livePeriod == 2 && !item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = '3Q'; //第 3 节
        } else if (item.gameInfo.livePeriod == 2 && !item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = '4Q'; //第 4 节
        } else if (item.gameInfo.livePeriod == 99 && !item.gameInfo.delayLive && !item.gameInfo.isHt) {
          rbPeriodKey = 'QT'; //延长赛
        } else if (item.gameInfo.livePeriod == 0 && !item.gameInfo.delayLive && item.gameInfo.isHt) {
          rbPeriodKey = 'HT'; //中场休息
        }
      } else if (oldData.SportId == 5) { //网球
        if (oldData.ExtraInfo.gameSession == 5 && item.tennisInfo && item.tennisInfo.currentSet) {
          rbPeriodKey = item.tennisInfo.currentSet + 'S'; //第 N 盘
        }
      } else if (oldData.SportId == 9) { //羽毛球
        if (oldData.ExtraInfo.gameSession == 3 && item.gameInfo.livePeriod) {
          rbPeriodKey = item.gameInfo.livePeriod + 'G'; //第 N 局
        }
      } else if (oldData.SportId == 43) { //电子竞技
        if (item.eSportInfo && oldData.ExtraInfo.bestOfMap == 3) {
          rbPeriodKey = item.gameInfo.livePeriod + 'M' + (item.eSportInfo.isStartingSoon ? 'S' : 'G');
        }
      }

      if (rbPeriodKey === null && rbPeriod && rbPeriod.length > 0) { //前面沒對上 且有原始數據 嘗試切字串
        //有空白 表示為 1H 12 這種格式
        const blankIndex = rbPeriod.indexOf(' ');
        if (blankIndex !== -1) { //有空白，切到空白處
          if (blankIndex >= 0) {
            rbPeriodKey = rbPeriod.substr(0,blankIndex);
          }
        } else {
          rbPeriodKey = rbPeriod;
        }
      }

      if (rbPeriodKey && rbPeriodKey.length > 0) {
        const rbname = SABARBPeriodNames[rbPeriodKey];  //中文名
        if (rbname) {
          rbPeroidName = rbname;  //有對到才用中文名，沒對到 就直接用原本的字
        }
      }

      //處理分鐘數
      if (item.gameInfo.seconds) {
        rbMinute = new Decimal(item.gameInfo.seconds).dividedToIntegerBy(60).toString();
      }

    }

    //注意SABA的change只有更新Event本身，下屬的數組(投注線Lines,投注分組LineGroups等) 是另外處理，這裡只要拿舊數據複製就可以
    return new EventData(
      item.eventId,
      thisEventDate ?? oldData.EventDate,
      (['running','postponed'].indexOf(item.eventStatus) !== -1) ? 1 : 2, //開盤狀態 1開2關
      0, //分組? saba沒有
      0, //分組類型? saba沒有
      oldData.HomeTeamId,
      oldData.HomeTeamName,
      homeTeamScore,
      item.soccerInfo ? item.soccerInfo.homeRedCard : null,
      null, //SABA沒角球
      oldData.HomeIconUrl,
      oldData.AwayTeamId,
      oldData.AwayTeamName,
      awayTeamScore,
      item.soccerInfo ? item.soccerInfo.awayRedCard : null,
      null, //SABA沒角球
      oldData.AwayIconUrl,
      false,
      oldData.SortOrder,
      rbPeriod, //原始滾球數據
      rbMinute, //分鐘
      rbPeroidName, //滾球時間段(中文)
      null,
      oldData.GroundTypeId, //主場狀態
      oldData.IsOpenParlay, //是否支持串關
      false, //是否有分析數據(BR) saba沒有
      false, //是否有分析數據(BR) saba沒有
      null, //可視化(BR)比賽Id saba沒有
      oldData.IsRB,
      oldData.HasLiveStreaming, //是否有直播數據
      oldData.LiveStreamingUrl, //直播源列表
      null, //賽日指標，用於虛擬體育 saba沒有
      null,   //賽事指標，用於虛擬體育 saba沒有
      oldData.ExtraInfo,
      oldData.SportId,
      oldData.MarketId,
      oldData.LeagueId,
      oldData.LeagueName,
      item.marketCount ?? oldData.TotalLineCount,
      isFavourite,
      false, //SABA猜冠軍不做推送
      null,
      oldData.LineGroups.map(lgItem => {
        return new LineGroupData(
          lgItem.LineGroupId,
          lgItem.LineGroupName,
          lgItem.LineCount,
          lgItem.SortNumber,
        )
      }),
      oldData.Lines.map(lineItem => {
        return LineData.clone(lineItem)
      })
    )
  }

  //從沙巴優勝冠軍數據 生成EventData數據
  static createFromSABAOutRightSource(item, FavoriteEvents) {
    const isFavourite = FavoriteEvents.filter(favItem=>item.EventId === favItem.EventId).length > 0;

    //市場名
    const MarketName = VendorMarketNames[VendorMarkets.OUTRIGHT];

    const oddsDeciaml = Decimal.clone({ rounding: 3 }) //無條件捨去

    const thisEventId = item.leagueId; //沙巴猜冠軍用 leagueId 作為唯一key

    //2022/07 沙巴修改字段名
    const thisEventStatus = item.outrightStatus ? item.outrightStatus : item.eventStatus;

    return new EventData(
      thisEventId,
      item.eventDate,
      thisEventStatus == 'running' ? 1 : 2, //開盤狀態 1開2關
      null, //比賽分組 優勝冠軍沒有
      null, //比賽分組類型 優勝冠軍沒有
      null,  //主隊數據 優勝冠軍沒有
      null,
      null,
      null,
      null,
      null,
      null, //客隊數據 優勝冠軍沒有
      null,
      null,
      null,
      null,
      null,
      false,
      0, //TODO: saba 問排序?
      null, //滾球時間,平台原始的滾球數據 優勝冠軍沒有
      '',
      '',
      null, //相關比分清單  優勝冠軍沒有
      null, //主場狀態  優勝冠軍沒有
      false, //只能單注，不能串
      false,  //是否有分析數據(BR) 優勝冠軍沒有
      false, //是否有可視化 優勝冠軍沒有
      null, //BREventId 可視化(BR)比賽Id 優勝冠軍沒有
      false, //是否滾球中  優勝冠軍沒有
      false, //是否有直播數據 優勝冠軍沒有
      null, //直播源列表
      null, //賽日指標，用於虛擬體育
      null, //賽事指標，用於虛擬體育
      {leagueGroup: item.leagueGroup}, //額外信息
      parseInt(item.sportType),
      VendorMarkets.OUTRIGHT,
      item.leagueId,
      item.leagueName,
      1, //玩法總數 都只有一種  就是 優勝冠軍
      isFavourite,
      true, //是 優勝冠軍賽事
      item.leagueName,
      [], //玩法分組列表 優勝冠軍沒有
      [
        new LineData(
          [], //玩法分組 優勝冠軍沒有
          'OUTRIGHT',
          '', //留空白即可
          thisEventStatus != 'running',
          thisEventId,
          0,
          thisEventStatus == 'running'? 1 : 2, //盘口狀態 1開 2關
          1,
          VendorPeriodName["1"],
          thisEventId,
          null,
          null,
          null,
          item.teams.map(selectionItem => {
            return new SelectionData(
              selectionItem.orid,
              selectionItem.teamId,
              selectionItem.teamName,
              0, //沒有selection group
              '',
              '',
              null,
              parseInt(item.sportType),
              VendorMarkets.OUTRIGHT,
              MarketName,
              item.leagueId,
              item.leagueName,
              null,
              null,
              null,
              null,
              null,
              null,
              thisEventId,
              false,
              thisEventId,
              'OUTRIGHT',
              '', //留空白即可
              1,
              VendorPeriodName["1"],
              selectionItem.teamId,
              selectionItem.teamName,
              true,
              item.leagueName,
              selectionItem.price,
              SABAOddsTypeToNumber[SABAOddsType.EU],
              [
                new OddsData(
                  SABAOddsTypeToNumber[SABAOddsType.EU],
                  selectionItem.price,
                )
              ],
              selectionItem.price,
            )
          })
        )
      ]
    )
  }

  static sortEvents(events = [], sortWay = SortWays.LeagueName) {
    //注意不可用兩次排序，要用一個排序函數寫完，因為js不保證第二次排序 能保持第一次排序給出的順序
    //使用自然排序 直接按 列出的先後順序排

    //滾球=>今天=>早盤 for 關注比賽展示順序
    const marketSortMapping = {
      1:3,//EARLY:1,  //早盘
      2:2,//TODAY:2,  //今天
      3:1,//RUNNING:3, //滚球
      4:0,//FAVOURITE: 4, //关注
      5:5,//OUTRIGHT: 5, //冠军
    }

    //聯賽排序
    //市場id(滾球在前) => 排序id => 聯賽id => 時間 => eventid(用於前面排序參數都相同時，保持順序)
    const leagueCompareFunc = (left,right) => {
      const a = marketSortMapping[left.MarketId] + '_' + left.SortOrder + '_' + left.LeagueId + '_' + left.EventDate + '_' + left.EventId;
      const b = marketSortMapping[right.MarketId] + '_' + right.SortOrder + '_' + right.LeagueId + '_' + right.EventDate + '_' + right.EventId;
      return natureCompare(a,b); //自然排序
    }

    //時間排序
    //市場id(滾球在前) => 時間 => 排序id => 聯賽id => eventid(用於前面排序參數都相同時，保持順序)
    const timeCompareFunc = (left,right) => {
      const a = marketSortMapping[left.MarketId] + '_' + left.EventDate + '_' + left.SortOrder + '_' + left.LeagueId + '_' + left.EventId;
      const b = marketSortMapping[right.MarketId] + '_' + right.EventDate + '_' + right.SortOrder + '_' + right.LeagueId + '_' + right.EventId;
      return natureCompare(a,b); //自然排序
    }

    let result = events;

    //聯賽排序
    if (sortWay === SortWays.LeagueName) {
      result = (result !== null && result.length > 0) ? result.sort(leagueCompareFunc):[];
    }

    //時間排序
    if (sortWay === SortWays.EventTime) {
      result = (result !== null && result.length > 0) ? result.sort(timeCompareFunc):[];
    }

    return  result;
  }

  static clone(srcEventData, memberOddsType = null, memberType = null) {
    return new EventData(
      srcEventData.EventId,
      srcEventData.EventDate,
      srcEventData.EventStatusId,
      srcEventData.EventGroupId,
      srcEventData.EventGroupTypeId,
      srcEventData.HomeTeamId,
      srcEventData.HomeTeamName,
      srcEventData.HomeScore,
      srcEventData.HomeRedCard,
      srcEventData.HomeCorner,
      srcEventData.HomeIconUrl,
      srcEventData.AwayTeamId,
      srcEventData.AwayTeamName,
      srcEventData.AwayScore,
      srcEventData.AwayRedCard,
      srcEventData.AwayCorner,
      srcEventData.AwayIconUrl,
      srcEventData.HasCornerData,
      srcEventData.SortOrder,
      srcEventData.RBTime,
      srcEventData.RBMinute,
      srcEventData.RBPeriodName,
      srcEventData.RelatedScores,
      srcEventData.GroundTypeId,
      srcEventData.IsOpenParlay,
      srcEventData.HasStatistic,
      srcEventData.HasVisualization,
      srcEventData.BREventId,
      srcEventData.IsRB,
      srcEventData.HasLiveStreaming,
      srcEventData.LiveStreamingUrl,
      srcEventData.MatchDay,
      srcEventData.Season,
      srcEventData.ExtraInfo,
      srcEventData.SportId,
      srcEventData.MarketId,
      srcEventData.LeagueId,
      srcEventData.LeagueName,
      srcEventData.TotalLineCount,
      srcEventData.IsFavourite,
      srcEventData.IsOutRightEvent,
      srcEventData.OutRightEventName,
      srcEventData.LineGroups ? srcEventData.LineGroups.map(lgItem => {
        return new LineGroupData(
          lgItem.LineGroupId,
          lgItem.LineGroupName,
          lgItem.LineCount,
          lgItem.SortNumber,
        )
      }) : [],
      srcEventData.Lines ? srcEventData.Lines.map(lineItem => LineData.clone(lineItem, memberOddsType, memberType)) : [],
      srcEventData.MarketIdForListing,
    )
  }
}

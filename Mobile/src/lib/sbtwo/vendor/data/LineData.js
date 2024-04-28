//投注線(玩法) 數據
import {
  BTIBetTypeNames,
  BTIForceDecimalBetTypeIds,
  BTIOddsType,
  BTIOddsTypeToNumber,
  BTIPeriodMapping
} from "../bti/BTIConsts";
import SelectionData from "./SelectionData";
import OddsData from "./OddsData";
import {SelectionStatusType, VendorMarketNames} from "./VendorConsts";
import {Decimal} from "decimal.js";
import i18n from '../vendori18n';
import {SABABetTypeNames, SABAOddsType, SABAOddsTypeToNumber, SABAPeriodMapping} from "../saba/SABAConsts";
import {getEventDetailLineDesc} from '../vendorSetting';

export default class LineData {
  /**
   * @param LineGroupIds 玩法分組ID 數組型態
   * @param BetTypeId 投注類型ID
   * @param BetTypeName 投注類型名
   * @param IsLocked 盘口是否封盘
   * @param LineId 玩法ID
   * @param LineLevel 盘口级别
   * @param LineStatusId 盘口狀態 1開 2關
   * @param PeriodId 比赛时段 ID  1全場 2上半 3下半
   * @param PeriodName 比赛时段
   * @param EventId 比賽Id
   * @param EventGroupTypeId 特別投注分類, im專用
   * @param HomeTeamName 主場球隊名，特別投注用, im專用
   * @param AwayTeamName 客場球隊名，特別投注用, im專用
   * 額外提供 SelectionCountInLine 建議一行放幾個Selection, 1/2/3個
   * 額外提供 IsDisplayByTeam 是否按主客隊 分列展示 true/false
   * 額外提供 LineDesc 組合 PeriodName + BetTypeName
   * @param Selections 投注選項 列表，SelectionData數組
   */
  constructor(
              LineGroupIds,
              BetTypeId,
              BetTypeName,
              IsLocked,
              LineId,
              LineLevel,
              LineStatusId,
              PeriodId,
              PeriodName,
              EventId,
              EventGroupTypeId,
              HomeTeamName,
              AwayTeamName,
              Selections = [],
              )
  {
    Object.assign(this, {
      LineGroupIds,
      BetTypeId,
      BetTypeName,
      IsLocked,
      LineId,
      LineLevel,
      LineStatusId,
      PeriodId,
      PeriodName,
      EventId,
      EventGroupTypeId,
      HomeTeamName,
      AwayTeamName,
      Selections,
    });

    this.updateSelectionAnalysis();

    this.LineDesc = getEventDetailLineDesc(this);
  }

  //重新配置
  resetLineDesc() {
    this.LineDesc = getEventDetailLineDesc(this);
  }

  //默認 處理 詳情頁展示 投注線 ，可以在vendorSetting裡面自訂
  getLineDescDefault() {
    let periodDesc = this.PeriodName;
    //如果 BetTypeName 原本開頭就帶有 PeriodName 就不用PeriodName (for im重複PeriodName)
    //例子： BetTypeName = '下半場 讓球'   PeriodName = '下半場'
    if (periodDesc && periodDesc.length > 0
      && this.BetTypeName.indexOf(periodDesc) === 0) {
      periodDesc = '';
    }

    return (periodDesc.length > 0 ? periodDesc : '') + this.BetTypeName; //不用空白 直接接起來
  }

  //比對投注線是不是同一種投注(im專用，im同一種投注會出多個，用EventGroupTypeId去分開)
  getKeyForCompare() {
    return [this.BetTypeId,this.BetTypeName,this.EventGroupTypeId,this.PeriodId,this.EventId].join('|');
  }

  isSimilarTo(otherLine) {
    return this.getKeyForCompare() === otherLine.getKeyForCompare()
  }

  updateSelectionAnalysis() {

    //是否按主客隊 分列展示
    this.IsDisplayByTeam = false;

    //按照name去分類
    const selectionNames = this.Selections.map(s => s.SelectionName);
    //去重複
    const uniqueSelectionNames = selectionNames.filter((item, index) => selectionNames.indexOf(item) === index);

    //先支持 主客  和 主客和 這兩種
    if (uniqueSelectionNames.length === 2
      && uniqueSelectionNames.indexOf(i18n.HOME) !== -1
      && uniqueSelectionNames.indexOf(i18n.AWAY) !== -1
    ) {
      this.IsDisplayByTeam = true;
    } else if (uniqueSelectionNames.length === 3
      && uniqueSelectionNames.indexOf(i18n.HOME) !== -1
      && uniqueSelectionNames.indexOf(i18n.AWAY) !== -1
      && uniqueSelectionNames.indexOf(i18n.TIE) !== -1
    ){
      this.IsDisplayByTeam = true;
    }

    //按照targetTeam去分類
    if(this.IsDisplayByTeam !== true) {
      const targetTeamNames = this.Selections.map(s => s.TargetTeamName);
      //去重複
      const uniqueTargetTeamNames = targetTeamNames.filter((item, index) => targetTeamNames.indexOf(item) === index);

      //剛好targetTeam就是兩隊
      if (uniqueTargetTeamNames && uniqueTargetTeamNames.length === 2) {
        const selectionNameHasTeamNames = uniqueSelectionNames.filter(n => n.indexOf(uniqueTargetTeamNames[0]) !== -1 || n.indexOf(uniqueTargetTeamNames[1]) !== -1);
        //且玩法名都沒有包含隊名
        if (!selectionNameHasTeamNames || selectionNameHasTeamNames.length <=0) {
          this.IsDisplayByTeam = true;
        }
      }
    }

    //計算一行要放幾個Selection
    this.SelectionCountInLine = this._getSelectionCountInLine();
  }

  _getSelectionCountInLine() {
    if (this.Selections) {
      if (this.Selections.length === 1) {
        return 1;
      }

      if (this.Selections.length > 1) {
        //按照name去分類
        const selectionNames = this.Selections.map(s => s.SelectionName);
        const haveHandicap = this.Selections.filter(s => s.Handicap !== null).length > 0
        //去重複
        const uniqueSelectionNames = selectionNames.filter((item, index) => selectionNames.indexOf(item) === index);
        //console.log('=====uniqueSelectionNames',this.BetTypeName,uniqueSelectionNames.length,uniqueSelectionNames,selectionNames);
        //有幾種Selection
        const selectionCategoryCount = uniqueSelectionNames.length;
        //平均的selectionName長度
        let cc = 0;
        uniqueSelectionNames.map(usn => cc = cc + usn.length);
        let maxWordLength = 14;
        if (i18n.WORDWIDTH > 1) {
          maxWordLength = maxWordLength/i18n.WORDWIDTH; //中文算2個字寬
        }
        if (haveHandicap) {
          maxWordLength = maxWordLength - 2; //有多展示handicap多算兩個字
        }
        if (new Decimal(cc).dividedToIntegerBy(selectionCategoryCount).greaterThanOrEqualTo(maxWordLength)) {
          return 1;  //平均名稱超過，就直接展示一行一行的，要不放不下
        }

        if (selectionCategoryCount === 3) {
          return 3;
        }
      }
    }
    return 2; //默認2
  }

  static createFromBTIChange(lineItem,oldEventData,memberOddsType = BTIOddsType.HK, cachedLineGroupIds = null) {

    let oddsTypePropList = [];
    for (let oddsPropName in BTIOddsTypeToNumber) {
      oddsTypePropList.push({name: oddsPropName, number: BTIOddsTypeToNumber[oddsPropName]});
    }

    const marketName = VendorMarketNames[oldEventData.MarketId];

    //處理特殊玩法 名稱統一(讓分 大小)
    let thisBetTypeName = lineItem.name; //直接用name比用marketType.name完整
    let periodData = {PeriodId: 0, PeriodName : ''}
    const specialBetTypeName = BTIBetTypeNames[lineItem.marketType.id];
    if (specialBetTypeName) {
      thisBetTypeName = specialBetTypeName;
      periodData = BTIPeriodMapping[lineItem.marketType.id];
    }

    let oldLine = null;
    if (oldEventData.Lines && oldEventData.Lines.length > 0) {
      const oldLines = oldEventData.Lines.filter(l => l.LineId === lineItem.id);
      if (oldLines && oldLines.length >0) {
        oldLine = oldLines[0];
      }
    }

    //判斷強制歐洲盤的玩法
    const forceDecimalBetTypeIds = BTIForceDecimalBetTypeIds[parseInt(oldEventData.SportId)];

    // add / changes 可能會收到空的group配置，如果為空就用舊數據/緩存數據
    let thisLineGroupIds = [];
    if (lineItem.groups && lineItem.groups.length > 0) {
      thisLineGroupIds = lineItem.groups;
    } else if (oldLine && oldLine.LineGroupIds && oldLine.LineGroupIds.length > 0) {
      thisLineGroupIds = oldLine.LineGroupIds;
    } else if (cachedLineGroupIds && cachedLineGroupIds.length > 0) {
      thisLineGroupIds = cachedLineGroupIds;
    }

    return new LineData(
      thisLineGroupIds,
      lineItem.marketType.id,
      thisBetTypeName,
      lineItem.isSuspended, //盘口是否封盘
      lineItem.id,
      1, //盘口级别 BTI沒有
      1, //盘口狀態 1開 2關 BTI沒有
      periodData.PeriodId, //比赛时段 ID  1全場 2上半 3下半 BTI沒有
      periodData.PeriodName, //比赛时段名  BTI沒有
      oldEventData.EventId,
      0, //分組類型? BTI沒有
      oldEventData.HomeTeamName,
      oldEventData.AwayTeamName,
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
          if (oldEventData.HomeTeamId === selectionItem.participantMapping) {
            targetTeamId = oldEventData.HomeTeamId;
            targetTeamName = oldEventData.HomeTeamName;
          } else if (oldEventData.AwayTeamId === selectionItem.participantMapping) {
            targetTeamId = oldEventData.AwayTeamId;
            targetTeamName = oldEventData.AwayTeamName;
          }
        }

        //如果用participantMapping沒有對到，改用selectionName判斷
        if (targetTeamId === null) {
          if ((oldEventData.HomeTeamName && selectionItem.name.indexOf(oldEventData.HomeTeamName) !== -1) //玩法名包含隊名
            || selectionItem.name === i18n.HOME) //或者玩法名就是一個「主」字
          {
            targetTeamId = oldEventData.HomeTeamId;
            targetTeamName = oldEventData.HomeTeamName;
          } else if ((oldEventData.AwayTeamName && selectionItem.name.indexOf(oldEventData.AwayTeamName) !== -1) //玩法名包含隊名
            || selectionItem.name === i18n.AWAY)//或者玩法名就是一個「客」字
          {
            targetTeamId = oldEventData.AwayTeamId;
            targetTeamName = oldEventData.AwayTeamName;
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
          oldEventData.SportId,
          oldEventData.MarketId,
          marketName,
          oldEventData.LeagueId,
          oldEventData.LeagueName,
          oldEventData.HomeTeamId,
          oldEventData.HomeTeamName,
          oldEventData.HomeScore,
          oldEventData.AwayTeamId,
          oldEventData.AwayTeamName,
          oldEventData.AwayScore,
          oldEventData.EventId,
          oldEventData.IsOpenParlay,
          lineItem.id,
          lineItem.marketType.id,
          thisBetTypeName,
          periodData.PeriodId, //比赛时段 ID  1全場 2上半 3下半 BTI沒有 只有特殊玩法(讓分,大小)有提供，其他帶0
          periodData.PeriodName,
          targetTeamId,
          targetTeamName,
          oldEventData.IsOutRightEvent,
          oldEventData.OutRightEventName,
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
  }

  static createFromSABAAdd(lineItem,oldEventData,memberOddsType = SABAOddsType.HK) {

    let oddsTypePropList = [];
    for (let oddsPropName in SABAOddsTypeToNumber) {
      oddsTypePropList.push({name: oddsPropName, number: SABAOddsTypeToNumber[oddsPropName]});
    }

    const marketName = VendorMarketNames[oldEventData.MarketId];

    //處理特殊玩法 名稱統一(讓分 大小)
    let thisBetTypeName = lineItem.betTypeName;
    let periodData = {PeriodId: 0, PeriodName : ''}
    const specialBetTypeName = SABABetTypeNames[lineItem.betType];
    if (specialBetTypeName) {
      thisBetTypeName = specialBetTypeName;
      periodData = SABAPeriodMapping[lineItem.betType];
    }

    let oldLine = null;
    if (oldEventData.Lines && oldEventData.Lines.length > 0) {
      const oldLines = oldEventData.Lines.filter(l => l.LineId === lineItem.marketId);
      if (oldLines && oldLines.length >0) {
        oldLine = oldLines[0];
      }
    }

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
      oldEventData.EventId,
      0, //分組類型? SABA沒有?
      oldEventData.HomeTeamName,
      oldEventData.AwayTeamName,
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
        if ((oldEventData.HomeTeamName && selectionItem.keyName.indexOf(oldEventData.HomeTeamName) !== -1) //玩法名包含隊名
          || selectionItem.keyName === i18n.HOME //或者玩法名就是一個「主」字
          || (isTeamBet && (selectionItem.key == 'h' || selectionItem.key == '1')) //或者 玩法是隊伍bet 且玩法Key = h 或 1
        ) {
          targetTeamId = oldEventData.HomeTeamId;
          targetTeamName = oldEventData.HomeTeamName;
        } else if ((oldEventData.AwayTeamName && selectionItem.keyName.indexOf(oldEventData.AwayTeamName) !== -1) //玩法名包含隊名
          || selectionItem.keyName === i18n.AWAY //或者玩法名就是一個「客」字
          || (isTeamBet && (selectionItem.key == 'a' || selectionItem.key == '2')) //或者 玩法是隊伍bet 且玩法Key = a 或 2
        ) {
          targetTeamId = oldEventData.AwayTeamId;
          targetTeamName = oldEventData.AwayTeamName;
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
          oldEventData.EventId + '_' + lineItem.marketId + '_' + selectionItem.key, //key太簡單，加上eventId和marketid作為唯一值 這個id不用於投注
          selectionItem.key,  //實際只拿這個SelectionType去投注
          selectionItem.keyName,
          0,
          selectionItem.point,
          selectionItem.point,
          null,
          oldEventData.SportId,
          oldEventData.MarketId,
          marketName,
          oldEventData.LeagueId,
          oldEventData.LeagueName,
          oldEventData.HomeTeamId,
          oldEventData.HomeTeamName,
          oldEventData.HomeScore,
          oldEventData.AwayTeamId,
          oldEventData.AwayTeamName,
          oldEventData.AwayScore,
          oldEventData.EventId,
          oldEventData.IsOpenParlay,
          lineItem.marketId,
          lineItem.betType,
          thisBetTypeName,
          periodData.PeriodId, //比赛时段 ID  1全場 2上半 3下半 BTI沒有 只有特殊玩法(讓分,大小)有提供，其他帶0
          periodData.PeriodName,
          targetTeamId,
          targetTeamName,
          oldEventData.IsOutRightEvent,
          oldEventData.OutRightEventName,
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
  }

  static createFromSABAChange(lineItem,oldEventData,memberOddsType = SABAOddsType.HK) {

    let oddsTypePropList = [];
    for (let oddsPropName in SABAOddsTypeToNumber) {
      oddsTypePropList.push({name: oddsPropName, number: SABAOddsTypeToNumber[oddsPropName]});
    }

    const marketName = VendorMarketNames[oldEventData.MarketId];

    let oldLine = null;
    if (oldEventData.Lines && oldEventData.Lines.length > 0) {
      const oldLines = oldEventData.Lines.filter(l => l.LineId === lineItem.marketId);
      if (oldLines && oldLines.length >0) {
        oldLine = oldLines[0];
      }
    }

    if (oldLine === null) {
      console.log('====createFromSABAChange no old line??? for lineid:',lineItem.marketId);
      return null;
    }

    return new LineData(
      oldLine.LineGroupIds, //玩法分組 數組格式
      oldLine.BetTypeId,
      oldLine.BetTypeName,
      lineItem.marketStatus !== 'running', //盘口是否封盘
      lineItem.marketId,
      oldLine.LineLevel, //盘口级别 類似IM的linelevel
      lineItem.marketStatus === 'running' ? 1 : 2, //盘口狀態 1開 2關
      oldLine.PeriodId, //比赛时段 ID  1全場 2上半 3下半
      oldLine.PeriodName, //比赛时段名
      oldEventData.EventId,
      0, //分組類型? SABA沒有?
      oldEventData.HomeTeamName,
      oldEventData.AwayTeamName,
      oldLine.Selections.map(oldSelection => {
        const newSelections = lineItem.selections.filter(sitem => sitem.key === oldSelection.SelectionType);
        if (newSelections && newSelections.length > 0) {
          let selectionItem = newSelections[0];
          const oddsDeciaml = Decimal.clone({ rounding: 3 }) //無條件捨去

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
            oldEventData.EventId + '_' + lineItem.marketId + '_' + selectionItem.key, //key太簡單，加上eventId和marketid作為唯一值 這個id不用於投注
            selectionItem.key,  //實際只拿這個SelectionType去投注
            oldSelection.SelectionName,
            0,
            selectionItem.point,
            selectionItem.point,
            null,
            oldEventData.SportId,
            oldEventData.MarketId,
            marketName,
            oldEventData.LeagueId,
            oldEventData.LeagueName,
            oldEventData.HomeTeamId,
            oldEventData.HomeTeamName,
            oldEventData.HomeScore,
            oldEventData.AwayTeamId,
            oldEventData.AwayTeamName,
            oldEventData.AwayScore,
            oldEventData.EventId,
            oldEventData.IsOpenParlay,
            lineItem.marketId,
            oldLine.BetTypeId,
            oldLine.BetTypeName,
            oldLine.PeriodId, //比赛时段 ID  1全場 2上半 3下半
            oldLine.PeriodName, //比赛时段名
            oldSelection.TargetTeamId,
            oldSelection.TargetTeamName,
            oldEventData.IsOutRightEvent,
            oldEventData.OutRightEventName,
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
            oldSelection.ExtraInfo //赛事串关数量限制   0: 该盘口不支持串关 2: 下注时最少需要选2种组合  3: 下注时最少需要选3种组合
          )
        } else {
          return SelectionData.clone(oldSelection); //沒更新就保持原本數據
        }
      })
    )
  }

  static clone(srcLineData, memberOddsType = null, memberType = null) {
    return new LineData(
      srcLineData.LineGroupIds,
      srcLineData.BetTypeId,
      srcLineData.BetTypeName,
      srcLineData.IsLocked,
      srcLineData.LineId,
      srcLineData.LineLevel,
      srcLineData.LineStatusId,
      srcLineData.PeriodId,
      srcLineData.PeriodName,
      srcLineData.EventId,
      srcLineData.EventGroupTypeId,
      srcLineData.HomeTeamName,
      srcLineData.AwayTeamName,
      srcLineData.Selections.map(selectionItem => SelectionData.clone(selectionItem, memberOddsType, memberType))
    )
  }
}

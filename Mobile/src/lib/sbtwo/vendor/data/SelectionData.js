//投注選項 數據
import {Decimal} from 'decimal.js';
import {SelectionStatusNames, SelectionStatusType} from "./VendorConsts";
import OddsData from "./OddsData";

export default class SelectionData {
  /**
   * @param SelectionId 投注選項ID
   * @param SelectionType 投注選項類型
   * @param SelectionName 投注選項類型名
   * @param SelectionGroup 投注選項分類 bti專用，用於同類selection分組排序(在IM是直接分成不同投注線 並有linelevel)
   * @param Handicap 讓球和大小盤數據(展示用)
   * @param RealHandicap 讓球和大小盤數據(投注用)
   * @param Specifiers 其他下注資料 IM 用於特殊投注， BTI用於辨識是否 主投注線(MainPointLine,等同IM的LineLevel=1)
   * @param SportId 體育ID
   * @param MarketId 市場ID
   * @param MarketName 市場名
   * @param LeagueId 聯賽id
   * @param LeagueName 聯賽名
   * @param HomeTeamId 主場球隊id
   * @param HomeTeamName 主場球隊名
   * @param HomeScore 主場得分，投注時使用
   * @param AwayTeamId 客場球隊id
   * @param AwayTeamName 客場球隊名
   * @param AwayScore 客場得分，投注時使用
   * @param EventId 比賽id
   * @param IsOpenParlay 是否支持串關 從EventData複製過來
   * @param LineId 玩法ID
   * @param BetTypeId 投注類型ID
   * @param BetTypeName 投注類型名
   * @param PeriodId 比赛时段 ID  1全場 2上半 3下半
   * @param PeriodName 比赛时段
   * @param TargetTeamId 投注目標球隊id, 用於判斷展示格式
   * @param TargetTeamName 投注目標球隊名, 用於判斷展示格式
   * 額外提供 LineDesc 投注線描述，用於投注購物車展示
   * 額外提供 SelectionDesc 投注選項描述，用於投注購物車展示
   * @param IsOutRightEvent 是否為優勝冠軍賽事
   * @param OutRightEventName 優勝冠軍賽事名
   * @param Odds 賠率(一般是計算用，im是數字 bti因為盤口問題，跟DisplayOdds是一樣的)
   * @param OddsType 賠率類型
   * @param OddsList 賠率清單，OddsData數組
   * @param DisplayOdds 用來展示的賠率，字符串格式
   * @param SelectionIsLocked 投注選項已鎖定
   * @param LineStatusId 盘口狀態 1開2關，投注時使用
   * @param SelectionStatus 投注選項(檢查)狀態，投注時使用
   * @param ExtraInfo 額外配置，投注時使用(動態字段)
   */
  constructor(
              SelectionId,
              SelectionType,
              SelectionName,
              SelectionGroup,
              Handicap,
              RealHandicap,
              Specifiers,
              SportId,
              MarketId,
              MarketName,
              LeagueId,
              LeagueName,
              HomeTeamId,
              HomeTeamName,
              HomeScore,
              AwayTeamId,
              AwayTeamName,
              AwayScore,
              EventId,
              IsOpenParlay,
              LineId,
              BetTypeId,
              BetTypeName,
              PeriodId,
              PeriodName,
              TargetTeamId,
              TargetTeamName,
              IsOutRightEvent,
              OutRightEventName,
              Odds,
              OddsType,
              OddsList = [],
              DisplayOdds = '',
              SelectionIsLocked= false,
              LineStatusId = 1,
              SelectionStatus = SelectionStatusType.NOTSET,
              ExtraInfo = {},
              )
  {

    const SelectionStatusName = SelectionStatusNames[SelectionStatus];

    Object.assign(this, {
      SelectionId,
      SelectionType,
      SelectionName,
      SelectionGroup,
      Handicap,
      RealHandicap,
      Specifiers,
      SportId,
      MarketId,
      MarketName,
      LeagueId,
      LeagueName,
      HomeTeamId,
      HomeTeamName,
      HomeScore,
      AwayTeamId,
      AwayTeamName,
      AwayScore,
      EventId,
      IsOpenParlay,
      LineId,
      BetTypeId,
      BetTypeName,
      PeriodId,
      PeriodName,
      TargetTeamId,
      TargetTeamName,
      IsOutRightEvent,
      OutRightEventName,
      Odds,
      OddsType,
      OddsList,
      DisplayOdds,
      SelectionIsLocked,
      LineStatusId,
      SelectionStatus,
      SelectionStatusName, //額外提供：投注選項 狀態 中文名
      ExtraInfo,
    });

    //投注購物車展示 投注線
    let periodDesc = !this.IsOutRightEvent ? this.PeriodName : '';
    //如果 BetTypeName 原本開頭就帶有 PeriodName 就不用PeriodName (for im重複PeriodName)
    //例子： BetTypeName = '下半場 讓球'   PeriodName = '下半場'
    if (periodDesc && periodDesc.length > 0
      && this.BetTypeName.indexOf(periodDesc) === 0) {
      periodDesc = '';
    }

    this.LineDesc = (this.MarketName ?? '') + ((!this.IsOutRightEvent && periodDesc.length) > 0 ? (' ' + periodDesc) : '') + ' ' + this.BetTypeName;

    //投注購物車展示 投注選項 默認 玩法名 + 目標數字
    let handicapTail = (this.Handicap !== null && this.Handicap !== undefined && !this.IsOutRightEvent) ? (' ' + this.Handicap) : '';

    //如果SelectionName原本就帶有 hadicapTail 就不用加上去(for bti重複handicap)
    if (handicapTail && handicapTail.length > 0
      && this.SelectionName.indexOf(handicapTail, this.SelectionName.length - handicapTail.length) !== -1) {
      handicapTail = '';
    }

    let selectionDesc = this.SelectionName + handicapTail;
    if (this.TargetTeamName !== ''  //有目標隊伍數據
      && this.SelectionName.indexOf(this.TargetTeamName) === -1) {  //且玩法名沒有包含 目標隊伍
      selectionDesc = this.TargetTeamName + ' ' + this.SelectionName + handicapTail;
    }
    this.SelectionDesc = selectionDesc;
  }

  //IM投注前檢查 - WagerSelectionInfos
  toIMBetInfo() {
    let data = {
      WagerSelectionId: this.SelectionId,
      MarketlineId: this.LineId,
      BetTypeId: this.BetTypeId,
      BetTypeSelectionId: this.SelectionType,
      OutrightTeamId: 0, //一般賽事這個是0
      OddsType: this.OddsType,
      Handicap: this.RealHandicap,
      Odds: this.Odds,
      EventId: this.EventId,
      SportId: this.SportId,
      Specifiers: this.Specifiers,
      PeriodId: this.PeriodId,
    }

    //特別處理 優勝冠軍
    if (this.IsOutRightEvent) {
      data.BetTypeSelectionId= 0; //優勝冠軍這個是0
      data.OutrightTeamId= this.SelectionType;
    }

    return data;
  }

  //IM投注 - WagerSelectionInfos
  toIMWager() {
    let data = {
      WagerSelectionId: this.SelectionId,
      MarketlineId: this.LineId,
      BetTypeId: this.BetTypeId,
      BetTypeSelectionId: this.SelectionType,
      OutrightTeamId: 0, //一般賽事這個是0
      OddsType: this.OddsType,
      Handicap: this.RealHandicap,
      Odds: this.Odds,
      HomeScore: this.HomeScore,
      AwayScore: this.AwayScore,
      EventId: this.EventId,
      SportId: this.SportId,
      Market: this.MarketId,
      Specifiers: this.Specifiers,
    }

    //特別處理 優勝冠軍
    if (this.IsOutRightEvent) {
      data.BetTypeSelectionId= 0; //優勝冠軍這個是0
      data.OutrightTeamId= this.SelectionType;
    }

    return data;
  }

  //BTI投注
  toBTIWager() {
    return this.ExtraInfo.selection;
  }

  //SABA投注前檢查-單注
  toSABASingleBetInfo() {
    return {
      sportType: this.SportId,
      marketId: this.LineId,
      key: this.SelectionType,
      oddsType: this.OddsType,
    }
  }

  //SABA投注前檢查-單注(猜冠軍)
  toSABAOutRightBetInfo() {
    return {
      sportType: this.SportId,
      orid: this.SelectionId,
    }
  }

  //SABA投注前檢查-串關
  toSABAParlayBetInfo() {
    return {
      sportType: this.SportId,
      marketId: this.LineId,
      point: this.RealHandicap,
      key: this.SelectionType,
    }
  }

  //SABA單注投注參數
  toSABAPlaceSingleBetParams(BetAmount, isAcceptAnyOdds) {
    return {
      sportType: this.SportId,
      marketId: this.LineId,
      price: this.Odds,
      point: this.RealHandicap,
      key: this.SelectionType,
      stake: new Decimal(BetAmount).toNumber(),
      oddsType: this.OddsType,
    }
  }

  //SABA單注 猜冠軍 (單注)投注參數
  toSABAPlaceOutRightBetParams(BetAmount) {
    return {
      sportType: this.SportId,
      price: this.Odds,
      orid: this.SelectionId,
      stake: new Decimal(BetAmount).toNumber(),
    }
  }

  //SABA串關 投注參數
  toSABAPlaceParlayBetParams() {
    return {
      sportType: this.SportId,
      marketId: this.LineId,
      point: this.RealHandicap,
      key: this.SelectionType,
      price: this.Odds,
    }
  }


  static clone(srcSelectionData, memberOddsType = null, memberType = null) {

    //從OddsList獲取賠率
    let thisOddsType = null;
    let thisOddsValue = null;
    let thisDisplayOdds = null;
    if (memberOddsType !== null) { //有指定 才做轉換
      if (srcSelectionData.OddsList && srcSelectionData.OddsList.length > 0) {
        let targetOddsInfo = srcSelectionData.OddsList[0]; //默認選第一個賠率
        const matchOddsInfos = srcSelectionData.OddsList.filter(oInfo => parseInt(oInfo.OddsType) === memberOddsType);
        if (matchOddsInfos && matchOddsInfos.length > 0) { //如果有找到跟會員設置的盤口一樣的，就使用這個
          targetOddsInfo = matchOddsInfos[0];
        }
        thisOddsType = targetOddsInfo.OddsType;
        if (memberType !== null) {
          thisOddsValue = targetOddsInfo.OddsValues[memberType]; //IM根據水位選擇賠率
          const oddsDeciaml = Decimal.clone({ rounding: 3 }) //無條件捨去
          thisDisplayOdds = new oddsDeciaml(thisOddsValue).toFixed(2);
        } else {
          thisOddsValue = targetOddsInfo.OddsValues; //bti/saba直接使用賠率
          thisDisplayOdds = targetOddsInfo.OddsValues; //bti/saba直接使用賠率
        }
      }
    }

    //如果沒獲取到就用默認值
    thisOddsValue = thisOddsValue ?? srcSelectionData.Odds;
    thisOddsType = thisOddsType ?? srcSelectionData.OddsType;
    thisDisplayOdds = thisDisplayOdds ?? srcSelectionData.DisplayOdds;

    return new SelectionData(
      srcSelectionData.SelectionId,
      srcSelectionData.SelectionType,
      srcSelectionData.SelectionName,
      srcSelectionData.SelectionGroup,
      srcSelectionData.Handicap,
      srcSelectionData.RealHandicap,
      srcSelectionData.Specifiers,
      srcSelectionData.SportId,
      srcSelectionData.MarketId,
      srcSelectionData.MarketName,
      srcSelectionData.LeagueId,
      srcSelectionData.LeagueName,
      srcSelectionData.HomeTeamId,
      srcSelectionData.HomeTeamName,
      srcSelectionData.HomeScore,
      srcSelectionData.AwayTeamId,
      srcSelectionData.AwayTeamName,
      srcSelectionData.AwayScore,
      srcSelectionData.EventId,
      srcSelectionData.IsOpenParlay,
      srcSelectionData.LineId,
      srcSelectionData.BetTypeId,
      srcSelectionData.BetTypeName,
      srcSelectionData.PeriodId,
      srcSelectionData.PeriodName,
      srcSelectionData.TargetTeamId,
      srcSelectionData.TargetTeamName,
      srcSelectionData.IsOutRightEvent,
      srcSelectionData.OutRightEventName,
      thisOddsValue,
      thisOddsType,
      srcSelectionData.OddsList ? srcSelectionData.OddsList.map(oddsItem => {
        return new OddsData(
          oddsItem.OddsType,
          oddsItem.OddsValues,
        )
      }): [],
      thisDisplayOdds,
      srcSelectionData.SelectionIsLocked,
      srcSelectionData.LineStatusId,
      srcSelectionData.SelectionStatus,
      srcSelectionData.ExtraInfo,
    )
  }
}

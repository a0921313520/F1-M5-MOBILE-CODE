//單個投注數據
import moment from "moment";
import {VendorConfigs} from "./VendorConsts";
import i18n from '../vendori18n';
import {getWagerLineDesc} from '../vendorSetting';

export default class WagerItemData {
  /**
   * @param WagerStatus 注單狀態 IM 1待定 2確認 3拒絕 4取消 bti是英文
   * @param WagerStatusName 注單狀態中文
   * @param ConfirmStatus 確認狀態 IM 0未確認 1普通確認 2危險球確認 bti無
   * @param ConfirmStatusName 確認狀態中文
   * @param CancelStatus 取消狀態 IM 1未取消 2注單取消 3比賽取消 bti 1未取消 2已取消
   * @param CancelStatusName 取消狀態中文
   * @param CancelReason 取消原因 IM 0無原因 1危險紅牌 2危險進球 101賽事終止 bti無
   * @param CancelReasonName 取消原因中文
   * @param MarketId 市場ID
   * @param MarketName 市場中文
   * @param EventId 比賽id
   * @param EventDate 比赛時間
   * @param SportId 體育ID
   * @param LeagueId 聯賽id
   * @param LeagueName 聯賽名
   * @param SourceId 比赛外部參考ID?
   * @param Season 賽日指標，用於虛擬體育
   * @param MatchDay 賽事指標，用於虛擬體育
   * @param EventGroupTypeId 比賽分組類型，用途不明
   * @param HomeTeamId 主場球隊id
   * @param HomeTeamName 主場球隊名
   * @param AwayTeamId 客場球隊id
   * @param AwayTeamName 客場球隊名
   * @param BetTypeId 投注類型ID
   * @param BetTypeName 投注類型名
   * @param PeriodId 比赛时段 ID  1全場 2上半 3下半
   * @param PeriodName 比赛时段中文
   * @param SelectionType 投注選項類型
   * @param SelectionName 投注選項類型名
   * @param IsOutRightEvent 是否為優勝冠軍賽事
   * @param OutRightEventName 優勝冠軍賽事名
   * @param OutrightTeamId 优胜冠军类型 ID. (只适用于优胜冠军，如果定时赛事会是0)
   * @param OutrightTeamName 优胜冠军名称 (只适用于优胜冠军赛事，如果定时赛事会 是0)
   * @param Odds 賠率
   * @param Handicap 讓球和大小盤數據
   * @param HomeTeamHTScore 主隊上半場得分, bti無
   * @param AwayTeamHTScore 客隊上半場得分, bti無
   * @param HomeTeamFTScore 主隊全場得分, bti無
   * @param AwayTeamFTScore 客隊全場得分, bti無
   * @param HomeTeamScoreWhenBet 投注時主隊得分, bti無
   * @param AwayTeamScoreWhenBet 投注時客隊得分, bti無
   * @param HomeTeamResult 主隊賽果 IM 由PeriodId 比赛时段決定, bti無
   * @param AwayTeamResult 客隊賽果 IM 由PeriodId 比赛时段決定, bti無
   * @param GameResult 賽果 字符串型態 IM 由PeriodId 比赛时段決定,  bti返回內容不定
   * @param GroundTypeId 主場狀態 0在中立場比賽 1在主場比賽
   * @param TargetTeamId 投注目標球隊id, 用於判斷展示格式
   * @param TargetTeamName 投注目標球隊名, 用於判斷展示格式
   * @param IsRB 是否比賽進行(滾球)中
   * @param RBMinute 滾球分鐘(開始到現在比賽進行了幾分鐘)
   * @param RBPeriodName 滾球時間段(中文)
   * @param RBHomeScore 滾球主場得分
   * @param RBAwayScore 滾球客場得分
   * @param IsLucky 是否幸運選擇 SABA串關專用
   * 額外提供 LineDesc 投注線描述，用於投注購物車展示
   * 額外提供 SelectionDesc 投注選項描述，用於投注購物車展示
   */
  constructor(
              WagerStatus,
              WagerStatusName,
              ConfirmStatus,
              ConfirmStatusName,
              CancelStatus,
              CancelStatusName,
              CancelReason,
              CancelReasonName,
              MarketId,
              MarketName,
              EventId,
              EventDate,
              SportId,
              LeagueId,
              LeagueName,
              SourceId,
              Season,
              MatchDay,
              EventGroupTypeId,
              HomeTeamId,
              HomeTeamName,
              AwayTeamId,
              AwayTeamName,
              BetTypeId,
              BetTypeName,
              PeriodId,
              PeriodName,
              SelectionType,
              SelectionName,
              IsOutRightEvent,
              OutRightEventName,
              OutrightTeamId,
              OutrightTeamName,
              Odds,
              Handicap,
              HomeTeamHTScore,
              AwayTeamHTScore,
              HomeTeamFTScore,
              AwayTeamFTScore,
              HomeTeamScoreWhenBet,
              AwayTeamScoreWhenBet,
              HomeTeamResult,
              AwayTeamResult,
              GameResult,
              GroundTypeId,
              TargetTeamId,
              TargetTeamName,
              IsRB,
              RBMinute,
              RBPeriodName,
              RBHomeScore,
              RBAwayScore,
              IsLucky = false,
              )
  {
    Object.assign(this, {
      WagerStatus,
      WagerStatusName,
      ConfirmStatus,
      ConfirmStatusName,
      CancelStatus,
      CancelStatusName,
      CancelReason,
      CancelReasonName,
      MarketId,
      MarketName,
      EventId,
      EventDate,
      SportId,
      LeagueId,
      LeagueName,
      SourceId,
      Season,
      MatchDay,
      EventGroupTypeId,
      HomeTeamId,
      HomeTeamName,
      AwayTeamId,
      AwayTeamName,
      BetTypeId,
      BetTypeName,
      PeriodId,
      PeriodName,
      SelectionType,
      SelectionName,
      IsOutRightEvent,
      OutRightEventName,
      OutrightTeamId,
      OutrightTeamName,
      Odds,
      Handicap,
      HomeTeamHTScore,
      AwayTeamHTScore,
      HomeTeamFTScore,
      AwayTeamFTScore,
      HomeTeamScoreWhenBet,
      AwayTeamScoreWhenBet,
      HomeTeamResult,
      AwayTeamResult,
      GameResult,
      GroundTypeId,
      TargetTeamId,
      TargetTeamName,
      IsRB,
      RBMinute,
      RBPeriodName,
      RBHomeScore,
      RBAwayScore,
      IsLucky,
    });

    //投注購物車展示 投注線
    this.LineDesc = getWagerLineDesc(this);

    //投注購物車展示 投注選項 默認 玩法名 + 目標數字
    let handicapTail = (this.Handicap !== null && this.Handicap !== undefined && !this.IsOutRightEvent) ? (' ' + this.Handicap) : '';

    //處理bti正數額外有+號的情況
    let handicapTailWithPostive = (this.Handicap !== null && this.Handicap !== undefined && !this.IsOutRightEvent) ? (' +' + this.Handicap) : '';
    //如果SelectionName原本就帶有 hadicapTail 就不用加上去(for bti重複handicap)
    if (handicapTail && handicapTail.length > 0
      && (
        this.SelectionName.indexOf(handicapTail, this.SelectionName.length - handicapTail.length) !== -1
        || this.SelectionName.indexOf(handicapTailWithPostive, this.SelectionName.length - handicapTailWithPostive.length) !== -1
      )
    ){
      handicapTail = '';
    }

    let selectionDesc = this.SelectionName + handicapTail;
    if (this.TargetTeamName !== ''  //有目標隊伍數據
      && this.SelectionName.indexOf(this.TargetTeamName) === -1) {  //且玩法名沒有包含 目標隊伍
      selectionDesc = this.TargetTeamName + ' ' + this.SelectionName + handicapTail;
    }
    this.SelectionDesc = selectionDesc;
  }

  //默認 處理 投注購物車展示 投注線 ，可以在vendorSetting裡面自訂
  getLineDescDefault() {
    let periodDesc = !this.IsOutRightEvent ? this.PeriodName : '';
    //如果 BetTypeName 原本開頭就帶有 PeriodName 就不用PeriodName (for im重複PeriodName)
    //例子： BetTypeName = '下半場 讓球'   PeriodName = '下半場'
    if (periodDesc && periodDesc.length > 0
      && this.BetTypeName.indexOf(periodDesc) === 0) {
      periodDesc = '';
    }

    let LineDesc = (this.MarketName ? (this.MarketName + ' ') : '') + ((!this.IsOutRightEvent && periodDesc.length > 0) ? (' ' + periodDesc) : '') + ' ' + this.BetTypeName;

    if (this.IsLucky) {
      LineDesc = LineDesc + ' (' + i18n.SABA.ISLUCKY + ')';
    }
    return LineDesc;
  }

  getEventDateMoment() {
    return moment(this.EventDate).utcOffset(VendorConfigs.TIMEZONE);
  }

  static clone(srcData) {
    return new WagerItemData(
      srcData.WagerStatus,
      srcData.WagerStatusName,
      srcData.ConfirmStatus,
      srcData.ConfirmStatusName,
      srcData.CancelStatus,
      srcData.CancelStatusName,
      srcData.CancelReason,
      srcData.CancelReasonName,
      srcData.MarketId,
      srcData.MarketName,
      srcData.EventId,
      srcData.EventDate,
      srcData.SportId,
      srcData.LeagueId,
      srcData.LeagueName,
      srcData.SourceId,
      srcData.Season,
      srcData.MatchDay,
      srcData.EventGroupTypeId,
      srcData.HomeTeamId,
      srcData.HomeTeamName,
      srcData.AwayTeamId,
      srcData.AwayTeamName,
      srcData.BetTypeId,
      srcData.BetTypeName,
      srcData.PeriodId,
      srcData.PeriodName,
      srcData.SelectionType,
      srcData.SelectionName,
      srcData.IsOutRightEvent,
      srcData.OutRightEventName,
      srcData.OutrightTeamId,
      srcData.OutrightTeamName,
      srcData.Odds,
      srcData.Handicap,
      srcData.HomeTeamHTScore,
      srcData.AwayTeamHTScore,
      srcData.HomeTeamFTScore,
      srcData.AwayTeamFTScore,
      srcData.HomeTeamScoreWhenBet,
      srcData.AwayTeamScoreWhenBet,
      srcData.HomeTeamResult,
      srcData.AwayTeamResult,
      srcData.GameResult,
      srcData.GroundTypeId,
      srcData.TargetTeamId,
      srcData.TargetTeamName,
      srcData.IsRB,
      srcData.RBMinute,
      srcData.RBPeriodName,
      srcData.RBHomeScore,
      srcData.RBAwayScore,
      srcData.IsLucky
    )
  }
}

//投注配置
import {IMComboTypeNames} from "../im/IMConsts";
import {Decimal} from "decimal.js";
import VendorError from "./VendorError";
import {BTIComboTypeNames} from "../bti/BTIConsts";
import {SABAComboTypeNames} from "../saba/SABAConsts";

export default class BetSettingData {
  /**
   * @param MinAmount 最低投注
   * @param MaxAmount 最高投注
   * @param EstimatedPayoutRate 预测派彩金额比例 根据 $1投注金额
   * @param ComboType 串關類型 0單注
   * 額外提供 ComboTypeName 串關類型中文名
   * @param ComboCount 串關注數
   * @param vendor im 或 bti 或 saba 用來mapping 串關類型名稱
   * @param HasComboBonus 有串關額外獎勵
   * @param ComboBonusPercentage 串關獎勵百分比(數字) 已經是百分率 不是小數，加個%一起顯示即可
   * @param OriginEstimatedPayoutRate 未加上串關獎勵的 原始 预测派彩金额根据 $1投注金额
   * @param FreeBets 免費投注 FreeBetData數組
   * @param IsMinusOdds 是負數盤
   * @param RealBetAmountRate 真實投注金額比例 根据 $1投注金额(目前只有負數盤使用)
   * @param ExtraInfo 額外配置，投注時使用(動態字段)
   */
  constructor(
              MinAmount,
              MaxAmount,
              EstimatedPayoutRate,
              ComboType = 0,
              ComboCount = 0,
              vendor = 'im',
              HasComboBonus = false,
              ComboBonusPercentage = 0,
              OriginEstimatedPayoutRate = 0,
              FreeBets = [],
              IsMinusOdds = false,
              RealBetAmountRate = 1,
              ExtraInfo = {},
              )
  {
    let ComboTypeName = '';
    if (vendor === 'im') {
      ComboTypeName = IMComboTypeNames[ComboType];
    }

    if (vendor === 'bti') {
      if (ComboType === 'Combo') {
        const selectionCount = ExtraInfo.bet.selectionsMapped.length;
        ComboTypeName = (BTIComboTypeNames[ComboType]).replace('N',selectionCount);
      } else if(ComboType.lastIndexOf('System', 0) === 0) {
        const fromIndex = ComboType.indexOf('from');
        const x = ComboType.substr(6,fromIndex-6);
        const y = ComboType.substr(fromIndex+4);
        ComboTypeName = (BTIComboTypeNames['SystemXfromY']).replace('X',x).replace('Y',y);
      } else {
        ComboTypeName = BTIComboTypeNames[ComboType];
      }

      //需要處理ew投注，暫時不使用這個，收到的時候把注數變成一半
      if (ExtraInfo.isEW) {
        ComboCount = new Decimal(item.numberOfBets).dividedToIntegerBy(2).toNumber();
      }
    }

    if (vendor === 'saba') {
      if (ComboType) {
        ComboTypeName = SABAComboTypeNames[ComboType];
        //處理N串1 (N>8)
        if (!ComboTypeName && (ComboType.lastIndexOf('Fold', 0) === 0)) {
          let xNumber = ComboType.replace('Fold', '');
          let nName = SABAComboTypeNames['FoldN'];
          ComboTypeName = nName.replace('N', xNumber);
        }
      }
    }

    Object.assign(this, {
      MinAmount,
      MaxAmount,
      EstimatedPayoutRate,
      ComboType,
      ComboTypeName, //額外提供：串關類型中文名
      ComboCount,
      vendor,
      HasComboBonus,
      ComboBonusPercentage,
      OriginEstimatedPayoutRate,
      FreeBets,
      IsMinusOdds,
      RealBetAmountRate,
      ExtraInfo,
    });
  }

  toBTIBets(betAmount, pickedfreeBetToken = null) {
    const thisBet = this.ExtraInfo.bet;

    //處理負賠率，需要修改投注金額
    if(this.IsMinusOdds && thisBet.type === 'Single') {
      const thisOdds = new Decimal(thisBet.displayOdds);
      if (thisOdds.isNegative()) { //負數盤
        const realBetRate = thisOdds.abs(); //賠率取絕對值 就是實際投注金額比例
        betAmount = new Decimal(betAmount).mul(realBetRate).toNumber();
      }
    } else {
      betAmount = new Decimal(betAmount).toNumber();
    }

    //處理freebet
    let selectedFreebet = null
    let usedFreeBetAmount = 0;
    if (pickedfreeBetToken && thisBet.freeBets) {
      const selectedFreebets = (thisBet.freeBets &&thisBet.freeBets.length > 0)
        ? thisBet.freeBets.filter(fb => fb.freeBetToken === pickedfreeBetToken) : [];
      if (selectedFreebets && selectedFreebets.length > 0) {
        selectedFreebet = selectedFreebets[0];
        //默認盡量用光
        if (new Decimal(betAmount).greaterThanOrEqualTo(selectedFreebet.freeBetAmount)) {
          usedFreeBetAmount = new Decimal(selectedFreebet.freeBetAmount).toNumber();
        } else {
          usedFreeBetAmount = betAmount;
        }
      }
    }

    const deciamlRoundingMapping = {
      "Floor": 3, //ROUND_FLOOR
      "Round": 4, //ROUND_HALF_UP = 四捨五入
      "Ceiling": 2, //ROUND_CEIL
    }

    const hasComboBonus = !!thisBet.comboBonusPercentage && !!thisBet.trueOddsComboBonusIncluded;
    const realOdds = hasComboBonus ? thisBet.trueOddsComboBonusIncluded : thisBet.trueOdds;

    const deciamlRounding = deciamlRoundingMapping[this.ExtraInfo.returnRoundingMode];
    const realBet = new Decimal(betAmount).sub(usedFreeBetAmount).toNumber();
    const realFreeBet = new Decimal(usedFreeBetAmount).toNumber();
    const realOddsForFreeBet = new Decimal(realOdds).sub(1).toNumber();
    //可能返回 = 實際投注金額*(歐洲盤)賠率 + 免費投注金額*((歐洲盤)賠率-1) 因為免費投注，如果贏了，不會返本金，
    const realPotentialReturns = new Decimal(realBet).mul(realOdds).add(new Decimal(realFreeBet).mul(realOddsForFreeBet)).toNumber();
    const potentialReturns = new Decimal(realPotentialReturns).toDecimalPlaces(2,deciamlRounding).toNumber();  //小數兩位，最後需要轉成數字格式

    //需要處理ew投注，暫時不使用這個，收到的時候把注數變成一半
    if (thisBet.isEW) {
      thisBet.numberOfBets = new Decimal(thisBet.numberOfBets).dividedToIntegerBy(2).toNumber();
    }

    let returnObj = {
      type: thisBet.type,
      selectionsMapped: thisBet.selectionsMapped,
      displayOdds: thisBet.displayOdds,
      trueOdds: thisBet.trueOdds,
      numberOfBets: thisBet.numberOfBets,
      stake: betAmount,
      potentialReturns: potentialReturns
    }

    if (hasComboBonus) {
      returnObj.comboBonusPercentage = thisBet.comboBonusPercentage;
      returnObj.trueOddsComboBonusIncluded = thisBet.trueOddsComboBonusIncluded;
    }

    if (selectedFreebet) {
      returnObj.freeBet = {
        freeBetToken: pickedfreeBetToken,
        freeBetAmount: usedFreeBetAmount,
      }
    }

    return [
      returnObj
    ];
  }

  static clone(srcData) {
    return new BetSettingData(
      srcData.MinAmount,
      srcData.MaxAmount,
      srcData.EstimatedPayoutRate,
      srcData.ComboType,
      srcData.ComboCount,
      srcData.vendor,
      srcData.HasComboBonus,
      srcData.ComboBonusPercentage,
      srcData.OriginEstimatedPayoutRate,
      srcData.FreeBets,
      srcData.IsMinusOdds,
      srcData.RealBetAmountRate,
      srcData.ExtraInfo,
    )
  }
}
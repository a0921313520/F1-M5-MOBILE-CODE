//賠率數據
import {Decimal} from "decimal.js";
import {IMOddsType} from "../im/IMConsts";

export default class OddsData {
  /**
   * @param OddsType 賠率類型
   * @param OddsValues 在IM是賠率水位，object， A->G 代表不同水位的賠率，會員會固定一組水位，可以用GetMemberByToken这支API来索取会员目前的水位组是哪个；在BTI這個是單純的一個賠率值(DisplayOdds)
   */
  constructor(
              OddsType,
              OddsValues,
              )
  {
    Object.assign(this, {
      OddsType,
      OddsValues,
    });
  }

  //先不用這個，轉換馬來和印尼盤口會有除法耗損問題
  static transformOddsIM(from = IMOddsType.HK, to = IMOddsType.EU, oddsVal) {
    let newOddsVal = oddsVal;
    if (from === to) {
      return newOddsVal;
    }

    const thisDeciaml = Decimal.clone({ rounding: 3 }) //無條件捨去

    let decimalVal = new thisDeciaml(newOddsVal);
    let minusOne = new thisDeciaml(-1);

    //香港盤不含本金 歐洲盤含本金
    //当香港盘赔率<=1时，马来盘赔率=香港盘赔率
    //当香港盘赔率>1是，马来盘赔率=-1/香港盘赔率
    //当香港盘赔率<1时，印尼盘赔率=-1/香港盘赔率
    //当香港盘赔率>=1是，印尼盘赔率=香港盘赔率

    //統一轉為香港盤
    if (from === IMOddsType.EU) {
      decimalVal = decimalVal.sub(1);
    } else if (from === IMOddsType.MY) {
      if (decimalVal.isNegative()) {
        decimalVal = minusOne.div(decimalVal);
      }
    } else if (from === IMOddsType.ID) {
      if (decimalVal.isNegative()) {
        decimalVal = minusOne.div(decimalVal);
      }
    }

    if (to === IMOddsType.HK) {
      decimalVal = new Decimal(decimalVal.toFixed(2));
    } else if (to === IMOddsType.EU) {
      decimalVal = new Decimal(decimalVal.add(1).toFixed(2));
    } else if (to === IMOddsType.MY) {
      if (decimalVal.greaterThan(1)) {
        decimalVal = new Decimal(minusOne.div(decimalVal).toFixed(2));
      } else {
        decimalVal = new Decimal(decimalVal.toFixed(2));
      }
    } else if (to === IMOddsType.ID) {
      if (decimalVal.lessThan(1)) {
        decimalVal = new Decimal(minusOne.div(decimalVal).toFixed(2));
      } else {
        decimalVal = new Decimal(decimalVal.toFixed(2));
      }
    }

    newOddsVal = decimalVal.toNumber();

    return newOddsVal;
  }
}
//注單數據
import WagerItemData from "./WagerItemData";
import {
  IMComboTypeNames,
  IMOddsTypeName, IMWagerCancelReasonName, IMWagerCancelStatusName,
  IMWagerConfirmStatusName,
  IMWagerStatusName
} from "../im/IMConsts";
import {
  BTIBetTypeNames,
  BTIComboTypeNames,
  BTIPeriodMapping,
  BTIWagerOddsTypeName,
  BTIWagerOddsTypeToNumber,
  BTIWagerStatusName
} from "../bti/BTIConsts";
import {VendorConfigs, VendorMarketNames, VendorMarkets, VendorPeriodName, OddsType, CashOutStatusType} from "./VendorConsts";
import {Decimal} from "decimal.js";
import moment from "moment";
import i18n from '../vendori18n';
import {
  SABABetTypeNames,
  SABAComboTypeNames,
  SABAOddsTypeName,
  SABAPeriodMapping,
  SABAWagerStatusName
} from "../saba/SABAConsts";
import EventData from "./EventData";

export default class WagerData {
  /**
   * @param WagerId 注單ID
   * @param CreateTime 投注创建的日期和时间
   * @param SettleDateTime 結算日期時間
   * @param MemberCode 用户名
   * @param BetAmount 会员提交的投注金额
   * @param WinLossAmount 輸贏金額
   * @param ComboBonusWinningsAmount 串關獎勵額外盈利金額
   * @param OddsType 賠率類型
   * @param OddsTypeName 賠率類型中文
   * @param WagerType 注單類型 1單注 2串關
   * @param Platform 投注平台
   * @param WagerStatus 注單狀態 IM 1待定 2確認 3拒絕 4取消 bti是英文
   * @param WagerStatusName 注單狀態中文
   * @param SettleStatus 是否已結算 0未結算 1已結算
   * @param ResettleStatus 是否重新結算 0未重新結算 1有重新結算
   * @param ComboCount 串關 注數
   * @param ComboType 串關類型 各平台返回不同
   * @param ComboTypeName 串關類型中文
   * @param Odds 整單賠率，IM只有單注提供，串關不提供整單賠率
   * @param PotentialPayoutAmount 預估可能派彩金額
   * @param CanCashOut 是否可提前兌現 false/true
   * @param CashOutStatus 提前兌現狀態 0未兌現或不可兌現  1已兌現 2進行中 3取消 4新價格
   * @param CashOutPriceId 提前兌現的價格id
   * @param CashOutPrice 提前兌現價格(可能以此價格兌現)
   * @param CashOutAmount 實際提前兌現金額(提前兌現成功後 才有數據)
   * @param HasComboBonus 有串關額外獎勵
   * @param ComboBonusPercentage 串關獎勵百分比(數字) 已經是百分率 不是小數，加個%一起顯示即可
   * @param OriginPotentialPayoutAmount 未加上串關獎勵的 原始 預估可能派彩金額
   * @param FreeBetAmount 免費投注金額
   * @param WagerItems 投注數據，WagerItemData數組，單筆投注只會有一個，串關會有多個
   */
  constructor(
              WagerId,
              CreateTime,
              SettleDateTime,
              MemberCode,
              BetAmount,
              WinLossAmount,
              ComboBonusWinningsAmount,
              OddsType,
              OddsTypeName,
              WagerType,
              Platform,
              WagerStatus,
              WagerStatusName,
              SettleStatus,
              ResettleStatus,
              ComboCount,
              ComboType,
              ComboTypeName,
              Odds,
              PotentialPayoutAmount,
              CanCashOut,
              CashOutStatus,
              CashOutPriceId,
              CashOutPrice,
              CashOutAmount,
              HasComboBonus = false,
              ComboBonusPercentage = 0,
              OriginPotentialPayoutAmount = 0,
              FreeBetAmount = 0,
              WagerItems = [],
              )
  {
    Object.assign(this, {
      WagerId,
      CreateTime,
      SettleDateTime,
      MemberCode,
      BetAmount,
      WinLossAmount,
      ComboBonusWinningsAmount,
      OddsType,
      OddsTypeName,
      WagerType,
      Platform,
      WagerStatus,
      WagerStatusName,
      SettleStatus,
      ResettleStatus,
      ComboCount,
      ComboType,
      ComboTypeName,
      Odds,
      PotentialPayoutAmount,
      CanCashOut,
      CashOutStatus,
      CashOutPriceId,
      CashOutPrice,
      CashOutAmount,
      HasComboBonus,
      ComboBonusPercentage,
      OriginPotentialPayoutAmount,
      FreeBetAmount,
      WagerItems,
    });
  }

  static getSABAEventDateUTC(globalShowTime) {
    let thisEventDate = globalShowTime;
    if (thisEventDate && thisEventDate.indexOf('T') !== -1 && thisEventDate.indexOf('Z') === -1 ) {
      thisEventDate = thisEventDate + 'Z'; //尾端加Z = UTC+0
    }
    return thisEventDate;
  }

  getCreateTimeMoment() {
    return moment(this.CreateTime).utcOffset(VendorConfigs.TIMEZONE);
  }

  //從IM數據生成WagerData數據
  static createFromIMSource(item) {

    const oddsDeciaml = Decimal.clone({ rounding: 3 }) //無條件捨去, im強迫症 需要兩位小數

    let winLossAmount = new oddsDeciaml(item.MemberWinLossAmount).toFixed(2);
    //提前兌現的輸贏要另外算
    if (item.BetTradeStatus == CashOutStatusType.DONE && item.BetTradeBuyBackAmount >0) {
      winLossAmount = new oddsDeciaml(new Decimal(item.BetTradeBuyBackAmount).sub(item.InputtedStakeAmount).toNumber()).toFixed(2);
    }

    return new WagerData(
      item.WagerId,
      item.WagerCreationDateTime,
      item.SettlementDateTime,
      item.MemberCode,
      item.InputtedStakeAmount,
      winLossAmount,
      0, //im沒有串關獎勵
      item.OddsType,
      IMOddsTypeName[item.OddsType],
      item.WagerType,
      item.BettingPlatform,
      item.BetConfirmationStatus,
      IMWagerStatusName[item.BetConfirmationStatus],
      item.BetSettlementStatus,
      item.BetResettled,
      item.NoOfCombination,
      item.ComboSelection,
      IMComboTypeNames[item.ComboSelection],
      item.WagerType === 1 ? (item.WagerItemList && item.WagerItemList[0] ? new oddsDeciaml(item.WagerItemList[0].Odds).toFixed(2) : null) : null,  //IM只有單注有賠率，串關沒有
      new oddsDeciaml(item.PotentialPayout).toFixed(2),
      item.CanSell,
      item.BetTradeStatus,
      item.PricingId,
      item.BuyBackPricing,
      item.BetTradeBuyBackAmount,
      false,
      0,
      0,
      0,
      item.WagerItemList.map(witem => {

        //獲取賽果 1全場 2上半 3下半
        //默認全部空
        let gameResults = {
          0: {home: null, away: null, result: ''},
          1: {home: null, away: null, result: ''},
          2: {home: null, away: null, result: ''},
          3: {home: null, away: null, result: ''}
        };
        //確認有數據才計算
        if (witem.HomeTeamHTScore !== null && witem.HomeTeamFTScore !== null
          && witem.AwayTeamHTScore !== null && witem.AwayTeamFTScore !== null) {
          //全場
          gameResults[1].home = witem.HomeTeamFTScore;
          gameResults[1].away = witem.AwayTeamFTScore;
          gameResults[1].result = gameResults[1].home + ' : ' + gameResults[1].away;
          //上半
          gameResults[2].home = witem.HomeTeamHTScore;
          gameResults[2].away = witem.AwayTeamHTScore;
          gameResults[2].result = gameResults[2].home + ' : ' + gameResults[2].away;
          //下半 = 全場-上半
          gameResults[3].home = witem.HomeTeamFTScore - witem.HomeTeamHTScore;
          gameResults[3].away = witem.AwayTeamFTScore - witem.AwayTeamHTScore;
          gameResults[3].result = gameResults[3].home + ' : ' + gameResults[3].away;
        }

        //從EventDatas那邊複製IM處理代碼(數據結構有點不同，做函數比較麻煩，只好複製)

        //IM的大/小 改成 大小 和mockup一致
        if (witem.BetTypeName === i18n.BIG_OR_SMALL) {
          witem.BetTypeName = i18n.BIG_SMALL
        }

        //處理IM的特殊玩法線名 - 第{goalnr}粒入球球队
        let thisBetTypeName = witem.BetTypeName;
        if (thisBetTypeName.indexOf('{') !== -1 && thisBetTypeName.indexOf('}') !== -1) {
          //從下面的selection找能用的替代文字(這到底是什麼神奇結構。。。)
          let childSelectionSpecifiers = []
          //lineItem.WagerSelections.map(s => {
          if (witem.Specifiers && (witem.Specifiers.indexOf('=') !== -1)) {
            if (childSelectionSpecifiers.indexOf(witem.Specifiers) === -1) {
              childSelectionSpecifiers.push(witem.Specifiers);
            }
          }
          //});
          if (childSelectionSpecifiers && childSelectionSpecifiers.length > 0) {
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
          thisBetTypeName = thisBetTypeName.replace('  ', ' ');
        }
        //IM 越南 BetTypeName 上下半場翻譯 和 periodName 不一致，直接取代
        if (thisBetTypeName.indexOf('Hiệp Một') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Hiệp Một', VendorPeriodName[2])
        } else if (thisBetTypeName.indexOf('Hiệp Hai') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Hiệp Hai', VendorPeriodName[3])
        }
        //IM越南BetTypeName翻譯更換
        //雙重機會
        if ([8, 56, 57, 58, 59].indexOf(witem.BetTypeId) !== -1 && thisBetTypeName.indexOf('Nhân Đôi Cơ Hội') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Nhân Đôi Cơ Hội', 'Cơ Hội Kép');
        }
        //第x球进球时分 (间隔)
        if (witem.BetTypeId === 47 && thisBetTypeName.indexOf('Phút (Phạm Vi) Ghi Bàn') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Phút (Phạm Vi) Ghi Bàn', 'Phút Ghi Bàn');
        }
        //全場第x球 & 1x2
        if (witem.BetTypeId === 55 && thisBetTypeName.indexOf('Bàn Thắng #') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Bàn Thắng #', 'Bàn Số #');
        }
        //全場波膽 多重投注
        if (witem.BetTypeId === 62 && thisBetTypeName.indexOf('Đa Tỷ Số Chính Xác') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Đa Tỷ Số Chính Xác', 'Đa Cược Tỷ Số Chính Xác');
        }
        //足球 主/客隊大小(160,161 有改過，在excel表原本是31,32), 籃球 主/客隊大小(93,94)
        if ([93, 94, 160, 161].indexOf(witem.BetTypeId) !== -1 && thisBetTypeName.indexOf('Trên/Dưới Của Đội') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Trên/Dưới Của Đội', 'Trên/Dưới');
        }
        //第x粒入球球隊(現在是 159 之前號碼是 37)
        if (witem.BetTypeId === 159) {
          const regex = /Đội Ghi ([0-9]{1,2}) Bàn Thắng/gm;
          const matches = EventData.findAllMatches(regex, thisBetTypeName);
          if (matches && matches[0] && matches[0].length === 2) { //[array[2]] 結果會是兩層array，內層的[1]才是數字
            thisBetTypeName = thisBetTypeName.replace(regex, 'Đội Ghi Bàn Số ' + matches[0][1]);
          }
        }

        //籃球 哪一隊首先獲得x分
        if (witem.BetTypeId === 81 && thisBetTypeName.indexOf('Đội Nào Dạt Tới Diểm') !== -1) {
          thisBetTypeName = thisBetTypeName.replace('Đội Nào Dạt Tới Diểm', 'Đội Đạt Điểm');
        }

        //全場更換為全大寫
        // let thisPeriodName = lineItem.PeriodName;
        // if (thisPeriodName === 'Cả trận') {
        //   thisPeriodName = 'Cả Trận';
        // }


        let thisSelectionName = witem.SelectionName;

        //如果有兩個空白，取代成一個
        if (thisSelectionName.indexOf('  ') !== -1) {
          thisSelectionName = thisSelectionName.replace('  ', ' ');
        }

        //處理IM的特殊投注選項名
        if (witem.Specifiers) {
          let specifiersArr = []
          if (witem.Specifiers.indexOf('&') !== -1) {
            specifiersArr = witem.Specifiers.split('&');
          } else {
            specifiersArr = [witem.Specifiers];
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

        let thisHandiCap = witem.Handicap;

        //處理讓球
        if (witem.BetTypeId === 1 && thisHandiCap !== null) {
          let thisHandicapDecimal = new Decimal(thisHandiCap);
          //注單不需要處理主場x-1 api返回的就是對的
          // if (witem.BetTypeSelectionId === 1) { //主場
          //   thisHandicapDecimal = thisHandicapDecimal.mul(-1);  //主場先乘-1
          // }
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
              thisHandiCap = '+' + thisHandicapDecimal.toNumber();
            }
            if (thisHandicapDecimal.lessThan(0)) {
              thisHandiCap = '-' + thisHandicapDecimal.abs().toNumber();
            }
          }
        }

        //處理大小
        if (witem.BetTypeId === 2 && thisHandiCap !== null) {
          let thisHandicapDecimal = new Decimal(thisHandiCap);
          //如果是0.25或0.75，
          if (thisHandicapDecimal.abs().mod(1).eq(0.25) || thisHandicapDecimal.abs().mod(1).eq(0.75)) {
            // 0.75 改成 0.5/1
            if (thisHandicapDecimal.greaterThan(0)) {
              thisHandiCap = thisHandicapDecimal.sub(0.25).toNumber() + '/' + thisHandicapDecimal.add(0.25).toNumber();
            }
          }
        }

        //判斷投注目標球隊，IM利用selectionName判斷
        let targetTeamId = null;
        let targetTeamName = '';
        if ((witem.HomeTeamName && thisSelectionName.indexOf(witem.HomeTeamName) !== -1) //玩法名包含隊名
          || thisSelectionName === i18n.HOME) //或者玩法名就是一個「主」字
        {
          targetTeamId = witem.HomeTeamId;
          targetTeamName = witem.HomeTeamName;
        } else if ((witem.AwayTeamName && thisSelectionName.indexOf(witem.AwayTeamName) !== -1) //玩法名包含隊名
          || thisSelectionName === i18n.AWAY)//或者玩法名就是一個「客」字
        {
          targetTeamId = witem.HomeTeamId;
          targetTeamName = witem.AwayTeamName;
        }

        //注單才有，投注目標改成用OutrightTeamName處理
        if (witem.EventTypeId === 2) {
          targetTeamId = witem.OutrightTeamId;
          targetTeamName = witem.OutrightTeamName;
        }

        //IM 越南 翻譯調整
        //單/雙 文字錯誤
        if (witem.BetTypeId === 5
          && thisBetTypeName
          && (thisBetTypeName.indexOf('Lẻ/Chẵn') !== -1)
          && ([10, 11].indexOf(witem.BetTypeSelectionId) !== -1)
        ) {
          if (thisSelectionName === 'Trên' && witem.BetTypeSelectionId === 10) {
            thisSelectionName = 'Lẻ';
          }
          if (thisSelectionName === 'Dưới' && witem.BetTypeSelectionId === 11) {
            thisSelectionName = 'Chẵn';
          }
        }

        //雙重機會
        if (witem.BetTypeId === 8
          && thisBetTypeName
          && (thisBetTypeName.indexOf('Cơ Hội Kép') !== -1)
          && ([43, 44, 45].indexOf(witem.BetTypeSelectionId) !== -1)
        ) {
          if (thisSelectionName === 'Nhà/Hòa' && witem.BetTypeSelectionId === 43) {
            thisSelectionName = 'Đội Nhà hoặc Hòa';
          }
          if (thisSelectionName === 'Hòa/Khách' && witem.BetTypeSelectionId === 44) {
            thisSelectionName = 'Hòa hoặc Đội Khách';
          }
          if (thisSelectionName === 'Nhà/Khách' && witem.BetTypeSelectionId === 45) {
            thisSelectionName = 'Đội Nhà hoặc Đội Khách';
          }
        }
        //第x球 & 1x2
        if (witem.BetTypeId === 55
          && thisBetTypeName
          && (thisBetTypeName.indexOf('Bàn Số #') !== -1)
          && ([186, 187, 188, 189, 190, 191, 192].indexOf(witem.BetTypeSelectionId) !== -1)
        ) {
          if (thisSelectionName.indexOf('bàn thắng &') !== -1) {
            thisSelectionName = thisSelectionName.replace('bàn thắng &', 'bàn số');
          }
        }
        //雙重機會 & 雙方球隊皆進球
        if ([56, 57, 58].indexOf(witem.BetTypeId) !== -1
          && thisBetTypeName
          && (thisBetTypeName.indexOf('Cả Hai Đội Ghi Bà') !== -1) //最後n不要 有幾個玩法 給到大寫
          && (witem.BetTypeSelectionId >= 193 && witem.BetTypeSelectionId <= 210)
        ) {
          //全大寫 + 把 "/" 換成 hoặc
          thisSelectionName = EventData.getAllFirstCharToUpperCase(thisSelectionName);
          if (thisSelectionName.indexOf(' / ') !== -1) {
            thisSelectionName = thisSelectionName.replace(' / ', ' hoặc ')
          }
        }
        //雙重機會 & 大小
        if (witem.BetTypeId === 59
          && thisBetTypeName
          && (thisBetTypeName.indexOf('Trên/Dưới') !== -1)
          && ([211, 212, 213, 241, 215, 216].indexOf(witem.BetTypeSelectionId) !== -1)
        ) {
          //全大寫 + 把 "/" 換成 hoặc
          thisSelectionName = EventData.getAllFirstCharToUpperCase(thisSelectionName);
          if (thisSelectionName.indexOf(' / ') !== -1) {
            thisSelectionName = thisSelectionName.replace(' / ', ' hoặc ')
          }
        }
        //半場/全場 & 大小/總進球
        if ([63, 64, 65].indexOf(witem.BetTypeId) !== -1
          && thisBetTypeName
          && (thisBetTypeName.indexOf('Nửa Trận/Hết Trận') !== -1)
          && (witem.BetTypeSelectionId >= 238 && witem.BetTypeSelectionId <= 309)
        ) {
          //全大寫 + 把 "/" 換成 hoặc
          thisSelectionName = EventData.getAllFirstCharToUpperCase(thisSelectionName);
          if (thisSelectionName.indexOf(' / ') !== -1) {
            thisSelectionName = thisSelectionName.replace(' / ', ' hoặc ')
          }
        }

        //處理投注記錄handicap多餘展示問題
        if ((thisHandiCap === 0 || thisHandiCap === '0') //值為0
          && [1,2,160,161].indexOf(witem.BetTypeId) === -1 //且不是1,2,160,161
          && witem.BetTypeName.indexOf(i18n.BIG_OR_SMALL) === -1 //且名稱不能有 大/小 , 大小 或 讓球 等文字
          && witem.BetTypeName.indexOf(i18n.BIG_SMALL) === -1
          && witem.BetTypeName.indexOf(i18n.HANDICAP) === -1
        ) {
          thisHandiCap = null;
        }
        return new WagerItemData(
          witem.WagerItemConfirmationStatus,
          IMWagerStatusName[witem.WagerItemConfirmationStatus],
          witem.WagerItemConfirmationType,
          IMWagerConfirmStatusName[witem.WagerItemConfirmationType],
          witem.WagerItemCancelType,
          IMWagerCancelStatusName[witem.WagerItemCancelType],
          witem.WagerItemCancelReason,
          IMWagerCancelReasonName[witem.WagerItemCancelReason],
          witem.Market,
          VendorMarketNames[witem.Market],
          witem.EventId,
          witem.EventDateTime,
          witem.SportId,
          witem.CompetitionId,
          witem.CompetitionName,
          witem.SourceId,
          witem.Season,
          witem.MatchDay,
          witem.EventGroupTypeId,
          witem.HomeTeamId,
          witem.HomeTeamName,
          witem.AwayTeamId,
          witem.AwayTeamName,
          witem.BetTypeId,
          thisBetTypeName,
          witem.PeriodId,
          VendorPeriodName[witem.PeriodId],
          witem.BetTypeSelectionId,
          thisSelectionName,
          witem.EventTypeId === 2,
          witem.EventOutrightName,
          witem.OutrightTeamId,
          witem.OutrightTeamName,
          new oddsDeciaml(witem.Odds).toFixed(2),
          thisHandiCap,
          witem.HomeTeamHTScore,
          witem.AwayTeamHTScore,
          witem.HomeTeamFTScore,
          witem.AwayTeamFTScore,
          witem.WagerHomeTeamScore,
          witem.WagerAwayTeamScore,
          gameResults[witem.PeriodId].home,
          gameResults[witem.PeriodId].away,
          gameResults[witem.PeriodId].result,
          witem.GroundTypeId,
          targetTeamId,
          targetTeamName,
          false,  //需要另外查
          '',
          '',
          '',
          '',
        )
      })
    )
  }

  //從BTI數據生成WagerData數據
  static createFromBTISource(item) {

    //串關類型轉中文
    let ComboTypeName = '';
    let ComboType = item.type;
    if (ComboType === 'Combo') {
      const selectionCount = item.numberOfSelections;
      ComboTypeName = (BTIComboTypeNames[ComboType]).replace('N',selectionCount);
    } else if(ComboType.lastIndexOf('System', 0) === 0) {
      const fromIndex = ComboType.indexOf('from');
      const x = ComboType.substr(6,fromIndex-6);
      const y = ComboType.substr(fromIndex+4);
      ComboTypeName = (BTIComboTypeNames['SystemXfromY']).replace('X',x).replace('Y',y);
    } else {
      ComboTypeName = BTIComboTypeNames[ComboType];
    }

    //BTI展示盤口類型檢查 (文件有這個字段，但是實際沒返回)
    if (!item.displayOddsStyle) {
      item.displayOddsStyle = 'notset'; //沒有返回配置為空

      //嘗試用賠率和金額去判斷盤口
      if (item.displayOdds && (ComboType === 'Single')) { //bti串關不會有displayOdds，下面的selection也不拿來推算盤口
        const thisOdds = new Decimal(item.displayOdds);
        if (thisOdds.isNegative()) {
          if (thisOdds.greaterThanOrEqualTo(-1)) {
            item.displayOddsStyle = 'Malaysian'; //馬來盤，介於0和-1之間 包含-1
          } else if (thisOdds.lessThan(-1)) {
            item.displayOddsStyle = 'Indonesian'; //印尼盤，小於-1
          }
        } else {
          //投注金額*賠率
          const stakeMultifyOdds = new Deciaml(thisOdds.mul(item.totalStake).toDecimalPlaces(2,3).toFixed(2)); //rounding:3 無條件捨去
          if (stakeMultifyOdds.equals(item.amountToWin)) { //香港盤 = 盈利
            item.displayOddsStyle = 'HongKong';
          } else if (stakeMultifyOdds.equals(item.potentialReturns)) {// 歐洲盤 = 本金+盈利
            item.displayOddsStyle = 'Decimal';
          }
        }
      }
    }

    //注單數據只有一個 comboBonusPercentage 要自己去反推其他字段(文件有其他字段，但是實際沒返回)
    const hasComboBonus = !!item.comboBonusPercentage;
    //console.log('hasComboBonus',item.comboBonusPercentage,Deciaml.isDecimal(item.comboBonusPercentage));
    const comboBonusMultiplier = hasComboBonus ? new Deciaml(item.comboBonusPercentage).dividedBy(100).add(1) : 1;
    const realDisplayOdds = hasComboBonus ? new Decimal(item.displayOdds).mul(comboBonusMultiplier).toDecimalPlaces(2,3).toFixed(2) : item.displayOdds; //rounding:3 無條件捨去
    const realPotentialReturns = hasComboBonus
      //賠率x串關獎勵(1.xx)x投注金額 = 預期返獎
      ? (
        (item.displayOddsStyle === 'HongKong') //香港盤賠率要加1 本金
          ? new Deciaml(new Decimal(item.displayOdds).add(1).mul(comboBonusMultiplier).mul(item.totalStake).toDecimalPlaces(2,3).toFixed(2)).toNumber() //rounding:3 無條件捨去
          : new Deciaml(new Decimal(item.displayOdds).mul(comboBonusMultiplier).mul(item.totalStake).toDecimalPlaces(2,3).toFixed(2)).toNumber() //rounding:3 無條件捨去
      )
      : item.potentialReturns;
    const comboBonusWinningsAmount = hasComboBonus
      ? (
        (item.status === 'Settled')
        ? item.comboBonusWinningsAmount
        : new Decimal(realPotentialReturns).sub(item.potentialReturns).toDecimalPlaces(2,3).toFixed(2) //未結算使用 含串關獎勵的預計獎金-不含串關獎勵的預計獎金 //rounding:3 無條件捨去
      )
      : 0;

    //處理win/lose amount
    let thisWinLoseAmount = 0;
    if (item.returns !== undefined && item.returns !== null) {
      //console.log('======item.returns',item.returns);
      thisWinLoseAmount = new Decimal(new Decimal(item.returns).sub(item.totalStake).toDecimalPlaces(2,3).toFixed(2)).toNumber(); //輸贏= 返還-本金 //rounding:3 無條件捨去
    }

    //未結算：BTI提前兌現要另外的api去處理
    let canCashOut = false;
    let cashOutStatus = CashOutStatusType.NOTYET;
    let cashOutPriceId = null;
    let cashOutPrice = null;
    let cashOutAmount = null;
    if (item.status === 'Settled' && item.settlementStatus == 'CashOut') {
      cashOutStatus = CashOutStatusType.DONE;
      cashOutAmount = new Decimal(new Decimal(item.returns).toFixed(2)).toNumber();
    }

      return new WagerData(
        item.purchaseId, //BTI注單號改為使用purchaseId
        item.placementDate,
        item.settlementDate,
        null,
        item.totalStake,
        thisWinLoseAmount,
        comboBonusWinningsAmount,
        BTIWagerOddsTypeToNumber[item.displayOddsStyle],
        BTIWagerOddsTypeName[item.displayOddsStyle],
        item.type === 'Single' ? 1 : 2, //注單類型 1單注 2串關
        item.sourceDeviceType,
        item.settlementStatus,
        BTIWagerStatusName[item.settlementStatus],
        item.status === 'Settled' ? 1 : 0, //bti剛好反過來，status實際上是 是否已結算，settlementStatus才是真正的狀態
        0,
        item.numberOfBets,
        item.type,
        ComboTypeName,
        realDisplayOdds,
        realPotentialReturns,
        canCashOut,
        cashOutStatus,
        cashOutPriceId,
        cashOutPrice,
        cashOutAmount,
        hasComboBonus,
        hasComboBonus ? item.comboBonusPercentage : 0,
        hasComboBonus ? item.potentialReturns : 0,
        item.freeBetAmount ? item.freeBetAmount : 0,
        item.selections.map(witem => {

          const isOutRightEvent = (witem.eventType === 'Outright');

          //處理市場
          let marketId = VendorMarkets.EARLY;
          if (witem.isLive) {
            marketId = VendorMarkets.RUNNING;
          }
          if (isOutRightEvent) {
            marketId = VendorMarkets.OUTRIGHT;
          }

          //處理時間段
          let periodData = {PeriodId: 0, PeriodName : ''}
          const specialBetTypeName = BTIBetTypeNames[witem.marketId];
          if (specialBetTypeName) {
            periodData = BTIPeriodMapping[witem.marketId];
          }

          //判斷投注目標球隊
          let targetTeamId = null;
          let targetTeamName = '';
          //bti注單沒有participantMapping，只能用selectionName判斷
          if ((witem.homeTeamName && witem.selectionDisplayName.indexOf(witem.homeTeamName) !== -1) //玩法名包含隊名
            || witem.selectionDisplayName === i18n.HOME) //或者玩法名就是一個「主」字
          {
            targetTeamId = null;
            targetTeamName = witem.homeTeamName;
          } else if ((witem.awayTeamName && witem.selectionDisplayName.indexOf(witem.awayTeamName) !== -1) //玩法名包含隊名
            || witem.selectionDisplayName === i18n.AWAY)//或者玩法名就是一個「客」字
          {
            targetTeamId = null;
            targetTeamName = witem.awayTeamName;
          }

          return new WagerItemData(
            witem.settlementStatus,
            BTIWagerStatusName[item.settlementStatus],
            null,
            null,
            item.settlementStatus === 'Cancelled' ? 2 : 1,
            item.settlementStatus === 'Cancelled' ? i18n.BTI.CANCELLED : i18n.BTI.NOT_CANCELLED,
            null,
            null,
            marketId,
            VendorMarketNames[marketId],
            witem.eventId,
            witem.startEventDate,
            parseInt(witem.sportId),
            witem.leagueId,
            witem.leagueName,
            null,
            null,
            null,
            null,
            null,
            witem.homeTeamName,
            null,
            witem.awayTeamName,
            witem.marketId,
            witem.marketDisplayName,
            periodData.PeriodId,
            periodData.PeriodName,
            witem.selectionId,
            witem.selectionDisplayName,
            isOutRightEvent,
            isOutRightEvent ? witem.eventDisplayName : null,
            null,
            null,
            witem.displayOdds,
            witem.points,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            witem.gameScore,
            null,
            targetTeamId,
            targetTeamName,
            false,  //需要另外查
            '',
            '',
            '',
            '',
          )
        }),
      )
  }

  //從SABA數據生成WagerData數據
  static createFromSABASource(item) {

    const isComboBet = !!item.comboType;

    //串關類型轉中文
    //9-Folds (10 Bets)
    //Trebles (4 Bets)
    //Yankee (11 Bets)

    //後面串關類型改成返回中文了
    //二串一 (3 个注单)

    let thisComboTypeName = '';
    let thisComboCount = 0;
    if (isComboBet) {
      //找出第一個(
      const firstParentheses = item.comboType.indexOf('(');
      if (firstParentheses !== -1) {
        let comboInfoArr = item.comboType.split('('); //切開
        let thisComboType = comboInfoArr[0].trim();

        // //處理寫死
        // if (thisComboType === 'Double') {
        //   thisComboType = 'Doubles';
        // } else if (thisComboType === 'Treble') {
        //   thisComboType = 'Trebles';
        // }
        //
        // //處理 N-Folds 轉成 Fold{N}
        // if (thisComboType.indexOf('-') !== -1) {
        //   let foldNumber = thisComboType.split('-')[0];
        //   thisComboType = 'Fold' + foldNumber;
        //   thisComboTypeName = SABAComboTypeNames[thisComboType];
        //   //處理N > 8
        //   if (!thisComboTypeName) {
        //     let nName = SABAComboTypeNames['FoldN'];
        //     thisComboTypeName = nName.replace('N', foldNumber);
        //   }
        // } else {
        //   thisComboTypeName = SABAComboTypeNames[thisComboType];
        // }
        // if (!thisComboTypeName) {
        //   thisComboTypeName = 'unknown';
        // }

        thisComboTypeName = thisComboType;
        thisComboCount =  comboInfoArr[1].split(' ')[0] //空白後切開 就是注數
      }
    }

    if (isComboBet && item.isLucky) {
      thisComboTypeName = thisComboTypeName + ' (' + i18n.SABA.ISLUCKY + ')'
    }

    let wagerItems = [];
    if (isComboBet && item.parlayInfo) {
      wagerItems = item.parlayInfo;
    } else {
      wagerItems = [
        item
      ]
    }

    //SABA要自己計算 預計贏取金額
    //只有單投需要處理 因為串投是歐洲盤，只要乘賠率就可以
    let EstimatedPayoutRate = item.price; //默認用賠率直接乘
    if(!isComboBet)  {
      const isOutRightEvent = (wagerItems[0].betType == 10);
      if (!isOutRightEvent //猜冠軍固定歐洲盤，不用計算
        && item.oddsType != OddsType.EU  //本身就是歐洲盤 也不用算
      ) {
        //香港盤不含本金 歐洲盤含本金
        //当香港盘赔率<=1时，马来盘赔率=香港盘赔率
        //当香港盘赔率>1时，马来盘赔率=-1/香港盘赔率
        //当香港盘赔率<1时，印尼盘赔率=-1/香港盘赔率
        //当香港盘赔率>=1时，印尼盘赔率=香港盘赔率

        const thisOdds = new Decimal(item.price);
        EstimatedPayoutRate = thisOdds.abs().add(1).toNumber(); //不管是不是負數盤，都這是這樣算，加一個本金
                                                                //(負數盤是要多算一個 實際投注金額 但是saba官方投注記錄也沒有列上，所以不處理，賭狗應該都會懂)
      }
    }

    return new WagerData(
      item.transId,
      item.transTime + 'Z', //有T無Z 補上 成為UTC時間
      item.transTime + 'Z', //有T無Z 補上 成為UTC時間
      item.memberId,
      item.stake,
      new Decimal(item.settlementPrice).toFixed(2),
      0,
      item.oddsType,
      SABAOddsTypeName[item.oddsType],
      (item.comboType !== undefined && item.comboType !== null) ? 2 : 1, //注單類型 1單注 2串關
      null,
      item.status, //注单状态  half won / half lose / won / lose / void / running / draw / reject / refund / waiting
      SABAWagerStatusName[item.status],
      ['running','waiting'].indexOf(item.status) === -1 ? 1 : 0,
      item.resettlesInfo ? 1 : 0,
      thisComboCount,
      item.comboType,
      thisComboTypeName,
      item.price,
      new Decimal(EstimatedPayoutRate).mul(item.stake).toFixed(2),
      item.cashoutEnabled,
      item.alreadyCashout ? CashOutStatusType.DONE : CashOutStatusType.NOTYET,
      null,
      item.alreadyCashout ? item.cashoutPrice : null,
      item.alreadyCashout ? item.cashoutPrice : null,
      false,
      0,
      0,
      0,
      wagerItems.map(witem => {

        const isOutRightEvent = (witem.betType == 10);

        //市場無法判斷 不處理

        //處理特殊玩法 名稱統一(讓分 大小)
        let thisBetTypeName = witem.betTypeName;
        let periodData = {PeriodId: 0, PeriodName : ''}
        const specialBetTypeName = SABABetTypeNames[witem.betType];
        if (specialBetTypeName) {
          thisBetTypeName = specialBetTypeName;
          periodData = SABAPeriodMapping[witem.betType];
        }

        //判斷投注目標球隊，SABA利用selectionName判斷
        let targetTeamId = null;
        let targetTeamName = '';
        if ((witem.homeTeamName && witem.keyName.indexOf(witem.homeTeamName) !== -1) //玩法名包含隊名
          || witem.keyName === i18n.HOME //或者玩法名就是一個「主」字
          || witem.key == 'h' //或者玩法Key = home
        ) {
          targetTeamId = witem.homeTeamId;
          targetTeamName = witem.homeTeamName;
        } else if ((witem.awayTeamName && witem.keyName.indexOf(witem.awayTeamName) !== -1) //玩法名包含隊名
          || witem.keyName === i18n.AWAY //或者玩法名就是一個「客」字
          || witem.key == 'a' //或者玩法Key = away
        ) {
          targetTeamId = witem.awayTeamId;
          targetTeamName = witem.awayTeamName;
        }


        return new WagerItemData(
          witem.status,
          SABAWagerStatusName[witem.status],
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          witem.eventId,
          WagerData.getSABAEventDateUTC(witem.kickOffTime),
          parseInt(witem.sportType),
          witem.leagueId,
          witem.leagueName,
          null,
          null,
          null,
          null,
          witem.homeTeamId,
          witem.homeTeamName,
          witem.awayTeamId,
          witem.awayTeamName,
          witem.betType,
          thisBetTypeName,
          periodData.PeriodId,
          periodData.PeriodName,
          witem.key,
          witem.keyName,
          isOutRightEvent,
          isOutRightEvent ? witem.leagueName : null,
          null,
          null,
          witem.price,
          witem.point,
          null,
          null,
          null,
          null,
          witem.homeScore,
          witem.awayScore,
          null,
          null,
          null,
          null,
          targetTeamId,
          targetTeamName,
          false, //和bti一樣，另外查
          '',
          '',
          '',
          '',
          isComboBet ? false : witem.isLucky, //只有 幸運串關 生成的單注(實際注單也看起來像單注) 才要展示IsLucky
        )
      }),
    )
  }

  static clone(srcData) {
    return new WagerData(
      srcData.WagerId,
      srcData.CreateTime,
      srcData.SettleDateTime,
      srcData.MemberCode,
      srcData.BetAmount,
      srcData.WinLossAmount,
      srcData.ComboBonusWinningsAmount,
      srcData.OddsType,
      srcData.OddsTypeName,
      srcData.WagerType,
      srcData.Platform,
      srcData.WagerStatus,
      srcData.WagerStatusName,
      srcData.SettleStatus,
      srcData.ResettleStatus,
      srcData.ComboCount,
      srcData.ComboType,
      srcData.ComboTypeName,
      srcData.Odds,
      srcData.PotentialPayoutAmount,
      srcData.CanCashOut,
      srcData.CashOutStatus,
      srcData.CashOutPriceId,
      srcData.CashOutPrice,
      srcData.CashOutAmount,
      srcData.HasComboBonus,
      srcData.ComboBonusPercentage,
      srcData.OriginPotentialPayoutAmount,
      srcData.FreeBetAmount,
      srcData.WagerItems ? srcData.WagerItems.map(item => WagerItemData.clone(item)) : [],
    )
  }
}

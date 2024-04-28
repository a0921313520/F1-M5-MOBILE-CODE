import {SelectionChangeType, SelectionStatusType, SpecialUpdateType} from "./VendorConsts";
import {Decimal} from 'decimal.js';
import SpecialUpdateData from "./SpecialUpdateData";
import EventData from "./EventData";
import SelectionData from "./SelectionData";

//投注選項變化
export default class SelectionChangeData {
  /**
   * @param SelectionId 投注選項ID
   * @param OldValue 舊數據
   * @param NewValue 新數據
   * @param ExtraInfo 額外數據(原始變更依據)
   * @param SpecialUpdates 特定數據變化 SpecialUpdateData 數組，只有在變化類型是 2修改 才會提供
   */
  constructor(
              SelectionId,
              OldValue = null,
              NewValue = null,
              ExtraInfo = null,
              SpecialUpdates = null,
              )
  {
    if (OldValue && typeof OldValue === 'object') {
      OldValue = SelectionData.clone(OldValue); //深拷貝，不使用ref 也不使用JSON方式，因為會遺失class定義
    }
    if (NewValue && typeof NewValue === 'object') {
      NewValue = SelectionData.clone(NewValue); //深拷貝，不使用ref 也不使用JSON方式，因為會遺失class定義
    }

    if (ExtraInfo && typeof ExtraInfo === 'object') {
      ExtraInfo = JSON.parse(JSON.stringify(ExtraInfo)); //深拷貝，不使用ref
    }

    let ChangeType = SelectionChangeType.Update;
    if(!NewValue || typeof NewValue !== 'object' || (NewValue.SelectionStatus !== SelectionStatusType.OK)) {
      ChangeType = SelectionChangeType.UnAvailable;
    }

    Object.assign(this, {
      SelectionId,
      ChangeType,
      OldValue,
      NewValue,
      SpecialUpdates,
      ExtraInfo,
    });

    //判斷特定數據變化
    if (this.ChangeType === SelectionChangeType.Update) {
      let specialUpdates = [];

      if(!OldValue) {
        console.log('SelectionChangeData for UPDATE Has Empty OldValue??',SelectionId);
        return;
      }
      if(!NewValue) {
        console.log('SelectionChangeData for UPDATE Has Empty NewValue??',SelectionId);
        return;
      }

      //HomeGoal: 2,  //主場進球
      if (OldValue.HomeScore !== NewValue.HomeScore) {
        specialUpdates.push(new SpecialUpdateData(
          SpecialUpdateType.HomeGoal,
          OldValue.HomeScore,
          NewValue.HomeScore
        ))
      }

      //AwayGoal: 3,  //客場進球
      if (OldValue.AwayScore !== NewValue.AwayScore) {
        specialUpdates.push(new SpecialUpdateData(
          SpecialUpdateType.AwayGoal,
          OldValue.AwayScore,
          NewValue.AwayScore
        ))
      }

      //OddsUp: 10, //賠率上升
      //OddsDown: 11, //賠率下降
      const OddsOld = new Decimal(OldValue.Odds);
      const OddsNew = new Decimal(NewValue.Odds);

      //賠率上升
      if (OddsNew.greaterThan(OddsOld)) {
        specialUpdates.push(new SpecialUpdateData(
          SpecialUpdateType.OddsUp,
          OldValue.Odds,
          NewValue.Odds,
          NewValue.LineId,
          NewValue.SelectionId,
        ))

        //賠率下降
      } else if (OddsNew.lessThan(OddsOld)) {
        specialUpdates.push(new SpecialUpdateData(
          SpecialUpdateType.OddsDown,
          OldValue.Odds,
          NewValue.Odds,
          NewValue.LineId,
          NewValue.SelectionId,
        ))
      }

      this.SpecialUpdates = specialUpdates;
    }

  }
}
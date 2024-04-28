import {EventChangeType, SpecialUpdateType} from "./VendorConsts";
import {Decimal} from 'decimal.js';
import SpecialUpdateData from "./SpecialUpdateData";
import EventData from "./EventData";

//比賽數據變化
export default class EventChangeData {
  /**
   * @param EventId 比賽ID
   * @param ChangeType 變化類型 1新增 2修改 3刪除
   * @param OldValue 舊數據
   * @param NewValue 新數據
   * @param ExtraInfo 額外數據(原始變更依據)
   * @param SpecialUpdates 特定數據變化 SpecialUpdateData 數組，只有在變化類型是 2修改 才會提供
   */
  constructor(
              EventId,
              ChangeType,
              OldValue = null,
              NewValue = null,
              ExtraInfo = null,
              SpecialUpdates = null,
              )
  {
    if (OldValue && typeof OldValue === 'object') {
      OldValue = EventData.clone(OldValue); //深拷貝，不使用ref 也不使用JSON方式，因為會遺失class定義
    }
    if (NewValue && typeof NewValue === 'object') {
      NewValue = EventData.clone(NewValue); //深拷貝，不使用ref 也不使用JSON方式，因為會遺失class定義
    }

    if (ExtraInfo && typeof ExtraInfo === 'object') {
      ExtraInfo = JSON.parse(JSON.stringify(ExtraInfo)); //深拷貝，不使用ref
    }

    Object.assign(this, {
      EventId,
      ChangeType,
      OldValue,
      NewValue,
      SpecialUpdates,
      ExtraInfo,
    });

    //判斷特定數據變化
    if (this.ChangeType === EventChangeType.Update) {
      let specialUpdates = [];

      if(!OldValue) {
        console.log('EventChangeData for UPDATE Has Empty OldValue??',EventId);
        return;
      }
      if(!NewValue) {
        console.log('EventChangeData for UPDATE Has Empty NewValue??',EventId);
        return;
      }

      //EventStart: 1, //比賽開始
      if ((OldValue.RBTime == null) && (NewValue.RBTime)) {
        specialUpdates.push(new SpecialUpdateData(
          SpecialUpdateType.EventStart,
          OldValue.RBTime,
          NewValue.RBTime
        ))
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

      //HomeCorner: 4, //主場角球
      if (OldValue.HomeCorner !== NewValue.HomeCorner) {
        specialUpdates.push(new SpecialUpdateData(
          SpecialUpdateType.HomeCorner,
          OldValue.HomeCorner,
          NewValue.HomeCorner
        ))
      }
      //   AwayCorner: 5, //客場角球
      if (OldValue.AwayCorner !== NewValue.AwayCorner) {
        specialUpdates.push(new SpecialUpdateData(
          SpecialUpdateType.AwayCorner,
          OldValue.AwayCorner,
          NewValue.AwayCorner
        ))
      }

      //HomeRedCard: 6, //主場紅牌
      if (OldValue.HomeRedCard !== NewValue.HomeRedCard) {
        specialUpdates.push(new SpecialUpdateData(
          SpecialUpdateType.HomeRedCard,
          OldValue.HomeRedCard,
          NewValue.HomeRedCard
        ))
      }

      //AwayRedCard: 7, //客場紅牌
      if (OldValue.AwayRedCard !== NewValue.AwayRedCard) {
        specialUpdates.push(new SpecialUpdateData(
          SpecialUpdateType.AwayRedCard,
          OldValue.AwayRedCard,
          NewValue.AwayRedCard
        ))
      }

      //LineNew: 8, //增加玩法
      //LineDelete: 9, //移除玩法
      //OddsUp: 10, //賠率上升
      //OddsDown: 11, //賠率下降
      let newLines = [];
      let deleteLines = [];
      NewValue.Lines.map(lineInNew => {
        const newLineExistInOldLines = OldValue.Lines.filter(lineInOld => {
          return lineInNew.LineId === lineInOld.LineId;
        })
        //新玩法
        if (!newLineExistInOldLines || newLineExistInOldLines.length <=0) {
          specialUpdates.push(new SpecialUpdateData(
            SpecialUpdateType.LineNew,
            null,
            lineInNew,
            lineInNew.LineId,
          ))
        } else {
          //檢查賠率變化
          newLineExistInOldLines.map(lineInOld => {
            lineInOld.Selections.map(selectionInOld => {
              lineInNew.Selections.map(selectionInNew => {
                if (selectionInOld.SelectionId === selectionInNew.SelectionId) {
                  const OddsOld = new Decimal(selectionInOld.Odds ?? 0);
                  const OddsNew = new Decimal(selectionInNew.Odds ?? 0);

                  //賠率上升
                  if (OddsNew.greaterThan(OddsOld)) {
                    specialUpdates.push(new SpecialUpdateData(
                      SpecialUpdateType.OddsUp,
                      selectionInOld.Odds,
                      selectionInNew.Odds,
                      lineInNew.LineId,
                      selectionInNew.SelectionId,
                    ))

                    //賠率下降
                  } else if (OddsNew.lessThan(OddsOld)) {
                    specialUpdates.push(new SpecialUpdateData(
                      SpecialUpdateType.OddsDown,
                      selectionInOld.Odds,
                      selectionInNew.Odds,
                      lineInNew.LineId,
                      selectionInNew.SelectionId,
                    ))
                  }
                }
              })
            })
          })
        }
      });

      OldValue.Lines.map(lineInOld => {
        const oldLineExistInNewLines = NewValue.Lines.filter(lineInNew => {
          return lineInNew.LineId === lineInOld.LineId;
        })
        //已移除的玩法
        if (!oldLineExistInNewLines || oldLineExistInNewLines.length <=0) {
          specialUpdates.push(new SpecialUpdateData(
            SpecialUpdateType.LineDelete,
            lineInOld,
            null,
            lineInOld.LineId,
          ))
        }
      });

      this.SpecialUpdates = specialUpdates;
    }

  }
}
import EventData from "./EventData";

//比賽數據差異，用於差異更新
export default class EventDiffData {
  /**
   * @param EventId 比賽ID
   * @param ChangeType 變化類型 1新增 2修改 3刪除 4排序
   * @param DataValue 新數據 如果是刪除，則為空
   */
  constructor(
    EventId,
    ChangeType,
    DataValue = null,
  )
  {
    if (DataValue && typeof DataValue === 'object' && !Array.isArray(DataValue)) {
      DataValue = EventData.clone(DataValue); //深拷貝，不使用ref 也不使用JSON方式，因為會遺失class定義
    }

    Object.assign(this, {
      EventId,
      ChangeType,
      DataValue,
    });
  }
}
//賽事數據  用於 getEventsDetail 獲取多個賽事數據 時 使用
export default class EventInfo {
  /**
   * @param EventId 比賽id
   * @param SportId 體育ID
   * @param IsOutRightEvent 是否為優勝冠軍賽事
   */
  constructor(
              EventId,
              SportId,
              IsOutRightEvent = false,
              )
  {
    Object.assign(this, {
      EventId,
      SportId,
      IsOutRightEvent,
    });
  }
}
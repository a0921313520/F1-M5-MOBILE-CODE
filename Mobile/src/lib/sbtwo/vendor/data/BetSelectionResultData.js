//單個投注結果數據
export default class BetSelectionResultData {
  /**
   * @param EventId 比賽ID
   * @param Odds 投注賠率
   * @param SelectionType 投注選項類型
   */
  constructor(
              EventId,
              Odds,
              SelectionType,
              )
  {
    Object.assign(this, {
      EventId,
      Odds,
      SelectionType,
    });
  }
}
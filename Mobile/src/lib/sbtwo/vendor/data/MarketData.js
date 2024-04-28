//市場項目 計數
export default class MarketData {
  /**
   * @param MarketId 市場id
   * @param MarketName 市場名
   * @param Count 比赛数
   */
  constructor(
              MarketId,
              MarketName,
              Count,
              )
  {
    Object.assign(this, {MarketId, MarketName, Count});
  }
}
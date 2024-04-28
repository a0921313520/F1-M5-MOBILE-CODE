//體育項目 計數

export default class SportData {
  /**
   * @param SportId 体育id
   * @param SportName 体育名
   * @param Count 比赛数
   * @param Markets 按市場計算數量 MarketData數組
   */
  constructor(
              SportId,
              SportName,
              Count,
              Markets = [],
              )
  {
    Object.assign(this, {SportId, SportName, Count, Markets});
  }
}
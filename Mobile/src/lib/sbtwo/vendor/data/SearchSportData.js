//搜尋-體育數據
export default class SearchSportData {
  /**
   * @param SportId 體育ID
   * @param SportName 体育名
   * @param DisplayOrder 展示順序
   * @param Leagues 相關聯賽 SearchLeagueData 數組
   */
  constructor(
              SportId,
              SportName,
              DisplayOrder,
              Leagues,
              )
  {
    Object.assign(this, {
      SportId,
      SportName,
      DisplayOrder,
      Leagues,
    });
  }
}
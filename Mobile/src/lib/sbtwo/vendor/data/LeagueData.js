//聯賽 計數
export default class LeagueData {
  /**
   * @param LeagueId 聯賽id
   * @param LeagueName 聯賽名
   * @param Count 比赛数
   * @param SportId 體育ID
   * @param MarketId 市場ID
   */
  constructor(
              LeagueId,
              LeagueName,
              Count,
              SportId,
              MarketId,
              )
  {
    Object.assign(this, {LeagueId, LeagueName, Count, SportId, MarketId});
  }
}
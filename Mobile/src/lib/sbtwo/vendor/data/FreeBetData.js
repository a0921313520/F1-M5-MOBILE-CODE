//免費投注 數據
export default class FreeBetData {
  /**
   * @param FreeBetType 免費投注類型
   * @param FreeBetToken 免費投注ID
   * @param FreeBetName 免費投注名稱
   * @param FreeBetAmount 免費投注金額
   */
  constructor(
    FreeBetType,
    FreeBetToken,
    FreeBetName,
    FreeBetAmount,
  )
  {
    Object.assign(this, {
      FreeBetType,
      FreeBetToken,
      FreeBetName,
      FreeBetAmount,
    });
  }
}
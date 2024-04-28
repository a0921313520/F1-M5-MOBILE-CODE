//投注結果狀態
export default class BetStatusData {
  /**
   * @param IsSuccess 是否投注成功
   * @param WagerId 注單ID
   * @param FinalWagerStatus 注單最終狀態，數據形態和BetResultData的WagerStatus一樣
   */
  constructor(
              IsSuccess,
              WagerId,
              FinalWagerStatus,
              )
  {
    Object.assign(this, {
      IsSuccess,
      WagerId,
      FinalWagerStatus,
    });
  }
}
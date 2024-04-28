//投注結果
export default class BetResultData {
  /**
   * @param Balance 投注後當前餘額
   * @param WagerId 注單ID
   * @param WagerStatus 注單狀態
   * @param BetStatus 投注狀態
   * @param IsPending 是否尚未投注成功
   * @parms PendingQueryId 查詢投注狀態Id
   * @param ComboType 串關類型 0單注
   * @param EstimatedPayoutFullAmount  預期派彩總金額 包含本金
   * @param BetSelectionResults 投注結果 BetSelectionResultData格式，如果單筆投注是一個實例，串關會是數組
   * @param BetLogJSON 日志數據
   */
  constructor(
              Balance,
              WagerId,
              WagerStatus,
              BetStatus,
              IsPending = false,
              PendingQueryId = null,
              ComboType,
              EstimatedPayoutFullAmount,
              BetSelectionResults = [],
              BetLogJSON,
              )
  {
    Object.assign(this, {
      Balance,
      WagerId,
      WagerStatus,
      BetStatus,
      IsPending,
      PendingQueryId,
      ComboType,
      EstimatedPayoutFullAmount,
      BetSelectionResults,
      BetLogJSON,
    });
  }
}

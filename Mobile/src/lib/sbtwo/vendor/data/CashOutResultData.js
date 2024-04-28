//提前兌現 結果
export default class CashOutResultData {
  /**
   * @param WagerData 提交的注單數據
   * @param IsPending 是否尚未兌現成功 保留欄位，實際無用
   * @param PendingQueryId 查詢兌現狀態Id 保留欄位，實際無用
   * @param LogJSON 日志數據
   */
  constructor(
    WagerData,
    IsPending = false,
    PendingQueryId = null,
    LogJSON,
  )
  {
    Object.assign(this, {
      WagerData,
      IsPending,
      PendingQueryId,
      LogJSON,
    });
  }
}

//輪詢結果
export default class PollingResult {
  /**
   * @param NewData (更新後的)新數據
   * @param Changes 本次變更
   * @param IsFullLoaded 是否已載入全部數據，前端UI判斷用
   * @param extraConfigs
   */
  constructor(
    NewData,
    Changes = [],
    IsFullLoaded = false,
    extraConfigs = {}
  )
  {
    Object.assign(this, {NewData, Changes, IsFullLoaded, extraConfigs});
  }
}

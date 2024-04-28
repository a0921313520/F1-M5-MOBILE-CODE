//投注線(玩法) 分組 數據
export default class LineGroupData {
  /**
   * @param LineGroupId 玩法分組id
   * @param LineGroupName 玩法分組名
   * @param LineCount 玩法數量
   * @param SortNumber 排序
   */
  constructor(
              LineGroupId,
              LineGroupName,
              LineCount,
              SortNumber,
              )
  {
    Object.assign(this, {
      LineGroupId,
      LineGroupName,
      LineCount,
      SortNumber,
    });
  }
}
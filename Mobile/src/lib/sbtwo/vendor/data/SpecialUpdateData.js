//特定數據變化
export default class SpecialUpdateData {
  /**
   * @param UpdateType 特定數據變化類型
   * @param OldValue 舊數據
   * @param NewValue 新數據
   * @param LineId 投注線ID 只有 玩法 或 賠率變化 時 才會提供
   * @param SelectionId 投注選項ID 只有賠率變化時 才會提供
   */
  constructor(
              UpdateType,
              OldValue,
              NewValue,
              LineId,
              SelectionId,
              )
  {
    Object.assign(this, {
      UpdateType,
      OldValue,
      NewValue,
      LineId,
      SelectionId,
    });
  }
}
export const WSAction = {
  ECHO: 'ECHO',  //回聲測試
  SYNC: 'SYNC', //初始同步全部緩存數據，服務器內部使用
  SUB: 'SUB', //訂閱推送
  PUSH_ALL: 'PUSH_ALL', //推送 完整數據
  PUSH_DIFF: 'PUSH_DIFF', //推送 差異數據
  UNSUB: 'UNSUB', // 取消推送訂閱
}

export const WSDataType = {
  SYNC: 'SYNC', //初始同步全部緩存數據，服務器內部使用

  //注意下面這四個的值 對應緩存數據名稱(小寫)
  TRCOUNT: 'trCount', //所有體育種類的Running總計
  COUNT: 'count', //計數
  HOTEVENTS: 'hotEvents', //熱門(推薦)賽事
  EVENTS: 'EVENTS',  //比賽數據
  IMCS_1_1: 'IMCS_1_1',  //IM特例提供 足球早盤全場波膽 緩存
  IMCS_2022_1: 'IMCS_2022_1',  //IM特例提供 世界杯2022 早盤全場波膽 緩存
  WCP2022: 'wcp2022', //世界杯2022數據 特例只在adpater端有效
}

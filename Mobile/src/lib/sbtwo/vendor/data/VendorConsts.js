import i18n from '../vendori18n';

i18n.VendorConfigs.TIMEZONE = parseInt(i18n.VendorConfigs.TIMEZONE); //轉為數字型態，修復在緩存API的node環境下會無法正確轉換時區時間的問題

export const VendorConfigs = i18n.VendorConfigs;

//市場
export const VendorMarkets = {
  EARLY:1,  //早盘
  TODAY:2,  //今天
  RUNNING:3, //滚球
  FAVOURITE: 4, //关注
  OUTRIGHT: 5, //冠军
}

//市場名稱
export const VendorMarketNames = i18n.VendorMarketNames;

//时段
export const VendorPeriodName = i18n.VendorPeriodName;

//比賽排序方式
export const SortWays = {
  None: 0, //不指定排序
  LeagueName : 1,  //聯賽名
  EventTime: 2,   //開賽時間 DESC排序
}

//滾球時間狀態
export const RBTimeStatus = {
  NONE: 0, //不适用
  STARTED: 1, //開始
  ONGOING: 2, //进行中
  PAUSED: 3, //暂停
}

//數據變化類型
export const EventChangeType = {
  New: 1,     //新增
  Update: 2,  //修改
  Delete: 3,  //刪除
  Sort: 4,    //排序
}

export const SelectionChangeType = {
  //New: 1,     //新增
  Update: 2,  //修改
  //Delete: 3,  //刪除
  UnAvailable: 3, //不可用
}

//特定數據變化類型
export const SpecialUpdateType = {
  EventStart: 1, //比賽開始
  HomeGoal: 2,  //主場進球
  AwayGoal: 3,  //客場進球
  HomeCorner: 4, //主場角球
  AwayCorner: 5, //客場角球
  HomeRedCard: 6, //主場紅牌
  AwayRedCard: 7, //客場紅牌
  LineNew: 8, //增加玩法
  LineDelete: 9, //移除玩法
  OddsUp: 10, //賠率上升
  OddsDown: 11, //賠率下降
}

//注單類型
export const WagerType = {
  SINGLE: 1, //單注
  COMBO: 2, //串關
}

//盤口
export const OddsType = {
  MY: 1, //马来盘
  HK: 2, //香港盘
  EU: 3, //欧洲盘
  ID: 4, //印尼盘
}

//錯誤處理
export const VendorErrorType = {
  Unknown_Error: 99999, //未知錯誤
  VENDOR_Auth_Error: 10010, //認證錯誤 刷新或重新登錄
  VENDOR_Error: 11010, //Vendor系統錯誤
  VENDOR_Maintenance: 11020, //Vendor維護
  VENDOR_Area_Limit: 11030, //Vendor地區限制
  DATA_Error: 12010, //數據錯誤
  BET_Selection_Parlay_Limit: 13010, //Selection(串關)數量超過上限
  BET_Selection_Parlay_Error: 13011, //同一比賽的投注選項不可以同時選
  BET_Info_Error: 13020, //投注內容無效
  BET_Event_Error: 13030, //赛事/盘口已失效，或无法使用
  BET_Selection_Error: 13040, //投注選項無效  //需要查看BetInfoData.Selections.SelectionStatus狀態碼
  BET_Place_Error: 13050, //下注失敗
  BET_Place_Expire: 13051, //等待投注成功-超時
  BET_Place_Updating: 13060, //赔率更新中
  BET_Place_Balance: 13070, //余额不足
  BET_Place_LimitMax: 13080, //投注金额超于限额
  BET_Place_LimitMin: 13090, //投注金额低于最小投注额
  BET_Place_LimitTotal: 13100, //这赛事总投注金额超于限额
  BET_Place_OddChanged: 13110, //赔率已变更
  BET_Place_UpdateInfoRequired: 13111, //請刷新賠率
  BET_Place_NOPARLAY: 13120, //所选赛事不支持连串过关，请选其他赛事
  BET_Place_NO_COMBO_FREE: 13121, //串關獎勵不可和免費投注同時使用
  BET_Place_MONEY: 13130, // 無效投注金額
  BET_Virtual_Disabled: 13140, //虛擬體育未啟用
  CASHOUT_NEWPRICE: 14010, //提前兌現，有新價格
}

export const VendorErrorMsg = i18n.VendorErrorMsg;

//投注選項狀態
export const SelectionStatusType ={
  NOTSET: 99999, //未定
  EUODDSONLY: 99998, //請使用歐洲盤投注
  NEED3COMBO: 99997, //下注时最少需要选3种组合 (SABA獨有)
  OK: 100,  //成功
  ERROR: 350, //獲取投注信息錯誤
  NOTAVIILABLE: 380,  //盤口已不可用
  UPDATING: 1001, //賠率更新中(未返回可用投注)
}

export const SelectionStatusNames = i18n.SelectionStatusNames;

//提前兌現 狀態
export const CashOutStatusType = {
  NOTYET: 0, //未兌現或不可兌現
  DONE: 1, //已兌現
  PROCESS: 2, //進行中
  CANCEL: 3, //取消
  NEWPRICE: 4, //新價格
  FAIL: 5, //失敗
  DECLINE: 6, //拒絕(by用戶)
}

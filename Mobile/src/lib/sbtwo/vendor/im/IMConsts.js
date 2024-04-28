import i18n from '../vendori18n';

//接口状态码 只需要判斷這兩個，剩下的轉移到 VendorError去處理
export const IMAPIStatus = {
  OK: 100,  //成功
  DeltaExpire: 600, //delta過期
}

//體育項目
export const IMSports = {
  SOCCER: 1, //足球
  BASKETBALL: 2, //篮球
  TENNIS: 3, //网球
  ATHLETICS: 6, //田径
  BADMINTON: 7, //羽毛球
  BASEBALL: 8, //棒球
  BOXING: 11, //拳击
  DARTS: 15,  //飞镖
  LAWNHOCKEY: 18, //草地曲棍球
  FOOTBALL: 19, //美式足球
  GOLF: 21, //高尔夫球
  HANDBALL: 23, //手球
  ICEHOCKEY: 25, //冰上曲棍球
  MOTOR: 29, //赛车运动
  RUGBY: 31, //橄榄球
  SAILING: 32, //帆船
  SNOOKER: 34, //斯诺克 / 英式台球, 包括亚洲 9 球和台球
  TABLETENNIS: 36, //乒乓球
  VIRTUALSOCCER: 39, //虚拟足球
  VOLLEYBALL: 40, //排球, 包括沙滩排球
  WATERPOLO: 41, //水球
  VIRTUALBASKETBALL: 43, //虚拟篮球
  VIRTUALWORLDCUP: 44, //虚拟世界杯
  ENTERTAINMENTBETTING: 45, //娱乐投注
  VIRTUALNATIONALCUP: 46, //虚拟国家杯
  ALLEXCEPTSOCCER: -1, //所有非足球体育 (只应用于索取赛事信息)
  ALL: 98, //所有体育项目(只应用于Search,GetMArketEventCount)
  WCP2022: 2022, //2022世界杯
}

//時段
export const IMPeriodType = {
  FH: 1, //全场
  H1: 2, //上半场
  H2: 3, //下半场
}

//玩法
export const IMBetType = {
  HANDICAP: 1, //让球
  OVERUNDER: 2, //大/小
  ONEXTWO: 3, //1 x 2獨贏
  ODDEVEN: 5, //单 / 双
  CORRECTSCORE: 6, //波胆
  TOTALGOAL: 7, //总进球
  DCHANCE: 8, //双重机会
}

export const IMLineGroupNames = i18n.IM.IMLineGroupNames;

//盤口
export const IMOddsType = {
  MY: 1, //马来盘
  HK: 2, //香港盘
  EU: 3, //欧洲盘
  ID: 4, //印尼盘
}

export const IMOddsTypeName = i18n.IM.IMOddsTypeName;

//翻譯類型
export const IMLocalizationType = {
  ALL: 50, //所有
  COMPETITION: 51, //竞赛名称
  OUTRIGHT: 52, //优胜冠军名称
  TEAM: 53, //队名包含优胜冠军队名
  BETTYPE: 54, //投注类型名称
  BETSELECTION: 55, //投注选项类型名称
  CANCELREASON: 56, //取消提前兑现原因
  PROGRAM: 57, //程序
}

//賽事類型
export const IMEventType = {
  FIXTURE: 1, //定时赛事
  OUTRIGHT: 2, //优胜冠军
}
//賽事狀態
export const IMEventStatus = {
  OPEN: 1, //開盤
  CLOSE: 2, //關盤
}

//主場狀態
export const IMGroundType = {
  NEUTRAL: 0, //中立場
  HOME: 1, //主場
}

//是否有直播
export const IMHasLive = {
  NO: 0, //沒直播
  YES: 1, //有直播
}

//數據變更狀態
export const IMDeltaAction = {
  INSERTUPDATE: 0, //新增或修改
  DELETE: 1, //刪除
}

//注單狀態
export const IMWagerStatus = {
  PENDING: 1, //待处理
  CONFIRMED: 2, //已确认
  REJECTED: 3, //已拒绝 (危险球取消)
  CANCELLED: 4, //已取消
}

export const IMWagerStatusName = i18n.IM.IMWagerStatusName;

//注單確認狀態
export const IMWagerConfirmStatus = {
  NOT: 0, //未确认
  NORMAL: 1, //普通确认
  DANGER: 2, //危险确认
}

export const IMWagerConfirmStatusName = i18n.IM.IMWagerConfirmStatusName;

//注單取消狀態
export const IMWagerCancelStatus = {
  NOT: 1, //未取消
  WAGER: 2, //注单取消
  EVENT: 3, //赛事取消
}

export const IMWagerCancelStatusName = i18n.IM.IMWagerCancelStatusName;

//注單取消原因
export const IMWagerCancelReason = {
  NO: 0, //无原因
  REDCARD: 1, //危险红牌
  GOAL: 2, //危险进球
  ABANDONED: 101 //赛事终止
}

export const IMWagerCancelReasonName = i18n.IM.IMWagerCancelReasonName;

//已結算注單排序方式
export const IMWagerSortWay = {
  EVENTDATE: 1, //賽事時間
  BETDATE: 2,   //下注時間
}

//串關中文名
export const IMComboTypeNames = i18n.IM.IMComboTypeNames;

//滚球时段中文名
export const IMRBPeriodNames = i18n.IM.IMRBPeriodNames;

//特殊投注比賽分組名
export const IMEventGroupTypeNames = i18n.IM.IMEventGroupTypeNames;

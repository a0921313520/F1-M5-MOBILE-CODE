import i18n from '../vendori18n';

//數據名
export const SABADataTypes = {
  SPORTS: 'GetSports',
  LEAGUES: 'GetLeagues',
  EVENTS: 'GetEvents',
  MARKETS: 'GetMarkets',
  OUTRIGHTS: 'GetOutrights',
  PROMOS: 'GetPromotions',
  STREAMING: 'GetStreaming',
  SINGLETICKET : 'GetSingleTicket',
  PARLAYTICKETS :'GetParlayTickets',
  OUTRIGHTTICKET :'GetOutrightTicket',
  PLACEBET: 'PlaceBet',
  PLACEPARLAYBETS: 'PlaceParlayBet',
  PLACEOUTRIGHTBETS: 'PlaceOutrightBet',
  CHECKPLACEBET: 'CheckPlaceBet',
  CHECKWAITINGTICKETSTATUS: 'CheckWaitingTicketStatus',
  BETDETAILS: 'GetBetDetails',
  CASHOUTPRICE: 'GetCashoutPrice',
  SELLBACK: 'SellBack',
  CHECKSELLINGSTATUS: 'CheckSellingStatus',
  CONFIRMSELLINGRESULT: 'ConfirmSellingResult',
}

//體育項目
export const SABASports = {
  SOCCER: 1, //足球
  BASKETBALL: 2, //篮球
  FOOTBALL: 3, //美式足球
  ICEHOCKEY: 4, //冰上曲棍球
  TENNIS: 5, //网球
  VOLLEYBALL: 6, //排球
  BILLIARDS: 7, //台球
  BASEBALL: 8, //棒球
  BADMINTON: 9, //羽毛球
  GOLF: 10, //高尔夫球
  MOTORSPORTS: 11, //赛车运动
  SWIMMING: 12, //游泳
  POLITICS: 13, //政治
  WATERPOLO: 14, //水球
  DIVING: 15, //潛水
  BOXING: 16, //拳击
  ARCHERY: 17, //射箭
  TABLETENNIS: 18, //乒乓球
  WEIGHTLIFTING: 19, //舉重
  CANOEING: 20, //皮划艇
  GYMNASTICS: 21, //體操
  ATHLETICS: 22, //田径
  EQUESTRIAN: 23, //馬術
  HANDBALL: 24, //手球
  DARTS: 25,  //飞镖
  RUGBY: 26, //英式橄榄球
  FIELDHOCKEY: 28, //曲棍球
  WINTERSPORT: 29, //冬季比賽
  SQUASH: 30, //壁球
  ENTERTAINMENT: 31, //娛樂
  NETBALL: 32, //籃網球，英式籃球
  CYCLING: 33, //自行車
  FENCING: 34, //击剑
  JUDO: 35, //柔道
  MPENTATHLON: 36, //现代五项比赛
  ROWING: 37, //赛艇
  SAILING: 38, //帆船
  SHOOTING: 39, //射擊
  TAEKWONDO: 40, //跆拳道
  TRIATHLON: 41, //铁人三项
  WRESTLING: 42, //摔跤
  ESPORTS: 43, //電競?
  MUAYTHAI: 44, //泰拳
  BEACHVOLLEYBALL: 45, //沙滩排球
  CRICKET: 50, //板球
  FINANCE: 55, //商業
  OTHERS: 99, //其他
  WCP2022: 2022, //2022世界杯
}

//滚球时段中文名
export const SABARBPeriodNames = i18n.SABA.SABARBPeriodNames;

export const SABALineGroupNames = i18n.SABA.SABALineGroupNames;

//轉換主要玩法線名稱，和IM一致
export const SABABetTypeNames = i18n.SABA.SABABetTypeNames;

//1 7 17 讓球_全上下  3 8 18大小_全上下
//1全場 2上半場 3下半場
export const SABAPeriodMapping = {
  '1': {PeriodId: 1, PeriodName: i18n.VendorPeriodName["1"]},
  '7': {PeriodId: 2, PeriodName: i18n.VendorPeriodName["2"]},
  '17': {PeriodId: 3, PeriodName: i18n.VendorPeriodName["3"]},
  '3': {PeriodId: 1, PeriodName: i18n.VendorPeriodName["1"]},
  '8': {PeriodId: 2, PeriodName: i18n.VendorPeriodName["2"]},
  '18': {PeriodId: 3, PeriodName: i18n.VendorPeriodName["3"]},
}

//轉為數字型態(和IM統一數據結構)
export const SABAOddsTypeToNumber = {
  malayPrice : 1, //马来盘
  hongKongPrice: 2, //香港盘
  decimalPrice: 3, //欧洲盘
  indoPrice: 4, //印尼盘
  //americanPrice //美國盤 不使用
  //parlayPrice //串關賠率 不使用
}

//盤口(查詢用)
export const SABAOddsType = {
  MY: 'malayPrice', //马来盘
  HK: 'hongKongPrice', //香港盘
  EU: 'decimalPrice', //欧洲盘
  ID: 'indoPrice', //印尼盘
}

//串關中文名
export const SABAComboTypeNames = i18n.SABA.SABAComboTypeNames;

//投注變化接受程度
export const SABAAcceptMode = {
  NONE: 0, //不接受
  HIGHER: 1, //只接受更高
  ANY: 2, //全接受
}

//注單返回的 oddsType 轉中文
export const SABAOddsTypeName = i18n.SABA.SABAOddsTypeName;

//注單狀態中文，對應 bti的 settlementStatus 字段
export const SABAWagerStatusName = i18n.SABA.SABAWagerStatusName;


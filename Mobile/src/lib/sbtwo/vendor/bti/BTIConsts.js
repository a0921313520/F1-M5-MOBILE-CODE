import i18n from '../vendori18n';

//BTI數據名
export const BTIDataTypes = {
  SPORTS: 'sports',
  LEAGUES: 'leagues',
  EVENTS: 'events',
  MARKETS: 'markets',
  CALCULATEBETS : 'calculateBets',
  PLACEBETS: 'placeBets',
  GETPURCHASES: 'getPurchases',
  WAGERUNSETTLE: 'unsettled',
  WAGERSETTLED: 'settled',
  CASHOUT_GETINFO: 'getInfo',
  CASHOUT_PLACE: 'place',
  CASHOUT_GETUPDATES: 'getUpdates',
  CASHOUT_PLACENEWOFFER: 'placeNewOffer',
}

//體育項目
export const BTISports = {
  SOCCER: 1, //足球
  BASKETBALL: 2, //篮球
  FOOTBALL: 3, //美式足球
  TENNIS: 6, //网球
  BASEBALL: 7, //棒球
  ICEHOCKEY: 8, //冰上曲棍球
  HANDBALL: 10, //手球
  RUGBYLEAGUE: 11, //橄榄球(聯盟式)
  GOLF: 12, //高尔夫球
  SNOOKER: 13, //斯诺克 / 英式台球, 包括亚洲 9 球和台球
  MOTOR: 14, //赛车运动
  DARTS: 15,  //飞镖
  CYCLING: 16, //不清楚
  VOLLEYBALL: 19, //排球
  BOXING: 20, //拳击
  FUTSAL: 25, //5人制足球
  TABLETENNIS: 26, //乒乓球
  BOWLS: 27, //保齡球
  WINTERSPORTS: 28, //冬季運動
  HURLING: 29, //板棍球，又称爱尔兰式曲棍球
  WATERPOLO: 31, //水球
  BEACHVOLLEYBALL: 32, //沙滩排球
  BEACHSOCCER: 33, //沙灘足球
  BADMINTON: 34, //羽毛球
  RUGBYUNION: 35, //橄榄球(聯合式)
  CURLING: 37, //冰壺
  BANDY: 39, //班迪球
  AUSSIERULES: 41, //澳式足球
  MMA: 43, //綜合格鬥
  CRICKET: 59, //板球
  NETBALL: 63, //籃網球，英式籃球
  ATHLETICS: 21, //田径
  SWIMMING: 45, //游泳
  WINTEROLYMPIC: 42, //冬奧
  ESPORTS: 64, //電競?
  WCP2022: 2022, //2022世界杯
}

//盤口(查詢用)
export const BTIOddsType = {
  MY: 'malay', //马来盘
  HK: 'hk', //香港盘
  EU: 'decimal', //欧洲盘
  ID: 'indo', //印尼盘
}

//轉為數字型態(和IM統一數據結構)
export const BTIOddsTypeToNumber = {
  malay : 1, //马来盘
  hk: 2, //香港盘
  decimal: 3, //欧洲盘
  indo: 4, //印尼盘
}

//把上面的盤口 轉成 bet用的type字段
export const BTIOddsTypeForBet = {
  malay: 'malaysian', //马来盘
  hk: 'hongkong', //香港盘
  decimal: 'decimal', //欧洲盘
  indo: 'indonesian', //印尼盘
}

//注單返回的 oddsType 轉為數字型態(和IM統一數據結構)
export const BTIWagerOddsTypeToNumber = {
  notset: 0, //未知
  Malaysian : 1, //马来盘
  HongKong: 2, //香港盘
  Decimal: 3, //欧洲盘
  Indonesian: 4, //印尼盘
}

//注單返回的 oddsType 轉中文
export const BTIWagerOddsTypeName = i18n.BTI.BTIWagerOddsTypeName;

//注單狀態中文，對應 bti的 settlementStatus 字段
export const BTIWagerStatusName = i18n.BTI.BTIWagerStatusName;

//玩法分組 英翻中
export const BTIMarketGroupTypeNames = i18n.BTI.BTIMarketGroupTypeNames;

//投注變化接受程度
export const BTIAcceptMode = {
  NONE: 'None', //不接受
  HIGHER: 'AcceptHigher', //只接受更高
  ANY: 'AcceptAny', //全接受
}

//串關中文名
export const BTIComboTypeNames = i18n.BTI.BTIComboTypeNames;

//2表示讓球盤 3表示大小盤  後面的012表示全 上半 下半 場 39為滾球投注，視為全場
//轉換BTI的主要玩法線名稱，和IM一致
export const BTIBetTypeNames = i18n.BTI.BTIBetTypeNames;

//1全場 2上半場 3下半場
export const BTIPeriodMapping = {
  '2_0': {PeriodId: 1, PeriodName: i18n.VendorPeriodName["1"]},
  '2_1': {PeriodId: 2, PeriodName: i18n.VendorPeriodName["2"]},
  '2_2': {PeriodId: 3, PeriodName: i18n.VendorPeriodName["3"]},
  '2_39': {PeriodId: 1, PeriodName: i18n.VendorPeriodName["1"]},
  '3_0': {PeriodId: 1, PeriodName: i18n.VendorPeriodName["1"]},
  '3_1': {PeriodId: 2, PeriodName: i18n.VendorPeriodName["2"]},
  '3_2': {PeriodId: 3, PeriodName: i18n.VendorPeriodName["3"]},
  '3_39': {PeriodId: 1, PeriodName: i18n.VendorPeriodName["1"]},
}

//滾球時段中文名
export const BTIRBPeriodNames = i18n.BTI.BTIRBPeriodNames;

//強制歐洲盤的玩法  體育項目(SportId)->玩法(BetTypeId)數組
export const BTIForceDecimalBetTypeIds = {
  1:[//Soccer
    "1_0",
    "1_1",
    "1_2",
    "1_10",
    "1_20",
    "1_22",
    "1_41",
    "60",
    "62",
    "76",
    "89",
    "93",
    "1_117",
    "119",
    "120",
    "1_121",
    "1_141",
    "144",
    "154",
    "155",
    "158",
    "235",
    "262",
    "267",
    "270",
    "271",
    "272",
    "273",
    "274",
    "275",
    "276",
    "277",
    "278",
    "279",
    "280",
    "281",
    "282",
    "284",
    "285",
    "286",
    "287",
    "2938",
    "288",
    "289",
    "291",
    "292",
    "293",
    "294",
    "295",
    "296",
    "297",
    "298",
    "616",
    "1_617",
    "1_618",
    "1_619",
    "621",
    "696",
    "697",
    "698",
    "699",
    "700",
    "3880",
    "3881",
    "701",
    "702",
    "1333",
    "2935",
    "2936",
    "1334",
    "1447",
    "1449",
    "1451",
    "1453",
    "1455",
    "1457",
    "1459",
    "1461",
    "1463",
    "1465",
    "1467",
    "1468",
    "1473",
    "1474",
    "1475",
    "1476",
    "1572",
    "1610",
    "1619",
    "1620",
    "1621",
    "1668",
    "1669",
    "1670",
    "1871",
    "8",
    "193",
    "126",
    "184",
    "111",
    "136",
  ],
  2:[ //BasketBall
    "1_0",
    "1_3",
    "1_623",
    "1_624",
    "1_625",
    "1_2061",
    "1_2062",
    "1_2063",
    "8",
    "111",
    "136",
  ],
  6:[//Tennis
    "1_0",
    "1_45",
    "1_740",
    "1_741",
    "1_742",
    "8",
  ],
  3:[ //Football
    "1_0",
    "1_471",
    "1_473",
    "1_482",
    "1_483",
    "1_484",
    "1_485",
    "1_486",
    "1_487",
    "1_488",
    "1_489",
    "1_2337",
    "1_2339",
    "1_2340",
    "8",
  ],
  7:[ //Baseball
    "1_0",
    "1_3264",
    "1_19",
    "1_20",
    "8",
    "1364",
    "1365",
    "1366",
    "1367",
    "1_3302",
  ],
  8:[ //Ice Hockey
    "1_0",
    "8",
    "193",
    "1_94",
    "1_1249",
    "1_1250",
    "1_1251",
    "1_1254",
  ],
  10:[ //Handball
    "1_0",
    "1_409",
    "8",
    "111",
    "193",
    "184",
  ],
  11:[ //Rugby League
    "1_0",
    "1_1020",
    "1_1021",
    "1_1027",
    "1_1028",
    "1_1141",
    "1_1142",
    "8",
    "193",
  ],
  12:[ //Golf
    "1_0",
    "8",
    "111",
    "193",
  ],
  13:[ //Snooker & Pool
    "1_0",
    "1_1723",
    "8",
  ],
  15:[ //Darts
    "1_0",
    "8",
  ],
  19:[ //Volleyball
    "1_0",
    "8",
    "136",
    "111",
    "1_462",
    "1_1662",
    "1_1663",
    "1_1664",
    "1_1665",
  ],
  20:[ //Boxing
    "1_0",
  ],
  24:[ //Floorball
    "1_0",
  ],
  25:[ //Futsal
    "1_0",
  ],
  26:[ //Table Tennis
    "1_0",
  ],
  27:[ //Bowls
    "1_0",
  ],
  31:[ //Water Polo
    "1_0",
  ],
  32:[ //Beach Volleyball
    "1_0",
  ],
  33:[ //Beach Soccer
    "1_0",
  ],
  34:[ //Badminton
    "1_0",
  ],
  35:[ //Rugby Union
    "1_0",
    "1_1",
    "1_2",
    "1_19",
    "1_20",
  ],
  41:[ //Aussie Rules
    "1_0",
    "1_772",
    "1_775",
    "1_776",
    "1_777",
    "1_779",
    "1_781",
    "1_789",
    "1_790",
    "1_795",
    "1_796",
    "1_848",
    "1_859",
    "1_860",
    "1_861",
    "1_862",
    "1_863",
    "1_864",
    "1_865",
    "1_866",
  ],
  43:[ //MMA
    "1_0",
  ],
  22:[ //Cricket
    "1_0",
    "1_1616",
    "1_1617",
    "1_1629",
  ],
  64:[ //E-Sports
    "1_0",
    "8",
    "1_1375",
    "1_1376",
    "1_1377",
    "1_1431",
    "1_1432",
    "1_1433",
    "1_1434",
    "1_1520",
    "1_1521",
  ],
  28:[ //Winter Sports
    "8",
    "193",
  ],
  29:[ //Hurling
    "8",
  ],
  30:[ //Sailing
    "8",
  ],
  14:[ //Motor Racing
    "8",
    "193",
  ],
  16:[ //Cycling
    "8",
    "193",
  ],
  18:[ //Speedway
    "8",
  ],
  36:[ //Trotting
    "8",
  ],
  37:[ //Curling
    "1_0",
    "8",
  ],
  39:[ //Bandy
    "8",
    "1_0",
  ],
  63:[ //Netball
    "8",
    "1_0",
  ],
  67:[ //Gaelic Football
    "8",
    "1_0",
  ],
  60:[ //Surfing
    "8",
  ],
  17:[ //Poker
    "8",
  ],
  65:[ //Chess
    "8",
  ],
  71:[ //Racketlon
    "8",
  ],
  68:[ //Gaelic Hurling
    "1_0",
    "8",
  ],
  51:[ //Wrestling
    "8",
  ],
  50:[ //Judo
    "8",
  ],
  48:[ //Triathlon
    "8",
  ],
  49:[ //Canoeing
    "8",
  ],
  52:[ //Archery
    "8",
  ],
  53:[ //Diving
    "8",
  ],
  54:[ //Equestrian
    "8",
  ],
  55:[ //Fencing
    "8",
  ],
  56:[ //Modern Pentathlon
    "8",
  ],
  57:[ //Taekwondo
    "8",
  ],
  58:[ //Weightlifting
    "8",
  ],

}

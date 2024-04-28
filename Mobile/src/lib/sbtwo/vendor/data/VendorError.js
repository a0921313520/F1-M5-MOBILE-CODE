//錯誤處理
import {VendorErrorMsg, VendorErrorType} from "./VendorConsts";

export default class VendorError {
  /**
   * @param ErrorType 錯誤類型
   * @param ErrorMsg 錯誤信息
   * @param ErrorInfo 額外提供的錯誤數據
   */
  constructor(
    ErrorType = VendorErrorType.Unknown_Error,
    ErrorMsg = null,
    ErrorInfo = null,
  )
  {
    if (ErrorMsg === null) { //獲取默認的錯誤信息
      ErrorMsg = VendorErrorMsg[ErrorType]
    }
    Object.assign(this, {ErrorType, ErrorMsg, ErrorInfo});
  }

  toString() {
    return '[' + this.ErrorType + ']' + this.ErrorMsg;
  }

  //原本用error.constructor.name === 'VendorError'
  //在export之後，這個判斷會失效，所以改成加屬性
  isVendorError = true;

  static fromIMError(statusCode, statusDesc='') {
    let errorType = VendorErrorType.Unknown_Error;
    switch(statusCode) {
      case 101: //无效时间戳
      case 102: //无效令牌
      case 103: //无效用户名
      case 202: //无效用户名 商户令牌验证 API 没返回任何 用户名
      case 210: //无效商户
        errorType = VendorErrorType.VENDOR_Auth_Error;
        break;
      case 107: //无效开始时间
      case 108: //无效结束时间
      case 305: //无效语言编码
      case 313: //无效体育 ID
        errorType = VendorErrorType.DATA_Error;
        break;
      case 330: //无效赛事类型 ID
      case 331: //无效比赛 ID
      case 332: //无效盘口
      case 333: //无效操作会话
      case 334: //无效赛事 ID
      case 380:  //无可选盘口
        errorType = VendorErrorType.BET_Event_Error;
        break;
      case 335: //无效投注类型
      case 336: //无效投注类型 ID
      case 337: //无效投注类型 ID
      case 338: //无效 Marketline ID
      case 339: //无效定位类型
      case 340: //无效连串过关选项
      case 341: //无效投注金额
      case 342: //无效投注类型选项 ID
      case 343: //无效优胜冠军队伍 ID
      case 344: //无效赔率类型
      case 345: //无效让球盘
      case 346: //无效赔率
      case 347: //无效主队得分
      case 348: //无效客队得分
      case 349: //无效投注状态
      case 351: //无效伺服器 IP 地址
      case 352: //无效客户 MAC 地址
      case 353: //无效用户代理
        errorType = VendorErrorType.BET_Info_Error;
        break;
      case 350: //检索投注信息错误(一个或以上的投注350 选项状态是 350 或 380)
        errorType = VendorErrorType.BET_Selection_Error;
        break;
      case 355: //Selection(串關)數量超過上限
        errorType = VendorErrorType.BET_Selection_Parlay_Limit;
        break;
      case 367: //价格ID过期(提前兌現)
        errorType = VendorErrorType.CASHOUT_NEWPRICE;
        break;
      case 364: //无效价格(提前兌現) => 視為系统错误 要求刷新
      case 365: //无效投注单号(提前兌現) => 視為系统错误 要求刷新
      case 366: //无效回购价格(提前兌現) => 視為系统错误 要求刷新
      case 368: //投注不可出售，前一个请求正在处理中(提前兌現) => 視為系统错误 要求刷新
      case 369: //投注单号已售给提前兑现(提前兌現) => 視為系统错误 要求刷新
      case 400: //系统错误
        errorType = VendorErrorType.VENDOR_Error;
        break;
      case 700: //维护
        errorType = VendorErrorType.VENDOR_Maintenance;
        break;
      case 710: //访问地区限制
      case 395: //在地区限制投注??
        errorType = VendorErrorType.VENDOR_Area_Limit;
        break;
      case 1000: //投注错误(没有成功投注)
      case 1135: //比赛日期验证失效
      case 1136: //赛季 ID 验证失效
      case 1141: //此项体育不存在
      case 1554: //無效注單
      case 1102: //会员用户不活跃???
      case 1200: //投注被拒
        errorType = VendorErrorType.BET_Place_Error;
        break;
      case 1001: //赔率更新中
        errorType = VendorErrorType.BET_Place_Updating;
        break;
      case 1103: //余额不足
        errorType = VendorErrorType.BET_Place_Balance;
        break;
      case 1105: //投注金額超過上限
        errorType = VendorErrorType.BET_Place_LimitMax;
        break;
      case 1106: //投注金額低於下限
        errorType = VendorErrorType.BET_Place_LimitMin;
        break;
      case 1107: //賠率已變更
        errorType = VendorErrorType.BET_Place_OddChanged;
        break;
      case 1108: //已達賽事總投注金額上限
        errorType = VendorErrorType.BET_Place_LimitTotal;
        break;
      case 1126: //賽事不支持串關
        errorType = VendorErrorType.BET_Place_NOPARLAY;
        break;
      case 1132: //投注金額無效
        errorType = VendorErrorType.BET_Place_MONEY;
        break;
      case 1556: //虚拟足球未启用
      case 1557: //虚拟篮球未启用
        errorType = VendorErrorType.BET_Virtual_Disabled;
        break;
    }

    return new VendorError(errorType,null, {statusCode,statusDesc});
  }

  static fromBTIError(statusCode, statusDesc='', errorJSON = {}) {
    let errorType = VendorErrorType.Unknown_Error;
    switch(statusCode) {
      case 401: //Unauthorized
        errorType = VendorErrorType.VENDOR_Auth_Error;
        break;
      case 'undefine1':
        errorType = VendorErrorType.DATA_Error;
        break;
      case 'ValidationError':
        errorType = VendorErrorType.BET_Event_Error;
        break;
      case 'OddsNotMatch':
      case 'PointsNotMatch':
      case 'InvalidComboBonus':
      case 'InvalidComboBonusPercentage':
      case 'BetSelectionMappingIsNotValid':
      case 'RepeatedSelections':
      case 'InvalidBetType':
      case 'IncorrectLinesforBetType':
      case 'IncorectBetType':
      case 'InvalidPotentialReturns':
      case 'SelectionNotFound':
      case 'ComboNotAllowed':
      case 'NotSupportedSelectionType':
        errorType = VendorErrorType.BET_Info_Error;
        break;
      case 'SelectionClosed':
      case 'SelectionSuspended':
        errorType = VendorErrorType.BET_Selection_Error;
        break;
      case 'MaxSelectionsExceeded': //Selection(串關)數量超過上限
        errorType = VendorErrorType.BET_Selection_Parlay_Limit;
        break;
      case 'ServiceNotAvailableException': //系统错误
        errorType = VendorErrorType.VENDOR_Error;
        break;
      case 700: //维护
        errorType = VendorErrorType.VENDOR_Maintenance;
        break;
      case 710: //访问地区限制
      case 395: //在地区限制投注??
        errorType = VendorErrorType.VENDOR_Area_Limit;
        break;
      case 'PurchaseNotAccepted':
        errorType = VendorErrorType.BET_Place_Error;
        break;
      case 'WaitLive': //赔率更新中
        errorType = VendorErrorType.BET_Place_Updating;
        break;
      case 'NotEnoughMoney': //余额不足
        errorType = VendorErrorType.BET_Place_Balance;
        break;
      case 1105: //投注金額超過上限
        errorType = VendorErrorType.BET_Place_LimitMax;
        break;
      case 1106: //投注金額低於下限
        errorType = VendorErrorType.BET_Place_LimitMin;
        break;
      case 1107: //賠率已變更
        errorType = VendorErrorType.BET_Place_OddChanged;
        break;
      case 1108: //已達賽事總投注金額上限
        errorType = VendorErrorType.BET_Place_LimitTotal;
        break;
      case 1126: //賽事不支持串關
        errorType = VendorErrorType.BET_Place_NOPARLAY;
        break;
      case 1132: //投注金額無效
        errorType = VendorErrorType.BET_Place_MONEY;
        break;
      case 1556: //虚拟足球未启用
      case 1557: //虚拟篮球未启用
        errorType = VendorErrorType.BET_Virtual_Disabled;
        break;
    }
    return new VendorError(errorType,null, {statusCode,statusDesc,errorJSON});
  }

  static fromSABAError(statusCode, statusDesc='', errorJSON = {}) {
    let errorType = VendorErrorType.Unknown_Error;
    switch(statusCode) {
      case 401: //Unauthorized
        errorType = VendorErrorType.VENDOR_Auth_Error;
        break;
      case 'E001': //Internal Server Error	服务器发生非预期错误
      case 'E002': //Invalid parameter input	参数输入无效或不支援
      case 'E003': //ClientIP Is Invalid	客户ip无效或不支援
      case 'E004': //ClientIP Is Invalid	客户ip无效或不支援
      case 'E005': //Invalid Accept-Encoding	无效的編碼压缩格式
      case 'B001': //Failed Execution	系统执行失败
      case 'B018': //Disabled Bet	账号无法投注
      case 'B028': //Customer Closed	会员账号已关闭
      case 'B029': //Parlay MaxBet Less Than MinBet	串关最大投注额小于最小投注额
        errorType = VendorErrorType.VENDOR_Error;
        break;
      case 'B002': //Customer Not Deposited	客戶未存款
      case 'B017': //Insufficient balance	客户余额不足
        errorType = VendorErrorType.BET_Place_Balance;
        break;
      case 'B003': //Duplicated Transaction Id	厂商交易编号重复
      case 'B004': //Invalidate Vendor Id	无效的厂商编号
      case 'B023': //Cashout Price Not Found	未找到实时兑现的价格
      case 'B025': //Cannot Cashout	票不能进行实时兑现
      case 'B026': //Selling Ticket Not Found	未找到实时兑现的票
      case 'B027': //Cashout Account Not Found	客户不能进行实时兑现
        errorType = VendorErrorType.BET_Place_Error;
        break;
      case 'B005': //Event closed or Invalid market ID	赛事已关闭或无效的market ID
      case 'B024': //Event Closed	赛事已关闭
        errorType = VendorErrorType.BET_Event_Error;
        break;
      case 'B019': //Transaction Id Not Found	找不到对应注单编号
      case 'B020': //SportType is Invalid	无效的运动类型
        errorType = VendorErrorType.BET_Info_Error;
        break;
      case 'B006': //E-Sport Status Changed	[E-Sport 专用] 赛事状态改变 ( In-Play 和 Starting Soon)
      case 'B007': //Score Changed	分数已更新
      case 'B008': //Point Changed	球头已更新
      case 'B009': //Point Expired	球头已过期
      case 'B012': //Odds Error	赔率错误
      case 'B015': //Price Closed	价格关闭且market暂时关闭
      case 'B016': //Market Closed	market已关闭
        errorType = VendorErrorType.BET_Selection_Error;
        break;
      case 'B010': //Odds Changed	赔率已更新
        errorType = VendorErrorType.BET_Place_OddChanged;
        break;
      case 'B011': //Odds Suspend	赔率正在调整
        errorType = VendorErrorType.BET_Place_Updating;
        break;
      case 'B013': //Stake Problem	投注数量超过最大值或低于最小值
        errorType = VendorErrorType.BET_Place_MONEY;
        break;
      case 'B014': //Over Max Bet	单场赛事的投注数量超过了最大值
        errorType = VendorErrorType.BET_Place_LimitTotal;
        break;
      case 'B021': //Under Parlay Count	低于最低串关赛事数量
      case 'B022': //Lucky Parlay Error	串关错误
      case 'B030': //Parlay No Combo Available	超过最大 payout 请减少串关数量
      case 'B031': //Parlay Exceeds MaxMarkets	超过最多可串关数量(最多仅支持串 20 场)
        errorType = VendorErrorType.BET_Selection_Parlay_Limit;
        break;
      case 'B038': //Over Max Payout Per Event 超出單場限額
        errorType = VendorErrorType.BET_Place_LimitTotal;
        break;
      case 'UM99': //System is under maintenance	系统正在维护中
        errorType = VendorErrorType.VENDOR_Maintenance;
        break;
      case 'A003': //访问地区限制
        errorType = VendorErrorType.VENDOR_Area_Limit;
        break;
      // case 'undefine1':
      //   errorType = VendorErrorType.DATA_Error;
      //   break;
      // case 1105: //投注金額超過上限
      //   errorType = VendorErrorType.BET_Place_LimitMax;
      //   break;
      // case 1106: //投注金額低於下限
      //   errorType = VendorErrorType.BET_Place_LimitMin;
      //   break;
      // case 1126: //賽事不支持串關
      //   errorType = VendorErrorType.BET_Place_NOPARLAY;
      //   break;
      // case 1556: //虚拟足球未启用
      // case 1557: //虚拟篮球未启用
      //   errorType = VendorErrorType.BET_Virtual_Disabled;
      //   break;
    }
    return new VendorError(errorType,null, {statusCode,statusDesc,errorJSON});
  }
}

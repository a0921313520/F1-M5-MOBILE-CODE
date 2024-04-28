/*
 * @Author: Alan
 * @Date: 2022-01-22 14:20:22
 * @LastEditors: Alan
 * @LastEditTime: 2023-07-26 19:49:01
 * @Description: API
 * @FilePath: /F1-M1-Code/Mobile/src/api/index.js
 */
import HostConfig from "@/server/Host.config";
export const APISET = "api-version=1.0&Platform=Mobile";
const { HostApi, WC2022CMSURL, CMSURL, StrapiApi, BFFSCApi } = HostConfig.Config;
export const ApiPort = {
  Login: HostApi + "/api/Auth/Login?", // 獲取登入地址 POST
  Register: HostApi + "/api/Member/Register?", //注册   POST
  WelcomeCall: HostApi + "/api/Member/WelcomeCall?", 
  Member: HostApi + "/api/Member?", //会员详情相关
  GETALLBalance: HostApi + "/api/Balance?", //获取所有钱包余额
  GETBalanceSB: HostApi + "/api/Balance?wallet=SB&", //获取体育钱包余额
  ForgetPwd: HostApi + "/api/Auth/ForgetPassword/Email?", //忘记密码
  ForgetUsername: HostApi + "/api/Auth/ForgetUsername/Email?", //忘记用户名
  Logout: HostApi + "/api/Auth/Logout?", //退出登录
  Domaincheck: HostApi + `/api/App/AffiliateLM?domain=`, //获取推广链接url和代理code
  PhoneOTP: HostApi + "/api/Verification/Phone?", //发送手机验证码
  PhoneVoiceOTP: HostApi + "/api/Verification/Voice?", //发送手机验证码
  VerifyPhoneOTP: HostApi + "/api/Verification/Phone?", //验证手机号码
  VerifyPhoneVoiceOTP: HostApi + "/api/Verification/Voice?", //验证手机号码
  EmailOTP: HostApi + "/api/Verification/Email?", //发送邮箱验证码
  VerifyEmailOTP: HostApi + "/api/Verification/Email?", //验证邮箱
  VerificationAttempt: HostApi + "/api/Verification/OTPAttempts?", //验证相关剩余的次数
  ResetPassword: HostApi + "/api/Member/ForgetPassword?", //重置密码
  ChangePassword:
    HostApi + "/api/Auth/ChangePassword?oldPasswordRequired=true&", //修改密码
  SetChangePassword:
    HostApi + "/api/Auth/ChangePassword?oldPasswordRequired=false&", //更新密码
  GETPaymentlistAPI: HostApi + "/api/Payment/Methods?transactionType=Deposit&", //获取充值渠道列表
  GETDepositDetailsAPI:
    HostApi + "/api/Payment/Method/Details?transactionType=deposit&", //获取当前充值渠道的详情信息
  GETWithdrawDetailsAPI: HostApi + "/api/Payment/Method/Details?", //获取当前提款渠道的银行信息
  POSTApplications: HostApi + "/api/Payment/Application?", //提交充值
  POSTPaymentConfirmStep: HostApi + "/api/Payment/Application/", //提交充值后二次确认 （输入旧账户）
  POSTMemberCancelDeposit:
    HostApi + "/api/Payment/Application/MemberCancelDeposit?", //泰达币取消交易
  POSTCancelLBDeposit:
    HostApi + "/api/Payment/Application/Transactions/CancelPaybnbDeposit?", //取消本銀LB存款交易
  GETBalance: HostApi + "/api/Balance?wallet=&", //获取所有钱包余额
  GETWallets: HostApi + "/api/Transfer/Wallets?", //获取目标账户 转账
  POSTTransfer: HostApi + "/api/Transfer/Application?", //提交钱包转账
  GETLiveChat: HostApi + "/api/LiveChat/Url?", //获取客服链接
  GetAnnouncements: HostApi + "/api/Announcement/Announcements?", //获取公告信息
  GetAnnouncementDetail:
    HostApi + "/api/Announcement/AnnouncementIndividualDetail", //获取对应公告信息的内容详情
  GetMessages: HostApi + "/api/PersonalMessage/InboxMessages", //点击显示更多消息
  GetMessageDetail:
    HostApi + "/api/PersonalMessage/InboxMessageIndividualDetail", //消息的详情
  UpdateMessage: HostApi + "/api/PersonalMessage/ActionOnInboxMessage?", //阅读消息
  UpdateAnnouncement: HostApi + "/api/Announcement/ActionOnAnnouncement?", //阅读公告消息
  UnreadMessage: HostApi + "/api/PersonalMessage/UnreadCounts?", //未读消息统计
  VerifyPhone: HostApi + "/api/Setting/Phone/Prefix?", //手机号码格式 最大/最小长度 国际区号
  PUTMemberlistAPI: HostApi + "/api/Member?", //更新会员信息相关
  GetQuestions: HostApi + "/api/Setting/MasterData/SecurityQuestions?", //安全问题 用户资料
  GETBonuslistAPI: HostApi + "/api/Bonus?transactionType=Deposit&", //获取存款红利
  GETTransferBonuslistAPI: HostApi + "/api/Bonus?transactionType=Transfer&", //获取转账优惠
  GETMemberBanksfirst: HostApi + "/api/Payment/MemberBanks?", //获取用户已绑定的银行卡列表 用于提款
  AddMemberBank: HostApi + "/api/Payment/MemberBank?", //添加提款银行卡
  DeleteMemberBank: HostApi + "/api/Payment/MemberBank?bankId=", //刪除銀行卡 
  SetMemberBankDefault: HostApi + "/api/Payment/MemberBank/SetDefault?", //设置默认银行卡
  GETCanWithdrawalPay:
    HostApi + "/api/Payment/Methods?transactionType=Withdrawal&", //获取各大银行列表
  GetCryptocurrencyInfo: HostApi + "/api/Payment/Cryptocurrency/Details?", // 极速虚拟币支付提交
  GetProcessingDepositbyMethod:
    HostApi + "/api/Payment/Transaction/ProcessingDepositbyMethod?", // new 极速虚拟币支付提交
  SuggestedAmount: HostApi + "/api/Payment/SuggestedAmounts?", // 推荐金额
  ProcessInvoiceAutCryptoDeposit:
    HostApi + "/api/Payment/Cryptocurrency/ProcessInvoiceAutCryptoDeposit", //虛擬幣2成功充值
  RefreshTokenapi: HostApi + "/api/Auth/RefreshToken?", //刷新token
  ALBStatus: HostApi + "/api/Payment/IsQRLocalAliPay?", //ALB存款后 点击确认后请求
  PromoCalculate: HostApi + "/api/Bonus/Calculate?", //检查优惠
  PromoApplications: HostApi + "/api/Bonus/Application?", //申请优惠 POST
  UploadAttachment: HostApi + "/api/Payment/Application/UploadAttachment?", //上传文件 本地银行 POST
  WithdrawalApplications: HostApi + "/api/Payment/Application?", //发起提款请求
  MiniGamesInfo: HostApi + "/api/MiniGames?", //节日活动游戏
  MemberFlagsStatus: HostApi + "/api/Member/CustomFlag?", //返回存款验证步骤，是否可以修改验证的手机号码
  Balance: HostApi + "/api/Balance", //获取游戏的余额
  HomeTabGames: StrapiApi + "/vi-vn/Games/Providers/Sequence?",
  GamesList: StrapiApi + "/vi-vn/Games?", //游戏列表
  GetMemberDailyTurnover:
    HostApi + "/api/Member/MemberDailyTurnoverByProductType?", //游戏投注记录
  RecentPlayedGame: HostApi + "/api/Games/RecentPlayedGame", //获取最近游戏、推荐游戏
  CategoriesList: StrapiApi + "/vi-vn/Games/Categories/Details?", //获取当前游戏的所有类型 eg: 红利游戏 免费旋转 多人游戏
  LaunchGame: HostApi + "/api/Games/Launch", //启动游戏
  getExchangeRate: HostApi + "/api/Payment/Cryptocurrency/ExchangeRate?", // 获取汇率
  GetCryptocurrencyWalletAddress:
    HostApi + "/api/Payment/Cryptocurrency/WalletAddress?", // 获取虚拟币钱包地址列表
  AddCryptocurrencyWalletAddress:
    HostApi + "/api/Payment/Cryptocurrency/WalletAddress?", //新增虚拟币钱包地址
  SetDefaultWalletAddress:
    HostApi + "/api/Payment/Cryptocurrency/WalletAddress/Default?", //设置默认钱包
  CheckWithdrawalThreshold:
    HostApi + "/api/Payment/Transaction/CheckWithdrawalThreshold?", // 查询一张银行卡是否已经达到限制条件和已提款的金额，以及已提款的次数
  BankingHistory: HostApi + "/api/Payment/Application/BankingHistory?", //交易记录(充值，提款)新api
  TransferHistory: HostApi + "/api/Transfer/Histories?", //交易记录(转账)新api
  Feedbackform: HostApi + "/api/LiveChat/USDT/Feedback?", // USDT介绍问题反馈
  VerificationPaymentPhone: HostApi + "/api/Verification/Payment/Phone?", // 充值OTP验证发送验证码 // 推荐好友相关
  GetProvinces: HostApi + "/api/Promotion/Province?", // 省
  GetDistricts: HostApi + "/api/Promotion/District", // 地区
  GetTowns: HostApi + "/api/Promotion/Town", // 城镇
  ResendAttempt: HostApi + "/api/Verification/ResendAttempts?",
  GETWithdrawalBank:
    HostApi + "/api/Payment/Method/Details?transactionType=withdrawal",
  PostBankCardVerification: HostApi + "/api/Verification/Payment/BankCard?", //存款验证 提交银行卡信息
  ClaimBonus: HostApi + "/api/Bonus/Claim?", //优惠领取红利
  ApplyManual: HostApi + "/api/Promotion/ManualPromo?", //申请领取优惠礼品
  CheckMaxApplicant: HostApi + "/api/Promotion/ManualPromo/CheckMaxApplicant", //如果是表格类型优惠 申请前先查此api 申请人数是否已满
  CancelPromotion: HostApi + "/api/Bonus/CancelPromotion?", //取消优惠申请
  ShippingAddress: HostApi + "/api/Promotion/ShippingAddress?", //每日好礼地址信息
  DailyDeals: HostApi + "/api/Promotion/DailyDeals?", //提交每日好礼申请
  MemberCancelDeposit:
    HostApi + "/api/Payment/Application/MemberCancelDeposit?", //取消存款
    MemberRequestDepositReject:
    HostApi + "/api/Payment/Application/MemberRequestDepositReject?", //取消存款
  MemberCancellation: HostApi + "/api/Payment/Application/Cancellation?", //取消交易
  ResubmitOnlineDeposit:
    HostApi + "/api/Payment/Transaction/CreateResubmitOnlineDeposit?", //重新提交存款
  TransactionHistory: HostApi + "/api/Payment/Transaction/History?", //交易记录银行详情
  CaptchaInfo: HostApi + "/api/Verification/Captcha/Info?", //获取滑动验证码验证记录
  CaptchaChallengeId: HostApi + "/api/Verification/Captcha/ChallengeId?", //POST 获取ChallengeId PATCH 验证滑动
  ConfirmWithdrawalComplete:
    HostApi + "/api/Payment/Applications/ConfirmWithdrawalComplete?", //确认提款到账
  SubWithdrawalTransactionDetails: HostApi +"/api/Payment/Applications/", //確認提款拆分小額(SR)
  AnnouncementPopup: HostApi + "/api/Announcement/Popup?", //公告弹窗
  ApplicationSOS: HostApi + "/api/Bonus/Application/SOS?",
  GetTurnoverProductType: HostApi + "/api/Games/DailyTurnover/ProductTypes", //投注記錄種
  ClosestPrefixAmount: HostApi + "/api/Payment/ClosestPrefixAmount?",
  VerificationEmailToken: HostApi + "/api/Verification/Email/Token?", //验证邮箱的token 重置密码
  ResetPasswordLink: HostApi + "/api/Auth/ResetPassword?", //重置修改密码
  Safehouse: HostApi + "/api/Member/Safehouse?", //安全屋登入前检查
  GETisSafeHouse: HostApi + "/api/App/IsSafehouse?", //判斷安全屋 domain
  GetGameMaintenanceStatus: HostApi + "/api/Games/Navigation/MaintenanceStatus", //维护
  getWalletProviderMapping: HostApi + "/api/Transfer/WalletProviderMapping?", //獲取遊戲provider對應使用錢包
  AccountHolderName: HostApi + "/api/Verification/AccountHolderName", //提款需要验证文件的弹窗，点击立即验证按钮触发此api
  bankMaintenanceInfo: BFFSCApi + "/api/Payment/Banks/MaintenanceInfo?", // 獲取登入地址 POST

  /* ----活动游戏----- */
  MiniGames: HostApi + "/api/MiniGames/Banners?", //首屏icon
  MiniGameInfo: HostApi + "/api/MiniGames/ActiveGame?", //活動頁基礎數據
  MiniGameMember: HostApi + "/api/MiniGames/MemberProgress?isBeforeCharges=true&", //活動頁用戶數據
  MiniGameMemberPrizes: HostApi + "/api/MiniGames/PrizeHistory?", //活動頁用戶抽獎紀錄
  MiniGameMemberDrawPrize: HostApi + "/api/MiniGames/SnatchPrize?isBeforeCharges=true&", //活動頁用戶執行抽獎
  TeamsWC22: HostApi + "/api/Setting/MasterData/TeamsWC22?", //世界杯支持的团队数据
  TeamPreferencesWC22:
    HostApi + "/api/Member/CustomFlag?flagKey=TeamPreferenceWC22&", //世界杯支持的团队数据 展示开关
  PostTeamPreferencesWC22: HostApi + "/api/Member/TeamPreferencesWC22", //世界杯支持的团队数据提交

  //ProvidersDetails: HostApi + '/api/Games/Providers/Details?', //获取游戏厂商下面的平台列表

  /* ----------------------------------------------------------------------------------------- */

	ReferrerSignUp: HostApi + '/api/Quelea/ReferrerSignUp?' /*注册会员成为Quelea推荐人 */,
	GetQueleaActiveCampaign: HostApi + '/api/Quelea/ActiveCampaign?' /*获取最新Quelea推荐活动详情 开始时间 */,
	GetQueleaReferrerInfo: HostApi + '/api/Quelea/ReferrerInfo?' /*获取推荐人详情 */,
	ReferrerEligible: HostApi + '/api/Quelea/ReferrerEligible?' /*获取推荐人资格条件 */,
	ThroughoutVerification: HostApi + '/api/Quelea/ThroughoutVerification?' /*获取好友推荐的优惠逻辑 */,
	
	ReferrerActivity: HostApi + '/api/Quelea/ReferrerActivity?' /*获取被推荐人任务详情 获取用户注册时间,充值金额,是否已经验证手机号和邮箱 */,
	ReferreeTaskStatus: HostApi + '/api/Quelea/ReferreeTaskStatus?' /*获取被推荐人任务状态 */,
	ReferrerRewardStatus: HostApi + '/api/Quelea/ReferrerRewardStatus?' /*获取推荐人奖励状态 */,
	ReferrerLinkActivity: HostApi + '/api/Quelea/ReferrerLinkActivity?' /*点击链接时请求 */, // 行为相关
	ProvidersList: StrapiApi + '/vi-vn/Games/Providers/Details?', //获取当前游戏的所有平台
	/* ----------------------------------------------------------------------------------------- */

  SelfExclusions: HostApi + "/api/Member/SelfExclusion?", //自我限制详情
  GetSecurityCode: HostApi + "/api/Auth/GeneratePasscode?", // 获取安全码 // 会员提款账户相关

  /* ----------------------------------------------------------------------------------------- */

  GetMemberWithdrawalThreshold:
    HostApi + "/api/Payment/Transaction/MemberWithdrawalThreshold?", // 查询设置的最大提款的金额，以及最多提款的次数，和百分比
  UpdateMemberWithdrawalThreshold:
    HostApi + "/api/Payment/Transaction/MemberWithdrawalThreshold?", // 设置最大提款的金额，以及最多提款的次数，和百分比
  GetWithdrawalThresholdHistory:
    HostApi + "/api/Payment/Transaction/WithdrawalThresholdHistories?", // 查询该用户所有银行卡的已提款金额和已提款次数
  GetWithdrawalThresholdLimit:
    HostApi + "/api/Payment/Transaction/WithdrawalThresholdLimit?", // 查询设置的最大提款的金额，以及最多提款的次数

  /* ----------------------------------------------------------------------------------------- */
  GetVerificationMemberDocuments:
    HostApi + "/api/Verification/MemberDocuments?", //获取上传文档的进度
  GetDocumentApprovalStatus:
    HostApi + "/api/Verification/DocumentApprovalStatus?", //获取是否需要上传文档的状态
  UploadDocument: HostApi + "/api/Verification/MemberDocument/Upload?", //上传身份信息资料

  /* ----------------------------------------CMS---------------------------------------------- */
  CmsBanner: CMSURL + "/vi-vn/api/v1/app/webbanners/position/", //获取各个位置banner
  CmsBannerPosition: StrapiApi + "/vi-vn/api/v1/app/webbanners/position/home_main", //获取首页的banner
  CmsFeatureBanner: StrapiApi + "/vi-vn/api/v1/app/webbanners/position/home_feature", //获取首页 Feature banner
  CmsProfileFeature: StrapiApi + "/vi-vn/api/v1/app/webbanners/position/profile_feature",
  PromotionCategories: StrapiApi + "/vi-vn/api/v1/promotion/categories", //优惠的种类
  Promotions: CMSURL + "/vi-vn/api/v1/app/promotions?", //优惠列表
  PromotionDetail: CMSURL + "/vi-vn/api/v1/app/promotion?", //优惠列表
  DiamondClubDetail: CMSURL + "/vi-vn/api/v1/app/about/detail/all", //天王俱乐部
  GetVipIntroductioinPicture:
    CMSURL + "/vi-vn/api/v1/app/webbanners/position/vip?", // 获取同乐币介绍会员权益图片
  GetCoinIntroductioinPicture:
    CMSURL + "/vi-vn/api/v1/app/webbanners/position/coin?", // 获取同乐币介绍会员权益图片
  GetUsdtFaq: CMSURL + "/vi-vn/api/v1/app/usdt/faq", //Usdt 介绍
  GetVipFaqList: CMSURL + "/vi-vn/api/v1/app/vip/faq", //VIP 详情 常见问题列表
  GetHelpList: CMSURL + "/vi-vn/api/v1/faq", //帮助中心
  GetHelpdetail: CMSURL + "/vi-vn/api/v1/app/faq/detail/", //帮助中心详情
  BonusAppliedHistory: CMSURL + "/vi-vn/api/v1/bonus/applied/history?", //我的优惠 申请列表
  RebateList: CMSURL + "/vi-vn/api/v1/app/rebate?", //返水列表
  DailydealsHistory: CMSURL + "/vi-vn/api/v1/promotion/dailydeals/history?", //每日好礼记录
  WorldcupBanner:
    WC2022CMSURL + "/vi-vn/api/v1/app/webbanners/position/worldcup_main", //世界杯活动banner
  WorldcupBannerGame:
    WC2022CMSURL + "/vi-vn/api/v1/app/webbanners/position/worldcup_game", //世界杯活动banner
  WorldcupNews: WC2022CMSURL + "/vi-vn/api/v1/news", //世界杯活动新闻api
  Vipfeedback: HostApi + "/api/Member/VIP/CallBack?", //反馈问题
  /* ----------------------------------------------------------------------------------------- */

  /* 整合CMS和BFF API */

  RebateRunningDetails: HostApi + "/api/Promotion/Rebate/RunningDetails?", // 返水細節 (v5)
  RebateHistories: HostApi + "/api/Promotion/Rebate/Histories?", // 返水歷史 (v5)
  FreebetBonusGroups: HostApi + "/api/Promotion/Freebet/BonusGroups?", // 免費投注群組 (v5)
  AppliedHistory: HostApi + "/api/Bonus/AppliedHistory?", // 應用歷史 (v5)
  DailyDealsHistories: HostApi + "/api/Promotion/DailyDeals/Histories?", // 每日好礼记录 (v5)
  GETBonusListAPI: HostApi + "/api/Bonus?", // 获取存款红利 (v2)
  GETDailyDeals: HostApi + "/api/Promotion/DailyDeals?", //提交每日好礼申请 (v5)
  MemberPromoHistories: HostApi + "/api/Promotion/MemberPromoHistories?", // 会员促销历史 (v5)
  CMSRebateList: StrapiApi + "/vi-vn/api/v1/app/promotions?type=rebate", // 反水清單
  CMSPromotionDetail: StrapiApi + "/vi-vn/api/v1/app/promotion?", // api优惠列表
  CMSPromotionList: StrapiApi + "/vi-vn/api/v1/app/promotions?",
  CMSAppliedHistory: StrapiApi + "/cms/promotions-m3/",
  CMSRebateHistory: StrapiApi + "/cms/promotions-m3/rebateids/",
  /* ----------------------------------------------------------------------------------------- */
};

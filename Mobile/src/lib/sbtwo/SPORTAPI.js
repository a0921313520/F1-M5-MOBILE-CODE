import HostConfig from '@/server/Host.config';
const { HostApi, sbNewHostApi, cmsApi } = HostConfig.Config;

export const ApiPort = {
	Login: HostApi + '/api/Auth/Login?', // 獲取登入地址 POST
	Register: HostApi + '/api/Member/MemberRestricted?', //注册   POST
	Member: HostApi + '/api/Member?',
	GETALLBalance: HostApi + '/api/Balance?',
	GETBalanceSB: HostApi + '/api/Balance?wallet=SB&',
	ForgetPwd: HostApi + '/api/Member/Email/ForgetPasswordByEmail?',

	ForgetUsername: HostApi + '/api/Member/ForgetUsernameByEmail?',
	Logout: HostApi + '/api/member/Logout?',
	getMainsiteDomain: HostApi + '/api/App/URLs?',
	Domaincheck: HostApi + `/api/App/AffiliateLM?domain=`,

	PhoneOTP: HostApi + '/api/Member/Phone/Verify?',
	VerifyPhoneOTP: HostApi + '/api/Member/Phone/TAC?',
	EmailOTP: HostApi + '/api/Member/Email/Verify?',
	VerifyEmailOTP: HostApi + '/api/Member/Email/VerifyTac?',
	VerificationAttempt: HostApi + '/api/Member/VerificationAttempt?',
	ResetPassword: HostApi + '/api/Member/ForgetPassword?',
	ChangePassword: HostApi + '/api/Member/Password?oldPasswordRequired=false&',

	GETPaymentlistAPI: HostApi + '/api/Payment/Methods?transactionType=Deposit&',
	GETDepositDetailsAPI: HostApi + '/api/Payment/Methods/Details?transactionType=deposit&',
	POSTApplications: HostApi + '/api/Payment/Applications?',
	POSTPaymentConfirmStep: HostApi + '/api/Payment/Applications/',
	POSTMemberCancelDeposit: HostApi + '/api/Payment/Applications/MemberCancelDeposit?', //取消交易
	POSTCancelLBDeposit: HostApi + '/api/Payment/Applications/Transactions/CancelPaybnbDeposit?', //取消本銀LB存款
	GETBalance: HostApi + '/api/Balance?wallet=&',
	GETWallets: HostApi + '/api/Transfer/Wallets?',
	POSTTransfer: HostApi + '/api/Transfer/Application?',

	GETLiveChat: HostApi + '/api/LiveChat/Url?',

	GetProvidersMaintenanceStatus: HostApi + '/api/Games/Providers/MaintenanceStatus?',

	GetAnnouncements: HostApi + '/api/Announcement/Announcements?',
	GetAnnouncementDetail: HostApi + '/api/Announcement/AnnouncementIndividualDetail',
	GetMessages: HostApi + '/api/PersonalMessage/InboxMessages',
	GetMessageDetail: HostApi + '/api/PersonalMessage/InboxMessageIndividualDetail',
	UpdateMessage: HostApi + '/api/PersonalMessage/ActionOnInboxMessage?',
	UpdateAnnouncement: HostApi + '/api/Announcement/ActionOnAnnouncement?',
	UnreadMessage: HostApi + '/api/PersonalMessage/UnreadCounts?',
	VerifyPhone: HostApi + '/api/Setting/Phone/Prefix?',

	GetTLCPoint: HostApi + '/api/Member/MemberRewardDetail?',
	GETMemberlistAPI: HostApi + '/api/Member?',
	PATCHMemberlistAPI: HostApi + '/api/Member?',
	PUTMemberlistAPI: HostApi + '/api/Member?',
	GetQuestions: HostApi + '/api/Member/SecretQuestions?',
	GETBonuslistAPI: HostApi + '/api/Bonus?transactionType=Deposit&',
	GETTransferBonuslistAPI: HostApi + '/api/Bonus?transactionType=Transfer&',
	GETMemberBanksfirst: HostApi + '/api/Payment/MemberBanks?',
	GETCanWithdrawalPay: HostApi + '/api/Payment/Methods?transactionType=Withdrawal&',
	GetCryptocurrencyInfo: HostApi + '/api/Payment/Methods/GetCryptocurrencyInfo?', // 极速虚拟币支付提交
	GetProcessingDepositbyMethod: HostApi + '/api/Payment/Transactions/GetProcessingDepositbyMethod?', // new 极速虚拟币支付提交
	SuggestedAmount: HostApi + '/api/Payment/SuggestedAmount?', // 推荐金额
	ProcessInvoiceAutCryptoDeposit: HostApi + '/api/Payment/Cryptocurrency/ProcessInvoiceAutCryptoDeposit', //虛擬幣2成功充值

	GetMemberNotificationSetting: HostApi + '/api/Vendor/NotificationSetting/SBS?',
	EditMemberNotificationSetting: HostApi + '/api/Vendor/NotificationSetting/SBS?',

	GetIMToken: HostApi + '/api/Vendor/GameToken?code=IPSB&',
	GETSBTToken: HostApi + '/api/Vendor/GameToken?code=SBT&', //BTI舊版
	GETBTIToken: HostApi + '/api/Vendor/GameToken?code=BTI&', //BTI新版-這應該沒用到
	GetSABAToken: HostApi + '/api/Vendor/GameToken?code=OWS&',

	/* 刷新token */
	RefreshTokenapi: HostApi + '/api/Auth/RefreshToken?',

	ALBStatus: HostApi + '/api/Payment/UpdateIsQRLocalAliPay?',

	NotifyBettingInfo: HostApi + '/api/Vendor/NotifyBettingInfo/SBS?',

	/* ----检查优惠 */
	PromoCalculate: HostApi + '/api/Bonus/Calculate?',
	/* ----申请优惠 POST----- */
	PromoApplications: HostApi + '/api/Bonus/Application?',

	/* ----上传文件 本地银行 POST----- */
	UploadAttachment: HostApi + '/api/Payment/Applications/UploadAttachment?',

	/* ----活动游戏----- 導向主站，只需要獲取icon數據 */
	MiniGames: HostApi + '/api/MiniGames/Banners?', //首屏icon
	// MiniGameInfo: HostApi + '/api/MiniGames/ActiveGame?', //活動頁基礎數據
	// MiniGameMember: HostApi + '/api/MiniGames/MemberProgress?', //活動頁用戶數據
	// MiniGameMemberPrizes: HostApi + '/api/MiniGames/PrizeHistory?', //活動頁用戶抽獎紀錄
	// MiniGameMemberDrawPrize: HostApi + '/api/MiniGames/SnatchPrize?', //活動頁用戶執行抽獎

	/* -----返回存款验证步骤，是否可以修改验证的手机号码 */
	//MemberFlagsStatus: HostApi + '/api/Member/CustomFlags?', //用不到了
	/* -----会员进入存款之前进行 资料验证 跳转去验证页面 */
	MemberInfoCheckStatus: HostApi + '/api/Member/CustomFlag?',
	/* -----获取银行列表 用于存款验证里面的 银行卡验证列表  */
	GETWithdrawalBank: HostApi + '/api/Payment/Methods/Details?transactionType=withdrawal',
	/* -----存款验证 提交相关信息 */
	PostBankCardVerification: HostApi + '/api/Payment/BankCardVerification?',
	/* ----- 验证资料的次数 如果失败 就直接进入 超过验证次数限制页面 */
	ResendAttempt: HostApi + '/api/Member/ResendAttempt?',
	// VoiceMessageTAC: HostApi + '/api/Member/VoiceMessage/TAC?'
	/* ----自我限制----- */
	GetSelfExclusion: HostApi + '/api/Member/SelfExclusion?',
	/* 获取tab 菜单的 状态 */
	GetNavMaintenanceStatus: HostApi + '/api/Games/Navigation/MaintenanceStatus?providerCode=AVIATOR&',

	LOGIN_SB: 'login',
	sbDataVersion: cmsApi + 'cms/sb-data-api',
};

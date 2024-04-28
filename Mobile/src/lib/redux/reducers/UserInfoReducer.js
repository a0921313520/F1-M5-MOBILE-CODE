/*
 * @Author: Alan
 * @Date: 2022-03-07 11:49:02
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-28 00:53:04
 * @Description: 初始化
 * @FilePath: \Mobile\src\lib\redux\reducers\UserInfoReducer.js
 */
import { ACTION_USERINFO_UPDATE } from '../actions/UserInfoAction';

//用戶全域數據
export const getInitialState = () => ({
	//是否已登入
	isLogin: false,
	//用戶名
	username: '',
	Balance: {
		TotalBal: 0,
		SB: 0,
		MAIN: 0,
		LD: 0,
		YBP: 0,
		KYG: 0,
		P2P: 0,
		SLOT: 0,
		IMOPT: 0,
		KENO: 0,
		LBK: 0
	},
	BalanceInit: [
		{
			balance: 0,
			state: 'Available',
			name: 'TotalBal',
			localizedName: '总余额',
			category: 'TotalBal'
		},
		{
			balance: 0,
			state: 'Available',
			name: 'MAIN',
			localizedName: '主账户',
			category: 'Main'
		},
		{
			balance: 0,
			state: 'NotAvailable',
			name: 'SB',
			localizedName: '体育 / 电竞',
			category: 'Sportsbook'
		},
		{
			balance: 0,
			state: 'Available',
			name: 'LD',
			localizedName: '真人娱乐场',
			category: 'LiveDealer'
		},
		{
			balance: 0,
			state: 'Available',
			name: 'YBP',
			localizedName: '乐天使棋牌',
			category: 'P2P'
		},
		{
			balance: 0,
			state: 'NotAvailable',
			name: 'P2P',
			localizedName: '双赢棋牌',
			category: 'P2P'
		},
		{
			balance: 0,
			state: 'NotAvailable',
			name: 'KYG',
			localizedName: '开元棋牌',
			category: 'P2P'
		},
		{
			balance: 0,
			state: 'Available',
			name: 'SLOT',
			localizedName: '老虎机',
			category: 'Slots'
		},
		{
			balance: 0,
			state: 'NotAvailable',
			name: 'IMOPT',
			localizedName: 'PT 老虎机',
			category: 'Slots'
		},
		{
			balance: 0,
			state: 'NotAvailable',
			name: 'YBF',
			localizedName: '醉心捕鱼',
			category: 'Slots'
		},
		{
			balance: 0,
			state: 'Available',
			name: 'YBK',
			localizedName: '醉心彩票',
			category: 'Keno'
		},
		{
			balance: 0,
			state: 'NotAvailable',
			name: 'KENO',
			localizedName: '双赢彩票',
			category: 'Keno'
		},
		{
			balance: 0,
			state: 'NotAvailable',
			name: 'LBK',
			localizedName: 'LB 快乐彩',
			category: 'Keno'
		}
	],
	memberInfo: {
		rowNumber: 0,
		memberCode: '',
		registrationSite: '',
		firstName: '',
		lastName: '',
		active: true,
		isGameLock: false,
		currency: 'CNY',
		dob: '',
		housePlayer: false,
		registerDate: '',
		secretQID: 0,
		referralCode: '',
		preferWallet: '',
		language: 'zh-cn',
		failTimes: 0,
		hostName: '',
		placeOfBirthID: '',
		nationality: "China (People's Rep)",
		nationalityID: 1,
		isDeposited: 1,
		contacts: [
			{
				contactType: '',
				status: '',
				id: 941779,
				memberCode: '',
				contact: '',
				isPrimary: true,
				isActive: true,
				createdBy: 'ntmCrm',
				createdDate: '',
				modifiedBy: '',
				modifiedDate: ''
			},
			{
				contactType: '',
				status: '',
				id: 941780,
				memberCode: '',
				contact: '',
				isPrimary: true,
				isActive: true,
				createdBy: 'ntmCrm',
				createdDate: '2022-03-23T22:56:27',
				modifiedBy: '',
				modifiedDate: '2022-03-23T22:57:45'
			}
		],
		address: { address: '', city: '', zipCode: '' },
		regWebSite: 15,
		gaid: '66169',
		isKyc: false,
		lastLoginTime: '2022-05-21T23:58:06.63',
		userName: '',
		isConfiscated: false,
		verifyAttempts: 3,
		documentID: '',
		displayReferee: false,
		revalidate: false,
		revalidateName: 'N/A',
		isSingleDeposit: false,
		memberStatus: 1,
		isQueleaRegistered: false,
		memberPaymentRisk: {
			classificationStatus: '7',
			memberCode: '',
			paymentRisk: 'New/Not Qualify 3',
			rebateVIP: false
		},
		offers: { isGift: true, isBonus: true },
		offerContacts: {
			isCall: true,
			isSMS: true,
			isEmail: true,
			isNonMandatory: false,
			isLine: false,
			calledTime: '00:00:00',
			timeRange: '0000'
		},
		affiliateEligibility: { caCall: true, caBonus: true, freebetAutomation: true },
		identityCard: '',
		isLoginOTP: true,
		email: '',
		emailStatus: '',
		phoneNumber: '',
		phoneStatus: '',
		Phone: '',
		LanguageName: '',
		CurrencyName: '',
		DepositBeforeVerify: '',
		WithdrawalBeforeVerify: '',
		manualRemark: ''
	},
	//是否正在刷新餘額
	isGettingBalance: false,
	//SB餘額
	balanceSB: 0,
	//是否正在刷新SB餘額
	isGettingBalanceSB: false,
	//SB自我限制
	selfExclusionInfo: {
		Status: false, //總開關
		DisableDeposit: false, //存款
		DisableFundIn: false,  //轉帳
		DisableBetting: false, //投注
		SelfExcludeSetDate: '2022-01-01T00:00:00.00',
		SelfExcludeExpiredDate: '2022-01-01T00:00:00.00',
		SelfExcludeDuration: 0,
		SelfExclusionSettingID: 0, //1:7天,2:90天,3:永久
	},
});

const UserInfoReducer = (state = getInitialState(), action) => {
	switch (action.type) {
		case ACTION_USERINFO_UPDATE: //更新數據
			//console.log('===userinfo update to : ', action.payload);
			return { ...state, ...action.payload };
		default:
			return state;
	}
};

export default UserInfoReducer;

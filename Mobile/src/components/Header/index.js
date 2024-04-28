import { ReactSVG } from '@/components/View/ReactSVG';
import Toast from '@/components/View/Toast';
import Service from './Service';
import Router from 'next/router';
import { withBetterRouter } from '@/lib/js/withBetterRouter';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import { Cookie, getUrlVars, urlVarsToQueryString } from '@/lib/js/Helper';
import { getMemberStorageKey, checkIsLogin, setIsLogout, redirectToLogin } from '@/lib/js/util';
import { connect } from 'react-redux';
import {
	ACTION_UserInfo_login,
	ACTION_UserInfo_getBalance,
	ACTION_User_getDetails
} from '@/lib/redux/actions/UserInfoAction';
import HostConfig from '@/server/Host.config';

// import {
// 	ACTION_MaintainStatus_NoTokenBTI,
// 	ACTION_MaintainStatus_NoTokenIM,
// 	ACTION_MaintainStatus_NoTokenOW,
// 	ACTION_MaintainStatus_SetBTI,
// 	ACTION_MaintainStatus_SetIM,
// 	ACTION_MaintainStatus_SetOW
// } from '@/lib/redux/actions/MaintainStatusAction';
import { ACTION_UserSetting_Update } from '@/lib/redux/actions/UserSettingAction';
import AppDownloadPopup from './AppDownloadPopup';
import dynamic from 'next/dynamic';
import React from 'react';
import ReactIMG from '@/components/View/ReactIMG';
import Vipcustomerservice from './Vipcustomerservice';
import DrawerBankStatus from '../Common/DrawerBankStatus';
//const Slider = dynamic(() => import('./Slider'), { ssr: false });

const CallApplib = dynamic(import('@/components/Me/DynamicOpenApp'), { ssr: false });

const Modal = dynamic(() => import('@/components/View/Modal'), { ssr: false });

const HomeTips = dynamic(() => import('@/components/Home/HomeTips'), { ssr: false });

let staticHeaderMenu = [
	{ label: '中文', icon: 'cnpng', count: null, sort: 1, router: '/sports-im', name: 'im', id: 0 },
	{ label: 'ภาษาไทย', icon: 'thpng', count: '即将', sort: 0, router: '/sports-bti', name: 'bti', id: 1 },
	{
		label: 'Tiếng Việt',
		icon: 'vnpng',
		count: '即将',
		sort: 0,
		router: '/sports-bti',
		name: 'bti',
		id: 2
	},
	{ label: 'English', icon: 'enpng', count: '即将', sort: 1, router: null, name: 'ow', id: 3 }
];

class Header extends React.Component {
	constructor() {
		super();
		this.state = {
			isSliderLoaded: false, //用來減少首屏請求量
			isSliderVisible: false,
			isFirstEntry: false, //是否首次進入(加速首次進入體感，移除側邊彈出動畫)
			options: staticHeaderMenu,
			selectedVendor: staticHeaderMenu[0],
			isOpen: false,
			isRegistered: false,
			memberInfo: '',
			isLogin: false,
			hidePwd: false,
			maintenancePopup: false,
			maintenanceSport: '',
			jumpToSport: '',
			StatisticsAll: '0',
			showHomeTips: false,
			//showAppDownloadPopup: false //展示app下載彈窗
			feedbackModal: false
		};

		this.BTICountPollingKey = null;
		this.IMCountPollingKey = null;

		this.timer = null;
		this.changeHeaderMenu = this.changeHeaderMenu.bind(this);
		global.PopUpLiveChat = this.PopUpLiveChat.bind(this); // 全局化打开客服窗口
		this.FUN88Live = null;
	}

	componentDidMount() {
		let vars = getUrlVars();
		this.props.userInfo_getDetails();
		//this.props.userInfo_getBalance();
		//console.log('===== header componentDidMount');
		////console.log(ApiPort.Token)

		//header didmount會觸發兩次  第一次在 "/" 然後會自動跳轉"/sports-bti" 觸發 第二次 用這個useTokeLogin去判斷現在狀況
		//以上已修正 不會觸發兩次，現在每次進入 "/" 不會加載header 會直接跳轉體育頁 然後才觸發 header didmount 只會有一次

		//aff相關 轉移到layout處理

		// //console.log('=====vars', vars);
		// let isTokenLogin = false;
		// if (vars.token && vars.token !== '' && vars.token !== JSON.parse(localStorage.getItem('firstLoginToken'))) {
		// 	isTokenLogin = true;
		// 	setIsLogout(); //先logout
		// 	//console.log('=== token login from mainsite');
		// 	localStorage.setItem('memberToken', JSON.stringify('Bearer ' + vars.token));
		// 	localStorage.setItem('firstLoginToken', JSON.stringify(vars.token));
		// 	ApiPort.Token = 'Bearer ' + vars.token;
		// 	if (vars.rtoken && vars.rtoken !== '') {
		// 		localStorage.setItem('refreshToken', JSON.stringify(vars.rtoken));
		// 	}
		// 	//存完後清理網址參數 避免back循環
		// 	const cleanQueryString = urlVarsToQueryString(vars, [ 'token', 'rtoken' ]);
		// 	//console.log('=== clean url to ', window.location.pathname + cleanQueryString);
		// 	Router.replace(window.location.pathname + cleanQueryString, undefined, { shallow: true });
		// 	this.RefreshToken(true);
		// } else if (checkIsLogin()) {
		// 	//console.log('=== has login');
		// 	this.setState({
		// 		isLogin: true
		// 	});

		// 	let memberData = localStorage.getItem('memberInfo');
		// 	////console.log(memberData);
		// 	if (!memberData) {
		// 		getMemberInfo((res) => {
		// 			this.setState({
		// 				memberInfo: res
		// 			});
		// 		});
		// 	} else {
		// 		this.setState({
		// 			memberInfo: JSON.parse(memberData)
		// 		});
		// 	}

		// 	if (memberData) {
		// 		// if (JSON.parse(memberData).Currency !== 'CNY') {
		// 		// 	Toast.error('不支援的国家');
		// 		// 	logout(memberData.Language, memberData.Currency);
		// 		// 	return;
		// 		// }
		// 		// if (JSON.parse(memberData).IsGameLock) {
		// 		// 	Toast.error('封锁的帐户');
		// 		// 	logout(memberData.Language);
		// 		// 	return;
		// 		// }
		// 	}

		// 	this.props.userInfo_getBalance();
		// 	this.getMessageCount();
		// 	// this.ReferreeTaskStatus();
		// }

		//和登入態無關的公用數據，維護狀態等信息
		this.getBasicInfo();
		this.getBankInfo();

		//處理deeplink參數
		if (vars.deeplink && vars.sid && vars.eid && vars.lid) {
			//數據都要有 才會存
			// 先清理舊的deeplink參數
			localStorage.removeItem('deeplink');
			//存下新的deeplink參數
			const deeplinkData = {
				vendor: vars.deeplink,
				sid: vars.sid,
				eid: vars.eid,
				lid: vars.lid
			};
			localStorage.setItem('deeplink', JSON.stringify(deeplinkData));
			//存完後清理網址參數 避免back循環
			const cleanQueryString = urlVarsToQueryString(vars, [ 'deeplink', 'sid', 'eid', 'lid' ]);
			//console.log('=== clean url to ', window.location.pathname + cleanQueryString);
			Router.replace(window.location.pathname + cleanQueryString, undefined, { shallow: true });
		}

		//this.handleDeepLink();

		if (sessionStorage.getItem('tutorial')) {
			// 新手教學頁需求: Click the back button will go to the side bar page.
			this.setState({ isSliderLoaded: true, isSliderVisible: true, isFirstEntry: true });
			sessionStorage.removeItem('tutorial');
		}
	}

	componentWillUnmount() {
		clearTimeout(this.timer);
	}

	getBasicInfo = () => {
		this.Checkdomin();
		//this.getServerUrl();
	};

	RefreshToken = (firstTime = false) => {
		//console.log('RefreshToken');
		var rstoken = JSON.parse(localStorage.getItem('refreshToken'));
		const postData = {
			grantType: 'refresh_token',
			clientId: 'Fun88.CN.App',
			clientSecret: 'FUNmuittenCN',
			refreshToken: rstoken
		};

		fetchRequest(ApiPort.RefreshTokenapi, 'POST', postData, true)
			.then((res) => {
				//console.log(res);
				if (res) {
					if (res.access_token && res.refresh_token) {
						localStorage.setItem('memberToken', JSON.stringify('Bearer ' + res.access_token));
						ApiPort.Token = 'Bearer ' + res.access_token;
						localStorage.setItem('refreshToken', JSON.stringify(res.refresh_token));

						if (firstTime) {
							this.props.userInfo_getDetails();
							this.getBasicInfo();
							if (!window.RefreshTokensetInterval) {
								window.RefreshTokensetInterval = setInterval(() => {
									this.RefreshToken();
								}, 3300000);
							}
						}
					} else {
						Toast.destroy();
						Toast.error('Vui lòng đăng nhập lại, quyền truy cập đã hết hạn', 3);
						setIsLogout();
						redirectToLogin();
					}
				}
			})
			.catch((error) => {
				//console.log(error);
				Toast.destroy();
			});
	};

	// getMemberData = () => {
	// 	//console.log('getMemberData');
	// 	fetchRequest(ApiPort.Member, 'GET', '', true)
	// 		.then((res) => {
	// 			//console.log('fetchRequest member');
	// 			//console.log(res);
	// 			if (res) {
	// 				//console.log(res);
	// 				this.setState({
	// 					isLogin: true,
	// 					memberInfo: res.result.memberInfo
	// 				});

	// 				localStorage.setItem('username', JSON.stringify(res.result.memberInfo.userName));

	// 				localStorage.setItem('memberCode', JSON.stringify(res.result.memberInfo.memberCode));

	// 				localStorage.setItem('PreferWallet', res.result.memberInfo.preferWallet);
	// 				localStorage.setItem('LoginOTP', res.result.memberNewInfo.isLoginOTP);
	// 				localStorage.setItem('Revalidate', res.result.memberInfo.revalidate);

	// 				localStorage.setItem('memberInfo', JSON.stringify(res.result.memberInfo));
	// 				if (typeof _paq === 'object') {
	// 					_paq.push([ 'setUserId', res.result.memberInfo.memberCode ]);
	// 				}
	// 				if (res.result.memberInfo.currency !== 'cny' && res.result.memberInfo.currency !== 'CNY') {
	// 					Toast.error('不支援的国家');
	// 					logout(res.result.memberInfo.language, res.result.memberInfo.currency);
	// 					return;
	// 				}

	// 				if (res.result.memberInfo.isGameLock) {
	// 					Toast.error('封锁的帐户');
	// 					logout(res.result.memberInfo.language);
	// 					return;
	// 				}

	// 				setIsLogin();
	// 				this.props.userInfo_login(res.result.memberInfo.userName); //redux 紀錄登入態
	// 				this.props.userInfo_getBalance(true); //redux 獲取SB餘額

	// 				this.getMessageCount();

	// 				//signalR重連bind當前用戶
	// 				signalRConnect(true);

	// 				this.checkFirstEntry();

	// 				Toast.destroy();
	// 			} else {
	// 				Toast.destroy();
	// 			}
	// 		})
	// 		.catch((err) => {
	// 			Toast.destroy();
	// 		});
	// };

	//處理deeplink跳轉
	// handleDeepLink() {
	// 	//如果有deeplink就直接跳走
	// 	const deeplinkJSON = localStorage.getItem('deeplink');
	// 	if (deeplinkJSON) {
	// 		let deeplinkSetting = JSON.parse(deeplinkJSON);
	// 		//取到 就清理掉deeplink參數
	// 		localStorage.removeItem('deeplink');
	// 		if (
	// 			deeplinkSetting &&
	// 			deeplinkSetting.vendor &&
	// 			deeplinkSetting.sid &&
	// 			deeplinkSetting.eid &&
	// 			deeplinkSetting.lid
	// 		) {
	// 			let targetVendor = VendorBTI;
	// 			if (deeplinkSetting.vendor === 'im') {
	// 				targetVendor = VendorIM;
	// 			}
	// 			Router.push(
	// 				`${targetVendor.configs
	// 					.VendorPage}/detail?sid=${deeplinkSetting.sid}&eid=${deeplinkSetting.eid}&lid=${deeplinkSetting.lid}&OE=false`
	// 			);
	// 		}
	// 	}
	// }

	//檢查是否首次進入，並展開側邊欄
	checkFirstEntry() {
		const storageKey = getMemberStorageKey('first_entry');
		const first_entry_json = localStorage.getItem(storageKey);
		if (!first_entry_json) {
			//this.setState({isSliderLoaded: true, isSliderVisible: true, isFirstEntry: true});
			localStorage.setItem(storageKey, JSON.stringify('111'));
		} else if (JSON.parse(first_entry_json) === '222' && checkIsLogin()) {
			//已登入 + 第一次 展示小教學提示
			//this.setState({showHomeTips: true});
		}
	}

	//首次進入，關閉側邊欄之後，展示彈窗
	checkFirstEntryHotEvents() {
		const storageKey = getMemberStorageKey('first_entry');
		const first_entry_json = localStorage.getItem(storageKey);
		if (first_entry_json && JSON.parse(first_entry_json) === '111') {
			localStorage.setItem(storageKey, JSON.stringify('222'));
			this.showHotEvents();
		}
	}

	//首次進入，關閉側邊欄->關閉彈窗->展示教學小提示
	checkFirstEntryHomeTips() {
		if (checkIsLogin()) {
			const storageKey = getMemberStorageKey('first_entry');
			const first_entry_json = localStorage.getItem(storageKey);
			if (JSON.parse(first_entry_json) === '222') {
				//已登入 + 第一次 + 彈窗之後 展示小教學提示
				this.setState({ showHomeTips: true });
			}
		}
	}

	//關閉 教學小提示
	closeHomeTips() {
		const storageKey = getMemberStorageKey('first_entry');
		localStorage.setItem(storageKey, JSON.stringify('333'));
		this.setState({ showHomeTips: false });
	}

	Checkdomin() {
		// domain affCode
		let domain = HostConfig.Config.DefaultDomain;
		fetchRequest(ApiPort.Domaincheck +  global.location.protocol + '//' + global.location.host + '&', 'GET')
			.then((res) => {
				if (res.isSuccess) {
					if (res.result.affiliateCode) {
						Cookie.Create('CO_affiliate', 'affiliate=' + res.result.affiliateCode, 30);
					}
				}
			})
			.catch((error) => {
				//console.log(error);
			});
	}

	changeHeaderMenu(key, item) {
		if (key === 0) {
			this.setState({
				isOpen: !this.state.isOpen
			});
		} else {
			// if (item.router) {
			// 	Router.push(item.router);
			// } else {
			// 	this.setState({
			// 		isOpen: !this.state.isOpen
			// 	});
			// }
		}
		// Pushgtagdata(`Vendor`, 'View', `TopNav_${item.name.toUpperCase()}`);
	}

	//金額分隔符
	numberWithCommas(x) {
		return x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
	}

	getMemberNotificationSetting() {
		let that = this;
		return new Promise((resolve, reject) => {
			fetchRequest(ApiPort.GetMemberNotificationSetting, 'GET')
				.then((res) => {
					if (res && res.memberCode && res.notificationSetting) {
						//緩存
						localStorage.setItem(
							'NotificationSetting-' + res.memberCode,
							JSON.stringify(res.notificationSetting)
						);

						//加載 盤口展示方式
						const savedListDisplayType = res.notificationSetting['listDisplayType'];
						let listDisplayType = 1;
						if (parseInt(savedListDisplayType) === 2) {
							listDisplayType = 2;
						}
						that.props.userSetting_updateListDisplayType(listDisplayType);

						resolve(res.notificationSetting);
					} else {
						reject('GetMemberNotificationSetting no data??' + JSON.stringify(res));
					}
				})
				.catch((e) => reject('GetMemberNotificationSetting failed' + JSON.stringify(e)));
		});
	}

	// 未讀訊息統計
	getMessageCount = () => {
		fetchRequest(ApiPort.UnreadMessage + 'key=All&', 'GET')
			.then((res) => {
				if (res.isSuccess) {
					const total =
						res.result.unreadCategory.unreadPersonalMessage + res.result.unreadCategory.unreadTransaction;
					this.setState({
						StatisticsAll: total
					});
				}
			})
			.catch((error) => {
				//console.log(error);
			});
	};

	// 全局客服
	getServerUrl = () => {
		fetchRequest(ApiPort.GETLiveChat).then((res) => {
			if (res.isSuccess && res.result !== localStorage.getItem('serverUrl')) {
				localStorage.setItem('serverUrl', res.result);
			}
		});
	};

	PopUpLiveChat() {
		const serverUrl = localStorage.getItem('serverUrl');
		if (serverUrl) {
			this.showCS(serverUrl);
		}
	}

	showCS = (serverUrl) => {
		this.FUN88Live && this.FUN88Live.close();
		this.FUN88Live = window.open(
			'about:blank',
			'chat',
			'toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=540, height=650'
		);
		this.FUN88Live.document.title = 'FUN88在线客服';
		this.FUN88Live.location.href = serverUrl;
		this.FUN88Live.focus();
	};

	gameOptionsUI = (key, item) => {
		if (key === 0) {
			return <ReactSVG className="header-select-svg" src="/img/svg/SanJiao.svg" />;
		} else {
			if (this.checkMaintenanceStatus(item.name)) {
				return (
					<span className="count-box game-maintenance">
						<span>维修</span>
					</span>
				);
			}
			return (
				<span className="count-box">
					<span>{item.count}</span>
				</span>
			);
		}
	};

	getBankInfo = () => {
		fetchRequest(ApiPort.bankMaintenanceInfo, 'GET')
		.then((res) => {
			console.log(res, 'rasjdas')
			if (res.isSuccess) {
				const vnBank = res.result.filter((item) => {return item.currencyCode == 'VND'})
				console.log(vnBank, 'vnBank')
				this.setState({
					bankStatusInfo: vnBank
				})
			}
		})
		.catch((error) => {
			//console.log(error);
		});
	}

	render() {
		const { showAppDownloadBar, closeAppDownloadBar, userInfo, hasServer } = this.props;
		const { isSliderLoaded, maintenancePopup, showHomeTips, showAppDownloadPopup, feedbackModal } = this.state;
		////console.log(this.state);

		return (
			<div>
				{/*<AppDownloadPopup*/}
				{/*	visible={showAppDownloadPopup}*/}
				{/*	onClose={() => {*/}
				{/*		this.setState({ showAppDownloadPopup: false });*/}
				{/*	}}*/}
				{/*/>*/}

				<div className={'header-wrapper' + (showAppDownloadBar ? ' withAppDownloadbar' : '')} id="header-bar">
					{showAppDownloadBar ? (
						<div className="appdb-wrapper">
							<ReactSVG
								className="appdb-button-close"
								src="/img/svg/close.svg"
								onClick={closeAppDownloadBar}
							/>
							<ReactIMG src="/img/appDownload.png" className="appdb-icon" />
							<div className="appdb-desc">
								<div className="appdb-desc-line1">Ứng Dụng Fun88</div>
								<div className="appdb-desc-line2">Nhanh và Tiện Lợi Hơn</div>
							</div>
							<div
								className="appdb-button-download"
								onClick={() => {
									// Pushgtagdata(`Download Nav`, 'Click', 'Download_TopNav');
									global.Copyaffcode();
									global.callApplib.open({ path: '' });
								}}
							>
								TẢI NGAY!
							</div>
							<CallApplib key={Math.random()} />
						</div>
					) : null}
					<div className="AppTop">
						<ReactIMG className="icon-logo" src="/img/headerLogo.svg" />
						{userInfo.memberInfo && userInfo.memberInfo.isVIP ? (
							<div
								className="vip-customer-service"
								onClick={() => {
									this.setState({ feedbackModal: true });
								}}
							>
								<ReactIMG src="/img/P5/icon/Icon_VIPCS.png" />
							</div>
						) : null}
						<div className="header-tools-wrapper">
							{/* <div className={`header-game-select ${this.state.isOpen ? 'open' : ''}`}>
							{this.state.options.map((item, key) => {
								return (
									<div
										key={key}
										onClick={() => {
											this.changeHeaderMenu(key, item);
										}}
										className="i18Menu"
									>
										<div className={'i18list ' + item.icon} />
										<label style={{ textAlign: key != 0 ? 'left' : 'center' }}>{item.label}</label>
										{key == 0 && (
											<ReactSVG className="header-select-svg" src="/img/P5/i18/icon.svg" />
										)}
									</div>
								);
							})}
						</div> */}
						{/* <div>
						<ReactIMG style={{width: '0.85333rem', height: '0.8rem'}} onClick={()=> {
							this.setState({showbankStatus: true})
						}} src="/img/P5/icon/bankStatus.png" />
						</div> */}

						{this.state.showbankStatus && 
							<DrawerBankStatus 
								CloseDetail={() => {
									this.setState({
										showbankStatus: false
									});
								}}
								bankStatusInfo={this.state.bankStatusInfo} 
								showbankStatus={this.state.showbankStatus}
								/>
						}
							{hasServer && (
								<div
									onClick={() => {
										Pushgtagdata("Home","Contact CS","Home_C_CS");
									}}
								>
									<Service />
								</div>
							)}
						</div>
					</div>
				</div>

				{maintenancePopup ? (
					<Modal
						className="maintenance-modal"
						wrapClassName="maintenance-wrap"
						visible={maintenancePopup}
						onCancel={this.closeModal}
						closable={false}
						animation={false}
					>
						<ReactIMG src="/img/maintenance.png" />
						<div className="maintenance-title">平台维护通知</div>
						<div className="maintenance-desc">
							亲爱的会员，{this.state.maintenanceSport}正在维护 ， <br />
							请稍后回来。我们将在8秒内带您前往{this.state.jumpToSport}。
						</div>
					</Modal>
				) : null}
				{/* 首次進入 教學小提示窗 */}
				{showHomeTips ? (
					<HomeTips
						visible={showHomeTips}
						onClickClose={() => {
							this.closeHomeTips();
						}}
					/>
				) : null}

				<Vipcustomerservice
					visible={feedbackModal}
					onCloseModal={() => {
						this.setState({ feedbackModal: false });
					}}
				/>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo,
	maintainStatus: state.maintainStatus
});

const mapDispatchToProps = {
	userInfo_login: (username) => ACTION_UserInfo_login(username),
	userInfo_getDetails: () => ACTION_User_getDetails(),
	userInfo_getBalance: (forceUpdate = false) => ACTION_UserInfo_getBalance(forceUpdate),
	// maintainStatus_setBTI: (isMaintenance) => ACTION_MaintainStatus_SetBTI(isMaintenance),
	// maintainStatus_setIM: (isMaintenance) => ACTION_MaintainStatus_SetIM(isMaintenance),
	// maintainStatus_setOW: (isMaintenance) => ACTION_MaintainStatus_SetOW(isMaintenance),
	// maintainStatus_noTokenBTI: (isNoToken) => ACTION_MaintainStatus_NoTokenBTI(isNoToken),
	// maintainStatus_noTokenIM: (isNoToken) => ACTION_MaintainStatus_NoTokenIM(isNoToken),
	// maintainStatus_noTokenOW: (isNoToken) => ACTION_MaintainStatus_NoTokenOW(isNoToken),
	userSetting_updateListDisplayType: (currentType) => ACTION_UserSetting_Update({ ListDisplayType: currentType })
};

export default withBetterRouter(connect(mapStateToProps, mapDispatchToProps)(Header));

import { ReactSVG } from '$SBTWO/ReactSVG';
import HostConfig from '@/server/Host.config';
import Toast from '$SBTWO/Toast';
import Service from './Service';
import Router from 'next/router';
import { withBetterRouter } from '$SBTWOLIB/js/withBetterRouter';
import { fetchRequest } from '$SBTWOLIB/SportRequest';
import { ApiPort } from '$SBTWOLIB/SPORTAPI';
import { getMemberInfo, logout } from '$SBTWOLIB/data/userinfo';
import reactUpdate from 'immutability-helper';
import { Cookie, getUrlVars, urlVarsToQueryString } from '$SBTWOLIB/js/Helper';
import initSportCache from '$SBTWOLIB/js/initSportCache';
import { getMemberStorageKey, checkIsLogin, setIsLogin, setIsLogout, getAllVendorToken } from '$SBTWOLIB/js/util';
import { connect } from 'react-redux';
import {
	ACTION_UserInfo_login,
	ACTION_UserInfo_getBalanceSB,
	ACTION_User_getDetails
} from '@/lib/redux/actions/UserInfoAction';
import {
	ACTION_MaintainStatus_NoTokenBTI,
	ACTION_MaintainStatus_NoTokenIM,
	ACTION_MaintainStatus_NoTokenSABA,
	ACTION_MaintainStatus_SetBTI,
	ACTION_MaintainStatus_SetIM,
	ACTION_MaintainStatus_SetSABA
} from '@/lib/redux/actions/MaintainStatusAction';
//import { signalRConnect } from '$SBTWOLIB/js/signalR';
import { ACTION_UserSetting_Update } from '@/lib/redux/actions/UserSettingAction';
import AppDownloadPopup from './AppDownloadPopup';
import dynamic from 'next/dynamic';
import React from 'react';
import ReactIMG from '$SBTWO/ReactIMG';
import classNames from 'classnames';
import BalanceDropdown from '$SBTWO/Balance-Dropdown';

const Slider = dynamic(() => import('./Slider'), { ssr: false });

const Modal = dynamic(() => import('$SBTWO/Modal'), { ssr: false });

const HomeTips = dynamic(() => import('$SBTWO/HomeTips'), { ssr: false });

let staticHeaderMenu = [
	{ label: 'IM', count: null, sort: 0, router: '/sbtwo/sports-im', name: 'im', piwik: 'IM' },
	{ label: 'BTI', count: null, sort: 1, router: '/sbtwo/sports-bti', name: 'bti', piwik: 'BTI' },
	{ label: '沙巴', count: null, sort: 1, router: '/sbtwo/sports-saba', name: 'saba', piwik: 'OW' }
];

class Header extends React.Component {
	constructor() {
		super();
		this.state = {
			isSliderLoaded: false, //用來減少首屏請求量
			isSliderVisible: false,
			isFirstEntry: false, //是否首次進入(加速首次進入體感，移除側邊彈出動畫)
			options: [ ...staticHeaderMenu ],
			selectedVendor: staticHeaderMenu[0],
			isOpen: false,
			isRegistered: false,
			memberInfo: '',
			hidePwd: false,
			maintenancePopup: false,
			maintenanceSport: '',
			jumpToSport: '',
			StatisticsAll: '0',
			showHomeTips: false,
			showAppDownloadPopup: false //展示app下載彈窗
		};

		//延遲加載，用於首屏加速
		this.VendorIM = null;
		this.VendorBTI = null;
		this.VendorSABA = null;
		this.BTICountPollingKey = null;
		this.IMCountPollingKey = null;
		this.SABACountPollingKey = null;

		this.timer = null;
		this.initDelayTimer = null; //初始延遲加載的timer
		this.isDidUnmount = null; //紀錄是否已unmount，判斷異步動作是否還要執行
		this.trCountDataHasSet = false;
		this.changeHeaderMenu = this.changeHeaderMenu.bind(this);
		global.PopUpLiveChat = this.PopUpLiveChat.bind(this); // 全局化打开客服窗口
		this.FUN88Live = null;
	}

	componentDidMount() {
		console.log('===== header componentDidMount');
		this.isDidUnmount = false;
		console.log(this.props.OpenLeftSlider);
		this.props.OpenLeftSlider && this.props.OpenLeftSlider(this);
		if (checkIsLogin()) {
			console.log('=== has login');
			let memberData = localStorage.getItem('memberInfo');
			//console.log(memberData);
			if (!memberData) {
				this.props.userInfo_getDetails().then((memberInfo) => {
					this.setState({
						memberInfo: memberInfo
					});
				});
			} else {
				this.setState({
					memberInfo: JSON.parse(memberData)
				});
			}

			getAllVendorToken();
			this.getMemberNotificationSetting().catch((e) => console.log(e));
			this.props.userInfo_getBalanceSB();
			this.getMessageCount();
		}

		//和登入態無關的公用數據，維護狀態等信息
		this.getBasicInfo();

		//處理deeplink參數
		let vars = getUrlVars();
		console.log('=====header vars', vars);
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
			const cleanQueryString = urlVarsToQueryString(vars, [ 'deeplink', 'sid', 'eid', 'lid', 'OE' ]);
			const cleanUrl = window.location.pathname.replace(process.env.BASE_PATH, '') + cleanQueryString;
			console.log('=== clean url to ', cleanUrl);
			Router.replace(cleanUrl, undefined, { shallow: true });
		}

		this.handleDeepLink();

		//下拉菜單更新
		let currentSelectedVendor = this.state.options[0];
		const menusFromRoute = this.state.options.filter((i) => Router.route.indexOf(i.router) !== -1);
		if (menusFromRoute && menusFromRoute.length > 0) {
			currentSelectedVendor = menusFromRoute[0];
		}

		staticHeaderMenu.forEach((val) => {
			val.sort = val.name === currentSelectedVendor.name ? 0 : 1;
		});
		this.setState(
			{
				isOpen: false,
				//options: [ ...staticHeaderMenu ].sort((a, b) => a.sort - b.sort),
				selectedVendor: currentSelectedVendor
			},
			async () => {
				//更新滾球數量
				const updateCount = (targetName) => {
					return (pollingResult) => {
						if (this.isDidUnmount) return;

						const SportDatas = pollingResult.NewData;
						let totalRunningCount = 0;
						SportDatas.map((sport) => {
							const runningMarkets = sport.Markets.filter((m) => m.MarketId === 3); //3滾球
							if (runningMarkets && runningMarkets.length > 0) {
								totalRunningCount = totalRunningCount + runningMarkets[0].Count;
							}
						});

						let targetIndex = -1;
						staticHeaderMenu.map((item, index) => {
							if (item.name === targetName) {
								targetIndex = index;
							}
						});
						if (targetIndex > -1) {
							staticHeaderMenu[targetIndex].count = totalRunningCount;
							// this.setState({ options: [ ...staticHeaderMenu ].sort((a, b) => a.sort - b.sort) }, () => {

							// });
							if (!this.trCountDataHasSet && this.state.options.some((o) => o.count !== null)) {
								this.trCountDataHasSet = true;
							}
						}
					};
				};

				const { query, pathname } = this.props.router; //從鏈接獲取要加載的參數

				if (!query || JSON.stringify(query) === JSON.stringify({})) {
					//沒參數 才使用API緩存
					console.log(pathname, '=======Header PLAN TO USE API CACHE=======');

					//獲取初始緩存
					initSportCache(pathname);

					const thisSportName = currentSelectedVendor.name;

					const handleInitialCache = (cacheData) => {
						if (cacheData && global.initialCache[thisSportName].isUsedForHeader === false) {
							if (!this.trCountDataHasSet) {
								//確定沒數據才用
								console.log(pathname, '=======Header USE API CACHE for trCount=======');
								staticHeaderMenu.map((item) => {
									item.count = cacheData.trCount[item.name];
								});
								this.trCountDataHasSet = true;
								// this.setState(
								// 	{ options: [ ...staticHeaderMenu ].sort((a, b) => a.sort - b.sort) },
								// 	() => {
								// 		this.trCountDataHasSet = true;
								// 	}
								// );
							}
							global.initialCache[thisSportName].isUsedForHeader = true; //標記為已使用
						} else {
							console.log(pathname, '=======Header ABORT USE API CACHE=======');
						}
					};

					if (!checkIsLogin()) {
						//優化Performance:未登入，優先等待並使用 initialCache
						let cacheData = await global.initialCache[thisSportName].cachePromise;
						handleInitialCache(cacheData);
					} else {
						//已登入則按原方式 initialCache 和 正常獲取 競速，先拿到的先用
						global.initialCache[thisSportName].cachePromise.then(handleInitialCache);
					}
				} else {
					console.log(pathname, '=======Header NO API CACHE=======');
				}

				//優化Performance: 未登入+在默認體育頁+沒額外參數+未點擊切換 延遲10秒才開始獲取數據
				let initDelay = 0;
				if (
					!checkIsLogin() &&
					pathname === '/sbtwo/sports-' + HostConfig.Config.defaultSport && //在默認體育頁
					this.getUrlParams() === '' && //沒參數
					!sessionStorage.getItem('changeHeaderMenu') //有切換過會有值
				) {
					initDelay = 10 * 1000;
				}
				console.log(pathname, '=====Performance:Header:initDelay', initDelay);

				this.initDelayTimer = setTimeout(async () => {
					if (this.isDidUnmount) return;
					console.log(pathname, '=====Performance:Header:called', initDelay);

					await this.asyncLoadVendors();

					if (this.state.selectedVendor.name === 'bti') {
						//選中BTI 刷新IM/SABA Count
						this.VendorBTI.deletePolling(this.BTICountPollingKey);
						this.IMCountPollingKey = this.VendorIM.getSportsPollingGlobal('headerCount', updateCount('im'));
						this.SABACountPollingKey = this.VendorSABA.getSportsPollingGlobal(
							'headerCount',
							updateCount('saba')
						);
					} else if (this.state.selectedVendor.name === 'im') {
						//選中IM 只刷新BTI/SABA Count
						this.VendorIM.deletePolling(this.IMCountPollingKey);
						this.BTICountPollingKey = this.VendorBTI.getSportsPollingGlobal(
							'headerCount',
							updateCount('bti')
						);
						this.SABACountPollingKey = this.VendorSABA.getSportsPollingGlobal(
							'headerCount',
							updateCount('saba')
						);
					} else if (this.state.selectedVendor.name === 'saba') {
						//選中SABA 只刷新IM/BTI Count
						this.VendorSABA.deletePolling(this.SABACountPollingKey);
						this.IMCountPollingKey = this.VendorIM.getSportsPollingGlobal('headerCount', updateCount('im'));
						this.BTICountPollingKey = this.VendorBTI.getSportsPollingGlobal(
							'headerCount',
							updateCount('bti')
						);
					}
				}, initDelay);
			}
		);

		if (sessionStorage.getItem('tutorial')) {
			// 新手教學頁需求: Click the back button will go to the side bar page.
			this.setState({ isSliderLoaded: true, isSliderVisible: true, isFirstEntry: true });
			sessionStorage.removeItem('tutorial');
		}
	}

	componentWillUnmount() {
		this.isDidUnmount = true;
		//刪除數量輪詢key
		if (this.VendorBTI) {
			this.VendorBTI.deletePolling(this.BTICountPollingKey);
		}
		if (this.VendorIM) {
			this.VendorIM.deletePolling(this.IMCountPollingKey);
		}
		if (this.VendorSABA) {
			this.VendorSABA.deletePolling(this.SABACountPollingKey);
		}
		clearTimeout(this.timer);
		clearTimeout(this.initDelayTimer);
	}

	/**
  		* @description:  打开左侧抽屉
  		* @return {*}
  	*/

	SliderChange = () => {
		this.setState({ isSliderLoaded: true, isSliderVisible: true });
	};

	asyncLoadVendors = async () => {
		if (!this.VendorIM) {
			this.VendorIM = (await import('$SBTWOLIB/vendor/im/VendorIM')).default;
		}
		if (!this.VendorSABA) {
			this.VendorSABA = (await import('$SBTWOLIB/vendor/saba/VendorSABA')).default;
		}
		if (!this.VendorBTI) {
			this.VendorBTI = (await import('$SBTWOLIB/vendor/bti/VendorBTI')).default;
		}

		return { VendorIM: this.VendorIM, VendorSABA: this.VendorSABA, VendorBTI: this.VendorBTI };
	};

	//獲取 包含?以及其後的參數
	getUrlParams = () => {
		if (window && window.location && window.location.href && window.location.href.indexOf('?') >= 0) {
			return window.location.href.slice(window.location.href.indexOf('?'));
		}
		return '';
	};

	getBasicInfo = () => {
		this.Checkdomin();
		this.getMainDomain();
		this.getServerUrl();
		this.getMaintenanceStatus();
	};

	//處理deeplink跳轉
	handleDeepLink() {
		//如果有deeplink就直接跳走
		const deeplinkJSON = localStorage.getItem('deeplink');
		if (deeplinkJSON) {
			let deeplinkSetting = JSON.parse(deeplinkJSON);
			//取到 就清理掉deeplink參數
			localStorage.removeItem('deeplink');
			if (
				deeplinkSetting &&
				deeplinkSetting.vendor &&
				deeplinkSetting.sid &&
				deeplinkSetting.eid &&
				deeplinkSetting.lid
			) {
				let targetVendorPage = 'sports-im';
				if (deeplinkSetting.vendor === 'im') {
					targetVendorPage = 'sports-im';
				} else if (deeplinkSetting.vendor === 'bti') {
					targetVendorPage = 'sports-bti';
				} else if (deeplinkSetting.vendor === 'saba') {
					targetVendorPage = 'sports-saba';
				}

				const deepLinkUrl = `/sbtwo/${targetVendorPage}/detail?sid=${deeplinkSetting.sid}&eid=${deeplinkSetting.eid}&lid=${deeplinkSetting.lid}&OE=false`;
				console.log('===deepLinkUrl', deepLinkUrl);
				Router.push(deepLinkUrl);
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
		fetchRequest(ApiPort.Domaincheck + global.location.protocol + '//' + global.location.host + '&', 'GET')
			.then((res) => {
				if (res.isSuccess) {
					if (res.result && res.result.affiliateCode) {
						Cookie.Create('CO_affiliate', 'affiliate=' + res.result.affiliateCode, 30);
					}
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	getVendorToken = async () => {
		//獲取notification配置
		const getNotiPromise = this.getMemberNotificationSetting().catch((e) => console.log(e));

		await this.asyncLoadVendors();

		//IM登入
		const IMloginPromise = this.VendorIM
			.getTokenFromGateway()
			.then((token) => {
				this.props.maintainStatus_noTokenIM(false);
			})
			.catch((e) => {
				this.props.maintainStatus_noTokenIM(true);
				console.log('im login failed', e);
			});
		//BTI登入
		const BTIloginPromise = this.VendorBTI
			.getTokenFromGateway()
			.then((token) => {
				this.props.maintainStatus_noTokenBTI(false);
			})
			.catch((e) => {
				this.props.maintainStatus_noTokenBTI(true);
				console.log('bti login failed', e);
			});

		//SABA登入
		const SABAloginPromise = this.VendorSABA
			.getTokenFromGateway()
			// .then(token => {
			// 	this.props.maintainStatus_noTokenSABA(false);
			// })
			//沙巴特殊，不需要處理noToken 但還是要處理catch 避免獲取失敗 在登入頁卡住
			.catch((e) => {
				//  this.props.maintainStatus_noTokenSABA(true);
				console.log('saba login failed', e);
			});

		//等待異步查詢完成
		const results = await Promise.all([ getNotiPromise, IMloginPromise, BTIloginPromise, SABAloginPromise ]);
	};

	getMainDomain = () => {
		fetchRequest(ApiPort.getMainsiteDomain, 'GET')
			.then((res) => {
				if (res && res.isSuccess && res.result) {
					localStorage.setItem('domains', JSON.stringify(res.result));
				}
			})
			.catch((error) => {
				console.log(error);
			});
	};

	changeHeaderMenu(key, item) {
		sessionStorage.setItem('changeHeaderMenu', JSON.stringify(item));
		sessionStorage.setItem('sburl', item.router);

		if (this.checkMaintenanceStatus(item.name)) {
			return;
		}

		if (item.router) {
			Router.push(item.router);
		} else {
			this.setState({
				isOpen: !this.state.isOpen
			});
		}
		// Pushgtagdata(`Game Nav`, 'View', `${item.piwik}_TopNav_SB2.0`);
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
					if (res && res.result && res.result.memberCode && res.result.notificationSetting) {
						//緩存
						localStorage.setItem(
							'NotificationSetting-' + res.result.memberCode,
							JSON.stringify(res.result.notificationSetting)
						);

						//加載 盤口展示方式
						const savedListDisplayType = res.result.notificationSetting['listDisplayType'];
						let listDisplayType = 1;
						if (parseInt(savedListDisplayType) === 2) {
							listDisplayType = 2;
						}
						that.props.userSetting_updateListDisplayType(listDisplayType);

						resolve(res.result.notificationSetting);
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
				if (res && res.isSuccess && res.result) {
					const total = res.result.unreadPersonalMessageCount + res.result.unreadTransactionCount;
					this.setState({
						StatisticsAll: total
					});
				}
			})
			.catch((error) => {
				console.log(error);
			});
	};

	// 獲取維護資訊
	getMaintenanceStatus = () => {
		const providers = [ 'SBT', 'IPSB', 'OWS' ]; // BTI, IM, SABA
		let processed = [];

		providers.forEach(function(provider) {
			processed.push(fetchRequest(`${ApiPort.GetProvidersMaintenanceStatus}providerCode=${provider}&`));
		});

		Promise.all(processed).then((res) => {
			let BTISportStatus;
			let IMSportStatus;
			let SABASportStatus;

			if (res) {
				console.log(res);
				BTISportStatus = res[0].isSuccess ? res[0].result : false;
				IMSportStatus = res[1].isSuccess ? res[1].result : false;
				SABASportStatus = res[2].isSuccess ? res[2].result : false;

				this.props.maintainStatus_setBTI(BTISportStatus === true);
				this.props.maintainStatus_setIM(IMSportStatus === true);
				this.props.maintainStatus_setSABA(SABASportStatus === true);

				//和token獲取狀態一起判斷
				BTISportStatus = this.checkMaintenanceStatus('bti');
				IMSportStatus = this.checkMaintenanceStatus('im');
				SABASportStatus = this.checkMaintenanceStatus('saba');

				// 都在維修
				if (BTISportStatus && IMSportStatus && SABASportStatus) {
					Router.push('/sbtwo/maintenance');
					return;
				}

				const maintenanceInfoMap = {
					'sports-bti': {
						sport: 'bti',
						name: 'BTI体育',
						isMaintenance: BTISportStatus
					},
					'sports-im': {
						sport: 'im',
						name: 'IM体育',
						isMaintenance: IMSportStatus
					},
					'sports-saba': {
						sport: 'saba',
						name: '沙巴体育',
						isMaintenance: SABASportStatus
					}
				};
				//如果有維修 按優先順序選擇 (直接復用上面的數據)
				const sportPriority = [
					maintenanceInfoMap['sports-im'],
					maintenanceInfoMap['sports-saba'],
					maintenanceInfoMap['sports-bti']
				];
				const { pathname } = this.props.router;
				const nowGame =
					pathname == '/sbtwo/sports-bti'
						? 'sports-bti'
						: pathname == '/sbtwo/sports-im'
							? 'sports-im'
							: pathname == '/sbtwo/sports-saba' ? 'sports-saba' : '';

				const minfo = maintenanceInfoMap[nowGame];
				//當前遊戲正在維修
				if (minfo && minfo.isMaintenance) {
					let targetGame = null;
					//按優先順序 找一個 沒在維護中的遊戲
					for (let spinfo of sportPriority) {
						if (!spinfo.isMaintenance) {
							targetGame = spinfo;
							break;
						}
					}
					if (targetGame === null) {
						//都在維護(理論上不可能跑到這，前面已經先檢查過了)
						Router.push('/sbtwo/maintenance');
					} else {
						this.setState(
							{
								maintenancePopup: true,
								maintenanceSport: minfo.name,
								jumpToSport: targetGame.name
							},
							() => this.maintenanceChangeSports(1, targetGame.sport)
						);
					}
				}
			}
		});
	};

	checkMaintenanceStatus = (name) => {
		const { isBTI, isIM, isSABA, noTokenBTI, noTokenIM, noTokenSABA } = this.props.maintainStatus;
		const { isLogin } = this.props.userInfo; //有登入才額外判斷 token獲取狀態
		switch (name) {
			case 'bti':
				return isBTI || (isLogin && noTokenBTI);
			case 'im':
				return isIM || (isLogin && noTokenIM);
			case 'saba':
				return isSABA || (isLogin && noTokenSABA);
			default:
				return false;
		}
	};

	maintenanceChangeSports = (key, name) => {
		clearTimeout(this.timer);
		let data = this.state.options.find((v) => v.name === name);
		this.timer = setTimeout(() => {
			this.setState(
				{
					maintenancePopup: false
				},
				() => this.changeHeaderMenu(key, data)
			);
		}, 8000);
	};

	// 全局客服
	getServerUrl = () => {
		fetchRequest(ApiPort.GETLiveChat).then((res) => {
			if (res && res.isSuccess && res.result !== localStorage.getItem('serverUrl')) {
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

	/* gameOptionsUI = (key, item) => {
		if (key === 0) {
			return <ReactSVG className="header-select-svg" src="/svg/SanJiao.svg" />;
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
	}; */

	render() {
		const { showAppDownloadBar, closeAppDownloadBar } = this.props;
		const { isSliderLoaded, maintenancePopup, showHomeTips, showAppDownloadPopup } = this.state;
		//console.log(this.state);
		console.log('维护状态---------->', maintenancePopup);
		return (
			<div>
				{showAppDownloadBar ? (
					<div className="sbtwo-appdb-wrapper">
						<ReactSVG className="appdb-button-close" src="/img/svg/close.svg" onClick={closeAppDownloadBar} />
						<ReactIMG src="/img/appdb-icon.png" className="appdb-icon" />
						<div className="appdb-desc">
							<div className="appdb-desc-line1">乐天堂FUN88</div>
							<div className="appdb-desc-line2">亚洲领先体育投注平台</div>
						</div>
						<div
							className="appdb-button-download"
							onClick={() => {
								// Pushgtagdata(`Download Nav`, 'Click', 'Download_TopNav');
								this.setState({ showAppDownloadPopup: true });
							}}
						>
							立即下载
						</div>
					</div>
				) : null}
				<AppDownloadPopup
					visible={showAppDownloadPopup}
					onClose={() => {
						this.setState({ showAppDownloadPopup: false });
					}}
				/>
				<div
					className={'sbtwo-header-wrapper' + (showAppDownloadBar ? ' withAppDownloadbar' : '')}
					id="sbtwo-header-bar"
				>
					{/* <div
						className="header-menu-btn"
						onClick={() => {
							this.setState({ isSliderLoaded: true, isSliderVisible: true });
						}}
					>
						{this.state.StatisticsAll > 0 && <span className="unread-dot" />}
						<ReactSVG className="header-menu-svg" src="/svg/Menu.svg" />
					</div> */}
					{/* <div className={`header-game-select ${this.state.isOpen ? 'open' : ''}`}>
						{this.state.options.map((item, key) => {
							{
								this.gameOptionsUI(key, item);
							}
							return (
								<div
									key={key}
									className={
										typeof item.count === 'string' ||
										(key !== 0 && this.checkMaintenanceStatus(item.name)) ? (
											'maintain-box'
										) : (
											''
										)
									}
									onClick={() => {
										this.changeHeaderMenu(key, item);
									}}
								>
									<label>{item.label}</label>
									{this.gameOptionsUI(key, item)}
								</div>
							);
						})}
					</div> */}
					<div className={`header-game-menu`}>
						{this.state.options.map((item, key) => {
							return (
								<div
									key={key}
									className={classNames(
										{
											Active: this.state.selectedVendor.name == item.name
										},
										'menu-item'
									)}
									onClick={() => {
										this.changeHeaderMenu(key, item);
									}}
								>
									<label>
										{item.label}
										{typeof item.count === 'string' || this.checkMaintenanceStatus(item.name) ? (
											<span className="maintenance">维护</span>
										) : (
											''
										)}
									</label>
								</div>
							);
						})}
					</div>
					<div className="header-tools-wrapper">
						{this.props.userInfo.isLogin && (
							// (this.state.hidePwd ? (
							// 	<div className="header-money hide-box">
							// 		<ReactSVG
							// 			className="header-eye-svg inline-block"
							// 			src="/svg/close_eye.svg"
							// 			onClick={() => {
							// 				this.setState({ hidePwd: false });
							// 			}}
							// 		/>
							// 	</div>
							// ) : (
							// 	<div className="header-money">
							// 		<span className="sport-money">
							// 			<i>￥</i>
							// 			<span>{this.numberWithCommas(this.props.userInfo.balanceSB)}</span>
							// 		</span>
							// 		<ReactSVG
							// 			className="header-eye-svg inline-block"
							// 			src="/svg/eye.svg"
							// 			onClick={() => {
							// 				this.setState({ hidePwd: true });
							// 			}}
							// 		/>
							// 	</div>
							// ))
							<div className="BalanceDropdown">
								<BalanceDropdown type="SB" />
							</div>
						)}
						{/* <ReactSVG
							className="header-money-icon-svg"
							src="/svg/MoneyIcon.svg"
							onClick={() => {
								Router.push('/sbtwo/bet-records?v=' + this.state.selectedVendor.name);
								Pushgtagdata(`Account`, 'View', `BetRecord_TopNav_SB2.0`);
							}}
						/> */}
						<ReactSVG
							className="header-search-svg"
							src="/img/svg/Search.svg"
							onClick={() => {
								Router.push('/sbtwo/search/' + this.state.selectedVendor.name);
								// Pushgtagdata(`Game Nav`, 'Launch', `Search_TopNav_SB2.0`);
							}}
						/>
						<div
							onClick={() => {
								// Pushgtagdata(`CS`, 'Launch', `LiveChat_TopNav_SB2.0`);
							}}
						>
							<Service />
						</div>
					</div>
				</div>
				{isSliderLoaded ? (
					<Slider
						isSliderVisible={this.state.isSliderVisible}
						isFirstEntry={this.state.isFirstEntry}
						isLogin={this.props.userInfo.isLogin}
						balanceSB={this.props.userInfo.balanceSB}
						userName={this.state.memberInfo ? this.state.memberInfo.userName : ''}
						hotEventsVendorName={'im'}
						onClose={() => {
							this.setState({ isSliderVisible: false, isFirstEntry: false });
						}}
						connectShowHotEvents={(func) => (this.showHotEvents = func)}
						onHotEventsClosed={() => {}}
						StatisticsAll={this.state.StatisticsAll}
					/>
				) : null}
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
	userInfo_getBalanceSB: (forceUpdate = false) => ACTION_UserInfo_getBalanceSB(forceUpdate),
	maintainStatus_setBTI: (isMaintenance) => ACTION_MaintainStatus_SetBTI(isMaintenance),
	maintainStatus_setIM: (isMaintenance) => ACTION_MaintainStatus_SetIM(isMaintenance),
	maintainStatus_setSABA: (isMaintenance) => ACTION_MaintainStatus_SetSABA(isMaintenance),
	maintainStatus_noTokenBTI: (isNoToken) => ACTION_MaintainStatus_NoTokenBTI(isNoToken),
	maintainStatus_noTokenIM: (isNoToken) => ACTION_MaintainStatus_NoTokenIM(isNoToken),
	maintainStatus_noTokenSABA: (isNoToken) => ACTION_MaintainStatus_NoTokenSABA(isNoToken),
	userSetting_updateListDisplayType: (currentType) => ACTION_UserSetting_Update({ ListDisplayType: currentType })
};

export default withBetterRouter(connect(mapStateToProps, mapDispatchToProps)(Header));

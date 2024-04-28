/*
 * @Author: Alan
 * @Date: 2022-03-07 11:49:02
 * @LastEditors: Alan
 * @LastEditTime: 2023-02-03 23:43:32
 * @Description: Redux Actions
 * @FilePath: \Mobile\src\lib\redux\actions\UserInfoAction.js
 */
import { getInitialState } from '../reducers/UserInfoReducer';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import { ApiPort as SPORTApiPort } from '$SBTWOLIB/SPORTAPI';
import { getMemberInfo } from '@/api/userinfo';
import Router from 'next/router';
import Toast from '@/components/View/Toast';
export const ACTION_USERINFO_UPDATE = 'ACTION_USERINFO_UPDATE';
import { checkIsLogin,  } from '@/lib/js/util';

//用戶登入
export const ACTION_UserInfo_login = (username = '') => {
	const payload = Object.assign(getInitialState(), {
		isLogin: true,
		username: username
	});

	const action = {
		type: ACTION_USERINFO_UPDATE,
		payload: payload
	};

	if (typeof window !== 'undefined' && window.smarlookGlobe) {
		smarlookGlobe();
		setTimeout(() => {
			smartlook('pause');
		}, 120000);
	}

	return action;
};

//用戶登出
export const ACTION_UserInfo_logout = () => {
	const action = {
		type: ACTION_USERINFO_UPDATE,
		payload: getInitialState()
	};

	return action;
};

export const ACTION_UserInfo_updateBalanceSB = (newBalanceSB) => {
	const action = {
		type: ACTION_USERINFO_UPDATE,
		payload: { balanceSB: newBalanceSB }
	};

	return action;
};

//查詢SB餘額
export const ACTION_UserInfo_getBalanceSB = (forceUpdate = false) => {
	return (dispatch, getState) => {
		if (!getState().userInfo.isLogin) return Promise.resolve(); //沒登入不用處理

		//10秒節流，避免短時間頻繁調用
		if (global._getBalanceSB_throttle_handle && !forceUpdate) {
			//console.log('===太頻繁...跳過getBalanceSB...')
			return Promise.resolve();
		}

		if (!forceUpdate) {
			global._getBalanceSB_throttle_handle = setTimeout(function() {
				clearTimeout(global._getBalanceSB_throttle_handle);
				global._getBalanceSB_throttle_handle = null;
				//console.log('===clear getBalanceSB handle', JSON.stringify(global._getBalanceSB_throttle_handle));
			}, 10 * 1000); //10秒節流
		}

		const updateGettingBalance = {
			type: ACTION_USERINFO_UPDATE,
			payload: { isGettingBalanceSB: true }
		};

		dispatch(updateGettingBalance);

		return fetchRequest(SPORTApiPort.GETBalanceSB, 'GET')
			.then((res) => {
				if (res && res.isSuccess && res.result) {
					let payload = {
						balanceSB: 0,
						isGettingBalanceSB: false
					};

					let data = res.result;

					data.map((item) => {
						//查單個，會返回兩個？第一個還是null？神API
						if (item && item.name === 'SB') {
							payload.balanceSB = item.balance;
						}
					});

					const action = {
						type: ACTION_USERINFO_UPDATE,
						payload: payload
					};

					return dispatch(action);
				} else {
					throw 'no balance data';
				}
			})
			.catch((error) => {
				const updateGettingBalance = {
					type: ACTION_USERINFO_UPDATE,
					payload: { isGettingBalanceSB: false }
				};
				return dispatch(updateGettingBalance);
			});
	};
};

//查詢SB自我限制配置
export const ACTION_UserInfo_getSelfExclusion = (forceUpdate = false) => {
	return (dispatch, getState) => {
		if (!getState().userInfo.isLogin) return Promise.resolve(); //沒登入不用處理

		//10分節流，避免短時間頻繁調用
		if (global._getSelfExclusion_throttle_handle && !forceUpdate) {
			//console.log('===太頻繁...跳過getSelfExclusion...')
			return Promise.resolve();
		}

		if (!forceUpdate) {
			global._getSelfExclusion_throttle_handle = setTimeout(function() {
				clearTimeout(global._getSelfExclusion_throttle_handle);
				global._getSelfExclusion_throttle_handle = null;
				//console.log('===clear getSelfExclusion handle', JSON.stringify(global._getSelfExclusion_throttle_handle));
			}, 10 * 1000 * 600); //10分節流
		}

		return fetchRequest(SPORTApiPort.GetSelfExclusion, 'GET')
			.then((data) => {
				console.log('===GetSelfExclusion', data);

				let payload = { selfExclusionInfo: {} };
				Object.assign(payload.selfExclusionInfo, initialState.selfExclusionInfo);

				//自我限制
				// selfExclusionInfo: {
				//   Status: false, //總開關
				//   DisableDeposit: false, //存款
				//   DisableFundIn: false,  //轉帳
				//   DisableBetting: false, //投注
				//   SelfExcludeSetDate: '2022-01-01T00:00:00.00',
				//   SelfExcludeExpiredDate: '2022-01-01T00:00:00.00',
				//   SelfExcludeDuration: 0,
				//   SelfExclusionSettingID: 0, //1:7天,2:90天,3:永久
				// },

				if (data.result) {
					if (data.result.hasOwnProperty('status')) {
						payload.selfExclusionInfo.Status = data.result.status;
					}
					if (data.result.hasOwnProperty('disableDeposit')) {
						payload.selfExclusionInfo.DisableDeposit = data.result.disableDeposit;
					}
					if (data.result.hasOwnProperty('disableFundIn')) {
						payload.selfExclusionInfo.DisableFundIn = data.result.disableFundIn;
					}
					if (data.result.hasOwnProperty('disableBetting')) {
						payload.selfExclusionInfo.DisableBetting = data.result.disableBetting;
					}
					if (data.result.hasOwnProperty('SelfExcludeSetDate')) {
						payload.selfExclusionInfo.SelfExcludeSetDate = data.result.selfExcludeSetDate;
					}
					if (data.result.hasOwnProperty('SelfExcludeExpiredDate')) {
						payload.selfExclusionInfo.SelfExcludeExpiredDate = data.result.selfExcludeExpiredDate;
					}
					if (data.result.hasOwnProperty('SelfExcludeDuration')) {
						payload.selfExclusionInfo.SelfExcludeDuration = data.result.selfExcludeDuration;
					}
					if (data.result.hasOwnProperty('SelfExclusionSettingID')) {
						payload.selfExclusionInfo.SelfExclusionSettingID = data.result.selfExclusionSettingID;
					}
				}

				const action = {
					type: ACTION_USERINFO_UPDATE,
					payload: payload
				};

				return dispatch(action);
			})
			.catch((error) => {
				console.log('/api/Member/GetSelfExclusionRestriction ERROR:', error);
			});
	};
};

//查詢餘額
export const ACTION_UserInfo_getBalance = (forceUpdate = false) => {
	return (dispatch, getState) => {
		console.log('////////////////////////////////',getState())
		if (!checkIsLogin()) return Promise.resolve(); //沒登入不用處理
	
		//10秒節流，避免短時間頻繁調用
		if (global._getBalance_throttle_handle && !forceUpdate) {
			//console.log('===太頻繁...跳過getBalanceSB...')
			return Promise.resolve();
		}

		if (!forceUpdate) {
			global._getBalance_throttle_handle = setTimeout(function() {
				clearTimeout(global._getBalance_throttle_handle);
				global._getBalance_throttle_handle = null;
				//console.log('===clear getBalance handle', JSON.stringify(global._getBalance_throttle_handle));
			}, 10 * 1000); //10秒節流
		}

		const updateGettingBalance = {
			type: ACTION_USERINFO_UPDATE,
			payload: { isGettingBalance: true, isGettingBalanceSB: true }
		};

		dispatch(updateGettingBalance);
		return fetchRequest(ApiPort.GETALLBalance, 'GET')
			.then((data) => {
				let payload = {
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
				};
				console.log(data);
				if (data.isSuccess) {
					data.result.map((item) => {
						payload[`${item.name}`] = item.balance;
					});
				}
				const action = {
					type: ACTION_USERINFO_UPDATE,
					payload: {
						Balance: payload,
						balanceSB: payload.SB,
						isGettingBalance: false,
						isGettingBalanceSB: false,
						BalanceInit: data.result
					}
				};
				console.log(action);
				return dispatch(action);
			})
			.catch((error) => {
				const updateGettingBalance = {
					type: ACTION_USERINFO_UPDATE,
					payload: { isGettingBalance: false, isGettingBalanceSB: false }
				};
				return dispatch(updateGettingBalance);
			});
	};
};

//查詢用户详情
export const ACTION_User_getDetails = (forceUpdate = false) => {
	return (dispatch, getState) => {
		if (!checkIsLogin()) return Promise.resolve(); //沒登入不用處理

		//10秒節流，避免短時間頻繁調用
		// if (global._getMemberInfo_throttle_handle && !forceUpdate) {
		// 	//console.log('===太頻繁...跳過getMemberInfo...')
		// 	return Promise.resolve();
		// }

		// if (!forceUpdate) {
		// 	global._getMemberInfo_throttle_handle = setTimeout(function() {
		// 		clearTimeout(global._getMemberInfo_throttle_handle);
		// 		global._getMemberInfo_throttle_handle = null;
		// 		//console.log('===clear getMemberInfo handle', JSON.stringify(global._getMemberInfo_throttle_handle));
		// 	}, 10 * 1000); //10秒節流
		// }

		let languageList = [ { key: 'zh-cn', name: '中文' } ];
		let currencyList = [ { key: 'CNY', name: '人民币' }, { key: 'cny', name: '人民币' } ];

		return new Promise((resolve) => {
			getMemberInfo((data) => {
				let memberInfo = data;
				if (memberInfo) {
					const { firstName, identityCard, contacts, language, currency, dob, address } = memberInfo;

					// 手机邮箱
					if (contacts && contacts.length) {
						for (let i = 0; i < contacts.length; i++) {
							let temp = contacts[i];
							if (temp.contactType === 'Phone') {
								memberInfo.phoneNumber = temp.contact;
								memberInfo.phoneStatus = temp.status;
							}
							if (temp.contactType === 'Telegram') {
								memberInfo.telegram = temp.contact;
								memberInfo.telegramStatus = temp.status;
							}
							if (temp.contactType === 'Email') {
								memberInfo.email = temp.contact;
								memberInfo.emailStatus = temp.status;
							} else {
								memberInfo[temp.contactType] = temp.contact;
							}
						}
					}
					// 语言
					if (language) {
						for (let i = 0; i < languageList.length; i++) {
							let temp = languageList[i];
							if (temp.key === memberInfo.language) {
								memberInfo.LanguageName = temp.name;
							}
						}
					}
					// 货币
					if (currency) {
						for (let i = 0; i < currencyList.length; i++) {
							let temp = currencyList[i];
							if (temp.key === memberInfo.currency) {
								memberInfo.CurrencyName = temp.name;
							}
						}
					}
					/* 充值验证步骤 */
					if (!memberInfo.phoneStatus || memberInfo.phoneStatus == 'Unverified') {
						//第1步 跳转到验证手机号码
						memberInfo.DepositBeforeVerify = 'VerifyFirstStep';
					} else if (firstName === '') {
						/* || (!identityCard || identityCard === '') */
						//第2步 跳转到验证真实姓名  废除验证身份证ID
						memberInfo.DepositBeforeVerify = 'VerifySecondStep';
					} else {
						//信息验证完整 进入充值流程
						memberInfo.DepositBeforeVerify = 'DoneVerifyStep';
					}

					/* 提款验证步骤 */
					if (!identityCard || identityCard === '') {
						/* 第1步 身份证  */
						memberInfo.WithdrawalBeforeVerify = 1;
					} else if (!dob || address.city == '') {
						/* 第2步 生日 地址 */
						memberInfo.WithdrawalBeforeVerify = 2;
					} else if (!memberInfo.phoneStatus || memberInfo.phoneStatus == 'Unverified') {
						/* 第3步 手机验证 */
						memberInfo.WithdrawalBeforeVerify = 3;
					} else if (!memberInfo.emailStatus || memberInfo.emailStatus == 'Unverified') {
						/* 第4步 邮箱验证 */
						memberInfo.WithdrawalBeforeVerify = 4;
					} else {
						/* 提款验证完成 */
						memberInfo.WithdrawalBeforeVerify = 'DoneVerifyStep';
					}

					LoginAction(memberInfo);
					resolve(memberInfo);

					let payload = { memberInfo: memberInfo };

					//處理username
					let currentUserName = getState().userInfo.username;
					if (!currentUserName || currentUserName !== memberInfo.username) {
						payload.username = memberInfo.username;
					}

					const action = {
						type: ACTION_USERINFO_UPDATE,
						payload: payload
					};
					return dispatch(action);
				}
				resolve(null);
			}, true);
		});
	};
};

const LoginAction = (data) => {
	localStorage.setItem('memberInfo', JSON.stringify(data));
	localStorage.setItem('username', JSON.stringify(data.userName));
	localStorage.setItem('memberCode', JSON.stringify(data.memberCode)); //用户的memberCode
	localStorage.setItem('PreferWallet', data.preferWallet ? data.preferWallet : ''); //钱包 用户默认设置的首选账户
	localStorage.setItem('LoginOTP', data.loginOTP ? data.loginOTP : ''); //进行身份验证步骤
	localStorage.setItem('Revalidate', data.revalidate ? data.revalidate : '');
	//网站追踪器 记录 memberCode
	if (typeof _paq === 'object') {
		_paq.push([ 'setUserId', data.memberCode ]);
	}

	//　檢測國家
	if (data.currency  && data.currency !== 'vnd' && data.currency !== 'VND') {
		Toast.error('不支援的国家');
		logout(data.language, data.currency, data.userName);
		return;
	}
	// 檢測封鎖的玩家
	// if (data.isGameLock) {
	// 	Toast.error('封锁的帐户');
	// 	logout(data.language, data.currency, data.userName);
	// 	return;
	// }
	//
	let skipOtp = sessionStorage.getItem('skipVerification');
	// 檢測OTP
	const mini = localStorage.getItem('miniurlopen');
	if (data.revalidate) {
		Router.push('/Verify/?type=resetpwd'); //重置密码
	} else if (data.loginOTP && !skipOtp) {
		Router.push('/Verify/?type=loginOTP'); //跳转OTP身份验证
	} else if (mini !== null && mini != 'undefined' && mini == 'true') {
		Router.push('/newyear'); //节日游戏活动页面
	} else {
		// const fromurl = localStorage.getItem('fromurl');
		// if (fromurl && fromurl.length > 0) {
		// 	localStorage.removeItem('fromurl'); //清除
		// 	window.location.href = fromurl;
		// } else {
		// 	Router.push('/');
		// }
	}
	typeof global.smartlook !== 'undefined' && smartlook('identify', data.memberCode);
};

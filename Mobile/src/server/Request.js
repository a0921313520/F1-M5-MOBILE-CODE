/*
 * @Author: Alan
 * @Date: 2022-02-07 11:24:10
 * @LastEditors: Alan
 * @LastEditTime: 2023-08-11 17:11:47
 * @Description: 请求拦截器
 * @FilePath: /Mobile/src/server/Request.js
 */
import HostConfig from './Host.config';
import Toast from '@/components/View/Toast';
import Router from 'next/router';
import { checkIsLogin, setIsLogout, redirectToLogin, postLogin } from '@/lib/js/util';

import { LogPost } from './Log';
import { Cookie } from '@/lib/js/Helper';
const Apiversion = 'api-version=2.0&Platform=Mobile';
let _HttpStatus; //请求状态
export const fetchRequest = (url, method, params = '', withAuth = false, timeout = 600000) => {
	//区分两种Api CMS/Flash
	let isCms = url.indexOf('/vi-vn/api/v1/') != -1;
	// 新增區分 stapi Api
	let isStapi = url.indexOf('/cms/promotions-m3/') != -1;
	let isLoginApi = url.indexOf('/api/Auth/Login') !== -1;
	let header;

	if (
		localStorage.getItem('memberToken') &&
		(checkIsLogin() || withAuth) //特例refresh token 和 getMemberData不需要檢查已登入 for url token 登入
	) {
		header = {
			'Content-Type': 'application/json; charset=utf-8',
			Culture: 'vi-vn',
			token: '71b512d06e0ada5e23e7a0f287908ac1',
			Authorization: JSON.parse(localStorage.getItem('memberToken'))
		};
	} else {
		header = {
			'Content-Type': 'application/json; charset=utf-8',
			Culture: 'vi-vn',
			token: '71b512d06e0ada5e23e7a0f287908ac1'
		};
	}

	//仅Flash会添加
	if (!isCms) {
		header['x-bff-key'] = '51EXaTN7NUeCbjnvg95tgA==';
	}
	return new Promise(async function(resolve, reject) {
		let fetchInitData = {
			method: method,
			headers: header
		};

		if (params !== '') {
			fetchInitData.body = JSON.stringify(params);
		}
		//区分CMS Api
		const apiUrl = url + (isCms ? '' : isStapi ?  '' : isLoginApi ? 'api-version=8.0&Platform=Mobile' : Apiversion);

		// const apiUrl = url + (isCms ? '' : isStapi ?  '' : Apiversion);
		let logData = {method: method, responseStatus: 0, request_time: new Date(), responseData: null};
		timeout_fetch(fetch(apiUrl, fetchInitData), timeout)
			.then(response => {
				//記下 responseStatus
				if (response && response.status) {
					logData.responseStatus = response.status
				}
				return response;
			})
			.then(handleResponse)
			.then((responseData) => {
				logData.responseData = responseData;

				if (responseData && responseData.redirect) {
					LogPost(apiUrl, params, logData); //特殊/報錯流程先log

					var searchURL = window.location.hash;
					searchURL = searchURL.substring(1, searchURL.length);
					var targetPageId = searchURL.split('&')[0].split('=')[1];
					if (responseData.redirect.Code == 'GEN0003') {
						if (targetPageId) {
							window.location.href = responseData.redirect.Message + '?aff=' + targetPageId;
						} else {
							window.location.href = responseData.redirect.Message;
						}
					}
				}
				// EventPage在抽獎時，若response status=500 && errorCode = GEN0006 不需強制登出
				const eventSnatchPrize = window.location.pathname.indexOf("event_15Anni") !== -1 && url.indexOf("MiniGames/SnatchPrize") !== -1
				if (responseData && responseData.errors && responseData.errors.length != 0 && _HttpStatus != 200 && !eventSnatchPrize) {
					console.log("🚀 ~ .then ~ responseData:", responseData)
					LogPost(apiUrl, params, logData); //特殊/報錯流程先log
					
					if (global.isAgainLogin) {
						global.error_details = responseData.errors[0];
						if (global.openLoginFailModal && typeof global.openLoginFailModal === 'function') {
							global.openLoginFailModal();
							global.isAgainLogin = false;
							responseData.json();
							return;
						}
					}
					const ERRORCODE = responseData.errors[0].errorCode;
					switch (ERRORCODE) {
						case 'MEM00145':
							// Globelogout();
							global.HttpStatus = -100;
							Router.push('/restrict');
							break;
						case 'MEM00061':
						case 'MEM00060':
							resolve(responseData);
							// Toast.error('您的帐号无法使用,请联系在线客服!', 2);
							break;
						case 'GEN0002':
							/* 地区访问限制 */
							window.ipErrorDescription = responseData.errors[0].description;
							global.HttpStatus = -100;
							Router.push('/restrict');
							break;
						case 'GEN0001':
							localStorage.setItem("maintenanceCountdown", responseData.error_details.RetryAfter)
							Router.push("/maintenance")
							break;
						case 'GEN0006':
						case 'IDSVR00006':
						case 'VAL99902':
							Toast.error('Vui lòng đăng nhập lại, quyền truy cập đã hết hạn', 3);
							setIsLogout();
							redirectToLogin();
							break;
						case 'VAL99903':
							Toast.error('Vui lòng đăng nhập lại, quyền truy cập đã hết hạn', 3);
							setIsLogout();
							redirectToLogin();
							let getCookie = Cookie.Get('UserInfo');
							let accountInfo = Boolean(getCookie);
							if (Boolean(accountInfo) == false) {
								return false;
							} else {
								let userName = '';
								let passWord = '';
								let i = new Array();
								(i = getCookie.split('&')), (userName = i[0]), (passWord = i[1]);

								postLogin(userName, passWord);
							}

							break;
						case 'GEN0005':
							if (checkIsLogin()) {
								Toast.error('Đăng nhập lại, hệ thống phát hiện bạn đăng nhập nhiều lần', 2);
								setIsLogout();
								redirectToLogin();
							}
							break;
						case "VAL11056":
							Toast.error('Tài khoản ngân hàng đã tồn tại')
							break;
						case 'VAL99904':
							window.location.href = `${process.env.BASE_PATH}/Verify/?type=loginOTP`;
							break;

						default:
							//请提供有效信息以便处理您的请求 忘记密码 400 error
							if (responseData.errors[0].errorCode == 'VAL08005') {
								resolve(responseData);
								return;
							}
							if (responseData.errors[0].errorCode == 'MEM00059'|| 
								responseData.errors[0].errorCode == 'MEM99999' || 
								responseData?.result?.errorCode == 'MEM00141'|| 
								responseData.errors[0].errorCode == 'MEM00051') {
								resolve(responseData);
								return;
							}

							//系统检测到您提交的提款帐户名称和帐户验证名称之间存在差异  400 error
							if (
								responseData.errors[0].errorCode == 'SNC0001' ||
								responseData.errors[0].errorCode == 'SNC0002' ||
								responseData.errors[0].errorCode == 'SNC0003'
							) {
								resolve(responseData);
								return;
							}

							//您暂时不符合此好礼资格， 建议马上存款。400 error
							if (responseData.errors[0].errorCode == 'BP00006') {
								resolve(responseData);
								return;
							}

							//No active Quelea campaig
							if (responseData.errors[0].errorCode == 'VAL14001' ) {
								resolve(responseData);
								return;
							}

							//验证码有误，请检查并确保您输入了正确的验证码。400 error
							if (responseData.errors[0].errorCode == 'P109003' || 
								responseData.errors[0].errorCode == 'VAL18024' || 
								responseData.errors[0].errorCode == 'VAL18023' || 
								responseData.errors[0].errorCode == 'VAL18015' ) {
								resolve(responseData);
								return;
							}

							//用户名或密码无效。400 error （滑动验证调佣）
							if (responseData.errors[0].errorCode == 'MEM00004' || 
								responseData.errors[0].errorCode == 'MEM00041') {
								resolve(responseData);
								return;
							}

							if (responseData.errors[0].errorCode == 'MG99998') {
								resolve(responseData);
								return;
							}

							//进入黑名单页面
							if (responseData.errors[0].errorCode == 'PII00702') {
								resolve(responseData);
								Router.push('/illegal');
								//自動登出
								setTimeout(() => {
									setIsLogout();
								}, 3000);
								return;
							}

							//抱歉，您的存款不成功， 请联系管理员 。
							if (
								responseData.errors[0].errorCode == 'PII00102' ||
								responseData.errors[0].errorCode == 'PII00605' ||
								responseData.errors[0].errorCode == 'P103001' ||
								responseData.errors[0].errorCode == 'P111001' ||
								responseData.errors[0].errorCode == 'P111004' ||
								responseData.errors[0].errorCode == 'P101116' ||
								responseData.errors[0].errorCode == 'P101103' ||
								responseData.errors[0].errorCode == 'P111002' ||
								responseData.errors[0].errorCode == 'P111003' ||
								responseData.errors[0].errorCode == 'VAL03016' ||
								responseData.errors[0].errorCode == 'VAL08052'
							) {
								resolve(responseData);
								return;
							}
							//Revalidate otp 修改密码时新旧密码一样的报错
							if(responseData?.result && responseData?.result?.Code === "MEM00145"){
								resolve(responseData);
								return;
							}
							if(method === "GET" && (url.indexOf("api/Verification/Payment/Phone") !== -1)){
								//添加usdt 钱包 获取剩余验证次数的API
								resolve(responseData);
								return;
							}
							if(method === "POST" && ["api/Verification/Voice","api/Verification/Phone"].find((v)=>url.includes(v))){
								//发送验证码
								resolve(responseData);
								return;
							}
							if (responseData.errors[0]) {
								Toast.error(responseData.errors[0].description || 'Lỗi hệ thống，liên Hệ Live Chat', 2);
							}
					}
				} else {
					resolve(responseData);
					LogPost(apiUrl, params, logData); //正常請求 返回後才log
				}
			})
			.catch((err) => {
				// 网络请求失败返回的数据
				console.log('fetchRequest err:', apiUrl, JSON.stringify(params), JSON.stringify(err));

				reject(err);

				logData.error = err;
				//避免日誌拿到空的error
				if (err && (JSON.stringify(err) === '{}')) {
					let newError = {};
					if (err.message) {
						newError.message = err.message;
					}
					if (err.stack) {
						newError.stack = err.stack;
					}
					if (JSON.stringify(newError) !== '{}') {
						logData.error = newError;
					}
				}
				LogPost(apiUrl, params, logData);
			});
	});
};

export const timeout_fetch = (fetch_promise, timeout = 600000) => {
	let timeout_fn = null;
	let timeout_promise = new Promise(function(resolve, reject) {
		timeout_fn = function() {
			reject('请求超时!!!');
		};
	});
	let abortable_promise = Promise.race([ fetch_promise, timeout_promise ]);
	setTimeout(function() {
		timeout_fn();
	}, timeout);

	return abortable_promise;
};

function handleResponse(response) {
	let contentType = response.headers.get('content-type');
	if (contentType.includes('application/json')) {
		return handleJSONResponse(response);
	} else if (contentType.includes('text/html')) {
		return handleTextResponse(response);
	} else {
		// Other response types as necessary. I haven't found a need for them yet though.
		throw new Error(`Sorry, content-type ${contentType} not supported`);
	}
}

function handleJSONResponse(response) {
	_HttpStatus = response.status;
	return response.json();
}

function handleTextResponse(response) {
	_HttpStatus = response.status;
	return response.text();
}

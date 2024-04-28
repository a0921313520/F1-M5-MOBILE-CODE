/*
 * @Author: Alan.wu
 * @Date: 2019-11-19 17:42:28
 * @Last Modified by: Andy
 * @Last Modified time: 2023-04-10 14:48:00
 */
import Toast from '$SBTWO/Toast';
import Router from 'next/router';
import { checkIsLogin, setIsLogout, redirectToLogin, getSbToken } from './js/util';
import { ApiPort } from './SPORTAPI';
import { vendorStorage } from "./vendor/vendorStorage";
import HostConfig from "./vendor/vendorHostConfig";

const Apiversion = 'api-version=3.0&brand=FUN88&siteId=44&Platform=SB2Mobile';
const Apiversion20 = 'api-version=2.0&Platform=Mobile';
import {sbtFetch} from 'sbtech-general-api-client'
import { LogPost } from "../../server/Log";
let _HttpStatus; //请求状态
const from = "SB";

export const fetchRequest = (url, method, params = '', withAuth = false, timeout = 600000) => {
	let thisAPiVersion = Apiversion;
	let thisBffKey = '3uJfUBFtI0GAPxK8iMzNGg==';
	if (url === ApiPort.GetSelfExclusion) {
		thisAPiVersion = Apiversion20;
		thisBffKey = '51EXaTN7NUeCbjnvg95tgA==';
	}

	let header;
	if (
		localStorage.getItem('memberToken') &&
		(checkIsLogin() || withAuth) //特例refresh token 和 getMemberData不需要檢查已登入 for url token 登入
	) {
		header = {
			'Content-Type': 'application/json; charset=utf-8',
			Culture: 'ZH-CN',
			'x-bff-key': thisBffKey,
			Authorization: JSON.parse(localStorage.getItem('memberToken'))
		};
	} else {
		header = {
			'Content-Type': 'application/json; charset=utf-8',
			Culture: 'ZH-CN',
			'x-bff-key': thisBffKey
		};
	}
	return new Promise(function(resolve, reject) {
		let fetchInitData = {
			method: method,
			headers: header
		};

		if (params !== '') {
			fetchInitData.body = JSON.stringify(params);
		}

		const apiUrl = url + thisAPiVersion;
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
					LogPost(apiUrl, params, logData, {from}); //特殊/報錯流程先log
					
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
				if (responseData && responseData.errors && responseData.errors.length != 0 && _HttpStatus != 200) {
					LogPost(apiUrl, params, logData, {from}); //特殊/報錯流程先log
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
							Toast.error('您的帐号无法使用,请联系在线客服!', 2);
							break;
						case 'GEN0002':
							/* 地区访问限制 */
							global.HttpStatus = -100;
							Router.push('/restrict');
							break;
						case 'GEN0001':
							window.location.assign('/static/Maintenance.html');
							break;
						case 'GEN0006':
						case 'IDSVR00006':
						case 'VAL99902':
							Toast.error('Vui lòng đăng nhập lại, quyền truy cập đã hết hạn', 3);
							setIsLogout();
							redirectToLogin();
							break;
						case 'GEN0005':
							if (checkIsLogin()) {
								Toast.error('Đăng nhập lại, hệ thống phát hiện bạn đăng nhập nhiều lần', 2);
								setIsLogout();
								redirectToLogin();
							}
							break;
						case 'VAL99904':
							window.location.href = `${process.env.BASE_PATH}/Verify/?type=loginOTP`;
							break;
						case 'VAL17003':
							reject(responseData.errors[0]);
							//不弹此状态的错误消息，sb20全部维护的状态
							break;
						default:
							Toast.error(responseData.errors[0].description || 'Lỗi hệ thống，liên Hệ Live Chat', 2);
							reject(responseData.errors[0]);
							break;
					}
				} else {
					resolve(responseData);
					LogPost(apiUrl, params, logData, {from}); //正常請求 返回後才log
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
				LogPost(apiUrl, params, logData, {from});
			});
	});
};

const needLogApis = ["login"]
export const fetchRequestSBNew = (url, method, params = '', withAuth = false, timeout = 600000) => {
	let header = {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	};

	// 新api的token
	let parsedToken = JSON.parse(localStorage.getItem("newSbToken"));

	if (parsedToken) {
		header.Authorization =  'Bearer ' + parsedToken;
	}

	return new Promise(function(resolve, reject) {
		let fetchInitData = {
			method: method,
			headers: header
		};

		if (params) {
			fetchInitData.body = JSON.stringify(params);
		}

		let apiUrl = HostConfig.Config.sbNewHostApi + url;
		const neeedLog = needLogApis.includes(url);

		let responseObj;
		let logData = {method: method, responseStatus: 0, request_time: new Date(), responseData: null};
		timeout_fetch(fetch(apiUrl, fetchInitData), timeout)
			.then(response => {
				//記下 responseStatus
				if (response && response.status) {
					logData.responseStatus = response.status
				}
				responseObj = response;
				return response.json();
			})
			.then((responseData) => {
				if(neeedLog){
					logData.responseData = responseData;
				}
				if(!responseObj.ok){
					neeedLog && LogPost(apiUrl, params, logData, {from}); //特殊/報錯流程先log
					throw responseData;
				}
				resolve(responseData);
				neeedLog && LogPost(apiUrl, params, logData, {from}); //正常請求 返回後才log
			})
			.catch((err) => {
				sbErrorHandle(err)
					.then(() => {
						// 如果 sbErrorHandle 成功返回，说明token过期并已刷新，重试API请求
						fetchRequestSBNew(url, method, params, withAuth, timeout).then(resolve).catch(reject);
					})
					.catch((err) => {
						console.log('fetchRequest err:', JSON.stringify(err));
						reject(err);

						if(neeedLog){
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
							LogPost(apiUrl, params, logData, {from});
						}
					});
			});
	});
};

const sbErrorHandle = (err) => {
	const errorCode = Number(err?.Error?.code);
	// token過期
	if (!isNaN(errorCode) && errorCode === 61017) {
		return getSbToken(true)
			.catch(() => {
				console.error("get token失敗");
				throw err;
			});
	} else {
		console.log(err);
		throw err;
	}
}

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

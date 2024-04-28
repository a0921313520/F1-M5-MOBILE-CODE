import { fetchRequest } from '$SBTWOLIB/SportRequest';
import { ApiPort } from '$SBTWOLIB/SPORTAPI';
import Toast from '$SBTWO/Toast';
import { Cookie } from '$SBTWOLIB/js/Helper';
import { checkIsLogin, setIsLogout } from '$SBTWOLIB/js/util';

// 获取用户账户信息以及设置为LocalStorage
export function getMemberInfo(call, refresh) {
	//console.log(call, refresh);
	const localMemberInfo = localStorage.getItem('memberInfo');
	let memberInfo = {};

	if (localMemberInfo === null || localMemberInfo === '' || refresh) {
		fetchRequest(ApiPort.Member, 'GET')
			.then((res) => {
				if (res && res.isSuccess && res.result) {
					res.result.memberInfo.contacts.forEach((val) => {
						res.result.memberInfo['isVerified' + val.contactType] = [
							val.contact,
							val.Status === 'Verified'
						];
					});

					Object.assign(memberInfo, res.result.memberInfo);
				}

				const memberInfoString = JSON.stringify(memberInfo);
				console.log(memberInfoString);
				localStorage.setItem('memberInfo', memberInfoString === '{}' ? '' : memberInfoString);
				call(memberInfo);
			})
			.catch((error) => {
				console.log('getMemberInfo(GETMemberlistAPI) error:', error);
				return null;
			});
	} else {
		call(JSON.parse(localMemberInfo));
	}
}

// 设置用户真实姓名
export function setUserRealyName(name, call) {
	fetchRequest(ApiPort.Member, 'PATCH', {
		key: 'FirstName',
		value1: name
	})
		.then((res) => {
			if (res) {
				if (res.isSuccess == true) {
					Toast.success('Cập Nhật Thành Công');
				} else if (res.isSuccess == false) {
					Toast.error(res.result.Message);
				}
				call(res);
			}
		})
		.catch((error) => {
			console.log('setUserRealyName error:', error);
			return null;
		});
}

//存款前 提交真實姓名和銀行卡
export function setUserRealyNameAndBankCard(name, bankName, accountNumber, call) {
	fetchRequest(ApiPort.PostBankCardVerification, 'POST', {
		realName: name,
		bankName: bankName,
		accountNumber: accountNumber,
	})
		.then((res) => {
			if (res) {
				// if (res.isSuccess == true) {
				// 	Toast.success('更新成功!');
				// } else
				// if (res.isSuccess == false) {
				// 	Toast.error(res.result.Message);
				// }
				call(res);
			}
		})
		.catch((error) => {
			console.log('setUserRealyName error:', error);
			return null;
		});
}

//验证充值之前 填写资料的次数 如果失败 就直接进入 超过验证次数限制页面
export function getResendAttempt(call, serviceAction = 'BankCardVerification', channel = 'SMS') {
	fetchRequest(`${ApiPort.ResendAttempt}serviceAction=${serviceAction}&channelType=${channel}&`, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('getResendAttempt error:', error);
			return null;
		});
}

export function setMemberInfo(data, call) {
	fetchRequest(ApiPort.PUTMemberlistAPI, 'PATCH', data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('setMemberInfo error:', error);
			return null;
		});
}

export function setMemberInfoPut(data, call) {
	fetchRequest(ApiPort.PUTMemberlistAPI, 'PUT', data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('setMemberInfo error:', error);
			return null;
		});
}

// 获取密保问题
export function getQuestion(call) {
	fetchRequest(ApiPort.GetQuestions, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('getQuestion error:', error);
			return null;
		});
}

export function backToMainsite(link) {
	let affCode;
	if (Cookie.GetCookieKeyValue('CO_Referer') || sessionStorage.getItem('affCode')) {
		affCode = Cookie.GetCookieKeyValue('CO_Referer') || sessionStorage.getItem('affCode');
	}

	let targetDomain = '';
	let StagingApi = Boolean(
		[
			'sportsstaging.fun88.biz',
			'sports1staging.fun88.biz',
			'sports2staging.fun88.biz',
			'sports3staging.fun88.biz',
			'sports4staging.fun88.biz',
			'sports5staging.fun88.biz',
			'localhost:6868',
			'localhost:8080',
			'192.168.0.108:8080',
			'192.168.137.1:6868',
			'192.168.0.108:6868',
			'127.0.0.1:6868'
		].find((v) => global.location.href.includes(v))
	);

	//　測試環境
	if (StagingApi) {
		targetDomain = 'http://member.stagingp4.fun88.biz/';
		// 訪客導回
		if (!checkIsLogin()) {
			window.location.href = `${targetDomain}${affCode ? '?aff=' + affCode : ''}`;
			return;
		}
		// 會員導回
		const url = new URL(targetDomain);
		const token = JSON.parse(localStorage.getItem('memberToken'));
		const refreshToken = JSON.parse(localStorage.getItem('refreshToken'));
		if (link) {
			/* 如果未登录 会自动跳转去login */
			let mainsiteServiceLink = `${url.protocol}//${url.hostname}/${link}`;
			window.location.href = mainsiteServiceLink;
			return;
		}
		if (url && token) {
			let mainsiteServiceLink = `${url.protocol}//${url.hostname}/Services/SBV2Service.ashx?token=${token.split(
				' '
			)[1]}&rtoken=${refreshToken}&cultureLanguage=zh-cn`;
			console.log(mainsiteServiceLink);
			window.location.href = mainsiteServiceLink;
		}
	} else {
		// 正式環境
		const url = new URL(global.location.href);
		targetDomain =
			url.hostname.split('.').length == 3
				? `${url.protocol}//${url.hostname.split('.')[1]}.${url.hostname.split('.')[2]}`
				: `${url.protocol}//${url.hostname}`;

		// 訪客導回
		if (!checkIsLogin()) {
			window.location.href = `${targetDomain}${affCode ? '?aff=' + affCode : ''}`;
			return;
		}
		// 會員導回
		const token = JSON.parse(localStorage.getItem('memberToken'));
		const refreshToken = JSON.parse(localStorage.getItem('refreshToken'));
		if (link) {
			/* 如果未登录 会自动跳转去login */
			let mainsiteServiceLink = `${url.protocol}//${url.hostname}/${link}`;
			window.location.href = mainsiteServiceLink;
			return;
		}
		if (url && token) {
			let mainsiteServiceLink = `${targetDomain}/Services/SBV2Service.ashx?token=${token.split(
				' '
			)[1]}&rtoken=${refreshToken}&cultureLanguage=zh-cn`;
			console.log(mainsiteServiceLink);
			window.location.href = mainsiteServiceLink;
		}
	}
}

// 登出
export function logout(language, currency, userName) {
	let memberData = JSON.parse(localStorage.getItem('memberInfo'));
	let accessToken = localStorage.getItem('memberToken').split(' ')[1];
	let data = {
		client_id: 'Fun88.CN.App',
		client_secret: 'FUNmuittenCN',
		refresh_token: localStorage.getItem('refreshToken'),
		access_token: accessToken ? accessToken : 'Bearer ' + localStorage.getItem('memberToken'),
		membercode: userName ? userName : memberData.UserName,
		siteId: 31
	};

	fetchRequest(ApiPort.Logout, 'POST', data)
		.then((data) => {
			if (data.status === 1) {
				let defaultDomain = JSON.parse(localStorage.getItem('domains'))['defaultDomain'];

				setIsLogout();

				if (language && currency) {
					let CurrencyCode = currency.split('').slice(0, currency.length - 1).join('');
					let LanguageCode = language.split('-')[1];
					if (currency.toUpperCase()  !== 'CNY') {
						let url = new URL(defaultDomain);
						let goToUrl = `${url.protocol}//${url.host}/${CurrencyCode}/${LanguageCode}`;
						console.log(goToUrl);
						window.location.href = goToUrl;
						return;
					}
				}

				window.location.href = defaultDomain;
			} else {
				console.log(data.message);
			}
		})
		.catch((error) => {
			console.log(error);
		});
}

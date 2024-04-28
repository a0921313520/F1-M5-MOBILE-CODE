import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { ACTION_RouterLog_log } from '@/lib/redux/actions/RouterLogAction';
import Router from 'next/router';
import HostConfig from '@/server/Host.config';
import { checkIsLogin, redirectToLogin } from '@/lib/js/util';

function RouteFilter() {
	const { pathname, events } = useRouter();
	//允許不用登入就可以看的頁面
	const noLoginPaths = [
		'/',
		'/?*', //跳轉登入 或 帶參數
		'/register_login',
		'/register_login/*',
		'/help',
		'/help/Detail*',
		'/help/sponsorship',
		'/help/sponsorship/*',
		'/404',
		'/maintenance',
		'/restrict',
		'/About/*',
		'/diamond-club',
		'/diamond-club/',
		'/diamond-club/*',
		'/daily-gift',
		'/daily-gift/*',
		'/forget-password',
		'/forget-password/*',
		'/Games/*',
		'/KingClub',
		'/KingClub/*',
		'/me',
		'/me/*',
		'/promotions',
		'/promotions/*',
		'/referrer-activity',
		'/referrer-activity/*',
		'/event_MidAutumn2022',
		'/event_nationalday2022',
		'/event_WC2022',
		'/event_WC2022/',
		'/event_WC2022/*',
		'/event_CNY2023',
		'/event_CNY2023/',
		'/event_CNY2023/*',
		'/event_LaborDay2023',
		'/resetpassword',
		'/resetpassword/',
		'/resetpassword/*',
		'/News/Details',
		'/News/Details/*',
		'/News',
		'/Deposit/DetailsInfo',
		'/Deposit/DetailsInfo/*',
		'/safehouse',
		'/safehouse/*',
		//SB 2.0相關
		'/sbtwo',
		'/sbtwo/?*', //跳轉登入 或 帶參數
		'/sbtwo/sports-bti',
		'/sbtwo/sports-bti/*',
		'/sbtwo/sports-im',
		'/sbtwo/sports-im/*',
		'/sbtwo/sports-saba',
		'/sbtwo/sports-saba/*',
		'/sbtwo/Promotions',
		'/sbtwo/rule',
		'/sbtwo/rule/*',
		'/sbtwo/search/*',
		'/sbtwo/tutorial/*',
		'/sbtwo/share',
		'/sbtwo/share/*',
		'/sbtwo/sports-bti-demo',
		'/sbtwo/sports-im-demo',
		'/sbtwo/sports-saba-demo',
		'/sbtwo/maintenance'
	];

	//測試環境才有的頁面
	const devOnlyPaths = [ '/sbtwo/sports-bti-demo*', '/sbtwo/sports-im-demo*', '/sbtwo/sports-saba-demo*' ];

	//需要紀錄的網址
	const historyPaths = [ '/sbtwo/sports-bti/*', '/sbtwo/sports-im/*', '/sbtwo/sports-saba/*' ];

	const cleanPath = (path) => {
		if (path === '/') {
			return path;
		}

		if (process.env.BASE_PATH && process.env.BASE_PATH !== '' && process.env.BASE_PATH.length > 0) {
			if (path === process.env.BASE_PATH) {
				return '/';
			}

			//去除開頭的子目錄名
			var regex = '^\\' + process.env.BASE_PATH;
			var re = new RegExp(regex, 'g');
			console.log('before replace', regex, path);
			path = path.replace(re, '');
			console.log('after replace', path);
			if (path === '' || path === '/') {
				return '/';
			}
		}

		return path.replace(/\/+$/g, ''); //去除尾巴的'/'
	};

	const getPathName = (url) => {
		if (url) {
			const questionIndex = url.indexOf('?');
			let newUrl = url;
			if (questionIndex !== -1) {
				newUrl = url.substring(0, questionIndex);
				return newUrl.replace(/\/+$/g, ''); //去除尾巴的'/'
			}
		}
		return url;
	};

	//支持*匹配
	const wildcardMatch = (str, rule) => {
		var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/gi, '\\$1');
		return new RegExp('^' + rule.split('*').map(escapeRegex).join('.*') + '$').test(str);
	};
	const wildcardMatches = (str, rules) => {
		for (const thisrule of rules) {
			const thisresult = wildcardMatch(str, thisrule);
			////console.log('=====wildcardMatches',thisresult, str,thisrule);
			if (thisresult) {
				return true;
			}
		}
		return false;
	};

	const dispatch = useDispatch();

	//獲取 包含?以及其後的參數
	const getUrlParams = () => {
		//console.log(window && window.location && window.location.href && window.location.href.indexOf('?') >= 0);
		if (window && window.location && window.location.href && window.location.href.indexOf('?') >= 0) {
			return window.location.href.slice(window.location.href.indexOf('?'));
		}
		//console.log(window.location.href.slice(window.location.href.indexOf('?')));
		return '';
	};

	const cancellationError = () => {
		return Object.assign(new Error('Route Cancelled'), {
			cancelled: true
		});
	};

	//處理路由變更
	const handleRouteChange = (url, routeProps, isInitCall = false) => {
		const isLogin = checkIsLogin();
		const isCurrentRoute = isInitCall ? true : pathname === url;
		const cleanUrl = cleanPath(url);

		if (isCurrentRoute) {
			console.log(
				'=====RouteChange current route: ',
				'router pathname:',
				pathname,
				', history change url:',
				url,
				', cleanurl:',
				cleanUrl,
				', isNologinUrl:',
				wildcardMatches(cleanUrl, noLoginPaths),
				', memberIsLogined:',
				isLogin
			);
		} else {
			console.log(
				'=====RouteChange NEW route: ',
				'router pathname:',
				pathname,
				', history change url:',
				url,
				', cleanurl:',
				cleanUrl,
				', isNologinUrl:',
				wildcardMatches(cleanUrl, noLoginPaths),
				', memberIsLogined:',
				isLogin
			);
		}

		//處理默認體育頁 用replace避免 按下back按鈕 會一直卡在首頁的問題
		if (cleanUrl === '/sbtwo') {
			const urlParams = getUrlParams(); //跳轉 要加上原本在/帶入的 網址參數
			const sportPagePath = '/sbtwo/sports-' + HostConfig.Config.defaultSport;

			dispatch(ACTION_RouterLog_log(sportPagePath, sportPagePath));
			if (isCurrentRoute) {
				//用replace避免返回 / 頁面
				Router.replace(sportPagePath + urlParams);
			} else {
				Router.push(sportPagePath + urlParams);
			}
			if (isInitCall) {
				return; //首次加載的手動呼叫不可以丟出例外，因為不是由beforeHistoryChange來的，不會被捕捉，頁面會直接報錯
			} else {
				throw cancellationError(); //丟出例外 取消當前跳轉某頁的動作
			}
		}

		//處理特殊測試頁面
		if (HostConfig.Config.isLIVE && wildcardMatches(cleanUrl, devOnlyPaths)) {
			//console.log('=====redirect to 404',HostConfig.Config.isLIVE);
			if (isCurrentRoute) {
				//用replace避免返回頁面
				Router.replace('/404');
			} else {
				Router.push('/404');
			}
			if (isInitCall) {
				return; //首次加載的手動呼叫不可以丟出例外，因為不是由beforeHistoryChange來的，不會被捕捉，頁面會直接報錯
			} else {
				throw cancellationError(); //丟出例外 取消當前跳轉某頁的動作
			}
		}

		//處理登入態檢查
		if (!wildcardMatches(cleanUrl, noLoginPaths) && !isLogin) {
			//console.log('=====redirect to login', isLogin);
			const urlParams = getUrlParams(); //跳轉 要加上原本在/帶入的 網址參數
			if (isCurrentRoute) {
				redirectToLogin(urlParams, true);
			} else {
				redirectToLogin(urlParams, false);
			}
			if (isInitCall) {
				return; //首次加載的手動呼叫不可以丟出例外，因為不是由beforeHistoryChange來的，不會被捕捉，頁面會直接報錯
			} else {
				throw cancellationError(); //丟出例外 取消當前跳轉某頁的動作
			}
		}

		//處理OTP驗證
		if (isLogin && !wildcardMatches(cleanUrl, [ '/Verify', '/Verify/*' ])) {
			const loginOtp = localStorage.getItem('LoginOTP');
			const revalidate = localStorage.getItem('Revalidate');
			let skipOtp = sessionStorage.getItem('skipVerification');
			if (revalidate == 'true' && revalidate != 'undefined') {
				//Router.push('/Verify/?type=resetpwd');
				if (isInitCall) {
					return; //首次加載的手動呼叫不可以丟出例外，因為不是由beforeHistoryChange來的，不會被捕捉，頁面會直接報錯
				} else {
					throw cancellationError(); //丟出例外 取消當前跳轉某頁的動作
				}
			} else if (loginOtp == 'true' && loginOtp != 'undefined' && !skipOtp) {
				Router.push('/Verify/?type=loginOTP');
				if (isInitCall) {
					return; //首次加載的手動呼叫不可以丟出例外，因為不是由beforeHistoryChange來的，不會被捕捉，頁面會直接報錯
				} else {
					throw cancellationError(); //丟出例外 取消當前跳轉某頁的動作
				}
			}
		}

		//紀錄SB2.0網址變化
		if (!isCurrentRoute && wildcardMatches(cleanUrl, historyPaths)) {
			const cleanUrlPathName = getPathName(cleanUrl);
			//console.log('=====RouteChange wildcardMatches', cleanUrlPathName, cleanUrl)
			dispatch(ACTION_RouterLog_log(cleanUrlPathName, cleanUrl));
		}
	};

	//等同didmount 只會調用一次
	useEffect(
		() => {
			console.log('===RouteFilter didmount path:', pathname);

			//首次加載app不會觸發RouteChange事件，手動呼叫一次
			handleRouteChange(pathname, {}, true);

			// Monitor routes
			events.on('beforeHistoryChange', handleRouteChange); //用beforeHistoryChange才支持丟出例外 取消跳轉
			return () => {
				events.off('beforeHistoryChange', handleRouteChange);
			};
		},
		[ pathname ]
	);

	return <React.Fragment />;
}

export default RouteFilter;

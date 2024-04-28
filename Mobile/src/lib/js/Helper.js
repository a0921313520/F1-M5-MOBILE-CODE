// import 'url-search-params-polyfill' // 兼容 URLSearchParams
import { fetchRequest } from '@/server/Request';
import HostConfig from '@/server/Host.config';

export function isMobile() {
	var check = false;
	(function(a) {
		if (
			/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
				a
			) ||
			/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
				a.substr(0, 4)
			)
		)
			check = true;
	})(navigator.userAgent || navigator.vendor || window.opera);
	return check;
}

export function isMobileAndroid() {
	var isMobile = {
		Android: function() {
			return navigator.userAgent.match(/Android/i);
		}
	};

	return isMobile.Android();
}

export function isMobileIOS() {
	var isMobile = {
		iOS: function() {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		}
	};

	return isMobile.iOS();
}
export function getStyle(element, attr) {
	if (element.currentStyle) {
		return element.currentStyle[attr];
	} else {
		return window.getComputedStyle(element, null)[attr];
	}
}
export const getUrlVars = () => {
	let vars = {};
	const hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for (var i = 0; i < hashes.length; i++) {
		let hash = hashes[i].split('=');
		if (hash[1]) {
			vars[hash[0]] = hash[1].split('#')[0];
		}
	}
	return vars;
};

export const getStrQuery = (Url) => {
	let vars = {};
	const hashes = Url.slice(Url.indexOf('?') + 1).split('&');
	for (var i = 0; i < hashes.length; i++) {
		let hash = hashes[i].split('=');
		if (hash[1]) {
			vars[hash[0]] = hash[1].split('#')[0];
		}
	}
	return vars;
};

export const urlVarsToQueryString = (vars, removeVarProps = []) => {
	//順便指定移除特定參數
	if (removeVarProps && removeVarProps.length > 0) {
		removeVarProps.map((prop) => {
			delete vars[prop];
		});
	}

	let varArr = [];
	for (let prop in vars) {
		varArr.push(prop + '=' + vars[prop]);
	}
	if (varArr.length > 0) {
		return '?' + varArr.join('&');
	}
	return '';
};

export const checkAffQueryString = (querystring) => {
	// ?aff=808296&media=jtoq&web=0&referrer=https://bbs.hubaobo.com/forum.php
	if (querystring !== '') {
		var urlParams = new URLSearchParams(querystring);
		//console.error('cookie : ',urlParams.get('aff'))
		if (urlParams.has('aff')) Cookie.Create('CO_affiliate', 'affiliate=' + urlParams.get('aff'), 2);
		if (urlParams.has('media')) Cookie.Create('CO_Media', 'Media=' + urlParams.get('media'), 2);
		if (urlParams.has('web')) Cookie.Create('CO_WebStieID', 'WebStieID=' + urlParams.get('web'), 2);
		if (urlParams.has('referrer')) Cookie.Create('CO_Referer', 'Referer=' + urlParams.get('referrer'), 2);
		if (urlParams.has('raf')) sessionStorage.setItem('ReferCode', urlParams.get('raf'));
	}
};

export async function getAffiliateCode() {
	let data = await fetchRequest('/api/App/AffiliateLM?domain=' + HostConfig.Config.DefaultDomain + '&', 'GET');
	let affCode = data ? data.result.affiliateCode : '';
	// var affCode = await getAffiliateReferralCode();
	if (affCode === '') {
		affCode = Cookie.GetCookieKeyValue('CO_affiliate') !== null ? Cookie.GetCookieKeyValue('CO_affiliate') : '';
	}
	return affCode;
}

export function getAffCode() {
	if (Cookie.GetCookieKeyValue('CO_affiliate') != '') {
		return Cookie.GetCookieKeyValue('CO_affiliate');
	} else if (sessionStorage.getItem('affCode')) {
		return sessionStorage.getItem('affCode');
	}
	return null;
}

//获取推荐好友代码
export function getrafCode() {
	if (sessionStorage.getItem('ReferCode')) {
		return sessionStorage.getItem('ReferCode');
	}
	return null;
}

export function getAffParam() {
	const affcode = getAffCode();
	const rafcode = getrafCode();
	let affparam = '';

	if (affcode) {
		affparam = '?aff=' + affcode;
	}

	if (affcode && rafcode) {
		affparam = '?aff=' + affcode;
	}

	if (rafcode) {
		affparam = '?raf=' + rafcode;
	}
	return affparam;
}

export const Cookie = {
	Create: (name, value, days) => {
		let expires;
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
			expires = '; expires=' + date.toGMTString();
		} else {
			expires = '';
		}
		let domain = document.location.hostname;
		let domainSplits = domain.split('.');
		let isIPDomain = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(
			domain
		);
		if (!(domainSplits.length === 1) && !isIPDomain) {
			if (domainSplits.length >= 3) {
				domainSplits = domainSplits.slice(-2);
				domain = '.' + domainSplits.join('.');
			} else {
				domain = '.' + domainSplits.join('.');
			}
		}
		var encodeValue = encodeURIComponent(value);
		//console.error("encodevalue: ",encodeValue);
		document.cookie = name + '=' + encodeValue + expires + '; path=/; domain=' + domain;
		// document.cookie = name + '=' + value + expires + '; path=/;';
	},
	Delete: (cookieName) => {
		Cookie.Create(cookieName, '', -1);
		document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
	},
	Get: (cookieName) => {
		var name = cookieName + '=';
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return '';
	},
	GetCookieKeyValue: (cookieName) => {
		let aff = Cookie.Get(cookieName);
		return aff ? aff.split('=')[1] || aff.split('=')[0] : '';
	}
};

/**
 * OTP 验证对应的 serveraction
 */
 export const otpServiceActionList = {
    "loginOTP":"OTP",
    "resetpwd":"Revalidate",
	"withdraw-otp":"WithdrawalVerification",
	"ProfileOTP":"ContactVerification"
}
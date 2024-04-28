/*
 * @Author: Alan
 * @Date: 2022-03-07 11:49:02
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-14 14:12:48
 * @Description: 全局函数
 * @FilePath: \Mobile\src\lib\js\Globalfun.js
 */
if (process.browser) {

	let piwikTimer = null;
	let piwikUrl = [];
	const baseUrl = window.location.origin + process.env.BASE_PATH +"/" ;

	function pushUrl(_paq, url, trackingTitle, isTrackPageView, isOnlyBaseUrl ) {
		// 這塊貌似可以不要? 當傳入的url與現行網站的url相同是會被擋住，其目的為何?
		// if (!window.piwikLoadFinished && ~window.location.href.indexOf(url)) {
		// 		return;
		// 	}
			trackingTitle && _paq.push(["setDocumentTitle", trackingTitle])
			_paq.push(["setCustomUrl", isOnlyBaseUrl? baseUrl :url]);
			isTrackPageView && _paq.push(["trackPageView"]);
	}

	global.Pushgtagpiwikurl = (url,trackingTitle=false, isTrackPageView = true, isOnlyBaseUrl = false, ) => {
		if (!url && !isOnlyBaseUrl) {
			return;
		} else {
			url = baseUrl + url + "/";
		}
		if (typeof _paq === "object") {
			pushUrl(_paq, url, trackingTitle, isTrackPageView, isOnlyBaseUrl);
		} else {
			piwikUrl.push(url);
					clearInterval(piwikTimer);
					piwikTimer = setInterval(() => {
							if (typeof _paq === "object") {
									clearInterval(piwikTimer);
									Array.isArray(piwikUrl) &&
											piwikUrl.length &&
											piwikUrl.forEach((v) => {
													pushUrl(_paq, v, trackingTitle, isTrackPageView, isOnlyBaseUrl);
											});
									piwikUrl = [];
							}
					}, 1000);
			}
	};

	window.Pushgtagdata = (eventCategory, action, name, value=false, customVariableArr = []) => {
		/*PiWA 追中*/
		console.log(eventCategory, action, name, value, customVariableArr, '---------追中');
		if (eventCategory == undefined) {
			return;
		}
		let data = eventCategory.replace(/[&\|\\\*^%$#@\-]/g, '');
		if (typeof _paq === 'object') {
			customVariableArr.length && customVariableArr.forEach((variableItem,i)=> { variableItem.customVariableKey && _paq.push([ 'setCustomVariable', i+1, variableItem.customVariableKey, variableItem.customVariableValue , "page"])})
			_paq.push([ 'trackEvent', data, action ? action : 'touch', name, value ]);
			customVariableArr.length && customVariableArr.forEach((variableItem,i)=> _paq.push([ 'deleteCustomVariable', i+1, "page"]))
		}
	};

	window.globalGtag = (eventCategory) => {
		if (eventCategory == undefined) {
			return;
		}
		let data = eventCategory.replace(/[&\|\\\*^%/$#@\-]/g, '');
		console.log(data, 'pwiki');
		if (typeof _paq === 'object') {
			_paq.push([ 'trackEvent', data, 'touch' ]);
		}
	};

	if (
		window.location.host.search('p5stag.fun88.biz') != -1 ||
		window.location.host == 'p5stag.fun88.biz' ||
		window.location.host == 'p5stag1.fun88.biz' ||
		window.location.host == 'p5stag2.fun88.biz' ||
		window.location.host == 'p5stag3.fun88.biz' ||
		window.location.host == 'p5stag4.fun88.biz' ||
		window.location.host == 'p5stag5.fun88.biz' ||
		window.location.host == 'p5stag6.fun88.biz' ||
		window.location.host == 'p5stag7.fun88.biz' ||
		window.location.host == 'p5stag8.fun88.biz' ||
		window.location.host == 'localhost:5858' ||
		window.location.host == 'localhost:6868'
	) {
		// /*PiWA 追中*/
		(function(window, document, dataLayerName, id) {
			window[dataLayerName]=window[dataLayerName]||[],window[dataLayerName].push({start:(new Date).getTime(),event:"stg.start"});var scripts=document.getElementsByTagName('script')[0],tags=document.createElement('script');
			function stgCreateCookie(a,b,c){var d="";if(c){var e=new Date;e.setTime(e.getTime()+24*c*60*60*1e3),d="; expires="+e.toUTCString()}document.cookie=a+"="+b+d+"; path=/"}
			var isStgDebug=(window.location.href.match("stg_debug")||document.cookie.match("stg_debug"))&&!window.location.href.match("stg_disable_debug");stgCreateCookie("stg_debug",isStgDebug?1:"",isStgDebug?14:-1);
			var qP=[];dataLayerName!=="dataLayer"&&qP.push("data_layer_name="+dataLayerName),isStgDebug&&qP.push("stg_debug");var qPString=qP.length>0?("?"+qP.join("&")):"";
			tags.async=!0,tags.src="//analytics.ravelz.com/containers/"+id+".js"+qPString,scripts.parentNode.insertBefore(tags,scripts);
			!function(a,n,i){a[n]=a[n]||{};for(var c=0;c<i.length;c++)!function(i){a[n][i]=a[n][i]||{},a[n][i].api=a[n][i].api||function(){var a=[].slice.call(arguments,0);"string"==typeof a[0]&&window[dataLayerName].push({event:n+"."+i+":"+a[0],parameters:[].slice.call(arguments,1)})}}(i[c])}(window,"ppms",["tm","cm"]);
		})(window, document, 'dataLayer', '9ede9ab4-cea2-4a10-bf94-02ac2600e615');
		/*PiWA 追中*/
	} else {
		/*PiWA 追中*/
		(function(window, document, dataLayerName, id) {
			window[dataLayerName]=window[dataLayerName]||[],window[dataLayerName].push({start:(new Date).getTime(),event:"stg.start"});var scripts=document.getElementsByTagName('script')[0],tags=document.createElement('script');
			function stgCreateCookie(a,b,c){var d="";if(c){var e=new Date;e.setTime(e.getTime()+24*c*60*60*1e3),d="; expires="+e.toUTCString()}document.cookie=a+"="+b+d+"; path=/"}
			var isStgDebug=(window.location.href.match("stg_debug")||document.cookie.match("stg_debug"))&&!window.location.href.match("stg_disable_debug");stgCreateCookie("stg_debug",isStgDebug?1:"",isStgDebug?14:-1);
			var qP=[];dataLayerName!=="dataLayer"&&qP.push("data_layer_name="+dataLayerName),isStgDebug&&qP.push("stg_debug");var qPString=qP.length>0?("?"+qP.join("&")):"";
			tags.async=!0,tags.src="//analytics.ravelz.com/containers/"+id+".js"+qPString,scripts.parentNode.insertBefore(tags,scripts);
			!function(a,n,i){a[n]=a[n]||{};for(var c=0;c<i.length;c++)!function(i){a[n][i]=a[n][i]||{},a[n][i].api=a[n][i].api||function(){var a=[].slice.call(arguments,0);"string"==typeof a[0]&&window[dataLayerName].push({event:n+"."+i+":"+a[0],parameters:[].slice.call(arguments,1)})}}(i[c])}(window,"ppms",["tm","cm"]);
		})(window, document, 'dataLayer', 'd276117d-58ce-4b99-8418-9b11484cb34e');
		/*PiWA 追中*/ 
	}

	// setTimeout(() => {
	// 	let scriptSet = document.createElement('script');
	// 	scriptSet.src = 'https://e2.platform88798.com/E2/EagleEye.js';
	// 	scriptSet.type = 'text/javascript';
	// 	document.querySelectorAll('body')[0].appendChild(scriptSet);
	// }, 5000);
}



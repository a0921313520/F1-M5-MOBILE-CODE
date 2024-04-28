var Punycode = require('punycode');
let Config = {};
/* 测试环境Domain */
if (typeof global.location !== 'undefined') {
	/* 线上测试环境和 */
	let StagingApi = Boolean(
		[
			'localhost:5858',
			'localhost:8080',
			'192.168.2.3:5858',
			'192.168.0.108:8080',
			'192.168.50.106:8080',
			'192.168.137.1:5858',
			'192.168.0.108:5858',
			'192.168.50.106:5858',
			'127.0.0.1:5858',
			'192.168.2.12',
			'192.168.2.4:5858',
			'p5stag.fun88.biz',
			'p5stag1.fun88.biz',
			'p5stag2.fun88.biz',
			'p5stag3.fun88.biz',
			'p5stag4.fun88.biz',
			'p5stag5.fun88.biz',
			'p5stag6.fun88.biz',
			'p5stag7.fun88.biz',
			'p5stag8.fun88.biz'
		].find((v) => global.location.href.includes(v))
	);
	let localhostStagingApi = Boolean(
		[
			'localhost:5858',
			'localhost:8080',
			'192.168.2.8:5858',
			'192.168.0.108:8080',
			'192.168.50.106:8080',
			'192.168.137.1:5858',
			'192.168.0.108:5858',
			'192.168.50.106:5858',
			'127.0.0.1:5858'
		].find((v) => global.location.href.includes(v))
	);
	//本地模拟灰度环境
	let localSLApi = Boolean(
		[ 'localhost:6868', '192.168.2.4:6868', 'p5sl.fun88.biz', 'p5sl2.fun88.biz', 'p5sl3.fun88.biz' ].find((v) =>
			global.location.href.includes(v)
		)
	);
	/* 测试环境 */
	if (StagingApi) {
		//特例處理gateway api
		 //let gatewayAPI = 'https://gateway-idcstgf1p501.gamealiyun.com'; //STG-01
		// let gatewayAPI = 'https://gateway-idcstgf1p502.gamealiyun.com'; //STG-02
		let gatewayAPI = 'https://gateway-idcstgf1p5vn.gamealiyun.com'; //STG
		//let gatewayAPI = 'https://gateway-idcslf5.gamealiyun.com'; //SL
		Config = {
			WC2022CMSURL: 'https://f1m1-worldcup-stage-web.fubnb.com',
			CMSURL: localhostStagingApi ? 'https://f1-api-stage-web.fubnb.com' : 'https://f1-api-stage-web.fubnb.com',
			HostApi: gatewayAPI /* 默认指向域名 */,
			BFFSCApi: 'https://febff-api-staging-m3-instance01.fun88.biz',
			StrapiApi: 'https://cmsapistag.fun88.biz',
			defaultSport: 'im', //默認體育頁
			isGameLive: false,
			isLIVE: false, //判斷在 測試/開發 還是線上環境
			DefaultDomain: 'https://p5stag.fun88.biz',
			LocalHost: 'https://p5stag.fun88.biz/',
			//----mainsite app下載鏈接---
			MainSiteAppDownloadUrl: 'https://www.fun88asia.com/VN/download/app.htm',
			//-----推送配置-----
			SignalRUrl: 'https://gatewaystagingfun88wsnotification1.gamealiyun.com',
			SportImageUrl: 'https://simg.letiyu88.com', //聯賽隊伍圖 域名
			//-----緩存API配置-----
			CacheApi: 'https://sapi.letiyu88.com', //測試環境
			//CacheApi: 'https://sapi.leyouxi211.com', //線上域名
			//-----IM配置------
			IMAccessCode: 'ca9fb2a3e194173a', //fun測試
			IMApi: 'https://improxy.letiyu88.com/api/mobile/', //fun測試 proxy服
			//IMAccessCode: '2cc03acc80b3693c', //fun線上
			//IMApi: 'https://gatewayim.bbentropy.com/api/mobile/', //fun線上 proxy
			//-----BTI配置-----
			//BTIDomainId: '1hyKRxiNWPpyPjmdX19xQOIB', //fun測試 舊版(SBT)
			BTIAuthApiProxy: 'https://letiyu88.com/api/sportsdata/', //用來隱藏 bti DomainId的proxy，bti auth login/renew 用
			BTIApi: 'https://letiyu88.com/api/sportsdata/', //fun測試 舊版(SBT)
			BTIRougeApi: 'https://prod213.1x2aaa.com/api/rogue/', //bti新版api(目前僅支持cashout)
			BTIAnnouncements: 'https://gatewayimstaging.bbentropy.com/json_announcements.aspx', //fun測試 proxy服 用im的域名轉bti的公告

			//----沙巴配置-----
			SABAAuthApi: 'https://sabaauth.letiyu88.com/', //只有login有cors限制，其他不用
			//SABAApi: 'https://apistaging.wx7777.com/',
			SABAApi: 'https://sabaproxy.letiyu88.com/',

			//是否在歐洲杯期間 直接默認開 後面需要關 再手動調
			isEUROCUP2021: false,
			SentryKey: 'https://d743f9de540c416380d5716fbfb41008@o4505078426435584.ingest.sentry.io/4505080974016512',
			SmartCoachApi: 'https://betting.stage.brainanalytics.co', //STG测试情报分析
			//SmartCoachApi: 'https://betting.dev.brainanalytics.co', //DEV情报分析
			//SmartCoachApi: 'https://api.live.smartcoach.club',	  //PRD线上情报分析
			sbNewHostApi: 'https://shsf1sb-odds.funnpo.com:2041/sports-data-odds-service/v1/',
			// sbNewHostApi: 'https://tkpf1sb-odds.funnpo.com:2041/sports-data-odds-service/v1/',
			cmsApi: 'https://cmsapistag.fun88.biz/'
		};
	} else {
		let parsed = Domainparse(window.location.host);
		let LiveHostApi = `https://gateway-idcf5vn.${parsed.sld || 'gamealiyun'}.${parsed.tld}`; /* 默认指向线上域名 */
		let LiveCMSApi = 'https://cache.f866u.com'; //'https://prodapi.550fun.com';
		let LiveStrapiApi = 'https://cache.huya66.cc' // cms轉換strapi api 線上主域名
		let isGameLive = true; //添加这个参数是为了区分线上和灰度 （线上游戏列表 只要 isLive = true 的游戏,灰度和测试环境不处理）
		//特別處理sl環境
		if (localSLApi) {
			LiveHostApi = 'https://gateway-idcslf5vn.gamealiyun.com';
			// LiveHostApi = 'https://gateway-idcf5.fun963.com';
			LiveCMSApi = 'https://slapi.550fun.com';
			LiveStrapiApi = 'https://cmsapisl.fun88.biz';
			isGameLive = false;
		}
		//线上环境
		Config = {
			WC2022CMSURL: 'https://cache.funlove88.com',
			defaultSport: 'im', //默認體育頁
			isLIVE: true, //判斷在 測試/開發 還是線上環境,
			isGameLive: isGameLive,
			DefaultDomain: global.location.origin,
			CMSURL: LiveCMSApi,
			HostApi: LiveHostApi,
			StrapiApi: LiveStrapiApi,
			BFFSCApi: localSLApi? 'https://febff-api-softlaunch-m3.fun88.biz': 'https://febff-api-m3.fun88.biz',
			sbNewHostApi: localSLApi  ? 'https://tkslf1sb-odds.funnpo.com:2041/sports-data-odds-service/v1/' : 'https://tkpf1sb-odds.funnpo.com:2041/sports-data-odds-service/v1/',
			cmsApi: localSLApi ? 'https://cmsapisl.fun88.biz/' : 'https://cache.huya66.cc/',
			LocalHost: localSLApi ? 'https://www.fun963.com/' : global.location.origin + '/',
			//----mainsite app下載鏈接---
			MainSiteAppDownloadUrl: 'https://www.fun88asia.com/VN/download/app.htm',
			//-----推送配置-----
			SignalRUrl: '',
			SportImageUrl: 'https://simg.leyouxi211.com', //聯賽隊伍圖 線上域名
			//SportImageUrl: 'https://simg.letiyu211.com',//聯賽隊伍圖 線上備用域名
			//-----緩存API配置-----
			CacheApi: 'https://sapi.leyouxi211.com', //線上域名
			//CacheApi: 'https://sapi.letiyu211.com', //線上備用域名
			//-----IM配置------
			IMAccessCode: '2cc03acc80b3693c', //fun線上
			IMApi: 'https://gatewayim.bbentropy.com/api/mobile/', //fun線上  proxy
			//备用
			// gatewayim.bbdynamic.com (backup)
			// gatewayim.bbsator.com (backup)
			//-----BTI配置-----
			//BTIDomainId: 'uGV8qqxpUKOzXZFQeWtkndHu', //fun線上
			BTIAuthApiProxy: 'https://leyouxi211.com/api/sportsdata/', //線上域名
			// BTIAuthApiProxy: 'https://letiyu211.com/api/sportsdata/', //線上備用域名
			BTIApi: 'https://prod213.1x2aaa.com/api/sportsdata/', //fun線上
			BTIRougeApi: 'https://prod213.1x2aaa.com/api/rogue/', //bti新版api(目前僅支持cashout)
			BTIAnnouncements: 'https://gatewayim.bbentropy.com/json_announcements.aspx', //fun線上 proxy服 用im的域名轉bti的公告

			//----沙巴配置-----
			SABAAuthApi: 'https://sabaauth.leyouxi211.com/', //只有login有cors限制，其他不用
			//SABAApi: 'https://api.wx7777.com/', //沙巴 全球線 備用
			SABAApi: 'https://api.neo128.com/', //沙巴 中國專用線

			//是否在歐洲杯期間 直接默認開 後面需要關 再手動調
			isEUROCUP2021: false,
			SentryKey: 'https://d31298adfcd7446ebdcf15c9b021c4e6@o4505078426435584.ingest.sentry.io/4505080972050432',
			SmartCoachApi: 'https://api.live.smartcoach.club' //线上
			//SmartCoachApi: 'https://betting.stage.brainanalytics.co' //STG测试情报分析
		};
	}
}

/**
 * @description: 获取二级域名 转换动态api 域名
 * @param {*} input 完整域名
 * @return {*}
 */
function Domainparse(input) {
	if (typeof input !== 'string') {
		throw new TypeError('Domain name must be a string.');
	}
	// Force domain to lowercase.
	var domain = input.slice(0).toLowerCase();
	// Handle FQDN.
	// TODO: Simply remove trailing dot?
	if (domain.charAt(domain.length - 1) === '.') {
		domain = domain.slice(0, domain.length - 1);
	}
	var parsed = {
		input: input,
		tld: null,
		sld: null,
		domain: null,
		subdomain: null,
		listed: false
	};
	var domainParts = domain.split('.');
	// Non-Internet TLD
	if (domainParts[domainParts.length - 1] === 'local') {
		return parsed;
	}
	var handlePunycode = function() {
		if (!/xn--/.test(domain)) {
			return parsed;
		}
		if (parsed.domain) {
			parsed.domain = Punycode.toASCII(parsed.domain);
		}
		if (parsed.subdomain) {
			parsed.subdomain = Punycode.toASCII(parsed.subdomain);
		}
		return parsed;
	};
	var rule = null;
	// Unlisted tld.
	if (!rule) {
		if (domainParts.length < 2) {
			return parsed;
		}
		parsed.tld = domainParts.pop();
		parsed.sld = domainParts.pop();
		parsed.domain = [ parsed.sld, parsed.tld ].join('.');
		if (domainParts.length) {
			parsed.subdomain = domainParts.pop();
		}
		return handlePunycode();
	}
	// At this point we know the public suffix is listed.
	parsed.listed = true;

	var tldParts = rule.suffix.split('.');
	var privateParts = domainParts.slice(0, domainParts.length - tldParts.length);

	if (rule.exception) {
		privateParts.push(tldParts.shift());
	}
	parsed.tld = tldParts.join('.');
	if (!privateParts.length) {
		return handlePunycode();
	}
	if (rule.wildcard) {
		tldParts.unshift(privateParts.pop());
		parsed.tld = tldParts.join('.');
	}

	if (!privateParts.length) {
		return handlePunycode();
	}
	parsed.sld = privateParts.pop();
	parsed.domain = [ parsed.sld, parsed.tld ].join('.');
	if (privateParts.length) {
		parsed.subdomain = privateParts.join('.');
	}
	return handlePunycode();
}

export default { Config };

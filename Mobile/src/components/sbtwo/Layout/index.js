import React from 'react';
import Head from 'next/head';
import Header from '$SBTWO/Header';
import BackBar from '$SBTWO/Header/BackBar';
import Footer from '$SBTWO/Footer';
import Maintain from '$SBTWO/Maintain';
import EventInfo from '$SBTWOLIB/vendor/data/EventInfo';
import Router from 'next/router';
import { withBetterRouter } from '$SBTWOLIB/js/withBetterRouter';
import { checkIsLogin, redirectToLogin } from '$SBTWOLIB/js/util';
import { CSSTransition } from 'react-transition-group';
import { ReactSVG } from '$SBTWO/ReactSVG';
import '$SBTWOLIB/js/Globalfun';
import { EventChangeType, SpecialUpdateType, VendorMarkets } from '$SBTWOLIB/vendor/data/VendorConsts';
//import {signalRConnect} from  '$SBTWOLIB/js/signalR';
import { connect } from 'react-redux';
import { ACTION_UserInfo_getBalanceSB } from '@/lib/redux/actions/UserInfoAction';
import { getUrlVars } from '$SBTWOLIB/js/Helper';
import ReactIMG from '$SBTWO/ReactIMG';
import SelfExclusionModal from '$SBTWO/SelfExclusion';
import '@/lib/js/Globalfun';
/*
<button
	onClick={() => {
		this.ChangeTheme([ 'light', 'dark' ]);
	}}
>
	ChangeTheme
</button>
*/

// 默认显示的状态值
global.HttpStatus = 0;

function ChangeTheme(themeArr) {
	const ThemeNode = document.getElementById('fun88_sport'),
		ThemeNodeClass = ThemeNode.getAttribute('class'),
		ThemeIndex = themeArr.indexOf(ThemeNodeClass);

	ThemeIndex >= 0 &&
		ThemeNode.setAttribute('class', themeArr[ThemeIndex + 1 > themeArr.length - 1 ? 0 : ThemeIndex + 1]);
}
let setOpenLeftSlider;
let StatisticsAll = 0;
function MainComponent(props) {
	const status = props.status ? props.status : props.status === 0 ? 0 : 1;
	const commonParams = {
		// ChangeTheme: ChangeTheme
	};

	const notificationInfo = (
		<CSSTransition
			in={!!props.notificationInfo}
			appear={true}
			classNames="notification-scale"
			timeout={160}
			onExited={() => {}}
		>
			{/* 必須有內容，不可放null會報錯 */}
			{props.notificationInfo ? (
				<React.Fragment>
					<div className="notification-message">
						<ReactIMG src="/img/ball_notification.png" />
						{props.notificationInfo}
					</div>
				</React.Fragment>
			) : (
				<div />
			)}
		</CSSTransition>
	);
	const notificationRecommend = (
		<CSSTransition
			in={!!props.notificationRecommend}
			appear={true}
			classNames="notification-scale"
			timeout={160}
			onExited={() => {}}
		>
			{/* 必須有內容，不可放null會報錯 */}
			{props.notificationRecommend ? (
				<React.Fragment>
					<div
						className="notification-message recommend"
						onClick={() => {
							if (parseInt(props.notificationRecommend.id) === 0) {
								return false; //如果MsgID === 0 表示是帳戶信息，無法點開看細節
							}
							Router.push({
								pathname: '/sbtwo/notification-detail',
								query: { id: props.notificationRecommend.id, type: props.notificationRecommend.type }
							});
						}}
					>
						<ReactIMG src="/img/notification_recommed.png" />
						{props.notificationRecommend ? (
							<div className="notification-recommend-wrap">
								<h4>{props.notificationRecommend.title}</h4>
								<p
									dangerouslySetInnerHTML={{
										__html: props.notificationRecommend.info
									}}
								/>
							</div>
						) : null}
						<ReactSVG
							src="/img/svg/close.svg"
							className="notification-close-icon"
							onClick={props.closeNotificationRecommend}
						/>
					</div>
				</React.Fragment>
			) : (
				<div />
			)}
		</CSSTransition>
	);

	if (global.HttpStatus === -100) {
		return;
	}

	switch (status) {
		case 0:
			return <div className="sbtwo">{props.children}</div>;
		case 1: // Default Value  默认只包含Header
			return (
				<div className={`sbtwo sport-container-wrapper fixed-header`}>
					<Header
						key="main-header"
						showAppDownloadBar={props.showAppDownloadBar}
						closeAppDownloadBar={props.closeAppDownloadBar}
						{...commonParams}
					/>
					<div className={'sport-content' + (props.showAppDownloadBar ? ' withAppDownloadbar' : '')}>
						{notificationInfo}
						{notificationRecommend}
						{props.children}
					</div>
				</div>
			);
		case 10: // 只包含有返回上一页的Header
			return (
				<div className={`sbtwo sport-container-wrapper ${props.barFixed ? 'fixed-header' : ''}`}>
					<BackBar
						key="main-bar-header"
						title={props.BarTitle}
						backEvent={props.backEvent}
						hasServer={props.hasServer}
						{...commonParams}
					/>
					<div className="sport-content">
						{notificationInfo}
						{notificationRecommend}
						{props.children}
					</div>
				</div>
			);
		case 11: // 推送信息專用，返回是到通知頁(information)
			return (
				<div className={`sbtwo sport-container-wrapper ${props.barFixed ? 'fixed-header' : ''}`}>
					<BackBar
						key="main-bar-header"
						title={props.BarTitle}
						backEvent={() => {
							//用replace，避免用戶可以點擊back返回
							Router.replace('/sbtwo/information', undefined, { shallow: true });
						}}
						hasServer={props.hasServer}
						{...commonParams}
					/>
					<div className="sport-content">
						{notificationInfo}
						{notificationRecommend}
						{props.children}
					</div>
				</div>
			);
		case 12: // 含有返回上一页的Header 和 footer
			return (
				<div className={`sbtwo sport-container-wrapper ${props.barFixed ? 'fixed-header' : ''}`}>
					<BackBar
						key="main-bar-header"
						title={props.BarTitle}
						backEvent={props.backEvent}
						hasServer={props.hasServer}
						{...commonParams}
						hideBack={props.hideBack}
					/>
					<div className="sport-content">
						{notificationInfo}
						{notificationRecommend}
						{props.children}
					</div>
					<Footer key="main-footer" 	
						MenuOpenLeftSlider={() => {
							setOpenLeftSlider.SliderChange();
						}}
					/>
				</div>
			);
		case 2: // 包含Header和Footer
			return (
				<div className={`sbtwo sport-container-wrapper fixed-header`}>
					<Header
						key="main-header"
						showAppDownloadBar={props.showAppDownloadBar}
						closeAppDownloadBar={props.closeAppDownloadBar}
						{...commonParams}
						OpenLeftSlider={(e) => {
							setOpenLeftSlider = e;
							console.log('==================>', e);
							StatisticsAll = e.state.StatisticsAll;
						}}
					/>
					<div className={'sport-content' + (props.showAppDownloadBar ? ' withAppDownloadbar' : '')}>
						{notificationInfo}
						{notificationRecommend}
						{props.children}
					</div>
					<Footer
						key={'main-footer' + StatisticsAll}
						StatisticsAll={setOpenLeftSlider}
						MenuOpenLeftSlider={() => {
							setOpenLeftSlider.SliderChange();
						}}
					/>
				</div>
			);
		case 3: // 维护界面
			return <Maintain />;
		case 4: // 仅包含Footer
			return (
				<div className={`sbtwo sport-container-wrapper `}>
					<div className={'sport-content' + (props.showAppDownloadBar ? ' withAppDownloadbar' : '')}>
						{notificationInfo}
						{notificationRecommend}
						{props.children}
					</div>
					<Footer key="main-footer" 	
						MenuOpenLeftSlider={() => {
							setOpenLeftSlider.SliderChange();
						}} 
					/>
				</div>
			);
		case 999: //初始頁，不處理任何東西，因為馬上就會跳走
			return <React.Fragment>{props.children}</React.Fragment>;
		default:
			return <div>500 Error!</div>;
	}
}

class Layout extends React.Component {
	static defaultProps = {
		title: 'Fun88乐体育|英超官方赞助商',
		Description: 'Fun88乐体育提供全球热门赛事资讯，欧洲足球五大联赛、世界杯、NBA、CBA、中超等赛程，一手掌握最新赛况，即时享受竞猜乐趣',
		Keywords: 'Fun88,Fun88乐天堂体育，乐体育,fun88乐体育,IM平台,BTI平台,虚拟货币,USDT,体育竞猜,欧冠竞猜,英超竞猜,NBA竞猜',
		barFixed: false,
		hasServer: false
	};
	constructor() {
		super();
		this.state = {
			notificationInfo: '',
			notificationRecommendInfo: null,
			showAppDownloadBar: false //展示app下載橫幅(會影響sport-content，所以這個state不能放header裡面)
		};

		this.Vendor = null;
		this.eventPollingKey = null;
		this.notification = this.notification.bind(this);
	}
	componentDidMount() {
		if (this.props.status === 999) {
			console.log('===layout didmount but do nothing'); //for初始頁 "/" 馬上跳走，不用處理
			return;
		} else {
			console.log('===layout didmount');
		}

		let vars = getUrlVars();
		if (vars.aff && vars.aff !== '') {
			console.log('=== get affcode ', vars.aff);
			sessionStorage.setItem('affCode', vars.aff);
		}

		//resetRemSize(); 改到 _app 做處理

		//進球通知
		this.notification();

		//綁定後台推送(signalR)處理函數
		//這樣做是因為layout在換頁時會被unmount，需要重新綁定當前實例
		if (typeof window !== 'undefined') {
			//獲取到全站群發訊息
			window.signalR_onGetBroadcastSBMessage = this.signalR_getBroadcastSBMessage.bind(this);
			//獲取到單發個人訊息
			window.signalR_onGetPrivateSBMessage = this.signalR_getPrivateSBMessage.bind(this);
		}

		//後台推送(signalR) 頁面刷新時重連
		//signalRConnect();

		window.Pushgtagdata = (category, action, name) => {
			if (typeof _paq === 'object') {
				_paq.push([ 'trackEvent', category, action, name ]);
			}
		};
		this.props.landscape
			? (function removeLandscape() {
					const nodeDom = document.getElementById('orientLayer');
					nodeDom && document.getElementsByTagName('body')[0].removeChild(nodeDom);
					const cssDom = document.getElementById('orientLayerCss');
					cssDom && document.getElementsByTagName('body')[0].removeChild(cssDom);
				})()
			: (function landscape(config) {
					//檢查，避免重複添加多個
					const existNodeDom = document.getElementById('orientLayer');
					if (existNodeDom) {
						return;
					}
					if (
						navigator.userAgent.match(
							/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
						)
					) {
						var isVertical =
							Number(document.getElementById('customerLandscape').getAttribute('isVertical')) || 0;
						var showWay = isVertical
							? '@media screen and (min-aspect-ratio: 12/7){#orientLayer{display:block;} }'
							: '@media all and (orientation : portrait){#orientLayer{display: block;} }';
						var color = config && config.color ? config.color : '#000',
							txt = isVertical ? '为了更好的体验，请使用竖屏浏览' : '为了更好的体验，请使用横屏浏览',
							images =
								config && config.images
									? config.images
									: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIYAAADaCAMAAABU68ovAAAAXVBMVEUAAAD29vb////x8fH////////x8fH5+fn29vby8vL////5+fn39/f6+vr////x8fH////////+/v7////09PT////x8fH39/f////////////////////x8fH///+WLTLGAAAAHXRSTlMAIpML+gb4ZhHWn1c2gvHBvq1uKJcC6k8b187lQ9yhhboAAAQYSURBVHja7d3blpowFIDhTUIAOchZDkre/zE7ycySrbUUpsRN2/1fzO18KzEqxEVgTiZNfgmmtxRc8iaR8HNe8x4BtjQePKayYCIoyBSgvNNE1AkNSHqZyLqk97EgUCCHBzZ5mkg7ScvIJuIyOyXBRFxgpqWZyGsAZLB1KjsJi8nutHU4JCRbFRH8tmirI9k8Jx2sqNs8K/m0LQkrktO2crgcgXGB4AiTEsB0hJfo9MGgX7CGcYiYwQxmMOOvZwRhBG8tCoMXjBDeXvWCEcHbi14wgCBmMIMZzGAGM5jxETNwzMAxA8cMHDNwzMAxA8cMHDNwzMAxA8cMHDNwzMAxY6E2rUQxnH2tz9cirlJFwFBJedaPnUv0M7++egPDE8iAJcIDmxwH5wwv9vUviw2kLbVO3TJU5uul/EyB0FoLp4x60PdGUd3qPurrWyjGGTc05u+1dcgI7/+tCCPARWGhH7o5Y7RCf+bH9ctXLp6v2BVDxfqz0oPXeSVaNtINo/1SXDv4dck8IIkbhtC2ol+iouEonTBCbYvVMnXOjxww6s/RFrBUpXHh/gw1rHj5d/qhYn9Gpk2FWh6xRBRX5Oj3Znh2Sq49/L6+y8pB26q9GbE2dbA2mVbx6I+7MfBglLCttm73ZQi7AD3iL4HqjFYJHSPRppqaUaJ3ATpGa+ckpGak2hRRMyqjGMkvl+xyFeSMwjAqcsZgGDdyhl0oNTnDN4yenJGZFGxNChP5/Y3efh6SM2rDOJMzboYxkDMqwyjIGcIw6F+io2FU1IxIm1JqRmgXSkvNKNCXeTpGrU0JNSO2c6LIGPgCS8AuDHz9ta0SXWDtxoDRH+MqlbC2Dt2G2JFRadtQZt2qq/orGowdGb2euxYiqWEpVWhTBnszoNAPdStuQwxqf0aocdWKW4Z+DfszIh8pxJqbuCE4YAC+4bm0evtipjpgJHeFnyyt1Ku2xa0bhjxr27p75rECNwyI9ZwvXkHq+7aTaMEV44YYy/spfgjgjNHaWW+GeUhGEX7tLlVinIFDDSgnOwhi1V6bU0b6tVS9eAERe863g4dRrtiHdc6o+nn5vtyVVgR79Cqt4uL6gfHPQyGqtP2vf7HADGbcYwaOGThm4JiBYwaOGThm4JiBYwaOGThm4JiBYwaOGThm4JiBYwaOGThm4JjhtOM+J/AgT008yDMkN/dPP9hzS8zAMQN3OEYeekp5YU7KOKXwVXqiY+QS7smcinGKABWdiBgpPJTSMHJ4KidhhPBUSMLw4CmPhKHgKUXCkHsygum71ftNSgCX6bsl8FQyfbcL5EdYsDk0R3j7aiA5wpt5AjKg/2gLJEBD/0Hf2OOf/vRrj6z/7GtP4B3nMKyjHA12kIPSjnJs3FEO0TvKkYJHOWCR+rjJH0Vn6fI5PjNbAAAAAElFTkSuQmCC';
						// style
						var nodeStyle = document.createElement('style');
						nodeStyle.setAttribute('id', 'orientLayerCss');
						nodeStyle.setAttribute('type', 'text/css');
						nodeStyle.innerHTML =
							'@-webkit-keyframes rotation{10%{transform: rotate(-90deg); -webkit-transform: rotate(-90deg)} 50%, 60%{transform: rotate(0deg); -webkit-transform: rotate(0deg)} 90%{transform: rotate(-90deg); -webkit-transform: rotate(-90deg)} 100%{transform: rotate(-90deg); -webkit-transform: rotate(-90deg)} } @keyframes rotation{10%{transform: rotate(-90deg); -webkit-transform: rotate(-90deg)} 50%, 60%{transform: rotate(0deg); -webkit-transform: rotate(0deg)} 90%{transform: rotate(-90deg); -webkit-transform: rotate(-90deg)} 100%{transform: rotate(-90deg); -webkit-transform: rotate(-90deg)} } #orientLayer{display: none; z-index: 999999;} ' +
							showWay +
							' .mod-orient-layer{display: none; position: fixed; height: 100%; width: 100%; left: 0; top: 0; right: 0; bottom: 0; background: ' +
							color +
							'; z-index: 9997} .mod-orient-layer__content{position: absolute; width: 100%; top: 45%; margin-top: -75px; text-align: center} .mod-orient-layer__icon-orient{background-image: url(' +
							images +
							'); display: inline-block; width: 67px; height: 109px; transform: rotate(-90deg); -webkit-transform: rotate(-90deg); -webkit-animation: rotation infinite 1.5s ease-in-out; animation: rotation infinite 1.5s ease-in-out; -webkit-background-size: 67px; background-size: 67px} .mod-orient-layer__desc{margin-top: 20px; font-size: 15px; color: #fff}';
						document.getElementsByTagName('body')[0].appendChild(nodeStyle);
						// dom
						var nodeDom = document.createElement('div');
						nodeDom.setAttribute('id', 'orientLayer');
						nodeDom.setAttribute('class', 'mod-orient-layer');
						nodeDom.innerHTML =
							'<div class="mod-orient-layer__content"> <i class="icon mod-orient-layer__icon-orient"></i> <div class="mod-orient-layer__desc">' +
							txt +
							'</div> </div>';
						document.getElementsByTagName('body')[0].appendChild(nodeDom);
					}
				})();

		//是否展示app下載橫幅
		let showAppDownloadBar = false;
		if (
			!sessionStorage.getItem('appdownload-closed') && //用seesionStorage滿足需求
			checkIsLogin()
		) {
			showAppDownloadBar = true;
		}
		if (this.state.showAppDownloadBar !== showAppDownloadBar) {
			//有變更才配置
			this.setState({ showAppDownloadBar });
		}
	}

	componentWillUnmount() {
		if (this.Vendor) {
			this.Vendor.deletePolling(this.eventPollingKey);
		}

		//解綁後台推送(signalR)處理函數
		if (typeof window !== 'undefined') {
			//獲取到全站群發訊息
			window.signalR_onGetBroadcastSBMessage = null;
			//獲取到單發個人訊息
			window.signalR_onGetPrivateSBMessage = null;
		}

		if (this.signalR_timout_handler) {
			clearTimeout(this.signalR_timout_handler);
		}
		if (this.notification_timeout_handler) {
			clearTimeout(this.notification_timeout_handler);
		}
	}

	//處理push 廣播群發
	signalR_getBroadcastSBMessage(messageID, messageTitle, messageContent, messageLanguage, messageCategoryId) {
		return this.signalR_getMessage(
			'B',
			messageID,
			messageTitle,
			messageContent,
			messageLanguage,
			messageCategoryId
		);
	}

	//處理push 單發個人
	signalR_getPrivateSBMessage(messageID, messageTitle, messageContent, messageLanguage, messageCategoryId) {
		return this.signalR_getMessage(
			'P',
			messageID,
			messageTitle,
			messageContent,
			messageLanguage,
			messageCategoryId
		);
	}

	//處理push  type=B 為廣播群發  type=P 為單發個人
	signalR_getMessage(type = 'B', messageID, messageTitle, messageContent, messageLanguage, messageCategoryId) {
		let thisMsgType = 'broadcastSBMessage';
		if (type !== 'B') {
			thisMsgType = 'privateSBMessage';
		}

		const replaceAll = function(source, search, replacement) {
			return source.replace(new RegExp(search, 'g'), replacement);
		};

		// +號特別處理  改成htmlencode的空白(%20)
		if (messageTitle && messageTitle.length > 0) {
			messageTitle = replaceAll(messageTitle, /\+/, '%20');
		}
		if (messageContent && messageContent.length > 0) {
			messageContent = replaceAll(messageContent, /\+/, '%20');
		}

		//發過來的內容url encode過 需要decode
		const urlDecodedMessageTitle = decodeURIComponent(messageTitle);
		const urlDecodedMessageContent = decodeURIComponent(messageContent);

		console.log(
			'===signalR get ' + thisMsgType + ' ON Layout',
			messageID,
			urlDecodedMessageTitle,
			urlDecodedMessageContent,
			messageTitle,
			messageContent,
			messageLanguage,
			messageCategoryId
		);

		//存款到帳，自動刷新餘額
		if (
			messageID === 0 &&
			urlDecodedMessageContent &&
			urlDecodedMessageContent &&
			urlDecodedMessageContent.indexOf('存款已成功到账') > 0
		) {
			console.log('===signalR refresh balance');
			this.props.userInfo_getBalanceSB(true);
		}

		this.setState(
			{
				notificationRecommendInfo: {
					id: messageID,
					type: thisMsgType,
					title: urlDecodedMessageTitle,
					info: urlDecodedMessageContent
				}
			},
			() => {
				//考慮連續push，先關閉現有的timeout
				if (this.signalR_timout_handler) {
					clearTimeout(this.signalR_timout_handler);
					this.signalR_timout_handler = null;
				}
				//然後起一個新的
				this.signalR_timout_handler = setTimeout(() => {
					this.setState({ notificationRecommendInfo: null });
					clearTimeout(this.signalR_timout_handler);
					this.signalR_timout_handler = null;
				}, 10000);
			}
		);
	}

	//進球通知
	async notification() {
		if (!checkIsLogin()) {
			return; //未登入不用通知
		}

		const { pathname } = this.props.router;

		if (pathname == '/sbtwo/sports-im') {
			this.Vendor = (await import('$SBTWOLIB/vendor/im/VendorIM')).default;
		} else if (pathname == '/sbtwo/sports-saba') {
			this.Vendor = (await import('$SBTWOLIB/vendor/saba/VendorSABA')).default;
		} else if (pathname == '/sbtwo/sports-bti') {
			this.Vendor = (await import('$SBTWOLIB/vendor/bti/VendorBTI')).default;
		} else {
			this.Vendor = null;
		}

		console.log(
			'===notification path',
			pathname,
			', current vendor:',
			this.Vendor ? this.Vendor.configs.VendorName : 'null vendor'
		);

		let currentVendor = this.Vendor;
		if (!currentVendor) {
			return null;
		}

		let whistle = new Audio(process.env.BASE_PATH + '/sound/whistle.mp3');
		whistle.muted = true;
		whistle.muted = false;

		//console.log('===currentVendor',currentVendor.configs.VendorPage);

		// 動態獲取比賽數據，這樣 不管怎麼變動，都不用重新配置輪詢
		const getEventInfosFunc = async () => {
			// 1. 先取用戶配置
			const memberSetting = currentVendor.getMemberSetting();

			let eventInfos = [];
			if (memberSetting.goalNotification) {
				// 進球通知只需要 足球，其他都不用
				const targetSportId = 1;

				// 如果勾選 全部滾球 直接查詢全部滾球數據，因為全部滾球一定會包含 收藏 和 投注 賽事
				if (memberSetting.goalAllRB) {
					const runningPR = await currentVendor.getEvents(targetSportId, VendorMarkets.RUNNING);
					const runningEvents = runningPR.NewData;
					eventInfos = eventInfos.concat(
						runningEvents.map((ev) => new EventInfo(ev.EventId, ev.SportId, ev.IsOutRightEvent === true))
					);
				} else {
					// 2. 收藏賽事有開，取收藏賽事
					if (memberSetting.goalMyFavorite) {
						const favEvents = await currentVendor.getFavouriteEvents();
						const favEventInfos = favEvents.map((ev) => {
							return new EventInfo(ev.EventId, ev.SportId, ev.IsOutRightEvent === true);
						});
						eventInfos = eventInfos.concat(favEventInfos);
					}
					// 3. 投注賽事有開，取投注賽事(注單未結算)
					if (memberSetting.goalIBet) {
						console.log('before await');
						const unsettleWagers = await currentVendor.getUnsettleWagers();
						console.log('after await');
						let unsettleWagerEventInfos = [];
						unsettleWagers.map((uw) => {
							uw.WagerItems.map((wi) => {
								unsettleWagerEventInfos.push(new EventInfo(wi.EventId, wi.SportId, wi.IsOutRightEvent));
							});
						});
						eventInfos = eventInfos.concat(unsettleWagerEventInfos);
					}
					// 4.去重複
					eventInfos = eventInfos.filter(
						(ei, index, self) => self.findIndex((t) => t.EventId === ei.EventId) === index
					);
					// 5.去除優勝冠軍
					eventInfos = eventInfos.filter((ei) => !ei.IsOutRightEvent);
					// 6.只保留足球
					eventInfos = eventInfos.filter((ei) => parseInt(ei.SportId) === targetSportId);
				}
			}

			//console.log('===notification eventInfos',JSON.parse(JSON.stringify(eventInfos)));

			return eventInfos;
		};

		// 輪詢 多個比賽數據(在notification 使用) 返回輪詢key，在componentWillUnmount時記得刪掉輪詢
		this.eventPollingKey = currentVendor.getEventsDetailPollingGlobal(
			'notification',
			(PollingResult) => {
				//console.log('===update Event',PollingResult);
				// this.setState({EventDetail: PollingResult.NewData});
				if (!currentVendor) {
					console.log('===null vendor: abort notification');
					return;
				}

				// 處理 數據變化
				PollingResult.Changes.map((changeData) => {
					// 類型：更新
					if (changeData.ChangeType === EventChangeType.Update) {
						changeData.SpecialUpdates.map((sUpdateData) => {
							const thisEventId = changeData.EventId; // 比賽ID

							// 進球通知
							// HomeGoal: 2,  //主場進球
							// AwayGoal: 3,  //客場進球

							// 主場進球
							if (sUpdateData.UpdateType === SpecialUpdateType.HomeGoal) {
								//處理通知
								const thisEvent = changeData.NewValue;

								console.log(
									'===',
									thisEventId,
									'主場進球',
									sUpdateData.OldValue,
									'=>',
									sUpdateData.NewValue
								);
								this.setState({notificationInfo: thisEvent.HomeTeamName + '(进球) ' + (thisEvent.HomeScore ?? 0) + ' - ' + (thisEvent.AwayScore ?? 0) + ' ' + thisEvent.AwayTeamName});

								//考慮連續進球，先關閉現有的timeout
								if (this.notification_timeout_handler) {
									clearTimeout(this.notification_timeout_handler);
									this.notification_timeout_handler = null;
								}
								//然後起一個新的
								this.notification_timeout_handler = setTimeout(() => {
									this.setState({ notificationInfo: '' });
									clearTimeout(this.notification_timeout_handler);
									this.notification_timeout_handler = null;
								}, 10000);

								//聲音
								const memberSetting = currentVendor.getMemberSetting();
								if (memberSetting.goalSound) {
									try {
										whistle.play().catch((e) => {
											console.log('===play sound error', e);
										});
									} catch (e) {
										console.log('===play sound error', e);
									}
								}

								//震動
								if (memberSetting.goalVibration) {
									if (typeof window !== 'undefined') {
										try {
											window.navigator.vibrate(500);
										} catch (e) {
											console.log('===vibrate error', e);
										}
									}
								}
							}

							// 客場進球
							if (sUpdateData.UpdateType === SpecialUpdateType.AwayGoal) {
								const thisEvent = changeData.NewValue;

								// 處理通知
								console.log(
									'===',
									thisEventId,
									'客場進球',
									sUpdateData.OldValue,
									'=>',
									sUpdateData.NewValue
								);
								this.setState({notificationInfo: thisEvent.HomeTeamName + ' ' + (thisEvent.HomeScore ?? 0) + ' - ' + (thisEvent.AwayScore ?? 0) + ' ' + thisEvent.AwayTeamName + '(进球)'});

								//考慮連續進球，先關閉現有的timeout
								if (this.notification_timeout_handler) {
									clearTimeout(this.notification_timeout_handler);
									this.notification_timeout_handler = null;
								}
								//然後起一個新的
								this.notification_timeout_handler = setTimeout(() => {
									this.setState({ notificationInfo: '' });
									clearTimeout(this.notification_timeout_handler);
									this.notification_timeout_handler = null;
								}, 10000);

								//聲音
								const memberSetting = currentVendor.getMemberSetting();
								if (memberSetting.goalSound) {
									try {
										whistle.play().catch((e) => {
											console.log('===play sound error', e);
										});
									} catch (e) {
										console.log('===play sound error', e);
									}
								}

								//震動
								if (memberSetting.goalVibration) {
									if (typeof window !== 'undefined') {
										try {
											window.navigator.vibrate(500);
										} catch (e) {
											console.log('===vibrate error', e);
										}
									}
								}
							}
						});
					}
				});
			},
			getEventInfosFunc,
			true
		); // <== 查詢參數 獲取 比賽查詢依據(EventInfo) 的函數
	}
	render() {
		const { title, Description, Keywords } = this.props;
		return (
			<React.Fragment>
				<Head key="layout-head">
					<title>{title}</title>
					<meta charSet="utf-8" />
					<meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
					<meta
						key="viewport"
						name="viewport"
						content="width=device-width,initial-scale=1.0,maximum-scale=5.0,viewport-fit=cover"
					/>
					<meta name="description" content={Description} />
					<meta name="Keywords" content={Keywords} />
					<meta name="x5-orientation" content="portrait" /> {/* QQ 竖屏锁定 */}
					<meta name="screen-orientation" content="portrait" /> {/* UC 竖屏锁定 */}
					<link rel="shortcut icon" type="image/x-icon" href="/img/favicon.ico" />
				</Head>
				<MainComponent
					{...this.props}
					notificationInfo={this.state.notificationInfo}
					notificationRecommend={this.state.notificationRecommendInfo}
					closeNotification={() => {
						this.setState({ notificationInfo: '' });
					}}
					closeNotificationRecommend={(e) => {
						e.stopPropagation();
						this.setState({ notificationRecommendInfo: null });
					}}
					showAppDownloadBar={this.state.showAppDownloadBar}
					closeAppDownloadBar={() => {
						this.setState({ showAppDownloadBar: false }, () => {
							sessionStorage.setItem('appdownload-closed', '1');
						});
					}}
					key="main-component"
				/>
				<div id="customerLandscape" isvertical="1" />

				{/* 自我限制彈窗 */}
				<SelfExclusionModal ModalType={1} proxyHasSelfExclusion={(func) => (global.hasSelfExclusion = func)} />
			</React.Fragment>
		);
	}
}

const mapDispatchToProps = {
	userInfo_getBalanceSB: (forceUpdate = false) => ACTION_UserInfo_getBalanceSB(forceUpdate)
};

export default withBetterRouter(connect(null, mapDispatchToProps)(Layout));

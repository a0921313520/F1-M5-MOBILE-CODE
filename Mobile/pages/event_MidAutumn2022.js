//中秋节 大转盘类型
import React, { Component } from 'react';
import Layout from '@/components/Layout';
import Input from '@/components/View/Input';
import { checkIsLogin, redirectToLogin, retryCall, numberWithCommas } from '@/lib/js/util';
import HostConfig from '@/server/Host.config';
import ReactIMG from '@/components/View/ReactIMG';
import ReactModal from 'react-modal';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import moment from 'moment';
import Toast from '@/components/View/Toast';
import Router from 'next/router';
import LuckyWheel from '@/components/Events/LuckyWheel';
import classNames from 'classnames';
ReactModal.setAppElement('#__next');

//左補0
const padLeft = (str, length) => {
	if (str.length >= length) return str;
	else return padLeft('0' + str, length);
};

const prizeList = [
	'FreeBet-18',
	'FreeBet-28',
	'FreeBet-58',
	'FreeBet-88',
	'FreeBet-128',
	'FreeBet-188',
	'FreeBet-288',
	'FreeBet-588',
	'RewardPts-28',
	'RewardPts-58',
	'RewardPts-88',
	'RewardPts-128',
	'RewardPts-288',
	'RewardPts-588',
	'MysteryGift'
];
const prizeFileNameMap = { P1: 'FreeBet', P3: 'RewardPts', P4: 'MysteryGift' };
const prizeNameMap = { P1: '免费彩金', P3: '乐币', P4: '中秋大礼包', P5: '没有奖励' };

if (typeof String.prototype.endsWith !== 'function') {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

export default class ann14 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			phase: 3, //1未開始 2進行中 3已結束
			day: [ 0, 0 ],
			hour: [ 0, 0 ],
			minute: [ 0, 0 ],
			second: [ 0, 0 ],
			showHint: false, //溫馨提示彈窗
			hintType: 1, //溫馨提示彈窗類型(1-9)
			showPrizePopup: false, //抽獎結果彈窗(動畫)
			showPrizeResult: false, //抽獎彈窗 展示中獎內容
			prizeType: 'FreeBet-18', //抽中的獎項(圖片文件名)
			prizeName: '18 免费彩金', //抽中的獎項(名稱)
			prizeResultType: 1, //抽獎彈窗類型(1-3)
			showTNC: false, //規則條款彈窗
			showMyPrizes: false, //查看我的獎品 彈窗
			myPrizes: [], //查看我的獎品數據
			totalDepositedDaily: 0,
			remainingGrabFromCurrentTier: 0,
			debug_showPopup: false, //debug彈窗
			debug_eventStartDate: '', //debug用，日期控制
			debug_eventEndDate: '', //debug用，日期控制
			debug_prizeResultType: 1, //debug用
			debug_prizeType: 'FreeBet-18', //debug用
			option: {
				//基本的5个配置如下
				width: '8.9486rem', //必要
				height: '8.9486rem', //必要
				time: 4000, //非必要默认4000
				size: 8, //必须参数，分几个奖项
				bg: `${process.env.BASE_PATH}/img/events/Mid-Autumn/CN/LuckyWheel/CN_LuckyWheelFrame.png`, //必要参数
				btn: `${process.env.BASE_PATH}/img/events/Mid-Autumn/CN/LuckyWheel/CN_Button-Static.gif`, //必要参数
				btning: `${process.env.BASE_PATH}/img/events/Mid-Autumn/CN/LuckyWheel/CN_Button-Clicked.gif`, //必要参数
				disabledbtn: `${process.env.BASE_PATH}/img/events/Mid-Autumn/CN/LuckyWheel/CN_Button-Disabled.png` //必要参数
			}
		};

		this.currentGameInfo = null;
		this.localDiffSecondsWithServer = 0; //和server time的時間差
		this.eventStartDateMoment = moment();
		this.eventEndDateMoment = moment();
		this.currentMemberProgress = null;

		this.timer = null;
		this.showPrizeResultHandler = null;
		this.lotteryRef = React.createRef();
	}
	async componentDidMount() {
		await retryCall(this.getGameInfo);
		if (this.isNoGameInfo()) return;
		const { phase } = this.checkPhase();
		if (phase != 3) {
			this.timer = setInterval(this.countDown, 1000);
		} else {
			this.clearIntervalHandlers();
		}
		if (checkIsLogin()) {
			await retryCall(this.getMemberProgress);
		}
	}

	componentWillUnmount() {
		this.clearIntervalHandlers();
	}

	//清理句柄
	clearIntervalHandlers = () => {
		if (this.timer) {
			clearInterval(this.timer);
		}
		this.clearPrizeResultHandler();
	};
	clearPrizeResultHandler = () => {
		if (this.showPrizeResultHandler) {
			clearTimeout(this.showPrizeResultHandler);
			this.showPrizeResultHandler = null;
		}
	};

	//如果沒帶Z或時區(+08:00)結尾，自動轉為UTC8
	_getMomentWithTZ = (dString) => {
		if (
			dString &&
			Object.prototype.toString.call(dString) === '[object String]' &&
			dString.length > 0 &&
			dString.indexOf('T') !== -1 &&
			!(dString.endsWith('Z') || dString.match(/(\+\d{2}\:\d{2})$/gim))
		) {
			return moment(dString + '+08:00');
		}
		return moment(dString);
	};

	//獲取活動數據
	getGameInfo = async () => {
		Toast.loading();
		const targetData = await fetchRequest(ApiPort.MiniGameInfo, 'GET')
			.then((data) => {
				let targetData = null;
				if (data.isSuccess && data.result) {
					targetData = data.result;
				}
				Toast.destroy();
				return targetData;
			})
			.catch((err) => {
				Toast.destroy();
				return null;
			});

		if (targetData) {
			this.currentGameInfo = targetData;
			this.localDiffSecondsWithServer = this._getMomentWithTZ(this.currentGameInfo.serverDateTime).diff(
				moment(),
				'seconds'
			);
			this.eventStartDateMoment = this._getMomentWithTZ(this.currentGameInfo.eventStartDate);
			this.eventEndDateMoment = this._getMomentWithTZ(this.currentGameInfo.eventEndDate);
		}

		return targetData;
	};

	debug_clickEntry = () => {
		if (!HostConfig.Config.isLIVE) {
			this.setState({
				debug_showPopup: true,
				debug_eventStartDate: this.eventStartDateMoment.format('YYYY-MM-DD HH:mm:ss'),
				debug_eventEndDate: this.eventEndDateMoment.format('YYYY-MM-DD HH:mm:ss')
			});
		}
		return false;
	};

	debug_saveEventDate = () => {
		if (!HostConfig.Config.isLIVE) {
			this.localDiffSecondsWithServer = 0;
			this.eventStartDateMoment = this._getMomentWithTZ(this.state.debug_eventStartDate);
			this.eventEndDateMoment = this._getMomentWithTZ(this.state.debug_eventEndDate);
			this.setState({ debug_showPopup: false });
		}
		return false;
	};

	debug_showHint = (typeid) => {
		if (!checkIsLogin()) return;
		this.setState({ debug_showPopup: false, showHint: true, hintType: typeid });
	};

	debug_selectPrizeResultType = (typeid) => {
		if (!checkIsLogin()) return;
		this.setState({ debug_prizeResultType: typeid });
	};

	debug_selectPrizeType = (typeid) => {
		if (!checkIsLogin()) return;
		this.setState({ debug_prizeType: typeid });
	};

	debug_showPrize = () => {
		if (!checkIsLogin()) return;
		const { debug_prizeResultType, debug_prizeType } = this.state;

		const prizeType2NumberMap = { FreeBet: 1, RewardPts: 3, MysteryGift: 4 };

		const prizeInfo = debug_prizeType.split('-');

		const prizeName = this.getPrizeName(prizeType2NumberMap[prizeInfo[0]], prizeInfo.length > 1 ? prizeInfo[1] : 0);

		this.setState({
			debug_showPopup: false,
			showPrizePopup: true,
			prizeResultType: debug_prizeResultType,
			prizeType: debug_prizeType,
			prizeName
		});
	};

	//檢查並更新當前活動階段
	checkPhase = () => {
		let phase = 1; //1未開始 2進行中 3已結束
		const nowTime = moment().add(this.localDiffSecondsWithServer, 'second');
		if (nowTime.isBefore(this.eventStartDateMoment)) {
			phase = 1;
		} else if (nowTime.isAfter(this.eventEndDateMoment)) {
			phase = 3;
		} else {
			phase = 2;
		}

		if (this.state.phase !== phase) {
			console.log('===new phase', this.state.phase, phase);
			this.setState({ phase });
		} else {
			console.log('===phase no changes', this.state.phase, phase);
		}

		return { phase, nowTime };
	};

	//需要登入則 返回true 並跳轉登入頁
	needLogin = () => {
		if (!checkIsLogin()) {
			redirectToLogin('?from=event_MidAutumn2022');
			return true;
		}
		return false;
	};

	//檢查活動數據，未取到則報錯
	isNoGameInfo = () => {
		if (!this.currentGameInfo) {
			Toast.error('網絡錯誤，請刷新後重試', 5);
			return true;
		}
		return false;
	};

	//獲取會員活動數據(需要登入)
	getMemberProgress = async () => {
		/* 活动未开始/已结束 不调用 */
		if (this.state.phase != 2) {
			return;
		}
		if (this.needLogin()) return;
		if (this.isNoGameInfo()) return;

		Toast.loading();
		const promoId = this.currentGameInfo.promoId;
		let targetData = await fetchRequest(ApiPort.MiniGameMember + 'promoId=' + promoId + '&', 'GET')
			.then((data) => {
				let targetData = null;
				if (data.isSuccess && data.result) {
					targetData = data.result;
				}
				Toast.destroy();
				return targetData;
			})
			.catch((err) => {
				Toast.destroy();
				return null;
			});

		if (targetData) {
			this.currentMemberProgress = targetData;

			this.setState({
				totalDepositedDaily: targetData.totalDepositedDaily,
				remainingGrabFromCurrentTier: targetData.remainingGrabFromCurrentTier
			});
		}

		return targetData;
	};

	//倒計時處理
	countDown = () => {
		const { phase, nowTime } = this.checkPhase();
		let diffSeconds = 0;
		if (phase == 1) {
			diffSeconds = this.eventStartDateMoment.diff(nowTime, 'seconds');
		} else if (phase == 2) {
			diffSeconds = this.eventEndDateMoment.diff(nowTime, 'seconds');
		}

		if (diffSeconds <= 0 || phase == 3) {
			if (phase == 3) {
				this.clearIntervalHandlers();
			}
			this.setState({
				day: [ 0, 0 ],
				hour: [ 0, 0 ],
				minute: [ 0, 0 ],
				second: [ 0, 0 ]
			});
		} else {
			const duration = moment.duration(diffSeconds, 'seconds');
			this.setState({
				day: padLeft(Math.floor(duration.asDays()) + '', 2).split(''),
				hour: padLeft(duration.hours() + '', 2).split(''),
				minute: padLeft(duration.minutes() + '', 2).split(''),
				second: padLeft(duration.seconds() + '', 2).split('')
			});
		}
	};

	//查看我的獎品(需要登入)
	showMyPrizes = async () => {
		if (this.needLogin()) return;
		if (this.isNoGameInfo()) return;

		const { phase } = this.checkPhase();
		if (phase == 1) return; //未開始不會有獎品

		// Pushgtagdata('Engagement_Event', 'View', 'MyPrize_MidAutumn2022​');

		Toast.loading();
		const promoId = this.currentGameInfo.promoId;
		let targetData = await fetchRequest(ApiPort.MiniGameMemberPrizes + 'promoId=' + promoId + '&', 'GET')
			.then((data) => {
				let targetData = [];
				if (data.isSuccess && data.result) {
					targetData = data.result;
				}
				Toast.destroy();
				return targetData;
			})
			.catch((err) => {
				Toast.destroy();
				return [];
			});

		const myPrizes = targetData
			.filter((d) => {
				return d.prizeType != 5; //需求：空獎不展示
				//return true;
			})
			.map((d) => ({
				applyDate: this._getMomentWithTZ(d.applyDate).format('YYYY-MM-DD HH:mm'),
				prizeName: this.getPrizeName(d.prizeType, d.actualPrizeValue),
				prizeStatusDesc: d.prizeStatusDesc
			}));
		this.setState({ myPrizes, showMyPrizes: true });
	};

	//抽獎結果 彈窗打開
	afterOpenPrizePopup = () => {
		//先用image偵測何時下載完gif，然後延遲1秒等gif跑完，再展示獎品

		//增加 ?日期數字 用來強制加載動畫
		const imgUrl =
			`${process.env.BASE_PATH}` + '/img/events/Mid-Autumn/Prize-Popup-BG.gif' + '?' + new Date().getTime();
		new Promise((resolve, reject) => {
			const image = new Image();
			image.addEventListener('load', resolve);
			image.addEventListener('error', reject);
			image.src = imgUrl;
		}).then(() => {
			document.getElementsByClassName('ann14-prize-popup')[0].style.backgroundImage = `url("${imgUrl}")`;
			this.showPrizeResultHandler = setTimeout(() => {
				this.setState({ showPrizeResult: true });
			}, 1000);
		});
	};

	//抽獎結果 彈窗關閉
	afterClosePrizePopup = () => {
		this.setState({ showPrizeResult: false });
	};

	//抽獎(需要登入)
	drawPrize = async (clickBubble = true) => {
		if (this.needLogin()) return;
		if (this.isNoGameInfo()) return;
		const { phase } = this.checkPhase();
		if (phase != 2) return;
		if (clickBubble) {
			// Pushgtagdata('Engagement_Event', 'Claim', 'SpinLuckyWheel_MidAutumn2022​');
		} else {
			// Pushgtagdata('Engagement_Event', 'Click', 'SpinMore_MidAutumn2022​');
		}

		Toast.loading();
		const promoId = this.currentGameInfo.promoId;

		let targetData = await fetchRequest(ApiPort.MiniGameMemberDrawPrize + 'promoId=' + promoId + '&', 'POST')
			.then((data) => {
				let targetData = { errors: [ { errorCode: 'UNKNOWN' } ] };
				if (data.isSuccess) {
					this.setState({
						startGame: true
					});
					if (data.result) {
						targetData = data.result;
					}
				} else if (!data.isSuccess) {
					if (data.errors && data.errors.length > 0) {
						targetData = { errors: data.errors };
					}
				}

				Toast.destroy();
				this.setState({
					startGame: false
				});
				console.log('FA--------->', targetData);
				return targetData;
			})
			.catch((err) => {
				Toast.destroy();
				return { errors: [ { errorCode: 'INTERNET' } ] };
			});

		console.log(targetData);
		//抽獎報錯
		// showHint: false, //溫馨提示彈窗
		// hintType: 1,     //溫馨提示彈窗類型(1-9)
		if (targetData.errors) {
			if (targetData.errors.some((e) => e.errorCode == 'MG00012')) {
				this.setState({ showHint: true, hintType: 1 });
			} else if (targetData.errors.some((e) => e.errorCode == 'MG00004')) {
				this.setState({ showHint: true, hintType: 2 });
			} else if (targetData.errors.some((e) => e.errorCode == 'MG00003')) {
				this.setState({ showHint: true, hintType: 3 });
			} else if (targetData.errors.some((e) => e.errorCode == 'MG00002')) {
				this.setState({ showHint: true, hintType: 4 });
			} else if (targetData.errors.some((e) => e.errorCode == 'MG00005')) {
				this.setState({ showHint: true, hintType: 8 });
			} else if (targetData.errors.some((e) => e.errorCode == 'MG00001')) {
				this.setState({ showHint: true, hintType: 9 });
			} else if (targetData.errors.some((e) => e.errorCode == 'MG99998')) {
				this.setState({ showHint: true, hintType: 10 });
			} else if (
				targetData.errors.some(
					(e) =>
						e.errorCode == 'MG00007' ||
						e.errorCode == 'MG99997' ||
						e.errorCode == 'MG99999' ||
						e.errorCode == 'CUSVAL002' ||
						e.errorCode == 'GEN0006'
				)
			) {
				this.setState({ showHint: true, hintType: 11 });
			} else if (targetData.errors.some((e) => e.errorCode == 'MG00009')) {
				//空奬，需要重新獲取 MemberProgress
				await retryCall(this.getMemberProgress);
				const { remainingGrabFromCurrentTier, remainingGrabFromHighestTier } = this.currentMemberProgress;
				// Member did not won prize (unluck) and still have
				// remaining grab times left / grab times > 0
				if (remainingGrabFromCurrentTier > 0) {
					this.setState({ showHint: true, hintType: 5, remainingGrabFromCurrentTier });
				} else {
					//-Member did not won prize (unluck) and don’t have grab times left / grab times = 0
					//-Member still can deposit to get more grab times.F40
					if (remainingGrabFromHighestTier > 0) {
						this.setState({ showHint: true, hintType: 6, remainingGrabFromCurrentTier });
					} else {
						this.setState({ showHint: true, hintType: 7, remainingGrabFromCurrentTier });
					}
				}
			} else if (targetData.errors.some((e) => e.errorCode == 'INTERNET')) {
				Toast.error('網絡錯誤，請刷新後重試', 5);
			} else {
				const errorCodes = targetData.errors.map((e) => e.errorCode).join(',');
				Toast.error('系统错误:' + errorCodes + ',请联系在线客服!', 5);
			}
			return;
		}
		this.lotteryRef.current.start(targetData.prizeType, async (res) => {
			//第一个参数为第几个奖项
			//第二个为结束回调函数
			// 正常抽到獎
			// showPrizePopup: true, //抽獎結果彈窗(動畫)
			// prizeType: 'FreeBet-18', //抽中的獎項
			// prizeName: '18 免费彩金', //抽中的獎項名稱
			// prizeResultType:1, //抽獎彈窗類型(1-3)

			const prizeType =
				prizeFileNameMap['P' + targetData.prizeType] +
				(targetData.prizeType != 4 ? '-' + targetData.actualPrizeValue : '');
			const prizeName = this.getPrizeName(targetData.prizeType, targetData.actualPrizeValue);

			//Member won prize and still have remaining grab times left / grab times > 0
			if (targetData.remainingGrabFromCurrentTier > 0) {
				this.setState({
					showPrizePopup: true,
					prizeResultType: 1,
					prizeType,
					prizeName,
					remainingGrabFromCurrentTier: targetData.remainingGrabFromCurrentTier
				});
			} else {
				//-Member won prize and NO grab times left / grab times = 0
				//-Member still can deposit to get more grab times.
				if (targetData.remainingGrabFromHighestTier > 0) {
					this.setState({
						showPrizePopup: true,
						prizeResultType: 2,
						prizeType,
						prizeName,
						remainingGrabFromCurrentTier: targetData.remainingGrabFromCurrentTier
					});
				} else {
					this.setState({
						showPrizePopup: true,
						prizeResultType: 3,
						prizeType,
						prizeName,
						remainingGrabFromCurrentTier: targetData.remainingGrabFromCurrentTier
					});
				}
			}
		});
	};

	getPrizeName = (prizeTypeNumber, actualPrizeValue) => {
		return (
			(prizeTypeNumber == 1 || prizeTypeNumber == 3 ? actualPrizeValue + ' ' : '') +
			prizeNameMap['P' + prizeTypeNumber]
		);
	};

	clickDeposit = () => {
		// Pushgtagdata('Deposit_Nav', 'Click', 'Deposit_MidAutumn2022​');
		Router.push('/deposit');
	};

	lotteryStart = (start) => {
		// ajax('/').then((res) => {
		// 	//ajax请求

		// }, 100);
		this.lotteryRef.current.start(3, (res) => {
			//第一个参数为第几个奖项
			//第二个为结束回调函数
			console.log(res);
		});
	};
	render() {
		const {
			day,
			hour,
			minute,
			second,
			prizeResultType,
			hintType,
			myPrizes,
			startGame,
			remainingGrabFromCurrentTier,
			phase
		} = this.state;

		return (
			<Layout
				BarTitle="FUN转中秋"
				status={2}
				hasServer={true}
				barFixed={true}
				backEvent={() => {
					Router.push('/');
				}}
			>
				<div className="ann14-container">
					<div className="ann14-top">
						<ReactIMG className="ann14-top-banner" src="/img/events/Mid-Autumn/CN/Title_CN.webp" />
						<div className="ann14-top-text-container">
							<div className="ann14-top-text">9月9日至9月14日 FUN转中秋</div>
						</div>
						<div className="ann14-top-countdown-container">
							<div className="ann14-top-countdown-numbers">
								<div className="ann14-top-countdown-number">{day[0]}</div>
								<div className="ann14-top-countdown-number">{day[1]}</div>
								<div className="ann14-top-countdown-sep">:</div>
								<div className="ann14-top-countdown-number">{hour[0]}</div>
								<div className="ann14-top-countdown-number">{hour[1]}</div>
								<div className="ann14-top-countdown-sep">:</div>
								<div className="ann14-top-countdown-number">{minute[0]}</div>
								<div className="ann14-top-countdown-number">{minute[1]}</div>
								<div className="ann14-top-countdown-sep">:</div>
								<div className="ann14-top-countdown-number">{second[0]}</div>
								<div className="ann14-top-countdown-number">{second[1]}</div>
							</div>
							<div className="ann14-top-countdown-words">
								<div className="ann14-top-countdown-word">天</div>
								<div className="ann14-top-countdown-sep" />
								<div className="ann14-top-countdown-word">时</div>
								<div className="ann14-top-countdown-sep" />
								<div className="ann14-top-countdown-word">分</div>
								<div className="ann14-top-countdown-sep" />
								<div className="ann14-top-countdown-word">秒</div>
							</div>
						</div>

						<div className="ann14-top-portals-container">
							<LuckyWheel ref={this.lotteryRef} {...this.state.option}>
								<button
									className="lotteryBtn"
									onClick={() => {
										//this.lotteryStart();
										this.drawPrize();
									}}
								>
									<div
										className="BtnBgImg"
										style={{
											backgroundImage: `url(${`${startGame
												? this.state.option.btning
												: phase == 2
													? this.state.option.btn
													: this.state.option.disabledbtn}`})`
										}}
									/>
								</button>
							</LuckyWheel>

							<div className="ann14-top-button-container">
								<div className="ann14-top-button-deposit">
									<div>今日累计有效存款</div>
									<div className="ann14-top-button-deposit-row">
										<div>{numberWithCommas(this.state.totalDepositedDaily)}元</div>
										<ReactIMG
											className="ann14-top-button-deposit-refresh"
											src="/img/events/ann14/reset-1.webp"
											onClick={() => {
												this.getMemberProgress();
											}}
										/>
									</div>
								</div>
								<div className="ann14-top-button-times">
									<div>今日剩余游戏次数</div>
									<div className="ann14-top-button-deposit-row">{remainingGrabFromCurrentTier}次</div>
								</div>
							</div>
						</div>

						{/* <div className="ann14-top-time-container">
							<div className="ann14-top-time">活动时间：6月18日 00:00 至 6月20日 23:59 (北京时间）</div>
						</div> */}

						<ReactModal
							isOpen={this.state.showHint}
							className="ann14-top-popup"
							overlayClassName="ann14-popup-overlay"
						>
							<div className="ann14-top-popup-header">
								<div>温馨提示</div>
								<ReactIMG
									className="ann14-top-popup-close"
									src="/img/events/ann14/Close-Icon.svg"
									onClick={() => this.setState({ showHint: false })}
								/>
							</div>
							<div className="ann14-top-popup-content">
								<div className="ann14-top-popup-desc">
									{hintType == 1 ? (
										<React.Fragment>
											存款 300 元即可获取 1 次参与游戏的机会！ <br />存得越多，机会越多
										</React.Fragment>
									) : null}
									{hintType == 2 ? (
										<React.Fragment>
											您今日的存款不足 300 元， <br />请先存款后再次参与游戏。
										</React.Fragment>
									) : null}
									{hintType == 3 ? (
										<div className="ann14-top-popup-desc-single">您今天的游戏次数已用完，请明天再试。</div>
									) : null}
									{hintType == 4 ? (
										<div className="ann14-top-popup-desc-single">您的游戏次数已用完，请存款后再试。</div>
									) : null}
									{hintType == 5 ? (
										<React.Fragment>
											很遗憾您的奖励是空的，请再接再厉！ <br />今天剩余 {remainingGrabFromCurrentTier} 次参与游戏的机会
										</React.Fragment>
									) : null}
									{hintType == 6 ? (
										<React.Fragment>
											很遗憾您的奖励是空的，请再接再厉！ <br />您参与游戏的次数已用完，请存款后再试。
										</React.Fragment>
									) : null}
									{hintType == 7 ? (
										<React.Fragment>
											很遗憾您的奖励是空的，请再接再厉！ <br />您今日参与游戏的次数已用完，请明天再试
										</React.Fragment>
									) : null}
									{hintType == 8 ? (
										<div className="ann14-top-popup-desc-single">抱歉，来晚一步，奖品被抢完了</div>
									) : null}
									{hintType == 9 ? (
										<React.Fragment>
											抱歉，您目前还不能参加游戏， <br />请等待您的存款通过审核。
										</React.Fragment>
									) : null}
									{hintType == 10 ? <React.Fragment>抱歉，该游戏已结束，请期待我们的下一个活动</React.Fragment> : null}
									{hintType == 11 ? <React.Fragment>系统出现错误，请联系客服</React.Fragment> : null}
								</div>
								<div className="ann14-top-popup-buttons">
									{hintType == 1 || hintType == 2 || hintType == 4 || hintType == 6 ? (
										<React.Fragment>
											<div
												className="ann14-top-popup-button-orange"
												onClick={() => this.setState({ showHint: false })}
											>
												返回
											</div>
											<div className="ann14-top-popup-button-sep" />
											<div
												className="ann14-top-popup-button-yellow"
												onClick={() => this.clickDeposit()}
											>
												立即存款
											</div>
										</React.Fragment>
									) : null}
									{hintType == 3 ||
									hintType == 7 ||
									hintType == 8 ||
									hintType == 9 ||
									hintType == 10 ||
									hintType == 11 ? (
										<React.Fragment>
											<div
												className={classNames({
													//'ann14-top-popup-button-iknow': hintType != 9,
													'ann14-top-popup-button-yellow': true
												})}
												onClick={() => this.setState({ showHint: false })}
											>
												我知道了
											</div>
										</React.Fragment>
									) : null}
									{hintType == 5 ? (
										<React.Fragment>
											<div
												className="ann14-top-popup-button-orange"
												onClick={() => this.setState({ showHint: false })}
											>
												返回
											</div>
											<div className="ann14-top-popup-button-sep" />
											<div
												className="ann14-top-popup-button-yellow"
												onClick={() => {
													//先關閉彈窗，然後抽獎
													this.setState({ showHint: false }, () => {
														this.drawPrize(false);
													});
												}}
											>
												继续自动获取
											</div>
										</React.Fragment>
									) : null}
								</div>
							</div>
						</ReactModal>
						<ReactModal
							isOpen={this.state.showPrizePopup}
							onAfterOpen={this.afterOpenPrizePopup}
							onAfterClose={this.afterClosePrizePopup}
							className="ann14-prize-popup"
							overlayClassName="ann14-popup-overlay"
						>
							{this.state.showPrizeResult ? (
								<div className="ann14-prize-popup-content">
									<div className="ann14-prize-popup-content-title">奖品</div>
									<ReactIMG
										className="ann14-prize-popup-content-prize-img"
										src={'/img/events/Mid-Autumn/CN/Prizes/CN_' + this.state.prizeType + '.png'}
									/>
									<div className="ann14-prize-popup-content-text">
										恭喜您获得{' '}
										<span className="ann14-prize-popup-content-text-highlight">
											{this.state.prizeName} !
										</span>{' '}
									</div>
									{prizeResultType == 1 ? (
										<div className="ann14-prize-popup-content-text">
											今天剩余{' '}
											<span className="ann14-prize-popup-content-text-highlight">
												{remainingGrabFromCurrentTier}
											</span>{' '}
											游戏次数。
										</div>
									) : null}
									{prizeResultType == 2 ? (
										<div className="ann14-prize-popup-content-text">您的游戏次数已用完，请存款后再试。</div>
									) : null}
									{prizeResultType == 3 ? (
										<div className="ann14-prize-popup-content-text">您今天的游戏次数已用完，请明天再试。</div>
									) : null}
									<div className="ann14-prize-popup-buttons">
										{prizeResultType == 1 ? (
											<React.Fragment>
												<div
													className="ann14-prize-popup-button-blue"
													onClick={() => this.setState({ showPrizePopup: false })}
												>
													{/* 返回 */}
												</div>
												<div className="ann14-prize-popup-button-sep" />
												<div
													className="ann14-prize-popup-button-yellow"
													onClick={() => {
														//先關閉彈窗，然後抽獎
														this.setState({ showPrizePopup: false }, () => {
															this.drawPrize(false);
														});
													}}
												>
													{/* 继续自动获取 */}
												</div>
											</React.Fragment>
										) : null}
										{prizeResultType == 2 ? (
											<React.Fragment>
												<div
													className="ann14-prize-popup-button-blue"
													onClick={() => this.setState({ showPrizePopup: false })}
												>
													{/* 返回 */}
												</div>
												<div className="ann14-prize-popup-button-sep" />
												<div
													className="ann14-prize-popup-button-deposit"
													onClick={() => this.clickDeposit()}
												>
													{/* 立即存款 */}
												</div>
											</React.Fragment>
										) : null}
										{prizeResultType == 3 ? (
											<React.Fragment>
												<div
													className="ann14-top-popup-button-iknow"
													onClick={() => this.setState({ showPrizePopup: false })}
												>
													{/* 我知道了 */}
												</div>
											</React.Fragment>
										) : null}
									</div>
								</div>
							) : null}
						</ReactModal>
					</div>
					<div className="ann14-middle">
						<div className="ann14-middle-title" />
						<div className="ann14-middle-content">
							<div className="ann14-middle-title-container">
								{/* <div className="ann14-middle-title-1">如何参与?</div> */}
								<div className="ann14-middle-title-2">轻松三步，幸运不断！</div>
							</div>
							<div className="ann14-middle-steps-container">
								<div className="ann14-middle-step ann14-middle-step1">
									<ReactIMG
										className="ann14-middle-step-img"
										src="/img/events/Mid-Autumn/HowToStep_1.png"
									/>
									<div className="ann14-middle-step-title-1">步骤一</div>
									<div className="ann14-middle-step-title-2">注册或登入您的账户</div>
								</div>
								<div className="ann14-middle-step ann14-middle-step2">
									<ReactIMG
										className="ann14-middle-step-img"
										src="/img/events/Mid-Autumn/HowToStep_2.png"
									/>
									<div className="ann14-middle-step-title-1">步骤二</div>
									<div className="ann14-middle-step-title-2">存款最低 300元 至您的账户</div>
								</div>
								<div className="ann14-middle-step ann14-middle-step3">
									<ReactIMG
										className="ann14-middle-step-img"
										src="/img/events/Mid-Autumn/HowToStep_3.png"
									/>
									<div className="ann14-middle-step-title-1">步骤三</div>
									<div className="ann14-middle-step-title-2">FUN转中秋</div>
								</div>
							</div>
							<div className="ann14-middle-button-container">
								<div
									className="ann14-middle-button"
									onClick={() => {
										// Pushgtagdata('Engagement_Event', 'View', 'TnC_MidAutumn2022​');
										this.setState({ showTNC: true });
									}}
								/>
							</div>
						</div>
						<ReactModal
							isOpen={this.state.showTNC}
							className="ann14-middle-popup"
							overlayClassName="ann14-popup-overlay"
						>
							<div className="ann14-middle-popup-header">
								<div>规则与条款</div>
								<ReactIMG
									className="ann14-middle-popup-close"
									src="/img/events/ann14/Close-Icon.svg"
									onClick={() => this.setState({ showTNC: false })}
								/>
							</div>
							<div className="ann14-middle-popup-content">
								1. 此活动开放给所有乐天堂会员<br />
								活动时间： 2022年9月9日 00:00 至2022年9月14日 23:59:59。(北京时间）<br />
								<br />
								2. 参加方式:<br />
								- 游戏次数将以会员当天累计存款总额为标准，最低存款为300元，如下图：<br />
								<br />
								<table className="ann14-middle-popup-table">
									<thead>
										<tr>
											<th>存款等级</th>
											<th>游戏次数</th>

											<th>累积次数</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>300 - 999</td>
											<td>1</td>
											<td rowSpan="5">一天5次</td>
										</tr>
										<tr>
											<td>1,000 - 2,499</td>
											<td>2</td>
										</tr>
										<tr>
											<td>2,500 - 4,999</td>
											<td>3</td>
										</tr>
										<tr>
											<td>5,000 - 9,999</td>
											<td>4</td>
										</tr>
										<tr>
											<td>10,000 以上</td>
											<td>5</td>
										</tr>
									</tbody>
								</table>
								<br />
								例:<br />
								会员于9月9日完成第一笔300元存款，即可获取一次游戏机会。会员其后再存款2,700元，当日总存款累积至3,000元，便可进行剩余的游戏次数。<br />
								<br />
								<br />
								- 当日游戏次数最多为5次。 ​<br />
								- 会员点击“转盘”以激活奖品。​<br />
								- 未进行的游戏次数不会累计至次日。​<br />
								<br />
								3. 此活动将以乐币, 免费彩金与神秘惊喜为奖品。<br />
								<br />
								4. 派彩时间：<br />
								免费彩金（主钱包）：得奖后30分钟内。<br />
								乐币（天王俱乐部）：得奖后30分钟内。<br />
								中秋大礼包（礼品）：确认收货信息之后的30天内。<br />
								<br />
								5. 乐币：<br />
								乐币自动计入会员账号后，可在天王俱乐部查询。使用有效期为30天。<br />
								<br />
								6. 免费彩金：<br />
								彩金自动记入会员主钱包后，有效期为30天。1倍流水方可提款。<br />
								<br />
								7. 中秋大礼包（礼品）：<br />
								- 礼品将随机派发，该礼品将不会透露直到会员收件。<br />
								- 天使客服将在活动结束后7天之内联系中奖会员，索取收件信息。<br />
								- 若礼品已出库，因收件信息不完整，物流公司无法联系会员而被退回，乐天堂有权撤销该礼品。<br />
								- 礼品不可兑换成现金、彩金、乐币、免费旋转。<br />
								<br />
								8. 须遵守乐天堂条款。<br />
								<br />
								<br />
							</div>
						</ReactModal>
					</div>
					<div className="ann14-bottom">
						<div className="ann14-bottom-title-container">
							<div className="ann14-bottom-title" />
						</div>
						<div className="ann14-bottom-prizes-box">
							{prizeList.map((pn) => {
								return (
									<ReactIMG
										key={pn}
										className="ann14-bottom-prize-img"
										src={'/img/events/Mid-Autumn/CN/Prizes/CN_' + pn + '.png'}
									/>
								);
							})}
						</div>
						<div className="ann14-bottom-button-container">
							<div
								className="ann14-bottom-button"
								onClick={() => {
									this.showMyPrizes();
								}}
							/>
						</div>
						<ReactModal
							isOpen={this.state.showMyPrizes}
							className="MyPrizes ann14-bottom-popup"
							overlayClassName="ann14-popup-overlay"
						>
							<div className="ann14-bottom-popup-header">
								<div>我的奖品</div>
								<ReactIMG
									className="ann14-bottom-popup-close"
									src="/img/events/ann14/Close-Icon.svg"
									onClick={() => this.setState({ showMyPrizes: false })}
								/>
							</div>
							<div className="ann14-bottom-popup-content">
								<table className="ann14-bottom-popup-table">
									<tbody>
										<tr>
											<th>日期</th>
											<th>奖品</th>
											<th>状态</th>
										</tr>
										{myPrizes && myPrizes.length > 0 ? (
											myPrizes.map((mp, index) => {
												return (
													<tr key={index}>
														<td>{mp.applyDate}</td>
														<td>{mp.prizeName}</td>
														<td>{mp.prizeStatusDesc}</td>
													</tr>
												);
											})
										) : (
											<tr>
												<td colSpan="3">没有获奖记录</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</ReactModal>
					</div>
				</div>
				{!HostConfig.Config.isLIVE ? (
					<React.Fragment>
						<div className="ann14-debug-entry" onClick={() => this.debug_clickEntry()} />
						<ReactModal
							isOpen={this.state.debug_showPopup}
							className="ann14-debug-popup"
							overlayClassName="ann14-popup-overlay"
						>
							<div className="ann14-debug-popup-header">
								<div>debug彈窗</div>
								<ReactIMG
									className="ann14-debug-popup-close"
									src="/img/events/ann14/Close-Icon.svg"
									onClick={() => this.setState({ debug_showPopup: false })}
								/>
							</div>
							<div className="ann14-debug-popup-content">
								<h2>===活動日期控制===</h2>
								<br />
								<h3>當前活動數據(北京時間)</h3>
								<div>起: {this.eventStartDateMoment.format('YYYY-MM-DD HH:mm:ss')}</div>
								<div>止: {this.eventEndDateMoment.format('YYYY-MM-DD HH:mm:ss')}</div>
								<br />
								<br />
								<h3>手動修改日期(北京時間)</h3>
								<div>
									起:{' '}
									<Input
										className="ann14-debug-popup-content-input"
										autoComplete="off"
										onChange={(e) => {
											this.setState({ debug_eventStartDate: e.target.value });
										}}
										value={this.state.debug_eventStartDate}
									/>
								</div>
								<div>
									止:{' '}
									<Input
										className="ann14-debug-popup-content-input"
										autoComplete="off"
										onChange={(e) => {
											this.setState({ debug_eventEndDate: e.target.value });
										}}
										value={this.state.debug_eventEndDate}
									/>
								</div>
								<br />
								<div
									className="ann14-debug-popup-content-button"
									onClick={() => this.debug_saveEventDate()}
								>
									套用(保存修改)
								</div>
								<div>(刷新頁面，就會恢復默認配置)</div>
								<br />
								<br />
								<h2>===溫馨提示彈窗測試(需要登入)===</h2>
								<br />
								<div className="ann14-debug-popup-content-hints">
									{[ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ].map((num) => {
										return (
											<div
												key={num}
												className="ann14-debug-popup-content-hint-button"
												onClick={() => {
													this.debug_showHint(num);
												}}
											>
												{num}
											</div>
										);
									})}
								</div>
								<br />
								<h2>===中獎彈窗測試(需要登入)===</h2>
								<br />
								<h3>選擇彈窗類型</h3>
								<div className="ann14-debug-popup-content-prizeResultTypes">
									{[ 1, 2, 3 ].map((num) => {
										return (
											<div
												key={num}
												className={
													'ann14-debug-popup-content-prizeResultType-button' +
													(this.state.debug_prizeResultType == num ? ' selected' : '')
												}
												onClick={() => {
													this.debug_selectPrizeResultType(num);
												}}
											>
												{num}
											</div>
										);
									})}
								</div>
								<h3>選擇獎品</h3>
								<div className="ann14-debug-popup-content-prizeTypes">
									{prizeList.map((num) => {
										return (
											<div
												key={num}
												className={
													'ann14-debug-popup-content-prizeType-button' +
													(this.state.debug_prizeType == num ? ' selected' : '')
												}
												onClick={() => {
													this.debug_selectPrizeType(num);
												}}
											>
												{num}
											</div>
										);
									})}
								</div>
								<div
									className="ann14-debug-popup-content-prize-button"
									onClick={() => this.debug_showPrize()}
								>
									打開中獎彈窗
								</div>
							</div>
						</ReactModal>
					</React.Fragment>
				) : null}
			</Layout>
		);
	}
}

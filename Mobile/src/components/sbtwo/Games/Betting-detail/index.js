/*
	投注页面 详情内页  播放视频 动画 游戏数据
*/
import React from 'react';
import Router from 'next/router';
import { withBetterRouter } from '$SBTWOLIB/js/withBetterRouter';
import dynamic from 'next/dynamic';
import { DataConsumer } from '$SBTWO/DataProvider/';
import SelectionBox from '$SBTWO/Games/Betting-detail/BetGroup/SelectionBox';
import Collapse, { Panel } from 'rc-collapse';
import { ReactSVG } from '$SBTWO/ReactSVG';
import DetailHeader from './Detail-Header';
import Bottombetbox from '$SBTWO/Games/Footer/bottombetbox';
import BetCartPopup from '$SBTWO/Games/Betting/BetCartPopup';
import Bottomsheet from '$SBTWO/Games/Footer/bottomsheet';
import Skeletondetail from '$SBTWO/Skeleton/detail';
import LazyImageForTeam from '$SBTWO/LazyLoad/LazyImageForTeam';
import LazyImageForLeague from '../../LazyLoad/LazyImageForLeague';
import { forceCheck } from 'react-lazyload';
import SelectionData from '$SBTWOLIB/vendor/data/SelectionData';
import moment from 'moment';
import FullScreen from './FullScreen';
import Drawer from '$SBTWO/Drawer';
import BetCart from '$SBTWO/Games/Footer/BetCart';
import Smartcoach from './Smartcoach';
import { EventChangeType, SpecialUpdateType, VendorMarkets } from '$SBTWOLIB/vendor/data/VendorConsts';
import { ChangeSvg, checkIsLogin, redirectToLogin } from '$SBTWOLIB/js/util';
import EventData from '$SBTWOLIB/vendor/data/EventData';
import md5 from 'crypto-js/md5';
import { connect } from 'react-redux';
import { ACTION_BetCart_setIsComboBet, ACTION_BetCart_add, ACTION_BetCart_remove, ACTION_BetCart_clear } from '@/lib/redux/actions/BetCartAction';
import Toast from '$SBTWO/Toast';
import SbShare from "./SbShare";

class BettingDetail extends React.Component {
	constructor() {
		super();
		this.state = {
			isOpen: false,
			fixedLive: false,
			LineGroupId: null, //選中的玩法分組
			PinLines: [], //置頂的玩法
			showDrawer: false,
			EventDetail: '',
			eventDatas: '' /* 顶部导航赛事 */,
			OddsUpData: '' /* 上升赔率 */,
			OddsDownData: '' /* 下降赔率 */,
			scaleStatus: false,
			showBet: false,
			isLandscape: false,
			LineGroupBarFreeze: false, //玩法分組條 是否固定在最上方
			LineToggleStatusArray: null, //玩法展開/收起的狀態
			Tabactive: 0,
			infoTabIsEnabled: false, //情報tab可用
			showSharePopup: false, //分享彈窗
		};

		this.lineGroupMore = React.createRef();
		this.lineGroupBarRef = React.createRef();
		this.detailHeaderRef = React.createRef();
		this.detailBannerRef = React.createRef();
		this.linesContainerRef = React.createRef();
		// 投注全屏窗口元素（全屏状态投注滑动窗口需要）
		this.bettingDrawer = React.createRef();
		this._refCheckBetting = React.createRef();
		this._refsShowBottom = React.createRef();
		this._Smartcoach = React.createRef();
	}
	componentDidMount() {
		const { eid, sid, lid, OE } = this.props.router.query;
		this.GetIMdatadetail(sid, eid, OE === 'true');
		this.getLiveEventsInSameLeague(eid, sid, lid);

		//處理捲動時，玩法分組 固定在上方
		const handleScroll = (topOffset = 0) => {
			if (this.lineGroupBarRef.current && this.linesContainerRef.current) {
				const lgbcr = this.lineGroupBarRef.current.getBoundingClientRect(); //玩法組橫條
				var lgbcr_height = lgbcr.height || lgbcr.bottom - lgbcr.top; //相容ie
				const lcbcr = this.linesContainerRef.current.getBoundingClientRect(); //玩法列表

				//凍結的條件： 玩法列表的top 小於等於  天花板 +玩法組的height)
				//注意豎屏  上面有聯賽名橫條(topOffset)
				//另外需要考慮 點擊pin 視頻/動畫也凍結的情況
				let fixedHeaderHieght = -1;
				//橫屏不用考慮Pin
				if (!this.state.isLandscape && this.state.fixedLive && this.detailBannerRef.current) {
					const dhcr = this.detailBannerRef.current.getBoundingClientRect(); //頭部 視頻/動畫
					fixedHeaderHieght = (dhcr.height || dhcr.bottom - dhcr.top) - 1; //相容ie
					//console.log('====fixedHeaderHieght2',fixedHeaderHieght);
				}

				let freeze = lcbcr.top <= lgbcr_height + topOffset + fixedHeaderHieght;
				if (this.state.LineGroupBarFreeze) {
					//固定(fixed) 之後 玩法組高度不計
					freeze = lcbcr.top <= topOffset + fixedHeaderHieght;
				}
				//console.log('====',freeze,lcbcr.top,'<=',lgbcr_height + topOffset+ fixedHeaderHieght,lgbcr_height,topOffset,fixedHeaderHieght);
				if (this.state.LineGroupBarFreeze !== freeze) {
					//減少觸發render次數
					this.setState({ LineGroupBarFreeze: freeze });
				}
			} else {
				//console.log('===lineGroupRef not FOUND');
			}
		};

		let topOffset = 0;
		if (this.detailHeaderRef.current) {
			topOffset = this.detailHeaderRef.current.clientHeight;
		}

		this.handleWindowScrollForLineGroupBar = () => handleScroll(topOffset);
		window.addEventListener('scroll', this.handleWindowScrollForLineGroupBar);

		//橫屏時，捲動目標改成betting_list_detail
		const detail = document.getElementById('betting_list_detail');
		if (detail) {
			this.handleDetailDivScrollForLineGroupBar = () => handleScroll();
			detail.addEventListener('scroll', this.handleDetailDivScrollForLineGroupBar);
		}

		window.addEventListener(
			'onorientationchange' in window ? 'orientationchange' : 'resize',
			this.getDirection,
			false
		);
	}

	getDirection = () => {
		// if (window.orientation === 180 || window.orientation === 0) {
		// 	console.log('竖屏状态！');
		// }
		if (window.orientation === 90 || window.orientation === -90) {
			this.setState({
				Tabactive: 0
			});
		}
	};

	componentWillUnmount() {
		this.props.Vendor.deletePolling(this.eventPollingKey);
		//處理捲動時，玩法分組 固定在上方
		if (this.handleWindowScrollForLineGroupBar) {
			window.removeEventListener('scroll', this.handleWindowScrollForLineGroupBar);
		}
		//橫屏時，捲動目標改成betting_list_detail
		const detail = document.getElementById('betting_list_detail');
		if (detail && this.handleDetailDivScrollForLineGroupBar) {
			detail.removeEventListener('scroll', this.handleDetailDivScrollForLineGroupBar);
		}
		window.removeEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', this.getDirection);
		//離開後允許滑動 for safari
		document.removeEventListener('touchmove',this.preventTouchMove, false);
	}

	/* 游戏详情数据 */
	GetIMdatadetail = (sid, eid, OE) => {
		//加快速度，從緩存中獲取初始展示數據
		const cacheKey = sid + '|||' + eid;
		const cachedEventDataJSON = this.props.Vendor._cacheGet(cacheKey, null);
		let cachedEventData = null;
		if (cachedEventDataJSON) {
			const tmpObj = JSON.parse(cachedEventDataJSON);
			cachedEventData = EventData.clone(tmpObj);
		}

		if (cachedEventData) {
			this.setState({ EventDetail: cachedEventData });
		}

		//輪詢 單個比賽數據(在比賽詳情頁 使用) 返回輪詢key
		this.eventPollingKey = this.props.Vendor.getEventDetailPolling(
			(PollingResult) => {
				//處理 數據變化
				let OddsUpData = {Selections:{}};
				let OddsDownData = {Selections:{}};
				PollingResult.Changes.map((changeData) => {
					//類型：更新
					if (changeData.ChangeType === EventChangeType.Update) {
						changeData.SpecialUpdates.map((sUpdateData) => {
							const thisEventId = changeData.EventId; //比賽ID
							// 處理賠率上升動畫
							if (sUpdateData.UpdateType === SpecialUpdateType.OddsUp) {
								const thisLineId = sUpdateData.LineId; //投注線ID
								const thisSelectionId = sUpdateData.SelectionId; //投注選項ID
								const selectionKey = thisEventId + '|||' + thisLineId + '|||' + thisSelectionId;
								OddsUpData.Selections[selectionKey] = true;
							}
							// 處理賠率下降動畫
							if (sUpdateData.UpdateType === SpecialUpdateType.OddsDown) {
								const thisLineId = sUpdateData.LineId; //投注線ID
								const thisSelectionId = sUpdateData.SelectionId; //投注選項ID
								const selectionKey = thisEventId + '|||' + thisLineId + '|||' + thisSelectionId;
								OddsDownData.Selections[selectionKey] = true;
							}
						});
					}
				});

				//整理一次setState 避免多次刷新
				const newState = {
					EventDetail: PollingResult.NewData,
					OddsUpData,
					OddsDownData
				};

				this.setState(newState);
			},
			parseInt(sid),
			eid,
			OE
		); // <==查詢參數  足球 比賽ID
	};

	ShowBottomSheet = (type) => {
		this._refsShowBottom.current.ShowBottomSheet(type);
	};

	/* 存储单投数据 */
	PushBetCart = (data, type) => {
		const { VendorName } = this.props.Vendor.configs;
		this.props.betCart_add(data,VendorName)
		const isComboBet = this.props.betCartInfo['isComboBet' + VendorName];
		const betCartData = this.props.betCartInfo['betCart' + VendorName]

		if (this.state.isLandscape) {
			this.setState({ showBet: true });
		} else {
			if (!isComboBet) {
				this._refsShowBottom.current.ShowBottomSheet(type);
			}
		}
	};

	/* 删除数据 */
	RemoveBetCart = async (data= null) => {
		const { VendorName } = this.props.Vendor.configs;
		if (data === null) {
			//清空
			await this.props.betCart_clear(VendorName);
			await this.props.betCart_setIsComboBet(false, VendorName);
		} else {
			//刪除單個
			await this.props.betCart_remove(data, VendorName);
		}

		const betCartData = this.props.betCartInfo['betCart' + VendorName]
		// 如果刪除後購物車為空，自動關閉購物車
		if (!betCartData || betCartData.length <= 0) {
			this.setState({ showBet: false });
			await this.props.betCart_setIsComboBet(false, VendorName);
			this._refsShowBottom.current.CloseBottomSheet();
		}
	};

	//點擊賠率=>投注
	clickOdds = (selectionData) => {
		if (!checkIsLogin()) {
			redirectToLogin();
			return;
		}
		//自我限制
		if (global.hasSelfExclusion && global.hasSelfExclusion(3)) {
			return;
		}
		if (!selectionData) {
			return;
		}

		if (!selectionData.DisplayOdds || selectionData.DisplayOdds == 0) return;

		const { Vendor } = this.props;
		const isComboBet = this.props.betCartInfo['isComboBet' + Vendor.configs.VendorName];
		const betCartData = this.props.betCartInfo['betCart' + Vendor.configs.VendorName];

		let overMaxSelectionCount = betCartData.length >= Vendor.configs.MaxParlay; //是否超過最大限制

		if (!isComboBet) { //單投
			this.PushBetCart(selectionData, 1);
		} else {
			//串關
			//沒超過最大限制
			if (!overMaxSelectionCount) {
				//串關模式是 點擊添加，再點一次就取消
				let indexOf = betCartData.findIndex((v) => {
					return v.SelectionId == selectionData.SelectionId;
				});
				if (indexOf === -1) {
					this.PushBetCart(selectionData, 2);
					Toast.success('添加成功');
				} else {
					this.RemoveBetCart(selectionData);
				}
			} else {
				Toast.error('哎呀，最多可投注串关' + Vendor.configs.MaxParlay + '场呦');
			}
		}
	};

	getLiveEventsInSameLeague(eid, sid, lid) {
		//參數 體育id(SportId) , 聯賽id(LeagueId) , 賽事id(EventId)
		this.props.Vendor.getLiveEventsInSameLeague(sid, lid, eid).then((eventDatas) => {
			this.setState({
				eventDatas: eventDatas
			});
		});
	}

	//投注線再分組，把類似的玩法合在一堆，返回是數組格式(適配IM同玩法會分成多線的狀況)
	getSimilarGroupedLines(LinesArray) {
		let SimilarGroupedLines = [];
		//給的投注線是已經排序過了，所以直接按順序往下找就可以
		let previousLine = null;
		let tmpLineGroup = [];
		LinesArray.map((l, index) => {
			if (previousLine) {
				if (previousLine.isSimilarTo(l)) {
					tmpLineGroup.push(l); //和前一個投注線類似 放一起
				} else {
					//不相同，保留現在的分組
					SimilarGroupedLines.push(tmpLineGroup);
					//產生一個新的分組
					tmpLineGroup = [];
					tmpLineGroup.push(l);
				}
			} else {
				//第一個執行 還沒有previousLine，直接加入分組
				tmpLineGroup.push(l);
			}

			//最後一筆 保留現在的分組
			if (index === LinesArray.length - 1) {
				SimilarGroupedLines.push(tmpLineGroup);
			} else {
				previousLine = l;
			}
		});
		return SimilarGroupedLines;
	}

	//切換玩法置頂
	togglePinLine(key) {
		let tmp = this.state.PinLines.slice();
		if (this.state.PinLines.indexOf(key) === -1) {
			//加入置頂
			tmp.push(key);
		} else {
			//移除置頂
			tmp = this.state.PinLines.filter((k) => k !== key);
		}
		this.setState({ PinLines: tmp });
	}

	//返回列表頁
	backToList() {
		//默認使用routerFilter存下的主頁面查詢參數
		const { Vendor, routerLog } = this.props;

		//處理特殊跳轉
		const from = Router.query.from;
		if (from && from.length > 0) {
			//解析from參數 暫定格式為 [來源名稱]@[相關參考數據]
			let actionName = from;
			let actionInfo = null;
			if (from.indexOf('@') >= 0) {
				const actionData = from.split('@');
				if (actionData && actionData.length > 1) {
					actionName = actionData[0];
					actionInfo = actionData[1];
				}
			}

			//從搜尋過來的
			if (actionName && actionName.toLowerCase() === 'search') {
				Router.push({
					pathname: '/sbtwo/search/' + Vendor.configs.VendorName.toLowerCase(),
					query: {
						keyword: actionInfo
					}
				});
				return;
			}
		}

		const EventData = this.state.EventDetail;

		let query = null;
		let log = routerLog['/sbtwo' + Vendor.configs.VendorPage];
		if (log && log.query) {
			query = log.query;
		}

		if (query === null) {
			query = {};
			//整頁刷新就會拿不到來源，使用當前的EventData做為參考
			if (EventData) {
				query.SportId = EventData.SportId;
				query.MarketId = EventData.MarketId;
				//早盤需要指定日期
				if (parseInt(EventData.MarketId) === VendorMarkets.EARLY) {
					const targetDate = EventData.getEventDateMoment().format('YYYY-MM-DD');
					query.StartDate = targetDate;
					query.EndDate = targetDate;
				}
			}
		}

		Router.push({
			pathname: '/sbtwo' + Vendor.configs.VendorPage,
			query: query
		});
	}

	/**
	 * @description: 切換情報tab狀態，並打印运行日志 监控无法执行原因 线上正常执行log
	 * @param log 信息，有log表示smartcoach有錯誤
	 * @param hasNamiAnalysis 是否有nami分析數據
	 * @return {*} 控制台信息
  	*/
	setInfoTabStatus = (log, hasNamiAnalysis = false) => {
		const smartCoachOK = (log === false);
		const infoTabIsEnabled = smartCoachOK || hasNamiAnalysis; //其中一個有數據，就可以

		let newState = {
			infoTabIsEnabled,
		};

		//增加tab=sc參數支持即時切換
		if (infoTabIsEnabled && Router.query && Router.query.tab == 'sc') {
			newState.Tabactive = '1';
		}

		this.setState(newState);

		if (!smartCoachOK) {
			window.console.log('%c情报日志報錯======>', 'color:red;', log);
		}
	};

	preventTouchMove = (e) => {
		e.preventDefault();
		return false;
	}

	//展示分享彈窗
	showSharePopup = () => {
		//進入前禁止滑動 for safari
		document.addEventListener('touchmove',this.preventTouchMove, { passive: false});

		const { Vendor } = this.props;
		const {EventDetail} = this.state;
		const venodrNameMap = {'IM':'IM', 'SABA':'OW', 'BTI':'BTI'};
		const thisEventId =  venodrNameMap[Vendor.configs.VendorName] + '_' + (EventDetail ? EventDetail.EventId : 'MatchID')
		this.setState({showSharePopup: true});
		// Pushgtagdata('Navigation','Click','Share_' + thisEventId)
	}
	//關閉分享彈窗
	hideSharePopup = () => {
		//離開後允許滑動 for safari
		document.removeEventListener('touchmove',this.preventTouchMove, false);

		this.setState({showSharePopup: false});
	}

	render() {
		const {
			LineGroupId,
			PinLines,
			EventDetail,
			OddsUpData,
			OddsDownData,
			showDrawer,
			eventDatas,
			LineToggleStatusArray,
			Tabactive
		} = this.state;
		const { Vendor } = this.props;
		const isComboBet = this.props.betCartInfo['isComboBet' + Vendor.configs.VendorName];
		const betCartData = this.props.betCartInfo['betCart' + Vendor.configs.VendorName];
		const { LineGroups, Lines } = EventDetail ? EventDetail : {};
		console.log('%c游戏详情', 'font-size:19px;color:red;', EventDetail);

		//處理玩法分組
		let selectedLineGroup = null;
		let sortedLineGroups = [];
		if (LineGroups && LineGroups.length > 0) {
			const selectedLineGroups = LineGroups.filter((lg) => lg.LineGroupId === LineGroupId);
			if (selectedLineGroups && selectedLineGroups.length > 0) {
				selectedLineGroup = selectedLineGroups[0];
			}
			//把選中的玩法分組移到第一個
			sortedLineGroups = LineGroups;
			if (selectedLineGroup) {
				const selectedItems = LineGroups.filter((i) => i.LineGroupId === selectedLineGroup.LineGroupId);
				const withoutSelectedItems = LineGroups.filter((i) => i.LineGroupId !== selectedLineGroup.LineGroupId);
				sortedLineGroups = selectedItems.concat(withoutSelectedItems);
			}
		}

		//處理玩法過濾 和 玩法整合
		let groupedLines = this.getSimilarGroupedLines(
			//同類的投注線放在一個數組裡
			EventDetail
				? selectedLineGroup
					? Lines.filter(
							//玩法過濾，只展示選中的玩法分組
							(item) =>
								item.LineGroupIds &&
								item.LineGroupIds.length > 0 &&
								item.LineGroupIds.indexOf(LineGroupId) !== -1
						)
					: Lines
				: []
		);

		//處理玩法展開收起
		let closedLineKeyArray = []; //收起的玩法key
		if (LineToggleStatusArray && LineToggleStatusArray.length > 0) {
			LineToggleStatusArray.map((info) => {
				if (!info.isOpen) {
					closedLineKeyArray.push(info.key);
				}
			});
		}

		//console.log('===closedLineKeyArray',closedLineKeyArray);

		const allLineKeyArray = []; //全部的玩法Key
		let openLineKeyArray = []; //展開的玩法key
		groupedLines.map((lineArray) => {
			const firstLine = lineArray[0];
			const thisKey = firstLine.getKeyForCompare();
			allLineKeyArray.push(thisKey);
			if (closedLineKeyArray.indexOf(thisKey) === -1) {
				openLineKeyArray.push(thisKey); //默認展開
			}
		});

		//console.log('===openLineKeyArray',openLineKeyArray);

		//配置在key={} 用來觸發刷新
		const openLineKeyArrayJSON = md5(JSON.stringify(openLineKeyArray));

		//把選中的置頂玩法移到第一個
		let sortedGroupedLines = groupedLines;
		if (PinLines && PinLines.length > 0) {
			//選中的
			const selectedGroupedLines = groupedLines.filter((lineArray) => {
				const firstLine = lineArray[0];
				const thisKey = firstLine.getKeyForCompare(); //玩法合併用的key
				return PinLines.indexOf(thisKey) !== -1;
			});
			//沒選中的
			const withoutSelectedGroupedLines = groupedLines.filter((lineArray) => {
				const firstLine = lineArray[0];
				const thisKey = firstLine.getKeyForCompare(); //玩法合併用的key
				return PinLines.indexOf(thisKey) === -1;
			});
			//接起來
			sortedGroupedLines = selectedGroupedLines.concat(withoutSelectedGroupedLines);
		}

		return <>
			<FullScreen
				setHandle={(v) => {
					this.handle = v;
				}}
				setStatus={(v) => {
					this.setState({ scaleStatus: v });
				}}
				Vendor={this.props.Vendor}
			>
				<div
					id="betting_list_detail"
					className={`Betting-list-detail ${this.props.className}`}
					ref={this.bettingDrawer}
				>
					{/* 頭部賽事點擊->下拉菜單 */}
					{eventDatas &&
					eventDatas.length > 0 && (
						<Drawer
							direction="top"
							wrapDom={this.bettingDrawer}
							onClose={() => {
								this.setState({
									showDrawer: false
								});
							}}
							className="fullscreen-drawer detail-header-drawer"
							visible={showDrawer}
						>
							<div className="detail-header-drawer-contents">
								<div className="drawer-header">
									<div className="drawer-header-title">
										{eventDatas[0].LeagueName} <ReactSVG className="back-icon" src="/img/svg/dow.svg" />
									</div>
								</div>
								{eventDatas.map((item, index) => {
									return (
										<div
											className="con"
											key={index}
											onClick={() => {
												const { Vendor } = this.props;
												//用replace避免返回按鈕失效(預期應該返回列表)
												this.setState(
													{
														showDrawer: false
													},
													() => {
														const URL = '/sbtwo' + Vendor.configs.VendorPage;
														const newUrl = `${URL}/detail?sid=${item.SportId}&eid=${item.EventId}&lid=${item.LeagueId}&OE=${item.IsOutRightEvent}`;
														Router.replace(newUrl);
														//因為是同頁切換，所以不會刷新 也不會觸發didmount，直接複製didmount的處理函數更新數據
														this.GetIMdatadetail(
															item.SportId,
															item.EventId,
															item.IsOutRightEvent
														);
														this.getLiveEventsInSameLeague(
															item.EventId,
															item.SportId,
															item.LeagueId
														);
													}
												);
												// Pushgtagdata(`Game Nav`, 'Click', 'ViewMore_MatchPage_SB2.0');
											}}
										>
											<ul key={index} className={index == 0 ? 'active' : ''}>
												<li className="name">
													<LazyImageForTeam Vendor={Vendor} TeamId={item.HomeTeamId} IconUrl={item.HomeIconUrl} />
													<p className="name-txt">{item.HomeTeamName}</p>
												</li>
												<li className="center">
													<p>
														<b className={item.HomeScore == 0 ? 'color' : ''}>
															{item.HomeScore}
														</b>
														&nbsp;-&nbsp;
														<b className={item.AwayScore == 0 ? 'color' : ''}>
															{item.AwayScore}
														</b>
													</p>
													<span>{item.RBMinute}'</span>
												</li>
												<li className="name">
													<LazyImageForTeam Vendor={Vendor} TeamId={item.AwayTeamId} IconUrl={item.AwayIconUrl} />
													<p className="name-txt">{item.AwayTeamName}</p>
												</li>
											</ul>
										</div>
									);
								})}
							</div>
						</Drawer>
					)}

					{/* 橫屏的投注購物車 */}
					<Drawer
						direction="right"
						wrapDom={this.bettingDrawer}
						onClose={() => {
							this.setState({ showBet: false });
						}}
						className="fullscreen-drawer detail-minibet-drawer"
						visible={this.state.showBet}
					>
						{this.state.showBet && (
							<BetCart
								ref={this._refCheckBetting}
								Vendor={this.props.Vendor}
								/* 是否横屏 */
								Minishow={true}
								/* 串关类型 */
								BetType={1}
								/* 是否是详情页 */
								DetailPage={true}
								/* 购物车删除 */
								RemoveBetCart={this.RemoveBetCart}
								/* 关闭投注框 */
								CloseBottomSheet={() => {
									this.setState({ showBet: false });
								}}
								/* 关闭横屏投注 */
								onClose={() => {
									this.setState({ showBet: false });
								}}
							/>
						)}
					</Drawer>
					{/* 頭部賽事橫條 */}
					<div
						className={'Betting-detail-header' + (EventDetail === null ? ' noEventDataLandscape' : '')}
						ref={this.detailHeaderRef}
					>
						<ReactSVG
							className="back-icon"
							src="/img/svg/LeftArrow.svg"
							onClick={() => {
								this.backToList();
							}}
						/>
						{eventDatas && eventDatas.length > 1 ? (
							<>
								<h3
									onClick={() => {
										this.setState(
											{
												showDrawer: !this.state.showDrawer
											},
											() => {
												setTimeout(forceCheck, 500); //lazyload強制觸發
											}
										);
									}}
								>
									<LazyImageForLeague
										Vendor={Vendor}
										LeagueId={eventDatas[0].LeagueId}
										thisClassName="Game-logo"
									/>
									<span>{eventDatas[0].LeagueName}</span>
									<ReactSVG
										className="down-arrow"
										src={this.state.showDrawer ? '/img/svg/up.svg' : '/img/svg/dow.svg'}
									/>
								</h3>
								{/*猜冠軍不能分享*/}
								{EventDetail && !EventDetail.IsOutRightEvent ?
									<ReactSVG
										className="share-button"
										src={'/img/svg/share.svg'}
										onClick={this.showSharePopup}
									/> : null
								}
							</>
						) : (
							EventDetail && <>
								<h3>
									<LazyImageForLeague
										Vendor={Vendor}
										LeagueId={EventDetail.LeagueId}
										thisClassName="Game-logo"
									/>
									<span>{EventDetail.LeagueName}</span>
								</h3>
								{/*猜冠軍不能分享*/}
								{!EventDetail.IsOutRightEvent ?
									<ReactSVG
										className="share-button"
										src={'/img/svg/share.svg'}
										onClick={this.showSharePopup}
									/> : null
								}
							</>
						)}
					</div>

					{EventDetail ? EventDetail.IsOutRightEvent ? (
						/* 猜冠军详情 */
						<div className="Betting-list" style={{ backgroundColor: 'white', padding: 0 }}>
							<b className="ChampionTime">{EventDetail.getEventDateMoment().format('MM/DD HH:mm')}</b>
							<label className="Championlabel">{EventDetail.OutRightEventName}</label>
							{Lines && Lines[0] ? (
								Lines[0].Selections.map((d, k) => {
									let CheckSelect =
										isComboBet == true
											? betCartData.filter((i) => i.SelectionId == d.SelectionId)
											: [];
									return (
										<div className="Champion" key={k}>
											<div className="Team">
												<LazyImageForTeam Vendor={Vendor} LeagueId={d.TargetTeamId} />
												<span className="name">{d.SelectionName}</span>
											</div>
											{d.Odds ? (
												<div
													className={CheckSelect != '' ? 'Team Right active' : 'Team Right'}
													onClick={() => {
														this.clickOdds(d);
													}}
												>
													<span
														dangerouslySetInnerHTML={{
															__html: ChangeSvg(d.DisplayOdds)
														}}
														className="NumberBet"
													/>
												</div>
											) : (
												<div className="gray Team Right">-</div>
											)}
										</div>
									);
								})
							) : null}
						</div>
					) : (
						/* 常规赛事详情 */
						<div className={`Betting-detail-content ${this.state.fixedLive.toString()}`}>
							<DetailHeader
								setRef={(v) => {
									this.detailBannerRef = v;
								}}
								handle={this.handle}
								fixedStatus={this.state.fixedLive}
								scaleStatus={this.state.scaleStatus}
								setIsLandscape={(v) => {
									this.setState({ isLandscape: v }, () => {
										//強制更新玩法組位置
										if (v !== true) {
											//豎屏
											if (this.handleWindowScrollForLineGroupBar) {
												this.handleWindowScrollForLineGroupBar();
											}
										} else {
											if (this.handleDetailDivScrollForLineGroupBar) {
												this.handleDetailDivScrollForLineGroupBar();
											}
										}
									});
								}}
								setFixed={(v) => {
									this.setState({ fixedLive: v }, () => {
										//解除pin時，強制檢查
										if (v === false) {
											setTimeout(() => {
												this.handleWindowScrollForLineGroupBar();
											}, 100);
										}
									});
								}}
								Vendor={this.props.Vendor}
								EventData={EventDetail}
							/>
							{/* 新增smartcoach 20210518 */}
							{this.props.Vendor.configs.VendorName == 'IM' && (
								<div className="smartnav">
									{[ '赔率', '情报' ].map((name, key) => {
										/* 如果未匹配到比赛则禁用情报 */

										const infoTabIsDisabled = !this.state.infoTabIsEnabled && key == 1;
										return (
											<div
												style={{ color: infoTabIsDisabled ? '#BCBEC3' : null }}
												className={Tabactive == key ? 'active' : ''}
												key={key}
												onClick={() => {
													if (infoTabIsDisabled) return;
													this.setState({
														Tabactive: key
													});
													// key == 1 &&
														// Pushgtagdata(`Match_Feature`, 'View', `Smartcoach_MatchPage`);
												}}
											>
												{name}
											</div>
										);
									})}
								</div>
							)}

							{/*修復 safari 下巴網址列問題 用一塊白的把所有東西往下移 */}
							{ this.state.showSharePopup ?
								<div style={{height: '100vh', width: '100%', display: 'block', backgroundColor: 'white'}}>&nbsp;</div>
								: null }

							{/* -------赔率内容------- */}
							{Tabactive == 0 && (
								<div>

									<div
										className={this.state.LineGroupBarFreeze ? 'Detail-menu freeze' : 'Detail-menu'}
										style={{ marginTop: this.props.Vendor.configs.VendorName == 'IM' ? 0 : null }}
										id={this.props.Vendor.configs.VendorName == 'IM' ? 'Detail-menu-top-hide' : null}
									>
										<div
											className={
												(this.state.LineGroupBarFreeze
													? 'Tabscontent-menu freeze'
													: 'Tabscontent-menu') +
												(this.state.LineGroupBarFreeze && this.state.fixedLive
													? ' freeze-with-pin'
													: '')
											}
											ref={this.lineGroupBarRef}
										>
											<div className="Tabscontent-menu-items">
												<div
													className={selectedLineGroup === null ? 'list active' : 'list'}
													onClick={() => {
														this.setState({
															LineGroupId: null
														});
														// Pushgtagdata(`Odds_Filter`, 'Click', 'Matchpage_Odds');
													}}
												>
													全部 {Lines ? Lines.length : 0}
												</div>
												{sortedLineGroups.map((item, index) => {
													//console.log(item);
													if (item.LineCount > 0) {
														//有數據的分類才展示
														return (
															<div
																className={
																	(selectedLineGroup
																		? selectedLineGroup.LineGroupId
																		: null) === item.LineGroupId ? (
																		'list active'
																	) : (
																		'list'
																	)
																}
																key={index}
																onClick={() => {
																	this.setState({
																		LineGroupId: item.LineGroupId
																	});
																	// Pushgtagdata(
																	// 	`Odds_Filter`,
																	// 	'Click',
																	// 	'Matchpage_Odds'
																	// );
																}}
															>
																{item.LineGroupName + ' ' + item.LineCount}
															</div>
														);
													} else {
														return null;
													}
												})}
											</div>
											<div
												className="list"
												onClick={() => {
													this.lineGroupMore.current.show();
												}}
											>
												<ReactSVG className="Betting-add-svg" src={'/img/svg/betting/add.svg'} />更多
											</div>
										</div>
									</div>
									{/* 盘口列表 */}
									<div
										className={
											this.state.LineGroupBarFreeze ? 'Collapselist freeze' : 'Collapselist'
										}
										ref={this.linesContainerRef}
									>
										<Collapse
											defaultActiveKey={openLineKeyArray}
											accordion={false}
											onChange={(activeLineKeyArray) => {
												//console.log('===activeLineKeyArray',activeLineKeyArray);
												const LineToggleStatusArray = allLineKeyArray.map((thisKey) => {
													if (activeLineKeyArray.indexOf(thisKey) !== -1) {
														return { key: thisKey, isOpen: true };
													} else {
														return { key: thisKey, isOpen: false };
													}
												});
												this.setState({ LineToggleStatusArray }); //保存展開/收起狀態
											}}
											key={openLineKeyArrayJSON}
										>
											{sortedGroupedLines.map((groupedLines, index) => {
												const firstItem = groupedLines[0];
												const thisKey = firstItem.getKeyForCompare();
												const isPined = PinLines.indexOf(thisKey) !== -1;
												return (
													<Panel
														key={firstItem.getKeyForCompare()}
														header={
															<span className="title">
																{firstItem.LineDesc}
																<i
																	className={isPined ? 'active' : ''}
																	onClick={(e) => {
																		e.stopPropagation(); //禁止穿透點擊
																		this.togglePinLine(thisKey);
																	}}
																>
																	<ReactSVG
																		className="public-svg"
																		src={
																			isPined ? (
																				'/img/svg/betting/goup_active.svg'
																			) : (
																				'/img/svg/betting/goup.svg'
																			)
																		}
																	/>
																</i>
															</span>
														}
														headerClass="my-header-class"
													>
														{groupedLines.map((item, indexInGroupedLines) => {
															return (
																<SelectionBox
																	key={item.LineId}
																	Vendor={Vendor}
																	OddsUpData={OddsUpData}
																	OddsDownData={OddsDownData}
																	LineData={item}
																	IndexInArray={indexInGroupedLines}
																	ClickOdds={this.clickOdds}
																/>
															);
														})}
													</Panel>
												);
											})}
										</Collapse>
									</div>
								</div>
							)}
							{/* ------SmartCoach 赛事情报----- */}

							{this.props.Vendor.configs.VendorName == 'IM' &&
							<Smartcoach
								EventDetail={EventDetail}
								Vendor={this.props.Vendor}
								ref={this._Smartcoach}
								setInfoTabStatus={this.setInfoTabStatus}
								Tabactive={Tabactive}
							/>
							}
						</div>
					) : EventDetail === '' ? (
						<Skeletondetail />
					) : (
						<div className="noEventData">
							<ReactSVG className="noEventData-icon" src="/img/svg/betting/nodata.svg" />
							<div className="noEventData-header">无数据</div>
							<div className="noEventData-desc1">本场比赛暂无数据,</div>
							<div className="noEventData-desc2">您可以返回并查看其它赛事。</div>
						</div>
					)}
					{/* 投注板块 */}
					<Bottombetbox
						ref={this._refsShowBottom}
						RemoveBetCart={this.RemoveBetCart}
						DetailPage={true}
						Vendor={this.props.Vendor}
					/>
					{/* 投注购物车浮窗 */}
					{betCartData && betCartData.length > 0 &&
					checkIsLogin() && (
						<BetCartPopup
							Vendor={this.props.Vendor}
							ShowBottomSheet={this.ShowBottomSheet}
						/>
					)}
					{/* 點擊菜單的「更多」出現的下浮窗 */}
					{/* 投注選項 */}
					<Bottomsheet
						ref={this.lineGroupMore}
						headerName="全部盘口"
						hasDefaultButton={true}
						defaultButtonText={'全部' + (Lines ? Lines.length : 0)}
						items={EventDetail ? EventDetail.LineGroups : []}
						selectedItem={selectedLineGroup}
						formatItem={(item) => item.LineGroupName + ' ' + item.LineCount}
						getItemKey={(item) => item.LineGroupId}
						onClickItem={(item) => {
							this.setState({ LineGroupId: item ? item.LineGroupId : null });
						}}
						isLandscape={this.state.isLandscape}
					/>
				</div>
			</FullScreen>
			{/*猜冠軍不能分享*/}
			{ (EventDetail && !EventDetail.isOutRightEvent) ?
			<SbShare
				isShowSharePopup={this.state.showSharePopup}
				hideSharePopup={this.hideSharePopup}
				Vendor={Vendor}
				EventDetail={EventDetail}
			/> : null }
		</>;
	}
}

const mapStateToProps = (state) => ({
	routerLog: state.routerLog,
	betCartInfo: state.betCartInfo,
});

const mapDispatchToProps = {
	betCart_setIsComboBet: ACTION_BetCart_setIsComboBet,
	betCart_add: ACTION_BetCart_add,
	betCart_remove: ACTION_BetCart_remove,
	betCart_clear: ACTION_BetCart_clear,
};

export default withBetterRouter(connect(mapStateToProps, mapDispatchToProps)(BettingDetail));

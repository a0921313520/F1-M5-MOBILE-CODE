/*
	投注页面 导航菜单  所有游戏种类
*/
import Router from 'next/router';
import React from 'react';
import Collapse, { Panel } from 'rc-collapse';
import { ReactSVG } from '$SBTWO/ReactSVG';
//import Swiper from '$SBTWO/Games/Betting/Swiper';
import ReactPullLoad, { STATS } from 'react-pullload';
import Skeleton from '$SBTWO/Skeleton/indexdetail';
import { forceCheck } from 'react-lazyload';
import LazyImageForLeague from '$SBTWO/LazyLoad/LazyImageForLeague';
import LazyImageForTeam from '$SBTWO/LazyLoad/LazyImageForTeam';
import SelectionData from '$SBTWOLIB/vendor/data/SelectionData';
import OutRightEvent from './Events/OutRightEvent';
import NormalEvent from './Events/NormalEvent';
import Toast from '$SBTWO/Toast';
import md5 from 'crypto-js/md5';
import {VendorMarkets} from "$SBTWOLIB/vendor/data/VendorConsts";
import { connect } from 'react-redux';
import { ACTION_BetCart_setIsComboBet, ACTION_BetCart_add, ACTION_BetCart_remove, ACTION_BetCart_clear } from '@/lib/redux/actions/BetCartAction';
import EventData from "$SBTWOLIB/vendor/data/EventData";
import ReactIMG from '$SBTWO/ReactIMG';
import { checkIsLogin, redirectToLogin } from '$SBTWOLIB/js/util';

import dynamic from 'next/dynamic';
import VendorIM from "../../../../lib/sbtwo/vendor/im/VendorIM";

const Bottombetbox = dynamic(
	() => import('$SBTWO/Games/Footer/bottombetbox'),
	{ ssr: false }
)
const BetCartPopup = dynamic(
	() => import('$SBTWO/Games/Betting/BetCartPopup'),
	{ ssr: false }
)

const EventPerPageCount = 20; //分頁展示，默認每頁(每次展示)多少筆
class Betting extends React.PureComponent {
	constructor() {
		super();
		this.state = {
			hasMore: true,
			action: STATS.init,
			init: 10,
			expandAll: true, //是否全部展開
			LeagueToggleStatusArray: null, //保存聯賽展開/收起狀態
			CorrectScoreExpandEventIds : [], //保存全場波膽展開的EventId，因為數據刷新可能造成reset
		};

		this.clickOdds = this.clickOdds.bind(this);
		this.dataIsFullLoaded = false; //數據已經完整取回(可以正確計算 上滑獲取數據 是否已經到底)
	}
	componentDidMount() {
		this.props.BettingRef && this.props.BettingRef(this);
	}

	hasMoreData = () => {
		if (!this.dataIsFullLoaded) return true; //數據沒有完整取回前，都視為還沒取完
		return (this.props.EventDatas) ? this.state.init < this.props.EventDatas.length : false;
	};

	/* 以下 属于方法下拉刷新 上拉加载 */
	handleAction = (action) => {
		const { Vendor, BetType } = this.props;
		if (action === this.state.action) {
			return false;
		}
		if (action === STATS.refreshing) {
			return false;
		} else if (action === STATS.loading) {
			if(Vendor.configs.VL && BetType.MarketId !== VendorMarkets.FAVOURITE) {
				this.handleLoadMoreVL();
			} else {
				this.handLoadMore();
			}
		} else {
			this.setState({
				action: action
			});
		}
	};

	handleLoadMoreVL = async () => {
		if (STATS.loading === this.state.action) {
			return false;
		}

		// 無更多內容則不執行後面邏輯
		if (!this.state.hasMore) {
			return;
		}

		if (this.props.MaxPageCount !== -1 && (this.props.PageNumber >= this.props.MaxPageCount)) {
			this.setState({ hasMore: false });
			return;
		}
		setTimeout(async () => {
			this.props.pagePlus();
			const newState = {
				action: STATS.reset,
				init: this.state.init + EventPerPageCount,
			};
			this.setState(newState);
		}, 1000);
		
		// 用於截取功能
		// 判斷是要fetch取下一頁數據，還是顯示更多截取的數據
		// if (this.state.init >= this.props.EventDatas.length) {
		// 	// 如果當前頁碼已經達到最大頁碼，則將 hasMore 設為 false，表示無更多數據
		// 	if (this.props.MaxPageCount !== -1 && (this.props.PageNumber >= this.props.MaxPageCount)) {
		// 		this.setState({ hasMore: false });
		// 		return;
		// 	}
		// 	setTimeout(async () => {
		// 		this.props.pagePlus();
		// 		const newState = {
		// 			action: STATS.reset,
		// 			init: this.state.init + EventPerPageCount,
		// 		};
		// 		this.setState(newState);
		// 	}, 1000);
		// } else {
		// 	setTimeout(() => {
		// 		if (!this.hasMoreData()) {
		// 			this.setState({
		// 				action: STATS.reset,
		// 				hasMore: false,
		// 			});
		// 		} else {
		// 			const newState = { action: STATS.reset };
		//
		// 			if (!this.hasMoreData()) {
		// 				newState.hasMore = false;
		// 			} else if (this.dataIsFullLoaded || this.state.init < this.props.EventDatas.length) {
		// 				newState.init = this.state.init + EventPerPageCount;
		// 			}
		//
		// 			this.setState(newState);
		// 		}
		// 	}, 500);
		// }
		this.setState({
			action: STATS.loading,
		});
	};
	
	// handLoadMoreVL = () => {
	// 	console.log('handLoadMoreVL')
	// 	if (STATS.loading === this.state.action) {
	// 		return false;
	// 	}
	// 	//无更多内容则不执行后面逻辑
	// 	if (!this.state.hasMore) {
	// 		return;
	// 	}
	// 	setTimeout(async () => {
	// 		this.props.pagePlus();
	// 		let newState = { action: STATS.reset };
	// 		this.setState(newState);
	// 	}, 1000);
	// 	this.setState({
	// 		action: STATS.loading
	// 	});
	// }

	handRefreshing = () => {
		if (STATS.refreshing === this.state.action) {
			return false;
		}
		setTimeout(() => {
			this.setState({
				hasMore: true,
				action: STATS.refreshed
			});
		}, 1000);
		this.setState({
			action: STATS.refreshing
		});
	};

	handLoadMore = () => {
		if (STATS.loading === this.state.action) {
			return false;
		}
		//无更多内容则不执行后面逻辑
		if (!this.state.hasMore) {
			return;
		}
		setTimeout(() => {
			if (!this.hasMoreData()) {
				this.setState({
					action: STATS.reset,
					hasMore: false
				});
			} else {
				let newState = { action: STATS.reset };
				//已全部加載完，或者 當前還有未展示數據，才可以往上加
				if (this.dataIsFullLoaded || (this.state.init < this.props.EventDatas.length)) {
					newState.init = this.state.init + EventPerPageCount
				}
				this.setState(newState);
			}
		}, 1000);
		this.setState({
			action: STATS.loading
		});
	};

	//數據已經完整取回(可以正確計算 上滑獲取數據 是否已經到底)
	setDataIsFullLoaded = (dataIsFullLoaded = true) => {
		this.dataIsFullLoaded = dataIsFullLoaded;
	}

	//數據刷新，需要把hasMore和init復原
	onEventsRefresh = () => {
		const { Vendor, BetType } = this.props;
		if(Vendor.configs.VL && BetType.MarketId !== VendorMarkets.FAVOURITE) {
			this.setState({ hasMore: true });
			return
		}
		this.setState({ hasMore: true, init: EventPerPageCount });
	};

	//獲取目前可視範圍數據量
	getViewScopeDataCount = () => {
		return this.state.init + EventPerPageCount*6; //當前數量+6頁緩衝
	}

	/* 跳转至详情 */
	ToSportsDetails = (Vendor, EventData) => {
		const { SportId, EventId, LeagueId, IsOutRightEvent } = EventData;
		//加速開啟：列表的數據，存到緩存 拿來展示，等拿到詳情數據 再取代掉
		const cacheKey = SportId + '|||' + EventId;
		Vendor._cacheSet(cacheKey, JSON.stringify(EventData), 10);
		Router.push(
			`/sbtwo${Vendor.configs
				.VendorPage}/detail?sid=${SportId}&eid=${EventId}&lid=${LeagueId}&OE=${IsOutRightEvent}`
		);
	};

	ShowBottomSheet = (type) => {
		this.BetCartRef && this.BetCartRef.ShowBottomSheet(type);
	};

	/* 存储单投和串关数据 */
	PushBetCart = (data, type) => {
		const { VendorName } = this.props.Vendor.configs;
		this.props.betCart_add(data,VendorName)
		const isComboBet = this.props.betCartInfo['isComboBet' + VendorName];
		if (!isComboBet) {
			this.BetCartRef && this.BetCartRef.ShowBottomSheet(type);
		}
	}

	/* 删除数据 */
	RemoveBetCart = async (data = null) => {
		const { VendorName } = this.props.Vendor.configs;
		if (data === null) {
			//清空
			await this.props.betCart_clear(VendorName);
			await this.props.betCart_setIsComboBet(false, VendorName);
		} else {
			//刪除單個
			await this.props.betCart_remove(data, VendorName)
		}

		// 如果刪除後購物車為空，自動關閉購物車
		const betCartData = this.props.betCartInfo['betCart' + VendorName];
		if (!betCartData || betCartData.length <= 0) {
			await this.props.betCart_setIsComboBet(false, VendorName);
			this.BetCartRef && this.BetCartRef.CloseBottomSheet();
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

		const { VendorName, MaxParlay } = this.props.Vendor.configs;
		const isComboBet = this.props.betCartInfo['isComboBet' + VendorName];
		const betCartData = this.props.betCartInfo['betCart' + VendorName];

		let overMaxSelectionCount = betCartData.length >= MaxParlay; //是否超過最大限制

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
				Toast.error('哎呀，最多可投注串关' + MaxParlay + '场呦');
			}
		}
	};

	toggleAll = (expandAll) => {
		let newStatus = { expandAll };
		if (expandAll) {
			newStatus['LeagueToggleStatusArray'] = null; //清空=全開
		} else {
			newStatus['LeagueToggleStatusArray'] = []; //空數組=全關
		}
		this.setState(newStatus);
	};

	toggleCorrectScore = (EventId) => {
		this.setState(prevState => {
			if (prevState.CorrectScoreExpandEventIds.indexOf(EventId) !== -1) {
				return { CorrectScoreExpandEventIds :prevState.CorrectScoreExpandEventIds.filter(m => m !== EventId) }
			} else {
				return { CorrectScoreExpandEventIds : [...prevState.CorrectScoreExpandEventIds, EventId] }
			}
		})
	}

	render() {
		const { ToggleFavourite, EventDatas, OddsUpData, OddsDownData, Loading, Vendor, BetType } = this.props;
		const { init, hasMore, expandAll, LeagueToggleStatusArray } = this.state;

		const betCartData = this.props.betCartInfo['betCart' + Vendor.configs.VendorName];
		/* 赛事的列表数据 */
		/* 截取的数据  */
		let CutEventDatas = Vendor.configs.VL ? EventDatas : EventDatas.slice(0, init);
		
		/* 獲取聯賽分組 */
		let leagueList = [];
		let currentLeague = null;
		let currentMarket = null;
		//console.log('=====CutEventDatas',JSON.parse(JSON.stringify(CutEventDatas)))
		CutEventDatas.map((ev, index) => {
			const checkAndCreateSeparator = () => {
				//只有 市場選了[今天] 才需要展示 關注＋滾球＋今天
				if (!BetType || BetType.MarketId !== VendorMarkets.TODAY) {
					return false;
				}

				//處理分界點
				if (currentMarket !== ev.MarketIdForListing
					//分界點只有 關注,滾球 或 今天 才有 (IM早上9點-12點有可能返回早盤(market=1)比賽，用這個邏輯避免出現多餘的分界點)
					&& [VendorMarkets.FAVOURITE,VendorMarkets.RUNNING,VendorMarkets.TODAY].indexOf(ev.MarketIdForListing) !== -1
				) {
					let header = 'separatorToday';
					if (ev.MarketIdForListing === VendorMarkets.FAVOURITE) {
						header = 'separatorFav';
					} else if (ev.MarketIdForListing === VendorMarkets.RUNNING) {
						header = 'separatorRun';
					}
					leagueList.push({
						LeagueId: header, //聯賽id
						LeagueName: header, //聯賽名
						LeagueKey: header,
						EventIds: [] //該聯賽分組下的賽事
					});
				}
			}

			if (index === 0) { //開頭第一個分隔線要先放
				checkAndCreateSeparator();
			}

			let createNewLeague = false;
			//逐筆往下查看賽事的聯賽變化
			if (currentLeague) {
				if (ev.LeagueId === currentLeague.LeagueId && ev.MarketIdForListing === currentMarket) {
					//聯賽相同，放一起
					currentLeague.EventIds.push(ev.EventId);
				} else {
					//不相同，保留現在的聯賽分組
					leagueList.push(currentLeague);
					//產生一個新的聯賽分組
					createNewLeague = true;
				}
			} else {
				//第一個執行 還沒有currentLeague，
				//產生一個新的聯賽分組
				createNewLeague = true;
			}
			if (createNewLeague) {
				currentLeague = {
					LeagueId: ev.LeagueId, //聯賽id
					LeagueName: ev.LeagueName, //聯賽名
					MarketId: ev.MarketIdForListing, //市場，主要用來區分關注賽事
					EventIds: [] //該聯賽分組下的賽事
				};
				currentLeague.EventIds.push(ev.EventId);
				currentLeague.LeagueKey = ev.LeagueId + '_' + ev.EventId + '_' + ev.MarketIdForListing; //因為時間排序 可能會有同一個聯賽 出現多次的情況，所以用  聯賽id + 第一個賽事id + 市場id 作為key
			}

			if (index !== 0) { //兩個不同市場的分隔線 要在數據建立好之後才加入
				checkAndCreateSeparator();
			}

			currentMarket = ev.MarketIdForListing;
			//最後一筆 保留現在的聯賽分組
			if (index === CutEventDatas.length - 1) {
				leagueList.push(currentLeague);
			}
		});

		//console.log('=====leagueList',JSON.parse(JSON.stringify(leagueList)));

		//處理聯賽展開收起
		let closedLeagueKeyArray = []; //收起的聯賽key
		if (LeagueToggleStatusArray && LeagueToggleStatusArray.length > 0) {
			LeagueToggleStatusArray.map((info) => {
				if (!info.isOpen) {
					closedLeagueKeyArray.push(info.key);
				}
			});
		}

		//console.log('===closedLeagueKeyArray',closedLeagueKeyArray);

		const allLeagueKeyArray = []; //全部的聯賽Key
		let openLeagueKeyArray = []; //展開的聯賽key
		leagueList.map((l) => {
			const thisKey = l.LeagueKey;
			allLeagueKeyArray.push(thisKey);
			if (closedLeagueKeyArray.indexOf(thisKey) === -1) {
				openLeagueKeyArray.push(thisKey); //默認展開
			}
		});

		//console.log('===openLeagueKeyArray',openLeagueKeyArray);

		//配置在key={} 用來觸發刷新
		const allLeagueKeyArrayJSON = md5(JSON.stringify(allLeagueKeyArray));

		/* console.log('%c赛事列表的数据', 'font-size:36px;color:red;', EventDatas); */
		//console.log(leagueList)
		// console.log('CutEventDatas ',CutEventDatas)
		return (
			<div className="Betting-list" id="Betting-list">
				{Loading ? (
					<Skeleton />
				) : EventDatas == '' ? BetType.MarketId == 4 ? (
					<div className="EmptyBox">
						<ReactSVG className="ShouCangicon" src="/img/svg/betting/shoucang.svg" />
						<br />
						<span className="gray">暂无关注赛事，马上关注赛事吧</span>
					</div>
				) : (
					<div className="EmptyBox">
						<ReactSVG className="logo" src="/img/svg/Fun88Logo.svg" />
						<br />
						哎呀！暂无相关赛事，换个游戏试试吧！
					</div>
				) : (
					<ReactPullLoad
						downEnough={150}
						action={this.state.action}
						handleAction={this.handleAction}
						hasMore={hasMore}
						style={{ paddingTop: 0 }}
						distanceBottom={1000}
					>
						<Collapse
							defaultActiveKey={expandAll ? openLeagueKeyArray : []}
							accordion={false}
							onChange={(keyArray) => {
								setTimeout(forceCheck, 100); //lazyload強制觸發 避免聯賽收起時  有跑版問題
								//console.log('===onChange',keyArray);

								let newState = {};
								//檢查是否全開或全收合了
								if (!keyArray || keyArray.length <= 0) {
									//全收合
									//切換nav上面的按鈕
									this.props.onAllLeaguesToggled(false);
									//狀態也要跟著變
									newState['expandAll'] = false;
								} else if (
									keyArray &&
									Array.isArray(keyArray) &&
									keyArray.length > 0 &&
									leagueList.length === keyArray.length
								) {
									//全展開
									//數據量一樣
									//排序後用JSON.stringify比較
									const sortedLeagueKeys = leagueList.map((l) => l.LeagueKey).sort();
									const sortedSelectedKeyArray = keyArray.map((l) => l).sort();
									if (JSON.stringify(sortedLeagueKeys) === JSON.stringify(sortedSelectedKeyArray)) {
										//全展開
										//切換nav上面的按鈕
										this.props.onAllLeaguesToggled(true);
										//狀態也要跟著變
										newState['expandAll'] = true;
									}
								}

								const LeagueToggleStatusArray = allLeagueKeyArray.map((thisKey) => {
									if (keyArray.indexOf(thisKey) !== -1) {
										return { key: thisKey, isOpen: true };
									} else {
										return { key: thisKey, isOpen: false };
									}
								});
								newState['LeagueToggleStatusArray'] = LeagueToggleStatusArray; //保存展開/收起狀態

								this.setState(newState);
							}}
							key={expandAll + '_' + allLeagueKeyArrayJSON}
						>
							{leagueList.map((leagueData) => {
								if (leagueData.LeagueId === 'separatorFav') {
									return <div key={leagueData.LeagueKey} className="Game-list-separator">
										<span className="img-warpper">
											<ReactIMG className="fav" src='/img/betting/listing_fav.png'/>
										</span>
										<span>关注赛事</span>
									</div>
								}
								if (leagueData.LeagueId === 'separatorRun') {
									return <div key={leagueData.LeagueKey} className="Game-list-separator">
										<span className="img-warpper">
											<ReactIMG className="running" src='/img/betting/listing_running.png'/>
										</span>
										<span>滚球</span>
									</div>
								}
								if (leagueData.LeagueId === 'separatorToday') {
									return <div key={leagueData.LeagueKey} className="Game-list-separator">
										<span className="img-warpper">
											<ReactIMG className="today" src='/img/betting/listing_today.png'/>
										</span>
										<span>即将进行的赛事</span>
									</div>
								}
								return (
									<Panel
										key={leagueData.LeagueKey}
										header={
											<div className="Game-title-icon">
												<LazyImageForLeague Vendor={Vendor} LeagueId={leagueData.LeagueId} />
												{leagueData.LeagueName}
											</div>
										}
										headerClass="my-header-class"
									>
										{CutEventDatas.filter(
											(data) =>
												data.LeagueId == leagueData.LeagueId &&
												data.MarketIdForListing == leagueData.MarketId && //加上關注賽事 就有可能出現重複比賽，加入查詢條件
												leagueData.EventIds.indexOf(data.EventId) !== -1
										).map((CutEventitem, CutEventkey) => {
											return CutEventitem.IsOutRightEvent ? (
												/* 猜冠军赛事 */
												<OutRightEvent
													key={CutEventitem.EventId + '_' + CutEventitem.MarketIdForListing}
													Vendor={Vendor}
													EventData={CutEventitem}
													ToggleFavourite={ToggleFavourite}
													ToSportsDetails={this.ToSportsDetails}
													ClickOdds={this.clickOdds}
												/>
											) : (
												/* 常规赛事 */
												<NormalEvent
													key={CutEventitem.EventId + '_' + CutEventitem.MarketIdForListing}
													Vendor={Vendor}
													EventData={CutEventitem}
													ToggleFavourite={ToggleFavourite}
													ToSportsDetails={this.ToSportsDetails}
													OddsUpData={OddsUpData}
													OddsDownData={OddsDownData}
													ClickOdds={this.clickOdds}
													ShowCorrectScore={this.props.ShowCorrectScore}
													CorrectScoreExpandEventIds={this.state.CorrectScoreExpandEventIds}
													ToggleCorrectScore={this.toggleCorrectScore}
												/>
											);
										})}
									</Panel>
								);
							})}
						</Collapse>
					</ReactPullLoad>
				)}
				{checkIsLogin() ? <>
					{/* 投注板块 */}
					<Bottombetbox
						BetCartRef={(ref) => { this.BetCartRef = ref }}
						Vendor={this.props.Vendor}
						RemoveBetCart={this.RemoveBetCart}
					/>
					{/* 购物车浮窗 */}
					{betCartData && betCartData.length > 0 ?
					<BetCartPopup
						Vendor={this.props.Vendor}
						ShowBottomSheet={this.ShowBottomSheet}
					/> : null }
				</> : null}
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	betCartInfo: state.betCartInfo,
});

const mapDispatchToProps = {
	betCart_setIsComboBet: ACTION_BetCart_setIsComboBet,
	betCart_add: ACTION_BetCart_add,
	betCart_remove: ACTION_BetCart_remove,
	betCart_clear: ACTION_BetCart_clear,
};

export default connect(mapStateToProps, mapDispatchToProps)(Betting);

/* 预防 大数据*/
export function GameDataCut(data, callback, pageSize = 10) {
	let totalCount = data.length;
	let GamePageNumber = 1;
	let totalPageNumer = Math.ceil(totalCount / pageSize);

	let handler = () => {
		let start = (GamePageNumber - 1) * pageSize;
		let end = GamePageNumber * pageSize;
		let currentData = data.slice(start, end);
		if (typeof callback === 'function') {
			callback(currentData, {
				totalCount,
				totalPageNumer,
				GamePageNumber,
				pageSize
			});
		}
		if (GamePageNumber < totalPageNumer) {
			window.requestAnimationFrame(handler);
		}
		GamePageNumber++;
	};
	handler();
}

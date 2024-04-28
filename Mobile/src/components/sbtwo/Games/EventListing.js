import Router from 'next/router';
import Layout from '$SBTWO/Layout';
//import Header from '$SBTWO/Games/Header/';
import Nav from '$SBTWO/Games/Header/nav';
import Betting from '$SBTWO/Games/Betting';
import BackToTop from '$SBTWO/BackToTop';
import { EventChangeType, SortWays, SpecialUpdateType, VendorMarkets } from '$SBTWOLIB/vendor/data/VendorConsts';
import Skeleton from '$SBTWO/Skeleton/';
import reactUpdate from 'immutability-helper';
import moment from 'moment';
import { withBetterRouter } from '$SBTWOLIB/js/withBetterRouter';
import React from 'react';
import HostConfig from '@/server/Host.config';
import EventData from '$SBTWOLIB/vendor/data/EventData';
import ReactIMG from '$SBTWO/ReactIMG';
import initSportCache from '$SBTWOLIB/js/initSportCache';
import { checkIsLogin } from '$SBTWOLIB/js/util';
import { ApiPort } from '$SBTWOLIB/SPORTAPI';
import { fetchRequest } from '$SBTWOLIB/SportRequest';
import { SuspendBtn } from '../SuspendBtn/';

import dynamic from 'next/dynamic';
import VendorIM from "../../../lib/sbtwo/vendor/im/VendorIM";
import EventChangeData from "../../../lib/sbtwo/vendor/data/EventChangeData";

const MiniEvent = dynamic(() => import('$SBTWO/Games/Betting/MiniEvent'), { ssr: false });

class EventListing extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			SportDatas: [],
			EventDatas: [],
			OddsUpData: { Events: {}, Lines: {}, Selections: {} } /* 上升赔率 */,
			OddsDownData: { Events: {}, Lines: {}, Selections: {} } /* 下降赔率 */,
			Loading: false,
			firstloade: true,
			//從詳情頁過來的 縮小的比分框
			showMiniEvent: false,
			miniEventId: null,
			miniSportId: 1,
			miniLeagueId: null,
			miniShowType: 0,
			BetType: '',
			miniGames: null,
			showCorrectScore: false, //展示全場波膽
			PageNumber: 1,
			MaxPageCount: -1,
			TotalCount: -1
		};

		//用來標記是否需要用緩存服務器數據
		this.SportDatasHasSet = false;
		this.EventDatasHasSet = false;
		this.SportDatasUseCache = false;
		this.EventDatasUseCache = false;

		//用來標記延遲執行的getEvents還要不要跑
		this.GetEventsCalled = false;

		this.initDelayTimer = null; //初始延遲加載的timer
		this.initDelayTimer2 = null; //初始延遲加載的timer2
		this.isDidUnmount = null; //紀錄是否已unmount，判斷異步動作是否還要執行
	}

	//默認查詢
	getDefaultQueryParams() {
		const theDayAfterTenDays = moment().add(10, 'days').format('YYYY-MM-DD');
		const theDaytoday = moment().format('YYYY-MM-DD');
		const type = {
			SportId: 1 /* 体育类型 不分Vendor 1 都是默認足球 */,
			MarketId: VendorMarkets.RUNNING /* 市场类型 */, //默認選 滾球
			SortWay: SortWays.LeagueName /* 排序 */, //默認聯賽排序
			StartDate: theDaytoday /* 开始时间 */,
			EndDate: theDayAfterTenDays /* 结束时间 */
		};
		this.setState({
			BetType: type
		});
		return type;
	}

	async componentDidMount() {
		this.isDidUnmount = false;
		const { query, pathname } = this.props.router; //從鏈接獲取要加載的參數
		const { Vendor } = this.props;

		if (!query || JSON.stringify(query) === JSON.stringify({})) {
			//沒參數 才使用API緩存
			console.log(pathname, '=======PLAN TO USE API CACHE=======');

			//獲取初始緩存
			initSportCache(pathname);

			const thisSportName = Vendor.configs.VendorName.toLowerCase();

			const handleInitialCache = (cacheData) => {
				if (cacheData && global.initialCache[thisSportName].isUsed === false) {
					let newState = {};
					if (!this.SportDatasHasSet) {
						//確定沒數據才用
						console.log(pathname, '=======USE API CACHE for COUNT=======');
						if (this.state.firstloade === true) {
							//避免整頁刷新
							newState.firstloade = false;
						}
						newState.SportDatas = cacheData.count;
						this.SportDatasUseCache = true;
						Vendor.storeInitialCacheToPollingCache(cacheData, 'count'); //API緩存也加入polling數據緩存機制
					}
					if (!this.EventDatasHasSet) {
						//確定沒數據才用
						console.log(pathname, '=======USE API CACHE for EVENTS=======');
						if (this.state.firstloade === true) {
							//避免整頁刷新
							newState.firstloade = false;
						}
						if (this.state.Loading === true) {
							newState.Loading = false;
						}
						newState.EventDatas = cacheData.list;
						this.EventDatasUseCache = Vendor.configs.VL ? false : true;
						Vendor.storeInitialCacheToPollingCache(cacheData, 'event'); //API緩存也加入polling數據緩存機制
					}
					if (JSON.stringify(newState) !== '{}') {
						this.setState(newState);
					}
					global.initialCache[thisSportName].isUsed = true; //標記為已使用
				} else {
					console.log(pathname, '=======ABORT USE API CACHE=======');
				}
			};

			if (!checkIsLogin()) {
				//優化Performance:未登入，優先等待並使用 initialCache
				let cacheData = await global.initialCache[thisSportName].cachePromise;
				handleInitialCache(cacheData);
			} else {
				//已登入則按原方式 initialCache 和 正常獲取 競速，先拿到的先用
				global.initialCache[thisSportName].cachePromise.then(handleInitialCache);
			}
		} else {
			console.log(pathname, '=======NO API CACHE=======');
		}

		//優化Performance: 未登入+使用緩存 延遲10秒才開始獲取數據
		let initDelay = 0;
		if (!checkIsLogin() && this.SportDatasUseCache) {
			initDelay = Vendor.configs.VL ? 0 : 10 * 1000;
		}
		console.log(pathname, '=====Performance:Sports+Events:initDelay', initDelay);

		this.initDelayTimer = setTimeout(() => {
			if (this.isDidUnmount) return;
			console.log(pathname, '=====Performance:Sports:called', initDelay);

			//輪詢 體育計數
			this.sportsPollingKey = Vendor.getSportsPollingGlobal('eventListing', (PollingResult) => {
				if (this.isDidUnmount) return;
				//console.log('===update Sports', PollingResult);

				this.SportDatasHasSet = true;

				if (this.SportDatasUseCache) {
					this.SportDatasUseCache = false; //跳過第一次更新
					return;
				}
				console.log('菜单------------------>', PollingResult.NewData);
				let newState = { SportDatas: PollingResult.NewData };

				if (this.state.firstloade === true) {
					//避免整頁刷新
					newState.firstloade = false;
				}
				this.setState(newState);
			});
		}, initDelay);

		//強制更新 體育計數 for 關注比賽移除 使用
		const updateSportsCount = (thisVendorName) => {
			if (Vendor.configs.VendorName === thisVendorName) {
				//同vendor才適用
				let getSportsFunc = Vendor.configs.VL ? Vendor.getSportsNew() : Vendor.getSports();
				getSportsFunc.then((PollingResult) => {
					//console.log('===eventListing_updateSportsCount');
					this.setState({ SportDatas: PollingResult.NewData });
				});
			}
		};
		if (typeof window !== 'undefined') {
			//綁定到window上 全局可用
			window.eventListing_updateSportsCount = updateSportsCount.bind(this);
		}

		//沒有查詢參數，就傳默認的
		const defaultQuery = this.getDefaultQueryParams();
		if (JSON.stringify(query) === '{}' || !query || (!query.SportId && !query.miniSportId)) {
			//console.log('===DidMount load default',JSON.parse(JSON.stringify(query)))
			this.initDelayTimer2 = setTimeout(() => {
				if (this.isDidUnmount) return;
				if (initDelay > 0 && this.GetEventsCalled) {
					console.log(pathname, '=====Performance:Events:bypass', initDelay);
					return; //有延遲執行的話，需要檢查 如果用戶已經有操作切換(call GetEvents()) 就不用再跑這裡，不然用戶先前的操作會被蓋掉
				}
				this.GetEvents(defaultQuery, false, false, true); //默認參數不用更新網址鏈接
			}, initDelay); //和上面一樣延遲執行
		} else {
			//有傳入參數
			const thisQuery = Object.assign({}, defaultQuery, query);
			//處理一下數據格式，要用int型態
			if (thisQuery.SportId) {
				thisQuery.SportId = parseInt(thisQuery.SportId);
			}
			if (thisQuery.MarketId) {
				thisQuery.MarketId = parseInt(thisQuery.MarketId);
			}
			if (thisQuery.SortWay) {
				thisQuery.SortWay = parseInt(thisQuery.SortWay);
			}
			if (thisQuery.StartDate) {
				thisQuery.StartDate = thisQuery.StartDate;
			}
			if (thisQuery.EndDate) {
				thisQuery.EndDate = thisQuery.EndDate;
			}

			//console.log('===DidMount load from query',JSON.parse(JSON.stringify(query)))
			this.GetEvents(thisQuery, true, false, true);

			if (thisQuery.miniEventId) {
				this.setState({
					showMiniEvent: true,
					miniEventId: thisQuery.miniEventId,
					miniSportId: thisQuery.miniSportId,
					miniLeagueId: thisQuery.miniLeagueId,
					miniShowType: thisQuery.miniShowType
				});
			}
		}

		this.getMiniGameInfo();
	}

	componentWillUnmount() {
		this.isDidUnmount = true;
		const { Vendor } = this.props;
		Vendor.deletePolling(this.sportsPollingKey);
		Vendor.deletePolling(this.eventPollingKey);

		//強制更新 體育計數 for 關注比賽移除 使用
		if (typeof window !== 'undefined') {
			window.eventListing_updateSportsCount = null;
		}
		clearTimeout(this.initDelayTimer);
		clearTimeout(this.initDelayTimer2);
	}

	/* 获取游戏列表数据 */
	// pagePull 下滑更新頁面
	// reset 重置pageNumber
	GetEvents = (type, updateUrl = true, pagePullA = false, reset = false) => {
		console.log('===GetEvents', JSON.stringify(type), updateUrl, pagePullA);
		let pagePull = pagePullA;
		const { Vendor } = this.props;
		// const reset = 
		if (updateUrl === true) {
			this.GetEventsCalled = true;
			this.EventDatasUseCache = false; //已經切換了tab 就不能用緩存了
		}
		if (this.BettingRef) {
			this.BettingRef.setDataIsFullLoaded(false); //更換查詢項目 重設為 未加載完畢
		}
		//輪詢 比賽數據
		let newState = {
			Loading: pagePull ? false : !this.EventDatasUseCache, //緩存就不用loading 直接現地切換
			BetType: type,
		}
		
		// 重置 清空Cache，頁數從1開始
		if(reset){
			console.log('重置')
			Vendor._NewDataCache = {}
			newState.PageNumber = 1;
		}
		this.setState(newState);
		let that = this;
		this.eventPollingKey = Vendor.getEventsPollingGlobal(
			'eventListing',
			async (PollingResult) => {
				if (this.isDidUnmount) return;
				// console.log('===update Events', JSON.parse(JSON.stringify(PollingResult)));

				console.log(
					'===getEventsPollingGlobal: IsFullLoaded:',
					PollingResult.IsFullLoaded,
					',Count:',
					PollingResult.NewData ? PollingResult.NewData.length : 0,
					',QUERY:',
					JSON.stringify(type)
				);
				this.EventDatasHasSet = true;

				if (this.EventDatasUseCache) {
					this.EventDatasUseCache = false;

					//如果沒有關注比賽，才跳過第一次更新(API緩存 拿不到關注比賽，所以第一次更新不能跳過，不然會出現的很慢)
					const favEvents = await Vendor.getFavouriteEvents();
					const currentFavEventsForThisSport = favEvents.filter((item) => item.SportId === type.SportId);
					if (!currentFavEventsForThisSport || currentFavEventsForThisSport.length <= 0) {
						//console.log('===update Events EventDatasUseCache');
						return;
					}
				}

				//處理 數據變化
				let OddsUpData = { Events: {}, Lines: {}, Selections: {} };
				let OddsDownData = { Events: {}, Lines: {}, Selections: {} };
				// console.log('PollingResult.Changes ',PollingResult.Changes)
				PollingResult.Changes.map((changeData) => {
					//類型：更新
					if (changeData.ChangeType === EventChangeType.Update) {
						changeData.SpecialUpdates.map((sUpdateData) => {
							const thisEventId = changeData.EventId; //比賽ID
							// 處理賠率上升動畫
							if (sUpdateData.UpdateType === SpecialUpdateType.OddsUp) {
								const thisLineId = sUpdateData.LineId; //投注線ID
								const thisSelectionId = sUpdateData.SelectionId; //投注選項ID
								const lineKey = thisEventId + '|||' + thisLineId;
								const selectionKey = thisEventId + '|||' + thisLineId + '|||' + thisSelectionId;
								OddsUpData.Events[thisEventId] = true;
								OddsUpData.Lines[lineKey] = true;
								OddsUpData.Selections[selectionKey] = true;
							}
							// 處理賠率下降動畫
							if (sUpdateData.UpdateType === SpecialUpdateType.OddsDown) {
								const thisLineId = sUpdateData.LineId; //投注線ID
								const thisSelectionId = sUpdateData.SelectionId; //投注選項ID
								const lineKey = thisEventId + '|||' + thisLineId;
								const selectionKey = thisEventId + '|||' + thisLineId + '|||' + thisSelectionId;
								OddsDownData.Events[thisEventId] = true;
								OddsDownData.Lines[lineKey] = true;
								OddsDownData.Selections[selectionKey] = true;
							}
						});
					}
				});
				
				//整理一次setState 避免多次刷新
				let extraConfigs = PollingResult.extraConfigs;
				let newState = {
					Loading: false,
					// EventDatas: PollingResult.NewData,
					OddsUpData,
					OddsDownData,
					MaxPageCount: extraConfigs?.MaxPageCount,
					PageNumber: extraConfigs?.PageNumber,
					TotalCount: extraConfigs?.TotalCount,
				};
				newState.EventDatas = PollingResult.NewData;
				
				if (this.state.firstloade === true) {
					//避免整頁刷新
					newState.firstloade = false;
				}

				this.setState(newState, () => {
					if (this.BettingRef && PollingResult.IsFullLoaded) {
						this.BettingRef.setDataIsFullLoaded(true); //通知已加載完畢
					}
				});
			},
			type.SportId,
			type.MarketId,
			type.SortWay,
			type.StartDate,
			type.EndDate,
			{
				getViewScope: () => {
					//IM專用 早盤-全場波膽 只獲取需要展示的部分
					if (that.BettingRef && that.BettingRef.getViewScopeDataCount) {
						return { startIndex: 0, endIndex: that.BettingRef.getViewScopeDataCount() - 1 };
					}
					return { startIndex: 0, endIndex: 50 };
				},
				// this.state.PageNumber 的值都會在每次下拉加載時得到更新(啟動新的輪詢)
				// 輪詢期間，值不會改變
				// pagePull在首次下拉加載前，會是false
				page: pagePull ? this.state.PageNumber + 1 : 1,
				countsPerPage: 50,
			}
		); // <==查詢參數
		//更新網址鏈接
		if (updateUrl === true) {
			//最一開始沒帶參數的時候，不用更新網址鏈接
			const { pathname, query } = this.props.router;
			const params = new URLSearchParams(type);

			//console.log('===push from GETEvents')

			//用replace，避免用戶可以點擊back返回
			Router.replace(pathname + '?' + params.toString(), undefined, { shallow: true });
		}

		//通知數據更新
		if (this.BettingRef) {
			this.BettingRef.onEventsRefresh();
		}
	};

	//切換關注比賽
	toggleFavourite = async (event) => {
		const { Vendor } = this.props;
		if (!event.IsFavourite) {
			await Vendor.addFavouriteEvent(event);
		} else {
			await Vendor.removeFavouriteEvent(event.EventId);
		}
		//更新count
		const funcName = Vendor.configs.VL? Vendor.getSportsNew():Vendor.getSports()
		const newCount = funcName.then((PollingResult) => {
			this.setState({ SportDatas: PollingResult.NewData });
		});

		//更新賽事列表
		//切換 星號 展示
		let targetIndexes = []; //因為增加展示 關注比賽，相同EventId會出現兩個
		this.state.EventDatas.map((item, index) => {
			if (item.EventId === event.EventId) {
				targetIndexes.push(index);
			}
		});
		if (targetIndexes.length > 0) {
			let updates = {};
			targetIndexes.map((targetIndex) => {
				updates[targetIndex] = { IsFavourite: { $set: !event.IsFavourite } };
			});
			this.setState({ EventDatas: reactUpdate(this.state.EventDatas, updates) }, () => {
				//星號切換完 才處理數據
				if (this.state.BetType && this.state.BetType.MarketId === VendorMarkets.TODAY) {
					if (!event.IsFavourite) {
						//加入關注比賽
						const cloneEvents = this.state.EventDatas
							.filter((ev) => ev.EventId == event.EventId)
							.map((ev) => EventData.clone(ev));
						if (cloneEvents.length > 0) {
							let cloneEvent = cloneEvents[0];
							cloneEvent.MarketIdForListing = VendorMarkets.FAVOURITE; //手動設定
							//找出全部關注比賽
							let favEvents = [ cloneEvent ]; //新的這個也加進去
							for (let i = 0; i < this.state.EventDatas.length; i++) {
								const thisEv = this.state.EventDatas[i];
								if (thisEv.MarketIdForListing !== VendorMarkets.FAVOURITE) {
									break;
								} else {
									favEvents.push(thisEv);
								}
							}
							//重新排序
							EventData.sortEvents(favEvents, this.state.BetType.SortWay);
							//重新插入關注比賽
							this.setState({
								EventDatas: reactUpdate(this.state.EventDatas, {
									$splice: [ [ 0, favEvents.length - 1, ...favEvents ] ]
								})
							});
						}
					} else {
						//刪除關注比賽
						const targetIndex = this.state.EventDatas.findIndex((ev) => ev.EventId == event.EventId);
						if (targetIndex > -1) {
							this.setState({
								EventDatas: reactUpdate(this.state.EventDatas, { $splice: [ [ targetIndex, 1 ] ] })
							});
						}
					}
				}
			});
		}
	};

	//获取游戏活动
	getMiniGameInfo = () => {
		//每次有新活動 改這些設定
		// const currentEventName = 'LaborDay2023'; //活動名稱(對應api返回的)
		// const currentEventPageUrl = process.env.ROOT_PATH + '/event_LaborDay2023' + '?from=sb20'; //活動頁router路徑，導向主站，帶上來源
		// const currentEventClickPiwikName = 'Enter_' + currentEventName; //點擊事件piwik名字
		// fetchRequest(ApiPort.MiniGames, 'get')
		// 	.then((data) => {
		// 		if (data && data.result) {
		// 			let game = data.result.find((item) => item.name == currentEventName);
		// 			if (game) {
		// 				//把活動配置保存在miniGames
		// 				game.eventPageUrl = currentEventPageUrl;
		// 				game.eventClickPiwikName = currentEventClickPiwikName;
		// 				this.setState({
		// 					miniGames: game
		// 				});
		// 				localStorage.setItem('miniGames', JSON.stringify(game));
		// 			} else {
		// 				this.setState({
		// 					miniGames: null
		// 				});
		// 				localStorage.removeItem('miniGames');
		// 			}
		// 		}
		// 	})
		// 	.catch((err) => {
		// 		console.log(err);
		// 	});

		// 首页活动图片
		// 測試環境 方便測試
		if (!HostConfig.Config.isLIVE) {
			this.setState({
				miniGames: true
			});
			return;
		}

		const today = moment().utcOffset(8).unix();
		const from = moment(new Date('2023/4/26 00:00:00')).utcOffset(8).unix();
		const to = moment(new Date('2023/5/3 23:59:59')).utcOffset(8).unix();

		if (today >= from && today <= to) {
			// 在活動期間
			this.setState({
				miniGames: true
			});
		} else {
			this.setState({
				miniGames: false
			});
		}
	};

	toggleShowCorrectScore = (showCorrectScore) => {
		this.setState({ showCorrectScore });
	};

	pagePlus = async () => {
		const { query, pathname } = this.props.router; //從鏈接獲取要加載的參數
		//沒有查詢參數，就傳默認的
		const defaultQuery = this.getDefaultQueryParams();
		//有傳入參數
		const thisQuery = Object.assign({}, defaultQuery, query);
		//處理一下數據格式，要用int型態
		if (thisQuery.SportId) {
			thisQuery.SportId = parseInt(thisQuery.SportId);
		}
		if (thisQuery.MarketId) {
			thisQuery.MarketId = parseInt(thisQuery.MarketId);
		}
		if (thisQuery.SortWay) {
			thisQuery.SortWay = parseInt(thisQuery.SortWay);
		}
		if (thisQuery.StartDate) {
			thisQuery.StartDate = thisQuery.StartDate;
		}
		if (thisQuery.EndDate) {
			thisQuery.EndDate = thisQuery.EndDate;
		}

		console.log('===page load',JSON.parse(JSON.stringify(query)))
		return this.GetEvents(thisQuery, false, true);
	}
	
	getQuery = async () => {
		this.isDidUnmount = false;
		const { query, pathname } = this.props.router; //從鏈接獲取要加載的參數
		let initDelay = 0;
		let result = {}
		//沒有查詢參數，就傳默認的
		const defaultQuery = this.getDefaultQueryParams();
		if (JSON.stringify(query) === '{}' || !query || (!query.SportId && !query.miniSportId)) {
			this.initDelayTimer2 = setTimeout(() => {
				if (this.isDidUnmount) return Promise.resolve();
				if (initDelay > 0 && this.GetEventsCalled) {
					console.log(pathname, '=====Performance:Events:bypass', initDelay);
					return Promise.resolve(); //有延遲執行的話，需要檢查 如果用戶已經有操作切換(call GetEvents()) 就不用再跑這裡，不然用戶先前的操作會被蓋掉
				}
				console.log(pathname, '=====Performance:Events:called', initDelay);
				return Promise.resolve(defaultQuery)
			}, initDelay)
		} else {
			//有傳入參數
			const thisQuery = Object.assign({}, defaultQuery, query);
			//處理一下數據格式，要用int型態
			if (thisQuery.SportId) {
				thisQuery.SportId = parseInt(thisQuery.SportId);
			}
			if (thisQuery.MarketId) {
				thisQuery.MarketId = parseInt(thisQuery.MarketId);
			}
			if (thisQuery.SortWay) {
				thisQuery.SortWay = parseInt(thisQuery.SortWay);
			}
			if (thisQuery.StartDate) {
				thisQuery.StartDate = thisQuery.StartDate;
			}
			if (thisQuery.EndDate) {
				thisQuery.EndDate = thisQuery.EndDate;
			}
			result = thisQuery;
		}
		return Promise.resolve(defaultQuery);
	}
	render() {
		const {
			SportDatas,
			EventDatas,
			OddsUpData,
			OddsDownData,
			Loading,
			firstloade,
			BetType,
			showCorrectScore,
			PageNumber,
			MaxPageCount,
			TotalCount
		} = this.state;
		const { Vendor } = this.props;
		// console.log('this.state.EventDatas ',this.state.EventDatas)
		return (
			<Layout status={2}>
				{firstloade ? (
					<Skeleton showheader={true} />
				) : (
					<div>
						{this.state.showMiniEvent ? (
							<MiniEvent
								Vendor={Vendor}
								EventId={this.state.miniEventId}
								SportId={this.state.miniSportId}
								LeagueId={this.state.miniLeagueId}
								ShowType={this.state.miniShowType}
								CloseMini={() => {
									this.setState({
										showMiniEvent: false,
										miniEventId: null,
										miniSportId: 1,
										miniLeagueId: null,
										miniShowType: 0
									});

									//更新網址鏈接
									const { pathname, query } = this.props.router;
									let cloneQuery = Object.assign({}, query);
									//刪除mini配置
									delete cloneQuery['miniEventId'];
									delete cloneQuery['miniSportId'];
									delete cloneQuery['miniLeagueId'];
									delete cloneQuery['miniShowType'];
									const params = new URLSearchParams(cloneQuery);
									//用replace，避免用戶可以點擊back返回
									Router.replace(pathname + '?' + params.toString(), undefined, { shallow: true });
								}}
							/>
						) : null}
						<div className="Games-content">
							{/* 版本迭代 删除主页banner 优化性能 */}
							{/* <Header
								Vendor={Vendor}
								HeaderRef={(ref) => { this.HeaderRef = ref; } }
							/> */}
							{//歐洲杯頭部
							HostConfig.Config.isEUROCUP2021 ? (
								<ReactIMG
									className="EUROCUP-banner"
									src="/img/20210603/BGHomeHeader.jpg"
									onClick={() => {
										// Pushgtagdata(`Engagement Event`, 'Launch', 'Enter_EUROPage');
										window.location.href = '/ec2021';
									}}
								/>
							) : null}

							<Nav
								NavRef={(ref) => {
									this.NavRef = ref;
								}}
								MenuChange={(ID) => {
									//菜單 體育項目變化=>刷新banner數據
									if (this.HeaderRef) {
										this.HeaderRef.getBannerData(ID);
									}
								}}
								onToggleButtonClicked={(expandAll) => {
									//菜單 點擊全展開/全收起按鈕=>賽事列表展開/收起
									if (this.BettingRef) {
										this.BettingRef.toggleAll(expandAll);
									}
								}}
								Vendor={Vendor}
								SportDatas={SportDatas}
								GetEvents={(a, b, c ,d) => {
									this.GetEvents(a, b, c, d);
								}}
								Loading={Loading}
								ShowCorrectScore={showCorrectScore}
								ToggleShowCorrectScore={this.toggleShowCorrectScore}
							/>

							<Betting
								BettingRef={(ref) => {
									this.BettingRef = ref;
								}}
								onAllLeaguesToggled={(isExpandAll) => {
									//賽事列表 全展開 或 全收起=> 菜單的 全展開/全收起按鈕 要一起變化
									if (this.NavRef) {
										this.NavRef.changeToggleButtonStatus(isExpandAll);
									}
								}}
								Vendor={Vendor}
								ToggleFavourite={this.toggleFavourite}
								OddsUpData={OddsUpData} /* 上升赔率 */
								OddsDownData={OddsDownData} /* 下降赔率 */
								SportDatas={SportDatas} /* 游戏类型 和游戏数据计数 */
								EventDatas={EventDatas} /* 当前进行的所有赛事 */
								GetEvents={(e) => {
									this.GetEvents(e);
								}}
								Loading={Loading}
								BetType={BetType}
								ShowCorrectScore={
									[ 1, 2022 ].indexOf(parseInt(BetType.SportId)) !== -1 && showCorrectScore
								} /* 足球和世界杯才有全場波膽，其他沒有 */
								pagePlus={this.pagePlus}
								MaxPageCount={MaxPageCount}
								PageNumber={PageNumber}
								TotalCount={TotalCount}
							/>
							{/* 不可删除 */}
						</div>
						<BackToTop style={{ bottom: this.state.showMiniEvent ? '3rem' : '10%' }} />
						{this.state.miniGames ? (
							<SuspendBtn
								iconImgUrl={'/img/events/LaborDay2023/M1/FeatureIcon/M1_Feature-Icon-App.gif'}
								clickGoRed={() => {
									Router.push('/event_LaborDay2023');
									// Pushgtagdata('Engagement_Event', 'Click', 'Enter_LaborDay2023');
								}}
							/>
						) : null}
					</div>
				)}
			</Layout>
		);
	}
}

export default withBetterRouter(EventListing);

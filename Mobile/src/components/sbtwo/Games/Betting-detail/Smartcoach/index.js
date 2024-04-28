/*
 * @Author: Alan
 * @Date: 2021-05-18 13:13:29
 * @LastEditors: Alan
 * @LastEditTime: 2021-09-06 12:53:02
 * @Description: Smartcoach 赛事情报
 * @FilePath: \Fun88-Sport-Code2.0\components\Games\Betting-detail\Smartcoach\index.js
 */
import React, { Component } from 'react';
import { ReactSVG } from '$SBTWO/ReactSVG';
/* ---------- 骨架 ----------- */
import Skeleton from '$SBTWO/Skeleton/smartcoach';
/* ---- 即时情报 赛前情报 公用一个 ----*/
import GameInsights from './GameInsights';
/* ---------- 阵容 ------------- */
import LineUp from './GameLineUp';
/* ---------- 赛程 ------------- */
import InsightsTimeline from './GameTimeline';
/* ---------- API 配置 ------------ */
import HostConfig from '@/server/Host.config';
/* --------- WebSocket连接 --------- */
import { io } from 'socket.io-client';
import md5 from 'crypto-js/md5';
import PastMatchResult from "./PastMatchResult";

class Smartcoach extends Component {
	constructor(props) {
		super(props);
		this.state = {
			Tabactive: -1,
			/* 即时情报 */
			LiveInsightsSocketData: [],
			/* WebSocket 令牌 */
			Token: '',
			/* 赛前情报 主队 */
			PregameHome: [],
			/* 赛前情报 客队 */
			PregameAway: [],
			/* 赛程 统计图数据 */
			TimelineSocketCartogramData: [],
			/* 赛程 赛况数据 */
			TimelineSockeMatchreSultData: [],
			/* 队伍阵容 */
			TeamLineUp: {
				home_formation: null,
				away_formation: null,
				home_players: null,
				away_players: null
			},
			selectedGameInsightTab: -1, //1: nami分析, 2:smartcoach-gameinsight
			hasNamiAnalysisData: false,
			namiAnalysisData: {
				vsTotal: {
					vsCount: 0,
					vsTieCount: 0,
					vsLeftWinCount: 0,
					vsRightWinCount: 0,
					vsLeftHomeWinCount: 0,
					vsRightHomeWinCount: 0,
					vsLeftAwayWinCount: 0,
					vsRightAwayWinCount: 0
				},
				vsList: [],
				leftVsList: [],
				rightVsList: [],
			}
		};

		this.scSocket = null;
		this.scMatchId = null;
		this.liveInsightUseCache = false;	//即時情報是否使用緩存
		this.liveInsightCachedHashes = [];	//即時情報緩存項目(用來檢查是否重複)
		this.timeLineUseCache = false;	//賽況是否使用緩存
		this.timeLineCachedHashes = [];	//賽況緩存項目(用來檢查是否重複)
	}

	componentDidMount() {
		this.initSmartCoach();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		//還沒選定Tab，找一個有數據的tab選中他
		let newState = {};
		//處理第一階4個tab
		if (this.state.Tabactive === -1) {
			const  { IsNull0, IsNull1, IsNull2, IsNullGameInsights, IsNull3 } = this.prepareRenderData();

			let newKey = -1;

			if (!IsNull3) newKey = 3;
			if (!IsNull2) newKey = 2;
			if (!IsNull1) newKey = 1;
			if (!IsNull0) newKey = 0;

			if (newKey !== -1) {
				newState.Tabactive = newKey;
				this.Pushgtag(newKey);
			}
		}
		//處理賽前情報兩個tab
		if (this.state.selectedGameInsightTab === -1) {
			const  { IsNullGameInsights } = this.prepareRenderData();
			let newKey = -1;

			if (!IsNullGameInsights) newKey = 2;
			if (this.state.hasNamiAnalysisData) newKey = 1;

			if (newKey !== -1) {
				newState.selectedGameInsightTab = newKey;
			}
		}
		if (JSON.stringify(newState) !== '{}') {
			//謹慎使用，可能造成無窮迴圈
			this.setState(newState)
		}
	}

	componentWillUnmount() {
		/* 删除赛前情报定时器 */
		if (this.PregameInsightsInterval) {
			clearInterval(this.PregameInsightsInterval);
		}
		/* 移除Socket推送 */
		if (this.scSocket) {
			if (this.scMatchId) {
				this.scSocket.emit('unsubscribe_match', {match_id: this.scMatchId});
			}
			this.scSocket.disconnect(); //強制關閉連線
		}
	}

	cacheNames = {
		SCMatchId:'SCMatchId',
		/* 赛前情报 主队 */
		PregameHome: 'PregameHome',
		/* 赛前情报 客队 */
		PregameAway: 'PregameAway',
		/* 即时情报 */
		LiveInsightsSocketData: 'LiveInsightsSocketData',
		/* 赛程 统计图数据 */
		TimelineSocketCartogramData: 'TimelineSocketCartogramData',
		/* 赛程 赛况数据 */
		TimelineSockeMatchreSultData: 'TimelineSockeMatchreSultData',
		/* 队伍阵容 */
		TeamLineUp: 'TeamLineUp',

		NamiMatchId: 'NamiMatchId',
	}

	initSmartCoach = async () =>{
		//獲取nami分析
		let hasNamiAnalysisData = false;
		const CachedNamiAnalysisResult = this.getCache(this.cacheNames.NamiMatchId);
		if (CachedNamiAnalysisResult && CachedNamiAnalysisResult.namiData) {
			hasNamiAnalysisData = true;
			this.setState({hasNamiAnalysisData: true, namiAnalysisData: CachedNamiAnalysisResult.namiData});
		} else {
			const namiAnalysisResult = await this.getNamiAnalysisFromAPI();
			if (namiAnalysisResult && namiAnalysisResult.namiData) {
				hasNamiAnalysisData = true;
				this.setState({hasNamiAnalysisData: true, namiAnalysisData: namiAnalysisResult.namiData});
			}
		}

		//加快速度，從緩存中獲取初始展示數據
		const CachedSCMatchId = this.getCache(this.cacheNames.SCMatchId);
		if (CachedSCMatchId) {
			this.props.setInfoTabStatus(false, hasNamiAnalysisData);

			let newState = {};

			const getCachedData = (cacheName) => {
				const thisCacheData = this.getCache(cacheName);
				if (thisCacheData && (!Array.isArray(thisCacheData) || thisCacheData.length > 0)) {
					newState[cacheName] = thisCacheData;
				}
			}
			getCachedData(this.cacheNames.PregameHome);
			getCachedData(this.cacheNames.PregameAway);
			getCachedData(this.cacheNames.TimelineSocketCartogramData);
			getCachedData(this.cacheNames.TeamLineUp);

			//處理 即時情報 和 賽況 這種堆疊式的數據
			const getSpecialCachedData = (cacheName, flagName, hashName) => {
				const thisCacheData = this.getCache(cacheName);
				if (thisCacheData && thisCacheData.length > 0) {
					newState[cacheName] = thisCacheData;
					this[flagName] = true; //標記使用cache
					//生成hashArray
					this[hashName] = thisCacheData.map(item => {
						return md5(JSON.stringify(item.data)).toString();
					});
				}
			}
			getSpecialCachedData(this.cacheNames.LiveInsightsSocketData,'liveInsightUseCache','liveInsightCachedHashes');
			getSpecialCachedData(this.cacheNames.TimelineSockeMatchreSultData,'timeLineUseCache','timeLineCachedHashes');

			console.log('===use Cache of SC',CachedSCMatchId,JSON.parse(JSON.stringify(newState)));
			if (JSON.stringify(newState) !== '{}') {
				this.setState(newState);
			}
		}

		this.scSocket = io(HostConfig.Config.SmartCoachApi); //強制重新連線(提早連線避免打開有delay)

		const token = await this.getSmartcoachToken();
		if (!token) {
			this.props.setInfoTabStatus('沒有獲取到 sc token', hasNamiAnalysisData)
			return;
		}
		const scMatchId = await this.getSmartCoachMatchIdFromAPI();
		if (scMatchId) {
			this.props.setInfoTabStatus(false, hasNamiAnalysisData);
			/* ---------------- 即时情报 --------------- */
			this.LiveInsights(token, scMatchId);
			/* --------- 赛前情报 30分钟Call/次 --------- */
			this.PregameInsightsInterval = setInterval(this.PregameInsights(token, scMatchId), 1800000);
			/* --------------- 队伍-阵容 --------------- */
			/* this.LineUp(token, id); 废弃 更改为时时阵容 */
			/* 记录id 为了清除 Socket推送 */
			this.scMatchId = scMatchId;
		} else {
			this.props.setInfoTabStatus('沒有獲取到 sc matchId', hasNamiAnalysisData)
		}
	}

	setCache = (cacheName, value) => {
		const {Vendor, EventDetail} = this.props;
		const cacheKey = EventDetail.EventId + '@SMARTCOACH@' + cacheName;
		Vendor._cacheSet(cacheKey, value);
	}

	getCache = (cacheName) => {
		const {Vendor, EventDetail} = this.props;
		const cacheKey = EventDetail.EventId + '@SMARTCOACH@' + cacheName;
		return Vendor._cacheGet(cacheKey);
	}

	/**
	 * @description: 获取情报令牌
	 * @return {Object}
	 */
	getSmartcoachToken = () => {
		//let hideLoading = Toast.loading();
		return fetch(HostConfig.Config.CacheApi + '/sctoken')
			.then((response) => response.json())
			.then((Data) => {
				return Data.token.toString();
			})
			.catch(() => null)
			.finally(() => {
				//hideLoading();
			});
	};

	//直接從API獲取SmartCoach 比賽Id
	getSmartCoachMatchIdFromAPI = () => {
		const {EventDetail} = this.props;

		const queryUrl = HostConfig.Config.CacheApi + '/sc/im/search/'
			+ EventDetail.LeagueId + '/'
			+ EventDetail.HomeTeamId + '/'
			+ EventDetail.AwayTeamId + '/'
			+ EventDetail.getEventDateMoment().toISOString()

		return fetch(queryUrl)
			.then((response) => response.json())
			.then((jsonData) => {
				if (jsonData && jsonData.match && jsonData.match.id) {
					this.setCache(this.cacheNames.SCMatchId,jsonData.match.id); //緩存
					return jsonData.match.id;
				}else {
					return null;
				}
			})
			.catch(() => null)
	}

	//直接從API獲取Nami分析數據
	getNamiAnalysisFromAPI = () => {
		const {EventDetail} = this.props;

		const queryUrl = HostConfig.Config.CacheApi + '/nami/im/search/'
			+ EventDetail.EventId + '/'
			+ EventDetail.LeagueId + '/'
			+ EventDetail.HomeTeamId + '/'
			+ EventDetail.AwayTeamId + '/'
			+ EventDetail.getEventDateMoment().toISOString()

		return fetch(queryUrl)
			.then((response) => response.json())
			.then((jsonData) => {
				if (jsonData && jsonData.namiData) {
					this.setCache(this.cacheNames.NamiMatchId,jsonData.namiData.NamiMatchID); //緩存
					return jsonData;
				}else {
					return null;
				}
			})
			.catch(() => null)
	}

	/**
	 * @description: 获得即时情报
	 * @param {token} 连接 Socket token令牌
	 * @param {matchid} 比赛id Smartcoach返回
	 * @return {Object}
	*/
	LiveInsights = (token, matchid) => {
		const socket = this.scSocket
		socket.emit('subscribe_match', {
			match_id: matchid, //matchId.toString(),
			token: token,
			locale: 'zh'
		});

		/* ----------- 情报 ------------ */
		socket.on('new_event', (data) => {
			console.log('====get new_event',JSON.parse(JSON.stringify(data)));

			//要先處理，不然判斷緩存會出問題
			if (data.data.type == 'insight' || data.data.type == 'livefeed') {
				//處理分鐘數
				if (data.data.period == 4) { //{"4":"Second Half"} 下半場分鐘數要加45
					data.data.minutes = data.data.minutes + 45;
				} else if (data.data.period == 6) { //{"6":"Extra Time First Half"} 加時賽上半場 應該是+90
					data.data.minutes = data.data.minutes + 90;
				} else if (data.data.period == 8) { //{"8":"Extra Time Second Half"} 加時賽下半場 應該是+105(上半場15分)
					data.data.minutes = data.data.minutes + 105;
				} else {
					data.data.minutes = data.data.minutes;
				}
			}

			/* 即时情报 */
			if (data.data.type == 'insight') {
				let isNewData = true;
				//檢查是否已在緩存
				if (this.liveInsightUseCache && this.liveInsightCachedHashes && this.liveInsightCachedHashes.length > 0) {
					const thisHash = md5(JSON.stringify(data.data)).toString();
					if (this.liveInsightCachedHashes.indexOf(thisHash) !== -1) { //已在緩存
						this.liveInsightCachedHashes = this.liveInsightCachedHashes.filter(h => h!==thisHash);
						console.log('====exist in HASH',JSON.parse(JSON.stringify(data)),thisHash,JSON.parse(JSON.stringify(this.liveInsightCachedHashes)));
						isNewData = false; //不用加進去
					}
				}

				if (isNewData) {
					console.log('====new data',JSON.parse(JSON.stringify(data)));
					this.setState((state) => {
						return {
							LiveInsightsSocketData: [...state.LiveInsightsSocketData, data]
						};
					}, () => {
						this.setCache(this.cacheNames.LiveInsightsSocketData,this.state.LiveInsightsSocketData); //緩存
					});
				}
			}
			/* 赛程-赛况 */
			if (data.data.type == 'livefeed') {
				let isNewData = true;
				//檢查是否已在緩存
				if (this.timeLineUseCache && this.timeLineCachedHashes && this.timeLineCachedHashes.length > 0) {
					const thisHash = md5(JSON.stringify(data.data)).toString();
					if (this.timeLineCachedHashes.indexOf(thisHash) !== -1) { //已在緩存
						this.timeLineCachedHashes = this.timeLineCachedHashes.filter(h => h!==thisHash);
						console.log('====exist in HASH',JSON.parse(JSON.stringify(data)),thisHash,JSON.parse(JSON.stringify(this.timeLineCachedHashes)));
						isNewData = false; //不用加進去
					}
				}

				if (isNewData) {
					console.log('====new data',JSON.parse(JSON.stringify(data)));
					this.setState((state) => {
						return {
							TimelineSockeMatchreSultData: [...state.TimelineSockeMatchreSultData, data]
						};
					},() => {
						this.setCache(this.cacheNames.TimelineSockeMatchreSultData,this.state.TimelineSockeMatchreSultData); //緩存
					});
				}
			}
		});

		/* ----------- 赛程-统计图 ------------ */
		socket.on('live_feed_update', (data) => {
			this.setState((state) => {
				return {
					TimelineSocketCartogramData: data
				};
			});
			this.setCache(this.cacheNames.TimelineSocketCartogramData,data); //緩存
		});

		/* ------------ 时时比赛阵容 ------------ */
		socket.on('lineup_update', (Data) => {
			let cloneData = JSON.parse(JSON.stringify(Data.data)); //複製一份
			cloneData.away_players = cloneData.away_players.reverse(); //对客队进行反向排序

			//隊員需要按x 大=>小排序
			const playerSortFunc = (a,b) => {
				if (a.x > b.x) {
					return -1; //小于 0 ，那么 a 会被排列到 b 之前
				} else if (a.x < b.x) {
					return 1; //大于 0 ， b 会被排列到 a 之前。
				}
				return 0;
			}
			cloneData.home_players.map(arr => {
				if (arr.length > 1 && arr.filter(p => p.bench == 0).length > 1) { //2個以上球員而且不是替補
					arr.sort(playerSortFunc)
				}
			})
			cloneData.away_players.map(arr => {
				if (arr.length > 1 && arr.filter(p => p.bench == 0).length > 1) { //2個以上球員而且不是替補
					arr.sort(playerSortFunc)
				}
			})

			this.setState((state) => {
				return {
					TeamLineUp: cloneData,
				};
			});
			this.setCache(this.cacheNames.TeamLineUp,cloneData); //緩存
		});
	};

	/**
	 * @description:  获得赛前情报
	 * @param {token} 连接API token令牌
	 * @return {Array}
	*/
	PregameInsights = (Token, matchid) => {
		//let hideLoading = Toast.loading();
		const tokenFetchParams = {
			method: 'GET',
			headers: {
				Accept: 'application/json, text/plain, */*',
				Authorization: 'Bearer ' + Token
			}
		};
		fetch(HostConfig.Config.SmartCoachApi + `/insights/pregame/${matchid}/home?locale=zh`, tokenFetchParams)
			.then((response) => response.json())
			.then((Data) => {
				if (!(Data instanceof Array)) {
					return;
				}
				this.setState({
					PregameHome: Data
				});
				this.setCache(this.cacheNames.PregameHome,Data); //緩存
			})
			.catch(() => null)
			.finally(() => {
				//hideLoading();
			});
		fetch(HostConfig.Config.SmartCoachApi + `/insights/pregame/${matchid}/away?locale=zh`, tokenFetchParams)
			.then((response) => response.json())
			.then((Data) => {
				if (!(Data instanceof Array)) {
					return;
				}
				this.setState({
					PregameAway: Data
				});
				this.setCache(this.cacheNames.PregameAway,Data); //緩存
			})
			.catch(() => null)
			.finally(() => {
				//hideLoading();
			});
	};

	/**
	 * @description: 降序处理
	 * @param {*} property DATA
	 * @return {Array} 降序的数据
	*/
	compare = (property) => {
		return function(obj1, obj2) {
			var value1 = obj1[property];
			var value2 = obj2[property];
			return value2 - value1;
		};
	};

	Pushgtag = (key) => {
		// key == 0 && Pushgtagdata(`Match_Feature`, 'View', `LiveInsights_MatchPage`);
		// key == 1 && Pushgtagdata(`Match_Feature`, 'View', `GameTimeline_MatchPage`);
		// key == 2 && Pushgtagdata(`Match_Feature`, 'View', `LineUp_MatchPage`);
		// key == 3 && Pushgtagdata(`Match_Feature`, 'View', `PregameInsights_MatchPage`);
	};

	clickGameInsightTab = (tabIndex) => {
		if (this.state.selectedGameInsightTab == tabIndex) return;
		if (tabIndex == 2 && !this.scMatchId) return;
		if (tabIndex == 1 && !this.state.hasNamiAnalysisData) return;
		this.setState({selectedGameInsightTab:tabIndex});
	}

	//為了跟componentDidUpdate共用，所以提取出來
	prepareRenderData = () => {
		const {
			Tabactive,
			/* 即时情报 */
			LiveInsightsSocketData,
			/* 赛程 - 统计图 */
			TimelineSocketCartogramData,
			/* 赛程 - 赛况 */
			TimelineSockeMatchreSultData,
			/* 赛前情报 - 主队数据 */
			PregameHome,
			/* 赛前情报 - 客队数据 */
			PregameAway,
			/* 队伍阵容 */
			TeamLineUp,
			/* 队伍阵容@替补队员-教练 */
			TeamLineUpCoach,
			selectedGameInsightTab,
			hasNamiAnalysisData,
			namiAnalysisData,
		} = this.state;

		/* --------- 赛前情报数据合并 ----------- */
		let H = PregameHome ? PregameHome : [];
		let A = PregameAway ? PregameAway : [];
		let Home_Away = H.concat(A);

		/* ------- 数据为空则当前菜单置灰 --------- */
		let IsNull0 = LiveInsightsSocketData == '' || !LiveInsightsSocketData || LiveInsightsSocketData.length <= 0
		let IsNull1 = TimelineSockeMatchreSultData == '' || !TimelineSockeMatchreSultData || TimelineSockeMatchreSultData.length <= 0
			|| TimelineSocketCartogramData == '' || !TimelineSocketCartogramData || TimelineSocketCartogramData.length <= 0
		let IsNull2 = !TeamLineUp.home_players && !TeamLineUp.away_players;
		let IsNullGameInsights = (Home_Away == '' || !Home_Away || Home_Away.length <=0);
		let IsNull3 = IsNullGameInsights && (hasNamiAnalysisData === false);

		let HaveData = (Tabactive !== -1);

		return {Home_Away, IsNull0, IsNull1, IsNull2, IsNullGameInsights, IsNull3, HaveData}
	}

	render() {
		const {
			Tabactive,
			/* 即时情报 */
			LiveInsightsSocketData,
			/* 赛程 - 统计图 */
			TimelineSocketCartogramData,
			/* 赛程 - 赛况 */
			TimelineSockeMatchreSultData,
			/* 赛前情报 - 主队数据 */
			PregameHome,
			/* 赛前情报 - 客队数据 */
			PregameAway,
			/* 队伍阵容 */
			TeamLineUp,
			/* 队伍阵容@替补队员-教练 */
			TeamLineUpCoach,
			selectedGameInsightTab,
			hasNamiAnalysisData,
			namiAnalysisData,
		} = this.state;

		let { Home_Away, IsNull0, IsNull1, IsNull2, IsNullGameInsights, IsNull3, HaveData } = this.prepareRenderData();

		return (
			<div>
				{this.props.Tabactive == 1 && (
					<div className="Smartcoach">
						{/* 顶部导航菜单 */}
						<div className="Tab">
							{[
								{ name: '即时情报', icon: '/img/svg/smartcoach/0.svg' },
								{ name: '赛程', icon: '/img/svg/smartcoach/1.svg' },
								{ name: '阵容', icon: '/img/svg/smartcoach/2.svg' },
								{ name: '赛前情报', icon: '/img/svg/smartcoach/3.svg' }
							].map((data, key) => {
								let disabled =
									(IsNull0 && key == 0) ||
									(IsNull1 && key == 1) ||
									(IsNull2 && key == 2) ||
									(IsNull3 && key == 3);
								return (
									<div
										key={key}
										onClick={() => {
											this.setState({
												Tabactive: key,
											});
											this.Pushgtag(key);
										}}
										className={`list ${disabled ? 'disabled' : ''} ${Tabactive == key
											? 'active'
											: ''}`}
									>
										<ReactSVG className="Smarticon" src={data.icon} />
										{data.name}
										{Tabactive == key && <i className="line" />}
									</div>
								);
							})}
						</div>

						{/* -------- 即时情报 ------ */}
						{Tabactive == 0 &&
						!IsNull0 && (
							<GameInsights
								type="0"
								/* 按照分钟倒序 */
								LiveInsightsSocketData={LiveInsightsSocketData.sort(
									(a, b) => b.data.minutes - a.data.minutes
								)}
								EventDetail={this.props.EventDetail}
								Vendor={this.props.Vendor}
							/>
						)}

						{/* -------- 赛程-赛况 ------ */}
						{Tabactive == 1 &&
						!IsNull1 && (
							<InsightsTimeline
								type="1"
								TimelineSocketCartogramData={TimelineSocketCartogramData}
								/* 按照分钟倒序 */
								TimelineSockeMatchreSultData={TimelineSockeMatchreSultData.sort(
									(a, b) => b.data.minutes - a.data.minutes
								)}
								EventDetail={this.props.EventDetail}
								Vendor={this.props.Vendor}
							/>
						)}

						{/* ---------阵容 ----------- */}
						{Tabactive == 2 &&
						!IsNull2 && (
							<LineUp
								type="2"
								TeamLineUp={TeamLineUp}
								EventDetail={this.props.EventDetail}
								Vendor={this.props.Vendor}
								key={'2'}
								TeamLineUpCoach={TeamLineUpCoach}
							/>
						)}

						{/* ---------赛前情报 ------- */}
						{Tabactive == 3 &&
						!IsNull3 && <>
							<div className="GameInsightTab">
								<div className="GameInsightTabBox">
									<div className={"NamiAnalysis" + (selectedGameInsightTab == 1 ? ' selected' : '') + (!hasNamiAnalysisData ? ' disabled' : '')}
											 onClick={() => this.clickGameInsightTab(1)}>历史交锋</div>
									<div className={"GameInsight" + (selectedGameInsightTab == 2 ? ' selected' : '') + (IsNullGameInsights ? ' disabled' : '')}
											 onClick={() => this.clickGameInsightTab(2)}>队伍情报</div>
								</div>
							</div>
							{/* 历史交锋 */}
							{selectedGameInsightTab == 1 ?
								<PastMatchResult Vendor={this.props.Vendor} EventData={this.props.EventDetail} NamiAnalysisData={namiAnalysisData} />
								: null
							}
							{/* 队伍情报 */}
							{(selectedGameInsightTab == 2 && !IsNullGameInsights) ?
								<GameInsights
									type="3"
									PregameInsights={Home_Away.sort(this.compare('score')) /* 按照得分排序 */}
									EventDetail={this.props.EventDetail}
									Vendor={this.props.Vendor}
								/> : null}
						</>}

						{!HaveData && <Skeleton />}
					</div>
				)}
			</div>
		);
	}
}

export default Smartcoach;

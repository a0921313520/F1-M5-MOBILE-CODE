/*
 * @Author: Alan
 * @Date: 2022-02-08 17:48:31
 * @LastEditors: Alan
 * @LastEditTime: 2023-03-20 12:11:38
 * @Description: 游戏相关种类详情页面
 * @FilePath: \F1-M1-Code\Mobile\pages\Games\Details\index.js
 */
import React, { Component, Fragment } from 'react';
import { ReactSVG } from '@/components/View/ReactSVG';
import Drawer from '@/components/View/Drawer';
import Input from '@/components/View/Input';
import Router, { useRouter } from 'next/router';
import { withRouter } from 'next/router';
import PullloadGames from '@/components/Games/PullloadGames';
import moment from 'moment';
import {
	ACTION_GamesInfo_getList,
	ACTION_GamesInfo_getProvidersList,
	ACTION_GamesInfo_getCategoriesList
} from '@/lib/redux/actions/GamesInfoAction';
import { connect } from 'react-redux';
import Flexbox from '@/components/View/Flexbox/';
import DrawerFilter from '@/components/Games/DrawerFilter';
import DrawerCategories from '@/components/Games/DrawerCategories';
import { getUrlVars } from '@/lib/js/Helper';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { GetGamesList } from '@/api/game';
import Toast from '@/components/View/Toast';
import Announcement from '@/components/Announcement/';
import Layout from '@/components/Layout';
import HostConfig from '@/server/Host.config';
import { gameLobbyPiwik } from '../../../src/lib/data/DataList';

class Details extends Component {
	constructor(props) {
		super(props);
		this.state = {
			//游戏筛选抽屉打开状态
			GamesDrawer: false,
			//排序数据
			FilterOptions: [
				{ label: 'Mặc định', id: 0 },
				{ label: 'Mới Nhất', id: 1},
				{ label: 'Đề Xuất', id: 2 },
				{ label: 'A-Z', id: 3 }
			],
			//打开排序下列菜单
			isOpen: false,
			//打开搜索按钮
			isOpenSearch: false,
			//搜索的关键词
			searchVal: '',
			//当前展示的游戏列表
			GameList: [],
			//游戏搜索关键词
			searchValue: '',
			//游戏的类型
			CategoriesMenu: [],
			//游戏的平台
			ProviderMenu: [],
			//当前选的游戏类型
			CategoriesMenuActive: '',
			//当前选的游戏平台
			ProviderMenuActive: '',
			//当前排序
			orderId: 0,
			//最近玩过的游戏类型
			Playdata: [],
			//游戏赔付线类型
			LineMenuActive: 'AllPaylines',
			//游戏特色类型
			FeatureMenuActive: '',
			//当前选的游戏类型內容
			CategoriesMenuItem: null,
			//当前选的游戏內容
			ProviderMenuItem: null,
			//游戏赔付线类型內容
			LineMenuItem: null,
			//游戏特色类型內容
			FeatureMenuItem: null,
			//加载中
			Loading: true,
			// 是否正在編輯篩選項目
			isFilterEditing:false,
			//排序種類
			gameSortingType:"Default",
		};
	}

	componentDidMount() {
		let vendor = getUrlVars()['vendor'];
		let categories = getUrlVars()['categories'];
		let provider = getUrlVars()['provider'];
		let sorting = getUrlVars()['sorting'];
		const feature = getUrlVars()['feature'];
		//isShowFishingGames = true 筛选过滤平台类型抽屉菜单 【捕鱼游戏】就会变成YBF【醉心捕鱼】
		let isShowFishingGames = vendor == 'Slot' ? true : false;
		let vendorType = vendor == 'Lottery' ? 'KenoLottery' : vendor;
		this.props.gamesInfo_getProvidersList(vendorType, isShowFishingGames);
		this.props.gamesInfo_getCategoriesList(vendorType);
		if (sorting === "Recommended") {
			this.setState({
				gameSortingType: sorting,
				orderId: 1
			}, () => {
				this.Init()
			})
		}
		else if (feature === "Jackpot") {
			this.setState({
				FeatureMenuActive: "Jackpot"
			},() => {
				this.Init()
			})
		}
		else {
			this.Init()
		}
		let CheckAnnouncement =
			!localStorage.getItem('ProductPage' + vendorType + 'PagelocalStorageAnnouncement') &&
			!sessionStorage.getItem('ProductPage' + vendorType + 'PagelocalStorageAnnouncement');
		this.setState({
			CategoriesMenuActive: categories || '',
			ProviderMenuActive: provider || '',
			CheckAnnouncement: CheckAnnouncement
		});
	}

	componentDidUpdate(prevProps){
		const { ProvidersList, CategoriesList } = this.props.GamesList
		if ( ProvidersList !== prevProps.GamesList.ProvidersList || CategoriesList !== prevProps.GamesList.CategoriesList ){
			const provider = getUrlVars()['provider']
			const categories = getUrlVars()['categories']
			const feature = getUrlVars()['feature']
			let Playdata = [];
			if ( ProvidersList && provider ) {
				let providerItem = ProvidersList.find((Item) => Item.providerCode == provider);
				if (providerItem) {
					let Item = {
						menu: 'provider',
						name: providerItem.providerName,
						type: providerItem.providerCode
					};
					Playdata.push(Item);
				}
			}
			if (CategoriesList && categories) {
				let categoryItem = CategoriesList.find((Item) => Item.category == categories);
				if (categoryItem) {
					let Item = {
						name: categoryItem.name,
						type: categoryItem.category,
						menu: 'Category',
					};
					Playdata.push(Item);
				}
			}
			if (feature === "Jackpot") {
				if (feature && feature === "Jackpot") {
					let Item = {
						name: "彩池游戏",
						type: "Jackpot",
						menu: 'Feature',
					};
					Playdata.push(Item);
				}
			}
			this.setState({ Playdata });
		}

	}

	Init(clearall) {
		const gameType = getUrlVars()['vendor'];
		const provider = clearall ? '' : getUrlVars()['provider'];
		const category = clearall ? '' : getUrlVars()['categories'];
		const featureMenuActive = clearall ? '' : this.state.FeatureMenuActive;
		this.getGames(gameType, provider, category, featureMenuActive, clearall);
		
		this.setState({
			Loading: true,
			gameTag: gameType,
			CategoriesMenuActive: ""
		});
	}
	/**
	 * @description: 获取游戏列表
	 * @param {*} gameType 厂商 Available values : Sportsbook, ESports, LiveCasino, P2P, Slot, KenoLottery, Fishing
	 * @param {*} provider 平台 AG PT 等
	 * @param {*} gameSortingType Available option: Default, Recommended, IsNew, AToZ
	 * @param {*} category 游戏类别
	 * @param {*} keyword  关键词 搜索
	 * @param {*} minPayline 最小支付线
	 * @param {*} maxPayline 最大支付线
	 * @return {*}
  	*/

	getGames(gameType, provider, category, feature, lineData) {
		let { gameSortingType } = this.state
		let params = {
			gameType: gameType,
			provider: provider || '', //平台種類
			category: category || '', //遊戲類型
			feature: feature || "", //遊戲特色
			minPayline: lineData ? 'AllPaylines' : this.state.LineMenuActive || "",
		};
		// const hide = Toast.loading();
		// let hasGetData;
		// let data = sessionStorage.getItem('GameList' + gameType + JSON.stringify(params));
		// if (data) {
		// 	hasGetData = true;
		// 	this.setState({
		// 		GameList: JSON.parse(data),
		// 		Loading: false,
		// 	});
		// }
		let gameListParams = {
			gameType: gameType,
			gameSortingType,
			category: gameSortingType === "Default" ? category || feature : "",
		}

		GetGamesList(gameListParams, (data) => {
			if (data) {
				if (data.isSuccess) {
					let filteredGameDetails = data.result?.gameDetails;
					if (params) {
						// 篩選平台
						filteredGameDetails = params.provider === "FISHING"
						? filteredGameDetails.filter(item => 
							item.categories.some(cate => cate.categoryName === "FishingGame"))
						: filteredGameDetails.filter(item => 
							params.provider === "" || item.provider === params.provider);

						// 篩選遊戲類型
						if (params.category !== "") {
							filteredGameDetails = filteredGameDetails.filter(item => {
							return item.categories.some(cate => cate.categoryName === params.category);
							});
						}
						// 篩選遊戲特色
						if (params.feature !== "") {
							filteredGameDetails = filteredGameDetails.filter(item => {
								return item.categories.some(cate => cate.categoryName === params.feature)
							})
						}
					}

					if (gameType === "Slot") {// 老虎機才會有賠付線
						if (params.minPayline !== "") {
							filteredGameDetails = filteredGameDetails.filter(item => {
								return item.categories.some(cate => cate.categoryName === params.minPayline);
							})
						}
					}
					// sessionStorage.setItem(
					// 	'GameList' + gameType + JSON.stringify(params),
					// 	JSON.stringify(filteredGameDetails)
					// );
					// if (!hasGetData) {
						this.setState({
							GameList: filteredGameDetails
						});
					// }
				}
				this.setState({
					Loading: false
				});
			}
			Toast.destroy();
		});
	}

	/**
	 * @description: 游戏排序
	 * @param {*}
	 * @return {*}
	*/
	orderList() {
		const { GameList, orderId, ProviderMenuActive, CategoriesMenuActive } = this.state;
		const { vendor } = this.props.router.query;
		let gameSortingType = "Default";
		
		if (orderId == 1) {
			//推荐
			gameSortingType = "Recommended"
		} else if (orderId == 2) {
			//最新
			gameSortingType = "IsNew"
		} else if (orderId == 3) {
			//A-Z
			gameSortingType = "AToZ"
		}
		this.setState({ gameSortingType }, () => {
			this.getGames(vendor, ProviderMenuActive, CategoriesMenuActive, this.state.FeatureMenuActive);
		});

	}

	/**
	 * @description: 游戏搜索
	 * @param {*} value 搜索的关键字
	 * @return {*}
	*/
	searchGames(value) {
		const { GameList } = this.state;
		let valueLower = value.toLowerCase();
		function filterByID(item) {
			if (item.searchKeyword) {
				let gameNameLower = item.searchKeyword.toLowerCase();
				if (gameNameLower.indexOf(valueLower) > -1) {
					return true;
				}
			}
		}
		var SearchListData = GameList ? GameList.filter(filterByID) : null;
		console.log('SearchListData', SearchListData);
		this.setState({
			GameList: SearchListData
		});
		// Pushgtagdata(`Game Nav`, 'Click', `Search_${value}`);
	}

	/**
	 * @description: 最近玩过类型
	 * @param {*} item 游戏平台/类型
	 * @return {*}
  	*/
	 PlayHistory = (data) => {
		let newPlaydata = this.state.Playdata;
		if (this.state.Playdata.findIndex(item => item.menu === data.menu) !== -1 ) {
			if (data.name === 'All' || data.name === "全部赔付线") {
				newPlaydata = newPlaydata.filter(item => item.menu !== data.menu);
			}
			else {
				newPlaydata[newPlaydata.findIndex(item => item.menu === data.menu)] = data;
			}
		}
		else {
			if (data.name !== "All" && data.name !== "全部赔付线") {
				newPlaydata.push(data)
				
			}
		}
		 this.setState({
			Playdata: newPlaydata,
		 });
	}

	PlaydataInit(item) {
		console.log('当前选择的类型-------------->', item);
		if (item) {
			let Playdata = this.state.Playdata.filter((v) => v.type != item.type);
			if (Playdata.length == 0) {
				this.Init(true);
				this.setState({
					ProviderMenuActive: '',
					FeatureMenuActive: ''
				});
			}
			this.setState(
				{
					Playdata: Playdata,
					LineMenuActive: item.menu == 'Line' ? '' : this.state.LineMenuActive
				},
				() => {
					let gameType = getUrlVars()['vendor'];
					let provider = getUrlVars()['provider'];
					let categories = getUrlVars()['categories'];
					let providerData = this.state.Playdata.find((v) => v.menu == 'provider');

					let CategoryData =
						item.menu == 'Category' ? '' : this.state.Playdata.find((v) => v.menu == 'Category');

					let featureData = 
						item.menu === "Feature" ? '' : this.state.Playdata.find((v) => v.menu === "Feature")

					let lineData = 
						item.menu === "Line" ? '' : this.state.Playdata.find((v) => v.menu === "Line")
					if (Playdata.length > 0) {
						this.getGames(
							gameType,
							providerData ? providerData.type : "",
							CategoryData ? CategoryData.type : "",
							featureData ? featureData.type : "",
							lineData ? lineData.type : "",
						);
					}
				}
			);
		}
	}
	render() {
		const {
			//游戏筛选抽屉打开状态
			GamesDrawer,
			//排序菜单
			FilterOptions,
			//打开排序下列菜单
			isOpen,
			//隐藏显示抽屉
			searchValue,
			//隐藏显示搜索栏
			isOpenSearch,
			//游戏列表
			GameList,
			//游戏所属类型
			CategoriesMenuActive,
			//游戏所属平台
			ProviderMenuActive,
			//排序id
			orderId,
			//最近玩过的游戏类型
			Playdata,
			//最近玩过的游戏数据
			Historyitem,
			//游戏赔付线
			LineMenuActive,
			//游戏特色类型
			FeatureMenuActive,
			//加载状态
			Loading,
			isFilterEditing
		} = this.state;
		const { vendor, provider } = this.props.router.query;
		const { GamesList } = this.props;
		return (
			<Layout
				title="FUN88乐天堂官网｜英超热刺纽卡赞助伙伴"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle=""
				status={0}
			>
				<Fragment>
					<div className="Container Details">
						<div className={`sport-container-wrapper fixed-header`}>
							{/* 頭部 */}
							<div className="header-wrapper">
								<ReactSVG
									className="back-icon"
									src="/img/svg/LeftArrow.svg"
									onClick={this.handleBackEvent}
								/>
								<span className="Header-title">
									{vendor == 'Slot' ? (
										'Trò Chơi/Bắn Cá'
									) : vendor == 'LiveCasino' ? (
										'Casino'
									) : vendor == 'P2P' ? (
										'3D Casino'
									) : provider == 'VTG' ? (
										'Thể Thao V2'
									) : provider == 'SPR' || vendor == 'InstantGames'? (
										'Spribe'
									) : 
										vendor == "KenoLottery" ? (
											'Xổ Số'
									) :
									   vendor
									}
								</span>
								{provider != 'SPR' && (
									<div className="Filter">
										{/* 搜索按钮 */}
										<ReactSVG
											className="icon-set"
											src={`/img/P5/svg/search.svg`}
											onClick={() => {
												this.setState({
													isOpenSearch: !isOpenSearch
												});
												if (gameLobbyPiwik[vendor]){
													Pushgtagdata(`${gameLobbyPiwik[vendor].eventCat}_Lobby`, 'Search Game', `${gameLobbyPiwik[vendor].eventName}_C_Search`);
												}
											}}
										/>
										<ReactSVG
											className="icon-set"
											src={`/img/P5/svg/filter.svg`}
											onClick={() => {
												this.GamesDrawer(true);
												this.setState({
													CategoriesMenuItem: null,
													FeatureMenuItem: null,
													LineMenuItem: null,
													ProviderMenuItem: null,
												})
											}}
										/>
										{/* 筛选抽屉 */}
										{/* {provider != 'VTG' && ( */}
											<ReactSVG
												className="icon-set"
												src={`/img/P5/svg/menu.svg`}
												onClick={() => {
													this.setState({
														isOpen: !isOpen
													});
													// Pushgtagdata(`Game Nav`, 'Click', `Sorting_${vendor}`);
												}}
											/>
										{/* )} */}

										{/* 排序过滤下拉菜单 */}
										{isOpen && (
											<div className={`Header-select GameFilter`}>
												{FilterOptions.map((item, key) => {
													return (
														<div
															key={key}
															onClick={() => {
																this.setState(
																	{
																		orderId: item.id,
																		isOpen: false
																	},
																	() => {
																		this.orderList();
																	}
																);
																let gameType = getUrlVars()['vendor'];
																let provider = getUrlVars()['provider'];
																console.log(gameLobbyPiwik[vendor], 'vendor')
																if (gameLobbyPiwik[vendor]){
																	Pushgtagdata(`${gameLobbyPiwik[vendor].eventCat}_Lobby`, 'Filter Game', `${gameLobbyPiwik[vendor].eventName}_C_Product`,
																	[{
																		customVariableKey: `${gameLobbyPiwik[vendor].eventName}_C_ProductType`,
																		customVariableValue: item.label 
																	}]);
																}
																// Pushgtagdata(
																// 	`Game Nav`,
																// 	'Click',
																// 	`Sorting_${gameType}_${provider}`
																// );
															}}
															className="Radio-Type-list"
														>
															<label>{item.label}</label>
															<div
																className={`cap-item-circle${orderId === key
																	? ' curr'
																	: ''}`}
															/>
														</div>
													);
												})}
											</div>
										)}
									</div>
								)}
							</div>
						</div>
						{isOpenSearch && (
							<div className="Search">
								<Input
									className="input-search"
									placeholder={'Nhập tên tìm kiếm'}
									value={searchValue}
									prefix={<ReactSVG className="loginSVG icon-search" src={`/img/svg/search.svg`} />}
									suffix={
										<span className="button-search" onClick={() => this.searchGames(searchValue)}>
											Tìm
										</span>
									}
									onChange={({ target: { value: v } }) => {
										let newState = { searchValue: v };
										if (!v || v.length <= 0) {
											const { provider, categories } = this.props.router.query;
											this.setState({
												ProviderMenuActive: provider,
												CategoriesMenuActive: categories
											});
											this.Init(); //清空搜索文字時也清空搜索結果
										}
										this.setState(newState);
									}}
									isClear={true}
									maxLength={50}
								/>
							</div>
						)}

						<div className="PullloadGames GameBox">
							{/* 最近玩过的游戏类型 */}
							<Flexbox className="Playdata" justifyContent="space-around" key={Playdata?.toString()}>
								{Playdata.map((item, index) => {
									if (provider == 'VTG' || provider == 'SPR') {
										return;
									}
									return (
										<Flexbox key={index + 'list'} className="list">
											<span
												onClick={() => {
													if (item.menu == 'categories') {
														this.setState(
															{
																CategoriesMenuActive: item.type
															},
															() => {
																this.getGames(vendor, ProviderMenuActive, item.type);
															}
														);
														//this.Init();
													}
													if (item.menu == 'provider') {
														this.setState(
															{
																ProviderMenuActive: item.type
															},
															() => {
																this.getGames(vendor, item.type, CategoriesMenuActive);
															}
														);
														//this.Init();
													}
													// Pushgtagdata(`Game Nav`, 'Click', `Filter_${vendor}`);
												}}
											>
												{item.type === "IsRecommendedGames" ? "推荐游戏" : item.name}
											</span>
											<ReactSVG
												className="back-icon"
												src="/img/P5/svg/close.svg"
												onClick={() => {
													this.PlaydataInit(item);
													// Pushgtagdata(`Game Nav`, 'Click', `Filter_${vendor}`);
												}}
											/>
										</Flexbox>
									);
								})}
							</Flexbox>
							{/* 游戏列表 */}
							{GameList.length != '' ? (
								<PullloadGames
									data={
										//stg和sl 不过滤isLive
										HostConfig.Config.isGameLive ? (
											GameList.filter((item) => item.isLive == true)
										) : (
											GameList
										)
									}
									key={
										orderId?.toString() +
										JSON.stringify(GameList) +
										CategoriesMenuActive?.toString() +
										ProviderMenuActive?.toString()
									}
								/>
							) : Loading ? (
								/* 骨架屏 */
								<Flexbox className="SkeletonTheme Games-SkeletonTheme">
									<SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff" inline>
										<Skeleton count={2} height="144px" />
										<Skeleton count={2} height="144px" />
										<Skeleton count={2} height="144px" />
										<Skeleton count={2} height="144px" />
										<Skeleton count={2} height="144px" />
									</SkeletonTheme>
								</Flexbox>
							) : (
								/* 没有数据 */
								<Flexbox className="Null-Box">
									<ReactSVG src="/img/P5/icon/null.svg" />
									<p style={{textAlign: 'center'}}>không có kết quả nào <br/>được tìm thấy</p>
								</Flexbox>
							)}
						</div>
					</div>

					{/* 游戏筛选抽屉 */}
					{typeof window !== "undefined" &&
					<Drawer
						style={{ maxHeight: `${window.innerHeight*0.85}px`,height:"auto" }}
						direction="bottom"
						onClose={() => {
							this.setState({isFilterEditing:false})
							this.GamesDrawer(false);
						}}
						visible={GamesDrawer}
					>
						<div className="rmc-picker-popup-content game-drawer-content-background">
							<div className="rmc-picker-popup-body">
								<div>
									<div className="rmc-picker-popup-header">
										<div
											className="rmc-picker-popup-item rmc-picker-popup-header-left"
											onClick={() => {
												this.setState({isFilterEditing:false})
												this.GamesDrawer(false);
											}}
										>
											<b>Đóng</b>
										</div>
										<div className="rmc-picker-popup-item rmc-picker-popup-title">Lọc</div>
										<div
											className="rmc-picker-popup-item rmc-picker-popup-header-right"
											onClick={async () => {
												//关闭抽屉
												this.GamesDrawer(false);
												//初始化数据
												//this.Init();
												//获取筛选出的游戏列表
												this.getGames(
													vendor,
													ProviderMenuActive,
													CategoriesMenuActive,
													FeatureMenuActive
												);
												//获得点击过的类型
												this.state.ProviderMenuItem && await this.PlayHistory(this.state.ProviderMenuItem);
												this.state.CategoriesMenuItem && await this.PlayHistory(this.state.CategoriesMenuItem);
												this.state.FeatureMenuItem && await this.PlayHistory(this.state.FeatureMenuItem);
												this.state.LineMenuItem && await this.PlayHistory(this.state.LineMenuItem);
												if (Historyitem && Historyitem.name!=="All") {
													if (gameLobbyPiwik[vendor]){
														Pushgtagdata(`${gameLobbyPiwik[vendor].eventCat}_Lobby`, 'Filter Game', `${gameLobbyPiwik[vendor].eventName}_C_Filter`,
														[{
															customVariableKey: `${gameLobbyPiwik[vendor].eventName}_C_FilterType`,
															customVariableValue: Historyitem.type 
														}]);
													}
												}
											}}
										>
											<b>Chọn</b>
										</div>
									</div>
									{/* 平台类型 */}
									<div className="game-calendar-wrap">
										{this.props.router.query.vendor != 'Slot' &&
										provider != 'VTG' && (
											<DrawerCategories
												TypeName="Nhà Cung Cấp"
												GamesList={GamesList}
												ProviderMenuActive={ProviderMenuActive}
												isFilterEditing={isFilterEditing}
												onFilterEditing={()=>{this.setState({isFilterEditing:true})}}
												filteringItem={Playdata.find(tag=>(tag.menu==="provider" && tag.name==="All") || tag.menu==="provider")}
												setProviderMenuActive={(type, setitem) => {
													this.setState({
														ProviderMenuActive: type,
														Historyitem: setitem,
														ProviderMenuItem:setitem
													});
												}}
											/>
										)}
										{/* 平台类型 */}
										{this.props.router.query.vendor == 'Slot' && (
											<DrawerCategories
												Type="Slot"
												TypeName="Nhà Cung Cấp"
												GamesList={GamesList}
												ProviderMenuActive={ProviderMenuActive}
												isFilterEditing={isFilterEditing}
												onFilterEditing={()=>{this.setState({isFilterEditing:true})}}
												filteringItem={Playdata.find(tag=>(tag.menu==="provider" && tag.name==="All") || tag.menu==="provider")}
												setProviderMenuActive={(type, setitem) => {
													console.log('选择的平台类型----------->', setitem);
													this.setState({
														ProviderMenuActive: type,
														Historyitem: setitem,
														ProviderMenuItem:setitem
													});
												}}
											/>
										)}
										{/* 游戏类型 */}
										{GamesList.CategoriesList &&
										GamesList.CategoriesList.length != 0 && (
											<DrawerFilter
												TypeName={"Loại Hình Trò Chơi"}
												GamesList={GamesList}
												Type={provider === "VTG" ? "Feature" : "Category"} //因點擊 V2 體育回傳的 categoryType 是 Feature
												CategoriesMenuActive={CategoriesMenuActive}
												isFilterEditing={isFilterEditing}
												onFilterEditing={()=>{this.setState({isFilterEditing:true})}}
												filteringItem={Playdata.find(tag=>(tag.menu==="Category" && tag.name==="All") || tag.menu==="Category")}
												setCategoriesMenuActive={(type, setitem) => {
													this.setState({
														CategoriesMenuActive: type,
														Historyitem: setitem,
														CategoriesMenuItem:setitem
													});
												}}
												gameType={this.props.router.query.vendor}
											/>
										)}
										{/* 游戏特色 */}
										{this.props.router.query.vendor == 'Slot' && (
											<React.Fragment>
												<DrawerFilter
													TypeName="Tính năng trò chơi"
													GamesList={GamesList}
													Type={'Feature'}
													CategoriesMenuActive={FeatureMenuActive}
													isFilterEditing={isFilterEditing}
													onFilterEditing={()=>{this.setState({isFilterEditing:true})}}
													filteringItem={Playdata.find(tag=>(tag.menu==="Feature" && tag.name==="All") || tag.menu==="Feature")}
													setCategoriesMenuActive={(type, setitem) => {
														this.setState({
															FeatureMenuActive: type,
															Historyitem: setitem,
															FeatureMenuItem:setitem
														});
													}}
												/>
												<DrawerFilter
													TypeName="Số hàng"
													GamesList={GamesList}
													Type={'Line'}
													CategoriesMenuActive={LineMenuActive}
													isFilterEditing={isFilterEditing}
													onFilterEditing={()=>{this.setState({isFilterEditing:true})}}
													filteringItem={Playdata.find(tag=>(tag.menu==="Line" && tag.name==="All") || tag.menu==="Line")}
													setCategoriesMenuActive={(type, setitem) => {
														this.setState({
															LineMenuActive: type,
															Historyitem: setitem,
															LineMenuItem:setitem
														});
													}}
												/>
											</React.Fragment>
										)}
									</div>
								</div>
							</div>
						</div>
					</Drawer> }
					{this.state.CheckAnnouncement &&
					this.state.gameTag &&
					(this.state.gameTag == 'LiveCasino' || this.state.gameTag == 'Slot') && (
						<Announcement optionType={this.state.gameTag} ProductPage={'ProductPage'} />
					)}
				</Fragment>
			</Layout>
		);
	}

	/**
	 * @description: 打开游戏筛选底部抽屉
	 * @param {*} status 开启状态
	 * @return {*}
  	*/
	GamesDrawer(status) {
		this.setState({
			GamesDrawer: status
		});
	}

	/**
	 * @description: 返回页面
	 * @param {*}
	 * @return {*}
  	*/
	handleBackEvent() {
		history.length ? history.go(-1) : Router.push('/');
	}

	/**
	 * @description: 时间处理
	 * @param {*} date
	 * @return {*}
	*/
	splitDate = (date) => {
		return date ? date.split('T')[0] : '';
	};
}

const mapStateToProps = (state) => ({
	GamesList: state.GamesList
});

const mapDispatchToProps = {
	gamesInfo_getList: (GameType) => ACTION_GamesInfo_getList(GameType),
	gamesInfo_getProvidersList: (GameType, isShowFishingGames) =>
		ACTION_GamesInfo_getProvidersList(GameType, isShowFishingGames),
	gamesInfo_getCategoriesList: (GameType) => ACTION_GamesInfo_getCategoriesList(GameType)
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Details));

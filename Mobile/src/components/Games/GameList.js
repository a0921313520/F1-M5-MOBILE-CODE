import React, { Component, Fragment } from 'react';
import ReactDOM from "react-dom";
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
import ReactIMG from '@/components/View/ReactIMG';
import Announcement from '@/components/Announcement/';
import Layout from '@/components/Layout';
import HostConfig from '@/server/Host.config';
import { gamePage } from '../../../src/lib/data/DataList';
import classNames from "classnames";

class GameList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			//游戏筛选抽屉打开状态
			GamesDrawer: false,
			//排序数据
			FilterOptions: [
				{ label: 'Mặc định', id: 0 },
				{ label: 'Mới Nhất', id: 1 },
				{ label: 'Đề Xuất', id: 2 },
				{ label: 'A-Z', id: 3 }
			],
			//打开排序下列菜单
			isOpen: false,
			//打开搜索按钮
			isOpenSearch: false,
			//搜索的关键词
			searchVal: '',
			// 所有遊戲列表(已filtered)
			FullGameList: [],
			//当前展示的游戏列表 (會受搜尋影響)
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
			filteredTags: [],
			//游戏赔付线类型
			LineMenuActive: '',
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
			isFilterEditing: false,
			//排序種類
			gameSortingType: "Default",
		};
	}

	componentDidMount() {
		const { provider, vendor, category, GamesList } = this.props;
		const { ProvidersList, CategoriesList } = GamesList
		const isSameGameType = ProvidersList?.some(item => item.providerCode === provider) || CategoriesList?.some(item => item.category === category)
		// const vendorItem = gamePage.find(item => item.productCode === vendor)
		// global.Pushgtagpiwikurl && global.Pushgtagpiwikurl(`${vendorItem.piwikName.toLocaleLowerCase()}_lobby`, `${vendorItem.piwikName} Lobby`);
		let sorting = getUrlVars()['sorting'];
		const feature = getUrlVars()['feature'];
		//isShowFishingGames = true 筛选过滤平台类型抽屉菜单 【捕鱼游戏】就会变成YBF【醉心捕鱼】
		let isShowFishingGames = vendor == 'Slot' ? true : false;
		let vendorType = vendor == 'Lottery' ? 'KenoLottery' : vendor;
		if (isSameGameType) {
			this.getFilteredTag()
		} else {
			const promiseProvider = this.props.gamesInfo_getProvidersList(vendorType, isShowFishingGames)
			const promiseCategory = this.props.gamesInfo_getCategoriesList(vendorType)
			Promise.allSettled([promiseProvider, promiseCategory]).then(() => { this.getFilteredTag() })
		}
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
			}, () => {
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
			CategoriesMenuActive: category || '',
			ProviderMenuActive: provider || '',
			CheckAnnouncement: CheckAnnouncement
		});
	}

	getFilteredTag() {
		const { GamesList, provider, category } = this.props
		let providerTagItem;
		let categoryTagItem;
		console.log("get Tag", provider, category, GamesList)
		if (provider === "VTG" && !category) { return }
		if (GamesList && GamesList.ProvidersList
			&& (provider || category)) {
			const providerItem = GamesList?.ProvidersList?.find((Item) => Item.providerCode == provider);
			const categoryItem = GamesList?.CategoriesList?.find(item => item.category === category)
			if (providerItem) {
				providerTagItem = {
					menu: 'provider',
					name: providerItem.providerName,
					type: providerItem.providerCode
				};
			}
			if (categoryItem) {
				categoryTagItem = {
					menu: categoryItem.categoryType,
					name: categoryItem.name,
					type: categoryItem.category
				};

			}
			this.setState({
				filteredTags: [providerTagItem, categoryTagItem].filter(item => item)
			});
		}
	}


	Init(clearAllFilter) { //需檢查for product strapi migration (All function)
		const { vendor, provider, category } = this.props;
		if (clearAllFilter) {
			this.filterGameList()
		} else {
			this.getGames(vendor, provider, category);
		}
		this.setState({
			gameTag: vendor
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

	getGames(gameType, provider, category, feature, lineData) {  //需檢查for product strapi migration ALl function
		this.AddFilterTag()
		this.setState({ Loading: true })
		let { gameSortingType } = this.state
		let gameListParams = {
			gameType: gameType,
			gameSortingType,
			category: gameSortingType === "Default" ? category || feature : "",
		}
		GetGamesList(gameListParams, (data) => {
			if (data) {
				if (data.isSuccess) {
					this.setState({
						FullGameList: data.result.gameDetails
					}, () => {
						this.filterGameList(provider, category, feature, lineData, false)
					});
				}
				this.setState({
					Loading: false
				});
			}
			Toast.destroy();
		});
	}

	filterGameList = (provider, category, feature, line, addTag = true) => {
		const { FullGameList, searchValue } = this.state;
		const filtedResult = FullGameList.filter(item =>
			(provider ? item.provider === provider : true) &&
			(category ? item.categories.some(cat => cat.categoryName === category) : true) &&
			(feature ? item.categories.some(cat => cat.categoryName === feature) : true) &&
			(line ? item.categories.some(cat => cat.categoryName === line) : true)
		)
		this.setState({ GameList: filtedResult },
			() => { this.searchGames(searchValue) })
		addTag && this.AddFilterTag()
	}

	/**
	 * @description: 游戏排序
	 * @param {*}
	 * @return {*}
	*/
	orderList() {
		const { GameList, orderId, ProviderMenuActive, CategoriesMenuActive } = this.state;
		const { vendor } = this.props;
		let gameSortingType = "Default";

		if (orderId == 1) {
			//推荐
			gameSortingType = "IsNew"
		} else if (orderId == 2) {
			//最新
			gameSortingType = "Recommended"
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
		const SearchListData = GameList.filter(filterByID) || [];
		this.setState({
			GameList: SearchListData
		});
		Pushgtagdata(`Game Nav`, 'Click', `Search_${value}`);
	}

	/**
	 * @description: 新增篩選Tag於上方
	 * @return {*}
		*/
	AddFilterTag() {
		const { ProviderMenuItem, CategoriesMenuItem, FeatureMenuItem, LineMenuItem } = this.state;
		const selectedFilter = [ProviderMenuItem, CategoriesMenuItem, FeatureMenuItem, LineMenuItem].filter(type => type);
		selectedFilter.forEach(type => {
			if (this.state.filteredTags.find((item) => item.menu == type.menu)) {
				this.state.filteredTags.forEach((element, key) => {
					if (element.menu == type.menu) {
						if (type.name === "All") {
							if (!this.state.filteredTags.includes(tag => tag.menu === type.menu)) {
								this.setState(prevState => {
									return {
										...prevState,
										filteredTags: prevState.filteredTags.filter(tag => tag.menu !== type.menu)
									}
								})
								return
							}
						} else {
							this.state.filteredTags[key] = type;
						}
					}
				});
			} else {
				if (type.name === "All") {
					return
				}
				this.setState(prevState => { return { ...prevState, filteredTags: [...prevState.filteredTags, type] } })
			}

		})
	}

	RemoveFilteredTag(item) {
		console.log('当前选择的类型-------------->', item);
		const { gameSortingType } = this.state;
		const { vendor } = this.props;
		if (item) {
			let filteredTags = this.state.filteredTags.filter((v) => v.type != item.type);
			this.setState(
				{
					filteredTags: filteredTags,
					ProviderMenuActive: item.menu == 'provider' ? '' : this.state.ProviderMenuActive,
					CategoriesMenuActive: item.menu == 'Category' ? '' : this.state.CategoriesMenuActive,
					FeatureMenuActive: item.menu == 'Feature' ? '' : this.state.FeatureMenuActive,
					LineMenuActive: item.menu == 'Line' ? '' : this.state.LineMenuActive,
					ProviderMenuItem: item.menu == 'provider' ? null : this.state.ProviderMenuItem,
					CategoriesMenuItem: item.menu == 'Category' ? null : this.state.CategoriesMenuItem,
					FeatureMenuItem: item.menu == 'Feature' ? null : this.state.FeatureMenuItem,
					LineMenuItem: item.menu == 'Line' ? null : this.state.LineMenuItem,
				},
				() => {
					if (filteredTags.length == 0 && item.menu !== "Category" && item.menu !== "Feature") {
						this.Init(true);
					} else {
						let providerData = this.state.filteredTags.find((v) => v.menu == 'provider');
						let CategoryData =
							item.menu == 'Category' ? '' : this.state.filteredTags.find((v) => v.menu == 'Category');
						let featureData =
							item.menu === "Feature" ? '' : this.state.filteredTags.find((v) => v.menu === "Feature")

						let lineData =
							item.menu === "Line" ? '' : this.state.filteredTags.find((v) => v.menu === "Line")
						if (gameSortingType === "Default" && (((!filteredTags.find(item => item.menu === "Category")) && item.menu === "Feature") || (item.menu === "Category"))) {
							this.getGames(
								vendor,
								providerData?.type || "",
								CategoryData?.type || "",
								featureData?.type || "",
								lineData?.type || "")
							return
						} else {
							this.filterGameList(
								providerData?.type || '',
								CategoryData?.type || '',
								featureData?.type || "",
								lineData?.type || "",
							);
							return
						}
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
			//所有遊戲列表
			FullGameList,
			//篩選後游戏列表
			GameList,
			//游戏所属类型
			CategoriesMenuActive,
			//游戏所属平台
			ProviderMenuActive,
			//排序id
			orderId,
			//最近玩过的游戏类型
			filteredTags,
			//最近玩过的游戏数据
			Historyitem,
			//游戏赔付线
			LineMenuActive,
			//游戏特色类型
			FeatureMenuActive,
			//加载状态
			Loading,
			isFilterEditing,
			gameSortingType,
		} = this.state;
		const { vendor, provider, GamesList } = this.props;
		const vendorItem = gamePage.find(item => item.productCode === vendor)
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
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
												Pushgtagdata(`${vendorItem.piwikName}_Lobby`, 'Search Game', `Search_Lobby_C_Search`);
											}}
										/>
										<ReactSVG
											className="icon-set"
											src={`/img/P5/svg/filter.svg`}
											onClick={() => {
												this.GamesDrawer(true);
												//需檢查for product strapi migration
												Pushgtagdata(`${vendorItem.piwikName}_Lobby`, 'Filter Game', `Search_Lobby_C_Filter`);
											}}
										/>
										{/* 筛选抽屉 */}
										{provider != 'VTG' && (
											<ReactSVG
												className="icon-set"
												src={`/img/P5/svg/menu.svg`}
												onClick={() => {
													this.setState({
														isOpen: !isOpen
													});
													Pushgtagdata(`Game Nav`, 'Click', `Sorting_${vendor}`);
												}}
											/>
										)}

										{/* 排序过滤下拉菜单 */}
										{isOpen && (
											<>
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
																	Pushgtagdata(
																		`Game Nav`,
																		'Click',
																		`Sorting_${gameType}_${provider}`
																	);
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
												{ReactDOM.createPortal(
													<div
														className='gameFilter_Mask'
														onClick={() => {
															this.setState({
																isOpen: false
															})
														}}
													/>,
													document.body
												)}
											</>
										)}
									</div>
								)}
							</div>
						</div>
						{(isOpenSearch || !!filteredTags.length) && provider !== "SPR" && (
							<div className="subHeader">
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
											onChange={(e) => {
												this.setState({ searchValue: e.target.value });
											}}
											isClear={true}
											maxLength={50}
											onClear={() => {
												this.setState({
													searchValue: ""
												}, () => {
													this.filterGameList(ProviderMenuActive, CategoriesMenuActive, FeatureMenuActive, LineMenuActive)
												})
											}}
										/>
									</div>
								)}
							</div>
						)}

						{/* {!!filteredTags.length && ( */}
							<Flexbox className="Playdata" justifyContent="space-around" key={filteredTags.toString()}>
								{filteredTags.map((item, index) => {
									if (provider == 'SPR') {
										return;
									}
									return (
										<Flexbox key={index + 'list'} className="list">
											<span>{item.type === "IsRecommendedGames" ? "推荐游戏" : item.name}</span>
											<ReactSVG
												className="back-icon"
												src="/img/P5/svg/close.svg"
												onClick={() => {
													this.RemoveFilteredTag(item);
													Pushgtagdata(`Game Nav`, 'Click', `Filter_${vendor}`);
												}}
											/>
										</Flexbox>
									);
								})}
							</Flexbox>
						{/* )} */}
						<div
							className={classNames({
								PullloadGames: true,
								GameBox: true,
								withSearch: isOpenSearch && !filteredTags.length,
								withFilterTag: !isOpenSearch && !!filteredTags.length && provider !== "SPR",
								withSearchAndFilterTag: isOpenSearch && !!filteredTags.length
							})
							}>
							{/* 游戏列表 */}
							{
								Loading ? (
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
								) :
									GameList.length ? (
										<PullloadGames
											data={
												//stg和sl 不过滤isLive
												HostConfig.Config.isGameLive ? (
													GameList.filter((item) => item.isLive == true)
												) : (
													GameList
												)
											}
											vendor={vendor}
											provider={provider}
											key={
												orderId?.toString() +
												JSON.stringify(GameList) +
												CategoriesMenuActive?.toString() +
												ProviderMenuActive?.toString()
											}
										/>
									) : (
										/* 没有数据 */
										<Flexbox className="Null-Box">
											<ReactSVG src="/img/P5/icon/null.svg" />
											<p style={{ textAlign: 'center' }}>không có kết quả nào <br />được tìm thấy</p>
										</Flexbox>
									)}
						</div>
					</div>

					{/* 游戏筛选抽屉 */}
					{typeof window !== "undefined" &&
						<Drawer
							style={{ maxHeight: `${window.innerHeight*0.85}px`,height:"auto" }}
							className="drawer drawer_gameFilter"
							direction="bottom"
							visible={GamesDrawer}
							onClose={() => {
								this.setState({ isFilterEditing: false })
								this.GamesDrawer(false);
							}}
						>
							<div className="rmc-picker-popup-content game-drawer-content-background">
								<div className="rmc-picker-popup-body">
									<div>
										<div className="rmc-picker-popup-header">
											<div
												className="rmc-picker-popup-item rmc-picker-popup-header-left left"
												onClick={() => {
													this.setState({ isFilterEditing: false })
													this.GamesDrawer(false);
												}}
											>
												<b>Đóng</b>
											</div>
											<div
												className="rmc-picker-popup-item rmc-picker-popup-title title"
											>
												Lọc
											</div>
											<div
												className="rmc-picker-popup-item rmc-picker-popup-header-right right"
												onClick={async () => {
													//关闭抽屉
													this.GamesDrawer(false);
													//获取筛选出的游戏列表
													//需檢查for product strapi migration
													//获得点击过的类型
													if (gameSortingType === "Default" && (CategoriesMenuActive ? filteredTags.find(item => item.menu === "Category")?.type !== CategoriesMenuActive : FeatureMenuActive && filteredTags.find(item => item.menu === "Feature")?.type !== FeatureMenuActive)) {
														this.getGames(vendor, ProviderMenuActive, CategoriesMenuActive, FeatureMenuActive, LineMenuActive)
														return
													}
													this.filterGameList(ProviderMenuActive, CategoriesMenuActive, FeatureMenuActive, LineMenuActive)

													if (Historyitem && Historyitem.name !== "All") {
														Pushgtagdata(
															`Game Nav`,
															'Click',
															`Filter_${JSON.stringify(Historyitem)}`
														);
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
												filteringItem={filteredTags.find(tag=>(tag.menu==="provider" && tag.name==="All") || tag.menu==="provider")}
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
												filteringItem={filteredTags.find(tag=>(tag.menu==="provider" && tag.name==="All") || tag.menu==="provider")}
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
												filteringItem={filteredTags.find(tag=>(tag.menu==="Category" && tag.name==="All") || tag.menu==="Category")}
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
													filteringItem={filteredTags.find(tag=>(tag.menu==="Feature" && tag.name==="All") || tag.menu==="Feature")}
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
													filteringItem={filteredTags.find(tag=>(tag.menu==="Line" && tag.name==="All") || tag.menu==="Line")}
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
						</Drawer>}
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GameList));

/*
 * @Author: Alan
 * @Date: 2022-02-08 17:48:31
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-20 13:18:24
 * @Description: 游戏繁杂模板组件 搜索 多类型 游戏
 * @FilePath: \Mobile\src\components\Games\PublicViewSecond.js
 */
import React, { Component } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { GetGamesList } from '@/api/game';
import Flexbox from '@/components/View/Flexbox/';
import Countdown from './Countdown';
import Router from 'next/router';
import LaunchGameImg from './LaunchGame';
// import { ACTION_GamesInfo_getList } from '@/lib/redux/actions/GamesInfoAction';
// import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import Tag from '@/components/Games/Tag';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { GamesGtag } from '@/lib/data/DataList';
import classNames from 'classnames';
class PublicViewSecond extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			RecommendedList: [], //推荐游戏
			JackpotList: [], //彩池游戏
			PlayData: [] //最近玩过的种类
		};
	}

	componentDidMount() {
		// global.Pushgtagpiwikurl && global.Pushgtagpiwikurl(`Games/${this.props.GameType}/?gameCatId=${this.props.router.query.gameCatId}`);
		this.int();
	}

	/**
	 * @description: 初始化相关的游戏数据
	 * @return {*}
  	*/
	int() {
		let Recommended = JSON.parse(localStorage.getItem(`${this.props.GameType}-RecommendedList`));
		let Jackp = JSON.parse(localStorage.getItem(`${this.props.GameType}-JackpotList`));
		if (Recommended) {
			this.setState({
				RecommendedList: Recommended
			});
		}
		if (Jackp) {
			this.setState({
				JackpotList: Jackp
			});
		}
		[
			{
				gameType: this.props.GameType, //厂商
				gameSortingType: 'Default', //推荐游戏  Recommended, 新 IsNew, 排序 AToZ,
				category: "IsRecommendedGames"
			},
			{
				gameType: this.props.GameType, //厂商
				gameSortingType: 'Default', //推荐游戏  Recommended, 新 IsNew, 排序 AToZ, Default (預設值)
				category: "Jackpot",
			}
		].map((Params, key) => {
			this.gameSorting(Params, key);
		});
	}
	/**
	 * @description: 获取指定类型的游戏 （推荐游戏和奖池游戏）
	 * @param {*} Params 参数
	 * @param {*} type 当前的类型
	 * @return {*}
	*/
	gameSorting(Params, type) {
		GetGamesList(Params, (data) => {
			if (data) {
				if (data.isSuccess) {
					if (type == 0) {
						data.result.gameDetails = data.result.gameDetails.filter(item => {
							return item.categories.some(cate => cate.categoryName === "IsRecommendedGames");
						  });
						this.setState({
							RecommendedList: data.result.gameDetails.slice(0,15)
						});
						localStorage.setItem(
							`${this.props.GameType}-RecommendedList`,
							JSON.stringify(data.result.gameDetails.slice(0,15))
						);
					} else {
						data.result.gameDetails = data.result.gameDetails.filter(item => {
							return item.categories.some(cate => cate.categoryName === "Jackpot");
						  });
						this.setState({
							JackpotList: data.result.gameDetails.slice(0,15)
						});
						localStorage.setItem(
							`${this.props.GameType}-JackpotList`,
							JSON.stringify(data.result.gameDetails.slice(0,15))
						);
					}
				}
			}
		});
	}

	/** 
	 * @description: 筛选出对应类型的游戏
	 * @param {*} type 过滤关键词
	 * @return {Array}
	 */
	filterResult(type) {
		let filterResult = [];
		console.log(this.props.GameList.gameDetails);
		this.props.GameList.gameDetails.filter((item) =>
			item.categories.filter((surItem) => {
				if (surItem.categoryName && surItem.categoryName.indexOf(type) != -1) filterResult.push(item);
			})
		);
		return filterResult;
	}

	/**
	 * @description: 进入游戏详情页面
	 * @param {*} provider 游戏平台
	 * @param {*} categories 游戏类型
	 * @return {*}
  	*/

	ToDetailsPage(provider, categories, sorting) {
		let data = sessionStorage.getItem(`PlayHistory-${this.props.GameType}`) || '[]';
		let type = provider == '' ? categories.category : provider.providerCode;
		if (!JSON.parse(data).find((v) => v.type == type)) {
			let typedata =
				provider == ''
					? { name: categories.name, type: categories.category, menu: 'categories' }
					: { name: provider.providerName, type: provider.providerCode, menu: 'provider' };
			sessionStorage.setItem(
				`PlayHistory-${this.props.GameType}`,
				JSON.stringify([ typedata, ...JSON.parse(data) ])
			);
		}
		Router.push(
			`/Games/Details?vendor=${this.props.GameType}&provider=${provider.providerCode ||
				provider}&categories=${categories.category || categories}&sorting=${sorting || ""}`
		);
	}

	render() {
		const {
			//CMS banner
			gameTypeDetail,
			//游戏列表
			GameList,
			//厂商
			GameType,
			//平台列表
			ProvidersList,
			//游戏类型
			CategoriesList,
			//平台图片
			ProvidersListImg
		} = this.props;
		const { RecommendedList, JackpotList } = this.state;
		let heightImg = GameType == 'P2P' ? '120px' : '106px';
		return (
			<div className="Container">
				<div
					className="GameHeader"
					onClick={() => {
						// Pushgtagdata(`Promo Nav`, 'View', `0_${GameType}_ProductPage`);
					}}
				>
					<LazyLoadImage
						src={`${process.env.BASE_PATH}/img/P5/GameBanner/${GameType}.jpg`}
						alt={gameTypeDetail.name}
						effect="blur"
						width="100%"
						height="auto"
						onError={({ currentTarget }) => {
							currentTarget.onerror = null; // prevents looping
							currentTarget.src = `${process.env.BASE_PATH + '/img/svg/method-4.svg'}`;
						}}
					/>
				</div>
				<div className="GameBox">
					{/* 推荐游戏 */}
					{RecommendedList &&
					RecommendedList.length != 0 && (
						<React.Fragment>
							<div className="Title">
								<h3>Sản Phẩm Đề Xuất</h3>
								<small
									onClick={() => {
										this.ToDetailsPage('', '', "Recommended");
									}}
								>
									Xem tất cả
								</small>
							</div>
							<div className="HotGames">
								<Swiper slidesPerView={'auto'} onSlideChange={() => {}} onSwiper={(swiper) => {}}>
									{RecommendedList.length !== 0 &&
										RecommendedList.map((item, index) => {
											return (
												<SwiperSlide key={index}>
													<div className="list">
														<Tag provider={item.provider} />
														<LaunchGameImg
															item={item}
															height={heightImg}
															GameType={GameType}
														/>
														<label>{item.gameName}</label>
													</div>
												</SwiperSlide>
											);
										})}
								</Swiper>
							</div>
						</React.Fragment>
					)}

					{GameType == 'Slot' && (
						<React.Fragment>
							{/* 彩池游戏 */}
							<div className="Title" key={GameType}>
								<h3>Jackpot</h3>
								{/* <small
									onClick={() => {
										Router.push(
											`/Games/Details?vendor=${this.props.GameType}&feature=Jackpot`
										);
									}}
								>
									查看更多
								</small> */}
							</div>
							<div className="JackpotGames">
								<Swiper slidesPerView={'auto'} onSlideChange={() => {}} onSwiper={(swiper) => {}}>
									{JackpotList.length !== 0 &&
										JackpotList.map((item, index) => {
											return (
												<SwiperSlide key={index}>
													<Flexbox className="list">
														<Flexbox className="Game-img" flex="0 0 31%">
															<LaunchGameImg item={item} GameType={GameType} />
														</Flexbox>
														<Flexbox
															className="Game-info"
															flexWrap="wrap"
															alignItems="center"
														>
															<Countdown />
															<Flexbox alignItems="center">
																<Tag provider={item.provider} position={'relative'} />
																<span>{item.gameName}</span>
															</Flexbox>
														</Flexbox>
													</Flexbox>
												</SwiperSlide>
											);
										})}
								</Swiper>
							</div>
						</React.Fragment>
					)}

					{/* 平台 */}
					<div className="Title">
						<h3>Sản Phẩm</h3>
					</div>

					<div className="GamePlatform">
						{ProvidersList &&
							ProvidersList.map((item, index) => {
								return (
									<div
										className={classNames({
											list: true,
											NEW: item.isNew, //新游戏
											HOT: item.isHot, //熱門游戏
										})}
										key={index}
										onClick={() => {
											this.ToDetailsPage(item, '');
											// Pushgtagdata(
											// 	`Game Nav`,
											// 	'View',
											// 	`${GamesGtag[item.providerCode]}_${'ProductPage'}`
											// );
											// Pushgtagdata(
											// 	`Game Nav`,
											// 	'Click',
											// 	`${GamesGtag[item.providerCode]}_${'ProductPage'}`
											// );
										}}
									>
										<LazyLoadImage
											src={item.image || '/img/svg/method-4.svg'}
											alt={item.providerName}
											effect="blur"
											width="100%"
											height="auto"
											onError={({ currentTarget }) => {
												currentTarget.onerror = null;
												currentTarget.src = `${process.env.BASE_PATH + '/img/svg/method-4.svg'}`;
											}}
										/>
										<p className="Name">{item.providerName}</p>
									</div>
								);
							})}
					</div>
					{/* 游戏类型 */}
					{CategoriesList &&
					CategoriesList.length != 0 && (
						<React.Fragment>
							<div className="Title">
								<h3>{GameType == 'LiveCasino'? 'Thể Loại Trò Chơi' : 'Loại Hình Trò Chơi'} </h3>
							</div>
							<div className="GameType">
								{CategoriesList.map((item, index) => {
									if (item.categoryType == 'Category') {
										return (
											<Flexbox
												className="list"
												key={index}
												alignItems="center"
												justifyContent="space-between"
												onClick={() => {
													this.ToDetailsPage('', item);
													// Pushgtagdata(
													// 	`Game Nav`,
													// 	'View',
													// 	`${item.name}_${GameType}_ProductPage`
													// );
												}}
											>
												<LazyLoadImage
													src={item.iconNormal || '/img/svg/method-4.svg'}
													effect="blur"
													alt={item.name}
													onError={({ currentTarget }) => {
														currentTarget.onerror = null;
														currentTarget.src = `${process.env.BASE_PATH +
															'/img/svg/method-4.svg'}`;
													}}
												/>
												<span className="name">{item.name}</span>
											</Flexbox>
										);
									}
								})}
							</div>
						</React.Fragment>
					)}
				</div>
			</div>
		);
	}
}

// const mapStateToProps = (state) => ({
// 	GamesList: state.GamesList
// });

// const mapDispatchToProps = {
// 	gamesInfo_getList: (GamesVendorType, GamesSortingFilterType, GamesCategoryType) =>
// 		ACTION_GamesInfo_getList(GamesVendorType, GamesSortingFilterType, GamesCategoryType)
// };

export default withRouter(PublicViewSecond);

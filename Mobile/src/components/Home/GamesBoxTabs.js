/*
 * @Author: Alan
 * @Date: 2022-01-25 20:48:48
 * @LastEditors: Alan
 * @LastEditTime: 2022-11-29 11:43:00
 * @Description: 首页-游戏区域
 * @FilePath: \Mobile\src\components\Home\GamesBoxTabs.js
 */
import React, { Component } from 'react';
import { Tab, Tabs, TabList, Panel, PanelList, AsyncPanel } from 'react-swipeable-tab';
import { GamesProviders, GetHomeGames, GamesMaintenanceStatus, GetWalletProviderMapping } from '@/api/game';
import Skeleton from 'react-loading-skeleton';
import Router from 'next/router';
import LaunchGameImg from '@/components/Games/LaunchGame';
import classNames from 'classnames';
import { ACTION_GameDetailsDescAndBanner } from '@/lib/redux/actions/GamesInfoAction';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import { ReactSVG } from '@/components/View/ReactSVG';
import ReactIMG from '@/components/View/ReactIMG';
import { homeGamePiwik, gamePage } from '@/lib/data/DataList';
// import SportsTwo from '@/components/Games/SportsTwo';

class TabsMain extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tab2_activeIndex: 0,
			GameCategory: [],
			ProvidersSequence: [], //ProvidersList
			bannerFlag: false,
			tabStatus:{isCommingSoon:[],isHot:[],isNew:[]}
		};
	}

	componentDidMount() {
		/* @description: 获取游戏列表和游戏图片展示和启动游戏 （不包含游戏的名称和游戏的介绍 将使用CMS API 组装） */
		this.GetProvidersSequence();
		/* @description: CMS API 仅仅获取游戏简介和介绍  */
		this.props.GameDetailsDesc();
		//this.GameTypesList();
		this.bannerSet();
		this.getSPRMaintenanceStatus();
		this.GetGameWalletMapping();
	}

	componentDidUpdate(nextProps) {
		if (this.props.GamesList !== nextProps.GamesList) {
			this.onTab2_ink_Change(sessionStorage.getItem('HomeTabKey')||0)
			this.GameTypesList();
		}
	}

	bannerSet() {
		setTimeout(() => {
			this.setState({
				bannerFlag: true
			});
		}, 2000);
	}

	GetGameWalletMapping(){
		GetWalletProviderMapping(res=>{
			if(res.isSuccess){
				sessionStorage.setItem('gameWalletMap', JSON.stringify(res.result));
			}
		})
	}

	/**
	 * 第1步
	 * @description: 一次获取所有的游戏厂商列表和游戏图片和启动游戏数据
	 * @Api /api/Games/Providers/Sequence
	 * @param {*}
	 * @return {*}
  	*/
	GetProvidersSequence() {
		let hasGetData;
		if (sessionStorage.getItem('ProvidersSequence')) {
			hasGetData = true;
			let ProvidersSequence = JSON.parse(sessionStorage.getItem('ProvidersSequence'));
			this.setState(
				{
					ProvidersSequence: ProvidersSequence
				},
				() => {
					let TabKey = sessionStorage.getItem('HomeTabKey');
					if (TabKey) {
						this.setState({
							tab2_activeIndex: Number(TabKey)
						});
					}
				}
			);
		}

		GetHomeGames((res) => {
			if (res.isSuccess) {
				sessionStorage.setItem('ProvidersSequence', JSON.stringify(res.result));
				this.setState({
					ProvidersSequence: res.result
				});
			}
		});
	}

	/**
	 * 第2步
	 * @description 获取首页滑动游戏列表左侧 了解更多的介绍文案 和 gameCatId
	 * @Api /zh-hans/api/v1/app/game-category
	 * @param {*}
	 * @return {*}
	*/
	GameTypesList = () => {
		let Details = this.props.GamesList.GameDetailsDescAndBanner.result;
		if (Details && Array.isArray(Details)) {
			this.setState({
				GameCategory: Details
			});
			let TabKey = sessionStorage.getItem('HomeTabKey');
			let Category = Details[TabKey || 0];
			//根据gameCatId 再去获取 厂商下面的游戏平台图片列表下面的的游戏文字介绍
			this.GameCategoryState(Category);
		}
	};

	/**
	 * 第3步
	 * @description: 获取游戏列表下面的标题和介绍 CMS
	 * @Api /zh-hans/api/v1/app/game/provider/123
	 * @return {*}
	 */
	GameCategoryState(Category) {
		if (!this.state[Category.code.toLowerCase() + 'List']) {
			GamesProviders((res) => {
				if (res && res.isSuccess) {
					let data = res.result.filter(item => item.code === Category.code);
					
						this.setState({
							[Category.code.toLowerCase() + 'List']: data[0].subProviders,
						});	
				}
			});
		}
	}

	/**
	 * @description: 切换游戏种类
	 * @param {*} index
	 * @return {*}
	 */
	onTab2_Change = (index) => {
		const {GameCategory} = this.state;
		this.setState({
			tab2_activeIndex: index
		});
		this.onTab2_ink_Change(index)
		console.log(GameCategory, 'GameCategory')
		if (GameCategory.length != 0) {
			let Category =
			GameCategory.find(
					(item) =>
						this.state.ProvidersSequence[index].code
							?.toLowerCase()
							.indexOf(item.code?.toLowerCase()) != '-1'
				) || {};
				// Pushgtagdata('Game Nav', 'Click', `${GamesGtag[Category.code] || Category.code}_Home`);
			let gameCode_eventAction = GameCategory[index].code
			let gameCode_eventName = GameCategory[index].code
			switch(gameCode_eventName){
				case "Sportsbook":
					gameCode_eventAction = 'Sports'
					gameCode_eventName = 'Sports'
					break;
				case "InstantGames":
					gameCode_eventAction = "Instant Game"
					gameCode_eventName = 'InstantGames'
					break;
				case "LiveCasino":
					gameCode_eventAction = "LD"
					gameCode_eventName = 'LiveDealer'
					break;	
				case "Slot":
					gameCode_eventAction = "SlotFishing"
					gameCode_eventName = 'SlotFishing'
					break;
				case "KenoLottery":
					gameCode_eventAction = "Lottery"
					gameCode_eventName = 'Lottery'
					break;	
			}
			Pushgtagdata('Home',`View ${gameCode_eventAction} Listing`,`Home_GameNav_C_${gameCode_eventName}`);
			this.GameCategoryState(Category);
		}
	};


		/**
	 * @description: 因Tab使用外部套件，其套件設定每個子Tab相同的寬度，然而依Mockup，應各子tab之間有相同gap，因此另外進行style設定。
		// 但導致ink的移動部分無法顯示在正確的位置上，且該套件無法額外設定ink移動相關的style
		// 為解決該問題，手動在這邊設置ink的移動參數
		// 針對tab字數2個字及以上條件式設定，10為ink的width
	 * @param {*} index 所選tab index
	 * @return {*}
  	*/
	onTab2_ink_Change = (index) =>{
		const labelEls = document.querySelectorAll(".game-title");
		const root = document.querySelector(":root");
		const targetLabelRec = labelEls[index]?.getBoundingClientRect();
		if(!targetLabelRec){
			root.style.setProperty("--current-game-label","10px")
			return
		}
		root.style.setProperty("--current-game-label", `${labelEls[index].textContent.length <= 2 ? targetLabelRec.x : targetLabelRec.x-10 + targetLabelRec.width/2.5}px`)
	}

	/**
	 * @description: 异步加载内容
	 * @param {*} Category 游戏厂商
	 * @param {*} prditems 游戏厂商内的列表
	 * @return {*}
  	*/
	loadingConetent = (Category, prditems) => {
		const content = (
			<div className="GameGroup">
				{/* {prditems.code == 'Sportsbook' && <SportsTwo Page={'Home'} />} */}
				{Category.subProviders?.map((subitem, index) => {
					let ProviderData =
						(this.state[Category.code?.toLowerCase() + `List`] &&
							this.state[Category.code?.toLowerCase() + `List`].find(
								(item) => item.code?.toLowerCase() === subitem.code?.toLowerCase()
							)) ||
						{};
					return (
						<div key={index} style={{display: subitem.code == 'SB2' ? 'none' : ''}}>
							<div
								className={classNames({
									List: true,
									HOT: subitem.isHot, //热门
									NEW: subitem.isNew, //新游戏
									Tournament: subitem.isTournament, //推荐
									Maintenance: subitem.isMaintenance //维护
								})}
								onClick={() => {
									sessionStorage.setItem('HomeTabKey', this.state.tab2_activeIndex);
									if(subitem.code=="YBS"){
										// Pushgtagdata(`Game`, 'Click', 'PM_HomePage');
										return
									}
									// Pushgtagdata(`Game Nav`, 'Click', `${subitem.code}_${GamesGtag[subitem.code] || subitem.code}_Home`);	
								}}
							>
								<LaunchGameImg
									item={subitem}
									Category={Category}
									isHome={true}
									width={'100%'}
									height={'100%'}
									bannerFlag={this.state.bannerFlag}
									gameCatCode={prditems.code}
									dataList={prditems}
									dataIndex={index}
									GameType={prditems.code}
								/>
								<h4>{subitem.name}</h4>
							</div>
							<div className="Summary" id={'test_' + subitem.code + index}>
								{(subitem && subitem.description) || ''}
							</div>
						</div>
					);
				})}
				{prditems && (
					<div className="List gameCatDesc">
						<h2
							style={{
								color: this.getColor(prditems && prditems.code)
							}}
						>
							{(prditems && prditems.name) || ''}
						</h2>
						<span className="Desc">
							<span>{(prditems && prditems.description) || ''}</span>
						</span>
						<div
							className="More"
							onClick={() => {
								if (homeGamePiwik[prditems.code]) {
									Pushgtagdata(`${homeGamePiwik[prditems.code].eventCat}`, `${homeGamePiwik[prditems.code].eventAction}`, `${homeGamePiwik[prditems.code].eventName}`);
								}
								sessionStorage.setItem('HomeTabKey', this.state.tab2_activeIndex);
								if (prditems.code == 'InstantGames') {
									Router.push(`/Games/arcade-games/SPR/`)
									return
								}
								Router.push(`/Games/${gamePage.find(item=>item.productCode === prditems.code).name}`)
								
							}}
						>
							Tìm hiểu thêm
						</div>
					</div>
				)}
			</div>
		);
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve(content);
			}, 50);
		});
	};

	providerSubtitle = (Category, prditems) => {
		prditems.subProviders.map((subitem, index) => {
			subitem.code = Category.code;
			let ProviderData =
				(this.state[prditems.code?.toLowerCase() + `List`] &&
					this.state[prditems.code?.toLowerCase() + `List`].find(
						(item) => item.providerCode?.toLowerCase().indexOf(subitem.code?.toLowerCase()) != '-1'
					)) ||
				{};
			let Subtitle = ProviderData && ProviderData.description;    //這邊要改為ProviderData.description
			let dom = document.getElementById('test_' + subitem.code + index);
			if (dom) {
				dom.innerText = Subtitle || '';
			}
		});
	};

	getSPRMaintenanceStatus() {
		const needTagTab = ["Sportsbook", "ESports", "InstantGames","LiveCasino", "Slot", "P2P", "KenoLottery"]
		needTagTab.forEach(code=>{
			GamesMaintenanceStatus(code,(res)=>{
				if(res.isSuccess){
					const {result} = res
					console.log("tabStatus res", res)
					if(result.isCommingSoon){
						this.setState(prev=>prev.tabStatus.isCommingSoon.push(code))
					}
					if(result.isHot){
						this.setState(prev=>prev.tabStatus.isHot.push(code))
					}
					if(result.isNew){
						this.setState(prev=>prev.tabStatus.isNew.push(code))
					}
				}
			})
		})

	}

	render() {
		const { tab2_activeIndex, GameCategory, ProvidersSequence, bannerFlag, tabStatus } = this.state;
		return (
			<React.Fragment>
				<div className="GameTabs">
					{ProvidersSequence.length !== 0 && (
						<Tabs
							activeIndex={tab2_activeIndex}
							onTabChange={this.onTab2_Change}
							page={7}
							activeTabColor="#00A6FF"
							inkColor="#00A6FF"
							swiperMove={false}
							panelIscroll={false}
						>
							<TabList className="TabList">
								{ProvidersSequence.map((item, index) => {
									return (
										<Tab key={index}>
											<label className="game-title">
												{item.name}
												{tabStatus.isCommingSoon.includes(item.code) 
													? <span className="gameCatComingSoon">敬请期待</span>
													: tabStatus.isNew.includes(item.code)
													? <ReactIMG
													className="gameCatNew2"
													src="/img/svg/NEW.svg"
													/> 
													:tabStatus.isHot.includes(item.code) 
													? <ReactIMG
													className="gameCatNew2"
													src="/img/svg/HOT.svg"
													/> 
													: ""}
												</label>
										</Tab>
									);
								})}
							</TabList>
							{/*  key={
								 	tab2_activeIndex + JSON.stringify(GameCategory) + JSON.stringify(ProvidersSequence)
								 } */}
							<PanelList className="PanelList">
								{ProvidersSequence.map((prditems, index) => {
									let Category =
										GameCategory.find(
											(item) =>
												prditems.code?.toLowerCase().indexOf(item.code?.toLowerCase()) !=
												'-1'
										) || {};
									return (
										<AsyncPanel
											key={index + JSON.stringify(GameCategory) + 'Panel'}
											loadContent={() => this.loadingConetent(Category, prditems)}
											render={(data) => (
												<div>
													{data}
													<div
														key={
															index +
															'Panel' +
															this.state[prditems.code?.toLowerCase() + `List`]
														}
													>
														{this.providerSubtitle(Category, prditems)}
													</div>
												</div>
											)}
											renderLoading={() => (
												<div className="GamesSkeleton">
													<Skeleton count={3} width="140px" height="180px" />
												</div>
											)}
										/>
									);
								})}
							</PanelList>
						</Tabs>
					)}

					{ProvidersSequence &&
					ProvidersSequence.length == 0 && (
						<div className="GamesSkeleton">
							<Skeleton count={3} width="140px" height="180px" />
						</div>
					)}
				</div>
			</React.Fragment>
		);
	}

	/**
	 * @description: 返回对应的颜色
	 * @param {string} value 游戏类型
	 * @return {string} 游戏颜色
	*/
	getColor = (value) => {
		let textColor = '#00a6ff';
		// switch (value) {
		// 	case 'P2P':
		// 		textColor = '#99683D';
		// 		break;
		// }
		return textColor;
	};
}

const mapStateToProps = (state) => ({
	//游戏列表
	GamesList: state.GamesList,
	ProvidersSequence: state.GamesList.GameDetailsDescAndBanner
});

const mapDispatchToProps = {
	GameDetailsDesc: () => ACTION_GameDetailsDescAndBanner()
	//GameDetailsPlatformCategory: (Categoryid) => ACTION_GameDetailsPlatformCategory(Categoryid)
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TabsMain));

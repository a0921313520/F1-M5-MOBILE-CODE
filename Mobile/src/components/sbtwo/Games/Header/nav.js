/*
	投注页面 导航菜单  所有游戏种类
*/
import React from 'react';
import { withBetterRouter } from '$SBTWOLIB/js/withBetterRouter';
import { ReactSVG } from '$SBTWO/ReactSVG';
import Bottomtime from '$SBTWO/Games/Footer/bottomtime';
import { connect } from 'react-redux';
import moment from 'moment';
import { VendorMarkets } from '$SBTWOLIB/vendor/data/VendorConsts';
import ReactIMG from '$SBTWO/ReactIMG';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import HostConfig from '@/server/Host.config';
const theDayAfterTenDays = moment().add(10, 'days').format('YYYY-MM-DD');
const theDaytoday = moment().format('YYYY-MM-DD');

class Bettingnav extends React.Component {
	constructor() {
		super();
		this.state = {
			isExpandAll: true, //默認全展開
			SportId: 1,
			MarketId: VendorMarkets.RUNNING, //默認選 滾球
			SortWay: 1 /*排序 1联赛 2时间 0不指定排序  */,
			Selectdate: theDayAfterTenDays,
			navBarFreeze: false,
			wcp2022Status:false
		};

		this.navRef = React.createRef();
	}

	componentDidMount() {
		this.props.NavRef && this.props.NavRef(this);

		const { query } = this.props.router; //從鏈接獲取要加載的參數

		if (!(JSON.stringify(query) === '{}' || !query)) {
			//有傳入參數
			const { SportId, MarketId, SortWay, Selectdate } = this.state;
			let cloneQuery = Object.assign({ SportId, MarketId, SortWay }, query);

			//處理一下數據格式，要用int型態
			cloneQuery.SportId = parseInt(cloneQuery.SportId);
			cloneQuery.MarketId = parseInt(cloneQuery.MarketId);
			cloneQuery.SortWay = parseInt(cloneQuery.SortWay);

			//特別處理日期，實際上只會選一天
			cloneQuery.Selectdate = query.EndDate ?? Selectdate;

			//從路由更新 下拉菜單 選中項目
			this.setState({
				SportId: cloneQuery.SportId,
				MarketId: cloneQuery.MarketId,
				SortWay: cloneQuery.SortWay,
				Selectdate: cloneQuery.Selectdate
			});

			//更新banner
			this.props.MenuChange(cloneQuery.SportId);
		}
		this.getwcp2022Status()
	}

	componentWillUnmount() {}

	clickSport = (sportData) => {
		const sportId = sportData.SportId;
		this.setState(
			{
				SportId: sportId
			},
			() => {
				this.ChangeGame();
				this.props.MenuChange(sportId); //banner刷新
			}
		);
	};
	clickMarket = (marketData) => {
		const marketId = marketData.MarketId;
		this.setState(
			{
				MarketId: marketId
			},
			() => {
				this.ChangeGame();
			}
		);
	};

	/* 选择游戏 */
	ChangeGame = (date) => {
		const { SportId, MarketId, SortWay } = this.state;
		let StartDate = date ? moment(new Date(date)).format('YYYY-MM-DD') : theDaytoday; /* 今天 */
		let EndDate = date ? moment(new Date(date)).format('YYYY-MM-DD') : theDayAfterTenDays; /* 10天後 */
		const type = {
			SportId: SportId /* 体育类型 */,
			MarketId: MarketId /* 市场类型 */,
			SortWay: SortWay /* 排序 */,
			StartDate: StartDate /* 开始日期 */,
			EndDate: EndDate /* 结束日期 */
		};
		this.props.GetEvents(type, true, false, true);
		this.setState(
			{
				Selectdate: date,
				isExpandAll: true //選擇變化之後  要重置(全展開)
			},
			() => {
				this.props.onToggleButtonClicked(true);
			}
		);
	};

	changeToggleButtonStatus = (isExpandAll) => {
		this.setState({ isExpandAll });
	};

 	/**
	 * @description: wcp2022获取开关
	 * @return {*}
  	*/	
	getwcp2022Status = () => {
		fetch(HostConfig.Config.CacheApi + '/static/wcp2022.json?v=' + Math.random())
		.then((response) => response.json())
		.then((jsonData) => {
			this.setState({
				wcp2022Status: jsonData.showWCP2022,
			})
		})
		.catch(() => null)
		.finally(() => {
		});
	 }

	render() {
		const { SportId, MarketId, Selectdate,wcp2022Status } = this.state;
		const { SportDatas, Loading } = this.props;
		let selectedSport, selectedMarket;
		if (SportDatas) {
			const targetSports = SportDatas.filter((s) => parseInt(s.SportId) === parseInt(SportId));
			if (targetSports && targetSports.length > 0) {
				selectedSport = targetSports[0];
			} else {
				selectedSport = SportDatas[0]; //找不到就默認用第一個
			}
			if (selectedSport) {
				const targetMarkets = selectedSport.Markets.filter((m) => parseInt(m.MarketId) === parseInt(MarketId));
				if (targetMarkets && targetMarkets.length > 0) {
					selectedMarket = targetMarkets[0];
				}
			}
		}
		const MarketDatas = selectedSport ? selectedSport.Markets : [];

		//只有足球和世界杯有波膽切換，另外足球的猜冠軍也沒有波膽切換
		const HasCorrectScore =
			selectedSport &&
			[ 1, 2022 ].indexOf(parseInt(selectedSport.SportId)) !== -1 &&
			selectedMarket &&
			parseInt(selectedMarket.MarketId) !== 5;

		//console.log('%c游戏分类和游戏计数', 'font-size:18px;color:red;', SportDatas); /* 赛事种类和计数 */
		//console.log(selectedSport)
		return (
			<div className={'Betting-nav freeze'} ref={this.navRef}>
				<div className="SportTabs">
					{SportDatas.map((item) => {
						if (item.Count <= 0 && item.SportId != 2022) {
							return null; //If there is no available odd, just hide the sport icon
						}
						return (
							<React.Fragment key={item.SportId}>
								{item.SportId == 2022 && wcp2022Status &&(
									<div
										key={item.SportId}
										className={
											'wc2022-Tab SportTab' +
											(selectedSport && selectedSport.SportId === item.SportId ? ' selected' : '')
										}
										onClick={() => this.clickSport(item)}
									>
										<ReactIMG className="wc2022-Icon" src="/sbtwo/wc2022.png" />

										{item.SportName}
										<span className='hot'>热</span>
									</div>
								)}
								{item.SportId != 2022 && (
									<div
										key={item.SportId}
										className={
											'SportTab' +
											(selectedSport && selectedSport.SportId === item.SportId ? ' selected' : '')
										}
										onClick={() => this.clickSport(item)}
									>
										{item.SportName + ' ' + item.Count}
									</div>
								)}
							</React.Fragment>
						);
					})}
				</div>
				<div className="MarketTabs">
					{MarketDatas.map((item) => {
						return (
							<div
								key={item.MarketId}
								className={
									'MarketTab' +
									(selectedMarket && selectedMarket.MarketId === item.MarketId ? ' selected' : '')
								}
								onClick={() => this.clickMarket(item)}
							>
								<div className="InnerWrap">{item.MarketName + ' ' + item.Count}</div>
							</div>
						);
					})}
				</div>
				<div className="Divider">
					<div className="InnerDivider" />
				</div>
				<div className="ButtonBox">
					<div className="LeftBox">
						{HasCorrectScore ? (
							<React.Fragment>
								<div
									onClick={() => this.props.ToggleShowCorrectScore(false)}
									className={'button' + (this.props.ShowCorrectScore ? '' : ' selected')}
								>
									{parseInt(this.props.userSetting.ListDisplayType) === 1 ? '主要市场' : '全场让球'}
								</div>
								<div
									onClick={() => this.props.ToggleShowCorrectScore(true)}
									className={'button' + (this.props.ShowCorrectScore ? ' selected' : '')}
								>
									全场波胆
								</div>
							</React.Fragment>
						) : null}
					</div>
					<div className="RightBox">
						<div className="Switchcontainer">
							<label>
								<input
									className="Game-switch"
									type="checkbox"
									hidden
									checked={this.state.SortWay === 2}
									readOnly="readOnly"
								/>
								<div
									className="Game-switch-text"
									onClick={() => {
										let targetWay = 2;
										if (this.state.SortWay === 2) {
											targetWay = 1;
										}
										this.setState(
											{
												SortWay: targetWay
											},
											() => {
												this.ChangeGame();
											}
										);
									}}
								>
									<span>联赛</span>
									<span>时间</span>
								</div>
							</label>
						</div>
						<div
							className="Nav-colse-icon"
							onClick={() => {
								this.setState(
									{
										isExpandAll: !this.state.isExpandAll
									},
									() => {
										this.props.onToggleButtonClicked(this.state.isExpandAll);
									}
								);
							}}
						>
							<ReactSVG
								className="Betting-show-svg"
								src={`/img/svg/betting/${this.state.isExpandAll ? 's_o' : 's_c'}.svg`}
							/>
						</div>
					</div>
				</div>
				{/* 日期动作面板 */}
				{selectedMarket &&
				parseInt(selectedMarket.MarketId) === VendorMarkets.EARLY && //早盤才可以選日期
				parseInt(selectedSport.SportId) !== 2022 && //世界杯的早盤不用選日期
				!Loading && (
					<Bottomtime ChangeGame={(e) => this.ChangeGame(e)} Selectdate={Selectdate} SportId={SportId} />
				)}
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	userSetting: state.userSetting
});

export default withBetterRouter(connect(mapStateToProps, null)(Bettingnav));

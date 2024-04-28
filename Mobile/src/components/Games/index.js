/*
 * @Author: Alan
 * @Date: 2022-02-08 17:48:31
 * @LastEditors: Alan
 * @LastEditTime: 2022-11-29 11:42:34
 * @Description: 简洁风格的模板组件 直接打开游戏
 * @FilePath: \Mobile\src\components\Games\index.js
 */
import React, { Component } from 'react';
import { GetGameTypes, GamesProviders } from '@/api/game';
import PublicViewFirst from './PublicViewFirst';
import PublicViewSecond from './PublicViewSecond';
import {
	ACTION_GameDetailsDescAndBanner,
	ACTION_GamesInfo_getList,
	ACTION_GamesInfo_getProvidersList,
	ACTION_GamesInfo_getCategoriesList
} from '@/lib/redux/actions/GamesInfoAction';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import Announcement from '@/components/Announcement/';

class Games extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			GameList: {},
			carouselList: [],
			gameTypeDetail: '',
			ProviderGames: []
		};
	}

	componentDidMount() {
		const {
			GameType,
			router,
			gamesInfo_getProvidersList,
			gamesInfo_getCategoriesList,
			gamesInfo_getList
		} = this.props;
		//(GameType == 'LiveCasino' ? 'Casino' : GameType == 'KenoLottery' ? 'Lottery' : GameType);
		/* 获取游戏顶部的banner图片 来自CMS Api  */
		this.props.GameDetailsDesc();
		gamesInfo_getProvidersList(GameType);
		gamesInfo_getCategoriesList(GameType);
		gamesInfo_getList(GameType);
		this.getProvidersCategory(router.query.gameCatId, GameType);

		let CheckAnnouncement =
			!localStorage.getItem('ProductPage' + GameType + 'PagelocalStorageAnnouncement') &&
			!sessionStorage.getItem('ProductPage' + GameType + 'PagelocalStorageAnnouncement');

		this.setState({
			CheckAnnouncement: CheckAnnouncement
		});
		// window.Pushgtagdata && Pushgtagdata(window.location.origin, 'Launch', GameType);
	}

	componentDidUpdate(nextProps) {
		if (this.props.GamesList !== nextProps.GamesList) {
			this.GameTypesList();
		}
	}

	/** 
	 * @description 获取游戏顶部的Banner
	 * @param {*}
	 * @return {*}
	*/
	GameTypesList = () => {
		let Details = this.props.GamesList.GameDetailsDescAndBanner?.result;
		if (Details && Array.isArray(Details)) {
			const { GameType } = this.props;
			// let type = GameType == 'LiveCasino' ? 'Casino' : GameType == 'KenoLottery' ? 'Lottery' : GameType;
			let Category = Details.find((item) => item.code.toLowerCase() == GameType.toLowerCase()) || {};
			this.setState({
				gameTypeDetail: Category
			});
		}
	};

	/**
	 * @description: 获取平台列表的图片
	 * @param {*} gameCatCode
	 * @param {*} GameType
	 * @return {*}
	 */
	getProvidersCategory(gameCatCode, GameType) {
		let hasGetData;
		let data = sessionStorage.getItem('providersCmsBanner' + GameType);
		if (data) {
			hasGetData = true;
			this.setState({
				[GameType + 'List']: JSON.parse(data)
			});
		}
		GamesProviders((res) => {
			if (res) {
				if (res.result && res.isSuccess) {
					let data = res.result.find(item => item.code.toLowerCase() === GameType.toLowerCase());
					sessionStorage.setItem('providersCmsBanner' + GameType, JSON.stringify(data.subProviders));
					if (!hasGetData) {
						this.setState({
							[GameType + 'List']: data.subProviders
						});
					}
				}
			}
		});
	}

	render() {
		const {
			//CMS顶部banner
			gameTypeDetail
		} = this.state;
		const {
			//当前游戏厂商
			GameType,
			//游戏列表
			GamesList
		} = this.props;
		console.log('=============>', this.props);
		return (
			<div className="Container">
				{(GameType == 'Sportsbook' || GameType == 'ESports') && (
					<PublicViewFirst
						ProvidersList={GamesList.ProvidersList} //游戏平台
						ProvidersListImg={this.state[GameType + 'List']}
						gameTypeDetail={gameTypeDetail} //CMS 数据
						GameType={GameType} //当前厂商
						key={GameType}
					/>
				)}
				{(GameType == 'Slot' || GameType == 'LiveCasino' || GameType == 'P2P' || GameType == 'KenoLottery') && (
					<PublicViewSecond
						CategoriesList={GamesList.CategoriesList} //游戏类型 eg:街机 大奖 热门
						gameTypeDetail={gameTypeDetail} //CMS 数据
						GameList={GamesList} //游戏列表
						GameType={GameType} //当前厂商类型
						ProvidersList={GamesList.ProvidersList} //游戏平台
						ProvidersListImg={this.state[GameType + 'List']}
						key={GameType}
					/>
				)}
				{this.state.CheckAnnouncement &&
				GameType &&
				(GameType == 'LiveCasino' || GameType == 'Slot') && (
					<Announcement optionType={GameType} ProductPage={'ProductPage'} />
				)}
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	//游戏列表
	GamesList: state.GamesList
});

const mapDispatchToProps = {
	GameDetailsDesc: () => ACTION_GameDetailsDescAndBanner(),
	gamesInfo_getList: (GameType) => ACTION_GamesInfo_getList(GameType),
	gamesInfo_getProvidersList: (GameType) => ACTION_GamesInfo_getProvidersList(GameType),
	gamesInfo_getCategoriesList: (GameType) => ACTION_GamesInfo_getCategoriesList(GameType)
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Games));

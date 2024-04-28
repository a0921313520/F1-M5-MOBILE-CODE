/*
 * @Author: Alan
 * @Date: 2022-03-07 11:49:02
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-23 23:21:56
 * @Description: 游戏相关
 * @FilePath: \Mobile\src\lib\redux\actions\GamesInfoAction.js
 */
import {
	GetGamesList,
	GamesProvidersList,
	GamesCategoriesList,
	GameDetailsDescAndBanner,
	GamesProviders
} from '@/api/game';
export const ACTION_GAMESINFO_UPDATE = 'ACTION_GAMESINFO_UPDATE';
import Router from 'next/router';
/**
 * @description: 获取游戏详情页面 当前游戏的所有类型 例如:老虎机所含有的  （ 红利游戏 ，免费旋转 ，多人游戏）
 * @param {GameType} 游戏厂商
 * @return {*}
*/
export const ACTION_GamesInfo_getCategoriesList = (GameType) => {
	return (dispatch, getState) => {
		const getGamesCategoriesList = () => {
			let hasGetData;
			if (sessionStorage.getItem(`CategoriesGames-${GameType}`)) {
				hasGetData = true;
				let gamedata = JSON.parse(sessionStorage.getItem(`CategoriesGames-${GameType}`));
				const action = {
					type: ACTION_GAMESINFO_UPDATE,
					payload: { CategoriesList: gamedata }
				};
				return dispatch(action);
			}
			let params = {
				gameType: GameType
			};
			GamesCategoriesList(params, (data) => {
				if (data) {
					if (data.isSuccess) {
						sessionStorage.setItem(`CategoriesGames-${GameType}`, JSON.stringify(data.result));
						if (!hasGetData) {
							const action = {
								type: ACTION_GAMESINFO_UPDATE,
								payload: { CategoriesList: data.result }
							};
							return dispatch(action);
						}
					}
				}
			});
		};
		return getGamesCategoriesList();
	};
};

/**
 * @description: 获取游戏详情页面 厂商下面的平台分类 例如 真人娱乐 下面的 AG 列表 （和列表的图片 另一只 cms api组装）
 * @param {GameType} 游戏厂商ID
 * @return {*}
*/
export const ACTION_GamesInfo_getProvidersList = (GameType, isShowFishingGames) => {
	return (dispatch, getState) => {
		const getGamesProvidersList = () => {
			let hasGetData;
			// if (sessionStorage.getItem(`ProviderGames-${GameType}`)) {
			// 	hasGetData = true;
			// 	let gamedata = JSON.parse(sessionStorage.getItem(`ProviderGames-${GameType}`));

			// 	const action = {
			// 		type: ACTION_GAMESINFO_UPDATE,
			// 		payload: { ProvidersList: gamedata }
			// 	};
			// 	return dispatch(action);
			// }

			let params = {
				gameType: GameType,
				isShowFishingGames
			};
			GamesProvidersList(params, (data) => {
				console.log("GamesProvidersList data from redux",data)
				if (data.isSuccess) {
					sessionStorage.setItem(`ProviderGames-${GameType}`, JSON.stringify(data.result));
					if (!hasGetData) {
						const action = {
							type: ACTION_GAMESINFO_UPDATE,
							payload: { ProvidersList: data.result }
						};
						return dispatch(action);
					}
				}
			});
		};

		return getGamesProvidersList();
	};
};

/**
 * @description: 获取首页游戏下方的游戏介绍和游戏名称 和 游戏详情页面顶部的Banner图片 
 * @return {*}
 */
export const ACTION_GameDetailsDescAndBanner = () => {
	return (dispatch, getState) => {
		const gamesDescAndBanner = () => {
			let hasGetData;
			if (sessionStorage.getItem('GameDetailsDescAndBanner')) {
				hasGetData = true;
				let List = JSON.parse(sessionStorage.getItem('GameDetailsDescAndBanner'));
				const action = {
					type: ACTION_GAMESINFO_UPDATE,
					payload: { GameDetailsDescAndBanner: List }
				};
				return dispatch(action);
			}

			GameDetailsDescAndBanner((data) => {
				if (data) {
					if (data.message === 'data not found') {
						return;
					}
					sessionStorage.setItem('GameDetailsDescAndBanner', JSON.stringify(data));
					if (!hasGetData) {
						const action = {
							type: ACTION_GAMESINFO_UPDATE,
							payload: { GameDetailsDescAndBanner: data }
						};
						return dispatch(action);
					}
				}
			});
		};

		return gamesDescAndBanner();
	};
};

/**
 * @description: 游戏详情页面 获取游戏列表 例如 真人娱乐，棋牌，老虎机 各个厂商平台下面的游戏列表 
 * @param {*} GamesVendorType 游戏的厂商
 * @return {*}
 */
export const ACTION_GamesInfo_getList = (GamesVendorType, GamesSortingFilterType, GamesCategoryType) => {
	return (dispatch, getState) => {
		// if (!getState().userInfo.isLogin) return Promise.resolve(); //沒登入不用處理
		const getGamesListData = () => {
			let hasGetData;
			if (sessionStorage.getItem(GamesVendorType)) {
				hasGetData = true;
				let List = JSON.parse(sessionStorage.getItem(GamesVendorType));
				const action = {
					type: ACTION_GAMESINFO_UPDATE,
					payload: List
				};
				return dispatch(action);
			}
			let params = {
				gameType: GamesVendorType,
				gameSortingType: 'Default',
			};
			GetGamesList(params, (data) => {
				if (data) {
					if (data.message === 'data not found') {
						return;
					}

					if (data.isSuccess) {
						sessionStorage.setItem(GamesVendorType, JSON.stringify(data.result));
						if (!hasGetData) {
							const action = {
								type: ACTION_GAMESINFO_UPDATE,
								payload: { [GamesVendorType]: data.result }
							};
							return dispatch(action);
						}
					}
				}
			});
		};

		return getGamesListData();
	};
};

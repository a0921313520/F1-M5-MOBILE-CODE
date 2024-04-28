/*
 * @Author: Alan
 * @Date: 2022-01-27 09:52:07
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-14 11:40:34
 * @Description: 游戏相关api
 * @FilePath: \Mobile\src\api\game.js
 */
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import HostConfig from '@/server/Host.config';
const { LocalHost } = HostConfig.Config;
import Toast from '@/components/View/Toast';
import Qs from 'qs';

/**
 * @description: 启动游戏
 * @param {*} call
 * @param {*} GameData
 * @return {*}
 */
export function OpenPlayGame(call, GameData) {
	// 在非Production上，部分Provider只接受http，follow以下文件
	//https://arcadie.atlassian.net/wiki/spaces/IN/pages/41386853/Product+Domain+in+Staging
	const httpProvider = ["AG", "AGL", "GPI", "NLE", "SAL"];
	const provider = GameData.code || GameData.providerCode || GameData.provider;
	let reqdata = {
		provider: provider,
		gameId: GameData.providerId || GameData.gameId,
		isDemo: localStorage.getItem("loginStatus") ? false : true,
		//gameCode: GameData.providerGameId,
		hostName: HostConfig.Config.isLIVE ? LocalHost : (httpProvider.includes(provider) ? LocalHost.replace("https", "http") : LocalHost),
		sportsMenu: GameData.sportsMenu,
		vendorQuery: GameData.sportId && GameData.eventId ? `${GameData.sportId}/${GameData.eventId}` : '',
		mobileLobbyUrl: LocalHost,
		bankingUrl: LocalHost,
		logoutUrl: LocalHost,
		sportid: '',
		eventId: ''
	};
	fetchRequest(ApiPort.LaunchGame + '?', 'POST', reqdata)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('OpenPlayGame error:', error);
			Toast.error('启动游戏异常');
			return null;
		});
}

/**
 * @description: 获取首页游戏列表下面的游戏介绍和标题和游戏详情列表顶部Banner图片 CMS API
 * @return {*}
 */
export function GameDetailsDescAndBanner(call) {
	fetchRequest(ApiPort.HomeTabGames, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GameDetailsDescAndBanner error:', error);
			return null;
		});
}

/**
 * @description: 获取首页的游戏列表名称 和 游戏的简介 CMS API
 * @param {*} type
 * @param {*} call
 * @return {*}
 */
export function GamesProviders(call) {
	fetchRequest(ApiPort.HomeTabGames, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GamesProviders error:', error);
			Toast.error('获取当前游戏种类游戏列表异常');
			return null;
		});
}

/**
 * @description: 获取游戏列表
 * @param {*} type
 * @param {*} call
 * @return {*}
 */
export function GetGamesList(params, call) {
	fetchRequest(ApiPort.GamesList + Qs.stringify(params) + '&platform=mobile&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GamesList error:', error);
			Toast.error('获取游戏列表异常');
			return null;
		});
}

/**
 * @description: 游戏页面 玩过的游戏、推荐游戏 列表
 * @param {*} type
 * @param {*} call
 * @return {*}
 */
export function GamesRecentPlayedGame(type, call) {
	fetchRequest(ApiPort.RecentPlayedGame + `/${type}`, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GamesRecentPlayedGame error:', error);
			Toast.error('获取玩过的游戏、推荐游戏列表异常');
			return null;
		});
}

/**
 * @description: Temporary use for SPR game 
 * @Api /api/Games/Navigation/MaintenanceStatus
 * @param {*} gameType 
 * @param {*} call
 * @return {*}
 */

export function GamesMaintenanceStatus(gameType, call) {
	fetchRequest(ApiPort.GetGameMaintenanceStatus + `?providerCode=${gameType}&`, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			Toast.error('获取当前游戏的所有类型异常');
			return null;
		});
}

/**
 * @description: 游戏详情页面 游戏的平台列表 但是 平台的图片用的另一只Api 组装 
 * @Api /api/Games/Providers/Details 
 * @param {*} params 
 * @param {*} call
 * @return {*}
 */
export function GamesProvidersList(params, call) {
	fetchRequest(ApiPort.ProvidersList + Qs.stringify(params) + '&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GamesProvidersList error:', error);
			Toast.error('获取当前游戏的所有平台异常');
			return null;
		});
}

/**
 * @description: 获取当前游戏的所有类型 eg: 红利游戏 免费旋转 多人游戏
 * @param {*} params 
 * @param {*} call
 * @return {*}
 */
export function GamesCategoriesList(params, call) {
	fetchRequest(ApiPort.CategoriesList + Qs.stringify(params) + '&platform=mobile&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GamesCategoriesList error:', error);
			Toast.error('获取当前游戏的所有类型异常');
			return null;
		});
}

/**
 * @description: 获取首页游戏Tabs区域
 * @param {*} call
 * @return {*}
 */
export function GetHomeGames(call) {
	fetchRequest(ApiPort.HomeTabGames, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetHomeGames error:', error);
			Toast.error('获取首页游戏的所有类型异常');
			return null;
		});
}

/**
 * @description: 获取游戏下注记录
 * @param {*} params 筛选参数
 * @param {*} call
 * @return {*}
 */
export function GetMemberDailyTurnover(params, call) {
	fetchRequest(ApiPort.GetMemberDailyTurnover + Qs.stringify(params) + '&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetMemberDailyTurnover error:', error);
			return null;
		});
}

export function GetWalletProviderMapping(call) {
	fetchRequest(ApiPort.getWalletProviderMapping,"GET")
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetWalletProviderMapping error:', error);
			Toast.error('获取遊戲錢包Mapping資料異常');
			return null;
		});
}

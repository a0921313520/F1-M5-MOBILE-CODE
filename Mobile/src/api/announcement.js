/*
 * @Author: Alan
 * @Date: 2022-01-27 09:52:07
 * @LastEditors: Alan
 * @LastEditTime: 2022-07-26 06:42:53
 * @Description: 公告相关api
 * @FilePath: \Mobile\src\api\announcement.js
 */
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import HostConfig from '@/server/Host.config';
const { LocalHost } = HostConfig.Config;
import Toast from '@/components/View/Toast';
import Qs from 'qs';

/**
 * @description: 获取公告
 * @param {*} params 
 * @param {*} call
 * @return {*}
 */
export function GetAnnouncements(params, call) {
	fetchRequest(ApiPort.GetAnnouncements + Qs.stringify(params) + '&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GamesProvidersList error:', error);
			Toast.error('获取当前游戏的所有类型异常');
			return null;
		});
}

/**
 * @description: 获取公告
 * @param {*} params
 * @param {*} call
 * @return {*}
 */
export function AnnouncementPopup(params, call) {
	fetchRequest(ApiPort.AnnouncementPopup + Qs.stringify(params) + '&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('AnnouncementPopup error:', error);
			Toast.error('获取公告异常');
			return null;
		});
}





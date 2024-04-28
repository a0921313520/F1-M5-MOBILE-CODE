/*
 * @Author: Alan
 * @Date: 2022-03-31 10:46:05
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-19 17:27:23
 * @Description: 消息中心
 * @FilePath: \Mobile\src\api\message.js
 */
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import HostConfig from '@/server/Host.config';
import Toast from '@/components/View/Toast';
import Qs from 'qs';

// 获取未读消息统计
export function UnreadMessage(call) {
	fetchRequest(ApiPort.UnreadMessage + 'key=All' + '&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('UnreadMessage error:', error);
			return null;
		});
}

/**
 * @description: 更新已阅读公告状态
 * @param {*} data 
 * @param {*} call
 * @return {*}
 */
export function UpdateAnnouncement(data, call) {
	fetchRequest(ApiPort.UpdateAnnouncement + 'siteId=38&', 'PATCH', data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('UpdateAnnouncement error:', error);
			return null;
		});
}

/**
 * @description: 更新已阅读的状态 个人消息通知
 * @param {*} data
 * @param {*} call
 * @return {*}
 */
export function UpdateMessage(data, call) {
	fetchRequest(ApiPort.UpdateMessage + 'siteId=38&', 'PATCH', data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('UpdateMessage error:', error);
			return null;
		});
}

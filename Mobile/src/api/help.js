/*
 * @Author: Alan
 * @Date: 2022-01-27 09:52:07
 * @LastEditors: Alan
 * @LastEditTime: 2022-04-21 21:35:39
 * @Description: 帮助中心api
 * @FilePath: \Mobile\src\api\help.js
 */
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import HostConfig from '@/server/Host.config';
const { LocalHost } = HostConfig.Config;
import Toast from '@/components/View/Toast';

/**
 * @description: 获取帮助中心问题列表
 * @param {*} call
 * @return {*}
 */
export function CmsHelpList(call) {
	fetchRequest(ApiPort.GetHelpList, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('CmsHelpList error:', error);
			Toast.error('获取帮助中心问题列表异常');
			return null;
		});
}

/**
 * @description: 帮助详情
 * @param {*} id 问题id
 * @param {*} call
 * @return {*}
 */
export function GetHelpdetail(id, call) {
	fetchRequest(ApiPort.GetHelpdetail + id, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetHelpdetail error:', error);
			Toast.error('获取详情异常');
			return null;
		});
}

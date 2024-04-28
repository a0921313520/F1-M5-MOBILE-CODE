/*
 * @Author: Alan
 * @Date: 2022-04-07 01:21:49
 * @LastEditors: Alan
 * @LastEditTime: 2022-04-08 09:18:36
 * @Description: 行为限制
 * @FilePath: \Mobile\src\api\selflimiting.js
 */
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import HostConfig from '@/server/Host.config';
import Toast from '@/components/View/Toast';
import Qs from 'qs';

/**
 * @description: 获取行为限制信息
 * @param {*} params
 * @param {*} call
 * @return {*}
 */
export function SelfExclusionsInfo(call) {
	fetchRequest(ApiPort.SelfExclusions, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('SelfExclusionsInfo error:', error);
			return null;
		});
}

/**
 * @description:更新行为限制
 * @param {*} Data
 * @param {*} call
 * @return {*}
 */
export function UpdateSelfExclusionsInfo(Data, call) {
	fetchRequest(ApiPort.SelfExclusions, 'PUT', Data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('UpdateSelfExclusionsInfo error:', error);
			return null;
		});
}

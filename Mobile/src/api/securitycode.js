/*
 * @Author: Alan
 * @Date: 2022-04-07 01:21:49
 * @LastEditors: Alan
 * @LastEditTime: 2022-04-08 09:20:15
 * @Description: 创建安全码
 * @FilePath: \Mobile\src\api\securitycode.js
 */
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import HostConfig from '@/server/Host.config';
import Toast from '@/components/View/Toast';
import Qs from 'qs';

/**
 * @description: 创建安全码
 * @param {*} call
 * @return {*}
 */
export function SecurityCodeInfo(call) {
	fetchRequest(ApiPort.GetSecurityCode, 'POST')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetSecurityCode error:', error);
			return null;
		});
}

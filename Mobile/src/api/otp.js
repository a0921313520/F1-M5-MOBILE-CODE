/*
 * @Author: Alan
 * @Date: 2022-03-31 10:46:05
 * @LastEditors: Alan
 * @LastEditTime: 2022-03-31 10:49:50
 * @Description: OTP验证相关
 * @FilePath: \Mobile\src\api\otp.js
 */
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import HostConfig from '@/server/Host.config';
import Toast from '@/components/View/Toast';
import Qs from 'qs';

// 获取验证的剩余次数
export function VerificationAttempt(params, call) {
	fetchRequest(ApiPort.VerificationAttempt + Qs.stringify(params) + '&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('VerificationAttempt error:', error);
			return null;
		});
}

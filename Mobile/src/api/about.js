/*
 * @Author: Alan
 * @Date: 2022-03-31 10:46:05
 * @LastEditors: Alan
 * @LastEditTime: 2022-04-29 09:38:04
 * @Description: OTP验证相关
 * @FilePath: \Mobile\src\api\about.js
 */
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import HostConfig from '@/server/Host.config';
import Toast from '@/components/View/Toast';
import Qs from 'qs';

// 获取CMS的内容
export function GetDiamondClubDetail(call) {
	fetchRequest(ApiPort.DiamondClubDetail, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetDiamondClubDetail error:', error);
			return null;
		});
}

/**
 * @description: 获取usdt介绍列表
 * @param {*} call
 * @return {*}
 */
export function GetUsdtFaqDetail(call) {
	fetchRequest(ApiPort.GetUsdtFaq, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetUsdtFaqDetail error:', error);
			return null;
		});
}

/**
 * @description: 获取VIP常见问题列表
 * @param {*} call
 * @return {*}
 */
export function GetVipFaqList(call) {
	fetchRequest(ApiPort.GetVipFaqList, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetVipFaqList error:', error);
			return null;
		});
}

/**
 * @description: 提交问题反馈USDT
 * @param {*} call
 * @return {*}
 */
export function Feedbackform(postData, call) {
	fetchRequest(ApiPort.Feedbackform, 'POST', postData)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('Feedbackform error:', error);
			return null;
		});
}

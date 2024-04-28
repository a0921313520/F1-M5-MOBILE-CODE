/*
 * @Author: Alan
 * @Date: 2022-03-31 10:46:05
 * @LastEditors: Alan
 * @LastEditTime: 2022-04-13 15:17:07
 * @Description: 推荐人
 * @FilePath: \Mobile\src\api\referrer.js
 */
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import HostConfig from '@/server/Host.config';
import Toast from '@/components/View/Toast';
import Qs from 'qs';

/**
 * @description: 查询活动信息
 * @param {*} params
 * @param {*} call
 * @return {*}
 */
export function GetQueleaActiveCampaignInfo(call) {
	fetchRequest(ApiPort.GetQueleaActiveCampaign, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetQueleaActiveCampaignInfo error:', error);
			return null;
		});
}

/**
 * @description: 检查用户是否已经注册,以及获取用户信息
 * @param {*} params
 * @param {*} call
 * @return {*} 
*/
export function GetQueleaReferrerInfo(call) {
	fetchRequest(ApiPort.GetQueleaReferrerInfo, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetQueleaReferrerInfo error:', error);
			return null;
		});
}

/**
 * @description: 注册活动，获取连接
 * @param {*} params
 * @param {*} call
 * @return {*} 
 */
export function GetReferrerSignUp(call) {
	fetchRequest(ApiPort.ReferrerSignUp, 'POST')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetReferrerSignUp error:', error);
			return null;
		});
}

/**
 * @description: 获取用户是否满足申请条件
 * @param {*} params
 * @param {*} call
 * @return {*} 
*/
export function GetReferrerEligible(call) {
	fetchRequest(ApiPort.ReferrerEligible, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetReferrerEligible error:', error);
			return null;
		});
}

/**
 * @description: 获取被推荐人的信息
 * @param {*}
 * @return {*}
*/
export function GetReferrerRewardStatus(call) {
	fetchRequest(ApiPort.ReferrerRewardStatus, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('ReferrerRewardStatus error:', error);
			return null;
		});
}

/**
  * @description: 获取用户注册时间,充值金额,是否已经验证手机号和邮箱
  * @param {*}
  * @return {*}
*/
export function GetReferrerActivity(call) {
	fetchRequest(ApiPort.ReferrerActivity, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetReferrerActivity error:', error);
			return null;
		});
}

/*
 * @Author: Alan
 * @Date: 2022-03-31 10:46:05
 * @LastEditors: Alan
 * @LastEditTime: 2022-04-08 17:52:48
 * @Description: 银行信息 提款银行卡和泰达币钱包
 * @FilePath: \Mobile\src\api\bankinfo.js
 */
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import HostConfig from '@/server/Host.config';
import Toast from '@/components/View/Toast';
import Qs from 'qs';

/**
 * @description: 查询设置的最大提款的金额，以及最多提款的次数，和百分比
 * @param {*} params
 * @param {*} call
 * @return {*}
 */
export function MemberWithdrawalThreshold(call) {
	fetchRequest(ApiPort.GetMemberWithdrawalThreshold, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetMemberWithdrawalThreshold error:', error);
			return null;
		});
}

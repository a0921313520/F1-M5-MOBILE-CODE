/*
 * @Author: Alan
 * @Date: 2022-01-27 09:52:07
 * @LastEditors: Alan
 * @LastEditTime: 2022-09-08 15:39:42
 * @Description: 优惠相关api
 * @FilePath: \Mobile\src\api\promotions.js
 */
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import Toast from '@/components/View/Toast';
import Qs from 'qs';
//获取优惠种类
export function PromotionCategories(call) {
	fetchRequest(`${ApiPort.PromotionCategories}`, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('PromotionCategories error:', error);
			Toast.error('获取优惠种类异常');
			return null;
		});
}

//获取优惠列表
export function Promotions(params, call) {
	fetchRequest(ApiPort.Promotions + Qs.stringify(params) + '&displaying_webp', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('FeatureBanner error:', error);
			//Toast.error('获取优惠列表异常');
			return null;
		});
}

/**
 * @description:优惠详情
 * @param {*} params 优惠id
 * @param {*} call
 * @return {*}
 */
export function PromotionInfo(params, call) {
	fetchRequest(ApiPort.PromotionDetail + Qs.stringify(params), 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('FeatureBanner error:', error);
			Toast.error('获取优惠详情异常');
			return null;
		});
}

/**
 * @description: 获取地址 省
 * @param {*} call
 * @return {*}
 */
export function GetProvinces(call) {
	fetchRequest(ApiPort.GetProvinces, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetProvinces error:', error);

			return null;
		});
}

/**
 * @description: 获取地址 区域
 * @param {*} call
 * @return {*}
 */
export function GetDistricts(provinceId, call) {
	fetchRequest(ApiPort.GetDistricts + `?provinceId=${provinceId}&`, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetDistricts error:', error);

			return null;
		});
}

/**
 * @description: 获取地址 城镇
 * @param {*} call
 * @return {*}
 */
export function GetTowns(districtId, call) {
	fetchRequest(ApiPort.GetTowns + `?districtId=${districtId}&`, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetTowns error:', error);

			return null;
		});
}

/**
 * @description: 获取我的优惠申请列表
 * @param params
 * @param call
 * @return {*}
 */
export function GetBonusAppliedHistory(params, call) {
	fetchRequest(ApiPort.BonusAppliedHistory + Qs.stringify(params), 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetBonusAppliedHistory error:', error);
			return null;
		});
}

/**
 * @description: 获取返水列表
 * @param data
 * @param call
 * @return {*}
 */
export function GetRebateList(params, call) {
	fetchRequest(ApiPort.RebateList + Qs.stringify(params), 'GET')
		.then((res) => {
			
			call(res);
		})
		.catch((error) => {
			console.log('RebateList error:', error);
			return null;
		});
}

/**
 * @description: 获取申请过的 历史记录 
 * @param data
 * @param call
 * @return {*}
 */
export function AppliedHistoryList(params, call) {
	fetchRequest(ApiPort.AppliedHistoryList + Qs.stringify(params), 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('AppliedHistoryList error:', error);
			return null;
		});
}

/**
 * @description: 申请领取优惠礼品
 * @param {*} call
 * @return {*}
 */
export function ApplyManual(data, call) {
	fetchRequest(ApiPort.ApplyManual, 'POST', data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('ApplyManual error:', error);
			return null;
		});
}

/**
 * @description: 每日好礼 获取会员已经添加的地址
 * @param {*} data
 * @param {*} call
 * @return {*}
 */
export function ShippingAddress(call) {
	fetchRequest(ApiPort.ShippingAddress, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('ShippingAddress error:', error);
			return null;
		});
}

/**
 * @description: 添加送礼地址
 * @param {*} data 地址信息
 * @param {*} call
 * @return {*}
 */
export function AddShippingAddress(data, call) {
	fetchRequest(ApiPort.ShippingAddress, 'POST', data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('AddShippingAddress error:', error);
			return null;
		});
}

/**
 * @description: 修改送礼地址
 * @param {*} data 地址信息
 * @param {*} call
 * @return {*}
 */
export function EditShippingAddress(data, call) {
	fetchRequest(ApiPort.ShippingAddress, 'PUT', data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('EditShippingAddress error:', error);
			return null;
		});
}

/**
 * @description: 
 * @param {*} data
 * @param {*} call
 * @return {*}
 */
export function DeleteShippingAddress(params, call) {
	fetchRequest(ApiPort.ShippingAddress + Qs.stringify(params) + '&', 'DELETE')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('AddShippingAddress error:', error);
			return null;
		});
}

/**
 * @description: 每日好礼 选择收礼地址 申请优惠
 * @return {*}
 */
export function DailyDeals(data, call) {
	fetchRequest(ApiPort.DailyDeals + `bonusRuleId=${data.bonusRuleId}&`, 'POST', data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('DailyDeals error:', error);
			return null;
		});
}

/**
 * @description: 每日好礼记录
 * @param {*} params 参数
 * @param {*} call
 * @return {*}
 */
export function DailydealsHistory(params, call) {
	fetchRequest(ApiPort.DailyDealsHistories + Qs.stringify(params) + '&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('DailydealsHistory error:', error);
			return null;
		});
}
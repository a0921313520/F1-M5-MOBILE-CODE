/*
 * @Author: Alan
 * @Date: 2022-01-27 09:52:07
 * @LastEditors: Alan
 * @LastEditTime: 2022-07-14 22:39:01
 * @Description: 首页相关api
 * @FilePath: \Mobile\src\api\home.js
 */
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import HostConfig from '@/server/Host.config';
const { LocalHost } = HostConfig.Config;
import Toast from '@/components/View/Toast';

//获取首页的banner
export function CmsBannerPosition(loginstatus = '?login=before&displaying_webp', call) {
	fetchRequest(ApiPort.CmsBannerPosition + loginstatus, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('CmsBannerPosition error:', error);
			Toast.error('获取首页banner异常');
			return null;
		});
}

//获取首页Mini banner
export function CmsFeatureBannerPosition(loginstatus = '?login=before&displaying_webp', call) {
	fetchRequest(ApiPort.CmsFeatureBanner + loginstatus, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('FeatureBanner error:', error);
			Toast.error('获取首页FeatureBanner异常');
			return null;
		});
}

//獲取profile_feature
export function CmsBanner(Position, call) {
	fetchRequest(ApiPort.CmsBanner + Position, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('CmsBanner error:', error);
			Toast.error('获取CmsBanner异常');
			return null;
		});
}

//获取各个位置banner
export function CmsProfileFeature(call) {
	fetchRequest(ApiPort.CmsProfileFeature,'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('CmsBanner error:', error);
			Toast.error('获取CmsBanner异常');
			return null;
		});
}


//Welcome call
export function WelcomeCall(key, call) {
    fetchRequest(ApiPort.WelcomeCall + "isWelcomeCall=" + key + "&", "POST")
        .then((res) => {
            call(res);
        })
        .catch((error) => {
            console.log("PostWelcomeCall error:", error);
            return null;
        });
}

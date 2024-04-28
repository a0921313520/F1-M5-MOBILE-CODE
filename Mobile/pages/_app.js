/*
 * @Author: Alan
 * @Date: 2022-01-22 14:20:23
 * @LastEditors: Alan
 * @LastEditTime: 2023-01-09 04:07:12
 * @Description: 入口
 * @FilePath: \Mobile\pages\_app.js
 */

// import 'babel-polyfill';
import '@/styles/common.scss';
import '@/styles/select.css';
import 'react-lazy-load-image-component/src/effects/blur.css';
// 导入videojs 的样式
import React from 'react';
import { useEffect } from 'react';
import RouteFilter from '@/components/Filter/RouteFilter'; //路由(登入態)過濾
import { storeWrapper } from '@/lib/redux/store';
import { Provider, useStore } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; //用於加載持久化redux數據，加載完才render
import { resetRemSize } from '@/lib/js/util';
import { ACTION_UserInfo_logout } from '@/lib/redux/actions/UserInfoAction';
import {
	ACTION_MaintainStatus_Logout,
	ACTION_MaintainStatus_NoTokenBTI,
	ACTION_MaintainStatus_NoTokenIM,
	ACTION_MaintainStatus_NoTokenSABA,
} from '@/lib/redux/actions/MaintainStatusAction';
import { useRouter } from 'next/router';
import ErrorBoundary from '@/components/ErrorBoundary'

function MyApp({ Component, pageProps }) {
	const store = useStore((state) => state);
	const router = useRouter();
	global.userInfo_logout = () => {
		store.dispatch(ACTION_UserInfo_logout());
		store.dispatch(ACTION_MaintainStatus_Logout());
	};

	global.maintainStatus_noTokenBTI = (isNoToken) => store.dispatch(ACTION_MaintainStatus_NoTokenBTI(isNoToken));
	global.maintainStatus_noTokenIM = (isNoToken) => store.dispatch(ACTION_MaintainStatus_NoTokenIM(isNoToken));
	global.maintainStatus_noTokenSABA = (isNoToken) => store.dispatch(ACTION_MaintainStatus_NoTokenSABA(isNoToken));

	const resetRemSizeWhenWindowResize = () => {
		const width = document.documentElement.clientWidth || document.body.clientWidth,
			height = document.documentElement.clientHeight || document.body.clientHeight;
		// 因手机浏览器竖屏横屏状态宽高（浏览器地址栏工具栏）变化无常，记录手机浏览器可用宽高
		// 在可用宽高记录完成后，优先使用竖屏的宽高
		if (width < height && !global.documentWidth) {
			resetRemSize(width);
		}
	}

	//等同didmount 只會調用一次
	useEffect(() => {
		console.log('===app didmount path:',router.pathname);

		//清理下載app配置，按需求：刷新後要可以重新展示出來
		sessionStorage.removeItem('appdownload-closed');

		//按當前頁面寬度重新設定基準fontSize
		resetRemSize();
		
		//有时候初始化会有误差，所以重新设置一次
		setTimeout(()=>{
			resetRemSize();
		},500)

		window.addEventListener('resize', resetRemSizeWhenWindowResize); //處理resize變化

		//等同componentWillUnmount
		return () => {
			window.removeEventListener('resize', resetRemSizeWhenWindowResize);
		};
	}, []);

	return (
		<Provider store={store}>
			
			{//用typeof window 判斷是 用戶瀏覽器(需要PersistGate) 或是 export(不用PersistGate)
				typeof window !== "undefined" ? (
				<PersistGate persistor={store.__persistor} loading={null}>
					<RouteFilter />
					<ErrorBoundary>
						<Component {...pageProps} />
					</ErrorBoundary>
				</PersistGate>
			) : (
				<>
					<RouteFilter />
					<ErrorBoundary>
						<Component {...pageProps} />
					</ErrorBoundary>
				</>
			)}
			
		</Provider>
	);
}

export default storeWrapper.withRedux(MyApp);

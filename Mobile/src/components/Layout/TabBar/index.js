/*
 * @Author: Alan
 * @Date: 2022-01-22 14:20:21
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-17 11:48:11
 * @Description: TabBar 组件
 * @FilePath: \Mobile\src\components\Layout\TabBar\index.js
 */
/**
 * TabBar 组件
 */
 import React, { PureComponent } from 'react';
 import Router from 'next/router';
 import classNames from 'classnames';
 import { menuData } from './menu';
 import { menuDataWC } from './menu';
 import LaunchGameImg from '@/components/Games/LaunchGame';
 import { GetGamesList } from '@/api/game';
 import Toast from '@/components/View/Toast';
 import ReactIMG from '@/components/View/ReactIMG';
 import { checkIsLogin, redirectToLogin } from '@/lib/js/util';
 import { wcmenuData } from './wc_menu';
 import HostConfig from '@/server/Host.config';
 import { fetchRequest } from '@/server/Request';
 import { ApiPort } from '@/api/index';
 import moment from 'moment';
 
 class TabBar extends PureComponent {
	 state = {
		 selectedTab: 'home',
		 hidden: false,
		 Routerurl: '/',
		 item: '',
		 wcPeriod: '',
		 MenuList: menuData
	 };
 
	 componentDidMount() {
		 this.setState({
			 Routerurl: Router.router.route
		 });
		 this.checkWCP();
		 this.getSPRMaintenanceStatus();
	 }
 
	 changeTab = (tab, path) => {
		 if (path == 'aviator') {
			 if (!checkIsLogin()) {
				 redirectToLogin();
				
			 }
			 let params = {
				 gameType: 'InstantGames',
				 provider: 'SPR',
				 gameSortingType: 'Default',
			 };
			 Toast.loading();
			 GetGamesList(params, (data) => {
				 if (data) {
					Toast.destroy();
					 if (data.isSuccess) {
						 if (data.result.gameDetails) {
							 let item = (data.result.gameDetails).find(ele => ele.gameNameEnglish === "Aviator");
							 this.setState({
								 item: item
							 })
						 }
					 } else {
						 Toast.destroy();
					 }
				 }
			 });
			 this.setState({
				 selectedTab: tab,
				 Routerurl: 'aviator',
			 });
		 } else {
			 this.setState({
				 selectedTab: tab,
				 Routerurl: Router.router.route
			 });
			 Router.push(path);
			 
		 }
	 };

	 getSPRMaintenanceStatus = () => {
		fetchRequest(ApiPort.GetGameMaintenanceStatus + `?providerCode=AVIATOR&`, 'GET')
		.then((res) => {
			if (res) {
				this.setState({
					gameComingSoon: res.result.isComingSoon,
					gameNew: res.result.isNew,
					gameHot:res.result.isHot
				})
			}
		})
		.catch((error) => {
			Toast.error('获取当前游戏的所有类型异常');
		});
	 }
 
	 // 檢查是否在世界杯期間，需顯示不同底部導覽
	 checkWCP = () => {
		 // 測試環境 方便測試
		 if (!HostConfig.Config.isLIVE) {
			 this.setState({
				 isWCP_TIME: false,
				 MenuList: menuData
			 });
			 return;
		 }
 
		 const today = moment().utcOffset(8).unix();
		 const from = moment(new Date('2022/11/14 00:00:00')).utcOffset(8).unix();
		 const to = moment(new Date('2022/12/23 23:59:59')).utcOffset(8).unix();
 
		 if (today >= from && today <= to) {
			 // 在世界杯期間
			 this.setState({
				 isWCP_TIME: true,
				 MenuList: wcmenuData
			 });
		 } else {
			 this.setState({
				 isWCP_TIME: false,
				 MenuList: menuData
			 });
		 }
	 };
 
	 render() {
		 const { MenuList, hidden, isWCP_TIME } = this.state;
		 //console.log(hidden);
		 return (
			 <div
				 style={{ display: hidden ? 'none' : 'block' }}
				 className={classNames(
					 {
						 'am-tabs-tab-bar-wrap': true,
						 isWCP_TIME: isWCP_TIME
					 },
					 'Tab-BarContainer'
				 )}
			 >
				 <div
					 className={classNames(
						 {
							 isWCP_TIME_Bar: isWCP_TIME
						 },
						 'am-tab-bar-bar'
					 )}
					 style={{ backgroundColor: 'white' }}
				 >
					 {MenuList.map((item) => (
						 <div key={item.key} className="am-tab-bar-tab">
							 <div
								 to={item.path}
								 onClick={() => {
									 Pushgtagdata(
										 `${item.gtagdata.Category}`,
										 `${item.gtagdata.Action}`,
										 `${item.gtagdata.Name}`
									 );
									 this.changeTab(item.key, item.path);
									 
								 }}
							 >
								 {item.path == "aviator" && this.state.gameNew && (!this.state.gameComingSoon && !this.state.gameHot) ? <ReactIMG style={{position: 'absolute', marginLeft: '11px'}} src="/img/svg/new.svg" />
								 : item.path == "aviator" && this.state.gameNew && this.state.gameHot && !this.state.gameComingSoon ? <ReactIMG style={{position: 'absolute', marginLeft: '11px'}} src="/img/svg/new.svg" />
								 : item.path == "aviator" && this.state.gameComingSoon && (this.state.gameNew || this.state.gameHot || !this.state.gameNew || !this.state.gameHot) ? <span className="gameCatComingSoon"  style={{top: '7%', right: 'unset',marginLeft: '-5px'}}>敬请期待</span> 
								 : item.path == "aviator" && this.state.gameHot &&(!this.state.gameComingSoon && !this.state.gameNew) ? <ReactIMG style={{position: 'absolute',marginTop:"-10px", marginLeft: '11px' ,width:"4%"}} 	src="/img/svg/HOT.svg" />
								 : null}
								 <div className="am-tab-bar-tab-icon">
									 <span className="am-badge am-tab-bar-tab-badge tab-badge">
										 <div
											 style={{
												 width: '20px',
												 height: '20px',
												 background: `url(${this.state.Routerurl === item.path
													 ? process.env.BASE_PATH + item.selectedIcon
													 : process.env.BASE_PATH +
														 item.icon}) center center / 21px 21px no-repeat`
											 }}
										 />
										 {/* <sup className="am-badge-text">1</sup> */}
									 </span>
								 </div>
								 <p
									 className="am-tab-bar-tab-title"
									 style={{
										 color:
											 this.state.Routerurl === item.path
												 ? item.tintColor
												 : item.unselectedTintColor
									 }}
								 >
									 {item.name}
									 </p>
								 </div>
							 </div>
						 ))}
					 </div>
 
				 {this.state.Routerurl == 'aviator' && this.state.item &&
					 <LaunchGameImg
						 item={this.state.item}
						 fromFooter={true}
					 />
				 }
			 </div>
		 );
	 }
 }
 
 export default TabBar;
 
/*
 * @Author: Alan
 * @Date: 2022-01-22 14:20:21
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-29 12:31:14
 * @Description: TabBar 组件
 * @FilePath: \Mobile\src\components\sbtwo\Footer\index.js
 */
/**
 * TabBar 组件
 */
import React, { PureComponent } from 'react';
import Router from 'next/router';
import classNames from 'classnames';
import { menuData } from './menu';
import { ApiPort } from '$SBTWOLIB/SPORTAPI';
import { fetchRequest } from '$SBTWOLIB/SportRequest';
import ReactIMG from '@/components/View/ReactIMG';
class TabBar extends PureComponent {
	state = {
		selectedTab: 'home',
		hidden: false,
		Routerurl: '/',
		MenuList: menuData,
		isComingSoon: true,
		isNew: false
	};

	componentDidMount() {
		if (
			Router.router.route == '/sbtwo/sports-im' ||
			Router.router.route == '/sbtwo/sports-bti' ||
			Router.router.route == '/sbtwo/sports-saba'
		) {
			this.setState({
				Routerurl: '/sbtwo'
			});
			sessionStorage.setItem('sburl', Router.router.route);
		} else {
			this.setState({
				Routerurl: Router.router.route
			});
		}

		this.getTabStatus();
	}

	/**
  	* @description: 获取Tab状态
  	* @return {*}
  	*/

	getTabStatus = () => {
		fetchRequest(ApiPort.GetNavMaintenanceStatus, 'GET')
			.then((data) => {
				if (data && data.result) {
					this.setState({
						isComingSoon: data.result.isComingSoon,
						isNew: data.result.isNew,
						isHot:data.result.isHot
					});
				}
			})
			.catch((e) => {
				console.log('====GetNavMaintenanceStatus error', e);
			});
	};

	changeTab = (tab, path) => {
		this.setState({
			selectedTab: tab
		});
		let sburl = sessionStorage.getItem('sburl');
		//跳转首页
		if (path == '/sbtwo') {
			Router.push(sburl);
			this.setState({
				Routerurl: '/sbtwo'
			});
		} else {
			//跳转指定投注记录
			if (path == '/sbtwo/bet-records') {
				if (sburl == '/sbtwo/sports-im') {
					Router.push(path + '?v=im&p=unsettle');
				}
				if (sburl == '/sbtwo/sports-bti') {
					Router.push(path + '?v=bti&p=unsettle');
				}
				if (sburl == '/sbtwo/sports-saba') {
					Router.push(path + '?v=saba&p=unsettle');
				}
				this.setState({
					Routerurl: Router.router.route
				});
			} else {
				if (path == 'menu') {
					this.props.MenuOpenLeftSlider && this.props.MenuOpenLeftSlider();
				} else {
					this.setState({
						Routerurl: Router.router.route
					});
					Router.push(path);
				}
			}
		}
	};

	render() {
		const { MenuList, hidden, isComingSoon, isNew, isHot } = this.state;
		
		return (
			<div
				style={{ display: hidden ? 'none' : 'block' }}
				className={'SBTab-Bar Tab-BarContainer am-tabs-tab-bar-wrap'}
			>
				<div className={'am-tab-bar-bar'} style={{ backgroundColor: 'white' }}>
					{MenuList.map((item) => (
						<div key={item.key} className="am-tab-bar-tab">
							<div
								to={item.path}
								onClick={() => {
									// Pushgtagdata(
									// 	`${item.gtagdata.Category}`,
									// 	`${item.gtagdata.Action}`,
									// 	`${item.gtagdata.Name}`
									// );
									if (item.key == 'AVIATOR' && isComingSoon) {
										return;
									}
									this.changeTab(item.key, item.path);
								}}
								className="sbtwo-tab-item"
							>
								<div className="am-tab-bar-tab-icon">
									<span className="am-badge am-tab-bar-tab-badge tab-badge">
										<div
											className={classNames(
												{
													TActive: this.state.Routerurl === item.path
												},
												'Tab' + item.key
											)}
											style={{
												width: item.key == 'home' ? '40px' : '30px',
												height: '30px',
												background: `url(${this.state.Routerurl === item.path
													? process.env.BASE_PATH + item.selectedIcon
													: process.env.BASE_PATH +
														item.icon}) center center / 21px 21px no-repeat`,
												backgroundSize: 'cover',
												marginTop: '-5px'
											}}
										/>
										{/* <sup className="am-badge-text">1</sup> */}
										{item.path == 'menu' &&
										this.props.StatisticsAll &&
										this.props.StatisticsAll.state &&
										this.props.StatisticsAll.state.StatisticsAll > 0 && (
											<span className="unread-dot" />
										)}
									</span>
									{item.key == 'AVIATOR' &&
									isComingSoon && (
										<div className="lable-ComingSoon">
											<div className="name">敬请期待</div>
										</div>
									)}
									{item.key == 'AVIATOR' &&
									isComingSoon && isNew && (
										<div className="lable-ComingSoon">
											<div className="name">敬请期待</div>
										</div>
									)}
									{item.key == 'AVIATOR' &&
									isNew && (
										<div className="lable-new">
											<div className="name">新</div>
										</div>
									)}
									{item.key == 'AVIATOR' &&
									isHot && (
										<ReactIMG
											className="lable-hot"
											src="/img/svg/hot_cn.svg"	
										/>
									)}							
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
								<div
									className={classNames(
										{
											'Bg-Active': this.state.Routerurl === item.path
										},
										item.key + 'Bg-Active'
									)}
								/>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}
}

export default TabBar;

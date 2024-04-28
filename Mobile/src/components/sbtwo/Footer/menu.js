/*
 * @Author: Alan
 * @Date: 2022-01-25 08:32:46
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-30 16:52:21
 * @Description: tabbar菜单 菜单数组 
 * @FilePath: \Mobile\src\components\sbtwo\Footer\menu.js
 */
const menuData = [
	{
		name: '首页',
		key: 'home',
		path: '/sbtwo',
		icon: '/sbtwo/1.svg',
		selectedIcon: '/sbtwo/1-1.svg',
		unselectedTintColor: '#949494',
		tintColor: '#00A6FF',
		gtagdata: {
			Category: 'Navigation',
			Action: 'View​',
			Name: 'Main_Dislay_SB2.0​'
		}
	},
	{
		name: '优惠',
		key: 'Promotions',
		path: '/sbtwo/Promotions',
		icon: '/sbtwo/2.svg',
		selectedIcon: '/sbtwo/2-2.svg',
		unselectedTintColor: '#949494',
		tintColor: '#00A6FF',
		gtagdata: {
			Category: 'Promo Nav',
			Action: 'View',
			Name: 'PromoPage_SB2.0'
		}
	},

	{
		name: '注单',
		key: 'betting-record',
		path: '/sbtwo/bet-records',
		icon: '/sbtwo/3.svg',
		selectedIcon: '/sbtwo/3-3.svg',
		unselectedTintColor: '#949494',
		tintColor: '#00A6FF',
		gtagdata: {
			Category: 'Account',
			Action: 'View​',
			Name: 'BetRecord_SB2.0​'
		}
	},
	{
		name: '夺金战机',
		key: 'AVIATOR',
		path: '/sbtwo/Aviator',
		icon: '/sbtwo/4.svg',
		selectedIcon: '/sbtwo/4-4.svg',
		unselectedTintColor: '#949494',
		tintColor: '#00A6FF',
		gtagdata: {
			Category: 'Game',
			Action: 'Launch',
			Name: 'Aviator_InstantGames_SB2.0​'
		}
	},
	{
		name: '菜单',
		key: 'menu',
		path: 'menu',
		icon: '/sbtwo/5.svg',
		selectedIcon: '/sbtwo/5-5.svg',
		unselectedTintColor: '#949494',
		tintColor: '#00A6FF',
		gtagdata: {
			Category: 'Navigation',
			Action: 'View',
			Name: 'Sidemenu_SB2.0​'
		}
	}
];

export { menuData };

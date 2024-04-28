/*
 * @Author: Alan
 * @Date: 2022-01-25 08:32:46
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-13 16:22:03
 * @Description: tabbar菜单 菜单数组 
 * @FilePath: \Mobile\src\components\Layout\TabBar\menu.js
 */
const menuData = [
	{
		name: 'Trang Chủ',
		key: 'home',
		path: '/',
		icon: '/img/P5/FooterMenu/home-hover.svg',
		selectedIcon: '/img/P5/FooterMenu/home.svg',
		unselectedTintColor: '#949494',
		tintColor: '#00A6FF',
		gtagdata: {
			Category: 'NavBar',
			Action: 'Go to Homepage',
			Name: 'NavBar_C_Home'
		}
	},
	{
		name: 'Khuyến Mãi',
		key: 'Promotions',
		path: '/promotions',
		icon: '/img/P5/FooterMenu/proms.svg',
		selectedIcon: '/img/P5/FooterMenu/proms-hover.svg',
		unselectedTintColor: '#949494',
		tintColor: '#00A6FF',
		gtagdata: {
			Category: 'NavBar',
			Action: 'Go to Promotion',
			Name: 'NavBar_C_Promotion'
		}
	},
	{
		name: 'Lịch Sử Cược',
		key: 'Bettingrecord',
		path: '/betting-record',
		icon: '/img/P5/FooterMenu/betlog.svg',
		selectedIcon: '/img/P5/FooterMenu/betlog-hover.svg',
		unselectedTintColor: '#949494',
		tintColor: '#00A6FF',
		gtagdata: {
			Category: 'NavBar',
			Action: 'Go to BetRecord',
			Name: 'NavBar_C_BetRecord'
		}
	},
	{
		name: 'Tỷ Phú Bay',
		key: 'aviator',
		path: 'aviator',
		icon: '/img/P5/FooterMenu/aviator.svg',
		selectedIcon: '/img/P5/FooterMenu/aviator.svg',
		unselectedTintColor: '#949494',
		tintColor: '#949494',
		gtagdata: {
			Category: 'NavBar',
			Action: 'Launch Game Aviator',
			Name: 'NavBar_C_Aviator'
		}
	},
	{
		name: 'Hồ Sơ',
		key: 'me',
		path: '/me',
		icon: '/img/P5/FooterMenu/userinfo.svg',
		selectedIcon: '/img/P5/FooterMenu/userinfo-hover.svg',
		unselectedTintColor: '#949494',
		tintColor: '#00A6FF',
		gtagdata: {
			Category: 'NavBar',
			Action: 'Go to Member Center',
			Name: 'NavBar_C_MemberCenter'
		}
	}
];

export { menuData };

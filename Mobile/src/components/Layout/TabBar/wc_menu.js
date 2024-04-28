/*
 * @Author: Alan
 * @Date: 2022-01-25 08:32:46
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-17 11:23:39
 * @Description: tabbar菜单 菜单数组 
 * @FilePath: \Mobile\src\components\Layout\TabBar\wc_menu.js
 */
const wcmenuData = [
	{
		name: 'Trang Chủ',
		key: 'home',
		path: '/',
		icon: '/img/P5/FooterMenu/fun.svg',
		selectedIcon: '/img/P5/FooterMenu/home.svg',
		unselectedTintColor: '#949494',
		tintColor: '#00A6FF',
		gtagdata: {
			Category: 'Navigation',
			Action: 'Click',
			Name: 'Home_Bottomnav'
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
			Category: 'Promo Nav',
			Action: 'Click',
			Name: 'Promo_Bottomnav'
		}
	},
	{
		name: 'VIP',
		key: 'vip',
		path: '/diamond-club?key=5658',
		icon: '/img/P5/FooterMenu/vip.svg',
		selectedIcon: '/img/P5/FooterMenu/vip.svg',
		unselectedTintColor: '#949494',
		tintColor: '#00A6FF',
		gtagdata: {
			Category: '',
			Action: '',
			Name: ''
		}
	},
	{
		name: '世界杯',
		key: 'event_WC2022',
		path: '/event_WC2022',
		icon: '/img/P5/FooterMenu/NAVWC.png',
		selectedIcon: '/img/P5/FooterMenu/NAVWC.png',
		unselectedTintColor: '#949494',
		tintColor: '#00A6FF',
		gtagdata: {
			Category: 'Engagement_Event​',
			Action: 'Click',
			Name: 'Enter_WCPage2022​_BottomNav'
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
			Category: 'Account',
			Action: 'Click',
			Name: 'BetRecord_Bottomnav'
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
			Category: '',
			Action: '',
			Name: ''
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
			Category: 'Account',
			Action: 'Click',
			Name: 'Profile_Bottomnav'
		}
	}
];

export { wcmenuData };

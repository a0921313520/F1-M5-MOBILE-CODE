/*
 * @Author: Alan
 * @Date: 2022-03-25 16:46:20
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-22 17:04:34
 * @Description: 优惠页面
 * @FilePath: \Mobile\pages\sbtwo\Promotions\index.js
 */
import React from 'react';
import Layout from '$SBTWO/Layout';
import PromotionsContent from '$SBTWO/Promotions/';
import MyPromotions from '$SBTWO/Promotions/MyPromotions/';
import Rebate from '$SBTWO/Promotions/Rebate/';
import Tabs, { TabPane } from 'rc-tabs';
import { withRouter } from 'next/router';
class Promos extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			Tabskey: 'Promotions'
		};
	}

	componentDidMount() {
		// if (!checkIsLogin()) {
		// 	redirectToLogin();
		// // }
		const { router } = this.props;
		const { tab } = router.query;
		if (tab) {
			this.setState({
				Tabskey: tab
			});
		}
		// window.Pushgtagdata && Pushgtagdata(window.location.origin, 'Launch', `promo`);
	}

	render() {
		const { Tabskey } = this.state;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="优惠活动"
				status={4}
				hasServer={true}
				barFixed={true}
			>
				<div id="promotions" key={Tabskey}>
					<Tabs
						prefixCls="Promotions"
						defaultActiveKey={Tabskey}
						onChange={(v) => {
							this.setState({
								Tabskey: v
							});
						}}
					>
						{[
							{
								name: '优惠',
								type: 'Promotions',
								gtag: 'Filter_withdrawal_transactionrecord'
							},
							{
								name: '我的优惠',
								type: 'MyPromotions',
								gtag: 'Filter_withdrawal_transactionrecord'
							},
							{
								name: '返水',
								type: 'Rebate',
								gtag: 'Filter_withdrawal_transactionrecord'
							}
						].map((items, index) => {
							return (
								<TabPane tab={<div className="SB20_notice_tab notice_tab">{items.name}</div>} key={items.type}>
									{Tabskey == 'Promotions' && index == 0 && <PromotionsContent pageType="sb20"/>}
									{Tabskey == 'MyPromotions' && index == 1 && <MyPromotions pageType="sb20"/>}
									{Tabskey == 'Rebate' && index == 2 && <Rebate pageType="sb20"/>}
								</TabPane>
							);
						})}
					</Tabs>
				</div>
				{/* <Announcement optionType="Promotions" /> */}
			</Layout>
		);
	}
}

export default withRouter(Promos);

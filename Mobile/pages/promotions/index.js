/*
 * @Author: Alan
 * @Date: 2022-03-25 16:46:20
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-21 18:41:44
 * @Description: 优惠页面
 * @FilePath: \Mobile\pages\Promotions\index.js
 */
import React from 'react';
import Layout from '@/components/Layout';
import PromotionsContent from '@/components/Promotions/';
import MyPromotions from '@/components/Promotions/MyPromotions/';
import Rebate from '@/components/Promotions/Rebate/';
import Tabs, { TabPane } from 'rc-tabs';
import { withRouter } from 'next/router';
import ReactIMG from '@/components/View/ReactIMG';
import Vipcustomerservice from '@/components/Header/Vipcustomerservice';
import Service from '@/components/Header/Service';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/promotions'); //參數帶本頁的路徑
}
class Promos extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			Tabskey: 'Promotions',
			feedbackModal: false,
			isVIP:false
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
		if(!!localStorage.getItem('memberInfo') && JSON.parse(localStorage.getItem('memberInfo')).isVIP){
			this.setState({isVIP: true})
		}
	}

	render() {
		const { Tabskey, isVIP ,feedbackModal} = this.state;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="嗨FUN双旦 惠不可挡"
				status={4}
				hasServer={true}
				barFixed={true}
				seoData={this.props.seoData}
			>
				<div id="promotions" key={Tabskey}>
					{/* <div
						style={{margin: '0.4rem', position: 'absolute', right: '0', zIndex: '99'}}
						className="sport-sprite sport-service"
						onClick={() => {
							PopUpLiveChat();
						}}
					> */}
						{/* 客服按钮 */}
					{/* </div> */}

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
								name: 'Khuyến Mãi',
								type: 'Promotions',
								gtag: 'Filter_withdrawal_transactionrecord'
							},
							{
								name: 'Khuyến Mãi Của Tôi',
								type: 'MyPromotions',
								gtag: 'Filter_withdrawal_transactionrecord'
							},
							{
								name: 'Hoàn Trả',
								type: 'Rebate',
								gtag: 'Filter_withdrawal_transactionrecord'
							}
						].map((items, index) => {
							return (
								<TabPane tab={<div className="notice_tab" style={{whiteSpace: items.type == 'MyPromotions' ? 'normal' : 'nowrap'}}>{items.name}</div>} key={items.type}>
									{Tabskey == 'Promotions' && index == 0 && <PromotionsContent  />}
									{Tabskey == 'MyPromotions' && index == 1 && <MyPromotions />}
									{Tabskey == 'Rebate' && index == 2 && <Rebate />}
								</TabPane>
							);
						})}
					</Tabs>
					{isVIP ? 
						<div className='vip-customer-service' onClick={()=>{
							this.setState({feedbackModal: true})
						}}>
						<ReactIMG src="/img/P5/icon/Icon_VIPCS.png" />
					</div>:null}
					<div
						className='liveChat'
						onClick={() => {
							// Pushgtagdata(`Live Chat`, 'Launch', `Topnav_CS`);
						}}
					>
						<Service />
					</div>
				</div>
				{/* <Announcement optionType="Promotions" /> */}

				<Vipcustomerservice visible={feedbackModal} onCloseModal={()=>{this.setState({feedbackModal: false})}}/>
			</Layout>
		);
	}
}

export default withRouter(Promos);
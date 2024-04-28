/*
 * @Author: Alan
 * @Date: 2021-03-29 09:20:31
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-17 12:23:30
 * @Description: 优惠申请状态
 * @FilePath: \Mobile\pages\Transfer\er.js
 */
import React from 'react';
import Layout from '@/components/Layout';
import ReactIMG from '@/components/View/ReactIMG';

class PromoDepositStatus extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			Bonus: '',
			value: ''
		};
	}

	render() {
		const { Bonus, value } = this.state;
		return (
			<Layout title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台" Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app" Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。" status={2} BarTitle={'优惠申请'}>
				<div className="PromoDepositStatus">
					<div className="DepositStatus" style={{ height: '195px' }}>
						<div className="icon">
							<ReactIMG src="/img/success.png" />
							<p>Chuyển Quỹ Thành Công</p>
							<p style={{ color: '#666666' }}>优惠已申请</p>
						</div>
					</div>
					<div
						className="Btn active"
						onClick={() => {
							window.location.href = `${window.location.origin}/ec2021?tab=promo&key=1`;
						}}
					>
						查看优惠状态
					</div>
				</div>
			</Layout>
		);
	}
}

export default PromoDepositStatus;
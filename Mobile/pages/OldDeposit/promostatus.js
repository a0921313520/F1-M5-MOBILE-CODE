/*
 * @Author: Alan
 * @Date: 2021-03-29 09:20:31
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-17 12:11:32
 * @Description: 优惠申请状态
 * @FilePath: \Mobile\pages\Deposit\promostatus.js
 */
import React from 'react';
import Router from 'next/router';
import Layout from '@/components/Layout';
import { backToMainsite } from '@/api/userinfo';
import { GetWalletBonus } from '@/api/wallet';
//import Item from '../../components/Deposit/depositComponents/Item';
import ReactIMG from '@/components/View/ReactIMG';

class PromoDepositStatus extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			Bonus: '',
			value: ''
		};
	}

	componentDidMount() {
		const { wallet, id, value } = Router.router.query;
		this.setState({
			type: 'transfer'
		});
		GetWalletBonus(wallet, (res) => {
			//console.log(res);
			if (res) {
				let Bonus = res.find((Item) => Item.id == id);
				this.setState({
					Bonus: Bonus,
					value: value
				});
			}
		});
	}

	render() {
		const { Bonus, value } = this.state;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				status={2}
				BarTitle={'优惠申请'}
			>
				<div className="PromoDepositStatus">
					<div className="DepositStatus">
						<div className="icon">
							<ReactIMG src="/img/success.png" />
							<p>交易进行中</p>
						</div>
						<div className="Amount">
							<label>存款金额</label>
							<b>￥{value}</b>
						</div>
						<div className="Content">
							<label>{Bonus.title}</label>
							<div className="list">
								<div>
									<label>申请金额</label>
									<div>￥{value}</div>
								</div>
								<div>
									<label>可得红利</label>
									<div>￥{value && value != 0 ? Number(value) * Bonus.givingRate : 0}</div>
								</div>
								<div>
									<label>所需流水</label>
									<div>
										{value && value != 0 ? (
											(Number(value) + Number(value) * Bonus.givingRate) * Bonus.releaseValue
										) : (
											0
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
					<div
						className="Btn active"
						onClick={() => {
							/* -----------------跳转去交易记录----------------- */
							backToMainsite('vn/finance/history/transactionhistory.htm');
						}}
					>
						查看交易记录
					</div>
					<div
						className="Btn"
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



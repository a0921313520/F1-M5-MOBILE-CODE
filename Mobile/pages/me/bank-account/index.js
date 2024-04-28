/*
 * @Author: Alan
 * @Date: 2022-04-08 16:29:46
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-15 16:45:45
 * @Description: 银行信息
 * @FilePath: \Mobile\pages\Me\BankAccount\index.js
 */
import React from 'react';
import Layout from '@/components/Layout';
import BankList from '@/components/Me/Bank/BankList';
import WalletAddress from '@/components/Me/Bank/WalletAddress';
import { getUrlVars } from '@/lib/js/Helper';
import Flexbox from '@/components/View/Flexbox/';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/bank-account'); //參數帶本頁的路徑
}
const tabs = [
	{ value: '0', name: 'Ngân Hàng', key: 'Bankingcard_bankinginfo_profilepage', flex: '0 0 33%' },
	{ value: '1', name: 'Ví USDT-ERC20', key: 'ERC20_bankinginfo_profilepage', flex: '0 0 33%' },
	{ value: '2', name: 'Ví USDT-TRC20', key: 'TRC20_bankinginfo_profilepage', flex: '0 0 33%' }
];
class BankAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			memberInfo: this.props.memberInfo,
			email: this.props.email,
			phoneNumber: this.props.phoneNumber,
			methodType: '0'
		};
	}

	componentDidMount() {
		let type = getUrlVars()['type'];

		if (type) {
			this.setState({
				methodType: type
			});
		}
	}

	tabChange(item) {
		if(item.value==='0'){
			Pushgtagdata(`AccountManagement`,"Switch to Common Tab",`AccountManagement_C_CommonAccount`)
		}else{
			Pushgtagdata(`AccountManagement`,`Switch to Crypto ${item.value==='1' ? "ERC20" : "TRC20"}`,`AccountManagement_C_Crypto${item.value==='1' ? "ERC20" : "TRC20"}`)
		}
		this.setState({
			methodType: item.value
		});
	}

	render() {
		const { methodType } = this.state; //注册讯息
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="Quản Lý Ngân Hàng"
				status={2}
				hasServer={true}
				barFixed={true}
				seoData={this.props.seoData}
			>
				<div className="BankContent">
					<Flexbox className="headTabs" alignItems="center" justifyContent="space-between">
						{tabs.map((item, index) => (
							<Flexbox
								key={index + 'list'}
								className={`${methodType === item.value ? 'active' : ''}`}
								onClick={() => {
									this.tabChange(item);
								}}
								flex={item.flex}
							>
								<span>{item.name}</span>
							</Flexbox>
						))}
					</Flexbox>
					{methodType == '0' && <BankList />}
					{methodType == '1' && <WalletAddress methodType={methodType} />}
					{methodType == '2' && <WalletAddress methodType={methodType} />}
				</div>
			</Layout>
		);
	}
}

export default BankAccount;

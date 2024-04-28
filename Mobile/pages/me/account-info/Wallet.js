/*
 * @Author: Alan
 * @Date: 2022-07-26 10:15:49
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-29 13:04:02
 * @Description: 头部注释
 * @FilePath: \Mobile\pages\Me\Accountinfo\Wallet.js
 */
import React from 'react';
import Toast from '@/components/View/Toast';
import { checkIsLogin } from '@/lib/js/util';
import Layout from '@/components/Layout';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import Router from 'next/router';
import Button from '@/components/View/Button';
import { BsFillCircleFill } from 'react-icons/bs';
import { setMemberInfo } from '@/api/userinfo';
import { GetWalletList } from '@/api/wallet';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/account-info'); //參數帶本頁的路徑
}

let IconColor = {
	MAIN: '#BCBEC3',
	SB: '#00A6FF',
	LD: '#E91E63',
	YBP: '#99683D',
	P2P: '#99683D',
	KYG: '#99683D',
	SLOT: '#2ACB7A',
	IMOPT: '#2ACB7A',
	YBF: '#20BDAD',
	YBK: '#20BDAD',
	KENO: '#20BDAD',
	LBK: '#20BDAD'
};
class EmailVertify extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showCofirmModal: false,
			verifyModalVisible: true,
			countdownNum: -1,
			isShowResendWord: false,
			walletList: []
		};
	}

	componentDidMount() {
		if (checkIsLogin()) {
		} else {
			Router.push('/register_login');
		}
		let walletListdata = JSON.parse(localStorage.getItem('walletList'));
		if (walletListdata) {
			this.setState({
				walletList: walletListdata.result.fromWallet,
				setCode: this.props.userInfo.memberInfo.preferWallet
			});
		} else {
			this.getDepositWallet();
		}
		this.props.userInfo_getDetails();
	}

	// 获取目标账户列表
	getDepositWallet() {
		GetWalletList((res) => {
			if (res.result) {
				this.setState({
					walletList: res.result.fromWallet
				});
			}
		});
	}

	componentDidUpdate(prevProps) {
		if (this.props.userInfo.memberInfo.preferWallet !== prevProps.userInfo.memberInfo.preferWallet) {
			this.setState({
				setCode: this.props.userInfo.memberInfo.preferWallet
			});
		}
	}

	closeVerifyModal = () => {
		Router.push('/me/account-info');
	};

	/**
	 * @description: 设置首选钱包
	 * @return {*}
  	*/
	Setwallet() {
		const { setCode } = this.state;
		const params = {
			key: 'Wallet',
			value1: setCode
		};
		Toast.loading('Đang gửi đi, xin vui lòng chờ...');
		setMemberInfo(params, (res) => {
			Toast.destroy();
			if (res.isSuccess == true) {
				Toast.success('Cập Nhật Thành Công', 3);
				this.props.userInfo_getDetails();
				Router.push('/me/account-info');
			} else if (res.isSuccess == false) {
				Toast.error(res.result.message || 'Cập nhật không thành công!');
			} else {
				Toast.error('Cập nhật không thành công!');
			}
		});
	}

	render() {
		const { walletList } = this.state;
		return (
			<React.Fragment>
				<Layout
					title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
					Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
					Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
					BarTitle="Chọn Ví Tiền Yêu Thích"
					status={2}
					hasServer={false}
					barFixed={true}
					seoData={this.props.seoData}
				>
					<div style={{ display: 'block' }}>
						{walletList.length > 1 && (
							<div>
								<ul className="cap-list small-circle cap-distance">
									{walletList.map((value, index) => {
										return (
											<li
												className="cap-item"
												key={index + 'LIST'}
												onClick={() => {
													this.setState({
														setCode: value.key
													});
												}}
											>
												<div>
													<i style={{ marginRight: '10px' }}>
														<BsFillCircleFill size="8" color={IconColor[value.key]} />
													</i>
													{value.name}
												</div>
												<div>
													<div
														className={`cap-item-circle${value.key === this.state.setCode
															? ' curr'
															: ''}`}
													/>
												</div>
											</li>
										);
									})}
								</ul>
								<div
									style={{ padding: '20px' }}
									onClick={() => {
										this.Setwallet();
									}}
								>
									<Button>Gửi</Button>
								</div>
							</div>
						)}
					</div>
				</Layout>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

const mapDispatchToProps = {
	userInfo_getDetails: () => ACTION_User_getDetails()
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EmailVertify));

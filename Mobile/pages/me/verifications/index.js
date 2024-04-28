/*
 * @Author: Alan
 * @Date: 2022-02-07 11:24:10
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-12 14:52:56
 * @Description: 安全检测
 * @FilePath: \Mobile\pages\Me\verifications\index.js
 */
import React, { Component } from 'react';
import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';
const CallApplib = dynamic(import('@/components/Me/DynamicOpenApp'), { ssr: false });
import Flexbox from '@/components/View/Flexbox/';
import { checkIsLogin } from '@/lib/js/util';
import { ACTION_UserInfo_getBalance, ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import Router from 'next/router';
import { BiIdCard } from 'react-icons/bi';
import { BsCheckCircleFill } from 'react-icons/bs';
import { MdOutlinePhoneIphone, MdOutlineMailOutline } from 'react-icons/md';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/verifications'); //參數帶本頁的路徑
}
class Me extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			checkLogin: false,
			memberInfo: {}
		};
	}

	componentDidMount() {
		this.setState({
			checkLogin: checkIsLogin()
		});
		if (checkIsLogin()) {
			this.props.userInfo_getDetails();
			this.props.userInfo_getBalance(true);
		}
	}

	render() {
		const { memberInfo } = this.props.userInfo;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="Xất Thực Tài Khoản"
				status={2}
				hasServer={true}
				barFixed={true}
				seoData={this.props.seoData}
			>
				<Flexbox id="Verifications">
					<Flexbox className="Content" flexDirection="column">
						<p className="note">FUN88 luôn tuân thủ quy tắc và quy định, điều khoản và quyền riêng tư, cung cấp dịch vụ an toàn và đáng tin cậy. Hãy xác thực tài khoản của bạn để nâng cao tính bảo mật</p>
						{memberInfo && (
							<React.Fragment>
								<Flexbox justifyContent="space-between" className="list">
									<Flexbox alignItems="center" style={{width: '60%'}}>
										<BiIdCard color="#00A6FF" size="32" />
										<Flexbox flexDirection="column" padding="0 5px 0 10px">
											<h3>Căn Cước Công Dân</h3>
											<small className="gray">Xác thực họ tên thật</small>
										</Flexbox>
									</Flexbox>
									<Flexbox alignItems="center">
										{console.log(memberInfo.firstName, 'memberInfo.firstName')}
										{memberInfo.firstName == '' ? (
											<button
												className="Btn"
												onClick={() => {
													Router.push('/me/account-info/RealName');
												}}
											>
												Xác Thực Ngay
											</button>
										) : (
											<Flexbox alignItems="center">
												<BsCheckCircleFill color="#0CCC3C" size={20} />
												<Flexbox marginLeft="8px" className="Green">
													Đã Xác Thực
												</Flexbox>
											</Flexbox>
										)}
									</Flexbox>
								</Flexbox>
								<Flexbox justifyContent="space-between" className="list">
									<Flexbox alignItems="center" style={{width: '60%'}}>
										<MdOutlinePhoneIphone color="#00A6FF" size="32" />
										<Flexbox flexDirection="column" padding="0 5px 0 10px">
											<h3>Số Điện Thoại</h3>
											<small className="gray">Xác thực số điện thoại hợp lệ</small>
										</Flexbox>
									</Flexbox>
									<Flexbox alignItems="center">
										{memberInfo.phoneStatus !== 'Verified' ? (
											<button
												className="Btn"
												onClick={() => {
													Router.push('/me/account-info/Phone');
												}}
											>
												Xác Thực Ngay
											</button>
										) : (
											<Flexbox alignItems="center">
												<BsCheckCircleFill color="#0CCC3C" size={20} />
												<Flexbox marginLeft="8px" className="Green">
													Đã Xác Thực
												</Flexbox>
											</Flexbox>
										)}
									</Flexbox>
								</Flexbox>
								<Flexbox justifyContent="space-between" className="list">
									<Flexbox alignItems="center" style={{width: '60%'}}>
										<MdOutlineMailOutline color="#00A6FF" size="32" />
										<Flexbox flexDirection="column" padding="0 5px 0 10px">
											<h3>Email</h3>
											<small className="gray">Xác thực Email hợp lệ</small>
										</Flexbox>
									</Flexbox>
									<Flexbox alignItems="center">
										{memberInfo.emailStatus !== 'Verified' ? (
											<button
												className="Btn"
												onClick={() => {
													Router.push('/me/account-info/Email');
												}}
											>
												Xác Thực Ngay
											</button>
										) : (
											<Flexbox alignItems="center">
												<BsCheckCircleFill color="#0CCC3C" size={20} />
												<Flexbox marginLeft="8px" className="Green">
													Đã Xác Thực
												</Flexbox>
											</Flexbox>
										)}
									</Flexbox>
								</Flexbox>
							</React.Fragment>
						)}
					</Flexbox>
				</Flexbox>
				<CallApplib key={Math.random()}/>
			</Layout>
		);
	}
}
const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

const mapDispatchToProps = {
	userInfo_getBalance: (forceUpdate = false) => ACTION_UserInfo_getBalance(forceUpdate),
	userInfo_getDetails: () => ACTION_User_getDetails()
};

export default connect(mapStateToProps, mapDispatchToProps)(Me);

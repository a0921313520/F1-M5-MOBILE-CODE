import React, { Component } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/View/Modal';
import VerifyPhone from '@/components/DepositVerify/VerifyPhone';
import Router from 'next/router';
import { ReactSVG } from '@/components/View/ReactSVG';
import Service from '@/components/Header/Service';
import Button from '@/components/View/Button';
import ReactIMG from '@/components/View/ReactIMG';
import RealyName from '@/components/DepositVerify/RealyName';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import { withBetterRouter } from '@/lib/js/withBetterRouter';
import { PopUpLiveChat, redirectToDeposit, getDepositVerifyInfo } from '@/lib/js/util';
import { getUrlVars, urlVarsToQueryString } from '@/lib/js/Helper';
import Toast from '@/components/View/Toast';
class Verify extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			type: '', //phone, resetpwd
			verifyType: '',
			memberInfo: '',
			phoneTryLimit: 3,
			overTheLimitVisible: false
		};
	}

	componentDidMount() {
		this.getMemberData();
	}

	componentDidUpdate(nextProps) {
		if (this.props.userInfo.memberInfo != nextProps.userInfo.memberInfo) {
			this.getMemberData();
		}
	}

 	/**
  	* @description: 检查存款验证的状态
  	* @return {*}
  	*/	
	MemberFlagsStatus = async () => {
		Toast.loading();
		getDepositVerifyInfo()
			.then((info) => {
				Toast.destroy();
				const resultCode = info.code;
				if (resultCode === 'NO_OTP_TIMES') {
					//沒剩餘次數，直接展示超過驗證次數頁
					this.setState({ type: 'phone', overTheLimitVisible: true });
				} else if (resultCode === 'HAS_OTP_TIMES' || !this.props.userInfo.memberInfo.firstName) {
					//手機未認證 || 姓名未認證
					//還有剩餘次數，進入手機驗證頁面
					this.setState({
						type: 'phone'
					});
				} else {
					//從網址判斷是否進行銀行卡驗證(需要用戶點擊按鈕=>帶參數跳轉過來，才展示驗證彈窗)
					const urlVars = getUrlVars();
					if (urlVars['IWMM'] && resultCode === 'IS_IWMM') {
						this.setState({
							type: 'realyname'
						});
					} else {
						//不用展示銀行卡驗證，直接跳至存款頁(網址參數也要帶著移動)
						redirectToDeposit(urlVarsToQueryString(urlVars, [ 'IWMM' ], false), true);
					}
				}
			})
			.catch((errorCode) => {
				Toast.destroy();
				//提示不同的錯誤訊息 隱密的 判斷錯誤原因
				if (errorCode === 'DATA_ERROR0') {
					Toast.error('请求失败，请刷新后重试.', 5);
				} else if (errorCode === 'NET_ERROR0') {
					Toast.error('请求失败，请嘗試刷新页面.', 5);
				} else {
					Toast.error('请求失败，请嘗試刷新', 5);
				}
			});
	};

	getMemberData = () => {
		this.MemberFlagsStatus();
	};

	closeOverTheLimitModal = () => {
		Router.push('/');
	};

	setLimitVisible = () => {
		this.setState({
			overTheLimitVisible: true
		});
	};

	render() {
		const { type, verifyType, overTheLimitVisible } = this.state;
		const { memberInfo } = this.props.userInfo;
		console.log(memberInfo);
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="账户验证"
				status={2}
				hasServer={true}
				barFixed={true}
				backEvent={() => {
					Modal.info({
						title: '',
						centered: true,
						okText: '继续验证',
						cancelText: '离开',
						className: `VerificationBankModal`,
						content: (
							<React.Fragment>
								<center>
									<ReactIMG src="/img/verify/warn.png" />
								</center>
								<div className="note">
									您需要完成验证流程以进入存款页面，<br /> 您确认要离开该页面吗？
								</div>
							</React.Fragment>
						),
						onOk: () => {},
						onCancel: () => {
							Router.push('/');
						}
					});
				}}
			>
				<div className="Verify-box DepositVerify">
					<center className="note">
						<ReactIMG src="/img/deposit/YZ.svg" />
						<p>
							{type === 'phone' ? (
								'您好，为了您的账户安全，请填写您的真实姓名并验证您的手机号码。真实姓名一旦填写即不能随意更改，请确保您填写的姓名与您银行账户持有者姓名一致，以利存款快速到账'
							) : null}
							{type === 'realyname' ? '请确保您在提交前输入正确的信息，以免延误。' : null}
						</p>
						{type === 'realyname' && (
							<React.Fragment>
								<p>
									如需帮助，请联系
									<span style={{ color: '#00AEEF' }} onClick={this.PopUpLiveChat}>
										在线客服
									</span>
								</p>
							</React.Fragment>
						)}
					</center>
					<div className="Content bankcard_vrf">
						{type === 'realyname' && (
							<RealyName
								onRef={(ref) => (this.userInfoContent = ref)}
								onCancel={() => this.setState({ isOpenRealyName: false })}
								onChangeName={(v) => this.setState({ realyName: v })}
								realyNameVisible={true}
								getMemberData={() => {
									this.props.userInfo_getDetails();
									this.getMemberData();
								}}
								memberInfo={memberInfo}
								key={type}
								OTPCountdownTime={5}
								phoneNumber={memberInfo.Phone}
								PopUpLiveChat={() => {
									PopUpLiveChat();
								}}
								setLimitVisible={() => {
									this.setLimitVisible();
								}}
							/>
						)}
						{type === 'phone' && (
							<VerifyPhone
								type={type}
								verifyType={verifyType}
								memberInfo={memberInfo}
								phoneNumber={memberInfo.Phone}
								OTPCountdownTime={5}
								onCancel={this.closeVerifyModal}
								changeVerifyType={this.changeVerifyType}
								phoneTryLimit={this.state.phoneTryLimit}
								PopUpLiveChat={() => {
									PopUpLiveChat();
								}}
								setLimitVisible={() => {
									this.setLimitVisible();
								}}
								getMemberData={() => {
									this.props.userInfo_getDetails();
									this.getMemberData();
								}}
								key={type}
							/>
						)}

						<div className="nocheck-box">
							<div
								className="nocheck"
								onClick={() => {
									Modal.info({
										title: '',
										centered: true,
										okText: '继续验证',
										cancelText: '离开',
										className: `commonModal VerificationModal`,
										content: (
											<React.Fragment>
												<center>
													<ReactSVG src="/img/svg/note.svg" className="Modalicon" />
												</center>
												{type === 'phone' ? (
													<div className="note">
														<small>
															请填写您的真实姓名并完成手机号码验证可确保<br />账号安全和存款快速到账。
														</small>
													</div>
												) : null}
												{type === 'realyname' ? (
													<div className="note">验证成功后可享有更多存款和提款方式。</div>
												) : null}
											</React.Fragment>
										),
										onOk: () => {
											console.log('继续验证');
										},
										onCancel: () => {
											let page = getUrlVars()['page'];
											if (page && page == 'Withdrawal') {
												Router.replace('/withdrawal');
												return;
											}
											if (type === 'phone') {
												// Pushgtagdata('Verification', 'Click', 'Confirm_Skip_Phone_DepositPage');
												Router.replace('/');
											} else if (type === 'realyname') {
												// Pushgtagdata('Verification', 'Click', 'Confirm_Skip_PII_DepositPage');
												//不用展示銀行卡驗證，直接跳至存款頁(網址參數也要帶著移動)
												redirectToDeposit(
													urlVarsToQueryString(getUrlVars(), [ 'IWMM' ], false),
													true
												);
											}
										}
									});
								}}
							>
								跳过验证
							</div>
						</div>
					</div>
				</div>
				<Modal
					className="verify__notice__modal"
					visible={overTheLimitVisible}
					onCancel={this.closeOverTheLimitModal}
					closable={false}
					animation={false}
					mask={false}
				>
					<div className="header-wrapper header-bar">
						<ReactSVG
							className="back-icon"
							src="/img/svg/LeftArrow.svg"
							onClick={this.closeOverTheLimitModal}
						/>
						<span>账户验证</span>
						<div className="header-tools-wrapper">
							<Service />
						</div>
					</div>
					<div className="verify__overTime">
						<ReactIMG src="/img/verify/warn.png" />
						<div className="verify__overTime__title">超过尝试次数</div>
						<div className="verify__overTime__desc">
							您已超过5次尝试，请24小时后再尝试<br />或 联系在线客服。
						</div>
						<Button
							className={`verifyBtn_notice`}
							onClick={() => {
								PopUpLiveChat();
							}}
						>
							联系在线客服
						</Button>
					</div>
				</Modal>
			</Layout>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

const mapDispatchToProps = {
	userInfo_getDetails: () => ACTION_User_getDetails()
};

export default withBetterRouter(connect(mapStateToProps, mapDispatchToProps)(Verify));

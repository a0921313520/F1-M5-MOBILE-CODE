import React, { Component } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/View/Modal';
import SecurityNotice from '@/components/register_login/securityNotice';
import VerifyPhone from '@/components/OTP/VerifyPhone';
import VerifyMail from '@/components/OTP/VerifyMail';
import ChangePwd from '@/components/register_login/ChangePwd';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import Toast from '@/components/View/Toast';
import Router from 'next/router';
import { ReactSVG } from '@/components/View/ReactSVG';
import Service from '@/components/Header/Service';
import ReactIMG from '@/components/View/ReactIMG';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { setIsLogout, redirectToLogin } from '@/lib/js/util';
import { connect } from 'react-redux';
import { otpServiceActionList } from '@/lib/js/Helper';
class Verify extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			type: 'loginOTP', //loginOTP, resetpwd
			noiceVisible: false,
			verifyModalVisible: false,
			verifyType: '',
			resetpwdStep: 1,
			memberInfo: {},
			phoneTryLimit: 5,
			mailTryLimit: 5,
			overTheLimitVisible: false,

			phoneCountdownNum: -1,
			phoneShowResendWord: false,

			mailCountdownNum: -1,
			mailShowResendWord: false,
			phoneDisable: false,
			emailDisable: false
		};
	}

	componentDidMount() {
		// let url = location.href;
		// if (url.indexOf('?') != -1) {
		// 	var ary1 = url.split('?')[1].split('&')[0].split('=')[1];
		// 	console.log("🚀 ~ file: index.js:48 ~ Verify ~ componentDidMount ~ ary1:", ary1)
		// 	if ((ary1 !== '' && ary1 === 'loginOTP') || ary1 === 'resetpwd') {
		// 		this.setState({
		// 			type: ary1
		// 		});
		// 	} else {
		// 		this.setState({
		// 			type: 'loginOTP'
		// 		});
		// 	}
		// }
		const params = new URLSearchParams(window.location.search);
		const type = params.get("type");
		if(type && ["loginOTP","resetpwd"].some((item)=>item === type)){
			this.setState({
				type
			});
		}
		this.props.userInfo_getDetails();
		["loginOTP","resetpwd"].some((item)=>item === type) && this.GetInitialAttempt(type);
	}

	componentWillUnmount() {
		clearInterval(this.mailIntervalNum);
		clearInterval(this.phoneIntervalNum);
	}
	GetInitialAttempt(type) {
		Toast.loading();
		let serviceAction = type === 'resetpwd' ? 'Revalidate' : 'OTP';
		fetchRequest(ApiPort.VerificationAttempt + `channelType=SMS&serviceAction=${serviceAction}&`, 'GET')
		.then((data) => {
			Toast.destroy();
			if (data.isSuccess) {
				if (data.isSuccess) {
					this.setState({
						phoneTryLimit: data.result.attempt
					})
				}
			}
		})
		.catch((err) => {
			Toast.destroy();
		});
		fetchRequest(ApiPort.VerificationAttempt + `channelType=Email&serviceAction=${serviceAction}&`, 'GET')
		.then((data) => {
			Toast.destroy();
			if (data.isSuccess) {
				if (data.isSuccess) {
					this.setState({
						mailTryLimit: data.result.attempt
					})
				}
			}
		})
		.catch((err) => {
			Toast.destroy();
		});
	}

	GetVerificationAttempt =(callback)=> {
		Toast.loading();
		let channelType = this.state.verifyType == 'phone' ? 'SMS' : 'Email';
		let serviceAction = this.state.type == 'loginOTP' ? 'OTP' : 'Revalidate';
		fetchRequest(ApiPort.VerificationAttempt + `channelType=${channelType}&serviceAction=${serviceAction}&`, 'GET')
			.then((data) => {
				Toast.destroy();
				if (data.isSuccess) {
					this.setState({
						phoneTryLimit: data.result.attempt,
						mailTryLimit: data.result.attempt,
						remainingAttempt: data.result.attempt
					});
					if (data.result.attempt == 0) {
						this.setState({
							overTheLimitVisible: true
						});
					}
					else if(this.state.verifyType == 'phone' && data?.result?.attempt){
						typeof callback === "function" && callback(data.result.attempt)
					}
				}
			})
			.catch((err) => {
				Toast.destroy();
			});
	}

	closeModal = () => {
		//console.log('hi');
		this.setState({ noiceVisible: false, verifyType: '' });
	};

	changeVerifyType = () => {
		const {verifyType} = this.state;
		const targetPiwikTitle = verifyType === 'phone' ? "Email" : "Phone"
		this.setState({
			// verifyType: verifyType === 'phone' ? 'mail' : 'phone'
			verifyModalVisible:false
		});
		Pushgtagdata(
			`OTP_Verfication`, 
			`Switch to ${targetPiwikTitle} Verification`, 
			`OTP_Verfication_C_Change_Verification`);
	};

	goChangePwd = () => {
		this.setState({
			resetpwdStep: 2
		});
	};

	closeVerifyModal = () => {
		this.setState({
			verifyModalVisible: false
		});
		this.props.userInfo_getDetails();
	};

	closeOverTheLimitModal = () => {
		this.setState({
			overTheLimitVisible: false,
			verifyModalVisible: false
		});
	};

	initState = () => {
		this.setState({
			verifyModalVisible: false,
			verifyType: '',
			resetpwdStep: 1
		});
	};

	mailTryCalc = () => {
		this.setState(
			(prevState) => {
				return {
					mailTryLimit: --prevState.mailTryLimit
				};
			},
			() => this.checkMailLimit()
		);
	};

	checkPhoneLimit = () => {
		if (this.state.phoneTryLimit === 0) {
			this.closeVerifyModal();
			this.setState({
				overTheLimitVisible: true
			});
		}
	};

	checkMailLimit = () => {
		if (this.state.mailTryLimit === 0) {
			this.closeVerifyModal();
			this.setState({
				overTheLimitVisible: true
			});
		}
	};

	phoneLimitToZero = () => {
		this.setState(
			{
				phoneTryLimit: 0
			},
			this.checkPhoneLimit()
		);
	};

	mailLimitToZero = () => {
		this.setState(
			{
				mailTryLimit: 0
			},
			this.checkMailLimit()
		);
	};

	PopUpLiveChat = () => {
		this.FUN88Live && this.FUN88Live.close();
		this.FUN88Live = window.open(
			'about:blank',
			'chat',
			'toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=540, height=650'
		);
		fetchRequest(ApiPort.GETLiveChat).then((res) => {
			if (res.isSuccess) {
				localStorage.setItem('serverUrl', res.result);
				this.openServer(res.result);
			}
		});
	};

	openServer = (serverUrl) => {
		this.FUN88Live.document.title = 'FUN88在线客服';
		this.FUN88Live.location.href = serverUrl;
		this.FUN88Live.focus();
	};

	makeNumInterval = (type) => {
		let countdownNum = 60;
		this[`${type}IntervalNum`] = setInterval(() => {
			//console.log(countdownNum);
			//console.log(this.state);
			if (countdownNum !== 0) {
				countdownNum--;
				this.setState({
					countdownNum
				});
				this.setState({
					[`${type}CountdownNum`]: countdownNum,
				});
			} else {
				this.setState({
					[`${type}CountdownNum`]: -1,
					[`${type}ShowResendWord`]: true
				});
				clearInterval(this[`${type}IntervalNum`]);
			}
		}, 1000);
	};

	limitMax = () => {
		this.setState({overTheLimitVisible: true, verifyModalVisible: false})
	}

	render() {
		const {
			type,
			verifyType,
			noiceVisible,
			resetpwdStep,
			verifyModalVisible,
			overTheLimitVisible,
			phoneTryLimit,
			mailTryLimit,
		} = this.state;
		const { memberInfo } = this.props.userInfo;
		const { Phone, email } = memberInfo;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				status={0}
			>
				<div className="header-wrapper header-bar" style={{ justifyContent: 'center' }}>
					<span>{type === 'loginOTP' ? 'Xác Thực Tài Khoản' : 'Xác Thực Tài Khoản'}</span>
					<div className="header-tools-wrapper">
						<Service />
					</div>
				</div>
				<div className="verify-container">
					<div className="verify__topBox">
						{type === 'resetpwd' && <div className="verify__topBox__title">Xác Thực Để Bảo Vệ Tài Khoản</div>}
						<div className="verify__topBox__content">Vui lòng xác thực thông tin để đảm bảo tài khoản của bạn được an toàn và bảo mật thông tin, chống đánh cắp thông tin và giảm rủi ro khi giao dịch.</div>
						<div className="verify__topBox__btnWrap">
							<button onClick={() => {this.setState({ noiceVisible: true }); Pushgtagdata('Login_Security_Verification', 'Learn more', 'Login_Security_Verification_V_More');}}>Tìm Hiểu Thêm</button>
						</div>
					</div>
					<div className="verify__main">
						{phoneTryLimit != 0 &&
							<div className="verify__main__item">
								<ReactIMG src="/img/verify/phone.png" alt="" />
								<button
									onClick={() => {
										this.setState(
											{
												verifyModalVisible: true,
												verifyType: 'phone'
											},
											() => {
												this.GetVerificationAttempt();
												Pushgtagdata('Login_Security_Verification', 'Select Phone OTP', 'Login_Security_Verification_C_Phone');
											}
										);

										// Pushgtagdata(`Verification`, 'Click', `Phone_LoginOTP`);
									}}
								>
									Xác Thực Qua Số Điện Thoại
								</button>
							</div>
						}
						{mailTryLimit != 0 &&
							<div className="verify__main__item">
								<ReactIMG src="/img/verify/mail.png" alt="" />
								<button
									onClick={() => {
										this.setState(
											{
												verifyModalVisible: true,
												verifyType: 'mail'
											},
											() => {
												this.GetVerificationAttempt();
												Pushgtagdata('Login_Security_Verification', 'Select Email OTP', 'Login_Security_Verification_C_Email');
												
											}
										);
										// Pushgtagdata(`Verification`, 'Click', `Email_LoginOTP`);
									}}
								>
									Xác Thực Qua Email
								</button>
							</div>
						}
						{mailTryLimit == 0  && phoneTryLimit == 0 && 
							<div className="verify__main__item">
								<ReactIMG src="/img/verify/cs.png" alt="" />
								<button onClick={this.PopUpLiveChat}>Liên Hệ Live Chat</button>
							</div>
						}

					</div>
					<br />
					<br />
					<br />
					<center
						className="blue"
						onClick={() => {
							Pushgtagdata('Login_Security_Verification', 'Skip Verification', 'Login_Security_Verification_C_Skip');
							// if (process.env.NODE_ENV != 'production') {
							// 	Router.push('/');
							// 	sessionStorage.setItem('skipVerification', true);
							// } else {
								setIsLogout();
								Router.push('/');
							// }
						}}
					>
						Xác Thực Sau 
					</center>
				</div>
				<Modal
					className="verify__notice__modal"
					visible={noiceVisible}
					onCancel={this.closeModal}
					closable={false}
					animation={false}
					mask={false}
				>
					<SecurityNotice type={type} onCancel={this.closeModal} />
				</Modal>
				<Modal
					className="verify__notice__modal"
					visible={verifyModalVisible}
					onCancel={this.closeVerifyModal}
					closable={false}
					animation={false}
					mask={false}
				>
					<div className="header-wrapper header-bar">
						{resetpwdStep !== 2 && (
							<ReactSVG className="back-icon" src="/img/svg/LeftArrow.svg" onClick={this.closeVerifyModal} />
						)}

						<span>{resetpwdStep === 1 ? verifyType === 'phone' ? 'Xác Thực Qua Số Điện Thoại' : 'Xác Thực Qua Email' : 'Đặt Lại Mật Khẩu'}</span>
						<div className="header-tools-wrapper">
							<Service />
						</div>
					</div>
					{verifyType === 'phone' &&
					resetpwdStep === 1 && (
						<VerifyPhone
							type={type}
							ServiceAction={otpServiceActionList[type]}
							verifyType={verifyType}
							memberInfo={memberInfo}
							phoneNumber={Phone}
							onCancel={this.closeVerifyModal}
							changeVerifyType={this.changeVerifyType}
							goChangePwd={this.goChangePwd}
							phoneTryLimit={this.state.phoneTryLimit}
							phoneTryCalc={this.GetVerificationAttempt}
							limitToZero={this.phoneLimitToZero}
							countdownNum={this.state.phoneCountdownNum}
							isShowResendWord={this.state.phoneShowResendWord}
							makeNumInterval={this.makeNumInterval}
							limitMax={this.limitMax}
							PopUpLiveChat={() => {
								this.PopUpLiveChat();
							}}
							setPhoneAttemptRemaining={(v)=>{this.setState({phoneTryLimit:v})}}
						/>
					)}
					{verifyType === 'mail' &&
					resetpwdStep === 1 && (
						<VerifyMail
							changeVerify={true}
							type={type}
							ServiceAction={otpServiceActionList[type]}
							verifyType={verifyType}
							memberInfo={memberInfo}
							email={email}
							onCancel={this.closeVerifyModal}
							changeVerifyType={this.changeVerifyType}
							goChangePwd={this.goChangePwd}
							mailTryLimit={this.state.mailTryLimit}
							mailTryCalc={this.mailTryCalc}
							limitToZero={this.mailLimitToZero}
							countdownNum={this.state.mailCountdownNum}
							isShowResendWord={this.state.mailShowResendWord}
							makeNumInterval={this.makeNumInterval}
							limitMax={this.limitMax}
							PopUpLiveChat={() => {
								this.PopUpLiveChat();
							}}
							RouterUrl={'/'}
							setEmailAttemptRemaining={(v)=>this.setState({EmailTryLimit:v})}
						/>
					)}
					{resetpwdStep === 2 && (
						<ChangePwd
							type={type}
							verifyType={verifyType}
							memberInfo={memberInfo}
							onCancel={this.initState}
							changeVerifyType={this.changeVerifyType}
						/>
					)}
				</Modal>

				<Modal
					className="verify__notice__modal"
					visible={overTheLimitVisible}
					onCancel={this.closeOverTheLimitModal}
					closable={false}
					animation={false}
					mask={false}
				>
					<div className="header-wrapper header-bar">
						{resetpwdStep !== 2 && (
							<ReactSVG
								className="back-icon"
								src="/img/svg/LeftArrow.svg"
								onClick={this.closeOverTheLimitModal}
							/>
						)}

						<span>Xác Thực Qua Số Điện Thoại</span>
						<div className="header-tools-wrapper">
							<Service />
						</div>
					</div>
					<div className="verify__overTime">
						<ReactIMG src="/img/verify/warn.png" />
						<div className="verify__overTime__title">Bạn Đã Vượt Quá Số Lần Xác Thực Cho Phép</div>
						<div className="verify__overTime__desc">Bạn đã vượt quá 5 lần xác thực cho phép. Vui lòng thử lại sau 24 giờ hoặc liên hệ 
							<span
								className="underline_a"
								onClick={() => {
									this.PopUpLiveChat();
								}}
								>
								&nbsp;Live Chat
							</span>
						</div>
						{/* <div className="footerBtn">
							<Button
								size="large"
								type="primary"
                                className="whitebtn"
								onClick={() => {
									this.setState({
										overTheLimitVisible: false
									});
								}}
							>
								关闭
							</Button>
							<Button
								size="large"
								type="primary"
								onClick={() => {
									this.PopUpLiveChat();
								}}
							>
								联系客服
							</Button>
						</div> */}
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

export default connect(mapStateToProps, mapDispatchToProps)(Verify);

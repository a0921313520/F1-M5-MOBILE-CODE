import React, { Component } from 'react';
import Input from '@/components/View/Input';
import Tabs, { TabPane } from 'rc-tabs';
import Layout from '@/components/Layout';
import { userName_reg, email_reg, email_reg_2 } from '@/lib/SportReg';
import { ReactSVG } from '@/components/View/ReactSVG';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import Toast from '@/components/View/Toast';
import Service from '@/components/Header/Service';

const content = {
	left: (
		<div
			onClick={() => {
				history.go(-1);
			}}
		>
			<ReactSVG className="forgetpwd-arrow-icon" src="/img/svg/LeftArrow.svg" />
		</div>
	),
	right: (
		<div
			className="login-cs-icon"
			onClick={() => {
				// Pushgtagdata(`CS`, 'Launch', `Livechat_Header`);
			}}
		>
			<Service />
		</div>
	)
};

export default class Forgetpwd extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			email: '',
			buttonStatus: false,
			tabType: '1', // 1=pwd, 2=username
			emailError: '',
			nameError: '',
			sentFail: false,
			usernameSent: false,
			pwdSent: false
		};
	}

	componentDidMount() {
		// window.Pushgtagdata && Pushgtagdata(window.location.origin, 'Launch', `forget_info`);
	}

	onChangeMail = (e) => {
		this.setState(
			{
				email: e.target.value
			},
			() => {
				//console.log('changeBtnStatus')
				this.changeBtnStatus();
			}
		);
	};

	onChangeName = (e) => {
		this.setState(
			{
				name: e.target.value
			},
			() => {
				this.changeBtnStatus();
			}
		);
	};

	changeBtnStatus = () => {
		const { email, name, tabType, nameError, emailError } = this.state;

		let checkInput;

		if (tabType === '1') {
			checkInput = name.trim() !== '' && email.trim() !== '' && (nameError === '' && emailError === '');
		}

		if (tabType === '2') {
			checkInput = email.trim() !== '' && emailError === '';
		}
		this.setState({
			btnStatus: checkInput ? true : false
		});
	};

	onClickTabs = (key) => {
		this.clearSentState();
		this.claerErrorMessage();
		this.setState({
			tabType: key,
			name: '',
			email: ''
		});
		
		if(key==="1"){ 
			Pushgtagdata("ForgetUsername","Go to Forget Password","ForgetUsername_C_ForgetPassword");
			global.Pushgtagpiwikurl && global.Pushgtagpiwikurl("forget_password","Forget Password")
		}
		if(key==="2"){ 
			Pushgtagdata("ForgetPassword","Go to Forget Username","ForgetPassword_C_ForgetName");
			global.Pushgtagpiwikurl && global.Pushgtagpiwikurl("forget_username","Forget Username")

		}
	};

	clearSentState = () => {
		this.setState({
			usernameSent: false,
			pwdSent: false,
			sentFail: false
		});
	};

	claerErrorMessage = () => {
		this.setState({
			emailError: '',
			nameError: ''
		});
	};

	claerNameEamil = () => {
		this.setState({
			email: '',
			name: ''
		});
	};

	postForget = () => {
		const { email, name, tabType } = this.state;

		this.clearSentState();
		Toast.loading('Đang cập nhật');
		if (tabType === '1') {
			let postData = {
				username: name,
				email: email
			};

			fetchRequest(`${ApiPort.ForgetPwd}`, 'POST', postData)
				.then((data) => {
					Pushgtagdata(
						"ForgetPassword",
						"Submit Reset Password",
						"ForgetPassword_S_ForgotPassword",
						data?.result?.isSuccess ? 2 : 1,
						[{
							customVariableKey: data?.result?.isSuccess ? false : "ForgetPassword_S_ForgotPassword_ErrorMsg",
							customVariableValue: data?.result?.isSuccess ? false : data?.result?.errorMessage
						}]
					);
					Toast.destroy();
					if (data.isSuccess) {
						this.setState({
							pwdSent: true
						});
					} else {
						this.setState({
							sentFail: true
						});
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}

		if (tabType === '2') {
			fetchRequest(`${ApiPort.ForgetUsername}email=${email}&`, 'POST')
				.then((data) => {
					Pushgtagdata(
						"ForgetUsername",
						"Submit Forget Username",
						"ForgetUsername_S_Email",
						data?.result ? 2 : 1,
						[{
							customVariableKey:data?.result ? false : "ForgetUsername_S_Email_ErrorMsg",
							customVariableValue: data?.result ? false : data?.result?.errorMessage
						}]
					);
					Toast.destroy();
					if (data.isSuccess) {
						this.setState({
							usernameSent: true
						});
					} else {
						this.setState({
							sentFail: true
						});
					}
				})
				.catch((err) => {
					//console.log(err);
				});
		}
	};

	mailOnBlur = () => {
		//console.log('blur')
		const { email, name, tabType } = this.state;
		const mailPrefixLessThanThree = email.split('@')[0].length < 3;
		const mailLengthError = email.length > 100;
		if (email.trim().length === 0) {
			this.setState(
				{
					emailError: 'Vui lòng điền địa chỉ email'
				},
				() => this.changeBtnStatus()
			);
			return;
		}
		if (!email_reg.test(email) || !email_reg_2.test(email) || mailPrefixLessThanThree || mailLengthError) {
			this.setState(
				{
					emailError: 'Vui lòng điền địa chỉ email hợp lệ'
				},
				() => this.changeBtnStatus()
			);
			return;
		} else {
			this.setState(
				{
					emailError: ''
				},
				() => this.changeBtnStatus()
			);
		}
	};

	nameOnBlur = () => {
		const { email, name, tabType } = this.state;
		if (tabType === '1') {
			if (name.trim().length === 0) {
				this.setState(
					{
						nameError: 'Vui lòng điền tên đăng nhập'
					},
					() => this.changeBtnStatus()
				);
				return;
			}
			else if (!userName_reg.test(name)) {
				this.setState(
					{
						nameError: 'Vui lòng điền tên đăng nhập hợp lệ'
					},
					() => this.changeBtnStatus()
				);
				return;
			} else {
				this.setState(
					{
						nameError: ''
					},
					() => this.changeBtnStatus()
				);
			}
		}
	};

	render() {
		const { email, name, btnStatus, tabType, emailError, nameError, usernameSent, pwdSent, sentFail } = this.state;
		console.log(tabType);
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				status={0}
			>
				<div className="forgetpwd__main">
					<Tabs
						// className="tabs tabs__header"
						prefixCls="tabsOval"
						defaultActiveKey={tabType}
						onChange={this.onClickTabs}
						tabBarExtraContent={content}
					>
						<TabPane tab="Quên Mật khẩu" key="1">
							{pwdSent && <div className="success-text">Link cập nhật mật khẩu đã được gửi vào email của bạn, vui lòng kiểm tra email đã đăng ký</div>}
							{sentFail && <div className="warn-text">Email hoặc Tên Đăng Nhập không hợp lệ, vui lòng thử lại</div>}
							<Input
								type="text"
								placeholder="Địa chỉ Email"
								value={email}
								onChange={this.onChangeMail}
								onBlur={this.mailOnBlur}
								style={{ borderColor: emailError !== '' ? '#eb2121' : 'gainsboro' }}
							/>
							{emailError !== '' && <div className="warn-text">{emailError}</div>}
							<Input
								type="text"
								placeholder="Tên đăng nhập"
								value={name}
								maxLength={20}
								onChange={this.onChangeName}
								onBlur={this.nameOnBlur}
								style={{ borderColor: nameError !== '' ? '#eb2121' : 'gainsboro' }}
							/>
							{nameError !== '' && <div className="warn-text">{nameError}</div>}
						</TabPane>
						<TabPane tab="Quên Tên đăng nhập" key="2">
							{usernameSent && <div className="success-text">Tên đăng nhập đã được gửi thành công đến Địa chỉ email của bạn</div>}
							{sentFail && <div className="warn-text">Email không hợp lệ, vui lòng thử lại</div>}
							<Input
								type="text"
								placeholder="Địa chỉ Email"
								value={email}
								onChange={this.onChangeMail}
								onBlur={this.mailOnBlur}
								style={{ borderColor: emailError !== '' ? '#eb2121' : 'gainsboro' }}
							/>
							{emailError !== '' && <div className="warn-text">{emailError}</div>}
						</TabPane>
					</Tabs>

					<div className="login__button">
						<button
							className={`login__btn__submit ${!btnStatus ? 'btn-disable' : ''}`}
							disabled={!btnStatus}
							onClick={() => {
								this.postForget();
								if (this.state.tabType == '1') {
									// Pushgtagdata(`Navigation`, 'Submit', `Submit_ForgetPW`);
								} else {
									// Pushgtagdata(`Navigation`, 'Submit', `Submit_ForgetUN`);
								}
							}}
						>
							Gửi
						</button>
					</div>
				</div>
			</Layout>
		);
	}
}

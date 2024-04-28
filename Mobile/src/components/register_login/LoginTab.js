/*
 * @Author: Alan
 * @Date: 2022-06-08 17:40:44
 * @LastEditors: Alan
 * @LastEditTime: 2022-11-21 09:20:46
 * @Description: 头部注释
 * @FilePath: \Mobile\src\components\Login\LoginTab.js
 */
import React, { Component, Fragment } from 'react';
import Input from '@/components/View/Input';
import { Cookie } from '@/lib/js/Helper';
import { ReactSVG } from '@/components/View/ReactSVG';
import Router from 'next/router';
import { withBetterRouter } from '@/lib/js/withBetterRouter';
import ReactIMG from '@/components/View/ReactIMG';
import { checkIsLogin } from '@/lib/js/util';
import Flexbox from '@/components/View/Flexbox/';
import Checkbox from '@/components/View/Checkbox';
import { BsCheckSquareFill } from 'react-icons/bs';
import ReactCaptcha from '@/components/Captcha/ReactCaptcha';
import Item from '@/components/Deposit/depositComponents/Item';
import { userName_reg, password_reg } from '@/lib/SportReg';
class TabLogin extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			password: '',
			loginNameStatus: '',
			loginPwdStatus: '',
			btnStatus: false,
			loginError: false,
			errorMessage: '',
			iconName: 'close',
			inputType: 'password'
		};
	}

	componentDidMount() {
		//歐洲杯跳轉處理，保存到localstorage
		// const { query } = this.props.router;
		// const from = query.from;
		// if (from && from.toLowerCase() === 'ec2021') {
		// 	localStorage.setItem('fromurl', '/ec2021');
		// } else {
		// 	localStorage.removeItem('fromurl'); //清除
		// }

		if (checkIsLogin()) {
			const fromurl = localStorage.getItem('fromurl');
			if (fromurl && fromurl.length > 0) {
				localStorage.removeItem('fromurl'); //清除
				window.location.href = fromurl;
			} else {
				Router.push('/');
			}
		}
		this.loadAccountInfo();
		// window.Pushgtagdata && Pushgtagdata(window.location.origin, 'Launch', `login`);
	}

	componentDidUpdate(prevProps) {
		if (this.props.loginError !== prevProps.loginError) {
			this.setState({
				loginError: this.props.loginError
			});
		}
	}

	//登录
	login = (showCaptcha) => {
		console.log(showCaptcha, 'showCaptcha')
		const { name, password, btnStatus } = this.state;
		if (name.trim().length === 0) {
			this.setState({ loginError: true });
			return;
		}
		if (password.trim().length === 0) {
			this.setState({ loginError: true });
			return;
		}

		if (!btnStatus) return;

		let Times = this.Captcha ? this.Captcha.state.attempts : 3;
		if (this.Captcha) {
			this.Captcha.getCaptchaInfo(name);
		}
		if (showCaptcha && localStorage.getItem(`${name}_errorTimes`) >= Times) {
			this.setState({
				captchaVisible: true
			});
			return;
		}
		this.props.postLogin(name, password);
		console.log(this.Captcha, 'this.Captcha')
		let accountInfo = Boolean(Cookie.Get('accountInfo'));
		if (Boolean(accountInfo)) {
			this.handleChecked(true);
		}
	};

	changeIconName = () => {
		if (this.state.iconName === 'open') {
			this.setState({
				iconName: 'close',
				inputType: 'password'
			});
		} else {
			this.setState({
				iconName: 'open',
				inputType: 'text'
			});
		}
	};

	changeBtnStatus = () => {
		const { name, password, loginError } = this.state;

		if (!name || !password || loginError ) {
			this.setState({
				btnStatus: false
			});
			return;
		}
		this.setState({
			btnStatus: true
		});
	};

	onChangeName = (e) => {
		this.setState(
			{	
				namefilled: true,
				name: e.target.value
			},
			() => {
				this.checkInput('name');
			}
		);
	};

	onChangePwd = (e) => {
		//console.log(e.target.value);
		this.setState(
			{
				pwdFilled: true,
				password: e.target.value
			},
			() => {
				this.checkInput('password');
			}
		);
	};

	checkInput = (type) => {
		const { name, password, loginError } = this.state;

		if (type === 'name') {
			if ((name && !userName_reg.test(name)) || (password && !password_reg.test(password))) {
				this.setState({ loginError: true }, () => this.changeBtnStatus());
			} else {
				this.setState({ loginError: false }, () => this.changeBtnStatus());
			}
			// if (password.trim().length !== 0) {
			// 	this.setState({ loginError: '' }, () => {
			// 		this.changeBtnStatus();
			// 	});
			// }
			// if (name.trim().length === 0) {
			// 	this.setState({ loginError: '用户名格式无效​' }, () => {
			// 		this.changeBtnStatus();
			// 	});
			// }
		}

		if (type === 'password') {
			if ((name && !userName_reg.test(name)) || (password && !password_reg.test(password))) {
				this.setState({ loginError: true }, () => this.changeBtnStatus());
			} else {
				this.setState({ loginError: false }, () => this.changeBtnStatus());
			}
			this.changeBtnStatus();
			// if (name.trim().length !== 0) {
			// 	this.setState({ loginError: '' }, () => {
			// 		this.changeBtnStatus();
			// 	});
			// }
			// if (password.trim().length === 0) {
			// 	this.setState({ loginError: '请输入您的密码。' }, () => {
			// 		this.changeBtnStatus();
			// 	});
			// }
		}
	};

	OnBlur = () => {
		const { name, password } = this.state;
		if ((name && !userName_reg.test(name)) || (password && !password_reg.test(password))) {
			this.setState({ loginError: true }, () => this.changeBtnStatus());
		} else {
			this.setState({ loginError: false }, () => this.changeBtnStatus());
		}
		// if (name.trim().length === 0 && password.trim().length === 0) {
		// } else if (name.trim().length === 0) {
		// 	this.setState({ loginError: '用户名格式无效​' }, () => this.changeBtnStatus());
		// } else if (password.trim().length === 0) {
		// 	this.setState({ loginError: '请输入您的密码。' }, () => this.changeBtnStatus());
		// } else {
		// 	this.setState({ loginError: '' }, () => this.changeBtnStatus());
		// }
	};

	//判断cookie中是否有账号信息，有就可以进行预填写，没有则直接返回
	loadAccountInfo = () => {
		let getCookie = Cookie.Get('accountInfo');
		let accountInfo = Boolean(getCookie);
		console.log(accountInfo);
		if (Boolean(accountInfo) == false) {
			return false;
		} else {
			let userName = '';
			let passWord = '';
			let typeLogin = '';
			let i = new Array();
			i = getCookie.split('&');
			(userName = i[0]), (passWord = i[1]), (typeLogin = i[2]);
			this.setState({
				name: userName,
				password: passWord,
				rememberPassword: true,
				typeLogin: typeLogin
			});
		}
	};

	handleChecked = (value) => {
		//记住密码
		if (value) {
			Pushgtagdata(`Login`, 'Toggle Remember Username', `Login_C_RememberMe​`);
			//是否保存密码
			let accountInfo = this.state.name + '&' + this.state.password + '&' + this.state.typeLogin;
			Cookie.Create('accountInfo', accountInfo, 3);
		} else {
			let accountInfo = Boolean(Cookie.Get('accountInfo'));
			if (Boolean(accountInfo) == false) {
				return false;
			}
			Cookie.Delete('accountInfo');
		}
	};

	onMatch = (challengeUuid) => {
		this.setState(
			{
				challengeUuid: challengeUuid,
				captchaVisible: false
			},
			() => {
				this.login(false);
			}
		);
	};

	closeCaptcha = () => {
		this.setState({
			captchaVisible: false
		});
	};
	render() {
		const { name, password, btnStatus, loginError, iconName, namefilled, pwdFilled } = this.state;
		const {isWrongMarket, isPasswordIncorrect, confiscatedAcc} = this.props;
		return (
			<Fragment>
				<div className="login_main">
					{(loginError || isWrongMarket ||isPasswordIncorrect) && !confiscatedAcc && <div className="login__error">Tên đăng nhập hoặc mật khẩu không hợp lệ</div>}
					{confiscatedAcc && <div className="login__error">Tài Khoản của bạn đã bị khóa. Vui Lòng liên hệ Live Chat để được hỗ trợ</div>}
					<Item errorMessage={name.length == 0 && namefilled? 'Vui lòng điền Tên đăng nhập' : ''}>
						<Input
							type="text"
							placeholder="Tên đăng nhập"
							prefix={<ReactSVG className="loginSVG" src={`/img/svg/login/user.svg`} />}
							value={name}
							onChange={this.onChangeName}
							maxLength={20}
							onBlur={this.OnBlur}
							onFocus={this.OnBlur}
						/>

					</Item>
					<Item errorMessage={password.length == 0 && pwdFilled ? 'Vui lòng điền Mật khẩu' : ''}>
						<Input
							placeholder="Mật khẩu"
							value={password}
							prefix={<ReactSVG className="loginSVG" src={`/img/svg/login/lock.svg`} />}
							suffix={
								<ReactSVG
									className={`loginSVG login__pwd__${iconName}`}
									src={`/img/svg/login/eyes-${iconName}.svg`}
									onClick={this.changeIconName}
								/>
							}
							type={this.state.inputType}
							onChange={this.onChangePwd}
							maxLength={20}
							onBlur={this.OnBlur}
							onFocus={this.OnBlur}
						/>

					</Item>
					<Flexbox className="login__forget" justifyContent="space-between" alignItems="center">
						<div>
							<Checkbox
								icon={<BsCheckSquareFill color="#00A6FF" size={18} />}
								checked={this.state.rememberPassword}
								onChange={(value) => {
									this.setState({
										rememberPassword: value
									});
									this.handleChecked(value);
								}}
								label="Ghi Nhớ"
							/>
						</div>
						<a
							onClick={() => {
								Router.push('/forget-password');
								Pushgtagdata(`Login`, 'Go to Forget Password', `Login_C_ForgetPassword​`);
							}}
						>
							Quên Mật khẩu/Tên đăng nhập?
						</a>
					</Flexbox>
					<div className="login__button">
						<button
							className={`login__btn__submit ${!btnStatus ? 'btn-disable' : ''}`}
							disabled={!btnStatus}
							onClick={() => {
								this.login(true);
							}}
						>
							Đăng Nhập
						</button>
					</div>

					<div
						onClick={() =>
							Router.push({
								pathname: '/verify',
								query: { type: 'resetpassword' }
							})}
					/>
					<center
						className="walkfirst"
						onClick={() => {
							Pushgtagdata(`Login`, 'Go to Guest View', `Login_C_GuestView​`);
							Router.push({
								pathname: '/'
							});
						}}
					>
						<h4>Giao Diện Dùng Thử </h4>
					</center>
					<div className="login__footer">
						<div className="login__footer__box">
							<ReactIMG src="/img/NUFC.png" />
							<div className="login__footer__text">
								<p>Nhà tài trợ áo đấu chính thức</p>
								<p>câu lạc bộ Newcastle</p>
							</div>
						</div>
						<div className="login__footer__box">
							<ReactIMG src="/img/unnamed.png" />
							<div className="login__footer__text">
								<p>Đối tác cá cược chính thức tại Châu Á</p>
								<p>câu lạc bộ Tottenham Hotspur</p>
							</div>
						</div>
					</div>
					{/* 滑动验证 */}
					<ReactCaptcha
						visible={this.state.captchaVisible}
						onMatch={(e) => {
							this.onMatch(e);
						}}
						tabKey={this.props.tabKey}
						close={this.closeCaptcha}
						getCaptchaInfo={(props) => {
							this.Captcha = props;
						}}
					/>
				</div>
			</Fragment>
		);
	}
}

export default withBetterRouter(TabLogin);

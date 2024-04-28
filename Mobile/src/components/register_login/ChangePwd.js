import React, { Component } from 'react';
import Input from '@/components/View/Input';
import Progressbar from '@/components/View/Progressbar';
import { ReactSVG } from '@/components/View/ReactSVG';
import { userName_reg, password_reg, phone_reg, email_reg } from '@/lib/SportReg';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import Toast from '@/components/View/Toast';
import Router from 'next/router';
import { Cookie } from '@/lib/js/Helper';
import Modal from '@/components/View/Modal';
import ReactIMG from '@/components/View/ReactIMG';
import Button from '@/components/View/Button';
import { setIsLogout, redirectToLogin } from '@/lib/js/util';
export default class ChangePwd extends Component {
	constructor(props) {
		super(props);
		this.state = {
			pwd: '',
			pwdInputType: 'password',
			pwdIconName: 'close',
			confirmPwd: '',
			confirmPwdInputType: 'password',
			confirmPwdIconName: 'close',
			pwdError: '',
			pwdConfirmError: '',
			countdownNum: 600,
			countdownNumMMSS: '',
			postError: false,
			postErrorText: '',
			passwordSuccessModal: false,
			expiredModal: false
		};
	}

	componentDidMount() {
		this.makeNumInterval();
		global.Pushgtagpiwikurl && global.Pushgtagpiwikurl("reset_password_reset","Reset Password")
		Toast.destroy();
	}

	changePwdIconName = () => {
		if (this.state.pwdIconName === 'open') {
			this.setState({
				pwdIconName: 'close',
				pwdInputType: 'password'
			});
		} else {
			this.setState({
				pwdIconName: 'open',
				pwdInputType: 'text'
			});
		}
	};

	changeConfirmPwdName = () => {
		if (this.state.confirmPwdIconName === 'open') {
			this.setState({
				confirmPwdIconName: 'close',
				confirmPwdInputType: 'password'
			});
		} else {
			this.setState({
				confirmPwdIconName: 'open',
				confirmPwdInputType: 'text'
			});
		}
	};

	onChangePwd = (e) => {
		if (!e.target.value.length) {
			this.setState({
				pwd: e.target.value,
				pwdError: "Mật khẩu mới không được để trống"
			},() => {
				this.changeBtnStatus();
			});
			return;
		}
		if (!password_reg.test(e.target.value)) {
			this.setState({
				pwd: e.target.value,
				pwdError: "Mật khẩu phải gồm 6-20 ký tự chữ và số 'A-Z', 'a-z', '0-9'. Có thể bao gồm 4 ký tự đặc biệt  ^ # $ @"
			},() => {
				this.changeBtnStatus();
			});
			return;
		} else {
			this.setState({
				pwd: e.target.value,
				pwdError: ''
			},
			() => {
				this.changeBtnStatus();
			});
		}

		if (this.state.confirmPwd.length && this.state.confirmPwd !== e.target.value) {
			this.setState({
				pwdConfirmError: 'Nhập lại mật khẩu mới không khớp'
			},() => {
				this.changeBtnStatus();
			});
			return;
		} else {
			this.setState({
				pwdConfirmError: ''
			},
			() => {
				this.changeBtnStatus();
			});
		}
	};

	onChangeConfirmPwd = (e) => {
		if (!e.target.value.length) {
			this.setState({
				confirmPwd: e.target.value,
				pwdConfirmError: 'Xác nhận mật khẩu là Bắt Buộc'
			},() => {
				this.changeBtnStatus();
			});
			return;
		}	
		if (this.state.pwd !== e.target.value) {
			this.setState({
				confirmPwd: e.target.value,
				pwdConfirmError: 'Nhập lại mật khẩu mới không khớp'
			},() => {
				this.changeBtnStatus();
			});
			return;
		} else {
			this.setState({
				confirmPwd: e.target.value,
				pwdConfirmError: ''
			},
			() => {
				this.changeBtnStatus();
			});
		}
	};

	changeBtnStatus = () => {
		const checkInput = this.state.pwdConfirmError == '' && this.state.pwdError == '';
		this.setState({
			btnStatus: checkInput ? true : false
		});
	};

	postChangePwd = () => {
		const { memberInfo } = this.props;

		const { pwd, confirmPwd } = this.state;
		let postData = {
			newPassword: pwd
			// oldPassword: pwd,
		};
		Pushgtagdata("ResetPassword", "Submit Reset Password", "ResetPassword_C_Reset");
		Toast.loading();
		//console.log(postData);
		fetchRequest(ApiPort.SetChangePassword, 'PUT', postData)
			.then((data) => {
				Toast.destroy();
				if (data.isSuccess) {
					this.setState({passwordSuccessModal: true})
					setTimeout(() => {
						this.setState({
							passwordSuccessModal: false
						})
						Modal.info({
							title: "Đặt Lại Mật Khẩu",
							centered: true,
							okText: "Đóng",
							className: `commonModal dont-show-close-button`,
							onlyOKBtn: true,
							type: 'confirm',
							icon: null,
							footer: null,
							content: (
								<div className="note">
									Bạn đã đặt lại mật khẩu thành công, vui lòng đăng nhập bằng mật khẩu mới!
								</div>
							),
							onOk: () => {
								setIsLogout();
								redirectToLogin();
							},
						});
					}, 3000)
					//这个是修改密码后，自动登录用到的
					let accountInfo = memberInfo.userName + '&' + pwd;
					Cookie.Create('UserInfo', accountInfo, 3);
					fetchRequest(ApiPort.Member, 'GET').then((res) => {
						if (res) {
							localStorage.setItem('LoginOTP', res.result.memberInfo.loginOTP);
							localStorage.setItem('Revalidate', res.result.memberInfo.revalidate);
							localStorage.setItem('memberInfo', JSON.stringify(res.result.memberInfo));
							// Router.push('/');
						}
					});
				} else {
					if(data?.result && data?.result?.Code === "MEM00145"){
						Modal.info({
							title: "Đặt Lại Mật Khẩu Không Thành Công",
							centered: true,
							okText: "Đóng",
							className: `commonModal dont-show-close-button modal-info-resetpwd`,
							onlyOKBtn: true,
							type: 'confirm',
							icon: null,
							footer: null,
							content: (
								<div className="note">
									Mật khẩu mới không thể trùng với mật khẩu cũ
								</div>
							),
							onOk: () => {},
						});
					}else {
						Toast.error(data.result.Message, 2);
					}
				}
			})
			.catch((err) => {
				Toast.destroy();
				//console.log(err);
			});
	};

	makeNumInterval() {
		function addZero(n) {
			return n < 10 ? '0' + n : n;
		}
		let countdownNum = this.state.countdownNum;
		this.intervalNum = setInterval(() => {
			if (countdownNum !== 0) {
				countdownNum--;
				this.setState({
					countdownNum
				});
				let min = addZero(Math.floor((countdownNum / 60) % 60));
				let sec = addZero(Math.floor(countdownNum % 60));
				this.setState({
					countdownNumMMSS: min + ':' + sec
				});
			} else {
				this.setState({
					expiredModal: true,
					countdownNum: 600
				});
				clearInterval(this.intervalNum);
			}
		}, 1000);
	}

	componentWillUnmount() {
		clearInterval(this.intervalNum);
	}
	render() {
		const {
			pwd,
			pwdIconName,
			pwdInputType,
			confirmPwd,
			confirmPwdInputType,
			confirmPwdIconName,
			btnStatus,
			pwdError,
			pwdConfirmError,
			countdownNumMMSS,
			postError,
			postErrorText
		} = this.state;

		return (
			<div id="ChangePwd">
				<Progressbar activeStep={2} />
				<div className="ChangePwd__notice">
					Bạn có {countdownNumMMSS} phút để cập nhật mật khẩu mới.  <br/>
					Vui lòng thay đổi mật khẩu của bạn trước khi hết thời gian.
				</div>
				<Input type={pwdInputType} placeholder="Mật khẩu mới" value={pwd} onChange={this.onChangePwd} maxLength={16}>
					<ReactSVG
						className={`loginSVG login__pwd__${pwdIconName}`}
						src={`/img/svg/login/eyes-${pwdIconName}.svg`}
						onClick={this.changePwdIconName}
					/>
				</Input>
				{pwdError !== '' && <div className="warn-text">{pwdError}</div>}
				{postError && <div className="warn-text">{postErrorText}</div>}
				<div className="notice-text">
					Mật khẩu phải gồm 6-20 ký tự chữ và số 'A-Z', 'a-z', '0-9'. Có thể bao gồm 4 ký tự đặc biệt  ^ # $ @
				</div>
				<Input
					className="ChangePwd___confirmInput"
					type={confirmPwdInputType}
					placeholder="Nhập lại mật khẩu mới"
					value={confirmPwd}
					onChange={this.onChangeConfirmPwd}
					maxLength={16}
				>
					<ReactSVG
						className={`loginSVG login__pwd__${confirmPwdIconName}`}
						src={`/img/svg/login/eyes-${confirmPwdIconName}.svg`}
						onClick={this.changeConfirmPwdName}
					/>
				</Input>
				{pwdConfirmError !== '' && <div className="warn-text">{pwdConfirmError}</div>}
				<div className="login__button">
					<button
						className={`login__btn__submit ${!btnStatus ? 'btn-disable' : ''}`}
						disabled={!btnStatus}
						onClick={this.postChangePwd}
					>
						Gửi
					</button>
				</div>
				<Modal
					className="passwordSuccessModal"
					visible={this.state.passwordSuccessModal}
					closable={false}
					animation={false}
					mask={true}>
						<React.Fragment>
							<center>
								<ReactIMG src="/img/success.png" />
							</center>
							<div className="note">
								Cập Nhật Thành Công
							</div>
						</React.Fragment>
				</Modal>
				<Modal
					className="ConfirmModal"
					visible={this.state.expiredModal}
					closable={false}
					animation={false}
					title="Hết Thời Gian Chờ"
					mask={true}>
						<React.Fragment>
							<div style={{fontSize: '0.38rem', textAlign: 'center', color: '#000'}}>
								Thông tin đăng nhập của bạn đã hết thời gian chờ, vui lòng đăng nhập lại để xác thực tài khoản và cập nhật mật khẩu của bạn.
							</div>
							<Button
								style={{width: '50%', margin: 'auto', fontSize: '0.38rem', marginTop: '0.5rem', height: '1rem'}}
								onClick={() => {
									setIsLogout();
									redirectToLogin();
								}}
								>
									Đăng Nhập Lại
								</Button>
						</React.Fragment>
				</Modal>
			</div>
		);
	}
}

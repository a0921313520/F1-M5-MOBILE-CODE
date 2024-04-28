import React from 'react';
import Layout from '@/components/Layout';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import { VerificationEmailToken, ResetPassword } from '@/api/userinfo';
import Toast from '@/components/View/Toast';
import Modal from '@/components/View/Modal';
import Button from '@/components/View/Button';
import InputItem from '@/components/View/Input';
import { password_reg } from '@/lib/SportReg';
import Router from 'next/router';
import { getUrlVars } from '@/lib/js/Helper';
import dynamic from 'next/dynamic';
import { ReactSVG } from '@/components/View/ReactSVG';
const CallApplib = dynamic(import('@/components/CallApp/'), { ssr: false });

class Resetpassword extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			newPassword: '',
			confirmPassword: '',
			successModal: false,
			failModal: false,
			errorMsg: '',
			newPasswordTest: false,
			timesTip1: false,
			confirmPasswordTest: false,
			timesTip2: false,
			iconName1: 'close',
			iconName2: 'close',
			inputType1: 'password',
			inputType2: 'password'
		};
	}

	componentDidMount() {
		let enc = getUrlVars()['enc'];
		this.VerifyResetPasswordLink(enc);
	}

	/**
	 * @description: 验证重置密码的token
	 * @return {*}
	*/

	VerifyResetPasswordLink(token) {
		const params = {
			encryptedValue: token
		};
		Toast.loading();
		VerificationEmailToken(params, (res) => {
			Toast.destroy();
			console.log('---------->', res);

			if (!res.isSuccess) {
				this.setState({
					failModal: true,
					errorMsg: res.errors[0].message
				});
			} else {
				this.setState({
					emailInfo: res.result
				});
			}
		});
	}

	/**
	* @description: 提交密码修改
	* @return {*}	
  	*/

	handleSubmit() {
		const { newPassword, confirmPassword, emailInfo } = this.state;
		if (!password_reg.test(newPassword)) {
			return;
		}
		if (newPassword !== confirmPassword) {
			return;
		}

		const Data = {
			memberCode: emailInfo.memberCode,
			email: emailInfo.email,
			newPassword: newPassword,
			emailCode: emailInfo.emailCode
		};

		Toast.loading();
		ResetPassword(Data, (res) => {
			Toast.destroy();

			if (res.isSuccess) {
				this.setState({ successModal: true, Effective: false });
			} else {
				if (res.errors[0].errorCode == 'VAL03016') {
					this.setState({ failModal: true, Effective: true, errorMsg: 'Mật khẩu mới không được giống với mật khẩu cũ!' });
				} else {
					this.setState({ failModal: true, Effective: false, errorMsg: res.errors[0].description });
				}
			}
		});
	}

	changeSetp() {
		if (this.state.Effective) {
			this.setState({
				failModal: false,
				errorMsg: '',
				newPassword: '',
				confirmPassword: ''
			});
		} else {
			global.callApplib.open({ path: '/' });
		}
	}

	changeIconName = (i) => {
		if (i == 'new') {
			if (this.state.iconName1 === 'open') {
				this.setState({
					iconName1: 'close',
					inputType1: 'password'
				});
			} else {
				this.setState({
					iconName1: 'open',
					inputType1: 'text'
				});
			}
		} else if (i == 'repeat') {
			if (this.state.iconName2 === 'open') {
				this.setState({
					iconName2: 'close',
					inputType2: 'password'
				});
			} else {
				this.setState({
					iconName2: 'open',
					inputType2: 'text'
				});
			}
		}

	};

	render() {
		const { newPassword, confirmPassword, timesTip1, timesTip2, newPasswordTest, confirmPasswordTest, iconName1, iconName2, inputType1, inputType2 } = this.state;
		let Retstatus =
			newPassword != '' && newPasswordTest == true && confirmPassword != '' && confirmPasswordTest == true;
		return (
			<Layout hasServer={false} status={1}>
				<div className="Resetpassword">
					<div className="communication-content">
						<div className="shadow-wrapper">
							<div
								style={{
									fontSize: '20px',
									textAlign: 'center',
									fontWeight: '800',
									font: 'Microsoft YaHei',
									marginBottom: '1rem'
								}}
							>
								Đổi Mật Khẩu
							</div>

							<label>Mật Khẩu Mới</label>
							<div className="input-wrapper ">
								<InputItem
									type={this.state.inputType1}
									value={newPassword}
									placeholder="Mật khẩu mới่"
									maxLength={20}
									suffix={
										<ReactSVG
											className={`loginSVG login__pwd__${iconName1}`}
											src={`/img/svg/login/eyes-${iconName1}.svg`}
											onClick={() => this.changeIconName('new')}
										/>
									}
									onChange={(v) => {
										let newPasswordTest = v.target.value
											? password_reg.test(v.target.value)
											: false;
										// if (newPasswordTest && v.target.value.length === 20) {
										// 	this.setState({
										// 		timesTip1: true
										// 	});
										// 	setTimeout(() => {
										// 		this.setState({
										// 			timesTip1: false
										// 		});
										// 	}, 5000);
										// }
										this.setState({
											newPassword: v.target.value,
											newPasswordTest: newPasswordTest
										});
									}}
								/>
							</div>
							<label>Nhập Lại Mật Khẩu Mới่</label>
							<div className="input-wrapper">
								<InputItem
									type={this.state.inputType2}
									value={confirmPassword}
									placeholder="Nhập Lại Mật Khẩu Mới"
									maxLength={20}
									suffix={
										<ReactSVG
											className={`loginSVG login__pwd__${iconName2}`}
											src={`/img/svg/login/eyes-${iconName2}.svg`}
											onClick={() => this.changeIconName('repeat')}
										/>
									}
									onChange={(v) => {
										let confirmPasswordTest = newPassword == v.target.value ? true : false;
										// if (confirmPasswordTest && v.target.value.length === 20) {
										// 	this.setState({
										// 		timesTip2: true
										// 	});
										// 	setTimeout(() => {
										// 		this.setState({
										// 			timesTip2: false
										// 		});
										// 	}, 5000);
										// }
										this.setState({
											confirmPassword: v.target.value,
											confirmPasswordTest: confirmPasswordTest
										});
									}}
								/>
							</div>
							{!newPasswordTest && newPassword ? <div className="errorMsg">Mật khẩu phải gồm 6-20 ký tự chữ và số 'A-Z', 'a-z', '0-9'. Có thể bao gồm 4 ký tự đặc biệt  ^ # $ @</div> 
							: !confirmPasswordTest && confirmPassword ? <div className="errorMsg">Nhập lại mật khẩu mới không khớp</div> 
							: null }
							{!Retstatus && (
								<Button
									className="button-Fillet"
									style={{
										marginTop: '15px',
										backgroundColor: '#EFEFF4',
										color: '#BCBEC3'
									}}
									onClick={() => {
										if (newPassword && newPasswordTest && confirmPassword && confirmPasswordTest) {
											this.handleSubmit();
										}
									}}
								>
									Gửi
								</Button>
							)}

							{Retstatus && (
								<Button
									className="button-Fillet"
									style={{
										marginTop: '15px'
									}}
									onClick={() => {
										this.handleSubmit();
									}}
								>
									Gửi
								</Button>
							)}
							<Button
									className="button-Fillet"
									style={{
										marginTop: '15px',
										border: '1px solid #CCCCCC',
										color: '#222222',
										backgroundColor: 'white'
									}}
									onClick={() => {
										Router.push('/')
									}}
								>
									Hủy
							</Button>
						</div>
					</div>
				</div>
				<Modal
					visible={this.state.successModal}
					transparent
					maskClosable={true}
					title="Đặt Lại Mật Khẩu"
					closable
					onCancel={() => {
						this.changeSetp();
					}}
					className="Confirm_Modal"
				>
					<div>
						<p className="ResetErrorMsg">Bạn đã đặt lại mật khẩu thành công, vui lòng đăng nhập bằng mật khẩu mới!</p>
						<Button
							onClick={() => {
								this.changeSetp();
							}}
						>
							Đóng
						</Button>
					</div>
				</Modal>
				<Modal
					visible={this.state.failModal}
					maskClosable={true}
					title="Đặt Lại Mật Khẩu Không Thành Công"
					closable
					onCancel={() => {
						this.changeSetp();
					}}
					className="Confirm_Modal"
				>
					<div>
						<center>
							<p dangerouslySetInnerHTML={{ __html: this.state.errorMsg }} className="ResetErrorMsg" />
						</center>
						<Button
							onClick={() => {
								this.changeSetp();
							}}
						>
							Đóng
						</Button>
					</div>
				</Modal>
				<CallApplib key={Math.random()} Url="/vn/mobile" />
			</Layout>
		);
	}
}

export default Resetpassword;

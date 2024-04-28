/*
 * @Author: Alan
 * @Date: 2021-12-01 14:58:21
 * @LastEditors: Alan
 * @LastEditTime: 2022-11-24 19:30:25
 * @Description: 验证真实姓名
 * @FilePath: \Mobile\src\components\DepositVerify\RealyName.js
 */

import React from 'react';
import Toast from '@/components/View/Toast';
import { createForm } from 'rc-form';
import Item from '@/components/Deposit/depositComponents/Item';
import Input from '@/components/View/Input';
import Button from '@/components/View/Button';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import ReactIMG from '@/components/View/ReactIMG';
import { setUserRealyNameAndIdCard, getResendAttempt } from '@/api/userinfo';
import { GetWithdrawallBanks } from '@/api/wallet';
import { realyNameReg, idCard, BankCard, bankNameReg } from '@/lib/SportReg';
import { millisecondsToTimer } from '@/lib/js/util';
import BankAccount from './components/BankList';
import OpenSendCode from './components/SendCode';
import Router from 'next/router';
import Modal from '@/components/View/Modal';
class RealyName extends React.Component {
	constructor(props) {
		super(props);
		console.log(props);
		this.state = {
			fillRealyNameLoading: false, // 充值完善姓名按钮是否加载中状态
			userRealyNameState: this.props.memberInfo.firstName,
			userIdState: this.props.memberInfo.identityCard,
			BankAccounts: [],
			bankCodeState: '',
			bankName: '',
			userOtherBankState: '',
			otpRemaining: 0,
			isOtpReceived: false,
			otpCountdown: '',
			showOTPModal: false
		};
		this.OTPInterval = null;
		this.handleOk = this.handleOk.bind(this); // 提交完善姓名表单
	}
	componentDidMount() {
		//this.props.onRef(this);
		this.GetVerificationAttempt();
		this.initUserinfo();
		GetWithdrawallBanks((res) => {
			if (res.isSuccess) {
				let Banks = res.result.banks;
				Banks.push({ id: 99999, name: '其他银行' });
				this.setState({
					BankAccounts: Banks,
					bankName: Banks[0].name
				});
			}
		});
	}

	componentWillUnmount() {
		clearInterval(this.OTPInterval);
	}

	initUserinfo = () => {
		this.props.form.setFieldsValue({
			userRealyNameState: this.props.memberInfo.firstName !== '' ? '***' : ''
		});
		let idCardnum = this.props.memberInfo.identityCard;
		this.props.form.setFieldsValue({
			useridCardState:
				idCardnum && idCardnum !== '' ? idCardnum.replace(/^(\d{0})\d{12}(\d+)/, '$1************$2') : ''
		});
	};

	//检查 OTP 是否倒数中
	// checkCacheOTPTime = () => {
	// 	let user = localStorage.getItem('username');
	// 	let timestatus = localStorage.getItem(`${user}bankCardBeforetime`);
	// 	if (timestatus) {
	// 		if (timestatus - Date.now() > 0) {
	// 			this.startOTPInterval(timestatus);
	// 			this.setState({
	// 				isOtpReceived: true
	// 			});
	// 		} else {
	// 			localStorage.removeItem(`${user}bankCardBeforetime`);
	// 		}
	// 	}
	// }

	//检查验证剩余次数
	GetVerificationAttempt() {
		let channelType = 'SMS';
		let serviceAction = 'BankCardVerification';
		Toast.loading();
	
		fetchRequest(ApiPort.VerificationAttempt + `channelType=${channelType}&serviceAction=${serviceAction}&`, 'GET')
			.then((data) => {
				Toast.destroy();
				if (data) {
					if (data.remainingAttempt <= 0) {
						this.props.onOTPAttemptFinish();
					} else {
						//this.checkCacheOTPTime();
						this.getResendAttemptCheck('BankCardVerification', 'SMS');
						this.setState({
							otpRemaining: data.remainingAttempt
						});
					}
				}
			})
			.catch((err) => {
				Toast.destroy();
			});
	}

	//检查是否已经超过验证次数限制
	getResendAttemptCheck = (serviceAction, channel) => {
		Toast.loading();
		getResendAttempt(
			(res) => {
				Toast.destroy();
				if (res) {
					if (res.isExpired) {
						if (res.resendAttempt <= 0) {
							this.props.onOTPAttemptFinish();
						}
					} else if (res.expiredAt) {
						//检查 OTP 是否过期
						let expiredAt = Date.parse(res.expiredAt);
						if (expiredAt - Date.now() > 0) {
							this.startOTPInterval(expiredAt);
							this.setState({
								isOtpReceived: true
							});
						}
					}
				}
			},
			serviceAction,
			channel
		);
	};

	// 设置 OTP 倒数
	startOTPInterval = (endTime) => {
		this.OTPInterval = setInterval(() => {
			let remainingTime = endTime - Date.now();
			this.setState({ otpCountdown: millisecondsToTimer(remainingTime) });
			if (remainingTime < 0) {
				clearInterval(this.OTPInterval);
				//localStorage.removeItem(`${localStorage.getItem('username')}bankCardBeforetime`);
				this.getResendAttemptCheck('BankCardVerification', 'SMS');
				this.setState({
					isOtpReceived: false
				});
			}
		}, 1000);
	};

	//发送验证码
	getVerifyCode = () => {
		if (this.state.isOtpReceived) {
			this.setState({ showOTPModal: true });

			return;
		}

		const { memberInfo, phoneNumber } = this.props;
		let postData = {
			siteId: 38,
			msisdn: phoneNumber,
			//isRegistration: false,
			//isOneTimeService: false,
			//memberCode: memberInfo.userName,
			//CurrencyCode: 'CNY',
			//isMandatoryStep: false,
			serviceAction: 'BankCardVerification'
		};
		Toast.loading();
		console.log(postData);
		fetchRequest(ApiPort.PhoneOTP, 'POST', postData)
			.then((data) => {
				if (data.isSuccess) {
					this.setState({
						isOtpReceived: true,
						showOTPModal: true,
						otpRemaining: data.result.resendCounter
					});

					let endTime = this.props.OTPCountdownTime
						? Date.now() + this.props.OTPCountdownTime * 60000 + 100
						: Date.now() + 3 * 60000 + 100; //默认为3分钟
					//localStorage.setItem(`${localStorage.getItem('username')}bankCardBeforetime`, endTime);
					this.startOTPInterval(endTime);
				} else {
					if (data.result.resendCounter <= 0) {
						this.props.onOTPAttemptFinish();
					} else {
						Modal.info({
							className: 'Send-Modal',
							icon: null,
							centered: true,
							type: 'confirm',
							btnBlock: false,
							btnReverse: false,
							title: '温馨提醒',
							content: data.result.message,
							okText: '知道了'
						});
					}
				}
			})
			.finally(() => {
				Toast.destroy();
			});
	};

	//提交验证码
	postVerify = (verifyCodeValue, reject) => {
		const { memberInfo, phoneNumber } = this.props;
		let postData = {
			verificationCode: verifyCodeValue,
			isRegistration: false,
			msIsdn: phoneNumber,
			memberCode: memberInfo.userName,
			siteId: 38,
			serviceAction: 'BankCardVerification'
		};
		Toast.loading();
		console.log(postData);
		fetchRequest(ApiPort.VerifyPhoneOTP, 'PATCH', postData)
			.then((data) => {
				if (data) {
					Toast.destroy();
					this.setState({
						otpRemaining: data.result.remainingAttempt
					});
					if (data.isSuccess && data.result.isVerified) {
						clearInterval(this.OTPInterval);
						Toast.success({ content: '验证成功', type: 'loading' }, 3);
						//localStorage.removeItem(`${localStorage.getItem('username')}bankCardBeforetime`);
						sessionStorage.setItem('VerificationErro', 'true');
						this.props.getMemberData();
						this.handleOk();
						this.setState({
							showOTPModal: false,
							isOtpReceived: false
						});
					} else {
						reject(data.result.message);
						// 超過5次
						if (data.result.remainingAttempt <= 0 || data.result.errorCode === 'REVA0001') {
							this.props.setLimitVisible();
						}
					}
				}
			})
			.catch((err) => {
				Toast.destroy();
			});

		// Pushgtagdata(`Verification`, 'Submit', `VerifyOTP_DepositPage`);
	};

	//验证银行卡资料正确性
	handleOk() {
		this.setState({ fillRealyNameLoading: true });
		const FirstName = this.props.memberInfo.firstName;
		const IdentityCard = this.props.memberInfo.identityCard;
		console.log(this.state);
		Toast.loading();
		setUserRealyNameAndIdCard(
			FirstName && FirstName !== '' ? FirstName : this.state.userRealyNameState,
			IdentityCard && IdentityCard !== '' ? IdentityCard : this.state.userIdState,
			this.state.bankName === '其他银行' ? this.state.userOtherBankState : this.state.bankName,
			this.state.BankCardState,
			(res) => {
				console.log(res);
				Toast.destroy();
				this.setState({ fillRealyNameLoading: false });
				if (res.isSuccess) {
					Toast.success({ content: '提交成功', type: 'loading' }, 3);
					sessionStorage.removeItem('VerificationErro');
					setTimeout(() => {
						this.props.getMemberData();
					}, 2000);
				} else {
					if (res.errors[0].errorCode != 'PII00702') {
						Modal.info({
							title: '',
							centered: true,
							okText: '重新验证',
							cancelText: '在线客服',
							className: `VerificationBankModal`,
							content: (
								<React.Fragment>
									<center>
										<ReactIMG src="/img/verify/warn.png" />
										<h2>验证失败</h2>
									</center>
									<div className="note">
										<small>个人信息验证失败，建议您重新确认信息后再次提交，或者联系在线客服协助。</small>
									</div>
								</React.Fragment>
							),
							onOk: () => {
								console.log('重新验证');
							},
							onCancel: () => {
								this.props.PopUpLiveChat();
								Router.replace('/deposit');
							}
						});
					}
				}
			}
		);
	}
	setRealyNameState = (e) => {
		this.setState({ userRealyNameState: e.target.value });
	};
	setidCardState = (e) => {
		this.setState({ userIdState: e.target.value });
	};
	setBankCardState = (e) => {
		this.setState({ BankCardState: e.target.value });
	};
	setOtherBankname = (e) => {
		this.setState({ userOtherBankState: e.target.value });
	};

	submitBtnEnable = () => {
		let errors = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let name = this.props.form.getFieldValue('userRealyNameState');
		let idCard = this.props.form.getFieldValue('useridCardState');
		let bankCard = this.props.form.getFieldValue('userBankCardState');
		let otherBank = this.state.bankName === '其他银行' ? this.props.form.getFieldValue('userOtherBankState') : true;

		return (
			name !== '' &&
			name !== undefined &&
			!errors &&
			// (idCard !== '' && idCard !== undefined && !errors) &&
			(bankCard !== '' && bankCard !== undefined && !errors) &&
			(otherBank !== '' && otherBank !== undefined && !errors)
		);
	};

	//提交
	onSubmit = () => {
		if (!this.submitBtnEnable()) return;

		if (sessionStorage.getItem('VerificationErro')) {
			this.handleOk();
		} else {
			this.getVerifyCode();
		}

		// Pushgtagdata(`Verification`, 'Submit', `ID_Bank_PII_DepositPage`);
	};

	render() {
		const { getFieldDecorator, getFieldError } = this.props.form;
		const { BankAccounts, bankCodeState, showOTPModal, isOtpReceived, otpRemaining, otpCountdown } = this.state;
		return (
			<div>
				<div className="bankcard_vry_inner">
					<div className=" InfoChecklist list">
						{/* <p className="note">请正确输入您的真实姓名, 当前信息将用于核实您日后的存款账户。</p> */}
						<Item errorMessage={getFieldError('userRealyNameState')} label="持卡人姓名">
							{getFieldDecorator('userRealyNameState', {
								rules: [
									{ required: true, message: '请输入全名' },
									{
										validator: (rule, value, callback) => {
											console.log(value);
											if (value && !realyNameReg.test(value)) {
												callback('格式不正确');
											}
											callback();
										}
									}
								]
							})(
								<Input
									size="large"
									placeholder="持卡人姓名"
									disabled={this.props.memberInfo.firstName !== '' ? true : false}
									onChange={this.setRealyNameState}
									maxLength="15"
								/>
							)}
						</Item>
					</div>
					{/* <div className="InfoChecklist list">
						<Item errorMessage={getFieldError('useridCardState')} label="身份证号码">
							{getFieldDecorator('useridCardState', {
								rules: [
									{ required: true, message: '请输入身份证号码' },
									{
										validator: (rule, value, callback) => {
											console.log(value);
											if (value && !idCard.test(value)) {
												callback('身份证号码格式错误');
											}
											callback();
										}
									}
								]
							})(
								<Input
									size="large"
									placeholder="身份证号码"
									disabled={
										this.props.memberInfo.identityCard &&
										this.props.memberInfo.identityCard !== '' ? (
											true
										) : (
											false
										)
									}
									onChange={this.setidCardState}
									maxLength="18"
								/>
							)}
						</Item>
					</div> */}

					<div className="InfoChecklist list">
						<Item label="银行名称">
							<BankAccount
								labelName=""
								keyName={[ 'name', 'id' ]}
								bankAccounts={BankAccounts}
								bankCodeState={bankCodeState}
								setBankCode={(v, n) => {
									this.setState({ bankCodeState: v });
									if (n) {
										this.setState({ bankName: n });
									}
								}}
							/>
						</Item>
					</div>

					{this.state.bankName === '其他银行' && (
						<div className="InfoChecklist list" style={{ marginTop: '-30px' }}>
							<Item errorMessage={getFieldError('userOtherBankState')}>
								{getFieldDecorator('userOtherBankState', {
									rules: [
										{ required: true, message: '请输入银行名称' },
										{
											validator: (rule, value, callback) => {
												console.log(value);
												if (value && !bankNameReg.test(value)) {
													callback('格式不正确');
												}
												callback();
											}
										}
									]
								})(<Input size="large" placeholder="请填写银行名称" onChange={this.setOtherBankname} />)}
							</Item>
						</div>
					)}

					<div className="InfoChecklist list">
						<Item label="银行卡号" errorMessage={getFieldError('userBankCardState')}>
							{getFieldDecorator('userBankCardState', {
								rules: [
									{ required: true, message: '请输入银行卡号码' },
									{
										validator: (rule, value, callback) => {
											console.log(value);
											if (value && !BankCard.test(value)) {
												callback('银行卡号为14到19位数字');
											}
											callback();
										}
									}
								]
							})(
								<Input
									size="large"
									placeholder="银行卡号"
									onChange={this.setBankCardState}
									maxLength="19"
								/>
							)}
						</Item>
					</div>
				</div>
				<Button
					className={`${!this.submitBtnEnable() ? 'btn-disable' : 'btn-submit'}`}
					loading={this.state.fillRealyNameLoading}
					onClick={this.onSubmit}
				>
					提交
				</Button>
				<OpenSendCode
					visible={showOTPModal}
					phoneNumber={this.props.phoneNumber}
					isOtpReceived={isOtpReceived}
					otpRemaining={otpRemaining}
					otpCountdown={otpCountdown}
					onSend={this.getVerifyCode}
					onSubmit={this.postVerify}
					PopUpLiveChat={this.props.PopUpLiveChat}
					onCloseModal={() => {
						this.setState({
							showOTPModal: false
						});
					}}
				/>
			</div>
		);
	}
}

export default createForm({ fieldNameProp: 'realyname' })(RealyName);

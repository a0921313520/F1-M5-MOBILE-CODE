import React, { Component, Fragment } from 'react';
import Button from '@/components/View/Button';
import OtpInput from 'react-otp-input';
import Progressbar from '@/components/View/Progressbar';
import { getResendAttempt } from '@/api/userinfo';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import { millisecondsToTimer } from '@/lib/js/util';
import Toast from '@/components/View/Toast';
import Input from '@/components/View/Input';
import Modal from '@/components/View/Modal';
import { setMemberInfo } from '@/api/userinfo';
import ReactIMG from '@/components/View/ReactIMG';
import Flexbox from '@/components/View/Flexbox/';
export default class VerifyPhone extends Component {
	constructor(props) {
		super(props);
		this.state = {
			btnStatus: false,
			verifyCodeValue: '',
			verifyBtnStatus: false,
			verifyInputArea: false,
			verifyCodeError: false,
			PhoneEdit: false,
			noClickPhoneEdit: false,
			UserPhone: this.props.phoneNumber,
			FirstName: this.props.memberInfo.firstName, // api Member > first是否有值 (FirstName)
			APIisPhoneVerify: this.props.memberInfo.phoneStatus, // api Member > 手機認證狀態 (Contacts.Status)
			isPhoneVerify: false,
			showerror: false,
			verifyCodeErrorText: '验证码有误，请检查并确保您输入了正确的验证码。',
			otpText: '发送',
			nameText: '提交',
			isOtpReceived: false,
			otpRemaining: '',
			accountHolderName: '',
			accountHolderNameInit: true,
			accountHolderNameErr: false,
			isNameOnClickBtn: false // 是否可以提交姓名，符合命名規範
		};
		this.OTPInterval = null;
	}

	componentDidMount() {
		this.MemberFlagsStatus();
		this.GetVerificationAttempt();
	}

	componentWillUnmount() {
		clearInterval(this.OTPInterval);
	}

	//检查验证剩余次数
	GetVerificationAttempt() {
		let channelType = 'SMS';
		let serviceAction = 'DepositVerification';
		Toast.loading();
		fetchRequest(ApiPort.VerificationAttempt + `channelType=${channelType}&serviceAction=${serviceAction}&`, 'GET')
			.then((data) => {
				Toast.destroy();
				if (data.isSuccess) {
					if (data.result.attempt <= 0) {
						this.props.setLimitVisible();
					} else {
						this.getResendAttemptCheck('DepositVerification', 'SMS');
						this.setState({
							otpRemaining: data.result.attempt
						});
					}
				}
			})
			.catch((err) => {
				Toast.destroy();
			});
	}

	MemberFlagsStatus = () => {
		fetchRequest(ApiPort.MemberFlagsStatus + 'flagKey=IsPhoneEditable&', 'GET')
			.then((data) => {
				if (data.isSuccess) {
					this.setState({
						PhoneEdit: data.result.isPhoneEditable
					});
				}
			})
			.catch((err) => {
				//console.log(err);
			});
	};

	//检查是否已经超过验证次数限制
	getResendAttemptCheck = (serviceAction, channel) => {
		Toast.loading();
		getResendAttempt(
			(res) => {
				Toast.destroy();
				if (res) {
					if (res.result.isExpired) {
						if (res.result.attempt <= 0) {
							this.props.setLimitVisible();
						}
					} else if (res.result.expiredAt) {
						//检查 OTP 是否过期
						let expiredAt = Date.parse(res.result.expiredAt);
						if (expiredAt - Date.now() > 0) {
							this.startOTPInterval(expiredAt);
							this.setState({
								verifyInputArea: true,
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
		if (this.OTPInterval) {
			clearInterval(this.OTPInterval);
		}
		this.OTPInterval = setInterval(() => {
			let remainingTime = endTime - Date.now();
			this.setState({ otpText: `重发：${millisecondsToTimer(remainingTime)}` });
			if (remainingTime < 0) {
				clearInterval(this.OTPInterval);
				console.log(this.OTPInterval);
				console.log([ '倒计时结束' ]);
				this.getResendAttemptCheck('DepositVerification', 'SMS');
				this.setState({
					isOtpReceived: false,
					otpText: '重发'
				});
				this.inputCode('');
			}
		}, 1000);
	};

	numberConversion = (number) => {
		let numberDelPrefix = number.split('-')[1];
		let numberArr = numberDelPrefix.split('');
		//Mask & display last 4 characters when length > 4 characters else no mask is required
		if (numberArr && numberArr.length > 4) {
			const tail4 = numberArr.slice(-4);
			return [ ...Array(numberArr.length - 4).fill('*'), ...tail4 ].join('');
		} else {
			return numberArr.join('');
		}
	};

	/**
	 * 发送验证码
	 * @returns
	 */
	getVerifyCode = () => {
		if (this.state.btnStatus) return;
		if (this.state.UserPhone.split('-')[1].length < 11) {
			Toast.error('请正确填写11位手机号码', 2);
			return;
		}
		if (this.state.isOtpReceived) {
			Modal.info({
				className: 'Send-Modal',
				icon: null,
				centered: true,
				type: 'confirm',
				btnBlock: false,
				btnReverse: false,
				title: '温馨提醒',
				content: <p style={{ margin: '15px 0px 30px' }}> 验证码已发送，请在{this.props.OTPCountdownTime || 5}分钟后尝试</p>,
				okText: '知道了'
			});
			return;
		}

		if (this.state.otpText === '重发') {
			// Pushgtagdata('Verification', 'Request', 'ResendCode_Phone_DepositPage');
		} else {
			// Pushgtagdata('Verification', 'Request', 'SendCode_Phone_DepositPage');
		}

		const { memberInfo } = this.props;
		let postData = {
			siteId: 38,
			MsIsdn: this.state.UserPhone,
			isRegistration: false,
			isOneTimeService: false,
			memberCode: memberInfo.UserName,
			CurrencyCode: 'CNY',
			isMandatoryStep: false,
			serviceAction: 'DepositVerification'
		};
		Toast.loading();
		console.log(postData);
		fetchRequest(ApiPort.PhoneOTP, 'POST', postData)
			.then((data) => {
				if (data.isSuccess) {
					this.setState({
						verifyInputArea: true,
						isOtpReceived: true
					});
					//this.GetVerificationAttempt();
					let endTime = this.props.OTPCountdownTime
						? Date.now() + this.props.OTPCountdownTime * 60000 + 100
						: Date.now() + 3 * 60000 + 100; //默认为3分钟
					this.startOTPInterval(endTime);
				} else {
					if (data.result.resendCounter <= 0) {
						this.props.setLimitVisible();
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

	inputCode = (val) => {
		this.setState({
			verifyCodeValue: val
		});
		if (val.length === 6) {
			this.setState({
				verifyBtnStatus: true
			});
		} else {
			this.setState({
				verifyBtnStatus: false
			});
		}
	};

	/**
     * 
     * 確認姓名是否符合規範
     */
	onAccountHolderNameChange = (e) => {
		let { value } = e.target;
		let { accountHolderName, accountHolderNameInit, accountHolderNameErr, isNameOnClickBtn } = this.state;
		accountHolderNameErr = false;

		if (!/^[\u4e00-\u9fa5\u0E00-\u0E7F]{2,50}$/.test(value)) {
			accountHolderNameErr = true;
			isNameOnClickBtn = false;
		} else {
			isNameOnClickBtn = true;
		}
		this.setState({
			accountHolderName: value,
			accountHolderNameInit: false,
			accountHolderNameErr,
			isNameOnClickBtn
		});
	};

	/**
     * 
     * 符合姓名規格後，call api PATCH /api/Member > FirstName 
	 * 保存FirstName
     */
	SaveFirstName = () => {
		const { accountHolderName, FirstName } = this.state;
		if (!FirstName) {
			const params = {
				key: 'FirstName',
				value1: accountHolderName
			};

			Toast.loading('Đang gửi đi, xin vui lòng chờ...');
			setMemberInfo(params, (res) => {
				Toast.destroy();
				if (res.result.isSuccess == true) {
					Toast.success({ content: '提交成功', type: 'loading' }, 3);
					setTimeout(() => {
						this.props.getMemberData();
					}, 2000);
				} else {
					Modal.info({
						className: 'Send-Modal',
						icon: null,
						centered: true,
						type: 'confirm',
						btnBlock: false,
						btnReverse: false,
						content: (
							<React.Fragment>
								<center>
									<ReactIMG src="/img/svg/warn.svg" />
								</center>
								<div className="importantModal-wrap" style={{ marginTop: '20px' }}>
									抱歉，目前我们无法提交您的验证，<br />请稍后再重试或联络在线客服。
								</div>
							</React.Fragment>
						),
						okText: '知道了'
					});
				}
			});
		}
	};

	/**
	 * 提交验证码
	 * @returns
	 */
	postVerify = () => {
		const { memberInfo } = this.props;

		const { verifyCodeValue, verifyBtnStatus, isPhoneVerify, APIisPhoneVerify } = this.state;
		if (!verifyBtnStatus) return;

		if (APIisPhoneVerify == 'Unverified') {
			// Pushgtagdata('Verification', 'Submit', 'VerifyOTP_Phone_DepositPage');
			let postData = {
				verificationCode: verifyCodeValue,
				isRegistration: false,
				msIsdn: this.state.UserPhone,
				memberCode: memberInfo.UserName,
				siteId: 38,
				serviceAction: 'DepositVerification'
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
							this.setState({
								isPhoneVerify: true
							});
							setTimeout(() => {
								this.props.getMemberData();
							}, 2000);
						} else {
							this.setState({
								verifyCodeError: true,
								verifyCodeErrorText: data.result.message
							});
							if (data.result.remainingAttempt <= 0 || data.result.errorCode === 'REVA0001') {
								this.props.setLimitVisible();
							}
						}
					}
				})
				.catch((err) => {
					Toast.destroy();
				});
			// Pushgtagdata(`Verification`, 'Submit', `VerifyOTP_Phone_DepositPage`);
		}
	};

	setPhoneState = (e) => {
		const { value } = e.target;
		const reg = /^1([0-9]*)?$/;
		if ((reg.test(value) && value.length < 12) || value === '') {
			let Check = /^[1](([3][0-9])|([4][0,1,4-9])|([5][0-3,5-9])|([6][2,5,6,7])|([7][0-8])|([8][0-9])|([9][0-3,5-9]))[0-9]{8}$/;
			this.setState({
				UserPhone: '86-' + value,
				showerror: !Check.test(value),
				btnStatus: !Check.test(value) ? true : false
			});
		}
	};
	render() {
		const { type, phoneNumber } = this.props;
		console.log('电话号码---------->', phoneNumber);
		const { firstName } = this.props.memberInfo;
		const {
			btnStatus,
			verifyCodeError,
			verifyBtnStatus,
			verifyInputArea,
			verifyCodeValue,
			verifyCodeErrorText,
			otpText,
			nameText,
			isOtpReceived,
			otpRemaining,
			accountHolderName,
			accountHolderNameInit,
			accountHolderNameErr,
			isNameOnClickBtn,
			APIisPhoneVerify,
			isPhoneVerify
		} = this.state;

		return (
			<Fragment>
				<div className="DepositVerifySet list verifyPhoneMail__main" style={{ marginBottom: '10px' }}>
					<h3>真实姓名</h3>
					<p className="note" style={{ fontSize: '12px' }}>
						请正确输入您的真实姓名, 当前信息将用于核实您日后的存款账户。
					</p>

					<div className="verifyPhoneMail__phone__input">
						{firstName ? (
							<div className="verifyPhoneMail__phone__Editnumber__box">
								<Input placeholder="姓名" value="***" disabled={true} style={{ borderRadius: '7px' }} />
							</div>
						) : (
							<div className="verifyPhoneMail__phone__Editnumber__box">
								<Input
									placeholder="姓名"
									value={accountHolderName}
									onChange={this.onAccountHolderNameChange}
									style={{ border: accountHolderNameErr === true ? 'none' : '1px solid #cccccc' }}
									className={`${accountHolderNameErr ? 'NameFocus' : ''}`}
								/>
							</div>
						)}

						{firstName ? (
							<Button
								className={`${firstName
									? 'sportBtn disabledBtn BG_whiteColor_black'
									: 'sportBtn disabledBtn'}`}
								disabled={btnStatus}
								style={{
									color: '#222222',
									background: 'white',
									paddingLeft: '0px',
									paddingRight: '0px',
									fontSize: '16px'
								}}
							>
								<Flexbox>
									<ReactIMG src="/img/deposit/checkbox-hover.svg" />
									<span style={{ marginLeft: '5px' }}>提交成功</span>
								</Flexbox>
							</Button>
						) : (
							<Button
								className={`${isNameOnClickBtn
									? 'disabledBtn  BG_buleColor_white'
									: 'disabledBtn NameDisabledBtn'}`}
								onClick={() => {
									this.SaveFirstName();
								}}
								style={{ fontSize: '16px' }}
							>
								{nameText}
							</Button>
						)}
					</div>

					{accountHolderNameErr && (
						<div className="verifyPhoneMail__phone__input">
							<div className="verifyPhoneMail__phone__Editnumber__box">
								<div className="verifyPhoneMail__text text-center" style={{ marginTop: '0px' }}>
									<div className="error">格式不正确</div>
								</div>
							</div>

							<Button
								className="sportBtn send-btn"
								style={{
									color: '#222222',
									background: 'white',
									paddingLeft: '0px',
									paddingRight: '0px'
								}}
							/>
						</div>
					)}
				</div>

				<div className="list verifyPhoneMail__main">
					{type === 'resetpwd' && (
						<Fragment>
							<Progressbar activeStep={1} />
							<div className="verifyPhoneMail__heading">验证码验证</div>
							<div className="verifyPhoneMail__text">点击"发送"，您的手机将会收到验证码，请输入您收到的验证码以完成本次验证. </div>
						</Fragment>
					)}
					{type === 'loginOTP' && (
						<Fragment>
							<div className="verifyPhoneMail__heading">手机接收验证码</div>
							<div className="verifyPhoneMail__text">为了确保您帐户的安全，请按照以下说明验证您的手机号码。</div>
						</Fragment>
					)}
					<h3>验证您的手机号</h3>
					<p className="note" style={{ fontSize: '12px' }}>
						确认您的手机号码，然后选择通过短信接受一次性密码。
					</p>
					<div className="verifyPhoneMail__phone__input">
						<div className="verifyPhoneMail__phone__prefix">+86</div>
						{this.state.PhoneEdit && !verifyInputArea ? (
							<div className="verifyPhoneMail__phone__Editnumber__box">
								{!this.state.noClickPhoneEdit && (
									<div
										className="EditnumberShow"
										onClick={() => {
											this.setState({
												noClickPhoneEdit: true,
												UserPhone: '',
												btnStatus: true
											});
										}}
									>
										{this.numberConversion(phoneNumber)}
									</div>
								)}
								{this.state.noClickPhoneEdit && (
									<div className="verifyPhoneMail__phone__Editnumber">
										<Input
											size="large"
											type="text"
											value={this.state.UserPhone.split('-')[1]}
											onChange={this.setPhoneState}
										/>
									</div>
								)}
							</div>
						) : (
							<div className="verifyPhoneMail__phone__number ">{this.numberConversion(phoneNumber)}</div>
						)}

						{APIisPhoneVerify == 'Verified' || isPhoneVerify ? (
							<Button
								className={`${isPhoneVerify
									? 'sportBtn disabledBtn BG_whiteColor_black'
									: 'sportBtn disabledBtn'}`}
								disabled={btnStatus}
								style={{
									color: '#222222',
									background: 'white',
									paddingLeft: '0px',
									paddingRight: '0px',
									fontSize: '16px'
								}}
							>
								<Flexbox>
									<ReactIMG src="/img/deposit/checkbox-hover.svg" />
									<span style={{ marginLeft: '5px' }}>验证成功</span>
								</Flexbox>
							</Button>
						) : (
							<Button
								className={` getVerfiyCodeBtn ${btnStatus || isOtpReceived
									? 'disabledBtn'
									: 'send-btn'}`}
								onClick={this.getVerifyCode}
								disabled={btnStatus}
							>
								{otpText}
							</Button>
						)}
					</div>
					{this.state.showerror && <p className="ERRORSHOW">请输入正确的手机号</p>}
					<div className="verifyPhone__notice">
						{this.state.PhoneEdit ? '发送验证码后，如需修改手机号，请联系我们的' : '如果您想更新手机号码，请联系我们的'}
						<span className="underline_a" onClick={this.props.PopUpLiveChat}>
							在线客服
						</span>
					</div>

					{isPhoneVerify ||
						(verifyInputArea && (
							<Fragment>
								<div className="verifyPhoneMail__code">
									<div className="verifyPhoneMail__input__heading">输入发送到手机号的验证码</div>
									<div className="verifyPhoneMail__input__text">
										注意：如果您在5分钟内未收到验证码，<br />请点击重新发送验证码以获取一个新的验证码。
									</div>
									<div
										className={`verifyPhoneMail__code__input ${verifyCodeError ? 'codeError' : ''}`}
									>
										<OtpInput
											numInputs={6}
											isInputNum
											value={verifyCodeValue}
											onChange={this.inputCode}
											containerStyle="otp-input-container"
										/>
									</div>
									{verifyCodeError && (
										<div className="verifyPhoneMail__text text-center">
											<div className="error">{verifyCodeErrorText}</div>
										</div>
									)}

									<div className="verifyPhoneMail__time_text text-center">
										您还有（
										<span style={{ color: '#00A6FF' }}>{otpRemaining}</span>
										）次尝试机会
									</div>
									<Button
										className={`${!verifyBtnStatus ? 'disabledBtn2' : ''}`}
										onClick={this.postVerify}
									>
										验证
									</Button>
								</div>
							</Fragment>
						))}
				</div>
			</Fragment>
		);
	}
}

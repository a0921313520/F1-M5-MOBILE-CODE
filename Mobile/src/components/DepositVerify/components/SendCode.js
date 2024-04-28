import React, { Component, Fragment } from 'react';
import Button from '@/components/View/Button';
import OtpInput from 'react-otp-input';
import Modal from '@/components/View/Modal';
import Flexbox from '@/components/View/Flexbox/';
export default class VerifyPhone extends Component {
	constructor(props) {
		super(props);
		this.state = {
			verifyCodeValue: '',
			verifyBtnStatus: false,
			verifyCodeError: false,
			verifyCodeErrorText: '验证码有误，请检查并确保您输入了正确的验证码。'
		};
	}

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

	onSendOTP = () => {
		if (this.props.isOtpReceived) {
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

		this.props.onSend();
	};

	onSubmitOTP = () => {
		if (!this.state.verifyBtnStatus) return;

		const reject = (errMsg) => {
			this.setState({
				verifyCodeError: true,
				verifyCodeErrorText: errMsg
			});
		};
		this.props.onSubmit(this.state.verifyCodeValue, reject);
	};

	render() {
		const { visible, phoneNumber, isOtpReceived, otpRemaining, otpCountdown } = this.props;
		const { verifyCodeError, verifyBtnStatus, verifyCodeValue, verifyCodeErrorText } = this.state;
		return (
			<Fragment>
				<Modal
					className="OpenSendCodeModal"
					title="信息验证"
					visible={visible}
					onCancel={this.props.onCloseModal}
					closable={false}
					animation={false}
					mask={true}
				> 
					<div className="verifyPhoneMail__main" style={{ padding: '0px' }}>
						<div className="verifyPhoneMail__input__text">
							验证码已发送到您的手机{
								phoneNumber.replace(/\d(?=\d{4})/g, '*')
								/* 	.split('-')[1]
								.replace(/^(\d{0})\d{7}(\d{4})$/, '$1*******$2') */
							}
							&nbsp; 如需任何帮助，请联系
							<span className="underline_a" onClick={this.props.PopUpLiveChat}>
								在线客服
							</span>。
						</div>
						<div className="verifyPhoneMail__code">
							<div className="verifyPhoneMail__time_text text-center">
								您还有（
								<span style={{ color: '#00A6FF' }}>{otpRemaining}</span>
								）次尝试机会
							</div>
							<div className={`verifyPhoneMail__code__input ${verifyCodeError ? 'codeError' : ''}`}>
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
									<div className="error" style={{ color: '#EB2121', fontSize: '12px' }}>
										{verifyCodeErrorText}
									</div>
								</div>
							)}

							<Button className={` getVerfiyCodeBtn disabledBtn`} onClick={this.onSendOTP}>
								{isOtpReceived ? `重新发送：${otpCountdown}` : <span className="send blue">重新发送</span>}
							</Button>
						</div>
						<Flexbox className="SendBtnSubmit">
							<Button className={`left`} onClick={this.props.onCloseModal}>
								取消
							</Button>
							<Button
								className={`SendVerifyBtn ${!verifyBtnStatus ? 'SendDisabledBtn' : ''}`}
								onClick={this.onSubmitOTP}
							>
								确定
							</Button>
						</Flexbox>
					</div>
				</Modal>
			</Fragment>
		);
	}
}

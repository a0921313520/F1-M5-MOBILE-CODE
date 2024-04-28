import Toast from '@/components/View/Toast';
import { checkIsLogin } from '@/lib/js/util';
import Layout from '@/components/Layout';
import { VerificationAttempt } from '@/api/otp';
import VerifyMail from '@/components/OTP/VerifyMail';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import Router from 'next/router';
import React from 'react';
import Service from '@/components/Header/Service';
import Modal from '@/components/View/Modal';
import { ReactSVG } from '@/components/View/ReactSVG';
class EmailVertify extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showCofirmModal: false,
			verifyModalVisible: true,
			countdownNum: -1,
			isShowResendWord: false,
			email: (props.userInfo.memberInfo && props.userInfo.memberInfo.email) || ''
		};
	}

	componentDidMount() {
		if (checkIsLogin()) {
			this.GetUser();
			this.GetVerificationAttempt();
		} else {
			Router.push('/register_login');
		}
	}

	/**
  	* @description: 剩余验证次数
  	* @param {channelType} 验证类型 SMS, Email, Voice
  	* @return {serviceAction} 需要验证的种类 ContactVerification, CryptoWallet, OTP, Quelea, Revalidate, RegistrationBonus, WithdrawalVerification, DepositVerification, BankCardVerification
  	*/
	GetVerificationAttempt() {
		Toast.loading();
		let params = {
			channelType: 'Email',
			serviceAction: 'WithdrawalVerification'
		};
		VerificationAttempt(params, (data) => {
			Toast.destroy();
			if (data.isSuccess) {
				this.setState({
					EmailTryLimit: data.result.attempt
				});
				if (data.result.attempt == 0) {
					this.props.setLimitVisible();
				}
			}
		});
	}

	componentDidUpdate(prevProps) {
		if (this.props.userInfo.memberInfo.email !== prevProps.userInfo.memberInfo.email) {
			this.setState({
				email: this.props.userInfo.memberInfo.email
			});
		}
	}

	/**
	 * @description: 获取会员详情
	 * @param {*}
	 * @return {*}
  	*/
	GetUser = () => {
		this.props.userInfo_getDetails();
	};

	/**
  	* @description: 发送验证倒计时
  	* @param {*} type 验证类型
  	* @param {*} Limit 验证次数
  	* @return {*}
  	*/
	makeNumInterval = (type, Limit) => {
		// this.setState({
		// 	EmailTryLimit: Limit
		// });
		let countdownNum = 60;
		this[`${type}IntervalNum`] = setInterval(() => {
			if (countdownNum !== 0) {
				countdownNum--;
				this.setState({
					countdownNum
				});
			} else {
				this.setState({
					countdownNum: -1,
					isShowResendWord: true
				});
				clearInterval(this[`${type}IntervalNum`]);
			}
		}, 1000);
	};

	closeVerifyModal = () => {
		Router.push('/me/account-info');
	};
	render() {
		const { email, EmailTryLimit, verifyModalVisible, countdownNum, isShowResendWord } = this.state;
		const { memberInfo } = this.props.userInfo;
		let disabled = memberInfo && memberInfo.email !== '' ? true : false;
		return (
			<React.Fragment>
				<VerifyMail
					type={'WithdrawalVerification'}
					verifyType={'Email'}
					memberInfo={memberInfo}
					email={email}
					onCancel={() => {
						this.setState({
							verifyModalVisible: false
						});
						this.props.getMemberData();
					}}
					ServiceAction={'WithdrawalVerification'}
					mailTryLimit={EmailTryLimit}
					mailTryCalc={() => {
						this.GetVerificationAttempt();
					}}
					//limitToZero={this.mailLimitToZero}
					countdownNum={countdownNum}
					isShowResendWord={isShowResendWord}
					makeNumInterval={(v, t) => {
						this.makeNumInterval(v, t);
					}}
					PopUpLiveChat={() => {
						global.PopUpLiveChat();
					}}
					RouterUrl="/withdrawal"
				/>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

const mapDispatchToProps = {
	userInfo_getDetails: () => ACTION_User_getDetails()
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EmailVertify));

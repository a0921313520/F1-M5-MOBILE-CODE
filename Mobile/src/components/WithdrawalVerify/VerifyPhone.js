import Toast from '@/components/View/Toast';
import { checkIsLogin } from '@/lib/js/util';
import { VerificationAttempt } from '@/api/otp';
import VerifyPhone from '@/components/OTP/VerifyPhone';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import Router from 'next/router';
import React from 'react';
class EmailVertify extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showCofirmModal: false,
			verifyModalVisible: true,
			countdownNum: -1,
			isShowResendWord: false,
			Phone: (props.userInfo.memberInfo && props.userInfo.memberInfo.Phone) || ''
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

	componentDidUpdate(prevProps) {
		if (this.props.userInfo.memberInfo.Phone !== prevProps.userInfo.memberInfo.Phone) {
			this.setState({
				Phone: this.props.userInfo.memberInfo.Phone
			});
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
			channelType: 'SMS',
			serviceAction: 'WithdrawalVerification'
		};
		VerificationAttempt(params, (data) => {
			Toast.destroy();
			if (data.isSuccess) {
				this.setState({
					phoneTryLimit: data.result.attempt
				});
				if (data.result.attempt == 0) {
					this.props.setLimitVisible();
				}
			}
		});
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
		this.setState({
			phoneTryLimit: Limit
		});
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
		const { Phone, countdownNum, isShowResendWord } = this.state;
		const { memberInfo } = this.props.userInfo;
		return (
			<React.Fragment>
				<VerifyPhone
					type={'WithdrawalVerification'}
					verifyType={'phone'}
					memberInfo={memberInfo}
					phoneNumber={Phone}
					onCancel={() => {
						this.setState({
							verifyModalVisible: false
						});
						this.props.getMemberData();
					}}
					ServiceAction={'WithdrawalVerification'}
					phoneTryLimit={this.state.phoneTryLimit}
					phoneTryCalc={() => {
						this.GetVerificationAttempt();
					}}
					countdownNum={countdownNum}
					isShowResendWord={isShowResendWord}
					makeNumInterval={(v, t) => {
						this.makeNumInterval(v, t);
					}}
					PopUpLiveChat={() => {
						global.PopUpLiveChat();
					}}
					RouterUrl=""
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

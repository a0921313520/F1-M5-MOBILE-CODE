import React from 'react';
import Toast from '@/components/View/Toast';
import { checkIsLogin } from '@/lib/js/util';
import Layout from '@/components/Layout';
import { VerificationAttempt } from '@/api/otp';
import VerifyPhone from '@/components/OTP/VerifyPhone';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import Router from 'next/router';
import Service from '@/components/Header/Service';
import Modal from '@/components/View/Modal';
import { ReactSVG } from '@/components/View/ReactSVG';
import ReactIMG from '@/components/View/ReactIMG';
import { PopUpLiveChat } from '@/lib/js/util';
import { otpServiceActionList } from '@/lib/js/Helper';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/account-info'); //參數帶本頁的路徑
}
class EmailVertify extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showCofirmModal: false,
			verifyModalVisible: true,
			countdownNum: -1,
			isShowResendWord: false,
			Phone: (props.userInfo.memberInfo && props.userInfo.memberInfo.Phone) || '',
			overTheLimitVisible: false,
			currentVerifyType: "",
		};
	}

	componentDidMount() {
		if (checkIsLogin()) {
			this.GetUser();
			this.GetVerificationAttempt();
		} else {
			Router.push('/register_login');
		}
		this.props.userInfo_getDetails();
	}

	/**
  	* @description: 剩余验证次数
  	* @param {channelType} 验证类型 SMS, Email, Voice
  	* @return {serviceAction} 需要验证的种类 ContactVerification, CryptoWallet, OTP, Quelea, Revalidate, RegistrationBonus, WithdrawalVerification, DepositVerification, BankCardVerification
  	*/
	GetVerificationAttempt =(callback)=> {
		const queryParams = new URLSearchParams(window.location.search);
		const type = queryParams.get("from");
		let currentVerifyType =  "ProfileOTP";
		if(type && ["WithdrawalPage"].some((item)=>item === type)){
			this.setState({
				currentVerifyType: "withdraw-otp"
			});
			currentVerifyType = "withdraw-otp"
		} else {
			this.setState({
				currentVerifyType
			});
		}
		Toast.loading();
		let params = {
			channelType: 'SMS',
			serviceAction: otpServiceActionList[currentVerifyType]
		};
		
		VerificationAttempt(params, (data) => {
			Toast.destroy();
			if (data.isSuccess) {
				if (data.result.attempt == 0) {
					this.setState({
						overTheLimitVisible: true
					});
				}
				if(data?.result?.attempt){
					this.setState({
						phoneTryLimit: data.result.attempt
					});
					typeof callback === "function" && callback(data.result.attempt);
				}
			}
		});
	}

	componentDidUpdate(prevProps) {
		if (this.props.userInfo.memberInfo.Phone !== prevProps.userInfo.memberInfo.Phone) {
			this.setState({
				Phone: this.props.userInfo.memberInfo.Phone
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
		let countdownNum = 60;
		this[`${type}IntervalNum`] = setInterval(() => {
			if (countdownNum !== 0) {
				countdownNum--;
				this.setState({
					countdownNum,
					isShowResendWord: false,
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

	limitMax = () => {
		this.setState({overTheLimitVisible: true})
	}

	render() {
		const { Phone, phoneTryLimit, verifyModalVisible, countdownNum, isShowResendWord, overTheLimitVisible,currentVerifyType } = this.state;
		console.log(Phone);
		const { memberInfo } = this.props.userInfo;
		console.log(this.props.userInfo);
		return (
			<React.Fragment>
				<Layout
					title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
					Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
					Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
					BarTitle="Xác Thực Qua Số Điện Thoại"
					status={2}
					hasServer={false}
					barFixed={true}
					seoData={this.props.seoData}
				>
					<div style={{background: '#FFF', height: 'calc(100vh - 1.3866666667rem)'}}>
						<div className="header-tools-wrapper absoluteCS">
							<Service />
						</div>
						{overTheLimitVisible ? 
							<div className="verify__overTime">
								<ReactIMG src="/img/verify/warn.png" />
								<div className="verify__overTime__title">Bạn Đã Vượt Quá Số Lần Xác Thực Cho Phép</div>
								<div className="verify__overTime__desc">Bạn đã vượt quá 5 lần xác thực cho phép. Vui lòng thử lại sau 24 giờ hoặc liên hệ 
									<span
										className="underline_a"
										onClick={PopUpLiveChat}
										>
										&nbsp;Live Chat
									</span>
								</div>
							</div> 
							:
							<VerifyPhone
								type={currentVerifyType}
								verifyType={'phone'}
								memberInfo={memberInfo}
								phoneNumber={memberInfo.Phone}
								onCancel={() => {
									this.setState({
										verifyModalVisible: false
									});
								}}
								ServiceAction={otpServiceActionList[currentVerifyType]}
								//changeVerifyType={this.changeVerifyType}
								//goChangePwd={this.goChangePwd}
								phoneTryLimit={this.state.phoneTryLimit}
								phoneTryCalc={this.GetVerificationAttempt}
								//limitToZero={this.phoneLimitToZero}
								countdownNum={countdownNum}
								isShowResendWord={isShowResendWord}
								makeNumInterval={(v, t) => {
									this.makeNumInterval(v, t);
								}}
								PopUpLiveChat={PopUpLiveChat}
								RouterUrl="/me"
								limitMax={this.limitMax}
								setPhoneAttemptRemaining={(v)=>{this.setState({phoneTryLimit:v})}}
							/>
						}
					</div>
					
				</Layout>
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

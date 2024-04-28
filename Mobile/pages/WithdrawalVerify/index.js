import React, { Component } from 'react';
import Layout from '@/components/Layout';
import VerifyPhone from '@/components/WithdrawalVerify/VerifyPhone';
import VerifyMail from '@/components/WithdrawalVerify/VerifyMail';
import Router from 'next/router';
import { ReactSVG } from '@/components/View/ReactSVG';
import Service from '@/components/Header/Service';
import Button from '@/components/View/Button';
import ReactIMG from '@/components/View/ReactIMG';
import IDCard from '@/components/WithdrawalVerify/IDCard';
import Address from '@/components/WithdrawalVerify/Address';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import { withBetterRouter } from '@/lib/js/withBetterRouter';
import Steps, { Step } from 'rc-steps';
import { BsCheckLg } from 'react-icons/bs';
import { PopUpLiveChat } from '@/lib/js/util';
class Verify extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			type: 'realyname', //phone, resetpwd
			noiceVisible: false,
			verifyModalVisible: false,
			verifyType: '',
			resetpwdStep: 1,
			memberInfo: '',
			phoneTryLimit: 3,
			mailTryLimit: 5,
			overTheLimitVisible: false,
			phoneCountdownNum: -1,
			phoneShowResendWord: false,
			mailCountdownNum: -1,
			mailShowResendWord: false
		};
	}

	componentDidMount() {
		this.getMemberData();
	}

	componentDidUpdate(nextPops) {
		if (
			nextPops.userInfo.memberInfo.WithdrawalBeforeVerify !==
			this.props.userInfo.memberInfo.WithdrawalBeforeVerify
		) {
			if (this.props.userInfo.memberInfo.WithdrawalBeforeVerify == 'DoneVerifyStep') {
				Router.push('/withdrawal');
			}
		}
	}

	/**
	 * @description: 获取会员资料
	 * @param {*}
	 * @return {*}
  	*/
	getMemberData() {
		this.props.userInfo_getDetails();
	}

	setLimitVisible = () => {
		this.setState({
			overTheLimitVisible: true
		});
	};

	closeOverTheLimitModal = () => {
		Router.push('/withdrawal');
	};
	/**
	 * @description: 验证次数用尽
	 * @param {*}
	 * @return {*}
  	*/
	OverTime = () => {
		return (
			<React>
				<div className="header-wrapper header-bar">
					<ReactSVG className="back-icon" src="/img/svg/LeftArrow.svg" onClick={this.closeOverTheLimitModal} />
					<span>账户验证</span>
					<div className="header-tools-wrapper">
						<Service />
					</div>
				</div>
				<div className="verify__overTime">
					<ReactIMG src="/img/verify/warn.png" />
					<div className="verify__overTime__title">超过尝试次数</div>
					<div className="verify__overTime__desc">您已超过5次尝试，请24小时后再尝试或 联系在线客服。</div>
					<Button
						className={`verifyBtn_notice`}
						onClick={() => {
							PopUpLiveChat();
						}}
					>
						联系在线客服
					</Button>
				</div>
			</React>
		);
	};
	render() {
		const { type, overTheLimitVisible } = this.state;
		const { memberInfo } = this.props.userInfo;

		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="账户验证"
				status={2}
				hasServer={true}
				barFixed={true}
				backEvent={() => {
					Router.push('/withdrawal');
				}}
			>
				<div className="WithdrawalVerify Verify-box">
					{/* 步骤条 */}
					<Steps
						current={memberInfo && memberInfo.WithdrawalBeforeVerify}
						icons={{ finish: <BsCheckLg color="white" size={14} /> }}
					>
						<Steps.Step />
						<Steps.Step />
						<Steps.Step />
						<Steps.Step />
					</Steps>
					<div className="Content" style={{ marginTop: '10px' }}>
						{/* 第一步 提交 身份证 */}
						{memberInfo &&
						memberInfo.WithdrawalBeforeVerify == 1 && (
							<IDCard
								onRef={(ref) => (this.userInfoContent = ref)}
								onCancel={() => this.setState({ isOpenRealyName: false })}
								onChangeName={(v) => this.setState({ realyName: v })}
								realyNameVisible={true}
								getMemberData={() => this.getMemberData()}
								memberInfo={memberInfo}
								key={type}
							/>
						)}
						{/* 第二步 提交生日 联系地址 */}
						{memberInfo &&
						memberInfo.WithdrawalBeforeVerify == 2 && (
							<Address
								onRef={(ref) => (this.userInfoContent = ref)}
								onCancel={() => this.setState({ isOpenRealyName: false })}
								onChangeName={(v) => this.setState({ realyName: v })}
								realyNameVisible={true}
								getMemberData={() => this.getMemberData()}
								memberInfo={memberInfo}
								key={type}
							/>
						)}
						{/* 第三步 手机号码验证 */}
						{memberInfo &&
						memberInfo.WithdrawalBeforeVerify == 3 && (
							<React.Fragment>
								{!overTheLimitVisible && (
									<VerifyPhone
										key={type}
										getMemberData={() => this.getMemberData()}
										setLimitVisible={() => {
											this.setLimitVisible();
										}}
									/>
								)}
								{overTheLimitVisible && (
									<div className="VerifyWarn">
										<ReactIMG src="/img/verify/warn.png" />
										<h2>超过尝试次数</h2>
										<div className="verify__overTime__desc">
											您已超过5次尝试，请24小时后再尝试<br />或 联系在线客服。
										</div>
									</div>
								)}
							</React.Fragment>
						)}

						{/* 第四步 邮箱验证 */}
						{memberInfo &&
						memberInfo.WithdrawalBeforeVerify == 4 && (
							<React.Fragment>
								{!overTheLimitVisible && (
									<VerifyMail
										key={type}
										getMemberData={() => this.getMemberData()}
										setLimitVisible={() => {
											this.setLimitVisible();
										}}
									/>
								)}
								{overTheLimitVisible && (
									<div className="VerifyWarn">
										<ReactIMG src="/img/verify/warn.png" />
										<h2>超过尝试次数</h2>
										<div className="verify__overTime__desc">
											您已超过5次尝试，请24小时后再尝试<br />或 联系在线客服。
										</div>
									</div>
								)}
							</React.Fragment>
						)}
						{!overTheLimitVisible && (
							<p
								className="nocheck"
								onClick={() => {
									Router.push('/withdrawal');
								}}
							>
								下次再验证
							</p>
						)}
					</div>
				</div>
				{/* <Modal
					className="verify__notice__modal"
					visible={overTheLimitVisible}
					onCancel={this.closeOverTheLimitModal}
					closable={false}
					animation={false}
					mask={false}
				>
				
				</Modal> */}
			</Layout>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

const mapDispatchToProps = {
	userInfo_getDetails: () => ACTION_User_getDetails()
};

export default withBetterRouter(connect(mapStateToProps, mapDispatchToProps)(Verify));

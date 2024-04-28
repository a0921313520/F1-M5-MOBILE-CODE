import React from 'react';
import Toast from '@/components/View/Toast';
import Layout from '@/components/Layout';
import Steps, { Step } from 'rc-steps';
import Router from 'next/router';
import moment from 'moment';
import QRCode from 'qrcode-react';
import QRCodes from 'qrcode';
import copy from 'copy-to-clipboard';
import ReactIMG from '@/components/View/ReactIMG';
import { ReactSVG } from '@/components/View/ReactSVG';
import Flexbox from '@/components/View/Flexbox/';
import { checkIsLogin, PopUpLiveChat } from '@/lib/js/util';
import Modal from '@/components/View/Modal';
import {
	GetQueleaActiveCampaignInfo,
	GetQueleaReferrerInfo,
	GetReferrerSignUp,
	GetReferrerEligible,
	GetReferrerActivity,
	GetReferrerRewardStatus
} from '@/api/referrer';
const customIcon = (isMeet) => (
	<i
		className="yuan"
		style={{
			display: 'block',
			width: '9.6px',
			height: '8.8px',
			border: '0.8px solid  #CCCCCC',
			borderColor: isMeet ? '#1C8EFF' : '#CCCCCC',
			backgroundColor: isMeet ? '#1C8EFF' : 'white',
			borderRadius: '50%',
			//margin: '0 auto'
		}}
	/>
);
const opts = {
	errorCorrectionLevel: 'H',
	type: 'image/png',
	rendererOpts: {
		quality: 0.3
	}
};
class ReferrerActivity extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			hideRule: true,
			step: '',
			applyStep: 1,
			campaignRewardDetails: [],
			campaignSignUpPreCondition: '',
			referUrl: '',
			referCode: '',
			isDepositMet: false,
			isBetAmountMet: false,
			isRegisteredMet: false,
			isVerificationMet: false,
			dateRegister: '',
			startDate: '',
			totalDeposits: 0,
			totalBets: 0,
			emailVerified: false,
			phoneVerified: false,
			infoObj: '',
			successTip: '',
			errorModal: false
		};
		
	}

	componentDidMount() {
	
		this.GetQueleaActiveCampaign(); //查询活动信息
	}

	oneKeyCopy(text) {
		// globalGtag('Copylink_raf');
		copy(text);
		Toast.success('Sao Chép Thành Công');
	}

	/**
  * @description: 注册活动，获取连接
  * @param {*}
  * @return {*}
  */
	ReferrerSignUp = () => {
		GetReferrerSignUp((data) => {
			if (data.isSuccess) {
				this.setState({
					applyStep: 3,
					referUrl: data.result.queleaUrl,
					referCode: data.result.referrerID
				},()=>{this.showQrcode(data.result.queleaUrl)});
			} else {
				Toast.error('即将开启，敬请期待');
			}
		});
	};

	/**
     * @description: 查询活动信息
     * @param {*}
     * @return {*}
    */
	// {
	// 	"isSuccess": false,
	// 	"errors": [
	// 		{
	// 			"errorCode": "VAL14001",
	// 			"description": "No active Quelea campaign",
	// 			"message": "Hệ thống báo lỗi, vui lòng liên hệ Bộ Phận Hỗ Trợ Trực Tuyến!"
	// 		}
	// 	]
	// }
	GetQueleaActiveCampaign = () => {
		let data = JSON.parse(sessionStorage.getItem('QueleaActiveCampaignInfo'))
		if (data) {
			if (checkIsLogin()) {
				this.GetQueleaReferrer(); //检查用户是否已经注册,以及获取用户信息
				this.ReferrerEligible(); //获取用户是否满足申请条件
				this.ReferrerActivity(); //获取用户注册时间,充值金额,是否已经验证手机号和邮箱
				this.ReferrerRewardStatus(); // 获取被推荐人的信息
			}	
			this.setState({
				campaignRewardDetails: data.campaignRewardDetails,
				campaignSignUpPreCondition: data.campaignSignUpPreCondition,
				startDate: data.startDate
			});
		}
	};

	

	/**
     * @description: 检查用户是否已经注册,以及获取用户信息
     * @param {*}
     * @return {*}
    */
	GetQueleaReferrer = () => {
		GetQueleaReferrerInfo((data) => {
			if (data.isSuccess) {
				if (!data.result.referrerID) {
					this.setState({
						applyStep: 1
					});
				} else {
					this.setState({
						applyStep: 3,
						referUrl: data.result.queleaUrl,
						referCode: data.result.referrerID
					},()=>{this.showQrcode(data.result.queleaUrl)});
				}
			}
		});
	};

	/**
     * @description: 获取用户是否满足申请条件
     * @param {*}
     * @return {*}
    */
	ReferrerEligible = () => {
		GetReferrerEligible((data) => {
			if (data.isSuccess) {
				this.setState({
					isDepositMet: data.result.isDepositMet,
					isBetAmountMet: data.result.isBetAmountMet,
					isRegisteredMet: data.result.isRegisteredMet,
					isVerificationMet: data.result.isVerificationMet
				});
			}
		});
	};

	/**
  * @description: 获取用户注册时间,充值金额,是否已经验证手机号和邮箱
  * @param {*}
  * @return {*}
  */
	ReferrerActivity = () => {
		GetReferrerActivity((data) => {
			console.log(data);
			if (data.isSuccess) {
				this.setState({
					dateRegister: data.result[0].dateRegister,
					totalDeposits: data.result[0].totalDeposits,
					totalBets: data.result[0].totalBets,
					emailVerified: data.result[0].emailVerified,
					phoneVerified: data.result[0].phoneVerified
				});
			}
		});
	};

	

	/**
     * @description: 获取被推荐人的信息
     * @param {*}
     * @return {*}
    */
	ReferrerRewardStatus = () => {
		GetReferrerRewardStatus((data) => {
			console.log(data);
			let {
				linkClicked,
				memberRegistered,
				memberDeposited,
				firstTierRewardAmountSetting,
				firstTierMetCount,
				firstTierMsg,
				secondTierMetCount,
				secondTierRewardAmountSetting,
				secondTierMsg,
				referrerPayoutAmount
			} = data.result;
			this.setState({
				infoObj: {
					linkClicked,
					memberRegistered,
					memberDeposited,
					firstTierRewardAmountSetting,
					firstTierMetCount,
					firstTierMsg,
					secondTierMetCount,
					secondTierRewardAmountSetting,
					secondTierMsg,
					referrerPayoutAmount
				}
			});
		});
	};

	/**
     * @description: 报存到手机图片二维码
     * @param {*} Url
     * @return {*}
    */

	saveAs = (value) => {
		value && QRCodes.toDataURL(value, opts, function (err, url) {
			if (err) throw err;
			if(url){
				var blob = new Blob([ '' ], { type: 'application/octet-stream' });
				var urls = URL.createObjectURL(blob);
				var a = document.createElement('a');
				a.href = url;
				// a.download = url.replace(/(.*\/)*([^.]+.*)/gi, '$2').split('?')[0];
				a.download = 'qrcode';
				var e = document.createEvent('MouseEvents');
				e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
				a.dispatchEvent(e);
				URL.revokeObjectURL(urls);
				Toast.success('Lưu Thành Công');
			}
		});
	};
	/**
	 * 展示二维码图片img,供用户长按下载保存到相册
	 */
	showQrcode(url) {
		QRCodes.toDataURL(url, opts, function (err, url) {
		  if (err) throw err;
		  var img = document.getElementById('qrcode');
		  img.src = url;
		});
	}
	getDate = (date) => {
		let y = Number(date.split('-')[0]);
		let m = Number(date.split('-')[1]);
		let d = Number(date.split('-')[2]);
		return `${y}年${m}月${d}日`;
	};

	getDate1 = (date) => {
		return moment(date).format('DD/MM/YYYY');
	};
	
	render() {
		console.log("applyStep",this.state.applyStep)
		const {
			applyStep,
			campaignRewardDetails,
			campaignSignUpPreCondition,
			isDepositMet,
			isBetAmountMet,
			isRegisteredMet,
			isVerificationMet,
			dateRegister,
			totalDeposits,
			totalBets,
			emailVerified,
			phoneVerified,
			infoObj,
			referUrl,
			startDate
		} = this.state;
		console.log(infoObj);
		
		return (
			<>
				<div id="Refer">
					{this.state.successTip && <div className="successTip">{this.state.successTip}</div>}
					<ReactIMG src={'/img/Referrer.jpg'} className="ReferrerTopBanner" />
					{applyStep &&
					applyStep === 3 && (
						<div>
							<p className="title">Giới Thiệu Bạn Bè</p>
							<div className="referBox">
								<p>Chia Sẻ Liên Kết</p>
								<div className="url">{referUrl}</div>
								<div className='copyBtn'>
									<ReactSVG src="/img/svg/copy.svg" onClick={() => this.oneKeyCopy(this.state.referUrl)}/>
								</div>
								<p>Chia Sẻ Mã QR </p>
								<Flexbox justifyContent="center" margin="15px 0 10px">
									{/* <QRCode size={120} value={referUrl} /> */}
									<img id="qrcode"/>
								</Flexbox>
								<div className="clearfix" style={{ width: '304px', margin: '0 auto' }}>
									<span
										className="fl saveBtn"
										onClick={() => {
											this.saveAs(referUrl);
											// globalGtag('Saveqrcode_raf');
										}}
									>
										Lưu Mã QR
									</span>
									<span
										className="fr saveBtn"
										onClick={() => {
											// globalGtag('Share_raf');
											if (window.navigator.share) {
												window.navigator.share({
													title: document.title,
													text: 'Hello World',
													url: referUrl
												});
											} else {
												Toast.error('亲爱的童鞋，由于您的浏览器不支持分享功能，请复制链接分享给您的好友!', 3);
											}
										}}
									>
										Chia Sẻ
									</span>
								</div>
								<p className="qrcodeTip">Chia sẻ đường link hoặc mã QR cho bạn bè để giới thiệu FUN88 và nhận ưu đãi hấp dẫn. Người được giới thiệu có thể đăng ký tài khoản FUN88 thông qua đường link hoặc Mã QR và người giới thiệu có thể kiểm tra trạng thái thưởng tại mục "Tiến Trình"</p>
							</div>
						</div>
					)}
					{applyStep &&
					applyStep === 1 && (
						<div>
							<p className="title">Tiến Trình</p>
							<div className="guide">
								<Flexbox className="card clearfix" alignItems="center">
									<div className="fl">
										<ReactSVG src={'/img/svg/1.svg'} className="Number" />
									</div>
									<div className="fr">
										<div>
											<p>Nhấp vào nút "Tham gia ngay"</p>
											<a>Hãy giới thiệu bạn bè đăng ký</a>
										</div>
									</div>
								</Flexbox>
								<Flexbox className="card clearfix" alignItems="center">
									<div className="fl">
										<ReactSVG src={'/img/svg/2.svg'} className="Number" />
									</div>
									<div className="fr">
										<div>
											<p>Chia sẻ liên kết giới thiệu hoặc mã QR</p>
											<a>Những người bạn được giới thiệu phải đăng ký và chơi trò chơi thông qua liên kết.</a>
										</div>
									</div>
								</Flexbox>
								<Flexbox className="card clearfix" alignItems="center">
									<div className="fl">
										<ReactSVG src={'/img/svg/3.svg'} className="Number" />
									</div>
									<div className="fr">
										<div>
											<p>Kiểm tra tiến độ và nhận tiền thưởng</p>
											<a>Truy cập trang "Giới thiệu bạn bè" để kiểm tra tiến trình đăng ký, gửi tiền và doanh thu của bạn bè.</a>
										</div>
									</div>
								</Flexbox>
							</div>
						</div>
					)}
					{applyStep &&
					applyStep === 2 && (
						<div>
							<p className="title">Tiến Trình</p>
							<div className="guide">
								<div className="card clearfix">
									<div className="fl">
										<ReactSVG src={'/img/svg/1.svg'} className="Number" />
									</div>
									<div className="fr">
										<div>
											<p>Tiền gửi tháng này 1000 đ</p>
											<Flexbox style={{gap:"10px"}}>
												<Flexbox style={{ fontSize: '12.8px'}} alignItems="center">
													{isDepositMet ? (
														<div className='verify-box'>
															<span className="circle-bg green">
																<ReactSVG src={'/img/svg/deposit.svg'} className="icon" />
															</span>
															<span style={{ color: '#222222' }}>
																Gửi Tiền: {totalDeposits}/{campaignSignUpPreCondition ? campaignSignUpPreCondition.totalDepositRequired : 1000}
															</span>
														</div>
													) : (
														<div className='verify-box'>
															<span className="circle-bg white">
																<ReactSVG src={'/img/svg/deposit.svg'} className="icon" />
															</span>
															<span style={{ color: '#666666' }}>
																Gửi Tiền: {totalDeposits}/{campaignSignUpPreCondition ? campaignSignUpPreCondition.totalDepositRequired : 1000}
															</span>
														</div>
													)}
												</Flexbox>
											</Flexbox>
											{!isDepositMet && (
												<button
													className="blueBtn"
													onClick={() => {
														// globalGtag('Depositnow_raf');
														Router.push('/Deposit');
													}}
												>
													Gửi Tiền Ngay
												</button>
											)}
										</div>
									</div>
									<span className={isDepositMet ? 'checked' : 'check'} />
								</div>
								<div className="card clearfix">
									<div className="fl">
										<ReactSVG src={'/img/svg/2.svg'} className="Number" />
									</div>
									<div className="fr">
										<div>
											<p>
											Doanh thu tháng này 3000 đ
												{/* 总充值金额满&nbsp;{campaignSignUpPreCondition ? (
													campaignSignUpPreCondition.totalDepositRequired
												) : (
													0
												)}&nbsp;元并达&nbsp;{campaignSignUpPreCondition ? (
													campaignSignUpPreCondition.totalBetAmountRequired
												) : (
													0
												)}&nbsp;流水 */}
											</p>
											<Flexbox style={{gap:"10px"}}>
												<Flexbox style={{ fontSize: '12.8px' }} alignItems="center">
													{isBetAmountMet ? (
														<div className='verify-box'>
															<span className="circle-bg green">
																<ReactSVG src={'/img/svg/check.svg'} className="icon" />
															</span>
															<span style={{ color: '#222222' }}>
																Doanh thu: {totalBets}/{campaignSignUpPreCondition ? (
																	campaignSignUpPreCondition.totalBetAmountRequired
																) : (
																	3000
																)}
															</span>
														</div>
													) : (
														<div className='verify-box'>
															<span className="circle-bg white">
																<ReactSVG src={'/img/svg/check.svg'} className="icon" />
															</span>
															<span style={{ color: '#666666' }}>
																Doanh thu: {totalBets}/{campaignSignUpPreCondition ? (
																	campaignSignUpPreCondition.totalBetAmountRequired
																) : (
																	3000
																)}
															</span>
														</div>
													)}
												</Flexbox>
											</Flexbox>

											{/* {!isDepositMet && (
												<button
													className="blueBtn"
													onClick={() => {
														globalGtag('Depositnow_raf');
														Router.push('/Deposit');
													}}
												>
													马上存款
												</button>
											)} */}
										</div>
									</div>
									<span className={isDepositMet && isBetAmountMet ? 'checked' : 'check'} />
								</div>
								<div className="card clearfix">
									<div className="fl">
										<ReactSVG src={'/img/svg/3.svg'} className="Number" />
									</div>
									<div className="fr">
										<div>
											<p>Xác Thực Email và Số Điện Thoại</p>
											<Flexbox style={{ fontSize: '12.8px', gap:"10px" }} alignItems="center">
												{phoneVerified ? (
													<div className='verify-box'>
														<span className="circle-bg green">
															<ReactSVG src={'/img/svg/icon-phone.svg'} className="icon" />
														</span>
														<span style={{ color: '#222222' }}>Đã Xác Thực</span>
													</div>
												) : (
													<div className='verify-box'>
														<span className="circle-bg white">
															<ReactSVG src={'/img/svg/icon-phone.svg'} className="icon" />
														</span>
														<span style={{ color: '#666666' }}>Chưa Xác Thực</span>
													</div>
												)}

												{emailVerified ? (
													<div className='verify-box'>
														<span
															className="circle-bg green"
														>
															<ReactSVG src="/img/svg/icon-email.svg" className="icon" />
														</span>
														<span style={{ color: '#222222' }}>Đã Xác Thực</span>
													</div>
												) : (
													<div className='verify-box'>
														<span
															className="circle-bg white"
														>
															<ReactSVG src="/img/svg/icon-email.svg" className="icon" />
														</span>
														<span style={{ color: '#666666' }}>Chưa Xác Thực</span>
													</div>
												)}
											</Flexbox>
											{!isVerificationMet && (
												<button
													className="blueBtn"
													onClick={() => {
														// globalGtag('Verifynow_raf');
														if (!emailVerified) {
															sessionStorage.setItem('testType', 'emailVerify');
															Router.push('/me/account-info/Email');
															return;
														}
														if (!phoneVerified) {
															sessionStorage.setItem('testType', 'phoneVerify');
															Router.push('/me/account-info/Phone');
															return;
														}
													}}
												>
													Xác Thực Ngay
												</button>
											)}
										</div>
									</div>
									<span className={isVerificationMet ? 'checked' : 'check'} />
								</div>
							</div>
						</div>
					)}
					{applyStep &&
					applyStep === 1 && (
						<p className="time">Thời gian bắt đầu hoạt động: {startDate && this.getDate1(startDate.split('T')[0])}</p>
					)}
					{applyStep &&
					applyStep != 1 && (
						<div>
							<p className="title">Tiến Độ Thưởng</p>
							{infoObj && (
								<div className="step">
									<div
										style={{
											padding: '30px 0 0 15px'
										}}
									>
										<Steps
											// className="third-step-wrap"
											direction="vertical"
											size="small"
											current={this.state.step}
											status={this.state.step === 3 || this.state.step === 4 ? 'error' : 'finish'}
										>
											<Step
												title={
													<div className="next-step" style={{ paddingRight: '8px' }}>
														<span
															className="fl colorful"
															style={{
																color: infoObj.linkClicked > 0 ? '#1C8EFF' : '#CCCCCC'
															}}
														>
															Đường Dẫn
														</span>
														<span
															className="fr static"
															style={{
																color: infoObj.linkClicked > 0 ? '#222222' : '#999999'
															}}
														>
															{infoObj.linkClicked}&nbsp;Lượt Nhấn
														</span>
													</div>
												}
												icon={customIcon(infoObj.linkClicked > 0 ? true : false)}
											/>
											<Step
												title={
													<div className="next-step" style={{ paddingRight: '8px' }}>
														<span
															className="fl colorful"
															style={{
																color:
																	infoObj.memberRegistered > 0 ? '#1C8EFF' : '#CCCCCC'
															}}
														>
															Đã Đăng Ký
														</span>
														<span
															className="fr static"
															style={{
																color:
																	infoObj.memberRegistered > 0 ? '#222222' : '#999999'
															}}
														>
															{infoObj.memberRegistered}&nbsp;Bạn
														</span>
													</div>
												}
												icon={customIcon(infoObj.memberRegistered > 0 ? true : false)}
											/>
											<Step
												title={
													<div className="next-step" style={{ paddingRight: '8px' }}>
														<span
															className="fl colorful"
															style={{
																color:
																	infoObj.memberDeposited > 0 ? '#1C8EFF' : '#CCCCCC'
															}}
														>
															Gửi Tiền
														</span>
														<span
															className="fr static"
															style={{
																color:
																	infoObj.memberDeposited > 0 ? '#222222' : '#999999'
															}}
														>
															{infoObj.memberDeposited}&nbsp;Bạn
														</span>
													</div>
												}
												icon={customIcon(infoObj.memberDeposited > 0 ? true : false)}
											/>
											<Step
												title={
													<div className="next-step" style={{ paddingRight: '8px' }}>
														<span
															className="fl colorful"
															style={{
																color:
																	infoObj.firstTierMetCount > 0
																		? '#222222'
																		: '#999999'
															}}
														>
															Thêm &yen;{infoObj.firstTierRewardAmountSetting} d
														</span>
														<span
															className="fr static"
															style={{
																color:
																	infoObj.firstTierMetCount > 0
																		? '#222222'
																		: '#999999'
															}}
														>
															{infoObj.firstTierMetCount}&nbsp;Bạn
														</span>
													</div>
												}
												icon={customIcon(infoObj.firstTierMetCount > 0 ? true : false)}
												description={
													<div className="desc">
														{infoObj.firstTierMsg.depositMsg}／{infoObj.firstTierMsg.turnoverMsg}／{infoObj.firstTierMsg.rulesMsg}
													</div>
												}
											/>
											
											<Step
												title={
													<div className="next-step" style={{ paddingRight: '8px' }}>
														<span
															className="fl colorful"
															style={{
																color:
																	infoObj.secondTierMetCount > 0
																		? '#222222'
																		: '#999999'
															}}
														>
															Thêm &yen;{infoObj.secondTierRewardAmountSetting}
														</span>
														<span
															className="fr static"
															style={{
																color:
																	infoObj.secondTierMetCount > 0
																		? '#222222'
																		: '#999999'
															}}
														>
															{infoObj.secondTierMetCount}&nbsp;Bạn
														</span>
													</div>
													
												}
												icon={customIcon(infoObj.secondTierMetCount > 0 ? true : false)}
												description={
													<div className="desc">
														{infoObj.secondTierMsg.depositMsg}／{infoObj.secondTierMsg.turnoverMsg}／{infoObj.secondTierMsg.rulesMsg}
													</div>
												}
											/>
										</Steps>
									</div>
									<div
										className="clearfix"
										style={{
											height: '64px',
											lineHeight: '64px',
											padding: '0 20px',
											borderTop: '0.8px solid #F0F0F2',
											color: '#222222',
											fontSize: '16px',
											fontWeight: 'bold'
										}}
									>
										<p className="fl">Tổng Thưởng Đạt:</p>
										<p className="fr">&yen;{infoObj.referrerPayoutAmount}</p>
									</div>
								</div>
							)}
						</div>
					)}
					<p className="title">Thưởng</p>
					<div className="list">
						<div className="head">
							<span style={{transform: "translateX(10%)"}}>Người giới thiệu</span>
							<span>Người được giới thiệu</span>
						</div>
						<div className="item">
							<span>Gửi Tiền</span>
							<span>Doanh Thu</span>
							<span>Thưởng Thêm</span>
						</div>
						<div className="item">
							<span>
								{campaignRewardDetails &&
									campaignRewardDetails.length &&
									campaignRewardDetails[0].depositAmount} đ
							</span>
							<span>
								{campaignRewardDetails &&
									campaignRewardDetails.length &&
									campaignRewardDetails[0].turnoverAmount} đ
							</span>
							<span className="redColor">
								{campaignRewardDetails &&
									campaignRewardDetails.length &&
									campaignRewardDetails[0].referralRewardAmount} đ
							</span>
						</div>
					
						<div className="item">
							<span>
								{campaignRewardDetails &&
									campaignRewardDetails.length &&
									campaignRewardDetails[1].depositAmount} đ
							</span>
							<span>
								{campaignRewardDetails &&
									campaignRewardDetails.length &&
									campaignRewardDetails[1].turnoverAmount} đ
							</span>
							<span className="redColor"> 
								{campaignRewardDetails &&
									campaignRewardDetails.length &&
									campaignRewardDetails[1].referralRewardAmount} đ
							</span>
						</div>
					</div>
					<div className="txtContent">
						<div className="tip">
							<p style={{fontWeight:"600"}}>Ví dụ: A giới Thiệu B</p>
							<div>
								B đăng ký vào lúc 01/01/20 gửi tiền 200,000 đ (bao gồm phí gửi tiền) kể từ khi đăng ký, đồng thời hợp lệ tham gia khuyến mãi, A sẽ nhận 100.000 đ cược miễn phí. B sẽ nhận được Gói Thưởng Thành viên Mới.
							</div>

							<br />
							<p>Lưu Ý:</p>
									
							
							<ol className='note-section'>
								<li>
									Giới thiệu tối đa 10 người.
								</li>
								<li>
									Nếu muốn giới thiệu hơn 10 người, vui lòng tham gia chương trình Đại Lý. 
								</li>
								{/* <li>
									需要被推荐人在活动时间内完成相应的存款和流水后推荐人才能获取彩金。（{campaignRewardDetails &&
										campaignRewardDetails.length && campaignRewardDetails[0].referralRewardAmount
									}彩金和{campaignRewardDetails &&
										campaignRewardDetails.length && campaignRewardDetails[1].referralRewardAmount
									}彩金推荐人可以同时获得）
								</li> */}
							</ol>
							
						</div>
						<p className="title">FAQ</p>
						<div className="question">
							<div>
								<p>Q : Tôi có thể tham gia khuyến mãi này đồng thời với khuyến mãi khác ? </p>
								<span>A : Có, bạn vẫn có thể tham gia khuyến mãi khác.</span>
							</div>

							<div>
								<p>Q : Tiền thưởng phải trải qua bao nhiêu vòng cược mới được rút tiền ? </p>
								<span>A : Tiền thưởng phải được cược ít nhất một lần trước khi rút ra. </span>
							</div>
							<div>
								<p>Q : Tôi phải làm thế nào trong trường hợp không thể xác thực số điện thoại và email ? </p>
								<span>
									A : Để được hỗ trợ 24/7. Vui lòng liên hệ bộ phận {' '}
									<a
										style={{ color: '#1C8EFF' }}
										onClick={() => {
											PopUpLiveChat();
										}}
									>
										Live Chat
									</a>
								</span>
							</div>
						</div>
						<button className="hideBtn" onClick={() => this.setState({ hideRule: !this.state.hideRule })}>
							<span>
								{`${!this.state.hideRule ? 'Điều Khoản & Điều Kiện' : 'Điều Khoản & Điều Kiện'}`}
							</span>
								<ReactSVG className="dropdown-arrow" src="/img/P5/i18/icon.svg" />
						</button>
						{!this.state.hideRule && (
							<div className="rule">
								<p>
									<span>1.</span>Người giới thiệu và Người được giới thiệu đăng ký tài khoản thông qua Đại Lý Fun88 đều không được tính hợp lệ nhận khuyến mãi này.
								</p>
								<p>
									<span>2.</span>Người giới thiệu và Người được giới thiệu có các thông tin (Địa chỉ IP, ID thiết bị, Số điện thoại) trùng nhau sẽ không hợp lệ nhận khuyến mãi này.
								</p>
								<p>
									<span>3.</span>Người được giới thiệu phải đăng ký tài khoản sau 
								</p>
								<p>
									<span>4.</span>Người giới thiệu. <br/>Người được giới thiệu chỉ được tính hợp lệ nhận khuyến mãi từ duy nhất 01 Người giới thiệu.
								</p>
								<p>
									<span>5.</span>Thành viên mới đăng ký được bạn bè giới thiệu đến Fun88 thông qua chương trình này có thể lựa chọn nhận thưởng chào mừng từ chỉ một trong hai chương trình ""Thưởng Đăng Ký Thành Viên Mới"" hoặc  ""Phần Thưởng Giới Thiệu Bạn Bè"".
								</p>
								<p>
									<span>6.</span>Họ tên đầy đủ sử dụng để đăng ký tài khoản Fun88 (Đăng Ký hoặc Mở Tài Khoản) bắt buộc phải trùng với tên tài khoản ngân hàng sử dụng cho việc gửi và rút tiền.
								</p>
								<p>
									<span>7.</span>Tiền thưởng của Người giới thiệu (200,000 VND/người giới thiệu thành công) phải được cược ít nhất BA lần trước khi rút ra.
								</p>
								<p>
									<span>8.</span>Người giới thiệu chỉ được nhận tiền thưởng này tối đa 10,000,000 VND/năm (50 người giới thiệu thành công/năm).
								</p>
								<p>
									<span>9.</span>Nếu thành viên bị phát hiện gian lận, có hành vi xấu hoặc trục lợi khuyến mãi, Fun88 có toàn quyền huỷ tất cả tiền thưởng hoặc chặn/ hủy bỏ toàn bộ đơn tham gia khuyến mãi.
								</p>
							</div>
						)}
					</div>
				</div>
				<div className="btnFixed">
					{applyStep &&
					applyStep === 1 && (
						<div
							className="btn"
							style={{ backgroundColor: '#00A6FF' }}
							onClick={() => {
								// globalGtag('Joinnow_raf');
								if (checkIsLogin()) {
									this.setState({
										applyStep: 2
									});
								} else {
									this.setState({
										errorModal: true
									})
									setTimeout(() => {
										this.setState({
											errorModal: false
										})
										Router.push('/register_login');
									}, 2000)
								}
							}}
						>
							Tham Gia Ngay
						</div>
					)}
					{applyStep &&
					applyStep === 2 && (
						<div
							className="btn"
							style={{
								backgroundColor:
									isRegisteredMet && isDepositMet && isBetAmountMet && isVerificationMet
										? '#1C8EFF'
										: '#CCCCCC'
							}}
							onClick={() => {
								if (isRegisteredMet && isDepositMet && isBetAmountMet && isVerificationMet) {
									// globalGtag('Generatelink_raf');
									this.ReferrerSignUp();
								}
							}}
						>
							Tạo Mã Giới Thiệu
						</div>
					)}
				</div>
				<Modal
					visible={this.state.errorModal}
					maskClosable={false}
					title=""
					className="errorModal"
				>
					<center>
						<div>
							<ReactSVG style={{ transform: 'scale(1.5)'}} src="/img/svg/closeWhite.svg"/>
						</div>
						<div>
							Vui Lòng Đăng Nhập
						</div>
					</center>
				</Modal>
				<style jsx global>
					{`
						.container {
							padding-bottom: 96px;
							padding-top: 48px;
						}
						.fl {
							float: left;
						}
						.fr {
							float: right;
						}
						.clearfix::after {
							content: '';
							display: table;
							clear: both;
						}
						.btn {
							width: 92%;
							height: 40px;
							line-height: 40px;
							border-radius: 8px;
							margin: 16px auto;
							color: #fff;
							text-align: center;
						}
						.btnFixed {
							background-color: #fff;
							position: fixed;
							bottom: 0px;
							width: 100%;
						}
					`}
				</style>
			</>
		);
	}
}
export default ReferrerActivity;

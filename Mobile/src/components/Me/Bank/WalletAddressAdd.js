import React from 'react';
import BackBar from '@/components/Header/BackBar';
import Router from 'next/router';
import InputItem from '@/components/View/Input';
import Toast from '@/components/View/Toast';
import Modal from '@/components/View/Modal';
import Flexbox from '@/components/View/Flexbox/';
import Item from '@/components/Deposit/depositComponents/Item';
import { createForm } from 'rc-form';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { AddCryptocurrencyWalletAddress } from '@/api/wallet';
import { BsCheckCircleFill, BsFillXCircleFill  } from 'react-icons/bs';
import { usdtNameReg, usdtERC20Reg, usdtTRC20Reg } from '@/lib/SportReg';
import VerifyPhone from '@/components/OTP/VerifyPhone';
import { VerificationAttempt } from '@/api/otp';
import Service from '@/components/Header/Service';
import ReactIMG from '@/components/View/ReactIMG';
import { ReactSVG } from "@/components/View/ReactSVG";
import { fetchRequest } from "@/server/Request";
import { ApiPort } from "@/api/index";
class BankLimit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			WalletName: '',
			WalletAddress: '',
			memberCode: '',
			remind: false,
			leaveOpen: false,
			successTip: '',
			OpenOTP: false,
			verifyModalVisible: false,
			countdownNum: -1,
			isShowResendWord: false,
			overTheLimitVisible: false,
			passCode: '',
			phoneTryLimit:5,
			isVerifyPassed:false,
			regNameError: false,
			regAddError: false
		};
	}

	componentDidUpdate(prevProps, prevState){
		if(prevState.passCode!== this.state.passCode && this.state.passCode && this.state.isVerifyPassed){
			this.handleSubmit()
		}
		if(prevProps.OpenAdd !== this.props.OpenAdd && this.props.OpenAdd){
			this.GetVerificationAttempt();
		}
	}

	GetVerificationAttempt =(callback)=> {
		console.log("GetVerificationAttempt1")
		Toast.loading();
		fetchRequest(ApiPort.VerificationPaymentPhone, "GET")
			.then((data)=>{
				if (data?.isSuccess  && data?.result?.isAbleSmsOTP && data?.result?.attempts) {
					this.setState({
						phoneTryLimit: data.result.attempts
					});
					typeof callback === "function" && callback(data.result.attempts)
				} else {
					this.limitMax()
				}
			}).finally(()=>{
				Toast.destroy();
			})
	}

	makeNumInterval = (type, Limit) => {
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

	/**
	 * @description: 新增钱包地址
	 * @param {*}
	 * @return {*}
  	*/
	handleSubmit() {
		const { WalletName, WalletAddress } = this.state;
		const params = {
			walletName: WalletName,
			walletAddress: WalletAddress,
			cryptocurrencyCode: this.props.UsdtType,
			isDefault: false,
			passCode: this.state.passCode
		};
		Toast.loading();
		AddCryptocurrencyWalletAddress(params, (res) => {
			Toast.destroy();
			if (res.isSuccess) {
				this.props.GetWalletAddress();
				Toast.success('Thêm Ví Thành Công');
				this.props.CloseModal();
			} else {
				this.setState({
					passCode:"",
					isVerifyPassed:false
				})
				Toast.error(res.result.message, 3);
			}
		});
	}

	/**
	 * @description: 提交验证
	 * @param {*}
	 * @return {*}
	*/

	submitBtnEnable = () => {
		let error = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let errors = Object.values(this.props.form.getFieldsValue()).some((v) => v == '' || v == undefined);
		return !errors && !error;
	};

	limitMax = () => {
		this.setState({overTheLimitVisible: true, verifyModalVisible: false})
	}

	render() {
		const { WalletName, WalletAddress, leaveOpen, OpenOTP, verifyModalVisible, countdownNum, isShowResendWord, overTheLimitVisible } = this.state;
		const { OpenAdd, CloseModal, UsdtType, userInfo, walletAddressList } = this.props;
		const { getFieldDecorator, getFieldError } = this.props.form;
		let USDTREG = UsdtType == 'USDT-ERC20' ? usdtERC20Reg : usdtTRC20Reg;
		let ErrorTxt = UsdtType == 'USDT-ERC20' ? "Bao gồm một chuỗi luôn bắt đầu với ‘0x’ tiếp theo là 40 kí tự chữ ‘a-f’ và số ‘0-9’" : 'Bao gồm một chuỗi 34 ký tự chữ và số bắt đầu bằng "T"';
		return (
			<Modal
				visible={OpenAdd} 
				transparent
				maskClosable={false}
				closable={false}
				title={
					<BackBar
						key="main-bar-header"
						title={`Thêm Ví Tether ${UsdtType}`}
						backEvent={() => {
							CloseModal();
							// this.setState({
							// 	leaveOpen: true
							// });
						}}
						hasServer={true}
					/>
				}
				className="WhiteBg Fullscreen-Modal BankLimit"
			>
				<Item label={`Tên Ví`} errorMessage={getFieldError("WalletName")}>
					{getFieldDecorator('WalletName', {
						rules: [
							// { required: true, message: 'Vui lòng nhập Tên Ví' },
							{
								validator: (rule, value, callback) => {
									if (walletAddressList.length) {
										walletAddressList.map((item) => {
											if(item.walletName == value) {
												callback('Tên ví bị trùng')
											}
											return
										})
									} 
									if (value && !usdtNameReg.test(value)) {
										this.setState({
											regNameError: true
										})
										callback("error-usdt")
									}
									else {
										this.setState({
											regNameError: false
										})
									}
									 callback();
								}
							}
						]
					})(
						<InputItem
							size="large"
							placeholder="Vui lòng nhập Tên Ví"
							onChange={(v) => {
								this.setState({
									WalletName: v.target.value
								});
							}}
							maxLength="20"
						/>
					)}
				</Item>
				<Flexbox className="UsdtError" flexFlow="column" alignItems="flex-start">
					<Flexbox>
						{this.state.regNameError ? 
							<BsFillXCircleFill 
								color={'#F11818'}
								size={14}
							/>
						: 
							<BsCheckCircleFill
								color={WalletName == '' ? '#BCBEC3' : '#0CCC3C'}
								size={14}
							/>
						}
						
						<span className="txt">{'Không bao gồm các ký tự đặc biệt'}</span>
					</Flexbox>
					<br />
					<Flexbox>
						{this.state.regNameError ? 
							<BsFillXCircleFill 
								color={'#F11818'}
								size={14}
							/>
						: 
							<BsCheckCircleFill
								color={WalletName == '' ? '#BCBEC3' : '#0CCC3C'}
								size={14}
							/>
						}
						<span className="txt">{'Tối đa 20 ký tự'}</span>
					</Flexbox>
				</Flexbox>
				<Item label={`Địa Chỉ Ví`} errorMessage={getFieldError("WalletAddress")}>
					{getFieldDecorator('WalletAddress', {
						rules: [
							// { required: true, message: 'Vui lòng nhập Địa Chỉ Ví' },
							{
								validator: (rule, value, callback) => {
									if (walletAddressList.length) {
										walletAddressList.map((item) => {
											if(item.walletAddress == value) {
												callback('Địa chỉ đã tồn tại. Vui lòng thử lại')
											}
											return
										})
									} 
									if (value && !USDTREG.test(value)) {
										this.setState({
											regAddError: true
										})
										callback("error-usdt")
									}
									else {
										this.setState({
											regAddError: false
										})
									}
									callback();
								}
							}
						]
					})(
						<InputItem
							size="large"
							placeholder="Vui lòng nhập Địa Chỉ Ví"
							onChange={(v) => {
								this.setState({
									WalletAddress: v.target.value
								});
							}}
							maxLength={ UsdtType == 'USDT-ERC20' ? '42' : '34'}
						/>
					)}
				</Item>
				<Flexbox className="UsdtError" flexFlow="column" alignItems="flex-start">
					<Flexbox>
						{this.state.regAddError ? 
							<BsFillXCircleFill 
								color={'#F11818'}
								size={14}
							/>
						: 
							<BsCheckCircleFill
								color={WalletAddress == '' ? '#BCBEC3' : '#0CCC3C'}
								size={14}
							/>
						}
						<span className="txt">{'Không bao gồm khoảng trắng và các ký tự đặc biệt'}</span>
					</Flexbox>
					<br />
					<Flexbox>
						<div>
							{this.state.regAddError ? 
								<BsFillXCircleFill 
									color={'#F11818'}
									size={14}
								/>
							: 
								<BsCheckCircleFill
									color={WalletAddress == '' ? '#BCBEC3' : '#0CCC3C'}
									size={14}
								/>
							}
						</div>
						<span className="txt">{ErrorTxt}</span>
					</Flexbox>
				</Flexbox>
				<div
					onClick={() => {
						this.setState({
							OpenOTP:true
						})
					}}
					// onClick={() => {
					// 	if (this.submitBtnEnable()) {
					// 		this.handleSubmit();
					// 	}
					// }}
					className={classNames({
						BtnActive: this.submitBtnEnable(),
						BtnSubmit: true
					})}
				>
					Gửi
				</div>
				<Modal
					className="verify__notice__modal"
					visible={overTheLimitVisible}
					onCancel={() => this.setState({overTheLimitVisible: false})}
					closable={false}
					animation={false}
					mask={false}
				>
					<div className="header-wrapper header-bar">
					<ReactSVG
						className="back-icon"
						src="/img/svg/LeftArrow.svg"
						onClick={() => {
							history.go(-1);
						}}
					/>
						<span>Xác Thực Qua Số Điện Thoại</span>
						<div className="header-tools-wrapper">
							<Service />
						</div>
					</div>
					<div className="verify__overTime">
						<ReactIMG src="/img/verify/warn.png" />
						<div className="verify__overTime__title">Bạn Đã Vượt Quá Số Lần Xác Thực Cho Phép</div>
						<div className="verify__overTime__desc">Bạn đã vượt quá 5 lần xác thực cho phép. Vui lòng thử lại sau 24 giờ hoặc liên hệ 
							<span
								className="underline_a"
								onClick={() => {
									PopUpLiveChat();
								}}
								>
								&nbsp;Live Chat
							</span>
						</div>
					</div>
					</Modal>

				<Modal
					transparent
					maskClosable={false}
					visible={leaveOpen}
					className="OpenOtpModal"
					closable={false}
					title={<div>温馨提醒</div>}
				>
					<Flexbox
						className="Content"
						alignItems="center"
						justifyContent="space-around"
						flexDirection="column"
					>
						<Flexbox margin="10px">您将需要再次验证电话号码以访问此页面，你确定要离开吗？</Flexbox>
					</Flexbox>
					<Flexbox justifyContent="space-around">
						<Flexbox
							className="Cancel"
							onClick={() => {
								CloseModal();
							}}
						>
							离开
						</Flexbox>
						<Flexbox
							className="Confirm"
							onClick={() => {
								this.setState({
									leaveOpen: false
								});
							}}
						>
							继续添加钱包
						</Flexbox>
					</Flexbox>
				</Modal>
				<Modal
					transparent
					maskClosable={false}
					visible={OpenOTP}
					className="OpenOtpModal"
					closable={false}
					title={<div>Xác Thực Tài Khoản</div>}
				>
					<Flexbox
						className="Content"
						alignItems="center"
						justifyContent="space-around"
						flexDirection="column"
					>
						<Flexbox margin="10px">để bảo mật tài khoản Vui lòng xác thực thông tin số điện thoại</Flexbox>
					</Flexbox>
					<Flexbox justifyContent="space-around">
						<Flexbox
							className="Cancel"
							onClick={() => {
								this.setState({ OpenOTP: false });
							}}
						>
							Hủy
						</Flexbox>
						<Flexbox
							className="Confirm"
							onClick={() => {
								this.setState({
									verifyModalVisible: true
								});
							}}
						>
							Xác Thực Ngay
						</Flexbox>
					</Flexbox>
				</Modal>
				<Modal
						className="verify__notice__modal"
						visible={verifyModalVisible}
						onCancel={() => {
							this.setState({
								verifyModalVisible: false,
								OpenOTP: false
							});
						}}
						closable={false}
						animation={false}
						mask={false}
						title={
							<BackBar
								key="main-bar-header"
								title={`Xác Thực Qua Số Điện Thoại`}
								backEvent={() => {
									this.setState({
										verifyModalVisible: false
									});
								}}
								hasServer={true}
							/>
						}
						
					>
						<VerifyPhone
							type={'CryptoWallet'}
							verifyType={'phone'}
							memberInfo={userInfo.memberInfo}
							phoneNumber={userInfo.memberInfo.phoneNumber}
							onCancel={(passCode, isVerifyPassed= false) => {
								this.setState({
									verifyModalVisible: false,
									OpenOTP: false,
									OpenAdd: true,
									passCode: passCode,
									isVerifyPassed:isVerifyPassed
								}, () => {
									this.handleSubmit()
								});
							}}
							ServiceAction={'CryptoWallet'}
							phoneTryLimit={this.state.phoneTryLimit}
							phoneTryCalc={this.GetVerificationAttempt}
							countdownNum={countdownNum}
							isShowResendWord={isShowResendWord}
							makeNumInterval={(v, t) => {
								this.makeNumInterval(v, t);
							}}
							PopUpLiveChat={() => {
								PopUpLiveChat();
							}}
							//验证成功后 关门弹窗就传空/跳转路由就传路径
							RouterUrl=""
							limitMax={this.limitMax}
							setPhoneAttemptRemaining={(v)=>{this.setState({phoneTryLimit:v})}}
						/>
					</Modal>
			</Modal>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});
const mapDispatchToProps = {
	userInfo_getDetails: () => ACTION_User_getDetails()
};

export default connect(mapStateToProps, mapDispatchToProps)(createForm({ fieldNameProp: 'banklimit' })(BankLimit));

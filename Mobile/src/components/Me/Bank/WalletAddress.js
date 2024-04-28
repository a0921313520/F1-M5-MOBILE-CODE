import React from 'react';
import Toast from '@/components/View/Toast';
import Modal from '@/components/View/Modal';
import Flexbox from '@/components/View/Flexbox/';
import Router from 'next/router';
import copy from 'copy-to-clipboard';
import { GetCryptocurrencyWalletAddressDetails, SetDefaultWalletAddress } from '@/api/wallet';
import { BsPlusLg, BsCheckCircleFill } from 'react-icons/bs';
import { PopUpLiveChat } from '@/lib/js/util';
import { RiFileCopy2Line } from 'react-icons/ri';
import VerifyPhone from '@/components/OTP/VerifyPhone';
import BackBar from '@/components/Header/BackBar';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import WalletAddressAdd from './WalletAddressAdd';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { VerificationAttempt } from '@/api/otp';
import Service from '@/components/Header/Service';
import ReactIMG from '@/components/View/ReactIMG';
import { ReactSVG } from "@/components/View/ReactSVG";
import { ApiPort } from "@/api/index";
import { fetchRequest } from "@/server/Request";

class WalletAddress extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			walletAddressList: [],
			BanksDefault: '',
			OpenOTP: false,
			countdownNum: -1,
			verifyModalVisible: false,
			OpenAdd: false,
			isShowResendWord: false,
			passCode: ''
		};
	}

	componentDidMount() {
		this.GetWalletAddress();
		this.props.userInfo_getDetails();
	}

	/**
  * @description: 获取钱包地址
  * @param {*}
  * @return {*}
  */
	GetWalletAddress() {
		this.setState({
			walletAddressList: [],
			walletAddressItem: '',
			loading: true
		});
		let CoinsCurrency = this.props.methodType === '1' ? 'USDT-ERC20' : 'USDT-TRC20';
		let params = {
			CryptoCurrencyCode: CoinsCurrency
		};
		GetCryptocurrencyWalletAddressDetails(params, (data) => {
			if (data.isSuccess) {
				const { result } = data;
				if (result.length) {
					let defaultBank = result.find((v) => v.isDefault);
					let notDefaultBank = result.filter((ele) => !ele.isDefault);
					let data = [ defaultBank, ...notDefaultBank ].filter((ele) => ele);
					this.setState({
						//walletAddressList: data.length > 3 ? data.slice(0, 3) : data,
						walletAddressItem: defaultBank
					});
					if (!defaultBank) {
						this.MemberBanksDefault(result[0]['id']);
						return;
					}
					this.setState({
						walletAddressList: data,
						BanksDefault: defaultBank.id
					});
				} else {
					this.setState({
						walletAddressList: [],
						walletAddressItem: ''
					});
				}
			}
			this.setState({
				loading: false
			});
		});
	}

	/**
	 * @description: 设置默认钱包地址
	 * @param {*} id
	 * @return {*}
  	*/

	MemberBanksDefault(id) {
		Toast.loading();
		let params = {
			walletId: id
		};
		SetDefaultWalletAddress(params, (res) => {
			Toast.destroy();
			if (res.isSuccess == true) {
				Toast.success('Thiết Lập Thành Công');
				this.GetWalletAddress();
			} else {
				this.setState({
					loading: false
				});
				Toast.error('Thiết Lập Không Thành Công');
			}
		});
	}

	/**
	 * @description: 弹出添加钱包
	 * @param {*}
	 * @return {*}
  	*/
	addCard = () => {
		this.setState({
			OpenAdd: true
		});
	};
	
	render() {
		const {
			walletAddressList,
			BanksDefault,
			countdownNum,
			verifyModalVisible,
			OpenOTP,
			OpenAdd,
			passCode,
			isShowResendWord,
			loading,
			overTheLimitVisible
		} = this.state;
		const { methodType, userInfo } = this.props;
		let UsdtType = methodType === '1' ? 'USDT-ERC20' : 'USDT-TRC20';
		return (
			<React.Fragment>
				{loading && (
					<div className="SkeletonTheme">
						<SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
							<Skeleton count={3} height="120px" />
						</SkeletonTheme>
					</div>
				)}
				<Flexbox id="WalletAddress" key={BanksDefault} flexFlow="column" alignItems="center">
					{walletAddressList.length != 0 &&
						walletAddressList.map((item, index) => {
							return (
								<Flexbox flexFlow="column" className="WalletAddressList" key={index + 'LIST'}>
									<Flexbox className="item" justifyContent="space-between" alignItems="center">
										<label>Ví {index + 1}</label>
										{item.isDefault ? (
											<span className="green">
												<BsCheckCircleFill color="#0CCC3C" size={14} />Mặc Định
											</span>
										) : (
											<span
												className="blue"
												onClick={() => {
													this.MemberBanksDefault(item.id);
												}}
											>
												<small>Cài Đặt Mặc Định</small>
											</span>
										)}
									</Flexbox>
									<Flexbox className="item" justifyContent="space-between" alignItems="center">
										<span className="address">{item.walletAddress}</span>
										<RiFileCopy2Line
											color="#00A6FF"
											size={18}
											onClick={() => {
												copy(item.walletAddress);
												Toast.success('Sao Chép Thành Công');
											}}
										/>
									</Flexbox>
								</Flexbox>
							);
						})}
					{walletAddressList.length < 3 &&
						<Flexbox
							className="AddWalletAddress"
							justifyContent="center"
							alignItems="center"
							onClick={() => {
								this.addCard();
							}}
						>
							<BsPlusLg color="#00A6FF" size={12} />
							<span>Thêm Ví {UsdtType}</span>
						</Flexbox>
					}

					<p className="note">
						Bạn có thể thêm tối đa 3 địa chỉ ví. Nếu bạn cần xóa địa chỉ ví, vui lòng <label
							onClick={() => {
								Pushgtagdata(`AccountManagement`,"Contact CS",`AccountManagement_C_CS`)
								PopUpLiveChat();
							}}
						>
							Liên Hệ Live Chat
						</label>
					</p>
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
							// history.go(-1);
							this.setState({
								overTheLimitVisible: false,
								verifyModalVisible: false,
								OpenOTP: false,
								OpenAdd: false,
								passCode: ""
							})
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

					{/* <Modal
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
							onCancel={(passCode) => {
								this.setState({
									verifyModalVisible: false,
									OpenOTP: false,
									OpenAdd: true,
									passCode: passCode
								});
							}}
							ServiceAction={'CryptoWallet'}
							phoneTryLimit={this.state.phoneTryLimit}
							setPhoneAttemptRemaining={(v)=>{this.setState({phoneTryLimit:v})}}
							phoneTryCalc={() => {
								this.GetVerificationAttempt();
							}}
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
						/>
					</Modal> */}

					{/* 添加钱包 */}
					<WalletAddressAdd
						OpenAdd={OpenAdd}
						UsdtType={UsdtType}
						passCode={passCode}
						walletAddressList={walletAddressList}
						CloseModal={() => {
							this.setState({
								OpenAdd: false
							});
						}}
						GetWalletAddress={() => {
							this.GetWalletAddress();
						}}
					/>
				</Flexbox>
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
export default connect(mapStateToProps, mapDispatchToProps)(WalletAddress);

/*
 * @Author: Alan
 * @Date: 2022-05-17 11:55:09
 * @LastEditors: Alan
 * @LastEditTime: 2023-01-27 16:58:33
 * @Description: 免费投注
 * @FilePath: \Mobile\src\components\Promotions\MyPromotions\AppliedFreebet.js
 */
import React from 'react';
import BackBar from '@/components/Header/BackBar';
import Modal from '@/components/View/Modal';
import { checkIsLogin, redirectToLogin } from '@/lib/js/util';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import moment from 'moment';
import Flexbox from '@/components/View/Flexbox/';
import { BsInfoCircle } from 'react-icons/bs';
import Button from '@/components/View/Button';
import Popover from '@/components/View/Popover';
import DetailModal from '../Detail/';
import SelectDrawerMenu from '@/components/View/SelectDrawerMenu';
import { PromoPostApplications } from '@/api/wallet';
import { getE2BBValue } from '@/lib/js/util';
import ReactIMG from '@/components/View/ReactIMG';
import Toast from '@/components/View/Toast';
import { PopUpLiveChat } from '@/lib/js/util';
import { PromotionList } from '@/api/cmsApi';
import { x64 } from 'crypto-js';
class AppliedFreebet extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			/* 隐藏失效的优惠 */
			HideInvalid: true,
			/* 领取免费投注窗口 */
			ModalVisible: false,
			/* 优惠详情窗口 */
			ShowDetail: false,
			/* 优惠id */
			Promoitem: '',
			/* 钱包显示状态 */
			formShow: false,
			CodeState: '',
			/* 当前免费投注钱包 */
			PromoitemActive: {},
			/* 免费投注列表 */
			FreebetList: []
		};
	}

	componentDidMount() {
		if (!checkIsLogin()) {
			redirectToLogin();
			return;
		}
		// let Wallet = JSON.parse(localStorage.getItem('walletList'));
		// if (Wallet) {
		// 	this.SetfromWallet(Wallet);
		// } else {
		// 	this.WalletList();
		// }
		this.FreebetList();
	}

	// WalletList() {
	// 	GetWalletList((res) => {
	// 		if (res.isSuccess) {
	// 			this.SetfromWallet(res);
	// 		}
	// 	});
	// }

	SetfromWallet(Wallet) {
		//let SetWallet = Wallet.result.fromWallet.filter((item) => item.key != 'MAIN');
		this.setState({
			fromWalletList: Wallet,
			CodeState: SetWallet[0].key
		});
	}

	/**
	 * @description:获取免费投注列表
	 * @return {*}
  	*/
	FreebetList() {
		let params = {
			type: 'free'
			// transactionType: '',
			// wallet: ''
		};
		PromotionList(params).then((Freebet)=>{
			const freebetWithBonus = Array.isArray(Freebet) ? Freebet.filter(v => v.bonusData) : [];
			if (freebetWithBonus) {
				this.setState({
					FreebetList: freebetWithBonus,
					CodeState: freebetWithBonus && freebetWithBonus.bonusData ? freebetWithBonus.bonusData[0].wallet : []
				});
			}
		})
	}

	GetBonus(Bonus) {
		// let data = {
		// 	bonusId: Bonus.id,
		// 	amount: Bonus.releaseValue,
		// 	bonusMode: 'Transfer',
		// 	targetWallet: Bonus.wallet,
		// 	isFreeBet: true,
		// 	couponText: '',
		// 	isMax: false,
		// 	transferBonus: {
		// 		fromWallet: '',
		// 		transactionId: ''
		// 	},
		// 	successBonusId: '',
		// 	blackBox: getE2BBValue(),
		// 	blackBoxValue: getE2BBValue(),
		// 	e2BlackBoxValue: getE2BBValue()
		// };
		let data = {
			blackBox: getE2BBValue(),
			bonusId: Bonus.id,
			amount: Bonus.releaseValue,
			bonusMode: 'Transfer',
			targetWallet: Bonus.wallet,
			couponText: '',
			isMax: false,
			transferBonus: {
				fromWallet: '',
				transactionId: 0,
				isFreeBet: true
			},
			depositBonus: {
				depositCharges: 0,
				depositId: ''
			},
			successBonusId: ''
		};
		Toast.loading();
		PromoPostApplications(data, (res) => {
			if (res.isSuccess && res.result.message != '申请红利失败') {
				Modal.info({
					title: '',
					centered: true,
					okText: 'Khuyến Mãi Của Tôi',
					cancelText: 'Đóng',
					className: `VerificationBankModal`,
					content: (
						<React.Fragment>
							<center>
								<ReactIMG src="/img/success.png" />
							</center>
							<h3 style={{ marginTop: '10px', fontSize: '20px' }}>
								<center>Nhận Thưởng Thành Công</center>
							</h3>
							<div className="note">Khuyến mãi được áp dụng</div>
						</React.Fragment>
					),
					onOk: () => {
						this.setState({
							ModalVisible:false,
							ShowDetail:false,
							CodeState:'',
							PromoitemActive:{}
						},()=>{
							this.props.tabChangeHandler('1')
						})
					},
					onCancel: () => {}
				});
			} else {
				Modal.info({
					title: '',
					centered: true,
					okText: 'OK',
					cancelText: 'Live Chat',
					className: `VerificationBankModal`,
					content: (
						<React.Fragment>
							<center>
								<ReactIMG src="/img/error.png" />
							</center>
							<h3 style={{ marginTop: '10px', fontSize: '20px' }}>
								<center>Không Thể Nhận Thưởng</center>
							</h3>
							<div className="note">Dường như có sự cố xảy ra, vui lòng thử lại hoặc liên hệ Live Chat để được hỗ trợ.</div>
						</React.Fragment>
					),
					onOk: () => {},
					onCancel: () => {
						PopUpLiveChat();
					}
				});
			}

			Toast.destroy();
		});
	}
	
	makeNumInterval(time) {
		function addZero(n) {
			return n < 10 ? '0' + n : n;
		}
		let newTime = time.replace('T', ' ').replace('Z', '').replace(/\-/g, '/')
		let timer = Number(new Date(newTime).getTime()) - Number(new Date().getTime());
		if (timer > 1000) {
			let day = addZero(moment.duration(timer).days());
			let mins = addZero(moment.duration(timer).minutes());
			let hours = addZero(moment.duration(timer).hours());
			return (`${day} Ngày ${hours} Giờ ${mins} Phút`)
		}
	}

	render() {
		const {
			FreebetList,
			ShowPopover,
			ModalVisible,
			ShowDetail,
			Promoitem,
			fromWalletList,
			CodeState,
			SubmitVisible,
			PromoitemActive
		} = this.state;
		console.log(fromWalletList);
		console.log(FreebetList);
		const {openedFreebetPopoverIndex, setOpenPopoverIndex} =  this.props;
		return (
			<div className="PromotionsFreeBet">
				{FreebetList &&
					FreebetList.map((item, index) => {
						return (
							<div key={index + 'list'} className="FreeBet">
								<Flexbox flexFlow="column" className="Content">
									<Flexbox flexFlow="column">
										<label className="Name">
											<b
												onClick={() => {
													console.log('FreebetList =================> ',item);
													this.setState(
														{
															Promoitem: item
														},
														() => {
															this.setState({
																ShowDetail: true
															});
														}
													);
												}}
											>
												{item.promoTitle}
											</b>
											<BsInfoCircle
												size={17}
												color="#00A6FF"
												onClick={() => {
													this.setState({
														ShowPopover: true
													});
												}}
											/>
										</label>
										<small className="Time">
											Kết Thúc Trong: {this.makeNumInterval(item.endDate)}
										</small>
									</Flexbox>
									<Button
										onClick={() => {
											this.setState({
												Promoitem: item,
												ModalVisible: true
											});
										}}
									>
										Đăng Ký Ngay
									</Button>
								</Flexbox>
								{openedFreebetPopoverIndex!==false &&
									<Popover
										direction="top"
										className="Freebet-popover"
										visible={ShowPopover}
										onClose={() => {
											this.setState({ ShowPopover: false });
										}}
									>
										<span>
										Thưởng cược miễn phí đặc biệt <br/>dành cho bạn. Nhấp nhận thưởng  <br/>trước khi ưu đãi hết hạn.
										</span>
									</Popover>
								}
							</div>
						);
					})}
				{FreebetList &&
				FreebetList.length == 0 && (
					<div className="NullData">
						<ReactIMG src="/img/svg/boxnull.svg" />
						<p>Không có thưởng miễn phí</p>
					</div>
				)}
				{!FreebetList && (
					<div style={{ paddingTop: '15px' }}>
						<SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
							<Skeleton count={5} height="125px" />
						</SkeletonTheme>
					</div>
				)}
				{/* 打开优惠详情窗口 */}
				{ShowDetail && (
					<DetailModal
						PromoId={Promoitem.promoId}
						ShowDetail={ShowDetail}
						History={
							 {
								status: 'Apply'
							}
						}
						CloseDetail={() => {
							this.setState({
								ShowDetail: false
							});
						}}
					/>
				)}
				{/* 领取免费投注窗口 */}
				<Modal
					className="FreeBet-Modal verify__notice__modal"
					visible={ModalVisible}
					onCancel={() => {
						this.setState({
							ModalVisible: false
						});
					}}
					closable={false}
					animation={false}
					mask={false}
					title={
						<BackBar
							key="main-bar-header"
							title={`Thưởng Miễn Phí Mỗi Ngày`}
							backEvent={() => {
								this.setState({
									ModalVisible: false
								});
							}}
							// hasServer={true}
						/>
					}
				>
					<div className="FreeBet-Content">
						<div className="Info">

							<h3 className="title">{Promoitem.promoTitle || '--'}</h3>
							<Flexbox className="list">
								<div>
									<small>Số tiền thưởng</small>
									<h3>
										<b>{PromoitemActive.releaseValue || '--'}</b>
									</h3>
								</div>
								<div>
									<small>Doanh thu yêu cầu</small>
									<h3>
										<b>{PromoitemActive.givenAmount || '--'}</b>
									</h3>
								</div>
							</Flexbox>
						</div>
						<div className="Submit">
							<SelectDrawerMenu
								bank={false}
								HideAll={true}
								MenuTitle
								labelName="Ví Nhận Thưởng"
								Placeholder="Vui lòng chọn ví tiền để cập nhật tiền thưởng"
								keyName={[ 'walletLocalizedName', 'wallet' ]}
								SelectMenu={Promoitem.bonusData}
								SetCodeState={CodeState}
								setBankCode={(v, obj) => {
									this.setState({
										CodeState: v,
										PromoitemActive: obj
									});
								}}
							/>
							<Button
								onClick={() => {
									this.setState({
										SubmitVisible: true
									});
								}}
								key={CodeState}
								disabled={CodeState == ''}
								id="submit-btn"
							>
								 Xác Nhận
							</Button>
						</div>
					</div>
				</Modal>
				<Modal
					transparent
					maskClosable={false}
					visible={SubmitVisible}
					className="OpenOtpModal"
					closable={false}
					title={<div>Thông báo</div>}
				>
					<Flexbox
						className="Content"
						alignItems="center"
						justifyContent="space-around"
						flexDirection="column"
					>
						<Flexbox margin="10px 0px 10px 0px" style={{textAlign: 'center', color: '#000000'}}>Vui lòng lưu ý, sau khi xác nhận nhận thưởng, ví tiền sẽ tạm thời bị khóa và không thể chuyển quỹ cho tới khi đạt doanh thu yêu cầu.</Flexbox>
					</Flexbox>
					<Flexbox justifyContent="space-around">
						<Flexbox
							className="Cancel"
							onClick={() => {
								this.setState({
									SubmitVisible: false
								});
							}}
						>
							Đóng
						</Flexbox>
						<Flexbox
							style={{padding: '0.4rem 0rem'}}
							className="Confirm"
							onClick={() => {
								this.GetBonus(PromoitemActive);
								this.setState({
									SubmitVisible: false
								});
							}}
						>
							Khuyến Mãi Của Tôi
						</Flexbox>
					</Flexbox>
				</Modal>
			</div>
		);
	}
}

export default AppliedFreebet;

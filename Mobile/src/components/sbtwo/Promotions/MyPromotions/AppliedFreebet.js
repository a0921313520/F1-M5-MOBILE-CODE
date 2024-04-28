/*
 * @Author: Alan
 * @Date: 2022-05-17 11:55:09
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-25 17:31:13
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
		Toast.loading('请稍候...');
		PromoPostApplications(data, (res) => {
			if (res.isSuccess && res.result.message != '申请红利失败') {
				Modal.info({
					title: '',
					centered: true,
					okText: '我的优惠',
					cancelText: '关闭',
					className: `VerificationBankModal`,
					content: (
						<React.Fragment>
							<center>
								<ReactIMG src="/img/success.png" />
							</center>
							<h3 style={{ marginTop: '10px', fontSize: '20px' }}>
								<center>领取成功</center>
							</h3>
							<div className="note">已申请该优惠</div>
						</React.Fragment>
					),
					onOk: () => {
						Router.push({
							pathname: '/promotions',
							query: { tab: 'MyPromotions' }
						});
					},
					onCancel: () => {}
				});
			} else {
				Modal.info({
					title: '',
					centered: true,
					okText: '好的',
					cancelText: '联系在线客服',
					className: `VerificationBankModal`,
					content: (
						<React.Fragment>
							<center>
								<ReactIMG src="/img/error.png" />
							</center>
							<h3 style={{ marginTop: '10px', fontSize: '20px' }}>
								<center>无法领取</center>
							</h3>
							<div className="note">发生错误，请联系在线客服获取协助</div>
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
													console.log(item);
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
											结束时间：{moment(new Date(item.endDate)).format('YYYY-MM-DD hh:mm:ss')}
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
										立即领取
									</Button>
								</Flexbox>
							</div>
						);
					})}
				{FreebetList &&
				FreebetList.length == 0 && (
					<div className="NullData">
						<ReactIMG src="/img/svg/promoNull.svg" />
						<p>暂时没有任何优惠</p>
					</div>
				)}
				{!FreebetList && (
					<div style={{ paddingTop: '15px' }}>
						<SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
							<Skeleton count={5} height="125px" />
						</SkeletonTheme>
					</div>
				)}
				<Popover
					direction="top"
					className="Freebet-popover"
					visible={ShowPopover}
					onClose={() => {
						this.setState({ ShowPopover: false });
					}}
				>
					<span>
						该免费投注为您特别优惠。<br />马上点击领取以防优惠失效。
					</span>
				</Popover>
				{/* 打开优惠详情窗口 */}
				{ShowDetail && (
					<DetailModal
						PromoId={Promoitem.promoId}
						ShowDetail={ShowDetail}
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
					visible={ModalVisible} //ModalVisible
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
							title={`免费投注申请`}
							backEvent={() => {
								this.setState({
									ModalVisible: false
								});
							}}
							hasServer={true}
						/>
					}
				>
					<div className="FreeBet-Content">
						<div className="Info">
							<h3 className="title">{PromoitemActive.bonusGroupTitle || '--'}</h3>
							<Flexbox className="list">
								<div>
									<small>投注金额</small>
									<h3>
										<b>￥{PromoitemActive.releaseValue || '--'}</b>
									</h3>
								</div>
								<div>
									<small>所需流水</small>
									<h3>
										<b>{PromoitemActive.givenAmount || '--'}</b>
									</h3>
								</div>
							</Flexbox>
						</div>
						<div className="Submit">
							<SelectDrawerMenu
								MenuTitle
								labelName="产品钱包"
								Placeholder="请选择产品钱包记入免费旋转"
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
							>
								提交
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
					title={<div>温馨提示</div>}
				>
					<Flexbox
						className="Content"
						alignItems="center"
						justifyContent="space-around"
						flexDirection="column"
					>
						<Flexbox margin="10px">请注意，点击确认后，钱包余额将被暂时锁定 无法转出，直到满足流水要求为止。</Flexbox>
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
							取消
						</Flexbox>
						<Flexbox
							className="Confirm"
							onClick={() => {
								this.GetBonus(PromoitemActive);
								this.setState({
									SubmitVisible: false
								});
							}}
						>
							确认
						</Flexbox>
					</Flexbox>
				</Modal>
			</div>
		);
	}
}

export default AppliedFreebet;

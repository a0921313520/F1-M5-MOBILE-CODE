/*
 * @Author: Alan
 * @Date: 2022-05-10 22:05:09
 * @LastEditors: Alan
 * @LastEditTime: 2023-02-02 22:03:46
 * @Description: 优惠详情
 * @FilePath: \Mobile\src\components\Promotions\Detail\index.js
 */
import React from 'react';
import Modal from '@/components/View/Modal';
import BackBar from '@/components/Header/BackBar';
import classNames from 'classnames';
import { PromotionInfo } from '@/api/promotions';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { checkIsLogin, redirectToLogin, PopUpLiveChat } from '@/lib/js/util';
import { ACTION_UserInfo_getBalance, ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import Router from 'next/router';
import Button from '@/components/View/Button';
import Toast from '@/components/View/Toast';
import { getUrlVars } from '@/lib/js/Helper';
import { ApiPort } from '@/api/index';
import { fetchRequest } from '@/server/Request';
import ReactIMG from '@/components/View/ReactIMG';
import { PromotionDetail } from '@/api/cmsApi';
import QRCode from 'qrcode-react';
import { ReactSVG } from "@/components/View/ReactSVG";
import copy from 'copy-to-clipboard';
import { toPng } from 'html-to-image';
class PromoInfo extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			sharePromo: false
		};
		this.elementRef = React.createRef();
	}
	componentDidMount() {
		console.log('this.props !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',this.props)
		this.getPromotionInfo();
	}

	/**
	 * @description: 获取优惠详情的内容
	 * @param {*}
	 * @return {*}
  	*/
	getPromotionInfo() {
		let jumpfrom = getUrlVars()['jumpfrom'];
		let params = {
			id: this.props.PromoId,
			jumpfrom: jumpfrom
		};

		const { ActiveItem } = this.props;

		PromotionDetail(params).then((res) => {
			let newState = {
				Info: res
			};

			if (res && res.history) {
				newState.History = res.history; //自帶history的優先，因為promotionlist獲取的history可能範圍過大，會拿到比較舊的數據
			} else if (ActiveItem && ActiveItem.history) {
				newState.History = ActiveItem.history; //沒有自帶history才嘗試從promotionlist獲取
			}
			this.setState(newState);
		});
	}

	/**
	 * @description: 检查申请人数是否已满
	 * @return {*}
	*/

	CheckMaxApplicant = (Info) => {
		if (!checkIsLogin()) {
			redirectToLogin();
			return;
		}
		Toast.loading();
		fetchRequest(ApiPort.CheckMaxApplicant + '?promoId=' + Info.promoId + '&', 'GET')
			.then((res) => {
				console.log(res);
				if (res.isSuccess && !res.result) {
					this.SubmitApply(Info);
				} else {
					Modal.info({
						centered: true,
						className: `commonModal`,
						footer: null,
						type: 'confirm',
						okText: 'Khuyến mãi của tôi',
						onlyOKBtn: true,
						closable: false,
						title: 'Không Thể Nhận Thưởng',
						content: (
							<React.Fragment>
								<center>
									<ReactIMG src="/img/svg/Rederror.svg" className="ErrorProm" />
								</center>
								<div className="note">Rất tiếc, khuyến mãi này hiện đã có nhiều người đăng ký, vui lòng thử đăng ký các khuyến mãi khác.</div>
							</React.Fragment>
						),
						onOk: () => {
							this.props.CloseDetail();
						},
						onCancel: () => {
							Router.push('/');
						}
					});
				}
				Toast.destroy();
			})
			.catch((error) => {
				console.log(error);
				Toast.error('申请失败，请稍后尝试，或联系客服');
			});
	};

	/**
	 * @description: 申请红利
	 * @param {*} Info 优惠详情
	 * @return {*}
  	*/
	SubmitApply(Info) {
		if (!checkIsLogin()) {
			redirectToLogin();
			return;
		}

		/* 申请红利 */
		// 前端須自行判斷
		// (1)如ui flow 提到的 (1)檢查total balance < 最小申請優惠金額 則轉跳存款頁(顯示優惠欄位並鎖定)
		// (2) 若主錢包 >= 最小申請優惠金額 且 產品錢包 <= 最小申請優惠金額 則轉跳至轉帳頁 (鎖定目标账户)
		// (3) 若主錢包 <= 最小申請優惠金額 且 產品錢包 >= 最小申請優惠金額 則轉跳至轉帳頁 (源自账户加one click transfer 紐)
		if (Info.promoType == 'Bonus') {
			// if (Info.actionType == 'SOS') {
			// 	this.ApplicationSOS(Info);
			// 	return;
			// }
			/* ---------------余额小于100提示去充值---------------- */
			if (Info.actionType == 'DEPOSIT_PAGE_ONLY' || this.props.userInfo.Balance.TotalBal < Info.bonusMinAmount) {
				Modal.info({
					title: 'Không Đủ Số Dư',
					centered: true,
					okText: 'Gửi Tiền',
					cancelText: 'Huy',
					closable:false,
					className: `commonModal`,
					content: (
						<React.Fragment>
							<p style={{ padding: '10px 0 25px 0px', textAlign: 'center' }}>Xin lỗi, hiện số dư của bạn không đủ để tham gia khuyến mãi này, vui lòng "Gửi Tiền" và tiếp tục tham gia.</p>
						</React.Fragment>
					),
					onOk: () => {
						const depositBonus = {
							bonusId: Info.bonusId,
							promoTitle: Info.promoTitle,
							bonusProduct: Info.bonusProduct,
						}
						localStorage.setItem("depositBonus", JSON.stringify(depositBonus))
						localStorage.setItem("promotionID", JSON.stringify(this.props.PromoId))
						this.props.CloseDetail();
						Router.push(`/deposit`);
					},
					onCancel: () => {}
				});
			} else {
				Router.push(`/Transfer?bonus=${Info.bonusId}&wallet=${Info.bonusProduct}`);
			}
			/* 申请礼品 */
		} else if (Info.promoType == 'Manual') {
			if (
				this.props.userInfo.memberInfo.firstName == '' ||
				!(this.props.userInfo.memberInfo.phoneStatus == 'Verified') ||
				!(this.props.userInfo.memberInfo.emailStatus == 'Verified')
			) {
				Toast.error('Thông tin chưa đầy đủ, vui lòng vào phần thông tin cá nhân để hoàn thiện!', 3);
				setTimeout(() => {
					Router.push(`/me/account-info`);
				}, 3000)
				return;
			}
			/* 填写礼品申请资料 */
			Router.push(`/promotions/manual?id=${Info.promoId}&title=${Info.promoTitle}`);
		}
	}

	ApplicationSOS = (Info) => {
		let postData = {
			sosBonusId: Info.bonusId
		};
		Toast.loading();
		fetchRequest(ApiPort.ApplicationSOS + 'sosBonusId=' + Info.bonusId + '&', 'POST')
			.then((res) => {
				console.log(res);
				if (res) {
				}
				Toast.destroy();
			})
			.catch((error) => {
				console.log(error);
			});
	};

	/**
	 * @description: 领取红利
	 * @param {*} id 优惠ID
	*/
	ClaimBonus = (ID) => {
		let postData = {
			playerBonusId: ID
		};
		Toast.loading();
		fetchRequest(ApiPort.ClaimBonus, 'POST', postData)
			.then((res) => {
				console.log(res);
				if (res) {
					if (res.isClaimSuccess) {
						Toast.success(res.message);
						this.props.CloseDetail();
						this.props.PromotionList();
					} else {
						Toast.error(res.message);
					}
				}
				Toast.destroy();
			})
			.catch((error) => {
				console.log(error);
			});
	};

	copyBtn(value) {
		copy(value);
		Toast.success('Sao Chép Thành Công');
	}

	htmlToImageConvert(e) {
		toPng(e.current, { cacheBust: false })
		.then((dataUrl) => {
			const link = document.createElement("a");
			link.download = "promotion.png";
			link.href = dataUrl;
			link.click();
			Toast.success('Lưu Ảnh Thành Công');
		})
		.catch((err) => {
		  console.log(err);
		});
	}

	render() {
		const { ShowDetail, CloseDetail, ActiveItem } = this.props;
		const { Info, History, sharePromo } = this.state;
		console.log('优惠详情数据-------------------->>>>>', Info);
		console.log('父级数据------------------------>>>>>', ActiveItem);
		return (
			<div className="PromoDetail">
				<Modal
					visible={ShowDetail}
					transparent
					maskClosable={false}
					closable={false}
					title={<div>
						<BackBar
							key="main-bar-header"
							title={'Chi Tiết Khuyến Mãi'}
							backEvent={() => {
								let jumpfrom = getUrlVars()['jumpfrom'];
								if (jumpfrom) {
									Router.push('/');
									return;
								}
								CloseDetail();
							}}
							// hasServer={true}
						/>
						<div className="sharePronoIcon" onClick={() => {this.setState({sharePromo: true})}}>
							<ReactSVG
								style={{transform: 'scale(1.2)'}}
								src="/img/svg/share.svg"
							/>
						</div>
					</div>

					}
					className={classNames({
						'Fullscreen-Modal': true,
						PromoModalDetail: true
					})}
				>
					<div className="PromoDetail">
						{Info && (
							<React.Fragment>
								<div>
									<div
										dangerouslySetInnerHTML={{
											__html: Info.body
										}}
									/>
								</div>
							</React.Fragment>
						)}
						{!Info && (
							<SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
								<Skeleton count={18} height="20px" />
							</SkeletonTheme>
						)}
					{/* 申请按钮 */}
					{Info &&  (
						<div className="SubmitBtn">
							{(() => {
								switch (History?.status) {
									case 'Processing':
										return (
											<Button
												onClick={() => {
													Router.push(
														`/promotions/manual?id=${Info.bonusId}&&title=${Info.promoTitle}`
													);
												}}
											>
												Xem Lại Đơn Đăng Ký
											</Button>
										);
									case 'Serving':
										return (
											History && (
												<div>
													<div className="ProgressBar margin-bottom-xs">
														<div
															className="Progress"
															style={{
																width: History.percentage + '%'
															}}
														/>
													</div>
													Cần doanh thu  <b>{History.turnoverNeeded}</b>để được nhận tiền thưởng {' '}
													<b>{History.bonusAmount} đ</b>
												</div>
											)
										);
									case 'Release':
										return (
											History?.isClaimable && (
												<Button
													style={{ background: '#33C85D' }}
													onClick={() => {
														this.ClaimBonus(History?.playerBonusId);
													}}
												>
													Nhận Khuyến Mãi
												</Button>
											)
										);
									case 'Waiting for release':
										return <Button disabled>Đã Gửi</Button>;
									case 'Served':
									case 'Force to served':
										return <Button disabled>Đã Nhận</Button>;
									default:
										// 參考manual promo表跟 promoType == bonus表 （找doreen拿）
										return (Info.promoType === 'Manual' ?
											((Info.isNotStart && !Info.isExpired) || (!Info.isNotStart && Info.isExpired)) ?
												(<Button disabled>Chỉ Áp Dụng Trong Thời Gian Quy Định</Button>)
											:
												((Info.isNotStart === false && Info.isExpired === false && Info.isInApplicationDuration === true) ?
													(Info.actionType === 'APPLY_FORM' ?
														(<Button
															onClick={() => {
																if (Info.promoType == 'Manual') {
																	this.CheckMaxApplicant(Info);
																} else {
																	this.SubmitApply(Info);
																}

																if (ActiveItem && ActiveItem.bonusData) {
																	// Pushgtagdata(
																	// 	`Promo Application`,
																	// 	'Submit',
																	// 	`Apply_${ActiveItem.bonusData.id}_PromoPage`
																	// );
																} else {
																	// Pushgtagdata(	
																	// 	`Promo Application`,
																	// 	'Submit',
																	// 	`Apply_${Info.promoId}_PromoPage`
																	// );
																}
															}}
														>
														Đăng Ký Ngay
													</Button>)
													:
													(Info.actionType === 'LIVECHAT' ?
														(<Button
															onClick={() => {
																PopUpLiveChat();
															}}
														>
															Liên Hệ Live Chat
														</Button>)
														:
														(<div/>)))
													:
													(Info.isNotStart === false && Info.isExpired === false && Info.isInApplicationDuration === false) ?
														<Button disabled>Chỉ Áp Dụng Trong Thời Gian Quy Định</Button>
													:
													<div/>)
											: Info.promoType === 'Bonus' && Info.actionType === 'NO_ACTION' ?
													<div/>
											: Info.actionType === 'LIVECHAT' ?
												<Button
													onClick={() => {
														PopUpLiveChat();
													}}
												>
													Liên Hệ Live Chat
												</Button>
										: Info.actionType === 'FUND_IN' || Info.actionType === 'DEPOSIT_PAGE_ONLY' ?
											<Button
												onClick={() => {
													this.SubmitApply(Info);

												}}
											>
												Đăng Ký Ngay
											</Button>
										: 
										(<div/>));
									}
							})()}
						</div>
						)}
					</div>
				</Modal>
				<Modal
				visible={sharePromo}
				className="sharePromoModal"
				transparent
				maskClosable={false}
				closable={false}>
					{Info &&
						<div>
							<div style={{width: '95%', margin: 'auto'}}>
								<div ref={this.elementRef} className='sharePromoDetail'>
									<img className='imgCon' src={Info.image} />
									<div className='shareDetail'>
										<div style={{width: '75%'}}>
											<div style={{marginBottom: '0.2rem', fontWeight: 'bold', overflowWrap: 'break-word'}}>{Info.promoTitle}</div>
											<p>Thời gian hoạt động:</p>
											<p>{Info.dateRange}</p>
										</div>
										<div style={{marginLeft: '0.3rem',width: '25%'}}>
											<QRCode size={80} value={global.location.href} />
										</div>
									</div>
								</div>
							</div>
							<div>
								<div className='shareActionCon'>
									<div className="shareAction" onClick={() => this.copyBtn(global.location.href)}>
										<div>
											<ReactSVG
												style={{transform: 'scale(2)'}}
												src="/img/svg/promotionCopy.svg"
											/>
										</div>
										<div className='shareActionTitle'>
											Sao Chép
										</div>
									</div>
									<div className="shareAction" style={{marginLeft: '0.5rem'}} onClick={() => this.htmlToImageConvert(this.elementRef)}>
										<div>
											<ReactSVG
												style={{transform: 'scale(2)'}}
												src="/img/svg/promotionDownload.svg"
											/>
										</div>
										<div className='shareActionTitle' style={{marginLeft: '-0.55rem'}}>
											Lưu Mã QR
										</div>
									</div>
								</div>
								<div className='sharePromoClose' onClick={() => {this.setState({sharePromo: false})}}>
									Đóng
								</div>
							</div>
						</div>
					}

				</Modal>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

const mapDispatchToProps = {
	userInfo_getBalance: (forceUpdate = false) => ACTION_UserInfo_getBalance(forceUpdate),
	userInfo_getDetails: () => ACTION_User_getDetails()
};

export default connect(mapStateToProps, mapDispatchToProps)(PromoInfo);

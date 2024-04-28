/*
 * @Author: Alan
 * @Date: 2022-05-10 22:05:09
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-31 10:53:35
 * @Description: 优惠详情
 * @FilePath: \Mobile\src\components\sbtwo\Promotions\Detail\index.js
 */
import React from 'react';
import Modal from '@/components/View/Modal';
import { ReactSVG } from '@/components/View/ReactSVG';
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
import Share from './Share';
import { PromotionDetail } from '@/api/cmsApi';

class PromoInfo extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			showSharePopup: false
		};
	}
	componentDidMount() {
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
		Toast.loading('请稍候...');
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
						okText: '返回优惠页面',
						onlyOKBtn: true,
						content: (
							<React.Fragment>
								<center>
									<ReactIMG src="/img/svg/Rederror.svg" className="ErrorProm" />
								</center>
								<h3>
									<br />
									<center>无法申请</center>
								</h3>
								<div className="note">抱歉，此优惠目前申请人数已满，请尝试申请其他优惠。</div>
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
					title: '余额不足',
					centered: true,
					okText: '存款',
					cancelText: '关闭',
					className: `commonModal`,
					content: (
						<React.Fragment>
							<p style={{ padding: '10px 0 25px 0px' }}>您的余额不足，请马上存款。</p>
						</React.Fragment>
					),
					onOk: () => {
						Router.push(`/DepositPage`);
						const depositBonus = {
							bonusId: Info.bonusId,
							promoTitle: Info.promoTitle,
							bonusProduct: Info.bonusProduct,
						}
						localStorage.setItem("depositBonus", JSON.stringify(depositBonus))
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
				Toast.error('资料不完整，请至个人资料完善！', 3);
				Router.push(`/me/account-info`);
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
		Toast.loading('请稍候...');
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
		Toast.loading('请稍候...');
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

	SharePopup = (status) => {
		this.setState({
			showSharePopup: status
		});
	};

	render() {
		const { ShowDetail, CloseDetail, ActiveItem } = this.props;
		const { Info, History } = this.state;
		console.log('优惠详情数据-------------------->>>>>', Info);
		console.log('父级数据------------------------>>>>>', ActiveItem);
		return (
			<div className="PromoDetail">
				<Modal
					visible={ShowDetail}
					transparent
					maskClosable={false}
					closable={false}
					title={
						<div className="header-wrapper header-bar">
							<ReactSVG
								className="back-icon"
								src="/img/svg/LeftArrow.svg"
								onClick={() => {
									let jumpfrom = getUrlVars()['jumpfrom'];
									if (jumpfrom) {
										Router.push('/');
										return;
									}
									CloseDetail();
								}}
							/>
							<span className="Header-title">优惠详情</span>
							<div className="header-tools-wrapper">
								<ReactSVG
									className="share-button"
									src={'/img/svg/share.svg'}
									onClick={() => {
										this.SharePopup(true);
										// Pushgtagdata(
										// 	`Navigation​`,
										// 	`Click`,
										// 	`Share_PromoID​​​`
										// );
									}}
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
									<Share
										isShowSharePopup={this.state.showSharePopup}
										hideSharePopup={() => {
											this.SharePopup(false);
										}}
										//Vendor={Vendor}
										EventDetail={Info}
									/>
								</div>
							</React.Fragment>
						)}
						{!Info && (
							<SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
								<Skeleton count={18} height="20px" />
							</SkeletonTheme>
						)}
					</div>
				</Modal>
				{/* 申请按钮 */}
				{Info && (
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
											查看已提交资料
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
												还需 <b>{History.turnoverNeeded}</b> 流水,可得{' '}
												<b>{History.bonusAmount} 元红利</b>
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
												领取红利
											</Button>
										)
									);
								case 'Waiting for release':
									return <Button disabled>待派发</Button>;
								case 'Served':
								case 'Force to served':
									return <Button disabled>已领取</Button>;
								default:
									// 參考manual promo表跟 promoType == bonus表 （找doreen拿）
									return (Info.promoType === 'Manual' ?
										((Info.isNotStart && !Info.isExpired) || (!Info.isNotStart && Info.isExpired)) ?
											(<Button disabled>仅限指定时段申请</Button>)
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

													// if (ActiveItem && ActiveItem.bonusData) {
													// 	Pushgtagdata(
													// 		`Promo Application`,
													// 		'Submit',
													// 		`Apply_${ActiveItem.bonusData.id}_PromoPage`
													// 	);
													// } else {
													// 	Pushgtagdata(
													// 		`Promo Application`,
													// 		'Submit',
													// 		`Apply_${Info.promoId}_PromoPage`
													// 	);
													// }
												}}
											>
												立即申请
													</Button>)
													:
													(Info.actionType === 'LIVECHAT' ?
														(<Button
															onClick={() => {
																PopUpLiveChat();
															}}
														>
															联系在线客服
														</Button>)
														:
														(<div/>)))
												:
												(Info.isNotStart === false && Info.isExpired === false && Info.isInApplicationDuration === false) ?
													<Button disabled>仅限指定时段申请</Button>
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
													联系在线客服
											</Button>
												: Info.actionType === 'FUND_IN' || Info.actionType === 'DEPOSIT_PAGE_ONLY' ?
													<Button
														onClick={() => {
															if(Info.actionType === 'FUND_IN'){
																Router.push('/Transfer')
															}
															if(Info.actionType === 'DEPOSIT_PAGE_ONLY'){
																Router.push('/Deposit')
															}
														}}
													>
														立即申請
													</Button>
												: (<div/>));
							}
						})()}
					</div>
				)}
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

/*
 * @Author: Alan
 * @Date: 2022-05-10 22:05:09
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-29 13:16:48
 * @Description: 优惠详情
 * @FilePath: \Mobile\src\components\daily-gift\Detail.js
 */
import React from 'react';
import Modal from '@/components/View/Modal';
import Flexbox from '@/components/View/Flexbox/';
import BackBar from '@/components/Header/BackBar';
import classNames from 'classnames';
import { DailyDeals } from '@/api/promotions';
import { PromotionDetail } from '@/api/cmsApi'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { checkIsLogin, redirectToLogin } from '@/lib/js/util';
import { ACTION_UserInfo_getBalance, ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import Router from 'next/router';
import Button from '@/components/View/Button';
import Toast from '@/components/View/Toast';
class PromoInfo extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {};
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
		let params = {
			id: this.props.BonusData.promoId
		};
		// PromotionInfo(params, (res) => {
		// 	res.History = this.props.History;
		// 	this.setState({
		// 		Detail: res
		// 	});
		// });
		PromotionDetail(params).then((res)=>{
			res.History = this.props.History;
			this.setState({
				Detail: res
			});
		})
	}

	/**
	 * @description: 申请红利
	 * @param {*} Info 优惠详情
	 * @return {*}
  	*/
	ApplyDailyDeals(Info) {
		if (!checkIsLogin()) {
			redirectToLogin();
			return;
		}

		/* 填写礼品申请资料 */
		Router.push(`/promotions/manual?id=${Info.bonusId}&title=${Info.promoTitle}`);
	}

	/**
	 * @description: 申请每日好礼优惠
	 * @param {*} Detail 详情
	 * @return {*}
	*/
	ApplyDailyDeals = (Detail) => {
		Toast.loading();
		let data = {
			bonusRuleId: Detail.bonusId
		};
		DailyDeals(data, (res) => {
			if (res) {
				if (res.isSuccess && res.result) {
					Modal.info({
						title: 'Nhận Thưởng Thành Công',
						centered: true,
						okText: 'Chơi Ngay',
						cancelText: 'Đóng',
						className: `commonModal`,
						content: <div className="note">{res.result.message}</div>,
						onOk: () => {
							Router.push('/');
						},
						onCancel: () => {}
					});
				} else {
					Modal.info({
						title: 'Không Đủ Điều Kiện',
						centered: true,
						okText: 'Gửi Tiền',
						cancelText: 'Đóng',
						className: `commonModal`,
						content: <div className="note">{res.errors[0].description}</div>,
						onOk: () => {
							Router.push('/DepositPage');
						},
						onCancel: () => {}
					});
				}
			}
			Toast.destroy();
		});
	};

	render() {
		const { ShowDetail, CloseDetail, BonusData } = this.props;
		const { Detail, ShowManual } = this.state;
		console.log(Detail);
		return (
			<div className=" PromoDetail">
				<Modal
					visible={ShowDetail}
					transparent
					maskClosable={false}
					closable={false}
					title={
						<BackBar
							key="main-bar-header"
							title={'Chi Tiết Thưởng'}
							backEvent={() => {
								CloseDetail();
							}}
							// hasServer={true}
						/>
					}
					className={classNames({
						DailyGiftPromoDetail: true,
						'Fullscreen-Modal': true,
						PromoModalDetail: true
					})}
				>
					<div className="PromoDetail">
						{Detail && (
							<React.Fragment>
								<div>
									<div
										dangerouslySetInnerHTML={{
											__html: Detail.body
										}}
									/>
								</div>
							</React.Fragment>
						)}
						{!Detail && (
							<SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
								<Skeleton count={18} height="20px" />
							</SkeletonTheme>
						)}
					</div>
				</Modal>
				{/* 申请按钮 */}
				{Detail && (
					<div className="SubmitBtn">
						{(() => {
							/* 售罄 */
							if (!BonusData.bonusData) {
								return;
							}
							if (BonusData.bonusData.maxApplications == BonusData.bonusData.currentApplications) {
								BonusData.bonusData.bonusGivenType = 'SoldOut';
							}
							switch (BonusData.bonusData.bonusGivenType) {
								/* 填写礼品地址申请 */
								case 'Manual Items':
									return (
										<Button
											onClick={() => {
												if (!checkIsLogin()) {
													redirectToLogin();
													return;
												}
												Router.push(`me/shipment-address?id=${Detail.bonusId}`);
											}}
										>
											Nhận Thưởng Ngay
										</Button>
									);
								/* 直接申请 */
								case 'Money':
								case 'FreeSpin':
								case 'Rewards Point':
									return (
										<Button
											onClick={() => {
												if (!checkIsLogin()) {
													redirectToLogin();
													return;
												}
												this.ApplyDailyDeals(Detail);
											}}
										>
											Nhận Thưởng Ngay
										</Button>
									);
								/* 已售罄  */
								case 'SoldOut':
									return <Button disabled={true} >Hết Hàng</Button>;
								default:
									return null;
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

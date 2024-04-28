/*
 * @Author: Alan
 * @Date: 2022-03-25 16:46:20
 * @LastEditors: Alan
 * @LastEditTime: 2023-01-25 16:43:29
 * @Description: 运送资料
 * @FilePath: \Mobile\pages\Promotions\Manual.js
 */
import React from 'react';
import Layout from '@/components/Layout';
import { ApplyManual } from '@/api/promotions';
import ReactIMG from '@/components/View/ReactIMG';
import Item from '@/components/View/FormItem';
import Input from '@/components/View/Input';
import Router, { withRouter } from 'next/router';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import Button from '@/components/View/Button';
import { connect } from 'react-redux';
import { PopUpLiveChat, maskFunction } from '@/lib/js/util';
import Toast from '@/components/View/Toast';
import Modal from '@/components/View/Modal';
class Promos extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			comment: ''
		};
	}

	/**
	 * @description: 提交礼品申请
	 * @return {*}
  	*/
	SubmitApplyManual() {
		const { userInfo, router } = this.props;
		const { id } = router.query;
		const { email, Phone } = userInfo.memberInfo;
		const { comment } = this.state;
		let data = {
			memberCode: userInfo.memberInfo.memberCode,
			promoId: id,
			applySite: 38,
			contactNo: Phone,
			remarks: comment,
			emailAddress: email,
			currency: 'CNY'
		};
		Toast.loading();

		ApplyManual(data, (res) => {
			if (res.isSuccess) {
				Modal.info({
					title: '',
					centered: true,
					okText: 'Xem Ngay',
					cancelText: 'Đóng',
					className: `commonModal`,
					title: 'Đăng Ký Thành Công',
					closable: false,
					content: (
						<React.Fragment>
							<center>
								<ReactIMG src="/img/success.png" />
							</center>
							{/* <h3 style={{ marginTop: '10px', fontSize: '20px' }}>
								<center>Gửi Đơn Thành Công</center>
							</h3> */}
							<div className="note">Vui lòng vào trang “Khuyến Mãi Của Tôi” để xem chi tiết</div>
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
					centered: true,
					className: `commonModal`,
					footer: null,
					type: 'confirm',
					okText: 'Tôi Hiểu',
					onlyOKBtn: true,
					closable: false,
					title: 'Không Thể Nhận Thưởng',
					content: (
						<React.Fragment>
							<center>
								<ReactIMG src="/img/svg/Rederror.svg" className="ErrorProm" />
							</center>
							<div className="note">Xin lỗi, bạn đã đạt đến giới hạn áp dụng khuyến mãi, vì vậy bạn không thể đăng ký khuyến mãi này.</div>
						</React.Fragment>
					),
					onOk: () => {
						Router.push({
							pathname: '/promotions',
						});
					},
					onCancel: () => {}
				});
			}
			Toast.destroy();
		});
	}

	render() {
		const { router, userInfo } = this.props;
		const { userName, email, Phone, manualRemark } = userInfo.memberInfo;
		const { title, remarks } = router.query;
		const { comment } = this.state;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle={'Đơn Đăng Ký Khuyến Mãi'}
				status={2}
				hasServer={true}
				barFixed={true}
			>
				<div id="ManualDetail">
					<h3>{title}</h3>
					<Item label={'Tên Đăng Nhập'}>
						<Input size="large" disabled={true} value={userName} />
					</Item>
					<Item label={'Địa Chỉ email'}>
						<Input size="large" disabled={true} value={maskFunction("Email",email)} />
						<div className="Note">
							Để cập nhật địa chỉ email. Vui lòng liên hệ <span
								className="blue"
								onClick={() => {
									PopUpLiveChat();
								}}
							>
								Live Chat
							</span>
						</div>
					</Item>
					<Item label={'Số Điện Thoại'}>
						<Input size="large" disabled={true} value={maskFunction("Phone",Phone)} />
						<div className="Note">
							Để cập nhật số điện thoại. Vui lòng liên hệ <span
								className="blue"
								onClick={() => {
									PopUpLiveChat();
								}}
							>
								Live Chat
							</span>
						</div>
					</Item>
					<Item label={'Ghi Chú'}>
						<Input
							size="large"
							disabled={remarks && remarks != ''}
							value={remarks && remarks != '' ? remarks : comment}
							onChange={(e) => {
								this.setState({
									comment: e.target.value
								});
							}}
							maxLength={2000}
						/>
					</Item>
					<br />
					{!remarks &&	
					remarks != '' && (
						<Button
							onClick={() => {
								this.SubmitApplyManual();
							}}
							key={comment}
							// disabled={comment == ''}
						>
							Gửi
						</Button>
					)}
				</div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Promos));
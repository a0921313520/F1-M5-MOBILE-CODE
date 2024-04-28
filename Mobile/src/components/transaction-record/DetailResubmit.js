/*
 * @Author: Alan
 * @Date: 2022-05-10 22:05:09
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-26 22:41:59
 * @Description: 重新提交存款/提款
 * @FilePath: \Mobile\src\components\transaction-record\DetailResubmit.js
 */
import React from 'react';
import Modal from '@/components/View/Modal';
import Flexbox from '@/components/View/Flexbox/';
import BackBar from '@/components/Header/BackBar';
import classNames from 'classnames';
import { ACTION_UserInfo_getBalance, ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import Button from '@/components/View/Button';
import { PopUpLiveChat, numberWithCommas } from '@/lib/js/util';
import Toast from '@/components/View/Toast';
import { ResubmitOnlineDeposit } from '@/api/wallet';
import { ReactSVG } from '@/components/View/ReactSVG';
import Service from '@/components/Header/Service';

class DetailResubmit extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			//重新提交页面
			ResubmitVisible: false,
			resubmissionSuccessful: false
		};
	}
	componentDidMount() {}

	ResubmitDeposit(DetailItem) {
		let params = {
			resubmitDepositID: DetailItem.transactionId,
			returnUrl: window.location.origin
		};
		Toast.loading();
		ResubmitOnlineDeposit(params, (res) => {
			if (res.isSuccess && res.result.resubmitStatus) {
				this.setState({
					resubmitRedirectUrl: res.result.resubmitRedirectUrl,
					resubmissionSuccessful: true
				});
			} else {
				Toast.error('提交失败');
				setTimeout(() => {
					this.props.CloseDetail();
				}, 1000);
			}
			Toast.destroy();
		});
	}
	render() {
		const { ShowDetail, Type, DetailItem, CloseDetail } = this.props;
		console.log(DetailItem);
		const { resubmitRedirectUrl,resubmissionSuccessful } = this.state;
		let TypeTitle = Type == '0' ? '存款' : '提款';
		return (
			<div className="DetailResubmit">
				<Modal
					visible={ShowDetail}
					transparent
					maskClosable={false}
					closable={false}
					title={
						<div
							style={{
								backgroundColor: '#00A6FF'
							}}
							className={`header-wrapper header-bar`}
						>
							<ReactSVG className="back-icon" src="/img/svg/LeftArrow.svg" onClick={() => {this.props.CloseDetail(resubmissionSuccessful);}} />
							<span className="Header-title">{'Thực Hiện Lại Giao Dịc'}</span>
							<div className="header-tools-wrapper">
								<Service />
							</div>
						</div>
					}
					className={classNames({
						'Fullscreen-Modal': true,
						ResubmitTransactionModalDetail: true
					})}
				>
					{resubmitRedirectUrl && (
						<iframe style={{ width: '100%', minHeight: '80vh', border: 0 }} srcDoc={resubmitRedirectUrl} />
					)}
					{!resubmitRedirectUrl && (
						<React.Fragment>
							<Flexbox width="100%" className="DetailItem">
								<div className="Resubmitinfo">
									<Flexbox>
										<label>Thực Hiện Lại Giao Dịch</label>
										<span>{DetailItem.paymentMethodName}</span>
									</Flexbox>
									{/* <Flexbox>
										<label>支付渠道</label>
										<span>{DetailItem.methodType}</span>
									</Flexbox> */}
									<Flexbox>
										<label>Số Tiền</label>
										<span>{DetailItem.amount} đ</span>
									</Flexbox>
								</div>
							</Flexbox>
							<div className="Resubmitwarn">Không cần thực hiện lại việc chuyển tiền thật từ ngân hàng. Chỉ cần nhấp vào nút "Thực Hiện" và vui lòng KHÔNG đóng trang trước khi màn hình giao dịch hiện ra. Bất kỳ sự gián đoạn nào có thể dẫn tới giao dịch thất bại.</div>
							<Button
								onClick={() => {
									this.ResubmitDeposit(DetailItem);
								}}
							>
								Thực Hiện
							</Button>
						</React.Fragment>
					)}
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailResubmit);

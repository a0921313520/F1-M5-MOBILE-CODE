/*
 * @Author: Alan
 * @Date: 2022-07-26 09:00:41
 * @LastEditors: Alan
 * @LastEditTime: 2022-11-24 18:54:48
 * @Description: 自我限制弹窗
 * @FilePath: \Mobile\src\components\SelfExclusionModal\index.js
 */
import React from 'react';
import Modal from '@/components/View/Modal';
import moment from 'moment';
import { SelfExclusionsInfo } from '@/api/selflimiting';
import Button from '@/components/View/Button';
import { PopUpLiveChat } from '@/lib/js/util';
import { checkIsLogin } from '@/lib/js/util';
import Router from 'next/router';
//自我限制彈窗
class SelfExclusionModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			ModalOpen: false
		};
	}
	componentDidMount() {
		//优化api性能 避免不必要的请求
		if (
			this.props.OpenModalUrl == 'Home' &&
			(Router.router.pathname == '/Deposit' ||
				Router.router.pathname == '/Transfer' ||
				Router.router.pathname == '/DepositVerify')
		) {
			return;
		}

		if (checkIsLogin()) {
			if (this.props.ModalType == 2) {
				this.setModalOpen();
			} else {
				this.GETSelfExclusions();
			}
		}
		this.CallWindow(false);
	}

	CallWindow(status) {
		window.SelfExclusionsisDisabled = status;
		window.CheckSelfExclusions = (status) => this.setModalStatuas(status);
	}

	GETSelfExclusions = () => {
		SelfExclusionsInfo((res) => {
			if (res.isSuccess && res.result) {
				const isDisabled =
					res.result.status &&
					(res.result.disableDeposit || res.result.disableFundIn || res.result.disableBetting);
				if (isDisabled) {
					this.CallWindow(true);
					this.setState({
						isDisabled: true,
						SelfExclusionsData: res.result
					});
					if (
						this.props.ModalType == 1 &&
						(this.props.OpenModalUrl == 'Deposit' || this.props.OpenModalUrl == 'Transfer')
					) {
						this.setModalOpen();
					}
				} else {
					this.CallWindow(false);
				}
			}
		});
	};

	setModalStatuas = () => {
		if (this.state.isDisabled) {
			this.setModalOpen();
		}
	};

	setModalOpen = () => {
		this.setState({ ModalOpen: true });
	};

	render() {
		let setupDate = null;
		let dateDuration = 'vĩnh viễn';
		if (this.props.ModalType == 1 && this.state.SelfExclusionsData) {
			setupDate = moment(this.state.SelfExclusionsData.selfExcludeSetDate + '+08:00').format('YYYY/MM/DD');
			if (this.state.SelfExclusionsData.selfExclusionSettingID == 3) {
				dateDuration = 'vĩnh viễn';
			} else {
				dateDuration = this.state.SelfExclusionsData.selfExcludeDuration + ' ngày';
			}
		}

		return (
			<Modal
				closable={false}
				className="commonModal SelfExclusionModal"
				title="Tự Loại Trừ"
				visible={this.state.ModalOpen}
			>
				<div className="SelfExclusionModalContent">
					{this.props.ModalType == 1 ? (
						<div>
							{`Bạn đã thiết lập thành công Tự loại trừ（${dateDuration}）vào ${setupDate}, nếu bạn cần bất kỳ trợ giúp nào, vui lòng `}
							<span
								className="SelfExclusionModalCS blue"
								onClick={() => {
									PopUpLiveChat();
								}}
							>
								Liên Hệ LiveChat
							</span>。
						</div>
					) : null}
					{this.props.ModalType == 2 ? (
						<div>
							Số tiền gửi đã vượt quá số tiền tự giới hạn của bạn, nếu bạn cần bất kỳ trợ giúp nào, vui lòng <span
								className="SelfExclusionModalCS blue"
								onClick={() => {
									PopUpLiveChat();
								}}
							>
								Liên Hệ LiveChat
							</span>。
						</div>
					) : null}
				</div>
				<Button
					className="SelfExclusionModalButton"
					onClick={() => {
						this.setState({ ModalOpen: false }, () => {
							this.props.afterCloseModal && this.props.afterCloseModal();
						});
					}}
				>
					Tôi Hiểu
				</Button>
			</Modal>
		);
	}
}

export default SelfExclusionModal;

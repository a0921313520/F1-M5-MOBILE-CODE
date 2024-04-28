import React from 'react';
import Router from 'next/router';
import copy from 'copy-to-clipboard';
import Toast from '@/components/View/Toast';
import moment from 'moment';
import Flexbox from '@/components/View/Flexbox/';
import classNames from 'classnames';
import { ReactSVG } from '@/components/View/ReactSVG';
import { AiOutlineSwapRight } from 'react-icons/ai';
import Detail from './Detail';
import Button from '@/components/View/Button';
import { ConfirmWithdrawalComplete, SubWithdrawalTransactionDetails } from '@/api/wallet';
import Modal from '@/components/View/Modal';
import ReactIMG from '@/components/View/ReactIMG';
import { PopUpLiveChat } from '@/lib/js/util';

class _RecordItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			ShowDetail: false,
			isShowSuccessWithRebate:false, 
			TimeNum: 5,
			SRdetailData: [], //SR提款明細資料(大額拆分)
			selectedSRData:null, //所選sub到帳資料
			ConfirmShow:false,
		};
	}

	componentDidMount() {}

	goDetail = () => {
		if (this.props.type === 'deposit' || this.props.type === 'withdrawal') {
			localStorage.setItem(
				'recordDetail',
				JSON.stringify({
					recordId: this.props.item ? this.props.item.TransactionId : '',
					dateFrom: this.props.dateFrom,
					dateTo: this.props.dateTo
				})
			);
			Router.push(this.props.path);
		}
	};

	oneKeyCopy(text) {
		copy(text);
		Toast.success('Sao Chép Thành Công');
		// globalGtag('Copy_crypto_deposit');
		this.setState({
			copyID: text
		})
	}

	timeFormat = (time) => {
		if (!time) {
			return;
		}
		return moment(time).format('MM-DD HH:mm');
	};

	/**
  * @description: 确认提款到账
  * @return {*}
  */
	SETConfirmWithdrawal() {
		let params = {
			withdrawalId: this.state.transactionId,
			subWithdrawalId:this.state.selectedSRData.SubWithdrawalID,
			splitWithdrawalAmt:this.state.selectedSRData.SplitWithdrawalAmount,
		};
		Toast.loading();
		ConfirmWithdrawalComplete(params, (res) => {
			console.log(res);
			if (res.isSuccess) {
				Toast.destroy();
				// 更新Detail頁面isWithdrawUpdated參數，以便刷新Detai頁面
				this.setDetailState && this.setDetailState();

				if(res.result.rebateAmount){
					this.setState({isShowSuccessWithRebate:true})
					this.GETSubWithdrawalTransactionDetails(this.state.SRdetailData.WithdrawalID);
					Modal.info({
						className: 'modal-withdraw-success-with-rebate',
						closable:true,
						icon: null,
						centered: true,
						type: 'confirm',
						btnBlock: false,
						btnReverse: false,
						onlyOKBtn:true,
						content: (
							<div className='text-box'>
								<ReactIMG src="/img/success-2.png" />
								<p>额外奖励 <span>{res.result.rebateAmount}</span> 元已到账<br/>您可前往交易记录查询</p>
							</div>
						),
						okText: '查看交易记录',
						onOk:()=>{
							this.setState({ShowDetail:false, isShowSuccessWithRebate:false});
							this.props.TabPaneChange("1");

						}
					});
				}else{
					Toast.success('确认到账');
					setTimeout(()=>{
						Toast.destroy();
						this.GETSubWithdrawalTransactionDetails(this.state.SRdetailData.WithdrawalID);
					},1000)
				}
			} else {
				if (
					(res.errors && res.errors[0].errorCode == 'P111002') ||
					(res.errors && res.errors[0].errorCode == 'P111003')
				) {
					this.setState({
						showError: res.errors[0].errorCode
					});
				} else {
					Toast.error(res.result.message, 2);
				}
			}
			Toast.destroy();
		});
	}

	GETSubWithdrawalTransactionDetails = (transactionID) =>{
		Toast.loading();
		SubWithdrawalTransactionDetails(transactionID, (res)=>{
			if(res.isSuccess){
				Toast.destroy();
				this.setState({SRdetailData:res.result, ShowDetail: true})
			}else{
				Toast.error(res.result.message);
			}
		})
	}

	ConfirmModal(transactionId) {
		this.setState({
			ConfirmShow: true,
			TimeNum:5,
		});

		this.ConfirmCode();
	}

	//确认倒计时
	ConfirmCode() {
		let maxTime = 5;
		this.timer = setInterval(() => {
			if (maxTime > 0) {
				--maxTime;
				this.setState({
					btnBool: true
				});
			} else {
				this.setState({
					btnBool: false
				});
				clearInterval(this.timer);
			}

			this.setState({
				TimeNum: maxTime
			});
		}, 1000);
	}

	render() {
		let { item, type, MemberDailyTurnover } = this.props;
		console.log('交易类型---------------->>>>>', type);
		console.log('交易详情---------------->>>>>', item);
		return (
			<React.Fragment>
				{/* 充值记录 */}
				{type == 0 && (
					<Flexbox
						className="List"
						onClick={() => {
							this.setState({
								ShowDetail: true,
								copyID: ''
							});
						}}
					>
						<Flexbox className="Data" justifyContent="space-between">
							<label>{item.paymentMethodName}</label>
							<span
								className={classNames({
									statusName: true,
									padding: item.statusId == 1 || item.statusId == 4,
									success: item.statusId == 2,
									fail: (item.statusId == 3 || item.statusId == 5),
								})}
							>
								{item.statusLocalizedName}
							</span>
						</Flexbox>
						<Flexbox className="Time">
							{moment(item.processingDateTime).format('DD-MM-YYYY HH:mm')}{' '}
						</Flexbox>
						<Flexbox className="Data" justifyContent="space-between">
							<span className="OrderId">
								{item.transactionId}
								<ReactSVG
									src="/img/svg/copy.svg"
									onClick={(e) => {
										e.stopPropagation();
										this.oneKeyCopy(item.transactionId);
									}}
								/>
								{this.state.copyID == item.transactionId &&
									<span className='blueTick'>
										<ReactSVG
											src="/img/svg/blueTick.svg"
										/>
									</span>
								}
							</span>
							
							<span className="Amount">{item.amount} đ</span>
						</Flexbox>
					</Flexbox>
				)}
				{/* 转账记录 */}
				{type == 1 && (
					<Flexbox className="List">
						<Flexbox className="Data" justifyContent="space-between">
							<label>
								{item.fromAccountLocalizedName}
								<AiOutlineSwapRight color="#666666" size={18} />
								{item.toAccountLocalizedName}
							</label>
							<span
								className={classNames({
									statusName: true,
									green: item.status == 1,
									yellow: item.status == 0,
									red: item.status == -2
								})}
							>
								{item.statusDesc}
							</span>
						</Flexbox>
						<Flexbox className="Time">{moment(item.transactionDate).format('DD/MM/YYYY HH:mm')} </Flexbox>
						<Flexbox className="Data" justifyContent="space-between">
							<span className="OrderId">
								{item.transactionId}
								<ReactSVG
									src="/img/svg/copy.svg"
									onClick={(e) => {
										e.stopPropagation();
										this.oneKeyCopy(item.transactionId);
									}}
								/>
								{this.state.copyID == item.transactionId &&
									<span className='blueTick'>
										<ReactSVG
											src="/img/svg/blueTick.svg"
										/>
									</span>
								}
							</span>
							<span className="Amount">{item.amount} đ</span>
						</Flexbox>
					</Flexbox>
				)}
				{/* 提款记录 */}
				{type == 2 && (
					<Flexbox className="List">
						<div
							onClick={() => {
								this.GETSubWithdrawalTransactionDetails(item.transactionId);
							}}
						>
							<Flexbox className="Data" justifyContent="space-between">
								<label>{item.paymentMethodName}</label>
								<span
									className={classNames({
										blue: item.statusId == 1 , //待处理
										yellow: item.statusId == 2 ||item.statusId == 3 || item.statusId == 7 || item.statusId == 8 || item.statusId == 9, //处理中
										green: item.statusId == 4 || item.statusId == 10, //处理成功
										red: item.statusId == 5 || item.statusId == 6 //处理失败、交易取消
									})}
								>
									{item.statusLocalizedName}
								</span>
							</Flexbox>
							<Flexbox className="Time">
								{moment(item.processingDateTime).format('DD/MM/YYYY HH:mm')}{' '}
							</Flexbox>
							<Flexbox className="Data" justifyContent="space-between">
								<span className="OrderId">
									{item.transactionId}
									<ReactSVG
										src="/img/svg/copy.svg"
										onClick={(e) => {
											e.stopPropagation();
											this.oneKeyCopy(item.transactionId);
										}}
									/>
																	{this.state.copyID == item.transactionId &&
									<span className='blueTick'>
										<ReactSVG
											src="/img/svg/blueTick.svg"
										/>
									</span>
								}
								</span>
								<span className="Amount">{item.amount} đ</span>
							</Flexbox>
						</div>

						{(item.reasonCode === "SmallRiverCompleteWithdrawalAcknowledge" ||
							item.reasonCode === "SmallRiverPendingWithdrawalAcknowledge" ) && (
							<Flexbox className="Confirm" justifyContent="space-between">
									<div className="note">
										<ReactSVG src="/img/svg/Fill.svg" />
										<p>{item.reasonMsg}</p>
									</div>

							</Flexbox>
						)}
					</Flexbox>
				)}
				{/* 详细信息查看 */}
				{this.state.ShowDetail && (
					<Detail
						Type={type}
						DetailItem={item}
						SRdetailData={this.state.SRdetailData}
						ShowDetail={this.state.ShowDetail}
						CloseDetail={() => {
							this.setState({
								ShowDetail: false
							});
						}}
						isAnyModalOpen={this.state.ConfirmShow || this.state.showError || this.state.isShowSuccessWithRebate } //用來控制當提示Modal出現時關閉Expnad float button
						getDepositData={() => {
							this.props.getDepositData();
						}}
						getWithdrawalData={() => {
							this.props.getWithdrawalData();
						}}
						SETConfirmWithdrawal={(SRdetailData,transactionId,setDetailState) => {
							this.ConfirmModal();
							// 將Detail component的 isWithdrawUpdate setState拿至這裡使用
							this.setDetailState = setDetailState;
							this.setState({
								selectedSRData: SRdetailData,
								transactionId: transactionId
							});
						}}
					/>
				)}

				{type == 2 && (
					<React.Fragment>
						<Modal
							visible={this.state.showError ? true : false}
							title="温馨提示"
							className="Confirm_Modal Confirm_Modal_withdraw_error"
							maskClosable={false}
							onCancel={() => {
								this.setState({
									showError: false
								});
								clearInterval(this.timer);
							}}
						>
							<Flexbox
								className="modalContent"
								justifyContent="center"
								alignItems="center"
								flexFlow="column"
							>
								<ReactSVG src="/img/svg/note.svg" className="note" />

								<p className="content">
									{this.state.showError == 'P111002' ? (
										'确认到账更新失败, 此笔交易仍在进行中。请确保您已收到提现金额后，再点击”确认到账”按钮。如需要任何协助，请联系在线客服。'
									) : (
										<>系统错误，确认到账更新失败，<br/>请稍后再重试或联络在线客服。</>
									)}
								</p>
								<Button
									className="submit"
									onClick={() => {
										PopUpLiveChat();
									}}
								>
									在线客服
								</Button>
							</Flexbox>
						</Modal>
						<Modal
							visible={this.state.ConfirmShow}
							className="Confirm_Modal_Setp"
							maskClosable={false}
							onCancel={() => {
								clearInterval(this.timer);
								this.setState({
									ConfirmShow: false,
									TimeNum: 0
								});
							}}
						>
							<div key={this.state.TimeNum}>
								<center>
									<ReactIMG src="/img/NOTE.png" />
									<h3 className="red" style={{ padding: '10px' }}>
										重要提示
									</h3>
									<p style={{ fontSize: '14px', lineHeight: '20px' }}>
										在您继续下一步之前，请务必先了解详细内容后才点击“确认到账”。
									</p>
								</center>
								<div className="note-list">
									<ol>
										<li>
											请注意，乐天堂不会在金额还没到账前通知会员点击“确认到账”。<span className="red">请留意您的资金<br/>安全</span>。
										</li>
										<li>
											若您在尚未检查的情况下点击 “确认到账”， 所产生的损失乐天堂<span className="red">概不负责赔偿</span>
										</li>
										<li>​请确认您的金额是否已到账。</li>
									</ol>
								</div>
								<Flexbox>
									<Button
										ghost
										style={{ marginRight: '10px' }}
										onClick={() => {
											this.setState({
												ConfirmShow: false
											});
										}}
									>
										还没到账
									</Button>
									{this.state.TimeNum != 0 ? (
										<Button disabled className="Time-btn">
											<div className="timer-box">
												<div className="time-bg"></div>
													<span className="time">{this.state.TimeNum}</span>
											</div> 
											确认到账
										</Button>
									) : (
										<Button
											onClick={() => {
												this.SETConfirmWithdrawal();
												this.setState({
													ConfirmShow: false
												});
											}}
										>
											确认到账
										</Button>
									)}
								</Flexbox>
							</div>
						</Modal>
					</React.Fragment>
				)}
			</React.Fragment>
		);
	}
}

export default _RecordItem;

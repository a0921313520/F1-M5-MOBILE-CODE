/*
 * @Author: Alan
 * @Date: 2022-05-10 22:05:09
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-20 21:47:53
 * @Description: 银行信息
 * @FilePath: \Mobile\src\components\TransactionRecord\DrawerBankinfo.js
 */
import React from 'react';
import Modal from '@/components/View/Modal';
import Flexbox from '@/components/View/Flexbox/';
import BackBar from '@/components/Header/BackBar';
import classNames from 'classnames';
import { ACTION_UserInfo_getBalance, ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import Button from '@/components/View/Button';
import { PopUpLiveChat, numberWithCommas, maskFunction } from '@/lib/js/util';
import Toast from '@/components/View/Toast';
import Drawer from '@/components/View/Drawer';
import { TransactionHistory } from '@/api/wallet';
import ReactIMG from '@/components/View/ReactIMG';
import bankJson from '@/lib/data/BankList.json';

class DrawerBankinfo extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			HistoryInfo: {}
		};
	}
	componentDidMount() {
		this.GetTransactionHistory(this.props.DetailItem);
	}

	GetTransactionHistory(DetailItem) {
		let params = {
			transactionId: DetailItem.transactionId,
			transactionType: this.props.Type == '0' ? 'Deposit' : 'Withdrawal'
		};
		Toast.loading();
		TransactionHistory(params, (res) => {
			if (res.isSuccess) {
				this.setState({
					HistoryInfo: res.result
				});
			}
			Toast.destroy();
		});
	}

	/**
	 * @description: 替换星号
	 * @param {*} length
	 * @return {*}
  	*/
	getMaskedText = (length) => {
		return '*'.repeat(length);
	};

	render() {
		const { DrawerShow, Type, DetailItem, CloseDetail } = this.props;
		const { HistoryInfo } = this.state;
		let TypeTitle = Type == '0' ? '存款' : '提款';

		return (
			<Drawer
				style={{ height: '70%' }}
				direction="bottom"
				className="TransactionRecord-drawer"
				onClose={() => {
					CloseDetail();
				}}
				visible={DrawerShow}
			>
				<p className='exit' onClick={() => CloseDetail()}>Đóng</p>
				<h2 className="transfer-drawer-tit">Chi Tiết Giao Dịch</h2>
				<div className="Infolist">
					{console.log(DetailItem, 'DetailItem')}
					{(() => {
						switch (DetailItem.paymentMethodId) {
							//本地银行
							case 'LB':
								if (Type == 0) {
									return (
										<div>
											{HistoryInfo.accountHolderName && (
												<Flexbox>
													<label>Tên Người Gửi</label>{' '}
													<b>{maskFunction("FullName", HistoryInfo.accountHolderName)}</b>
													{/* <b>{HistoryInfo.accountHolderName}</b> */}
												</Flexbox>
											)}
											<Flexbox>
												<label>Phương Thức Gửi</label> <b>{HistoryInfo.methodOriName}</b>
											</Flexbox>
											{HistoryInfo.withdrawalAccNumber && (
												<Flexbox>
													<label>Gửi Từ</label>{' '}
													<b>{HistoryInfo.withdrawalAccNumber.replace(/\d(?=\d{3})/g, '*')}</b>
												</Flexbox>
											)}
											{/* {HistoryInfo.methodOriName && (
												<Flexbox>
													<label>Gửi Từ</label> 
												</Flexbox>
											)} */}
											<Flexbox>
												<label>Số Tiền</label> <b>{Number(HistoryInfo.amount)} đ</b>
											</Flexbox>
	
											{HistoryInfo.province && (
												<Flexbox>
													<label>省/自治区</label> <b>{HistoryInfo.province}</b>
												</Flexbox>
											)}
											{HistoryInfo.city && (
												<Flexbox>
													<label>城市/城镇</label> <b>{HistoryInfo.city}</b>
												</Flexbox>
											)}
											{HistoryInfo.branch && (
												<Flexbox>
													<label>分行</label> <b>{HistoryInfo.branch}</b>
												</Flexbox>
											)}
										</div>
									);
								} else if (Type == 2) {
									let checkLogo = bankJson.find((item) => item.Name === HistoryInfo.bankName);
									return (
										<div>
											{HistoryInfo.accountHolderName && (
												<Flexbox>
													<label>Tên Người Gửi</label>{' '}
													<b>{maskFunction("FullName", HistoryInfo.accountHolderName)}</b>
													{/* <b>{HistoryInfo.accountHolderName}</b> */}
												</Flexbox>
											)}
										<Flexbox>
											<label>Ngân Hàng</label> 
											<b>
												<ReactIMG
													style={{ width: '24px', height: '24px' }}
													src={`/img/deposit/bankLogo/${checkLogo ? checkLogo.Img : 'card.png'}`}
													className="specialLogo"
												/>
												{HistoryInfo.bankName}
												{HistoryInfo.withdrawalAccNumber ? ` - ${HistoryInfo.withdrawalAccNumber.replace(/\d(?=\d{3})/g, '*')} ` : ''}
											</b>
										</Flexbox>
											<Flexbox>
												<label>Số Tiền</label> <b>{Number(HistoryInfo.amount)} đ</b>
											</Flexbox>
										</div>
									)

								}

							//本地银行
							case 'BQR': 
								return (
									<div>
										<Flexbox>
											<label>Phương Thức Gửi</label> <b>Mã QR Ngân Hàng</b>
										</Flexbox>
										<Flexbox>
											<label>Nội Dung Chuyển Tiền</label>
										</Flexbox>
										<Flexbox>
											<label>Số Tiền Gửi</label> <b>{numberWithCommas(Number(HistoryInfo.amount))} đ</b>
										</Flexbox>
									</div>	
								)
							case 'QD':
								return (
									<div>
										{HistoryInfo.accountHolderName && (
											<Flexbox>
												<label>Tên Người Gửi</label>{' '}
												<b>{maskFunction("FullName", HistoryInfo.accountHolderName)}</b>
											</Flexbox>
										)}
										<Flexbox>
											<label>Phương Thức Gửi</label> <b>{HistoryInfo.methodOriName}</b>
										</Flexbox>
										<Flexbox>
											<label>Số Tiền Gửi (1=1000)</label> <b>{numberWithCommas(Number(HistoryInfo.amount))} đ</b>
										</Flexbox>
										<Flexbox>
											<label>Số Tiền Gửi Thực Tế</label> <b>{numberWithCommas(Number(HistoryInfo.actualAmount))} đ</b>
										</Flexbox>
									</div>
								);
							//乐卡
							case 'CC':
								return (
									<div>
										<Flexbox>
											<label>Số seri Thẻ Cash</label> <b>{HistoryInfo.serialNo}</b>
										</Flexbox>
										<Flexbox>
											<label>Số Tiền</label> <b>{numberWithCommas(Number(HistoryInfo.amount))} đ</b>
										</Flexbox>

									</div>
								);
							//泰达币
							case 'CTC':
								return (
									<div>
										<Flexbox>
											<label>Số Tiền</label> <b>{numberWithCommas(Number(HistoryInfo.amount))} đ</b>
										</Flexbox>
										<Flexbox>
											<label>Tỷ giá hối đoái</label>{' '}
											<b>
												1 {HistoryInfo.currencyFrom} = {HistoryInfo.cryptoExchangeRate} VND
											</b>
										</Flexbox>
										<Flexbox className="ctcNotice">
											Tỷ giá hối đoái: 1000 VND = XXXX {HistoryInfo.currencyFrom}<br/>
											Tỷ giá mang tính chất tham khảo, giao dịch sẽ được tính theo tỷ giá thực tại thời điểm thực hiện giao dịch.
										</Flexbox>
										<Flexbox>
											<label>Địa Chỉ Ví</label> <b>{HistoryInfo.walletAddress || '--'}</b>
										</Flexbox>
										<Flexbox className="ctcNotice">
										• Gửi tiền một lần tối thiểu: 1 {HistoryInfo.currencyFrom}<br/>
										• Địa chỉ ví này là dành riêng cho bạn và có thể sử dụng được nhiều lần.
										</Flexbox>
										{/* <Flexbox>
											<label>交易哈希</label> <b>{HistoryInfo.cryptoTransactionHash || '--'}</b>
										</Flexbox> */}
									</div>
								);
							case 'PHC' : 
								return (
									<div>
										<Flexbox>
											<label>Mệnh Giá Thẻ Cào</label> <b>{numberWithCommas(Number(HistoryInfo.amount))} đ</b>
										</Flexbox>
										<Flexbox>
											<label>Số Tiền Gửi Thực Tế</label> <b>{numberWithCommas(Number(HistoryInfo.actualAmount))} đ</b>
										</Flexbox>
									</div>
								)
							case 'FP' : 
								let obj = bankJson.find((item) => item.Name === HistoryInfo.bankName);
								return (
									
									<div>
										<Flexbox>
											<label>Ngân Hàng</label> <b>
											<ReactIMG
											style={{ width: '24px', height: '24px' }}
											src={`/img/deposit/bankLogo/${obj ? obj.Img : 'card.png'}`}
											className="specialLogo"
										/>
												
												{HistoryInfo.bankName}</b>
										</Flexbox>
										<Flexbox>
											<label>Hình Thức Thanh Toán</label> <b>{HistoryInfo.method}</b>
										</Flexbox>
										<Flexbox>
											<label>Số Tiền</label> <b>{numberWithCommas(Number(HistoryInfo.actualAmount))} đ</b>
										</Flexbox>
									</div>
								)
							case 'CCW' : 
								return (
									<div>
										<Flexbox>
											<label>Số Tiền</label> <b>{numberWithCommas(Number(HistoryInfo.amount))} đ</b>
										</Flexbox>
										<Flexbox>
											<label>Tỷ giá hối đoái</label>{' '}
											<b>
												1 {HistoryInfo.withdrawalCryptoCurrency} = {HistoryInfo.cryptoExchangeRate} VND
											</b>
										</Flexbox>
										<Flexbox className="ctcNotice">
											Tỷ giá hối đoái: 1000 VND = {HistoryInfo.cryptoExchangeRate} {HistoryInfo.withdrawalCryptoCurrency} <br/>
											Tỷ giá mang tính chất tham khảo, giao dịch sẽ được tính theo tỷ giá thực tại thời điểm thực hiện giao dịch.
										</Flexbox>
										<Flexbox>
											<label>Địa Chỉ Ví</label> <b style={{overflowWrap: 'anywhere'}}>{HistoryInfo.withdrawalWalletAddress || '--'}</b>
										</Flexbox>
									</div>
								);
							default:
								return (
									<div>
										<Flexbox>
											<label>Số Tiền</label> <b>{numberWithCommas(Number(HistoryInfo.amount))} đ</b>
										</Flexbox>
									</div>
								);
						}
					})()}
				</div>
			</Drawer>
		);
	}
}

export default DrawerBankinfo;

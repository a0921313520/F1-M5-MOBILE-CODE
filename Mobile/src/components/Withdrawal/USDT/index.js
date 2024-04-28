import Button from '@/components/View/Button';
import Input from '@/components/View/Input';
import { createForm } from 'rc-form';
import { CommonPostPay, PromoPostApplications } from '@/api/wallet';
import { formatSeconds, Cookie, getE2BBValue } from '@/lib/js/util';
import Toast from '@/components/View/Toast';
import Router from 'next/router';
import Flexbox from '@/components/View/Flexbox/';
import { numberWithCommas } from '@/lib/js/util';
import { ReactSVG } from '@/components/View/ReactSVG';
import classNames from 'classnames';
import { GetExchangeRateDetails, GetCryptocurrencyWalletAddressDetails, WithdrawalApplications } from '@/api/wallet';
import BankAccount from '@/components/Deposit/depositComponents/BankAccount';
import Modal from '@/components/View/Modal';
import React from 'react';
import HostConfig from '@/server/Host.config';
const { LocalHost } = HostConfig.Config;
const NameObj = {
	'USDT-ERC20': '泰达币-ERC20',
	'USDT-TRC20': '泰达币-TRC20'
};
class LB extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			Modalopen: false,
			userBankOpen: false,
			payMoney: '',
			bankCodeState: '',
			CoinsCurrency: props.CoinsCurrency,
			walletAddressList: props.walletAddressList
		};
	}
	componentDidMount() {
		this.GetExchangeRate();
		this.GetWalletAddress();
		this.props.Withdrawalinfo && this.props.Withdrawalinfo(this);
	}

	/**
	 * @description: 获取USDT时时汇率
	 * @param {*}
	 * @return {*}
  	*/
	GetExchangeRate = () => {
		let params = {
			currencyFrom: 'RMB',
			currencyTo: this.state.CoinsCurrency,
			baseAmount: this.state.payMoney || '1'
		};
		GetExchangeRateDetails(params, (data) => {
			if (data.isSuccess) {
				const { result } = data;
				let rateObj = result.tiersExchangeRate;
				let amountObj = result.tiersExchangeAmount;
				let TiersAmountObj = result.tiersAmount;

				this.setState({
					ExchangeRate1: rateObj[1], // 级别1的汇率
					ExchangeRate2: rateObj[2], //级别2的汇率
					ExchangeAmount1: amountObj[1], // 级别1的兑换金额
					ExchangeAmount2: amountObj[2], //级别2的兑换金额
					TiersAmount1: TiersAmountObj[1], //级别2的金额
					TiersAmount2: TiersAmountObj[2], //级别2的金额
					CurrencyFrom: result.currencyFrom,
					CurrencyTo: result.currencyTo,
					ConvertedAmount: result.convertedAmount, // 虚拟币等值数量
					WithdrawableBalances: result.withdrawableBalances, //可免费提现额度
					BalancesUpdatedAt: result.balancesUpdatedAt, //更新日期
					DepositedAmount: result.depositedAmount, // 充值总金额
					WithdrawAmount: result.withdrawAmount //提现总额
				});
			}
		});
	};

	/**
  * @description: 获取钱包地址
  * @param {*}
  * @return {*}
  */
	GetWalletAddress() {
		this.setState({
			walletAddressList: [],
			walletAddressItem: ''
		});
		let params = {
			cryptoCurrencyCode: this.state.CoinsCurrency
		};
		GetCryptocurrencyWalletAddressDetails(params, (data) => {
			if (data.isSuccess) {
				const { result } = data;
				if (result.length) {
					let defaultBank = result.find((v) => v.isDefault);
					let defaultId = result.find((v) => v.id);
					let notDefaultBank = result.filter((ele) => !ele.isDefault);
					let data = [ defaultBank, ...notDefaultBank ].filter((ele) => ele);
					this.setState({
						walletAddressList: data.length > 3 ? data.slice(0, 3) : data,
						walletAddressItem: defaultBank,
						bankCodeState: defaultId
					});
				} else {
					this.setState({
						walletAddressList: [],
						walletAddressItem: ''
					});
				}
			}
		});
	}

	/**
  * @description: 虚拟币提现手续费提示
  * @param {*}
  * @return {*}
  */
	getTip = () => {
		const { payMoney, WithdrawableBalances, ExchangeRate1, ExchangeRate2, CurrencyFrom, CurrencyTo } = this.state;
		if (ExchangeRate2 == 0) {
			return (
				<React.Fragment>
					<p className="tip">
						参考汇率：1 {CurrencyFrom} = {ExchangeRate1} {CurrencyTo} <br />此汇率仅供参考，交易将以实时汇率进行。
					</p>
				</React.Fragment>
			);
		}
		if (WithdrawableBalances == 0) {
			return (
				<React.Fragment>
					<p className="tip">
						参考汇率：1 {CurrencyFrom} = {ExchangeRate2} {CurrencyTo} <br />此汇率仅供参考，交易将以实时汇率进行。
					</p>
				</React.Fragment>
			);
		}
		if (Number(payMoney) > WithdrawableBalances) {
			return (
				<p className="tip">
					级别 1（免手续费）: 1 {CurrencyFrom} = {this.state.ExchangeRate1} {this.state.CurrencyTo} <br />
					级别 2（征收手续费）: 1 {CurrencyFrom} = {this.state.ExchangeRate2} {this.state.CurrencyTo}
					<br />
					汇率仅供参考，交易将以实时汇率计算<br />
					<label style={{ color: '#1C8EFF' }} onClick={() => this.setState({ usdtChangeModal: true })}>
						点击此处了解如何换算等值的加密货币
					</label>
				</p>
			);
		} else {
			return (
				<React.Fragment>
					<p className="tip">
						参考汇率：1 {CurrencyFrom} = {ExchangeRate1} {CurrencyTo} <br />此汇率仅供参考，交易将以实时汇率进行。
					</p>
				</React.Fragment>
			);
		}
	};

	onChange(value, CheckPrefixAmount) {
		console.log(value);
		let newValue = value
			.replace(/[^\d.]/g, '')
			.replace(/^\./g, '')
			.replace(/\.{2,}/g, '.')
			.replace('.', '$#$')
			.replace(/\./g, '')
			.replace('$#$', '.');
		let reg = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/g;
		let text = '';
		if (newValue > this.props.MaxBal) {
			text = '最高提现金额为' + numberWithCommas(this.props.MaxBal) + '元';
		} else if (newValue < this.props.MinBal) {
			text = '最低提现金额为' + numberWithCommas(this.props.MinBal) + '元';
		} else if (!reg.test(newValue)) {
			text = '金额格式错误';
		}
		this.setState(
			{
				payMoney: newValue,
				moneyError: text
			},
			() => {
				if (this.state.CoinsCurrency) {
					setTimeout(() => {
						this.GetExchangeRate();
					}, 500);
				}
				if (CheckPrefixAmount) {
					this.Withdrawal();
				}
			}
		);
	}

	toFix(num, i) {
		let str = String(num);
		let money;
		if (str.indexOf('.') > -1) {
			let strArr = str.split('.');
			money = strArr[1].length > i ? strArr[0] + '.' + strArr[1].substr(0, i) : strArr[0] + '.' + strArr[1];
		} else {
			money = str;
		}
		return money;
	}

	Withdrawal = () => {
		const { walletAddressList } = this.state;
		let Bank = walletAddressList.find((item) => item.id == this.state.bankCodeState);
		let data = {
			accountNumber: Bank.walletAddress,
			accountHolderName: Bank.walletName,
			language: 'zh-cn',
			swiftCode: 'Fun88Mobile',
			paymentMethod: 'CCW',
			amount: this.state.payMoney,
			transactionType: 'Withdrawal',
			domainName: LocalHost,
			isConvenience: true,
			isMobile: true,
			isSmallSet: false,
			ConvertedCurrency: this.state.CoinsCurrency
		};
		Toast.loading('提款中,请稍候...', 200);

		WithdrawalApplications(data, (res) => {
			Toast.destroy();
			if (res.isSuccess == true) {
				Toast.success('提款申请提交成功', 2);
				this.props.userInfo_getBalance(true);
			} else {
				if (res.errors && res.errors[0].errorCode == 'P101103') {
					Modal.info({
						title: '重要提示',
						centered: true,
						className: `commonModal`,
						footer: null,
						type: 'confirm',
						okText: '好的',
						onlyOKBtn: true,
						onOk: () => {},
						content: (
							<React.Fragment>
								<left>
									<p>请耐心等待，您有一项提款申请正在处理中。</p>
									<div
										style={{
											background: '#EFEFF4',
											margin: '0.5rem 0',
											padding: '0.5rem',
											lineHeight: '0.6rem',
											borderRadius: '0.2rem'
										}}
									>
										<p>提款编号：{res.result.lastWithdrawalID}</p>
										<p> 提款金额：{parseFloat(res.result.lastWithdrawalAmount)}</p>
									</div>
									<p>请等待处理完毕后，再提交其他提款申请。</p>
									<br />
								</left>
							</React.Fragment>
						)
					});
				} else {
					Toast.error(res.result.message, 2);
				}
			}
		});

		// Pushgtagdata(`Withdrawal`, 'Submit', `Submit_Crypto_Withdraw`);
	};
	render() {
		//const { bankAccounts, setting } = this.props.currDepositDetail; // 当前支付方式的详情
		const { CoinTypes } = this.props;

		const {
			walletAddressList,
			walletAddressItem,
			userBankOpen,
			ConvertedAmount,
			bankCodeState,
			payMoney,
			moneyError,
			CoinsCurrency
		} = this.state;
		let Submit = payMoney != '' && moneyError == '' && bankCodeState != '';

		return (
			<React.Fragment>
				<Flexbox width="100%" flexFlow="column" className="TODOUSDT">
					<Flexbox flexFlow="column">
						<label>选择加密货币</label>
						<Flexbox margin="10px 0">
							{CoinTypes.map((item, index) => {
								console.log('CoinTyps map item ===>',item);
								return (
									<Flexbox
										className={classNames({
											typelist: true,
											active: CoinsCurrency === item
										})}
										key={index}
										flexFlow="column"
										alignItems="center"
										justifyContent="center"
										flex="1"
										onClick={() => {
											console.log(item);
											this.setState(
												{
													CoinsCurrency: item
												},
												() => {
													this.GetExchangeRate();
													this.GetWalletAddress(item);
													//globalGtag(piwikObj[item]);
												}
											);
										}}
									>
										<ReactSVG src={`/img/svg/${item}.svg`} className="UsdtIcon" />
										<p>
											{NameObj[item]}
											<br />({item})
										</p>
									</Flexbox>
								);
							})}
						</Flexbox>
					</Flexbox>

					<label>提款金额</label>
					<Flexbox className="CCW withdrawals">
						<Input
							clear="true"
							type="text"
							value={this.state.payMoney}
							onChange={(value) => {
								//判断是不是小数 是的话不准输入
								if (Number(value.target.value) % 1 !== 0) {
									return;
								}
								let val = JSON.stringify(value.target.value).replace(/[^0-9]/g, '');
								this.onChange(val);
							}}
							placeholder={`单笔提款 最低：${numberWithCommas(this.props.MinBal)}元起，最高：${numberWithCommas(
								this.props.MaxBal
							)}元。 `}
						/>
					</Flexbox>
					{/* {this.state.moneyError && <p style={{ fontSize: 14, color: 'red' }}>{this.state.moneyError}</p>}
					<p className="tip">
						单笔提现最低 ¥{numberWithCommas(this.props.MinBal)}, 最高 ¥{numberWithCommas(this.props.MaxBal)}
						<br />
						单日提现金额为 ¥{numberWithCommas(this.state.DayBal)}
					</p> */}
					{CoinsCurrency && (
						<Flexbox flexFlow="column">
							<label>虚拟币等值数量</label>
							<Flexbox flexFlow="column">
								<Flexbox className="tip" margin="10px 0" height="44px">
									{this.state.payMoney &&
										`${this.toFix(ConvertedAmount, 4)}  ${this.state.CurrencyTo}`}
								</Flexbox>
								{this.getTip()}
							</Flexbox>
							{walletAddressList && walletAddressList.length != 0 ? (
								<React.Fragment>
									{/* <label>钱包地址</label> */}
									<BankAccount
										labelName="钱包地址"
										keyName={[ 'walletName', 'id' ]}
										bankAccounts={walletAddressList}
										bankCodeState={bankCodeState}
										key={JSON.stringify(walletAddressList)}
										setBankCode={(v) => {
											console.log(v);
											// this.testBankCard(v);
											this.setState({
												//toWalletKey: index,
												//toWallet: Bank.name,
												bankCodeState: v
												//userBankOpen: false
											});
										}}
										setting={undefined}
									/>
								</React.Fragment>
							) : (
								<div
									className="AddBtn"
									onClick={() => {
										Router.push(`/me/BankAccount?type=${CoinsCurrency === 'USDT-ERC20' ? 1 : 2}`);
										// globalGtag(
										// 	CoinsCurrency === 'USDT-ERC20'
										// 		? 'Add_ERC20_bankinginfo_profilepage'
										// 		: 'Add_TRC20_bankinginfo_profilepage'
										// );
									}}
								>
									添加 {CoinsCurrency} 钱包地址
									<i className="plus" style={{ top: '1rem' }} />
								</div>
							)}
							<Flexbox className="Form-input Custom-input">
								{userBankOpen == true && (
									<div className="pop">
										{!walletAddressList.length ? (
											<p style={{ textAlign: 'center' }} />
										) : (
											walletAddressList.map((rowData, index) => {
												return (
													<div
														onClick={() => {
															this.setState({
																walletAddressItem: this.state.walletAddressList[index],
																userBankOpen: false
															});
														}}
													>
														<p
															className="option"
															style={{
																backgroundColor:
																	walletAddressItem &&
																	walletAddressItem.ID === rowData.ID
																		? '#EBEBED'
																		: '#FFF'
															}}
														>
															{rowData.WalletName}
															<br />
															{rowData.WalletAddress}
															{walletAddressItem &&
															walletAddressItem.ID === rowData.ID && (
																<i className="add" />
															)}
														</p>
													</div>
												);
											})
										)}
										{walletAddressList &&
										walletAddressList.length &&
										walletAddressList.length < 3 && (
											<div
												className="addBtn"
												onClick={() => {
													Router.push(
														`/me/BankAccount?type=${CoinsCurrency === 'USDT-ERC20' ? 1 : 2}`
													);
													// globalGtag(
													// 	CoinsCurrency === 'USDT-ERC20'
													// 		? 'Add_ERC20_bankinginfo_profilepage'
													// 		: 'Add_TRC20_bankinginfo_profilepage'
													// );
												}}
											>
												添加 {CoinsCurrency} 钱包地址
												<i className="plus" />
											</div>
										)}
									</div>
								)}
							</Flexbox>
						</Flexbox>
					)}
					<Flexbox
						className={classNames({
							Submit: true,
							Active: Submit
						})}
						onClick={() => {
							if (Submit) {
								this.Withdrawal();
							}
						}}
					>
						提交
					</Flexbox>
				</Flexbox>
			</React.Fragment>
		);
	}
}
export default createForm({ fieldNameProp: 'lb' })(LB);

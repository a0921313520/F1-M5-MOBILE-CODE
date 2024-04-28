import { createForm } from 'rc-form';
import Modal from '@/components/View/Modal';
import React from 'react';
import { ApiPort } from '@/api/index';
import Button from '@/components/View/Button';
import SecondStep from './SecondStep';
import MoneyInput from './../MoneyInput';
import HostConfig from '@/server/Host.config';
import { fetchRequest } from '@/server/Request';
import { GetPayDetail, CommonPostPay } from '@/api/wallet';
import Item from './../Item';
import { formatSeconds, Cookie, dateFormat, getE2BBValue } from '@/lib/js/util';
import TargetAccount from './../TargetAccount';

import Toast from '@/components/View/Toast';
import Router from 'next/router';
import FinishStep from '../FinishStep';
import CTCDepositTutorial from './CTCDepositTutorial';
const { LocalHost } = HostConfig.Config;
import ReactIMG from '@/components/View/ReactIMG';

class CTC extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			lbStep: 1, // 极速虚拟币支付步骤
			ctcMethodTypeList: [], // 支付方式类型（极速虚拟币支付、虚拟币支付）
			ctcMethodType: '', // 当前支付方式类型
			ctcMethod: '', // 支付方式（比特币、以太坊、泰达币）
			currentCtcMethod: null, // 极速虚拟币支付/当前支付方式
			transactionId: '', // 交易编码
			depositMoney: 0,
			depositTutorial: false,
			remainingTime: '00:00', // 剩余时间
			INVOICE_AUT_Info: {}
		};

		this.setGuessCurrency = this.setGuessCurrency.bind(this); // 设置加密货币
		this.changeCtcType = this.changeCtcType.bind(this); // 更换加密支付类型
		this.goFastCurrency = this.goFastCurrency.bind(this); // 极速虚拟币支付提交
		this.payTypeCode = 'CTC'; // 当前支付方式Code

		this.collectionInfo = JSON.parse(Cookie('isCTCSecond'));
		this.currentCtcMethodType = ''; // 极速虚拟币  虚拟币
		this.ctcResultData = { res: null, methodObj: null }; // 极速虚拟币支付响应数据
	}
	componentDidMount() {
		this.GetProcessingDepositbyMethod();
	}
	componentDidUpdate(prevProps, prevState) {
		if (
			Array.isArray(this.props.payMethodList) &&
			this.props.payMethodList.length &&
			!this.state.ctcMethodTypeList.length
		) {
			const payMethodsDetail = this.props.payMethodList.find((item) => item.code === this.payTypeCode);
			if (payMethodsDetail && payMethodsDetail.availableMethods.length) {
				let filterDefault = payMethodsDetail.availableMethods.filter((v) => v.MethodType !== 'DEFAULT');
				this.currentCtcMethodType = filterDefault[0].methodCode;
				this.setState({
					ctcMethodTypeList: filterDefault,
					ctcMethodType: this.currentCtcMethodType
				});
			}
		}
		// 设置加密货币默认值
		if (
			this.state.ctcMethodType === 'CHANNEL' &&
			Array.isArray(this.props.currDepositDetail.banks) &&
			this.props.currDepositDetail.banks.length &&
			this.props.currDepositDetail.banks !== prevProps.currDepositDetail.banks &&
			this.props.currDepositDetail.banks.length === 1
		) {
			this.setState({
				ctcMethod: this.props.currDepositDetail.banks[0].code
			});
		}

		if (prevState.lbStep !== this.state.lbStep) {
			let notFirsStep = this.state.lbStep !== 1;
			if (notFirsStep) {
				this.props.setBackEvent(() => {
					this.setState({ lbStep: 1 });
				});
				this.props.setBarTitle('泰达币');
			} else {
				this.props.setBackEvent(null);
				this.props.setBarTitle(null);
			}
			this.props.setShowPayMethodsList(!notFirsStep);
		}
	}
	componentWillUnmount() {
		clearInterval(this.timeTimer);
	}
	changeCtcType(value) {
		this.setState({ ctcMethodType: value });
		Toast.loading();
		GetPayDetail(
			this.payTypeCode,
			(data) => {
				data.isSuccess && this.props.setCurrDepositDetail(data.result);
				Toast.destroy();
			},
			value
		);
		//console.log(value)

		switch (value) {
			case 'CHANNEL':
				// Pushgtagdata(`Deposit_Nav`, 'Confirm', 'Crypto_Channel');
				break;
			case 'INVOICE':
				// Pushgtagdata(`Deposit_Nav`, 'Confirm', 'Crypto_Invoice1');
				break;
			case 'OTC':
				// Pushgtagdata(`Deposit_Nav`, 'Confirm', 'Crypto_OTC');
				break;
			case 'INVOICE_AUT':
				// Pushgtagdata(`Deposit_Nav`, 'Confirm', 'Crypto_Invoice_AUT');
				break;
			default:
				break;
		}
	}
	goFastCurrency() {
		let { banks } = this.props.currDepositDetail; // 当前支付方式的详情
		if (Array.isArray(banks) && !banks.length) {
			Toast.error('请选择支付方式类型！');
			return;
		}
		if (this.state.ctcMethod === '') {
			Toast.error('请选择加密货币类型！');
			return;
		}
		const methodObj = Array.isArray(banks) && banks.find((v) => v.code === this.state.ctcMethod);
		//console.log(methodObj);
		// 重要提示
		Modal.info({
			title: '重要提示',
			centered: true,
			okText: '确认',
			cancelText: '关闭',
			className: `${methodObj.code === 'USDT-TRC20'
				? 'wallet-prompt-ctc ctcfreeChargeModal'
				: 'wallet-prompt-ctc'}`,
			content: (
				<React.Fragment>
					<div className="ctc-pay-method-item">
						<ReactIMG style={{ marginBottom: '8px' }} src={`/img/deposit/${methodObj.code}.png`} />
						<p>
							{methodObj.Name} ({methodObj.code})
						</p>
					</div>
					<div className="theme-color" style={{ marginBottom: '16px', lineHeight: '18px' }}>
						请确保将{methodObj.Name}
						转入收款账户，若您使用其他虚拟货币支付，则可能造成资金损失。
					</div>
					<div style={{ color: '#666666', lineHeight: '18px', marginBottom: '20px' }}>
						当您点击“确认”，则表示您已同意承担上述风险。
					</div>
				</React.Fragment>
			),
			onOk: () => {
				const hide = Toast.loading();
				fetchRequest(
					ApiPort.GetCryptocurrencyInfo +
						'ExchangeAmount=1&CoinsCurrency=' +
						this.state.ctcMethod +
						'&MethodCode=' +
						this.state.ctcMethodType +
						'&',
					'GET'
				).then((res) => {
					hide();
					if (res.isSuccess) {
						if (res && res.result.status === 'SUCCESS') {
							this.ctcResultData = { res, methodObj };
							this.setState({
								lbStep: 2
							});
						}
						if (res && res.result.status === 'FAILED') {
							Toast.error(res.Error);
						}
					}
				});
				// Pushgtagdata(`Deposit_Nav`, 'Confirm', 'Crypto_Channel_Next');
			},
			onCancel: () => {
				// Pushgtagdata(`Deposit_Nav`, 'Back', 'Crypto_Channel_Back');
			}
		});

		// Pushgtagdata(`Deposit`, 'Submit', 'Submit_Crypto_Deposit');
	}
	goInvoice = () => {
		// 重要提示
		Modal.info({
			title: '重要提示',
			centered: true,
			okText: '确认',
			cancelText: '关闭',
			className: `wallet-prompt-ctc`,
			content: (
				<React.Fragment>
					<div className="ctc-pay-method-item">
						<React.Fragment>
							<ReactIMG style={{ marginBottom: '8px' }} src={`/img/deposit/USDT-ERC20.png`} />
							<p>泰达币-ERC20 (USDT-ERC20)</p>
						</React.Fragment>
					</div>
					<div className="theme-color" style={{ marginBottom: '16px', lineHeight: '18px' }}>
						USDT-ERC20 交易需加上手续费。
					</div>
					<div style={{ color: '#666666', lineHeight: '18px', marginBottom: '20px' }}>
						例：火币交易手续费为 3 USDT 加上存款数量 15.88 USDT，交易总量为 18.88 USDT。
					</div>
				</React.Fragment>
			),
			onOk: () => {
				const hide = Toast.loading();
				this.payConfirm();
			}
		});

		// Pushgtagdata(`Deposit`, 'Submit', 'Submit_Crypto_Deposit');
	};
	setGuessCurrency(ctcMethod) {
		this.setState({ ctcMethod });
		switch (ctcMethod) {
			case 'BTC':
				// Pushgtagdata(`Deposit_Nav`, 'Confirm', 'Crypto_BTC');
				break;
			case 'ETH':
				// Pushgtagdata(`Deposit_Nav`, 'Confirm', 'Crypto_ETH');
				break;
			case 'USDT-ERC20':
				// Pushgtagdata(`Deposit_Nav`, 'Confirm', 'Crypto_ERC20');
				break;
			case 'USDT-TRC20':
				// Pushgtagdata(`Deposit_Nav`, 'Confirm', 'Crypto_TRC20');
				break;
			default:
				break;
		}
	}
	payConfirm = (e) => {
		//console.log("hi");
		e && e.preventDefault();
		// 存款前置条件判定
		if (typeof this.props.depositStatusCheck() === 'undefined') return;

		this.props.form.validateFields((err, values) => {
			if (!err) {
				const hide = Toast.loading();
				CommonPostPay(
					{
						accountHolderName: this.props.localMemberName, // 账户持有人姓名
						accountNumber: '0', //帐号
						amount: values.money,
						bankName: '', //银行名
						language: 'zh-cn',
						paymentMethod: this.payTypeCode,
						charges: 0,
						transactionType: 'Deposit',
						domainName: LocalHost,
						isMobile: true,
						isSmallSet: false,
						refNo: '0',
						offlineDepositDate: '',
						mgmtRefNo: 'Fun88Mobile',
						offlineRefNo: '0',
						BankLogID: '',
						depositingBankAcctNum: '',
						isPreferredWalletSet: false,
						depositingWallet: this.props.depositingWallet, // 目标账户Code
						bonusId: this.state.bonusVal,
						bonusCoupon: values.bonusCode || '',
						secondStepModel: null,
						MethodCode: this.state.ctcMethodType,
						successUrl: LocalHost,
						blackBoxValue: getE2BBValue(),
						e2BlackBoxValue: getE2BBValue(),
						transferType: {
							ID: 27,
							Sorting: 2,
							Name: 'LocalBank',
							CurrencyCode: 'CNY',
							Code: 'LocalBank',
							IsActive: true
						}
					},
					(res) => {
						hide();
						let { setting } = this.props.currDepositDetail; // 当前支付方式的详情

						if (res.isSuccess) {
							res = res.result;
							if (this.state.ctcMethodType === 'INVOICE_AUT') {
								this.GetProcessingDepositbyMethod(res.transactionId);

								return;
							} else {
								this.setState({
									lbStep: 3,
									transactionId: res.transactionId,
									depositMoney:
										setting.charges !== 0
											? this.props.actualAmount(values.money, setting.charges)
											: values.money
								});

								// 跳到第三方支付
								this.props.thirdPartyPay(res, '泰达币');
							}

							// 关掉存款教程入口
							this.props.toggleLearnEntry(false);
							// 重置表单
							this.props.form.resetFields();
						}
					}
				);
			}
		});

		// Pushgtagdata(`Deposit`, 'Submit', 'Submit_Crypto_Deposit');
	};

	hasError = () => Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
	submitBtnEnable = () => this.props.form.getFieldValue('money') !== '' && !this.hasError();
	FC_SubmitBtnEnable = () => this.state.ctcMethod !== '' && !this.hasError();

	goHome = () => {
		Cookie('isThird', null);
		clearInterval(this.timeTimer);
		Router.push('/');
	};

	submitButton = () => {
		switch (this.state.ctcMethodType) {
			case 'INVOICE':
				this.goInvoice();
				break;
			default:
				this.payConfirm();
				break;
		}
	};

	GetProcessingDepositbyMethod = (transactionId) => {
		transactionId && Toast.loading();
		const querys = `${ApiPort.GetProcessingDepositbyMethod}${transactionId
			? `depositID=${transactionId}&`
			: ''}method=CTC&MethodCode=INVOICE_AUT&`;

		fetchRequest(querys, 'GET').then((res) => {
			transactionId && Toast.destroy();
			if (res.result.length) {
				if (transactionId) {
					let orderData = res.result.filter((v) => v.transactionId === transactionId);
					orderData.length && this.INVOICE_AutNext(orderData[0]);
				} else {
					let lastOrder = res.result[0];
					// 檢查有沒有在倒數的訂單，有的話帶到第二頁
					const depositDateTime = lastOrder.submittedAt.split('T').join(' ').split('.')[0];
					const lastSeconds = 1200 - (new Date().getTime() - new Date(depositDateTime).getTime()) / 1000;
					lastSeconds >= 0 && this.INVOICE_AutNext(lastOrder);
				}
			}
		});
	};

	INVOICE_AutNext = (orderData) => {
		this.setState(
			{
				lbStep: 2,
				INVOICE_AUT_Info: orderData.cryptocurrencyDetail,
				transactionId: orderData.rransactionId,
				depositMoney: orderData.amount,
				MethodCode: 'INVOICE_AUT',
				ctcMethodType: 'INVOICE_AUT'
			},
			() => this.startCountDown('isCTCSecond', orderData.submittedAt)
		);
		// Pushgtagdata(`Deposit_Nav`, 'Next', 'Crypto');
	};

	startCountDown(stepName, submittedAt) {
		//console.log(submittedAt)
		clearInterval(this.timeTimer);
		this.setState({ remainingTime: '00:00' });
		const depositDateTime = submittedAt.split('T').join(' ').split('.')[0].replace('-', '/').replace('-', '/');
		const timeCount = 1200; //20min
		// const timeCount = 10; //for test
		let lastSeconds = timeCount - (new Date().getTime() - new Date(depositDateTime).getTime()) / 1000;
		depositDateTime !== null && depositDateTime !== ''
			? (this.timeTimer = setInterval(() => {
					//console.log(lastSeconds);
					if (lastSeconds <= 0 && this.state.lbStep === 2 && this.state.ctcMethodType === 'INVOICE_AUT') {
						{
							Modal.info({
								centered: true,
								okText: '回到存款页面',
								cancelText: '在线客服',
								className: 'wallet-prompt-ctc',
								content: (
									<div className="invoice2-popup-wrap">
										<div className="invoice2-popup-content">操作超时，系统将自动取消该笔交易。 若您已经完成交易，请联系在线客服。</div>
									</div>
								),
								onOk: () => {
									this.setState({ lbStep: 1 });
								},
								onCancel: () => {
									global.PopUpLiveChat();
								}
							});
						}
						Cookie(stepName, null);
						clearInterval(this.timeTimer);
					}
					this.setState({
						remainingTime: formatSeconds(lastSeconds--)
					});
				}, 1000))
			: Cookie(stepName, null);
	}

	cancelDepositPopup = () => {
		Modal.info({
			centered: true,
			okText: 'Chắc Chắn',
			cancelText: 'Không',
			className: 'wallet-prompt-ctc',
			content: (
				<div className="invoice2-popup-wrap">
					<div className="invoice2-popup-content">您确定要取消这笔交易吗?</div>
				</div>
			),
			onOk: () => {
				this.cancelDeposit();
			}
		});
	};

	cancelDeposit = () => {
		const hide = Toast.loading();
		fetchRequest(
			ApiPort.POSTMemberCancelDeposit + 'transactionId=' + this.state.transactionId + '&',
			'POST'
		).then((res) => {
			hide();
			if (res && res.isSuccess) {
				Toast.success('交易已取消', 1);
				setTimeout(() => {
					this.setState({
						lbStep: 1
					});
					clearInterval(this.timeTimer);
					Cookie('isCTCSecond', null);
				}, 1);
				this.props.form.resetFields();
				// Pushgtagdata(`Deposit_Nav`, 'Cancel', 'Crypto_InvoiceAut_Cancel');
			} else {
				Toast.error('错误');
			}
		});
	};

	render() {
		let { setting, banks } = this.props.currDepositDetail; // 当前支付方式的详情
		const { getFieldDecorator, getFieldValue, getFieldError, getFieldsError } = this.props.form;
		const {
			targetValue,
			bonusVal,
			lbStep,
			depositMoney,
			depositTutorial,
			ctcMethodType,
			remainingTime
		} = this.state;
		//console.log(this.state);
		return (
			<React.Fragment>
				<div className="ctc-wrapper form-wrap" style={{ display: lbStep === 1 ? 'block' : 'none' }}>
					{/* 第一步骤 */}
					<div className="modal-prompt-info clear-margin-bottom">
						重要提示：若使用加密货币支付，部分平台将征收手续费。
						<br />
						*目前支持使用泰达币 (USDT-ERC20及USDT-TRC20协议) 进行存款。
					</div>
					{this.state.ctcMethodTypeList.length && this.state.ctcMethodTypeList ? (
						<Item label="选择支付方式" className="clear-margin">
							<ul className="cap-list ctc-cap-list">
								{this.state.ctcMethodTypeList.map((item) => {
									return (
										<li
											key={item.methodCode}
											className="cap-item"
											onClick={() => {
												this.changeCtcType(item.methodCode);
											}}
										>
											<div className="cap-item-insideWrap">
												<div
													className={`cap-item-circle${item.methodCode ===
													this.state.ctcMethodType
														? ' curr'
														: ''}`}
												/>
												<div className="cap-item-content">
													<div className="cap-item-title">{item.methodType}</div>
													<div className="cap-item-notice">
														{item.methodCode === 'INVOICE' && '第三方交易所'}
														{item.methodCode === 'INVOICE_AUT' && '需填入交易哈希'}
														{item.methodCode === 'CHANNEL' && '支付完成后会生成订单编号'}
														{item.methodCode === 'OTC' && '人民币转账   '}
													</div>
												</div>
											</div>
										</li>
									);
								})}
							</ul>
						</Item>
					) : null}
					{this.state.ctcMethodType === 'CHANNEL' ? (
						<React.Fragment>
							{Array.isArray(banks) && banks.length ? (
								<div className="ctcMethodType-wrap">
									<label>选择加密货币</label>
									<div className="ctcMethodType-banks-wrap">
										{banks.map((item) => {
											console.log(item);
											return (
												<div
													className="ctcMethodType-item-wrap"
													key={item.code}
													onClick={() => {
														this.setGuessCurrency(item.code);
													}}
												>
													<div
														className={`ctcMethodType-item ${item.code ===
														this.state.ctcMethod
															? 'ctcMethodType-active'
															: ''} ${item.code === 'USDT-TRC20' ? 'ctcfreeCharge' : ''}`}
													>
														<ReactIMG src={`/img/deposit/${item.code}.png`} />
														<div>
															{item.name} <br />({item.code})
														</div>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							) : null}
							<Button
								className={`btn-wrap depo-btn-submit ${!this.FC_SubmitBtnEnable()
									? 'btn-disable'
									: ''}`}
								size="large"
								type="primary"
								onClick={this.goFastCurrency}
							>
								下一步
							</Button>
						</React.Fragment>
					) : (
						<div className="">
							<MoneyInput
								getFieldDecorator={getFieldDecorator}
								payTypeCode={this.payTypeCode}
								payMethodList={this.props.payMethodList}
								setCurrDepositDetail={this.props.setCurrDepositDetail}
								getFieldError={getFieldError}
								setting={setting}
								methodCode={this.state.ctcMethodType}
								currDepositDetail={this.props.currDepositDetail}
							/>
							{/* <TargetAccount
                                    getFieldDecorator={getFieldDecorator}
                                    getFieldValue={getFieldValue}
                                    setLoading={this.props.setLoading}
                                    targetValue={targetValue}
                                    setTargetValue={(v, name) => { this.setState({ targetValue: v, targetName: name }) }}
                                    bonusVal={bonusVal}
                                    setBonusValue={(v, name) => { this.setState({ bonusVal: v, bonusName: name }) }}
                                /> */}
							<div className={`btn-wrap depo-btn-submit ${!this.submitBtnEnable() ? 'btn-disable' : ''}`}>
								{console.log(this.state.ctcMethodType)}
								<Button
									size="large"
									type="primary"
									onClick={() => {
										if (!this.submitBtnEnable()) return;
										this.submitButton();
									}}
								>
									下一步
								</Button>
							</div>
						</div>
					)}
				</div>
				{/* 第二步骤 */}
				{this.state.ctcMethodType === 'INVOICE_AUT' ? (
					<SecondStep
						lbStep={lbStep}
						setLbStep={(v) => {
							this.setState({ lbStep: v });
						}}
						setLoading={this.props.setLoading}
						ctcMethodType={ctcMethodType}
						startCountDown={this.startCountDown}
						remainingTime={remainingTime}
						depositMoney={depositMoney}
						INVOICE_AUT_Info={this.state.INVOICE_AUT_Info}
						ctcResultData={this.ctcResultData}
						transactionId={this.state.transactionId}
						cancelDepositPopup={this.cancelDepositPopup}
					/>
				) : (
					<SecondStep
						lbStep={lbStep}
						setLbStep={(v) => {
							this.setState({ lbStep: v });
						}}
						setLoading={this.props.setLoading}
						ctcMethodType={ctcMethodType}
						ctcResultData={this.ctcResultData}
					/>
				)}
				{/* 第三步骤 */}
				{lbStep === 3 && (
					<FinishStep
						transactionId={this.state.transactionId}
						depositMoney={depositMoney}
						goHome={this.goHome}
						time="10:00"
					/>
				)}
				<CTCDepositTutorial
					visible={depositTutorial}
					closeModal={() => this.setState({ depositTutorial: false })}
				/>
				{lbStep !== 3 && (
					<div className="depositTutorial-btn-wrap">
						<div
							className="depositTutorial-btn"
							onClick={() => {
								this.setState({ depositTutorial: true });
								// Pushgtagdata(`Deposit_Nav`, 'Confirm', 'Deposit_Tutorial');
							}}
						>
							存款教程
						</div>
					</div>
				)}
			</React.Fragment>
		);
	}
}
export default createForm({ fieldNameProp: 'ctc' })(CTC);

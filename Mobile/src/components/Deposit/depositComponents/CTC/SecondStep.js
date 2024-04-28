import React from 'react';
import QRCode from 'qrcode-react';
import { createForm } from 'rc-form';
import Button from '@/components/View/Button';
import TextareaAutosize from 'react-textarea-autosize';
import { Cookie } from '@/lib/js/util';
import Toast from '@/components/View/Toast';
import Item from './../Item';
import { Fragment } from 'react';
import Copy from '../Copy';
import { ApiPort } from '@/api/index';
import { fetchRequest } from '@/server/Request';
import ReactIMG from '@/components/View/ReactIMG';

class SecondStep extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.copySuccessCall = this.copySuccessCall.bind(this);
	}
	componentDidMount() {}
	componentDidUpdate(prevProps, prevState) {}

	goBackStep = (e) => {
		e && typeof e !== 'string' && e.preventDefault();
		this.props.setLbStep(1);
		// Pushgtagdata('Close_crypto_deposit');
	};
	copySuccessCall() {
		Toast.info('已复制');
		// Pushgtagdata('Copy_crypto_deposit');
	}
	submitBtnEnable = () => {
		let errors = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let values = Object.values(this.props.form.getFieldsValue()).some((v) => v == '' || v == undefined);
		return !values && !errors;
	};

	goThirdStep = (e) => {
		e.preventDefault();
		if (!this.submitBtnEnable()) return;

		let hide = null;
		const sucessRun = () => {
			Cookie('isCTCSecond', null);
			Cookie('isCTCThird', 'true', { expires: 10 });
			this.props.setLbStep(3);
			this.props.form.resetFields();
			hide();
		};
		const { INVOICE_AUT_Info } = this.props;
		let data = {
			transactionID: this.props.transactionId,
			transactionHash: this.props.form.getFieldValue('hashCode'),
			depositingWalletAddress: INVOICE_AUT_Info.walletAddress,
			exchangeRate: INVOICE_AUT_Info.exchangeAmount,
			coinsCurrency: INVOICE_AUT_Info.baseCurrency,
			methodCode: 'INVOICE_AUT' //目前只有虛擬幣2會到這
		};

		hide = Toast.loading();

		fetchRequest(
			`${ApiPort.ProcessInvoiceAutCryptoDeposit}?transactionID=${data.transactionID}&transactionHash=${data.transactionHash}&`,
			'POST'
		)
			.then((res) => {
				if (res.isSuccess) {
					sucessRun();
				} else {
					hide();
					Toast.error(res.errorMessage);
				}
			})
			.catch((error) => {
				hide();
				//console.log(error);
			});

		// Pushgtagdata(`Deposit`, 'Submit', 'Submit_invoice2_Crypto_Deposit');
	};
	render() {
		const { res, methodObj } = this.props.ctcResultData;
		const { INVOICE_AUT_Info } = this.props;
		console.log(INVOICE_AUT_Info);
		const { getFieldsError, getFieldValue, getFieldDecorator } = this.props.form;
		//console.log(this.props)
		return (
			this.props.lbStep === 2 && (
				<div className="form-wrap sport-deposit-container">
					{this.props.ctcMethodType === 'INVOICE_AUT' ? (
						<div className="sport-deposit-receipt ctc-pay-receipt">
							<div className="modal-prompt-info">
								请在 {this.props.remainingTime} 分钟内完成交易并输入交易哈希，否则系统将自动取消交易。
							</div>
							<ul>
								<li className="item-wrap">
									<span className="item-label">存款金额</span>
									<span style={{ fontSize: '14px', fontWeight: '600' }}>
										{INVOICE_AUT_Info.exchangeAmount} {INVOICE_AUT_Info.currencyTo}
									</span>
									<p className="ctc-pay-notice">
										参考汇率：1 {INVOICE_AUT_Info.currencyTo} = {INVOICE_AUT_Info.exchangeRate} 人民币。
										<br />
										USDT-ERC20 交易需加上手续费。
										<br />
										例：火币交易手续费为 3 USDT 加上充值数量 15.88 USDT，交易总量为 18.88 USDT。
									</p>
								</li>
								<li className="item-wrap" style={{ alignItems: 'flex-start' }}>
									<span className="item-label">二维码</span>
									<QRCode size={160} value={INVOICE_AUT_Info.deepLink} />
								</li>
								<li className="item-wrap">
									<span className="item-label">收款地址</span>
									<span className="item-wrap-100">
										<span className="walletAddress-label">{INVOICE_AUT_Info.walletAddress}</span>
										<Copy targetText={INVOICE_AUT_Info.walletAddress} />
									</span>
								</li>
								<li className="item-wrap">
									<Item
										label={`交易哈希`}
										style={{ width: '100%' }}
										errorMessage={this.props.form.getFieldError('hashCode')}
									>
										{getFieldDecorator('hashCode', {
											rules: [
												{ required: true, message: '请填写交易哈希' },
												{
													validator: (rule, value, callback) => {
														if (value) {
															if (!/^(0x|0X)[a-zA-Z0-9]{64}$/.test(value)) {
																callback('请输入以0x开头的66位字符，不包含空格和特殊字符。');
															}
														}
														callback();
													}
												}
											]
										})(<TextareaAutosize className="textarea-default" />)}
									</Item>
								</li>
							</ul>
							<div className="ctc-sec-btnWrap">
								<div>
									<Button
										className="ctc-cancel-btn"
										size="large"
										type="primary"
										onClick={() => this.props.cancelDepositPopup()}
									>
										取消交易
									</Button>
								</div>
								<div className={`btn-wrap ctc-ok-btn`}>
									<Button
										className={`${!this.submitBtnEnable() ? 'btn-disable' : ''}`}
										size="large"
										type="primary"
										onClick={(e) => this.goThirdStep(e)}
									>
										我已经成功存款
									</Button>
								</div>
							</div>
						</div>
					) : (
						<div
							className={`${methodObj
								? methodObj.Code === 'USDT-TRC20'
									? 'form-wrap ctcfreeCharge secCtcfreeCharge'
									: 'form-wrap'
								: null}`}
						>
							<div className="sport-deposit-receipt ctc-pay-receipt">
								{methodObj && res ? (
									<Fragment>
										<div className="ctc-pay-method">
											<ReactIMG src={`/img/deposit/${methodObj.code}.png`} />
											<p>
												{methodObj.Name} ({methodObj.code})
											</p>
										</div>
										<ul>
											<li className="item-wrap">
												<span className="item-label">参考汇率</span>
												<span>
													1 {res.result.baseCurrency} = {res.result.exchangeAmount} RMB
												</span>
												<p className="ctc-pay-notice">请注意在完成交易时，汇率可能会发生变化。</p>
											</li>
											<li className="item-wrap" style={{ alignItems: 'flex-start' }}>
												<span className="item-label">二维码</span>
												<QRCode size={160} value={res.result.deepLink} />
											</li>
											<li className="item-wrap">
												<span className="item-label">收款地址</span>
												<span
													style={{
														position: 'relative',
														minWidth: '100%',
														textAlign: 'left',
														marginTop: '9px',
														display: 'flex',
														justifyContent: 'space-between'
													}}
												>
													<span className="walletAddress-label">
														{res.result.walletAddress}
													</span>
													<Copy targetText={res.result.walletAddress} />
												</span>
												<div className="ctc-pay-notice">
													最低存款数量：{res.result.minAmt}
													{res.result.baseCurrency} <br />
													该收款地址是您的专属地址，可以多次使用。
												</div>
											</li>
										</ul>
									</Fragment>
								) : null}
							</div>
							<div gutter={20}>
								{/* <div span={12}>
                          <Button
                              size="large"
                              type="primary"
                              onClick={() => {
                                  this.props.setLbStep(1);
                                  Pushgtagdata("Back_crypto_deposit");
                              }}
                          >
                              回上一步
                          </Button>
                      </div> */}
								<div span={12}>
									<Button size="large" type="primary" onClick={this.goBackStep}>
										关闭
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			)
		);
	}
}
export default createForm({ fieldNameProp: 'ctcsecondstep' })(SecondStep);

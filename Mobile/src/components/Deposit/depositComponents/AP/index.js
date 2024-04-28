import React from 'react';
import { createForm } from 'rc-form';
import Button from '@/components/View/Button';
import Input from '@/components/View/Input';
import HostConfig from '@/server/Host.config';
import { formatAmount, mul, getE2BBValue } from '@/lib/js/util';
import { CommonPostPay, PromoPostApplications } from '@/api/wallet';
import { depositMoneyInt } from '@/lib/SportReg';
import Router from 'next/router';
import { withBetterRouter } from '@/lib/js/withBetterRouter';
import Toast from '@/components/View/Toast';
import Item from './../Item';
import DatePicker from '@/components/View/DatePicker';
import { format, minDate, maxDate, now } from '@/lib/js/datePickerUtils';
const { LocalHost } = HostConfig.Config;
import FinishStep from '../FinishStep';
import { formatSeconds, Cookie } from '@/lib/js/util';
import TargetAccount from './../TargetAccount';
import { ReactSVG } from '@/components/View/ReactSVG';

class AP extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			targetValue: '', // 目标账户State值
			targetName: '', // 目标账户名称
			bonusVal: 0, // 可申请优惠Val值
			bonusName: '', // 可申请优惠名称
			moneyType: '', // AstroPay 卡金额类型 (RMB)(USD)
			sudMonetary: 0, // 美金转换结果
			date: null,
			iconName: 'close',
			inputType: 'password'
		};

		this.payTypeCode = 'AP'; // 当前支付方式Code
		this.moneyInfo = {
			Rate: 0,
			minBalVal: 0,
			maxBalVal: 0,
			minBal: 0,
			maxBal: 0,
			minBalUSDVal: 0,
			maxBalUSDVal: 0,
			minBalUSD: 0,
			maxBalUSD: 0,
			isOpen: false
		};
	}
	componentDidMount() {}

	goHome = () => {
		Cookie('isThird', null);
		clearInterval(this.timeTimer);
		Router.push('/');
	};
	onChange = (date) => {
		this.props.form.setFieldsValue({
			carddate: (date && format(date)) || ''
		});
		this.setState({
			date
		});
	};
	payConfirm = (e) => {
		e.preventDefault();
		if (!this.submitBtnEnable()) return;
		if (typeof this.props.depositStatusCheck() === 'undefined') return; // 未完成真实姓名验证则呼出完善弹窗

		this.props.form.validateFields((err, values) => {
			if (!err) {
				const hide = Toast.loading();
				CommonPostPay(
					{
						accountHolderName: '',
						accountNumber: '0',
						amount: this.state.moneyType === 'USD' ? this.state.sudMonetary : values.money, // 计算汇率后的金额 RMB
						bankName: '',
						bonusId: this.state.bonusVal,
						bonusCoupon: values.bonusCode || '',
						cardExpiryDate: values.carddate, // AstroPay有效期
						cardName: '',
						cardNumber: values.astromumber, // AstroPay的卡号
						cardPIN: values.pin, // AstroPay的PIN码
						charges: 0,
						couponText: '',
						depositingBankAcctNum: '',
						depositingWallet: this.props.depositingWallet, // 目标账户Code
						domainName: LocalHost,
						fileBytes: '',
						fileName: '',
						isMobile: false,
						isPreferredWalletSet: false, // 是否设为默认目标账户
						isSmallSet: false,
						language: 'zh-cn',
						mgmtRefNo: 'Fun88Mobile',
						offlineDepositDate: '',
						offlineRefNo: '0',
						paymentMethod: 'AP',
						refNo: '0',
						secondStepModel: null,
						successUrl: LocalHost,
						transactionType: 'Deposit',
						transferType: null,
						blackBoxValue: getE2BBValue(),
						e2BlackBoxValue: getE2BBValue()
					},
					(res) => {
						hide();
						if (res.isSuccess) {
							res = res.result;
							Toast.success('存款成功！');
							this.props.form.resetFields();

							/* -----------申请优惠---------- */
							const { bonusVal } = this.state;
							if (bonusVal && bonusVal != 0) {
								PromoPostApplications(
									{
										bonusId: bonusVal,
										amount: values.money,
										bonusMode: 'Deposit',
										targetWallet: this.props.depositingWallet,
										couponText: '',
										isMax: false,
										depositBonus: {
											depositCharges: 0,
											depositId: res.transactionId
										},
										successBonusId: res.successBonusId,
										blackBox: getE2BBValue(),
										blackBoxValue: getE2BBValue(),
										e2BlackBoxValue: getE2BBValue()
									},
									(res) => {
										//console.log(res);
										if (res.message == 'fun88_BonusApplySuccess') {
											Router.push(
												`/Deposit/promostatus/?id=${bonusVal}&wallet=${this.props
													.depositingWallet}&value=${values.money}`
											);
										}
									}
								);
							}
						} else {
							Toast.error(res.errorMessage);
						}
					}
				);
			}
		});
		// Pushgtagdata(`Deposit`, 'Submit', 'Submit_Astropay_Deposit');
		
	};
	submitBtnEnable = () => {
		let errors = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let values = Object.values(this.props.form.getFieldsValue()).some((v) => v == '' || v == undefined);
		return !values && !errors;
	};
	changeIconName = () => {
		if (this.state.iconName === 'open') {
			this.setState({
				iconName: 'close',
				inputType: 'password'
			});
		} else {
			this.setState({
				iconName: 'open',
				inputType: 'text'
			});
		}
	};
	render() {
		let { setting } = this.props.currDepositDetail; // 当前支付方式的详情
		const { getFieldsError, getFieldValue, getFieldDecorator } = this.props.form;
		const { targetValue, bonusVal, depositMoney, iconName } = this.state;
		if (setting && setting.exchangeRates[0]) {
			(this.moneyInfo.Rate = setting.exchangeRates[0].rate),
				(this.moneyInfo.minBalVal = setting.minBal),
				(this.moneyInfo.maxBalVal = setting.maxBal),
				(this.moneyInfo.minBal = formatAmount(this.moneyInfo.minBalVal)),
				(this.moneyInfo.maxBal = formatAmount(this.moneyInfo.maxBalVal)),
				(this.moneyInfo.minBalUSDVal = this.moneyInfo.minBalVal / this.moneyInfo.Rate),
				(this.moneyInfo.maxBalUSDVal = this.moneyInfo.maxBalVal / this.moneyInfo.Rate),
				(this.moneyInfo.minBalUSD = formatAmount(this.moneyInfo.minBalUSDVal)),
				(this.moneyInfo.maxBalUSD = formatAmount(this.moneyInfo.maxBalUSDVal));
		}

		return (
			<React.Fragment>
				<div className="form-wrap">
					<Item errorMessage={this.props.form.getFieldError('astromumber')}>
						{getFieldDecorator('astromumber', {
							rules: [
								{ required: true, message: '请输入AstroPay卡号' },
								{
									validator: (rule, value, callback) => {
										if (value) {
											const isPassAstroPay = value.toString().length === 16;
											if (!depositMoneyInt.test(value) || !isPassAstroPay) {
												callback('AstroPay卡号格式有误');
											}
											if (isPassAstroPay) {
												if (value.toString().substr(3, 1) === '6') {
													this.setState({
														moneyType: 'USD',
														sudMonetary: formatAmount(
															parseInt(mul(getFieldValue('money'), this.moneyInfo.Rate))
														)
													});
												} else {
													this.setState({
														moneyType: 'RMB'
													});
												}
												callback();
											}
										}
										callback();
									}
								}
							]
						})(<Input size="large" placeholder="AstroPay卡号" autoComplete="off" maxLength={16} />)}
					</Item>
					<Item errorMessage={this.props.form.getFieldError('pin')}>
						{getFieldDecorator('pin', {
							rules: [ { required: true, message: '请填写安全码！' } ]
						})(
							<Input
								size="large"
								type={this.state.inputType}
								placeholder="安全码"
								autoComplete="off"
								maxLength={20}
								suffix={
									<ReactSVG
										className={`loginSVG login__pwd__${iconName}`}
										src={`/img/svg/login/eyes-${iconName}.svg`}
										onClick={this.changeIconName}
									/>
								}
							/>
						)}
					</Item>
					<Item label={'有效日期'} errorMessage={this.props.form.getFieldError('carddate')}>
						<DatePicker
							datePickerProps={{
								rootNativeProps: { 'data-xx': 'yy' },
								defaultDate: this.state.date || now,
								mode: 'month',
								maxDate: maxDate,
								minDate: minDate
							}}
							title="请选择有效日期"
							isOpen={this.state.isOpen}
							onChange={this.onChange}
							onClose={() => {
								this.setState({ isOpen: false });
							}}
						>
							{getFieldDecorator('carddate', {
								initialValue: (this.state.date && format(this.state.date)) || '',
								rules: [
									{
										required: true,
										message: '请选择有效日期！'
									}
								]
							})(
								<Input
									onClick={() => {
										this.setState({
											isOpen: !this.state.isOpen
										});
									}}
									placeholder="有效日期"
									autoComplete="off"
									maxLength={20}
								/>
							)}
						</DatePicker>
					</Item>
					<Item className="">
						<Input
							size="large"
							placeholder={``}
							value={`美金兑换汇率: ${this.moneyInfo.Rate}`}
							disabled
							autoComplete="off"
						/>
					</Item>
					<Item
						label={`卡片面值${this.state.moneyType ? '（' + this.state.moneyType + '）' : ''}(USD/RMB)`}
						errorMessage={this.props.form.getFieldError('money')}
					>
						{getFieldDecorator('money', {
							initialValue: this.props.router && this.props.router.query.money,
							getValueFromEvent: (event) => {
								// 限制只能輸入整數
									return event.target.value.replace(/[^\d]+/g, '')
								},
							rules: [
								{ required: true, message: '请填写金额！' },
								{  
									validator: (rule, value, callback) => {
										if (value) {
											if (!/^[0-9]+$/.test(value)) {
												callback('请输入整数金额！');
											  }
											if (this.state.moneyType === 'USD') {
												if (value > this.moneyInfo.maxBalUSDVal) {
													callback('最高存款金额：$' + this.moneyInfo.maxBalUSD);
												}
												if (value < this.moneyInfo.minBalUSDVal) {
													callback('最低存款金额：$' + this.moneyInfo.minBalUSD);
												}
												if (
													value <= this.moneyInfo.maxBalUSDVal &&
													value >= this.moneyInfo.minBalUSDVal
												) {
													this.setState({
														sudMonetary: formatAmount(
															parseInt(mul(value, this.moneyInfo.Rate))
														)
													});
												}
											} else {
												if (value > this.moneyInfo.maxBalVal) {
													callback('最高存款金额：' + this.moneyInfo.maxBal + '元');
												}
												if (value < this.moneyInfo.minBalVal) {
													callback('最低存款金额：' + this.moneyInfo.minBal + '元');
												}
											}
											callback();
										} else {
											this.setState({ sudMonetary: 0 });
											callback();
										}
									}
								}
							]
						})(
							<Input
								size="large"
								placeholder={`单笔存款范围:${this.moneyInfo.minBal} ($${this.moneyInfo.minBalUSD}) - ${this
									.moneyInfo.maxBal} ($${this.moneyInfo.maxBalUSD})`}
								autoComplete="off"
								maxLength={20}
							/>
						)}
					</Item>
					{this.state.moneyType === 'USD' ? (
						<Item label="实际存入（RMB）">
							<Input
								size="large"
								className="sport-input-disabled"
								disabled={true}
								value={this.state.sudMonetary}
							/>
						</Item>
					) : null}
					<TargetAccount
						getFieldDecorator={getFieldDecorator}
						getFieldValue={getFieldValue}
						setLoading={this.props.setLoading}
						targetValue={targetValue}
						setTargetValue={(v, name) => {
							this.setState({ targetValue: v, targetName: name });
						}}
						bonusVal={bonusVal}
						setBonusValue={(v, name) => {
							this.setState({ bonusVal: v, bonusName: name });
						}}
					/>
					<div>
						<div className={`btn-wrap depo-btn-submit ${!this.submitBtnEnable() ? 'btn-disable' : ''}`}>
							<Button size="large" type="primary" onClick={this.payConfirm}>
								提交
							</Button>
						</div>
					</div>
				</div>
				{/* 温馨提示 */}
				<div className="deposit-help-wrap">
					<ul>
						<li>AstroPay卡是一种充值预付卡，无需额外填写银行账户资料。 在淘宝等网站均有出售不同面值 Astro 充值卡。购买美元充值卡或人民币充值卡后，即可进行存款。 </li>
						<li>依次填写卡号、安全码、有效日期、卡片面值后点击提交。 </li>
						<li>
							如有问题请联系
							<Button type="link" onClick={global.PopUpLiveChat}>
								在线客服
							</Button>
							。
						</li>
					</ul>
				</div>
			</React.Fragment>
		);
	}
}
export default withBetterRouter(createForm({ fieldNameProp: 'ap' })(AP));

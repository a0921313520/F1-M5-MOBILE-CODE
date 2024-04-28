import React from 'react';
import Button from '@/components/View/Button';
import { createForm } from 'rc-form';
import MoneyInput from './../MoneyInput';
import HostConfig from '@/server/Host.config';
import { CommonPostPay, PromoPostApplications } from '@/api/wallet';
import Toast from '@/components/View/Toast';
import Router from 'next/router';
const { LocalHost } = HostConfig.Config;
import FinishStep from '../FinishStep';
import { formatSeconds, Cookie, getE2BBValue } from '@/lib/js/util';
import TargetAccount from './../TargetAccount';
import SecondStep from './SecondStep';
import Modal from '@/components/View/Modal';

class OA extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			targetValue: '', // 目标账户State值
			targetName: '', // 目标账户名称
			bonusVal: 0, // 可申请优惠Val值
			bonusName: '', // 可申请优惠名称
			Channeldefault: '',
			lbStep: 1
		};

		this.payTypeCode = 'OA'; // 当前支付方式Code
		this.goThirdStep = null; // 前往第三步的方法
		this.resultData = { res: null }; // smilePay响应数据
	}
	componentDidMount() {
		let memberInfo = JSON.parse(localStorage.getItem('memberInfo'));
		this.setState({
			Channeldefault: this.refs.Channeldefault.state.Channeldefault,
			targetValue: memberInfo.preferWallet == undefined ? memberInfo.preferWallet : memberInfo.preferWallet
		});
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevState.lbStep !== this.state.lbStep) {
			let notFirsStep = this.state.lbStep !== 1;
			if (notFirsStep) {
				this.props.setBackEvent(() => {
					this.setState({ lbStep: this.state.lbStep - 1 });
				});
				this.props.setBarTitle('在线支付宝');
			} else {
				this.props.setBackEvent(null);
				this.props.setBarTitle(null);
			}
			this.props.setShowPayMethodsList(!notFirsStep);
		}
	}
	goHome = () => {
		Cookie('isThird', null);
		clearInterval(this.timeTimer);
		Router.push('/');
	};
	payConfirm = (e) => {
		e.preventDefault();
		if (!this.submitBtnEnable()) return;
		if (typeof this.props.depositStatusCheck() === 'undefined') return; // 未完成真实姓名验证则呼出完善弹窗
		this.depositName = this.props.form.getFieldValue('lbRealName');
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const hide = Toast.loading();
				CommonPostPay(
					{
						methodcode: this.refs.Channeldefault.state.Channeldefault,
						accountHolderName:
							this.depositName != null
								? this.depositName
								: JSON.parse(localStorage.getItem('memberInfo')).firstName,
						accountNumber: '0',
						amount: values.money,
						bankName: '',
						bonusId: this.state.bonusVal,
						bonusCoupon: values.bonusCode || '',
						cardExpiryDate: '',
						cardName: '',
						cardNumber: '',
						cardPIN: '',
						charges: 0,
						couponText: '',
						depositingBankAcctNum: '',
						depositingWallet: this.props.depositingWallet, // 目标账户Code,
						domainName: LocalHost,
						fileBytes: '',
						fileName: '',
						isMobile: true,
						isPreferredWalletSet: false, // 是否设为默认目标账户
						isSmallSet: false,
						language: 'zh-cn',
						mgmtRefNo: 'Fun88Mobile',
						offlineDepositDate: '',
						offlineRefNo: '0',
						paymentMethod: this.payTypeCode,
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
							if (res.isQR && this.refs.Channeldefault.state.Channeldefault === 'AliBnBQR') {
								this.resultData = { res };
								this.setState({
									lbStep: 2
								});
							} else {
								this.props.thirdPartyPay(res, values.money, '在线支付宝');

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
							}
							this.props.form.resetFields();
						} else {
							if (this.refs.Channeldefault.state.Channeldefault === 'AliBnBQR') {
								if (res.errorCode === 'P101105') {
									Modal.info({
										title: '重要提示',
										centered: true,
										okText: '好的',
										cancelText: '在线客服',
										className: `wallet-prompt-ctc`,
										content: (
											<React.Fragment>
												<div className="importantModal-wrap">
													{res.errorMessage && res.errorMessage !== '' ? (
														res.errorMessage
													) : (
														'抱歉，您已超时，请重新提交或联系在线客服。'
													)}
												</div>
											</React.Fragment>
										),
										onCancel: () => {
											global.PopUpLiveChat();
										}
									});
								} else {
									Modal.info({
										title: '重要提示',
										type: 'confirm',
										onlyOKBtn: true,
										centered: true,
										okText: '好的',
										className: `wallet-prompt-ctc`,
										content: (
											<React.Fragment>
												<div className="importantModal-wrap">
													{res.errorMessage && res.errorMessage !== '' ? (
														res.errorMessage
													) : (
														'错误'
													)}
												</div>
											</React.Fragment>
										)
									});
								}
							} else {
								Toast.error(res.errorMessage);
							}
						}
					}
				);
			}
		});
		// Pushgtagdata(`Deposit`, 'Submit', 'Submit_Onlinealipay_Deposit');
	};

	submitBtnEnable = () => {
		let { setting } = this.props.currDepositDetail;
		let errors = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let values = Object.values(this.props.form.getFieldsValue()).some((v) => v == '' || v == undefined);
		if (setting && setting.showDepositorNameField && !setting.prefillRegisteredName) {
			return !values && this.props.form.getFieldValue('money') !== '' && !errors;
		}
		return this.props.form.getFieldValue('money') !== '' && !errors;
	};

	render() {
		let { setting } = this.props.currDepositDetail; // 当前支付方式的详情
		const {
			getFieldsError,
			getFieldValue,
			getFieldDecorator,
			setFieldsValue,
			getFieldInstance,
			setFields,
			getFieldError
		} = this.props.form;
		const { targetValue, bonusVal, lbStep } = this.state;

		return (
			<React.Fragment>
				<div className="form-wrap" style={{ display: lbStep === 1 ? 'block' : 'none' }}>
					<MoneyInput
						getFieldDecorator={getFieldDecorator}
						payTypeCode={this.payTypeCode}
						payMethodList={this.props.payMethodList}
						setCurrDepositDetail={this.props.setCurrDepositDetail}
						setting={setting}
						setFieldsValue={setFieldsValue}
						setLoading={this.props.setLoading}
						ref="Channeldefault"
						setFields={setFields}
						getFieldError={getFieldError}
						localMemberName={this.props.localMemberName}
						currDepositDetail={this.props.currDepositDetail}
					/>
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
				{/* 第二步骤 */}
				<SecondStep
					lbStep={lbStep}
					setLbStep={(v) => {
						this.setState({ lbStep: v });
					}}
					setLoading={this.props.setLoading}
					setGoThirdStep={(v) => {
						this.goThirdStep = v;
					}}
					resultData={this.resultData}
					callbackToHome={this.props.callbackToHome}
					lbStep={lbStep}
				/>
				{console.log(this.resultData)}
				{/* 第三步骤 */}
				{lbStep === 3 && (
					<FinishStep
						transactionId={this.resultData !== null ? this.resultData.res.transactionId : ''}
						depositMoney={this.resultData !== null ? this.resultData.res.uniqueAmount : ''}
						goHome={this.goHome}
						time="10:00"
						callbackToHome={this.props.callbackToHome}
						lbStep={lbStep}
					/>
				)}
				{/* 温馨提示 */}
				{lbStep !== 3 && (
					<div className="deposit-help-wrap">
						<h4>乐天使温馨提醒：</h4>
						<ul>
							<li>输入存款金额点击提交。</li>
							<li>打开支付宝，点击扫一扫完成支付即可。</li>
							<li>使用在线支付宝和京东支付扫码存款时，请不要保留二维码后进行多次扫码存款，以免出现延迟到账的现象，谢谢您的配合。</li>
						</ul>
					</div>
				)}
			</React.Fragment>
		);
	}
}
export default createForm({ fieldNameProp: 'oa' })(OA);

import React from 'react';
import Button from '@/components/View/Button';
import { createForm } from 'rc-form';
import MoneyInput from './../MoneyInput';
import TargetAccount from './../TargetAccount';
import HostConfig from '@/server/Host.config';
import { CommonPostPay, PromoPostApplications } from '@/api/wallet';
import FinishStep from '../FinishStep';
import { formatSeconds, Cookie, getE2BBValue } from '@/lib/js/util';
const { LocalHost } = HostConfig.Config;
import Toast from '@/components/View/Toast';
import Router from 'next/router';

class UP extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			targetValue: '', // 目标账户State值
			targetName: '', // 目标账户名称
			bonusVal: 0, // 可申请优惠Val值
			bonusName: '' // 可申请优惠名称
		};

		this.payTypeCode = 'UP'; // 当前支付方式Code
	}
	componentDidMount() {}
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
						isPreferredWalletSet: false, // 是否设为默认目标账户,
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
							this.props.thirdPartyPay(res, values.money, '银联支付');
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
		// Pushgtagdata(`Deposit`, 'Submit', 'Submit_Unionpay_Deposit');
	};
	goHome = () => {
		Cookie('isThird', null);
		clearInterval(this.timeTimer);
		Router.push('/');
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
		const { setting } = this.props.currDepositDetail;
		const {
			getFieldsError,
			getFieldValue,
			getFieldDecorator,
			setFieldsValue,
			setFields,
			getFieldError
		} = this.props.form;
		const { targetValue, bonusVal } = this.state;

		return (
			<React.Fragment>
				<div className="form-wrap">
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
				{/* 温馨提示 */}
				<div className="deposit-help-wrap">
					<h4>乐天使温馨提醒：</h4>
					<ul>
						<li>
							银联支付简易快捷，仅需两步即可完成：
							<ul>
								<li>a. 输入预存的金额提交</li>
								<li>b. 扫描二维码成功支付</li>
							</ul>
						</li>
						<li>银联支付将收取手续费。</li>
					</ul>
				</div>
			</React.Fragment>
		);
	}
}
export default createForm({ fieldNameProp: 'up' })(UP);

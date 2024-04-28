import React from 'react';
import Button from '@/components/View/Button';
import Input from '@/components/View/Input';
import { createForm } from 'rc-form';
import MoneyInput from './../MoneyInput';
import TargetAccount from './../TargetAccount';
import HostConfig from '@/server/Host.config';
import { CommonPostPay, PromoPostApplications } from '@/api/wallet';
import Toast from '@/components/View/Toast';
import Router from 'next/router';
const { LocalHost } = HostConfig.Config;

import { formatSeconds, Cookie, getE2BBValue } from '@/lib/js/util';

class QQ extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			targetValue: '', // 目标账户State值
			targetName: '', // 目标账户名称
			bonusVal: 0, // 可申请优惠Val值
			bonusName: '' // 可申请优惠名称
		};

		this.payTypeCode = 'QQ'; // 当前支付方式Code
	}

	payConfirm = (e) => {
		e.preventDefault();
		if (!this.submitBtnEnable()) return;
		if (typeof this.props.depositStatusCheck() === 'undefined') return; // 未完成真实姓名验证则呼出完善弹窗
		this.props.form.validateFields((err, values) => {
			if (!err) {
				const hide = Toast.loading();
				CommonPostPay(
					{
						methodcode: this.refs.Channeldefault.state.Channeldefault,
						accountHolderName: '',
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
						mgmtRefNo: 'Fun88Mobile',
						fileBytes: '',
						fileName: '',
						isMobile: true,
						isPreferredWalletSet: false, // 是否设为默认目标账户,
						isSmallSet: false,
						language: 'zh-cn',
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
							this.props.thirdPartyPay(res, values.money, 'QQ支付');
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
						}
					}
				);
			}
		});
		// Pushgtagdata(`Deposit`, 'Submit', 'Submit_QQwallet_Deposit');
	};

	goHome = () => {
		Cookie('isThird', null);
		clearInterval(this.timeTimer);
		Router.push('/');
	};

	submitBtnEnable = () => {
		//console.log(this.props.form.getFieldValue('money'));
		let errors = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		return this.props.form.getFieldValue('money') !== '' && !errors;
	};

	render() {
		let { setting } = this.props.currDepositDetail; // 当前支付方式的详情
		const {
			getFieldsError,
			getFieldValue,
			getFieldDecorator,
			setFieldsValue,
			setFields,
			getFieldError
		} = this.props.form;
		const { targetValue, bonusVal } = this.state;
		const moneyValue = parseInt(getFieldValue('money'));
		const selectedChannel = this.refs.Channeldefault?.state.Channeldefault; //所選支付渠道

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
				<div className="deposit-help-wrap">
					{!selectedChannel || selectedChannel !== "QQRP" && 
					<>		
						<h4>乐天使温馨提醒：</h4>
						<ul>
							<li>键入存款金额</li>
							<li>点击提交后，页面下方会自动生成二维码(此二维码仅本次有效)</li>
							<li>使用手机打开QQ，扫描二维码转至付款页面</li>
							<li>确保信息无误提交即可</li>
							<li>QQ支付到账时间为15分钟左右</li>
							<li>QQ支付不支持信用卡存款</li>
						</ul>
					</> }
					{selectedChannel === "QQRP" && 
					<>		
						<h4>乐天使温馨提醒：</h4>
						<ul>
							<li>{`首先登入您的QQ账号，打开【我的QQ钱包】>【全部应用】>【QQ红包】的【QQ面对面红包】`}</li>
							<li>在【QQ面对面红包】页面输入存款金额，点击确认之后将会生成二维码</li>
							<li>将面对面红包二维码进行截图/若无法成功截图，建议使用其他设备进行拍摄</li>
							<li>请记得在QQ红包支付渠道过程中，点击上传二维码截图以便顺利完成存款</li>
						</ul>
					</> }
			
				</div>
			</React.Fragment>
		);
	}
}
export default createForm({ fieldNameProp: 'qq' })(QQ);

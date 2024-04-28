import React from 'react';
import { createForm } from 'rc-form';
import Button from '@/components/View/Button';
import MoneyInput from './../MoneyInput';
import TargetAccount from './../TargetAccount';
import BankAccount from './../BankAccount';
import HostConfig from '@/server/Host.config';
import { CommonPostPay, PromoPostApplications } from '@/api/wallet';
import FinishStep from '../FinishStep';
import { formatSeconds, Cookie, getE2BBValue } from '@/lib/js/util';
const { LocalHost } = HostConfig.Config;
import Toast from '@/components/View/Toast';
import Router from 'next/router';
import Item from './../Item';

class BCM extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bankCodeState: '', // 充值银行Code值
			targetValue: '', // 目标账户State值
			targetName: '', // 目标账户名称
			bonusVal: 0, // 可申请优惠Val值
			bonusName: '' // 可申请优惠名称
		};

		this.payTypeCode = 'BCM'; // 当前支付方式Code
	}
	componentDidMount() {
		//console.log(this.props);
		let memberInfo = JSON.parse(localStorage.getItem('memberInfo'));
		this.setState({
			targetValue: memberInfo.preferWallet == undefined ? memberInfo.preferWallet : memberInfo.preferWallet
		});
	}

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
						//accountHolderName: this.depositName != null ? this.depositName : '',
						accountHolderName:
							this.depositName != null
								? this.depositName
								: JSON.parse(localStorage.getItem('memberInfo')).firstName,
						methodcode: this.refs.Channeldefault.state.Channeldefault,
						amount: values.money,
						charges: 0,
						bankName: this.state.bankCodeState,
						depositingBankAcctNum: '',
						depositingWallet: this.props.depositingWallet, // 目标账户Code
						domainName: LocalHost,
						isMobile: true,
						isPreferredWalletSet: false, // 是否设为默认目标账户
						isSmallSet: false,
						language: 'zh-cn',
						mgmtRefNo: 'Fun88Mobile',
						offlineDepositDate: '',
						offlineRefNo: '0',
						paymentMethod: 'BCM',
						refNo: '0',
						successUrl: LocalHost,
						transactionType: 'Deposit',
						blackBoxValue: getE2BBValue(),
						e2BlackBoxValue: getE2BBValue()
					},
					(res) => {
						hide();
						if (res.isSuccess) {
							res = res.result;
							this.props.thirdPartyPay(res, values.money, '快捷支付');
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
		// Pushgtagdata(`Deposit`, 'Submit', 'Submit_MobileCDC_Deposit');
	};
	goHome = () => {
		Cookie('isThird', null);
		clearInterval(this.timeTimer);
		Router.push('/');
	};

	submitBtnEnable = () => {
		let { banks, setting } = this.props.currDepositDetail;
		let errors = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let values = Object.values(this.props.form.getFieldsValue()).some((v) => v == '' || v == undefined);
		if (setting && setting.showDepositorNameField && !setting.prefillRegisteredName) {
			return !values && this.props.form.getFieldValue('money') !== '' && !errors && (banks && banks.length > 0);
		}
		if(banks?.length){
			return this.props.form.getFieldValue('money') !== '' && !errors && (banks && banks.length > 0);
		}
		return this.props.form.getFieldValue('money') !== '' && !errors;
	};
	render() {
		//console.log(this.props);
		let { setting, banks } = this.props.currDepositDetail; // 当前支付方式的详情
		const {
			getFieldsError,
			getFieldDecorator,
			getFieldValue,
			setFieldsValue,
			setFields,
			getFieldError
		} = this.props.form;
		// const { bcTypeList } = this.props;
		const { bankCodeState, targetValue, bonusVal } = this.state;

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

					<BankAccount
						keyName={[ 'name', 'code' ]}
						bankAccounts={banks}
						bankCodeState={bankCodeState}
						setBankCode={(v) => {
							this.setState({ bankCodeState: v });
						}}
						setting={setting}
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
					<h4>乐天使温馨提醒： </h4>
					<ul>
						<li>会员可使用您的银联卡，维萨卡(VISA)或万事达卡(MasterCard)进行存款。</li>
						<li>只需输入符合要求的存款金额，点击提交即可操作。</li>
						<li>到账时间通常约1-10分钟</li>
					</ul>
				</div>
			</React.Fragment>
		);
	}
}
export default createForm({ fieldNameProp: 'bc' })(BCM);

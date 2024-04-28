import Button from '@/components/View/Button';
import Input from '@/components/View/Input';
import { createForm } from 'rc-form';
import MoneyInput from './../MoneyInput';
import TargetAccount from './../TargetAccount';
import BankAccount from './../BankAccount';
import SecondStep from './SecondStep';
import FinishStep from '../FinishStep';
import { CommonPostPay, PromoPostApplications } from '@/api/wallet';
import HostConfig from '@/server/Host.config';
import { formatSeconds, Cookie, getE2BBValue } from '@/lib/js/util';
import React from 'react';
import Toast from '@/components/View/Toast';
import Item from './../Item';
import Router from 'next/router';
const { LocalHost } = HostConfig.Config;
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import Modal from '@/components/View/Modal';
import { realyNameReg } from '@/lib/SportReg';

class LB extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			Modalopen: false,
			bankCodeState: '', // 收款银行Code值
			depositMoney: 0, // 充值金额
			targetValue: '', // 目标账户State值
			targetName: '', // 目标账户名称
			bonusVal: 0, // 可申请优惠Val值
			bonusName: '', // 可申请优惠名称
			lbStep: 1, // 本银充值步骤
			remainingTime: '00:00' // 剩余时间
		};

		this.startCountDown = this.startCountDown.bind(this); // 第三步骤倒计时

		this.currBankAccount = {}; // 当前选中的收款银行账户信息（传递第二步骤需要）
		this.transactionId = ''; // 订单编号
		this.payTypeCode = 'LB'; // 当前支付方式Code
		this.depositName = null; // 存款人姓名

		this.goThirdStep = null; // 前往第三部的方法
		this.timeTimer = null; // 本银充值第三步骤倒计时Timer
	}
	componentDidMount() {
		// 第三步骤倒计时记录
		if (Cookie('isThird') === 'true') {
			this.setState({ lbStep: 3 });
		}
	}
	componentDidUpdate(prevProps, prevState) {
		// 本银充值第三步骤记录
		if (prevState.lbStep !== this.state.lbStep) {
			if (this.state.lbStep === 2) {
				this.startCountDown('islbSecond');
			}
			this.state.lbStep === 3 && this.startCountDown();

			let notFirsStep = this.state.lbStep !== 1;
			if (notFirsStep) {
				this.props.setBackEvent(() => {
					this.setState({ lbStep: this.state.lbStep - 1 });
				});
				this.props.setBarTitle('银行转账');
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
	goLbHome = () => {
		Cookie('isThird', null);
		clearInterval(this.timeTimer);
		this.setState({ lbStep: 1 });
		this.depositName = null;
	};
	goHome = () => {
		Cookie('isThird', null);
		clearInterval(this.timeTimer);
		Router.push('/');
		this.depositName = null;
	};
	startCountDown() {
		clearInterval(this.timeTimer);
		this.setState({ remainingTime: '00:00' });
		const depositDateTime = Cookie('dateTime').replace('-', '/').replace('-', '/');
		// 900millisecond = 15minute * 60second
		let lastSeconds = 1800 - (new Date().getTime() - new Date(depositDateTime).getTime()) / 1000;
		depositDateTime !== null && depositDateTime !== ''
			? (this.timeTimer = setInterval(() => {
					if (lastSeconds <= 0) {
						this.setState({ lbStep: 1 });
						Cookie('isThird', null);
						clearInterval(this.timeTimer);
					}
					this.setState({
						remainingTime: formatSeconds(lastSeconds--)
					});
				}, 1000))
			: Cookie('isThird', null);
	}
	goSecondStep = (e) => {
		//console.log('goSecondStep');
		//console.log(this.state.bankCodeState);
		// e.preventDefault();

		if (!this.submitBtnEnable()) return;
		console.log(this.props);
		const Paybank =
			this.props.currDepositDetail.bankAccounts &&
			this.props.currDepositDetail.bankAccounts.find((v) => v.bankCode === this.state.bankCodeState);
		this.currBankAccount = Paybank; // 第二步收款银行数据初始化

		// if (typeof this.props.depositStatusCheck(this.payTypeCode, this.state.bankCodeState) === 'undefined')
		// 	if (Paybank == undefined) {
		// 		// return; // 未完成真实姓名验证则呼出完善弹窗
		// 		//console.log('正在维护，请选择其他存款方式。');
		// 	}
		this.depositName = this.props.form.getFieldValue('lbRealName');
		if (this.depositName === this.getMaskedText(this.props.localMemberName.length)) {
			this.depositName = this.props.localMemberName;
		}
		//console.log(this.state);
		this.props.form.validateFields((err, values) => {
			console.log(err);
			if (!err) {
				console.log(Paybank);

				const hide = Toast.loading();
				CommonPostPay(
					{
						domainName: LocalHost,
						bonusId: this.state.bonusVal,
						isMobile: true,
						IsSmallSet: false,
						MemberCode: this.props.memberInfo.memberCode,
						RequestedBy: this.props.memberInfo.memberCode,
						amount: values.money,
						CurrencyCode: 'CNY',
						transactionType: '1',
						charges: 0.0,
						accountNumber: '0', //帐号
						accountHolderName:
							this.depositName != null
								? this.depositName
								: JSON.parse(localStorage.getItem('memberInfo')).firstName,
						//accountHolderName: this.depositName != null ? this.depositName : this.props.localMemberName, //账户持有人姓名
						bankName: this.state.bankCodeState, //银行名
						city: 'city',
						province: 'province',
						branch: 'branch',
						SWIFTCode: 'Fun88Mobile',
						paymentMethod: this.payTypeCode,
						mgmtRefNo: 'Fun88Mobile',
						refNo: '0',
						offlineRefNo: '0',
						depositingBankAcctNum: Paybank.accountNo
							? Paybank.accountNo.substring(Paybank.accountNo.length - 6)
							: '',
						merchantType: 1, // 1 call smilepay, 9 hide smilepay
						blackBoxValue: getE2BBValue(),
						e2BlackBoxValue: getE2BBValue()
					},
					(res) => {
						hide();
						if (res.isSuccess) {
							res = res.result;
							const okGoNext = () => {
								this.transactionId = res.transactionId;
								Cookie('dateTime', res.submittedAt.split('T').join(' ').split('.')[0], { expires: 15 });
								this.setState({
									lbStep: 2,
									depositMoney: res.uniqueAmount
								});
								this.props.bonusApplication(res);
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
												Toast.success('优惠申请成功');
												// Router.push(
												//     `/Deposit/promostatus/?id=${bonusVal}&wallet=${this.props
												//         .depositingWallet}&value=${values.money}`
												// );
											}
										}
									);
								}
							};

							if (res.returnedBankDetails) {
								//以返回的銀行卡為主，需要轉一下字段名
								this.currBankAccount = {
									AccountHolderName: res.returnedBankDetails.accountHolderName,
									BankName: res.returnedBankDetails.bankName,
									AccountNo: res.returnedBankDetails.accountNumber,
									Province: res.returnedBankDetails.province,
									City: res.returnedBankDetails.city,
									Branch: res.returnedBankDetails.branch
								};
							}

							if (res.isPaybnbDepositWithDifferentRequestedBank == true) {
								Modal.info({
									className: 'LB-Modal',
									icon: null,
									centered: true,
									type: 'confirm',
									btnBlock: false,
									btnReverse: false,
									title: '温馨提醒',
									content: '抱歉，您选择的银行暂不可用，建议您使用其他收款账户。',
									okText: '好的',
									cancelText: '不用了',
									onOk: () => {
										okGoNext();
									},
									onCancel: () => {
										const depositId = res.transactionId;
										fetchRequest(
											ApiPort.POSTCancelLBDeposit + 'depositId=' + depositId + '&',
											'POST'
										)
											.then((resCancel) => {
												if (!resCancel.isSuccess) {
													//console.log('cancel deposit notSuccess:', depositId, resCancel);
												}
											})
											.catch((error) => {
												//console.log('cancel deposit error:', depositId, error);
											});
									}
								});
							} else if (res.returnedBankDetails && res.returnedBankDetails.isSmileLBAvailable == false) {
								Modal.info({
									className: 'LB-Modal',
									icon: null,
									centered: true,
									type: 'confirm',
									btnBlock: false,
									btnReverse: false,
									title: '温馨提醒',
									content: '抱歉，您选择的银行暂不可用，建议您使用其他收款账户。​',
									okText: '好的',
									cancelText: '不用了',
									onOk: () => {
										okGoNext();
										this.setState({
											Modalopen: true
										});
									},
									onCancel: () => {}
								});
							} else {
								okGoNext();
							}
						} else {
							Toast.error(res.errorMessage);
						}
					}
				);
			}
		});
		// Pushgtagdata(`Deposit_Nav`, 'Next', 'LocalBank');
	};

	submitBtnEnable = () => {
		let { bankAccounts } = this.props.currDepositDetail;
		let errors = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let values = Object.values(this.props.form.getFieldsValue()).some((v) => v == '' || v == undefined);
		return !values && (bankAccounts && bankAccounts.length > 0) && !errors;
	};

	getMaskedText = (length) => {
		return '*'.repeat(length);
	};

	render() {
		const { bankAccounts, setting } = this.props.currDepositDetail; // 当前支付方式的详情
		const { getFieldsError, getFieldDecorator, getFieldValue, getFieldError, setFieldsValue } = this.props.form;
		const { localMemberName } = this.props;
		console.log(this.props);
		const { bankCodeState, targetName, targetValue, depositMoney, bonusVal, lbStep, remainingTime } = this.state;
		return (
			<React.Fragment>
				{/* 第一步骤 */}
				<div className="form-wrap" style={{ display: lbStep === 1 ? 'block' : 'none' }}>
					<div className="modal-prompt-info">请确保“存款人姓名”和“存入金额”与您本人账户姓名和转入的金额保持一致以便及时到账！</div>
					<MoneyInput
						getFieldDecorator={getFieldDecorator}
						payTypeCode={this.payTypeCode}
						payMethodList={this.props.payMethodList}
						setCurrDepositDetail={this.props.setCurrDepositDetail}
						setting={setting}
						setFieldsValue={setFieldsValue}
						getFieldError={getFieldError}
						currDepositDetail={this.props.currDepositDetail}
					/>

					<BankAccount
						labelName="存款银行"
						keyName={[ 'bankName', 'bankCode' ]}
						bankAccounts={bankAccounts}
						bankCodeState={bankCodeState}
						setBankCode={(v) => {
							//console.log(v);
							this.setState({ bankCodeState: v });
						}}
						setting={setting}
					/>

					<label className="name-deposit-lb">存款人姓名</label>
					<Item errorMessage={getFieldError('lbRealName')}>
						{getFieldDecorator('lbRealName', {
							initialValue: this.getMaskedText(
								this.props.localMemberName ? this.props.localMemberName.length : 0
							),
							//initialValue: this.props.localMemberName,
							rules: [
								{ required: true, message: '请输入全名' },
								{
									validator: (rule, value, callback) => {
										if (value && value.indexOf('*') == -1 && !realyNameReg.test(value)) {
											callback('请输入正确格式的名字。');
										}
										callback();
									}
								}
							]
						})(<Input size="large" placeholder="存款人姓名" />)}
					</Item>
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
					<div className={`btn-wrap depo-btn-submit ${!this.submitBtnEnable() ? 'btn-disable' : ''}`}>
						<Button size="large" type="primary" onClick={this.goSecondStep}>
							提交
						</Button>
					</div>
				</div>
				{/* 第二步骤 */}
				<SecondStep
					RequestedBy={this.props.memberInfo && this.props.memberInfo.memberCode}
					depositingWallet={this.props.depositingWallet}
					currBankAccount={this.currBankAccount} // 当前选中的银行信息
					transactionId={this.transactionId} // 当前生成的订单编号
					lbStep={lbStep}
					setLbStep={(v) => {
						this.setState({ lbStep: v, Modalopen: false });
						if (v == 1) {
							this.props.setCurrentPayMethod(this.props.payMethodList[0].code);
							this.props.setShowPayMethodsList(true);
						}
					}}
					startCountDown={this.startCountDown}
					remainingTime={remainingTime}
					setLoading={this.props.setLoading}
					targetName={targetName}
					depositMoney={depositMoney}
					localMemberName={this.depositName}
					setGoThirdStep={(v) => {
						this.goThirdStep = v;
					}}
					Modalopen={this.state.Modalopen}
				/>
				{/* 第三步骤 */}
				{lbStep === 3 && (
					<FinishStep
						transactionId={this.transactionId}
						depositMoney={depositMoney}
						goHome={this.goHome}
						time="30:00"
						callbackToHome={this.props.callbackToHome}
						lbStep={lbStep}
					/>
				)}

				{/* 温馨提示 */}
				<div className="deposit-help-wrap" style={{ display: lbStep !== 3 ? 'block' : 'none' }}>
					<h4>乐天使温馨提醒：</h4>
					<ul>
						<li>请务必按照系统提示的银行及金额进行存款，否则您的存款将无法及时到账。</li>
						<li>存款后，点击【我已成功存款】耐心等待到账，为了保证及时到账，请勿重复提交存款信息。</li>
					</ul>
				</div>
			</React.Fragment>
		);
	}
}
export default createForm({ fieldNameProp: 'lb' })(LB);

import React from 'react';
import { ReactSVG } from '@/components/View/ReactSVG';
import Button from '@/components/View/Button';
import Input from '@/components/View/Input';
import { createForm } from 'rc-form';
import MoneyInput from './../MoneyInput';
import TargetAccount from './../TargetAccount';
import BankAccount from './../BankAccount';
import SecondStep from './SecondStep';
import { CommonPostPay, PromoPostApplications } from '@/api/wallet';
import HostConfig from '@/server/Host.config';
import { formatSeconds, Cookie, getE2BBValue } from '@/lib/js/util';
import Toast from '@/components/View/Toast';
import { Fragment } from 'react';
import FinishStep from '../FinishStep';
import Router from 'next/router';
import Modal from '@/components/View/Modal';
const { LocalHost } = HostConfig.Config;

class WCLB extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
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
		this.payTypeCode = 'WCLB'; // 当前支付方式Code

		this.timeTimer = null; // 本银充值第三步骤倒计时Timer
	}
	componentDidMount() {
		// 第三步骤倒计时记录
		// if (Cookie('isWCThird') === 'true') {
		// 	this.setState({ lbStep: 3 });
		// }
	}
	componentDidUpdate(prevProps, prevState) {
		// 本银充值第三步骤记录
		if (prevState.lbStep !== this.state.lbStep) {
			this.state.lbStep === 3 && this.startCountDown();

			let notFirsStep = this.state.lbStep !== 1;
			if (notFirsStep) {
				this.props.setBackEvent(() => {
					this.setState({ lbStep: this.state.lbStep - 1 });
				});
				this.props.setBarTitle('微信转账');
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
		Cookie('isWCThird', null);
		clearInterval(this.timeTimer);
		this.setState({ lbStep: 1 });
	};
	goHome = () => {
		Cookie('isWCThird', null);
		clearInterval(this.timeTimer);
		Router.push('/');
	};
	startCountDown() {
		clearInterval(this.timeTimer);
		const depositDateTime = Cookie('dateTime').replace('-', '/').replace('-', '/');
		// 900millisecond = 15minute * 60second
		let lastSeconds = 900 - (new Date().getTime() - new Date(depositDateTime).getTime()) / 1000;
		depositDateTime !== null && depositDateTime !== ''
			? (this.timeTimer = setInterval(() => {
					if (lastSeconds <= 0) {
						this.setState({ lbStep: 1 });
						Cookie('isWCThird', null);
						clearInterval(this.timeTimer);
					}
					this.setState({ remainingTime: formatSeconds(lastSeconds--) });
				}, 1000))
			: Cookie('isWCThird', null);
	}
	goSecondStep = (e) => {
		e.preventDefault();
		if (!this.submitBtnEnable()) return;
		const Paybank =
			this.props.currDepositDetail.bankAccounts &&
			this.props.currDepositDetail.bankAccounts.find((v) => v.bankCode === this.state.bankCodeState);
		this.currBankAccount = Paybank; // 第二步收款银行数据初始化

		if (typeof this.props.depositStatusCheck(this.payTypeCode, this.state.bankCodeState) === 'undefined') return; // 未完成真实姓名验证则呼出完善弹窗
		if (Paybank == undefined) {
			return Toast.error('正在维护，请选择其他存款方式。');
		}

		this.props.form.validateFields((err, values) => {
			if (!err) {
				const hide = Toast.loading();
				CommonPostPay(
					{
						accountHolderName: Paybank.accountHolderName, //账户持有人姓名
						accountNumber: Paybank.accountNo, //帐号
						amount: values.money,
						bankName: Paybank.bankName, //银行名
						city: 'city',
						province: 'province',
						branch: 'branch',
						language: 'zh-cn',
						paymentMethod: this.payTypeCode,
						charges: 0,
						transactionType: 'Deposit',
						domainName: LocalHost,
						isMobile: false,
						isSmallSet: false,
						refNo: '0',
						offlineDepositDate: '',
						mgmtRefNo: 'Fun88Mobile',
						transferType: Paybank.supportedBankInTypes[0], // 收款账户支持信息
						offlineRefNo: '0',
						depositingBankAcctNum: Paybank.accountNo.substring(Paybank.accountNo.length - 6),
						isPreferredWalletSet: false, // 是否设为默认目标账户
						// isMobile: false,
						depositingWallet: this.props.depositingWallet, // 目标账户Code
						cardName: '',
						cardNumber: '',
						cardPIN: '',
						cardExpiryDate: '',
						bonusId: this.state.bonusVal,
						bonusCoupon: values.bonusCode || '',
						couponText: '',
						fileBytes: '',
						fileName: '',
						secondStepModel: null,
						successUrl: LocalHost,
						blackBoxValue: getE2BBValue(),
						e2BlackBoxValue: getE2BBValue()
					},
					(res) => {
						hide();
						if (res.isSuccess) {
							res = res.result;
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
							if (res.returnedBankDetails && res.returnedBankDetails.isSmileLBAvailable == false) {
								Modal.info({
									className: 'ModalErrorShow LB-Modal',
									icon: null,
									centered: true,
									type: 'confirm',
									btnBlock: false,
									btnReverse: false,
									maskClosable: false,
									title: '错误提示',
									content: <div className='errorTxt'>很抱歉，目前暂无可存款的银行。此次交易将被取消，请尝试其他存款方式。</div>,
									okText: '重新提交',
									onOk: () => {
										location.reload();
									},
									onCancel: () => {
										location.reload();
									}
								});
							}
						}
					}
				);
			}
		});
		// Pushgtagdata(`Deposit_Nav`, 'Next', 'LocalbankWechat');
	};
	submitBtnEnable = () => {
		let { bankAccounts } = this.props.currDepositDetail;
		let errors = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		return this.props.form.getFieldValue('money') !== '' && !errors && (bankAccounts && bankAccounts.length > 0);
	};
	render() {
		const { bankAccounts, setting } = this.props.currDepositDetail; // 当前支付方式的详情
		const { getFieldsError, getFieldDecorator, getFieldValue, getFieldError, setFieldsValue } = this.props.form;
		const { bankCodeState, targetName, targetValue, depositMoney, bonusVal, lbStep, remainingTime } = this.state;
		{
			//console.log(this.props);
		}
		return (
			<React.Fragment>
				{/* 第一步骤 */}
				<div className="form-wrap" style={{ display: lbStep === 1 ? 'block' : 'none' }}>
					<MoneyInput
						getFieldDecorator={getFieldDecorator}
						payTypeCode={this.payTypeCode}
						payMethodList={this.props.payMethodList}
						setCurrDepositDetail={this.props.setCurrDepositDetail}
						setting={setting}
						getFieldError={getFieldError}
						setFieldsValue={setFieldsValue}
						currDepositDetail={this.props.currDepositDetail}
					/>

					<BankAccount
						keyName={[ 'bankName', 'bankCode' ]}
						bankAccounts={bankAccounts}
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
							<Button size="large" type="primary" onClick={this.goSecondStep}>
								提交
							</Button>
						</div>
					</div>
				</div>
				{/* 第二步骤 */}
				{console.log(this.state)}
				<SecondStep
					currBankAccount={this.currBankAccount} // 当前选中的银行信息
					transactionId={this.transactionId} // 当前生成的订单编号
					lbStep={lbStep}
					setLbStep={(v) => {
						this.setState({ lbStep: v });
					}}
					setLoading={this.props.setLoading}
					bonusName={this.state.bonusName}
					targetName={targetName}
					depositMoney={depositMoney}
					remainingTime={remainingTime}
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
				{lbStep === 1 && (
					<div className="deposit-help-wrap">
						<h4>乐天使温馨提醒：</h4>
						<ul>
							<li>每日晚上10:00PM-凌晨1:00AM(GMT+)将进行列行维修，期间建议您使用其他存款方式。</li>
							<li>请务必按照系统提示的金额进行存款，否则您的存款将无法及时到账。</li>
							<li>刹那迟疑，后会无期！微信转账免手续费</li>
						</ul>
					</div>
				)}
			</React.Fragment>
		);
	}
}
export default createForm({ fieldNameProp: 'wclb' })(WCLB);

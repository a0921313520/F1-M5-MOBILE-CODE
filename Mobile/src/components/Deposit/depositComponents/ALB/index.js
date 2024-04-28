/*
 * @Author: Alan
 * @Date: 2022-01-22 14:20:21
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-09 16:32:55
 * @Description: ALB存款
 * @FilePath: \Mobile\src\components\Deposit\depositComponents\ALB\index.js
 */
import { createForm } from 'rc-form';
import React from 'react';
import Modal from '@/components/View/Modal';
import Button from '@/components/View/Button';
import SecondStep from './SecondStep';
import MoneyInput from './../MoneyInput';
import TargetAccount from './../TargetAccount';
import BankAccount from './../BankAccount';
import { Cookie, formatSeconds, dateFormat, getE2BBValue } from '@/lib/js/util';
import HostConfig from '@/server/Host.config';
import { CommonPostPay, PromoPostApplications } from '@/api/wallet';
import Toast from '@/components/View/Toast';
import Item from './../Item';
import { Fragment } from 'react';
import FinishStep from '../FinishStep';
import Router from 'next/router';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';

class ALB extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bankCodeState: '', // 收款银行Code值
			targetValue: '', // 目标账户State值
			targetName: '', // 目标账户名称
			bonusVal: 0, // 可申请优惠Val值
			bonusName: '', // 可申请优惠名称
			showType: Cookie('ALBtype') || '2', // 显示方式（二维码显示、银行账户显示）
			lbStep: 1, // 支付宝转账步骤
			remainingTime: '00:00', // 剩余时间
			paymentMethodVisible: false
		};

		this.startCountDown = this.startCountDown.bind(this); // 第三步骤倒计时
		this.changeShowType = this.changeShowType.bind(this); // 更换支付宝转账订单显示类型

		this.payTypeCode = 'ALB'; // 当前支付方式Code
		this.collectionInfo = JSON.parse(Cookie('isAlbSecond')); // 第二步骤所需数据初始化
		this.goThirdStep = null; // 前往第三部的方法
	}
	componentDidMount() {
		// // 第三步骤倒计时记录
		// Cookie('isAlbThird') === 'true' && this.setState({ lbStep: 3 });
		// // 第二步骤倒计时记录
		// this.collectionInfo !== null && this.setState({ lbStep: 2 });
	}
	componentDidUpdate(prevProps, prevState) {
		// 支付宝转账第三步骤记录
		if (prevState.lbStep !== this.state.lbStep) {
			if (this.state.lbStep === 2) {
				this.startCountDown('isAlbSecond');
			}
			this.state.lbStep === 3 && this.startCountDown('isAlbThird');

			let notFirsStep = this.state.lbStep !== 1;
			if (notFirsStep) {
				this.props.setBackEvent(() => {
					this.setState({ lbStep: this.state.lbStep - 1 });
				});
				this.props.setBarTitle('支付宝转账');
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
		Cookie('isAlbThird', null);
		clearInterval(this.timeTimer);
		this.setState({ lbStep: 1, paymentMethodVisible: false });
	};
	goHome = () => {
		Cookie('isAlbThird', null);
		clearInterval(this.timeTimer);
		Router.push('/');
	};
	startCountDown(stepName) {
		clearInterval(this.timeTimer);
		this.setState({ remainingTime: '00:00' });
		const depositDateTime = Cookie('dateTime').replace('-', '/').replace('-', '/');
		// 900millisecond = 15minute * 60second
		const timeCount = this.state.lbStep === 3 ? 900 : this.state.showType === '1' ? 300 : 1800;
		let lastSeconds = timeCount - (new Date().getTime() - new Date(depositDateTime).getTime()) / 1000;
		depositDateTime !== null && depositDateTime !== ''
			? (this.timeTimer = setInterval(() => {
					//console.log(lastSeconds);
					//console.log(this.state.lbStep);
					//console.log(this.state.showType);
					if (lastSeconds <= 0) {
						if (this.state.lbStep === 2 && this.state.showType === '1') {
							Modal.info({
								icon: null,
								centered: true,
								type: 'confirm',
								btnBlock: true,
								btnReverse: true,
								title: '您是否已经成功？',
								okText: '是，我已经成功存款',
								cancelText: '否，我想提交新交易',
								onOk: () => {
									this.goThirdStep();
									this.GETALBStatus(true);
									// Pushgtagdata(`Deposit`, 'Submit', 'Submit_LocalbankAlipay_Deposit');
								},
								onCancel: () => {
									// Cookie('dateTime', dateFormat(), {
									// 	expires: 30
									// });
									// this.setState({ showType: '2' }, () => {
									// 	this.startCountDown('isAlbSecond');
									// });
									// this.GETALBStatus(false);
									location.reload();
								}
							});
						} else {
							this.state.lbStep === 3 || (this.state.lbStep === 2 && this.setState({ lbStep: 1 }));
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
	changeShowType(value) {
		Cookie('ALBtype', value);
		this.setState({ showType: value }, () => this.payConfirm());
	}
	payConfirm = (e) => {
		// e.preventDefault();
		if (!this.submitBtnEnable()) return;

		// 充值前置条件判定
		if (typeof this.props.depositStatusCheck(this.payTypeCode, this.state.bankCodeState) === 'undefined') return;

		const Paybank = this.props.currDepositDetail.bankAccounts.find((v) => v.bankLogID === this.state.bankCodeState);

		this.props.form.validateFields((err, values) => {
			//console.log(values);
			if (!err) {
				const hide = Toast.loading();
				CommonPostPay(
					{
						accountHolderName: this.props.localMemberName, // 账户持有人姓名
						accountNumber: '0', //帐号
						amount: values.money,
						bankName: Paybank.bankName, //银行名
						language: 'zh-cn',
						paymentMethod: this.payTypeCode,
						charges: 0,
						transactionType: 'Deposit',
						domainName: HostConfig.Config.LocalHost,
						isMobile: true,
						isSmallSet: false,
						refNo: '0',
						offlineDepositDate: '',
						mgmtRefNo: 'Fun88Mobile',
						offlineRefNo: '0',
						BankLogID: Paybank.bankLogID,
						depositingBankAcctNum: Paybank.accountNo,
						isPreferredWalletSet: false,
						// isMobile: true,
						depositingWallet: this.props.depositingWallet, // 目标账户Code
						bonusId: this.state.bonusVal,
						bonusCoupon: values.bonusCode || '',
						secondStepModel: null,
						successUrl: HostConfig.Config.LocalHost,
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

						if (res.isSuccess) {
							res = res.result;

							Cookie('dateTime', res.submittedAt.split('T').join(' ').split('.')[0], { expires: 30 });
							Cookie('isAlbSecond', JSON.stringify(res), {
								expires: 30
							});
							this.collectionInfo = res;
							if (this.state.showType == '1') {
								this.GETALBStatus(true);
							} else {
								this.GETALBStatus(false);
							}
							this.setState({
								lbStep: 2,
								paymentMethodVisible: false
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
									content: <div className="errorTxt">很抱歉，目前暂无可存款的银行。此次交易将被取消，请尝试其他存款方式。​</div>,
									okText: '重新提交',
									onOk: () => {
										location.reload();
									},
									onCancel: () => {
										location.reload();
									}
								});
							}
						} else {
							this.setState({
								paymentMethodVisible: false
							});
						}
					}
				);
			}
		});
		// Pushgtagdata(`Deposit`, 'Submit', 'Submit_LocalbankAlipay_Deposit');
	};
	submitBtnEnable = () => {
		let { bankAccounts, setting } = this.props.currDepositDetail;
		let errors = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		return this.props.form.getFieldValue('money') !== '' && !errors && (bankAccounts && bankAccounts.length > 0);
	};
	showPayMethodOptions = () => {
		this.setState({
			paymentMethodVisible: true
		});
		// Pushgtagdata(`Deposit`, 'Submit', 'Submit_LocalbankAlipay_Deposit');
	};
	GETALBStatus = (status) => {
		const memberCode = localStorage.getItem('memberCode');
		const transactionId = this.collectionInfo !== null ? this.collectionInfo.transactionId : '';
		const url = `${ApiPort.ALBStatus}depositID=${transactionId}&isQR=${status}&`;
		fetchRequest(url, 'GET')
			.then((res) => {
				//console.log('成功');
			})
			.catch((error) => {
				//console.log(error);
			});
	};
	render() {
		const { bankAccounts, setting } = this.props.currDepositDetail; // 当前支付方式的详情
		//console.log(this.props);
		const { getFieldsError, getFieldDecorator, getFieldValue, getFieldError } = this.props.form;
		const {
			remainingTime,
			bankCodeState,
			showType,
			targetValue,
			bonusVal,
			lbStep,
			paymentMethodVisible
		} = this.state;
		//console.log(this.state);
		return (
			<React.Fragment>
				{/* 第一步骤 */}
				<div
					className="form-wrap"
					style={{
						display: lbStep === 1 ? 'block' : 'none',
						backgroundColor: paymentMethodVisible ? 'initial' : '#fff'
					}}
				>
					<div className={`${!paymentMethodVisible ? 'ALB_block_1' : 'ALB_block_hide'}`}>
						<MoneyInput
							getFieldDecorator={getFieldDecorator}
							payTypeCode={this.payTypeCode}
							getFieldValue={getFieldValue}
							getFieldError={getFieldError}
							payMethodList={this.props.payMethodList}
							setCurrDepositDetail={this.props.setCurrDepositDetail}
							setting={setting}
							currDepositDetail={this.props.currDepositDetail}
						/>

						<BankAccount
							labelName="收款银行"
							keyName={[ 'bankName', 'bankLogID' ]}
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
								<Button size="large" type="primary" onClick={this.showPayMethodOptions}>
									提交
								</Button>
							</div>
						</div>
					</div>

					<div
						className={`${paymentMethodVisible
							? 'paymentMethod-wrap ALB_block_1'
							: ' paymentMethod-wrap ALB_block_hide'}`}
					>
						<div className="paymentMethod-amount">
							<div className="amount-title">存款金額</div>
							<div className="amount-number">
								<span className="amount-icon">￥</span>
								{this.props.form.getFieldValue('money')}
							</div>
						</div>
						<div className="paymentMethod-options">
							<div className="options-notice">转账时请必须转入系统生成的金额,请选择以下方式继续支付.</div>
							<div className="options-btns">
								<div
									className="options-btn-1"
									onClick={() => {
										this.changeShowType('2');
									}}
								>
									显示银行账户
								</div>
								<div
									className="options-btn-2"
									onClick={() => {
										this.changeShowType('1');
									}}
								>
									显示二维码
								</div>
							</div>
						</div>
					</div>
				</div>
				{/* 第二步骤 */}
				<SecondStep
					lbStep={lbStep}
					showType={showType}
					startCountDown={this.startCountDown}
					setLbStep={(v) => {
						this.setState({ lbStep: v });
					}}
					transactionId={this.collectionInfo !== null ? this.collectionInfo.transactionId : ''}
					setLoading={this.props.setLoading}
					collectionInfo={this.collectionInfo}
					remainingTime={remainingTime}
					setGoThirdStep={(v) => {
						this.goThirdStep = v;
					}}
					GETALBStatus={this.GETALBStatus}
				/>
				{/* 第三步骤 */}
				{lbStep === 3 && (
					<FinishStep
						transactionId={this.collectionInfo !== null ? this.collectionInfo.transactionId : ''}
						depositMoney={this.collectionInfo !== null ? this.collectionInfo.uniqueAmount : ''}
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
							<li>存款后，点击【我已成功存款】耐心等待到账，为了保证及时到账，请勿重复提交存款信息。</li>
							<li>请务必按照系统提示的银行及金额进行存款，否则您的存款将无法及时到账。</li>
						</ul>
					</div>
				)}
			</React.Fragment>
		);
	}
}
export default createForm({ fieldNameProp: 'alb' })(ALB);

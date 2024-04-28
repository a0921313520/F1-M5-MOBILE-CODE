import React from 'react';
import Button from '@/components/View/Button';
import { createForm } from 'rc-form';
import MoneyInput from './../MoneyInput';
import TargetAccount from './../TargetAccount';
import BankAccount from './../BankAccount';
import HostConfig from '@/server/Host.config';
import { CommonPostPay, CommonPostConfirmPay, PromoPostApplications } from '@/api/wallet';
import SecondStep from './SecondStep';
import FinishStep from '../FinishStep';
import { formatSeconds, Cookie, getE2BBValue } from '@/lib/js/util';
const { LocalHost } = HostConfig.Config;
import Modal from '@/components/View/Modal';
import Toast from '@/components/View/Toast';
import Router from 'next/router';
import moment from 'moment';
import { withBetterRouter } from '@/lib/js/withBetterRouter';

const padLeft = (str, length) => {
	if (str.length >= length) return str;
	else return padLeft('0' + str, length);
};
class PPB extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			thisStep: 1, //充值步驟
			bankCodeState: '', // 充值银行Code值
			targetValue: '', // 目标账户State值
			targetName: '', // 目标账户名称
			amount: null, //金額
			bonusVal: 0, // 可申请优惠Val值
			bonusName: '', // 可申请优惠名称
			ModalOKOpen: false, //已獲取 支付數據 彈窗
			transactionId: '', //訂單號(已獲取 支付數據 彈窗 使用)
			ModalErrorOpen: false, //無法獲取 支付數據 彈窗
			ModalTimeoutOpen: false, //5分倒計時結束 彈窗
			countDownMinute: null, //倒計時 分
			countDownSecond: null, //倒計時 秒
			timeOutMin: '',
			timeOutSec: '',
			totalTimeoutSec: ''
		};

		this.payTypeCode = 'PPB'; // 当前支付方式Code
		this.submitTime = null; //用戶提交時間
		this.targetTime = null; //過期時間
		this.countDownTickerHandle = null; //每秒觸發一次，用來倒計時 句柄
		this.countDownMoadlOKHandle = null; //提醒彈窗的1分倒計時句柄
		this.postPayResult = null; //調用支付接口的返回值
		this.channelReload = null; //重新加載(getDetail)選中的渠道
	}
	componentDidMount() {
		//====== debug用 =========
		// const res = JSON.parse('{"isSuccess":true,"transactionId":"CNY202203224710104","errorMessage":"","redirectUrl":"<Html> \\n    <Head> \\n        <Body> \\n            <Form name=\'SendForm\' method=\'get\' action=\'https://uat.sone88.com/order/UHJvdmlkZXJSZXN1bHQ6RE1XRUwwMUNOMjIzMjIwNFA2MTM%3d?traceId=0HMGB3DEFQ0QB00000003\' target=\'_self\'> \\n            </Form> \\n            <script language=\'javascript\'type=\'text/JavaScript\'> \\n                SendForm.submit(); \\n            </script> \\n        </Body> \\n    </Head> \\n</Html> \\n","successBonusId":"","warnings":[],"uniqueAmount":100.0,"submittedAt":"2022-03-22T20:15:12.9675683+08:00","isQR":false,"isPaybnbDepositWithDifferentRequestedBank":false,"showVendorBank":true,"vendorDepositBankDetails":{"bankCode":"","bankName":"湖南宜章农业银行","bankAccountNumber":"6228480819458655076","bankAccountName":"柳继辉","bankProvince":"","bankCity":"","bankBranch":"","pgRemark":"","transferAmount":99.97},"vendorDepositBankDetailsQRLink":"http://member.stagingp4.fun88.biz/CN/static/Finance/Deposit/BankDetails.htm?token=5dafeb55-0fee-434c-a8d4-deb530d1c9e4"}')
		// this.postPayResult = res;
		// if (res.vendorDepositBankDetailsQRLink) {
		// 	this.submitTime = moment();
		// 	this.targetTime = this.submitTime.clone().add(5,'minutes');
		// 	const diffSeconds = this.targetTime.diff(moment(),'seconds');
		// 	if (diffSeconds > 0) {
		// 		this.countDownTickerHandle = setInterval(this.countDown, 1000); //啟動倒計時器
		//
		// 		//打開彈窗並更新剩餘時間
		// 		const duration = moment.duration(diffSeconds, 'seconds');
		// 		this.setState({
		// 			transactionId: res.transactionId,
		// 			countDownMinute: padLeft(duration.minutes()+'',2),
		// 			countDownSecond: padLeft(duration.seconds()+'',2),
		// 		})
		// 	} else {
		// 		console.log('======diffSeconds',diffSeconds);
		// 		//倒計時不足 視為失敗
		// 		//this.setState({ModalErrorOpen: true}); //展示彈窗
		// 	}
		// }
		//this.goToStep2();
		//====== debug用 =========

		const { query } = this.props.router;

		//PPB刷新判斷 需求：在step2頁面刷新後，仍返回原頁面
		if (query.PPB && query.PPB == 2) {
			console.log('======PPB didmount with PPB=2');
			const jsonCacheData = localStorage.getItem('Deposit_PPB_Step2_Cache');
			let showStep2 = false;
			if (jsonCacheData) {
				const cacheData = JSON.parse(jsonCacheData);
				if (cacheData && cacheData.res && cacheData.targetTime) {
					const targetTime = moment(cacheData.targetTime);
					const diffSeconds = targetTime.diff(moment(), 'seconds');
					showStep2 = diffSeconds > 0;
				}

				if (showStep2) {
					//處理數據並展示step2頁面
					this.postPayResult = cacheData.res;
					this.submitTime = moment(cacheData.submitTime);
					this.targetTime = moment(cacheData.targetTime);
					const diffSeconds = this.targetTime.diff(moment(), 'seconds');
					if (diffSeconds > 0) {
						this.countDownTickerHandle = setInterval(this.countDown, 1000); //啟動倒計時每秒更新

						//刷新後不開彈窗
						// this.countDownMoadlOKHandle = setTimeout(() => {
						// 	this.goToStep2()
						// }, 60 * 1000); //彈窗1分後自動跳轉

						//更新剩餘時間
						const duration = moment.duration(diffSeconds, 'seconds');
						this.setState({
							transactionId: cacheData.res.transactionId,
							//ModalOKOpen: true, 刷新後不開彈窗
							countDownMinute: padLeft(duration.minutes() + '', 2),
							countDownSecond: padLeft(duration.seconds() + '', 2)
						});
						this.goToStep2();
					} else {
						//秒數不夠，就不處理了
					}
				}
			}

			if (!showStep2) {
				this.removeStep2Cache();
			}
		}
	}

	componentWillUnmount() {
		console.log('===PPB WillUnmount===');
		this.clearTimeouts();
	}

	//清理定時器，避免關閉後觸發 報錯
	clearTimeouts = () => {
		if (this.countDownMoadlOKHandle) {
			clearTimeout(this.countDownMoadlOKHandle);
		}
		if (this.countDownTickerHandle) {
			clearInterval(this.countDownTickerHandle);
		}
	};

	//倒計時
	countDown = () => {
		const diffSeconds = this.targetTime.diff(moment(), 'seconds');
		if (diffSeconds <= 0) {
			this.setState({ ModalTimeoutOpen: true });
			this.clearTimeouts();
		} else {
			const duration = moment.duration(diffSeconds, 'seconds');
			this.setState({
				countDownMinute: padLeft(duration.minutes() + '', 2),
				countDownSecond: padLeft(duration.seconds() + '', 2)
			});
		}
	};

	//退回步驟1
	reset2Step1 = () => {
		this.clearTimeouts();
		this.submitTime = null;
		this.targetTime = null;
		this.postPayResult = null;
		this.setState({
			thisStep: 1,
			transactionId: '',
			ModalErrorOpen: false,
			ModalTimeoutOpen: false,
			countDownMinute: null,
			countDownSecond: null
		});
		this.props.form.resetFields();
		this.props.setShowPayMethodsList(true);
		this.channelReload && this.channelReload();
		this.props.setBarTitle(null);
	};

	//到步驟2
	goToStep2 = () => {
		this.props.setBarTitle('网银转账');
		//清理一分自動跳轉
		if (this.countDownMoadlOKHandle) {
			clearTimeout(this.countDownMoadlOKHandle);
		}
		this.props.setShowPayMethodsList(false);
		this.setState({ thisStep: 2, ModalOKOpen: false });
	};

	goToStep3 = () => {
		this.props.setBarTitle('网银转账');
		let hide = Toast.loading();
		let bankAccountNumber = this.postPayResult.vendorDepositBankDetails.bankAccountNumber;
		let postOtherInfo = {
			transactionId: this.postPayResult.transactionId
			//depositingBankAcctNum: String(bankAccountNumber).substring(bankAccountNumber.length - 6)
		};
		CommonPostConfirmPay(postOtherInfo, (res) => {
			this.props.form.resetFields();
			this.setState({ thisStep: 3, ModalTimeoutOpen: false });
			this.removeStep2Cache(); //刪除step2緩存
			hide();
		});
	};

	removeStep2Cache = () => {
		localStorage.removeItem('Deposit_PPB_Step2_Cache');
		//用replace，避免用戶可以點擊back返回
		//Router.replace('', undefined, { shallow: true });
	};

	payConfirm = (e) => {
		const { currDepositDetail } = this.props;
		//获取timeout second
		let timeoutSeconds;
		if (currDepositDetail && currDepositDetail.setting && currDepositDetail.setting.timeoutSeconds) {
			timeoutSeconds = currDepositDetail.setting.timeoutSeconds;
			this.setState({
				timeOutMin: Math.floor(timeoutSeconds / 60),
				timeOutSec: timeoutSeconds - Math.floor(timeoutSeconds / 60) * 60,
				totalTimeoutSec: currDepositDetail.setting.timeoutSeconds
			});
		} else {
			this.setState({
				timeOutMin: 5,
				totalTimeoutSec: 300
			});
		}
		e.preventDefault();
		if (!this.submitBtnEnable()) return;

		const Paybank =
			this.props.currDepositDetail.banks &&
			this.props.currDepositDetail.banks.find((v) => v.Code === this.state.bankCodeState);
		// if (Paybank == undefined) {
		// 	return message.error('正在维护，请选择其他存款方式。');
		// }
		if (typeof this.props.depositStatusCheck(this.props.bcType, this.state.bankCodeState) === 'undefined') return; // 未完成真实姓名验证则呼出完善弹窗
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
						bankName: Paybank ? Paybank.Code : '',
						bonusId: this.state.bonusVal,
						bonusCoupon: values.bonusCode || '',
						cardExpiryDate: '',
						cardName: '',
						cardNumber: '',
						cardPIN: '',
						charges: 0,
						couponText: '',
						depositingBankAcctNum: '',
						depositingWallet: this.props.depositingWallet, // 目标账户Code
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
						paymentMethod: 'PPB',
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
							console.log("res in PPB response ",res)
							res = res.result;
							this.postPayResult = res;
							// res.vendorDepositBankDetails = {
							// 	bankCode: 'BOC',
							// 	bankName: '中国银行',
							// 	bankAccountNumber: '4563513000319888296',
							// 	bankAccountName: '张智涛',
							// 	bankProvince: '',
							// 	bankCity: '',
							// 	bankBranch: '武汉江岸支行',
							// 	pgRemark: '',
							// 	transferAmount: 101
							// };
							if (res.vendorDepositBankDetails) {
								//this.submitTime = moment(res.submittedAt);
								console.log(moment());
								this.submitTime = moment(); //放棄submittedAt 改用 用戶當前時間
								this.targetTime = this.submitTime
									.clone()
									.add(timeoutSeconds ? timeoutSeconds : 300, 'seconds');
								const diffSeconds = this.targetTime.diff(moment(), 'seconds');
								if (diffSeconds > 0) {
									//需求：頁面刷新後仍有效
									//用replace，避免用戶可以點擊back返回
									Router.replace('?PPB=2', undefined, { shallow: true });
									localStorage.setItem(
										'Deposit_PPB_Step2_Cache',
										JSON.stringify({
											res,
											submitTime: this.submitTime.toISOString(),
											targetTime: this.targetTime.toISOString()
										})
									);

									this.countDownTickerHandle = setInterval(this.countDown, 1000); //啟動倒計時每秒更新
									this.countDownMoadlOKHandle = setTimeout(() => {
										this.goToStep2();
									}, 60 * 1000); //彈窗1分後自動跳轉

									//打開彈窗並更新剩餘時間
									const duration = moment.duration(diffSeconds, 'seconds');
									this.setState({
										transactionId: res.transactionId,
										ModalOKOpen: true,
										countDownMinute: padLeft(duration.minutes() + '', 2),
										countDownSecond: padLeft(duration.seconds() + '', 2)
									});
								} else {
									//倒計時不足 視為失敗
									this.setState({ ModalErrorOpen: true }); //展示彈窗
								}
							} else {
								//無QRLink，走原流程(跳轉)
								this.props.thirdPartyPay(res, values.money, '网银转账');
								this.props.form.resetFields();
								setTimeout(() => {
									this.setState({
										thisStep: 3,
										amount: values.money
									});
								}, 500);
								this.props.setShowPayMethodsList(false);
							}
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
										console.log(res);
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
							if (res.errors[0].errorCode == 'P103001') {
								this.setState({ ModalErrorOpen: true }); //展示彈窗
							}
						}
					}
				);
			}
		});
		// Pushgtagdata(`Deposit`, 'Submit', 'Submit_P2Pbanking_Deposit');
	};
	goHome = () => {
		this.props.setBarTitle(null);
		this.removeStep2Cache();
		Cookie('isThird', null);
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
		let { setting, banks } = this.props.currDepositDetail; // 当前支付方式的详情

		console.log(this.props.currDepositDetail);
		const {
			getFieldsError,
			getFieldDecorator,
			getFieldValue,
			setFieldsValue,
			setFields,
			getFieldError
		} = this.props.form;
		const { bcTypeList } = this.props;
		const { thisStep, bankCodeState, targetValue, bonusVal, timeOutMin, timeOutSec } = this.state;
		return (
			<React.Fragment>
				<div
					className="form-wrap"
					style={{
						display: thisStep === 1 ? 'block' : 'none'
						// backgroundColor: paymentMethodVisible ? 'initial' : '#fff'
					}}
				>
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
						registerChannelReload={(channelReloadFunc) => {
							this.channelReload = channelReloadFunc;
						}}
					/>

					{banks &&
					banks != '' && (
						<BankAccount
							keyName={[ 'name', 'code' ]}
							bankAccounts={banks}
							bankCodeState={bankCodeState}
							setBankCode={(v) => {
								this.setState({ bankCodeState: v });
							}}
							setting={setting}
						/>
					)}
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
				{thisStep === 2 && (
					<SecondStep
						timeoutSeconds={this.state.totalTimeoutSec}
						currBankAccount={this.postPayResult.vendorDepositBankDetails} // 轉帳信息
						countDownMinute={this.state.countDownMinute}
						countDownSecond={this.state.countDownSecond}
						depositMoney={this.postPayResult.vendorDepositBankDetails.transferAmount}
						qrUrl={this.postPayResult.vendorDepositBankDetailsQRLink}
						goToStep3={() => this.goToStep3()}
						submittedAt={this.postPayResult.submittedAt}
					/>
				)}
				{/* 完成步骤 */}
				{thisStep === 3 && (
					<FinishStep
						transactionId={this.postPayResult.transactionId}
						depositMoney={
							this.postPayResult.vendorDepositBankDetails ? (
								this.postPayResult.vendorDepositBankDetails.transferAmount
							) : (
								this.postPayResult.uniqueAmount
							)
						}
						goHome={this.goHome}
						time="10:00"
						PaymentMethod="PPB"
						RequestedBy={this.props.memberInfo.userName}
					/>
				)}
				{/* 温馨提示 */}
				{thisStep !== 3 && (
					<div className="deposit-help-wrap">
						<h4>乐天使温馨提醒：</h4>
						<ul>
							<li>转账时必须按照系统产生的银行账号和金额进行支付，并且建议您上传存款凭证，以利及时到账。</li>
							<li>收款账户不接受【微信】、【支付宝】及【云闪付】等APP转账，以上方式将导致存款无法到账。</li>
							<li>银行账号会不定期更换，请确保您使用的是存款页面上最新的账号，再进行转账。</li>
							<li>如有任何问题请联系在线客服。</li>
						</ul>
					</div>
				)}
				{/* PPB提交後的modal */}
				<Modal closable={false} className="PPB-Modal" title="存款" visible={this.state.ModalOKOpen}>
					<div className="PPB-Modal-content">
						<div className="PPB-Modal-text">订单 {this.state.transactionId} 创建成功。</div>

						{this.postPayResult &&
						<>
						{this.postPayResult.vendorCharges && this.postPayResult.totalWaiveRemain >0 && (
						<>
							<div className="detail">
								<dd>
									存款金额：<span>{this.postPayResult.uniqueAmount || ''}</span>
								</dd>
								<dd>
									第三方手续费：<span>{Math.abs(this.postPayResult.charges) || ''}</span>
								</dd>
								<dd>
									实际金额：<span>{this.postPayResult.actualAmount || ''}</span>
								</dd>
							</div>
							<div className="line-distance" />
							<p style={{ margin: '15px 0', lineHeight: '20px' }}>
							注意 : 交易成功后，才会扣除免手续费的次数。<br />剩余{' '}
								<span className="red">{this.postPayResult.totalWaiveRemain}</span> 笔交易免手续费。
							</p>
							<div className="line-distance" />
							<div className="modal-prompt-info">
							乐天使温馨提醒 : 请在 {timeOutMin && timeOutMin != '0' ? `${timeOutMin}分钟` : ''}{' '}
							{timeOutSec && timeOutSec != '0' ? `${timeOutSec}秒` : ''} 之内完成支付，以免到账延迟。
							</div>
						</>
						)}

						{this.postPayResult.vendorCharges && this.postPayResult.totalWaiveRemain ==0 && (
						<>
							<div className="detail">
								<dd>
									存款金额：<span>{this.postPayResult.uniqueAmount || ''}</span>
								</dd>
								<dd>
									第三方手续费：<span>{Math.abs(this.postPayResult.charges) || ''}</span>
								</dd>
								<dd>
									实际金额：<span>{this.postPayResult.actualAmount || ''}</span>
								</dd>
							</div>
							<div className="line-distance" />
							<div className="modal-prompt-info">
							乐天使温馨提醒 : 请在 {timeOutMin && timeOutMin != '0' ? `${timeOutMin}分钟` : ''}{' '}
							{timeOutSec && timeOutSec != '0' ? `${timeOutSec}秒` : ''} 之内完成支付，以免到账延迟。
							</div>
						</>
						)}
						{/* 沒有優惠的情況 */}
						{!this.postPayResult.vendorCharges && this.postPayResult.totalWaiveRemain >=0 
						&& this.postPayResult.charges >=0 &&
						(
						<>
							<div className="line-distance" />
							<div className="modal-prompt-info">
							乐天使温馨提醒 : 请在 {timeOutMin && timeOutMin != '0' ? `${timeOutMin}分钟` : ''}{' '}
							{timeOutSec && timeOutSec != '0' ? `${timeOutSec}秒` : ''} 之内完成支付，以免到账延迟。
							</div>
						</>
						)}

						{!this.postPayResult.vendorCharges && this.postPayResult.totalWaiveRemain ==0 
						&& this.postPayResult.charges < 0 &&
						(
						<>
							<div className="line-distance" />
							<div className="line-distance" />
							<div className="modal-prompt-info">
							乐天使温馨提醒 : 请在 {timeOutMin && timeOutMin != '0' ? `${timeOutMin}分钟` : ''}{' '}
							{timeOutSec && timeOutSec != '0' ? `${timeOutSec}秒` : ''} 之内完成支付，以免到账延迟。
							</div>
						</>
						)}
						
						{!this.postPayResult.vendorCharges && this.postPayResult.totalWaiveRemain >0 
						&& this.postPayResult.charges < 0 &&
						(
						<>
							<div className="line-distance" />
							<p style={{ margin: '15px 0', lineHeight: '20px' }}>
							注意 : 交易成功后，才会扣除免手续费的次数。<br />剩余{' '}
								<span className="red">{this.postPayResult.totalWaiveRemain}</span> 笔交易免手续费。
							</p>
							<div className="line-distance" />
							<div className="modal-prompt-info">
							乐天使温馨提醒 : 请在 {timeOutMin && timeOutMin != '0' ? `${timeOutMin}分钟` : ''}{' '}
							{timeOutSec && timeOutSec != '0' ? `${timeOutSec}秒` : ''} 之内完成支付，以免到账延迟。
							</div>
						</>
						)}
						</>
						}
					</div>
					<Button
						size="large"
						type="primary"
						onClick={() => {
							this.goToStep2();
						}}
					>
						我知道了
					</Button>
				</Modal>
				<Modal closable={false} className="PPB-Modal" title="温馨提醒" visible={this.state.ModalErrorOpen}>
					<div className="PPB-Modal-content">
						<div className="PPB-Modal-text">当前交易繁忙，推荐使用USDT存款方式，体验极致存款速度，安全安心。</div>
					</div>
					<Button
						size="large"
						type="primary"
						onClick={() => {
							this.reset2Step1();
						}}
					>
						好的
					</Button>
				</Modal>
				<Modal closable={false} className="PPB-Modal" title="" visible={this.state.ModalTimeoutOpen}>
					<div className="PPB-Modal-text2">您是否已经成功存款?</div>
					<div className="PPB-Modal-buttons-container">
						<Button
							className="PPB-Modal-button-yes"
							size="large"
							type="primary"
							onClick={() => {
								this.goToStep3();
							}}
						>
							是，我已经成功存款
						</Button>
						<Button
							className="PPB-Modal-button-no"
							size="large"
							type="primary"
							ghost={true}
							onClick={() => {
								this.reset2Step1();
							}}
						>
							否，我想提交新交易
						</Button>
					</div>
				</Modal>
			</React.Fragment>
		);
	}
}
export default createForm({ fieldNameProp: 'ppb' })(withBetterRouter(PPB));

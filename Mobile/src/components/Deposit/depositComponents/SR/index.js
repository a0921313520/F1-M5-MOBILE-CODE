import React from 'react';
import Button from '@/components/View/Button';
import { createForm } from 'rc-form';
import MoneyInput from './../MoneyInput';
import TargetAccount from './../TargetAccount';
import HostConfig from '@/server/Host.config';
import { CommonPostPay, PromoPostApplications, CommonPostConfirmPay } from '@/api/wallet';
import SecondStep from './SecondStep';
import FinishStep from '../FinishStep';
import { formatSeconds, Cookie, getE2BBValue } from '@/lib/js/util';
const { LocalHost } = HostConfig.Config;
import Modal from '@/components/View/Modal';
import Toast from '@/components/View/Toast';
import Router from 'next/router';
import moment from 'moment';
import { withBetterRouter } from '@/lib/js/withBetterRouter';
import ReactIMG from '@/components/View/ReactIMG';

//左補0
const padLeft = (str, length) => {
	if (str.length >= length) return str;
	else return padLeft('0' + str, length);
};

class SR extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			thisStep: 1, // 充值步骤
			bankCodeState: '', // 收款银行Code值
			depositMoney: 0, // 充值金额
			targetValue: '', // 目标账户State值
			targetName: '', // 目标账户名称
			bonusVal: 0, // 可申请优惠Val值
			bonusName: '', // 可申请优惠名称
			ModalErrorOpen: false, //無法獲取 支付數據 彈窗
			ModelErrorCode: 0, //錯誤類型，影響錯誤訊息展示
			countDownMinute: null, //倒計時 分
			countDownSecond: null //倒計時 秒
		};

		this.payTypeCode = 'SR'; // 当前支付方式Code
		this.submitTime = null; //用戶提交時間
		this.targetTime = null; //過期時間
		this.countDownTickerHandle = null; //每秒觸發一次，用來倒計時 句柄
		this.postPayResult = null; //調用支付接口的返回值
		this.channelReload = null; //重新加載(getDetail)選中的渠道
	}
	componentDidMount() {
		//debug
		//this.setState({ModalErrorOpen: true,ModelErrorCode: 'P111001'});
		//this.setState({ModalErrorOpen: true,ModelErrorCode: 'P111004'});

		const { query } = this.props.router;

		//SR刷新判斷 需求：在step2頁面刷新後，仍返回原頁面
		if (query.SR && query.SR == 2) {
			console.log('======SR didmount with SR=2');
			const jsonCacheData = localStorage.getItem('Deposit_SR_Step2_Cache');
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

						//更新剩餘時間
						const duration = moment.duration(diffSeconds, 'seconds');
						this.setState({
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
		if (this.countDownTickerHandle) {
			clearInterval(this.countDownTickerHandle);
		}
	};

	//倒計時
	countDown = () => {
		const diffSeconds = this.targetTime.diff(moment(), 'seconds');
		if (diffSeconds <= 0) {
			this.clearTimeouts();
			this.goToStep3(); //超時自動跳完成
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
			ModalErrorOpen: false,
			ModelErrorCode: null,
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
		this.props.setBarTitle('小额存款');
		this.props.setShowPayMethodsList(false);
		this.setState({ thisStep: 2 });
	};

	goToStep3 = () => {
		this.props.setBarTitle('小额存款');
		let hide = Toast.loading();

		let postOtherInfo = {
			transactionId: this.postPayResult.result.transactionId,
			// depositingBankAcctNum: this.postPayResult.result.returnedBankDetails.accountNumber
			depositingBankAcctNum:''
		};
		CommonPostConfirmPay(postOtherInfo, (res) => {
			this.props.form.resetFields();
			this.setState({ thisStep: 3 });
			this.removeStep2Cache(); //刪除step2緩存
			hide();
		});
	};

	removeStep2Cache = () => {
		localStorage.removeItem('Deposit_SR_Step2_Cache');
		//用replace，避免用戶可以點擊back返回
		Router.push('/deposit');
		//Router.replace(window.location.pathname, undefined, { shallow: true });
	};

	payConfirm = (e) => {
		e.preventDefault();
		if (!this.submitBtnEnable()) return;

		if (typeof this.props.depositStatusCheck(this.payTypeCode, this.state.bankCodeState) === 'undefined') return; // 未完成真实姓名验证则呼出完善弹窗

		this.props.form.validateFields((err, values) => {
			console.log('SR 小額存款 =====', values,err);
			if (!err) {
				const hide = Toast.loading();
				CommonPostPay(
					{
						domainName: LocalHost,
						bonusId: this.state.bonusVal,
						isMobile: true,
						IsSmallSet: false,
						MemberCode: this.props.memberInfo.UserName,
						RequestedBy: this.props.memberInfo.UserName,
						amount: values.money,
						CurrencyCode: 'cny',
						transactionType: '1',
						Charges: 0.0,
						accountNumber: '0', //帐号
						accountHolderName: this.depositName != null ? this.depositName : this.props.localMemberName, //账户持有人姓名
						bankName: 'test', //银行名
						city: 'city',
						province: 'province',
						branch: 'branch',
						SWIFTCode: 'FUN88',
						paymentMethod: this.payTypeCode,
						mgmtRefNo: 'Fun88Mobile',
						refNo: '0',
						offlineRefNo: '0',
						//depositingBankAcctNum: Paybank ? Paybank.AccountNo.substring(Paybank.AccountNo.length - 6) : '',
						merchantType: 1, // 1 call smilepay, 9 hide smilepay
						blackBoxValue: getE2BBValue(),
						e2BlackBoxValue: getE2BBValue()
					},
					(res) => {
						hide();
						if (res.isSuccess) {
							res.SRdepositAmount = values.money; //額外加上金額
							this.postPayResult = res;
							this.submitTime = moment();
							this.targetTime = this.submitTime.clone().add(30, 'minutes');
							const diffSeconds = this.targetTime.diff(moment(), 'seconds');
							//需求：頁面刷新後仍有效
							//用replace，避免用戶可以點擊back返回
							Router.replace('?SR=2', undefined, { shallow: true });
							localStorage.setItem(
								'Deposit_SR_Step2_Cache',
								JSON.stringify({
									res,
									submitTime: this.submitTime.toISOString(),
									targetTime: this.targetTime.toISOString()
								})
							);

							this.countDownTickerHandle = setInterval(this.countDown, 1000); //啟動倒計時每秒更新

							//更新剩餘時間
							const duration = moment.duration(diffSeconds, 'seconds');
							this.setState({
								countDownMinute: padLeft(duration.minutes() + '', 2),
								countDownSecond: padLeft(duration.seconds() + '', 2)
							});
							this.goToStep2(); //直接跳第2步

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
											Toast.success('优惠申请成功');
											// Router.push(
											//     `/deposit/promostatus/?id=${bonusVal}&wallet=${this.props
											//         .depositingWallet}&value=${values.money}`
											// );
										}
									}
								);
							}
						} else {
							if (res.errors[0].errorCode == 'P101116') {
								Modal.info({
									className: 'Send-Modal',
									closable:false,
									icon: null,
									centered: true,
									type: 'confirm',
									btnBlock: false,
									btnReverse: false,
									title: '重要提示',
									content: (
										<div className='lastDepositBox'>
											<p>请耐心等待，您有一项存款申请正在处理中。</p>
											<div className='Center'>
												<p>存款编号：{res.result.lastDepositID}</p>
												<p>存款金额：{res.result.lastDepositAmount}</p>
											</div>
											<p>请等待处理完毕后，再提交其他存款申请。</p>
										</div>
									),
									okText: '好的'
								});
								return;
							}
							if (res.errors[0].errorCode == 'P111004') {
								this.setState({ ModalErrorOpen: true, ModelErrorCode: res.errors[0].errorCode }); //展示彈窗
							}
						}
					}
				);
			}
		});
		// Pushgtagdata(`Deposit`, 'Submit', 'SmallRiver_Deposit');
	};

	goHome = () => {
		this.props.setBarTitle(null);
		this.removeStep2Cache();
		Cookie('isThird', null);
		Router.push('/');
	};

	submitBtnEnable = () => {
		let errors = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let values = Object.values(this.props.form.getFieldsValue()).some((v) => v == '' || v == undefined);

		return !values && !errors
	};

	render() {
		const { bankAccounts, setting, suggestedAmounts } = this.props.currDepositDetail; // 当前支付方式的详情
		const { setFields, getFieldDecorator, getFieldValue, getFieldError, setFieldsValue } = this.props.form;
		const { localMemberName } = this.props;
		// console.log(this.props.currDepositDetail);
		const { bankCodeState, targetName, targetValue, depositMoney, bonusVal, thisStep, remainingTime } = this.state;
		return (
			<React.Fragment>
				{/* 第一步骤 */}
				<div className="form-wrap" style={{ display: thisStep === 1 ? 'block' : 'none' }}>
					<MoneyInput
						getFieldDecorator={getFieldDecorator}
						payTypeCode={this.payTypeCode}
						payMethodList={this.props.payMethodList}
						setCurrDepositDetail={this.props.setCurrDepositDetail}
						setting={setting}
						setFieldsValue={setFieldsValue}
						getFieldError={getFieldError}
						registerChannelReload={(channelReloadFunc) => {
							this.channelReload = channelReloadFunc;
						}}
						currDepositDetail={this.props.currDepositDetail}
						localMemberName={this.props.localMemberName}
						ref="Channeldefault"
						setFields={setFields}
						key={JSON.stringify(this.props.currDepositDetail)}
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

					<div className={`btn-wrap depo-btn-submit ${!this.submitBtnEnable() ? 'btn-disable' : ''}`}>
						<Button size="large" type="primary" onClick={this.payConfirm}>
							提交
						</Button>
					</div>
				</div>
				{/* 第二步骤 */}
				{thisStep === 2 && (
					<SecondStep
						currBankAccount={this.postPayResult.result.returnedBankDetails} // 当前选中的银行信息
						submitTime={this.submitTime.format('YYYY-MM-DD HH:mm:ss')}
						countDownMinute={this.state.countDownMinute}
						countDownSecond={this.state.countDownSecond}
						depositMoney={this.postPayResult.SRdepositAmount}
						goToStep3={() => this.goToStep3()}
					/>
				)}
				{/* 完成步骤 */}
				{thisStep === 3 && (
					<FinishStep
						transactionId={this.postPayResult.result.transactionId}
						depositMoney={this.postPayResult.SRdepositAmount}
						goHome={this.goHome}
						time="30:00"
						PaymentMethod="SR"
						RequestedBy={this.props.memberInfo.UserName}
					/>
				)}
				{/* 温馨提示 */}
				{thisStep !== 3 && (
					<div className="deposit-help-wrap">
						<h4>乐天使温馨提醒：</h4>
						<ul>
							<li>只允许本地银行进行交易，请按照银行账户信息进行存款， 请必须以选定的金额存款，否则将无法到账。</li>
							<li>必须在30分钟内转账，若30分钟内未完成，交易将被拒绝， 若在30分钟后交易，金额将不予退还。</li>
							<li>每次存款之前需先检查看最新的存款账号信息，避免存款过 程中出现错误导致您的权益受损。</li>
							<li>小额存款不支持一卡通或超级网银交易。</li>
						</ul>
					</div>
				)}
				<Modal closable={false} className="SR-Modal" title="" visible={this.state.ModalErrorOpen}>
					<div className="SR-Modal-content">
						<div
							className="SR-Modal-close-container"
							onClick={() => {
								this.reset2Step1();
							}}
						>
							<ReactIMG className="SR-Modal-close" src="/img/svg/close.svg" />
						</div>
						<ReactIMG className="SR-Modal-warning" src="/img/deposit/warning.svg" />
						{this.state.ModelErrorCode == 'P111004' &&
							<div className="SR-Modal-desc">亲爱的会员，因请求异常导致您的存款未能成功， 请您重新提交或使用其他存款方式。</div>
						}
					</div>
					<Button
						size="large"
						type="primary"
						onClick={() => {
							this.reset2Step1();
						}}
					>
						我知道了
					</Button>
				</Modal>
			</React.Fragment>
		);
	}
}
export default createForm({ fieldNameProp: 'sr' })(withBetterRouter(SR));

import React from 'react';
import Input from '@/components/View/Input';
import { formatAmount } from '@/lib/js/util';
import { fetchRequest } from '@/server/Request';
import { depositMoneyDecimal, depositMoneyInt } from '@/lib/SportReg';
import { ApiPort } from '@/api/index';
import { GetPayDetail } from '@/api/wallet';
import Toast from '@/components/View/Toast';
import Item from './../Item';
import { ReactSVG } from '@/components/View/ReactSVG';
import { Decimal } from 'decimal.js';
import DepositName from '../../depositName/';
import { getMemberInfo } from '@/api/userinfo';
import Router from 'next/router';

class MoneyInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			Channeldefault: '',
			SuggestedAmount: '',
			Amountvalue: '',
			SuggestedAmounthide: false,
			Amountfalse: false,
			CurrentDepositDetail: null,
			isAlipayH5_LC: false,
			isWeChatH5_LC: false,
			isPPB: false,
			isSR: false,
			HasMinusCharge: false,
			isSetAmountFromSuggested: false
		};
		this.uniqueAmountStatus = true;
		this.ispayMethod = '';
		props.payMethodList.some((v) => {
			if (v.code === props.payTypeCode) {
				this.ispayMethod = v;
				this.uniqueAmountStatus = v.uniqueAmountStatus;
				return true;
			}
		});
		/* 只有这些需要有支付渠道 */
		this.Needlist = [ 'JDP', 'OA', 'UP', 'QQ', 'BC', 'BCM', 'WC', 'PPB', 'LB' ];

		/* 默認的小額存款金額(無數據時 展示用) */
		this.SRDefaultAmounts = [
			{ amount: 100, isActive: false },
			{ amount: 200, isActive: false },
			{ amount: 300, isActive: false },
			{ amount: 400, isActive: false },
			{ amount: 500, isActive: false },
			{ amount: 600, isActive: false },
			{ amount: 700, isActive: false },
			{ amount: 800, isActive: false },
			{ amount: 900, isActive: false },
			{ amount: 1000, isActive: false }
		];
		this.inputTimer = null;
	}

	componentDidMount() {
		//支付渠道
		let payMethod = this.ispayMethod.availableMethods;
		//判断是否含有 DEFAULT
		let HaveDEFAULT = payMethod.find((item) => item.methodCode == 'DEFAULT') ? true : false;
		let _Channeldefault = '';
		//如果有支付渠道
		if (this.ispayMethod != '' && payMethod.length == 1) {
			_Channeldefault = payMethod[0].methodCode;
		} else {
			//如果支付渠道 不含有 DEFAULT
			if (!HaveDEFAULT && payMethod.length != 0) {
				_Channeldefault = this.props.methodCode || payMethod[0].methodCode;
			} else if (payMethod.length == 2) {
				_Channeldefault = payMethod[1].methodCode;
			} else if (this.ispayMethod != '' && payMethod.length >= 2) {
				_Channeldefault = this.props.methodCode || payMethod[1].methodCode;
			} else {
				_Channeldefault = '';
			}
		}

		if (this.ispayMethod.availableMethods && this.ispayMethod.availableMethods.length !== 0) {
			this.setState(
				{
					Channeldefault: _Channeldefault
				},
				() => {
					if (this.state.Channeldefault !== '') {
						this.onChange(this.state.Channeldefault, 'intData');
					}
				}
			);
		} else {
			this.onChange(this.state.Channeldefault, 'intData');
		}

		//函式傳到父元素 (重新加載 當前選中的支付渠道 getDetail數據) for 多步驟存款，退回第一步時使用
		if (this.props.registerChannelReload) {
			this.props.registerChannelReload(() => {
				return this.onChange(this.state.Channeldefault);
			});
		}

		const isSR = this.props.payTypeCode === 'SR';
		if (this.state.isSR != isSR) {
			this.setState({ isSR });
		}
	}

	componentWillUnmount(){
		this.setState({isSetAmountFromSuggested: false})
	}

	onChange = (e, int) => {
		this.setState({
			Channeldefault: e,
			SuggestedAmounthide: true,
			SuggestedAmount: ''
		});
		if (this.props.setFieldsValue) {
			this.props.setFieldsValue({
				money: ''
			});
		}
		if (int == 'intData') {
			this.intData(this.props.currDepositDetail);
			return;
		}
		GetPayDetail(
			this.props.payTypeCode,
			(data) => {
				//hide()
				if (data.isSuccess) {
					this.intData(data.result);
				}
			},
			e
		);
	};

	intData(data) {
		this.props.setCurrDepositDetail(data);
		this.setState({ CurrentDepositDetail: data }, () => {
			this.changeCharge();
		});
	}

	changeCharge = () => {
		let { payTypeCode } = this.props;
		const { CurrentDepositDetail } = this.state;
		const currentDepositSetting =
			CurrentDepositDetail && CurrentDepositDetail.setting ? CurrentDepositDetail.setting : null;
		if (currentDepositSetting) {
			if (payTypeCode == 'OA') {
				this.setState({
					isAlipayH5_LC: true
				});
			} else if (payTypeCode == 'WC') {
				this.setState({
					isWeChatH5_LC: true
				});
			} else if (payTypeCode == 'PPB') {
				this.setState({
					isPPB: true
				});
			}
			this.setState({
				HasMinusCharge: currentDepositSetting.charges !== '' && Number(currentDepositSetting.charges) < 0
			});
		}
	};

	Testamount = (value, payTypeCode) => {
		this.setState({isSetAmountFromSuggested:false})
		clearTimeout(this.inputTimer);
		const hide = Toast.loading();
		this.inputTimer = setTimeout(() => {
			fetchRequest(
				`
				${ApiPort.SuggestedAmount}amount=${value}&method=${payTypeCode}&methodcode=${this.state.Channeldefault}&`,
				'GET'
			).then((res) => {
				hide();

				if (res) {
					if (res.result.length != 0) {
						this.setState(
							{
								SuggestedAmount: res.result,
								SuggestedAmounthide: false
							},
							() => {
								let error = this.props.getFieldError('money');
								this.props.setFields({
									money: {
										value: value,
										errors: [ new Error(error ? (error != 'Error' ? error : '') : '') ]
									}
								});
							}
						);
					}
				}
			});
		}, 300);
	};

	payMethodUI = () => {
		let { payTypeCode } = this.props;
		return this.ispayMethod.availableMethods.map((item, index) => {
			if (item.methodCode != 'DEFAULT') {
				return (
					<li
						key={item.methodCode + index}
						className={payTypeCode === 'OA' || payTypeCode === 'WC' ? 'cap-item cap-item-M' : 'cap-item'}
						onClick={() => {
							this.setState({
								Amountvalue: ''
							});
							this.onChange(item.methodCode);
						}}
					>
						<div
							className={`cap-item-circle${item.methodCode === this.state.Channeldefault ? ' curr' : ''}`}
						/>
						<div>{item.methodType}</div>
						{item.isNew && <ReactSVG className="newIcon" src="/img/svg/new.svg" />}
					</li>
				);
			}
		});
	};

	smilePayInfoUI = () => {
		if (this.uniqueAmountStatus) {
			return <div className="input-info-message">请您输入非整数的金额进行存款，例如：301，519元。</div>;
		} else {
			return <div className="input-info-message">为了使您的存款快速到账，建议您输入非整数的金额进行存款，例如301，519元等。</div>;
		}
	};

	//   针对输入的金额做特殊处理
	onCustomMoneyValidate = (e) => {
		e.target.value = e.target.value.replace(/[^\d.]/g, ''); // 只能输入"数字"和"."
		e.target.value = e.target.value.replace(/^\./g, ''); // 第一位字符不能为"."
		e.target.value = e.target.value.replace(/\.{2,}/g, '.'); // 只保留第一个. 清除多余的
		e.target.value = e.target.value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.'); // 只能输入一个小数点且只保留一个
		e.target.value = e.target.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); // 只能输入两位小数
		if (e.target.value.indexOf('.') < 0 && e.target.value !== '') e.target.value = parseFloat(e.target.value); // 以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
		// TODOS 做赋值操作
	};

	render() {
		let { getFieldDecorator, payTypeCode, setFieldsValue, setting, payMethodList } = this.props;
		// console.log(this.props);
		!setting && (setting = { minBal: 0, maxBal: 0, DayBal: 0 }); // 初始化Setting
		const minBal = formatAmount(setting.minBal),
			maxBal = formatAmount(setting.maxBal),
			transferNumber = formatAmount(setting.transferNumber);
		const hasMaxMoney = true;
		const isCTC = payTypeCode === 'CTC';

		//SR 小額存款處理
		let SR_cannot_deposit = false;
		let SR_SuggestedAmounts = this.SRDefaultAmounts;

		if (this.state.isSR) {
			setting.showDepositorNameField = false; //不展示存款人姓名
			setting.Charges = 0; //不使用手續費
			SR_cannot_deposit =
				!this.state.CurrentDepositDetail || //沒獲取到支付細節
				!this.state.CurrentDepositDetail.suggestedAmounts || //沒獲取到建議金額
				!this.state.CurrentDepositDetail.suggestedAmounts.some((v) => v.isActive); //建議金額都無效
			if (
				this.state.CurrentDepositDetail &&
				this.state.CurrentDepositDetail.suggestedAmounts &&
				this.state.CurrentDepositDetail.suggestedAmounts.length > 0
			) {
				SR_SuggestedAmounts = this.state.CurrentDepositDetail.suggestedAmounts;
			}
		}
		// console.log(this.state.CurrentDepositDetail);
		return (
			<React.Fragment>
				{this.Needlist.includes(payTypeCode) &&
				this.ispayMethod != '' &&
				this.ispayMethod.availableMethods.length != 0 && (
					<div>
						{this.ispayMethod.availableMethods.length == 1 &&
						this.ispayMethod.availableMethods[0].methodCode == 'DEFAULT' ? (
							''
						) : (
							<Item label={`支付渠道`} className="clear-margin">
								<ul className="cap-list">{this.payMethodUI()}</ul>
							</Item>
						)}
					</div>
				)}

				{setting &&
				setting.charges < 0 &&
				Boolean([ 'OA', 'WC' ].find((v) => payTypeCode.includes(v))) && (
					<div className="modal-prompt-info">
						温馨提示：使用{payMethodList.find((v) => v.code == payTypeCode).name}进行存款，第三方平台将征收手续费{' '}
						{Math.abs(setting.charges * 100).toFixed(2)}%。
					</div>
				)}

				{setting && (
					<DepositName
						getFieldError={this.props.getFieldError}
						getFieldDecorator={getFieldDecorator}
						setting={setting}
						//localMemberName={this.props.localMemberName}
					/>
				)}
				<Item label={`存款金额`} errorMessage={this.props.getFieldError('money')}>
					{getFieldDecorator('money', {
						initialValue: this.props.money || '',
						getValueFromEvent: (event) => {
							// 限制只能为数字并且数字最多带2位小数
							const reg = /^(\.*)(\d+)(\.?)(\d{0,2}).*$/g;
							switch (payTypeCode) {
								case 'LB':
								case 'WCLB':
								case 'BCM':
								case 'ALB':
								case 'BC':
									// regex \.(?=.*\.) 保留一個. 其餘的.全部抓取 ||  /^0(?=\d+)/ 抓取第一個輸入的0
									return event.target.value.replace( /[^\d.]|\.(?=.*\.)/g, '').replace(reg, '$2$3$4').replace(/^0(?=\d+)/g,"")
								default:
									return event.target.value.replace(/[^\d]+/g, '').replace(/^(0)([\d]+)/,"$2");
							}
						},
						rules: [
							{ required: true, message: '请输入金额' },
							{
								validator: (rule, value, callback) => {
									if(this.state.isSetAmountFromSuggested){
										return callback()
									}
									if (value) {
										console.log("value", value);
										this.setState({
											Amountvalue: value
										});

										if (
											payTypeCode === 'WCLB' ||
											payTypeCode === 'LB' ||
											payTypeCode === 'ALB' ||
											payTypeCode === 'AP' ||
											payTypeCode === 'OA' ||
											payTypeCode === 'WC' ||
											payTypeCode === 'QQ' ||
											payTypeCode === 'JDP' ||
											payTypeCode === 'CC' ||
											payTypeCode === 'PPB' ||
											payTypeCode === 'CTC' ||
											payTypeCode === "BC" ||
											payTypeCode === "BCM"
										) {
											!depositMoneyDecimal.test(value) && callback('金额格式错误，最高保留1至2位小数');
										} else {
											!depositMoneyInt.test(value) && callback('金额格式错误');
										}
										if (value < setting.minBal) {
												callback(`最低存款金额 ${minBal} 元`);
										}
										if (value > setting.maxBal && hasMaxMoney) {
												callback(`最高存款金额 ${maxBal} 元`);
										}
										if (payTypeCode === 'UP'|| payTypeCode === 'BC'||payTypeCode === 'BCM') {
											const oddReg = /(\d*[34567]$)/;
											const isDecimal = String(value).includes(".")
											const isDecimalZero = isDecimal && Number(String(value).split(".")[1]) === 0
											if(!isDecimal || isDecimalZero ){
												// 只驗證整數部分
												if(!oddReg.test(String(value).split(".")[0])){
													callback('金额尾数必须为 3 , 4 , 5 , 6 , 7');
												}
											}
										}
										if (
											this.uniqueAmountStatus &&
											value.toString().substr(-1) === '0' &&
											(payTypeCode !== 'CTC' && payTypeCode !== "BC" && payTypeCode !== "BCM")
										) {
											if (
												(payTypeCode === 'WC' && setting.methodCode === 'WCBnBQR') ||
												(payTypeCode === 'OA' && setting.methodCode === 'AliBnBQR')
											) {
												callback('请您输入非整数的金额进行存款');
											} else {
												callback('金额必须以1-9结尾');
											}
										}
									}
										callback();
								}
							}
						]
					})(
						<Input
							size="large"
							placeholder={`${!isCTC
								? `单笔存款范围:${minBal}-${maxBal},每日可存款${transferNumber}次`
								: `单笔存款 最低：${minBal}元起, 最高：${maxBal}元`}`}
							autoComplete="off"
							maxLength={20}
							onChange={(value) => {
								this.props.onChange && this.props.onChange(value.target.value);
								
								if (!this.Needlist.includes(payTypeCode)) return;
								const reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
								if (reg.test(value.target.value)) {
									this.Testamount(value.target.value, payTypeCode);
								}else{
									this.Testamount(value.target.value.slice(0,-1), payTypeCode);
								}
							}}
							// 控制是否顯示金額輸入框
							// className={this.state.isSR ? 'hide' : ''}
							
							// onClick={() => {
							// 	if (this.state.BeforeDepositVerify) {
							// 		Router.push('/BeforeDepositVerify');
							// 	}
							// }}
						/>
					)}

					{!this.props.getFieldError('money') &&
						((payTypeCode === 'WC' && setting.methodCode === 'WCBnBQR') ||
							(payTypeCode === 'OA' && setting.methodCode === 'AliBnBQR')) &&
						this.smilePayInfoUI()}

					{/* 新需求 推荐金额 */}
					{this.Needlist.includes(payTypeCode) &&
					this.state.SuggestedAmount != '' && (
						<div className="SuggestedAmountDiv">
							<div className="arrow" />
							<p>请选择以下存款金额以便快速到账</p>
							<ul>
								{this.state.SuggestedAmount.map((value, index) => {
									return (
										<li
											className={`${this.state.Amountvalue == value}`}
											onClick={() => {
												setFieldsValue({
													money: value
												});
												this.setState({
													Amountvalue: value,
													SuggestedAmounthide: true,
													SuggestedAmount: '',
													isSetAmountFromSuggested: true 
												});
											}}
											key={value}
										>
											{value}
										</li>
									);
								})}
							</ul>
						</div>
					)}

					{/* SR 小額存款是否顯示建議金額 */}
					{/* {this.state.isSR ? (
						<div className="SRSuggestedAmountDiv" key={JSON.stringify(SR_SuggestedAmounts)}>
							<ul>
								{SR_SuggestedAmounts.map((info, index) => {
									return (
										<li
											className={
												`${this.state.Amountvalue == info.amount}` +
												`${info.isActive ? '' : ' disabled'}`
											}
											onClick={() => {
												setFieldsValue({
													money: info.amount
												});
												this.setState({
													Amountvalue: info.amount
												});
											}}
											key={info.amount}
										>
											¥ {info.amount}
										</li>
									);
								})}
							</ul>
							{SR_cannot_deposit ? <div className="cannotdeposit">目前没有适合的金额，请尝试使用不同的存款提交方法</div> : null}
						</div>
					) : null} */}
				</Item>

				{setting &&
				setting.vendorCharges && (
					<div className="modal-prompt-info">
						<b>温馨提示：此交易将征收第三方手续费，请于提交后确认交易详情，再进行转帐。</b>
					</div>
				)}

				{setting &&
				setting.charges < 0 &&
				Boolean([ 'PPB', 'BCM', 'UP', 'JDP', 'QQ', 'BC', 'WCLB' ].find((v) => payTypeCode.includes(v))) && (
					<div className="modal-prompt-info">
						温馨提示：使用{payMethodList.find((v) => v.code == payTypeCode).name}进行存款，第三方平台将征收手续费{' '}
						{Math.abs(setting.charges * 100).toFixed(2)}%。
					</div>
				)}
				{/* <div className="modal-prompt-info">{`单笔最低金额 ${minBal} 元${hasMaxMoney ? ` ，最高金额 ${maxBal} 元，每日总允许金额 ${formatAmount(setting.DayBal)} 元` : ""}。`}</div> */}
				{setting.charges !== 0 && (
					<Item label={`实际到账`} className="">
						<Input
							size="large"
							placeholder={``}
							value={
								parseFloat(this.state.Amountvalue) +
									parseFloat(setting.charges * this.state.Amountvalue) || ''
							}
							disabled
							autoComplete="off"
							maxLength={20}
						/>
					</Item>
				)}
			</React.Fragment>
		);
	}
}
export default MoneyInput;

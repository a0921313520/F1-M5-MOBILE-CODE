import React from 'react';
import Layout from '$SBTWO/Layout';
import { createForm } from 'rc-form';
import Button from '$SBTWO/Button';
import Input from '$SBTWO/Input';
import Toast from '$SBTWO/Toast';

import Modal from '$SBTWO/Modal';
import Drawer from '$SBTWO/Drawer';
import Popover from '$SBTWO/Popover';
import { ReactSVG } from '$SBTWO/ReactSVG';
import { TransferSubmit, PromoPostApplications } from '$SBTWOLIB/data/wallet';
import BonusList from '$SBTWO/Deposit/depositComponents/TargetAccount/BonusList';
import Item from '$SBTWO/Deposit/depositComponents/Item';
import { Cookie, getE2BBValue, redirectToDeposit } from '$SBTWOLIB/js/util';
import { GetAllBalance } from '$SBTWOLIB/data/wallet';
import Collapse, { Panel } from 'rc-collapse';
import Chinese from '$SBTWOLIB/data/platform.chinese.code.static';
import { ApiPort } from '$SBTWOLIB/SPORTAPI';
import { fetchRequest } from '$SBTWOLIB/SportRequest';
import Router from 'next/router';
import { connect } from 'react-redux';
import { ACTION_UserInfo_updateBalanceSB } from '@/lib/redux/actions/UserInfoAction';
import SelfExclusionModal from '$SBTWO/SelfExclusion';

class Transfer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fromWalletList: [],
			formVal: '',
			fromWalletObj: [],

			toWalletList: [],
			toVal: 'SB',
			toWalletObj: [],

			bonusVal: 0, // 可申请优惠Val值
			bonusName: '', // 可申请优惠名称
			isShowInfo: false,
			formShow: false,
			toShow: false,
			otherWalletList: [],
			otherWalletTotal: 0,
			btnStatus: false,
			SbUnderMaintenance: false,
			previewMessage: '',
			bonusUrlCode: 0,
			Bonusdata: '',
			Amountvalue: 0
		};
		this.defaultToWallet = 'MAIN';
		this.handleTransfer = this.handleTransfer.bind(this); // 一键转账
	}
	componentDidMount() {
		//自我限制
		if (this.hasSelfExclusion && this.hasSelfExclusion(2)) {
			return;
		}

		this.getWalletAndBalance();
		const { id } = Router.router.query;
		if (id) {
			this.setState({
				bonusVal: Number(id)
			});
		}
	}
	CallBonusdata = (data) => {
		const { bonusVal } = this.state;
		const defaultval = data.find((Item) => Item.id == bonusVal);
		this.setState({
			Bonusdata: data,
			Bonusdefault: defaultval
		});
	};
	componentWillUnmount() {
		Toast.destroy();
	}
	getWalletAndBalance = () => {
		Toast.loading();
		GetAllBalance((jsonData) => {
			const res = jsonData.result;
			//更新redux的SB餘額
			const newBalanceSBs = res ? res.filter((v) => v && v.name === 'SB') : [];
			if (newBalanceSBs && newBalanceSBs.length > 0) {
				this.props.userInfo_updateBalanceSB(newBalanceSBs[0].balance);
			}

			//改由balance獲取wallet清單
			this.walletMap = {};
			const walletList = res.filter((v) => v && v.name !== 'TotalBal').map((v) => {
				this.walletMap[v.name] = v.localizedName;
				return { key: v.name, name: v.localizedName };
			});

			this.setState(
				{
					fromWalletList: walletList,
					toWalletList: walletList,
					balanceList: res,
					toVal: res.filter((v) => v.name === 'SB')[0].name,
					otherWalletList: res.filter(
						(v) =>
							(v.state === 'UnderMaintenance' || v.balance !== 0) &&
							v.name !== 'SB' &&
							v.name !== 'TotalBal'
					),
					SbUnderMaintenance: res.find((v) => v.name === 'SB').state === 'UnderMaintenance'
				},
				() => {
					if (this.state.fromWalletList.some((v) => v.key === 'MAIN')) {
						if (this.state.formVal) {
							this.setState({
								formVal: this.state.formVal
							});
						} else {
							this.setState({
								formVal: 'MAIN'
							});
						}
					}
					this.calcOtherWalletTotal();
				}
			);
			Toast.destroy();
			if (!this.isTransferDisable()) {
				this.props.form.validateFields([ 'money' ]);
			}
		});
		const PREFER_WALLET = localStorage.getItem('PreferWallet');
		if (this.state.formVal !== PREFER_WALLET) {
			this.defaultToWallet = PREFER_WALLET;
			this.setState({ toVal: PREFER_WALLET });
		}
	};

	handleTransfer(type, tomain) {
		Toast.loading();
		const isAllTransfer = typeof type === 'string';
		TransferSubmit(
			{
				fromAccount: isAllTransfer ? 'ALL' : tomain ? 'SB' : this.state.formVal,
				toAccount: tomain ? 'MAIN' : 'SB',
				amount: isAllTransfer ? 0 : type.money,
				bonusId: isAllTransfer ? 0 : this.state.bonusVal,
				bonusCoupon: isAllTransfer ? '' : type.bonusCode,
				blackBoxValue: getE2BBValue()
				//e2BlackBoxValue: getE2BBValue(),
			},
			(res) => {
				Toast.destroy();
				if (res && res.result) {
					// 0 – failed 失败
					// 1 - success 成功
					// 2 – pending  等待
					if (res.result.status == 1) {
						Toast.success('转账成功!', 1);
						this.props.form.resetFields();
						setTimeout(() => {
							this.getWalletAndBalance();
						}, 1000);

						const { bonusVal } = this.state;
						if (bonusVal && bonusVal != 0) {
							PromoPostApplications(
								{
									bonusId: bonusVal,
									amount: isAllTransfer ? 0 : type.money,
									bonusMode: 'Transfer',
									targetWallet: 'SB',
									couponText: '',
									isMax: false,
									transferBonus: {
										fromWallet: isAllTransfer ? 'ALL' : this.state.formVal,
										transactionId: res.result.transferId
									},
									successBonusId: res.result.successBonusId,
									blackBox: getE2BBValue()
									//blackBoxValue: getE2BBValue(),
									//e2BlackBoxValue: getE2BBValue(),
								},
								(res) => {
									console.log(res);
									// if (res.message == 'fun88_BonusApplySuccess') {
									// 	Router.push(`/transfer/promostatus`);
									// }
								}
							);
						}
					} else {
						if (
							res.result.status == 2 &&
							res.result.selfExclusionOption &&
							res.result.selfExclusionOption.isExceedLimit &&
							this.setSelfExclusionModalOpen
						) {
							//自我限制彈窗
							this.setSelfExclusionModalOpen();
						} else {
							Toast.error(res.result.messages, 1);
						}
					}
				} else {
					Toast.error('转账出错，稍后重试！');
				}
			}
		);

		switch (type) {
			case 'MAIN':
				// Pushgtagdata(`Collectalltomain_1`, 'click', `tranfer_transfer`);
				break;
			case 'SB':
				// Pushgtagdata(`BTiIMSPIMESTF_1`, 'click', `tranfer_transfer`);
				break;
			case 'KYG':
				// Pushgtagdata(`KYGP2P_1`, 'click', `tranfer_transfer`);
				break;
			case 'PT':
				// Pushgtagdata(`PT_1`, 'click', `tranfer_transfer`);
				break;
			case 'AG':
				// Pushgtagdata(`Fishing2slot_1`, 'click', `tranfer_transfer`);
				break;
			case 'SB':
				// Pushgtagdata(`SPsport__1`, 'click', `tranfer_transfer`);
				break;
			case 'LD':
				// Pushgtagdata(`Live__1`, 'click', `tranfer_transfer`);
				break;
			case 'BOY':
				// Pushgtagdata(`BYkeno_1`, 'click', `tranfer_transfer`);
				break;
			case 'P2P':
				// Pushgtagdata(`BoleP2P_1`, 'click', `tranfer_transfer`);
				break;
			case 'SLOT':
				// Pushgtagdata(`Slot__1`, 'click', `tranfer_transfer`);
				break;
			case 'KENO':
				// Pushgtagdata(`VRkeno_1`, 'click', `tranfer_transfer`);
				break;
			default:
				break;
		}
	}
	handleSubmit = (e) => {
		e.preventDefault();
		if (!this.state.btnStatus || this.isTransferDisable()) return;

		this.props.form.validateFields((err, values) => {
			if (!err) {
				console.log(values);
				this.handleTransfer(values);
			}
		});
		// Pushgtagdata(`Transfer`, 'Submit', `Transfer_normal`);
	};

	oneClickTransfer = () => {
		if (this.isTransferDisable()) return;
		this.handleTransfer('ALL');
		// Pushgtagdata(`Transfer`, 'Submit', `Transfer_oneclick`);
	};

	isTransferDisable = () => {
		return this.state.otherWalletTotal <= 0;
	};

	calcOtherWalletTotal = () => {
		const { otherWalletList } = this.state;
		if (!otherWalletList.length) {
			this.setState({
				otherWalletTotal: 0
			});
			return;
		}
		const otherBal = otherWalletList.reduce(function(a, b) {
			return { balance: a.balance + b.balance };
		}).balance;

		this.setState({
			otherWalletTotal: otherBal
		});
	};

	fromWalletUI = () => {
		const { fromWalletList, otherWalletList } = this.state;
		if (!fromWalletList || !otherWalletList) return;
		let result = [];

		fromWalletList.forEach((x) => {
			otherWalletList.forEach((y) => {
				if (x.key === y.name) {
					result.push({
						key: x.key,
						name: y.name === 'P2P' ? '双赢棋牌' : x.name,
						balance: y.balance
					});
				}
			});
		});

		return result.map((value) => {
			return (
				<li
					className="cap-item"
					key={'formWallet' + value.key}
					onClick={() => {
						this.props.form.setFieldsValue({
							money: this.formatMoney(value.balance, 2)
						});
						this.setState(
							{
								formVal: value.key,
								formValObj: value,
								Amountvalue: value.balance
							},
							() => this.checkBtnStatus()
						);
					}}
				>
					<div>{value.name}</div>
					<div>
						<span className="money-small-icon">￥</span>
						<span>{this.formatMoney(value.balance, 2)}</span>
						<div className={`cap-item-circle${value.key === this.state.formVal ? ' curr' : ''}`} />
					</div>
				</li>
			);
		});
	};

	checkBtnStatus = () => {
		let errors = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		if (this.props.form.getFieldValue('money') !== '' && !errors) {
			this.setState({
				btnStatus: true
			});
		} else {
			this.setState({
				btnStatus: false
			});
		}
	};

	checkInsufficientBalance = (value) => {
		const { balanceList, formVal } = this.state;
		const formBal = balanceList.filter((v) => v.name === formVal)[0].balance;
		return parseInt(formBal) - parseInt(value) < 0;
	};

	onFormChange = (e) => {
		setTimeout(() => {
			this.checkBtnStatus();
		}, 0);
	};

	/*
    * formatMoney(s,type)
    * 功能：金额按千位逗号分割
    * 参数：s，需要格式化的金额数值.
    * 参数：type,判断格式化后的金额是否需要小数位.
    * 返回：返回格式化后的数值字符串.
    */
	formatMoney = (s, type) => {
		if (/[^0-9\.]/.test(s)) return '0.00';
		if (s == null || s == '') return '0.00';
		s = s.toString().replace(/^(\d*)$/, '$1.');
		s = (s + '00').replace(/(\d*\.\d\d)\d*/, '$1');
		s = s.replace('.', ',');
		var re = /(\d)(\d{3},)/;
		while (re.test(s)) s = s.replace(re, '$1,$2');
		s = s.replace(/,(\d\d)$/, '.$1');
		if (type == 0) {
			// 不带小数位(默认是有小数位)
			var a = s.split('.');
			if (a[1] == '00') {
				s = a[0];
			}
		}
		return s;
	};

	//检查优惠是否可用
	bonusChange = (id, money) => {
		if (!money || money == '') {
			return;
		}
		if (id == 0) {
			return;
		}
		let data = {
			transactionType: 'Transfer',
			bonusId: id,
			amount: money,
			wallet: 'SB',
			couponText: 'string'
		};
		Toast.loading('确认优惠中...', 200);
		fetchRequest(ApiPort.PromoCalculate, 'POST', data)
			.then((data) => {
				Toast.destroy();
				if (data && data.result) {
					if (data.result.previewMessage && data.result.previewMessage != '') {
						this.setState({
							previewMessage: data.result.previewMessage
						});
					} else if (data.result.message && data.result.message != '') {
						this.setState({
							previewMessage: data.result.message
						});
					}
				}
			})
			.catch((e) => {
				console.log('====bonusChange error', e);
				Toast.destroy();
			});
	};

	render() {
		const { getFieldDecorator, getFieldValue, getFieldError } = this.props.form;
		console.log(this.props.form);
		const {
			fromWalletList,
			toWalletList,
			balanceList,
			otherWalletList,
			otherWalletTotal,
			btnStatus,
			SbUnderMaintenance,
			previewMessage,
			bonusVal,
			Bonusdata,
			Bonusdefault,
			Amountvalue
		} = this.state;
		console.log(this.state);
		let MessageCss =
			previewMessage != ''
				? {
						color: 'red',
						background: '#ececec',
						padding: '0.2703rem',
						borderRadius: '0.1351rem',
						fontSize: '12px',
						lineHeight: '15px',
						marginBottom: '10px'
					}
				: null;
		const MainBal = balanceList ? balanceList.filter((v) => v.name === 'MAIN')[0].balance : 0;
		return (
			<Layout BarTitle="转账" status={10} hasServer={true} barFixed={true}>
				{/* 自我限制彈窗 轉帳功能阻擋 這裡不使用在layout的全局實體，因為點擊"知道了"按鈕後，需要跳轉回首頁 */}
				<SelfExclusionModal
					ModalType={1}
					proxyHasSelfExclusion={(func) => (this.hasSelfExclusion = func)}
					afterCloseModal={() => {
						Router.push('/sbtwo');
					}}
				/>
				{/* 自我限制彈窗 轉帳限額 由api返回錯誤訊息發起 */}
				<SelfExclusionModal
					ModalType={2}
					proxySetModalOpen={(func) => (this.setSelfExclusionModalOpen = func)}
				/>
				<div className="transfer-balance-wrap" style={{ display: bonusVal != 0 ? 'none' : 'block' }}>
					<div className="balance-box-wrap">
						<div className="ant-col ant-col-4">
							<div className="tran-top-tit">总余额</div>
							<div className="money-wrap">
								<span className="money-small-icon">￥</span>
								<span>
									{balanceList && balanceList.length ? (
										this.formatMoney(balanceList.find((v) => v.category === 'TotalBal').balance, 2)
									) : (
										this.formatMoney(0, 2)
									)}
								</span>
							</div>
						</div>
						<div className="ant-col ant-col-6">
							<div className="tansfer-tool-child">
								<div style={{ display: 'flex' }}>
									<ReactSVG
										onClick={() => {
											this.setState({
												isShowInfo: !this.state.isShowInfo
											});
										}}
										className="tansfer-tool-child info"
										src="/img/svg/TransferInfo.svg"
									/>
									<div className="tran-top-tit">体育/电竞</div>
								</div>
								<div className="money-wrap" style={{ paddingLeft: '26px' }}>
									<span className="money-small-icon">{!SbUnderMaintenance && '￥'}</span>
									<span>
										{balanceList && balanceList.length ? SbUnderMaintenance ? (
											'维护中'
										) : (
											this.formatMoney(balanceList.find((v) => v.name === 'SB').balance, 2)
										) : (
											this.formatMoney(0, 2)
										)}
									</span>
								</div>
							</div>
							<ReactSVG
								className={`tansfer-tool-child right ${this.isTransferDisable()
									? 'balance-box-disable'
									: ''}`}
								src="/img/svg/Transfer.svg"
								onClick={this.oneClickTransfer}
							/>
							<Popover
								direction="top"
								className="transfer-popover"
								visible={this.state.isShowInfo}
								onClose={() => {
									this.setState({ isShowInfo: false });
								}}
							>
								<span>包含沙巴体育, BTi体育, IM体育和电竞</span>
							</Popover>
						</div>
					</div>
					<Collapse>
						<Panel
							disabled={this.isTransferDisable()}
							header={
								<div className="balance-list-collapse">
									<span>其它钱包</span>
									<span
										className={
											this.isTransferDisable() ? 'money-wrap isTransferDisable' : 'money-wrap'
										}
									>
										<span className="money-small-icon">￥</span>
										<span>{this.formatMoney(otherWalletTotal, 2)}</span>
										{!this.isTransferDisable() && (
											<ReactSVG className="callapse-arrow-icon" src="/img/svg/LeftArrow.svg" />
										)}
									</span>
								</div>
							}
						>
							<div className="card-balance-wrap">
								{otherWalletList && otherWalletList.length ? (
									otherWalletList.map((val, index) => {
										return (
											<div className="balance-box" key={'walletTransfer' + index}>
												<div>{val.localizedName}</div>
												{val.state === 'UnderMaintenance' ? (
													<div>维护中</div>
												) : (
													<div>
														<span className="money-small-icon">￥</span>
														{this.formatMoney(val.balance, 2)}
													</div>
												)}
											</div>
										);
									})
								) : null}
							</div>
						</Panel>
					</Collapse>
				</div>
				<div className="transfer-form-wrap">
					<div className="transfermaintxt" style={{ display: bonusVal != 0 ? 'block' : 'none' }}>
						温馨提示：请先点击一键转账将账户余额转账至主账户后，再转账申请此红利
					</div>
					<div className="row">
						<div className="ant-col ant-col-4_5">
							<Item label="源自账号">
								<div
									className={`rc-select rc-select-single rc-select-show-arrow
                                        ${this.isTransferDisable() ? 'disable-status' : ''}`}
								>
									<div
										className="rc-select-selector"
										onClick={(e) => {
											this.isTransferDisable()
												? null
												: this.setState({
														formShow: true
													});
										}}
									>
										<span className="rc-select-selection-placeholder">
											{this.state.formVal ? (
												<span>
													{this.walletMap && this.walletMap[this.state.formVal] ? (
														this.walletMap[this.state.formVal]
													) : (
														''
													)}
													￥
													{balanceList && balanceList.length ? (
														this.formatMoney(
															balanceList.find((v) => v.name === this.state.formVal)
																.balance,
															2
														)
													) : (
														this.formatMoney(0, 2)
													)}
												</span>
											) : (
												'请选择来源账户'
											)}
										</span>
									</div>
									{this.state.formVal == 'MAIN' && bonusVal != 0 ? (
										<ReactSVG
											onClick={() => {
												if (MainBal != 0) return;
												const { balanceList, formVal } = this.state;
												const Bal = balanceList.filter((v) => v.name === 'SB')[0].balance;
												this.handleTransfer(
													{
														money: Bal,
														bonusCode: 0
													},
													true
												);
											}}
											className="rc-select-main"
											src={`/img/svg/TransferMain${MainBal != 0 ? 'Null' : ''}.svg`}
											style={{
												width: '18px'
											}}
										/>
									) : (
										<span className="rc-select-arrow" unselectable="on">
											<span className="rc-select-arrow-icon" />
										</span>
									)}
								</div>
							</Item>
						</div>
						<ReactSVG className="transfer-to-icon ant-col ant-col-1 center" src="/img/svg/TransferArrow.svg" />
						<div className="ant-col ant-col-4_5">
							<Item label="目标账户">
								<div className="rc-select disable-status">
									<div className="rc-select-selector">
										体育/电竞
										{!SbUnderMaintenance && '￥'}
										{balanceList && balanceList.length ? SbUnderMaintenance ? (
											' 维护中'
										) : (
											this.formatMoney(balanceList.find((v) => v.name === 'SB').balance, 2)
										) : (
											this.formatMoney(0, 2)
										)}
									</div>
								</div>
							</Item>
						</div>
					</div>
					<Item label="金额" errorMessage={getFieldError('money')}>
						{getFieldDecorator('money', {
							getValueFromEvent: (event) => {
								return event.target.value
									.replace(/[^\d.]/g, '')
									.replace(/\.{2,}/g, '.')
									.replace('.', '$#$')
									.replace(/\./g, '')
									.replace('$#$', '.');
							},
							rules: [
								{ required: true, message: '请输入转帐金额' },
								{
									validator: (rule, value, callback) => {
										console.log(value);
										if (value && value == 0) {
											callback('转账金额必须在为0.01与1000000.00');
										}
										// 必須是數字，可帶兩位小數（一位和超過三位都不行）
										if (value && !/^\d+(\.\d{2})?$/.test(value)) {
											callback('转帐金额格式若有小数点，需完整填写小数点后两位，例如: ¥100.10');
										}
										this.setState({
											Amountvalue: value
										});
										if (value && this.checkInsufficientBalance(value)) {
											callback('余额不足');
										}
										this.bonusChange(this.state.bonusVal, value);
										callback();
									}
								}
							]
						})(
							<Input
								disabled={this.isTransferDisable()}
								className={this.isTransferDisable() ? 'trasferInput-disable' : ''}
								onChange={(e) => this.onFormChange(e)}
								size="large"
								autoComplete="off"
								placeholder="输入金额"
							/>
						)}
					</Item>
					<BonusList
						getFieldDecorator={getFieldDecorator}
						getFieldValue={getFieldValue}
						bonusVal={this.state.bonusVal}
						setBonusValue={(v, name) => {
							this.props.form.validateFields((err, values) => {
								if (!err) {
									this.bonusChange(v, values.money);
								}
							});
							const defaultval = Bonusdata.find((Item) => Item.id == v);
							this.setState({ bonusVal: v, bonusName: name, Bonusdefault: defaultval });
						}}
						targetValue={this.state.toVal}
						ispromo={bonusVal && bonusVal != 0 ? true : false}
						CallBonusdata={(e) => this.CallBonusdata(e)}
						type={'transfer'}
					/>

					{/* --------优惠检查错误信息展示------- */}
					<p style={MessageCss}>{previewMessage}</p>

					{Bonusdefault &&
					bonusVal != 0 && (
						<div className="PromoContent">
							<label>{Bonusdefault.title}</label>
							<div className="list">
								<div>
									<label>申请金额</label>
									<div>￥{Amountvalue && Amountvalue != 0 ? Amountvalue : 0}</div>
								</div>
								<div>
									<label>可得红利</label>
									<div>
										￥{Amountvalue && Amountvalue != 0 ? (
											Number(Amountvalue) * Bonusdefault.givingRate
										) : (
											0
										)}
									</div>
								</div>
								<div>
									<label>所需流水</label>
									<div>
										{Amountvalue && Amountvalue != 0 ? (
											(Number(Amountvalue) + Number(Amountvalue) * Bonusdefault.givingRate) *
											Bonusdefault.releaseValue
										) : (
											0
										)}
									</div>
								</div>
							</div>
						</div>
					)}
					<div
						className={`btn-wrap ${!btnStatus || this.isTransferDisable() ? 'btn-disable' : ''}`}
						style={{ marginTop: '24px' }}
					>
						<Button size="large" onClick={this.handleSubmit}>
							提交
						</Button>
					</div>
					<Button
						size="large"
						onClick={() => {
							redirectToDeposit(`id=${bonusVal}&wallet=SB`);
						}}
						className="_Todeposit"
					>
						存款
					</Button>
				</div>
				{fromWalletList.length ? (
					<Drawer
						style={{ height: '70%' }}
						direction="bottom"
						className="transfer-drawer"
						onClose={() => {
							this.setState({ formShow: false });
						}}
						visible={this.state.formShow}
					>
						<h2 className="transfer-drawer-tit">源自账号</h2>
						<ul className="cap-list small-circle cap-distance">{this.fromWalletUI()}</ul>
					</Drawer>
				) : null}
			</Layout>
		);
	}
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
	userInfo_updateBalanceSB: (newBalanceSB) => ACTION_UserInfo_updateBalanceSB(newBalanceSB)
};

export default connect(mapStateToProps, mapDispatchToProps)(createForm({ fieldNameProp: 'transfer' })(Transfer));

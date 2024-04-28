import React from 'react';
import Layout from '@/components/Layout';
import { createForm } from 'rc-form';
import Button from '@/components/View/Button';
import Input from '@/components/View/Input';
import Toast from '@/components/View/Toast';
import Tabs, { TabPane } from 'rc-tabs';
import Drawer from '@/components/View/Drawer';
import { ReactSVG } from '@/components/View/ReactSVG';
import { GetWalletList, TransferSubmit, PromoPostApplications } from '@/api/wallet';
import BonusList from '@/components/Transfer/BonusList';
import Item from '@/components/Deposit/depositComponents/Item';
import { numberWithCommas, getE2BBValue } from '@/lib/js/util';
import { ApiPort } from '@/api/index';
import { fetchRequest } from '@/server/Request';
import Router, { withRouter } from 'next/router';
import { connect } from 'react-redux';
import Service from '@/components/Header/Service';
import { ACTION_UserInfo_getBalance } from '@/lib/redux/actions/UserInfoAction';
import Flexbox from '@/components/View/Flexbox/';
import classNames from 'classnames';
import Skeleton from 'react-loading-skeleton';
import { BsFillCircleFill } from 'react-icons/bs';
import Popover from '@/components/View/Popover';
import Announcement from '@/components/Announcement/';
import SelfExclusionModal from '@/components/SelfExclusionModal/';
import UnfinishedGamePopUp from '@/components/Transfer/UnfinishedGamePopUp/';
import ReactIMG from '@/components/View/ReactIMG';
import Vipcustomerservice from '@/components/Header/Vipcustomerservice';
import {pickNotNumberAllowDecimal, moneyAmountAllow2Decimal} from "@/lib/SportReg"
import { walletIconColor } from '@/lib/data/DataList';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/transfer'); //參數帶本頁的路徑
}
const content = {
	left: (
		<div className="">
			<ReactSVG
				className="back-icon"
				src="/img/svg/LeftArrow.svg"
				onClick={() => {
					history.go(-1);
				}}
			/>
		</div>
	),
	right: (
		<div
			className="header-tools-wrapper" 
			onClick={()=>{Pushgtagdata(`Transfer`, 'Contact CS', 'Transfer_C_CS')}}
		>
			<Service />
		</div>
	)
};
class Transfer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fromWalletList: [],
			toWalletList: [],
			toVal: '',
			bonusVal: 0, // 可申请优惠Val值
			bonusName: '', // 可申请优惠名称
			isShowInfo: false,
			formShow: false,
			otherWalletList: [],
			otherWalletTotal: 0,
			btnStatus: false,
			SbUnderMaintenance: false,
			previewMessage: '',
			Bonusdata: '',
			TabsKey: '1',
			isShowInfo: false,
			visiblePopUp: false,
			feedbackModal: false,
			isVIP: false,
			isFromPromotion: false, //是否來自bonus Promotion申請
			isShowOneClick: false, //是否show oneclick icon、note (僅來自promotion)
			drawerSelectedWallet:null, //fromWallet, toWallet 所選wallet code,
			isPromotionApplySuccess:false, //是否申請Promotion成功?
		};
		this.defaultToWallet = 'MAIN';
		this.handleTransfer = this.handleTransfer.bind(this); // 一键转账
	}
	componentDidMount() {
		this.GetBalance();
		//获取账户列表
		this.getWallet();
		//获取钱包余额
		this.props.userInfo_getBalance(true);
		//检测申请优惠相关
		const { bonus, wallet } = this.props.router.query;
		if (bonus && wallet) {
			this.setState({
				TabsKey: '2',
				toVal: wallet,
				bonusVal: Number(bonus),
				isFromPromotion : !!bonus
			});
		}else{
			global.Pushgtagpiwikurl && global.Pushgtagpiwikurl("transfer","Transfer Page")
		}

		let CheckAnnouncement = !localStorage.getItem('TransferPagelocalStorageAnnouncement');
		this.setState({
			CheckAnnouncement: CheckAnnouncement
		});
		window.Pushgtagdata && Pushgtagdata(window.location.origin, 'Launch', `transfer`);
		if (!!localStorage.getItem('memberInfo') && JSON.parse(localStorage.getItem('memberInfo')).isVIP) {
			this.setState({ isVIP: true });
		}
	}

	componentWillUnmount() {
		Toast.destroy();
	}

	//监听余额变化
	componentDidUpdate(prevProps) {
		if (prevProps.userInfo.BalanceInit !== this.props.userInfo.BalanceInit) {
			this.GetBalance();
		}
	}

	onClickTabs = (key) => {
		Pushgtagdata("Promotion", `Switch to ${key==='1' ? "One Click Transfer" : "Common Transfer"}`, `Transfer_C_${key==='1' ? "OneClickTransfer" : "Common_Transfer"}`);
		this.setState({
			TabsKey: key
		});
	};

	/**
	 * @description: 获取优惠数据
	 * @param {*} data
	 * @return {*}
  	*/
	CallBonusdata = (data) => {
		const { balanceList, bonusVal, toVal, isFromPromotion } = this.state;
		const defaultval = data.find((Item) => Item.id == bonusVal);
		const MainBal = balanceList?.filter((v) => v.name === 'MAIN')[0].balance || 0;
		const vendorsBal = balanceList?.filter((v) => v.name === "TotalBal")[0].balance - MainBal || 0;
		const isShowOneClick = MainBal <= defaultval?.minAccept && vendorsBal >= defaultval?.minAccept

		if(bonusVal && !defaultval?.id){
			if(defaultval===undefined){
				Toast.error(`Cannot find id:${bonusVal} bonus from Bonus?transactionType=Transfer&wallet=${toVal} response (FE)`, 3)
			}else if(isFromPromotion && !defaultval.id){
				Toast.error(`There is no bonus gonna be applied, because promotion bonus id = 0 (FE)`, 3)
			}
		}

		this.setState({
			Bonusdata: data,
			Bonusdefault: defaultval,
			isShowOneClick: isShowOneClick,
			formVal: isShowOneClick ? "MAIN" : this.state.formVal,
			drawerSelectedWallet: isShowOneClick ? "MAIN" : this.state.formVal,
		});
	};

	/**
	 * @description: 获取账户列表
	 * @return {*}
	*/
	getWallet = () => {
		//const hide = Toast.loading();
		GetWalletList((res) => {
			if (res.result) {
				// 尚不確定普通轉帳時的來源帳戶是否會優先選取設定的preferWallet，先改為MAIN
				// 若確定顯示preferWallet，可改用後方註解的localStorage...
				const PREFER_WALLET = ""; // localStorage.getItem('PreferWallet');
				PREFER_WALLET && (this.defaultToWallet = PREFER_WALLET);
				this.setState({ 
					fromWalletList: res.result.fromWallet, 
					toWalletList: res.result.toWallet,
					drawerSelectedWallet: this.state.isShowOneClick ? "" : (PREFER_WALLET || ""),
					formVal:this.state.isShowOneClick ? "" : (PREFER_WALLET || "")
				 }, () => {
				});
			}

			//hide();
		});
		//尚不確定Prefer Wallet與轉帳錢包之間的關係為何 先註解
		// const PREFER_WALLET = localStorage.getItem('PreferWallet');
		// if (this.state.formVal !== PREFER_WALLET) {
		// 	this.defaultToWallet = PREFER_WALLET;
		// 	this.setState({ toVal: PREFER_WALLET });
		// }
	};

	/**
	 * @description: 获取钱包余额
	 * @return {*}
	*/

	GetBalance() {
		const { BalanceInit } = this.props.userInfo;
		this.setState(
			{
				balanceList: BalanceInit,
				otherWalletList: BalanceInit.filter((v) => v.name !== 'TotalBal')
			},
			() => {
				this.calcOtherWalletTotal();
			}
		);
	}

	/**
	 * @description: 检查总余额是否等于0 
	 * @return {*}
	*/

	calcOtherWalletTotal = () => {
		const { otherWalletList } = this.state;
		console.log(otherWalletList);
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

	handleTransfer(type, Transferdata) {
		if(type==='ALL'){
			Pushgtagdata(
				`Transfer`, 
				'Transfer to Wallet', 
				'Transfer_C_Wallet', 
				false,
				[{
					customVariableKey: "Transfer_C_Wallet_GameType",
					customVariableValue: `Transfer_C_Walet_${Transferdata.name}`
				}]
			);
		}
		Toast.loading();
		let DATA =
			type == 'ALL'
				? {
						fromAccount: 'ALL',
						toAccount: Transferdata.name,
						amount: this.state.balanceList.find((item) => item.name == 'TotalBal').balance,
						bonusId: 0,
						bonusCoupon: '',
						blackBoxValue: getE2BBValue(),
						e2BlackBoxValue: getE2BBValue()
					}
				: {
						fromAccount: this.state.formVal,
						toAccount: this.state.toVal,
						amount: Transferdata.money,
						bonusId: this.state.bonusVal,
						bonusCoupon: Transferdata.bonusCode,
						blackBoxValue: getE2BBValue(),
						e2BlackBoxValue: getE2BBValue()
					};

		TransferSubmit(DATA, (res) => {
			Toast.destroy();
			if (res.isSuccess && res.result) {
				// status:
				// 1 - success 成功
				//		若result內:
				//      無bonusResult => 純轉帳
				//			bonusResult為空字串 => 轉帳成功/優惠申請失敗
				//			bonusResult為Success => 轉帳成功/優惠申請成功
				// 2 – failed 失败
				if (res.result.status == 1) {
					if(res.result.bonusResult==="Success"){
						Toast.success("Chuyển Quỹ Thành Công", 3); //取得紅利成功
						if(this.state.isFromPromotion){
							this.setState({isPromotionApplySuccess:true})
						}
					}else if(res.result.bonusResult===""){
						Toast.error("Chuyển Quỹ Không Thành Công", 3)  //取得紅利失敗
					}else{
						Toast.success("Chuyển Quỹ Thành Công", 3); //轉帳成功

					}
					this.props.form.resetFields();
					this.props.userInfo_getBalance(true);
					const { bonusVal } = this.state;
					if(type==="ALL"){
						this.setState({isShowOneClick:false})
					}else{
						Pushgtagdata(
							`Transfer`, 
							'Submit Transfer', 
							'Transfer_S_Wallet', 
							2,
							[{
								customVariableKey: false,
								customVariableValue: false
							},{
								customVariableKey: "Transfer_S_Wallet_GameType",
								customVariableValue: `Transfer_S_Wallet_${this.state.toVal}`
							}]
						);
					}
					return;
					if (bonusVal && bonusVal != 0) {
						PromoPostApplications(
							{
								bonusId: bonusVal,
								amount: Transferdata.money,
								bonusMode: 'Transfer',
								targetWallet: this.state.toVal,
								couponText: '',
								isMax: false,
								transferBonus: {
									fromWallet: this.state.formVal,
									transactionId: res.result.transferId
								},
								successBonusId: res.result.successBonusId,
								blackBox: getE2BBValue(),
								blackBoxValue: getE2BBValue(),
								e2BlackBoxValue: getE2BBValue()
							},
							(res) => {
								//console.log(res);
								if (
									res.isSuccess &&
									res.result.bonusResult &&
									res.result.bonusResult.message == 'Success'
								) {
									Router.push(`/transfer/promostatus`);
								} else {
									Toast.error(res.result.message);
								}
							}
						);
					}
				} else {
					if (
						res.result.status == 2 &&
						res.result.selfExclusionOption?.isExceedLimit
					) {
						//自我限制彈窗
						this.setState({
							showExceedLimit: true
						});
					} else if (res.result.status == 2 && res.result.unfinishedGamesMessages) {
						//未完成游戏列表弹窗
						if (res.result.unfinishedGames.length != 0) {
							//如果含有游戏列表
							this.setState({
								unfinishedGames: res.result.unfinishedGames
							});
						}
						this.setState({
							visiblePopUp: true,
							unfinishedGamesMessages: res.result.unfinishedGamesMessages
						});
					} else {
						Pushgtagdata(
							`Transfer`, 
							'Submit Transfer', 
							'Transfer_S_Wallet', 
							1,
							[{
								customVariableKey: `Transfer_S_Wallet_${this.state.toVal}_ErrorMsg`,
								customVariableValue: res.result.messages
							},{
								customVariableKey: "Transfer_S_Wallet_GameType",
								customVariableValue: `Transfer_S_Wallet_${this.state.toVal}`
							}]
						);
						Toast.error("Chuyển Quỹ Không Thành Công", 2); //轉帳失敗
					}
				}
			} else {
				Toast.error('转账出错，稍后重试！');
			}
		});
	}

	/**
	 * @description:提交转账
	 * @param {*} e
	 * @return {*}
  	*/

	handleSubmit = (e) => {
		e.preventDefault();
		if (!this.state.btnStatus || this.isTransferDisable()) return;
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.handleTransfer('', values);
			}
		});
		if (this.state.bonusVal != 0) {
			Pushgtagdata(`Transfer`, 'Submit', `Transfer_${this.state.bonusVal}`);
			return;
		}
	};

	/**
	 * @description: 一键转账
	 * @return {*}
  	*/

	oneClickTransfer = () => {
		if (this.isTransferDisable()) return;
		this.handleTransfer('ALL');
		Pushgtagdata(`Transfer`, 'Submit', `Transfer_oneclick`);
	};

	/**
	 * @description: 转账禁用
	 * @return {*}
  	*/

	isTransferDisable = () => {
		return this.state.otherWalletTotal <= 0;
	};

	/**
	 * @description: 来源账户列表
	 * @return {*}
  	*/

	fromWalletUI = () => {
		const { fromWalletList, otherWalletList, toWalletList, formVal, toVal, Opentype } = this.state;
		if (!fromWalletList || !otherWalletList) return;
		let result = [];
		let list = Opentype == 'form' ? fromWalletList : toWalletList;
		list.forEach((x) => {
			otherWalletList.forEach((y) => {
				if (x.key === y.name) {
					result.push({
						key: x.key,
						name: x.name,
						balance: y.balance,
						state:y.state
					});
				}
			});
		});
		return result.filter(
				item=>item.key !== (Opentype == 'form' ? toVal : formVal)
			).map((value, index) => {
			return (
				<React.Fragment key={'formWallet' + index}>
					<li
						className={classNames({
							["cap-item"]:true,
							maintenance:value.state==="UnderMaintenance"
						})}
						onClick={() => {
							if(value.state==="UnderMaintenance"){
								return
							}
							this.setState({
								drawerSelectedWallet:value.key
							})
						}}
					>
						<div className='wallet_name'>{value.name}</div>
						<div className='wallet_list_right_box'>
							<span className="wallet_amount">
								{value.state!=="UnderMaintenance"
									? `${numberWithCommas(value.balance, 2)} đ`
									: "อยู่ระหว่างปรับปรุง"
								}
							</span>
							{ value.state!=="UnderMaintenance" && (
								<div className={`cap-item-circle${this.state.drawerSelectedWallet === value.key ? ' curr' : ''}`} />
							)}
						</div>
					</li>
				</React.Fragment>
			);
		});
	};

	/**
	 * @description: 提交按钮检查
	 * @return {*}
	*/

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

	/**
	 * @description: 余额不足检查
	 * @param {*} value
	 * @return {*}
	*/
	checkInsufficientBalance = (value) => {
		const { balanceList, formVal } = this.state;
		const formBal = balanceList.filter((v) => v.name === formVal)[0].balance;
		return parseInt(formBal) - parseInt(value) < 0;
	};

	//输入金额检查
	onFormChange = (e) => {
		setTimeout(() => {
			this.checkBtnStatus();
		}, 0);
	};


	//检查优惠是否可用 // 依PM指示先註解掉但不刪除，以防後續追加此功能
	// bonusChange = (id, money) => {
	// 	if (!money || money == '') {
	// 		return;
	// 	}
	// 	if (id == 0) {
	// 		return;
	// 	}
	// 	let data = {
	// 		transactionType: 'Transfer',
	// 		bonusId: id,
	// 		amount: money,
	// 		wallet: this.state.toVal,
	// 		couponText: 'string'
	// 	};
	// 	Toast.loading('确认优惠中...', 200);
	// 	fetchRequest(ApiPort.PromoCalculate, 'POST', data)
	// 		.then((data) => {
	// 			Toast.destroy();
	// 			if (data.isSuccess) {
	// 				if (data.result.inPlan) {
	// 					this.setState({
	// 						previewMessage: data.result.message
	// 					});
	// 				} else {
	// 					this.setState({
	// 						previewMessage: data.result.previewMessage
	// 					});
	// 				}
	// 				// else if (data.result.errorMessage != '') {
	// 				// 	this.setState({
	// 				// 		previewMessage: data.result.errorMessage
	// 				// 	});
	// 				// }
	// 			}
	// 		})
	// 		.catch(() => {
	// 			Toast.destroy();
	// 		});
	// };

	TransferItem = (type) => {
		const { balanceList, formVal, toVal, isFromPromotion, isShowOneClick } = this.state;
		console.log(formVal, toVal, 'formVal, toVal')
		let val = type == 'form' ? formVal : toVal;
		const { bonus } = this.props.router.query;
		let promsStatus = bonus && type == 'to';
		console.log(balanceList);
		return (
			<div
				className={`rc-select rc-select-single rc-select-show-arrow
				${promsStatus || this.isTransferDisable() ? 'disable-status' : ''}`}
				key={type}
			>
				<div
					className="rc-select-selector"
					onClick={(e) => {
						if(isFromPromotion && type==='to'){
							return
						}
						this.isTransferDisable()
							? null
							: this.setState({
									formShow: true,
									drawerSelectedWallet: (formVal && type == 'form') ? this.state.formVal : (toVal && type == 'to') ? this.state.toVal : '',
									Opentype: type
								});



						if (formVal == '' && type === 'form') {
							let i = toVal != this.state.fromWalletList[0].key ? 0 : 1
							this.setState({
								formVal : this.state.fromWalletList[i].key,
								drawerSelectedWallet: this.state.fromWalletList[i].key
							})
						}
						if (toVal == '' && type === 'to') {				
							let i = formVal != this.state.toWalletList[0].key ? 0 : 1
							this.setState({
								toVal : this.state.toWalletList[i].key,
								drawerSelectedWallet: this.state.toWalletList[i].key
							})
						}
						if (type == 'to') {
							this.setState({
								toVal: val
							});
						}
					}}
				>
					<span className="rc-select-selection-placeholder">
						{val ? (
							<span>
								{balanceList && balanceList.find((v) => v.name === val).localizedName}{' '}
								{balanceList && balanceList.length ? (
									numberWithCommas(balanceList.find((v) => v.name === val).balance, 2)
								) : (
									numberWithCommas(0, 2)
								)}
								{' đ'}
							</span>
						) : (
							'Chọn tài khoản'
						)}
					</span>
				</div>
				{isShowOneClick && type==='form' && (
					<ReactSVG
						onClick={() => {
							if (!isShowOneClick) return;
							const { balanceList} = this.state;
							this.handleTransfer("ALL",{name: "MAIN"});
						}}
						className="rc-select-main"
						src={`/img/svg/TransferMain.svg`}
						style={{
							width: '18px'
						}}
					/>
				)} 
				{isFromPromotion && type==='to' ? '' :
					<span className="rc-select-arrow" unselectable="on">
						<span className="rc-select-arrow-icon" />
					</span>
				}

			</div>
		);
	};

	render() {
		const { getFieldDecorator, getFieldValue, getFieldError, getFieldsValue } = this.props.form;
		//console.log(this.props.form);
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
			visiblePopUp,
			unfinishedGames,
			unfinishedGamesMessages,
			TabsKey,
			feedbackModal,
			isVIP,
			isShowOneClick,
			isFromPromotion,
			isPromotionApplySuccess
		} = this.state;
		const {money:Amountvalue} = getFieldsValue()  //金額Input value;

		console.log(Bonusdefault);
		let MessageCss =
			previewMessage != ''
				? {
						color: 'red',
						background: 'rgb(255 234 234)',
						padding: '10px',
						borderRadius: '8px',
						fontSize: '12px',
						lineHeight: '15px',
						marginBottom: '10px'
					}
				: null;
				
		console.log(TabsKey);
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				status={0}
				BarTitle="转账"
				seoData={this.props.seoData}
			>
				<div className={`information__main ${isFromPromotion ? "fromPromotion" : ""}`} key={TabsKey}>
					<Tabs
						prefixCls="tabsOval"
						defaultActiveKey={TabsKey}
						tabBarExtraContent={content}
						onChange={this.onClickTabs}
					>
						{ !isFromPromotion &&  
							<TabPane tab={<div className="notice_tab" >Chuyển Quỹ Nhanh</div>} key="1">
								<Flexbox flexFlow="column" className="OneTransfer">
									{balanceList &&
										balanceList.map((item, index) => {
											return (
												<Flexbox
													className={classNames({
														wallet_list:true,
														maintenance:item.state==="UnderMaintenance"
													})}
													key={index + 'list'}
													justifyContent="space-between"
													style={{ position: 'relative' }}
												>
													<Flexbox alignItems="center" className="wallet_title_box">
														<i>
															<BsFillCircleFill size="8" color={walletIconColor[item.category]} />
														</i>
														<label>{item.localizedName}</label>
														{item.category == 'Sportsbook' && (
															<React.Fragment>
																<ReactSVG
																	onClick={() => {
																		this.setState({
																			isShowInfo: !this.state.isShowInfo
																		});
																	}}
																	className="tansfeinfo"
																	src="/svg/TransferInfo.svg"
																/>
																<Popover
																	direction="top"
																	className="Blance-popover"
																	visible={this.state.isShowInfo}
																	onClose={() => {
																		this.setState({ isShowInfo: false });
																	}}
																>
																	<span>包含 醉心体育,V2虚拟体育,沙巴体育, BTI体育,IM体育和电竞</span>
																</Popover>
															</React.Fragment>
														)}
													</Flexbox>
													<Flexbox className="amount_box">
														{item.state!=="UnderMaintenance" 
															?  `${numberWithCommas(item.balance,2, item.balance ? false : true)} đ`
															:  `อยู่ระหว่างปรับปรุง`}
														{item.state!=="UnderMaintenance" 
														? (
															<ReactSVG
																className={classNames({
																	Hide: item.name == 'TotalBal',
																	Transfericon: true
																})}
																src="/img/P5/svg/transfericon.svg"
																onClick={() => {
																	if(item.name == 'TotalBal'){
																		return
																	}
																	this.handleTransfer('ALL', item);
																}}
															/>
														) : (
															<ReactSVG
																className={classNames({
																	Hide: item.name == 'TotalBal',
																	Transfericon: true,
																})}
																src="/img/global/transfer_grey.svg"
															/>
														)
													 }
													</Flexbox>
												</Flexbox>
											);
										})}

									{!balanceList && <Skeleton count={10} height="30px" />}
								</Flexbox>
							</TabPane>
						}
						<TabPane tab={<div className="notice_tab" >{isFromPromotion ? "Chuyển Qũy" :"Chuyển Quỹ Thường"}</div>} key="2">
							{/* {(isFromPromotion && isPromotionApplySuccess) && (
									<div className='promotion_success_box'>
										<div className='success_msg'>
											<ReactIMG src="/img/global/success_m.svg"/>
											<p>โอนเงินสำเร็จ</p>
											<span ">ขอรับโบนัสแล้ว</span>
										</div>
										<Button 
											onClick={()=>{
												Router.push("/โปรโมชั่น?tab=MyPromotions")  //Promotion Page
											}}
										>
											ตรวจสอบสถานะโปรโมชั่น
										</Button>
									</div>
								)
							} */}
							{ !isPromotionApplySuccess && (
								<>
									<div className="transfer-form-wrap">
										<div className='transfer-form'>
											<div 
												className="transfermaintxt" 
												style={{ display: (isFromPromotion && isShowOneClick) ? 'block' : 'none' }}
											>
												Lưu ý: Vui lòng nhấp vào Chuyển Quỹ Nhanh để chuyển số dư tài khoản sang tài khoản chính, sau đó chuyển quỹ để đăng ký phần thưởng này
											</div>
											<Flexbox flexFlow="column">
												<div className="ant-col">
													<Item label="Từ tài khoản">{this.TransferItem('form')}</Item>
												</div>
												{/* <ReactSVG
													className="transfer-to-icon ant-col ant-col-1 center"
													src="/svg/TransferArrow.svg"
												/> */}
												<div className="ant-col">
													<Item label="Đến tài khoản">{this.TransferItem('to')}</Item>
												</div>
											</Flexbox>
											<Item label="Số Tiền Chuyển" className="input_amount" errorMessage={getFieldError('money')}>
												{getFieldDecorator('money', {
													getValueFromEvent: (event) => {
														const formatValue =event.target.value.replace(pickNotNumberAllowDecimal,"")
														const hasDecimal = formatValue.split(".")?.[1]
														if(hasDecimal?.length>2){
															return Number(formatValue).toFixed(2)
														}
														return formatValue
													},
													rules: [
														{ required: true, message: 'Vui lòng nhập số tiền' },
														{
															validator: (rule, value, callback) => {
																//console.log(value);
																if (value && value == 0) {
																	callback('9/6 Mockup未提供 => 转账金额必须在为0.01与1000000.00');
																}
																// 必須是數字，可帶兩位小數（一位和超過三位都不行）
																if (value && !new RegExp(moneyAmountAllow2Decimal).test(value)) {
																	callback('9/6 Mockup未提供 => 转帐金额格式若有小数点，需完整填写小数点后两位，例如: ¥100.10');
																}
																if (value && this.checkInsufficientBalance(value)) {
																	callback('Tài khoản không đủ tiền');  //余额不足
																}
																if(Bonusdefault){
																	if(value && value < Bonusdefault.minAccept){
																		callback('9/6 Mockup未提供 => 輸入金額小於申請優惠最低金額');
																	}
		
																}
																// 依PM指示先註解掉但不刪除，以防後續追加此功能
																// this.bonusChange(this.state.bonusVal, value);
																callback();
															}
														}
													]
												})(
													<Input
														disabled={this.isTransferDisable()}
														onChange={(e) => this.onFormChange(e)}
														size="large"
														autoComplete="off"
														placeholder="Nhập số tiền"
													/>
												)}
											</Item>
											<BonusList
												isFromPromotion={isFromPromotion}
												getFieldDecorator={getFieldDecorator}
												getFieldValue={getFieldValue}
												bonusVal={this.state.bonusVal}
												setBonusValue={(v, name) => {
													// 依PM指示先註解掉但不刪除，以防後續追加此功能
													// this.props.form.validateFields((err, values) => {
													// 	if (!err) {
													// 		this.bonusChange(v, values.money);
													// 	}
													// });
													if(!Bonusdata){
														return
													}
													const defaultval = Bonusdata.find((Item) => Item.id == isFromPromotion ? bonusVal : v);
													if(bonusVal && !defaultval?.id){
														if(defaultval===undefined){
															return Toast.error(`Cannot find id:${bonusVal} bonus from Bonus?transactionType=Transfer&wallet=${toVal} response (FE)`, 3)
														}else if(isFromPromotion && !defaultval.id){
															return Toast.error(`There is no bonus gonna be applied, because promotion bonus id = 0 (FE)`, 3)
														}
													}
													this.setState({ bonusVal: v, bonusName: name, Bonusdefault: defaultval });
												}}
												targetValue={this.state.toVal}
												//ispromo={true}
												CallBonusdata={(e) => this.CallBonusdata(e)}
												type={'transfer'}
											/>
		
											{/* --------优惠检查错误信息展示------- */}
											{/* {previewMessage != '' && <p style={MessageCss}>{previewMessage}</p>} */}
		
											{/* 優惠詳細資訊 => 只有在Promotion轉帳時才會顯示 */}
											{Bonusdefault && 
											bonusVal != 0 && isFromPromotion && (
												<div className="PromoContent">
													<label>{Bonusdefault.title}</label>
													<div className="list">
														<div>
															<label >Tiền gửi</label>
															<div>{Amountvalue && Amountvalue != 0 ? Amountvalue : 0} đ</div>
														</div>
														<div>
															<label>Tiền thưởng</label>
															<div>
																{!Amountvalue 
																? 0 
																: Number(Amountvalue) * Bonusdefault.givingRate > Bonusdefault.maxGiving
																?	Bonusdefault.maxGiving
																: Number((Number(Amountvalue) * Bonusdefault.givingRate).toFixed(2))}
																{' đ'}
															</div>
														</div>
														<div>
															<label>Doanh thu yêu cầu</label>
															<div>
																{ !Bonusdefault.releaseValue
																? 0 
																: !Amountvalue
																? 0
																: Number(Amountvalue) * Bonusdefault.givingRate > Bonusdefault.maxGiving
																? ((Bonusdefault.maxGiving / Bonusdefault.givingRate + Bonusdefault.maxGiving) * Bonusdefault.releaseValue)
																: (Number(((Number(Amountvalue)*Bonusdefault.givingRate + Number(Amountvalue)) * Bonusdefault.releaseValue).toFixed(2)))}
																{' đ'}
															</div>
														</div>
													</div>
												</div>
											)}
											<div
												className="btn-wrap"
												style={{ marginTop: '24px' }}
											>
												<Button 
													size="large" 
													onClick={this.handleSubmit}
													disabled={!btnStatus || this.state.formVal == '' || this.state.toVal == '' || this.isTransferDisable()} >
													Chuyển
												</Button>
											</div>
											{ isFromPromotion &&
												<Button
													size="large"
													className="_Todeposit"
													onClick={() => {
														Router.push(`/deposit?id=${bonusVal}`);
														Pushgtagdata(`Deposit Nav`, 'Click', 'Deposit_TransferPage');
													}}
												>
													Gửi Tiền
												</Button>
											}
										</div>
									</div>
									{fromWalletList.length ? (
										<Drawer
											style={{ height: '70%' }}
											direction="bottom"
											className="transfer-drawer"
											visible={this.state.formShow}
											onClose={() => {
												this.setState({ 
													formShow: false,
													drawerSelectedWallet:this.state.Opentype == 'form'? this.state.formVal : this.state.toVal,
												});
											}}
										>
											<div className='header'>
												<span 
													onClick={()=>{
														this.setState({ 
															formShow: false,
															drawerSelectedWallet:this.state.Opentype == 'form'? this.state.formVal : this.state.toVal
														});
													}}
												>
													Đóng
												</span>
												<h2 className="transfer-drawer-tit">
													{this.state.Opentype == 'form' ? 'Từ Tài Khoản' /*源自账户*/ : 'Đến Tài Khoản' /*目标账户*/}
												</h2>
												<span 
													onClick={()=>{
														if (this.state.Opentype == 'form') {
															this.setState({formVal: this.state.drawerSelectedWallet});
														}
														if (this.state.Opentype == 'to') {
															this.setState({toVal: this.state.drawerSelectedWallet});
														}
														this.setState({formShow: false});
													}}
												>
													Chọn
												</span>
											</div>
											<ul
												className="cap-list small-circle cap-distance"
												key={this.state.formShow.toString()}
											>
												{this.fromWalletUI()}
											</ul>
										</Drawer>
									) : null}
								</>
							)}
						</TabPane>
					</Tabs>
					{isVIP ? (
						<div
							className="vip-customer-service"
							onClick={() => {
								this.setState({ feedbackModal: true });
							}}
						>
							<ReactIMG src="/img/P5/icon/Icon_VIPCS.png" />
						</div>
					) : null}
				</div>
				{/* 公告弹窗 */}
				{this.state.CheckAnnouncement && <Announcement optionType="Transfer" />}

				{/* 自我限制 */}
				<SelfExclusionModal
					ModalType={this.state.showExceedLimit ? 2 : 1}
					key={this.state.showExceedLimit + 'key'}
					OpenModalUrl="transfer"
					afterCloseModal={() => {
						// Router.push('/');
					}}
				/>

				{/* 游戏进行中 转账限制弹窗 */}
				<UnfinishedGamePopUp
					visible={visiblePopUp}
					unfinishedGames={unfinishedGames}
					unfinishedGamesMessages={unfinishedGamesMessages}
					CloseVisible={() => {
						this.setState({
							visiblePopUp: false
						});
					}}
				/>

				<Vipcustomerservice
					visible={feedbackModal}
					onCloseModal={() => {
						this.setState({ feedbackModal: false });
					}}
				/>
			</Layout>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

const mapDispatchToProps = {
	userInfo_getBalance: (newBalanceSB) => ACTION_UserInfo_getBalance(newBalanceSB)
};

export default withRouter(
	connect(mapStateToProps, mapDispatchToProps)(createForm({ fieldNameProp: 'transfer' })(Transfer))
);

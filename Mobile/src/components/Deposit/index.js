import Modal from '@/components/View/Modal';
import Toast from '@/components/View/Toast';
import { GetPayList, GetPayDetail } from '@/api/wallet';
import { ReactSVG } from '@/components/View/ReactSVG';
import LB from './depositComponents/LB';
import UP from './depositComponents/UP';
import OA from './depositComponents/OA';
import BC from './depositComponents/BC';
import BCM from './depositComponents/BCM';
import AP from './depositComponents/AP';
import CC from './depositComponents/CC';
import WC from './depositComponents/WC';
import QQ from './depositComponents/QQ';
import JDP from './depositComponents/JDP';
import ALB from './depositComponents/ALB';
import WCLB from './depositComponents/WCLB';
import PPB from './depositComponents/PPB';
import CTC from './depositComponents/CTC';
import SR from './depositComponents/SR';
import ThirdParty from './depositComponents/ThirdParty';
import Flexbox from '@/components/View/Flexbox/';
import Router from 'next/router';
import { withBetterRouter } from '@/lib/js/withBetterRouter';
// import RealyName from '@/components/RealyName';
//import USDTPromotion from './depositComponents/Popup/USDTPromotion';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import React from 'react';
import moment from 'moment';
import { getDepositVerifyInfo } from '@/lib/js/util';
import FinishStep from './depositComponents/FinishStep/ModalPage';
import Popover from '@/components/View/Popover';
class Deposit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currDepositDetail: {}, // 当前的支付方式的详情
			isOpenRealyName: false, // 是否打开完善姓名
			realyName: '', // 为了触发完善姓名后的value更新
			bcType: '', // 在线存款类型（快捷支付、高额支付）
			isShowLearnEntry: true,
			payMethodList: [],
			currentDepositKey: '',
			showPayMethodsList: true,
			memberInfo: {},
			thirdPartyVisible: false,
			payHtml: '',
			USDTPopupVisible: false,
			isDepositMethodsRestricted: false, //是否有限制充值方式 - true: 只显示 CTC 和 CC ; false: 显示所有
			depositingWallet: 'SB', //直接存入SB，不使用個人配置
			isIWMM: false //是否展示 开启更多存款和提款方式 按鈕
		};

		this.setPayList = this.setPayList.bind(this); // 设置充值方式
		this.setPayListChild = this.setPayListChild.bind(this); // 设置当前已有的支付方式并获取默认支付方式的详情
		this.setCurrentPayMethod = this.setCurrentPayMethod.bind(this); // 设置当前充值方式
		//this.openSetRealyName = this.openSetRealyName.bind(this); // 呼出完善真实姓名弹窗
		this.depositStatusCheck = this.depositStatusCheck.bind(this); // 充值状态检测
		this.changeBcType = this.changeBcType.bind(this); // 在线存款类型更换
		this.thirdPartyPay = this.thirdPartyPay.bind(this); // 第三方支付成功回调

		this.isOnLinePay = false; // 是否有在线存款支付方式
		this.bcTypeList = []; // 在线支付类别（高额存款，快捷支付）（移动到父元素是为了切换大分类保留此处充值方式数据）
		this.localMemberName = ''; // 本地姓名记录
	}
	componentDidMount() {
		//this.props.userInfo_getDetails(); //优化api 频繁请求 注释掉
		//this.setPayListChild(); // Get充值方式
		let memberInfo = JSON.parse(localStorage.getItem('memberInfo'));
		this.setState({
			//depositingWallet: 'SB' //直接存入SB，不使用個人配置
			depositingWallet: memberInfo ? memberInfo.preferWallet : 'MAIN',
			realyName: memberInfo ? memberInfo.firstName : '',
			memberInfo: memberInfo
			// USDTPopupVisible: true
		});

		const { query } = this.props.router;
		let defaultType = this.props.router && this.props.router.query.currentPayValue;
		let defaultPayMethod = defaultType || null; //默認開啟充值方式

		//PPB/SR刷新判斷 需求：在step2頁面刷新後，仍返回原頁面
		if ((query.PPB && query.PPB == 2) || (query.SR && query.SR == 2)) {
			let thisPayMethod = 'PPB';
			let cacheName = 'Deposit_PPB_Step2_Cache';
			if (query.SR && query.SR == 2) {
				thisPayMethod = 'SR';
				cacheName = 'Deposit_SR_Step2_Cache';
			}

			console.log('======deposit didmount with ' + thisPayMethod + '=2');

			const jsonCacheData = localStorage.getItem(cacheName);
			let showStep2 = false;
			if (jsonCacheData) {
				const cacheData = JSON.parse(jsonCacheData);
				if (cacheData && cacheData.res && cacheData.targetTime) {
					const targetTime = moment(cacheData.targetTime);
					const diffSeconds = targetTime.diff(moment(), 'seconds');
					showStep2 = diffSeconds > 0;
				}
			}
			if (!showStep2) {
				//過期或數據不正確，則刪除緩存並刪除url參數
				localStorage.removeItem(cacheName);
				//用replace，避免用戶可以點擊back返回
				Router.replace('/deposit', undefined, { shallow: true });
			} else {
				defaultPayMethod = thisPayMethod;
			}
		}

		(async () => {
			const flagResult = await this.MemberFlagsStatus(); //需要等验证流程確認 才加載支付信息
			flagResult && this.setPayListChild(defaultPayMethod); // Get充值方式
		})();
		//this.setPayListChild(defaultPayMethod);
		//this.MemberFlagsStatus(); //优化api 频繁请求 注释掉
	}

	componentDidUpdate(prevProps, prevState) {
		// 切换分类时获取对应充值方式详情
		if (prevState.currentDepositKey !== this.state.currentDepositKey && this.state.currentDepositKey !== '') {
			Toast.loading();
			this.setState({ currDepositDetail: {} });
			const targetDepositType = this.state.currentDepositKey;
			GetPayDetail(
				this.state.currentDepositKey,
				(res) => {
					//console.log(res);
					res.isSuccess && this.setState({ currDepositDetail: res.result });
					Toast.destroy();
					if (res.result && res.result.setting && res.result.setting.timeoutSeconds) {
						this.setState({
							timeOutMin: Math.floor(res.result.setting.timeoutSeconds / 60),
							timeOutSec:
								res.result.setting.timeoutSeconds -
								Math.floor(res.result.setting.timeoutSeconds / 60) * 60,
							totalTimeoutSec: res.result.setting.timeoutSeconds
						});
					} else {
						this.setState({
							timeOutMin: 5
						});
					}
				},
				this.state.payMethodList
			);
		}
	}
	//存款之前进行验证 是否受到限制，如果被限制 跳转到验证页面
	MemberFlagsStatus = async () => {
		//Toast.loading();
		return getDepositVerifyInfo()
			.then((info) => {
				const resultCode = info.code;
				//Toast.destroy();
				if (resultCode === 'NO_OTP_TIMES') {
					//沒剩餘次數，直接展示超過驗證次數頁
					Router.push('/DepositVerify');
				} else if (resultCode === 'HAS_OTP_TIMES') {
					//還有剩餘次數，進入手機驗證頁面
					Router.push('/DepositVerify');
				} else {
					let newState = {};
					//不显示iwmm https://trello.com/c/z1sWgDkf/125-mobileapp-remove-pii-iwmm-checking-from-fe
					// if (resultCode === 'IS_IWMM') {
					// 	newState.isIWMM = true;
					// } else if (resultCode === 'NOT_IWMM') {
					// 	newState.isIWMM = false;
					// }
					//this.getDepositFrontData(); // Get会员信息
					this.props.userInfo_getDetails();

					newState.isDepositMethodsRestricted = info.flags.isDepositMethodsRestricted;
					this.setState(newState);
				}
				return true;
			})
			.catch((errorCode) => {
				console.log(errorCode);
				//Toast.destroy();
				//提示不同的錯誤訊息 隱密的 判斷錯誤原因
				if (errorCode === 'DATA_ERROR0') {
					Toast.error('验证请求失败，请刷新后重试.', 5);
				} else if (errorCode === 'NET_ERROR0') {
					Toast.error('验证请求失败，请嘗試刷新页面.', 5);
				} else {
					Toast.error('验证请求失败，请嘗試刷新', 5);
				}
				return false;
			});
	};

	openIWMMModal = () => {
		// Pushgtagdata('Verification', 'Click', 'IWMM_PII_DepositPage');
		Modal.info({
			title: '',
			centered: true,
			okText: '立即验证',
			cancelText: '稍后验证',
			className: `commonModal VerificationModal`,
			maskClosable: false,
			content: (
				<React.Fragment>
					<center>
						<ReactSVG src="/img/svg/note.svg" className="Modalicon" />
					</center>
					<div className="note">提醒您，完成验证后，即可享有更多存款 和提款方式。</div>
				</React.Fragment>
			),
			onOk: () => {
				Router.push('/DepositVerify?IWMM=1');
			},
			onCancel: () => {}
		});
	};
	setCurrentPayMethod(key, first) {
		this.setState({ currentDepositKey: key });
		switch (key) {
			case 'LB': // 本银支付
				// Pushgtagdata(`Deposit_Nav`, 'Click', 'Localbank_DepositPage');
				break;
			case 'WCLB': // 微转账
				// Pushgtagdata(`Deposit_Nav`, 'Click', 'LocalbankWechat_DepositPage');
				break;
			case 'UP': // 银联支付
				// Pushgtagdata(`Deposit_Nav`, 'Click', 'Unionpay_DepositPage');
				break;
			case 'OA': // 在线支付宝
				// Pushgtagdata(`Deposit_Nav`, 'Click', 'OnlineAlipay_DepositPage');
				break;
			case 'WC': // 微支付
				// Pushgtagdata(`Deposit_Nav`, 'Click', 'OnlineWechat_DepositPage');
				break;
			case 'QQ': // QQ支付
				// Pushgtagdata(`Deposit_Nav`, 'Click', 'QQwallet_DepositPage');
				break;
			case 'BC': // 网银支付
				// Pushgtagdata(`Deposit_Nav`, 'Click', 'CDC_DepositPage');
				break;
			case 'ALB': // 支付宝转账
				// Pushgtagdata(`Deposit_Nav`, 'Click', 'LocalbankAlipay_DepositPage');
				break;
			case 'CTC': // 加密货币
				// Pushgtagdata(`Deposit_Nav`, 'Click', 'Crypto_DepositPage');
				break;
			case 'JDP': // 京东支付
				// Pushgtagdata(`Deposit_Nav`, 'Click', 'JD_DepositPage');
				break;
			case 'AP': // AstroPay
				// Pushgtagdata(`Deposit_Nav`, 'Click', 'Astropay_DepositPage');
				break;
			case 'CC': // 同乐卡
				// Pushgtagdata(`Deposit_Nav`, 'Click', 'Cashcard_DepositPage');
				break;
			case 'PPB': // 网银转账
				// Pushgtagdata(`Deposit_Nav`, 'Click', 'P2PBanking_DepositPage');
				break;
			case 'BCM': // 快捷支付
				// Pushgtagdata(`Deposit_Nav`, 'Click', 'MobileCDC_DepositPage');
				break;
			case 'SR': // 小額支付 small river
				// Pushgtagdata(`Deposit_Nav`, 'Click', 'SmallRiver_DepositPage');
				break;
		}
	}
	// 设置充值方式并处理充值方式列表
	setPayList(list, currentKey) {
		//console.log(list);
		let payList = [];
		list.forEach((val) => {
			if (~[ 'MD', 'QR', 'ALBMD', 'WLMD', 'OGC', 'BTC', 'FC', 'YP', 'BD', 'IB', 'MA' ].indexOf(val.code))
				return null;
			// if (~["MD", "QR", "ALBMD", "WLMD", "OGC", "BTC", "FC", "YP", "BD", "IB"].indexOf(val.code)) return null;
			// if (val.code === "BC" || val.code === "BCM") {
			//     val.code === "BC" &&
			//         (val.localName = "高额存款 - 需要插入U盾，进行存款");
			//     val.code === "BCM" &&
			//         (val.localName = "快捷支付 - 接收短信认证，完成支付");
			//     this.bcTypeList.push(val); // 记录当前的在线支付类型
			//     if (this.isOnLinePay) {
			//         return null;
			//     } else {
			//         this.isOnLinePay = true;
			//         // val.name = "在线支付";
			//     }
			// }
			//console.log(payList);
			//ppb去除重複的methodcode
			if (
				val &&
				val.code &&
				[ 'PPB' ].indexOf(val.code) !== -1 &&
				val.availableMethods &&
				val.availableMethods.length > 1
			) {
				let mCodeTmp = [];
				let mArr = [];
				val.availableMethods.map((m) => {
					if (mCodeTmp.indexOf(m.methodCode.toLowerCase()) === -1) {
						mCodeTmp.push(m.methodCode.toLowerCase());
						mArr.push(m);
					}
				});
				val.availableMethods = mArr;
			}

			payList.push(val);
		});
		this.setState({ payMethodList: payList }, () => {
			if (!~list.findIndex((v) => v.code === currentKey)) {
				currentKey = payList[0].code;
			}
			this.setCurrentPayMethod(currentKey, 'first');
		});
	}
	bonusApplication(res) {
		if (res.bonusApplicationMessage) {
			const content = (
				<span
					dangerouslySetInnerHTML={{
						__html: res.bonusApplicationMessage
					}}
				/>
			);

			if (res.bonusResult === 'Fail') {
				Toast.error(content);
			} else {
				Toast.success(content);
			}
		}
	}
	// 第三方支付成功回调
	thirdPartyPay(res, amount, title) {
		this.bonusApplication(res);
		console.log(res);
		this.setState({
			OpenFinishStep: true,
			FinishRes: {
				transactionId: res.transactionId,
				amount: amount,
				title: title
			}
		});
		this.chargesHandling(res);
		// this.setState({
		//     thirdPartyVisible: true,
		//     payHtml: res.redirectUrl,
		//     thirdPartyBarTitle: title
		// })
		// Modal.info({
		// 	title: '订单成立: ' + res.transactionId,
		// 	content: <div className="center">确认后，将开启第三方支付！</div>,
		// 	onOk: () => {
		//         //console.log('ok')
		// 		var RBWindow = window.open('', '_blank', 'toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=650, height=650');
		// 		RBWindow.document.write(res.redirectUrl);
		// 		RBWindow.focus();
		// 	}
		// });
	}
	depositStatusCheck(type, bankCode) {
		// 在完善姓名之后能够实时更新的原因是 state.realyName 在完善姓名组件中进行了设置，所以能够实施去除完善姓名验证
		// if (!(this.state.realyName || this.localMemberName)) {
		// 	this.setState({ isOpenRealyName: true });
		// 	return undefined;
		// }
		// 以下情况需要判定是否需要判定收款或者充值银行（本地银行，在线支付高额存款，支付宝转账）
		if ((type === 'LB' || type === 'BC' || type === 'ALB') && bankCode === '') {
			// 高额存款收款银行为空的情况下退出操作！
			Toast.error('请联系客服添加银行！');
			return undefined;
		}
		return true;
	}

	// 获取并设置充值方式、获取默认支付详情
	setPayListChild(defaultType = null) {
		//console.log(this.state.payMethodList);

		//console.log('1');
		if (Array.isArray(this.state.payMethodList) && this.state.payMethodList.length) {
			Toast.loading();
			//console.log('2');

			GetPayDetail(
				this.state.currentDepositKey,
				(res) => {
					//console.log(res);
					Toast.destroy();
					res.isSuccess && this.setState({ currDepositDetail: res.result });
				},
				this.state.payMethodList
			);
			return null;
		}
		let paymentMethods = JSON.parse(sessionStorage.getItem('paymentMethods'));
		if (paymentMethods) {
			this.setPayList(paymentMethods, paymentMethods[0].code);
		}
		GetPayList((res) => {
			if (res.isSuccess && res.result) {
				if (!paymentMethods) {
					this.setPayList(
						res.result.paymentMethods,
						defaultType ? defaultType : res.result.paymentMethods[0].code
					);
				}
				sessionStorage.setItem('paymentMethods', JSON.stringify(res.result.paymentMethods));
			}
		});
	}

	// 在线存款类型更换
	changeBcType(v, status) {
		if (status === true) {
			return this.setState({ bcType: v });
		}
		Toast.loading();
		GetPayDetail(v, (res) => {
			Toast.destroy();

			res.isSuccess &&
				this.setState({
					bcType: v,
					currDepositDetail: res.result
				});
		});
	}

	closeThirdParty = () => {
		this.setState({
			thirdPartyVisible: false,
			payHtml: '',
			thirdPartyBarTitle: ''
		});
	};

	actualAmount = (amountvalue, charges) => {
		return parseFloat(amountvalue) + parseFloat(charges * amountvalue);
	};

	closeUSDTPopup = () => {
		this.setState({
			USDTPopupVisible: false
		});
		this.setCurrentPayMethod('CTC');
	};
	/**
	 * @param {object} res 提交充值api返回充值成功的res.result
	 * vendorCharges=false && totalWaiveRemain =0， QQ显示，specialList数组里的方式不显示。
	 * vendorCharges=false && totalWaiveRemain =0 && showVendorBank=true,网银转账（PPB）才显示。
	 * vendorCharges=false && totalWaiveRemain >0 8个充值方式都显示,不显示第三方额外费用
	 * vendorCharges=true && && totalWaiveRemain>0 8个充值方式都显示 并且显示免手续费次数，qq和ppb显示温馨提醒
	 * vendorCharges=true && && totalWaiveRemain=0 8个充值方式都显示，不显示免手续费次数，qq和ppb显示温馨提醒
	 */
	chargesHandling = (res) => {
		const { currentDepositKey } = this.state;
		const methodList = [ 'BC', 'BCM', 'UP', 'OA', 'JDP', 'WC', 'QQ', 'PPB' ];
		const specialList = [ 'BC', 'BCM', 'UP', 'OA', 'JDP', 'WC' ];
		let flag = false;
		flag = methodList.includes(currentDepositKey);
		const thirdparty = () => {
			var RBWindow = window.open(
				'',
				'_blank',
				'toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=650, height=650'
			);
			RBWindow.document.write(res.redirectUrl);
			RBWindow.focus();
		};
		if (res.vendorCharges) {
			console.log("this.state",this.state)
			//有第三方额外费用
			Modal.info({
				icon: null,
				centered: true,
				type: 'confirm',
				btnBlock: true,
				btnReverse: true,
				title: '存款',
				okText: '我知道了',
				onlyOKBtn: true,
				className: 'commonModal chargesHandling',
				content: (
					<React.Fragment>
						<dl className="deposit-result">
							{flag ? <dt>订单{res.transactionId}创建成功。</dt> : null}
							{flag ? <dt>此交易将征收第三方额外费用，详情如下。</dt> : null}
							{flag && Math.abs(res.charges) > 0 ? <div className="line-distance" /> : null}
							{flag ? (
								<div className="detail">
									<dd>
										存款金额：<span>{res.uniqueAmount || ''}</span>
									</dd>
									<dd>
										第三方手续费：<span>{Math.abs(res.charges) || ''}</span>
									</dd>
									<dd>
										实际金额：<span>{res.actualAmount || ''}</span>
									</dd>
								</div>
							) : null}
							{flag && res.totalWaiveRemain > 0 ? <div className="line-distance" /> : null}
							{flag && res.totalWaiveRemain > 0 ? (
								<dt>
									注意 : 交易成功后，才会扣除免手续费的次数。<br />剩余 <span>{res.totalWaiveRemain}</span> 笔交易免手续费。
								</dt>
							) : null}
							<div className="line-distance" />
							{currentDepositKey == 'PPB' ? (
								<dt className="lastTip">
									乐天使温馨提醒:请在{' '}
									{this.state.timeOutMin && this.state.timeOutMin != '0' ? (
										`${this.state.timeOutMin}分钟`
									) : (
										''
									)}{' '}
									{this.state.timeOutSec && this.state.timeOutSec != '0' ? (
										`${this.state.timeOutSec}秒`
									) : (
										''
									)}{' '}
									之内完成支付，以免到账延迟。​
								</dt>
							) : null}
							{currentDepositKey == 'QQ' ? (
								<dt className="lastTip">乐天使温馨提醒：请勿使用 QQ 添加陌生账号或是私自汇款给对方，以免遇到诈骗。如任何损失，乐天堂一概不负责。​</dt>
							) : null}
						</dl>
					</React.Fragment>
				),
				onOk: () => {
					thirdparty();
				}
			});
		} else {
			//没有第三方额外费用
			if (
				(specialList.includes(currentDepositKey) && res.totalWaiveRemain == 0) 
				// || (currentDepositKey === 'PPB' && res.totalWaiveRemain < 1 && !res.showVendorBank)
			) {
				
				Modal.info({
					icon: null,
					centered: true,
					type: 'confirm',
					btnBlock: true,
					btnReverse: true,
					title: '存款',
					okText: '我知道了',
					onlyOKBtn: true,
					className: 'commonModal chargesHandling',
					content: (
						<React.Fragment>
							<dl className="deposit-result">
								<dt>订单{res.transactionId}创建成功。</dt>
								<div className="line-distance" />
								<dt>
								    点击 "我知道了" 将为您打开一个新的窗口进行交易
								</dt>
								<div className="line-distance" />
							</dl>
						</React.Fragment>
					),
					onOk: () => {
						thirdparty();
					}
				});
				//不显示
				return;
			} else if (currentDepositKey === 'QQ' && res.totalWaiveRemain >= 0 && res.charges >=0) {
				Modal.info({
					icon: null,
					centered: true,
					type: 'confirm',
					btnBlock: true,
					btnReverse: true,
					title: '存款',
					okText: '我知道了',
					onlyOKBtn: true,
					className: 'commonModal chargesHandling',
					content: (
						<React.Fragment>
							<dl className="deposit-result">
								<dt>订单{res.transactionId}创建成功。</dt>
								<div className="line-distance" />
								<dt className="lastTip">乐天使温馨提醒：请勿使用 QQ 添加陌生账号或是私自汇款给对方，以免遇到诈骗。如任何损失，乐天堂一概不负责。​</dt>
							</dl>
						</React.Fragment>
					),
					onOk: () => {
						thirdparty();
					}
				});
				return;
			} else if(currentDepositKey === 'QQ' && res.totalWaiveRemain == 0 && res.charges <0){
				Modal.info({
					icon: null,
					centered: true,
					type: 'confirm',
					btnBlock: true,
					btnReverse: true,
					title: '存款',
					okText: '我知道了',
					onlyOKBtn: true,
					className: 'commonModal chargesHandling',
					content: (
						<React.Fragment>
							<dl className="deposit-result">
								<dt>订单{res.transactionId}创建成功。</dt>
								<div className="line-distance" />
								<dt className="lastTip">乐天使温馨提醒：请勿使用 QQ 添加陌生账号或是私自汇款给对方，以免遇到诈骗。如任何损失，乐天堂一概不负责。​</dt>
							</dl>
						</React.Fragment>
					),
					onOk: () => {
						thirdparty();
					}
				});
				return;
			}else if(currentDepositKey === 'QQ' && res.totalWaiveRemain > 0 && res.charges < 0){
				Modal.info({
					icon: null,
					centered: true,
					type: 'confirm',
					btnBlock: true,
					btnReverse: true,
					title: '存款',
					okText: '我知道了',
					onlyOKBtn: true,
					className: 'commonModal chargesHandling',
					content: (
						<React.Fragment>
							<dl className="deposit-result">
								<dt>订单{res.transactionId}创建成功。</dt>
								<div className="line-distance" />
								<dt>
									注意 : 交易成功后，才会扣除免手续费的次数。<br />剩余 <span>{res.totalWaiveRemain}</span> 笔交易免手续费。
								</dt>
								<div className="line-distance" />
								<dt className="lastTip">乐天使温馨提醒：请勿使用 QQ 添加陌生账号或是私自汇款给对方，以免遇到诈骗。如任何损失，乐天堂一概不负责。​</dt>
							</dl>
						</React.Fragment>
					),
					onOk: () => {
						thirdparty();
					}
				});
				return;
			}else if (currentDepositKey === 'PPB' && res.totalWaiveRemain >= 0 && res.charges>=0  ) {
				Modal.info({
					icon: null,
					centered: true,
					type: 'confirm',
					btnBlock: true,
					btnReverse: true,
					title: '存款',
					okText: '我知道了',
					onlyOKBtn: true,
					className: 'commonModal chargesHandling',
					content: (
						<React.Fragment>
							<dl className="deposit-result">
								<dt>订单{res.transactionId}1创建成功。</dt>
								<div className="line-distance" />
								<dt className="lastTip">
									乐天使温馨提醒:请在{' '}
									{this.state.timeOutMin && this.state.timeOutMin != '0' ? (
										`${this.state.timeOutMin}分钟`
									) : (
										''
									)}{' '}
									{this.state.timeOutSec && this.state.timeOutSec != '0' ? (
										`${this.state.timeOutSec}秒`
									) : (
										''
									)}{' '}
									之内完成支付，以免到账延迟。​
								</dt>
							</dl>
						</React.Fragment>
					),
					onOk: () => {
						thirdparty();
					}
				});
				return;
			} else if (currentDepositKey === 'PPB' && res.totalWaiveRemain == 0 && res.charges < 0  ) {
				Modal.info({
					icon: null,
					centered: true,
					type: 'confirm',
					btnBlock: true,
					btnReverse: true,
					title: '存款',
					okText: '我知道了',
					onlyOKBtn: true,
					className: 'commonModal chargesHandling',
					content: (
						<React.Fragment>
							<dl className="deposit-result">
								<dt>订单{res.transactionId}创建成功。</dt>
								<div className="line-distance" />
								<dt className="lastTip">
									乐天使温馨提醒:请在{' '}
									{this.state.timeOutMin && this.state.timeOutMin != '0' ? (
										`${this.state.timeOutMin}分钟`
									) : (
										''
									)}{' '}
									{this.state.timeOutSec && this.state.timeOutSec != '0' ? (
										`${this.state.timeOutSec}秒`
									) : (
										''
									)}{' '}
									之内完成支付，以免到账延迟。​
								</dt>
							</dl>
						</React.Fragment>
					),
					onOk: () => {
						thirdparty();
					}
				});
				return;
			} else if (currentDepositKey === 'PPB' && res.totalWaiveRemain > 0 && res.charges < 0 ) {
				Modal.info({
					icon: null,
					centered: true,
					type: 'confirm',
					btnBlock: true,
					btnReverse: true,
					title: '存款',
					okText: '我知道了',
					onlyOKBtn: true,
					className: 'commonModal chargesHandling',
					content: (
						<React.Fragment>
							<dl className="deposit-result">
								<dt>订单{res.transactionId}创建成功。</dt>
								<div className="line-distance" />
								<dt>
									注意 : 交易成功后，才会扣除免手续费的次数。<br />剩余 <span>{res.totalWaiveRemain}</span> 笔交易免手续费。
								</dt>
								<div className="line-distance" />
								<dt className="lastTip">
									乐天使温馨提醒:请在{' '}
									{this.state.timeOutMin && this.state.timeOutMin != '0' ? (
										`${this.state.timeOutMin}分钟`
									) : (
										''
									)}{' '}
									{this.state.timeOutSec && this.state.timeOutSec != '0' ? (
										`${this.state.timeOutSec}秒`
									) : (
										''
									)}{' '}
									之内完成支付，以免到账延迟。​
								</dt>
							</dl>
						</React.Fragment>
					),
					onOk: () => {
						thirdparty();
					}
				});
				return;
			} else if (currentDepositKey !== 'PPB' && currentDepositKey !=='QQ' && res.totalWaiveRemain > 0 && res.charges < 0 ) {
				Modal.info({
					icon: null,
					centered: true,
					type: 'confirm',
					btnBlock: true,
					btnReverse: true,
					title: '存款',
					okText: '我知道了',
					onlyOKBtn: true,
					className: 'commonModal chargesHandling',
					content: (
						<React.Fragment>
							<dl className="deposit-result">
								<dt>订单{res.transactionId}创建成功。</dt>
								<div className="line-distance" />
								<dt>
									注意 : 交易成功后，才会扣除免手续费的次数。<br />剩余 <span>{res.totalWaiveRemain}</span> 笔交易免手续费。
								</dt>
								<div className="line-distance" />
							</dl>
						</React.Fragment>
					),
					onOk: () => {
						thirdparty();
					}
				});
				return;
			} else{
				Modal.info({
					icon: null,
					centered: true,
					type: 'confirm',
					btnBlock: true,
					btnReverse: true,
					title: '存款',
					okText: '我知道了',
					onlyOKBtn: true,
					className: 'commonModal chargesHandling',
					content: (
						<React.Fragment>
							<dl className="deposit-result">
								<dt>订单{res.transactionId}创建成功。</dt>
								<div className="line-distance" />
								<dt>
									点击 "我知道了" 将为您打开一个新的窗口进行交易
								</dt>
								<div className="line-distance" />
							</dl>
						</React.Fragment>
					),
					onOk: () => {
						thirdparty();
					}
				});
			}
		}
	};
	render() {
		let depositContent = null;
		const { currDepositDetail, bcType, realyName, isDepositMethodsRestricted } = this.state;
		console.log(currDepositDetail);
		//console.log(this.state);
		// 子元素公用Props数据
		const depositChildrenProps = {
			payMethodList: this.state.payMethodList,
			depositStatusCheck: this.depositStatusCheck,
			thirdPartyPay: this.thirdPartyPay,
			bonusApplication: this.bonusApplication,
			currDepositDetail: currDepositDetail,
			setCurrDepositDetail: (result) => {
				this.setState({ currDepositDetail: result });
			},
			setBackEvent: this.props.setBackEvent,
			setBarTitle: this.props.setBarTitle,
			setShowPayMethodsList: (v) => {
				this.setState({ showPayMethodsList: v });
			},
			memberInfo: this.state.memberInfo,
			actualAmount: this.actualAmount,
			depositingWallet: this.state.depositingWallet,
		};
		const renderRealyName = realyName || this.localMemberName;

		switch (this.state.currentDepositKey) {
			case 'LB': // 本银支付
				depositContent = (
					<LB
						{...depositChildrenProps}
						localMemberName={renderRealyName}
						setCurrentPayMethod={(v) => this.setCurrentPayMethod(v)}
						callbackToHome={this.props.callbackToHome}
					/>
				);
				break;
			case 'WCLB': // 微转账
				depositContent = <WCLB {...depositChildrenProps} callbackToHome={this.props.callbackToHome} />;
				break;
			case 'UP': // 银联支付
				depositContent = <UP {...depositChildrenProps} localMemberName={renderRealyName} />;
				break;
			case 'OA': // 在线支付宝
				depositContent = <OA {...depositChildrenProps} localMemberName={renderRealyName} callbackToHome={this.props.callbackToHome} />;
				break;
			case 'WC': // 微支付
				depositContent = <WC {...depositChildrenProps} localMemberName={renderRealyName} />;
				break;
			case 'QQ': // QQ支付
				depositContent = <QQ {...depositChildrenProps} />;
				break;
			case 'BC': // 在线支付
				depositContent = <BC {...depositChildrenProps} localMemberName={renderRealyName} />;
				break;
			case 'BCM': // 快捷支付
				depositContent = <BCM {...depositChildrenProps} localMemberName={renderRealyName} />;
				break;
			case 'ALB': // 支付宝转账
				depositContent = <ALB {...depositChildrenProps} localMemberName={renderRealyName} callbackToHome={this.props.callbackToHome} />;
				break;
			case 'CTC': // 加密货币
				depositContent = (
					<CTC
						{...depositChildrenProps}
						toggleLearnEntry={(status) => {
							this.setState({ isShowLearnEntry: status });
						}}
					/>
				);
				break;
			case 'JDP': // 京东支付
				depositContent = <JDP {...depositChildrenProps} />;
				break;
			case 'AP': // AstroPay
				depositContent = <AP {...depositChildrenProps} />;
				break;
			case 'CC': // 同乐卡
				depositContent = <CC {...depositChildrenProps} />;
				break;
			case 'PPB': // 网银转账
				depositContent = (
					<PPB
						{...depositChildrenProps}
						localMemberName={renderRealyName}
						// bcTypeList={this.bcTypeList}
					/>
				);
				break;
			case 'SR': // 小額支付 small river
				depositContent = <SR {...depositChildrenProps} localMemberName={renderRealyName} />;
				break;
			default:
				break;
		}
		console.log(this.state.OpenFinishStep);
		return (
			<React.Fragment>
				<ThirdParty
					visible={this.state.thirdPartyVisible}
					content={this.state.payHtml}
					title={this.state.thirdPartyBarTitle}
					closeThirdParty={this.closeThirdParty}
				/>

				{this.state.payMethodList.length != 0 ? (
					<div
						className="deposit-list-wrap"
						style={{
							display: this.state.showPayMethodsList ? 'block' : 'none'
						}}
					>
						{this.state.isIWMM ? (
							<React.Fragment>
								<div className="depositIWMMButton" onClick={this.openIWMMModal}>
									点击开启更多存款和提款方式
								</div>
								<div className="IWMMPopover">点击上方按钮完成验证，网银转帐交易即可享有免5%手续费</div>
							</React.Fragment>
						) : null}
						{console.log(this.state.payMethodList)}
						<div className="deposit-list">
							{this.state.payMethodList.map((val, idx) => {
								return (
									<div
										key={val.code + idx}
										className={`deposit-item${val.isNew ? ' new' : val.isFast ? ' fast' : ''}${this
											.state.currentDepositKey === val.code
											? ' active'
											: ''}`}
										onClick={() => this.setCurrentPayMethod(val.code)}
									>
										<div>
											<i className={`payments-sprite ${val.code}`} />
											<span>{val.name}</span>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				) : (
					<Flexbox className="SkeletonTheme Deposit-SkeletonTheme">
						<SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff" inline>
							<Skeleton count={5} width="58px" height="58px" />
							<Skeleton count={5} width="58px" height="58px" />
							<Skeleton count={5} width="58px" height="58px" />
						</SkeletonTheme>
					</Flexbox>
				)}

				<div className="deposit-content-wrap">{depositContent}</div>
				{this.state.FinishRes && (
					<FinishStep
						visible={this.state.OpenFinishStep}
						FinishRes={this.state.FinishRes}
						closeModal={() => {
							this.setState({
								OpenFinishStep: false
							});
						}}
					/>
				)}
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

const mapDispatchToProps = {
	userInfo_getDetails: () => ACTION_User_getDetails()
};

export default withBetterRouter(connect(mapStateToProps, mapDispatchToProps)(Deposit));

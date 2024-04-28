import React from 'react';
import NP from '$SBTWOLIB/js/numberPrecision';
import { ReactSVG } from '$SBTWO/ReactSVG';
import Modal from '$SBTWO/Modal';
import Toast from '$SBTWO/Toast';
import Skeletonbottomsheet from '$SBTWO/Skeleton/bottomsheet';
import {
	SelectionChangeType,
	SelectionStatusType,
	VendorErrorType,
	SpecialUpdateType
} from '$SBTWOLIB/vendor/data/VendorConsts';
import { numberWithCommas } from './BettingDataCheck';
import Router from 'next/router';
import { connect } from 'react-redux';
import { ACTION_UserInfo_getBalanceSB } from '@/lib/redux/actions/UserInfoAction';
import { ACTION_BetCart_setIsComboBet,ACTION_BetCart_remove } from '@/lib/redux/actions/BetCartAction';
import { ApiPort } from '$SBTWOLIB/SPORTAPI';
import { fetchRequest } from '$SBTWOLIB/SportRequest';
/* 投注盘口列表 */
import BetOdds from './BottomBettingOddsList/';
import CrossBetting from './BottomBettingOddsList/CrossBetting';
import CrossBettingSystem from './BottomBettingOddsList/CrossBettingSystem';
import Betstatus from './BottomBettingStaus/';
import BetInfoData from "$SBTWOLIB/vendor/data/BetInfoData";
import { v4 as uuidv4 } from 'uuid';
import {Decimal} from "decimal.js";
import ReactIMG from '$SBTWO/ReactIMG';
import { checkIsLogin, redirectToDeposit } from '$SBTWOLIB/js/util';
import dynamic from 'next/dynamic';

const BottomBalanceList = dynamic(
	() => import('$SBTWO/Games/Footer/BottomBalanceList'),
	{ ssr: false }
)

const	safe_piwik = (eventCategory) => {
		if (eventCategory == undefined) {
			return;
		}
		//避免上傳piwik失敗造成投注失敗
		try {
			let data = eventCategory.replace(/[&\|\\\*^%/$#@\-]/g, '');
			if (typeof _paq === 'object') {
				_paq.push(['trackEvent', data, 'touch']);
			}
		}catch(error) {
			console.log('===safe_piwik error:',error);
		}
	}

class BetCart extends React.Component {
	constructor(props) {
		super(props);

		//投注檢查信息betInfo 會保存在 state.BetInfoData1,2,3 分開保存 是數組型態
		//單投1 可能會有多個，用 EventId 去判斷是否存在
		//串投2,3 只會返回一個，用 index=0 直接獲取

		//金額數據 {key: , betAmount:金額} 保存在  state.BetAmounts1,2,3 分開保存 是數組型態
		//單投1 多個， 用 EventId 作為key
		//串投2(混合過關) 多個, 用BetSettingData.ComboType作為key
		//串投3(系統) 單個, 用 'system' 作為key

		//注意在 投注檢查 用的是 EventId 去判斷，因為返回的BetInfo 身上帶的 selectionId 可能和原本傳入的不同

		this.state = {
			BetInfoData1: [], //投注檢查數據 單投
			BetInfoData2: [], //投注檢查數據 串投
			BetInfoData3: [], //投注檢查數據 串投系統
			BetAmounts1: [], //輸入的投注金額 單投
			BetAmounts2: [], //輸入的投注金額 串投
			BetAmounts3: [], //輸入的投注金額 串投系統
			BetActiveType: 1,
			loading: false,
			StartBettingloading: 0,
			ErrorMsg: '',
			OddsDown: [],
			OddsUpData: [],
			BettingList: [], //下注中的投注數據
			showBalanceError: true,
			Refresh: false,
			ToDown: true,
			ToUp: false,
		};
		this._onScrollEvent = this._onScrollEvent.bind(this);

		this.pollingKeySingleBets = []; //單投的輪詢，可以有多個 格式 { key: id, pk:pollingKey }
		this.pollingKeyComboBet = null; //串投的輪詢，只會有一個

		this.isDidUnmount = null; //紀錄是否已關閉購物車 => 決定一些異步動作還要不要繼續執行
		this.sourceType = 'M'; //用來分辨投注來源 沙巴獨有配置 A=安卓 I=IOS M=Mobile //TODO: saba app這裡要修改
	}

	componentDidMount() {
		console.log('===betcart DidMount')
		this.isDidUnmount = false;

		const { BetType } = this.props;
		this.initByBetType(BetType);

		if (checkIsLogin()) {
			this.props.userInfo_getBalanceSB(true);
		}
	}

	componentWillUnmount() {
		console.log('===betcart WillUnmount')
		this.isDidUnmount = true;
		this.deleteAllPolling();
	}

	//刪除所有輪詢
	deleteAllPolling = () => {
		/* 删除单投盘口的轮询 */
		if (this.pollingKeySingleBets && this.pollingKeySingleBets.length > 0) {
			this.pollingKeySingleBets.map(info => {
				this.props.Vendor.deletePolling(info.pk);
			})
		}
		/* 删除串投盘口的轮询 */
		this.props.Vendor.deletePolling(this.pollingKeyComboBet);
	}

	//初始化 + 檢查投注數據
	initByBetType = (BetType) => {
		const { Vendor } = this.props;

		let MaxParlay = Vendor.configs.MaxParlay;
		this.setState(
			{
				BetActiveType: BetType
			},
			() => {
				const betCartData = this.props.betCartInfo['betCart' + Vendor.configs.VendorName];

				/* *********注单类型 1 单投 2，3 串关 ************/
				if (this.state.BetActiveType == 1) {
					betCartData.forEach((element) => {
						this.CheckBetting(element);
					});
				} else if (this.state.BetActiveType == 2 || this.state.BetActiveType == 3) {
					if (betCartData && betCartData.length > 0) {
						this.CheckBetting(betCartData.slice(0, MaxParlay));
					}
				}
			}
		);
	}

	NotifyBettingInfo = (ID, note = null, retry = 0) => {
		let VendorName;
		if (this.props.Vendor.configs.VendorName == 'IM') {
			VendorName = 'IPSB';
		}
		if (this.props.Vendor.configs.VendorName == 'BTI') {
			VendorName = 'SBT';
		}
		if (this.props.Vendor.configs.VendorName == 'SABA') {
			VendorName = 'OWS';
		}
		const postData = {
			provider: VendorName,
			betId: ID,
			platformId: 20
		};
		let piwikHead = `NotifyBettingInfo_${this.props.Vendor.configs.VendorName}_${postData.betId}_${postData.platformId}`;
		if (note !== null) {
			piwikHead = piwikHead + '_' + note;
		}
		if (retry > 0 ) {
			piwikHead = piwikHead + '_retry' + retry;
		}
		safe_piwik(`${piwikHead}_START`);
		const that = this;
		const startT = new Date().getTime();
		fetchRequest(ApiPort.NotifyBettingInfo, 'POST', postData, false, 30000) //30秒超時
			.then((data) => {
				console.log(data);
				const diffSeconds = ((new Date().getTime() - startT) / 1000).toFixed(2);
				if (!data || !data.result) {
					safe_piwik(`${piwikHead}_END_${diffSeconds}_EMPTY`);
				} else {
					let cleanData = {};
					cleanData['errorCode'] = data.result.errorCode;
					cleanData['referenceId'] = data.result.referenceId;
					cleanData['errorDescription'] = (data.result.dateTime ?? '') + (data.result.errorMessage ?? '');
					const jsonData = JSON.stringify(cleanData);
					safe_piwik(`${piwikHead}_END_${diffSeconds}_${jsonData}`);
				}
			})
			.catch(err => {
				const diffSeconds = ((new Date().getTime() - startT) / 1000).toFixed(2);
				safe_piwik(`${piwikHead}_ERROR_${diffSeconds}_${err}`);
				if (retry < 10) { //最多重試10次
					const thisRetry = retry +1;
					setTimeout(() => {
						that.NotifyBettingInfo(ID, note, thisRetry)
					}, 5000); //5秒後重試
				} else {
					safe_piwik(`${piwikHead}_STOP`); //超過次數限制 不再重試
				}
			})
	};

	/* ****************** 提交购物车注单 开始下注 ******************** */
	//從投注按鈕來的投注請求，需要整理數據
	StartBetting = (
		/* 盘口信息 */
		BetInfo,
		/* 投注金额數組 */
		BetAmountList,
		/* 選中的投注盤口index 系統混合過關專用 */
		ActiveInput,
		/* 免费投注id數組 */
		FreeBetTokenList,
	) => {
		this.deleteAllPolling(); 		//點擊下注 就可以先關閉所有輪詢

		let memberCode = JSON.parse(localStorage.getItem('memberCode'));
		if (typeof _paq === 'object') {
			_paq.push([ 'setUserId', memberCode ]);
		}

		const { BetActiveType } = this.state;
		const { Selections, BetSettings, SystemParlayBetSettings } = BetInfo;

		let bettinglist = []; //投注清單

		//先按投注金額生成 投注清單
		BetAmountList.forEach((amount, index) => {
			if (amount > 0) {
				/* 单投数据 */
				const BetInfoDataForSingleBet = {
					BetSettings: BetSettings[index],
					Selections: Selections[index]
				};

				const thisBetInfo = BetInfoData.clone(BetActiveType != 1 ? BetInfo : BetInfoDataForSingleBet, BetActiveType != 1); //複製一份

				const FreeBetToken = FreeBetTokenList[index];

				/* 盘口类型 */
				let ComboType =
					BetActiveType == 2
						? BetSettings[index].ComboType
						: BetActiveType == 3 ? SystemParlayBetSettings[ActiveInput].ComboType : 0;

				bettinglist.push({
					key: 'Bet_' + uuidv4(), //加一個key 後面異步更新投注狀態，才能找到這個數據
					betInfo: thisBetInfo,
					amount,
					comboType: ComboType,
					acceptChangeOfOdds: false,
					freeBetToken: FreeBetToken ? FreeBetToken : null,
					betResultStatus : 0, //投注結果 儲存於此  0未開始 1投注中 2成功 3失敗 4pending 5賠率變更(等待確認重試) 6未知錯誤
					errorMsg: null, //投注失敗的錯誤信息
				})
			}
		});

		//console.log('====bettinglist',JSON.stringify(bettinglist));

		//更新state，然後提交下注
		this.setState({
			StartBettingloading: 1,
			BettingList: bettinglist,
		}, async () => {
			for (let info of bettinglist) {  //有用到await等投注，必須用for，不能用foreach或map
				if (BetActiveType == 1) {
					this.placeBet(
						info.key,
						info.betInfo,
						info.amount,
						info.comboType,
						info.acceptChangeOfOdds,
						info.freeBetToken,
					);
				} else {
					//串關要一個一個投
					await this.placeBet(
						info.key,
						info.betInfo,
						info.amount,
						info.comboType,
						info.acceptChangeOfOdds,
						info.freeBetToken,
						true,
					);
				}
			}
		})
	};

	//單筆投注處理
	placeBet = async (
		key, //更新投注狀態用
		betInfo,
		betAmount,
		comboType,
		acceptChangeOfOdds,
		freeBetToken,
		isDelayReturn = false, //是否延遲返回(多個串投增加投注間隔)
	) => {
		const startT = new Date().getTime();
		const { BetActiveType } = this.state;
		const { VendorName } = this.props.Vendor.configs;

		//更新投注狀態 函數  0未開始 1投注中 2成功 3失敗 4pending 5賠率變更(等待確認重試)
		const updateBetResultStatus = (thisKey, newStatus, errorMsg = null) => {
			this.setState((state, props) => {
				const indexInBetList = state.BettingList.findIndex(bi => bi.key === thisKey);
				if (indexInBetList !== -1) {
					let bettingInfo = state.BettingList[indexInBetList];
					bettingInfo.betResultStatus = newStatus;
					bettingInfo.errorMsg = errorMsg;
					let cloneArr = [...state.BettingList];
					cloneArr.splice(indexInBetList, 1, bettingInfo); //用splice處理取代
					return {
						BettingList: cloneArr,
					}
				}
			}, () => {
				//根據投注結果 決定是否要 移除投注購物車
				if (newStatus === 2 || newStatus === 4) {
					const bettingData = this.state.BettingList.find(bi => bi.key === thisKey);
					if (BetActiveType == 1) {
						//單注 投注成功 直接把該筆 從購物車移除
						if (bettingData && bettingData.betInfo.Selections) {
							//直接用redux處理購物車，從上層繼承來的RemoveBetCart函式有其他額外操作
							this.props.betCart_remove(bettingData.betInfo.Selections, VendorName);
						}
					} else {
						//串關 只要有一個投注成功  就把所有相關的 投注選項 從購物車移除
						if (bettingData) {
							const comboSelections = bettingData.betInfo.getSelectionsForCombo();
							comboSelections.map(item => {
								//直接用redux處理購物車，從上層繼承來的RemoveBetCart函式有其他額外操作
								this.props.betCart_remove(item, VendorName);
							})
						}
					}
				}

				//檢查所有投注結果 決定是否切換展示狀態
				const allStatus = this.state.BettingList.map(betting => {
					return betting.betResultStatus;
				})
				//有還沒完成的 不切換
				if ((allStatus.indexOf(0) !== -1)
					|| (allStatus.indexOf(1) !== -1)
					|| (allStatus.indexOf(5) !== -1)
				) {
					return;
				}
				//有pending => 跳pending
				if (allStatus.indexOf(4) !== -1) {
					this.setState({ StartBettingloading: 4 });
					return;
				}
				//有一個成功 => 跳成功
				if (allStatus.indexOf(2) !== -1) {
					this.setState({ StartBettingloading: 2 });
					return;
				}
				// 未知錯誤
				if (allStatus.indexOf(6) !== -1) {
					this.setState({ StartBettingloading: 6 });
					return;
				}
				//剩下的跳失敗
				this.setState({ StartBettingloading: 3 });
			});
		}

		//回報投注結果到piwik
		const PIWIKBetResult = (isSuccess, wagerId = null) => {
			const diffSeconds = ((new Date().getTime() - startT) / 1000).toFixed(2);
			if (isSuccess) {
				safe_piwik(`BetSpeed_${this.props.Vendor.configs.VendorName}_${BetActiveType}_${diffSeconds}_${'Success'}_${wagerId}`);
				console.log('===成功投注所花费的时间-' + diffSeconds + '秒/s', wagerId);
			} else {
				safe_piwik(`BetSpeed_${this.props.Vendor.configs.VendorName}_${BetActiveType}_${diffSeconds}_${'failure'}`);
				console.log('===失敗投注所花費的時間-' + diffSeconds + '秒/s', wagerId);
			}
		}

		updateBetResultStatus(key, 1); //1投注中

		//投注日志
		const betlog = (betid, logJSON) => {
			//避免上傳piwik失敗造成投注失敗
			try {
				if (typeof _paq === 'object') {
					//category, action, name
					console.log('=====betlog', 'betlog_' + this.props.Vendor.configs.VendorName + '_' + BetActiveType, betid, JSON.parse(logJSON));
					_paq.push(["trackEvent", 'betlog_' + this.props.Vendor.configs.VendorName + '_' + BetActiveType, betid, logJSON]);
				}
			}catch(error) {
				console.log('===betlog error:',error);
			}
		}
		const betlogerror = (error) => {
			//避免上傳piwik失敗造成投注失敗
			try {
				if (typeof _paq === 'object') {
					//category, action, name
					console.log('=====betlog', 'betlog_' + this.props.Vendor.configs.VendorName + '_' + BetActiveType, 'error', error);
					_paq.push(["trackEvent", 'betlog_' + this.props.Vendor.configs.VendorName + '_' + BetActiveType, 'error', JSON.stringify(error)]);
				}
			}catch(error) {
				console.log('===betlogerror error:',error);
			}
		}

		return new Promise((inner_resolve) => {
			let resolve = inner_resolve;
			if (isDelayReturn) { //連續串投，延遲3秒再返回
				let delaySeconds = 3; //默認延遲3秒(for IM)
				if (VendorName === 'BTI') { //BTI實測要更長
					delaySeconds = 6; //BTI延到6秒
				}

				resolve = (needDelayReturn) => {
					if (needDelayReturn) {
						console.log('===串投...延遲投注',delaySeconds,'秒後再投');
						setTimeout(() => inner_resolve(needDelayReturn), delaySeconds * 1000);
					} else {
						console.log('===串投...不用延遲投注')
						inner_resolve(needDelayReturn);
					}
				}
			}

			this.props.Vendor
				.placeBet(
					BetActiveType != 1 ? 2 : 1,
					betInfo,
					betAmount,
					comboType,
					acceptChangeOfOdds,
					{
						sourceType: this.sourceType, //沙巴專用參數
						freeBetToken, //bti專用參數
					},
				)
				.then((betResult) => {
					updateBetResultStatus(key, betResult.IsPending ? 4 : 2); //2成功 4pending
					if (!betResult.IsPending) {
						PIWIKBetResult(true, betResult.WagerId);
						this.props.userInfo_getBalanceSB(true); //強制刷新餘額
					}

					//提交投注日誌
					betlog(betResult.WagerId, betResult.BetLogJSON);

					//提交投注結果給後端
					this.NotifyBettingInfo(betResult.WagerId,betResult.IsPending ? 'PENDING' : null);

					if (betResult.IsPending) { //pending中 在背景查詢投注結果
						this.props.Vendor.queryPendingBetStatus(betResult.PendingQueryId).then((queryBetStatusData) => {
							console.log('=== queryBetStatus data', queryBetStatusData);

							if (queryBetStatusData.IsSuccess) {
								//投注成功
								if (!this.isDidUnmount) {
									updateBetResultStatus(key, 2); //2成功
								}
								PIWIKBetResult(true, queryBetStatusData.WagerId);
							} else {
								//投注失敗
								//1 = 待处理 <==超時會返回這個 不修改狀態，本來就是4
								//3 = 已拒绝 (参考危险球取消)
								//4 = 已取消
								if (queryBetStatusData.FinalWagerStatus != 1) {
									if (!this.isDidUnmount) {
										updateBetResultStatus(key, 3, '投注已被取消(危险球)'); //3失敗
									}
								} else {
									//超時，把投注選項 從 購物車移除
									const bettingData = this.state.BettingList.find(bi => bi.key === key);
									if (BetActiveType == 1) {
										//單注 超時 直接把該筆 從購物車移除
										if (bettingData && bettingData.betInfo.Selections) {
											//直接用redux處理購物車，從上層繼承來的RemoveBetCart函式有其他額外操作
											this.props.betCart_remove(bettingData.betInfo.Selections, VendorName);
										}
									} else {
										//串關 如果只有一個串關投注 且 超時 就把所有相關的 投注選項 從購物車移除
										//如果有兩個以上串關投注，只要其中一個投注成功就會自動清了，所以這裡不用考慮
										if (bettingData && this.state.BettingList.length === 1) {
											const comboSelections = bettingData.betInfo.getSelectionsForCombo();
											comboSelections.map(item => {
												//直接用redux處理購物車，從上層繼承來的RemoveBetCart函式有其他額外操作
												this.props.betCart_remove(item, VendorName);
											})
										}
									}
								}
								PIWIKBetResult(false);
							}
							this.props.userInfo_getBalanceSB(true); //強制刷新餘額
						});
					}

					resolve(true);
				})
				.catch((error) => {
					//提交投注錯誤日誌
					betlogerror(error);

					//這裡處理下注可能返回的錯誤
					let msg = '投注不成功，请稍后重试';
					let isUnknownError = true;
					if (typeof error === 'object' && error.isVendorError === true) {
						//定義好的VendorError錯誤類
						//處理這些錯誤
						// switch (error.ErrorType) {
						// 	case VendorErrorType.BET_Place_Expire: //超時只有BTI有，視為pending處理
						// 	case VendorErrorType.BET_Place_OddChanged: //赔率已变更  <--這個按mockup，有特殊流程要處理
						// 	//下面這些應該直接展示錯誤信息
						// 	case VendorErrorType.VENDOR_Error: //Vendor系統錯誤
						// 	case VendorErrorType.VENDOR_Maintenance: //Vendor維護
						// 	case VendorErrorType.BET_Place_Error: //下注失敗
						// 	case VendorErrorType.BET_Place_Updating: //赔率更新中
						// 	case VendorErrorType.BET_Place_Balance: //余额不足
						// 	case VendorErrorType.BET_Place_LimitMax: //投注金额超于限额
						// 	case VendorErrorType.BET_Place_LimitMin: //投注金额低于最小投注额
						// 	case VendorErrorType.BET_Place_LimitTotal: //这赛事总投注金额超于限额
						// 	case VendorErrorType.BET_Place_NOPARLAY: //所选赛事不支持连串过关，请选其他赛事
						// 	case VendorErrorType.BET_Place_MONEY: // 無效投注金額
						// }
						//這可以拿到中文錯誤信息，可以直接拿來展示
						msg = error.ErrorMsg;
						isUnknownError = (error.ErrorType === VendorErrorType.Unknown_Error);
						//超時只有BTI有，視為pending處理
						if (error.ErrorType === VendorErrorType.BET_Place_Expire) {
							console.log('-------- BTI超時 ------');
							updateBetResultStatus(key, 4); //4 pending
							PIWIKBetResult(false); //因為也沒有注單號，傳給piwik當作投注失敗
							this.props.userInfo_getBalanceSB(true); //強制刷新餘額
							resolve(false); //超時了 不用延遲返回
							return;
						}
						if (
							error.ErrorType === VendorErrorType.BET_Place_OddChanged &&
							this.props.isBottomSheetVisible
						) {
							console.log('-------- 赔率发生变化 让用户选择是否接受赔率变化222 ------');

							//重新獲取當前賠率
							this.props.Vendor.getBetInfo(BetActiveType != 1 ? 2 : 1, betInfo.Selections)
								.then(pr => {
									const thisBetInfo = pr.NewData;

									//更新bettingList數據
									const thisBetInfoForBettingList = BetInfoData.clone(thisBetInfo, BetActiveType != 1); //複製一份
									this.setState((state, props) => {
										const indexInBetList = state.BettingList.findIndex(bi => bi.key === key);
										if (indexInBetList !== -1) {
											let bettingInfo = state.BettingList[indexInBetList];
											console.log('====before update BettingList', JSON.parse(JSON.stringify(bettingInfo.betInfo)));
											bettingInfo.betInfo = thisBetInfoForBettingList;
											console.log('====after update BettingList', JSON.parse(JSON.stringify(bettingInfo.betInfo)));
											let cloneArr = [...state.BettingList];
											cloneArr.splice(indexInBetList, 1, bettingInfo); //用splice處理取代
											return {
												BettingList: cloneArr,
											}
										}
									});

									let displayText = null;
									let OldOdds = null;
									let NewOdds = null;
									//BTI需要處理點位point變動
									let OldPoints = null;
									let NewPoints = null;
									let oldSelectionDesc = null;
									let newSelectionDesc = null;
									if (BetActiveType == 1) {
										//單注 用selection.DisplayOdds
										displayText = betInfo.Selections.IsOutRightEvent ? betInfo.Selections.OutRightEventName : (betInfo.Selections.HomeTeamName + ' vs ' + betInfo.Selections.AwayTeamName);
										if (betInfo.Selections) {
											OldOdds = betInfo.Selections.DisplayOdds;
											OldPoints = betInfo.Selections.Handicap;
											oldSelectionDesc = betInfo.Selections.SelectionDesc;
										}
										if (thisBetInfo.Selections) {
											NewOdds = thisBetInfo.Selections.DisplayOdds;
											NewPoints = thisBetInfo.Selections.Handicap;
											newSelectionDesc = thisBetInfo.Selections.SelectionDesc;
										}
									} else {
										//串關 用betSettings.EstimatedPayoutRate
										if (betInfo.BetSettings) {
											const thisBS = betInfo.BetSettings.find(bs => bs.ComboType == comboType);
											if (thisBS) {
												OldOdds = thisBS.EstimatedPayoutRate
												displayText = thisBS.ComboTypeName +  ' x '  + thisBS.ComboCount;
											}
										}
										if (thisBetInfo.BetSettings) {
											const thisBS = thisBetInfo.BetSettings.find(bs => bs.ComboType == comboType);
											if (thisBS) {
												NewOdds = thisBS.EstimatedPayoutRate
											}
										}
									}

									let pointChanged = false;
									if (OldPoints !== undefined
										&& NewPoints !== undefined
										&& OldPoints != NewPoints
									) {
										pointChanged = true;
									}

									//檢查是否真的賠率下降，可能頻繁變動，導致這裡查到的新賠率反而上升
									let newOddsIsSmaller = true;
									if (OldOdds && NewOdds) {
										newOddsIsSmaller = new Decimal(OldOdds).greaterThan(NewOdds);
										if (!newOddsIsSmaller) {
											console.log('====賠率不降反升？視為投注失敗',OldOdds,'=>',NewOdds);
										}
									}

									if (displayText && OldOdds && NewOdds && newOddsIsSmaller) {
										updateBetResultStatus(key, 5); //5賠率變更(等待確認重試)
										//成功獲取相關係題，提示是否接受
										Modal.info({
											className: 'Betconfirm',
											icon: null,
											centered: true,
											type: 'confirm',
											title: '赔率降低了，您要接受吗？',
											content: <>
												<div>{displayText}</div>
												{pointChanged ? <div>投注选项 從 {oldSelectionDesc} 变更为 {newSelectionDesc}</div> : null}
												<div>從 @{OldOdds} 降低到 @{NewOdds}</div>
											</>,
											okText: '接受',
											cancelText: '不接受',
											onOk: async () => {
												updateBetResultStatus(key, 0); //狀態歸零
												//重新投注
												if (BetActiveType == 1) {
													this.placeBet(
														key, //更新投注狀態用
														thisBetInfoForBettingList,
														betAmount,
														comboType,
														false,
														freeBetToken,
														false, //是否延遲返回(多個串投增加投注間隔)
													);
												} else {
													//串關要一個一個投
													await this.placeBet(
														key, //更新投注狀態用
														thisBetInfoForBettingList,
														betAmount,
														comboType,
														false,
														freeBetToken,
														true, //是否延遲返回(多個串投增加投注間隔)
													);
												}
												resolve(false); //賠率變化不用延遲返回
											},
											onCancel: () => {
												updateBetResultStatus(key, 3, '赔率降低取消'); //投注失敗
												PIWIKBetResult(false);
												resolve(false); //取消 不用延遲返回
											}
										});
									} else {
										//提示信息不足，當作投注失敗, 或投注賠率不降反升，也當作失敗
										throw '投注不成功，请稍后重试';
									}
								})
								.catch(e => {
									console.log('===查詢新賠率失敗??',e);
									//發生錯誤就當作投注失敗
									updateBetResultStatus(key, 6, `网络异常`); //6
									PIWIKBetResult(false);
									resolve(false); //投注失敗不用延遲返回
								})

							return;
						}
					}
					if(isUnknownError) {
						updateBetResultStatus(key, 6, `网络异常`); //6未知失敗
					} else {
						updateBetResultStatus(key, 3, msg); //3投注失敗
					}
					PIWIKBetResult(false);
					this.props.userInfo_getBalanceSB(true); //強制刷新餘額
					resolve(false); //投注失敗不用延遲返回
				});
		})
	}

	/* ***********投注之前进行盘口的检查 購物車開啟時才會執行 *************/
	CheckBetting = (SelectionData) => {
		/* 1 单投 2 串关 3 混合投注 */
		const {BetActiveType} = this.state;
		this.setState({
			loading: true
		});

		const that = this;
		//檢查狀態，OK(100)才是可以投注
		//輪詢 投注檢查 數據更新回調
		const onUpdateHandler = (targetBetActiveType) => { //多包一層，保存當前是用哪個分頁
			return (pollingResultOfBetInfo) => {
				if (that.state.BetActiveType != targetBetActiveType) {
					//分頁已換，直接放棄退出
					return
				}

				//這裏返回數據 是PollingResult 格式 包含偵測賠率變化的changes
				//這裏數據 是BetInfoData 格式，單注的 Selections 和 BetSettings 字段 都只有一個實例，不是數組
				const betInfo = pollingResultOfBetInfo.NewData;
				const changes = pollingResultOfBetInfo.Changes;
				console.log('%c投注检查详情', 'font-size:25px;color:violet;', betInfo);

				const {Vendor} = that.props;
				const betCartData = that.props.betCartInfo['betCart' + Vendor.configs.VendorName];

				if (BetActiveType == 1 && !Array.isArray(betInfo.Selections)) {
					console.log('进入单投');

					//如果已經從投注購物車移除，直接放棄退出
					const indexInBetCart = betCartData.findIndex(s => s.EventId == betInfo.Selections.EventId);
					if (indexInBetCart === -1) {
						return;
					}

					/* 判断是否已经存在 */
					const indexInBetInfoArr = that.state.BetInfoData1.findIndex(bi => bi.Selections.EventId == betInfo.Selections.EventId)
					if (indexInBetInfoArr === -1) {
						//添加
						that.setState((state, props) => {
							//順序 要 按照投注購物車的順序
							let biArr = [...state.BetInfoData1, betInfo];
							const sortBIfunc = (aBI, bBI) => {
								const a = betCartData.findIndex(s => s.EventId == aBI.Selections.EventId);
								const b = betCartData.findIndex(s => s.EventId == bBI.Selections.EventId);
								if (a < b ) {
									return -1; //小于 0 ，那么 a 会被排列到 b 之前
								}
								if (a > b ) {
									return 1; //大于 0 ， b 会被排列到 a 之前。
								}
								// a must be equal to b
								return 0;
							}

							biArr.sort(sortBIfunc);

							return {
								BetInfoData1: biArr,
								BetAmounts1: [...state.BetAmounts1, {key: betInfo.Selections.EventId, betAmount: ''}], //默認amount是 '' 空白
							}
						});
					} else {
						//取代
						that.setState((state, props) => {
							const indexInBetInfoArr = state.BetInfoData1.findIndex(bi => bi.Selections.EventId == betInfo.Selections.EventId) //再判斷一次，因為是異步環境
							let cloneArr = [...state.BetInfoData1];
							cloneArr.splice(indexInBetInfoArr, 1, betInfo); //用splice處理取代
							return {
								BetInfoData1: cloneArr,
							}
						});
					}

					if (betInfo.Selections.SelectionStatus !== SelectionStatusType.OK
						|| !betInfo.BetSettings)
					{
						//不能投注，清空金額
						that.setState((state, props) => {
							const currentAmounts = state.BetAmounts1;
							let cloneAmounts = [...currentAmounts];

							const indexInAmountArr = cloneAmounts.findIndex(a => a.key == betInfo.Selections.EventId);
							if (indexInAmountArr !== -1) {
								cloneAmounts.splice(indexInAmountArr,1);
							}
							return {BetAmounts1: cloneAmounts};
						});
					}
				} else if (BetActiveType == 2 || BetActiveType == 3) {
					console.log('进入混合投注');

					//selection順序 要 按照投注購物車的順序
					if (betInfo && betInfo.Selections && betInfo.Selections.length > 0) {
						let biSelections = [...betInfo.Selections];
						const sortBISelectionsFunc = (aBI, bBI) => {
							const a = betCartData.findIndex(s => s.EventId == aBI.EventId);
							const b = betCartData.findIndex(s => s.EventId == bBI.EventId);
							if (a < b) {
								return -1; //小于 0 ，那么 a 会被排列到 b 之前
							}
							if (a > b) {
								return 1; //大于 0 ， b 会被排列到 a 之前。
							}
							// a must be equal to b
							return 0;
						}
						biSelections.sort(sortBISelectionsFunc);
						betInfo.Selections = biSelections;
					}

					//BetInfo只有單個不用判斷 直接取代
					that.setState({['BetInfoData' + BetActiveType]: [betInfo]});

					//處理投注金額
					//列出所有comboType
					const betSettings = betInfo.BetSettings;

					let comboTypes = [];
					if (BetActiveType == 3) {
						comboTypes = ['system']; //系統混合只有一個金額字段
					} else if (betSettings && betSettings.length > 0) {
						comboTypes = betSettings.map(bs => bs.ComboType);
					}

					that.setState((state, props) => {
						const stateKey = 'BetAmounts' + BetActiveType;
						const currentAmounts = state[stateKey];
						let cloneAmounts = [...currentAmounts];

						comboTypes.map(ct => {
							const indexInAmountArr = cloneAmounts.findIndex(a => a.key == ct);
							if (indexInAmountArr === -1) {
								//不存在=>添加betamount數據
								cloneAmounts.push({ key: ct, betAmount: '', freeBetToken: null}); //默認amount是 '' 空白
							}
						})
						return {[stateKey]: cloneAmounts};
					});
				}

				//處理變更，和 查詢比賽 的輪詢處理方式一樣
				const down = [];
				const up = [];
				changes.map((changeData) => {
					//類型：更新
					if (changeData.ChangeType === SelectionChangeType.Update) {
						changeData.SpecialUpdates.map((sUpdateData) => {
							const thisSelectionId = changeData.SelectionId;
							// 處理賠率上升動畫
							if (sUpdateData.UpdateType === SpecialUpdateType.OddsUp) {
								up.push({
									SelectionId: thisSelectionId,
									OldValue: sUpdateData.OldValue,
									NewValue: sUpdateData.NewValue
								});
								that.setState({
									OddsUpData: up
								});
							}
							// 處理賠率下降動畫
							if (sUpdateData.UpdateType === SpecialUpdateType.OddsDown) {
								down.push({
									SelectionId: thisSelectionId,
									OldValue: sUpdateData.OldValue,
									NewValue: sUpdateData.NewValue
								});
								that.setState({
									OddsDown: down
								});
							}
						});
					}
				});
				that.setState({
					loading: false
				});
			};
		}

		//輪詢 (檢查)投注選項並獲取投注上下限 等信息
		/* 分别轮询 单投和串投 */
		if (BetActiveType == 1) {
			//刪除串投輪詢
			this.props.Vendor.deletePolling(this.pollingKeyComboBet);
			this.pollingKeyComboBet = null;
			//刪除串投數據
			if (
				(this.state.BetInfoData2 && this.state.BetInfoData2.length > 0)
				|| (this.state.BetInfoData3 && this.state.BetInfoData3.length > 0)
			) {
				this.setState({BetInfoData2: [], BetInfoData3: []})
			}

			const pollingKeyOne = this.props.Vendor.getBetInfoPolling(onUpdateHandler(BetActiveType), 1, SelectionData);

			/* 保存轮询key */
			this.pollingKeySingleBets.push({key: SelectionData.EventId, pk: pollingKeyOne});

		} else if (BetActiveType == 2 || BetActiveType == 3) {
			/* 删除单投轮询 */
			if (this.pollingKeySingleBets && this.pollingKeySingleBets.length > 0) {
				this.pollingKeySingleBets.map(info => {
					this.props.Vendor.deletePolling(info.pk);
				})
				this.pollingKeySingleBets = [];
			}
			//刪除單投數據
			if (
				(this.state.BetInfoData1 && this.state.BetInfoData1.length > 0)
			) {
				this.setState({BetInfoData1: []})
			}
			//刪除另外一個串投的數據
			let biStateName = 'BetInfoData' + ((BetActiveType == 2) ? 3 : 2);
			if (
				(this.state[biStateName] && this.state[biStateName].length > 0)
			) {
				this.setState({[biStateName]: []})
			}

			this.pollingKeyComboBet = this.props.Vendor.getBetInfoPolling(onUpdateHandler(BetActiveType), 2, SelectionData);
		}
	}

	/* ******************** 数字键盘金额计算 *********************** */
	modifyNum = (sign, buttonIndex, dataKey) => {
		const stateKey = 'BetAmounts' + this.state.BetActiveType;
		let targetAmountData = this.state[stateKey].find(v => v.key == dataKey);
		let BetAmountval = targetAmountData ? targetAmountData.betAmount : '';
		const Setting = this.props.Vendor.getMemberSetting()

		let newBetAmountVal = '';

		/* 删除 */
		if (sign == 'del') {
			if (BetAmountval.length > 0) {
				let valNew = BetAmountval.slice(0, -1);
				if (valNew.length == 0) {
					newBetAmountVal = '';
				} else {
					newBetAmountVal = valNew;
				}
			}
		} else if (sign == 'add' && buttonIndex == 7) {
			/* 快捷金额 add */
			newBetAmountVal = NP.plus(Number(BetAmountval), Setting.amount1) + '';
		} else if (sign == 'add' && buttonIndex == 11) {
			newBetAmountVal = NP.plus(Number(BetAmountval), Setting.amount2) + '';
		} else if (sign == 'add' && buttonIndex == 15) {
			newBetAmountVal = NP.plus(Number(BetAmountval), Setting.amount3) + '';
		} else if (sign == 'clear') {
			/* 清空 */
			newBetAmountVal = '';
		} else if (buttonIndex == 3) {
			newBetAmountVal = sign;
		} else {
			let val = Number(BetAmountval);
			if (val == 0 && sign == 0) {
				return;
			}
			newBetAmountVal = BetAmountval + sign;
		}

		this.setState((state, props) => {
			const currentAmounts = state[stateKey];
			let cloneAmounts = [...currentAmounts];

			const indexInAmountArr = cloneAmounts.findIndex(a => a.key == dataKey);
			if (indexInAmountArr === -1) {
				//不存在=>添加betamount數據
				cloneAmounts.push({ key: dataKey, betAmount: newBetAmountVal});
			} else {
				const currentAmountData = cloneAmounts.find(a => a.key == dataKey);
				currentAmountData.betAmount = newBetAmountVal;
				cloneAmounts.splice(indexInAmountArr,1,currentAmountData);
			}
			return {[stateKey]: cloneAmounts};
		});
	};

	//選擇免費投注，和投注金額一樣，信息存在 state BetAmount1,2,3 裡面
	chooseFreeBet = (dataKey, freeBetToken) =>  {
		this.setState((state, props) => {
			const stateKey = 'BetAmounts' + this.state.BetActiveType;
			const currentAmounts = state[stateKey];
			let cloneAmounts = [...currentAmounts];
			const indexInAmountArr = cloneAmounts.findIndex(a => a.key == dataKey);
			if (indexInAmountArr === -1) {
				//不存在=>添加數據
				cloneAmounts.push({ key: dataKey, betAmount: '', freeBetToken});
			} else {
				const currentAmountData = cloneAmounts.find(a => a.key == dataKey);
				currentAmountData.freeBetToken = freeBetToken;
				//取代
				cloneAmounts.splice(indexInAmountArr,1,currentAmountData);
			}
			return {[stateKey]: cloneAmounts};
		});
	}

	/* ***********************购物车删除 ***************************/
	RemoveBetCart = async (item = null) => {
		//先從購物車刪除
		await this.props.RemoveBetCart(item);

		const {BetActiveType} = this.state;
		const { VendorName, MaxParlay } = this.props.Vendor.configs;
		const betCartData = this.props.betCartInfo['betCart' + VendorName];

		if (BetActiveType == 1) {
			//單投

			//刪除輪詢
			if (this.pollingKeySingleBets && this.pollingKeySingleBets.length > 0) {
				this.pollingKeySingleBets.map(info => {
					if(info.key == item.EventId) {
						this.props.Vendor.deletePolling(info.pk);
					}
				})
			}
			//刪除數據
			this.setState((state, props) => {
				const indexInBetInfoArr = state.BetInfoData1.findIndex(bi => bi.Selections.EventId == item.EventId);
				let cloneBetInfoArr = [...state.BetInfoData1];
				cloneBetInfoArr.splice(indexInBetInfoArr, 1); //刪除

				const indexInBetAmountArr = state.BetAmounts1.findIndex( ba => ba.key == item.EventId);
				let cloneBetAmountArr = [...state.BetAmounts1];
				cloneBetAmountArr.splice(indexInBetAmountArr, 1); //刪除

				return {
					BetInfoData1: cloneBetInfoArr,
					BetAmounts1: cloneBetAmountArr,
				}
			});

		} else if (BetActiveType == 2 || BetActiveType == 3) {

			//串投
			//刪除輪詢
			this.props.Vendor.deletePolling(this.pollingKeyComboBet);

			//刪除數據
			const stateBetInfoKey = 'BetInfoData' + BetActiveType;
			const stateBetAmountsKey = 'BetAmounts' + BetActiveType;
			this.setState({
					[stateBetInfoKey]: [],
					[stateBetAmountsKey]: [],
				});

			//購物車有1個以上 要重建輪詢
			if (betCartData && betCartData.length >= 0) {
				this.CheckBetting(betCartData.slice(0, MaxParlay));
			}
		}
	};

	/* ********** 注单玩法切换 单投 混合过关 系统混合过关 *********/
	ClickTabmenu = (type) => {
		const {Vendor} = this.props;
		const betCartData = this.props.betCartInfo['betCart' + Vendor.configs.VendorName];

		this.initByBetType(type);

		if ((type == 2 || type == 3) && betCartData.length < 2) {
			if (this.props.DetailPage) return;
			this.props.betCart_setIsComboBet(true, Vendor.configs.VendorName);
			this.props.CloseBottomSheet();
		} else {
			this.props.betCart_setIsComboBet(false, Vendor.configs.VendorName);
		}
	};

	/* ***************** 更新投注單所屬錢包總額 *******************/
	refreshBalanceAmonnt = ()=>{
		this.props
			.userInfo_getBalanceSB(true) //強制刷新
			.then((result) => {
				console.log('===refresh balance', result);
				Toast.success('余额刷新成功');
			});
		}

	/* ***************** 開啟下拉式錢包清單 *******************/
	ShowBalanceSheetList = () =>{
		this.BottomBalanceRef && this.BottomBalanceRef.ShowBottomSheet();
	}
	/* ***************** 监听查看更多滚动事件 *******************/
	_onScrollEvent = (key) => {
		if (key) {
			this._container.scrollTop = key * 185;
		} else if (this._container.scrollTop + this._container.clientHeight === this._container.scrollHeight) {
			this.setState({
				ToDown: false,
				ToUp: true
			});
		} else {
			this.setState({
				ToDown: true,
				ToUp: false
			});
		}
	}

	render() {
		/* **********会员添加购物车投注选择的盘口数据********** */
		const {
			//投注檢查數據
			BetInfoData1,
			BetInfoData2,
			BetInfoData3,
			//輸入的投注金額
			BetAmounts1,
			BetAmounts2,
			BetAmounts3,
			/* 注单类型 1单投 2混合 3系统混合 */
			BetActiveType,
			/* 是否加载 */
			loading,
			/* 投注状态 0 未投注 1 投注中 2 投注成功 3 投注失败 */
			StartBettingloading,
			/* 下注中的投注數據 */
			BettingList,
			/* 上升赔率 */
			OddsUpData,
			/* 下降赔率 */
			OddsDown,
			/* 是否展示余额不足提示 */
			showBalanceError,
			/* 查看更多 回底部 */
			ToDown,
			/* 查看更多 回顶部 */
			ToUp,
		} = this.state;
		/* 已投注的队列数据 用于投注后的 状态 */

		const {Vendor} = this.props;
		const betCartData = this.props.betCartInfo['betCart' + Vendor.configs.VendorName];
		
		let hasBetInfo = false;
		let currentBetInfoData = null;
		let currentBetAmountData = null;
		if(BetActiveType == 1) {
			hasBetInfo = BetInfoData1 && BetInfoData1.length > 0;
			if (hasBetInfo) {
				//單注 要合併 BetSettings 和 Selections
				let tmpS = [];
				let tmpB = [];
				BetInfoData1.map(bi => {
					tmpS.push(bi.Selections);
					tmpB.push(bi.BetSettings);
				})
				currentBetInfoData = {
					BetSettings: tmpB,
					Selections: tmpS,
				}
				currentBetAmountData = BetAmounts1;
			}
		} else if (BetActiveType == 2) {
			hasBetInfo = BetInfoData2 && BetInfoData2.length > 0;
			if (hasBetInfo) {
				currentBetInfoData = BetInfoData2[0];
				currentBetAmountData = BetAmounts2;
			}
		} else if (BetActiveType == 3) {
			hasBetInfo = BetInfoData3 && BetInfoData3.length > 0;
			if (hasBetInfo) {
				currentBetInfoData = BetInfoData3[0];
				currentBetAmountData = BetAmounts3;
			}
		}

		return (
			<div className={this.props.Minishow ? 'MiniShow' : 'Minihide'}>
				{StartBettingloading == 0 ? (
					<div>
						{loading && <Skeletonbottomsheet />}
						<div className={'Header'}>
							<div className="left">
								投注单
								<span className="Number">{betCartData != '' ? betCartData.length : 0}</span>
							</div>
							<div className="Balancedata">
								{this.props.userInfo.isGettingBalanceSB ? (
									'余额刷新中'
								) : (
									<span className="MoneyNum" onClick={this.ShowBalanceSheetList}>¥ {numberWithCommas(this.props.userInfo.balanceSB)}</span>
								)}
								{this.props.userInfo.isGettingBalanceSB ? (
									<div className="loader" />
								) : (
									<ReactSVG
										src={'/img/svg/refresh.svg'}
										onClick={this.refreshBalanceAmonnt}
									/>
								)}
							</div>
							{this.props.userInfo.balanceSB < 20 &&
							showBalanceError && (
								<div
									className="ShowbalanceTxt"
									onClick={() => {
										this.setState({
											showBalanceError: false
										});
									}}
								>
									您的余额低，建议<u
										className="blue"
										onClick={() => {
											redirectToDeposit();
											this.props.CloseBottomSheet();
										}}
									>
										立即存款
									</u>
									<ReactSVG src={'/img/svg/betting/y_j.svg'} className="j" />
								</div>
							)}
						</div>
						<div
							className="Bet-digit-keyboard"
							id="Bet-digit-keyboard"
							ref={(e) => (this._container = e)}
							onScrollCapture={() => this._onScrollEvent()}
							style={loading ? { overflow: 'hide' } : {}}
						>
							<ul className="BetTabs">
								{[
									{ name: '单项投注', type: 1 },
									{ name: '混合过关', type: 2 },
									{ name: '系统混合过关', type: 3 }
								].map((item, index) => {
									return (
										<li
											key={index}
											className={BetActiveType == item.type ? 'ActiveMenu' : ''}
											onClick={() => {
												if (loading) return;
												/* 如果混合过关 没有数据 则让用户去添加 */
												this.ClickTabmenu(item.type);
												// if (item.type == 1) {
												// 	Pushgtagdata(`Game Feature`, 'Click', 'SingleBet_BetCart_SB2.0');
												// } else if (item.type == 2) {
												// 	Pushgtagdata(`Game Feature`, 'Click', 'ComboBet_BetCart_SB2.0');
												// } else {
												// 	Pushgtagdata(`Game Feature`, 'Click', 'SystemCombo_BetCart_SB2.0');
												// }
											}}
										>
											{item.name}
										</li>
									);
								})}
							</ul>
							{betCartData.length > 2 && (
								<div className={ToDown ? 'CheckMore' : 'CheckMore-bottom'}>
									{ToDown && (
										<div
											className="btn"
											onClick={() => {
												this._container.scrollTop = this._container.scrollHeight;
												this.setState({
													ToDown: false,
													ToUp: true
												});
											}}
										>
											<ReactSVG src={'/img/svg/betting/down.svg'} className="m_v" />
											查看更多
										</div>
									)}
									{ToUp && (
										<div
											className="btn"
											onClick={() => {
												this._container.scrollTop = 0;
												this.setState({
													ToDown: true,
													ToUp: false
												});
											}}
										>
											<ReactSVG src={'/img/svg/betting/up.svg'} className="m_v" />
											查看更多
										</div>
									)}
								</div>
							)}

							<div className="Betlist">
								{/* 盘口列表 單注頁面 有額外帶上金額和統計 */}
								{hasBetInfo && (
									<BetOdds
										/* 上升赔率 */
										OddsUpData={OddsUpData}
										/* 下降赔率 */
										OddsDown={OddsDown}
										/* 注单类型  单投 - 混合 - 系统混合 */
										BetActiveType={BetActiveType}
										/* 盘口检查数据 */
										BetInfoData={currentBetInfoData}
										/* 投注金額 */
										BetAmountData={currentBetAmountData}
										/* 键盘金额计算 */
										modifyNum={this.modifyNum}
										/* 選擇免費投注 */
										chooseFreeBet={this.chooseFreeBet}
										/* 监听滚动事件 */
										_onScrollEvent={this._onScrollEvent}
										/* 投注API */
										StartBetting={this.StartBetting}
										/* 关闭投注購物車 */
										CloseBottomSheet={this.props.CloseBottomSheet}
										/* 删除购物车盘口 */
										RemoveBetCart={this.RemoveBetCart}
										/* 会员余额 */
										Balance={this.props.userInfo.balanceSB}
										/* 厂商模块 */
										Vendor={this.props.Vendor}
									/>
								)}

								{/* 混合过关 下面的串關金額(支持多個同時投) 和 金額統計 */}
								{BetActiveType == 2 &&
								hasBetInfo && (
									<CrossBetting
										OddsUpData={OddsUpData}
										OddsDown={OddsDown}
										BetInfoData={currentBetInfoData}
										BetAmountData={currentBetAmountData}
										modifyNum={this.modifyNum}
										chooseFreeBet={this.chooseFreeBet}
										StartBetting={this.StartBetting}
										RemoveBetCart={this.RemoveBetCart}
										CloseBottomSheet={this.props.CloseBottomSheet}
										Balance={this.props.userInfo.balanceSB}
										Vendor={this.props.Vendor}
									/>
								)}
								{/*系统混合过关 下面的串關金額(單選一個投) 和 金額統計 */}
								{BetActiveType == 3 &&
								hasBetInfo && (
									<CrossBettingSystem
										OddsUpData={OddsUpData}
										OddsDown={OddsDown}
										BetInfoData={currentBetInfoData}
										BetAmountData={currentBetAmountData}
										modifyNum={this.modifyNum}
										chooseFreeBet={this.chooseFreeBet}
										StartBetting={this.StartBetting}
										RemoveBetCart={this.RemoveBetCart}
										CloseBottomSheet={this.props.CloseBottomSheet}
										Balance={this.props.userInfo.balanceSB}
										Vendor={this.props.Vendor}
									/>
								)}
							</div>
						</div>
					</div>
				) : (
					<div className="Beting-Box-Status">
						<div className="Header">
							{(StartBettingloading == 1 || StartBettingloading == 4) && (<>
							<div className="B_Loading">
								<ReactSVG src={'/img/svg/Loading.svg'} />
							</div>
							<h3>{StartBettingloading == 4 ? '投注在确认中, 可到未结算注单中查看状态' : '请等待几秒，您的投注在处理中'}</h3>
							</>)}

							{StartBettingloading == 2 && (<>
							<ReactIMG src="/img/success.png" className="B_Success" />
							<h3>投注成功</h3>
							</>)}

							{StartBettingloading == 3 && (<>
							<ReactSVG src={'/img/svg/betting/Error.svg'} className="B_Error" />
							<h3>投注失败:{this.state.ErrorMsg}</h3>
							</>)}

							{StartBettingloading == 6 && (<>
								<div className="alert-circle redCircle">!</div>
								<h3>网络异常{this.state.ErrorMsg}</h3>
							</>)}
						</div>
						<div className="Betlist">
							<Betstatus
								BettingList={BettingList}
								BetActiveType={BetActiveType}
							/>
							<div className="Bottom-btn">
								{(StartBettingloading != 3 && StartBettingloading != 6) && (<>
								<button
									className={(StartBettingloading == 2 || StartBettingloading == 4) ? '' : 'CantEnter confirm'}
									onClick={() => {
										this.props.betCart_setIsComboBet(false, Vendor.configs.VendorName);
										this.props.CloseBottomSheet();
										// Pushgtagdata(`Game Feature`, 'Click', 'Continue_BetCart_SB2.0');
									}}
								>
									继续我的投注
								</button>
								<button
									className={(StartBettingloading == 2 || StartBettingloading == 4) ? '' : 'CantEnter confirm whitebtn'}
									onClick={() => {
										this.props.betCart_setIsComboBet(false, Vendor.configs.VendorName);
										Router.push(
											'/sbtwo/bet-records?v=' +
												this.props.Vendor.configs.VendorName.toUpperCase() +
												'&=unsettle'
										);
										this.props.CloseBottomSheet();
									}}
								>
									查看投注单
								</button>
								</>)}
								{StartBettingloading == 6 && (
									<button
										className="confirm"
										onClick={() => {
											this.props.betCart_setIsComboBet(false, Vendor.configs.VendorName);
											Router.push(
												'/sbtwo/bet-records?v=' +
												this.props.Vendor.configs.VendorName.toUpperCase() +
												'&=unsettle'
											);
											this.props.CloseBottomSheet();
										}}
									>
										查看投注单
									</button>
								)}
								{StartBettingloading == 3 && (
								<button
									className="confirm"
									onClick={() => {
										this.props.betCart_setIsComboBet(false, Vendor.configs.VendorName);
										if (this.props.Minishow) {
											this.props.onClose();
											return;
										}
										this.props.CloseBottomSheet();
									}}
								>
									知道了
								</button>
								)}
							</div>
						</div>
					</div>
				)}
				<BottomBalanceList
						BottomBalanceRef={(ref) => { this.BottomBalanceRef = ref }}
						refreshBalance = {this.refreshBalanceAmonnt}
					/>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo,
	betCartInfo: state.betCartInfo,
});

const mapDispatchToProps = {
	userInfo_getBalanceSB: ACTION_UserInfo_getBalanceSB,
	betCart_setIsComboBet: ACTION_BetCart_setIsComboBet,
	betCart_remove: ACTION_BetCart_remove,
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(BetCart);

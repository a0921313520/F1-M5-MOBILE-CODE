import React from "react";
import Layout from '$SBTWO/Layout';
import Router from 'next/router';
import VendorIM from "$SBTWOLIB/vendor/im/VendorIM";
import {
	EventChangeType, SelectionChangeType,
	SelectionStatusType,
	SortWays,
	SpecialUpdateType, VendorErrorType, VendorMarkets,
	WagerType
} from "$SBTWOLIB/vendor/data/VendorConsts";
import {IMLocalizationType, IMOddsType, IMSelectionStatus, IMSports} from "$SBTWOLIB/vendor/im/IMConsts";
import MockLogin from "$SBTWOLIB/vendor/MockLogin";
import EventData from "$SBTWOLIB/vendor/data/EventData";
import LineData from "$SBTWOLIB/vendor/data/LineData";
import SelectionData from "$SBTWOLIB/vendor/data/SelectionData";
import OddsData from "$SBTWOLIB/vendor/data/OddsData";
import PollingResult from "$SBTWOLIB/vendor/data/PollingResult";
import moment from "moment";
import {Decimal} from 'decimal.js';
import EventInfo from "$SBTWOLIB/vendor/data/EventInfo";

export default class SportsImDemo extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			modalVisible: false,
			SportDatas:[],
			EventDatas:[],
			EventDetail: null,
			BetInfoData: null,
		};

		//輪詢key
		this.SportsPollingKey = null;
		this.EventsPollingKey = null;
		this.OneEventPollingKey = null;

		//數據調用例子 數據結構參考 lib/vendor/data/裡面的定義

		//輪詢 體育計數
		//this.SportsPolling();

		//輪詢 比賽數據
		//this.EventsPolling();

		//輪詢 單個比賽數據(在比賽詳情頁 使用) 返回輪詢key，在componentWillUnmount時記得刪掉輪詢
		//this.OneEventPolling();
	}

	componentDidMount() {
		console.log('IM DEMO DidMount')
	}

	componentWillUnmount(){
		console.log('IM DEMO WillUnmount')
		// 在componentWillUnmount時 刪掉輪詢
		VendorIM.deletePolling(this.SportsPollingKey);
		VendorIM.deletePolling(this.EventsPollingKey);
		VendorIM.deletePolling(this.OneEventPollingKey);
	}

	//輪詢 體育計數
	SportsPolling() {
		//輪詢 體育計數
		this.SportsPollingKey = VendorIM.getSportsPolling(PollingResult => {
			console.log('update Sports',PollingResult);
			this.setState({SportDatas:PollingResult.NewData});
		})
	}

	///輪詢 比賽數據
	EventsPolling() {
		const theDayAfterTwoDays = moment().add(2,'days').format('YYYY-MM-DD');

		this.EventsPollingKey =VendorIM.getEventsPolling(PollingResult => {
			console.log('update Events',PollingResult);
			this.setState({EventDatas:PollingResult.NewData});

			//處理 數據變化
			PollingResult.Changes.map(changeData => {
				//類型：更新
				if (changeData.ChangeType === EventChangeType.Update) {
					changeData.SpecialUpdates.map(sUpdateData => {
						const thisEventId = changeData.EventId; //比賽ID

						// 處理賠率上升動畫
						if (sUpdateData.UpdateType === SpecialUpdateType.OddsUp) {

							const thisLineId = sUpdateData.LineId;	//投注線ID
							const thisSelectionId = sUpdateData.SelectionId; //投注選項ID

							console.log(thisEventId,thisLineId,thisSelectionId,'賠率上升',sUpdateData.OldValue,'=>',sUpdateData.NewValue);
						}

						// 處理賠率下降動畫
						if (sUpdateData.UpdateType === SpecialUpdateType.OddsDown) {

							const thisLineId = sUpdateData.LineId;	//投注線ID
							const thisSelectionId = sUpdateData.SelectionId; //投注選項ID

							console.log(thisEventId,thisLineId,thisSelectionId,'賠率下降',sUpdateData.OldValue,'=>',sUpdateData.NewValue);
						}
					})
				}
			})
		},IMSports.SOCCER, VendorMarkets.EARLY, SortWays.EventTime, theDayAfterTwoDays,theDayAfterTwoDays); // <==查詢參數 足球 早盤 按時間排序 , 只展示 後天 的比賽
	}

	//輪詢 單個比賽數據(在比賽詳情頁 使用) 返回輪詢key，在componentWillUnmount時記得刪掉輪詢
	OneEventPolling() {
		this.OneEventPollingKey = VendorIM.getEventDetailPolling(PollingResult => {
			console.log('update Event',PollingResult);
			this.setState({EventDetail:PollingResult.NewData});

			//處理 數據變化
			PollingResult.Changes.map(changeData => {
				//類型：更新
				if (changeData.ChangeType === EventChangeType.Update) {
					changeData.SpecialUpdates.map(sUpdateData => {
						const thisEventId = changeData.EventId; //比賽ID

						// 處理賠率上升動畫
						if (sUpdateData.UpdateType === SpecialUpdateType.OddsUp) {

							const thisLineId = sUpdateData.LineId;	//投注線ID
							const thisSelectionId = sUpdateData.SelectionId; //投注選項ID

							console.log(thisEventId,thisLineId,thisSelectionId,'賠率上升',sUpdateData.OldValue,'=>',sUpdateData.NewValue);
						}

						// 處理賠率下降動畫
						if (sUpdateData.UpdateType === SpecialUpdateType.OddsDown) {

							const thisLineId = sUpdateData.LineId;	//投注線ID
							const thisSelectionId = sUpdateData.SelectionId; //投注選項ID

							console.log(thisEventId,thisLineId,thisSelectionId,'賠率下降',sUpdateData.OldValue,'=>',sUpdateData.NewValue);
						}
					})
				}
			})
		},IMSports.SOCCER, 13342281 ); // <==查詢參數  足球 比賽ID
	}

	//聯賽搜索
	Search() {
		VendorIM.search('英').then(datas => {
			console.log('search result', datas);
			if (datas.length <= 0) {
				console.log('查無數據')
			} else {
				//搜索後 用 getEventsDetail() 獲取多個比賽數據
				//這裡拿的是第一個搜索結果 下面的比賽，實際使用 要看用戶點哪個
				const eventInfos = datas[0].Events.map(ev => new EventInfo(ev.EventId,ev.SportId,false));  //聯賽搜索不包含優勝冠軍
				VendorIM.getEventsDetail(eventInfos).then(eDatas => {
					console.log('events in ' + datas[0].LeagueName, eDatas);
				});
			}
		});
	}

	//單筆投注 例子
	SingleBet_demo() {
		//單筆投注 例子
		//例子：直接拿 第一個比賽的 第一個玩法 第一個投注選項
		//實際投注頁 不需要這個查詢步驟  直接用 鼠標點擊選到的 selectionData 數據即可
		VendorIM.getEvents(IMSports.SOCCER, VendorMarkets.RUNNING, SortWays.EventTime).then(PollingResult =>{
			//獲取比賽數據，這裡用的是足球 早盤
			const eventDatas = PollingResult.NewData;

			//選幾個投注選項
			let selectionCount = 1;

			//投注選項(SelectionData)
			let selections = [];
			let cc = 0;
			//模擬投注 選第一個玩法 第一個投注選項
			while (selections.length < selectionCount) {
				//有可能比賽下面沒有投注選項，要額外判斷
				if (eventDatas[cc]
					&& eventDatas[cc].Lines && eventDatas[cc].Lines.length > 0
					&& eventDatas[cc].Lines[0].Selections && eventDatas[cc].Lines[0].Selections.length > 0) {
					selections.push(eventDatas[cc].Lines[0].Selections[0]);
				}
				cc = cc + 1;
			}
			console.log('event Selections', selections[0]);

			//指定投注
			// let targetev = eventDatas.filter(ev => ev.EventId == 19121378)
			// selections = [targetev[0].getChildSelection(1553938479,375973998)];
			//
			// console.log('event Selections', selections[0]);

			//輪詢 投注檢查 數據更新回調
			const onUpdateHandler = (pollingResultOfBetInfo) => {
				console.log('getBetInfo onUpdate', pollingResultOfBetInfo);
				//這裏返回數據 是PollingResult 格式 包含偵測賠率變化的changes

				const betInfo = pollingResultOfBetInfo.NewData;  //這裏數據 是BetInfoData 格式，單注的 Selections 和 BetSettings 字段 都只有一個實例，不是數組
				const changes = pollingResultOfBetInfo.Changes;

				//更新數據
				this.setState({BetInfoData: betInfo});

				//這個數據可以拿來展示最高最低投注限額，還有預測獎金
				const betSetting = betInfo.BetSettings; //單注這裡是一個實例，不是數組

				//這個數據直接拿來展示下注信息
				const selectionData = betInfo.Selections; //單注這裡是一個實例，不是數組

				//可能會拿到空值 此時不可投注
				if(!betSetting) {
					console.log('盤口關閉');
				}

				//檢查狀態，OK(100)才是可以投注
				if (betInfo.Selections.SelectionStatus !== SelectionStatusType.OK) {
					//處理不能投注的原因，展示在畫面上
					const errorDesc = betInfo.Selections.SelectionStatusName;
					console.log('不能投:', errorDesc);
				}

				//處理變更，和 查詢比賽 的輪詢處理方式一樣
				changes.map(changeData => {
					//類型：更新
					if (changeData.ChangeType === SelectionChangeType.Update) {
						changeData.SpecialUpdates.map(sUpdateData => {
							const thisSelectionId = changeData.SelectionId; //投注選項ID

							// 處理賠率上升動畫
							if (sUpdateData.UpdateType === SpecialUpdateType.OddsUp) {
								console.log(thisSelectionId, '賠率上升', sUpdateData.OldValue, '=>', sUpdateData.NewValue);
							}

							// 處理賠率下降動畫
							if (sUpdateData.UpdateType === SpecialUpdateType.OddsDown) {
								console.log(thisSelectionId, '賠率下降', sUpdateData.OldValue, '=>', sUpdateData.NewValue);
							}
						})
					}
				})
			}

			//輪詢 (檢查)投注選項並獲取投注上下限 等信息
			const pollingKey = VendorIM.getBetInfoPolling(onUpdateHandler, WagerType.SINGLE, selections[0]); //WagerType.SINGLE表示單注

			//下注
			const userClickBet = ()=> {
				if (this.state.BetInfoData) {

					if (!this.state.BetInfoData.BetSettings) {
						console.log('無法投注1，請晚點重試')
						VendorIM.deletePolling(pollingKey);  //這裡因為是整個投注檢查+投注一起跑的，才刪除輪詢，實際應用是分開觸發的，不需要刪除
						return;
					}

					if (this.state.BetInfoData.Selections.SelectionStatus !== SelectionStatusType.OK) {
						const errorDesc = this.state.BetInfoData.Selections.SelectionStatusName;
						console.log('無法投注2，請晚點重試',errorDesc)
						VendorIM.deletePolling(pollingKey); //這裡因為是整個投注檢查+投注一起跑的，才刪除輪詢，實際應用是分開觸發的，不需要刪除
						return;
					}

					//投最低限額
					const betAmount = new Decimal(this.state.BetInfoData.BetSettings.MinAmount).ceil().toNumber();

					//執行下注，返回是BetResultData格式
					VendorIM.placeBet(WagerType.SINGLE, this.state.BetInfoData, betAmount)
						.then(betResult => {
							console.log('placeBet result', betResult)

							//只要可以收到result 就是下注成功了，失敗去catch區塊處理

							//下注成功才 關閉輪詢
							VendorIM.deletePolling(pollingKey);

							//TODO: 上傳投注結果給piwiki

							//投注狀態為=待定
							if (betResult.IsPending) {

								//TODO: 展示投注 尚未完成 相關 UI

								//額外在背景查詢投注結果
							  VendorIM.queryPendingBetStatus(betResult.PendingQueryId)
									.then(queryBetStatusData => {
										console.log('queryBetStatus data', queryBetStatusData)
										//確認投注成功
										if (queryBetStatusData.IsSuccess) {
											//TODO: 上傳投注成功 相關信息給 fun後端
											let wagerId = queryBetStatusData.WagerId;  //<==投注成功的 注單id
										}
									})

							} else { //投注成功

								//TODO: 展示投注成功相關UI

								//TODO: 上傳投注成功 相關信息給 fun後端
							}

						})
						.catch(error => {

							//實際下注失敗 不需要關閉輪詢，這裡直接關閉，是因為demo頁面沒有UI去手動解除
							VendorIM.deletePolling(pollingKey);

							//這裡處理下注可能返回的錯誤
							if (typeof error  === 'object' && error.isVendorError === true) {
								//定義好的VendorError錯誤類
								//處理這些錯誤
								switch(error.ErrorType) {
									case VendorErrorType.BET_Place_OddChanged: //赔率已变更  <--這個按mockup，有特殊流程要處理

									//下面這些應該直接展示錯誤信息
									case VendorErrorType.VENDOR_Error: //Vendor系統錯誤
									case VendorErrorType.VENDOR_Maintenance: //Vendor維護
									case VendorErrorType.BET_Place_Error: //下注失敗
									case VendorErrorType.BET_Place_Updating: //赔率更新中
									case VendorErrorType.BET_Place_Balance: //余额不足
									case VendorErrorType.BET_Place_LimitMax: //投注金额超于限额
									case VendorErrorType.BET_Place_LimitMin: //投注金额低于最小投注额
									case VendorErrorType.BET_Place_LimitTotal: //这赛事总投注金额超于限额
									case VendorErrorType.BET_Place_NOPARLAY: //所选赛事不支持连串过关，请选其他赛事
									case VendorErrorType.BET_Place_MONEY: // 無效投注金額
								}

								//這可以拿到中文錯誤信息，可以直接拿來展示
								const msg = error.ErrorMsg;
							}
						})
				} else {
					setTimeout(() => {userClickBet();},10*1000);  //用setTimout 10秒 等輪詢拿到數據，實際投注介面不需要這個，從UI面去限制用戶點擊動作
				}
			}

			userClickBet()
		});
	}

	//單筆投注 優勝冠軍 例子(和上面的單筆投注一毛一樣，拿來實測投注而已)
	SingleBet_outright_demo() {
		//單筆投注 例子
		//例子：直接拿 第一個比賽的 第一個玩法 第一個投注選項
		//實際投注頁 不需要這個查詢步驟  直接用 鼠標點擊選到的 selectionData 數據即可
		VendorIM.getEvents(IMSports.SOCCER, VendorMarkets.OUTRIGHT, SortWays.LeagueName).then(PollingResult =>{
			//獲取比賽數據，這裡用的是足球 優勝冠軍
			const eventDatas = PollingResult.NewData;

			//選幾個投注選項
			let selectionCount = 1;

			//投注選項(SelectionData)
			let selections = [];
			let cc = 0;
			//模擬投注 選第一個玩法 第一個投注選項
			while (selections.length < selectionCount) {
				//有可能比賽下面沒有投注選項，要額外判斷
				if (eventDatas[cc]
					&& eventDatas[cc].Lines && eventDatas[cc].Lines.length > 0
					&& eventDatas[cc].Lines[0].Selections && eventDatas[cc].Lines[0].Selections.length > 0) {
					selections.push(eventDatas[cc].Lines[0].Selections[0]);
				}
				cc = cc + 1;
			}
			console.log('event Selections', selections[0]);

			//輪詢 投注檢查 數據更新回調
			const onUpdateHandler = (pollingResultOfBetInfo) => {
				console.log('getBetInfo onUpdate', pollingResultOfBetInfo);
				//這裏返回數據 是PollingResult 格式 包含偵測賠率變化的changes

				const betInfo = pollingResultOfBetInfo.NewData;  //這裏數據 是BetInfoData 格式，單注的 Selections 和 BetSettings 字段 都只有一個實例，不是數組
				const changes = pollingResultOfBetInfo.Changes;

				//更新數據
				this.setState({BetInfoData: betInfo});

				//這個數據可以拿來展示最高最低投注限額，還有預測獎金
				const betSetting = betInfo.BetSettings; //單注這裡是一個實例，不是數組

				//這個數據直接拿來展示下注信息
				const selectionData = betInfo.Selections; //單注這裡是一個實例，不是數組

				//檢查狀態，OK(100)才是可以投注
				if (betInfo.Selections.SelectionStatus !== SelectionStatusType.OK) {
					//處理不能投注的原因，展示在畫面上
					const errorDesc = betInfo.Selections.SelectionStatusName;
				}

				//處理變更，和 查詢比賽 的輪詢處理方式一樣
				changes.map(changeData => {
					//類型：更新
					if (changeData.ChangeType === SelectionChangeType.Update) {
						changeData.SpecialUpdates.map(sUpdateData => {
							const thisSelectionId = changeData.SelectionId; //投注選項ID

							// 處理賠率上升動畫
							if (sUpdateData.UpdateType === SpecialUpdateType.OddsUp) {
								console.log(thisSelectionId, '賠率上升', sUpdateData.OldValue, '=>', sUpdateData.NewValue);
							}

							// 處理賠率下降動畫
							if (sUpdateData.UpdateType === SpecialUpdateType.OddsDown) {
								console.log(thisSelectionId, '賠率下降', sUpdateData.OldValue, '=>', sUpdateData.NewValue);
							}
						})
					}
				})
			}

			//輪詢 (檢查)投注選項並獲取投注上下限 等信息
			const pollingKey = VendorIM.getBetInfoPolling(onUpdateHandler, WagerType.SINGLE, selections[0]); //WagerType.SINGLE表示單注

			//下注
			const userClickBet = (betAmount)=> {
				if (this.state.BetInfoData) {

					//執行下注，返回是BetResultData格式
					VendorIM.placeBet(WagerType.SINGLE, this.state.BetInfoData, betAmount)
						.then(betResult => {
							console.log('placeBet result', betResult)

							//只要可以收到result 就是下注成功了，失敗去catch區塊處理

							//下注成功才 關閉輪詢
							VendorIM.deletePolling(pollingKey);
						})
						.catch(error => {

							//實際下注失敗 不需要關閉輪詢，這裡直接關閉，是因為demo頁面沒有UI去手動解除
							VendorIM.deletePolling(pollingKey);

							//這裡處理下注可能返回的錯誤
							if (typeof error  === 'object' && error.isVendorError === true) {
								//定義好的VendorError錯誤類
								//處理這些錯誤
								switch(error.ErrorType) {
									case VendorErrorType.BET_Place_OddChanged: //赔率已变更  <--這個按mockup，有特殊流程要處理

									//下面這些應該直接展示錯誤信息
									case VendorErrorType.VENDOR_Error: //Vendor系統錯誤
									case VendorErrorType.VENDOR_Maintenance: //Vendor維護
									case VendorErrorType.BET_Place_Error: //下注失敗
									case VendorErrorType.BET_Place_Updating: //赔率更新中
									case VendorErrorType.BET_Place_Balance: //余额不足
									case VendorErrorType.BET_Place_LimitMax: //投注金额超于限额
									case VendorErrorType.BET_Place_LimitMin: //投注金额低于最小投注额
									case VendorErrorType.BET_Place_LimitTotal: //这赛事总投注金额超于限额
									case VendorErrorType.BET_Place_NOPARLAY: //所选赛事不支持连串过关，请选其他赛事
									case VendorErrorType.BET_Place_MONEY: // 無效投注金額
								}

								//這可以拿到中文錯誤信息，可以直接拿來展示
								const msg = error.ErrorMsg;
							}
						})
				} else {
					setTimeout(() => {userClickBet(betAmount);},10*1000);  //用setTimout 10秒 等輪詢拿到數據，實際投注介面不需要這個，從UI面去限制用戶點擊動作
				}
			}

			//下注
			const betAmount = 6; //注意用的正式環境＋真錢，下小一點，不要測太多次
			userClickBet(betAmount)
		});
	}

	//串關投注 例子
	ComoboBet_demo() {
		// 注意串關 一個比賽 只能選一個 投注選項，UI側 需要自行判斷阻擋(不給點)
		// 例子： 直接拿 前幾個比賽的 第一個玩法 第一個投注選項
		// 實際投注頁 不需要這個查詢步驟  直接用 鼠標點擊選到的 selectionData 數據即可
		VendorIM.getEvents(IMSports.SOCCER, VendorMarkets.EARLY, SortWays.EventTime).then(PollingResult =>{
			//獲取比賽數據，這裡用的是足球 早盤
			const eventDatas = PollingResult.NewData;

			//選幾個投注選項
			let selectionCount = 3;

			//投注選項(SelectionData)
			let selections = [];
			let cc = 0;
			//模擬投注 選第一個玩法 第一個投注選項
			while (selections.length < selectionCount) {
				//有可能比賽下面沒有投注選項，要額外判斷
				if (eventDatas[cc]
					&& eventDatas[cc].Lines && eventDatas[cc].Lines.length > 0
					&& eventDatas[cc].Lines[0].Selections && eventDatas[cc].Lines[0].Selections.length > 0) {
					selections.push(eventDatas[cc].Lines[0].Selections[0]);
				}
				cc = cc + 1;
			}
			console.log('event Selections',selections);

			//輪詢 投注檢查 數據更新回調
			const onUpdateHandler = (pollingResultOfBetInfo) => {
				console.log('getBetInfo onUpdate', pollingResultOfBetInfo);
				//這裏返回數據 是PollingResult 格式 包含偵測賠率變化的changes

				const betInfo = pollingResultOfBetInfo.NewData;  //這裏數據 是BetInfoData 格式，串關的 Selections 和 BetSettings 字段 都是數組
				const changes = pollingResultOfBetInfo.Changes;

				//更新數據
				this.setState({BetInfoData: betInfo});

				//這個數據可以拿來展示最高最低投注限額，還有預測獎金
				const betSettings = betInfo.BetSettings; //串關這裡是一個數組,表示多種可能的串關玩法

				//這個數據直接拿來展示下注信息
				const selections = betInfo.Selections; //串關這裡是一個數組

				//檢查狀態，OK(100)才是可以投注(串關有多個selection，分開檢查，各自處理)
				betInfo.Selections.map(item => {
					if (item.SelectionStatus !== SelectionStatusType.OK) {
						//處理不能投注的原因，展示在畫面上
						const errorDesc = betInfo.Selections.SelectionStatusName;
					}
				});

				//處理變更，和 查詢比賽 的輪詢處理方式一樣
				changes.map(changeData => {
					//類型：更新
					if (changeData.ChangeType === SelectionChangeType.Update) {
						changeData.SpecialUpdates.map(sUpdateData => {
							const thisSelectionId = changeData.SelectionId; //投注選項ID

							// 處理賠率上升動畫
							if (sUpdateData.UpdateType === SpecialUpdateType.OddsUp) {
								console.log(thisSelectionId, '賠率上升', sUpdateData.OldValue, '=>', sUpdateData.NewValue);
							}

							// 處理賠率下降動畫
							if (sUpdateData.UpdateType === SpecialUpdateType.OddsDown) {
								console.log(thisSelectionId, '賠率下降', sUpdateData.OldValue, '=>', sUpdateData.NewValue);
							}
						})
					}
				})
			}

			//輪詢 (檢查)投注選項並獲取投注上下限 等信息
			const pollingKey = VendorIM.getBetInfoPolling(onUpdateHandler, WagerType.COMBO, selections);  //WagerType.COMBO表示串關

			//下注
			const userClickBet = (betAmount)=> {
				if (this.state.BetInfoData) {

					//從betSetting選一種串關方法 <--因為加載順序問題，才放在這裡 實際投注 讓用戶自己選
					const comboType = this.state.BetInfoData.BetSettings[0].ComboType;

					//執行下注，返回是BetResultData格式
					VendorIM.placeBet(WagerType.COMBO, this.state.BetInfoData, betAmount, comboType)
						.then(betResult => {
							console.log('placeBet result', betResult)

							//只要可以收到result 就是下注成功了，失敗去catch區塊處理

							//下注成功才 關閉輪詢
							VendorIM.deletePolling(pollingKey);
						})
						.catch(error => {

							//實際下注失敗 不需要關閉輪詢，這裡直接關閉，是因為demo頁面沒有UI去手動解除
							VendorIM.deletePolling(pollingKey);

							//這裡處理下注可能返回的錯誤
							if (typeof error  === 'object' && error.isVendorError === true) {
								//定義好的VendorError錯誤類
								//處理這些錯誤
								switch(error.ErrorType) {
									case VendorErrorType.BET_Place_OddChanged: //赔率已变更  <--這個按mockup，有特殊流程要處理

									//下面這些應該直接展示錯誤信息
									case VendorErrorType.VENDOR_Error: //Vendor系統錯誤
									case VendorErrorType.VENDOR_Maintenance: //Vendor維護
									case VendorErrorType.BET_Place_Error: //下注失敗
									case VendorErrorType.BET_Place_Updating: //赔率更新中
									case VendorErrorType.BET_Place_Balance: //余额不足
									case VendorErrorType.BET_Place_LimitMax: //投注金额超于限额
									case VendorErrorType.BET_Place_LimitMin: //投注金额低于最小投注额
									case VendorErrorType.BET_Place_LimitTotal: //这赛事总投注金额超于限额
									case VendorErrorType.BET_Place_NOPARLAY: //所选赛事不支持连串过关，请选其他赛事
									case VendorErrorType.BET_Place_MONEY: // 無效投注金額
								}

								//這可以拿到中文錯誤信息，可以直接拿來展示
								const msg = error.ErrorMsg;
							}
						})
				} else {
					setTimeout(() => {userClickBet(betAmount);},10*1000);  //用setTimout 10秒 等輪詢拿到數據，實際投注介面不需要這個，從UI面去限制用戶點擊動作
				}
			}

			//下注
			const betAmount = 6; //注意用的正式環境＋真錢，下小一點，不要測太多次
			userClickBet(betAmount);
		});
	}

	//系統混合過關 串關投注 例子
	ComoboSystemBet_demo() {
		// 注意串關 一個比賽 只能選一個 投注選項，UI側 需要自行判斷阻擋(不給點)
		// 例子： 直接拿 前幾個比賽的 第一個玩法 第一個投注選項
		// 實際投注頁 不需要這個查詢步驟  直接用 鼠標點擊選到的 selectionData 數據即可
		VendorIM.getEvents(IMSports.SOCCER, VendorMarkets.EARLY, SortWays.EventTime).then(PollingResult =>{
			//獲取比賽數據，這裡用的是足球 早盤
			const eventDatas = PollingResult.NewData;

			//選幾個投注選項
			let selectionCount = 3;

			//投注選項(SelectionData)
			let selections = [];
			let cc = 0;
			//模擬投注 選第一個玩法 第一個投注選項
			while (selections.length < selectionCount) {
				//有可能比賽下面沒有投注選項，要額外判斷
				if (eventDatas[cc]
					&& eventDatas[cc].Lines && eventDatas[cc].Lines.length > 0
					&& eventDatas[cc].Lines[0].Selections && eventDatas[cc].Lines[0].Selections.length > 0) {
					selections.push(eventDatas[cc].Lines[0].Selections[0]);
				}
				cc = cc + 1;
			}
			console.log('event Selections',selections);

			//輪詢 投注檢查 數據更新回調
			const onUpdateHandler = (pollingResultOfBetInfo) => {
				console.log('getBetInfo onUpdate', pollingResultOfBetInfo);
				//這裏返回數據 是PollingResult 格式 包含偵測賠率變化的changes

				const betInfo = pollingResultOfBetInfo.NewData;  //這裏數據 是BetInfoData 格式，串關的 Selections 和 BetSettings 字段 都是數組
				const changes = pollingResultOfBetInfo.Changes;

				//更新數據
				this.setState({BetInfoData: betInfo});

				//這個數據可以拿來展示最高最低投注限額，還有預測獎金
				const betSettings = betInfo.BetSettings; //串關這裡是一個數組,表示多種可能的串關玩法

				//這個數據直接拿來展示下注信息
				const selections = betInfo.Selections; //串關這裡是一個數組

				//檢查狀態，OK(100)才是可以投注(串關有多個selection，分開檢查，各自處理)
				betInfo.Selections.map(item => {
					if (item.SelectionStatus !== SelectionStatusType.OK) {
						//處理不能投注的原因，展示在畫面上
						const errorDesc = betInfo.Selections.SelectionStatusName;
					}
				});

				//處理變更，和 查詢比賽 的輪詢處理方式一樣
				changes.map(changeData => {
					//類型：更新
					if (changeData.ChangeType === SelectionChangeType.Update) {
						changeData.SpecialUpdates.map(sUpdateData => {
							const thisSelectionId = changeData.SelectionId; //投注選項ID

							// 處理賠率上升動畫
							if (sUpdateData.UpdateType === SpecialUpdateType.OddsUp) {
								console.log(thisSelectionId, '賠率上升', sUpdateData.OldValue, '=>', sUpdateData.NewValue);
							}

							// 處理賠率下降動畫
							if (sUpdateData.UpdateType === SpecialUpdateType.OddsDown) {
								console.log(thisSelectionId, '賠率下降', sUpdateData.OldValue, '=>', sUpdateData.NewValue);
							}
						})
					}
				})
			}

			//輪詢 (檢查)投注選項並獲取投注上下限 等信息
			const pollingKey = VendorIM.getBetInfoPolling(onUpdateHandler, WagerType.COMBO, selections);  //WagerType.COMBO表示串關

			//下注
			const userClickBet = (betAmount)=> {
				if (this.state.BetInfoData) {

					//從betSetting選一種串關方法 <--因為加載順序問題，才放在這裡 實際投注 讓用戶自己選
					const comboType = this.state.BetInfoData.SystemParlayBetSettings[1].ComboType;

					//執行下注，返回是BetResultData格式
					VendorIM.placeBet(WagerType.COMBO, this.state.BetInfoData, betAmount, comboType)
						.then(betResult => {
							console.log('placeBet result', betResult)

							//只要可以收到result 就是下注成功了，失敗去catch區塊處理

							//下注成功才 關閉輪詢
							VendorIM.deletePolling(pollingKey);
						})
						.catch(error => {

							//實際下注失敗 不需要關閉輪詢，這裡直接關閉，是因為demo頁面沒有UI去手動解除
							VendorIM.deletePolling(pollingKey);

							//這裡處理下注可能返回的錯誤
							if (typeof error  === 'object' && error.isVendorError === true) {
								//定義好的VendorError錯誤類
								//處理這些錯誤
								switch(error.ErrorType) {
									case VendorErrorType.BET_Place_OddChanged: //赔率已变更  <--這個按mockup，有特殊流程要處理

									//下面這些應該直接展示錯誤信息
									case VendorErrorType.VENDOR_Error: //Vendor系統錯誤
									case VendorErrorType.VENDOR_Maintenance: //Vendor維護
									case VendorErrorType.BET_Place_Error: //下注失敗
									case VendorErrorType.BET_Place_Updating: //赔率更新中
									case VendorErrorType.BET_Place_Balance: //余额不足
									case VendorErrorType.BET_Place_LimitMax: //投注金额超于限额
									case VendorErrorType.BET_Place_LimitMin: //投注金额低于最小投注额
									case VendorErrorType.BET_Place_LimitTotal: //这赛事总投注金额超于限额
									case VendorErrorType.BET_Place_NOPARLAY: //所选赛事不支持连串过关，请选其他赛事
									case VendorErrorType.BET_Place_MONEY: // 無效投注金額
								}

								//這可以拿到中文錯誤信息，可以直接拿來展示
								const msg = error.ErrorMsg;
							}
						})
				} else {
					setTimeout(() => {userClickBet(betAmount);},10*1000);  //用setTimout 10秒 等輪詢拿到數據，實際投注介面不需要這個，從UI面去限制用戶點擊動作
				}
			}

			//下注
			const betAmount = 6; //注意用的正式環境＋真錢，下小一點，不要測太多次
			userClickBet(betAmount);
		});
	}

	//notification例子
	notification_demo() {

		//動態獲取比賽數據，這樣 不管怎麼變動，都不用重新配置輪詢
		const getEventInfosFunc = async () => {
			// 1. 先取用戶配置
			const memberSetting = VendorIM.getMemberSetting();

			let eventInfos = [];
			if (memberSetting.goalNotification) {
				//進球通知只需要 足球，其他都不用
				const targetSportId = 1;

				//如果勾選 全部滾球 直接查詢全部滾球數據，因為全部滾球一定會包含 收藏 和 投注 賽事
				if (memberSetting.goalAllRB) {
					const runningPR = await VendorIM.getEvents(targetSportId,VendorMarkets.RUNNING);
					const runningEvents = runningPR.NewData;
					eventInfos = eventInfos.concat(runningEvents.map(ev => new EventInfo(ev.EventId, ev.SportId, ev.IsOutRightEvent === true)));
				} else {
					// 2. 收藏賽事有開，取收藏賽事
					if (memberSetting.goalMyFavorite) {
						const favEvents = VendorIM.getFavouriteEvents();
						const favEventInfos = favEvents.map(ev => {
							return new EventInfo(ev.EventId, ev.SportId, ev.IsOutRightEvent === true);
						})
						eventInfos = eventInfos.concat(favEventInfos);
					}
					//3. 投注賽事有開，取投注賽事(注單未結算)
					if (memberSetting.goalIBet) {
						console.log('before await');
						const unsettleWagers = await VendorIM.getUnsettleWagers();
						console.log('after await');
						let unsettleWagerEventInfos = []
						unsettleWagers.map(uw => {
							uw.WagerItems.map(wi => {
								unsettleWagerEventInfos.push(new EventInfo(wi.EventId, wi.SportId, wi.IsOutRightEvent))
							})
						})
						eventInfos = eventInfos.concat(unsettleWagerEventInfos);
					}
					//4.去重複
					eventInfos = eventInfos.filter((ei, index, self) => self.findIndex(t => t.EventId === ei.EventId) === index);
					//5.去除優勝冠軍
					eventInfos = eventInfos.filter(ei => !ei.IsOutRightEvent);
					//6.只保留足球
					eventInfos = eventInfos.filter(ei => parseInt(ei.SportId) === targetSportId);
				}
			}

			console.log('eventInfos',JSON.parse(JSON.stringify(eventInfos)));

			return eventInfos;
		}

		//輪詢 多個比賽數據(在notification 使用) 返回輪詢key，在componentWillUnmount時記得刪掉輪詢
		this.eventPollingKey = VendorIM.getEventsDetailPolling(PollingResult => {
			console.log('update Event',PollingResult);
			this.setState({EventDetail:PollingResult.NewData});

			//處理 數據變化
			PollingResult.Changes.map(changeData => {
				//類型：更新
				if (changeData.ChangeType === EventChangeType.Update) {
					changeData.SpecialUpdates.map(sUpdateData => {
						const thisEventId = changeData.EventId; //比賽ID

						//進球通知
						// HomeGoal: 2,  //主場進球
						// AwayGoal: 3,  //客場進球

						// 主場進球
						if (sUpdateData.UpdateType === SpecialUpdateType.HomeGoal) {
							//處理通知
							console.log(thisEventId,'主場進球',sUpdateData.OldValue,'=>',sUpdateData.NewValue);
						}

						// 客場進球
						if (sUpdateData.UpdateType === SpecialUpdateType.AwayGoal) {
							//處理通知
							console.log(thisEventId,'客場進球',sUpdateData.OldValue,'=>',sUpdateData.NewValue);
						}
					})
				}
			})
		},getEventInfosFunc ); // <==查詢參數 獲取 比賽查詢依據(EventInfo) 的函數
	}

	//查詢未結算注單
	getUnsettleWagers() {
		VendorIM.getUnsettleWagers()
			.then(data => console.log('getUnsettleWagers',data));
	}

	//查詢已結算注單
	getSettledWagers() {
		VendorIM.getSettledWagers('2020-09-01','2020-12-30')
			.then(data => console.log('getSettledWagers',data));
	}

	//獲取公告
	getAnnouncements() {
		VendorIM.getAnnouncements()
					.then(datas => console.log('AnnouncementDatas',datas));
	}

	//收藏比賽 例子
	Favourite_demo(){
		//添加收藏
		console.log('beofore add event', VendorIM.getFavouriteEvents());  //獲取收藏數據
		VendorIM.addFavouriteEvent(13770797, IMSports.SOCCER,false);
		console.log('add event', VendorIM.getFavouriteEvents());
		VendorIM.addFavouriteEvent(14025099, IMSports.SOCCER,false);
		console.log('add event', VendorIM.getFavouriteEvents());
		//刪除收藏
		VendorIM.removeFavouriteEvent(13203772);
		console.log('remove event', VendorIM.getFavouriteEvents());
	}

	//獲取Banner數據
	async getBannerData() {
		VendorIM.getBannerData(IMSports.SOCCER).then(eventDatas => {
			console.log('banner events ', eventDatas);
		})
	}

	//獲取同聯賽下的滾球賽事
	async getLiveEventsInSameLeague() {
		//參數 體育id(SportId) , 聯賽id(LeagueId) , 賽事id(EventId)
		VendorIM.getLiveEventsInSameLeague(IMSports.SOCCER,551,14430248).then(eventDatas => {
			console.log('same league events ', eventDatas);
		})
	}

	//獲取熱門比賽
	async getHotEvents() {
		VendorIM.getHotEvents().then(eventDatas => {
			console.log('hot events ', eventDatas);
		})
	}


	//獲取 體育  和 市場 清單＋計數
	getSports() {
		VendorIM.getSports()
			.then(PollingResult => {
				console.log(PollingResult);
				this.setState({SportDatas:PollingResult.NewData});
			});
	}

	//獲取 足球 早盤 按聯賽排序
	getEvents1() {
		VendorIM.getEvents(IMSports.SOCCER, VendorMarkets.EARLY, SortWays.LeagueName)
			.then(PollingResult => {
				console.log(PollingResult);
				this.setState({EventDatas:PollingResult.NewData});
			});
	}

	//獲取足球 早盤 只取後天的比賽 按時間排序
	getEvents2() {
		const theDayAfterTwoDays = moment().add(2,'days').format('YYYY-MM-DD');
		VendorIM.getEvents(IMSports.SOCCER, VendorMarkets.EARLY, SortWays.EventTime,theDayAfterTwoDays,theDayAfterTwoDays)
			.then(PollingResult => {
				console.log(PollingResult);
				this.setState({EventDatas:PollingResult.NewData});
			});
	}

	//獲取 足球 滾球 按時間排序
	getEvents3() {
		VendorIM.getEvents(IMSports.SOCCER,VendorMarkets.RUNNING, SortWays.EventTime)
			.then(PollingResult => {
				console.log(PollingResult);
				this.setState({EventDatas:PollingResult.NewData});
			});
	}

	//獲取 足球 滾球 按聯賽排序
	getEvents4() {
		VendorIM.getEvents(IMSports.SOCCER,VendorMarkets.OUTRIGHT, SortWays.LeagueName)
			.then(PollingResult => {
				console.log(PollingResult);
				this.setState({EventDatas:PollingResult.NewData});
			});
	}

	//獲取單個比賽數據
	getEventDetail() {
		VendorIM.getEventDetail(IMSports.SOCCER, 12357942)
			.then(PollingResult => {
				console.log(PollingResult);
				this.setState({EventDetail:PollingResult.NewData});
			});
	}

	//獲取多個比賽數據
	getEventsDetail() {
		let events = [
			new EventInfo(13386622,2,false),
			new EventInfo(13386625,2,false),
			new EventInfo(13679351,1,true),
			new EventInfo(13198652,1,true),
			new EventInfo(14355302,1,false),
			new EventInfo(14374080,1,false),
		]
		VendorIM.getEventsDetail(events)
			.then(PollingResult => {
				console.log('getEventsDetail',PollingResult);
				this.setState({EventDatas:PollingResult.NewData});
			});
	}

	//查看數據用
	async testData() {
		const earlys = await VendorIM.getEvents(IMSports.SOCCER, VendorMarkets.EARLY, SortWays.EventTime);
		const todays = await VendorIM.getEvents(IMSports.SOCCER, VendorMarkets.TODAY, SortWays.EventTime);
		const lives = await VendorIM.getEvents(IMSports.SOCCER, VendorMarkets.RUNNING, SortWays.EventTime);

		const allevents = earlys.NewData.concat(todays.NewData,lives.NewData);

		let eventcats = {HasStatistic:[],HasVisualization:[],HasLiveStreaming:[]}

		allevents.map(event => {
			if (event.HasStatistic) {
				eventcats.HasStatistic.push(event);
			}
			if (event.HasVisualization) {
				eventcats.HasVisualization.push(event);
			}
			if (event.HasLiveStreaming) {
				eventcats.HasLiveStreaming.push(event);
			}
		})

		eventcats.HasStatistic.map(event => {
			console.log('HasStatistic',event.EventId, event.LeagueName, event.HomeTeamName, event.AwayTeamName, event.HasStatistic, event.HasVisualization, event.HasLiveStreaming);
		})
		eventcats.HasVisualization.map(event => {
			console.log('HasVisualization',event.EventId, event.LeagueName, event.HomeTeamName, event.AwayTeamName, event.HasStatistic, event.HasVisualization, event.HasLiveStreaming);
		})
		eventcats.HasLiveStreaming.map(event => {
			console.log('HasLiveStreaming',event.EventId, event.LeagueName, event.HomeTeamName, event.AwayTeamName, event.HasStatistic, event.HasVisualization, event.HasLiveStreaming);
		})

		VendorIM.getEventDetail(IMSports.SOCCER, 13890324)
			.then(PollingResult => {
				console.log(PollingResult);
				this.setState({EventDetail:PollingResult.NewData});
			});

		VendorIM.getEventDetail(IMSports.SOCCER, 13910839)
			.then(PollingResult => {
				console.log(PollingResult);
				this.setState({EventDetail:PollingResult.NewData});
			});
	}

	//單筆-投注檢查-數據錯誤
	async tesSingleSelectionDataError() {
		const earlys = await VendorIM.getEvents(IMSports.SOCCER, VendorMarkets.EARLY, SortWays.EventTime);
		const eventDatas = earlys.NewData;

		//選幾個投注選項
		let selectionCount = 1;

		//投注選項(SelectionData)
		let selections = [];
		let cc = 0;
		//模擬投注 選第一個玩法 第一個投注選項
		while(selections.length < selectionCount) {
			//有可能比賽下面沒有投注選項，要額外判斷
			if (eventDatas[cc]
				&& eventDatas[cc].Lines && eventDatas[cc].Lines.length > 0
				&& eventDatas[cc].Lines[0].Selections && eventDatas[cc].Lines[0].Selections.length > 0)
			{
				selections.push(eventDatas[cc].Lines[0].Selections[0]);
			}
			cc = cc+1;
		}
		console.log('event Selections',selections);

		//修改成不存在的EventID
		selections.map((item,index) => {
			item.EventId = 123 + index;
		})

		//仍然會正常返回，但是BetSetting為空，而且不能用的Selection會標記出來(SelectionStatusName)
		const betInfoPolling = await VendorIM.getBetInfo(WagerType.SINGLE,selections[0]);

		console.log('betInfoPolling',betInfoPolling);
	}

	//串關-投注檢查-數據錯誤
	async testComboSelectionDataError() {
		const earlys = await VendorIM.getEvents(IMSports.SOCCER, VendorMarkets.EARLY, SortWays.EventTime);
		const eventDatas = earlys.NewData;

		//選幾個投注選項  兩種case
		//let selectionCount = 3;  //能用的selection只有１個=>不用調接口了，直接模擬一樣的數據結構返回(betsetting帶null)
		let selectionCount = 4;  //能用的selection有２個以上=>調接口，最後合併結果

		//投注選項(SelectionData)
		let selections = [];
		let cc = 0;
		//模擬投注 選第一個玩法 第一個投注選項
		while(selections.length < selectionCount) {
			//有可能比賽下面沒有投注選項，要額外判斷
			if (eventDatas[cc]
				&& eventDatas[cc].Lines && eventDatas[cc].Lines.length > 0
				&& eventDatas[cc].Lines[0].Selections && eventDatas[cc].Lines[0].Selections.length > 0)
			{
				selections.push(eventDatas[cc].Lines[0].Selections[0]);
			}
			cc = cc+1;
		}
		console.log('event Selections',selections);

		//前兩個修改成不存在的EventID
		selections.map((item,index) => {
			if (index <2) {
				item.EventId = 123 + index;
			}
		})

		//仍然會正常返回，但是BetSetting為空，而且不能用的Selection會標記出來(SelectionStatusName)
		const betInfoPolling = await VendorIM.getBetInfo(WagerType.COMBO,selections);

		console.log('betInfoPolling',betInfoPolling);
	}

	//串關-IsOpenParlay=false
	async testIsOpenParlay() {
		const earlys = await VendorIM.getEvents(IMSports.SOCCER, VendorMarkets.EARLY, SortWays.EventTime);
		const notParlays = earlys.NewData.filter(item => !item.IsOpenParlay);
		console.log('notParlays', notParlays);
		const canParlays = earlys.NewData.filter(item => item.IsOpenParlay);

		let eventDatas = notParlays;

		//選幾個投注選項
		let selectionCount = 2;

		//投注選項(SelectionData)
		let selections = [];
		let cc = 0;
		//模擬投注 選第一個玩法 第一個投注選項
		while (selections.length < selectionCount) {
			//有可能比賽下面沒有投注選項，要額外判斷
			if (eventDatas[cc]
				&& eventDatas[cc].Lines && eventDatas[cc].Lines.length > 0
				&& eventDatas[cc].Lines[0].Selections && eventDatas[cc].Lines[0].Selections.length > 0) {
				selections.push(eventDatas[cc].Lines[0].Selections[0]);
			}
			cc = cc + 1;
		}
		console.log('event Selections', selections);

		//再加1個正常的
		eventDatas = canParlays;
		selectionCount = 3;
		cc = 0;

		//模擬投注 選第一個玩法 第一個投注選項
		while(selections.length < selectionCount) {
			//有可能比賽下面沒有投注選項，要額外判斷
			if (eventDatas[cc]
				&& eventDatas[cc].Lines && eventDatas[cc].Lines.length > 0
				&& eventDatas[cc].Lines[0].Selections && eventDatas[cc].Lines[0].Selections.length > 0)
			{
				selections.push(eventDatas[cc].Lines[0].Selections[0]);
			}
			cc = cc+1;
		}

		console.log('event Selections',selections);

		const betInfoPolling = await VendorIM.getBetInfo(WagerType.COMBO, selections); //這裡沒事，可以正常過

		console.log('betInfoPolling', betInfoPolling);

		//默認會在placeBet才爆出錯誤，直接回一個 BetStatusMessage = 1126，並且不會告訴你哪個selection有問題
		//但這樣足夠了，在UI點擊的時候事先擋住，遇到這種問題的可能性就很低
		// VendorIM.placeBet(WagerType.COMBO, betInfoPolling.NewData, 6, betInfoPolling.NewData.BetSettings[0].ComboType)
		// 	.then(betResult => console.log('placeBet result', betResult))
		// 	.catch(error => console.log(error));
	}

	//串關-一個event只能選一個Seleciton
	async testOneEventOneSelection() {
		const earlys = await VendorIM.getEvents(IMSports.SOCCER, VendorMarkets.EARLY, SortWays.EventTime);

		const eventDatas = earlys.NewData;

		console.log('eventDatas',eventDatas);

		const selections = [eventDatas[1].Lines[0].Selections[0], eventDatas[1].Lines[1].Selections[0]]

		console.log('event Selections',selections);

		//如果沒有自己做阻擋，默認會在getBetInfo返回334錯誤=>VendorErrorType.BET_Event_Error=>赛事/盘口已失效，或无法使用
		const betInfoPolling = await VendorIM.getBetInfo(WagerType.COMBO,selections);  //會throw 只能選一個Selection 這樣比較明確，而且如果UI點擊的時候事先擋住 就不會有問題

		console.log('betInfoPolling',betInfoPolling);
	}

	//串關-最多選10個投注項
	async testParlaySelectionCountMax() {
		const earlys = await VendorIM.getEvents(IMSports.SOCCER, VendorMarkets.EARLY, SortWays.EventTime);

		const eventDatas = earlys.NewData;

		//選幾個投注選項
		let selectionCount = VendorIM.configs.MaxParlay + 1;

		//投注選項(SelectionData)
		let selections = [];
		let cc = 0;
		//模擬投注 選第一個玩法 第一個投注選項
		while(selections.length < selectionCount) {
			//有可能比賽下面沒有投注選項，要額外判斷
			if (eventDatas[cc]
				&& eventDatas[cc].Lines && eventDatas[cc].Lines.length > 0
				&& eventDatas[cc].Lines[0].Selections && eventDatas[cc].Lines[0].Selections.length > 0)
			{
				selections.push(eventDatas[cc].Lines[0].Selections[0]);
			}
			cc = cc+1;
		}
		console.log('event Selections',selections);

		//默認會在getBetInfo返回355錯誤=>VendorErrorType.BET_Selection_Parlay_Limit=>投注选项数量超过上限
		const betInfoPolling = await VendorIM.getBetInfo(WagerType.COMBO,selections);  //會throw錯誤

		console.log('betInfoPolling',betInfoPolling);
	}

	//單筆-投注錯誤
	async tesSingleBetError() {
		const earlys = await VendorIM.getEvents(IMSports.SOCCER, VendorMarkets.EARLY, SortWays.EventTime);
		const eventDatas = earlys.NewData;

		//選幾個投注選項
		let selectionCount = 1;

		//投注選項(SelectionData)
		let selections = [];
		let cc = 0;
		//模擬投注 選第一個玩法 第一個投注選項
		while(selections.length < selectionCount) {
			//有可能比賽下面沒有投注選項，要額外判斷
			if (eventDatas[cc]
				&& eventDatas[cc].Lines && eventDatas[cc].Lines.length > 0
				&& eventDatas[cc].Lines[0].Selections && eventDatas[cc].Lines[0].Selections.length > 0)
			{
				selections.push(eventDatas[cc].Lines[0].Selections[0]);
			}
			cc = cc+1;
		}
		console.log('event Selections',selections);
		const betInfoPolling = await VendorIM.getBetInfo(WagerType.SINGLE,selections[0]);
		console.log('betInfoPolling',betInfoPolling);

		let betInfo = betInfoPolling.NewData;

		//修改成不存在的EventID
		//betInfo.Selections.EventId = 123456;  //StatusCode: 1000 => BetStatusMessage: "380" => BET_Event_Error 赛事/盘口已失效，或无法使用
		//const betAmount = betInfo.BetSettings.MinAmount;

		//低於金額下限
		//const betAmount = betInfo.BetSettings.MinAmount -1;  //StatusCode: 1000 => BetStatusMessage: "1106" => BET_Place_LimitMin 投注金额低于下限

		//超過上限
		//const betAmount = betInfo.BetSettings.MaxAmount +1;  //StatusCode: 1000 => BetStatusMessage: "1105" => BET_Place_LimitMax 投注金额超过上限

		//餘額不足(換一個沒餘額的號)
		//const betAmount = betInfo.BetSettings.MinAmount;  //StatusCode: 1000 => BetStatusMessage: "1103" => BET_Place_Balance 余额不足

		//賠率變低
		//betInfo.Selections.Odds = (new Decimal(betInfo.Selections.Odds)).add(1).toNumber();
		//const betAmount = betInfo.BetSettings.MinAmount; //StatusCode: 1000 => BetStatusMessage: "1107" => BET_Place_OddChanged 赔率已变更

		//執行下注，返回是BetResultData格式
		VendorIM.placeBet(WagerType.SINGLE, betInfo, betAmount)
			.then(betResult => console.log('placeBet result', betResult))
			.catch(error => {
				//這裡處理下注可能返回的錯誤
				if (typeof error  === 'object' && error.isVendorError === true) {
					console.log(error);
				}
			})
	}

	//測試 關注比賽
	async testFavEvents(){
		//拿取今日前3個比賽
		const todayEvents = await VendorIM.getEvents(IMSports.SOCCER,VendorMarkets.TODAY);
		const eventIds = [todayEvents.NewData[0].EventId,todayEvents.NewData[1].EventId,todayEvents.NewData[2].EventId];

		//分別用三種不同的getEvent方法獲取賽事數據，打印當前IsFavourite狀態
		const dumpFavs = async (eventIds) => {
			const todayEvents = await VendorIM.getEvents(IMSports.SOCCER,VendorMarkets.TODAY);
			todayEvents.NewData.map(i => {
				if (eventIds.indexOf(i.EventId) !== -1) {
					console.log('getEvents', i.EventId, i.IsFavourite)
				}
			})
			const events = await VendorIM.getEventsDetail(eventIds.map(ev => new EventInfo(ev,IMSports.SOCCER,false)));
			events.NewData.map(i => console.log('getEventsDetail', i.EventId, i.IsFavourite));
			await Promise.all(eventIds.map(async eid => {
				const thise = await VendorIM.getEventDetail(IMSports.SOCCER, eid);
				console.log('getEventDetail', thise.NewData.EventId, thise.NewData.IsFavourite)
			}));
		}

		await dumpFavs(eventIds); //這裡應該全false

		//添加關注
		console.log('before add', VendorIM.getFavouriteEvents());
		eventIds.map(i => VendorIM.addFavouriteEvent(i, IMSports.SOCCER,false));
		console.log('after add', VendorIM.getFavouriteEvents());

		await dumpFavs(eventIds); //這裡應該全true

		//刪除關注
		console.log('before remove', VendorIM.getFavouriteEvents());
		eventIds.map(i => VendorIM.removeFavouriteEvent(i));
		console.log('after remove', VendorIM.getFavouriteEvents());

		await dumpFavs(eventIds); //這裡應該全false
	}

	async dumpEvents2CSV() {
		const allDatas = await fetch('https://fun88-s87.com/smartcoach/c8bd8298905e7357a76d5e9ef343170c55c2cf15/im/events')
			.then(function(response) {
				return response.json();
			}).then(function(jsonData){
				return jsonData.data;
			});

		console.log(allDatas);

		const csvDatas = allDatas.map(ev => [ev.EventId, ev.EventDate, ev.LeagueId, ev.LeagueName, ev.HomeTeamId, ev.HomeTeamName, ev.AwayTeamId, ev.AwayTeamName].join("\t") );

		let s = ''
		csvDatas.map(ss => s = s + ss + "\r\n");

		console.log(s);
	}

	async testfunc() {
		console.log('--------- test click -----------');

		//this.Search();  //聯賽搜索

		//this.SingleBet_demo(); //單筆投注 例子

		//this.SingleBet_outright_demo() //單筆投注  優勝冠軍 例子

		//this.ComoboBet_demo(); //串關投注 例子

		//this.ComoboSystemBet_demo(); //系統混合過關 串關投注 例子

		//this.notification_demo(); //notification例子

		//this.getUnsettleWagers(); //查詢未結算注單

		//this.getSettledWagers(); //查詢已結算注單

		//this.getAnnouncements(); //獲取公告(vendor announcement)

		//this.Favourite_demo(); //收藏比賽 例子

		//this.getBannerData(); //獲取banner數據

		//this.getLiveEventsInSameLeague(); //獲取聯賽下的滾球賽事

		//this.getHotEvents(); //獲取熱門比賽

		//--------下面是 直接查詢的例子，一般不使用------------

		//this.getSports(); 	//獲取 體育  和 市場 清單＋計數

		//this.getEvents1(); 	//獲取 足球 早盤 按聯賽排序，

		//this.getEvents2();	//獲取足球 早盤 只取後天的比賽 按時間排序

		//this.getEvents3();	//獲取 足球 滾球 按時間排序

		//this.getEvents4();	//獲取 足球  優勝冠軍  按聯賽排序

		//this.getEventDetail();	//獲取單個比賽數據

		//this.getEventsDetail(); //獲取多個比賽數據

		//查看數據用
		//this.testData();

		//錯誤處理
		//this.tesSingleSelectionDataError(); //單筆-投注檢查-數據錯誤
		//this.testComboSelectionDataError(); //串關-投注檢查-數據錯誤
		//this.testIsOpenParlay();  //串關-IsOpenParlay=false
		//this.testOneEventOneSelection() //串關-一個event只能選一個Seleciton
		//this.testParlaySelectionCountMax() //串關-最多選10個投注項
		//this.tesSingleBetError() //單筆-投注錯誤

		//測試
		//this.testFavEvents(); //測試關注比賽功能

		//印出當前比賽 csv格式
		this.dumpEvents2CSV();
	}

	dologin() {
		this.mockLoginPromise = MockLogin.doMockLoginJBO().then(()=>MockLogin.getIMToken('jbo'));
	}

	render() {
		return (
			<Layout>
				<div>IM測試頁</div>
				<div>
					<input type='button' value='login' onClick={() => this.dologin()} />
				</div>
				<div>
					<input type='button' value='test' onClick={() => this.testfunc()} />
				</div>
				<div>
					<input type='button' value='去BTI測試' onClick={() => Router.push('/sbtwo/sports-bti-demo')} />
				</div>
			</Layout>
		);
	}
}

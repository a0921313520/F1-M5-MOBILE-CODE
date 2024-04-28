/* ******************** 购物车投注盘口列表 ********************** */
import React from 'react';
import { ReactSVG } from '$SBTWO/ReactSVG';
import { numberWithCommas } from '../BettingDataCheck';
import Bettotalamount from '../BottomSubmitBetting/';
import { ChangeSvg } from '$SBTWOLIB/js/util';
import {SelectionStatusType } from '$SBTWOLIB/vendor/data/VendorConsts';
import BetKeyboard from '../BottomNumberKeyboard/';
import ReactIMG from '$SBTWO/ReactIMG';

class BetOdds extends React.Component {
	constructor(props) {
		super();
		this.state = {
			ShowKeyboard: false, //是否展示數字輸入鍵盤
			Activeinput: 0, //當前選擇的投注選項index
		};
		this._refsBetKeyboard = React.createRef();
	}

	render() {
		const { ShowKeyboard, Activeinput } = this.state;
		let { BetActiveType, BetInfoData, BetAmountData, OddsUpData, OddsDown, Vendor, Balance } = this.props;
		const { Selections, BetSettings } = BetInfoData;
		let ComboCountlist = [];
		let Errorlist = [];
		let EstimatedPayoutRatelist = [];
		let BetAmountvallist = [];

		//投注不可用的置灰模塊
		const DisableBetBlock = (props) => {
			return <div
				className="CantPlay"
				onClick={() => {
					this.props.RemoveBetCart(props.item);
				}}
				style={{ borderRadius: '10px' }}
			>
				<p>{props.message}</p>
			</div>
		}

		return (
			<div key={BetActiveType}>
				{(Selections && Selections.length > 0) ? (
					<div>
						{Selections.map((item, index) => {
							//這邊金額的相關計算都只有 單投 適用
							//對串投來說 這裡只是拿來顯示 投注選項而已 實際的投注動作 在 crossbetting 裡面處理
							const betAmountDataKey = item.EventId; //單注用EventId作為key
							const targetAmountData = BetAmountData.find(v => v.key == betAmountDataKey);
							let Amount = targetAmountData ? targetAmountData.betAmount : '';

							//只適用單投
							const targetBetSetting =
								BetSettings !== null
									? BetSettings[index] != null ? BetSettings[index] : false
									: false;
							/* 金额统一乘 负数盘比例（RealBetAmountRate），如果不是负数盘 比例返回的是 （1）  所以统一都乘 RealBetAmountRate */
							let AmountSet = targetBetSetting
								? Number(Number(Amount) * Number(targetBetSetting.RealBetAmountRate)).toFixed(2)
								: 0;
							BetAmountvallist[index] = (Amount == '') ? 0 : Amount;
							ComboCountlist[index] = AmountSet;
							if (BetSettings && BetActiveType == 1) {
								EstimatedPayoutRatelist[index] = targetBetSetting
									? (Number(BetAmountvallist[index]) *
											Number(targetBetSetting.EstimatedPayoutRate)).toFixed(2)
									: 0;
							}
							/* 检测盘口是否关闭 */
							const oddsClosed = (BetActiveType == 1) ? ((item.SelectionStatus !== SelectionStatusType.OK) || !targetBetSetting)  //單注才有對應的BetSetting
																										: (item.SelectionStatus !== SelectionStatusType.OK)

							const oddsClosedName = (
								item.SelectionStatus === SelectionStatusType.UPDATING
								|| item.SelectionStatus === SelectionStatusType.EUODDSONLY
								|| item.SelectionStatus === SelectionStatusType.NEED3COMBO
							)
								? item.SelectionStatusName
								: '盘口关闭';

							//上下限異常(賠率更新中)
							const oddsUpdating = (BetActiveType == 1) && targetBetSetting && targetBetSetting.MinAmount == 0 && targetBetSetting.MaxAmount == 0;

							//不支持串投
							const NoParlay = (BetActiveType == 2 || BetActiveType == 3) && !item.IsOpenParlay;

							const CantPlay = oddsClosed || oddsUpdating;

							/* 上升盘口 */
							let result =
								OddsUpData != ''
									? OddsUpData.some(function(items) {
											if (item.SelectionId == items.SelectionId) {
												return true;
											}
										})
									: false;
							/* 下降盘口 */
							let resultd =
								OddsDown != ''
									? OddsDown.some(function(items) {
											if (item.SelectionId == items.SelectionId) {
												return true;
											}
										})
									: false;
							/* 实际投注金额判断 */
							let ActualBetAmount = targetBetSetting ? targetBetSetting.IsMinusOdds : false;
							/* 错误的投注金额 */
							let Amounterror =
								AmountSet != '0.00' && targetBetSetting
									? AmountSet < targetBetSetting.MinAmount || AmountSet > targetBetSetting.MaxAmount
									: false;

							/* 错误对象 */
							let AmountCheck = {
								Amounterror: Amounterror,
								Amount: AmountSet
							};
							Errorlist.push(AmountCheck);
							let AmountFixed = Amount != '' && Amount != 'undefined' ? Number(Amount).toFixed(2) : '';
							return item ? (
								<div className={'Betinputlist'} key={index}>
									<div className="input-area">
										{
											NoParlay ? <DisableBetBlock item={item} message={'不支持串关投注'} />
										: oddsClosed ? <DisableBetBlock item={item} message={oddsClosedName} />
										: oddsUpdating ? <DisableBetBlock item={item} message={'赔率更新中'} />
										: null
										}

										<div
											className="item left"
											onClick={() => {
												this.props.RemoveBetCart(item);
											}}
										>
											<ReactSVG className="Betting-closem -svg" src={'/img/svg/betting/close.svg'} />
										</div>
										<div className="item right">
											<div className="team-name">
												{item.IsOutRightEvent ? (
													<div className="vsname">{`${item.OutRightEventName}`}</div>
												) : (
													<div className="vsname">
														<span>{item.HomeTeamName}</span>
														<span className="vs">vs</span>
														<span> {item.AwayTeamName}</span>
													</div>
												)}
												<h2>
													{result ? (
														<b className="red">
															@<span
																dangerouslySetInnerHTML={{
																	__html: ChangeSvg(item.DisplayOdds)
																}}
																className="NumberBet"
															/>
															<ReactIMG src="/img/svg/betting/round-up.svg" />
														</b>
													) : resultd ? (
														<b className="green">
															@<span
																dangerouslySetInnerHTML={{
																	__html: ChangeSvg(item.DisplayOdds)
																}}
																className="NumberBet"
															/>
															<ReactIMG src="/img/svg/betting/round-down.svg" />
														</b>
													) : (
														<b className="blue">
															@
															<span
																dangerouslySetInnerHTML={{
																	__html: ChangeSvg(item.DisplayOdds)
																}}
																className="NumberBet"
															/>
														</b>
													)}
												</h2>
											</div>
											<div className="team-name">
												<div className="Main_set gray dpvsname">{item.LeagueName}</div>
												<b className="rdpvsname">{item.SelectionDesc}</b>
											</div>
											<div className="team-name">
												<div className="gray Nameset">
													{item.LineDesc != 'undefined' ? item.LineDesc : ''}
												</div>
												{/* 投注金額輸入框 只適用於單投 */}
												{BetActiveType == 1 && (
													<div className="InputBox">
														<span className="icon">￥</span>
														<input
															defaultValue={AmountFixed}
															style={{ width: '100%' }}
															disabled
															className={
																ShowKeyboard && Activeinput == index ? (
																	'Inputactive input'
																) : (
																	'input'
																)
															}
															key={Amount}
														/>
														{/* 兼容火狐 input disabled 无法触发click事件问题 放一个覆盖层 */}
														<div
															className="Falseinput"
															onClick={() => {
																if (CantPlay) return;
																this.setState({
																	ShowKeyboard: true,
																	Activeinput: index
																});
																this.props._onScrollEvent(index);
															}}
														/>
													</div>
												)}
											</div>
											{/* 负数盘 实际投注金额 */}
											{ActualBetAmount && (
												<div className="ActualBetAmount">
													<label>实际投注￥</label>
													<span>{numberWithCommas(AmountSet)}</span>
												</div>
											)}
											{BetActiveType == 1 &&
											targetBetSetting &&
											ShowKeyboard &&
											Errorlist != '' && (
												<p
													className="Error"
													style={{
														display: Errorlist[index].Amounterror ? 'flex' : 'none'
													}}
												>
													{Errorlist[index].Amount < targetBetSetting.MinAmount &&
														`金额必须为￥ ${numberWithCommas(targetBetSetting.MinAmount)} 或以上的金额`}
													{Errorlist[index].Amount != '' &&
														Errorlist[index].Amount > targetBetSetting.MaxAmount &&
														`金额必须为￥ ${numberWithCommas(targetBetSetting.MaxAmount)} 或以下的金额`}
												</p>
											)}

											{BetActiveType == 1 &&
											BetSettings != null && (
												<p className="light-gray flex-box">
													<small>
														可赢金额：￥{BetAmountvallist[index] == '' || !targetBetSetting ? (
															0
														) : (
															(Number(BetAmountvallist[index]) *
																Number(targetBetSetting.EstimatedPayoutRate)).toFixed(2)
														)}
													</small>
													<span>
														最低-最高：￥{targetBetSetting ? (
															numberWithCommas(targetBetSetting.MinAmount)
														) : (
															0
														)}-￥{targetBetSetting ? (
															numberWithCommas(targetBetSetting.MaxAmount)
														) : (
															0
														)}
													</span>
												</p>
											)}
										</div>
									</div>
									{/* 投注键盘 只适用于单投 */}
									{BetActiveType == 1 && (
										<div className="ShowKeyboardBox">
											{ShowKeyboard &&
											Activeinput == index &&
											!CantPlay &&
											targetBetSetting && (
												<BetKeyboard
													modifyNum={this.props.modifyNum}
													chooseFreeBet={this.props.chooseFreeBet}
													BetSetting={targetBetSetting}
													BetAmountData={BetAmountData}
													BetAmountDataKey={betAmountDataKey}
													Balance={this.props.Balance}
													ref={this._refsBetKeyboard}
													Vendor={Vendor}
												/>
											)}
										</div>
									)}
								</div>
							) : (
								<p className="errortxt">此盘口关闭，或刷新试试！</p>
							);
						})}

						{/* 投注金額總計和投注按鈕 只适用于单投 且單投 沒有免費投注 */}
						{BetActiveType == 1 && (
							<Bettotalamount
								Vendor={Vendor}
								/* 选择的盘口下注金额数据  */
								BetAmountvallist={BetAmountvallist}
								/* 注单数量 */
								ComboCount={ComboCountlist}
								/* 盘口的金额赔率 用于计算可盈利的金额*/
								EstimatedPayoutRatelist={EstimatedPayoutRatelist}
								/* 注单类型 */
								BetActiveType={1}
								/* 盘口的详情数据 */
								BetInfoData={BetInfoData}
								/* 开始下注 */
								StartBetting={this.props.StartBetting}
								/* 删除购物车 */
								RemoveBetCart={this.props.RemoveBetCart}
								/* 关闭投注框 */
								CloseBottomSheet={this.props.CloseBottomSheet}
								/* 当前选择的盘口key */
								ActiveInput={Activeinput}
								FreeBetTokenList={[]}
								Amounterror={
									Errorlist != '' ? Errorlist.filter((item) => item.Amounterror == true) != '' : false
								}
								Balance={Balance}
							/>
						)}
					</div>
				) : (
					<p className="errortxt">此盘口关闭，或刷新试试！</p>
				)}
			</div>
		);
	}
}
export default BetOdds;

/* ************* 串关 投注设置详情  例如 2串1 3串1 **************** */
import React from 'react';
import { ReactSVG } from '$SBTWO/ReactSVG';
import ComboBonusModal from '$SBTWO/ComboBonusModal/';
import { ChangeSvg } from '$SBTWOLIB/js/util';
import { numberWithCommas } from '../BettingDataCheck';
import BetKeyboard from '../BottomNumberKeyboard/';
import Bettotalamount from '../BottomSubmitBetting/';
import CannotBetting from './CannotBetting';
import {Decimal} from "decimal.js";
import ReactIMG from '$SBTWO/ReactIMG';

class CrossBetting extends React.Component {
	constructor(props) {
		super();
		this.state = {
			ShowKeyboard: false,
			Activeinput: 0,
			showgift: false,
			showgiftModal: false
		};
		this._refsBetKeyboard = React.createRef();
	}

	render() {
		const { ShowKeyboard, Activeinput } = this.state;
		const { BetInfoData, BetAmountData, OddsUpData, OddsDown, Balance, Vendor } = this.props;
		const { BetSettings, Selections } = BetInfoData;
		let BetAmountvallist = [];
		let Errorlist = [];
		let ComboCountlist = [];
		let EstimatedPayoutRatelist = [];
		let FreeBetTokenList = [];

		//無法投注原因
		let isNotEnoughSelections = false;
		if (!BetSettings || BetSettings.length <= 0) {
			//過濾掉 不支持串關 和 狀態異常 的投注選項，剩下的不到兩個 => 無法投注
			isNotEnoughSelections = BetInfoData.getSelectionsForCombo().length < 2;
		}

		return (
			<div>
				{BetSettings && BetSettings.length > 0 ? (
					<div>
						<div>
							{BetSettings.map((item, index) => {
								const betAmountDataKey = item.ComboType; //串關用 串關方式 作為key
								const targetAmountData = BetAmountData.find(v => v.key == betAmountDataKey);
								const Amount = targetAmountData ? targetAmountData.betAmount : '';
								BetAmountvallist[index] = (Amount == '') ? 0 : Amount;
								ComboCountlist[index] = item.ComboCount * Amount;
								EstimatedPayoutRatelist[index] = (Number(BetAmountvallist[index]) *
									Number(item.EstimatedPayoutRate)).toFixed(2);

								//免費投注
								const thisFreeBetToken = targetAmountData ? targetAmountData.freeBetToken : null;
								FreeBetTokenList[index] = thisFreeBetToken;
								let thisFreeBetData = null;
								if (thisFreeBetToken) {
									thisFreeBetData = (item && item.FreeBets)
										? item.FreeBets.find(fb => fb.FreeBetToken == thisFreeBetToken)
										: null;
								}

								let thisMinAmount = item.MinAmount;
								//免費投注影響投注下限
								if (thisFreeBetData) {
									if (thisFreeBetData.FreeBetAmount > (item.ComboCount * item.MinAmount)) {
										thisMinAmount = new Decimal(thisFreeBetData.FreeBetAmount).dividedBy(item.ComboCount).toDecimalPlaces(0,2).toNumber(); //無條件進位
									}
								}

								let result =
									OddsUpData != ''
										? OddsUpData.some(function(items) {
												if (item.SelectionId == items.SelectionId) {
													return true;
												}
											})
										: false;
								let resultd =
									OddsDown != ''
										? OddsDown.some(function(items) {
												if (item.SelectionId == items.SelectionId) {
													return true;
												}
											})
										: false;


								let Amounterror =
									Amount != '' ? Amount < thisMinAmount || Amount > item.MaxAmount : false;
								let AmountCheck = {
									Amounterror: Amounterror,
									Amount: Amount
								};
								Errorlist.push(AmountCheck);
								let AmountFixed =
									Amount != '' && Amount != 'undefined' ? Number(Amount).toFixed(2) : '';

								return (
									<div className={'Settingsinput'} key={index}>
										<div className="list Inputdata">
											{result ? (
												<b>
													{item.ComboTypeName}x{item.ComboCount}
													<span className="red">
														@<span
															dangerouslySetInnerHTML={{
																__html: ChangeSvg(
																	Number(item.EstimatedPayoutRate.toFixed(2))
																)
															}}
															className="NumberBet"
														/>
														<ReactIMG src="/img/svg/betting/round-up.svg" />
													</span>
												</b>
											) : resultd ? (
												<b>
													{item.ComboTypeName}x{item.ComboCount}
													<span className="green">
														@<span
															dangerouslySetInnerHTML={{
																__html: ChangeSvg(
																	Number(item.EstimatedPayoutRate.toFixed(2))
																)
															}}
															className="NumberBet"
														/>
														<ReactIMG src="/img/svg/betting/round-down.svg" />
													</span>
												</b>
											) : (
												<b>
													{item.ComboTypeName}x{item.ComboCount}
													<span>
														@{item.EstimatedPayoutRate &&
															Number(item.EstimatedPayoutRate.toFixed(2))}
													</span>
												</b>
											)}
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
														this.setState({
															ShowKeyboard: true,
															Activeinput: index
														});
													}}
												/>
											</div>
										</div>

										{ShowKeyboard &&
										Errorlist != '' && (
											<p
												className="Error"
												style={{
													display: Errorlist[index].Amounterror ? 'flex' : 'none'
												}}
											>
												{Errorlist[index].Amount < thisMinAmount &&
													`金额必须为￥ ${numberWithCommas(thisMinAmount)} 或以上的金额`}
												{Errorlist[index].Amount > item.MaxAmount &&
													`金额必须为￥ ${numberWithCommas(item.MaxAmount)} 或以下的金额`}
											</p>
										)}
										<div className="gift-freebet">
										{item.HasComboBonus ?
											<div className="gift">
												{item.ComboBonusPercentage}%
												<ReactSVG
													src={'/img/svg/betting/gift.svg'}
													onClick={() => {
														this.setState({
															showgift: true
														});
													}}
												/>
												{this.state.showgift && (
													<div className="gift-alert">
														<ReactSVG src={'/img/svg/betting/j.svg'} className="j" />
														<div className="left">
															<big>串关奖励</big>
															<small>
																<br />串关奖励 系统将依据您投注的串关数给予 您高{item.ComboBonusPercentage}%的额外赔率奖励
															</small>
														</div>
														<div className="right">
															<ReactSVG
																src={'/img/svg/betting/x.svg'}
																onClick={() => {
																	this.setState({
																		showgift: false
																	});
																}}
															/>
															<div
																className="btn"
																onClick={() => {
																	this.setState({
																		showgiftModal: true
																	});
																}}
															>
																查看详情
															</div>
														</div>
													</div>
												)}
												<ComboBonusModal
													visible={this.state.showgiftModal}
													onClose={() => {
														this.setState({
															showgiftModal: false
														});
													}}
												/>
											</div>
										: thisFreeBetData ? <div>&nbsp;</div> : null}
										{
											thisFreeBetData &&
												<div className="freebet">{'使用 ' + thisFreeBetData.FreeBetAmount + ' 元串关免费彩金'}</div>
										}
										</div>
										<div className="list Amountdata">
											<small className="light-gray">
												可赢金额：￥{BetAmountvallist[index] == '' ? (
													0
												) : (
													(Number(BetAmountvallist[index]) *
														Number(item.EstimatedPayoutRate)).toFixed(2)
												)}
											</small>
											<small className="light-gray">
												最低-最高:￥{numberWithCommas(thisMinAmount)}-￥{numberWithCommas(item.MaxAmount)}
											</small>
										</div>
										{/* 投注键盘 */}
										<div className="ShowKeyboardBox">
											{ShowKeyboard &&
											Activeinput == index && (
												<BetKeyboard
													modifyNum={this.props.modifyNum}
													chooseFreeBet={this.props.chooseFreeBet}
													BetSetting={item}
													BetAmountData={BetAmountData}
													BetAmountDataKey={betAmountDataKey}
													Balance={this.props.Balance}
													ref={this._refsBetKeyboard}
													Vendor={Vendor}
												/>
											)}
										</div>
									</div>
								);
							})}
						</div>
						{/* 投注金額總計和投注按鈕 */}
						<Bettotalamount
							Vendor={Vendor}
							BetAmountvallist={BetAmountvallist}
							ComboCount={ComboCountlist}
							EstimatedPayoutRatelist={EstimatedPayoutRatelist}
							BetActiveType={2}
							BetInfoData={BetInfoData}
							StartBetting={this.props.StartBetting}
							RemoveBetCart={this.props.RemoveBetCart}
							CloseBottomSheet={this.props.CloseBottomSheet}
							ActiveInput={Activeinput}
							FreeBetTokenList={FreeBetTokenList}
							Amounterror={
								Errorlist != '' ? Errorlist.filter((item) => item.Amounterror == true) != '' : false
							}
							Balance={Balance}
						/>
					</div>
				) : (
					/* 无法投注 */
					<CannotBetting
						RemoveBetCart={this.props.RemoveBetCart}
						type={2}
						isNotEnoughSelections={isNotEnoughSelections}
					/>
				)}
			</div>
		);
	}
}
export default CrossBetting;

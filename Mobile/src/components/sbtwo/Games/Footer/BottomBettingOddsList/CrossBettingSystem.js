/* ************* 串关 投注设置详情  例如 2串1 3串1 **************** */
import React from 'react';
import { numberWithCommas } from '../BettingDataCheck';
import BetKeyboard from '../BottomNumberKeyboard/';
import Bettotalamount from '../BottomSubmitBetting/';
import CannotBetting from './CannotBetting';
import {Decimal} from "decimal.js";

/* **********系统混合过关  例如 系统混合过关2/3 3串4 **************/
class CrossBettingSystem extends React.Component {
	constructor(props) {
		super();
		this.state = {
			ShowKeyboard: false,
			currentChecked: 0
		};
		this._refsBetKeyboard = React.createRef();
	}
	componentDidMount() {
	}
	render() {
		const { BetInfoData, BetAmountData, Balance, Vendor } = this.props;
		const { currentChecked } = this.state;
		const betAmountDataKey = 'system'; //系統混合過關 用 'system'  作為key
		const targetAmountData = BetAmountData.find(v => v.key == betAmountDataKey);
		let Amount = targetAmountData ? targetAmountData.betAmount : '';
		let BetAmountvallist = [ Amount ];
		const BetSettings = BetInfoData && BetInfoData.SystemParlayBetSettings ? BetInfoData.SystemParlayBetSettings : null;
		let EstimatedPayoutRatelist =
			BetSettings && BetSettings.length > 0
				? [
						(Number(BetAmountvallist[0]) *
							Number(BetSettings[currentChecked].EstimatedPayoutRate)).toFixed(2)
					]
				: [ 0 ];
		let ComboCountlist =
			BetSettings && BetSettings.length > 0
				? [ BetSettings[currentChecked].ComboCount * Amount ]
				: [ 0 ];

		//免費投注
		const thisFreeBetToken = targetAmountData ? targetAmountData.freeBetToken : null;
		let FreeBetTokenList = [thisFreeBetToken];
		let thisFreeBetData = null;
		let currentBetSetting = BetSettings ? BetSettings[currentChecked] : null;
		if (thisFreeBetToken) {
			thisFreeBetData = (currentBetSetting && currentBetSetting.FreeBets)
				? currentBetSetting.FreeBets.find(fb => fb.FreeBetToken == thisFreeBetToken)
				: null;
		}

		let MaxAmount = currentBetSetting ? currentBetSetting.MaxAmount : 0;
		let MinAmount = currentBetSetting ?currentBetSetting.MinAmount : 0;
		//免費投注影響投注下限
		if (thisFreeBetData) {
			if (thisFreeBetData.FreeBetAmount > (currentBetSetting.ComboCount * currentBetSetting.MinAmount)) {
				MinAmount = new Decimal(thisFreeBetData.FreeBetAmount).dividedBy(currentBetSetting.ComboCount).toDecimalPlaces(0,2).toNumber(); //無條件進位
			}
		}

		let AmountFixed = Amount != '' && Amount != 'undefined' ? Number(Amount).toFixed(2) : '';

		//無法投注原因
		let isNotEnoughSelections = false;
		if (BetSettings || BetSettings.length <= 0) {
			//過濾掉 不支持串關 和 狀態異常 的投注選項，剩下的不到3個 => 無法投注
			isNotEnoughSelections = BetInfoData.getSelectionsForCombo().length < 3;
		}

		return (
			<div>
				{BetSettings && BetSettings.length > 0 ? (
					<div className="SystemParlayBet">
						<ul className="cap-list">
							{BetSettings.map((item, index) => {
								return (
									<li
										className="cap-item"
										key={index}
										onClick={() => {
											this.setState({
												currentChecked: index,
											});
										}}
									>
										<div
											className={`cap-item-circle${index === currentChecked
												? ' curr'
												: ''}`}
										/>
										<div>
											{item.ComboTypeName} x {item.ComboCount}
											<span>
														@{item.EstimatedPayoutRate &&
											Number(item.EstimatedPayoutRate.toFixed(2))}
													</span>
										</div>
									</li>
								);
							})}
						</ul>
						<div className="Inputdata InputBox">
							<span className="icon">￥</span>
							<input
								defaultValue={AmountFixed}
								style={{ width: '100%' }}
								disabled
								className={this.state.ShowKeyboard ? 'Inputactive input' : 'input'}
								key={Amount}
							/>
							{/* 兼容火狐 input disabled 无法触发click事件问题 放一个覆盖层 */}
							<div
								className="Falseinput"
								onClick={() => {
									this.setState({
										ShowKeyboard: true
									});
								}}
							/>
						</div>
						<div style={{ padding: '0 10px' }}>
							{Amount != '' &&
							Amount < MinAmount && <p className="Error">金额必须为￥ {numberWithCommas(MinAmount)} 或以上的金额</p>}
							{Amount != '' &&
							Amount > MaxAmount && <p className="Error">金额必须为￥ {numberWithCommas(MaxAmount)} 或以下的金额</p>}
						</div>
						{
							thisFreeBetData &&
							<div className="gift-freebet system">
								<div>&nbsp;</div>
								<div className="freebet">{'使用 ' + thisFreeBetData.FreeBetAmount + ' 元串关免费彩金'}</div>
							</div>
						}
						<div className="ShowKeyboardBox ">
							<p>
								最低-最高：￥{numberWithCommas(MinAmount)}-￥{numberWithCommas(MaxAmount)}
							</p>
							{this.state.ShowKeyboard && (
								<BetKeyboard
									modifyNum={this.props.modifyNum}
									chooseFreeBet={this.props.chooseFreeBet}
									BetSetting={BetSettings ? BetSettings[currentChecked] : null}
									BetAmountData={BetAmountData}
									BetAmountDataKey={betAmountDataKey}
									Balance={this.props.Balance}
									ref={this._refsBetKeyboard}
									Vendor={Vendor}
								/>
							)}
						</div>
						{/* 投注金額總計和投注按鈕 */}
						<Bettotalamount
							Vendor={Vendor}
							BetAmountvallist={BetAmountvallist}
							ComboCount={ComboCountlist}
							EstimatedPayoutRatelist={EstimatedPayoutRatelist}
							BetActiveType={3}
							BetInfoData={BetInfoData}
							StartBetting={this.props.StartBetting}
							RemoveBetCart={this.props.RemoveBetCart}
							CloseBottomSheet={this.props.CloseBottomSheet}
							ActiveInput={currentChecked}
							FreeBetTokenList={FreeBetTokenList}
							Amounterror={Amount != '' ? Amount < MinAmount || Amount > MaxAmount : true}
							Balance={Balance}
						/>
					</div>
				) : (
					/* 无法投注 */
					<CannotBetting
						RemoveBetCart={this.props.RemoveBetCart}
						type={3}
						isNotEnoughSelections={isNotEnoughSelections}
					/>
				)}
			</div>
		);
	}
}
export default CrossBettingSystem;

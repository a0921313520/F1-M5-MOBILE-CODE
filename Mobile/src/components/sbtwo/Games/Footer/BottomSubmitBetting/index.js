/* -----------确认投注 总金额 可赢 开始下注-------------*/
import React from "react";
import Toast from '$SBTWO/Toast';
import { connect } from 'react-redux';
import { ACTION_BetCart_setIsComboBet } from '@/lib/redux/actions/BetCartAction';

class Bettotalamount extends React.Component {
	sum(arr) {
		return eval(arr.join('+'));
	}
	render() {
		const {
			/* 盘口计算盈利金额利率 类型array */
			EstimatedPayoutRatelist,
			/* 用于计算 总投注额 */
			ComboCount,
			/* 注单的类型 */
			BetActiveType,
			/* 投注的金额列表 */
			BetAmountvallist,
			/* 返回的盘口详情 */
			BetInfoData,
			/* 选择的盘口key */
			ActiveInput,
			/* 选择的免费投注盘口的key */
			FreeBetTokenList,
			/* 金额含有错误 */
			Amounterror,
			/* 用户余额 */
			Balance
		} = this.props;

		/* 总投注金额 */
		const totalBet = ComboCount != '' ? this.sum(ComboCount) : 0;

		//是否有投注
		const NOBet = totalBet <= 0;

		/* 余额不足 */
		const BalanceNotEnough = Balance <= 0 || Balance < totalBet;

		//不用檢查串關的投注選項數量，如果不夠，在crossBetting就會轉到CannotBetting去展示，根本不會出現這個模塊

		//不能投注  1.沒輸入金額  2.餘額不足  3.金額未達上下限
		const CanNotBet = NOBet || BalanceNotEnough || Amounterror;

		//是否有串關獎勵
		let hasComboBonus = false;
		//只有串投才有串關獎勵，系統混合沒有
		if (BetActiveType == 2 && BetInfoData && BetInfoData.BetSettings && BetInfoData.BetSettings.length > 0) {
			hasComboBonus = BetInfoData.BetSettings.filter((bs) => bs.HasComboBonus).length > 0;
		}

		let comboBonusExtraMoney = 0; //串關獎勵額外盈利
		if (hasComboBonus) {
			//額外盈利 = 投注額 x (EstimatedPayoutRate - OriginEstimatedPayoutRate)
			BetInfoData.BetSettings.map((item, index) => {
				if (item.HasComboBonus) {
					comboBonusExtraMoney =
						comboBonusExtraMoney +
						BetAmountvallist[index] * (item.EstimatedPayoutRate - item.OriginEstimatedPayoutRate);
				}
			});
		}

		return (
			<div className="Bottom-flex">
				<div className="total-amount">
					<label className="gray">总投注额</label>
					<b>￥{totalBet != 0 ? Number(totalBet).toFixed(2) : 0}</b>
				</div>
				{hasComboBonus && (
					<div className="total-amount">
						<label className="gray">额外赢利</label>
						<b>￥{comboBonusExtraMoney > 0 ? Number(comboBonusExtraMoney).toFixed(2) : 0}</b>
					</div>
				)}
				<div className="total-amount">
					<label className="gray">可赢金额</label>
					<b>￥{this.sum(EstimatedPayoutRatelist).toFixed(2)}</b>
				</div>
				<div className="BetingBtn">
					{BetActiveType == 1 ? (
						<button
							className="Btb-left"
							onClick={() => {
								this.props.betCart_setIsComboBet(true, this.props.Vendor.configs.VendorName);
								this.props.CloseBottomSheet();
							}}
						>
							+串
						</button>
					) : (
						<button
							className="Btn-left"
							onClick={() => {
								this.props.betCart_setIsComboBet(false, this.props.Vendor.configs.VendorName);
								this.props.RemoveBetCart();
								// Pushgtagdata(`Game Feature`, 'Click', 'Clear_BetCart_SB2.0');
							}}
						>
							全部清除
						</button>
					)}

					<button
						className="Btn-right"
						style={{
							color: CanNotBet ? '#cccccc' : '#ffffff',
							backgroundColor: CanNotBet ? '#efeff4' : '#00a6ff'
						}}
						onClick={() => {
							if (NOBet) {
								Toast.error('请输入金额后再进行投注');
								return;
							}
							if (BalanceNotEnough) {
								Toast.error('您的余额不足，请充值后再进行投注');
								return;
							}
							if (Amounterror) {
								Toast.error('请输入正确的投注金额');
								return;
							}

							this.props.StartBetting(BetInfoData, BetAmountvallist, ActiveInput, FreeBetTokenList);

							// Pushgtagdata(`BetCart`, 'Submit', 'Placebet');
						}}
					>
						<big>投注</big>
					</button>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
	betCart_setIsComboBet: (isComboBet, vendorName) => ACTION_BetCart_setIsComboBet(isComboBet, vendorName)
};

export default connect(mapStateToProps, mapDispatchToProps)(Bettotalamount);

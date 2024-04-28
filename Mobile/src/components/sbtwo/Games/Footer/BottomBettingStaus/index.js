/* ************* 投注状态 投注中 - 投注成功 - 投注失败************** */
import React from 'react';
import { ReactSVG } from '$SBTWO/ReactSVG';
import ComboBonusModal from '$SBTWO/ComboBonusModal/';
import { ChangeSvg } from '$SBTWOLIB/js/util';
import { numberWithCommas } from '../BettingDataCheck';

class Betstatus extends React.Component {
	state = {
		showgift: false
	};
	render() {
		const {
			BettingList,
			BetActiveType,
		} = this.props;

		//投注結果標示模塊
		const HighlightBetBlock = (props) => {
			return <div
				className={props.extraClass ? 'CantPlay ' + props.extraClass : 'CantPlay '}
				style={{ borderRadius: '10px' }}
			>
				<p>{props.msg}</p>
			</div>
		}

		const HighlightErrBetBlock = (props) => {
			return <div
				className={props.extraClass ? 'CantPlay ' + props.extraClass : 'CantPlay '}
				style={{ borderRadius: '10px' }}
			>
				<div className="highlightErrWrap">
						<div className="highlightErrTitle">
							<div className="alert-circle whiteCircle">!</div>
							<div style={{ marginLeft: "8px", fontSize: "14px"}}>
								{props.msg}
							</div>
						</div>

					{props.BetActiveType == 1 && (
						<div className="highlightErrStr">
							因提交此注单时网络异常，<br />请到投注记录确认注单状态或联系客服。
						</div>
					)}
				</div>
			</div>
		}

		//單注才有的數據
		let SingleBetDataArray = [];

		//串關才有的數據
		let ComobBetDataArray = [];
		let hasComboBonus = false; //是否有串關獎勵
		let comboBonusExtraMoney = 0; //串關獎勵額外盈利

		let Selections = []; //投注選項 用於展示
		let totalBet = 0; //總投注額
		let totalWin = 0; //總可贏金額


		//單注
		if (BetActiveType == 1) {
			BettingList.map((bettingObj) => {

				//計算單注相關金額
				const betSetting = bettingObj.betInfo.BetSettings;
				//是否負數盤
				const IsMinusOdds = betSetting ? betSetting.IsMinusOdds : false;
				const BetAmount = bettingObj.amount
				/* 實際投注金額  金额统一乘 负数盘比例（RealBetAmountRate），如果不是负数盘 比例返回的是 （1）  所以统一都乘 RealBetAmountRate */
				const RealBetAmount = betSetting
					? Number(Number(BetAmount) * Number(betSetting.RealBetAmountRate)).toFixed(2)
					: 0;
				//可贏金額 (EstimatedPayoutRate有針對負數盤做調整，所以還是用BetAmount去乘，不是用RealBetAmount)
				const CanWinAmount = betSetting
					? Number(Number(BetAmount) * Number(betSetting.EstimatedPayoutRate)).toFixed(2)
					: 0;

				totalBet = totalBet + Number(RealBetAmount);
				totalWin = totalWin + Number(CanWinAmount);

				SingleBetDataArray.push({
					IsMinusOdds,
					BetAmount,
					RealBetAmount,
					CanWinAmount,
					//增加字段用於展示 投注狀態
					betResultStatus:bettingObj.betResultStatus,
					errorMsg:bettingObj.errorMsg
				});

				//合併selection，用於展示
				Selections.push(bettingObj.betInfo.Selections);
			});
		} else {
			//串關
			//Selections都一樣 只取第一個BetInfo的Selections
			Selections = BettingList[0].betInfo.Selections;

			//只有串投才有串關獎勵，系統混合沒有
			if (BetActiveType == 2) {
				hasComboBonus = BettingList.filter(b => b.betInfo.HasComboBonus).length > 0;
			}

			BettingList.map((bettingObj,index) => {
				const binfo = bettingObj.betInfo;
				let item = null;
				if (BetActiveType == 2) {
					item = binfo.BetSettings.find(s => s.ComboType == bettingObj.comboType);
				} else {
					item = binfo.SystemParlayBetSettings.find(s => s.ComboType == bettingObj.comboType);
				}

				console.log('====betInfo', JSON.parse(JSON.stringify(item)));

				const BetAmount = bettingObj.amount;
				const CanWinAmount = BetAmount * Number(item.EstimatedPayoutRate);
				const TotalBetAmount = BetAmount * item.ComboCount;


				totalBet = totalBet + Number(TotalBetAmount);
				totalWin = totalWin + Number(CanWinAmount);

				ComobBetDataArray.push({BetAmount,CanWinAmount,BetSetting: item});

				if (item.HasComboBonus) {
					//額外盈利 = 投注額 x (EstimatedPayoutRate - OriginEstimatedPayoutRate)
					comboBonusExtraMoney = comboBonusExtraMoney + (BetAmount * (item.EstimatedPayoutRate - item.OriginEstimatedPayoutRate));
				}
			})
		}

		return (
			<div className="Betlist" style={{ paddingTop: '30px' }}>
				{(Selections && Selections.length > 0) ? (
				<ul>
					{Selections.map((item, index) => {

						const SingleBetData = SingleBetDataArray[index]; //單注數據

						return (
							<li key={index} className="item">
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
										<b className="blue">
											@<span
											dangerouslySetInnerHTML={{
												__html: ChangeSvg(item.DisplayOdds)
											}}
											className="NumberBet"
										/>
										</b>
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
									{/* 投注金額框 只適用於單投 */}
									{BetActiveType == 1 && (
										<div className="rdpvsname">
											<label className="gray">投注额：</label>
											<b>￥{SingleBetData.BetAmount}</b>
										</div>
									)}
								</div>
								{/* 负数盘 实际投注金额 */}
								{BetActiveType == 1 && SingleBetData.IsMinusOdds && (
									<div className="ActualBetAmount">
										<label>实际投注￥</label>
										<span>{numberWithCommas(SingleBetData.RealBetAmount)}</span>
									</div>
								)}
								{BetActiveType == 1 && (
									<p className="light-gray flex-box">
										<small>
											可赢金额：￥{SingleBetData.CanWinAmount}
										</small>
									</p>
								)}
								{BetActiveType == 1 && (<>
									{/* 0未開始 1投注中 2成功 3失敗 4pending 5賠率變更(等待確認重試) */}
									{SingleBetData.betResultStatus === 2 && (
										<HighlightBetBlock msg={'投注成功'} extraClass="BetSuccess" />
									)}
									{SingleBetData.betResultStatus === 3 && (
										<HighlightBetBlock msg={SingleBetData.errorMsg || '投注失败'} />
									)}
									{SingleBetData.betResultStatus === 4 && (
										<HighlightBetBlock msg={'等待确认中'} extraClass="Pending" />
									)}
									{SingleBetData.betResultStatus === 5 && (
										<HighlightBetBlock msg={'赔率变更'} extraClass="OddsChanged" />
									)}
									{SingleBetData.betResultStatus === 6 && (
										<HighlightErrBetBlock msg={'网络异常'} extraClass="" BetActiveType={BetActiveType} />
									)}
								</>)}
							</li>
						);
					})}
				</ul>
				) : null}
				<div className="Bottom-btn">
					{BetActiveType == 2 && <b className="t">混合过关</b>}
					{BetActiveType == 3 && <b className="t">系统混合过关</b>}
					{(BetActiveType == 2 || BetActiveType == 3) &&
						BettingList.map((bettingObj, index) => {
							const ComboBetData = ComobBetDataArray[index]; //串投數據
							const item = ComboBetData.BetSetting;

							return (
								<div className="Bet-type" key={index}>
									<p>
										<span className="set-gray">
											{item.ComboTypeName} x {item.ComboCount}@{item.EstimatedPayoutRate}
										</span>
										{item.HasComboBonus && (
											<div className="gift" style={{ marginLeft: '10px' }}>
												{item.ComboBonusPercentage}%
												<ReactSVG
													src={'/img/svg/betting/gift.svg'}
													onClick={() => {
														this.setState({
															showgift: !this.state.showgift
														});
													}}
													style={{ marginLeft: 0 }}
												/>
											</div>
										)}
										<ComboBonusModal
											visible={this.state.showgift}
											onClose={() => {
												this.setState({
													showgift: false
												});
											}}
										/>
									</p>
									<div className="BetAmt">
										<span>
											<small className="light-gray">投注额：</small>
											<b>￥{Number(ComboBetData.BetAmount).toFixed(2)}</b>
										</span>
										<span>
											<small className="light-gray">可赢金额：</small>
											<b>
												￥{Number(ComboBetData.CanWinAmount).toFixed(2)}
											</b>
										</span>
									</div>
									{/* 0未開始 1投注中 2成功 3失敗 4pending 5賠率變更(等待確認重試) */}
									{bettingObj.betResultStatus === 2 && (
										<HighlightBetBlock msg={'投注成功'} extraClass="BetSuccess" />
									)}
									{bettingObj.betResultStatus === 3 && (
										<HighlightBetBlock msg={bettingObj.errorMsg || '投注失败'} />
									)}
									{bettingObj.betResultStatus === 4 && (
										<HighlightBetBlock msg={'等待确认中'} extraClass="Pending" />
									)}
									{bettingObj.betResultStatus === 5 && (
										<HighlightBetBlock msg={'赔率变更'} extraClass="OddsChanged" />
									)}
									{bettingObj.betResultStatus === 6 && (
										<HighlightErrBetBlock msg={'网络异常'} extraClass="" BetActiveType={BetActiveType} />
									)}
								</div>
							);
						})}
					<div className="Bet-amount">
						<span className="gray">
							总投注额：￥
							<big>
								<b className="black">{Number(totalBet).toFixed(2)}</b>
							</big>
						</span>
						{hasComboBonus && (
							<div className="total-amount">
								<label className="gray">额外赢利</label>
								<b>
									￥{(comboBonusExtraMoney > 0) ? (
									Number(comboBonusExtraMoney).toFixed(2)
								) : (
									0
								)}
								</b>
							</div>
						)}
						<span className="gray">
							可赢金额：￥<big>
								<b className="black">{Number(totalWin).toFixed(2)}</b>
							</big>
						</span>
					</div>
				</div>
			</div>
		);
	}
}
export default Betstatus;

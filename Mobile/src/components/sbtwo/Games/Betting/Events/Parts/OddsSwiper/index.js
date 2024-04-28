/* 可滑動 賠率區塊  */

import React from 'react';
import { dataIsEqual } from '$SBTWOLIB/js/util';
import LineColumn from './LineColumn';
import i18n from '$SBTWOLIB/vendor/vendori18n';

class OddsSwiper extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	//優化效能：只有指定的prop變化時才要重新渲染
	shouldComponentUpdate(nextProps, nextState) {
		const thisPropLines = this.props.EventData ? this.props.EventData.Lines : null;
		const nextPropLines = nextProps.EventData ? nextProps.EventData.Lines : null;
		const thisPropEventId = this.props.EventData ? this.props.EventData.EventId : null;
		const nextPropEventId = nextProps.EventData ? nextProps.EventData.EventId : null;
		return (
			JSON.stringify(thisPropLines) !== JSON.stringify(nextPropLines)
			|| this.props.OddsUpData.Events[thisPropEventId] !== nextProps.OddsUpData.Events[nextPropEventId]
			|| this.props.OddsDownData.Events[thisPropEventId] !== nextProps.OddsDownData.Events[nextPropEventId]
		);
	}

	render() {
		const { Vendor, EventData, OddsUpData, OddsDownData, ClickOdds } = this.props;
		//console.log('===OddsSwiper rendered', EventData ? EventData.EventId : 'NULL Event');
		//投注線兩個一組
		let pairedLines = [];
		if (EventData && EventData.Lines && EventData.Lines.length > 0) {
			//判斷投注線有哪些種類的 periodId 1全場 2上半 3下半
			let PeriodIds = [];
			EventData.Lines.map((d, n) => {
				if ([1,2,3].indexOf(d.PeriodId) > -1) {
					PeriodIds.push(d.PeriodId);
				}
			});
			const Periodlist = [ ...new Set(PeriodIds) ];
			Periodlist.map((periodId) => {
				//目前固定左讓球右大小，後面可能需要按體育類型去區分
				let LeftLine = null;
				let RightLine = null;
				const LeftLines = EventData.Lines.filter((l) => l.PeriodId === periodId && l.BetTypeName === i18n.HANDICAP);
				if (LeftLines && LeftLines.length > 0) {
					LeftLine = LeftLines[0];
				}
				const RightLines = EventData.Lines.filter((l) => l.PeriodId === periodId && l.BetTypeName === i18n.BIGSMALL);
				if (RightLines && RightLines.length > 0) {
					RightLine = RightLines[0];
				}

				const PairId = (LeftLine ? LeftLine.LineId : '') + '_' + (RightLine ? RightLine.LineId : '');
				pairedLines.push({ LeftLine, RightLine, PairId, PeriodId: periodId });
			});
		}
		return (
			<div className="table">
				{pairedLines.length > 0 ? (
					/* 只保留第一层 全场让球 全场大小 */
					pairedLines.splice(0, 1).map((pariedLineData, index) => {
						return (
							<div className="table-Lines" key={pariedLineData.PairId}>
								<LineColumn
									Vendor={Vendor}
									LineData={pariedLineData.LeftLine}
									LeftOrRight="LEFT"
									PeriodId={pariedLineData.PeriodId}
									/* 上升赔率 */
									OddsUpData={OddsUpData}
									/* 下降赔率 */
									OddsDownData={OddsDownData}
									/* 點擊賠率 */
									ClickOdds={ClickOdds}
								/>
								<LineColumn
									Vendor={Vendor}
									LineData={pariedLineData.RightLine}
									LeftOrRight="RIGHT"
									PeriodId={pariedLineData.PeriodId}
									/* 上升赔率 */
									OddsUpData={OddsUpData}
									/* 下降赔率 */
									OddsDownData={OddsDownData}
									/* 點擊賠率 */
									ClickOdds={ClickOdds}
								/>
							</div>
						);
					})
				) : (
					//沒數據時放一個默認的
					<ul className="NullList">
						<li className="bgw">全场让球</li>
						<li className="bgw">全场大小</li>
						{[ ...Array(4) ].map((item, index) => {
							return <li key={index}>-</li>;
						})}
					</ul>
				)}
			</div>
		);
	}
}

export default OddsSwiper;

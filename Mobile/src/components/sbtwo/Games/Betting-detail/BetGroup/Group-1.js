/* 让球 */
import React from 'react';
import ReactIMG from '$SBTWO/ReactIMG';

export default class _BetGroup1 extends React.Component {
	state = {};

	render() {
		const { Selections, LineId, OddsUpData, OddsDownData } = this.props;
		return (
			<ul>
				{Selections.map((item, index) => {
					let Upstatus =
						OddsUpData != ''
							? OddsUpData.some(function(items) {
									if (
										/* 	item.EventId === items.EventId && */
										LineId == items.LineId &&
										item.SelectionId == items.SelectionId
									) {
										return true;
									}
								})
							: false;
					let Downstatus =
						OddsDownData != ''
							? OddsDownData.some(function(items) {
									if (
										/* i.EventId === items.EventId && */
										LineId == items.LineId &&
										item.SelectionId == items.SelectionId
									) {
										return true;
									}
								})
							: false;
					return (
						<li
							key={index}
							onClick={() => {
								this.props.PushBetCart(item,1);
							}}
						>
							<span>{item.SelectionName}</span>
							<b className={Downstatus ? 'green' : Upstatus ? 'red' : 'black'}>
								{item.Odds}
								{Downstatus ? (
									<ReactIMG src="/img/svg/betting/round-down.svg" />
								) : Upstatus ? (
									<ReactIMG src="/img/svg/betting/round-up.svg" />
								) : (
									''
								)}
							</b>
						</li>
					);
				})}
			</ul>
		);
	}
}

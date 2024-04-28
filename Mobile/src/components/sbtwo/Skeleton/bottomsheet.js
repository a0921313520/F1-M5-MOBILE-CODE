import React from "react";
/* 
	投注区域动作板块骨架屏
*/
export default class BottomsheetSkeleton extends React.PureComponent {
	render() {
		return (
			<div className="Betting-skeleton-data-detail">
				<ul className="Betlist">
					{[ ...Array(2) ].map((i, k) => {
						return <li key={k} />;
					})}
				</ul>
				<div className="BetingBtn">
					<button className="left" />
					<button className="right">
						<big />
					</button>
				</div>
			</div>
		);
	}
}

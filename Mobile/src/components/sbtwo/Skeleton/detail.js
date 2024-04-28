import React from "react";
/* 
	投注详情页骨架屏
*/
export default class Skeletondetail extends React.PureComponent {
	render() {
		return (
			<div className="Betting-skeleton-detail">
				<div className="skeleton-header" />
				<div className="skeleton-header-nav">
					{[ ...Array(4) ].map((i, k) => {
						return <div className="skeleton-header-nav-list" key={k} />;
					})}
				</div>

				<div className="skeleton-content">
					<div className="one skeleton-games-list" />
					<div className="skeleton-games-list" />
					<div className="skeleton-games-list" />
				</div>
			</div>
		);
	}
}

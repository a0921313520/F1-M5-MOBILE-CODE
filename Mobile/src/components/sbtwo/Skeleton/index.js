import React from "react";
/* 
	投注主页骨架屏
*/
export default class Skeleton extends React.PureComponent {
	render() {
		return (
			<div className="Betting-skeleton">
				{/* <div>
					<div className="skeleton-header">
						<ul>
							<li />
							<li />
							<li />
							<li />
						</ul>
					</div>
					<div className="skeleton-header-nav">
						{[ ...Array(3) ].map((i, k) => {
							return <div className="skeleton-header-nav-list" key={k} />;
						})}
						<div className="skeleton-header-nav-list TOPYuan" />
					</div>
				</div> */}

				<div className="skeleton-games-menu">
					<div className="Yuan" />
					<div className="Kuai" />
				</div>
				{[ ...Array(6) ].map((i, k) => {
					return (
						<div className="skeleton-games-list" key={k}>
							<div className="content-list">
								<div className="Yuan" />
								<div className="Kuai" />
								<div className="Right">
									<div />
									<div />
								</div>
							</div>
							<div className="content-list">
								<div className="Yuan" />
								<div className="Kuai" />
								<div className="Right">
									<div />
									<div />
									<ul>
										<li />
										<li />
									</ul>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		);
	}
}

import { withBetterRouter } from '$SBTWOLIB/js/withBetterRouter';
import { ReactSVG } from '$SBTWO/ReactSVG';
import DetailHeader from '$SBTWO/Games/Betting-detail/Detail-Header';
import LazyImageForTeam from '$SBTWO/LazyLoad/LazyImageForTeam';
import Router from 'next/router';
import React from 'react';

class MiniEvent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			EventData: null
		};
	}

	componentDidMount() {
		const { Vendor, EventId, SportId } = this.props;
		//console.log('=== mini event mount',EventId);
		if (!EventId) {
			return;
		}

		this.eventPollingKey = Vendor.getEventDetailPolling(
			(pr) => {
				//console.log('=== mini event',pr);
				this.setState({ EventData: pr.NewData });
			},
			SportId,
			EventId,
			false,
			'MINI'
		); //指定 unique name = MINI 和詳情頁的polling區隔
	}

	componentWillUnmount() {
		//console.log('=== mini event unmount',this.props.EventId);
		this.props.Vendor.deletePolling(this.eventPollingKey);
	}

	Backdetail() {
		const { Vendor, SportId, EventId } = this.props;
		const { EventData } = this.state;
		const { query } = this.props.router;
		Router.push(
			`/sbtwo${Vendor.configs
				.VendorPage}/detail?sid=${SportId}&eid=${EventId}&lid=${EventData.LeagueId}&OE=${EventData.IsOutRightEvent}&open=${query.miniShowType}`
		);
	}

	render() {
		const { Vendor, CloseMini, ShowType, SportId, EventId } = this.props;
		const { EventData } = this.state;

		return EventData ? (
			<div className="Betting-list-detail home-betting-thumb-wrap">
				<div className="detail-wrap">
					<div
						className="Clickevent"
						onClick={() => {
							this.Backdetail();
						}}
					>
						返回
						<ReactSVG className="back-icon" src="/img/svg/RightArrow.svg" />
					</div>
					<DetailHeader thumbStatus={true} Vendor={Vendor} EventData={EventData} defaultShowType={ShowType} />
				</div>
				<div
					className="betting-list-wrap"
					onClick={() => {
						this.Backdetail();
					}}
				>
					<div>
						<LazyImageForTeam Vendor={Vendor} TeamId={EventData.HomeTeamId} IconUrl={EventData.HomeIconUrl} />
						<p className="team-name">{EventData.HomeTeamName}</p>
						<span
							className={
								'pk-number' +
								(EventData.HomeScore && parseInt(EventData.HomeScore) > 0 ? ' notZero' : '')
							}
						>
							{EventData.IsRB ? EventData.HomeScore : ''}
						</span>
					</div>
					<div>
						<LazyImageForTeam Vendor={Vendor} TeamId={EventData.AwayTeamId} IconUrl={EventData.AwayIconUrl} />
						<p className="team-name">{EventData.AwayTeamName}</p>
						<span
							className={
								'pk-number' +
								(EventData.AwayScore && parseInt(EventData.AwayScore) > 0 ? ' notZero' : '')
							}
						>
							{EventData.IsRB ? EventData.AwayScore : ''}
						</span>
					</div>
				</div>
				<ReactSVG
					src="/img/svg/close.svg"
					className="home-thumb-close-icon"
					onClick={() => {
						CloseMini();
					}}
				/>
			</div>
		) : null;
	}
}

export default withBetterRouter(MiniEvent);

import React from "react";
import Toast from '$SBTWO/Toast';
import Modal from "$SBTWO/Modal";
import { ReactSVG } from "$SBTWO/ReactSVG";
import { fetchRequest } from "$SBTWOLIB/SportRequest";
import { ApiPort } from "$SBTWOLIB/SPORTAPI";
import { Cookie } from "$SBTWOLIB/js/Helper";
import LazyImageForLeague from "$SBTWO/LazyLoad/LazyImageForLeague";
import LazyImageForTeam from "$SBTWO/LazyLoad/LazyImageForTeam";
import HostConfig from "@/server/Host.config";
import Router from "next/router";

class RecommendRace extends React.Component {
	render() {
		const {Vendor} = this.props;
		return (
			this.props.hotEvents.length ? <Modal
				closable={false}
				className="recommend-race-modal Betting-list-detail"
				visible={this.props.visible}
				onCancel={this.props.onClose}
			>
				{this.props.hotEvents.map((v) => (
					<div key={v.EventId} className="recomend-wrapper Betting-type" onClick={() => {
						Router.push(
							`/sbtwo${Vendor.configs.VendorPage}/detail?sid=${v.SportId}&eid=${v.EventId}&lid=${v.LeagueId}`
						);
						// Pushgtagdata(`Game Nav`, 'Click', `HotMatches_SB2.0`);
					}}>
						<div className="betting-item">
							<div className="betting-team-name">
								<LazyImageForLeague Vendor={Vendor} LeagueId={v.LeagueId} />
								<p>{v.LeagueName}</p>
							</div>
							<ul className="Betting-header-score">
								<li>
									<LazyImageForTeam Vendor={Vendor} TeamId={v.HomeTeamId} IconUrl={v.HomeIconUrl} />
									<p className="team-name">{v.HomeTeamName}</p>
								</li>
								<li>
									<p className="Game-team-pk">{v.getEventDateMoment().format('MM/DD HH:mm')}</p>
									<span>VS</span>
								</li>
								<li>
									<LazyImageForTeam Vendor={Vendor} TeamId={v.AwayTeamId} IconUrl={v.AwayIconUrl}/>
									<p className="team-name">{v.AwayTeamName}</p>
								</li>
							</ul>
						</div>
					</div>
				))}
				<p className="MINITXT">点击卡片查看更多投注</p>
				<ReactSVG className="recommend" src="/img/svg/close.svg" onClick={this.props.onClose} />
			</Modal> : null
		);
	}
}

export default RecommendRace;

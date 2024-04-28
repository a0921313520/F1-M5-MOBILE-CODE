/* 橫式/橫向 展示 球隊名 比分 紅牌   */

import React from 'react';
import LazyImageForTeam from '$SBTWO/LazyLoad/LazyImageForTeam';
import { dataIsEqual } from '$SBTWOLIB/js/util';
class TeamBlockHorizontal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		//指定要監控變化的prop
		this.MonitorPropsForHOME = [ 'IsRB', 'HomeTeamId', 'HomeTeamName', 'HomeScore', 'HomeRedCard' ];
		this.MonitorPropsForAWAY = [ 'IsRB', 'AwayTeamId', 'AwayTeamName', 'AwayScore', 'AwayRedCard' ];
	}
	//優化效能：只有指定的prop變化時才要重新渲染
	shouldComponentUpdate(nextProps, nextState) {
		if (this.props.Vendor !== nextProps.Vendor) {
			return true;
		}
		if (this.props.HomeOrAway !== nextProps.HomeOrAway) {
			return true;
		}
		return !dataIsEqual(this.props.EventData, nextProps.EventData, this['MonitorPropsFor' + this.props.HomeOrAway]);
	}

	render() {
		const { Vendor, EventData, HomeOrAway } = this.props;
		let TeamId, TeamName, Score, RedCard, WrapperClass, IconUrl;
		if (HomeOrAway === 'HOME') {
			TeamId = EventData.HomeTeamId;
			TeamName = EventData.HomeTeamName;
			Score = EventData.HomeScore;
			RedCard = EventData.HomeRedCard;
			WrapperClass = ' left-block';
			IconUrl = EventData.HomeIconUrl;
		} else if (HomeOrAway === 'AWAY') {
			TeamId = EventData.AwayTeamId;
			TeamName = EventData.AwayTeamName;
			Score = EventData.AwayScore;
			RedCard = EventData.AwayRedCard;
			WrapperClass = ' right-block';
			IconUrl = EventData.AwayIconUrl;
		}
		const HomeOrAwayIsOK = [ 'HOME', 'AWAY' ].indexOf(HomeOrAway) !== -1;
		return EventData && HomeOrAwayIsOK ? (
			<div className={'item' + WrapperClass}>
				<div className="team-and-redcard">
					<span className="Game-score-box">
							{EventData.IsRB && RedCard && parseInt(RedCard) > 0 ? (
								<span className="Game-score">{RedCard ?? 0}</span>
							) : null}
					</span>
					<div className="TeamName">
						<b>{TeamName}</b>
					</div>
					<LazyImageForTeam Vendor={Vendor} TeamId={TeamId} thisClassName="Game-logo" IconUrl={IconUrl} />
				</div>
				{/*比分*/}
				<b
					className="Number-black"
					style={{
						color: Score == 0 ? '#BCBEC3' : '#000000'
					}}
				>
					 {EventData.IsRB ? (Score ?? 0) : ''}
				</b>
			</div>
		) : null;
	}
}

export default TeamBlockHorizontal;

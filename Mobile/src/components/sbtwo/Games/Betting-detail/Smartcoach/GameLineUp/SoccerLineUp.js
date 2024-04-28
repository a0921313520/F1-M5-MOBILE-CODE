/*
 * @Author: Alan
 * @Date: 2021-06-17 14:37:08
 * @LastEditors: Alan
 * @LastEditTime: 2021-08-05 12:50:05
 * @Description: 球队阵容
 * @FilePath: \Fun88-Sport-Code2.0\components\Games\Betting-detail\Smartcoach\GameLineUp\SoccerLineUp.js
 */
import React, { Component } from 'react';
import LazyImageForTeam from '$SBTWO/LazyLoad/LazyImageForTeam';
import ReactIMG from '$SBTWO/ReactIMG';

export default class FootballField extends Component {
	constructor(props) {
		super(props);
		this.state = {
			home: props.home,
			away: props.away,
			homemodule: props.home_formation,
			awaymodule: props.away_formation
		};
	}

	render() {
		const { HomeTeamName, AwayTeamName, Vendor, HomeTeamId, AwayTeamId, HomeIconUrl, AwayIconUrl } = this.props;
		const { home, away, homemodule, awaymodule } = this.state;
		let checkHome = [];
		let checkAway = [];
		/* 为了识别三种足球阵式 eg:4-2-3-1  4-3-3   4-1-2-1-2  */
		let HomeLength = homemodule.split('-').length;
		let AwayLength = awaymodule.split('-').length;
		let hometype = HomeLength == 5 ? '0.2rem' : '0.2927rem';
		let awaytype = AwayLength == 4 ? '0.3rem' : AwayLength == 5 ? '0.18rem' : '0.5rem';
		return (
			<div className="FootballLineUp">
				<div className="LineUp">
					<div className="LineUpBg">
						<div className="Team Home">
							<div className="Module-Name">
								<div className="Name">
									<LazyImageForTeam Vendor={Vendor} TeamId={HomeTeamId} IconUrl={HomeIconUrl} />
									{HomeTeamName}
								</div>
								<p className="Module">{homemodule}</p>
							</div>
							{/* 主队 */}
							{home &&
								home.map((data, i) => {
									/* 过滤出 非替补队员 */
									let Datafilter = data.filter((item) => item.bench == 0);
									Datafilter != '' && checkHome.push(i);
									return (
										Datafilter != '' && (
											<div
												key={'h' + i}
												className={`TeamList ${i}`}
												style={{ padding: hometype }}
											>
												{Datafilter.map((d, j) => {
													return (
														<div key={'he' + j} className="line">
															<Ball d={d} team={'Home'} />
															<p className="name">{d.player_name}</p>
														</div>
													);
												})}
											</div>
										)
									);
								})}
						</div>
						{/* 客队 */}
						<div className="Team Away" style={{ paddingTop: '.1rem' }}>
							{away &&
								away.map((data, i) => {
									/* 过滤出 非替补队员 */
									let Datafilter = data.filter((item) => item.bench == 0);
									Datafilter != '' && checkAway.push(i);
									return (
										Datafilter != '' && (
											<div key={'a' + i} className="TeamList" style={{ padding: awaytype }}>
												{Datafilter.map((d, j) => {
													return (
														<div key={'ae' + j} className="line">
															<Ball d={d} team={'Away'} />
															<p className="name">{d.player_name}</p>
														</div>
													);
												})}
											</div>
										)
									);
								})}

							<div className="Module-Name">
								<div className="Name">
									<LazyImageForTeam Vendor={Vendor} TeamId={AwayTeamId} IconUrl={AwayIconUrl} />
									{AwayTeamName}
								</div>
								<p className="Module">{awaymodule}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

/* 球员 */
class Ball extends React.Component {
	render() {
		const { d, team } = this.props;
		const { red, yellow, sub_in, sub_out, goals } = d.stats;
		return (
			<div className="ball">
				{/* 进球 */}
				{goals.minutes && <ReactIMG src={'/img/smartcoach/goal.svg'} className="goal" />}
				{/* 球号 */}
				<div className={`name-number play${team}`}>
					<p className="number">{d.shirt_number}</p>
				</div>
				{/* 黄牌 */}
				{yellow.minute && <ReactIMG src={'/img/smartcoach/card-yellow.svg'} className="card" />}
				{/* 红牌 */}
				{red.minute && <ReactIMG src={'/img/smartcoach/card-red.svg'} className="card" />}
				{/* 上场 */}
				{sub_in.minute && <ReactIMG src={'/img/smartcoach/up.svg'} className="sub" />}
				{/* 下场 */}
				{sub_out.minute && <ReactIMG src={'/img/smartcoach/down.svg'} className="sub" />}
			</div>
		);
	}
}

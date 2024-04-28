/*
 * @Author: Alan
 * @Date: 2021-05-20 19:47:15
 * @LastEditors: Alan
 * @LastEditTime: 2021-08-24 10:25:08
 * @Description: 阵容部分 包含第三方足球动画插件和阵容情报列表数据
 * @FilePath: \Fun88-Sport-Code2.0\components\Games\Betting-detail\Smartcoach\GameLineUp\index.js
 */
import { stringify } from 'crypto-js/enc-base64';
import React, { Component } from 'react';
import SoccerLineUp from './SoccerLineUp';
import ReactIMG from '$SBTWO/ReactIMG';

class PrematchIntelligence extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { TeamLineUp, Vendor } = this.props;
		const {
			/* 主队名 */
			HomeTeamName,
			/* 客队名 */
			AwayTeamName,
			HomeTeamId,
			AwayTeamId,
			HomeIconUrl,
			AwayIconUrl,
		} = this.props.EventDetail;
		const { away_players, home_players, away_formation, home_formation } = TeamLineUp;

		/* 合并数组拿到所有替补队员 */
		let HomeSubstitute = []; //主队替补
		let AwaySubstitute = []; //客队替补
		for (let i = 0; i < away_players.length; i++) {
			AwaySubstitute = AwaySubstitute.concat(away_players[i]);
		}
		for (let i = 0; i < home_players.length; i++) {
			HomeSubstitute = HomeSubstitute.concat(home_players[i]);
		}
		console.log('%c队伍阵容', 'color:#009688;', TeamLineUp);
		return (
			<div className="PrematchIntelligence">
				{/* <div className="Note">替补、进球和红黄牌信息，仅在即时情报中提供</div> */}
				<div className="Animationbox">
					<SoccerLineUp
						/* 主队阵容 */
						home={home_players}
						/* 客队阵容 */
						away={away_players}
						/* 主队名 */
						HomeTeamName={HomeTeamName}
						/* 客队名 */
						AwayTeamName={AwayTeamName}
						/* 阵容格式 数字 */
						away_formation={away_formation}
						home_formation={home_formation}
						Vendor={Vendor}
						HomeTeamId={HomeTeamId}
						AwayTeamId={AwayTeamId}
						HomeIconUrl={HomeIconUrl}
						AwayIconUrl={AwayIconUrl}
					/>
				</div>

				<div className="TeamDatabox">
					<span className="Datatitle">替补</span>
					<div className="Teamshow">
						<div className="left item">
							{HomeSubstitute != '' &&
								HomeSubstitute.filter((item) => item.bench == 1).map((data, key) => {
									const { player_name, shirt_number, stats } = data;
									const { sub_in, sub_out } = stats;
									return (
										<div className="list left" key={key}>
											<span className="number">
												{sub_in.minute && <span>{sub_in.minute}`</span>}
												{sub_in.minute && <ReactIMG src={'/img/smartcoach/up.svg'} />}
												{sub_out.minute && <span>{sub_out.minute}`</span>}
												{sub_out.minute && <ReactIMG src={'/img/smartcoach/down.svg'} />}
											</span>
											<span className="name">{player_name}</span>
										</div>
									);
								})}
						</div>
						<div className="right item">
							{AwaySubstitute != '' &&
								AwaySubstitute.filter((item) => item.bench == 1).map((data, key) => {
									const { player_name, shirt_number, stats } = data;
									const { sub_in, sub_out } = stats;
									return (
										<div className="list right" key={key}>
											<span className="number">
												{sub_in.minute && <span>{sub_in.minute}`</span>}
												{sub_in.minute && <ReactIMG src={'/img/smartcoach/up.svg'} />}
												{sub_out.minute && <span>{sub_out.minute}`</span>}
												{sub_out.minute && <ReactIMG src={'/img/smartcoach/down.svg'} />}
											</span>
											<span className="name">{player_name}</span>
										</div>
									);
								})}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default PrematchIntelligence;

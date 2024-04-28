/*
 * @Author: Alan
 * @Date: 2021-05-19 18:44:23
 * @LastEditors: Alan
 * @LastEditTime: 2021-07-16 01:40:10
 * @Description: 赛程-足球数据统计分析
 * @FilePath: \Fun88-Sport-Code2.0\components\Games\Betting-detail\Smartcoach\GameTimeline\StatisticalAnalysisData.js
 */
import React, { Component } from 'react';
import ReactIMG from '$SBTWO/ReactIMG';

class StatisticalAnalysisData extends Component {
	constructor(props) {
		super(props);
		this.state = {
			Tabactive: 0
		};
	}

	toPercent(point) {
		var str = Number(point * 100).toFixed(1);
		str += '%';
		return str;
	}
	render() {
		const { TimelineSocketCartogramData } = this.props;
		const {
			/* 黄牌 */
			yellow_card,
			/* 红牌 */
			red_card,
			/* 危险进攻 */
			dangerous_attacks,
			/* 攻击 */
			attacks,
			/* 角球 */
			corner,
			/* 控球率 */
			possession,
			/* 射正球门 */
			shots_on_target,
			/* 射偏球门 */
			shots_off_target
		} = TimelineSocketCartogramData.statistics;
		return (
			<div className="StatisticalAnalysisData">
				<div className="box" style={{ filter: `grayscale(${TimelineSocketCartogramData !== '' ? 0 : 1})` }}>
					{/* ---------上部环形指标---------- */}
					<div className="Top">
						<div className="item left">
							<label>进攻</label>
							<div className="Circularity">
								<div>{attacks[0]}</div>
								<div className="Annulus" ref={(e) => (this._container = e)}>
									<div className="status-1" style={{ transform: `rotate(${attacks[0]}deg) ` }} />
									<div className="status-2" style={{ transform: `rotate(${attacks[1]}deg) ` }} />
									<div className="pre" />
								</div>
								<div>{attacks[1]}</div>
							</div>
						</div>
						<div className="item center">
							<label>危险进攻</label>
							<div className="Circularity">
								<div>{dangerous_attacks[0]}</div>
								<div className="Annulus" ref={(e) => (this._container = e)}>
									<div
										className="status-1"
										style={{ transform: `rotate(${dangerous_attacks[0]}deg) ` }}
									/>
									<div
										className="status-2"
										style={{ transform: `rotate(${dangerous_attacks[1]}deg) ` }}
									/>
									<div className="pre" />
								</div>
								<div>{dangerous_attacks[1]}</div>
							</div>
						</div>
						<div className="item right">
							<label>控球率</label>
							<div className="Circularity">
								<div>{possession[0]}</div>
								<div className="Annulus" ref={(e) => (this._container = e)}>
									<div className="status-1" style={{ transform: `rotate(${possession[0]}deg) ` }} />
									<div className="status-2" style={{ transform: `rotate(${possession[1]}deg) ` }} />
									<div className="pre" />
								</div>
								<div>{possession[1]}</div>
							</div>
						</div>
					</div>
					{/* -----------下部细小指标--------------- */}
					<div className="Bottom">
						<div className="item left">
							<div className="Top">
								<span>
									<ReactIMG src={`/img/svg/smartcoach/icon.svg`} />
								</span>
								<span className="orgColor" />
								<span className="redColor" />
							</div>
							<div className="Bottom">
								<span>{corner[0]}</span>
								<span>{yellow_card[0]}</span>
								<span>{red_card[0]}</span>
							</div>
						</div>
						<div className="item center">
							<div>
								<label>射正球门</label>
								<div className="ProgressData">
									<div>{shots_on_target[0]}</div>
									<div className="ProgressBar">
										<div
											className="Progress"
											style={{
												width: `${this.toPercent(
													shots_on_target[0] / (shots_on_target[0] + shots_on_target[1])
												)}`
											}}
										/>
									</div>
									<div>{shots_on_target[1]}</div>
								</div>
							</div>
							<div>
								<label>射偏球门</label>
								<div className="ProgressData">
									<div>{shots_off_target[0]}</div>
									<div className="ProgressBar">
										<div
											className="Progress"
											style={{
												width: `${this.toPercent(
													shots_off_target[0] / (shots_off_target[0] + shots_off_target[1])
												)}`
											}}
										/>
									</div>
									<div>{shots_off_target[1]}</div>
								</div>
							</div>
						</div>
						<div className="item right">
							<div className="Top">
								<span className="redColor" />
								<span className="orgColor" />
								<span>
									<ReactIMG src={`/img/svg/smartcoach/icon.svg`} />
								</span>
							</div>
							<div className="Bottom">
								<span>{red_card[1]}</span>
								<span>{yellow_card[1]}</span>
								<span>{corner[1]}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default StatisticalAnalysisData;

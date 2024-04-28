/*
 * @Author: Alan
 * @Date: 2021-05-19 18:41:30
 * @LastEditors: Alan
 * @LastEditTime: 2021-07-14 21:34:32
 * @Description: 赛程
 * @FilePath: \Fun88-Sport-Code2.0\components\Games\Betting-detail\Smartcoach\GameTimeline\index.js
 */
import React, { Component } from 'react';
import { ReactSVG } from '$SBTWO/ReactSVG';
import StatisticalAnalysisData from './StatisticalAnalysisData';
import GameInsights from '../GameInsights';
class Schedule extends Component {
	constructor(props) {
		super(props);
		this.state = {
			Tabactive: 0
		};
	}

	render() {
		const { type, TimelineSocketCartogramData, TimelineSockeMatchreSultData, Vendor, EventDetail } = this.props;
		console.log('%c赛况-统计图', 'color:#009688;', TimelineSocketCartogramData ? TimelineSocketCartogramData : '======>没有数据');
		return (
			<div className="Schedule">
				<div className="box">
					<span className="Datatitle">数据</span>
					<StatisticalAnalysisData
						EventDetail={EventDetail}
						Vendor={Vendor}
						TimelineSocketCartogramData={TimelineSocketCartogramData.data}
					/>
					<span className="Datatitle">赛况</span>
					<GameInsights
						type={type}
						EventDetail={EventDetail}
						Vendor={Vendor}
						TimelineSockeMatchreSultData={TimelineSockeMatchreSultData}
					/>
				</div>
			</div>
		);
	}
}

export default Schedule;

/* 橫式/橫向 展示 比賽  */

import React from 'react';
import { dataIsEqual } from '$SBTWOLIB/js/util';
import TimeBlock from '../TimeBlock';
import FavouriteStar from '../FavouriteStar';
import LinesCountHorizontal from '../LinesCountHorizontal';
import CornerCount from '../CornerCount';
import TeamBlockHorizontal from '../TeamBlockHorizontal';
import OddsHorizontal from '../OddsHorizontal';
class HorizontalEvent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	//優化效能：只有指定的prop變化時才要重新渲染
	shouldComponentUpdate(nextProps, nextState) {
		const thisPropEventId = this.props.EventData ? this.props.EventData.EventId : null;
		const nextPropEventId = nextProps.EventData ? nextProps.EventData.EventId : null;
		return (
			JSON.stringify(this.props.EventData) !== JSON.stringify(nextProps.EventData)
			|| this.props.OddsUpData.Events[thisPropEventId] !== nextProps.OddsUpData.Events[nextPropEventId]
			|| this.props.OddsDownData.Events[thisPropEventId] !== nextProps.OddsDownData.Events[nextPropEventId]
		);
	}

	render() {
		const { Vendor, EventData, ToggleFavourite, ToSportsDetails, OddsUpData, OddsDownData, ClickOdds } = this.props;
		//console.log('===Event rendered', EventData ? EventData.EventId : 'NULL Event');
		return (
			<div className="Games-Content horizontal">
				<div className="horizontal-row row1">
					<div className="item left-block">
						{/* 時間 直播等圖示 */}
						<TimeBlock EventData={EventData} />
						{/* 關注(收藏)星 */}
						<FavouriteStar EventData={EventData} ToggleFavourite={ToggleFavourite} />
					</div>
					<div className="item Numberset center-block">
						{/* 角球 總數 */}
						<CornerCount EventData={EventData} />
					</div>
					<div className="item Numberset right-block"
							 onClick={() => {
								 ToSportsDetails(Vendor, EventData);
								//  Pushgtagdata(`Odds`, 'Submit', `Odds_mainpage_horizontal`);
							 }}
					>
						{/* 投注線(玩法)總數 */}
						<LinesCountHorizontal EventData={EventData} />
					</div>
				</div>
				<div
					className="horizontal-row row2"
					onClick={() => {
                        ToSportsDetails(Vendor, EventData);
                        // Pushgtagdata(`Odds`, 'Submit', `Odds_mainpage_horizontal`);
					}}
				>
					{/* 主队 球隊名 比分 紅牌 */}
					<TeamBlockHorizontal Vendor={Vendor} EventData={EventData} HomeOrAway="HOME" />
					<div className="item center-block">
						{/* 中間的 vs 或 - 字樣 */}
						{EventData &&
							(EventData.IsRB ? (
								<span className="dash-word">-</span>
							) : (
								<span className="vs-word">VS</span>
							))}
					</div>
					{/* 客队 球隊名 比分 紅牌 */}
					<TeamBlockHorizontal Vendor={Vendor} EventData={EventData} HomeOrAway="AWAY" />
				</div>
				{/* 版本迭代 盘口横向模式下 隐藏此处 */}
				{/* 全場讓球 我又被加回來拉 */}
				<div className="horizontal-row row3">
					<OddsHorizontal
						Vendor={Vendor}
						//盘口数据
						EventData={EventData}
						//上升赔率
						OddsUpData={OddsUpData}
						//下降赔率
						OddsDownData={OddsDownData}
						//點擊賠率
						ClickOdds={ClickOdds}
					/>
				</div>
			</div>
		);
	}
}

export default HorizontalEvent;

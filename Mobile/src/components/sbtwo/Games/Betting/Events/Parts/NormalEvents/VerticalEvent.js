/* 直式/縱向 展示 比賽 (默認用這個) */

import React from "react";
import { dataIsEqual } from "$SBTWOLIB/js/util";
import TimeBlock from "../TimeBlock";
import FavouriteStar from "../FavouriteStar";
import LinesCount from "../LinesCount";
import CornerCount from "../CornerCount";
import TeamBlock from "../TeamBlock";
import OddsSwiper from "../OddsSwiper";

class VerticalEvent extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
    }
  }

  componentDidMount () {
  }

  componentWillUnmount() {
  }

  //優化效能：只有指定的prop變化時才要重新渲染
  shouldComponentUpdate(nextProps, nextState) {
    const thisPropEventId = this.props.EventData ? this.props.EventData.EventId : null;
    const nextPropEventId = nextProps.EventData ? nextProps.EventData.EventId : null;

    return (JSON.stringify(this.props.EventData) !== JSON.stringify(nextProps.EventData))
      || this.props.OddsUpData.Events[thisPropEventId] !== nextProps.OddsUpData.Events[nextPropEventId]
      || this.props.OddsDownData.Events[thisPropEventId] !== nextProps.OddsDownData.Events[nextPropEventId]
  }

  render () {
    const {Vendor, EventData, ToggleFavourite, ToSportsDetails, OddsUpData, OddsDownData, ClickOdds} = this.props;

    //console.log('===Event rendered', EventData ? EventData.EventId : 'NULL Event');

    return <div className="Games-Content">
      <div className="row header-group">
        <div className="item col-1 row-1">
          <div className="Games-list-team">
            {/* 時間 直播等圖示 */}
            <TimeBlock EventData={EventData}/>
            {/* 關注(收藏)星 */}
            <FavouriteStar EventData={EventData} ToggleFavourite={ToggleFavourite} />
          </div>
        </div>
        <div className="item col-5 row-1 Numberset">
          {/* 投注線(玩法)總數 */}
          <LinesCount EventData={EventData}/>
        </div>
        <div className="item col-5 row-1 Numberset">
          {/* 角球 總數 */}
          <CornerCount EventData={EventData}/>
        </div>
        <div className="item col-2 row-2">
          {/* 场赛swiper滑动 赔率 */}
          <div className="Game-swiper">
            <OddsSwiper
              Vendor={Vendor}
              /* 盘口数据 */
              EventData={EventData}
              /* 上升赔率 */
              OddsUpData={OddsUpData}
              /* 下降赔率 */
              OddsDownData={OddsDownData}
              /* 點擊賠率 */
              ClickOdds={ClickOdds}
            />
          </div>
        </div>
      </div>
      {/* 主队 球隊名 比分 紅牌 */}
      <TeamBlock
        Vendor={Vendor}
        EventData={EventData}
        ToSportsDetails={ToSportsDetails}
        HomeOrAway="HOME"
      />
      {/* 客队 球隊名 比分 紅牌 */}
      <TeamBlock
        Vendor={Vendor}
        EventData={EventData}
        ToSportsDetails={ToSportsDetails}
        HomeOrAway="AWAY"
      />
    </div>
  }
}

export default VerticalEvent

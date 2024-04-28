/* 全場波膽 展示比賽 */

import React from "react";
import TimeBlock from "../TimeBlock";
import FavouriteStar from "../FavouriteStar";
import LinesCount from "../LinesCount";
import CornerCount from "../CornerCount";
import TeamBlock from "../TeamBlock";
import OddsCell from "../OddsSwiper/OddsCell";
import { ReactSVG } from '$SBTWO/ReactSVG';

class CorrectScoreEvent extends React.Component {
  constructor (props) {
    super(props);
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
      || this.props.CorrectScoreExpandEventIds.indexOf(thisPropEventId) !== nextProps.CorrectScoreExpandEventIds.indexOf(nextPropEventId)
  }

  toggleCorrectScoreViewMore = () => {
    if (this.props.EventData) {
      this.props.ToggleCorrectScore(this.props.EventData.EventId);
    }
  }

  render () {
    const {Vendor, EventData, ToggleFavourite, ToSportsDetails, OddsUpData, OddsDownData, ClickOdds, CorrectScoreExpandEventIds} = this.props;
    //console.log('===Event rendered', EventData ? EventData.EventId : 'NULL Event');

    let CorrectScoreViewMore = false;
    if (EventData && CorrectScoreExpandEventIds.indexOf(EventData.EventId) !== -1 ) {
      CorrectScoreViewMore = true;
    }

    let hasFTCorrectScore = false; //是否有全場波膽盤口
    let LineDesc = '全场波胆'; //默認的名稱
    let LineDataIsLocked = false; //投注線是否已鎖定
    let showViewMoreButtons = true; //超過5個才有展開/收合按鈕(for BTI可能低於5個的情況)
    let CorrectScores4HomeWin = [];
    let CorrectScores4Tie = [];
    let CorrectScores4AwayWin = [];
    let CorrectScores4Other = null;
    const correctScoreInfo = Vendor.getFTCorrectScoreSelectionsFromEvent(EventData);
    if (correctScoreInfo) {
      hasFTCorrectScore = true;
      LineDesc = correctScoreInfo.lineData.LineDesc ?? LineDesc;
      LineDataIsLocked = correctScoreInfo.lineData.IsLocked;
      if (correctScoreInfo.homes.length <= 5 && correctScoreInfo.ties.length <= 5 &&  correctScoreInfo.aways.length <= 5) {
        showViewMoreButtons = false;
      }
      if (CorrectScoreViewMore) {
        CorrectScores4HomeWin = correctScoreInfo.homes;
        CorrectScores4Tie = correctScoreInfo.ties;
        CorrectScores4AwayWin = correctScoreInfo.aways;
        CorrectScores4Other = correctScoreInfo.other;
      } else {
        CorrectScores4HomeWin = correctScoreInfo.homes.slice(0,5);
        CorrectScores4Tie = correctScoreInfo.ties.slice(0,5);
        CorrectScores4AwayWin = correctScoreInfo.aways.slice(0,5);
        CorrectScores4Other = null;
      }
    }

    return <div className="Games-Content CorrectScore">
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
      {/* 波膽展示 */}
      {hasFTCorrectScore
        ?
        <div className="CorrectScoreBox">
          {/*<div className="CorrectScoreTitle">{LineDesc}</div>*/}
          <div className="CorrectScoreTitle">全场波胆</div>
          <div className="CorrectScoreOdds">
            { [CorrectScores4HomeWin, CorrectScores4Tie, CorrectScores4AwayWin].map((selections,index) => {
              return <div className="CorrectScoreColumn" key={index}>
                {selections.map((item,selectionIndex) => {
                  return <OddsCell
                    key={selectionIndex}
                    Vendor={Vendor}
                    SelectionData={item}
                    LineIsLocked={LineDataIsLocked}
                    OddsUpData={OddsUpData}
                    OddsDownData={OddsDownData}
                    ClickOdds={ClickOdds}
                  />
                })}
              </div>
            }) }
          </div>
          { CorrectScores4Other ?
            <div className="CorrectScoreOther">
              <OddsCell
                Vendor={Vendor}
                SelectionData={CorrectScores4Other}
                LineIsLocked={LineDataIsLocked}
                OddsUpData={OddsUpData}
                OddsDownData={OddsDownData}
                ClickOdds={ClickOdds}
              />
            </div> : null }
          { showViewMoreButtons ? <>
            { !CorrectScoreViewMore ?
            <div
              className="CorrectScoreViewMore"
              onClick={this.toggleCorrectScoreViewMore}
            >
              查看更多<ReactSVG className="CorrectScoreViewMoreArrow" src="/img/svg/betting/down-blue.svg" />
            </div> : null }
            { CorrectScoreViewMore ?
              <div
                className="CorrectScoreViewMore"
                onClick={this.toggleCorrectScoreViewMore}
              >
                查看更少<ReactSVG className="CorrectScoreViewMoreArrow" src="/img/svg/betting/up-blue.svg" />
              </div> : null }
          </> : <div className="CorrectScoreNoViewMore" /> }
        </div>
        : <div className="NoCorrectScore">暂无波胆盘口</div> }
    </div>
  }
}

export default CorrectScoreEvent

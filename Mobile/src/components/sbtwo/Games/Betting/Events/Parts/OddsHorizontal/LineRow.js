/* 展示 一個橫條 的投注線(Line) 左右各一個OddsCell  - 橫式/橫向 展示 比賽 使用 */

import React from "react";
import { dataIsEqual } from "$SBTWOLIB/js/util";
import LineDescCell from "../OddsSwiper/LineDescCell";
import OddsCell from "../OddsSwiper/OddsCell";
import {VendorPeriodName} from "$SBTWOLIB/vendor/data/VendorConsts";

class LineRow extends React.Component {
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
    const thisPropLineKey = this.props.LineData ? this.props.LineData.EventId + '|||' + this.props.LineData.LineId : null;
    const nextPropLineKey = nextProps.LineData ? nextProps.LineData.EventId + '|||' + nextProps.LineData.LineId: null;

    return JSON.stringify(this.props.LineData) !== JSON.stringify(nextProps.LineData)
      || this.props.OddsUpData.Lines[thisPropLineKey] !== nextProps.OddsUpData.Lines[nextPropLineKey]
      || this.props.OddsDownData.Lines[thisPropLineKey] !== nextProps.OddsDownData.Lines[nextPropLineKey]
  }

  render () {
    const {Vendor, LineData, OddsUpData, OddsDownData, ClickOdds, LeftOrRight, PeriodId} = this.props;

    //console.log('====Line rendered', LineData ? LineData.EventId + '|||' + LineData.LineId : 'NULL Line');

    let selectionForHome=null;
    let selectionForAway=null;

    if (LineData && LineData.Selections && LineData.Selections.length > 1) {
      if (LineData.Selections.length === 2) {
        //一般來說應該會排整齊，第一個是主，第二個是客
        selectionForHome = LineData.Selections[0];
        selectionForAway = LineData.Selections[1];
      }

      //如果排錯，或者返回的selection不是剛好兩個，就嘗試用filter找對應的
      if (!selectionForHome || (selectionForHome.TargetTeamId !== null && selectionForHome.TargetTeamId !== selectionForHome.HomeTeamId)) {
        const selectionsForHome = LineData.Selections.filter(s => s.TargetTeamId === s.HomeTeamId);
        if (selectionsForHome && selectionsForHome.length > 0) {
          selectionForHome = selectionsForHome[0];
        }
      }
      if (!selectionForAway || (selectionForAway.TargetTeamId !== null && selectionForAway.TargetTeamId !== selectionForAway.AwayTeamId)) {
        const selectionsForAway = LineData.Selections.filter(s => s.TargetTeamId === s.AwayTeamId);
        if (selectionsForAway && selectionsForAway.length > 0) {
          selectionForAway = selectionsForAway[0];
        }
      }
    }

    return LineData ? ( <>
          {/*主隊賠率*/}
          <OddsCell
            Vendor={Vendor}
            SelectionData={selectionForHome}
            LineIsLocked={LineData.IsLocked}
            OddsUpData={OddsUpData}
            OddsDownData={OddsDownData}
            ClickOdds={ClickOdds}
          />
          {/*客隊賠率*/}
          <OddsCell
            Vendor={Vendor}
            SelectionData={selectionForAway}
            LineIsLocked={LineData.IsLocked}
            OddsUpData={OddsUpData}
            OddsDownData={OddsDownData}
            ClickOdds={ClickOdds}
          />
    </>) : ( //沒數據時放一個默認的
      <>
          {/*主隊賠率*/}
          <div className="table-cell-swiper">
            <div className="list-set">
              <div className="Game-indicators"><div className="noData">-</div></div>
            </div>
          </div>
          {/*客隊賠率*/}
          <div className="table-cell-swiper">
            <div className="list-set">
              <div className="Game-indicators"><div className="noData">-</div></div>
            </div>
          </div>
    </>)
  }
}

export default LineRow

/* 賠率區塊 - 橫式/橫向 展示 比賽 使用 */

import React from "react";
import { dataIsEqual } from "$SBTWOLIB/js/util";
import LineRow from "./LineRow";
import i18n from '$SBTWOLIB/vendor/vendori18n';

class OddsHorizontal extends React.Component {
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
    const thisPropLines = this.props.EventData ? this.props.EventData.Lines : null;
    const nextPropLines = nextProps.EventData ? nextProps.EventData.Lines : null;

    const thisPropEventId = this.props.EventData ? this.props.EventData.EventId : null;
    const nextPropEventId = nextProps.EventData ? nextProps.EventData.EventId : null;

    return (JSON.stringify(thisPropLines) !== JSON.stringify(nextPropLines))
    || this.props.OddsUpData.Events[thisPropEventId] !== nextProps.OddsUpData.Events[nextPropEventId]
    || this.props.OddsDownData.Events[thisPropEventId] !== nextProps.OddsDownData.Events[nextPropEventId]
  }

  render () {
    const {
      Vendor,
      EventData,
      OddsUpData,
      OddsDownData,
      ClickOdds,
    } = this.props;

    //console.log('===OddsSwiper rendered', EventData ? EventData.EventId : 'NULL Event');

    //只需要 展示 全場 讓球 其他不用
    let FTLine = null;
    if (EventData && EventData.Lines && EventData.Lines.length > 0) {
      //PeriodId 1 = 全場
      const FTLines =  EventData.Lines.filter(l => l.PeriodId === 1 && l.BetTypeName === i18n.HANDICAP )
      if (FTLines && FTLines.length > 0) {
        FTLine = FTLines[0];
      }
    }

    return <LineRow
          Vendor={Vendor}
          LineData={FTLine}
          PeriodId={1}
          /* 上升赔率 */
          OddsUpData={OddsUpData}
          /* 下降赔率 */
          OddsDownData={OddsDownData}
          /* 點擊賠率 */
          ClickOdds={ClickOdds}
        />
  }
}

export default OddsHorizontal

/* 展示 投注線(Line)的頭 玩法說明(lineDesc)  */

import React from "react";
import { dataIsEqual } from "$SBTWOLIB/js/util";

class LineDescCell extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
    }

    //指定要監控變化的prop
    this.MonitorProps = ['PeriodName','BetTypeName'];
  }

  componentDidMount () {
  }

  componentWillUnmount() {
  }

  //優化效能：只有指定的prop變化時才要重新渲染
  shouldComponentUpdate(nextProps, nextState) {
    return !dataIsEqual(this.props.LineData, nextProps.LineData, this.MonitorProps);
  }

  render () {
    const {LineData} = this.props;

    return LineData ? (
      <div className="table-cell-swiper">
          <span className="white">
            {LineData.LineDesc}
          </span>
      </div>
      ) : null
  }
}

export default LineDescCell

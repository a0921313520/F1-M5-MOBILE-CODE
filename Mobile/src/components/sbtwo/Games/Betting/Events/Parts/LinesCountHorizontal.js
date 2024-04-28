/* 展示 投注線(玩法)總數  */

import React from "react";
import { dataIsEqual } from "$SBTWOLIB/js/util";

class LinesCountHorizontal extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
    }

    //指定要監控變化的prop
    this.MonitorProps = ['TotalLineCount'];
  }

  componentDidMount () {
  }

  componentWillUnmount() {
  }

  //優化效能：只有指定的prop變化時才要重新渲染
  shouldComponentUpdate(nextProps, nextState) {
      return !dataIsEqual(this.props.EventData, nextProps.EventData, this.MonitorProps);
  }

  render () {
    const {EventData} = this.props;

    return EventData ? (
      <div>
        <span>+{EventData.TotalLineCount}</span>
        <span className="arrow-right"/>
      </div>
      ) : null
  }
}

export default LinesCountHorizontal

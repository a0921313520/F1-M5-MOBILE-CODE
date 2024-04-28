/* 展示 角球 總數  */

import React from "react";
import { dataIsEqual } from "$SBTWOLIB/js/util";
import ReactIMG from '$SBTWO/ReactIMG';

class CornerCount extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
    }

    //指定要監控變化的prop
    this.MonitorProps = ['HasCornerData','HomeCorner','AwayCorner'];
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

    return EventData && EventData.HasCornerData ? (
        <div className="Betting-jiao">
          <ReactIMG src="/img/svg/betting/jiao.svg" className="Betting-jiao-svg" />
          <span className="Betting-jiao-text">
              {EventData.HomeCorner}-{EventData.AwayCorner}
            </span>
        </div>
      ) : null
  }
}

export default CornerCount

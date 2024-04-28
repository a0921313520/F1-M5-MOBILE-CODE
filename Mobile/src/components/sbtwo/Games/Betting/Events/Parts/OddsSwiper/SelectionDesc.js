/* 展示 賠率框前面的 玩法選項說明  */

import React from "react";
import { dataIsEqual } from "$SBTWOLIB/js/util";

class SelectionDesc extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
    }

    //指定要監控變化的prop
    this.MonitorProps = ['SelectionName','Handicap'];
  }

  componentDidMount () {
  }

  componentWillUnmount() {
  }

  //優化效能：只有指定的prop變化時才要重新渲染
  shouldComponentUpdate(nextProps, nextState) {
    return !dataIsEqual(this.props.SelectionData, nextProps.SelectionData, this.MonitorProps);
  }

  render () {
    const {SelectionData} = this.props;

    return SelectionData ? (
      <small>
        <span>{SelectionData.SelectionName}</span>
        <span>{SelectionData.Handicap}</span>
      </small>
      ) : (
      <small>
        <span/>
        <span/>
      </small>
    )
  }
}

export default SelectionDesc

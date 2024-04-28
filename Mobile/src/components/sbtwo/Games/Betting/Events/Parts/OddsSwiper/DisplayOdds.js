/* 展示 一個賠率 包含賠率上下變化  */

import React from "react";
import { dataIsEqual, ChangeSvg } from "$SBTWOLIB/js/util";
import ReactIMG from '$SBTWO/ReactIMG';

class DisplayOdds extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
    }

    //指定要監控變化的prop
    this.MonitorProps = ['DisplayOdds'];
  }

  componentDidMount () {
  }

  componentWillUnmount() {
  }

  //優化效能：只有指定的prop變化時才要重新渲染
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.UpOrDown !== nextProps.UpOrDown) {
      return true;
    }
    return !dataIsEqual(this.props.SelectionData, nextProps.SelectionData, this.MonitorProps);
  }

  render () {
    const {SelectionData, UpOrDown} = this.props;

    //console.log('===DisplayOdds',UpOrDown);

    let thisClassName = "Number-black";
    if (UpOrDown === 'UP') {
      thisClassName = "Number-black red"
    } else if (UpOrDown === 'DOWN') {
      thisClassName = "Number-black green"
    }

    return SelectionData ? (
      <b className={thisClassName}>
        <span
          dangerouslySetInnerHTML={{
            __html: ChangeSvg(SelectionData.DisplayOdds)
          }}
          className="NumberBet"
        />
        { UpOrDown === 'UP' ? <ReactIMG src="/img/svg/betting/round-up.svg" className="Betting-up-svg"/> : null}
        { UpOrDown === 'DOWN' ? <ReactIMG src="/img/svg/betting/round-down.svg" /> : null }
      </b>
      ) : (
      <b className="Number-black">
      </b>
    )
  }
}

export default DisplayOdds

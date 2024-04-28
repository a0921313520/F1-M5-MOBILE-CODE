/* 展示 關注(收藏)星 包含點擊   */

import React from "react";
import { dataIsEqual } from "$SBTWOLIB/js/util";
import ReactIMG from '$SBTWO/ReactIMG';

class FavouriteStar extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
    }

    //指定要監控變化的prop
    this.MonitorProps = ['IsFavourite'];
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
    const {EventData, ToggleFavourite} = this.props;

    return EventData ? (
      <div
        className="Betting-star"
        onClick={() => ToggleFavourite(EventData)}
      >
        <ReactIMG
          src={`/img/svg/betting/${!EventData.IsFavourite
            ? 'star'
            : 'star_active'}.svg`}
          className="Betting-star-svg"
        />
      </div>
      ) : null
  }
}

export default FavouriteStar

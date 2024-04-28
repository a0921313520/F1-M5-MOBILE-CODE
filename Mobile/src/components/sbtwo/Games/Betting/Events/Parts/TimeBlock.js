/* 展示 時間 直播等圖示   */

import React from "react";
import { ReactSVG } from '$SBTWO/ReactSVG'
import { dataIsEqual } from "$SBTWOLIB/js/util";

class TimeBlock extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
    }

    //指定要監控變化的prop
    this.MonitorProps = ['IsRB', 'SportId', 'RBPeriodName', 'RBMinute', 'HasLiveStreaming', 'HasStatistic', 'HasVisualization', 'EventDate'];
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

    return EventData ?
      (EventData.IsRB ? (
        <div className="Games-list-title-icon">
          {parseInt(EventData.SportId) !== 1 ? ( //足球不用展示時間段，其他的如果有就展示
              EventData.RBPeriodName !== null && (
                <b className="Games-list-small-font">
                  {EventData.RBPeriodName}{' '}
                  {EventData.RBMinute != '' && EventData.RBMinute + "'"}
                </b>
              )
            ) : //足球如果沒有分鐘數，就把時間段展示出來
            EventData.RBMinute != '' ? (
              <b>{EventData.RBMinute}'</b>
            ) : (
              <b className="Games-list-small-font">
                {EventData.RBPeriodName}
              </b>
            )}

          {/* 是否有直播 HasVisualization */}
          {EventData.HasLiveStreaming && (
            <ReactSVG
              className="Betting-video-svg"
              src="/img/svg/betting/video.svg"
            />
          )}
          {/* 分析数据 */}
          {EventData.HasStatistic && (
            <ReactSVG
              className="Betting-video-svg"
              src="/img/svg/betting/statistic.svg"
            />
          )}
          {EventData.HasVisualization && (
            <ReactSVG
              className="Betting-video-svg"
              src="/img/svg/betting/dh.svg"
            />
          )}
        </div>
      ) : (
        <span className="Gametime">
          {EventData.getEventDateMoment().format(
            'MM/DD HH:mm'
          )}
        </span>
      )) : null
  }
}

export default TimeBlock

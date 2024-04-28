/* 展示 球隊名 比分 紅牌  */

import React from "react";
import LazyImageForTeam from "$SBTWO/LazyLoad/LazyImageForTeam";
import { dataIsEqual } from "$SBTWOLIB/js/util";

class TeamBlock extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
    }

    //指定要監控變化的prop
    this.MonitorPropsForHOME = ['IsRB','HomeTeamId','HomeTeamName','HomeScore','HomeRedCard'];
    this.MonitorPropsForAWAY = ['IsRB','AwayTeamId','AwayTeamName','AwayScore','AwayRedCard'];
  }

  componentDidMount () {
  }

  componentWillUnmount() {
  }

  //優化效能：只有指定的prop變化時才要重新渲染
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.Vendor !== nextProps.Vendor) {
      return true;
    }
    if (this.props.HomeOrAway !== nextProps.HomeOrAway) {
      return true;
    }
    return !dataIsEqual(this.props.EventData, nextProps.EventData, this['MonitorPropsFor' + this.props.HomeOrAway]);
  }

  render () {
    const {Vendor, EventData, ToSportsDetails, HomeOrAway} = this.props;

    let TeamId,TeamName,Score,RedCard,IconUrl;
    if (HomeOrAway === 'HOME') {
      TeamId = EventData.HomeTeamId;
      TeamName = EventData.HomeTeamName;
      Score = EventData.HomeScore;
      RedCard = EventData.HomeRedCard;
      IconUrl = EventData.HomeIconUrl;
    }  else  if (HomeOrAway === 'AWAY') {
      TeamId = EventData.AwayTeamId;
      TeamName = EventData.AwayTeamName;
      Score = EventData.AwayScore;
      RedCard = EventData.AwayRedCard;
      IconUrl = EventData.AwayIconUrl;
    }

    const HomeOrAwayIsOK = (['HOME','AWAY'].indexOf(HomeOrAway) !== -1)

    return EventData && HomeOrAwayIsOK ? (
      <div
        className="row"
        onClick={() => {
          ToSportsDetails(Vendor, EventData);
        }}
      >
        <div className="TeamName item col-1 row-1">
          <LazyImageForTeam
            Vendor={Vendor}
            TeamId={TeamId}
            thisClassName="Game-logo"
            IconUrl={IconUrl}
          />
          <b>{TeamName}</b>
        </div>
        <div className="item col-5 row-1">
          {EventData.IsRB &&
          RedCard &&
          parseInt(RedCard) > 0 ? (
            <span className="Game-score">
              {RedCard ?? 0}
            </span>
          ) : null}
        </div>
        <div className="item col-5 row-1 ScoreBlock">
          <b
            className="Number-black"
            style={{
              color:
                Score == 0
                  ? '#BCBEC3'
                  : '#000000'
            }}
          >
            {EventData.IsRB ? (Score ?? 0) : ''}
          </b>
        </div>
      </div>
      ) : null
  }
}

export default TeamBlock

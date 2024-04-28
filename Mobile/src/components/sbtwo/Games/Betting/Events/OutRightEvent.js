/* 猜冠軍賽事 */

import { withBetterRouter } from '$SBTWOLIB/js/withBetterRouter';
import React from "react";
import Toast from '$SBTWO/Toast';
import LazyImageForLeague from "$SBTWO/LazyLoad/LazyImageForTeam";
import { connect } from 'react-redux';
import ReactIMG from '$SBTWO/ReactIMG';

class OutRightEvent extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
    }
  }

  componentDidMount () {
  }

  componentWillUnmount() {
  }

  render () {
    const {Vendor, EventData, ToggleFavourite, ToSportsDetails, ClickOdds} = this.props;
    const isComboBet = this.props.betCartInfo['isComboBet' + Vendor.configs.VendorName];
    const betCartData = this.props.betCartInfo['betCart' + Vendor.configs.VendorName];

    return <div className="Games-Content">
      <div className="row header-group">
        <div className="item col-1 row-1">
          <div className="Games-list-team">
            <span className="Gametime">
              {EventData.getEventDateMoment().format(
                'MM/DD HH:mm'
              )}
            </span>
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
          </div>
        </div>
        <div className="item col-5 row-1 Numberset">
          <div>
            <span>+{EventData.TotalLineCount}</span>
          </div>
        </div>
      </div>
      <label className="Championlabel">
        {EventData.OutRightEventName}
      </label>
      {EventData.Lines &&
      EventData.Lines[0] &&
      EventData.Lines[0].Selections.map(
        (SelectionData) => {
          let CheckSelect =
            (isComboBet == true)
              ? betCartData.filter(
              (i) =>
                i.SelectionId ==
                SelectionData.SelectionId
              )
              : [];

          const LineIsLocked = EventData.Lines[0].IsLocked;
          return (
            <div className="Champion" key={SelectionData.SelectionId}>
              <div
                className="Team"
                onClick={() => {
                  ToSportsDetails(Vendor, EventData);
                }}
              >
                <LazyImageForLeague
                  Vendor={Vendor}
                  LeagueId={SelectionData.LeagueId}
                />
                <span className="name">{SelectionData.SelectionName}</span>
              </div>
              {SelectionData.Odds ? (
                LineIsLocked ? (
                  <div className='Team Right'>
                    <ReactIMG src="/img/svg/betting/Lock.svg" className="Locked" />
                  </div>
                ) : (
                  <div
                    className={
                      CheckSelect != '' ? (
                        'Team Right active'
                      ) : (
                        'Team Right'
                      )
                    }
                    onClick={() => {
                      ClickOdds(SelectionData)
                    }}
                  >
                    {SelectionData.DisplayOdds}
                  </div>
                )
              ) : (
                <div className="gray Team Right">-</div>
              )}
            </div>
          );
        }
      )}
    </div>
  }
}

const mapStateToProps = (state) => ({
  betCartInfo: state.betCartInfo,
});

const mapDispatchToProps = {
};

export default withBetterRouter(connect(mapStateToProps, mapDispatchToProps)(OutRightEvent))

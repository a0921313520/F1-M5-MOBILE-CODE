/* 一般體育賽事 */

import React from "react";
import { dataIsEqual } from "$SBTWOLIB/js/util";
import VerticalEvent from "./Parts/NormalEvents/VerticalEvent";
import HorizontalEvent from "./Parts/NormalEvents/HorizontalEvent";
import CorrectScoreEvent from "./Parts/NormalEvents/CorrectScoreEvent";
import {connect} from "react-redux";

class NormalEvent extends React.Component {
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
    const thisPropEventId = this.props.EventData ? this.props.EventData.EventId : null;
    const nextPropEventId = nextProps.EventData ? nextProps.EventData.EventId : null;

    return this.props.userSetting.ListDisplayType !== nextProps.userSetting.ListDisplayType
      || this.props.ShowCorrectScore !== nextProps.ShowCorrectScore
      || this.props.CorrectScoreExpandEventIds.indexOf(thisPropEventId) !== nextProps.CorrectScoreExpandEventIds.indexOf(nextPropEventId)
      || (JSON.stringify(this.props.EventData) !== JSON.stringify(nextProps.EventData))
      || this.props.OddsUpData.Events[thisPropEventId] !== nextProps.OddsUpData.Events[nextPropEventId]
      || this.props.OddsDownData.Events[thisPropEventId] !== nextProps.OddsDownData.Events[nextPropEventId]
  }

  render () {
    const {Vendor, EventData, ToggleFavourite, ToSportsDetails, OddsUpData, OddsDownData, ClickOdds, ShowCorrectScore, CorrectScoreExpandEventIds, ToggleCorrectScore} = this.props;
    const {ListDisplayType} = this.props.userSetting;

    //console.log('===Event rendered', EventData ? EventData.EventId : 'NULL Event');
    if (ShowCorrectScore) {
      return <CorrectScoreEvent
        Vendor={Vendor}
        EventData={EventData}
        ToggleFavourite={ToggleFavourite}
        ToSportsDetails={ToSportsDetails}
        OddsUpData={OddsUpData}
        OddsDownData={OddsDownData}
        ClickOdds={ClickOdds}
        CorrectScoreExpandEventIds={CorrectScoreExpandEventIds}
        ToggleCorrectScore={ToggleCorrectScore}
      />
    }


    return parseInt(ListDisplayType) === 1 ? <VerticalEvent
      Vendor={Vendor}
      EventData={EventData}
      ToggleFavourite={ToggleFavourite}
      ToSportsDetails={ToSportsDetails}
      OddsUpData={OddsUpData}
      OddsDownData={OddsDownData}
      ClickOdds={ClickOdds}
    /> : <HorizontalEvent
      Vendor={Vendor}
      EventData={EventData}
      ToggleFavourite={ToggleFavourite}
      ToSportsDetails={ToSportsDetails}
      OddsUpData={OddsUpData}
      OddsDownData={OddsDownData}
      ClickOdds={ClickOdds}
    />
  }
}

const mapStateToProps = state => ({
  userSetting: state.userSetting,
});

export default connect(
  mapStateToProps,
  null,
)(NormalEvent);

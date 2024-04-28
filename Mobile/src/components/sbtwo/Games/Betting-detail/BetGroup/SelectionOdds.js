import React from 'react';
import { ChangeSvg } from '$SBTWOLIB/js/util';
import { connect } from 'react-redux';
import ReactIMG from '$SBTWO/ReactIMG';

class SelectionOdds extends React.Component {

  isOddsUpOrDown = (SelectionData, list) => {
    if (SelectionData && list) {
      const thisKey = SelectionData.EventId + '|||' + SelectionData.LineId + '|||' + SelectionData.SelectionId;
      return (list.Selections[thisKey] === true);
    }
    return false;
  }

  render() {
    const {Vendor, OddsUpData, OddsDownData, SelectionData, ClickOdds, LineIsLocked} = this.props;
    const isComboBet = this.props.betCartInfo['isComboBet' + Vendor.configs.VendorName];
    const betCartData = this.props.betCartInfo['betCart' + Vendor.configs.VendorName];

    const Upstatus = this.isOddsUpOrDown(SelectionData, OddsUpData);
    const Downstatus = this.isOddsUpOrDown(SelectionData, OddsDownData);
    const CheckSelect = isComboBet ? betCartData.filter((i) => i.SelectionId == SelectionData.SelectionId) : [];
    return <>
      {(LineIsLocked || SelectionData.SelectionIsLocked) ? (
        <li className="Locked">
            <ReactIMG src="/img/svg/betting/Lock.svg" className="Locked" />
        </li>
      ) : (
        <li
          onClick={() => {
            ClickOdds(SelectionData);
            // Pushgtagdata(`Odds`, 'Submit', 'Odds_matchpage');
          }}
          className={CheckSelect != '' ? 'active' : ''}
        >
          <span>{SelectionData.SelectionName}</span>
          {SelectionData.Handicap !== null ? <span>{SelectionData.Handicap}</span> : null}
          <b className={Downstatus ? 'green' : Upstatus ? 'red' : 'black'}>
            {!SelectionData.DisplayOdds || SelectionData.DisplayOdds == 0 ? (
              '-'
            ) : (
              <span
                dangerouslySetInnerHTML={{
                  __html: ChangeSvg(SelectionData.DisplayOdds)
                }}
                className="NumberBet"
              />
            )}

            {Downstatus ? (
              <ReactIMG src="/img/svg/betting/round-down.svg" />
            ) : Upstatus ? (
              <ReactIMG src="/img/svg/betting/round-up.svg" />
            ) : (
              ''
            )}
          </b>
        </li>
      )}
    </>
  }
}

const mapStateToProps = (state) => ({
  betCartInfo: state.betCartInfo,
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(SelectionOdds);

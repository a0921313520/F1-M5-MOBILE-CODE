/* 展示 一個賠率框=投注選項(Selection) 包含處理投注線鎖定狀態  */

import React from "react";
import { dataIsEqual } from "$SBTWOLIB/js/util";
import SelectionDesc from "./SelectionDesc";
import DisplayOdds from "./DisplayOdds";
import { connect } from 'react-redux';
import ReactIMG from '$SBTWO/ReactIMG';

class OddsCell extends React.Component {
  constructor (props) {
    super(props);
    this.state = {}

    //指定要監控變化的prop
    this.MonitorProps = ['LineIsLocked'];
    //有使用的component: SelectionDesc 和 DisplayOdds，裡面有用到的字段，也要監控
    this.MonitorPropsOfSelectionData = ['EventId', 'LineId', 'SelectionId', 'SelectionName', 'Handicap', 'DisplayOdds'];
  }

  componentDidMount () {
  }

  componentWillUnmount() {
  }

  isOddsUpOrDown = (SelectionData, list) => {
    if (SelectionData && list) {
      const thisKey = SelectionData.EventId + '|||' + SelectionData.LineId + '|||' + SelectionData.SelectionId;
      return (list.Selections[thisKey] === true);
    }
    return false;
  }

  //優化效能：只有指定的prop變化時才要重新渲染
  shouldComponentUpdate(nextProps, nextState) {
    //特別處理 賠率變化，直接判斷
    return !dataIsEqual(this.props.SelectionData, nextProps.SelectionData, this.MonitorPropsOfSelectionData)
    || !dataIsEqual(this.props,nextProps,this.MonitorProps)
    || !dataIsEqual(this.props.betCartInfo,nextProps.betCartInfo,['isComboBet' + nextProps.Vendor.configs.VendorName])
    || JSON.stringify(this.props.betCartInfo['betCart' + this.props.Vendor.configs.VendorName]) !== JSON.stringify(nextProps.betCartInfo['betCart' + nextProps.Vendor.configs.VendorName])
    || this.isOddsUpOrDown(this.props.SelectionData, this.props.OddsUpData) !== this.isOddsUpOrDown(nextProps.SelectionData, nextProps.OddsUpData)
    || this.isOddsUpOrDown(this.props.SelectionData, this.props.OddsDownData) !== this.isOddsUpOrDown(nextProps.SelectionData, nextProps.OddsDownData)
  }

  render () {
    const {SelectionData, LineIsLocked, OddsUpData, OddsDownData, ClickOdds} = this.props;
    const { Vendor } = this.props;
    const isComboBet = this.props.betCartInfo['isComboBet' + Vendor.configs.VendorName];
    const betCartData = this.props.betCartInfo['betCart' + Vendor.configs.VendorName];

    //console.log('=====Odds rendered', SelectionData ? SelectionData.EventId + '|||' + SelectionData.LineId + '|||' + SelectionData.SelectionId : 'NULL selection');

    const isOddsUp = this.isOddsUpOrDown(SelectionData,OddsUpData);
    const isOddsDown = this.isOddsUpOrDown(SelectionData,OddsDownData);

    const UpOrDown = (
      (isOddsUp === true)
        ? 'UP'
        : ((isOddsDown === true) ? 'DOWN' : '')
    );
    /* 高亮 */
    const MoreStatus = isComboBet && isComboBet != 'false';
    const CheckSelect =
      MoreStatus && SelectionData
        ? betCartData.filter((i) => i.SelectionId == SelectionData.SelectionId)
        : [];
    return (
      <div className="table-cell-swiper">
        <div className="list-set">
          {(LineIsLocked || SelectionData.SelectionIsLocked) ? (
            <div className="Game-indicators">
              <ReactIMG src="/img/svg/betting/Lock.svg" className="Locked" />
            </div>
          ) : (
            <div
              className={
                CheckSelect != '' ? 'Game-indicators active' : 'Game-indicators'
              }
              onClick={() => {
                ClickOdds(SelectionData);
                // Pushgtagdata(`Odds`, 'Submit', 'Odds_mainpage_vertical');
              }}
            >
              {/* 玩法選項 說明 */}
              <SelectionDesc SelectionData={SelectionData} />
              {/* 賠率 包含上下變化 */}
              <DisplayOdds SelectionData={SelectionData}	UpOrDown={UpOrDown} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  betCartInfo: state.betCartInfo,
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(OddsCell);

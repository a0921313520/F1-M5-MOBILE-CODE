/* 投注記錄-提前兌現-結果彈窗 */

import React from 'react';
import { connect } from 'react-redux';
import { ACTION_UserInfo_getBalanceSB } from '@/lib/redux/actions/UserInfoAction';
import ReactModal from 'react-modal';
import {CashOutStatusType} from "$SBTWOLIB/vendor/data/VendorConsts";
import WagerData from "$SBTWOLIB/vendor/data/WagerData";

ReactModal.setAppElement('#__next');

class CashOutPopup extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      progressPercent: 100, //倒數關閉進度百分比
    }

    this.storedWagerData = null; //wagerData暫存，因為關閉時會清掉prop帶來的數據
    this.countDownHandle = null;
    this.countDownFinalHandle = null;
  }

  componentDidMount () {
  }

  componentWillUnmount() {
    this.clearTimeouts();
  }

  //清理定時器，避免關閉後觸發 報錯
  clearTimeouts = () => {
    if (this.countDownHandle) {
      clearTimeout(this.countDownHandle);
    }
    if (this.countDownFinalHandle) {
      clearTimeout(this.countDownFinalHandle);
    }
  }



  //定時關閉
  countDownClose = () => {
    this.clearTimeouts();

    const { closePopup } = this.props;
    const countDownSecond = 5;  //倒數5秒後關閉
    const piece = 100 / countDownSecond; //每次要切掉的長度
    let that = this;

    const countDownTimout = () => {
      that.countDownHandle = setTimeout(() => {
        const leftPercent = that.state.progressPercent - piece;
        that.setState({progressPercent: leftPercent}, () => {
          if (leftPercent >0) {
            countDownTimout();
          } else {
            //500ms後再關閉，讓動畫跑一下
            that.countDownFinalHandle = setTimeout(() => {
              closePopup();
            },500)
          }
        });
      },1000);
    }

    countDownTimout();
  }

  //彈窗開啟事件
  doOnOpen = () => {
    const { wagerData } = this.props;
    //存下wagerData
    this.storedWagerData = WagerData.clone(wagerData);

    let that = this;
    this.setState({
      progressPercent: 100  //這個組件會一直存在，復用的，所以每次打開要重置數據
    }, () => {
      that.countDownClose();     //幾秒後自動關閉彈窗
    })
  }

  //統一處理關閉彈窗請求
  doOnClose = () => {
    this.clearTimeouts();

    const { unlockWager, showSettledWagers, reloadWagers } = this.props;

    unlockWager(); //解鎖注單數據 - 繼續(輪詢)更新此注單數據

    //注意不是用 props.wagerData 因為這個數據關閉彈窗的時候 就清掉了
    if (this.storedWagerData
      && this.storedWagerData.CashOutStatus == CashOutStatusType.DONE) { //查看已兑现单
      console.log('===doOnClose showSettledWagers')
      showSettledWagers();
      this.props.userInfo_getBalanceSB();
    } else { //失敗或拒絕
      console.log('===doOnClose reloadWagers')
      reloadWagers(); //刷新數據
    }
  }

  //從bet-records直接複製過來
  getWagerScore = (wagerItemData) => {
    if (wagerItemData.HomeTeamFTScore !== null || wagerItemData.AwayTeamFTScore !== null) {
      return '[' +  (wagerItemData.HomeTeamFTScore ?? 0) + '-' + (wagerItemData.AwayTeamFTScore ?? 0)  + ']';
    }
    return '';
  }

  render () {
    const { wagerData, closePopup } = this.props;
    if (!wagerData) { //有數據才render內容
      return null;
    }

    const val = wagerData; //從bet-record複製過來 直接使用相同的參數名

    let statusClass = ' green'; //成功:綠色
    let statusName = '兑现成功'
    if (wagerData.CashOutStatus == CashOutStatusType.FAIL) { //失敗
      statusClass = ' red';
      statusName = '兑现失败'
    } else if (wagerData.CashOutStatus == CashOutStatusType.DECLINE) { //拒絕價格異動
      statusClass = ' red';
      statusName = '兑现取消'
    }

    return <ReactModal
      isOpen={wagerData !== null}
      onAfterOpen={this.doOnOpen}
      onAfterClose={this.doOnClose}
      className="cashout-popup"
      overlayClassName="cashout-popup-overlay"
    >
      <div className="cashout-popup-progress" style={{width: this.state.progressPercent + '%' }} />
      <div className="csahout-popup-wager">
        { /*從bet-records直接複製過來 刪除了最後的注單和客服信息 也刪除了免費投注和額外盈利*/
          val.WagerType !== 2
            ? <>
              <div className="bet-records-collapse">
                <div className="race-info">
                  <h4>
                    <span>{val.WagerItems[0].SelectionDesc}</span>
                    <span className="theme-color">@{val.WagerItems[0].Odds}</span>
                  </h4>
                  <p>{val.WagerItems[0].LineDesc}</p>
                </div>
                <div className={"cashout-popup-status" + statusClass}>{statusName}</div>
              </div>
              <div className="race-content">
                {val.WagerItems.map(item => (
                  <div key={item.EventId} className="race-item-wrap">
                    <h4>
                      {val.WagerItems[0].IsOutRightEvent
                        ? <span>{val.WagerItems[0].OutRightEventName}</span>
                        :
                        <span>{val.WagerItems[0].HomeTeamName} VS {val.WagerItems[0].AwayTeamName} {this.getWagerScore(val.WagerItems[0])}</span>
                      }
                    </h4>
                    <p className="lightColor">{val.WagerItems[0].LeagueName}</p>
                    <p className="lightColor">开赛时间：{val.WagerItems[0].getEventDateMoment().format('MM/DD HH:mm')}</p>
                  </div>
                ))}
                <div className="race-time-info-wrap">
                  <div className="race-result-wrap">
                    <div className="Money-top">
                      <p>投注额：<span className="money-wrap">￥{val.BetAmount}</span></p>
                      {/*<p>可赢金额：<span className="money-wrap">￥{val.PotentialPayoutAmount}</span></p>*/}
                      <p>兑现金额: <span className="money-wrap">￥{val.CashOutPrice}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </>
            : <>
              <div className="bet-records-collapse mix-betting">
                <div className="race-info">
                  <h4>
                    <span>混合投注</span>
                  </h4>
                  <p>{val.ComboTypeName} X {val.ComboCount} {val.Odds ? '@' + val.Odds : ''}</p>
                </div>
                <div className={"cashout-popup-status" + statusClass}>{statusName}</div>
              </div>
              {val.WagerItems.map(item => (
                <div key={item.EventId} className="mix-bet-con">
                  <div className="bet-records-collapse">
                    <div className="race-info">
                      <h4>
                        <span>{item.SelectionDesc}</span>
                        <span className="theme-color">@{item.Odds}</span>
                      </h4>
                      <p>{item.LineDesc}</p>
                    </div>
                  </div>
                  <div className="race-content">
                    <div className="race-item-wrap">
                      <h4>
                        {item.IsOutRightEvent
                          ? <span>{item.OutRightEventName}</span>
                          :
                          <span>{item.HomeTeamName} VS {item.AwayTeamName} {this.getWagerScore(item)}</span>
                        }
                      </h4>
                      <p className="lightColor">{item.LeagueName}</p>
                      <p className="lightColor">开赛时间：{item.getEventDateMoment().format('MM/DD HH:mm')}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="race-content mix-race-content">
                <div className="race-time-info-wrap">
                  <div className="race-result-wrap">
                    <div className="Money-top">
                      <p>投注额：<span className="money-wrap">￥{val.BetAmount}</span></p>
                      {/*<p>可赢金额：<span className="money-wrap red-color">￥{val.PotentialPayoutAmount}</span></p>*/}
                      <p>兑现金额: <span className="money-wrap">￥{val.CashOutPrice}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </>
        }
      </div>
      {
        (wagerData.CashOutStatus == CashOutStatusType.DONE || wagerData.CashOutStatus == CashOutStatusType.FAIL) &&
          <div
            className="cashout-popup-button"
            onClick={closePopup}
          >
          {
            wagerData.CashOutStatus == CashOutStatusType.DONE && "查看已兑现单"
          }
          {
            wagerData.CashOutStatus == CashOutStatusType.FAIL && "关闭"
          }
          </div>
        }
    </ReactModal>
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.userInfo,
});

const mapDispatchToProps = {
  userInfo_getBalanceSB: ACTION_UserInfo_getBalanceSB,
};

export default connect(mapStateToProps, mapDispatchToProps)(CashOutPopup);

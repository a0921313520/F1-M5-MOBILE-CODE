/* 投注記錄-提前兌現-按鈕區塊 */

import React from "react";
import {CashOutStatusType} from "$SBTWOLIB/vendor/data/VendorConsts";
import WagerData from "$SBTWOLIB/vendor/data/WagerData";
import Toast from "$SBTWO/Toast";

class CashOutButtonBox extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
    }
  }

  componentDidMount () {
  }

  componentWillUnmount() {
  }

  //提交兌現 => 展示 重複確認UI
  doCashOut = () => {
    const { wagerData, lockWager, lockingWagerIsProcessing } = this.props;

    //檢查鎖定注單是否正在進行兌現(因為有彈窗，同時間內只能兌現一張單，其他按鈕必須不可用)
    if (lockingWagerIsProcessing) {
      Toast.error('有注單正在兌現中，請先完成當前兌現');
      return false;
    }

    lockWager(wagerData); //鎖定注單數據 - 停止(輪詢)更新
  }

  //重複確認後 提交兌現(新價格也共用這個提交，沒有差別)
  doCashOutSubmit = () => {
    const { Vendor, wagerData, updateLockingWager } = this.props;

    const vendroNameToPiwikMapping = {'IM':'IM', 'BTI':'BTI', 'SABA':'OW'}
    // Pushgtagdata('Game Feature','Submit',vendroNameToPiwikMapping[this.props.Vendor.configs.VendorName] + '_CashOut_SB2.0');

    //提前兌現piwik日誌
    const cashoutLog = (wagerid, logJSON) => {
      if (typeof _paq === 'object') {
        //category, action, name
        console.log('=====cashoutLog', 'cashoutLog_' + this.props.Vendor.configs.VendorName , wagerid, JSON.parse(logJSON));
        _paq.push(["trackEvent", 'cashoutLog_' + this.props.Vendor.configs.VendorName , wagerid, logJSON]);
      }
    }

    let cloneWagerData = WagerData.clone(wagerData); //複製一份
    cloneWagerData.CashOutStatus = CashOutStatusType.PROCESS; //切換為處理中
    updateLockingWager(cloneWagerData); //更新上層數據

    Vendor.cashOut(wagerData)
      .then(cashoutResult => {
        updateLockingWager(cashoutResult.WagerData); //直接更新上層數據
        cashoutLog(cashoutResult.WagerData.WagerId, cashoutResult.LogJSON); //日誌
      })
  }

  //取消兌現(這個只是 重複確認 的取消，不是vendor端的，不需要更新wagerData)
  doCashOutCancel = () => {
    const { unlockWager } = this.props;
    unlockWager(); //解鎖注單數據 - 繼續(輪詢)更新此注單數據
  }

  //拒絕新兌現價格
  doCashOutDecline = () => {
    const { Vendor, wagerData, updateLockingWager } = this.props;
    let cloneWagerData = WagerData.clone(wagerData); //複製一份
    cloneWagerData.CashOutStatus = CashOutStatusType.DECLINE; //切換為拒絕
    updateLockingWager(cloneWagerData); //直接更新上層數據

    //調用拒絕API(其實只有BTI需要)
    Vendor.cashOutDeclineNewOffer(wagerData);
  }

  render () {
    const { Vendor, wagerData, lockingWagerId } = this.props;
    const isLocking = (lockingWagerId == wagerData.WagerId);

    const VendorHasCashOut = Vendor.configs.HasCashOut;
    const CanCashOut = VendorHasCashOut && wagerData.CanCashOut; //vendor也有配置開關，可以暫時停用功能

    return <div className={"cashout-button-box" + (CanCashOut ? '' : ' empty') }> {/* 處理每筆投注記錄的 白底 + 下圓角 */}
      {
        CanCashOut
          ? <>
              {/*
                //   NOTYET: 0, //未兌現或不可兌現
                //   DONE: 1, //已兌現
                //   PROCESS: 2, //進行中
                //   CANCEL: 3, //取消
                //   NEWPRICE: 4, //新價格
                //   FAIL: 5, //失敗
                //   DECLINE: 6, //拒絕(by用戶)
              */}
              {
                //   NOTYET: 0, //未兌現或不可兌現 CANCEL: 3, //取消
                ((wagerData.CashOutStatus == CashOutStatusType.NOTYET || wagerData.CashOutStatus == CashOutStatusType.CANCEL) && !isLocking) &&
                  <div
                    className={"cashout-button-content cashout-button-notyet"}
                    onClick={this.doCashOut}
                  >
                    兑现价格 ：￥{wagerData.CashOutPrice}
                  </div>
              }
              {
                //   NOTYET: 0, //未兌現或不可兌現 提交前重複確認(點兌現按鈕就會鎖定數據，可以同時拿來判斷是否展示 重複確認UI)
                ((wagerData.CashOutStatus == CashOutStatusType.NOTYET || wagerData.CashOutStatus == CashOutStatusType.CANCEL) && isLocking) &&
                  <div className="cashout-button-content cashout-button-confirming-box">
                    <div className="cashout-button-confirming-money">￥{wagerData.CashOutPrice}</div>
                    <div className="cashout-button-confirming-text">兑现价格</div>
                    <div className="cashout-button-confirming-button-box">
                      <div
                        className="cashout-button-confirming-button cancel"
                        onClick={this.doCashOutCancel}
                      >
                        取消
                      </div>
                      <div
                        className="cashout-button-confirming-button submit"
                        onClick={this.doCashOutSubmit}
                      >
                        确认
                      </div>
                    </div>
                  </div>
              }
              {
                //   NEWPRICE: 4, //新價格
                wagerData.CashOutStatus == CashOutStatusType.NEWPRICE &&
                <div className="cashout-button-content cashout-button-newprice-box">
                  <div className="cashout-button-newprice-money">￥{wagerData.CashOutPrice}</div>
                  <div className="cashout-button-newprice-text">新的兑现价格</div>
                  <div className="cashout-button-newprice-button-box">
                    <div
                      className="cashout-button-newprice-button decline"
                      onClick={this.doCashOutDecline}
                    >
                      拒绝
                    </div>
                    <div
                      className="cashout-button-newprice-button accept"
                      onClick={this.doCashOutSubmit}
                    >
                      接受
                    </div>
                  </div>
                </div>
              }
              {
                //   PROCESS: 2, //進行中
                (wagerData.CashOutStatus == CashOutStatusType.PROCESS) &&
                  <div className="cashout-button-content cashout-button-process-box">
                    <div className="cashout-button-process-loader"/>
                    <div className="cashout-button-process-text">等待中</div>
                  </div>
              }
              {
                //  DONE: 1, //已兌現
                (wagerData.CashOutStatus == CashOutStatusType.DONE) &&
                <div className="cashout-button-content cashout-button-done">兑现成功</div>
              }
              {
                //   FAIL: 5, //失敗
                (wagerData.CashOutStatus == CashOutStatusType.FAIL) &&
                <div className="cashout-button-content cashout-button-fail">兑现失败</div>
              }
              {
                //   DECLINE: 3, //拒絕
                (wagerData.CashOutStatus == CashOutStatusType.DECLINE) &&
                <div className="cashout-button-content cashout-button-decline">兑现取消</div>
              }
            </>
          : null
      }
    </div>
  }
}

export default CashOutButtonBox;

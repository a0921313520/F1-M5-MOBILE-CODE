import React from "react";
import Layout from '$SBTWO/Layout';
import { ReactSVG } from '$SBTWO/ReactSVG';
import Tabs, { TabPane } from "rc-tabs";
import Button from '$SBTWO/Button';
import DateRange from '$SBTWO/DateRange';
import BackToTop from '$SBTWO/BackToTop';
import Collapse, { Panel } from 'rc-collapse';
import VendorBTI from "$SBTWOLIB/vendor/bti/VendorBTI";
import VendorIM from "$SBTWOLIB/vendor/im/VendorIM";
import VendorSABA from "$SBTWOLIB/vendor/saba/VendorSABA";
import moment from "moment";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Toast from '$SBTWO/Toast';
import { fetchRequest } from "$SBTWOLIB/SportRequest";
import { ApiPort } from "$SBTWOLIB/SPORTAPI";
import ComboBonusModal from "$SBTWO/ComboBonusModal";
import HostConfig from "@/server/Host.config";
import Router from "next/router";
import { connect } from 'react-redux';
import CashOutButtonBox from "$SBTWO/CashOut/CashOutButtonBox";
import CashOutPopup from "$SBTWO/CashOut/CashOutPopup";
import WagerData from "$SBTWOLIB/vendor/data/WagerData";
import {CashOutStatusType} from "$SBTWOLIB/vendor/data/VendorConsts";
import Switch from '$SBTWO/SwitchUi';
import ReactIMG from '$SBTWO/ReactIMG';

const dateRadioSource = [{
    text: "今天",
    value: 1
}, {
    text: "昨天",
    value: 2
}, {
    text: "近7天",
    value: 3
}, {
    text: "日期",
    value: 4
}]

const day7time = 24*60*60*7*1000;
const day1time = 24*60*60*1*1000;

class BetRecords extends React.PureComponent {
  static getInitialProps({ query,pathname }) {
    return { query,pathname };
  }
	constructor(props) {
		super(props);
    this.state = {
      vendor: "bti",
      page: "unsettle",
      dateRadio: 3, //默認開啟近７天
      date: [new Date(new Date().getTime() - day7time), new Date()],
      showDateRange: false,
      unsettleWagersList: [],
      //getUnSettledWagersHasError: [], 未結算不用，已改為輪詢
      settledWagersList: [],
      getSettledWagersHasError: false,
      showComboBonusModal: false,
      cashOutLockingVendor: null, //當前鎖定注單for 提前兌現 的vendor(tab key)，用來處理兌現中切換vendor的情況
      cashOutLockingWagerData: null, //鎖定注單 for 提前兌現
      cashOutLockingWagerIsProcessing: false, //鎖定注單是否正在進行兌現(因為流程有彈窗，同時間內只能兌現一張單，其他按鈕必須不可用)
      cashOutWagerDataForPopup: null, //注單數據 for 提前兌現 結果彈窗
      showCashOutOnly: false, //只展示可提前兌現的數據
    }

    this.totalBetCurrency = 0;
    this.totalWinCurrency = 0;

    this.VendorMapping = {
      'bti':VendorBTI,
      'im':VendorIM,
      'saba':VendorSABA,
    }

    //已結算注單 查詢天數上限
    this.DateRangeVendorMapping = {
      'bti':90,
      'im':31,
      'saba':29,
    }

    this.currentVendor = VendorIM;
    this.unSettlePollingKey = null; //未結算注單 輪詢key
    this.isDidUnmount = null; //紀錄是否已退出投注記錄頁面 => 決定cashout彈窗還要不要展示
  }


  componentDidMount () {
    this.isDidUnmount = false;

    const { v,p } = this.props.query;
    const lowerV = v ? v.toLowerCase() : HostConfig.Config.defaultSport;
    const lowerP = p ? p.toLowerCase() : 'unsettle';
    const vendor = this.VendorMapping[lowerV];
    //因為setSate有時間差，所以用另外參數去存，下面更新網址鏈接會用到
    let currentV = this.state.vendor;
    let currentP = this.state.page;
    if (vendor) {
      this.currentVendor = vendor;
      this.setState({vendor: lowerV});
      currentV = lowerV;
      if (['unsettle', 'settled'].indexOf(lowerP) !== -1) {
        this.setState({page: lowerP});
        currentP = lowerP;
      }
    }
    this.doQuery(this.currentVendor);

    this.updateUrl(currentV, currentP);
  }

  componentWillUnmount() {
    this.isDidUnmount = true;
    this.deleteUnSettlePolling();
  }

  //刪除 未結算注單 輪詢
  deleteUnSettlePolling = () => {
    if (this.currentVendor && this.unSettlePollingKey) {
      this.currentVendor.deletePolling(this.unSettlePollingKey);
    }
  }

  doQuery(Vendor) {
    this.currentVendor = Vendor;
    // 查詢未結算注單
    this.getUnsettleWagers();
    // 查詢已結算注單
    this.getSettledWagers();
  }

  // 查詢未結算注單
  getUnsettleWagers = () => {
    this.deleteUnSettlePolling(); //先刪除輪詢

    this.unSettlePollingKey = this.currentVendor.getUnsettleWagersPolling(
      data => {
        //console.log('getUnsettleWagers', data);
        this.setState(state => {
          //處理 注單數據鎖定
          if (state.cashOutLockingWagerData
            && state.cashOutLockingVendor == state.vendor //如果vendor tab切走了 就不用處理
          ) {
            let indexInOldData = state.unsettleWagersList.findIndex(item => item.WagerId === state.lockingWagerId);
            if (indexInOldData < 0) {
              indexInOldData = 0; //找不到就放第一個
            }

            const oldData = state.cashOutLockingWagerData; //直接使用鎖定數據，不使用本地清單，因為切到另外一個vendor再切回來，數據就不見了
            let cloneArr = [...data];
            const indexInNewData = data.findIndex(item => item.WagerId === state.cashOutLockingWagerData.WagerId);
            if (indexInNewData !== -1) {
              // const newData = cloneArr[indexInNewData];
              // if (newData.CashOutPrice !== oldDta.CashOutPrice) {
              //   console.log('=====兌現金額已變化：',oldDta.CashOutPrice,' => ',newData.CashOutPrice, ' ||| ', oldDta.CashOutPriceId, ' => ',newData.CashOutPriceId)
              // }
              //有在新數據裡面 => 不更新這筆(用舊數據取代)
              cloneArr.splice(indexInNewData, 1, oldData); //用splice處理取代
            } else {
              //沒在新數據裡面 => 表示已經被刪除了 => 補進去
              cloneArr.splice(indexInOldData, 0, oldData); //用splice處理加入(deletecount = 0)
            }
            return {
              unsettleWagersList: cloneArr
            }
          }
          return {
            unsettleWagersList: data
          }
        })
      }
    )
  }

  // 查詢已結算注單
  getSettledWagers = (key = null) => {
    if (key === null) {
      key = this.state.date;
    }
    Toast.loading();
    let date = typeof key === "number" ? [new Date(), new Date()] : key;
    switch (key) {
      case 1:
        date = [new Date(), new Date()];
        break;
      case 2:
        date = [new Date(new Date().getTime() - day1time), new Date(new Date().getTime() - day1time)];
        break;
      case 3:
        date = [new Date(new Date().getTime() - day7time), new Date()];
        break;
      default:
        break;
    }
    this.currentVendor.getSettledWagers(moment(date[0]).format('YYYY-MM-DD'), moment(date[1]).format('YYYY-MM-DD'))
      .then(data => {
        // console.log('getSettledWagers', data)
        Toast.destroy();
        this.totalBetCurrency = 0;
        this.totalWinCurrency = 0;
        data.forEach((val) => {
          this.totalBetCurrency += parseFloat(val.BetAmount);
          this.totalWinCurrency += parseFloat(val.WinLossAmount);
        })
        this.setState({
          settledWagersList: data,
          getSettledWagersHasError: false,
        });
      })
      .catch(err => {
        this.setState({getSettledWagersHasError: true}); //查詢錯誤就設為true
        hide()
        console.log('getSettledWagers has error',err)
      });
  }

  updateUrl(v, p) {
    //更新網址鏈接
    const {pathname} = this.props;
    const params = new URLSearchParams({v, p});
    //用replace，避免用戶可以點擊back返回
    Router.replace(pathname + '?' + params.toString(), undefined, {shallow: true});
  }

  PopUpLiveChat = (val) => {
   const betId = val.WagerId;
   const item = val.WagerItems[0]
    this.FUN88Live && this.FUN88Live.close();
    this.FUN88Live = window.open(
      'about:blank',
      'chat',
      'toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=540, height=650'
    );
    const serverUrl = localStorage.getItem('serverUrl');

    const Vendor = this.currentVendor;
    const matchTime = `&CUSTOM!MatchStartDate=${encodeURIComponent(item.getEventDateMoment().format('YYYY-MM-DD HH:mm:ss'))}`;
    const betSlipId = `&CUSTOM!BetslipID=${encodeURIComponent(betId)}`;
    const vendorName = `&CUSTOM!Vendor=${encodeURIComponent(Vendor.configs.VendorName)}`;
    const statusName = `&CUSTOM!Status=${encodeURIComponent(this.getStatusName(val))}`;
    
    const betInfo = `${betSlipId}${vendorName}${statusName}${matchTime}`

    serverUrl ? this.openServer(betId ? (serverUrl + betInfo) : serverUrl) : fetchRequest(ApiPort.GETLiveChat).then((res) => {
      if (res) {
        localStorage.setItem('serverUrl', res.url);
        this.openServer(betId ? (res.url + betInfo) : res.url);
      }
    });
  }
  
  getStatusName = (val) => {
    const item = val.WagerItems[0]
    if(this.state.page === "unsettle"){
      return (['im','saba'].indexOf(this.state.vendor) !== -1) ? item.WagerStatusName : '投注成功';
    } else {
      return (val.CashOutStatus == CashOutStatusType.DONE && val.CashOutAmount >0)
        ? "兑现成功"
        : this.getSettledWagerStatusName(val)
    }
  }
  openServer = (serverUrl) => {
    this.FUN88Live.document.title = 'FUN88在线客服';
    this.FUN88Live.location.href = serverUrl;
    this.FUN88Live.focus();
  }

  onChange = date => this.setState({date})
  dateChange = date => {
    this.getSettledWagers(date);
    this.setState({dateRadio: 4})
  }

  getWagerScore(wagerItemData) {
    if (wagerItemData.HomeTeamFTScore !== null || wagerItemData.AwayTeamFTScore !== null) {
      return '[' + (wagerItemData.HomeTeamFTScore ?? 0) + '-' + (wagerItemData.AwayTeamFTScore ?? 0) + ']';
    }
    return '';
  }

  getWagerScoreWhenBet(wagerItemData) {
    if (wagerItemData.HomeTeamScoreWhenBet !== null || wagerItemData.AwayTeamScoreWhenBet !== null) {
      return '[' + (wagerItemData.HomeTeamScoreWhenBet ?? 0) + '-' + (wagerItemData.AwayTeamScoreWhenBet ?? 0) + ']';
    }
    return '';
  }

  lineDescUI(val) {
    return (
      (val.WagerItems[0].LineDesc || val.WagerItems[0].HomeTeamScoreWhenBet !== null && val.WagerItems[0].AwayTeamScoreWhenBet !== null) && (
        <div className="lineDescWrap">
          {(val.WagerItems[0].HomeTeamScoreWhenBet !== null || val.WagerItems[0].AwayTeamScoreWhenBet !== null) && (
            <p className="lineDescText" style={{ marginRight: 2 }}>
              {this.getWagerScoreWhenBet(val.WagerItems[0])}
            </p>
          )}
          {val.WagerItems[0].LineDesc && (
            <p className="lineDescText">
              {val.WagerItems[0].LineDesc}
            </p>
          )}
        </div>
      )
    )
  }

  checkMaintenanceStatus = (name) => {
    const { isBTI, isIM, isSABA, noTokenBTI, noTokenIM, noTokenSABA } = this.props.maintainStatus;
    const { isLogin } = this.props.userInfo; //有登入才額外判斷 token獲取狀態
    switch (name) {
      case 'bti':
        return isBTI || (isLogin && noTokenBTI);
      case 'im':
        return isIM || (isLogin && noTokenIM);
      case 'saba':
        return isSABA || (isLogin && noTokenSABA);
      default:
        return false;
    }
  };

  //提前兌現 => 更新鎖定注單狀態
  updateLockingWager = (wagerData) => {
    if (this.isDidUnmount) {
      return false; //如果已經離開投注記錄頁面，放棄更新
    }
    this.setState(state => {
      let newState = {};

      //如果已經切換vendor
      if (state.cashOutLockingVendor !== state.vendor) {
        newState.cashOutWagerDataForPopup = null;  //不展示彈窗
        if (wagerData.CashOutStatus != CashOutStatusType.PROCESS) {
          //鎖定注單 不是處理中 ，直接解鎖 (注意和 cashOutLockingWagerIsProcessing 判斷不同， 不需要考慮NEWPRICE新價格的狀況)
          newState.cashOutLockingWagerData = null
          newState.cashOutLockingVendor = null
        }
        return newState;
      }

      //更新鎖定注單數據
      newState.cashOutLockingWagerData = wagerData;

      //更新列表數據
      const indexInList = state.unsettleWagersList.findIndex(item => item.WagerId === wagerData.WagerId);
      if (indexInList !== -1) {
        let cloneArr = [...state.unsettleWagersList];
        cloneArr.splice(indexInList, 1, wagerData); //用splice處理取代
        newState.unsettleWagersList = cloneArr;
      }

      //更新鎖定注單狀態：是否處理中
      newState.cashOutLockingWagerIsProcessing = (wagerData.CashOutStatus == CashOutStatusType.PROCESS || wagerData.CashOutStatus == CashOutStatusType.NEWPRICE)

      //處理彈窗 成功，失敗，拒絕 才會有彈窗
      if (wagerData.CashOutStatus == CashOutStatusType.DONE
        || wagerData.CashOutStatus == CashOutStatusType.FAIL
        || wagerData.CashOutStatus == CashOutStatusType.DECLINE
      ) {
        newState.cashOutWagerDataForPopup = wagerData;
      } else {
        newState.cashOutWagerDataForPopup = null;
      }

      return newState;
    })
  }

  //提前兌現 => 鎖定注單
  lockWager = (wagerData) => {
    this.setState(state => ({cashOutLockingWagerData:WagerData.clone(wagerData), cashOutLockingVendor: state.vendor}));
  }

  //提前兌現 => 解鎖注單
  unlockWager = () => {
    this.setState({cashOutLockingWagerData:null, cashOutLockingVendor: null});
  }

  //提前兌現 => 切換 到 已結算注單
  showSettledWagers = () => {
    this.setState({page: 'settled'},() => {
      this.doQuery(this.currentVendor);
      this.updateUrl(this.state.vendor,this.state.page);
    })
  }

  //提前兌現 => 刷新數據
  reloadWagers = () => {
    this.doQuery(this.currentVendor);
  }

  //提前兌現 => 關閉結果彈窗
  closePopup = () => {
    this.setState({cashOutWagerDataForPopup: null});
  }

  //提前兌現 => 過濾數據
  toggleCashOutFilter = (val) => {
    this.setState({showCashOutOnly: val});
  }

  //獲取 已結算 注單狀態
  getSettledWagerStatusName = (wagerData) => {
    //val.WinLossAmount > 0 ? "赢" : val.WinLossAmount < 0 ? "输" : "和"

    const Vendor = this.currentVendor;
    if (wagerData.WinLossAmount > 0) {
      return "赢"; //贏
    } else if (wagerData.WinLossAmount < 0) {
      return "输";  //輸
    }
    //和
    if (Vendor.configs.VendorName === 'IM') {
      if ([1,2].indexOf(wagerData.WagerStatus) !== -1) { //IM: 1待定 2確認 展示為和, 其他Vendor都有對應的正確文字
        return "和";
      }
      return (wagerData.WagerStatusName ? wagerData.WagerStatusName : "和");
    }
    return (wagerData.WagerStatusName ? wagerData.WagerStatusName : "和");
  }


  render() {

    const Vendor = this.currentVendor;
    const btiIsMaintenance = this.checkMaintenanceStatus('bti');
    const imIsMaintenance = this.checkMaintenanceStatus('im');
    const sabaIsMaintenance = this.checkMaintenanceStatus('saba');
    // console.log(this.state.unsettleWagersList)
    // console.log(this.state.vendor)

    let unsettleWagersList = this.state.unsettleWagersList;
    if (this.state.showCashOutOnly) {
      unsettleWagersList = unsettleWagersList.filter(w => w.CanCashOut);
    }

    return (
      <Layout
        status={12}
        hideBack={true}
        BarTitle={<div className="betRecordstabs header-bar-tabs">
          <Tabs
            prefixCls="bet-records-tabs"
            defaultActiveKey={this.state.vendor}
            activeKey={this.state.vendor}
            onChange={(key) => {
              this.setState({vendor:key}, () => {
                console.log('===',key);
                if (this.VendorMapping[key]) {
                  this.deleteUnSettlePolling(); //先刪除輪詢
                  this.doQuery(this.VendorMapping[key]);
                  this.updateUrl(this.state.vendor,this.state.page);
                }
              })
              const keyToVendorNameMapping = {'im':'IM', 'bti': 'BTI', 'saba': 'OW'}
              // Pushgtagdata(`Account`, 'View', `BetRecord_${keyToVendorNameMapping[key]}_SB2.0`);
            }}
          >
            <TabPane disabled={imIsMaintenance} tab={<div><span className="name">IM</span>{imIsMaintenance ? <span className="tab-tag maintain">维修</span> : null}</div>} key="im"></TabPane>
            <TabPane disabled={btiIsMaintenance} tab={<div><span className="name">BTI</span>{btiIsMaintenance ? <span className="tab-tag maintain">维修</span> : null}</div>} key="bti"></TabPane>
            <TabPane disabled={sabaIsMaintenance} tab={<div><span className="name"> 沙巴</span>{sabaIsMaintenance ? <span className="tab-tag maintain">维修</span> : null}</div>} key="saba"></TabPane>
        </Tabs>
        </div>}
      >
        <div className="bet-records-wrap default-tabs">
          <Tabs
            animated={false}
            className="bet-records-tabs"
            defaultActiveKey={this.state.page}
            activeKey={this.state.page}
            onChange={(key) => {
              this.setState({page: key},() => {
                this.updateUrl(this.state.vendor,this.state.page);
                if (key === 'unsettle') {
                  //this.getUnsettleWagers(); 輪詢不用點擊查詢
                } else {
                  this.getSettledWagers()
                }
              })
              if(key == 'unsettle'){
                // Pushgtagdata(`BetRecord`, 'View', `Betrecord_Openbets`);
              }else{
                // Pushgtagdata(`BetRecord`, 'View', `Betrecord_Settledbets`);
              }
            }}
          >
            <TabPane tab={<div><span>未结算</span><span>{this.state.unsettleWagersList.length || ""}</span></div>} key="unsettle">
              {
                Vendor.configs.HasCashOut &&
                <div className="cashout-filter-button">
                  <div>只显示兑现注单</div>
                  <div>
                    <Switch
                      uncheckedIcon={false}
                      checkedIcon={false}
                      onChange={this.toggleCashOutFilter}
                      checked={this.state.showCashOutOnly}
                      className="sport-switch"
                      activeBoxShadow="0 0 2px 3px #ddd"
                    />
                  </div>
                </div>
              }
              {unsettleWagersList.length ? <>
                {unsettleWagersList.map((val) => {
                  return <React.Fragment key={val.WagerId}>
                    <Collapse>
                      {
                        val.WagerType !== 2
                          ? <Panel key={val.WagerId} header={<div className="bet-records-collapse">
                            <div className="race-info">
                              <h4>
                                <span>{val.WagerItems[0].SelectionDesc}</span>
                                <span className="theme-color">@{val.WagerItems[0].Odds}</span>
                              </h4>
                              {this.lineDescUI(val)}
                            </div>
                            <p className="race-status">
                              {/* 投注成功 */}
                              {(['im','saba'].indexOf(this.state.vendor) !== -1) ? val.WagerStatusName : '投注成功'}
                            </p>
                          </div>}>
                            <div className="race-content">
                              {val.WagerItems.map(item => (
                                <div key={item.EventId} className="race-item-wrap">
                                  <h4>
                                    {val.WagerItems[0].IsOutRightEvent
                                      ? <span>{val.WagerItems[0].OutRightEventName}</span>
                                      : <span>{val.WagerItems[0].HomeTeamName} VS {val.WagerItems[0].AwayTeamName} {this.getWagerScore(val.WagerItems[0])}</span>
                                    }
                                    <span>
                              {/* <div className="Games-list-title-icon">
                                <b>27'</b>
                                <ReactSVG src="/svg/betting/video.svg" className="Betting-video-svg"/>
                              </div> */}
                            </span>
                                  </h4>
                                  <p className="lightColor">{val.WagerItems[0].LeagueName}</p>
                                  {!item.IsRB ?
                                    <p className="lightColor">{`开赛时间：${item.getEventDateMoment().format('MM/DD HH:mm')}`}</p> :
                                    <p className="lightColor race__isRB">{item.RBPeriodName} {item.RBMinute}' | {item.RBHomeScore}-{item.RBAwayScore}</p>
                                  }
                                </div>
                              ))}
                              <div className="race-time-info-wrap">
                                <div className="race-result-wrap">
                                  <div className="Money-top">
                                    <p>投注额：<span className="money-wrap">￥{val.BetAmount}</span></p>
                                    <p>可赢金额：<span className="money-wrap">￥{val.PotentialPayoutAmount}</span></p>
                                  </div>
                                  <div>
                                    {val.FreeBetAmount > 0 ?
                                      <p>免费投注：<span className="money-wrap">￥{val.FreeBetAmount}</span></p> : null}
                                  </div>
                                </div>
                                <div className="bet-record-service-wrap">
                                  <div>
                                    <p className="lightColor">
                                      <span>单号：</span>
                                      <span>{val.WagerId}</span>
                                      <CopyToClipboard
                                        text={val.WagerId}
                                        onCopy={() => {
                                          Toast.success("复制成功")
                                          // Pushgtagdata(`BetRecord`, 'View', `Betrecord_copyID`);
                                        }}>
                                        <Button type="link"> 复制 </Button>
                                      </CopyToClipboard>
                                    </p>
                                    <p className="lightColor">
                                      {val.getCreateTimeMoment().format('YYYY-MM-DD HH:mm:ss')}{val.OddsTypeName ? '(' + val.OddsTypeName + ')' : ''}
                                    </p>
                                  </div>
                                  <div className="sport-sprite sport-service" onClick={() => {
                                    this.PopUpLiveChat(val);
                                    // Pushgtagdata(`CS`, 'Launch', `LiveChat_BetRecord_SB2.0`);
                                  }}></div>
                                </div>
                              </div>
                            </div>
                          </Panel>
                          : <Panel key={val.WagerId} header={<div className="bet-records-collapse mix-betting">
                            <div className="race-info">
                              <h4>
                                <span>混合投注</span>
                              </h4>
                              <p>{val.ComboTypeName} X {val.ComboCount} {val.Odds ? '@' + val.Odds : ''}</p>
                              {val.HasComboBonus ? <p className="combo-bonus-bg" onClick={(e) => {
                                e.stopPropagation();
                                this.setState({showComboBonusModal: true});
                              }}>{val.ComboBonusPercentage}%</p> : null}
                            </div>
                            <p className="race-status">
                              {/* 投注成功 */}
                              {(['im','saba'].indexOf(this.state.vendor) !== -1) ? val.WagerStatusName : '投注成功'}
                            </p>
                          </div>}>
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
                                      <span>
                                {/* <div className="Games-list-title-icon">
                                  <b>27'</b>
                                  <ReactSVG src="/svg/betting/video.svg" className="Betting-video-svg"/>
                                </div> */}
                              </span>
                                    </h4>
                                    <p className="lightColor">{item.LeagueName}</p>
                                    {!item.IsRB ?
                                      <p className="lightColor">{`开赛时间：${item.getEventDateMoment().format('MM/DD HH:mm')}`}</p> :
                                      <p className="lightColor race__isRB">{item.RBPeriodName} {item.RBMinute}' | {item.RBHomeScore}-{item.RBAwayScore}</p>
                                    }
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div className="race-content mix-race-content">
                              <div className="race-time-info-wrap">
                                <div className="race-result-wrap">
                                  <div className="Money-top">
                                    <p>投注额：<span className="money-wrap">￥{val.BetAmount}</span></p>
                                    <p>可赢金额：<span className="money-wrap">￥{val.PotentialPayoutAmount}</span></p>
                                  </div>
                                  <div>
                                    {val.HasComboBonus ?
                                      <p>额外盈利：<span className="money-wrap">￥{val.ComboBonusWinningsAmount}</span>
                                      </p> : null}
                                    {val.FreeBetAmount > 0 ?
                                      <p>免费投注：<span className="money-wrap">￥{val.FreeBetAmount}</span></p> : null}
                                  </div>
                                </div>
                                <div className="bet-record-service-wrap">
                                  <div>
                                    <p className="lightColor">
                                      <span>单号：</span>
                                      <span>{val.WagerId}</span>
                                      <CopyToClipboard
                                        text={val.WagerId}
                                        onCopy={() => {
                                          Toast.success("复制成功")
                                          // Pushgtagdata(`BetRecord`, 'View', `Betrecord_copyID`);
                                        }}>
                                        <Button type="link"> 复制 </Button>
                                      </CopyToClipboard>
                                    </p>
                                    <p className="lightColor">
                                      {val.getCreateTimeMoment().format('YYYY-MM-DD HH:mm:ss')}{val.OddsTypeName ? '(' + val.OddsTypeName + ')' : ''}
                                    </p>
                                  </div>
                                  <div className="sport-sprite sport-service" onClick={() => {
                                    this.PopUpLiveChat(val);
                                    // Pushgtagdata(`CS`, 'Launch', `LiveChat_BetRecord_SB2.0`);
                                  }}></div>
                                </div>
                              </div>
                            </div>
                          </Panel>
                      }
                    </Collapse>
                    <CashOutButtonBox
                      Vendor={Vendor}
                      wagerData={val}
                      updateLockingWager={this.updateLockingWager}
                      lockWager={this.lockWager}
                      lockingWagerId={this.state.cashOutLockingWagerData ? this.state.cashOutLockingWagerData.WagerId : null}
                      lockingWagerIsProcessing={this.state.cashOutLockingWagerIsProcessing}
                      unlockWager={this.unlockWager}
                    />
                  </React.Fragment>})}
               </> : <div className="bet-records-empty">
                <ReactIMG src="/img/emptybox.png" className="bet-records-empty-img" />
                <div className="bet-records-empty-text">
                  {
                    this.state.showCashOutOnly ? '没有兑现注单' : '暂无记录'
                  }
                </div>
              </div>}
            </TabPane>
            <TabPane tab={<div><span>已结算</span><span>{this.state.settledWagersList.length || ""}</span></div>} key="settled">
              <div className="bet-result-tools-wrapper">
                <div className="btn-wrap">
                  {dateRadioSource.map((v, i) => {
                    return <Button
                      key={"btn" + i}
                      ghost={true}
                      inline={true}
                      radius={true}
                      fufix={i === 3 ? <ReactSVG className="records-date-icon" src="/img/svg/calendar.svg"/> : null}
                      onClick={() => {
                        if (v.value === 4) {
                          this.setState({showDateRange: true})
                        } else {
                          this.setState({dateRadio: v.value})
                          this.getSettledWagers(v.value)
                        }
                        if(v.value === 1){
                          // Pushgtagdata(`BetRecord`, 'View', `Betrecord_today`);
                        }else if(v.value === 2){
                          // Pushgtagdata(`BetRecord`, 'View', `Betrecord_yesterday`);
                        }else if(v.value === 3){
                          // Pushgtagdata(`BetRecord`, 'View', `Betrecord_7days`);
                        }else if(v.value === 4){
                          // Pushgtagdata(`BetRecord`, 'View', `Betrecord_daterange`);
                        }
                      }}
                      className={this.state.dateRadio === v.value ? "active" : ""}
                    >
                       { this.state.dateRadio ===  v.value &&   v.value === 4 && this.state.date  ? moment(this.state.date[0]).format('MM/DD')+'至'+moment(this.state.date[1]).format('MM/DD') : v.text }

                    </Button>
                  })}
                </div>
                <div className="brief">
                  <span>总计 {this.state.settledWagersList.length} 单  </span>
                  <span>总投注额 : ￥{this.totalBetCurrency.toFixed(2)}</span>
                  <span>总输赢 : ￥{this.totalWinCurrency.toFixed(2)}</span>
                </div>
              </div>
              {this.state.settledWagersList.length ? <Collapse>
                {this.state.settledWagersList.map(val => {
                  return val.WagerType !== 2 ? <Panel key={val.WagerId} header={<div className="bet-records-collapse already-result">
                    <div className="race-info">
                      <h4>
                        <span>{val.WagerItems[0].SelectionDesc}</span>
                        <span className="theme-color">@{val.WagerItems[0].Odds}</span>
                      </h4>
                      {this.lineDescUI(val)}
                    </div>
                    {
                      (val.CashOutStatus == CashOutStatusType.DONE && val.CashOutAmount >0)
                        ? <p className={"race-status cashout"}>兑现成功</p>
                        : <p className={`race-status ${val.WinLossAmount > 0 ? "win" : val.WinLossAmount < 0 ? "lost" : "level"}`}>{this.getSettledWagerStatusName(val)}</p>
                    }
                  </div>}>
                    <div className="race-content">
                      {val.WagerItems.map(item => (
                        <div key={item.EventId} className="race-item-wrap">
                          <h4>
                            {item.IsOutRightEvent
                              ? <span>{item.OutRightEventName}</span>
                              : <span>{item.HomeTeamName} VS {item.AwayTeamName} {this.getWagerScore(item)}</span>
                            }
                          </h4>
                          <p>{item.LeagueName}</p>
                          <p className="race-space-between">
                            <span>开赛时间：{item.getEventDateMoment().format('MM/DD HH:mm')}</span>
                            {
                              item.GameResult ?
                              <span>赛果 {item.GameResult}</span>
                                : null
                            }
                          </p>
                        </div>
                      ))}
                      <div className="race-time-info-wrap">
                        <div className="race-result-wrap">
                          <div className="Money-top">
                            <p>投注额：<span className="money-wrap">￥{val.BetAmount}</span></p>
                            {
                              (val.CashOutStatus == CashOutStatusType.DONE && val.CashOutAmount >0)
                                ?<p>兑现金额：<span className="money-wrap">￥{val.CashOutAmount}</span></p>
                                :<p>可赢金额：<span className="money-wrap red-color">￥{val.WinLossAmount}</span></p>
                            }
                          </div>
                          <div>
                            {val.FreeBetAmount > 0 ? <p>免费投注：<span className="money-wrap">￥{val.FreeBetAmount}</span></p> : null}
                          </div>
                        </div>
                        <div className="bet-record-service-wrap">
                          <div>
                            <p className="lightColor">
                              <span>单号：</span>
                              <span>{val.WagerId}</span>
                              <CopyToClipboard
                                text={val.WagerId}
                                onCopy={() => {
                                  Toast.success("复制成功")
                                  // Pushgtagdata(`BetRecord`, 'View', `Betrecord_copyID`);
                                }}>
                                <Button type="link"> 复制 </Button>
                              </CopyToClipboard>
                            </p>
                            <p className="lightColor">
                              {val.getCreateTimeMoment().format('YYYY-MM-DD HH:mm:ss')}{val.OddsTypeName ? '(' + val.OddsTypeName + ')' : '' }
                            </p>
                          </div>
                          <div className="sport-sprite sport-service" onClick={() => {
                            this.PopUpLiveChat(val);
                            // Pushgtagdata(`CS`, 'Launch', `LiveChat_BetRecord_SB2.0`);
                          }}></div>
                        </div>
                      </div>
                    </div>
                  </Panel> : <Panel key={val.WagerId} header={<div className="bet-records-collapse already-result mix-betting">
                    <div className="race-info">
                      <h4>
                        <span>混合投注</span>
                      </h4>
                      <p>{val.ComboTypeName} X {val.ComboCount} {val.Odds ? '@' + val.Odds : '' }</p>
                      {val.HasComboBonus ? <p className="combo-bonus-bg" onClick={(e) => {e.stopPropagation(); this.setState({showComboBonusModal: true});}}>{val.ComboBonusPercentage}%</p> : null}
                    </div>
                    {
                      (val.CashOutStatus == CashOutStatusType.DONE && val.CashOutAmount > 0)
                        ? <p className={"race-status cashout"}>兑现成功</p>
                        : <p className={`race-status ${val.WinLossAmount > 0 ? "win" : val.WinLossAmount < 0 ? "lost" : "level"}`}>{this.getSettledWagerStatusName(val)}</p>
                    }
                  </div>}>
                    {val.WagerItems.map(item => (
                      <div key={item.EventId} className="mix-bet-con">
                        <div className="bet-records-collapse already-result">
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
                                : <span>{item.HomeTeamName} VS {item.AwayTeamName} {this.getWagerScore(item)}</span>
                              }
                            </h4>
                            <p>{item.LeagueName}</p>
                            <p className="race-space-between">
                              <span>开赛时间：{item.getEventDateMoment().format('MM/DD HH:mm')}</span>
                              {
                                item.GameResult ?
                                <span>赛果 {item.GameResult}</span>
                                  : null
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="race-content mix-race-content">
                      <div className="race-time-info-wrap">
                        <div className="race-result-wrap">
                          <div className="Money-top">
                            <p>投注额：<span className="money-wrap">￥{val.BetAmount}</span></p>
                            {
                              (val.CashOutStatus == CashOutStatusType.DONE && val.CashOutAmount >0)
                                ?<p>兑现金额：<span className="money-wrap">￥{val.CashOutAmount}</span></p>
                                :<p>可赢金额：<span className="money-wrap red-color">￥{val.WinLossAmount}</span></p>
                            }
                          </div>
                          <div>
                            {val.HasComboBonus ? <p>额外盈利：<span className="money-wrap">￥{Number(val.ComboBonusWinningsAmount).toFixed(2) }</span></p> : null}
                            {val.FreeBetAmount > 0 ? <p>免费投注：<span className="money-wrap">￥{val.FreeBetAmount}</span></p> : null}
                          </div>
                        </div>
                        <div className="bet-record-service-wrap">
                          <div>
                            <p className="lightColor">
                              <span>单号：</span>
                              <span>{val.WagerId}</span>
                              <CopyToClipboard
                                text={val.WagerId}
                                onCopy={() => {
                                  Toast.success("复制成功")
                                  // Pushgtagdata(`BetRecord`, 'View', `Betrecord_copyID`);
                                }}>
                                <Button type="link"> 复制 </Button>
                              </CopyToClipboard>
                            </p>
                            <p className="lightColor">
                              {val.getCreateTimeMoment().format('YYYY-MM-DD HH:mm:ss')}{val.OddsTypeName ? '(' + val.OddsTypeName + ')' : '' }
                            </p>
                          </div>
                          <div className="sport-sprite sport-service" onClick={() => {
                            this.PopUpLiveChat(val);
                            // Pushgtagdata(`CS`, 'Launch', `LiveChat_BetRecord_SB2.0`);
                          }}></div>
                        </div>
                      </div>
                    </div>
                  </Panel>
                })}
              </Collapse> : <div className="bet-records-empty">
                <ReactIMG src="/img/emptybox.png" className="bet-records-empty-img" />
                <div className="bet-records-empty-text">{ this.state.getSettledWagersHasError ? '查询失败，请点击标题重新查询' : '暂无记录'}</div>
              </div>}
            </TabPane>
          </Tabs>
        </div>
        <div className="im-rule-wrap">
        </div>
        <ComboBonusModal
          visible={this.state.showComboBonusModal}
          onClose={() => {this.setState({showComboBonusModal: false})}}
        />
        <DateRange
          dateRangeVisible={this.state.showDateRange}
          onClose={() => {
            this.setState({showDateRange: false})
          }}
          onChange={this.onChange}
          callBack={this.dateChange}
          value={this.state.date}
          maxDate={new Date()}
          minDate={new Date(moment().subtract(this.DateRangeVendorMapping[this.state.vendor],'days').format('YYYY/MM/DD HH:mm:ss'))}
        />
        {/* 提前兌現 結果彈窗 */}
        <CashOutPopup
          wagerData={this.state.cashOutWagerDataForPopup}
          unlockWager={this.unlockWager}
          showSettledWagers={this.showSettledWagers}
          reloadWagers={this.reloadWagers}
          closePopup={this.closePopup}
        />
        <BackToTop />
      </Layout>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.userInfo,
  maintainStatus: state.maintainStatus,
});

export default connect(
	mapStateToProps,
  null,
)(BetRecords);

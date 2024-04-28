import React from "react";
import {ReactSVG} from '$SBTWO/ReactSVG'
import Input from '$SBTWO/Input'
import Button from '$SBTWO/Button'
import Toast from '$SBTWO/Toast'
import Router from 'next/router'
import { withBetterRouter } from '$SBTWOLIB/js/withBetterRouter';
import { recommendSearchKeywords } from '$SBTWOLIB/js/recommendSearchKeywords'
import LazyImageForLeague from "../LazyLoad/LazyImageForLeague";
import {connect} from "react-redux";
import ReactIMG from '$SBTWO/ReactIMG';

class Search extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      searchVal: "", //搜尋框文字
      currentSearchVal: '', //當前搜索文字
      searchSportDatas: [],
      selectedSportIndex : 0,
      hasSearch: false,  //是否有執行搜索 用來決定展示 歷史+推薦 還是 搜索結果
      historyList: []
    };
    this.doSearch = this.doSearch.bind(this);
    this.addToHistory = this.addToHistory.bind(this);
    this.clearOneHistory = this.clearOneHistory.bind(this);
    this.clearAllHistory = this.clearAllHistory.bind(this);
    this.clickBack = this.clickBack.bind(this);
  }

  componentDidMount() {
    const storageKey = this.getHistoryStorageKey();
    const historyDataJSON = localStorage.getItem(storageKey);
    const historyData = JSON.parse(historyDataJSON);
    historyData && this.setState({historyList: historyData})

    if (this.props.router.query.keyword) {
      this.doSearch({target: {value: this.props.router.query.keyword}});
    }
  }

  //分vendor和用戶名 儲存
  getHistoryStorageKey() {
    const { Vendor } = this.props;
    const loginInfo = Vendor._getLoginInfo();
    let memberCode = '';
    if (loginInfo) {
      memberCode = loginInfo.memberCode;
    }
    return 'HISTORY-' + memberCode + '-' + Vendor.configs.VendorName;
  }

  doSearch({target: {value: v}}) {
    Toast.loading();
    // Pushgtagdata(`Game Nav`, 'Submit', `Search_SearchPage_SB2.0`);
    this.props.Vendor.search(v)
      .then(datas => {
        this.setState({
          searchVal: v,
          currentSearchVal: v,
          searchSportDatas: datas,
          selectedSportIndex: 0,
          hasSearch: true,
        },() => {
          Toast.destroy();
          this.addToHistory(this.state.searchVal);
        });
      })
      .catch(err => {
        console.log('===search err',err);
        Toast.error('搜索失败，请稍候重试');
      })
  }

  addToHistory(v) {
    const storageKey = this.getHistoryStorageKey();
    const currentHistoryDataJSON = localStorage.getItem(storageKey);
    const currentHistoryDataParsed = currentHistoryDataJSON ? JSON.parse(currentHistoryDataJSON) : [];
    const currentHistoryData = (currentHistoryDataParsed && Array.isArray(currentHistoryDataParsed)) ? currentHistoryDataParsed : [];
    currentHistoryData.unshift(v); //用unshift把新的堆在最上面
    //去重複
    let uniqueHistoryData = currentHistoryData.filter((item, index) => currentHistoryData.indexOf(item) === index);
    //最多5個
    if (uniqueHistoryData && uniqueHistoryData.length > 5) {
      uniqueHistoryData = uniqueHistoryData.filter((data,index) => index < 5)
    }
    localStorage.setItem(storageKey, JSON.stringify(uniqueHistoryData));
    this.setState({historyList: uniqueHistoryData});
  }

  clearOneHistory(v) {
    const storageKey = this.getHistoryStorageKey();
    const currentHistoryDataJSON = localStorage.getItem(storageKey);
    const currentHistoryDataParsed = currentHistoryDataJSON ? JSON.parse(currentHistoryDataJSON) : [];
    const currentHistoryData = (currentHistoryDataParsed && Array.isArray(currentHistoryDataParsed)) ? currentHistoryDataParsed : [];
    const newHistoryData = currentHistoryData.filter(d => d !== v);
    //去重複
    const uniqueHistoryData = newHistoryData.filter((item, index) => newHistoryData.indexOf(item) === index);
    localStorage.setItem(storageKey, JSON.stringify(uniqueHistoryData));
    this.setState({historyList: uniqueHistoryData});
  }

  clearAllHistory() {
    const storageKey = this.getHistoryStorageKey();
    localStorage.removeItem(storageKey);
    this.setState({historyList: []});
  }

  //點擊返回
  clickBack() {
    const { hasSearch } = this.state;

    if (hasSearch) { //如果在搜索結果頁點返回，是返回歷史+推薦
      this.setState({hasSearch: false});
    } else { //在歷史+推薦頁 點返回，回到主頁
      //默認使用routerFilter存下的主頁面查詢參數
      const {Vendor,routerLog} = this.props;
      let query = null;
      let log = routerLog['/sbtwo' + Vendor.configs.VendorPage];
      if (log && log.query) {
        query = log.query;
      }

      Router.push({
        pathname: '/sbtwo' + Vendor.configs.VendorPage,
        query: query
      });
    }
  }

  render() {
    const {Vendor} = this.props;
    const { searchVal, currentSearchVal, hasSearch, searchSportDatas, selectedSportIndex } = this.state;

    const vendorProp = Vendor.configs.VendorName.toLowerCase(); //獲取推薦搜索 使用

    const selectedSportData = searchSportDatas[selectedSportIndex];

    return (
      <div className={`sport-container-wrapper fixed-header`}>
        {/* 頭部 */}
        <div className="sbtwo-header-wrapper header-search">
          <ReactSVG className="back-icon" src="/img/svg/LeftArrow.svg" onClick={this.clickBack}/>
          <span className="header-search-wrapper">
            <Input
              className="input-search"
              placeholder={"请输入关键字"}
              value={this.state.searchVal}
              prefix={
                <ReactSVG
                  className="loginSVG icon-search"
                  src={`/img/svg/Search.svg`}
                />
              }
              suffix={
                <span className="button-search" onClick={() => this.doSearch({target:{value: searchVal}})}>
                    搜索
                </span>
              }
              onChange={ ({target: {value: v}}) => {
                let newState = {searchVal: v}
                if (!v || v.length <=0) {
                  newState['hasSearch'] = false; //清空搜索文字時也清空搜索結果
                }
                this.setState(newState)
              } }
              isClear={true}
              maxLength={20}
            />
          </span>
        </div>
        {/* 內容 */}
        <div className="sport-content">
          {/* 搜索结果 */}
          {(hasSearch && searchSportDatas.length > 0) ?
            <div className="search-result-wrap">
              {/* 搜索結果 體育tab */}
              <div className="search-sport-tabs">
                {searchSportDatas.map((sport,index) => {
                  return <div
                    className={"search-sport-tab" + (selectedSportIndex === index ? " selected" : "")}
                    key={sport.SportId}
                    onClick={() => {
                      if (this.state.selectedSportIndex !== index) {
                        this.setState({selectedSportIndex: index})
                      }
                    }}
                  >
                    {sport.SportName}
                  </div>
                })}
              </div>
              {/* 搜索結果 聯賽和賽事 */}
              <div className="search-result-lists">
                {
                  selectedSportData ?
                    selectedSportData.Leagues.map(league => {
                      return <div className="search-league-wrapper" key={league.LeagueId}>
                        <div className="search-league-row">
                          <LazyImageForLeague Vendor={Vendor} LeagueId={league.LeagueId}/>
                          <div className="search-league-name"
                               dangerouslySetInnerHTML={{
                                 __html: league.getHighlightLeagueName(currentSearchVal)
                               }}
                          />
                        </div>
                        <div className="search-events-wrapper">
                        {
                          league.Events.map(event => {
                            return <div
                              key={event.EventId}
                              className="search-event-wrapper"
                              onClick={() => {
                                // Pushgtagdata(`Game Nav`, 'Launch', `Match_Search_SB2.0`);
                                Router.push('/sbtwo' + this.props.Vendor.configs.VendorPage + "/detail/?sid=" + event.SportId + "&eid=" + event.EventId + "&lid=" + event.LeagueId + '&from=search@' + currentSearchVal)
                              }}
                            >
                              <div className="search-event-left">
                                <div className="search-event-team-row">
                                  <div className="search-event-team"
                                       dangerouslySetInnerHTML={{
                                         __html: event.getHighlightHomeTeamName(currentSearchVal)
                                       }}
                                  />
                                  <div className="search-event-team-vs">vs</div>
                                  <div className="search-event-team"
                                       dangerouslySetInnerHTML={{
                                         __html: event.getHighlightAwayTeamName(currentSearchVal)
                                       }}
                                  />
                                </div>
                                <div className="search-event-datetime-row">
                                  {event.getEventDateMoment().format('YYYY/MM/DD hh:mmA')}
                                </div>
                              </div>
                              <div className="search-event-right">
                                <ReactSVG src="/img/svg/RightArrow.svg" />
                              </div>
                            </div>
                          })
                        }
                        </div>
                      </div>
                    })
                    : null
                }
              </div>
            </div>
            : null}
          {/* 无搜索结果 */}
          {(hasSearch && searchSportDatas.length <= 0) ? <div className="no-result center">
            <ReactIMG src="/img/no-result.png"/>
            <h4>无数据</h4>
            <p>无搜索结果，请尝试其它关键词</p>
          </div> : null}
          {/* 搜索历史列表 */}
          {!hasSearch ? <>
          {
            this.state.historyList && this.state.historyList.length > 0 ?
            <div className="search-list-wrap">
              <div className="search-history-title">
                <div className="search-history-title-text">历史搜索</div>
                  <Button onClick={this.clearAllHistory} inline={true} type="link">
                    清除历史
                  </Button>
              </div>
              <ul className="search-list-2">
                {this.state.historyList.length ? this.state.historyList.map((val, index) => {
                  return <li key={index} onClick={() => {
                    this.doSearch({target: {value: val}})
                  }}>
                    <ReactSVG className="search-list-icon" src="/img/svg/Search.svg"/>
                    <span>{val}</span>
                    <ReactSVG onClick={((e) => {
                      e.stopPropagation();
                      this.clearOneHistory(val)
                    })} className="search-list-clear-icon" src="/img/svg/close.svg"/>
                  </li>
                }) : <li className="center"><span>暂无记录</span></li>}
              </ul>
            </div>
              : null
          }
            <div className="search-recommend">
              <div className="search-recommend-title-text">推荐搜索</div>
              <ul className="search-list-3">
                {
                  recommendSearchKeywords.map((item,index) => {
                    return <li
                      key={index}
                      onClick={() => {
                        this.doSearch({target: {value: item[vendorProp]}})
                      }}
                    >
                      <span>{item.keyword}</span>
                    </li>
                  })
                }
              </ul>
            </div>
          </> : null}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  routerLog: state.routerLog
});

export default withBetterRouter(
  connect(
    mapStateToProps,
    null,
  )(Search)
);

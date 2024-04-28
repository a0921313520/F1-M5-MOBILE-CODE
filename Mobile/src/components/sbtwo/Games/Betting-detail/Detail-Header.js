import { ReactSVG } from '$SBTWO/ReactSVG';
import Toast from '$SBTWO/Toast';
import Router from 'next/router';
import LazyImageForTeam from "$SBTWO/LazyLoad/LazyImageForTeam";
import {VendorMarkets} from "$SBTWOLIB/vendor/data/VendorConsts";
import { getStyle } from "$SBTWOLIB/js/Helper";
import {connect} from "react-redux";
import { Textfit } from 'react-textfit';
import VideoPlayer from './Player';
import React from "react";
import ReactIMG from '$SBTWO/ReactIMG';
import { checkIsLogin, redirectToLogin } from '$SBTWOLIB/js/util';
import i18n from '$SBTWOLIB/vendor/vendori18n';

class DetailHeader extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
           showType: this.props.defaultShowType ? parseInt(this.props.defaultShowType) : 0, // 0: 主Header  1: 视频  2: 动画  3: 分析
           src: null,
           isFullScreenSlider: false,
           isLandscape: false,
           showScaleIcon: false
        }

        this.toggleMainPage = this.toggleMainPage.bind(this);
        this.isLandscape = this.isLandscape.bind(this);
        this.detailBannerRef = React.createRef();
    }
    componentDidMount () {
        this.setState({src: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"});

        if (this.props.setRef) { //注意miniEvent沒有帶這個ref 只有詳情頁有
            this.props.setRef(this.detailBannerRef); //不知道為啥配置不上，只能在這裏再手工配置一次
        }

        if (!this.props.thumbStatus) {
            this.isLandscape();
            window.addEventListener('resize', this.isLandscape);
            window.addEventListener('orientationchange', this.isLandscape); //嘗試解決IOS問題
            (document.fullscreenElement ||
                document.msFullscreenElement ||
                document.mozFullScreenElement ||
                document.webkitFullscreenElement ||
                false) && this.setState({showScaleIcon: true});
        }
        const {EventData} = this.props;
        if(Router.router){
            if(Router.router.query.open == '1' && EventData.HasLiveStreaming){
                if (!checkIsLogin()) {
                    redirectToLogin();
                    return;
                }
                setTimeout(()=>{
                    this.player && this.player.play();
                },1000)
                this.setState({showType: 1});
                // Pushgtagdata(`Match_Feature`, 'View', 'Match_livestream');
            }else if(Router.router.query.open == '2' && EventData.HasVisualization){
                if (!checkIsLogin()) {
                    redirectToLogin();
                    return;
                }
                this.setState({showType: 2});
                // Pushgtagdata(`Match_Feature`, 'View', 'Match_animation');
            }
        }

    }
    componentWillUnmount () {
        if (!this.props.thumbStatus) {
            window.removeEventListener('resize', this.isLandscape);
            window.removeEventListener('orientationchange', this.isLandscape); //嘗試解決IOS問題
        }
    }

    isLandscape() {
        if (getStyle(document.getElementById("betting_list_detail"), "position") !== "fixed") {
            this.props.handle.exit()
            this.props.setIsLandscape(false);
            this.setState({
                isFullScreenSlider: false,
                isLandscape: false
            });
            document.querySelector(".Betting-type").style = "";
            document.querySelector(".Betting-detail-header").style = "";
            if(document.querySelector(".Detail-menu")){
                document.querySelector(".Detail-menu").style = "";
            }
            if(document.querySelector(".Collapselist")){
                document.querySelector(".Collapselist").style = "";
            }
        } else {
            this.props.setFixed(false);
            this.props.setIsLandscape(true);
            this.setState({isLandscape: true});
        }
    }
    toggleMainPage() {
        if (getStyle(document.getElementById("betting_list_detail"), "position") === "fixed") {
            let width = parseInt(getStyle(document.getElementById("__next"), "width")), widthProportion = width * 0.6;
            if (this.state.isFullScreenSlider) {
                this.setState({isFullScreenSlider: false});
                document.querySelector(".Betting-type").style = "width:" + width + "px;";
                document.querySelector(".Betting-detail-header").style = "transform:translateX(" + width + "px);";
                document.querySelector(".Detail-menu").style = "transform:translateX(" + width + "px);";
                document.querySelector(".Collapselist").style = "transform:translateX(" + width + "px);";
            } else {
                this.setState({isFullScreenSlider: true});
                document.querySelector(".Betting-type").style = "width:" + widthProportion + "px;";
                document.querySelector(".Betting-detail-header").style = "transform:translateX(" + widthProportion + "px);";
                if(document.querySelector(".Detail-menu"))document.querySelector(".Detail-menu").style = "transform:translateX(" + widthProportion + "px);";
                if(document.querySelector(".Collapselist"))document.querySelector(".Collapselist").style = "transform:translateX(" + widthProportion + "px);";
            }
        }
    }

    backToListWithMinifyWindow() {
        //默認使用routerFilter存下的主頁面查詢參數
        const {Vendor,routerLog,EventData} = this.props;

        let query = null;
        let log = routerLog['/sbtwo' + Vendor.configs.VendorPage];
        if (log && log.query) {
            query = log.query;
        }
        //console.log('===back and minify',JSON.parse(JSON.stringify(query)));

        if (query === null) {
            query = {};
            //整頁刷新就會拿不到來源，使用當前的EventData做為參考
            if (EventData) {
                query.SportId = EventData.SportId;
                query.MarketId = EventData.MarketId;
                //早盤需要指定日期
                if (parseInt(EventData.MarketId) === VendorMarkets.EARLY) {
                    const targetDate = EventData.getEventDateMoment().format('YYYY-MM-DD');
                    query.StartDate = targetDate;
                    query.EndDate = targetDate;
                }
            }
        }

        //加上要展示的賽事信息
        if (EventData) {
            query.miniEventId =EventData.EventId;
            query.miniSportId =EventData.SportId;
            query.miniLeagueId =EventData.LeagueId;
            query.miniShowType = this.state.showType;
        }

        Router.push({
            pathname: '/sbtwo' + Vendor.configs.VendorPage,
            query: query
        });
    }



    /* 设置全屏投注样式 */
    // FullScreenstyle=()=>{
    //     document.body.style.overflow='hidden'
    // }
    render () {
        const {EventData,Vendor} = this.props;

        const liveStramingInfo = (EventData.HasLiveStreaming && EventData.LiveStreamingUrl) ? EventData.LiveStreamingUrl[0] : null;

        return <div className={'Betting-type' + ' Betting-type-' + this.state.showType} ref={this.detailBannerRef}>
            <div className="Betting-header-top-buttons">
                {
                  this.props.thumbStatus ? null :
                  <> {/* 縮小按鈕 */}
                      <ReactSVG
                        src="/img/svg/betting/down_arrow.svg"
                        className="bet-arrow-icon"
                        onClick={() => {
                            this.backToListWithMinifyWindow();
                            // Pushgtagdata(`Game Feature`, 'Click', 'Minimize_MatchFeature_SB2.0');
                        }}
                      />
                     {/* 關閉按鈕 */}
                     {this.state.showType !== 0 ? <ReactSVG
                       src="/img/svg/close.svg"
                       className="live-close-icon"
                       onClick={() => {
                           this.setState({showType: 0});
                           //關閉視頻播放
                           if (this.state.showType === 1 && this.player) {
                               this.player.pause();
                           }
                       }}
                     /> : null}
                  </>
                }
            </div>
            {this.state.showType === 0 ? <>
                <ul className="Betting-header-score">
                    <li>
                        <LazyImageForTeam Vendor={Vendor} TeamId={EventData.HomeTeamId} IconUrl={EventData.HomeIconUrl}/>
                        <p className="team-name">{EventData.HomeTeamName}</p>
                        {
                            (EventData.IsRB && EventData.HomeRedCard && parseInt(EventData.HomeRedCard) > 0) ?
                                <span className="pk-number">{EventData.HomeRedCard}</span>
                                : <span className="pk-number noData">&nbsp;</span>
                        }
                    </li>
                    <li className="Game-info">
                        {
                            EventData.IsRB ? <>
                                <Textfit mode="single" forceSingleModeWidth={true} className="Game-team-pk">
                                    <span className={EventData.HomeScore > 0 ? 'notZero' : ''}>{EventData.HomeScore}</span>
                                    <span style={{padding: '10px'}}>-</span>
                                    <span className={EventData.AwayScore > 0 ? 'notZero' : ''}>{EventData.AwayScore}</span>
                                </Textfit>
                                {
                                    EventData.RBMinute > 0 &&
                                    <div className="Game-number">{EventData.RBMinute}'</div>
                                }
                                {
                                    EventData.HasCornerData &&
                                    <span>
                                    <ReactIMG src="/img/svg/betting/red-j.svg" className="REDSVG"/>
                                    <span className="REDSVG-NEXT">{EventData.HomeCorner ?? 0}-{EventData.AwayCorner ?? 0}</span>
                                    </span>
                                }
                            </>
                            : <>
                                    <div className="Game-date">{EventData.getEventDateMoment().format('MM/DD HH:mm')}</div>
                                    <p className="Game-team-pk">VS</p>
                                    <div className="Game-notRB">未开始</div>
                            </>
                        }
                    </li>
                    <li>
                        <LazyImageForTeam Vendor={Vendor} TeamId={EventData.AwayTeamId} IconUrl={EventData.AwayIconUrl}/>
                        <p className="team-name">{EventData.AwayTeamName}</p>
                        {
                            (EventData.IsRB && EventData.AwayRedCard && parseInt(EventData.AwayRedCard) > 0) ?
                                <span className="pk-number">{EventData.AwayRedCard}</span>
                                : <span className="pk-number noData">&nbsp;</span>
                        }
                    </li>
                </ul>
                <div className="Footer-menu">
                    {
                        EventData.HasLiveStreaming ?
                        <div onClick={() => {
                            if (!checkIsLogin()) {
                                redirectToLogin();
                                return;
                            }
                            if (this.player) {
                                this.player.play();
                            }
                            this.setState({showType: 1});
                            // Pushgtagdata(`Game Feature`, 'View', 'Livestream_MatchFeature_SB2.0 ');
                        }}>视频</div>
                            : null
                    }
                    {
                        EventData.HasVisualization ?
                        <div onClick={() => {
                            if (!checkIsLogin()) {
                                redirectToLogin();
                                return;
                            }
                            this.setState({showType: 2});
                            // Pushgtagdata(`Game Feature`, 'View', 'Animation_MatchFeature_SB2.0');
                        }}>动画</div>
                            : null
                    }
                    {
                        EventData.HasStatistic ?
                        <div onClick={() => {
                            //this.setState({showType: 3});
                            if (!checkIsLogin()) {
                                redirectToLogin();
                                return;
                            }
                            Toast.info("暂未开放！")
                            // Pushgtagdata(`Game Feature`, 'View', 'Stats_MatchFeature_SB2.0');
                        }}>数据</div>
                            : null
                    }
                    {
                        !EventData.HasLiveStreaming && !EventData.HasVisualization && !EventData.HasStatistic &&
                        <div className="noData">暂无视频/动画/数据</div>
                    }
                </div>
            </> : null}
            <div className="Betting-header-bottom-buttons">
            {this.props.thumbStatus ? null : (
                <>
                  {/* 橫屏 投注按鈕  */}
                  <ReactSVG
                    src={`/img/svg/betting/${this.state.isFullScreenSlider ? "detail_bet_record_checked" : "detail_bet_record"}.svg`}
                    className="bet-record-icon"
                    onClick={() => {
                        // this.props.scaleStatus && this.setState({showBet: true});
                        if (!checkIsLogin()) {
                            redirectToLogin();
                            return;
                        }
                        this.toggleMainPage();
                        // Pushgtagdata(`Game Feature`, 'View', 'ViewOdds_Landscape_MatchFeature_SB2.0');
                    }}
                  />
                  {/* 橫屏 全屏按鈕 已經棄用 */}
                  {this.state.showScaleIcon ? <ReactSVG
                    src={`/img/svg/betting/${this.props.scaleStatus ? "detail_scale" : "scale-big"}.svg`}
                    className="bet-scale-icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        this.props.setFixed(false);
                        this.props.scaleStatus ? this.props.handle.exit() : this.props.handle.enter();
                        // this.FullScreenstyle();
                    }}
                  /> : null}
                  {/* 豎屏 pin按鈕  */}
                  <ReactSVG
                    src={`/img/svg/betting/${this.props.fixedStatus ? "tag_entry" : "tag_cancel"}.svg`}
                    className="tag-entry-icon"
                    onClick={() => {this.props.setFixed(!this.props.fixedStatus)}}
                  />
                </>
            )}
            </div>
            {
                (liveStramingInfo && liveStramingInfo.Url)
                  ?
                    (liveStramingInfo.type === 'H5')
                    ?
                        <iframe
                          src={liveStramingInfo.Url}
                          frameBorder="0" width="100%" height="100%" style={{
                            display: this.state.showType === 1 ? "block" : "none"
                        }}/>
                    :
                      <VideoPlayer
                        setPlayer={(v) => {
                            this.player = v
                        }}
                        display={this.state.showType === 1 ? "block" : ""}
                        autoPlay={(this.props.thumbStatus && this.state.showType === 1)}
                            src={liveStramingInfo.Url}
                      />
                  : null
            }
            {
                EventData.HasVisualization && this.state.showType === 2 ?
                  <iframe
                    src={'https://www.zbxz88.com/cms/F1/brevent.html?lang=' + i18n.IM.BetRadar.LANG + '&timezone=' + i18n.IM.BetRadar.TIMZONE + '&layout=single&brEventId=' + EventData.BREventId}
                    frameBorder="0" width="100%" height="100%" style={{
                      display: this.state.showType === 2 ? "block" : "none"
                  }}></iframe>
                  : null
            }
        </div>
    }
}

const mapStateToProps = state => ({
    routerLog: state.routerLog
});

export default connect(
      mapStateToProps,
      null,
    )(DetailHeader)

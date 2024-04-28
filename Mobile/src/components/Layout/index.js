import React from "react";
import Head from "next/head";
import Header from "@/components/Header";
import BackBar from "@/components/Header/BackBar";
import TabBar from "@/components/Layout/TabBar/";
import Maintain from "@/components/View/Maintain";
import Router from "next/router";
import { withBetterRouter } from "@/lib/js/withBetterRouter";
import { checkIsLogin, setIsLogin, setIsLogout, redirectToLogin } from "@/lib/js/util";
import { CSSTransition } from "react-transition-group";
import { ReactSVG } from "@/components/View/ReactSVG";
import "@/lib/js/Globalfun";
import { connect } from "react-redux";
import {
    ACTION_UserInfo_getBalance,
    ACTION_UserInfo_login,
    ACTION_User_getDetails,
} from "@/lib/redux/actions/UserInfoAction";
import { getUrlVars } from "@/lib/js/Helper";
import { ApiPort } from "@/api/index";
import { fetchRequest } from "@/server/Request";
import { SuspendBtn } from "@/components/View/SuspendBtn/";
import ReactIMG from "@/components/View/ReactIMG";
import SelfExclusionModal from "@/components/SelfExclusionModal/";
import HostConfig from "@/server/Host.config";
// 默认显示的状态值
global.HttpStatus = 0;
function MainComponent(props) {
    const status = props.status ? props.status : props.status === 0 ? 0 : 1;
    const commonParams = {
        // ChangeTheme: ChangeTheme
    };
    const notificationInfo = (
        <CSSTransition
            in={!!props.notificationInfo}
            appear={true}
            classNames="notification-scale"
            timeout={160}
            onExited={() => {}}
        >
            <div className="notification-message">
                <ReactIMG src="/img/ball_notification.png" />
                {props.notificationInfo}
            </div>
        </CSSTransition>
    );
    const notificationRecommend = (
        <CSSTransition
            in={!!props.notificationRecommend}
            appear={true}
            classNames="notification-scale"
            timeout={160}
            onExited={() => {}}
        >
            <div
                className="notification-message recommend"
                onClick={() => {
                    if (parseInt(props.notificationRecommend.id) === 0) {
                        return false; //如果MsgID === 0 表示是帳戶信息，無法點開看細節
                    }
                    Router.push({
                        pathname: "/notification-detail",
                        query: {
                            id: props.notificationRecommend.id,
                            type: props.notificationRecommend.type,
                        },
                    });
                }}
            >
                <ReactIMG src="/img/notification_recommed.png" />
                {props.notificationRecommend ? (
                    <div className="notification-recommend-wrap">
                        <h4>{props.notificationRecommend.title}</h4>
                        <p
                            dangerouslySetInnerHTML={{
                                __html: props.notificationRecommend.info,
                            }}
                        />
                    </div>
                ) : null}
                <ReactSVG
                    src="/img/svg/close.svg"
                    className="notification-close-icon"
                    onClick={props.closeNotificationRecommend}
                />
            </div>
        </CSSTransition>
    );

    if (global.HttpStatus === -100) {
        return <div />;
    }

    switch (status) {
        case 0:
            return <React.Fragment>{props.children}</React.Fragment>;
        case 1: // Default Value  默认只包含Header
            return (
                <div className={`sport-container-wrapper fixed-header`}>
                    <Header
                        key="main-header"
                        showAppDownloadBar={props.showAppDownloadBar}
                        closeAppDownloadBar={props.closeAppDownloadBar}
                        {...commonParams}
                        hasServer={props.hasServer}
                    />
                    <div
                        className={
                            "sport-content" +
                            (props.showAppDownloadBar
                                ? " withAppDownloadbar"
                                : "")
                        }
                    >
                        {/* {notificationInfo} */}
                        {/* {notificationRecommend} */}
                        {props.children}
                    </div>
                </div>
            );
        case 2: // 只包含有返回上一页的Header
            return (
                <div
                    className={`sport-container-wrapper ${
                        props.barFixed ? "fixed-header" : ""
                    }`}
                >
                    <BackBar
                        key="main-bar-header"
                        title={props.BarTitle}
                        backEvent={props.backEvent}
                        hasServer={props.hasServer}
                        {...commonParams}
                        hideBack={props.hideBack}
                    />
                    <div className="sport-content">
                        {/* {notificationInfo}
						{notificationRecommend} */}
                        {props.children}
                    </div>
                </div>
            );
        case 3: // 包含Header和TabBar
            return (
                <div className={`sport-container-wrapper`}>
                    <Header
                        hasServer={props.hasServer}
                        key="main-header"
                        showAppDownloadBar={props.showAppDownloadBar}
                        closeAppDownloadBar={props.closeAppDownloadBar}
                        {...commonParams}
                    />
                    <div
                        className={
                            "sport-content" +
                            (props.showAppDownloadBar
                                ? " withAppDownloadbar"
                                : "")
                        }
                    >
                        {/* {notificationInfo}
						{notificationRecommend} */}
                        {props.children}
                    </div>
                    <TabBar key="main-footer" />
                </div>
            );
        case 4: // Header页面自定义所以只包含TabBar
            return (
                <div className={`sport-container-wrapper`}>
                    <div
                        className={
                            "sport-content" +
                            (props.showAppDownloadBar
                                ? " withAppDownloadbar"
                                : "")
                        }
                    >
                        {/* {notificationInfo}
						{notificationRecommend} */}
                        {props.children}
                    </div>
                    <TabBar key="main-footer" />
                </div>
            );
        case 5: //包含返回上一頁header及TabBar
            return (
                <div className={`sport-container-wrapper`}>
                    <BackBar
                        key="main-bar-header"
                        title={props.BarTitle}
                        backEvent={props.backEvent}
                        hasServer={props.hasServer}
                        {...commonParams}
                        hideBack={props.hideBack}
                    />

                    <div
                        className={
                            "sport-content" +
                            (props.showAppDownloadBar
                                ? " withAppDownloadbar"
                                : "")
                        }
                    >
                        {props.children}
                    </div>
                    <TabBar key="main-footer" />
                </div>
            );
        case 666: // 维护界面
            return <Maintain />;
        case 999: //初始頁，不處理任何東西，因為馬上就會跳走
            return <React.Fragment>{props.children}</React.Fragment>;
        default:
            return <div>500 Error!</div>;
    }
}

class Layout extends React.Component {
    static defaultProps = {
        title: "FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台",
        Description:
            "Fun88乐体育提供全球热门赛事资讯，欧洲足球五大联赛、世界杯、NBA、CBA、中超等赛程，一手掌握最新赛况，即时享受竞猜乐趣",
        Keywords:
            "Fun88,Fun88乐天堂体育，乐体育,fun88乐体育,IM平台,BTI平台,虚拟货币,USDT,体育竞猜,欧冠竞猜,英超竞猜,NBA竞猜",
        barFixed: false,
        hasServer: false,
    };
    constructor() {
        super();
        this.state = {
            miniGames: "",
            closeGames: false,
            notificationInfo: "",
            notificationRecommendInfo: null,
            showAppDownloadBar: false, //展示app下載橫幅(會影響sport-content，所以這個state不能放header裡面)
        };
    }
    componentDidMount() {
        let vars = getUrlVars();
        if (vars.aff && vars.aff !== "") {
            //console.log('=== get affcode ', vars.aff);
            sessionStorage.setItem("affCode", vars.aff);
        }
        // window.Pushgtagdata = (category, action, name) => {
        // 	if (typeof _paq === 'object') {
        // 		_paq.push([ 'trackEvent', category, action, name ]);
        // 	}
        // };

        setTimeout(() => {
            if (!document.getElementById("e2_blackbox")) {
                let e2src = "https://e2.platform88798.com/E2/EagleEye.js";

                if (!HostConfig.Config.isLIVE) {
                    e2src = "https://ytl.ylyofb45n.com/E2/EagleEye.js";
                }
                let scriptLink = document.createElement("script");
                scriptLink.id = "e2_blackbox";
                scriptLink.src = e2src;
                scriptLink.type = "text/javascript";
                scriptLink.onload = () => {
                    global.e2BlackBox =
                        window.E2GetBlackbox && window.E2GetBlackbox().blackbox;
                };
                document.querySelectorAll("body")[0].appendChild(scriptLink);
            }
        }, 5000);

        //是否展示app下載橫幅
        let showAppDownloadBar = false;
        if (
            !sessionStorage.getItem("appdownload-closed") //用seesionStorage滿足需求
            //&& checkIsLogin()
        ) {
            showAppDownloadBar = true;
        }
        if (this.state.showAppDownloadBar !== showAppDownloadBar) {
            //有變更才配置
            this.setState({ showAppDownloadBar });
        }

        //this.getMiniGameInfo();
        this.CheckUrkTokenToLogin();
    }

    CheckUrkTokenToLogin() {
        let vars = getUrlVars();
        if (vars.ref && vars.ref !== "" && vars.token && vars.token !== "") {
            localStorage.setItem(
                "memberToken",
                JSON.stringify("Bearer" + " " + vars.token)
            );
            localStorage.setItem("refreshToken", JSON.stringify(vars.ref));
        } else {
            return;
        }
        setIsLogin();

        setTimeout(() => {
            this.props.userInfo_login();
            this.props.userInfo_getDetails();
            this.props.userInfo_getBalance(true);
        }, 1000);

        setTimeout(() => {
            this.RefreshToken(vars.ref);
        }, 3000);
    }

    /**
     * @description: 刷新令牌
     * @param {*}
     * @return {*}
     */
    RefreshToken = (rstoken) => {
        const postData = {
            grantType: "refresh_token",
            clientId: "Fun88.CN.App",
            clientSecret: "FUNmuittenCN",
            refreshToken: rstoken,
        };

        fetchRequest(ApiPort.RefreshTokenapi, "POST", postData)
            .then((res) => {
                if (res.isSuccess) {
                    if (res.result.accessToken && res.result.refreshToken) {
                        localStorage.setItem(
                            "memberToken",
                            JSON.stringify("Bearer " + res.result.accessToken)
                        );
                        ApiPort.Token = "Bearer " + res.result.accessToken;
                        localStorage.setItem(
                            "refreshToken",
                            JSON.stringify(res.result.refreshToken)
                        );
                    } else {
                        Toast.error("Vui lòng đăng nhập lại, quyền truy cập đã hết hạn", 3);
                        setIsLogout();
						redirectToLogin();
                    }
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    //获取游戏活动
    getMiniGameInfo = () => {
        //每次有新活動 改這些設定
        const currentEventName = "event_MidAutumn2022"; //活動名稱(對應api返回的)
        const currentEventPageUrl = "/event_MidAutumn2022"; //活動頁router路徑
        const currentEventClickPiwikName = "ENTER_" + currentEventName; //點擊事件piwik名字

        fetchRequest(ApiPort.MiniGamesInfo, "get")
            .then((data) => {
                if (data && data.result) {
                    let game = data.result.find(
                        (item) => item.name == currentEventName
                    );
                    if (game) {
                        //把活動配置保存在miniGames
                        game.eventPageUrl = currentEventPageUrl;
                        game.eventClickPiwikName = currentEventClickPiwikName;
                        this.setState({
                            miniGames: game,
                        });
                        localStorage.setItem("miniGames", JSON.stringify(game));
                    } else {
                        this.setState({
                            miniGames: null,
                        });
                        localStorage.removeItem("miniGames");
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    render() {
        const { title, Description, Keywords, seoData } = this.props;
        return (
            <div>
                <Head key="layout-head">
                    <title>{seoData?.title ?? title}</title>
                    <meta charSet="utf-8" />
                    <meta
                        httpEquiv="X-UA-Compatible"
                        content="IE=edge,chrome=1"
                    />
                    <meta
                        key="viewport"
                        name="viewport"
                        content="width=device-width,initial-scale=1.0,maximum-scale=1.0,viewport-fit=cover"
                    />
                    <meta name="description" content={seoData?.description ?? Description} />
                    <meta name="Keywords" content={seoData?.keyword ?? Keywords} />
                    <meta name="x5-orientation" content="portrait" />{" "}
                    {/* QQ 竖屏锁定 */}
                    <meta name="screen-orientation" content="portrait" />{" "}
                    {/* UC 竖屏锁定 */}
                    <link
                        rel="shortcut icon"
                        type="image/x-icon"
                        href={process.env.BASE_PATH + `/img/favicon.ico`}
                    />
                </Head>

                <MainComponent
                    {...this.props}
                    notificationInfo={this.state.notificationInfo}
                    notificationRecommend={this.state.notificationRecommendInfo}
                    closeNotification={() => {
                        this.setState({ notificationInfo: "" });
                    }}
                    closeNotificationRecommend={(e) => {
                        e.stopPropagation();
                        this.setState({ notificationRecommendInfo: null });
                    }}
                    showAppDownloadBar={this.state.showAppDownloadBar}
                    closeAppDownloadBar={() => {
                        this.setState({ showAppDownloadBar: false }, () => {
                            sessionStorage.setItem("appdownload-closed", "1");
                        });
                    }}
                    key="main-component"
                />
                <div id="customerLandscape" isvertical="1" />
                {/* {this.state.miniGames !== null ? (
					<SuspendBtn
						iconImgUrl={this.state.miniGames.featureIconUrl}
						clickGoRed={() => {
							Router.push(this.state.miniGames.eventPageUrl);
							Pushgtagdata(`Engagement_Event`, 'Click', this.state.miniGames.eventClickPiwikName);
						}}
					/>
				) : null} */}

                {/* 自我限制彈窗 */}
                <SelfExclusionModal
                    ModalType={1}
                    OpenModalUrl="Home"
                    afterCloseModal={() => {
                        Router.push("/");
                    }}
                />
            </div>
        );
    }
}

const mapDispatchToProps = {
    userInfo_login: (username) => ACTION_UserInfo_login(username),
    userInfo_getDetails: () => ACTION_User_getDetails(),
    userInfo_getBalance: (forceUpdate = false) =>
        ACTION_UserInfo_getBalance(forceUpdate),
};

export default withBetterRouter(connect(null, mapDispatchToProps)(Layout));

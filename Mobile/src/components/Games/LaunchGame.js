/*
 * @Author: Alan
 * @Date: 2022-12-19 16:11:58
 * @LastEditors: Alan
 * @LastEditTime: 2023-07-24 11:51:03
 * @Description: 启动游戏盒子 所有游戏都在这里打开
 * @FilePath: /Mobile/src/components/Games/LaunchGame.js
 */
import React, { Component } from "react";
import Router from "next/router";
import HostConfig from "@/server/Host.config";
const { HostApi } = HostConfig.Config;
import { checkIsLogin, redirectToLogin } from "@/lib/js/util";
import Toast from "@/components/View/Toast";
import Modal from "@/components/View/Modal";
import Flexbox from "@/components/View/Flexbox/";
import { OpenPlayGame } from "@/api/game";
import ReactIMG from "@/components/View/ReactIMG";
import { LazyLoadImage } from "react-lazy-load-image-component";
import dynamic from "next/dynamic";
import Image from "next/image";
import { getAllVendorToken, removeVendorToken } from "$SBTWOLIB/js/util";
import Announcement from "@/components/Announcement/";
import { GamesGtag, homeGamePiwik, detailGamePiwik, gameLobbyPiwik,gamePage } from "@/lib/data/DataList";
import { getStrQuery } from "@/lib/js/Helper";
import { GetGamesList } from "@/api/game";
import { ACTION_User_getDetails } from "@/lib/redux/actions/UserInfoAction";
import { connect } from "react-redux";
const CallApplib = dynamic(import("@/components/Me/DynamicOpenSportsApp"), {
    ssr: false,
});
let isWindowOpenGame = ["IMOPT", "VTG", "SGW", "NLE"]; //不支持iframe的游戏放进去
let needPopUpGame = ['IPSB','OWS','SBT']; //需要彈窗的
let sportGame = ['IPSB','OWS','SBT'];
let lotteryGame = ['YBK','SGW','LBK'];
class LaunchGame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openstatus: false, //启动体育弹窗（是否使用体育app）
        };

        if (props.OnRef) {
            props.OnRef(this);
        }
    }

    componentDidMount() {
        if (this.props.Game) {
            this.props.Game(this);
        }
        //飞行游戏
        if (this.props.fromFooter) {
            this.GetUrlPlayGame(this.props.item);
        }
    }

    /**
     * @description: 点击游戏图片启动游戏（iframe 页面、新开窗口）
     * @param {*} item 游戏参数
     * @param {*} isHome 是否是首页内容
     * @return {*}
     */
    OpenGame(item) {
        //如果是启动SB2.0
        // if (item.code == "SB2" || item.providerCode == "SB2") {
        //     //检查自我限制
        //     if (
        //         checkIsLogin() &&
        //         typeof SelfExclusionsisDisabled != "undefined" &&
        //         SelfExclusionsisDisabled
        //     ) {
        //         CheckSelfExclusions(true);
        //         return;
        //     }

        //     this.gotoSB20Page();
        //     return;
        // }

        //检查是否登录
        if (!checkIsLogin() && item.code != 'CML') {
            redirectToLogin();
            return;
        }

        //检查自我限制
        if (
            typeof SelfExclusionsisDisabled != "undefined" &&
            SelfExclusionsisDisabled
        ) {
            CheckSelfExclusions(true);
            return;
        }

        //进入二级游戏列表页面
        let Category_Game = item.type == "Category";
        if (Category_Game) {
            Router.push(`/Games/${gamePage.find(item=>item.productCode === this.props.GameType).name}/${item.code}`)
            return;
        }

        //目的: Iframe页面会用到，用于启动游戏的参数
        localStorage.setItem("GamesOpenData", JSON.stringify(item));

        //*********先检查是否有公告,关闭公告后再启动游戏**********//
        let Popstatus =
            !sessionStorage.getItem(
                this.props.gameCatCode + "HomeGamelocalStorageAnnouncement"
            ) &&
            !localStorage.getItem(
                this.props.gameCatCode + "HomeGamelocalStorageAnnouncement"
            );
        //*** 如果是 Sportsbook 和 KenoLottery 点击游戏图片就直接检查公告 ****//
        if (
            Popstatus &&
            (sportGame.includes(item.code) ||
                lotteryGame.includes(item.code))
        ) {
            let Type =
                lotteryGame.includes(item.code) ? "Keno" : 'Sportsbook';
            this.setState(
                {
                    StartCheckAnnouncement: true, //加载公告的组件
                },
                () => {
                    this.getCheck.GetAnnouncementPopup(Type, item); //检查是否有公告
                }
            );
        } else if (item.code == "AVIATOR" || item.launchGameCode === "aviator") {
            //启动飞行游戏
            this.OpenSPR();
        } else {
            //默认的游戏
            this.setState(
                {
                    gameTypeObj: item, //当前打开游戏的数据
                },
                () => {
                    let Noiframe = this.CheckWindowGame(item);
                    //不在iframe打开的游戏
                    if (Noiframe) {
                        this.GetUrlPlayGame(item);
                        return;
                    }

                    //在iframe打开的游戏
                    //IframeOpenGame 存在的话 -
                    //说明此时已在 /Games/iframeOpen 页面 -
                    //进行刷新页面刷新游戏的逻辑  -
                    if (this.props.IframeOpenGame) {
                        //iframe启动游戏
                        this.GetUrlPlayGame(item);
                    } else {
                        //在这里根据状态 判断是 跳转iframe页面 还是新开窗口
                        this.LaunchOpenGame(item, 2);
                    }
                }
            );
        }
    }

    /**
     * @description: 开启飞行游戏
     * @return {*}
     */

    OpenSPR() {
        let params = {
            gameType: "InstantGames",
            provider: "SPR",
            gameSortingType: "Default",
        };
        Toast.loading();
        //获取飞行游戏列表
        GetGamesList(params, (data) => {
            if (data) {
                if (data.isSuccess) {
                    sessionStorage.setItem(
                        "GameListInstantGames" + JSON.stringify(params),
                        JSON.stringify(data.result.gameDetails)
                    );
                    if (data.result.gameDetails) {
                        let item = data.result.gameDetails.find(
                            (ele) => ele.gameNameEnglish === "Aviator"
                        );
                        // Pushgtagdata(
                        //     `Game`,
                        //     "Launch",
                        //     `${item.gameName}_SPR_HomePage`
                        // );
                        this.GetUrlPlayGame(item);
                    }
                } else {
                    Toast.destroy();
                }
            }
        });
    }

    /**
     * @description: 拿游戏url
     * @param {*} item
     * @return {*}
     */

    GetUrlPlayGame(item) {
        const hide = Toast.loading();

        //處理sb2.0遊戲token (開官方網頁版，會刷掉先前獲取的token)
        // const sb20Sport = this.getSB20Sport(item);
        // if (sb20Sport) {
        //     console.log("===removeVendorToken", sb20Sport);
        //     removeVendorToken(sb20Sport);
        // }

        //Iframe页面会用到，用于启动游戏参数
        localStorage.setItem("GamesOpenData", JSON.stringify(item));

        //如果是体育游戏
        // let isSportsbook =
        //     ("code" in item && item.gameCatCode == "Sportsbook") ||
        //     this.props.gameCatCode == "Sportsbook";

        //除了VTG 不是 iframe 打开 其他游戏都是 iframe 打开
        //醉心體育不需要彈窗
        // if (
        //     isSportsbook &&
        //     needPopUpGame.includes(item.code) &&
        //     !this.props.IframeOpenGame
        // ) {
        //     this.setState(
        //         {
        //             openstatus: true, //体育游戏的话 需要先弹窗（让会员选择是否启动体育App）
        //         },
        //         () => {
        //             hide();
        //         }
        //     );

        //     return;
        // }

        this.setState(
            {
                gameTypeObj: item,
            },
            () => {
                //如果不是在 /Games/iframeOpen iframe 启动游戏页面   */
                // if (item.provider != "VTG" && !this.props.IframeOpenGame) {
                // 	this.LaunchOpenGame(item,3);
                // 	return;
                // }
            }
        );

        // if (item.provider == "VTG" && !this.props.IframeOpenGame) {
        //     this.LaunchOpenGame(item, 3);
        //     return;
        // }

        OpenPlayGame((data) => {
            if (data) {
                hide();
                if (data.isSuccess) {
                    Toast.destroy();
                    let providerCode = item.providerCode || item.code;
                    if (
                        !data.result.isGameMaintenance &&
                        data.result.gameLobbyUrl &&
                        data.result.gameLobbyUrl != ""
                    ) {
                        let gameUrls =
                            providerCode == "SBT"
                                ? data.result.gameLobbyUrl +
                                  "&ReferURL=" +
                                  window.location.protocol +
                                  "//" +
                                  window.location.host +
                                  "&oddsstyleid=3&APIUrl=" +
                                  HostApi +
                                  "&MemberToken=" +
                                  JSON.parse(
                                      localStorage.getItem("memberToken")
                                  )
                                : data.result.gameLobbyUrl;

                        localStorage.setItem(
                            "NowPlayGameUrl",
                            JSON.stringify(gameUrls)
                        );
                        this.setState(
                            {
                                GameOpenUrl: gameUrls,
                            },
                            () => {
                                let NoIframeType = this.CheckWindowGame(item);
                                if (
                                    (isWindowOpenGame.find(
                                        (v) => v == NoIframeType
                                    ) 
                                    // || isSportsbook
                                    ) &&
                                    !this.props.IframeOpenGame &&
                                    item &&
                                    item.code != "YBS"
                                ) {
                                    this.setState({
                                        openstatus: true,
                                    });
                                } else {
                                    if (this.props.IframeOpenGame) {
                                        this.props.IframeOpenGame(gameUrls);
                                    } else {
                                        this.LaunchOpenGame(item, 1);
                                    }
                                }
                            }
                        );
                    } else {
                        Toast.error("Trò chơi bạn mở đang được bảo trì. Vui lòng thử lại sau. ", 3);
                        Router.push("/");
                    }
                } else {
                    Toast.error(data.message, 3);
                }
            }
        }, item);
        console.log("当前游戏--------------->", item);
    }

    /**
     * @description: 游戏打开方式
     * @param {*}
     * @return {*}
     */
    LaunchOpenGame(gameitem, n) {
        //localStorage.removeItem("NowPlayGameUrl");
        //VTG 启动游戏比较特殊是新窗口打开(不是url启动的)
        if (gameitem && gameitem.provider && gameitem.provider == "VTG") {
            this.setState({
                openstatus: false,
            });
            this.OpenV2G(this.state.GameOpenUrl);
            return;
        }
        //iframe 页面打开
        let NoIframeType = this.CheckWindowGame(gameitem);
        if (!isWindowOpenGame.find((item) => item == NoIframeType)) {
            let openGameDirectly = false;   
            let gameCode = this.props.GameType ? this.props.GameType : gameitem.gameType
            switch(gameCode){
                case "Sportsbook":
                    if(gameitem.provider !== "VTG"){
                        openGameDirectly = true;
                    }
                    break
                case "ESports":
                    openGameDirectly = true;
                    break
                default:
                    break
              }
            //进入iframe 页面 启动游戏
            if (gameCode) {
                Router.push(`/Games/${gamePage.find(item=>item.productCode === gameCode).name}/${gameitem.code || gameitem.provider || provider}${!openGameDirectly ? `?gameid=${gameitem.gameId}` : ""}`);
				// closeUnfinishedGameModal && closeUnfinishedGameModal()
            }
        }
    }

    /**
     * @description: 新窗口玩游戏
     * @return {*}
     */

    OpenWindow() {
        //VTG 启动游戏比较特殊是新窗口打开(不是url启动的)
        this.setState({
            openstatus: false,
        });
        const { memberInfo } = this.props.userInfo;
        if (checkIsLogin() && memberInfo.isGameLock) {
            Toast.error("您的账户已被锁，请联系在线客服。");
            return;
        }
        if (
            this.state.gameTypeObj &&
            this.state.gameTypeObj.provider &&
            this.state.gameTypeObj.provider == "VTG"
        ) {
            this.OpenV2G(this.state.GameOpenUrl); //document.write html window
            return;
        }
        //普通新开窗口
        const Opencontent = window.open(this.state.GameOpenUrl);
        Opencontent.document.title = "fun88";
        Opencontent.focus();
    }

    /**
     * @description: 检索游戏code，用于检查是否需要iframe 打开
     * @param {*} item 游戏启动参数
     * @return {*}
     */

    CheckWindowGame(item) {
        return (
            (item["code"] && item.code) ||
            (item["provider"] && item.provider) ||
            ""
        );
    }

     /**
     * @description: entry point piwik enhancement (sportbooks 點擊網頁版時)
     * @param {*} item
     * @return {void}
     */
    trackPiwikForWebPage(item) {
        const { code } = item
        if (this.props.isHome) {
            if (code === "IPSB") { //IM
                // Pushgtagdata("Game","Launch","IMSports_Vendor_Home")
                console.log(console.log("@@@@IMhome1"));
            }
            else if (code === "OWS") { //沙巴
                // Pushgtagdata("Game","Launch","OWSports_Vendor_Home")
            }
            else if (code === "SBT") { //BTI
                // Pushgtagdata("Game","Launch","BTiSports_Vendor_Home")
            }
        }
        else {
            if (code === "IPSB") { //IM
                // Pushgtagdata("Game","Launch","IMSports_Vendor_ProductPage")
            }
            else if (code === "OWS") { //沙巴
                // Pushgtagdata("Game","Launch","OWSports_Vendor_ProductPage")
            }
            else if (code === "SBT") { //BTI
                // Pushgtagdata("Game","Launch","BTiSports_Vendor_ProductPage")
            }
        }
    }

    /**
     * @description: entry point piwik enhancement (點擊樂體育時)
     * @param {*} item
     * @return {void}
     */
    trackPiwikForSB20(item) {
        const { code } = item
        if (this.props.isHome) {
            if (code === "IPSB") { //IM
                // Pushgtagdata("Game","Launch","IMSport_SB2.0_Home")
            }
            else if (code === "OWS") { //沙巴
                // Pushgtagdata("Game","Launch","OWSport_SB2.0_Home")
            }
            else if (code === "SBT") { //BTI
                // Pushgtagdata("Game","Launch","BTiSport_SB2.0_Home")
            }
        }
        else {
            if (code === "IPSB") { //IM
                // Pushgtagdata("Game","Launch","IMSport_SB2.0_ProductPage")
            }
            else if (code === "OWS") { //沙巴
                // Pushgtagdata("Game","Launch","OWSport_SB2.0_ProductPage")
            }
            else if (code === "SBT") { //BTI
                // Pushgtagdata("Game","Launch","BTiSport_SB2.0_ProductPage")
            }
        }
    }



    render() {
        const {
            item,
            QuickStartGame,
            height,
            width,
            isHome,
            bannerFlag,
            location,
            GameType,
            dataList,
            dataIndex,
            fromFooter,
        } = this.props;
        const { openstatus, gameTypeObj } = this.state;
        // console.log('列表--------------------->', dataList);
        //如果是体育游戏 并且不是虚拟体育VTG
        // let isSportsbook =
        //     gameTypeObj &&
        //     gameTypeObj.provider != "VTG" &&
        //     sportGame.includes(gameTypeObj.code);
        return (
            <React.Fragment>
                {!QuickStartGame && !fromFooter && (
                    <div
                        className="Container"
                        onClick={() => {
                            if (item.gameCatCode == "Casino") {
                                item.gameCatCode = "LiveCasino";
                            }
                            this.setState(
                                {
                                    gameTypeObj: item,
                                },
                                () => {
                                    /* 点击游戏图片 开始玩游戏 */
                                    if (
                                        (item.providerCode &&
                                            item.providerCode == "VTG") ||
                                        (item.code && item.code == "VTG")
                                    ) {
                                        item.type = "Category"; //这样代表跳转去二级列表页
                                    }
                                    this.OpenGame(item);
                                }
                            );
                            let gamePiwik = this.props.isHome ? homeGamePiwik : detailGamePiwik;
                            if (gamePiwik[item.code || item.providerCode]) {
                                Pushgtagdata(`${gamePiwik[item.code || item.providerCode].eventCat}`, `${gamePiwik[item.code || item.providerCode].eventAction}`, `${gamePiwik[item.code || item.providerCode].eventName}`);
                            }
                            if (location == 'DetailsPage'){
                                if (gameLobbyPiwik[GameType]){
                                    Pushgtagdata(`${gameLobbyPiwik[GameType].eventCat}_Lobby`, 'Launch Game', `${gameLobbyPiwik[GameType].eventName}_C_${GameType == 'Sportsbook' ? 'Game' : item.provider}}`,
                                    [{
                                        customVariableKey: `${gameLobbyPiwik[GameType].eventName}_C_${item.provider}_GameName`,
                                        customVariableValue: `${item.gameName}`
                                    }]);
                                }
                            }
                        }}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        {isHome ? (
                            <Image
                                width={"160px"}
                                height={"210px"}
                                loading={"lazy"}
                                src={
                                    // bannerFlag
                                    //     ? item.imageUrl || item.imageUrlSecond
                                    //     : dataList.subProviders[dataIndex]
                                    //           .imageUrl  || item.imageUrlSecond
                                    item.providerHomepageImage || "/img/svg/method-4.svg"
                                }
                                className={"imgItem"}
                                alt={item.name || item.gameName}
                            />
                        ) : (
                            <LazyLoadImage
                                src={
                                     item.banner || item.imageUrl || "/img/svg/method-4.svg"
                                }
                                effect="blur"
                                alt={item.name || item.gameName}
                                width={width ? width : "100%"}
                                height={height ? height : "auto"}
                                key={item.providerHomepageImage}
                                onError={({ currentTarget }) => {
                                    currentTarget.onerror = null; // prevents looping
                                    currentTarget.src = `${process.env.BASE_PATH + '/img/svg/method-4.svg'}`;
                                }}
                            />
                        )}
                    </div>
                )}
                <Modal
                    visible={openstatus}
                    transparent
                    className="openWindowModal commonModal"
                    maskClosable={false}
                    closable={true}
                    top=""
                    centered
                    title="Lưu Ý"
                    onCancel={() => this.setState({openstatus: false})}
                >
                    <div />{" "}
                    {/*勿刪，這個用來避開Modal默認的first-child css配置*/}
                    <Flexbox
                        className="Content"
                        alignItems="center"
                        justifyContent="flex-start"
                        flexDirection="column"
                    >
                        {/* <Flexbox
                            className="LaunchGamePopupIconBox"
                            alignItems="center"
                            justifyContent="flex-start"
                            flexDirection="column"
                        >
							<ReactIMG className="LaunchGamePopupIcon" src={`/img/P5/svg/reject.svg`} />
                        </Flexbox> */}
                        {/* {isSportsbook ? (
                            <Flexbox className="LaunchGamePopupText">
                                请选择打开方式
                            </Flexbox>
                        ) : ( */}
                            <Flexbox className="LaunchGamePopupText">
                                Để trải nghiệm đặt cược tốt hơn, trang nhà cung cấp sẽ được mở ở cửa sổ mới.
                            </Flexbox>
                        {/* )} */}
                    </Flexbox>
                    {/* 体育打开 */}
                    {/* {isSportsbook ? (
                        <Flexbox justifyContent="space-around">
                            <Flexbox
                                className="Cancel"
                                onClick={() => {
                                    this.trackPiwikForWebPage(item)
                                    this.LaunchOpenGame(item);
                                }}
                            >
                                网页版
                            </Flexbox>
                            <Flexbox
                                className="Confirm"
                                onClick={() => {
                                    this.trackPiwikForSB20(item)
                                    this.openToSB20(item);
                                }}
                            >
                                乐体育
                            </Flexbox>
                        </Flexbox>
                    ) : ( */}
                        {/* <></> */}
                        {/* 其他游戏打开 */}
                        <Flexbox justifyContent="space-around">
                            {/* <Flexbox
                                className="Cancel"
                                onClick={() => {
                                    this.setState({
                                        openstatus: false,
                                    });
                                }}
                            >
                                取消
                            </Flexbox> */}
                            <Flexbox
                                style={{width: '100%'}}
                                className="Confirm"
                                onClick={() => {
                                    this.OpenWindow(item);
                                }}
                            >
                                Đồng Ý
                            </Flexbox>
                        </Flexbox>
                    {/* )} */}
                </Modal>
                <CallApplib key={Math.random()} />
                {this.state.StartCheckAnnouncement && (
                    <Announcement
                        Check={(props) => {
                            this.getCheck = props;
                        }}
                        PlayGame={(item) => {
                            this.GetUrlPlayGame(item);
                        }}
                    />
                )}
            </React.Fragment>
        );
    }

    /******************************************************
     * 	  下面的代码用于处理体育游戏 目的（分开易于代码的阅读）
     ******************************************************* */

    /**
     * @description: 打开乐体育(ipsb: 'im', ows: 'saba', sbt: 'bti' )
     * @param {*} item
     * @return {*}
     */

    openToSB20 = (item) => {
        this.setState({
            openstatus: false,
        });
        const sb20Sport = this.getSB20Sport(item);
        const { memberInfo } = this.props.userInfo;
        const { maintainStatus } = this.props;
        if (sb20Sport) {
            if (checkIsLogin()) {
                if (memberInfo.isGameLock) {
                    Toast.error("您的账户已被锁，请联系在线客服。");
                    return;
                }
                //已登入 先獲取token後跳轉
                const hide = Toast.loading();
                getAllVendorToken().finally(() => {
                    //获取Toekn都失敗跳轉维护页面
                    hide();
                    if (
                        maintainStatus.isBTI &&
                        maintainStatus.isIM &&
                        maintainStatus.isSABA
                    ) {
                        Router.push("/sbtwo/maintenance");
                        return;
                    }
                    Router.push("/sbtwo/sports-" + sb20Sport);
                });
            } else {
                //未登入 直接跳轉
                Router.push("/sbtwo/sports-" + sb20Sport);
            }
        }
    };

    /**
     * @description: 进入SB2.0 页面
     * @return {*}
     */

    gotoSB20Page = () => {
        const { memberInfo } = this.props.userInfo;
        const { maintainStatus } = this.props;
        if (checkIsLogin() && memberInfo.isGameLock) {
            Toast.error("您的账户已被锁，请联系在线客服。");
            return;
        }
        if (checkIsLogin()) {
            //已登入 先獲取token後跳轉
            const hide = Toast.loading();
            getAllVendorToken().finally(() => {
                //获取Toekn都失敗跳轉维护页面
                hide();
                if (
                    maintainStatus.isBTI &&
                    maintainStatus.isIM &&
                    maintainStatus.isSABA
                ) {
                    Router.push("/sbtwo/maintenance");
                    return;
                }
                //正常进去SB20页面
                Router.push("/sbtwo");
            });
        } else {
            //未登入 直接跳轉
            Router.push("/sbtwo");
        }
    };

    /**
     * @description: 检查跳转sb20体育类型
     * @param {*} item
     * @return {*}
     */

    getSB20Sport = (item) => {
        if (item.gameCatCode || item.code) {
            if (sportGame.includes(item.code)) {
                const codeToSportMapping = {
                    ipsb: "im",
                    ows: "saba",
                    sbt: "bti",
                };
                const targetSport = codeToSportMapping[item.code.toLowerCase()];
                return targetSport;
            }
        }
        return null;
    };

    /**
     * @description: v2g虚拟体育特殊处理
     * @param {*} GameOpenUrl
     * @return {*}
     */
    OpenV2G(GameOpenUrl) {
        console.log(GameOpenUrl, 'GameOpenUrl')
        let V2G = window.open("", "_blank");
        let onlineHash = getStrQuery(GameOpenUrl)["onlineHash"];
        let language = getStrQuery(GameOpenUrl)["language"];
        let profile = getStrQuery(GameOpenUrl)["profile"];
        if (V2G) {
            V2G.document.write(`
			<!DOCTYPE html>
			<html>
				<meta
					key="viewport"
					name="viewport"
					content="width=device-width,initial-scale=1.0,maximum-scale=1.0,viewport-fit=cover"
				/>
				<style>
					body{
						margin:0;
					}
					#golden-race-mobile-app{
						width: 100%;
						height: 100%;
					}
					#golden-race-mobile-app > iframe[style] {
						width: 100% !important;
						height: calc(100vh - 75px) !important;
					}
				</style>
				<body>
					<div id="golden-race-mobile-app"></div>
					<script
					src=${JSON.stringify(GameOpenUrl)}
					id="golden-race-mobile-loader"
					></script>
					<script>
						document.addEventListener("DOMContentLoaded", function () {
							loader = grMobileLoader({ 
								onInit: function(type,content) {
											navigate(${JSON.stringify(this.state.gameTypeObj.launchGameCode)});
								},
								onlineHash: ${JSON.stringify(onlineHash)},
								profile: ${JSON.stringify(profile)},
								showOddFormatSelector: false,
								language: ${JSON.stringify(language)}
							});
						});
						function navigate(path) {
							loader.navigateByDisplayId(path);
						}
					</script>
				</body>
			</html>
			`);
            V2G.document.close();
        }
    }
}

const mapStateToProps = (state) => ({
    userInfo: state.userInfo,
    maintainStatus: state.maintainStatus,
});

const mapDispatchToProps = {
    userInfo_getDetails: () => ACTION_User_getDetails(),
};

export default connect(mapStateToProps, mapDispatchToProps)(LaunchGame);

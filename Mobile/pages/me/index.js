/*
 * @Author: Alan
 * @Date: 2022-02-07 11:24:10
 * @LastEditors: Alan
 * @LastEditTime: 2023-05-09 21:10:05
 * @Description: 用户中心
 * @FilePath: \Mobile\pages\Me\index.js
 */
import React, { Component } from "react";
import Layout from "@/components/Layout";
import dynamic from "next/dynamic";

const CallApplib = dynamic(import("@/components/Me/DynamicOpenApp"), {
    ssr: false,
});
import Flexbox from "@/components/View/Flexbox/";
import { ReactSVG } from "@/components/View/ReactSVG";
import Service from "@/components/Header/Service";
import { UnreadMessage } from "@/api/message";
import {
    checkIsLogin,
    setIsLogout,
    redirectToLogin,
    numberWithCommas,
} from "@/lib/js/util";
import {
    ACTION_UserInfo_getBalance,
    ACTION_User_getDetails
} from '@/lib/redux/actions/UserInfoAction';
import {connect} from 'react-redux';
import Router from 'next/router';
import classNames from 'classnames';
import {CmsBanner, CmsProfileFeature} from '@/api/home';
import BannerBox from '@/components/Banner';
import Modal from '@/components/View/Modal';
import {getAffParam} from '@/lib/js/Helper';
import ReactIMG from '@/components/View/ReactIMG';
import Vipcustomerservice from '@/components/Header/Vipcustomerservice';
import {fetchRequest} from '@/server/Request';
import {ApiPort} from '@/api/index';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {GetQueleaActiveCampaignInfo} from '@/api/referrer';
import session from "redux-persist/lib/storage/session";
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me'); //參數帶本頁的路徑
}
class Me extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkLogin: false,
            memberInfo: {},
            StatisticsAll: 0,
            feedbackModal: false,
            isVIP: false,
            checkSafeHouse: false,
            Banner: [],
            BannerIndex: 0,
        };
    }

    componentDidMount() {
        this.setState({
            checkLogin: checkIsLogin()
        });
        if (checkIsLogin()) {
            this.props.userInfo_getDetails();
            this.props.userInfo_getBalance(true);
            this.getMessageCount();
        }
        this.GetCmsBanne();
        // window.Pushgtagdata &&
        //     Pushgtagdata(window.location.origin, "Launch", `profile`);
        if (
            !!localStorage.getItem("memberInfo") &&
            JSON.parse(localStorage.getItem("memberInfo")).isVIP
        ) {
            this.setState({ isVIP: true });
        }
        this.checkIsSafeHouse();
    }

    GetQueleaActiveCampaign = (link) => {
		GetQueleaActiveCampaignInfo((data) => {
			if (!data.isSuccess) {
				this.setState({
					noRAFModal: true
				})
			} else {
                sessionStorage.setItem('QueleaActiveCampaignInfo', JSON.stringify(data.result))
                Router.push(link)
            }
		});
	};

    checkIsSafeHouse = () => {
        let domain = window.location.origin;
        fetchRequest(ApiPort.GETisSafeHouse + `domain=${domain}&`, "GET")
            .then((res) => {
                console.log("isSafeHouse Domain res: ", res);
                if (res.result) {
                    this.setState({
                        checkSafeHouse: true,
                    });
                }
            })
            .catch((error) => {
                console.log("isSafeHouse Domain error: ", error);
            });
    };

    /**
     * @description:  获取banner
     * @param {*}
     * @return {*}
     */
    GetCmsBanne = () => {
        CmsProfileFeature((res) => {
            if (res.message) {
                return;
            }
            if (res) {
                this.setState({
                    Banner: res,
                });
            }
        });
    };

    handleSlideChange = (index) => {
        this.setState({ BannerIndex: index });
    };

    // 未读消息統計
    getMessageCount = () => {
        UnreadMessage((res) => {
            if (res.isSuccess && res.result) {
                const total =
                    res.result.unreadPersonalMessageCount +
                    res.result.unreadTransactionCount +
                    res.result.unreadNewsCount +
                    res.result.unreadAnnouncementCount;
                this.setState({
                    StatisticsAll: total,
                });
            }
        });
    };

    render() {
        const { checkLogin, StatisticsAll, Banner, BannerIndex, isVIP, feedbackModal } =
            this.state;
        const { memberInfo } = this.props.userInfo;
        let Low, Medium, High;
        if (memberInfo) {                
            //低安全等级
            Low =
                (memberInfo.phoneStatus !== "Verified" &&
                memberInfo.emailStatus !== "Verified" &&
                memberInfo.firstName == "") || 
                (memberInfo.phoneStatus !== "Verified" &&
                memberInfo.emailStatus !== "Verified" &&
                memberInfo.firstName != "") ||
                (memberInfo.phoneStatus == "Verified" &&
                memberInfo.emailStatus !== "Verified" &&
                memberInfo.firstName == "") ||
                (memberInfo.phoneStatus !== "Verified" &&
                memberInfo.emailStatus == "Verified" &&
                memberInfo.firstName == "");
            //中安全等级
            Medium =
                (memberInfo.phoneStatus !== "Verified" &&
                memberInfo.emailStatus == "Verified" &&
                memberInfo.firstName !== "") || 
                (memberInfo.phoneStatus == "Verified" &&
                memberInfo.emailStatus !== "Verified" &&
                memberInfo.firstName !== "") ||
                (memberInfo.phoneStatus == "Verified" &&
                memberInfo.emailStatus == "Verified" &&
                memberInfo.firstName == "");
            //高安全等级
            High =
                memberInfo.phoneStatus == "Verified" &&
                memberInfo.emailStatus == "Verified" &&
                memberInfo.firstName !== "";
        }
        
        // banner輪播設定
        const settings = {
            dots: true,
            dotsClass: "slick-dots slick-thumb",
            customPaging: function(i) {
                return (
                    <a>
                        <div
                            style={{
                                width: "6px", // 控制分頁點點大小
                                height: "6px", // 控制分頁點點大小
                                borderRadius: "50%",
                                backgroundColor: i === BannerIndex ? "black" : "white",
                            }}
                        />
                    </a>
                );
            },
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 4000,
            afterChange: this.handleSlideChange,
        };

        return (
            <Layout
                title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
                Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
                Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
                BarTitle="账户资料"
                status={4}
                hasServer={false}
                barFixed={true}
                seoData={this.props.seoData}
            >
                <Flexbox id="Me">
                    <Flexbox className="Content" flexDirection="column">
                        {/* 用户信息 */}
                        <Flexbox className="User-info" alignItems="center">
                            {!checkLogin ? (
                                <React.Fragment>
                                    <Flexbox className="Avatar">
                                        <ReactSVG
                                            src={`/img/P5/svg/user.svg`}
                                        />
                                    </Flexbox>
                                    <Flexbox
                                        flex="0 0 70%"
                                        flexDirection="column"
                                    >
                                        <span className="Visitor">
                                            Tài khoản khách
                                        </span>
                                        <div
                                            className="Btn"
                                            onClick={() => {
                                                Router.push("/register_login");
                                            }}
                                        >
                                            Đăng Ký / Đăng Nhập
                                        </div>
                                    </Flexbox>
                                    <Flexbox>
                                        <Service />
                                    </Flexbox>
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <Flexbox className="Avatar">
                                        <ReactSVG
                                            src={`/img/P5/svg/MePage/Avatar.svg`}
                                        />
                                    </Flexbox>
                                    <Flexbox
                                        flex="0 0 60%"
                                        flexDirection="column"
                                        className="Account"
                                    >
                                        <span className="UserName">
                                            <b>
                                                {(memberInfo &&
                                                    memberInfo.userName) ||
                                                    "--"}
                                            </b>
                                        </span>
                                        <div className="Balance">
                                            <label>Tổng Số Dư </label>
                                            <b>
                                                <big>
                                                    {numberWithCommas(
                                                        this.props.userInfo
                                                            .Balance.TotalBal
                                                    )}
                                                </big>
                                                <small>đ</small>
                                            </b>
                                        </div>
                                    </Flexbox>
                                    <Flexbox>
                                        {isVIP ? (
                                            <div
                                                className="vip-customer-service"
                                                style={{ marginRight: 10 }}
                                                onClick={() => {
                                                    this.setState({
                                                        feedbackModal: true,
                                                    });
                                                }}
                                            >
                                                <ReactIMG src="/img/P5/icon/Icon_VIPCS.png" />
                                            </div>
                                        ) : (
                                            <div
                                                style={{
                                                    marginRight: 10,
                                                    width: 30,
                                                    height: 30,
                                                }}
                                            />
                                        )}
                                        <Service pushPiwik={()=>{Pushgtagdata("MemberCenter", "Contact CS", "MemberCenter_C_CS")}}  />
                                    </Flexbox>
                                </React.Fragment>
                            )}
                        </Flexbox>
                        {/* 优惠 免费投注 */}
                        {checkLogin && Banner && Banner.length !== 0 && (
                            <Slider {...settings}>
                                {Banner.map((item, index) => (
                                    <BannerBox key={index} item={item} type={'profile'} />
                                ))}
                            </Slider>
                        )}
                        {/* 安全等级 */}
                        {checkLogin && (
                            <Flexbox
                                className="User-SecurityLevel"
                                alignItems="center"
                                justifyContent="space-around"
                            >
                                <Flexbox
                                    className="Level"
                                    flexDirection="column"
                                >
                                    <span>
                                        Mức độ bảo mật: 
                                        {High ? " Cao" : Medium ? " Trung Bình" : " Thấp"}
                                    </span>
                                    <small>
                                        Để nâng cao độ bảo mật, vui lòng <br/>xác thực tài khoản
                                    </small>
                                    <div className="Progress">
                                        <div
                                            className={classNames({
                                                Bar: true,
                                                redBar: Low,
                                                greenBar: High,
                                                yellowBar: !High && Medium,
                                            })}
                                            style={{
                                                width: High
                                                    ? "100%"
                                                    : Medium
                                                    ? "50%"
                                                    : "30%",
                                            }}
                                        />
                                    </div>
                                </Flexbox>
                                {!High && (
                                    <Flexbox
                                        className="Verifynow"
                                        onClick={() => {
                                            Pushgtagdata("MemberCenter", "Go to Verification", "MemberCenter_C_Verification");
                                            Router.push("/me/verifications");
                                        }}
                                    >
                                        <span>Xác Thực Ngay</span>
                                    </Flexbox>
                                )}
                                {High && (
                                    <Flexbox alignItems="center">
                                        <ReactSVG
                                            src={`/img/svg/true.svg`}
                                            className="VDone"
                                        />
                                        <Flexbox
                                            marginLeft="10px"
                                            className="Green"
                                        >
                                            Đã Xác Thực
                                        </Flexbox>
                                    </Flexbox>
                                )}
                            </Flexbox>
                        )}

                        {/* 模块快捷按钮 */}
                        <Flexbox
                            className="User-quick-button"
                            flexWrap="wrap"
                            alignItems="center"
                        >
                            {[
                                {
                                    Name: "Gửi Tiền",
                                    Url: "/deposit",
                                    Icon: "deposit.svg",
                                    piwik:{
                                        eventAction:"Go to Deposit",
                                        eventName:"MemberCenter_C_Deposit"
                                    }
                                },
                                {
                                    Name: "Chuyển Quỹ",
                                    Url: "/Transfer",
                                    Icon: "Transfer.svg",
                                    piwik:{
                                        eventAction:"Go to Transfer",
                                        eventName:"MemberCenter_C_Transfer"
                                    }
                                },
                                {
                                    Name: "Rút Tiền",
                                    Url: "/withdrawal",
                                    Icon: "Withdrawal.svg",
                                    piwik:{
                                        eventAction:"Go to Withdrawal",
                                        eventName:"MemberCenter_C_Withdrawal"
                                    }
                                },
                                {
                                    Name: "Lịch Sử Giao Dịch",
                                    Url: "/transaction-record",
                                    Icon: "TransactionRecord.svg",
                                    piwik:{
                                        eventAction:"View Transaction Record",
                                        eventName:"MemberCenter_C_TransactionRecord"
                                    }
                                },
                                {
                                    Name: "Thông Báo",
                                    Url: "/notification",
                                    Icon: "Notify.svg",
                                    piwik:{
                                        eventAction:"View Message",
                                        eventName:"MemberCenter_C_Message"
                                    }
                                },
                                {
                                    Name: "Trang Giải Thưởng",
                                    Url: "https://www.sport998.com/Rewards/MyVIP.aspx?Pop=1",
                                    Icon: "KingClub.svg",
                                    piwik:{
                                        eventAction:"View Reward Page",
                                        eventName:"MemberCenter_V_RewardPage"
                                    }
                                },
                                {
                                    Name: "VIP",
                                    Url: "/diamond-club?key=5658",
                                    Icon: "DiamondClub.svg",
                                    piwik:{
                                        eventAction:"View VIP Page",
                                        eventName:"MemberCenter_V_VIPPage"
                                    }
                                },
                                {
                                    Name: "Thưởng Mỗi Ngày",
                                    Url: "/daily-gift",
                                    Icon: "DailyGift.svg",
                                    piwik:{
                                        eventAction:"View Special Offer",
                                        eventName:"MemberCenter_V_DailyDeal"
                                    }
                                },
                            ].map((item, index) => {
                                return (
                                    <Flexbox
                                        key={index + "Btn"}
                                        flexDirection="column"
                                        alignItems="center"
                                        flex="0 0 25%"
                                        className="item"
                                        onClick={() => {
                                            Router.push(item.Url);
                                            Pushgtagdata("MemberCenter", item.piwik.eventAction, item.piwik.eventName)
                                        }}
                                    >
                                        <ReactSVG
                                            src={`/img/P5/svg/MePage/${item.Icon}`}
                                        />
                                        <span style={{height: '0.3rem'}}>{item.Name}</span>
                                        
                                        {item.Name == "Thông Báo" && (
                                            <sup className="Badge__Content RED is-fixed">
                                                {StatisticsAll}
                                            </sup>
                                        )}
                                        {/* {item.Name == '天王俱乐部' && (
											<sup className="Badge__Content YELLOW is-fixed">新品</sup>
										)} */}
                                    </Flexbox>
                                );
                            })}
                        </Flexbox>
                        {/* 菜单 */}
                        <Flexbox
                            className="User-Quick-Menu"
                            flexDirection="column"
                        >
                            {[
                                // {
                                //     Name: "USDT介绍",
                                //     Url: "/About/UsdtInfo",
                                //     Icon: "Usdt.svg",
                                // },
                                {
                                    Name: "Nhà Tài Trợ",
                                    Url: "/help/sponsorship",
                                    Icon: "SponsorshipPartner.svg",
                                    piwik:{
                                        eventAction:"View Sponsor",
                                        eventName:"MemberCenter_C_Sponsor"
                                    }
                                },
                                {
                                    Name: "Đại Lý",
                                    Url: "http://www.sport998.com/lmr/vi-vn/",
                                    Icon: "AllianceCooperation.svg",
                                    piwik:{
                                        eventAction:"Go to Affiliate Page",
                                        eventName:"MemberCenter_C_Affiliate"
                                    }
                                },
                                {
                                    Name: "Giới Thiệu Bạn Bè",
                                    Url: "/referrer-activity",
                                    Icon: "ReferAFriend.svg",
                                    piwik:{
                                        eventAction:"Go to Refer Friend",
                                        eventName:"MemberCenter_C_ReferFriend"
                                    }
                                },
                            ].map((item, index) => {
                                return (
                                    <Flexbox
                                        key={index + "Btn"}
                                        className="item"
                                        onClick={() => {
                                            Pushgtagdata("MemberCenter", item.piwik.eventAction, item.piwik.eventName)
                                            if (item.Name == "Đại Lý") {
                                                Modal.info({
                                                    title: "Lưu Ý",
                                                    centered: true,
                                                    okText: "Chắc Chắn",
                                                    cancelText: "Hủy",
                                                    className: `commonModal`,
                                                    content: (
                                                        <div className="note">
                                                            Trang này sẽ được mở bằng trình duyệt
                                                        </div>
                                                    ),
                                                    onOk: () => {
                                                        window.open(
                                                            item.Url,
                                                            `_blank`
                                                        );
                                                    },
                                                    onCancel: () => {},
                                                });

                                                return;
                                            }
                                            if (item.Name == "Giới Thiệu Bạn Bè") {
                                                this.GetQueleaActiveCampaign(item.Url);
                                                return 
                                            }
                                            Router.push(item.Url);
                                        }}
                                    >
                                        <ReactSVG
                                            src={`/img/P5/svg/MePage/${item.Icon}`}
                                        />
                                        {item.Name}
                                    </Flexbox>
                                );
                            })}
                        </Flexbox>
                        {/* 菜单 */}
                        <Flexbox
                            className="User-Quick-Menu"
                            flexDirection="column"
                        >
                            {[
                                {
                                    Name: "Thông Tin Cá Nhân",
                                    Url: "/me/account-info",
                                    Icon: "AccountInformation.svg",
                                    piwik:{
                                        eventAction:"Edit Profile",
                                        eventName:"MemberCenter_C_EditPersonalInfo"
                                    }
                                },
                                {
                                    Name: "Quản Lý Địa Chỉ",
                                    Url: "/me/shipment-address",
                                    Icon: "ShippingAdd.svg",
                                    piwik:{
                                        eventAction:"Go to Shipment Address",
                                        eventName:"MemberCenter_C_ShipmentAddress"
                                    }
                                },
                                {
                                    Name: "Ngân Hàng và Ví Tiền USDT",
                                    Url: "/me/bank-account",
                                    Icon: "BankInformation.svg",
                                    piwik:{
                                        eventAction:"Go to Account Management",
                                        eventName:"MemberCenter_C_AccountManagement"
                                    }
                                },
                                {
                                    Name: "Tự Loại Trừ",
                                    Url: "/me/self-exclusion",
                                    Icon: "Self-Limiting.svg",
                                    piwik:{
                                        eventAction:"Go to Self Exclusion",
                                        eventName:"MemberCenter_C_SelfExclution"
                                    }
                                },
                                {
                                    Name: "Tạo Mã Bảo Mật",
                                    Url: "/me/security-code",
                                    Icon: "SecurityCode.svg",
                                    piwik:{
                                        eventAction:"Go to Passcode Verification",
                                        eventName:"MemberCenter_C_PasscodeVerification"
                                    }
                                },
                                {
                                    Name: "Đăng Tải Chứng Từ Cá Nhân",
                                    Url: "/me/upload-files",
                                    Icon: "UploadFiles.svg",
                                    piwik:{
                                        eventAction:"Go to CDU Verification",
                                        eventName:"MemberCenter_C_CDU"
                                    }
                                },
                            ].map((item, index) => {
                                return (
                                    <Flexbox
                                        key={index + "Btn"}
                                        className="item"
                                        onClick={() => {
                                            if (!checkLogin) {
                                                Router.push("/register_login");
                                                return;
                                            }
                                            Pushgtagdata("MemberCenter", item.piwik.eventAction, item.piwik.eventName)
                                            Router.push(item.Url);
                                        }}
                                    >
                                        <ReactSVG
                                            src={`/img/P5/svg/MePage/${item.Icon}`}
                                        />
                                        {item.Name}
                                    </Flexbox>
                                );
                            })}
                        </Flexbox>
                        {/* 菜单 */}
                        <Flexbox
                            className="User-Quick-Menu"
                            flexDirection="column"
                        >
                            {[
                                { 
                                    Name: "Tải App", 
                                    Url: "", 
                                    Icon: "App.svg" ,
                                    piwik:
                                    {
                                        eventAction:"Piwik文件未提供",
                                        eventName:"Piwik文件未提供"
                                    }
                                },
                                {
                                    Name: "FAQ",
                                    Url: "/help",
                                    Icon: "Help.svg",
                                    piwik:
                                    {
                                        eventAction:"View Help Center",
                                        eventName:"MemberCenter_C_HelpCenter"
                                    }
                                },
                            ].map((item, index) => {
                                return (
                                    <Flexbox
                                        key={index + "Btn"}
                                        className="item"
                                        onClick={() => {
                                            Pushgtagdata("MemberCenter", item.piwik.eventAction, item.piwik.eventName)
                                            if (item.Name == "Tải App") {
                                                const affParam = getAffParam();
                                                window.location.href =
                                                    "/vn/mobile/Appinstall.html" +
                                                    affParam;
                                                //global.callApplib.open({ path: '' });
                                                return;
                                            }
                                            Router.push(item.Url);
                                        }}
                                    >
                                        <ReactSVG
                                            src={`/img/P5/svg/MePage/${item.Icon}`}
                                        />
                                        {item.Name}
                                    </Flexbox>
                                );
                            })}
                        </Flexbox>
                        {/* 退出登录 */}
                        {checkLogin && (
                            <Flexbox
                                className="LoginOut"
                                onClick={() => {
                                    if (this.state.checkSafeHouse) {
                                        setIsLogout();
                                        // redirectToLogin();
                                        Router.push("/safehouse");
                                    } else {
                                        setIsLogout();
                                        Router.push("/");
                                        // redirectToLogin();
                                    }
                                }}
                            >
                                Đăng Xuất
                            </Flexbox>
                        )}
                    </Flexbox>
                </Flexbox>
                <CallApplib key={Math.random()} />
                <Vipcustomerservice
                    visible={feedbackModal}
                    onCloseModal={() => {
                        this.setState({ feedbackModal: false });
                    }}
                />
                <Modal
					className="noRAFModal ConfirmModal"
					visible={this.state.noRAFModal}
					transparent
					maskClosable={false}
					closable={false}
					title="Giới Thiệu Bạn Bè Chưa Được Kích Hoạt"
				>
					<div>
						<ReactIMG src={'/img/verify/warn.png'}/>
						<p>Hãy giới thiệu bạn bè và nhận thưởng khi chương trình Giới Thiệu Bạn Bè tại FUN88 được kích hoạt</p>
						<div className="Btn" onClick={()=> {this.setState({noRAFModal: false})} } style={{width: '100%', fontSize: '14.5px'}}>
							Đã Hiểu
						</div>
					</div>

				</Modal>
            </Layout>
        );
    }
}

const mapStateToProps = (state) => ({
    userInfo: state.userInfo,
});

const mapDispatchToProps = {
    userInfo_getBalance: (forceUpdate = false) =>
        ACTION_UserInfo_getBalance(forceUpdate),
    userInfo_getDetails: () => ACTION_User_getDetails(),
};

export default connect(mapStateToProps, mapDispatchToProps)(Me);

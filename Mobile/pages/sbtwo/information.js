import React from "react";
import Tabs, { TabPane } from "rc-tabs";
import Layout from "$SBTWO/Layout";
import { ReactSVG } from "$SBTWO/ReactSVG";
import Toast from "$SBTWO/Toast";
import { fetchRequest } from "$SBTWOLIB/SportRequest";
import { ApiPort } from "$SBTWOLIB/SPORTAPI";
import VendorIM from "$SBTWOLIB/vendor/im/VendorIM";
import VendorBTI from "$SBTWOLIB/vendor/bti/VendorBTI";
import VendorSABA from "$SBTWOLIB/vendor/saba/VendorSABA";
import MessageDetail from "$SBTWO/Message/MessageDetail";
import MoreLoading from "$SBTWO/Message/MoreLoading";
import MessageItem from "$SBTWO/Message/MessageItem";
import Service from "$SBTWO/Header/Service";
import { checkIsLogin } from '$SBTWOLIB/js/util';

const content = {
    left: (
        <div className="">
            <ReactSVG
                className="back-icon"
                src="/img/svg/LeftArrow.svg"
                onClick={() => {
                    history.go(-1);
                }}
            />
        </div>
    ),
    right: (
        <div className="header-tools-wrapper">
            <Service />
        </div>
    ),
};
export default class Information extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            tabType: "1", // 1.通知 2.公告
            sportsTabType: "IM", // 1.Bti 2.Im
            PMATab: "1", // 1.Personal 2.Transfer 3.Announcement
            isShowDetail: false,
            detailData: "",
            // 公告
            AnnouncementData: "",
            selItemAnnouncement: { id: "0", egName: "All", label: "全部" },
            AnnouncementUnreadCount: 0,
            // 通知
            TransferData: "", //交易
            PersonalData: "", //个人
            selItemTransfer: { id: "0", egName: "All", label: "全部" },
            PersonalUnreadCount: 0,
            TransferUnreadCount: 0,
            moreLoading: false,
            // page info
            TransferPageInfo: {
                currentIndex: 1,
                lastPage: 1,
            },

            PersonalPageInfo: {
                currentIndex: 1,
                lastPage: 1,
            },

            AnnouncementPageInfo: {
                currentIndex: 1,
                lastPage: 1,
            },

            currentShowNotice: [],
            currentShowNoticeAll: [],
            SportsPageInfo: {
                currentIndex: 1,
                lastPage: 1,
            },
        };
    }

    componentDidMount() {
        if (checkIsLogin()) {
            Toast.loading();
            let processed = [
                this.GetAnnouncementData(),
                this.GetTransferData(),
                this.GetPersonalData()
            ];
            Promise.all(processed).then((res) => {
                if (res) {
                    Toast.destroy();
                }
            });
        }
    }

    GetAnnouncementData = () => {
        let { selItemAnnouncement } = this.state;
        let fetchurl = `${ApiPort.GetAnnouncements}MessageTypeOptionID=${selItemAnnouncement.id}&PageSize=8&PageIndex=1&`;
        return fetchRequest(fetchurl, "GET").then((res) => {
            if (res && res.isSuccess && res.result) {
                this.SetNews("Announcement", res.result)
            }
        });
    };

    GetTransferData = () => {
        let { selItemTransfer } = this.state;
        let fetchurl =
            ApiPort.GetMessages +
            "?MessageTypeID=2&MessageTypeOptionID=0&PageSize=8&PageIndex=1&";
        return fetchRequest(fetchurl, "GET").then((res) => {
            if (res && res.isSuccess && res.result) {
                this.SetNews("Transfer", res.result)
            }
          }
        );
    };

    GetPersonalData = () => {
        let fetchurl =
            ApiPort.GetMessages +
            "?MessageTypeID=1&MessageTypeOptionID=0&PageSize=8&PageIndex=1&";
        return fetchRequest(fetchurl, "GET").then((res) => {
            if (res && res.isSuccess && res.result) {
                this.SetNews("Personal", res.result)
            }
        });
    };

    getVendorAnnouncements(vendor = 'IM') {
        console.log('===getVendorAnnouncements',vendor);
        let targetVendor = VendorIM;
        if (vendor === 'BTI') {
            targetVendor = VendorBTI;
        } else if (vendor === 'SABA') {
            targetVendor = VendorSABA;
        }
        Toast.loading();
        this.setState({
            currentShowNotice: [],
            SportsPageInfo: {
                currentIndex: 1,
                lastPage: 1,
            },
        })
        targetVendor.getAnnouncements()
          .then((datas) => {
              Array.isArray(datas) && this.SetSportsNews(datas)
              Toast.destroy();
          })
          .catch((err) => {
              Toast.destroy();
              console.log(err);
          });
    }

    SetSportsNews = (res) => {
        let pageTotal = Math.ceil((res.length * 1) / 8);
        this.setState({
            currentShowNotice: this.state.currentShowNotice.concat(res.slice(0, this.state.SportsPageInfo.currentIndex*8)),
            currentShowNoticeAll: res,
            SportsPageInfo: {
                currentIndex: 1,
                lastPage: pageTotal,
            },
        });
    }

    SetNews = (type, res) => {
        let data =
            type === "Announcement"
                ? res.announcementsByMember
                : res.inboxMessagesListItem;
        let pageTotal = Math.ceil((res.totalGrandRecordCount * 1) / 8);
        this.setState({
            [`${type}Data`]: data,
            [`${type}UnreadCount`]: res.totalUnreadCount,
            [`${type}PageInfo`]: {
                currentIndex: 1,
                lastPage: pageTotal,
            },
        });
    };

    // 訊息詳情
    closeMessageModal = () => {
        this.setState({
            isShowDetail: false,
        });
    };

    openDetail = (type, dataItem) => {
        this.setState(
            {
                detailData: "",
                isShowDetail: true,
            },
            () => {
                this.getDetail(type, dataItem);
            }
        );
    };

    goDetail = (type, data) => {
        !data.isRead && this[`Update${type}Data`](data);
        type !== "Transfer" && this.openDetail(type, data);
        return;
    };

    getDetail = (type, data) => {
        if (parseInt(data.messageID) === 0) {
            this.setState({
                detailData: data
            });
            return;//[個人]有可能包含帳戶信息(MessageID===0)，但是會沒有detail可查，直接使用當前數據展示
        }
        let fetchurl = "";
        if (type === "Announcement") {
            fetchurl =
                ApiPort.GetAnnouncementDetail +
                "?AnnouncementID=" +
                data.announcementID +
                "&";
        } else {
            fetchurl =
                ApiPort.GetMessageDetail + "?MessageID=" + data.messageID + "&";
        }
        Toast.loading();
        fetchRequest(fetchurl, "GET")
            .then((res) => {
                if (res && res.isSuccess && res.result) {
                    this.setState({
                        detailData:
                            type === "Announcement"
                                ? res.result.announcementResponse
                                : res.result.personalMessage,
                    });
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                Toast.destroy();
            });
    };

    // 更新消息已读
    UpdatePersonalData = (data) => {
        let fetchData = this.getSingleFetchData(data);
        this.update("Personal", fetchData, data, true);
    };

    UpdateTransferData = (data) => {
        let fetchData = this.getSingleFetchData(data);
        this.update("Transfer", fetchData, data, true);
    };

    update = (type, fetchData, data, isSingle) => {
        let fetchstring = type === "Announcement" ? "Announcement" : "Message";
        Toast.loading();
        fetchRequest(ApiPort[`Update${fetchstring}`], "PATCH", fetchData)
            .then((res) => {
                if (res && res.isSuccess && res.result) {
                    if (isSingle) {
                        let tempArr = this.state[`${type}Data`];
                        let index = tempArr.findIndex((item) => {
                            if (type === "Announcement") {
                                return (
                                    data.announcementID === item.announcementID
                                );
                            } else {
                                return (
                                    data.memberNotificationID ===
                                    item.memberNotificationID
                                );
                            }
                        });
                        tempArr[index].isRead = true;
                        this.setState({
                            [`${type}Data`]: tempArr,
                            [`${type}UnreadCount`]:
                                this.state[`${type}UnreadCount`] - 1,
                        });
                    } else {
                        this[`Get${type}Data`]();
                    }
                }
                // Toast.Toast.destroy();
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                Toast.destroy();
            });
    };

    getSingleFetchData = (data) => {
        return {
            personalMessageUpdateItem: [
                {
                    messageID: data.messageID,
                    memberNotificationID: data.memberNotificationID,
                    isRead: true,
                    isOpen: data.isOpen,
                },
            ],
            actionBy: JSON.parse(localStorage.getItem("memberCode")),
            timestamp: new Date().toJSON(),
        };
    };

    // 更新公告已读
    UpdateAnnouncementData = (data) => {
        let fetchData = {
            announcementUpdateItems: [
                {
                    announcementID: data.announcementID,
                    isRead: true,
                    isOpen: data.isOpen,
                },
            ],
            actionBy: JSON.parse(localStorage.getItem("memberCode")),
            timestamp: new Date().toJSON(),
        };
        this.update("Announcement", fetchData, data, true);
    };

    tabOneUnreadCount = () => {
        const {
            TransferUnreadCount,
            PersonalUnreadCount,
            AnnouncementUnreadCount,
        } = this.state;
        return (
            TransferUnreadCount * 1 +
            PersonalUnreadCount * 1 +
            AnnouncementUnreadCount * 1
        );
    };

    haveUnread = (type) => {
        if (this.state[`${type}Data`]) {
            return this.state[`${type}Data`].some((v) => !v.isRead);
        }
    };

    doReadAllMessage = (type) => {
        let fetchData = {
            actionBy: JSON.parse(localStorage.getItem("memberCode")),
            readAll: true,
            timestamp: new Date().toJSON()
        };
        this.update(type, fetchData);
        // Pushgtagdata(`Notification`, 'View', `Notification_readAll`);
    };

    readAllUI = (type) => {
        return (
            <div className="sbtwo-information__box__readAll">
                <div className="readAllText">只显示90天内的信息</div>
                <div
                    className={
                        this.haveUnread(type)
                            ? "readAllBtn"
                            : "readAllBtn allHaveRead"
                    }
                    onClick={() => this.doReadAllMessage(type)}
                >
                    全部已读
                </div>
            </div>
        );
    };

    onClickInfoTabs = (key) => {
        this.setState({
            PMATab: key,
        });
        if(key==1){
            // Pushgtagdata(`Notification`, 'View', `Notification_personal`);
        }else if(key==2){
            // Pushgtagdata(`Notification`, 'View', `Notification_account`);
        }else if(key==3){
            // Pushgtagdata(`Notification`, 'View', `Notification_general`);
        }
    };

    getMessageIcon = (type, data) => {
        switch (type) {
            case "Personal":
                return `sbtwo-messageIcons ${type}`;
            case "Transfer":
                return `sbtwo-messageIcons ${type}-${data.messageTypeOptionID}`;
            case "Announcement":
                if (
                    data.newsTemplateCategory !== 7 &&
                    data.newsTemplateCategory !== 8 &&
                    data.newsTemplateCategory !== 9
                ) {
                    return `sbtwo-messageIcons ${type}-Other`;
                } else {
                    return `sbtwo-messageIcons ${type}-${data.newsTemplateCategory}`;
                }

            default:
                break;
        }

        // return "sbtwo-messageIcons";
    };

    // 顯示更多訊息
    moreMessage = (type) => {
        const { moreLoading } = this.state;
        return (
            <div className="more-message">
                {this.isLastPage(type) ? (
                    <span className="noMore">沒有更多信息</span>
                ) : moreLoading ? (
                    <MoreLoading />
                ) : (
                    <span onClick={() => this.getNextPage(type)}>
                        点击显示更多信息
                    </span>
                )}
            </div>
        );
    };

    isLastPage = (type) => {
        if (this.state[[`${type}PageInfo`]]["lastPage"] === 1) {
            return true;
        } else {
            return (
                this.state[`${type}PageInfo`]["currentIndex"] >=
                this.state[[`${type}PageInfo`]]["lastPage"]
            );
        }
    };

    getNextPage = (type) => {
        let fetchurl = "";
        const {
            TransferPageInfo,
            PersonalPageInfo,
            AnnouncementPageInfo,
            selItemAnnouncement,
        } = this.state;

        if (this.isLastPage(type)) return;

        switch (type) {
            case "Personal":
                fetchurl = `${
                    ApiPort.GetMessages
                }?MessageTypeID=1&MessageTypeOptionID=0&PageSize=8&PageIndex=${
                    PersonalPageInfo.currentIndex * 1 + 1
                }&`;
                break;
            case "Transfer":
                fetchurl = `${
                    ApiPort.GetMessages
                }?MessageTypeID=2&MessageTypeOptionID=0&PageSize=8&PageIndex=${
                    TransferPageInfo.currentIndex * 1 + 1
                }&`;
                break;
            case "Announcement":
                fetchurl = `${ApiPort.GetAnnouncements}MessageTypeOptionID=${
                    selItemAnnouncement.id
                }&PageSize=8&PageIndex=${
                    AnnouncementPageInfo.currentIndex * 1 + 1
                }&`;
                break;
            case "Sports":
                this.goNextSportMsg()
                return;
            default:
                return;
        }

        this.setState(
            {
                moreLoading: true,
            },
            () => {
                fetchRequest(fetchurl, "GET")
                    .then((res) => {
                        if (res && res.isSuccess && res.result) {
                            let data =
                                type === "Announcement"
                                    ? res.result.announcementsByMember
                                    : res.result.inboxMessagesListItem;
                            this.setState((prevState, props) => {
                                return {
                                    [`${type}Data`]: [
                                        ...this.state[[`${type}Data`]],
                                        ...data,
                                    ],
                                    [`${type}PageInfo`]: {
                                        ...this.state[`${type}PageInfo`],
                                        currentIndex:
                                            prevState[`${type}PageInfo`][
                                                "currentIndex"
                                            ] *
                                                1 +
                                            1,
                                    },
                                };
                            });
                        } else {
                            Toast.fail("请求失败！");
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    })
                    .finally(() => {
                        this.setState({
                            moreLoading: false,
                        });
                    });
            }
        );
    };

    goNextSportMsg = () => {
        this.setState({
            SportsPageInfo: {
                ...this.state.SportsPageInfo,
                currentIndex:
                    this.state.SportsPageInfo[
                        "currentIndex"
                    ] *
                        1 +
                    1,
            },
        }, ()=>{
            const { currentShowNotice, currentShowNoticeAll } = this.state;
            const indexOfLastPost = this.state.SportsPageInfo.currentIndex * 8;
            const indexOfFirstPost = indexOfLastPost - 8;
            this.setState({
                currentShowNotice: currentShowNotice.concat(currentShowNoticeAll.slice(indexOfFirstPost, indexOfLastPost)),
            })
        })
    }

    getFetchData = (type) => {
        let { AnnouncementData, TransferData, PersonalData } = this.state;
        let fetchData = {
            actionBy: JSON.parse(localStorage.getItem("memberCode")),
            timestamp: new Date().toJSON(),
        };
        let tempArr = [];
        // let type = Number(this.state.tabIndex) === 0 ? 'System' : 'Personal';
        if (type === "Announcement") {
            for (let i = 0; i < AnnouncementData.length; i++) {
                if (!AnnouncementData[i].isRead) {
                    let tempItem = {};
                    tempItem.announcementID =
                        AnnouncementData[i].announcementID;
                    tempItem.isRead = true;
                    tempItem.isOpen = AnnouncementData[i].isOpen;
                    tempArr.push(tempItem);
                }
            }
            fetchData.announcementUpdateItem = tempArr;
        } else {
            let datalist = this.state[`${type}Data`];
            for (let i = 0; i < datalist.length; i++) {
                if (!datalist[i].isRead) {
                    let tempItem = {};
                    tempItem.messageID = datalist[i].messageID;
                    tempItem.memberNotificationID =
                        datalist[i].memberNotificationID;
                    tempItem.isRead = true;
                    tempItem.isOpen = datalist[i].isOpen;
                    tempArr.push(tempItem);
                }
            }
            fetchData.personalMessageUpdateItem = tempArr;
        }

        return fetchData;
    };

    onClickTabs = (key) => {
       if(key === "2") {
           this.getVendorAnnouncements(this.state.sportsTabType);
        //    Pushgtagdata(`Announcement`, 'View', `Vendor_Announcement`);
       }
    }

    onClickSportsTabs = (key) => {
        this.setState({
            sportsTabType: key,
        });
        this.getVendorAnnouncements(key);
    };

    getTime = item => {
        let times = (new Date(item.replace('T', ' ').replace(/\-/g, '/'))).getTime() + 60 * 60 * 8 * 1000;

		let myDate = new Date(times)
		let y = myDate.getFullYear();
		let m = myDate.getMonth()+1;
		let d =  myDate.getDate();
		let h = myDate.getHours();
		let mi = myDate.getMinutes();

		if (m < 10) { m = '0' + m.toString() }
		if (d < 10) { d = '0' + d.toString() }
		if (h < 10) { h = '0' + h.toString() }
		if (mi < 10) { mi = '0' + mi.toString() }

		return `${y}-${m}-${d} ${h}:${mi}`
      };

    render() {
        const {
            tabType,
            sportsTabType,
            isShowDetail,
            TransferUnreadCount,
            PersonalUnreadCount,
            AnnouncementUnreadCount,
            PersonalData,
            TransferData,
            AnnouncementData,
            detailData,
            PMATab,
        } = this.state;
        return (
            <Layout status={0}>
                <div className="information__main">
                    <Tabs
                        prefixCls="tabsOval"
                        defaultActiveKey={tabType}
                        tabBarExtraContent={content}
                        onChange={this.onClickTabs}
                    >
                        <TabPane
                            tab={
                                <div className="notice_tab">
                                    通知
                                    {this.tabOneUnreadCount() > 0 && (
                                        <span className="notice_active" />
                                    )}
                                </div>
                            }
                            key="1"
                        >
                            <Tabs
                                prefixCls="tabsNormal"
                                defaultActiveKey={PMATab}
                                className="info__inside__tabs"
                                onChange={this.onClickInfoTabs}
                            >
                                <TabPane
                                    tab={`个人 ${PersonalUnreadCount}`}
                                    key="1"
                                >
                                    <div className="information__box">
                                        {this.readAllUI("Personal")}
                                        {PersonalData &&
                                            PersonalData.map((item) => (
                                                <MessageItem
                                                    key={item.memberNotificationID}
                                                    type="Personal"
                                                    item={item}
                                                    goDetail={this.goDetail}
                                                    getMessageIcon={
                                                        this.getMessageIcon
                                                    }
                                                    getTime={
                                                        this.getTime
                                                    }
                                                />
                                            ))}
                                        {this.moreMessage("Personal")}
                                    </div>
                                </TabPane>
                                <TabPane
                                    tab={`账户 ${TransferUnreadCount}`}
                                    key="2"
                                >
                                    {this.readAllUI("Transfer")}
                                    {TransferData &&
                                        TransferData.map((item) => (
                                            <MessageItem
                                                type="Transfer"
                                                key={item.memberNotificationID}
                                                item={item}
                                                goDetail={this.goDetail}
                                                getMessageIcon={
                                                    this.getMessageIcon
                                                }
                                                getTime={
                                                    this.getTime
                                                }
                                            />
                                        ))}
                                    {this.moreMessage("Transfer")}
                                </TabPane>
                                <TabPane
                                    tab={`一般 ${AnnouncementUnreadCount}`}
                                    key="3"
                                >
                                    {this.readAllUI("Announcement")}
                                    {AnnouncementData &&
                                        AnnouncementData.map((item) => (
                                            <MessageItem
                                                type="Announcement"
                                                key={item.announcementID}
                                                item={item}
                                                goDetail={this.goDetail}
                                                getMessageIcon={
                                                    this.getMessageIcon
                                                }
                                                getTime={
                                                    this.getTime
                                                }
                                            />
                                        ))}
                                    {this.moreMessage("Announcement")}
                                </TabPane>
                            </Tabs>
                        </TabPane>
                        <TabPane
                            tab={<div className="notice_tab">公告</div>}
                            key="2"
                        >
                            <Tabs
                                prefixCls="tabsNormal"
                                defaultActiveKey={sportsTabType}
                                className="info__inside__tabs"
                                onChange={this.onClickSportsTabs}
                            >
                                <TabPane tab="IM" key="IM">
                                    <p className="vendor-notice-small-prompt">
                                        只显示30天内的信息
                                    </p>
                                    {this.state.currentShowNotice.length > 0 ? (
                                        <div className="notice-wrapper im-notice-wrapper">
                                            {this.state.currentShowNotice.map(
                                                (v) => {
                                                    return (
                                                        <div
                                                            key={
                                                                v.AnnouncementId
                                                            }
                                                            className="vendor-notice-item"
                                                        >
                                                            <h4>{v.PostingDate}</h4>
                                                            <div className="vendor-notice-con">
                                                                {
                                                                    v.AnnouncementText
                                                                }
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                            {this.moreMessage("Sports")}
                                        </div>
                                    ) : null}
                                </TabPane>
                                <TabPane tab="沙巴" key="SABA">
                                    <p className="vendor-notice-small-prompt">
                                        只显示7天内的信息
                                    </p>
                                    {this.state.currentShowNotice.length > 0 ? (
                                      <div className="notice-wrapper im-notice-wrapper">
                                          {this.state.currentShowNotice.map(
                                            (v) => {
                                                return (
                                                  <div
                                                    key={
                                                        v.AnnouncementId
                                                    }
                                                    className="vendor-notice-item"
                                                  >
                                                      <h4>{v.PostingDate}</h4>
                                                      <div className="vendor-notice-con">
                                                          {
                                                              v.AnnouncementText
                                                          }
                                                      </div>
                                                  </div>
                                                );
                                            }
                                          )}
                                          {this.moreMessage("Sports")}
                                      </div>
                                    ) : null}
                                </TabPane>
                                <TabPane tab="BTI" key="BTI">
                                    <p className="vendor-notice-small-prompt">
                                        只显示30天内的信息
                                    </p>
                                    {this.state.currentShowNotice.length > 0 ? (
                                      <div className="notice-wrapper im-notice-wrapper">
                                          {this.state.currentShowNotice.map(
                                            (v) => {
                                                return (
                                                  <div
                                                    key={
                                                        v.AnnouncementId
                                                    }
                                                    className="vendor-notice-item"
                                                  >
                                                      <h4>{v.PostingDate}</h4>
                                                      <div className="vendor-notice-con">
                                                          {
                                                              v.AnnouncementText
                                                          }
                                                      </div>
                                                  </div>
                                                );
                                            }
                                          )}
                                          {this.moreMessage("Sports")}
                                      </div>
                                    ) : null}
                                </TabPane>
                            </Tabs>
                        </TabPane>
                    </Tabs>
                </div>

                <MessageDetail
                    getTime={this.getTime}
                    isShowDetail={isShowDetail}
                    onClose={this.closeMessageModal}
                    data={detailData}
                    type={PMATab}
                />
            </Layout>
        );
    }
}

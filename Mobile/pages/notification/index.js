import React, {Component} from 'react';
import Tabs, {TabPane} from 'rc-tabs';
import Layout from '@/components/Layout';
import {ReactSVG} from '@/components/View/ReactSVG';
import Toast from '@/components/View/Toast';
import {fetchRequest} from '@/server/Request';
import {ApiPort} from '@/api/index';
import MessageDetail from '@/components/notification/MessageDetail';
import MoreLoading from '@/components/notification/MoreLoading';
import MessageItem from '@/components/notification/MessageItem';
import Service from '@/components/Header/Service';
import {checkIsLogin} from '@/lib/js/util';
import DropDownSingle from '@/components/Common/DropDownSingle/';
import Skeleton, {SkeletonTheme} from 'react-loading-skeleton';
import Modal from '@/components/View/Modal';
import {UpdateAnnouncement, UpdateMessage, UnreadMessage} from '@/api/message';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/notification'); //參數帶本頁的路徑
}
let radioList = [
    {id: '0', egName: 'All', label: 'Tất Cả', piwikId: 'All_sorting_transaction'},
    {id: '3', egName: 'Deposit', label: 'Gửi Tiền', piwikId: 'Deposit_sorting_transaction'},
    {id: '4', egName: 'Transfer', label: 'Chuyển Khoản', piwikId: 'Transfer_sorting_transaction'},
    {id: '5', egName: 'Withdrawal', label: 'Rút Tiền', piwikId: 'Withdrawal_sorting_transaction'},
    {id: '6', egName: 'Bonus', label: 'Thưởng', piwikId: 'Bonus_sorting_transaction'}
];

let AnnouncementRadioList = [
    {id: '0', egName: 'All', label: 'Tất Cả', piwikId: 'All_sorting_transaction'},
    {id: '7', egName: 'Deposit', label: 'Cá Nhân', piwikId: 'Deposit_sorting_transaction'},
    {id: '8', egName: 'Transfer', label: 'Sản Phẩm', piwikId: 'Transfer_sorting_transaction'},
    {id: '9', egName: 'Withdrawal', label: 'Khuyến Mãi', piwikId: 'Withdrawal_sorting_transaction'},
    {id: '10', egName: 'Bonus', label: 'Khác', piwikId: 'Bonus_sorting_transaction'}
];
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
            <Service/>
        </div>
    )
};
export default class Message extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            tabType: '1', // 1.通知 2.公告
            sportsTabType: '1', // 1.Bti 2.Im
            PMATab: '1', // 1.Personal 2.Transaction 3.Announcement
            isShowDetail: false,
            detailData: '',
            // 公告
            AnnouncementData: '',
            selItemAnnouncement: {id: '0', egName: 'All', label: '全部'},
            AnnouncementUnreadCount: 0,
            // 通知
            TransactionData: '', //交易
            PersonalData: '', //个人
            selItemTransaction: {id: '0', egName: 'All', label: '全部'},
            PersonalUnreadCount: 0,
            TransactionUnreadCount: 0,
            moreLoading: false,
            // page info
            TransactionPageInfo: {
                currentIndex: 1,
                lastPage: 1
            },
            PersonalPageInfo: {
                currentIndex: 1,
                lastPage: 1
            },
            AnnouncementPageInfo: {
                currentIndex: 1,
                lastPage: 1
            },
            selItem: {id: '0', egName: 'All', label: 'Tất Cả', piwikId: 'All_sorting_transaction'}
        };
    }

    componentDidMount() {
        if (checkIsLogin()) {
            Toast.loading();
            let processed = [
                //获取公告
                this.GetAnnouncementData(0),
                //获取账户交易
                this.GetTransactionData(0),
                //获取个人
                this.GetPersonalData()
            ];
            Promise.all(processed).then((res) => {
                if (res) {
                    Toast.destroy();
                }
            });
            //获取计数 未读
            //this.getMessageCount();
        }
    }

    /**
     * @description: 未读消息统计
     * @return {*}
     */

    getMessageCount = () => {
        UnreadMessage((res) => {
            if (res.isSuccess && res.result) {
                this.setState({
                    TransactionUnreadCount: res.result.unreadTransactionCount,
                    PersonalUnreadCount: res.result.unreadPersonalMessageCount,
                    AnnouncementUnreadCount: res.result.unreadAnnouncementCount
                });
            }
        });
    };

    /**
     * @description: 公告
     * @param {*}
     * @return {*}
     */

    GetAnnouncementData = (messageTypeOptionID) => {
        let {selItemAnnouncement} = this.state;
        let fetchurl = `${ApiPort.GetAnnouncements}messageTypeOptionId=${messageTypeOptionID
            ? messageTypeOptionID
            : selItemAnnouncement.id}&PageSize=8&PageIndex=1&`;

        return fetchRequest(fetchurl, 'GET').then((res) => {
            this.SetNews('Announcement', res.result);
        });
    };

    /**
     * @description: 交易
     * @param {*}
     * @return {*}
     */

    GetTransactionData = (messageTypeOptionId) => {
        let fetchurl =
            ApiPort.GetMessages + `?messageTypeId=2&messageTypeOptionId=${messageTypeOptionId ? messageTypeOptionId : '0'}&PageSize=8&PageIndex=1&`;
        return fetchRequest(fetchurl, 'GET').then((res) => this.SetNews('Transaction', res.result ? res.result : []));
    };

    /**
     * @description: 个人
     * @param {*}
     * @return {*}
     */
    GetPersonalData = () => {
        let fetchurl = ApiPort.GetMessages + '?messageTypeId=1&messageTypeOptionId=0&PageSize=8&PageIndex=1&';
        return fetchRequest(fetchurl, 'GET').then((res) => this.SetNews('Personal', res.result));
    };

    /**
     * @description: 消息数据
     * @param {*} type
     * @param {*} res
     * @return {*}
     */

    SetNews = (type, res) => {
        let data = (type === 'Announcement' ? res?.announcementsByMember : res?.inboxMessagesListItem) ?? [];
        let pageTotal = Math.ceil(res.totalGrandRecordCount * 1 / 8);
        console.log(data);
        this.setState({
            [`${type}Data`]: data,
            [`${type}UnreadCount`]: res?.totalUnreadCount,
            [`${type}PageInfo`]: {
                currentIndex: 1,
                lastPage: pageTotal
            }
        });
    };

    /**
     * @description: 关闭详情
     * @return {*}
     */

    closeMessageModal = () => {
        this.setState({
            isShowDetail: false
        });
    };

    /**
     * @description: 打开详情页面 更新阅读状态
     * @param {*} type
     * @param {*} data
     * @return {*}
     */
    goDetail = (type, data) => {
        console.log(type);
        console.log(data);
        //公告阅读状态更新
        if (!data.isRead && type == 'Announcement') {
            this.ReadAnnouncement(data);
        }
        //通知阅读状态更新
        if (!data.isRead && (type == 'Personal' || type == 'Transaction')) {
            this.ReadPersonalMessage(data, type);
        }
        this.setState(
            {
                detailData: '',
                isShowDetail: true
            },
            () => {
                this.getDetail(type, data);
            }
        );
    };

    /**
     * @description: 更新阅读状态 公告
     * @param {*} Item
     * @return {*}
     */

    ReadAnnouncement(Item) {
        let data = {
            announcementUpdateItems: [
                {
                    announcementID: Item.announcementID,
                    isRead: true,
                    isOpen: true
                }
            ],
            actionBy: JSON.parse(localStorage.getItem('memberCode')),
            //readAll: true,
            timestamp: new Date().toJSON()
        };
        UpdateAnnouncement(data, (res) => {
            console.log(res);
            if (res.isSuccess && res.result) {
                this.GetAnnouncementData(0);
            }
        });
    }

    /**
     * @description: 更新消息的 阅读状态
     * @param {*} Item
     * @return {*}
     */
    ReadPersonalMessage(Item, type) {
        let data = {
            personalMessageUpdateItem: [
                {
                    messageID: Item.messageID,
                    memberNotificationID: Item.memberNotificationID,
                    isRead: true,
                    isOpen: true
                }
            ],
            actionBy: JSON.parse(localStorage.getItem('memberCode')),
            readAll: false,
            messageTypeID: Item.messageTypeID,
            timestamp: new Date().toJSON()
        };
        UpdateMessage(data, (res) => {
            console.log(res);
            if (res.isSuccess && res.result.isSuccess) {
                if (type == 'Personal') {
                    //重新获取个人信息
                    this.GetPersonalData();
                } else {
                    //重新获取账户交易信息
                    this.GetTransactionData(0);
                }
            }
        });
    }

    /**
     * @description: Api获取详情信息
     * @param {*} type
     * @param {*} data
     * @return {*}
     */

    getDetail = (type, data) => {
        console.log(data);
        if (parseInt(data.messageID) === 0) {
            this.setState({
                detailData: data
            });
            return; //[账户]有可能包含帳戶信息(MessageID===0)，但是會沒有detail可查，直接使用當前數據展示
        }
        let fetchurl = '';
        if (type === 'Announcement') {
            fetchurl = ApiPort.GetAnnouncementDetail + '?AnnouncementID=' + data.announcementID + '&';
        } else {
            fetchurl = ApiPort.GetMessageDetail + '?messageId=' + data.messageID + '&';
        }
        Toast.loading();
        fetchRequest(fetchurl, 'GET')
            .then((res) => {
                Toast.destroy();
                if (res.isSuccess) {
                    console.log(res);
                    this.setState({
                        detailData:
                            type === 'Announcement' ? res.result.announcementResponse : res.result.personalMessage
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

    /**
     * @description: 更新消息阅读状态
     * @param {*} type
     * @param {*} fetchData
     * @param {*} data
     * @param {*} isSingle
     * @return {*}
     */

    update = (type, fetchData, data, isSingle) => {
        let fetchstring = type === 'Announcement' ? 'Announcement' : 'Message';
        Toast.loading();
        fetchRequest(ApiPort[`Update${fetchstring}`] + `?siteId=38&`, 'PATCH', fetchData)
            .then((res) => {
                Toast.destroy();
                if (res && res.result) {
                    if (isSingle) {
                        let tempArr = this.state[`${type}Data`];
                        let index = tempArr.findIndex((item) => {
                            if (type === 'Announcement') {
                                return data.announcementID === item.announcementID;
                            } else {
                                return data.memberNotificationID === item.memberNotificationID;
                            }
                        });
                        tempArr[index].isRead = true;
                        this.setState({
                            [`${type}Data`]: tempArr,
                            [`${type}UnreadCount`]: this.state[`${type}UnreadCount`] - 1
                        });
                        this.doReadAllMessage();
                    } else {
                        this[`Get${type}Data`]();
                    }
                    Toast.success('Cập Nhật Thành Công');
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

    /**
     * @description: 未读（通知）数量
     * @return {*}
     */

    tabOneUnreadCount = () => {
        const {TransactionUnreadCount, PersonalUnreadCount} = this.state;
        return TransactionUnreadCount * 1 + PersonalUnreadCount * 1;
    };

    haveUnread = (type) => {
        if (this.state[`${type}Data`]) {
            return this.state[`${type}Data`].some((v) => !v.isRead);
        }
    };

    /**
     * @description: 标记全部已读
     * @param {*} type
     * @return {*}
     */

    doReadAllMessage = (type) => {
        let fetchData = {
            actionBy: JSON.parse(localStorage.getItem('memberCode')),
            readAll: true,
            timestamp: new Date().toJSON()
        };
        this.update(type, fetchData);
        // Pushgtagdata(`Notification`, 'View', `Notification_readAll`);
    };

    readAllUI = (type) => {
        return (
            <div
                className="information__box__readAll"
                style={{
                    justifyContent: type == 'Transaction' || type == 'Announcement' ? 'space-between' : 'flex-end'
                }}
            >
                {type == 'Transaction' && (
                    <div className="readAllText">
                        <DropDownSingle
                            data={radioList}
                            selItem={this.state.selItem}
                            changeSel={(type) => {
                                this.setState({
                                    selItemTransaction: type
                                });
                                this.GetTransactionData(type.id);
                            }}
                        />
                    </div>
                )}

                {type == 'Announcement' && (
                    <div className="readAllText">
                        <DropDownSingle
                            data={AnnouncementRadioList}
                            selItem={this.state.selItem}
                            changeSel={(type) => {
                                this.setState({
                                    selItemAnnouncement: type
                                });
                                this.GetAnnouncementData(type.id);
                            }}
                        />
                    </div>
                )}

                <div
                    className={this.haveUnread(type) ? 'readAllBtn' : 'readAllBtn allHaveRead'}
                    onClick={() => {
                        Pushgtagdata(`MemberCenter`, 'Mark All Read', `MemberCenter_Message_Tab_C_Read`);
                        Modal.info({
                            title: 'Đánh Dấu Đã Đọc',
                            centered: true,
                            okText: 'Xác Nhận',
                            cancelText: 'Để Sau',
                            className: `commonModal`,
                            content: <div className="note">Bạn xác nhận là muốn đánh dấu đã đọc cho tất cả các bài viết ?</div>,
                            onOk: () => {
                                this.doReadAllMessage(type);
                            },
                            onCancel: () => {
                            }
                        });
                    }}
                >
                    Đánh Dấu Tất Cả Đã Đọc
                </div>
            </div>
        );
    };

    onClickInfoTabs = (key) => {
        if (key === '1') {
            Pushgtagdata(`MemberCenter`, 'View Message (Transaction)', `MemberCenter_Message_Notice_C_Transaction`);
        } else if (key === '2') {
            Pushgtagdata(`MemberCenter`, 'View Message (PMA)', `MemberCenter_Message_Notice_C_Personal`);
        }
        // this.setState({
        // 	PMATab: key
        // });
        // if (key == 1) {
        //     // Pushgtagdata(`Notification`, 'View', `Notification_personal`);
        // } else if (key == 2) {
        //     // Pushgtagdata(`Notification`, 'View', `Notification_account`);
        // } else if (key == 3) {
        //     // Pushgtagdata(`Notification`, 'View', `Notification_general`);
        // }
    };

    /**
     * @description: 消息图标
     * @param {*} type
     * @param {*} data
     * @return {*}
     *
     通知
     ====== messageTypeId query ==========
     0    All         全部
     1    Personal    个人
     2    Transaction 交易
     ====== messageTypeOptionId query =====
     0    All         全部
     1    General     一般
     2    Promotions  优惠
     3    Deposit     存款
     4    Tsransfer    转账
     5    Withdrawal  提款
     6    Bonus       红利
     11    Freebet     免费投注
     12    Deposit Verification    存款验证
     =======================================

     公告  newsTemplateCategory
     0    All            全部
     1    Normal        普通
     2    Special        特殊
     3    Promotions    优惠
     7    Banking        银行
     8    Products    产品
     9    Promotions (New)
     10    General        一般
     */

    getMessageIcon = (type, data) => {
        console.log(type);
        console.log(data);
        switch (type) {
            case 'Personal':
                return `messageIcons ${type}`;
            case 'Transaction':
                return `messageIcons ${type}-${data.messageTypeOptionName.split(' ').join('')}`;
            case 'Announcement':
                if (
                    data.newsTemplateCategory !== 3 &&
                    data.newsTemplateCategory !== 7 &&
                    data.newsTemplateCategory !== 8 &&
                    data.newsTemplateCategory !== 9
                ) {
                    return `messageIcons ${type}-Other`;
                } else {
                    return `messageIcons ${type}-${data.newsTemplateCategory}`;
                }

            default:
                break;
        }

        // return "messageIcons";
    };

    // 顯示更多訊息
    moreMessage = (type) => {
        const {moreLoading} = this.state;
        return (
            <div className="more-message">
                {this.isLastPage(type) ? (
                    <div className="Divider-horizontal">
                        <div className="Divider-text">Hết Thông Báo Mới!</div>
                    </div>
                ) : moreLoading ? (
                    <MoreLoading/>
                ) : (
                    <span onClick={() => this.getNextPage(type)}>Xem Thêm</span>
                )}
            </div>
        );
    };

    isLastPage = (type) => {
        if (this.state[[`${type}PageInfo`]]['lastPage'] === 1) {
            return true;
        } else {
            return this.state[`${type}PageInfo`]['currentIndex'] >= this.state[[`${type}PageInfo`]]['lastPage'];
        }
    };

    getNextPage = (type) => {
        let fetchurl = '';
        const {TransactionPageInfo, PersonalPageInfo, AnnouncementPageInfo, selItemAnnouncement} = this.state;

        if (this.isLastPage(type)) return;

        switch (type) {
            case 'Personal':
                fetchurl = `${ApiPort.GetMessages}?messageTypeId=1&messageTypeOptionId=0&PageSize=8&PageIndex=${PersonalPageInfo.currentIndex *
                1 +
                1}&`;
                break;
            case 'Transaction':
                fetchurl = `${ApiPort.GetMessages}?messageTypeId=2&messageTypeOptionId=0&PageSize=8&PageIndex=${TransactionPageInfo.currentIndex *
                1 +
                1}&`;
                break;
            case 'Announcement':
                fetchurl = `${ApiPort.GetAnnouncements}messageTypeOptionId=${selItemAnnouncement.id}&PageSize=8&PageIndex=${AnnouncementPageInfo.currentIndex *
                1 +
                1}&`;
                break;
            default:
                return;
        }

        this.setState(
            {
                moreLoading: true
            },
            () => {
                fetchRequest(fetchurl, 'GET')
                    .then((res) => {
                        if (res.isSuccess && res.result) {
                            let data = (type === 'Announcement' ? res.result?.announcementsByMember : res.result?.inboxMessagesListItem) ?? [];
                            this.setState((prevState, props) => {
                                return {
                                    [`${type}Data`]: [...this.state[[`${type}Data`]], ...data],
                                    [`${type}PageInfo`]: {
                                        ...this.state[`${type}PageInfo`],
                                        currentIndex: prevState[`${type}PageInfo`]['currentIndex'] * 1 + 1
                                    }
                                };
                            });
                        } else {
                            Toast.error('请求失败！');
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    })
                    .finally(() => {
                        this.setState({
                            moreLoading: false
                        });
                    });
            }
        );
    };

    onClickTabs = (key) => {
        if (key === '1'){
            Pushgtagdata(`MemberCenter`, 'View Message', `MemberCenter_Message_Tab_C_Notice`);
        }
        if (key === '2') {
            this.GetAnnouncementData(0);
            Pushgtagdata(`MemberCenter`, 'View Announcement', `MemberCenter_Message_Tab_C_Announcement`);
        }
        this.setState({
            PMATab: key
        });
    };

    render() {
        const {
            tabType,
            sportsTabType,
            isShowDetail,
            TransactionUnreadCount,
            PersonalUnreadCount,
            AnnouncementUnreadCount,
            PersonalData,
            TransactionData,
            AnnouncementData,
            detailData,
            PMATab,
            selItem
        } = this.state;
        console.log(TransactionData);
        console.log(detailData);
        return (
            <Layout
                title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
                Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
                Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
                status={0}
                seoData={this.props.seoData}
            >
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
                                    Thông Tin
                                    {this.tabOneUnreadCount() > 0 && <span className="notice_active"/>}
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
                                    tab={
                                        <span className="CountData">
											Hộp Thư <b>[ {TransactionUnreadCount} ]</b>
										</span>
                                    }
                                    key="2"
                                >
                                    {this.readAllUI('Transaction')}
                                    {TransactionData &&
                                        TransactionData.map((item, index) => (
                                            <MessageItem
                                                type="Transaction"
                                                item={item}
                                                goDetail={this.goDetail}
                                                getMessageIcon={this.getMessageIcon}
                                                key={index + 'ITEM'}
                                            />
                                        ))}
                                    {!TransactionData && (
                                        <SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
                                            <Skeleton count={7} height="72px" borderRadius="10px"/>
                                        </SkeletonTheme>
                                    )}
                                    {this.moreMessage('Transaction')}
                                </TabPane>
                                <TabPane
                                    tab={
                                        <span className="CountData">
											Cá Nhân <b>[ {PersonalUnreadCount} ]</b>
										</span>
                                    }
                                    key="1"
                                >
                                    <div className="information__box">
                                        {this.readAllUI('Personal')}
                                        {PersonalData &&
                                            PersonalData.map((item, index) => (
                                                <MessageItem
                                                    type="Personal"
                                                    item={item}
                                                    goDetail={this.goDetail}
                                                    getMessageIcon={this.getMessageIcon}
                                                    key={index + 'ITEM'}
                                                />
                                            ))}
                                        {!PersonalData && (
                                            <SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
                                                <Skeleton count={7} height="72px" borderRadius="10px"/>
                                            </SkeletonTheme>
                                        )}
                                        {this.moreMessage('Personal')}
                                    </div>
                                </TabPane>
                            </Tabs>
                        </TabPane>
                        <TabPane
                            tab={
                                <div className="notice_tab">
                                    Thông Báo {AnnouncementUnreadCount > 0 && <span className="notice_active"/>}
                                </div>
                            }
                            key="2"
                        >
                            <div className="information__box AnnouncementData">
                                {this.readAllUI('Announcement')}
                                {AnnouncementData &&
                                    AnnouncementData.map((item, index) => (
                                        <MessageItem
                                            type="Announcement"
                                            item={item}
                                            goDetail={this.goDetail}
                                            getMessageIcon={this.getMessageIcon}
                                            key={index + 'ITEM'}
                                        />
                                    ))}
                                {!AnnouncementData && (
                                    <SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
                                        <Skeleton count={7} height="72px" borderRadius="10px"/>
                                    </SkeletonTheme>
                                )}
                                {this.moreMessage('Announcement')}
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
                {detailData != '' && (
                    <MessageDetail
                        isShowDetail={isShowDetail}
                        onClose={this.closeMessageModal}
                        data={detailData}
                        type={PMATab}
                        getMessageIcon={this.getMessageIcon}
                    />
                )}
            </Layout>
        );
    }
}

import React, {Component} from 'react';
import Tabs, {TabPane} from 'rc-tabs';
import Layout from '@/components/Layout';
import {ReactSVG} from '@/components/View/ReactSVG';
import Flexbox from '@/components/View/Flexbox/';
import { DailydealsHistory } from '@/api/promotions';
import { PromotionList } from '@/api/cmsApi'
import Skeleton, {SkeletonTheme} from 'react-loading-skeleton';
import {IoTimeOutline} from 'react-icons/io5';
import Countdown from 'react-countdown';
import DetailModal from '@/components/daily-gift/Detail';
import moment from 'moment';
import Router from 'next/router';
import SelectTime from '@/components/View/SelectTime';
import ReactIMG from '@/components/View/ReactIMG';
import Toast from '@/components/View/Toast';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/daily-gift'); //參數帶本頁的路徑
}

const content = {
    left: (
        <div
            onClick={() => {
                history.go(-1);
            }}
        >
            <ReactSVG className="forgetpwd-arrow-icon" src="/img/svg/LeftArrow.svg"/>
        </div>
    )
};

export default class Forgetpwd extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Loading: true,
            selItem: {id: '1', label: '今天'},
            History: [], //好礼申请历史记录
            tabType: '1', // 1=pwd, 2=username
            DailyList: [], //好礼列表
            DailyListLoading: true
        };
        this.selectList = [
            {id: '1', label: '今天', piwikId: 'Today_sorting_betrecord'},
            {id: '7', label: '近7天', piwikId: '7daysrecord_sorting_betrecord'},
            {id: '30', label: '近30天', piwikId: '30daysrecord_sorting_betrecord'},
            {id: '0', label: '自定义', isSpecial: true, piwikId: 'Customization_sorting_betrecord'}
        ];
    }

    componentDidMount() {
        // if (!checkIsLogin()) {
        // 	redirectToLogin();
        // 	return;
        // }
        this.DailyPromotions();
    }

    /**
     * @description: Tabs 切换
     * @param {*} key
     * @return {*}
     */
    onClickTabs = (key) => {
        this.setState({
            tabType: key
        });
        if (key == '2') {
            this.GetDailydealsHistory(
                moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
                moment().format('YYYY-MM-DD HH:mm:ss')
            );
        }
    };

    /**
     * @description: 获取优惠列表
     * @return {*}
     */

    DailyPromotions() {
        let params = {
            type: 'daily'
        };
        this.setState({
            DailyListLoading: true
        });
        PromotionList(params).then((res)=>{
            if (res) {
                this.setState({
                    DailyList: res,
                    DailyListLoading: false
                });
            }
        })
    }

    /**
     * @description: 每日好礼记录
     * @return {*}
     */
    GetDailydealsHistory(dateFrom, dateTo) {
        let params = {
            startDate: moment(dateFrom).utcOffset(8).format('YYYY-MM-DDTHH:mm:ss'),
            endDate: moment(dateTo).utcOffset(8).format('YYYY-MM-DDTHH:mm:ss')
        };
        this.setState({
            Loading: true
        });
        Toast.loading();
        DailydealsHistory(params, (res) => {
            if (res.isSuccess && res.result) {
                Toast.destroy();
                this.setState({
                    History: res.result,
                    Loading: false
                });
            }
        });
    }

    render() {
        const {tabType, DailyList, ShowDetail, BonusData, History, Loading, DailyListLoading} = this.state;
        console.log(Loading);
        const renderer = ({days, hours, minutes, seconds, completed}) => {
            if (completed) {
                return <span>活动结束</span>;
            } else {
                return (
                    <span>
						{days} Ngày {hours} Giờ {minutes} Phút
					</span>
                );
            }
        };
        return (
            <Layout
                title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
                Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
                Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
                status={0}
                seoData={this.props.seoData}
            >
                <div className="DailyGift">
                    <Tabs
                        prefixCls={'tabsOval'}
                        defaultActiveKey={tabType}
                        onChange={this.onClickTabs}
                        tabBarExtraContent={content}
                    >
                        <TabPane tab="Thưởng Mỗi Ngày" key="1">
                            <div className="List">
                                {DailyList &&
                                    DailyList.length != 0 &&
                                    DailyList.map((item, index) => {
                                        return (
                                            <Flexbox
                                                key={index + 'list'}
                                                flexFlow="column"
                                                className="card"
                                                onClick={() => {
                                                    this.setState({
                                                        ShowDetail: true,
                                                        BonusData: item
                                                    });
                                                }}
                                            >
                                                <img src={item.promoImage} width="100%" height={'100%'}/>
                                                <Flexbox
                                                    padding="10px"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                >
                                                    <Flexbox flexFlow="column" className="info">
                                                        <h3>{item.promoTitle}</h3>
                                                        <Flexbox className="time">
                                                            <IoTimeOutline size="14" color="#999999"/>
                                                            <Countdown
                                                                daysInHours={true}
                                                                date={new Date(item.endDate)}
                                                                renderer={renderer}
                                                            />
                                                        </Flexbox>
                                                    </Flexbox>
                                                    {item.bonusData ? (
                                                        <>
                                                            {item.bonusData.maxApplications ==
                                                            item.bonusData.currentApplications ? (
                                                                <div className="LastNumber Disable">
                                                                    Hết Hàng
                                                                </div>
                                                            ) : (
                                                                <div className="LastNumber">
                                                                    
                                                                        Còn Lại &nbsp;{item.bonusData.maxApplications - item.bonusData.currentApplications}
                                                                    
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="LastNumber Disable">
                                                            Không có dữ liệu
                                                        </div>
                                                    )}
                                                </Flexbox>
                                            </Flexbox>
                                        );
                                    })}
                                {!DailyListLoading &&
                                    DailyList.length == 0 && (
                                        <div className="NullData">
                                            <ReactIMG src="/img/svg/promoNull.svg"/>
                                            <p>Không tìm thấy Khuyến Mãi</p>
                                        </div>
                                    )}
                                {DailyListLoading && (
                                    <SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
                                        <Skeleton count={1} height="140px"/>
                                        <Skeleton count={1} height="50px"/>
                                        <Skeleton count={1} height="140px"/>
                                        <Skeleton count={1} height="50px"/>
                                        <Skeleton count={1} height="140px"/>
                                        <Skeleton count={1} height="50px"/>
                                        <Skeleton count={1} height="140px"/>
                                        <Skeleton count={1} height="50px"/>
                                    </SkeletonTheme>
                                )}
                            </div>
                        </TabPane>
                        <TabPane tab="Lịch Sử Thưởng" key="2">
                            <Flexbox padding="10px" flexFlow="column">
                                <SelectTime
                                    changeSel={(dateFrom, dateTo) => {
                                        this.GetDailydealsHistory(dateFrom, dateTo);
                                    }}
                                />
                                {History.map((item, index) => {
                                    return (
                                        <Flexbox flexFlow="column" className="Recordlist" key={index + 'list'}>
                                            <Flexbox className="item">
                                                <label>Ngày Giao Dịch</label>
                                                <div className="data">
                                                    {moment(new Date(item.createdDate)).format('DD-MM-YYYY')}
                                                </div>
                                                <label>Sản Phẩm</label>
                                                <div className="data">{item.bonusName}</div>
                                            </Flexbox>
                                            <Flexbox className="item">
                                                <label>Số Tham Chiếu</label>
                                                <div className="data">{item.referenceOutId}</div>
                                                <label>Trạng Thái</label>
                                                <div className="data">{item.bonusStatus}</div>
                                            </Flexbox>
                                            <Flexbox className="item">
                                                <label>Khuyến Mãi</label>
                                                <div className="data">{item.bonusName}</div>
                                                <label>Ghi Chú</label>
                                                <div className="data">
                                                    {item.bonusDailyDealsDetail ? (
                                                        <span
                                                            className="blue"
                                                            onClick={() => {
                                                                Router.push(
                                                                    `/me/shipment-address?id=${item.bonusRuleId}`
                                                                );
                                                            }}
                                                        >
															Xem chi tiết
														</span>
                                                    ) : (
                                                        '--'
                                                    )}
                                                </div>
                                            </Flexbox>
                                        </Flexbox>
                                    );
                                })}

                                {Loading && (
                                    <SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
                                        <Skeleton count={1} height="140px"/>
                                        <Skeleton count={1} height="140px"/>
                                        <Skeleton count={1} height="140px"/>
                                        <Skeleton count={1} height="140px"/>
                                        <Skeleton count={1} height="140px"/>
                                    </SkeletonTheme>
                                )}
                                {History &&
                                    History.length == 0 && (
                                        <div className="autoCenter">
                                            <div className="NullData">
                                                <ReactIMG src="/img/svg/boxnull.svg"/>
                                                <p>Không tìm thấy Lịch Sử Giao Dịch</p>
                                            </div>
                                        </div>
                                    )}
                            </Flexbox>
                        </TabPane>
                    </Tabs>
                </div>
                {/* 打开优惠详情 */}
                {ShowDetail && (
                    <DetailModal
                        BonusData={BonusData}
                        ShowDetail={ShowDetail}
                        CloseDetail={() => {
                            this.setState({
                                ShowDetail: false
                            });
                        }}
                    />
                )}
            </Layout>
        );
    }
}

/*
 * @Author: Alan
 * @Date: 2021-11-16 16:21:23
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-29 13:02:38
 * @Description: 投注记录
 * @FilePath: \Mobile\pages\betting-record\index.js
 */
import React, { Component } from 'react';
import Layout from '@/components/Layout';
import Service from '@/components/Header/Service';
import SelectTime from '@/components/View/SelectTime';
import moment from 'moment';
import Flexbox from '@/components/View/Flexbox/';
import { ReactSVG } from '@/components/View/ReactSVG';
import Collapse, { Panel } from 'rc-collapse';
import DrawerFilter from '@/components/Common/DrawerFilter/';
import { numberWithCommas } from '@/lib/js/util';
import BetRecordItem from '@/components/betting-record/Item';
import Popover from '@/components/View/Popover';
import { GetMemberDailyTurnover } from '@/api/game';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { IoCloseCircle } from 'react-icons/io5';
import Toast from '@/components/View/Toast';
import Detail from '@/components/betting-record/Detail';
import { checkIsLogin, redirectToLogin,ToScrollTop } from '@/lib/js/util';
import ReactIMG from '@/components/View/ReactIMG';
import Vipcustomerservice from '@/components/Header/Vipcustomerservice';
import { ApiPort } from '@/api/index';
import { fetchRequest } from '@/server/Request';
import ReactPullLoad, { STATS } from 'react-pullload';
import { FiChevronUp } from 'react-icons/fi';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/betting-record'); //參數帶本頁的路徑
}

export default class Bettingrecord extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dateFrom: moment(new Date()).format('YYYY-MM-DD'),
			dateTo: moment(new Date()).format('YYYY-MM-DD'),
			ShowPopover: false,
			DailyTurnover: {
				dailyTurnover: [],
				lastUpdatedDate: '2022-04-22T09:04:14',
				totalRowCount: 1,
				totalTurnover: 0,
				totalWinLoss: 0
			},
			openfilterList: [],
			loading: true,
			selectTabFlag: false,
			dateTime: [
				moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
				moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
			],
			selectFilterName: '',
			isOpenDetail: false,
			fiterList: [],
			selectWallet: '',
			// 自定义时间
			definedDate: { startDate: moment().format('YYYY-MM-DD'), endDate: moment().format('YYYY-MM-DD') },
			feedbackModal: false,
			isVIP: false,
			backToTopBtnVisibility: false,
			hasMore: true,
			action: STATS.init,
			index: 0, //滑动的次数
			count: 0,
			size: 4,
			dailyTurnoverDetails:[]
		};
	}
	componentDidMount() {
		if (!checkIsLogin()) {
			redirectToLogin();
		}
		global.Pushgtagpiwikurl && global.Pushgtagpiwikurl("Bet_record","Bet record")
		this.MemberDailyTurnover(this.state.dateTime[0], this.state.dateTime[1]);
		// window.Pushgtagdata && Pushgtagdata(window.location.origin, 'Launch', `bet_record`);
		if (!!localStorage.getItem('memberInfo') && JSON.parse(localStorage.getItem('memberInfo')).isVIP) {
			this.setState({ isVIP: true });
		}
		this.getFilterType();
		window.addEventListener('scroll', this.handleScroll);
	}
	componentWillUnmount(){
		window.removeEventListener('scroll', this.handleScroll);
		this.setState = ()=> false
	}
	handleScroll = () => {
		if(window?.scrollY > 100){
			this.setState({
				backToTopBtnVisibility: true
			})
		}
		else {
			this.setState({
				backToTopBtnVisibility: false
			})
		}
	}

	getFilterType() {
		fetchRequest(ApiPort.GetTurnoverProductType + '?', 'GET')
			.then((data) => {
				if (data) {
					if (data.isSuccess) {
						this.setState({
							fiterList: data.result
						});
					}
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}

	MemberDailyTurnover(dateFrom, dateTo) {
		const params = {
			dateFrom: moment(dateFrom).format('YYYY-MM-DD'),
			dateTo: moment(dateTo).format('YYYY-MM-DD'),
			productType: this.state.selectWallet
			//rowCount: 100,
			//pageNum: 1
		};
		this.setState({
			loading: true
		});

		Toast.loading();

		GetMemberDailyTurnover(params, (res) => {
			Toast.destroy();
			if (res.isSuccess && res.result) {
				this.setState({
					DailyTurnover: res.result,
					loading: false,
					dailyTurnoverDetails: res.result.dailyTurnoverDetails
				}
					,()=>{
						res.result.dailyTurnoverDetails?.length && this.handRefreshing()
					}
				)
			}
			Toast.destroy();
		});
		this.setState({
			dateTime: [ dateFrom, dateTo ]
		});
	}

	onOpenChange = () => {
		const {openfilterList} = this.state;
		if(openfilterList.length){
			global.Pushgtagpiwikurl && global.Pushgtagpiwikurl("Bet_record","Bet record")
		}else{
			global.Pushgtagpiwikurl && global.Pushgtagpiwikurl("Bet_record_filter","Bet record filter")
		}
		this.setState({
			openfilterList: this.state.openfilterList.length == 0 ? [ '1' ] : []
		});
	};

	handleAction = action => {
		//new action must do not equel to old action
		if (action === this.state.action) {
		  return false;
		}

		if (action === STATS.refreshing) {
		  this.handRefreshing();
		} else if (action === STATS.loading) {
		  this.handLoadMore();
		} else {
		  //DO NOT modify below code
		  this.setState({
			action: action
		  });
		}
	}

	handRefreshing = () => {
		if (STATS.refreshing === this.state.action) {
		  return false;
		}
		this.setState({
			dailyTurnoverDetails: this.Pagedata(this.state.DailyTurnover.dailyTurnoverDetails, this.state.size)[0],
		})

		setTimeout(() => {
		  //refreshing complete
		  this.setState({
			hasMore: true,
			action: STATS.refreshed,
			index:  parseInt(this.state.DailyTurnover.dailyTurnoverDetails.length / this.state.size)
		  });
		}, 2000);

		this.setState({
		  action: STATS.refreshing
		});
	}

	handLoadMore = () => {
		if (STATS.loading === this.state.action) {
		  return false;
		}
		//无更多内容则不执行后面逻辑
		if (!this.state.hasMore || this.state.DailyTurnover.dailyTurnoverDetails.length < this.state.size) {
		  return;
		}
		setTimeout(() => {
		  if (this.state.index === 0) {
			this.setState({
			  action: STATS.reset,
			  hasMore: false
			});
		  } else {
			this.setState({
				dailyTurnoverDetails: [
					...this.state.dailyTurnoverDetails,
					...(this.Pagedata(this.state.DailyTurnover.dailyTurnoverDetails, this.state.size)[this.state.count + 1] || [])
				],
			  action: STATS.reset,
			  index: this.state.index - 1,
			  count: this.state.count + 1
			});
		  }
		}, 2000);

		this.setState({
		  action: STATS.loading
		});
	};

	Pagedata = (sourceData, pageSize) => {
		const pageNum = Math.ceil(sourceData.length / pageSize); //页数
		return new Array(pageNum)
			.fill([])
			.map((item, index) => sourceData.slice(index * pageSize, (index + 1) * pageSize));
	}
	resetParams =(callback)=> {
		this.setState({
			hasMore: true,
			action: STATS.init,
			index: 0,
			count: 0,
			size: 4,
			dailyTurnoverDetails:[]
		},()=>{
			typeof callback === "function"  && callback();
		})
	}
	render() {
		const {
			loading,
			openfilterList,
			fiterList,
			selectWallet,
			DailyTurnover,
			definedDate,
			ShowPopover,
			selectTabFlag,
			selectFilterName,
			isOpenDetail,
			isVIP,
			feedbackModal,
			backToTopBtnVisibility,
			hasMore,
			dailyTurnoverDetails,
			action
		} = this.state;
		let hash = {};

		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="嗨FUN双旦 惠不可挡"
				status={4}
				hasServer={true}
				barFixed={true}
				seoData={this.props.seoData}
			>
				<div className="Bettingrecord">
					{/* 头部 */}
					<Flexbox className="Header" alignItems="center" height="60px">
						<Flexbox alignItems="center" className="Navbar-left" flexGrow={1} element="header">
							Lịch Sử Cược
							<ReactSVG
								className="note"
								src="/img/P5/svg/note.svg"
								onClick={() => {
									this.setState({
										ShowPopover: true
									});
								}}
							/>
							<Popover
								direction="top"
								className="Bettingrecord-popover"
								visible={ShowPopover}
								onClose={() => {
									this.setState({ ShowPopover: false });
								}}
							>
								<span>
								[Tổng tiền cược] là tổng số tiền bạn đã đặt cược cho tất cả các sản phẩm trên Fun88.<br />
								[Tổng số thắng/thua] là tổng số tiền thắng hoặc thua mà bạn đã phải chịu đối với tất cả các nhà cung cấp trên Fun88.<br />
								[Tổng doanh thu] là tổng doanh thu hợp lệ được quy định theo từng loại sản phẩm tại Fun88.<br />
								Công thức tính doanh thu tại các sản phẩm Thể Thao, E-Sports, Casino, 3D Casino và Xổ Số dựa trên số tiền Thắng hoặc Thua thực tế của vé cược. Ngoài ra, Tổng doanh thu hợp lệ không thể vượt quá hai lần tổng số tiền đặt cược.<br />
								Lưu ý: Đối với sản phẩm Trò Chơi và Bắn Cá, Tổng doanh thu được tính dựa trên tổng số tiền đặt cược. Các sự kiện bị hủy và bất kỳ hành vi vi phạm quy tắc cá cược hoặc trục lợi từ các khuyến mãi sẽ không được tính là cược hợp lệ.
								</span>
								{ShowPopover ? <span className="sanjiao" /> : null}
							</Popover>
						</Flexbox>
						<Flexbox justifyContent="flex-end" className="Navbar-right" flexGrow={1}>
							{isVIP ? (
								<div
									className="vip-customer-service"
									style={{ marginRight: 10 }}
									onClick={() => {
										this.setState({ feedbackModal: true });
									}}
								>
									<ReactIMG src="/img/P5/icon/Icon_VIPCS.png" />
								</div>
							) : null}
							<div
								onClick={() => {
									// Pushgtagdata(`Live Chat`, 'Launch', `Topnav_CS`);
								}}
							>
								<Service />
							</div>
						</Flexbox>
					</Flexbox>
					{/* 筛选部分 */}
					<Flexbox className="Filter" alignItems="center" height="60px">
						<Flexbox alignItems="center" className="Filter-left" flexGrow={1}>
							<Flexbox
								className="Button"
								alignItems="center"
								onClick={() => {
									this.setState({
										openfilterList: this.state.openfilterList.length == 0 ? [ '1' ] : []
									});
									this.onOpenChange();
									this.resetParams();
									// globalGtag && globalGtag('Filter_betrecord_profilepage');
									// globalGtag('Filter_promopage');
								}}
							>
								<span>Lọc</span>
								<ReactSVG className="icon-filter" src="/img/P5/svg/icon-filter.svg" />
							</Flexbox>
							<Flexbox>
								{/* 筛选标签 */}
								{selectTabFlag &&
								selectWallet != 'All' && (
									<div
										onClick={() => {
											this.setState(
												{
													selectTabFlag: false,
													selectWallet: '',
													selectFilterName: ''
												},
												() => {
													this.MemberDailyTurnover(
														this.state.dateTime[0],
														this.state.dateTime[1]
													);
												}
											);
										}}
									>
										<div className="selectTab">
											<span>{selectFilterName}</span>
											<IoCloseCircle size="12" color="#ffffffb5" />
										</div>
									</div>
								)}
							</Flexbox>
						</Flexbox>

						<Flexbox justifyContent="flex-end" className="Filter-right" flexGrow={1}>
							<SelectTime
								changeSel={(dateFrom, dateTo) => {
									this.resetParams(()=>{
										this.MemberDailyTurnover(dateFrom, dateTo);
										this.setState({
											definedDate: [ dateFrom, dateTo ]
										});
									})
								}}
								minDate= {moment(new Date()).subtract(90, 'day')._d}
								shorterRange={6}
							/>
						</Flexbox>
					</Flexbox>
					<Collapse activeKey={openfilterList} className="Collapse">
						<Panel key="1">
							<DrawerFilter
								data={fiterList}
								seletId={selectWallet}
								changeDrawer={this.onOpenChange}
								submit={() => {
									Pushgtagdata(`Bet_Record`, 'Filter', 'Bet_Record_C_Filter',
									[{
                                        customVariableKey: `Bet_Record_C_Filter_GameCategor`,
                                        customVariableValue: selectWallet
                                    }]);
									this.MemberDailyTurnover(this.state.dateTime[0], this.state.dateTime[1]);
									this.onOpenChange();
									if (this.state.selectWallet != '') {
										this.setState({
											selectTabFlag: true,
											selectFilterName: fiterList.find((item) => item.productType == selectWallet)
												.localizedName
										});
									}
								}}
								walletTypeChg={(v) => {
									// globalGtag &&
									// 	globalGtag(
									// 		piwikObj.find((ele) => ele.key == v)
									// 			? piwikObj.find((ele) => ele.key == v).piwikId
									// 			: ''
									// 	);
									this.setState({ selectWallet: v });
								}}
							/>
						</Panel>
					</Collapse>
					{/* 主体内容 */}
					<ReactPullLoad
						downEnough={150}
						action={action}
						handleAction={this.handleAction}
						hasMore={hasMore}
						style={{ paddingTop: 0 }}
						distanceBottom={1000}
					>
					<div className={`Content ${hasMore ? "":"hedeBottom"}`}>
						{dailyTurnoverDetails?.length ? (
							<Flexbox flexDirection="column" className="Betrecords-total">
								<Flexbox justifyContent="space-between" className="font-size12 betrecords-total">
									<Flexbox>
										<span>Tổng tiền cược</span>
									</Flexbox>
									<Flexbox>
										<span className="color-grey222">
											{' '}
											{DailyTurnover.totalBetAmount ? (
												numberWithCommas(DailyTurnover.totalBetAmount)
											) : (
												'0.00'
											)} đ
										</span>
									</Flexbox>
								</Flexbox>
								<Flexbox justifyContent="space-between" className="font-size12 betrecords-total">
									<Flexbox>
										<span>Tổng tiền thắng/thua</span>
									</Flexbox>
									<Flexbox>
										<span
											className={
												Number(DailyTurnover.totalWinLoss) < 0 ? 'color-red' : 'color-green'
											}
										>
											{Number(DailyTurnover.totalWinLoss) < 0 ? '-' : '+'}{Math.abs(
												DailyTurnover.totalWinLoss
											) ? (
												numberWithCommas(Math.abs(DailyTurnover.totalWinLoss))
											) : (
												'0.00'
											)} đ
										</span>
									</Flexbox>
								</Flexbox>
								<Flexbox justifyContent="space-between" className="font-size12 betrecords-total">
									<Flexbox>
										<span>Tổng doanh thu cược</span>
									</Flexbox>
									<Flexbox>
										<span className="color-grey222">
											{DailyTurnover.totalValidTurnover ? (
												numberWithCommas(DailyTurnover.totalValidTurnover)
											) : (
												'0.00'
											)} đ
										</span>
									</Flexbox>
								</Flexbox>
							</Flexbox>
						):null}

						{dailyTurnoverDetails?.length ? (
							dailyTurnoverDetails
								.reduce((preVal, curVal) => {
									hash[curVal.providerCode + curVal.productType]
										? ''
										: (hash[curVal.providerCode + curVal.productType] =
												true && preVal.push(curVal));
									return preVal; //去重 保留一个类型 详情页查看更多
								}, [])
								.map((Item, index) => {
									return (
										<BetRecordItem
											key={index}
											/* 原始数据 */
											Data={dailyTurnoverDetails}
											/* 子数据 */
											ItemData={Item}
											/*是否是详情*/
											isDetail={false}
											/* 筛选类型 */
											fiterList={fiterList}
											/* 自定义时间 */
											definedDate={definedDate}
											setValue={(name, list) => {
												this.setState(
													{
														DetailInfo: { name: name, list: list }
													},
													() => {
														this.setState({
															isOpenDetail: true
														});
													}
												);
											}}
										/>
									);
								})
						) : loading ? (
							<SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
								<Skeleton count={3} height="150px" borderRadius="10px" />
							</SkeletonTheme>
						) : (
							<div className="autoCenter">
								<Flexbox className="Null-Box">
									<ReactSVG src="/img/P5/icon/null.svg" />
									<p>không có dữ liệu</p>
								</Flexbox>
							</div>
						)}
						{!hasMore && <Flexbox justifyContent="center" className="noMore">Không còn nữa</Flexbox>}
						{action === "loading" && <Flexbox justifyContent="center" className="loading-gif">
							<div className="share-loading"></div>
							<span>Đang tải thêm…</span>
						</Flexbox>}
					</div>
					</ReactPullLoad>
					{backToTopBtnVisibility && <div
						className="backToTop"
						onClick={() => {
							ToScrollTop();
						}}
					>
						<FiChevronUp color="#1A1A1A" size="30" />
					</div>}
				</div>
				{isOpenDetail ? (
					<Detail
						DetailItem={dailyTurnoverDetails}
						ShowDetail={isOpenDetail}
						CloseDetail={() => {
							this.setState({
								isOpenDetail: false
							});
						}}
						DetailInfo={this.state.DetailInfo}
					/>
				) : null}

				<Vipcustomerservice
					visible={feedbackModal}
					onCloseModal={() => {
						this.setState({ feedbackModal: false });
					}}
				/>
			</Layout>
		);
	}
}

import React from 'react';
import Router from 'next/router';
import Layout from '@/components/Layout';
import Toast from '@/components/View/Toast';
import { getUrlVars } from '@/lib/js/Helper';
import moment from 'moment';
import ReactIMG from '@/components/View/ReactIMG';
import { PromotionCategories } from '@/api/promotions';
import Flexbox from '@/components/View/Flexbox/';
import PromotionsMenu from '../Menu';
import DetailModal from './Detail';
import { BsChevronRight } from 'react-icons/bs';
import { FiChevronUp } from 'react-icons/fi';
import classNames from 'classnames';
import { ToScrollTop, SumValue } from '@/lib/js/util';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import SelectTime from '@/components/View/SelectTime';
import { GetRebateList } from '@/api/cmsApi';
import ReactPullLoad, { STATS } from 'react-pullload';
const piwikObj = [
	{ id: '88', key1: 'Special_filter_promopage', key2: 'More_special_promopage' },
	{ id: '89', key1: 'Sport_filter_promopage', key2: 'More_Sport_promopage' },
	{ id: '91', key1: 'Esport_filter_promopage', key2: 'More_Esport_promopage' },
	{ id: '90', key1: 'Live_filter_promopage', key2: 'More_Live_promopage' },
	{ id: '94', key1: 'P2P_filter_promopage', key2: 'More_P2P_promopage' },
	{ id: '95', key1: 'Slot_filter_promopage', key2: 'More_Slot_promopage' },
	{ id: '92', key1: 'Fishing_filter_promopage', key2: 'More_Fishing_promopage' },
	{ id: '93', key1: 'Keno_filter_promopage', key2: 'More_Keno_promopage' },
	{ id: '96', key1: 'VIP_filter_promopage', key2: 'More_VIP_promopage' },
	{ id: '280', key1: '8shop_filter_promopage', key2: 'More_8shop_promopage' }
];
class Rebate extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			PromotionCategories: [],	//API返回的data
			selectValue: 'all',
			selectTabFlag: false,
			selectFilterName: '',
			filterData: undefined,
			openfilterList: [],
			catList: [],
			selItem: { id: '1', label: '今天' },
			Checkdate: [ new Date(moment().subtract(6, 'day')._d), new Date(moment()._d) ],
			DetailItem: [],
			categories: [],
			NullData: false,
			detailTitle: '',
			backToTopBtnVisibility: false,
			hasMore: true,
			action: STATS.init,
			index: 0, //滑动的次数
			count: 0,
			size: 4,
			promotionBettingData:[] //会改变的data
		};
	}

	componentDidMount() {
		this.PromotionCat(
			moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
			moment().format('YYYY-MM-DD HH:mm:ss')
		);
		var id = getUrlVars()['id'];
		if (id) {
			this.getPromoInfo(id);
			return;
		}
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
	/**
     * @description: 获取优惠分类
     * @param {*}
     * @return {*}
    */

	PromotionCat(dateFrom, dateTo) {
		let localData = JSON.parse(sessionStorage.getItem('PromotionsRebate'));

		if (localData) {
			this.setState({
				PromotionCategories: localData
			});
		}
		PromotionCategories((data) => {
			let categories = data.filter((item) => item.parentName == 'Rebate');
			if (categories) {
				this.RebateList(dateFrom, dateTo, categories);
				this.setState({
					categories: categories
				});
			}
		});

		console.log('PromotionCategories :', this.state.PromotionCategories);
	}

	RebateList(dateFrom, dateTo, categories) {
		let params = {
			startDate: moment(dateFrom).utcOffset(8).format('YYYY-MM-DD'),
			endDate: moment(dateTo).utcOffset(8).format('YYYY-MM-DD')
		};

		this.setState({
			currentDate: params
		});

		GetRebateList(params).then((res) => {
			if (res.result.length != 0) {
				categories.map((ele) => {
					let filterData = res.result.filter((element) => {
						return element.promotionCategory.includes(ele.PromoCatCode);
					});
					ele.data = filterData;
				});
				this.setState({
					PromotionCategories: categories,
					NullData: false,
					promotionBettingData: categories
				},()=>{
					categories && this.handRefreshing()
					console.log("🚀 ~ file: index.js:139 ~ Rebate ~ GetRebateList ~ categories:", categories)
				});
				sessionStorage.setItem('PromotionsRebate', JSON.stringify(categories));
			} else {
				this.setState({
					NullData: true,
					PromotionCategories: [],
					promotionBettingData:[]
				});
			}
		});
	}
	/**
     * @description: 筛选当前选择的优惠种类
     * @param {*}
     * @return {*}
    */

	onfilterData = () => {
		const { PromotionCategories, selectValue } = this.state;
		if (selectValue == 'all') {
			this.setState({ openfilterList: [], selectTabFlag: false });
			return;
		}
		for (const row of PromotionCategories) {
			if (row.PromoCatCode == selectValue) {
				this.setState({
					filterData: row,
					selectFilterName: row.resourcesName
				});
			}
		}
		this.setState({ openfilterList: [], selectTabFlag: true });
	};

	/**
	 * @description: 展示返水列表
	 * @param {*} filterData 返水数据
	 * @return {*}
	*/
	PromoItem = (filterData) => {
		//标签筛选列表
		// console.log('返水筛选数据----------------->>>>>', filterData);
		return (
			<div
				key={filterData.promotionCategory}
				className="itemList"
				onClick={() => {
					this.setState(
						{
							DetailItem: filterData.data,
							detailTitle: filterData.resourcesName,
						},
						() => {
							this.setState({
								ShowDetail: true
							});
						}
					);
				}}
			>
				<Flexbox alignItems="center" justifyContent="space-between" width="100%">
					<Flexbox>
						<img
							src={filterData.promoCatImageUrl}
							alt={filterData.resourcesName}
							width="40px"
							height="40px"
						/>
						<Flexbox justifyContent="space-around" flexFlow="column" paddingLeft="10px">
							<label>{filterData.resourcesName}</label>
							{/* <small>
								会员等级：{(filterData.data.length != 0 && filterData.data[0].rebateGroupName) || ''}
							</small> */}
						</Flexbox>
					</Flexbox>
					<BsChevronRight size={16} color="#999999" />
				</Flexbox>
				<hr />
				<Flexbox className="DataList">
					<Flexbox flexFlow="column" width="50%">
						<label>
							<small className="gray">Tiền cược <br/>trong 1 ngày</small>
						</label>
						<b>{SumValue(filterData.data, 'totalBetAmount')} đ</b>
					</Flexbox>
					<Flexbox flexFlow="column" width="50%">
						<label>
							<small className="gray">Hoàn trả <br/>trong 1 ngày</small>
						</label>
						<b style={{color: '#42D200'}}>{SumValue(filterData.data, 'totalGivenAmount')} đ</b>
					</Flexbox>
				</Flexbox>
			</div>
		);
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
			promotionBettingData: this.Pagedata(this.state.PromotionCategories, this.state.size)[0],
		})

		setTimeout(() => {
			//refreshing complete
			this.setState({
				hasMore: true,
				action: STATS.refreshed,
				index:  parseInt(this.state.PromotionCategories.length / this.state.size)
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
		if (!this.state.hasMore || this.state.PromotionCategories.length < this.state.size) {
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
				promotionBettingData: [
					...this.state.promotionBettingData, 
					...(this.Pagedata(this.state.PromotionCategories, this.state.size)[this.state.count + 1] || [])
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
		console.log("🚀 ~ file: index.js:242 ~ Bettingrecord ~ callback:", callback)
		this.setState({
			hasMore: true,
			action: STATS.init,
			index: 0,
			count: 0,
			size: 4,
			promotionBettingData:[]
		},()=>{
			typeof callback === "function"  && callback();
		})
	}

	render() {
		let {
			PromotionCategories,
			ShowDetail,
			selectTabFlag,
			selItem,
			filterData,
			PromoId,
			showDateRange,
			categories,
			NullData,
			DetailItem,
			backToTopBtnVisibility,
			action,
			hasMore,
			promotionBettingData
		} = this.state;

		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="嗨FUN双旦 惠不可挡"
				status={4}
				hasServer={true}
				barFixed={true}
			>
				<div className="Rebate">
					{/* 优惠筛选 */}
					<PromotionsMenu
						{...this.state}
						onfilterData={() => this.onfilterData()}
						selectType={() => {
							this.setState({ selectTabFlag: false });
						}}
						openfilter={() => {
							this.setState({
								openfilterList: this.state.openfilterList.length == 0 ? [ '1' ] : []
							});
						}}
						setSelectValue={(PromoCatCode) => {
							this.setState({
								selectValue: PromoCatCode
							});
							let resources = categories.find((item) => item.PromoCatCode == PromoCatCode);
							if (resources) {
								this.setState({
									selectFilterName: resources.resourcesName
								});
							}
						}}
						piwikObj={piwikObj}
					/>
					<div style={{ position: 'absolute', right: 0 }}>
						<SelectTime
							changeSel={(dateFrom, dateTo) => {
								this.resetParams(()=>{
									this.RebateList(dateFrom, dateTo, categories);
								})
							}}
						/>
					</div>

					{/* 优惠列表 */}
					<ReactPullLoad
						downEnough={150}
						action={action}
						handleAction={this.handleAction}
						hasMore={hasMore}
						style={{ paddingTop: 0 }}
						distanceBottom={1000}
					>
					<div
						className={classNames({
							PromsList: true,
							MarginSet: !selectTabFlag,
							marginTopSet: true
						})}
					>
						{
							promotionBettingData?.length >0 && PromotionCategories.some(cat=>cat.data.length) && (selectTabFlag ? !!filterData.data.length : true) && (
								<div className='totalRebate'>
									<label>Tổng Hoàn Trả:</label>
									<span>{ 
									!selectTabFlag 
										?	
										PromotionCategories.reduce((acc, cat)=>{
											return acc + cat.data.reduce((acc2, subCat)=>{return acc2 + subCat.totalGivenAmount},0)},0)
										: filterData?.data.reduce((acc, cat)=>{return acc + cat.totalGivenAmount},0)
									} đ</span>
								</div>
								) 
						}

						{selectTabFlag ? (
							filterData && this.PromoItem(filterData)
						) : (
							promotionBettingData.map((row, i) => {
								return (
									row &&
									(row.data.length != 0 && (
										<div className="RebateList" key={i + 'List'}>
											<div>{this.PromoItem(row)}</div>
										</div>
									))
								);
							})
						)}

						{NullData && (
							<div className="autoCenter">
								<div className="NullData">
									<ReactIMG src="/img/svg/boxnull.svg" />
									<p>không có dữ liệu</p>
								</div>
							</div>
						)}
					</div>
						{!hasMore && <Flexbox justifyContent="center" className="noMore">Không còn nữa</Flexbox>}
							{action === "loading" && <Flexbox justifyContent="center" className="loading-gif">
								<div className="share-loading"></div>
								<span>Đang tải thêm…</span>
						</Flexbox>}
					</ReactPullLoad>
					{PromotionCategories.length == 0 &&
					!NullData && (
						<div className="SkeletonPromsList" style={{ marginTop: '-10px' }}>
							<SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
								<Skeleton count={1} height="50px" />
								<Skeleton count={1} height="140px" />
								<Skeleton count={1} height="50px" />
								<Skeleton count={1} height="140px" />
								<Skeleton count={1} height="50px" />
								<Skeleton count={1} height="140px" />
							</SkeletonTheme>
						</div>
					)}

					{backToTopBtnVisibility && <div
						className="BackTop"
						onClick={() => {
							ToScrollTop();
						}}
					>
						<FiChevronUp color="#1A1A1A" size="30" />
					</div>}
				</div>
				{/* 打开优惠详情 */}
				{ShowDetail && (
					<DetailModal
						detailTitle={this.state.detailTitle}
						DetailItem={DetailItem}
						ShowDetail={ShowDetail}
						CloseDetail={() => {
							this.setState({
								ShowDetail: false
							});
						}}
						currentDate={this.state.currentDate}
					/>
				)}
			</Layout>
		);
	}
}
export default Rebate;

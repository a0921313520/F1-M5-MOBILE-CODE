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
			PromotionCategories: [],
			selectValue: 'all',
			selectTabFlag: false,
			selectFilterName: '',
			filterData: undefined,
			openfilterList: [],
			catList: [],
			selItem: { id: '1', label: '今天' },
			Checkdate: [ new Date(moment().subtract(6, 'day')._d), new Date(moment()._d) ],
			DetailItem: [],
			categories: []
		};
	}

	componentDidMount() {
		this.PromotionCat(
			moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
			moment().format('YYYY-MM-DD HH:mm:ss')
		);
		// var id = getUrlVars()['id'];
		// if (id) {
		// 	this.getPromoInfo(id);
		// 	return;
		// }
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
		const hide = Toast.loading();
		PromotionCategories((data) => {
			let categories = data.filter((item) => item.parentName == 'Rebate');
			console.log(categories);
			if (categories) {
				this.RebateList(dateFrom, dateTo, categories);
				this.setState({
					categories: categories
				});
				hide();
			}
		});
	}

	RebateList(dateFrom, dateTo, categories) {
		let params = {
			startDate: moment(dateFrom).utcOffset(8).format('YYYY-MM-DD'),
			endDate: moment(dateTo).utcOffset(8).format('YYYY-MM-DD')
		};
		const hide = Toast.loading();
		GetRebateList(params).then((res) => {
			if (res.result.length != 0) {
				categories.map((ele) => {
					let filterData = res.result.filter((element) => {
						return element.promotionCategory.includes(ele.PromoCatCode);
					});
					ele.data = filterData;
				});
				this.setState({
					PromotionCategories: categories
				});
				sessionStorage.setItem('PromotionsRebate', JSON.stringify(categories));
			} else {
				this.setState({
					NullData: true,
					PromotionCategories: []
				});
			}
			hide()
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
		console.log('返水筛选数据----------------->>>>>', filterData);
		if (filterData.PromoCatCode === "Sports") {
		return (
			<div
				key={filterData.promotionCategory}
				className="itemList"
				onClick={() => {
					this.setState(
						{
							DetailItem: filterData.data
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
							<small>
								会员等级：{(filterData.data.length != 0 && filterData.data[0].rebateGroupName) || ''}
							</small>
						</Flexbox>
					</Flexbox>
					<BsChevronRight size={16} color="#999999" />
				</Flexbox>
				<hr />
				<Flexbox className="DataList">
					<Flexbox flexFlow="column">
						<label>
							<small className="gray">总达流水</small>
						</label>
						<b>{SumValue(filterData.data, 'totalBetAmount')}</b>
					</Flexbox>
					<Flexbox flexFlow="column">
						<label>
							<small className="gray">总得返水</small>
						</label>
						<b className="red">{SumValue(filterData.data, 'totalGivenAmount')}</b>
					</Flexbox>
				</Flexbox>
			</div>
		);
	}
	};

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
			DetailItem
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
								this.RebateList(dateFrom, dateTo, categories);
							}}
						/>
					</div>

					{/* 优惠列表 */}
					<div
						className={classNames({
							PromsList: true,
							MarginSet: !selectTabFlag,
							marginTopSet: true
						})}
					>
						{selectTabFlag ? (
							filterData && this.PromoItem(filterData)
						) : (
							PromotionCategories.map((row, i) => {
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
									<p>暂无记录</p>
								</div>
							</div>
						)}
					</div>
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

					{/* <div
						className="BackTop"
						onClick={() => {
							ToScrollTop();
						}}
					>
						<FiChevronUp color="#1A1A1A" size="30" />
					</div> */}
				</div>
				{/* 打开优惠详情 */}
				{ShowDetail && (
					<DetailModal
						DetailItem={DetailItem}
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
export default Rebate;

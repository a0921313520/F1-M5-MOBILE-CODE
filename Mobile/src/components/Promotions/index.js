import React from 'react';
import Layout from '@/components/Layout';
import { getUrlVars } from '@/lib/js/Helper';
import moment from 'moment';
import ReactIMG from '@/components/View/ReactIMG';
import { PromotionCategories, Promotions } from '@/api/promotions';
import Flexbox from '@/components/View/Flexbox/';
import PromotionsMenu from './Menu';
import DetailModal from './Detail';
import { BsChevronRight } from 'react-icons/bs';
import { FiChevronUp } from 'react-icons/fi';
import { IoTimeOutline } from 'react-icons/io5';
import classNames from 'classnames';
import { ToScrollTop } from '@/lib/js/util';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import Image from 'next/image';
import { PromotionList } from '@/api/cmsApi';
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
class _Promotions extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			PromotionCategories: [],
			selectValue: 'all',
			selectTabFlag: false,
			selectFilterName: '',
			filterData: [],
			openfilterList: [],
			catList: [],
			ActiveItem: {},
			DefaultPromotion: []
		};
	}

	componentDidMount() {
		this.PromotionCat();
		var id = getUrlVars()['id'];
		var promoId = JSON.parse(localStorage.getItem('promotionID'))
		if (id || promoId) {
			localStorage.removeItem('promotionID');
			this.GOTOPromotions(id || promoId);
		}
	}

	/**
	 * @description: 跳转去优惠页面
	 * @param {*} promoId 优惠id
	 * @param {*} history 优惠申请过的历史 没有申请过是 null
	 * @param {*} item 打开选择的所有数据
	 * @return {*}
  	*/

	GOTOPromotions(promoId, history, item) {
		this.setState({
			History: history,
			ShowDetail: true,
			PromoId: promoId,
			ActiveItem: item
		});

		if (item && item.bonusData) {
			// Pushgtagdata(`Promo Click`, 'View', `${item.bonusData.id}_PromoPage`);
		} else {
			// Pushgtagdata(`Promo Click`, 'View', `${promoId}_PromoPage`);
		}
	}

	/**
     * @description: 获取优惠分类
     * @param {*}
     * @return {*}
    */

	PromotionCat() {
		let Promdata = JSON.parse(sessionStorage.getItem('Promotions'));
		let haveData;
		if (Promdata) {
			this.setState({
				PromotionCategories: Promdata
			});
			haveData = true;
		}
		PromotionCategories((data) => {
			let categories = data.filter((item) => item.parentName == 'General');
			this.setState({
				categories: categories
			});
			if (categories) {
				let params = {
					type: 'general',
					transactionType: '',
					wallet: ''
				};

				PromotionList(params).then((res) => {
					categories.map((ele) => {
						let filterData = res.filter((element) => {
							return element.category.includes(ele.PromoCatCode);
						});
						ele.data = filterData;
					});
					this.setState({
						DefaultPromotion: res,
						PromotionCategories: categories
					});
					sessionStorage.setItem('Promotions', JSON.stringify(categories));
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
					filterData: row.data,
					selectFilterName: row.resourcesName
				});
			}
		}
		this.setState({ openfilterList: [], selectTabFlag: true });
	};

	/**
	 * @description: 展示优惠列表
	 * @param {*} filterData 优惠数据
	 * @return {*}
	*/
	PromoItem = (filterData) => {
		//标签筛选列表
		if (this.state.selectTabFlag) {
			return filterData.map((item, i) => {
				return this.ItemList(item);
			});
		}
		//默认滑动列表
		return (
			<Swiper
				slidesPerView={'auto'}
				spaceBetween={10}
				pagination={{
					clickable: true
				}}
				modules={[ Pagination ]}
				lazy={true}
			>
				{filterData.map((item, i) => {
					return <SwiperSlide key={i + 'list'}>{this.ItemList(item)}</SwiperSlide>;
				})}
			</Swiper>
		);
	};

	ItemList(item) {
		// console.log('列表详情item-------------->>>>', item);
		return (
			<div
				key={item.promoId}
				className="Selectlist"
				onClick={() => this.GOTOPromotions(item.promoId, item.history, item)}
			>
				<div className="PromoImg">
					{item.promoImage && (
						<Image
							src={item.promoImage}
							loading={'lazy'}
							width={'370'}
							height={'142'}
							alt={item.promoTitle}
						/>
					)}
					{/* {item.promoImage && <img src={item.promoImage} alt={item.promoTitle} width="100%" height="100%" />} */}
				</div>
				<div className="promoCardDetail">{item.promoTitle}</div>
				<div className="promoTime">
					<IoTimeOutline size="14" color="#999999" />&nbsp;
					{moment(item.startDate).utcOffset(8).format('DD/MM/YYY HH:mm')}{' '}-{' '}
					{moment(item.endDate).utcOffset(8).format('DD/MM/YYY HH:mm')}
				</div>
			</div>
		);
	}

	render() {
		let {
			PromotionCategories,
			ShowDetail,
			selectTabFlag,
			filterData,
			PromoId,
			History,
			DefaultPromotion,
			ActiveItem,
			selectValue
		} = this.state;
		console.log(PromotionCategories);
		return (
			<>
				<div id="promotions">
					{/* 优惠筛选 */}
					<PromotionsMenu
						{...this.state}
						onfilterData={() => this.onfilterData()}
						selectType={() => {
							this.setState({ selectTabFlag: false });
						}}
						openfilter={() => {
							this.setState({
								openfilterList: this.state.openfilterList?.length == 0 ? [ '1' ] : []
							});
						}}
						setSelectValue={(PromoCatCode) => {
							this.setState({
								selectValue: PromoCatCode
							});
						}}
						piwikObj={piwikObj}
					/>
					{/* 优惠列表 */}

					<div
						className={classNames({
							PromsList: true,
							MarginSet: !selectTabFlag
						})}
					>
						{selectTabFlag ? (
							filterData && this.PromoItem(filterData)
						) : (
							PromotionCategories.map((row, i) => {
								return (
									row.data?.length != 0 && (
										<div className="ItemData" key={i + 'List'}>
											<Flexbox className="categoryTitle">
												<Flexbox alignItems="center">
													<img src={row.promoCatImageUrl} width="25px" height="25px" />
													{row.resourcesName}
												</Flexbox>
												<Flexbox
													onClick={() => {
														this.setState({ selectValue: row.PromoCatCode }, () =>
															this.onfilterData()
														);
														// globalGtag(
														// 	piwikObj.find((ele) => ele.id === row.PromoCatID)
														// 		? piwikObj.find((ele) => ele.id === row.PromoCatID).key2
														// 		: ''
														// );
													}}
												>
													<small>Xem Thêm</small>
													<BsChevronRight fontSize={13} color="#666666" />
												</Flexbox>
											</Flexbox>
											<div className="promotionCard">
												<div>{this.PromoItem(row.data)}</div>
											</div>
										</div>
									)
								);
							})
						)}
						{(DefaultPromotion &&
						DefaultPromotion?.length == 0) || (filterData &&
							filterData?.length == 0 && selectValue !=="all")  && (
							<div className="NullData">
								<ReactIMG src="/img/svg/promoNull.svg" />
								<p>Không tìm thấy Khuyến Mãi</p>
							</div>
						)}
					</div>

					{(!PromotionCategories || PromotionCategories?.length == 0) && (
						<div className="SkeletonPromsList">
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

					<div
						className="BackTop"
						onClick={() => {
							ToScrollTop();
						}}
					>
						<FiChevronUp color="#1A1A1A" size="30" />
					</div>
				</div>
				{/* 打开优惠详情 */}
				{ShowDetail && (
					<DetailModal
						PromoId={PromoId}
						ShowDetail={ShowDetail}
						History={
							History || {
								status: 'Apply'
							}
						}
						ActiveItem={ActiveItem}
						CloseDetail={() => {
							this.setState({
								ShowDetail: false
							});
						}}
						PromotionList={() => {
							this.PromotionCat();
						}}
					/>
				)}
			</>
		);
	}
}
export default _Promotions;

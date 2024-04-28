import React from 'react';
import Image from '@/components/View/ReactIMG';
import { checkIsLogin, redirectToLogin } from '@/lib/js/util';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { GetAppliedHistory } from '@/api/cmsApi';
import Card from './PromsList';
import moment from 'moment';

class PromotionsHistory extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			/* 隐藏失效的优惠 */
			HideInvalid: true,
			Promotionsdata: [],
			loading: true
		};
	}

	componentDidMount() {
		if (!checkIsLogin()) {
			redirectToLogin();
			return;
		}
		this.BonusAppliedHistory();
	}

	/**
	 * @description:获取申请过的列表
	 * @return {*}
  	*/
	BonusAppliedHistory() {
		let params = {
			startDate: moment(new Date()).subtract(90, 'd').startOf('day').utcOffset(8).format('YYYY-MM-DD HH:mm:ss'),
			endDate: moment(new Date()).utcOffset(8).format('YYYY-MM-DDTHH:mm:ss')
		};
		this.setState({
			loading: true
		});
		GetAppliedHistory(params).then((res) => {
			if (res) {
				this.setState({
					Promotionsdata: res
				});
			}
			this.setState({
				loading: false
			});
		});
	}

	render() {
		const { Promotionsdata, loading } = this.state;
		const { HideInvalid } = this.state;

		/*---------------------- 
			筛选出失效状态的优惠 
		------------------------*/
		let Invalidstatus = [
			'Expired',
			'Served',
			'Force to served',
			'Canceled',
			'Claimed',
			'Not Eligible',
			'Approved'
		];

		/*------------------------------------------------------------------------------
			筛选出正常显示的优惠数据  Note:只有这些状态才出现在【我的优惠Tab】列表 反之过滤掉
		--------------------------------------------------------------------------------*/
		let Normalstatus = [ 'Pending', 'Serving', 'Waiting for release', 'Release', 'Processing' ];


		const filterData = (status) => {
			let filterDataList = Promotionsdata
				? Promotionsdata.filter((item) => {
					if (item.promotionCategory === "Sports"){
						return status.some((n) => n === item.status);
					}
					return false
					})
				: [];
			return filterDataList;
		};
		/*---------------- 正常的优惠列表 --------------------*/
		let Normaldata = filterData(Normalstatus);
		/*---------------- 失效的优惠列表 ---------------------*/
		let Invaliddata = filterData(Invalidstatus);

		return (
			<div className="PromotionsMy">
				{/*----------------------------------------------------------------
					正常显示的优惠 如果有数据则显示。没有数据就显示 暂无任何优惠记录
				-------------------------------------------------------------------*/}
				{Promotionsdata && !loading ? Normaldata.length != 0 ? (
					Normaldata.map((data, index) => {
						return <Card data={data} key={index} Promotions={() => this.BonusAppliedHistory()} />;
					})
				) : (
					<div className="autoCenter">
						<div className="NullData">
							<Image src="/img/svg/boxnull.svg" />
							<p>
								您暂无任何优惠记录，<br />先去优惠页面申请吧！{' '}
							</p>
						</div>
					</div>
				) : (
					<SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
						<Skeleton count={5} height="125px" />
					</SkeletonTheme>
				)}

				{/*-------------------------------
						展示已经失效的优惠
				----------------------------------*/}
				{Promotionsdata != '' &&
				!!Invaliddata.length && (
					<p
						className="HidePromos"
						onClick={() => {
							this.setState({
								HideInvalid: !HideInvalid
							});
						}}
					>
						{HideInvalid ? (
							<span>
								{HideInvalid ? '失效的优惠已被隐藏' : ''}
								<span className="blue"> 点击查看 </span>
							</span>
						) : (
							<span>
								<span className="blue"> 点击隐藏 </span> 所有失效的优惠
							</span>
						)}
					</p>
				)}
				{Promotionsdata != '' &&
					!HideInvalid &&
					Invaliddata.map((data, index) => {
						return (
							<div className="HidePromosContent" key={index}>
								<Card data={data} dataindex={index} Promotions={() => this.props.Promotions()} />
							</div>
						);
					})}
			</div>
		);
	}
}

export default PromotionsHistory;

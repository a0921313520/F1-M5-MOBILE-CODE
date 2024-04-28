/*
	投注页面 公用头部  赛事比分概况
	此模塊是舊版UI，已廢棄
*/
import { ReactSVG } from '$SBTWO/ReactSVG';
import React from "react";
import Router from 'next/router';
import { Textfit } from 'react-textfit';
import LazyImageForTeam from "$SBTWO/LazyLoad/LazyImageForTeam";

import SwiperCore, { Navigation, Pagination, Autoplay} from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

SwiperCore.use([Navigation, Pagination, Autoplay]);

const swiperConfigs = {
	loop: true,
	speed: 500,
	preloadImages: false,
	autoplay: {
		delay: 3000,
		disableOnInteraction: false,
	},
	pagination: {
		el: '.swiper-pagination',
		bulletElement: 'li',
		hideOnClick: true,
		clickable: true
	},
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev'
	},
}

class BetHeader extends React.Component {
	constructor() {
		super();
		this.state = {
			isOpen: false,
			eventDatas: ''
		};
	}
	componentDidMount() {
		this.props.HeaderRef && this.props.HeaderRef(this);

		/* 默认足球 */
		this.getBannerData(1);
	}

	componentWillUnmount() {
		this.props.Vendor.deletePolling(this.bannerPollingKey);
	}

	getBannerData(ID) {
		this.bannerPollingKey = this.props.Vendor.getBannerDataPollingGlobal('banner',(eventDatas) => {
			this.setState({
				eventDatas: eventDatas
			})
		},ID);
	}

	getBannerBlock = (EventData) => {
		return <ul
			className="Betting-header-score"
			onClick={() => {
				Router.push(
					`/sbtwo${this.props.Vendor.configs.VendorPage}/detail?sid=${EventData.SportId}&eid=${EventData.EventId}&lid=${EventData.LeagueId}`
				);
				// Pushgtagdata(`Match`, 'Launch', 'Mainpage_banner');
			}}
		>
			<li>
				<LazyImageForTeam Vendor={this.props.Vendor} TeamId={EventData.HomeTeamId} IconUrl={EventData.HomeIconUrl} />
				<p className="team-name">{EventData.HomeTeamName}</p>
				{EventData.IsRB &&
				EventData.HomeRedCard &&
				parseInt(EventData.HomeRedCard) > 0 ? (
					<span className="red-card">
              {EventData.HomeRedCard ?? 0}
            </span>
				) : <span className="red-card noData">&nbsp;</span>}
			</li>
			<li className="Game-info">
				{
					EventData.IsRB ? <>
							<Textfit className="Game-team-pk">
								<span className={EventData.HomeScore > 0 ? 'notZero' : ''}>{EventData.HomeScore}</span>
								-
								<span className={EventData.AwayScore > 0 ? 'notZero' : ''}>{EventData.AwayScore}</span>
							</Textfit>
							{
								EventData.RBMinute > 0 &&
								<div className="Game-number">{EventData.RBMinute}'</div>
							}
						</>
						: <>
							<div className="Game-date">{EventData.getEventDateMoment().format('MM/DD HH:mm')}</div>
							<p className="Game-team-pk">VS</p>
							<div className="Game-notRB">未开始</div>
						</>
				}
			</li>
			<li>
				<LazyImageForTeam Vendor={this.props.Vendor} TeamId={EventData.AwayTeamId} IconUrl={EventData.AwayIconUrl} />
				<p className="team-name">{EventData.AwayTeamName}</p>
				{EventData.IsRB &&
				EventData.AwayRedCard &&
				parseInt(EventData.AwayRedCard) > 0 ? (
					<span className="red-card">
              {EventData.AwayRedCard ?? 0}
            </span>
				) : <span className="red-card noData">&nbsp;</span>}
			</li>
		</ul>
	}


	render() {
		const { eventDatas } = this.state;
		let datalength = eventDatas.length / 2;
		let datastatus = Number.isInteger(datalength);
		let setlength = datastatus ? datalength : datalength + 0.5;
		return (
			<div className="Betting-header">
				<Swiper {...swiperConfigs} onSwiper={(swiper) => {swiper.slideToLoop(1,0,false)}}>
					<div className="swiper-pagination" />
					{eventDatas != '' &&
						[ ...Array(setlength) ].map((item, index) => {
							let left = eventDatas[index * 2];
							let right = eventDatas[index * 2 + 1];
							return (
								<SwiperSlide className="swiper-slide" key={left.EventId}>
									<div className="swiper-slide-data">
										{ this.getBannerBlock(left) }
										{right && <div className="divider" />}
										{eventDatas.length % 2 != 0 && index + 2 == eventDatas.length ? (
											''
										) : (
											right && this.getBannerBlock(right)
										)}
									</div>
								</SwiperSlide>
							);
						})}
				</Swiper>
			</div>
		);
	}
}

export default BetHeader;

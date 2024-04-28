/*
 * @Author: Alan
 * @Date: 2022-01-25 20:48:48
 * @LastEditors: Alan
 * @LastEditTime: 2022-11-30 18:59:55
 * @Description: 游戏区域
 * @FilePath: \Mobile\src\components\NewsList\index.js
 */
import React, { Component } from 'react';

import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
SwiperCore.use([ Navigation, Pagination, Autoplay ]);
import Router from 'next/router';
import ReactIMG from '@/components/View/ReactIMG';

export default class NewsList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			NewsData: [],
			total: 0
		};
	}
	componentDidMount() {
		this.getNews();
	}

	/**
	 * @description: 获取新闻列表的数据 
	 * @return {*}
	*/

	getNews() {
		fetchRequest(ApiPort.WorldcupNews + '?pagesize=10&page=1', 'GET')
			.then((data) => {
				if (data.code == 0) {
					this.setState({
						NewsData: data.data,
						total: data.page.total
					});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}

	render() {
		const { NewsData, total } = this.state;
		return (
			<div>
				{NewsData &&
				NewsData.length != 0 && (
					<div>
						<Swiper modules={[ Pagination ]} className="NewsSwiper">
							{NewsData.filter((i) => i.sticky == true).map((item, index) => {
								return (
									<SwiperSlide key={index + 'list'}>
										{item.isShowPlayerIcon && (
											<div className="video">
												<ReactIMG src="/img/events/WC2022/video.svg" />
											</div>
										)}

										<img
											src={item.thumbnail}
											width="100%"
											height={'100%'}
											onClick={() => {
												Router.push(`/News/Details?id=${item.id}`);
											}}
										/>
										<span className="content-title">{item.title}</span>
										<p className="title" />
									</SwiperSlide>
								);
							})}
						</Swiper>

						{NewsData.filter((i) => i.sticky == false).map((item, index) => {
							if (index <= 2) {
								return (
									<div
										className="News-list"
										key={index}
										onClick={() => {
											Router.push(`/News/Details?id=${item.id}`);
										}}
									>
										<div className="left">
											{item.isShowPlayerIcon && (
												<div className="video">
													<ReactIMG src="/img/events/WC2022/video.svg" />
												</div>
											)}
											<img src={item.thumbnail} width="100%" height={'100%'} />
										</div>
										<div className="right">
											<p>{item.title}</p>
											<p className="time">{item.updatedDate}</p>
										</div>
									</div>
								);
							}
						})}
						{total > 6 && (
							<button
								className="morebtn"
								onClick={() => {
									Router.push('/News');
								}}
							>
								查看更多
							</button>
						)}
					</div>
				)}
			</div>
		);
	}
}

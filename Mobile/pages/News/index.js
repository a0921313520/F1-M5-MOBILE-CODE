import React, { Component } from 'react';
import Layout from '@/components/Layout';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import Router from 'next/router';
import ReactPullLoad, { STATS } from 'react-pullload';
import Toast from '@/components/View/Toast';
import ReactIMG from '@/components/View/ReactIMG';
SwiperCore.use([ Navigation, Pagination, Autoplay ]);
export default class NewsList extends React.Component {
	constructor() {
		super();
		this.state = {
			intData: [],
			//新闻列表
			newscon: [],
			//序列值
			currentIndex: 0,
			//页码数
			page: 1,
			hasMore: true,
			action: STATS.init,
			total: 0,
			index: 1 //loading more test time limit
		};
	}

	//get请求数据
	componentDidMount() {
		this.getNews(this.state.page);
	}

	/**
	 * @description: 获取新闻列表的数据 
	 * @return {*}
	*/

	getNews(page) {
		Toast.loading();
		fetchRequest(ApiPort.WorldcupNews + `?page=${page}&pagesize=100`, 'GET')
			.then((res) => {
				if (res.code == 0) {
					let list = res.data.filter((i) => i.sticky == false);
					this.setState({
						intData: res.data,
						newscon: this.arrSplit(list, 1, 6), // res.data,
						total: list.length
					});
				}
				Toast.destroy();
			})
			.catch((err) => {
				console.log(err);
			});
	}

	//分页
	arrSplit(arr, index, size) {
		const offset = (index - 1) * size;
		return offset + size >= arr.length ? arr.slice(offset, arr.length) : arr.slice(offset, offset + size);
	}

	handleAction = (action) => {
		//new action must do not equel to old action
		if (action === this.state.action) {
			return false;
		}

		if (action === STATS.refreshing) {
			//   this.handRefreshing();
			return;
		} else if (action === STATS.loading) {
			this.handLoadMore();
		} else {
			//DO NOT modify below code
			this.setState({
				action: action
			});
		}
	};

	//上划加载更多
	handLoadMore = () => {
		if (STATS.loading === this.state.action) {
			return false;
		}
		//无更多内容则不执行后面逻辑
		if (!this.state.hasMore) {
			return;
		}

		setTimeout(() => {
			if (this.state.index === 0) {
				this.setState({
					action: STATS.reset,
					hasMore: false
				});
			} else {
				//执行下拉加载
				//页码数
				this.state.page++;
				const PageNum = this.state.page;
				let list = this.state.intData.filter((i) => i.sticky == false);
				this.setState({
					//新闻列表
					newscon: this.arrSplit(list, 1, PageNum * 6),
					total: list.length,
					action: STATS.reset
				});
				//前端进行分页 下方注释
				// fetchRequest(ApiPort.WorldcupNews + `?page=${PageNum}&pagesize=6`, 'GET')
				// 	.then((res) => {
				// 		if (res.code == 0) {
				// 			this.setState({
				// 				//新闻列表
				// 				newscon: this.arrSplit(
				// 					this.state.intData.filter((i) => i.sticky == false),
				// 					1,
				// 					PageNum * 6
				// 				), //this.state.newscon.concat(res.data),
				// 				total: res.page.total,
				// 				action: STATS.reset
				// 			});
				// 		}
				// 	})
				// 	.catch((err) => {
				// 		console.log(err);
				// 	});
			}
		}, 1000);

		this.setState({
			action: STATS.loading
		});
	};

	render() {
		const { newscon, hasMore, intData } = this.state;
		return (
			<Layout
				BarTitle="新闻"
				status={2}
				hasServer={true}
				barFixed={true}
				backEvent={() => {
					Router.push('/event_WC2022');
				}}
			>
				<div className="NewsPage">
					{intData &&
					intData.length != 0 && (
						<div>
							<Swiper modules={[ Pagination ]} className="NewsSwiper">
								{intData.filter((i) => i.sticky == true).map((item, index) => {
									return (
										<SwiperSlide key={index + 'list'}>
											<div
												onClick={() => {
													Router.push(`/News/Details?id=${item.id}`);
												}}
											>
												{item.isShowPlayerIcon && (
													<div className="video">
														<ReactIMG src="/img/events/WC2022/video.svg" />
													</div>
												)}
												<img src={item.thumbnail} width="100%" height={'100%'} />
												<span className="content-title">{item.title}</span>
												<p className="title" />
											</div>
										</SwiperSlide>
									);
								})}
							</Swiper>
							<label>为您推荐</label>

							<ReactPullLoad
								downEnough={150}
								action={this.state.action}
								handleAction={this.handleAction}
								hasMore={hasMore}
								style={{ paddingTop: 0 }}
								distanceBottom={1000}
							>
								<ul className="test-ul">
									{/* .filter((i) => i.sticky == false) */}
									{newscon.filter((i) => i.sticky == false).map((item, index) => {
										return (
											<div
												className="News-list"
												key={index}
												onClick={() => {
													Router.push(`/News/Details?id=${item.id}`);
												}}
											>
												<div className="left">
													<img src={item.thumbnail} width="100%" height={'100%'} />
												</div>
												<div className="right">
													<p>{item.title}</p>
													<p className="time">{item.updatedDate}</p>
												</div>
											</div>
										);
									})}
								</ul>
							</ReactPullLoad>
							{this.state.total > 6 && (
								<button
									onClick={this.handLoadMore}
									className="morebtn"
									style={{
										borderRadius: '35px',
										padding: '8px'
									}}
								>
									载入更多
								</button>
							)}
						</div>
					)}
				</div>
			</Layout>
		);
	}
}

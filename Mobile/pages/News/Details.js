import React, { Component } from 'react';
import Layout from '@/components/Layout';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';
import VideoPlayer from '@/components/NewsList/Player';
import Router from 'next/router';
import ReactPullLoad, { STATS } from 'react-pullload';
import { getUrlVars } from '@/lib/js/Helper';
import ReactIMG from '@/components/View/ReactIMG';
SwiperCore.use([ Navigation, Pagination, Autoplay ]);
export default class NewsList extends React.Component {
	constructor() {
		super();
		this.state = {
			//分页的相关新闻列表
			newscon: [],
			//相关新闻总数据
			intData: [],
			//序列值
			currentIndex: 0,
			//页码数
			page: 1,
			hasMore: true,
			action: STATS.init,
			index: 1,
			NewsDetails: {}
		};
	}

	//get请求数据
	componentDidMount() {
		let id = getUrlVars()['id'];
		this.getRelatedNews(id);
	}

	getRelatedNews(id) {
		fetchRequest(ApiPort.WorldcupNews + `/${id}/related_number/`, 'GET')
			.then((res) => {
				if (res.code == 0) {
					this.setState({
						//新闻列表
						NewsDetails: res.data,
						intData: res.data.relatedNews,
						newscon: this.arrSplit(res.data.relatedNews, 1, 3),
						action: STATS.reset
					});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}

	handleAction = (action) => {
		return;
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
				this.setState({
					newscon: this.arrSplit(this.state.intData, 1, PageNum * 3),
					action: STATS.reset
				});
			}
		}, 1000);

		this.setState({
			action: STATS.loading
		});
	};

	//分页
	arrSplit(arr, index, size) {
		const offset = (index - 1) * size;
		return offset + size >= arr.length ? arr.slice(offset, arr.length) : arr.slice(offset, offset + size);
	}

	render() {
		const { newscon, hasMore, NewsDetails } = this.state;
		console.log('相关新闻列表---------------->', newscon);
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
				<div className="NewsPage" style={{ paddingTop: 0 }} key={JSON.stringify(newscon)}>
					<div>
						<div className="DetailsBox">
							{NewsDetails.isShowPlayerIcon && (
								<div key={JSON.stringify(NewsDetails)}>
									<VideoPlayer
										setPlayer={(v) => {
											this.player = v;
										}}
										autoplay={false} // 如果true,浏览器准备好时开始播放。
										controls={true}
										preload={true}
										sources={[
											{
												src: NewsDetails.video,
												type: 'application/x-mpegURL'
											}
										]}
										controlBar={{
											timeDivider: true,
											durationDisplay: true,
											remainingTimeDisplay: true,
											fullscreenToggle: true // 全屏按钮
										}}
									/>
								</div>
							)}
							{!NewsDetails.isShowPlayerIcon && <img src={NewsDetails.thumbnail} width="100%" />}
							<div className="content">
								<h3>{NewsDetails.title}</h3>
								<p>
									<small className="gray"> {NewsDetails.updatedDate}</small>
								</p>
								<div dangerouslySetInnerHTML={{ __html: NewsDetails.body }} />
							</div>
						</div>
						<label>延伸阅读</label>

						<ReactPullLoad
							downEnough={0}
							action={this.state.action}
							handleAction={this.handleAction}
							hasMore={hasMore}
							style={{ paddingTop: 0 }}
							distanceBottom={1000}
						>
							<ul className="test-ul">
								{newscon.length != 0 &&
									newscon.filter((i) => i.id != NewsDetails.id).map((item, index) => {
										return (
											<div
												className="News-list"
												key={index}
												onClick={() => {
													Router.push(`/News/Details?id=${item.id}`);
													this.getRelatedNews(item.id);
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
									})}
							</ul>
						</ReactPullLoad>

						{this.state.intData.length > 3 && (
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
				</div>
			</Layout>
		);
	}
}

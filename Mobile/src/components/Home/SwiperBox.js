/*
 * @Author: Alan
 * @Date: 2021-11-16 16:21:23
 * @LastEditors: Alan
 * @LastEditTime: 2022-09-29 14:01:45
 * @Description: MINI GAME
 * @FilePath: \Mobile\src\components\Home\SwiperBox.js
 */
import React, { Component } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import BannerBox from '@/components/Banner';
import { BsBellFill } from 'react-icons/bs';
import SwiperCore, { Autoplay } from 'swiper';
SwiperCore.use([ Autoplay ]);
export default class MiniBanner extends Component {
	constructor(props) {
		super(props);
		this.state = {
			miniGames: '',
			webViewUrl: '',
			bannerFlag: false
		};
	}
	componentDidMount() {
		this.bannerSet();
	}
	componentWillUnmount(){
		this.setState =()=> false;
	}
	bannerSet() {
		setTimeout(() => {
			this.setState({
				bannerFlag: true
			});
		}, 2000);
	}

	render() {
		const { CenterBanner, TopBanner, Announcements, Type } = this.props;
		const { bannerFlag } = this.state;
		return (
			<React.Fragment>
				{/* 跑马灯 */}
				{Type == 'Announcements' && (
					<div className="Notice">
						<Swiper
							autoplay
							slidesPerView={1}
							direction="vertical"
							onSlideChange={() => {}}
							onSwiper={(swiper) => {}}
							style={{ height: '40px' }}
						>
							{Announcements && Announcements.length != 0 &&
								Announcements.map((item, index) => {
									return (item.isRunningText ?
										<SwiperSlide key={index + 'list'}>
											{/* <Svgicon name="icon-bell" /> */}
											<BsBellFill size={12} color="rgb(255, 238, 0)" />
											<p
												style={{textOverflow: 'ellipsis', width: '93%', whiteSpace: 'nowrap', overflow: 'hidden'}}
												dangerouslySetInnerHTML={{
													__html: item.topic
												}}
											/>
										</SwiperSlide>
										:<></>
									);
								})}
						</Swiper>
					</div>
				)}

				{/* 顶部轮播图 */}
				{Type == 'TopBanner' && (
					<React.Fragment>
						{/* {TopBanner && TopBanner.length != 0 ? ( */}
						<Swiper
							className="swiper_container"
							autoplay={{
								delay: 5000 //5秒切换一次
							}} //自动播放
							lazy //懒加载
							//loop //循环模式
							slidesPerView="auto"
							centeredSlides={true}
							spaceBetween={0}
							initialSlide={0} //从api第一张图片开始
						>
							{TopBanner &&
								TopBanner != 'undefined' &&
								TopBanner.length != 0 &&
								TopBanner.map(
									(item, index) =>
										item !== 'null' && (
											<SwiperSlide className="card" key={index}>
												<BannerBox
													item={item}
													type="home"
													width="100%"
													height="auto"
													imgType="TopBanner"
													bannerFlag={bannerFlag}
													bannerList={TopBanner}
												/>
											</SwiperSlide>
										)
								)}
						</Swiper>
						{/* ) : (
							<div>
								<Swiper className="swiper_container" loop slidesPerView="auto" centeredSlides={true}>
									<SwiperSlide className="card" style={{ background: 'white' }}>
										<Skeleton count={1} width="100%" height="152px" />
									</SwiperSlide>
									<SwiperSlide className="card" style={{ background: 'white' }}>
										<Skeleton count={1} width="100%" height="152px" />
									</SwiperSlide>
								</Swiper>
							</div>
						)} */}
					</React.Fragment>
				)}

				{/* 中间扁平mini轮播图 */}
				{Type == 'CenterBanner' && (
					<div className="MiNiBanner">
						<Swiper
							spaceBetween={25}
							slidesPerView={1}
							autoplay={{
								delay: 5000 //5秒切换一次
							}}
							lazy
						>
							{CenterBanner != '' &&
								CenterBanner.map(
									(item, index) =>
										item !== 'null' && (
											<SwiperSlide key={index}>
												<BannerBox
													item={item}
													type="home"
													width="100%"
													height="auto"
													imgType="CenterBanner" /* height="75px" */
													bannerFlag={bannerFlag}
													bannerList={CenterBanner}
												/>
											</SwiperSlide>
										)
								)}

							{/* {!bannerFlag && (
								<SwiperSlide className="card">
									<Skeleton count={1} width="100%" height="100px" borderRadius="50px" />
								</SwiperSlide>
							)} */}
						</Swiper>
					</div>
				)}
			</React.Fragment>
		);
	}
}

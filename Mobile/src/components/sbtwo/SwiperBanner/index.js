/*
 * @Author: Alan
 * @Date: 2022-01-22 14:20:21
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-21 10:29:49
 * @Description: 幻灯片
 * @FilePath: \Mobile\src\components\sbtwo\SwiperBanner\index.js
 */

import React, { PureComponent } from 'react';
import Router from 'next/router';
import classNames from 'classnames';
import ReactIMG from '$SBTWO/ReactIMG';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
SwiperCore.use([ Navigation, Pagination, Autoplay ]);

const pagination = {
	clickable: true,
	renderBullet: function(index, className) {
		return '<span class="' + className + '">' + '' + '</span>';
	}
};

class SwiperBanner extends PureComponent {
	state = {
		selectedTab: 'home',
		hidden: false
	};

	componentDidMount() {
		this.setState({
			Routerurl: Router.router.route
		});
	}

	render() {
		const { BannerData } = this.props;

		return (
			<div className={'SwiperContainer '}>
				<Swiper pagination={pagination} modules={[ Pagination ]} className="WC2022Swiper">
					{BannerData.map((item, index) => {
						return (
							<SwiperSlide key={index + 'list'}>
								{/* <BannerBox item={item} width={350} height={380} page={'event_WC2022'} /> */}
								<ReactIMG className="page404__main__errImg" src="/img/404.png" />
							</SwiperSlide>
						);
					})}
				</Swiper>
			</div>
		);
	}
}

export default SwiperBanner;

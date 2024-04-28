import React, { Component, useState } from 'react';
import Layout from '$SBTWO/Layout';
import Tabs, { TabPane } from 'rc-tabs';
import Router from 'next/router';
import ReactIMG from '$SBTWO/ReactIMG';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
SwiperCore.use([ Navigation, Pagination, Autoplay ]);

export default function bet() {
	const swiperConfigs = {
		loop: false,
		preloadImages: false,
		pagination: {
			el: '.swiper-pagination',
			hideOnClick: false,
			clickable: true
		}
	};

	const SlideInfo = {
		singleBet: {
			name: 'singleBet',
			slides: [],
			length: 8,
			resetFn: () => singleSwiper.slideTo(0)
		},
		bettingCombo: {
			name: 'bettingCombo',
			slides: [],
			length: 10,
			resetFn: () => bettingComboSwiper.slideTo(0)
		},
		freebet: {
			name: 'freebet',
			slides: [],
			length: 6,
			resetFn: () => freebetSwiper.slideTo(0)
		},
		bettingComboBoost: {
			name: 'bettingComboBoost',
			slides: [],
			length: 5,
			resetFn: () => bettingComboBoostSwiper.slideTo(0)
		}
	};

	const SlidesUI = (name) => {
		const Length = SlideInfo[name].length;
		const SlidesAry = SlideInfo[name].slides;
		const Reset = SlideInfo[name].resetFn;
		for (let i = 0; i < Length; i += 1) {
			if (i + 1 !== Length) {
				SlidesAry.push(
					<SwiperSlide className="swiper-slide" key={`slide-${i + 1}`}>
						<ReactIMG src={`/img/tutorial/${name}/${i + 1}-min.png`} />
					</SwiperSlide>
				);
			}
			if (i + 1 === Length) {
				SlidesAry.push(
					<SwiperSlide className="swiper-slide" key={`slide-${i + 1}`}>
						<ReactIMG src={`/img/tutorial/${name}/${i + 1}-min.png`} />
						<div className="tutorial-bet-btn">
							<button className="goPlay" onClick={() => goHome()}>
								实战来一注
							</button>
							<button className="readAgain" onClick={Reset}>
								再看一次
							</button>
						</div>
					</SwiperSlide>
				);
			}
		}
	};

	const [ singleSwiper, setSingleSwiper ] = useState(null);
	const [ bettingComboSwiper, setBettingComboSwiper ] = useState(null);
	const [ freebetSwiper, setFreebetSwiper ] = useState(null);
	const [ bettingComboBoostSwiper, setBettingComboBoostSwiper ] = useState(null);

	SlidesUI('singleBet');
	SlidesUI('bettingCombo');
	SlidesUI('freebet');
	SlidesUI('bettingComboBoost');

	const goHome = () => {
		Router.push('/sbtwo');
	};

	const goSidebar = () => {
		Router.push('/sbtwo');
	};

	return (
		<Layout
			status={10}
			BarTitle="投注教程"
			hasServer={true}
			backEvent={() => {
				sessionStorage.setItem('tutorial', 'bet');
				history.go(-1);
			}}
		>
			<Tabs
				prefixCls="tabsNormal"
				defaultActiveKey={1}
				className="info__inside__tabs betTutorial__wrap"
				//   onChange={this.onClickSportsTabs}
				onChange={(k) => {
					let list = [ 'Single', 'Combo', 'Freebet', 'ComboBoost' ];
					// Pushgtagdata(`Tutorial`, 'View', `Bet_Tutorial_${list[k]}`);
				}}
			>
				<TabPane tab="单项投注" key="0">
					<div className="CTCTutorial_content">
						<Swiper {...swiperConfigs} onSwiper={setSingleSwiper}>
							{SlideInfo['singleBet'].slides}
							<div className="swiper-pagination" />
						</Swiper>
					</div>
				</TabPane>
				<TabPane tab="混合投注" key="1">
					<div className="CTCTutorial_content">
						<Swiper {...swiperConfigs} onSwiper={setBettingComboSwiper}>
							{SlideInfo['bettingCombo'].slides}
							<div className="swiper-pagination" />
						</Swiper>
					</div>
				</TabPane>
				<TabPane tab="免费投注" key="2">
					<div className="CTCTutorial_content">
						<Swiper {...swiperConfigs} onSwiper={setFreebetSwiper}>
							{SlideInfo['freebet'].slides} <div className="swiper-pagination" />
						</Swiper>
					</div>
				</TabPane>
				<TabPane tab="串关奖励" key="3">
					<div className="CTCTutorial_content">
						<Swiper {...swiperConfigs} onSwiper={setBettingComboBoostSwiper}>
							{SlideInfo['bettingComboBoost'].slides} <div className="swiper-pagination" />
						</Swiper>
					</div>
				</TabPane>
			</Tabs>
		</Layout>
	);
}

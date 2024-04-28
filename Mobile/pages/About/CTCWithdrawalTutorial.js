/*
 * @Author: Alan
 * @Date: 2022-06-26 01:02:46
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-26 16:12:45
 * @Description: 提款
 * @FilePath: \Mobile\pages\About\CTCWithdrawalTutorial.js
 */
import Modal from '@/components/View/Modal';
import Tabs, { TabPane } from 'rc-tabs';
import { ReactSVG } from '@/components/View/ReactSVG';
import Service from '@/components/Header/Service';
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import ReactIMG from '@/components/View/ReactIMG';

SwiperCore.use([ Navigation, Pagination, Autoplay ]);

export default function CTCDepositTutorial(props) {
	const pagination = {
		clickable: true,
		renderBullet: function(index, className) {
			return '<span class="' + className + '">' + '' + '</span>';
		}
	};

	const SlideInfo = {
		USDT: {
			name: 'USDT',
			slides: [],
			length: 2
		},
		ADDUSDT: {
			name: 'ADDUSDT',
			slides: [],
			length: 2
		}
	};

	const SlidesUI = (name) => {
		const Length = SlideInfo[name].length;
		const SlidesAry = SlideInfo[name].slides;
		console.log(name);
		for (let i = 0; i < Length; i++) {
			SlidesAry.push(
				<SwiperSlide className="swiper-slide" key={`slide-${name}-${i}`}>
					<ReactIMG alt={`${name}-step${i + 1}`} src={`/img/about/${name}/crypto_${i + 1}.png?v=121`} />
				</SwiperSlide>
			);
		}
	};

	SlidesUI('USDT');
	SlidesUI('ADDUSDT');

	return (
		<Modal
			key={JSON.stringify(props.visible)}
			className="verify__notice__modal CTCTutorial__modal"
			visible={props.visible}
			onCancel={props.closeModal}
			closable={false}
			animation={false}
			mask={false}
		>
			<div className="header-wrapper header-bar">
				<ReactSVG className="back-icon" src="/img/svg/LeftArrow.svg" onClick={props.closeModal} />

				<span>提款教程</span>
				<div className="header-tools-wrapper">
					<Service />
				</div>
			</div>
			<Tabs
				prefixCls="tabsNormal"
				defaultActiveKey={1}
				className="info__inside__tabs"
				//   onChange={this.onClickSportsTabs}
			>
				<TabPane tab={<span className="CTCTutorial-tab-title">如何提款泰达币?</span>} key="1">
					<div className="CTCTutorial_content">
						<Swiper pagination={pagination} modules={[ Pagination ]} className="mySwiper">
							{SlideInfo['USDT'].slides}
						</Swiper>
					</div>
				</TabPane>
				<TabPane tab={<span className="CTCTutorial-tab-title">如何添加钱包地址？</span>} key="2">
					<div className="CTCTutorial_content">
						<Swiper pagination={pagination} modules={[ Pagination ]} className="mySwiper">
							{SlideInfo['ADDUSDT'].slides}
						</Swiper>
					</div>
				</TabPane>
			</Tabs>
		</Modal>
	);
}

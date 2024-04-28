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

	const CryptoData = [
		{
			id: 'houbi',
			title: '火币',
			hasBg: true
		},
		{
			id: 'biance',
			title: '币安',
			hasBg: true
		},
		{
			id: 'okex',
			title: 'OKEx',
			hasBg: true
		},
		{
			id: '58coin',
			title: '58Coin',
			hasBg: false
		},
		{
			id: 'zb',
			title: '中币',
			hasBg: false
		},
		{
			id: 'coinCola',
			title: '可盈可乐',
			hasBg: false
		},
		{
			id: 'mxc',
			title: '抹茶',
			hasBg: false
		},
		{
			id: 'coinW',
			title: '币赢',
			hasBg: false
		}
	];

	const MultiChainWallets = [
		{
			id: 'AToken',
			title: 'AToken'
		},
		{
			id: 'HyperPay',
			title: 'Hyper Pay'
		},
		{
			id: 'imToken',
			title: 'imToken'
		},
		{
			id: 'TokenPocket',
			title: 'Token Pocket'
		}
	];

	const SlideInfo = {
		CHANNEL: {
			name: 'CHANNEL',
			slides: [],
			length: 8
		},
		INVOICE: {
			name: 'INVOICE',
			slides: [],
			length: 6
		},
		INVOICE_AUT: {
			name: 'INVOICE_AUT',
			slides: [],
			length: 5
		},
		OTC: {
			name: 'OTC',
			slides: [],
			length: 3
		}
	};

	const SlidesUI = (name) => {
		const Length = SlideInfo[name].length;
		const SlidesAry = SlideInfo[name].slides;
		for (let i = 0; i < Length; i++) {
			if (name !== 'OTC' && i + 1 === Length) {
				SlidesAry.push(
					<SwiperSlide className="swiper-slide lastFlow" key={`slide-${i}`}>
						{moreInfoUI()}
					</SwiperSlide>
				);
				return;
			} else {
				SlidesAry.push(
					<SwiperSlide className="swiper-slide" key={`slide-${name}-${i}`}>
						<ReactIMG
							alt={`${name}-step${i + 1}`}
							src={`/img/deposit/CTCTutorial/${name}/${i + 1}-min.png`}
						/>
					</SwiperSlide>
				);
			}
		}
	};

	SlidesUI('CHANNEL');
	SlidesUI('INVOICE');
	SlidesUI('INVOICE_AUT');
	SlidesUI('OTC');

	function moreInfoUI() {
		return (
			<div className="CTCTutorial-readMore">
				<div className="CTCTutorial-readMore-title">您可以于以下几个交易平台购买虚拟货币</div>
				<div className="CTCTutorial-readMore-wrap three">
					{CryptoData.map((item) => (
						<div key={item.id} className={item.hasBg ? 'hasBg' : ''}>
							<ReactIMG alt={item.title} src={`/img/deposit/CTCTutorial/${item.id}.png`} />
							{item.title}
						</div>
					))}
				</div>
				<div className="CTCTutorial-line" />
				<div className="CTCTutorial-readMore-title">并于多链钱包中进行转账交易</div>
				<div className="CTCTutorial-readMore-wrap two">
					{MultiChainWallets.map((item) => (
						<div key={item.id}>
							<ReactIMG alt={item.title} src={`/img/deposit/CTCTutorial/${item.id}.png`} />
							{item.title}
						</div>
					))}
				</div>
			</div>
		);
	}

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

				<span>存款教程</span>
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
				<TabPane
					tab={
						<span className="CTCTutorial-tab-title">
							极速虚拟币
							<br />
							支付
						</span>
					}
					key="1"
				>
					<div className="CTCTutorial_content">
						<Swiper pagination={pagination} modules={[ Pagination ]}>
							{SlideInfo['CHANNEL'].slides}
							<div className="swiper-pagination" />
						</Swiper>
					</div>
				</TabPane>
				<TabPane
					tab={
						<span className="CTCTutorial-tab-title">
							虚拟币交易所
							<br />
							(OTC)
						</span>
					}
					key="2"
				>
					<div className="CTCTutorial_content">
						<Swiper pagination={pagination} modules={[ Pagination ]}>
							{SlideInfo['OTC'].slides}
						</Swiper>
					</div>
				</TabPane>
				<TabPane
					tab={
						<span className="CTCTutorial-tab-title">
							虚拟币
							<br />
							支付 1
						</span>
					}
					key="3"
				>
					<div className="CTCTutorial_content">
						<Swiper pagination={pagination} modules={[ Pagination ]}>
							{SlideInfo['INVOICE'].slides}
						</Swiper>
					</div>
				</TabPane>
				<TabPane
					tab={
						<span className="CTCTutorial-tab-title">
							虚拟币
							<br />
							支付 2
						</span>
					}
					key="4"
				>
					<div className="CTCTutorial_content">
						<Swiper pagination={pagination} modules={[ Pagination ]}>
							{SlideInfo['INVOICE_AUT'].slides}
						</Swiper>
					</div>
				</TabPane>
			</Tabs>
		</Modal>
	);
}

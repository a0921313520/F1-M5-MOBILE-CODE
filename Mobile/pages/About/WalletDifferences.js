/*
 * @Author: Alan
 * @Date: 2022-06-26 01:02:46
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-28 00:45:33
 * @Description: 帮助中心
 * @FilePath: \Mobile\pages\About\WalletDifferences.js
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
	const swiperConfigs = {
		loop: false,
		preloadImages: false,
		pagination: {
			el: '.swiper-pagination'
		}
	};

	const SlideInfo = {
		USDT: {
			name: 'USDT',
			slides: [],
			length: 6
		},
		ADDUSDT: {
			name: 'ADDUSDT',
			slides: [],
			length: 5
		}
	};

	const SlidesUI = (name) => {
		const Length = SlideInfo[name].length;
		const SlidesAry = SlideInfo[name].slides;
		console.log(name);
		for (let i = 0; i < Length; i++) {
			SlidesAry.push(
				<SwiperSlide className="swiper-slide" key={`slide-${name}-${i}`}>
					<ReactIMG alt={`${name}-step${i + 1}`} src={`/img/about/${name}/crypto_${i + 1}.jpg`} />
				</SwiperSlide>
			);
		}
	};

	SlidesUI('USDT');
	SlidesUI('ADDUSDT');
	const pagination = {
		clickable: true,
		renderBullet: function(index, className) {
			return '<span class="' + className + '">' + (index + 1) + '</span>';
		}
	};
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

				<span>钱包协议的区别</span>
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
				<TabPane tab={<span className="CTCTutorial-tab-title">什么是 USDT?</span>} key="1">
					<div className="USDTINFO">
						<h3>泰达币简介</h3>
						<div className="content">
							泰达币（USDT）是Tether公司推出的基于稳定价值货币美元（USD）的代币Tether USD。
							每发行1个USDT，Tether公司的银行账户都会有1美元的资金保障，用户可以在Tether平台进行资金查询。
						</div>
						<h3>泰达币特点</h3>
						<div className="content">
							<h4>稳定的货币</h4>
							<p>Tether将现金转换成数字货币，锚定或将美元、欧元和日元等国家货币的价格钩。</p>
							<h4>透明的</h4>
							<p>我们的外汇储备每天都在公布，并受到频繁的专业审计。流通中的所有东西总是与我们的储备相匹配 。 </p>
							<h4>区块链技术</h4>
							<p>Tether平台建立在区块链技术的基础之上，利用它们提供的安全性和透明性。</p>
							<h4>安全</h4>
							<p>Tether的区块链技术在满足国际合规标准和法规的同时，提供了世界级的安全保障。</p>
							<p>USDT最大的特点是，它与同数量的美元是等值的，1USDT=1美元。使之成为波动剧烈的加密货币市场中良好的保值代币。</p>
						</div>
					</div>
				</TabPane>
				<TabPane tab={<span className="CTCTutorial-tab-title">钱包协议</span>} key="2">
					<div className="USDTINFO">
						<h3>钱包协议的类型</h3>
						<div className="content">
							<h4>第1种 ：ERC20</h4>
							<p>存储在以太坊的 USDT （基于 ERC - 20 协议发行） 这种USDT存储在以太坊地址上，相对应的，每次转账（链接上转账）是 需要消耗GAS ，也就是ETH。</p>
							<h4>第2种 ：TRC20</h4>
							<p>存储在波场网络的 USDT（基于 TRC - 20 协议发行） 该USDT 存储在TRON 的地址中，存款 提款都是通过 TRON网络进行的。 </p>
							<h4>第3种：OMNI</h4>
							<p>存储在比特币网络的 USDT （基于 OMNI 协议发行）这种 USDT 存储在比特币地址上，所以每次转账（链上转账）时，都需要支付少量比特币作为矿工费。</p>
						</div>
						<h3>三种 USDT 科普</h3>
						<div className="tableBox">
							<table class="tableinfo">
								<tr>
									<th>三种USDT</th>
									<th>OMNI</th>
									<th>ERC20协议</th>
									<th>TRC20协议</th>
								</tr>
								<tr>
									<td>地址样式 （谨防充错）</td>
									<td>数字1或3开头,例如183hmJGRu</td>
									<td>数字0或小写x开头，例如 0xbd7e4b</td>
									<td>大写字母T开头，例如： T9zp14nm</td>
								</tr>
								<tr>
									<td>使用情况</td>
									<td>比特币网络</td>
									<td>以太坊网络</td>
									<td>波场网络</td>
								</tr>
								<tr>
									<td>网络拥堵情况</td>
									<td>偶尔拥堵</td>
									<td>经常拥堵</td>
									<td>基本不拥堵</td>
								</tr>
								<tr>
									<td>日常转账速度</td>
									<td>慢 (0.6-2小时 不等）</td>
									<td>中等 （几分钟到十几分钟不等）</td>
									<td>中等 （几分钟到十几分钟不等）</td>
								</tr>
								<tr>
									<td>手续费</td>
									<td>最高 转账手续费和BTC一致，平台提现一般收2-20USDT不等</td>
									<td>一般 钱包转账手续费与ETH一致，平台提现一般收1-5USDT 不等</td>
									<td>无 钱包转账0手续费，平台提现时有可能收取少量手续费</td>
								</tr>
								<tr>
									<td>安全性</td>
									<td>最高</td>
									<td>高</td>
									<td>低于前两者</td>
								</tr>
								<tr>
									<td>使用建议</td>
									<td>大额低频走比特币网络</td>
									<td>中等额度走 ETC网络</td>
									<td>小额高频走 波场网络</td>
								</tr>
							</table>
							<div className="content">* 三种USDT 地址不互通，转账请务必鉴别，存款等操 作应注意严格存入对应地址。</div>
						</div>

						<h3>哪种协议更加符合您的需求？</h3>
						<div className="content">
							<p>1.大笔转账推荐 OMNI 的USDT，手续费贵，慢一点，但最安全。</p>
							<p>2.中等额度就选择 ERC20 的 USDT，手续费一般。速度一般，安全性较高。 </p>
							<p>3.小额转账可以用波场USDT，速度更快一点，波场网络转账本身不收手续费（交易平台可能收一些）。</p>
						</div>
					</div>
				</TabPane>
			</Tabs>
		</Modal>
	);
}

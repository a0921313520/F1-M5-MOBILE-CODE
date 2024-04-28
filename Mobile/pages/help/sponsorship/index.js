/*
 * @Author: Alan
 * @Date: 2022-04-06 13:44:39
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-18 13:58:01
 * @Description: 赞助伙伴
 * @FilePath: \Mobile\pages\About\Sponsorship.js
 */

import React, { Component } from 'react';
import Layout from '@/components/Layout';
import Flexbox from '@/components/View/Flexbox/';
import ReactIMG from '@/components/View/ReactIMG';
import { CmsBanner } from '@/api/home';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/help/sponsorship'); //參數帶本頁的路徑
}
class Sponsorship extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			Banner: [
				{
					title: "Sponsorship Banner",
					body: "",
					category: "sponsorship",
					cmsImageUrl: "https://cache.f866u.com/sites/default/files/2022-06/MicrosoftTeams-image.png",
					action: {
						actionId: 0,
						actionName: "No Action"
					}
				}
			]
		};
	}

	componentDidMount() {
			// // CMS api轉Hardcode，未來可能會提供其他api fetch資料，先保留。
		// this.GetCmsBanne();
		// window.Pushgtagdata && Pushgtagdata(window.location.origin, 'Launch', 'sponsorship');
	}

	/**
	 * @description:  获取banner
	 * @param {*}
	 * @return {*}
	 * 
	*/
	// // CMS api轉Hardcode，未來可能會提供其他api fetch資料，先保留。
	// GetCmsBanne = () => {
	// 	CmsBanner('sponsorship', (res) => {
	// 		if (res.message) {
	// 			return;
	// 		}
	// 		if (res) {
	// 			this.setState({
	// 				Banner: res
	// 			});
	// 		}
	// 	});
	// };

	render() {
		const { Banner } = this.state;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="Nhà Tài Trợ"
				status={2}
				hasServer={false}
				barFixed={true}
				seoData={this.props.seoData}
			>
				<Flexbox id="Sponsorship" flexWrap="wrap">
					<ReactIMG src="/img/about/Sponsorship/Asset-TONY-VN_Mobile.jpg"/>
					<ReactIMG src="/img/about/Sponsorship/VN_Asset-IkerCasillas.jpg" alt="纽卡斯尔联足球俱乐部" />
					<ReactIMG src="/img/about/Sponsorship/VN_Asset-NUFC.jpg" alt="纽卡斯尔联足球俱乐部" />
					<ReactIMG src="/img/about/Sponsorship/VN_Asset-SPURS.jpg" alt="托特纳姆热刺足球俱乐部" />
					<ReactIMG src="/img/about/Sponsorship/VN_Asset-OG.jpg" alt="OG战队 - 刀塔2 全球官方投注伙伴" />
					<ReactIMG src="/img/about/Sponsorship/VN_Asset-KOBE.jpg" alt="科比-布莱恩特" />
					<ReactIMG src="/img/about/Sponsorship/VN_Asset-Burnley.jpg" alt="伯恩利足球俱乐部" />
					<ReactIMG src="/img/about/Sponsorship/VN_Asset-SteveXRob.jpg" alt="名人堂" />
					<ReactIMG src="/img/about/Sponsorship/VN_Asset-Lamborghini.jpg" alt="乐天堂赛车队" />
					<ReactIMG src="/img/about/Sponsorship/VN_Asset-LaLiga.jpg" alt="西甲联赛广告赞助商" />
					{/* {Banner &&
					Banner.length != 0 &&
					Banner[0].cmsImageUrl != '' && (
						<LazyLoadImage
							src={Banner[0].cmsImageUrl}
							alt={Banner[0].title}
							width={'100%'}
							height={'auto'}
							effect="blur"
						/>
					)} */}

					<Flexbox className="TODO">
						<button className="videoBtn"
							onClick={() => {
								window.open(
									'https://www.youtube.com/@funsportgame8887/',
									`_blank`
								);
							}}>
							Xem Thêm Video
						</button>
						{/* <ReactIMG
							src="/img/about/Sponsorship/CN_Button@2x.webp"
							alt="优酷"
							onClick={() => {
								window.open(
									'https://m.youku.com/profile?callApp=1&showHeader=1&uid=UNDcxOTM4MzAw',
									`_blank`
								);
							}}
						/> */}
					</Flexbox>
				</Flexbox>
			</Layout>
		);
	}
}

export default Sponsorship;

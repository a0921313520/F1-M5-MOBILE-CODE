/*
 * @Author: Alan
 * @Date: 2022-03-28 13:53:18
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-28 00:35:54
 * @Description: 推荐好友
 * @FilePath: \Mobile\pages\referrer-activity\index.js
 */
import React, { Component } from 'react';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/referrer-activity'); //參數帶本頁的路徑
}
const ReferrerActivity = dynamic(import('@/components/referrer-activity/'), { ssr: false });
export default class ReferrerActivityPage extends Component {
	render() { 
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="Giới Thiệu Bạn Bè"
				status={2}
				hasServer={false}
				barFixed={true}
				seoData={this.props.seoData}
			>
				<ReferrerActivity />
			</Layout>
		)

	}
}

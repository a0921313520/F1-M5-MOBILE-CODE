/*
 * @Author: Alan
 * @Date: 2022-03-28 13:53:18
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-05 19:53:32
 * @Description: 俱乐部
 * @FilePath: \Mobile\pages\KingClub\index.js
 */
import React, { Component } from 'react';
import Layout from '@/components/Layout';
import ReactIMG from '@/components/View/ReactIMG';
import { PopUpLiveChat } from '@/lib/js/util';
export default class Forgetpwd extends Component {
	constructor(props) {
		super(props);
		this.state = {
			heightset: '100%'
		};
	}
	componentDidMount() {
		window.heightset = document.body.offsetHeight;
		this.setState({
			heightset: heightset
		});
	}
	render() {
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="天王俱乐部"
				status={2}
				hasServer={false}
				barFixed={true}
			>
				<div
					id="KingClub"
					onClick={() => {
						PopUpLiveChat();
					}}
				>
					{/* <div className="Note">手机版天王俱乐部在升级中，请参访桌面版。</div> */}
				</div>
			</Layout>
		);
	}
}

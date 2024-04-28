/*
 * @Author: Alan
 * @Date: 2022-08-02 15:29:45
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-04 09:25:57
 * @Description: 违反规定页面
 * @FilePath: \Mobile\pages\illegal.js
 */

import React, { Component } from 'react';
import Layout from '@/components/Layout';
import Illegal from '@/components/Illegal/';
import AddBankFail from '@/components/AddBankFail/';
export default class illegal extends Component {
	render() {
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="嗨FUN双旦 惠不可挡"
				status={0}
				hasServer={true}
				barFixed={true}
			>
				<Illegal />
			</Layout>
		);
	}
}

/*
 * @Author: Alan
 * @Date: 2021-11-16 16:21:23
 * @LastEditors: Alan
 * @LastEditTime: 2022-01-20 12:42:28
 * @Description: MINI GAME
 * @FilePath: \Fun88-Sport-Code2.0\pages\newyear.js
 */
import React, { Component } from 'react';
import Layout from '@/components/Layout';
import Router from 'next/router';
import { checkIsLogin, redirectToLogin } from '@/lib/js/util';
export default class Forgetpwd extends Component {
	constructor(props) {
		super(props);
		this.state = {
			miniGames: '',
			webViewUrl: ''
		};
	}
	componentDidMount() {
		window.onmessage = function(e) {
			if (e.data == 'ShowDeposit') {
				Router.push('/deposit');
			}
			if (e.data == 'ShowLogin') {
				Router.push(`/register_login`);
				localStorage.setItem('miniurlopen', 'true');
			}
		};
		let miniGames = JSON.parse(localStorage.getItem('miniGames'));
		let StagingApi = Boolean(
			[
				'sportsstaging.fun88.biz',
				'sports1staging.fun88.biz',
				'sports2staging.fun88.biz',
				'sports3staging.fun88.biz',
				'sports4staging.fun88.biz',
				'sports5staging.fun88.biz',
				'sports11staging.fun88.biz',
				'localhost:6868'
			].find((v) => global.location.href.includes(v))
		);
		if (miniGames) {
			let gameurl = miniGames.webViewUrl.replace(
				window.location.protocol == 'https:' ? /^https:\/\/[^/]+/ : /^http:\/\/[^/]+/,
				`${window.location.protocol}//www.` + document.domain.split('.').slice(-2).join('.')
			);
			this.setState({
				miniGames: miniGames,
				webViewUrl: StagingApi ? miniGames.webViewUrl : gameurl
			});
		}
		if (checkIsLogin()) {
			localStorage.removeItem('miniurlopen');
		}
	}
	render() {
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="嗨FUN双旦 惠不可挡"
				status={2}
				hasServer={true}
				barFixed={true}
			>
				{this.state.webViewUrl !== '' && (
					<iframe
						src={this.state.webViewUrl}
						style={{ height: '100vh' }}
						title="嗨FUN双旦  惠不可挡"
						width="100%"
						frameBorder="no"
						border="0"
					/>
				)}
				<style jsx global>{`
					.light .header-wrapper {
						background-color: #e50019;
					}
				`}</style>
			</Layout>
		);
	}
}

/*
 * @Author: Alan
 * @Date: 2022-02-08 14:53:42
 * @LastEditors: Alan
 * @LastEditTime: 2022-11-09 23:13:42
 * @Description: Sportsbook 体育博彩
 * @FilePath: \Mobile\pages\sbtwo\Aviator.js
 */

import React, { Component } from 'react';
import Layout from '$SBTWO/Layout';
import { GetGamesList, OpenPlayGame } from '@/api/game';
import Toast from '@/components/View/Toast';
import { checkIsLogin, redirectToLogin } from '@/lib/js/util';
import { HiOutlineRefresh } from 'react-icons/hi';
import Flexbox from '@/components/View/Flexbox/';
import BalanceDropdown from '$SBTWO/Balance-Dropdown';
import Service from '@/components/Header/Service';
export default class Aviator extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			modalVisible: false
		};
	}

	componentDidMount() {
		this.GetGameData();
	}

	GetGameData() {
		if (!checkIsLogin()) {
			redirectToLogin();
		}
		let params = {
			gameType: 'InstantGames',
			provider: 'SPR',
			gameSortingType: 'Default'
		};
		Toast.loading();
		GetGamesList(params, (data) => {
			if (data) {
				if (data.isSuccess) {
					if (data.result.gameDetails) {
						let item = data.result.gameDetails.find((ele) => ele.gameNameEnglish === 'Aviator');
						this.PlayGame(item);
						this.setState({ Aviatoritem: item });
					}
				}
			}
		});
	}

	/**
	 * @description: 启动游戏
	 * @param {*} item
	 * @return {*}
	*/

	PlayGame(item) {
		OpenPlayGame((data) => {
			if (data) {
				if (data.isSuccess) {
					if (!data.result.isGameMaintenance && data.result.gameLobbyUrl && data.result.gameLobbyUrl != '') {
						this.setState({
							GameOpenUrl: data.result.gameLobbyUrl
						});
						let Iframe = document.getElementById('Iframe');
						if (Iframe) {
							Iframe.onload = Iframe.onreadystatechange = function() {
								if (this.readyState && this.readyState != 'complete') return;
								else {
									Toast.destroy();
								}
							};
						}
					} else {
						Toast.error('游戏维护中，请稍后重试', 3);
					}
				} else {
					Toast.error(data.message, 3);
				}
			}
		}, item);
	}

	RefreshGame() {
		this.setState(
			{
				GameOpenUrl: ''
			},
			() => {
				if (this.state.Aviatoritem) {
					this.PlayGame(this.state.Aviatoritem);
				}
			}
		);
	}

	render() {
		const { Aviatoritem, GameOpenUrl } = this.state;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="体育博彩"
				status={4}
				barFixed={true}
			>
				<div className="header-wrapper header-bar" style={{ position: 'fixed' }}>
					<Flexbox>
						小游戏{' '}
						<HiOutlineRefresh
							size={20}
							color="white"
							style={{ marginLeft: '10px' }}
							onClick={() => {
								this.RefreshGame();
							}}
						/>
					</Flexbox>
					<span className="Header-title" />
					<Flexbox alignItems="center" className="AviatorHeader">
						<div className="BalanceDropdown">
							<BalanceDropdown type="P2P" />
						</div>
						<Service />
					</Flexbox>
				</div>
				<div>
					<iframe
						src={GameOpenUrl}
						frameBorder="0"
						width="100%"
						height="100%"
						id="Iframe"
						style={{ minHeight: 'calc(100vh - 1.3866666667rem)', paddingTop: '60px' }}
					/>
				</div>
			</Layout>
		);
	}
}

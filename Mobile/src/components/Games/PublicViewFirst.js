/*
 * @Author: Alan
 * @Date: 2022-02-08 17:48:31
 * @LastEditors: Alan
 * @LastEditTime: 2022-09-22 17:10:03
 * @Description: 简洁风格的模板组件 直接打开游戏
 * @FilePath: \Mobile\src\components\Games\PublicViewFirst.js
 */
import React, { Component } from 'react';
import Flexbox from '@/components/View/Flexbox/';
import LaunchGameImg from './LaunchGame';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import classNames from 'classnames';
//import SportsTwo from '@/components/Games/SportsTwo';

class LayoutStyleFirst extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			ProviderGames: [],
			gameTypeDetail: ''
		};
	}

	render() {
		const { gameTypeDetail, GameType, ProvidersList, ProvidersListImg } = this.props;
		return (
			<div className="Container">
				<div
					className="GameHeader"
					onClick={() => {
						// Pushgtagdata(`Promo Nav`, 'View', `0_${GameType}_ProductPage`);
					}}
				>
					<LazyLoadImage
						src={`${process.env.BASE_PATH}/img/P5/GameBanner/${GameType}.jpg`}
						alt={gameTypeDetail.name}
						effect="blur"
						width="100%"
						height="100%"
						onError={({ currentTarget }) => {
							currentTarget.onerror = null;
							currentTarget.src = `${process.env.BASE_PATH + '/img/svg/method-4.svg'}`;
						}}
					/>
				</div>
				<div className="GameBox">
					<h3>Sản Phẩm</h3>
					<Flexbox
						className={classNames({
							BannerGames: true,
							MiniBanner: true,
							[GameType + '_Page']: true
						})}
						flexDirection={'column'}
					>
						{/* {GameType == 'Sportsbook' && <SportsTwo />} */}
						{ProvidersList &&
							ProvidersList?.map((item, index) => {
								let Category;
								if (item.code == 'VTG') {
									//针对V2虚拟体育
									Category = {
										gameCatCode: "GameType",
									};
									item.gameCatCode = GameType;
								}
								/* 这么做的目的是为了适配Sportsbook启动游戏 游戏列表详情页面data首页data有点不一样 */
								if (GameType == 'Sportsbook') {
									item.gameCatCode = 'Sportsbook';
									item.code = item.providerCode;
								}
								return (
									<Flexbox
										className="list"
										key={index + 'list'}
										style={{
											width:'100%',
										}}
										onClick={()=>{
											if(item.providerCode=="YBS"){
												// Pushgtagdata(`Game`, 'Click', `PM_Sports_ProductPage`);
												
											}
										}}
									>
										<LaunchGameImg item={item} GameType={GameType} Category={Category} />
									</Flexbox>
								);
							})}
					</Flexbox>
				</div>
			</div>
		);
	}
}

export default LayoutStyleFirst;

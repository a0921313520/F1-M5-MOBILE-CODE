/*
 * @Author: Alan
 * @Date: 2022-06-07 07:47:26
 * @LastEditors: Alan
 * @LastEditTime: 2022-09-05 12:54:24
 * @Description:SB2.0体育
 * @FilePath: \Mobile\src\components\Games\SportsTwo.js
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import Image from 'next/image';
import Router from 'next/router';
import Flexbox from '@/components/View/Flexbox/';
import ReactIMG from '@/components/View/ReactIMG';
import Toast from '@/components/View/Toast';
import Announcement from '@/components/Announcement/';
import { checkIsLogin, getAllVendorToken } from '$SBTWOLIB/js/util';

class Tag extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hasMore: true
		};
	}

	componentDidMount() {}

	/**
  		* @description: 先检查公告
		* @return {*}
  	*/
	checkAnnouncement = () => {
		/* 如果未登录 则直接进入sb页面，不检测公告 */
		if (!checkIsLogin()) {
			this.gotoSB20();
			return;
		}

		/* 检测是否设置了行为限制 */
		if (this.checkSelfExclusionsis()) {
			return;
		}
		
		this.setState(
			{
				StartCheckAnnouncement: true
			},
			() => {
				this.getCheck.GetAnnouncementPopup('Sportsbook', {});
			}
		);
	};

	checkSelfExclusionsis() {
		if (typeof SelfExclusionsisDisabled != 'undefined' && SelfExclusionsisDisabled) {
			CheckSelfExclusions(true);
			return true;
		}
		return false;
	}

	gotoSB20 = () => {
		if (checkIsLogin()) {
			//已登入 先獲取token後跳轉
			Toast.loading();
			getAllVendorToken().finally(() => {
				//不管成功或失敗都跳轉
				Toast.destroy();
				Router.push('/sbtwo');
			});
		} else {
			//未登入 直接跳轉
			Router.push('/sbtwo');
		}
	};

	render() {
		const { Page } = this.props;
		return (
			<div>
				{Page == 'Home' && (
					<React.Fragment>
						<div
							className={classNames({
								List: true
								// HOT: subitem.isHot, //热门
								// NEW: subitem.isNew, //新游戏
								// Tournament: subitem.isTournament, //推荐
								// Maintenance: subitem.isMaintenance //维护
							})}
						>
							<img
								alt={'Sports'}
								src={`${process.env.BASE_PATH}/img/SB20_new.webp`}
								loading={'lazy'}
								width={'100%'}
								height={'100%'}
								onClick={this.checkAnnouncement}
							/>
							<h4>{'乐体育'}</h4>
						</div>
						<div className="Summary">随时随地畅享体育赛事</div>
					</React.Fragment>
				)}
				{Page != 'Home' && (
					<Flexbox
						className="list"
						style={{
							width: '100%'
						}}
					>
						<ReactIMG
							alt={'Sports'}
							src={'/img/SB20Banner_new.webp'}
							onClick={this.checkAnnouncement}
							className="SportsBanner"
						/>
					</Flexbox>
				)}
				{this.state.StartCheckAnnouncement && (
					<Announcement
						Check={(props) => {
							this.getCheck = props;
						}}
						PlayGame={(item) => {
							/* 检测是否设置了行为限制 */
							if (this.checkSelfExclusionsis()) {
								return;
							}
							this.gotoSB20();
						}}
					/>
				)}
			</div>
		);
	}
}
export default Tag;

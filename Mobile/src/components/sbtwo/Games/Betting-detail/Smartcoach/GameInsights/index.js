/*
 * @Author: Alan
 * @Date: 2021-05-19 11:59:19
 * @LastEditors: Alan
 * @LastEditTime: 2021-08-25 19:00:16
 * @Description: 公用组件-即时情报   （即时情报、赛程-赛况、赛前情报）
 * @FilePath: \Fun88-Sport-Code2.0\components\Games\Betting-detail\Smartcoach\GameInsights\index.js
 */
import React, { Component } from 'react';
import Skeleton from '$SBTWO/Skeleton/smartcoach';
import LazyImageForTeam from '$SBTWO/LazyLoad/LazyImageForTeam';
import { forceCheck } from 'react-lazyload';
import ReactIMG from '$SBTWO/ReactIMG';

class RealTimeCommunication extends Component {
	constructor(props) {
		super(props);
		this.state = {
			/* 赛前情报   @ 报默认显示数据数量 */
			showmorePregameInsights: 5,
			/* 即时情报 @ 默认显示数据数量 */
			showmoreLiveInsightsSocketData: 5,
			/* 赛前-赛况  @ 默认显示数据数量 */
			showmoreTimelineSockeMatchreSultData: 10
		};
	}

	/**
	 * @description: 让*号*包裹的内容加粗
	 * @param {string} Message 原始消息
	 * @param {boolean} highlight 是否为红色显示
	 * @return {string}
	*/
	ChangeMessage = (Message, highlight) => {
		let split = Message.split('*');
		let txt = '';
		split.forEach((t, s) => {
			txt += s % 2 ? `<b class="${highlight ? 'red' : 'black'}">${t}</b>` : t;
		});
		return txt;
	};

	render() {
		const {
			showmorePregameInsights,
			showmoreLiveInsightsSocketData,
			showmoreTimelineSockeMatchreSultData
		} = this.state;
		const {
			/* 联赛名 */
			LeagueName,
			/* 主队名 */
			HomeTeamName,
			/* 客队名 */
			AwayTeamName,
			HomeTeamId,
			AwayTeamId,
			HomeIconUrl,
			AwayIconUrl,
		} = this.props.EventDetail;

		const {
			/* --- 当前选择的类型 -- */
			type,
			/* --- 即时情报数据 ---- */
			LiveInsightsSocketData,
			/* --- 赛前情报数据 ---- */
			PregameInsights,
			/* ----赛程-赛况数据 -------- */
			TimelineSockeMatchreSultData,
			/* 配置信息 */
			Vendor
		} = this.props;

		/**
		 * @description: 当前路线类型 公共组件
		 * @param {type = 0} 即时情报
		 * @param {type = 1} 赛况
		 * @param {type = 2} 阵容
		 * @param {type = 3} 赛前情报
		*/
		const setcss = {
			position: 'unset'
		};
		const setcss2 = {
			padding: '0'
		};
		if (type == 0) {
			console.log('%c即时情报', 'color:#e91e63;', LiveInsightsSocketData ? LiveInsightsSocketData : '======>没有数据');
		}
		if (type == 1) {
			console.log('%c赛况-赛程', 'color:#00bcd4;', TimelineSockeMatchreSultData ? TimelineSockeMatchreSultData : '======>没有数据');
		}
		if (type == 3) {
			console.log('%c赛前情报', 'color:#e400ff;', PregameInsights ? PregameInsights : '======>没有数据');
		}

		return (
			<div className="RealTimeCommunication">
				<div
					className="box"
					style={type == 0 ? setcss2 : type == 1 ? setcss : null}
					ref={(e) => (this._container = e)}
				>
					{/* -------------即时情报------------------ */}
					{type == 0 && (
						<div className="Live_Insights">
							{LiveInsightsSocketData && LiveInsightsSocketData != '' ? (
								LiveInsightsSocketData.slice(0, showmoreLiveInsightsSocketData).map((item, key) => {
									const { paragraph, parent_id, highlight, status_type } = item.data.insight;
									let T = parent_id.indexOf('-home') != -1;
									let Message =
										paragraph &&
										paragraph
											.replace(/##HomeTeamName##/g, HomeTeamName)
											.replace(/##AwayTeamName##/g, AwayTeamName)
											.replace(/##CompetitionName##/g, LeagueName.replace(/\*/g, ''));
									/*
										下方 status_type 类型
										START_TIME = 0;
										HALF_TIME = 1;
										FULL_TIME = 2;
										CORNER = 3;      角球
										YELLOW_CARD = 4; 黄牌
										RED_CARD = 5;    红牌
										PENALTY = 6;
										INJURY = 7;
										SUB = 8;         替补
										POSITIVE = 9;
										NEGATIVE = 10;
										NEUTRAL = 11;
										LIMITED_ALERT = 12;
										FREE_KICK = 13;
										GOAL = 14;       进球
									*/
									return (
										Message && (
											<div className="List" key={key}>
												<span className="Minutes">{item.data.minutes}'</span>
												<span className="Icon">
													{/* 黄牌 */}
													{status_type == 4 && (
														<ReactIMG src={'/img/smartcoach/card-yellow.svg'} className="card" />
													)}
													{/* 红牌 */}
													{status_type == 5 && (
														<ReactIMG src={'/img/smartcoach/card-red.svg'} className="card" />
													)}
													{/* 替补 */}
													{status_type == 8 && (
														<ReactIMG src={'/img/smartcoach/sub.svg'} className="sub card" />
													)}
													{/* 角球 */}
													{status_type == 3 && (
														<ReactIMG
															src={'/img/smartcoach/CORNER.svg'}
															className="CORNER card "
														/>
													)}
												</span>
												<span
													className="Message"
													dangerouslySetInnerHTML={{
														__html: this.ChangeMessage(Message, highlight)
													}}
												/>
											</div>
										)
									);
								})
							) : (
								type == 0 && <Skeleton />
							)}
							{LiveInsightsSocketData &&
							LiveInsightsSocketData.length > 5 &&
							type == 0 &&
							showmoreLiveInsightsSocketData && (
								<div
									className="show-more-btn"
									onClick={() => {
										this.setState({
											showmoreLiveInsightsSocketData: undefined
										});
									}}
								>
									<button style={{ width: '90%' }}>显示更多</button>
								</div>
							)}
						</div>
					)}

					{/* ------------------赛程-赛况--------------- */}
					{type == 1 && (
						<div>
							{TimelineSockeMatchreSultData && TimelineSockeMatchreSultData != '' ? (
								TimelineSockeMatchreSultData.slice(
									0,
									showmoreTimelineSockeMatchreSultData
								).map((item, key) => {
									const { minutes, livefeed } = item.data;
									const { text, side } = livefeed;
									let T = side == 1;
									let Message =
										text &&
										text
											.replace(/##HomeTeamName##/g, HomeTeamName)
											.replace(/##AwayTeamName##/g, AwayTeamName)
											.replace(/##CompetitionName##/g, LeagueName.replace(/\*/g, ''));
									return (
										Message && (
											<div className={T ? 'item left' : 'item right'} key={key}>
												<div className="title">
													<span className="number">{minutes}'</span>
												</div>
												<span className="message">
													<span
														dangerouslySetInnerHTML={{
															__html: this.ChangeMessage(Message)
														}}
													/>
												</span>
											</div>
										)
									);
								})
							) : (
								type == 1 && <Skeleton />
							)}
							{TimelineSockeMatchreSultData &&
							TimelineSockeMatchreSultData.length > 5 &&
							type == 1 &&
							showmoreTimelineSockeMatchreSultData && (
								<div
									className="show-more-btn"
									onClick={() => {
										this.setState({
											showmoreTimelineSockeMatchreSultData: undefined
										});
									}}
								>
									<button>显示更多</button>
								</div>
							)}
						</div>
					)}

					{/* ----------------赛前情报---------------------- */}
					{type == 3 && (
						<div>
							{PregameInsights && PregameInsights != '' ? (
								PregameInsights.slice(0, showmorePregameInsights).map((item, key) => {
									const { paragraph, parent_id, highlight } = item;
									let T = parent_id.indexOf('-home') != -1;
									let Message =
										paragraph &&
										paragraph
											.replace(/##HomeTeamName##/g, HomeTeamName)
											.replace(/##AwayTeamName##/g, AwayTeamName)
											.replace(/##CompetitionName##/g, LeagueName.replace(/\*/g, ''));
									return (
										Message && (
											<div className={T ? 'item left' : 'item right'} key={'s' + key}>
												<div className="title">
													<span className="number">50'</span>
													<LazyImageForTeam
														Vendor={Vendor}
														TeamId={T ? HomeTeamId : AwayTeamId}
														overflow={true}
														IconUrl={T ? HomeIconUrl : AwayIconUrl}
													/>
													<span className="name">{T ? HomeTeamName : AwayTeamName}</span>
												</div>
												<span className="message">
													<span
														dangerouslySetInnerHTML={{
															__html: this.ChangeMessage(Message, highlight)
														}}
													/>
												</span>
											</div>
										)
									);
								})
							) : (
								type == 3 && <Skeleton />
							)}
							{PregameInsights &&
							PregameInsights.length > 5 &&
							type == 3 &&
							showmorePregameInsights && (
								<div
									className="show-more-btn"
									onClick={() => {
										this.setState({
											showmorePregameInsights: undefined
										});
									}}
								>
									<button>显示更多</button>
								</div>
							)}
						</div>
					)}
				</div>
				<style jsx global>{`
					.RealTimeCommunication .message {
						border: ${type == 1 ? 'none !important' : null};
					}
					.RealTimeCommunication .number{
						display ${type == 3 ? 'none' : 'inline-block'};
					}
					.RealTimeCommunication .logo,.name{
						display ${type == 1 ? 'none' : 'inline-block'};
					}
				
				
				`}</style>
			</div>
		);
	}
}

export default RealTimeCommunication;

import React, { Component } from 'react';
import Tabs, { TabPane } from 'rc-tabs';
import { handicapData, ouData, singleData, cornerData, oeData, csData } from './mockBetData';
import { MockTitle, MockScoreBox } from '$SBTWO/Tutorial/commomUI';
import { ReactSVG } from '$SBTWO/ReactSVG';
import ReactIMG from '$SBTWO/ReactIMG';

class MockBetting extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeIndex: null,
			resultVisible: false,
			currentData: [],
			tabType: 'handicap'
		};
	}
	componentDidMount() {
		this.setState({
			currentData: handicapData
		});
	}
	getData = (type) => {
		switch (type) {
			case 'handicap':
				// Pushgtagdata(`Tutorial`, 'View', `Odds_Tutorial_让球`);
				return handicapData;
			case 'ou':
				// Pushgtagdata(`Tutorial`, 'View', `Odds_Tutorial_大小`);
				return ouData;
			case 'single':
				// Pushgtagdata(`Tutorial`, 'View', `Odds_Tutorial_独赢`);
				return singleData;
			case 'corner':
				// Pushgtagdata(`Tutorial`, 'View', `Odds_Tutorial_角球`);
				return cornerData;
			case 'oe':
				// Pushgtagdata(`Tutorial`, 'View', `Odds_Tutorial_单双`);
				return oeData;
			case 'cs':
				// Pushgtagdata(`Tutorial`, 'View', `Odds_Tutorial_波胆`);
				return csData;
			default:
				return [];
		}
	};
	mockBet = (i, idx) => {
		const { currentData } = this.state;

		this.setState({
			activeIndex: `${i}${idx}`,
			resultVisible: true,
			resultData: currentData[i][idx]
		});
	};
	onClickTabs = (key) => {
		this.setState({
			activeIndex: null,
			resultVisible: false,
			tabType: key,
			currentData: this.getData(key)
		});
	};
	resultUI = () => {
		const { resultData } = this.state;
		console.log(resultData);
		return (
			<React.Fragment>
				<div className="mockbet-result-title">投注结果</div>
				<div className="mockbet-result-main">
					<div className="mockbet-result-header">
						<div>
							投注：{resultData.teamName} {resultData.oddType} @{resultData.odd}
						</div>
						<ReactIMG src={`/img/tutorial/${resultData.imgType}.png`} />
					</div>
					<div className="mockbet-result-content">
						{resultData.content.map((val, idx) => {
							return (
								<div
									className="mockbet-result-item"
									dangerouslySetInnerHTML={{ __html: val }}
									key={idx}
								/>
							);
						})}
					</div>
				</div>
			</React.Fragment>
		);
	};
	contentUI = () => {
		const { activeIndex, currentData, tabType } = this.state;
		console.log(tabType);
		return (
			<React.Fragment>
				<MockTitle />
				<div style={{ background: '#fff', paddingBottom: '16px' }}>
					{tabType === 'corner' ? (
						<MockScoreBox leftScore="7" rightScore="5" />
					) : (
						<MockScoreBox leftScore="2" rightScore="0" />
					)}
					<div className="mock__game__wrap">
						<div className="table-Lines">
							{(tabType === 'handicap' || tabType === 'corner') && (
								<div className="table-column" style={{ flex: '0.1' }}>
									<div className="table-row">
										<ReactIMG src="/img/tutorial/teamHome.png" width="20" />
									</div>
									<div className="table-row">
										<ReactIMG src="/img/tutorial/teamAway.png" width="20" />
									</div>
								</div>
							)}
							{currentData.map((item, i) => {
								return (
									<React.Fragment key={i}>
										<div
											className={
												tabType === 'single' || tabType === 'oe' || tabType === 'cs' ? (
													'table-row'
												) : (
													'table-column'
												)
											}
										>
											{item.map((val, idx) => {
												return (
													<div
														className="table-item"
														onClick={() => this.mockBet(i, idx)}
														key={idx}
													>
														<div className={`list-set`}>
															<div
																className={`Game-indicators ${`${i}${idx}` ==
																activeIndex
																	? 'active'
																	: 'inactive'}`}
															>
																<small>
																	<span>{val.oddType}</span>
																</small>
																<b
																	className={`Number-black ${val.fluxType === 'up'
																		? 'NumberUp'
																		: ''} ${val.fluxType === 'down'
																		? 'NumberDown'
																		: ''}`}
																>
																	<span>{val.odd}</span>
																	{val.fluxType === 'up' && (
																		<ReactSVG
																			className="mockbet-numberSvg up"
																			src={'/img/svg/tutorial/up.svg'}
																		/>
																	)}
																	{val.fluxType === 'down' && (
																		<ReactSVG
																			className="mockbet-numberSvg down"
																			src={'/img/svg/tutorial/down.svg'}
																		/>
																	)}
																</b>
															</div>
														</div>
													</div>
												);
											})}
										</div>
									</React.Fragment>
								);
							})}
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	};
	render() {
		const { resultVisible, activeIndex, currentData } = this.state;
		return (
			<Tabs
				prefixCls="tabsNormal"
				className="tutorial-tabs"
				defaultActiveKey={this.state.tabType}
				onChange={this.onClickTabs}
			>
				<TabPane tab={`让球`} key="handicap">
					{this.contentUI()}
					{resultVisible && this.resultUI()}
				</TabPane>
				<TabPane tab={`大小`} key="ou">
					{this.contentUI()}
					{resultVisible && this.resultUI()}
				</TabPane>
				<TabPane tab={`独赢`} key="single">
					{this.contentUI()}
					{resultVisible && this.resultUI()}
				</TabPane>
				<TabPane tab={`角球`} key="corner">
					{this.contentUI()}
					{resultVisible && this.resultUI()}
				</TabPane>
				<TabPane tab={`单双`} key="oe">
					{this.contentUI()}
					{resultVisible && this.resultUI()}
				</TabPane>
				<TabPane tab={`波胆`} key="cs">
					{this.contentUI()}
					{resultVisible && this.resultUI()}
				</TabPane>
			</Tabs>
		);
	}
}

export default MockBetting;

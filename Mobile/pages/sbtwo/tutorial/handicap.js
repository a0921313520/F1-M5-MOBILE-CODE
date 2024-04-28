import React, { Component } from 'react';
import Layout from '$SBTWO/Layout';
import Tabs, { TabPane } from 'rc-tabs';
import MockBetting from '$SBTWO/Tutorial/mockBetting/index';
import HandicapTutorial from '$SBTWO/Tutorial/handicap/index';

import { ReactSVG } from '$SBTWO/ReactSVG';
import Service from '$SBTWO/Header/Service';

const tabExtraContent = {
	left: (
		<div className="">
			<ReactSVG
				className="back-icon"
				src="/img/svg/LeftArrow.svg"
				onClick={() => {
					sessionStorage.setItem('tutorial', 'handicap');
					history.go(-1);
				}}
			/>
		</div>
	),
	right: (
		<div
			className="header-tools-wrapper"
			onClick={() => {
				// Pushgtagdata(`LiveChat`, 'Launch', 'Odds_Tutorial_CS');
			}}
		>
			<Service />
		</div>
	)
};

export default class handicap extends Component {
	constructor(props) {
		super(props);
		this.state = {
			tabType: 1
		};
	}

	onClickTabs = (key) => {
		this.setState({
			tabType: key
		});
	};
	render() {
		return (
			<Layout status={0}>
				<div className={`information__main tutorial__wrap ${this.state.tabType === '2' ? 'betting-wrap' : ''}`}>
					<Tabs
						prefixCls="tabsOval"
						defaultActiveKey={this.state.tabType}
						onChange={this.onClickTabs}
						tabBarExtraContent={tabExtraContent}
					>
						<TabPane tab={<div className="notice_tab">盘口教程</div>} key="1">
							<HandicapTutorial />
						</TabPane>
						<TabPane tab={<div className="notice_tab">模拟投注</div>} key="2">
							<MockBetting />
						</TabPane>
					</Tabs>
				</div>
			</Layout>
		);
	}
}

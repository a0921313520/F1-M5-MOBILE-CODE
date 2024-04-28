import React, { Component } from 'react';
import Tabs, { TabPane } from 'rc-tabs';
import Handicap from './handicap';
import OU from './ou';
import Single from './single';
import Corner from './corner';
import OE from './oe';
import CS from './cs';

class HandicapTutorial extends Component {
	render() {
		return (
			<Tabs
				prefixCls="tabsNormal"
				className="tutorial-tabs"
				onChange={(k) => {
					let list = [ '让球', '大小', '独赢', '角球', '单双', '波胆' ];
					// Pushgtagdata(`Tutorial`, 'View', `Odds_Tutorial_${list[k]}`);
				}}
			>
				<TabPane tab={`让球`} key="0">
					<Handicap />
				</TabPane>
				<TabPane tab={`大小`} key="1">
					<OU />
				</TabPane>
				<TabPane tab={`独赢`} key="2">
					<Single />
				</TabPane>
				<TabPane tab={`角球`} key="3">
					<Corner />
				</TabPane>
				<TabPane tab={`单双`} key="4">
					<OE />
				</TabPane>
				<TabPane tab={`波胆`} key="5">
					<CS />
				</TabPane>
			</Tabs>
		);
	}
}

export default HandicapTutorial;

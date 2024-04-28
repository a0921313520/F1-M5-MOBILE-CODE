/*
 * @Author: Alan
 * @Date: 2022-05-15 13:51:41
 * @LastEditors: Alan
 * @LastEditTime: 2022-05-17 13:05:55
 * @Description: 我的优惠
 * @FilePath: \Mobile\src\components\Promotions\MyPromotions\index.js
 */
import React from 'react';
import Tabs, { TabPane } from 'rc-tabs';
import AppliedHistory from './AppliedHistory';
import AppliedFreebet from './AppliedFreebet';
class MyPromotionsHistory extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			HideInvalid: true
		};
	}

	render() {
		return (
			<div className="PromotionsTabs">
				<Tabs prefixCls="tabsNormal" defaultActiveKey="1" onChange={() => {}}>
					<TabPane tab="已申请优惠" key="1">
						<AppliedHistory />
					</TabPane>
					<TabPane tab="免费投注" key="2">
						<AppliedFreebet />
					</TabPane>
				</Tabs>
			</div>
		);
	}
}

export default MyPromotionsHistory;

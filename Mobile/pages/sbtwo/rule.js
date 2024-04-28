/*
 * @Author: Alan
 * @Date: 2022-10-28 13:49:32
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-30 18:50:26
 * @Description: 体育投注规则
 * @FilePath: \Mobile\pages\sbtwo\rule.js
 */
import React from 'react';
import Layout from '$SBTWO/Layout';
import { ReactSVG } from '$SBTWO/ReactSVG';
import Tabs, { TabPane } from 'rc-tabs';
import Collapse, { Panel } from 'rc-collapse';

export default class DepositPage extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			key: 'IM'
		};
	}

	componentDidMount() {
		window.addEventListener('message', this.scrollHandler, false);
	}

	scrollHandler = () => {
		//IM 投注规则 滚动条会失效，此方法解决滚动失效的问题
		if (event.data.siteHeight != undefined) {
			document.getElementsByTagName('iframe')[0].height = event.data.siteHeight;
		}
	};

	componentWillUnmount() {
		window.removeEventListener('message', this.scrollHandler);
	}

	render() {
		return (
			<Layout
				status={10}
				BarTitle={
					<div className="login__main header-bar-tabs">
						<Tabs
							prefixCls="tabsOvalLogin"
							onChange={(key) => {
								this.setState({ key });
							}}
						>
							<TabPane tab="IM" key="IM" />
							<TabPane tab="沙巴" key="SABA" />
							<TabPane tab="BTI" key="BTI" />
						</Tabs>
					</div>
				}
			>
				{this.state.key === 'BTI' ? (
					<div className="letiantang-rule-wrap">
						<iframe
							src="https://contents.masamiab.com/betting-rules/zh/"
							frameBorder="0"
							width="100%"
							height="100%"
							style={{ minHeight: 'calc(100vh - 1.3866666667rem)' }}
						/>
					</div>
				) : null}
				{this.state.key === 'IM' ? (
					<div className="-im-rule-wrap-">
						<iframe
							src="https://7xc9b5.skylgl.com/cn/"
							frameBorder="0"
							width="100%"
							height="100%"
							style={{ minHeight: 'calc(100vh - 1.3866666667rem)' }}
						/>
					</div>
				) : null}
				{this.state.key === 'SABA' ? (
					<div className="-saba-rule-wrap-">
						<iframe
							src="https://rrl.net2cast.com/cs/RnR.html"
							frameBorder="0"
							width="100%"
							height="100%"
							style={{ minHeight: 'calc(100vh - 1.3866666667rem)' }}
						/>
					</div>
				) : null}
			</Layout>
		);
	}
}

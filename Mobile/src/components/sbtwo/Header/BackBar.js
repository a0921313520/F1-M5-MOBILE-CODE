/*
 * @Author: Alan
 * @Date: 2022-10-28 13:49:34
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-30 16:44:01
 * @Description: 顶部
 * @FilePath: \Mobile\src\components\sbtwo\Header\BackBar.js
 */
import React from 'react';
import { ReactSVG } from '$SBTWO/ReactSVG';
import Router from 'next/router';
import Service from './Service';

class BackBar extends React.Component {
	constructor() {
		super();
		this.state = {};

		this.handleBackEvent = this.handleBackEvent.bind(this);
	}
	componentDidMount() {}
	handleBackEvent() {
		if (this.props.backEvent) {
			this.props.backEvent();
		} else {
			history.length ? history.go(-1) : Router.push('/sbtwo');
		}
	}
	render() {
		return (
			<div className="sbtwo-header-wrapper ">
				{!this.props.hideBack && (
					<ReactSVG className="back-icon" src="/img/svg/LeftArrow.svg" onClick={this.handleBackEvent} />
				)}

				<span>{this.props.title}</span>
				{this.props.hasServer ? (
					<div
						className="header-tools-wrapper"
						onClick={() => {
							// if (Router.router.pathname == '/sbtwo/transfer') {
							// 	Pushgtagdata(`LiveChat`, 'Launch', 'Transfer_CS');
							// } else if (Router.router.pathname == '/sbtwo/information') {
							// 	Pushgtagdata(`LiveChat`, 'Launch', 'Notification_CS');
							// } else if (Router.router.pathname == '/sbtwo/tutorial/bet') {
							// 	Pushgtagdata(`LiveChat`, 'Launch', 'Bet_Tutorial_CS');
							// }
						}}
					>
						<Service />
					</div>
				) : (
					<div />
				)}
			</div>
		);
	}
}

export default BackBar;

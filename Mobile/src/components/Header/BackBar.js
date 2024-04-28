/*
 * @Author: Alan
 * @Date: 2022-03-07 11:49:02
 * @LastEditors: Alan
 * @LastEditTime: 2023-01-05 00:48:42
 * @Description: 头部
 * @FilePath: \Mobile\src\components\Header\BackBar.js
 */
import React from 'react';
import { ReactSVG } from '@/components/View/ReactSVG';
import Router from 'next/router';
import Service from './Service';
import ReactIMG from '@/components/View/ReactIMG';
import Vipcustomerservice from '@/components/Header/Vipcustomerservice';
class BackBar extends React.Component {
	constructor() {
		super();
		this.state = {
			feedbackModal: false,
			isVIP: false
		};

		this.handleBackEvent = this.handleBackEvent.bind(this);
	}
	componentDidMount() {
		if (!!localStorage.getItem('memberInfo') && JSON.parse(localStorage.getItem('memberInfo')).isVIP) {
			this.setState({ isVIP: true });
		}
		if (Router.router.pathname == '/event_CNY2023') {
			this.setState({
				HeaderBarColor: '#E61F29'
			});
		} else {
			this.setState({
				HeaderBarColor: '#00A6FF'
			});
		}
	}
	handleBackEvent() {
		if (this.props.backEvent) {
			this.props.backEvent();
		} else {
			history.length ? history.go(-1) : Router.push('/');
		}
	}
	render() {
		const { feedbackModal, isVIP, HeaderBarColor } = this.state;
		const {addToLeft, wrapClassName} = this.props;
		return (
			<div
				style={{
					backgroundColor: HeaderBarColor
				}}
				className={`header-wrapper header-bar ${wrapClassName||""}`}
			>
				{!this.props.hideBack && (
					<ReactSVG className="back-icon" src="/img/svg/LeftArrow.svg" onClick={this.handleBackEvent} />
				)}

				<span className="Header-title">{this.props.title}</span>
				{addToLeft && addToLeft}
				{isVIP ? (
					<div
						className="vip-customer-service"
						onClick={() => {
							this.setState({ feedbackModal: true });
						}}
					>
						<ReactIMG src="/img/P5/icon/Icon_VIPCS.png" />
					</div>
				) : null}
				{this.props.hasServer ? (
					<div
						className="header-tools-wrapper"
						onClick={() => {
							if(Router.router.pathname === "/Verify"){
								Pushgtagdata(`OTP_Verfication`, 'Contact CS', 'OTP_Verfication_C_CS');
							}
							// if (Router.router.pathname == '/deposit') {
							// 	// Pushgtagdata(`LiveChat`, 'Launch', 'Deposit_CS');
							// } else if (Router.router.pathname == '/Transfer') {
							// 	// Pushgtagdata(`LiveChat`, 'Launch', 'Transfer_CS');
							// } else if (Router.router.pathname == '/notification') {
							// 	// Pushgtagdata(`LiveChat`, 'Launch', 'Notification_CS');
							// } else if (Router.router.pathname == '/tutorial/bet') {
							// 	// Pushgtagdata(`LiveChat`, 'Launch', 'Bet_Tutorial_CS');
							// }
						}}
					>
						<Service />
					</div>
				) : null}
				<Vipcustomerservice
					visible={feedbackModal}
					onCloseModal={() => {
						this.setState({ feedbackModal: false });
					}}
				/>
			</div>
		);
	}
}

export default BackBar;

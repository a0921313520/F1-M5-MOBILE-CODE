/*
 * @Author: Alan
 * @Date: 2022-06-07 14:16:36
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-07 15:19:25
 * @Description: 验证限制页面
 * @FilePath: \Mobile\src\components\OTP\VerifyLimit.js
 */
import React, { Component } from 'react';
import Modal from '@/components/View/Modal';
import Router from 'next/router';
import Service from '@/components/Header/Service';
import { ReactSVG } from '@/components/View/ReactSVG';
import ReactIMG from '@/components/View/ReactIMG';

class LimitModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			ProviderGames: [],
			gameTypeDetail: ''
		};
	}
	closeOverTheLimitModal() {
		Router.push(this.props.RouterUrl);
	}
	render() {
		const { phoneTryLimit } = this.props;
		
		return (
			<Modal
				className="verify__notice__modal"
				visible={phoneTryLimit}
				onCancel={() => {
					this.closeOverTheLimitModal();
				}}
				closable={false}
				animation={false}
				mask={false}
			>
				<div className="header-wrapper header-bar">
					<ReactSVG
						className="back-icon"
						src="/img/svg/LeftArrow.svg"
						onClick={() => {
							this.closeOverTheLimitModal();
						}}
					/>
					<span>超过尝试次数</span>
					<div className="header-tools-wrapper">
						<Service />
					</div>
				</div>
				<div className="verify__overTime">
					<ReactIMG src="/img/verify/warn.png" />
					<div className="verify__overTime__title">超过尝试次数</div>
					<div className="verify__overTime__desc">您已超过5次尝试，请24小时后再试。或联系我们的在线客服进行验证。</div>
				</div>
			</Modal>
		);
	}
}

export default LimitModal;

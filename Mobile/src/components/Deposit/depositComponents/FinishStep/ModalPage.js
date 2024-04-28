/*
 * @Author: Alan
 * @Date: 2022-08-04 15:58:32
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-14 00:03:13
 * @Description: 头部注释
 * @FilePath: \Mobile\src\components\Deposit\depositComponents\FinishStep\ModalPage.js
 */
import React, { Component } from 'react';
import Modal from '@/components/View/Modal';
import BackBar from '@/components/Header/BackBar';
import Page from './index';
import Router from 'next/router';

export default class index extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { visible, closeModal, FinishRes } = this.props;
		return (
			<Modal
				visible={visible}
				transparent
				maskClosable={false}
				closable={false}
				title={
					<BackBar
						key="main-bar-header"
						title={FinishRes.title}
						backEvent={() => {
							closeModal();
						}}
						hasServer={false}
					/>
				}
				className={'Fullscreen-Modal Question-Modal'}
			>
				<Page
					closeModal={() => {
						Router.push('/');
					}}
					transactionId={FinishRes.transactionId}
					depositMoney={FinishRes.amount}
					time="10:00"
				/>
			</Modal>
		);
	}
}

/*
 * @Author: Alan
 * @Date: 2022-03-07 11:49:02
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-26 16:58:29
 * @Description: 消息详情
 * @FilePath: \Mobile\src\components\Message\MessageDetail.js
 */
import React from 'react';
import MessageDetailItem from '@/components/notification/MessageDetailItem';
import Modal from '@/components/View/Modal';
import { ReactSVG } from '@/components/View/ReactSVG';

export default function MessageDetail(props) {
	console.log(props);
	return (
		<Modal className="message__modal" visible={props.isShowDetail} onClose={props.onClose} closable={false}>
			<div className="header-wrapper header-bar">
				<ReactSVG className="back-icon" src="/img/svg/LeftArrow.svg" onClick={props.onClose} />
				<span>Thông Tin</span>
			</div>
			<MessageDetailItem
				getMessageIcon={props.getMessageIcon}
				data={props.data}
				detailTime={props.detailTime}
				type={props.type}
			/>
		</Modal>
	);
}

/*
 * @Author: Alan
 * @Date: 2022-03-07 11:49:02
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-27 23:19:44
 * @Description: 消息详情
 * @FilePath: \Mobile\src\components\Message\MessageDetailItem.js
 */
import React from 'react';
import Flexbox from '@/components/View/Flexbox/';
import moment from 'moment';

export default function MessageDetailItem(props) {
	const OptionName = (item) => {
		if (props.type == '2') {
			switch (item.newsTemplateCategory) {
				case 1:
				case 10:
					return '其他';
				case 3:
				case 9:
					return '优惠';
				case 8:
					return '产品';
				case 2:
				case 7:
					return '个人';
				default:
					return '其他';
			}
		} else if (props.type == '1') {
			switch (item.messageTypeOptionID) {
				case 1:
					return '一般';
				case 2:
					return '优惠';
				case 3:
					return '存款';
				case 4:
					return '转账';
				case 5:
					return '提款';
				case 6:
					return '红利';
				case 11:
					return '免费投注';
				case 12:
					return '存款验证';
				default:
					return '其他';
			}
		} else {
			return '其他';
		}
	};
	let Type = props.data.messageTypeName === "Personal" 
							? "Personal"
							: props.type === "1" 
							? "Transaction"
							: "Announcement"
	console.log('内容------------->', props);
	return (
		<div className="message__main">
			<div className="message__main__title">
				<Flexbox style={{gap:"5px"}}>
					<Flexbox className={props.getMessageIcon(Type, props.data)} flex="0 0 15%" />
					<Flexbox flexFlow="column" justifyContent="space-around" flex="1">
						<Flexbox alignItems="start" className="heading-box">
							<h3>
								{props.data.messageTypeName!=="Personal" && <span>[{OptionName(props.data)}]</span>}
								{props.type === '2' ? props.data.topic : props.data.title}
							</h3>
						</Flexbox>
						<small>
							{props.data.sendOn ? moment(new Date(new Date(props.data.sendOn).setHours(new Date(props.data.sendOn).getHours()+8))).format('YYYY/MM/DD HH:mm') : ''}
						</small>
					</Flexbox>
				</Flexbox>
			</div>

			<div
				className="message__main__content"
				dangerouslySetInnerHTML={{
					__html: props.data.content
				}}
			/>
		</div>
	);
}

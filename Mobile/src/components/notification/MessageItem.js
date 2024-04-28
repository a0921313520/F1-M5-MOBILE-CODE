/*
 * @Author: Alan
 * @Date: 2022-03-07 11:49:02
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-27 22:51:33
 * @Description: 消息中心
 * @FilePath: \Mobile\src\components\Message\MessageItem.js
 */
import React from 'react';
import moment from 'moment';

const getTitle = (props) => {
	console.log(props);
	if (props.type === 'Announcement') {
		return props.item.topic;
	} else if (props.type === 'Transaction') {
		return props.item.title;
	} else {
		return props.item.title;
	}
};

/**
 * @description: 
 * @param {*} props
 * @return {*}
 * 	0	All			全部 
 *	1	Normal 		普通
 *  2	Special		特殊
 *  3	Promotions	优惠
 *  7	Banking		银行
 *  8	Products	产品
 *  9	Promotions (New) 
 *  10	General		一般
 */
const OptionName = (props) => {
	console.log(props);
	if (props.type === 'Announcement') {
		switch (props.item.newsTemplateCategory) {
			case 1:
			case 10:
				return 'Khác';
			case 3:
			case 9:
				return 'Ưu đãi';
			case 8:
				return 'Sản phẩm';
			case 2:
			case 7:
				return 'Cá nhân';
			default:
				return 'Khác';
		}
	} else if (props.type === 'Transaction') {
		switch (props.item.messageTypeOptionID) {
			case 1:
				return '一般';
			case 2:
				return '优惠';
			case 3:
				return 'Gửi tiền';
			case 4:
				return 'Chuyển quỹ';
			case 5:
				return 'Rút tiền';
			case 6:
				return '红利';
			case 11:
				return '免费投注';
			case 12:
				return '存款验证';
			default:
				return 'Khác';
		}
	} else {
		return 'Khác';
	}
};

const titleColor = {
	'Gửi tiền': '#FFA95C',
	'Chuyển quỹ': '#30D1F9',
	'Rút tiền': '#D97AFC',
	'Khác': '#78909C',
	'Ưu đãi': '#F44729',
	'Sản phẩm': '#BB1EB3',
	'Cá nhân': '#3E84FF'
};

export default function MessageItem(props) {
	console.log(props);
	return (
		<div
			key={props.type === 'Announcement' ? props.item.announcementID : props.item.memberNotificationID}
			className={'information__box__item'}
			onClick={() => props.goDetail(props.type, props.item)}
		>
			<div className={props.getMessageIcon(props.type, props.item)}>
				{!props.item.isRead && <i className="isRead" />}
			</div>
			<div className="information__item__mid">
				<div className="information__mid__title">
					<span className="information__title">
						{props.type !=="Personal" && <span style={{color: titleColor[OptionName(props)]}} className="label">[{OptionName(props)}]</span>}
						{getTitle(props)}
					</span>
					<span className="information__time">
						{props.item.sendOn ? moment(new Date(new Date(props.item.sendOn).setHours(new Date(props.item.sendOn).getHours()+8))).format('YYYY/MM/DD HH:mm') : ''}
					</span>
				</div>
				<div
					className={
						props.type === 'Transaction' ? 'information__content Transfer_content ' : 'information__content'
					}
					dangerouslySetInnerHTML={{
						__html: props.item.content || props.item.title
					}}
				/>
			</div>
			{/* {props.type !== 'Transaction' && <ReactSVG src="/svg/RightArrow.svg" />} */}
		</div>
	);
}

/*
 * @Author: Alan
 * @Date: 2022-04-11 23:02:39
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-29 23:15:18
 * @Description: 上传文件的状态
 * @FilePath: \Mobile\src\components\Me\Uploadfiles\Status.js
 */
import React, { Component } from 'react';
import { ReactSVG } from '@/components/View/ReactSVG';
import Flexbox from '@/components/View/Flexbox/';
import Router from 'next/router';

export default class UploadStatus extends Component {
	render() {
		/**
		*@param {StatusId}
		*@type {0}  @description 默认0  @description 没有附件
		*@type {1}  @description 默认1	@description 处理中
		*@type {2}  @description 默认2	@description 批准
		*@type {3}  @description 默认3	@description 拒绝
		*/
		const { StatusId, CloseStatus, RemainingUploadTries } = this.props;
		return (
			<Flexbox className="StatusBox">
				{StatusId == 1 && (
					<Flexbox flexFlow="column" alignItems="center" width="100%">
						<ReactSVG src={'/img/svg/docpadding.svg'} />
						<h2>Đang Xử lý</h2>
						<p className="note">Tài liệu của bạn đang được xử lý</p>
						<button
							onClick={() => {
								CloseStatus();
							}}
						>
							Đóng
						</button>
					</Flexbox>
				)}

				{StatusId == 2 && (
					<Flexbox flexFlow="column" alignItems="center" width="100%">
						<ReactSVG src={'/img/svg/docdone.svg'} />
						<h2>Xác Thực Thành Công</h2>
						<p className="note">Tài liệu của bạn đã được xác thực thành công</p>
						<button
							onClick={() => {
								CloseStatus();
							}}
						>
							Đóng
						</button>
					</Flexbox>
				)}

				{StatusId == 3 && (
					<Flexbox flexFlow="column" alignItems="center" width="100%">
						<ReactSVG src={'/img/svg/docnot.svg'} />
						<h2>Xác Thực Thất Bại</h2>
						{RemainingUploadTries != 0 ? (
							<React.Fragment>
								<p className="note">Tài liệu của bạn được xác thực không thành công</p>
								<p className="note" style={{ marginTop: '10px' }}>
									Còn ({<span className="blue">{RemainingUploadTries}</span>}) lần thử
								</p>
								<button
									style={{background: '#0CCC3C'}}
									onClick={() => {
										CloseStatus(RemainingUploadTries);
									}}
								>
									Thử Lại
								</button>
								<button
									onClick={() => {
										CloseStatus();
									}}
								>
									Đóng
								</button>
							</React.Fragment>
						) : (
							<React.Fragment>
								<p className="note">Bạn đã vượt quá 3 lần xác thực. Vui lòng liên hệ Live Chat</p>
								<p className="note" style={{ marginTop: '10px' }}>
								 Còn (<span className="blue">0</span>) lần thử
								</p>
								<button
									onClick={() => {
										CloseStatus();
									}}
								>
									Đóng
								</button>
							</React.Fragment>
						)}
					</Flexbox>
				)}
			</Flexbox>
		);
	}
}

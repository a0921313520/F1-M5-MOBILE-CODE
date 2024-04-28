/*
 * @Author: Alan
 * @Date: 2022-06-10 14:20:37
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-21 13:47:06
 * @Description: App
 * @FilePath: \Mobile\src\components\Header\AppDownloadPopup.js
 */

//sb2.0合併後 廢棄 改成直接開app

import Modal from '@/components/View/Modal';
import { ReactSVG } from '@/components/View/ReactSVG';
import HostConfig from '@/server/Host.config';
import React from 'react';
import { getAffParam } from '@/lib/js/Helper';
import ReactIMG from '@/components/View/ReactIMG';

class AppDownloadPopup extends React.Component {
	render() {
		return this.props.visible ? (
			<Modal
				closable={false}
				wrapClassName="appd-modal-wrapper"
				className="appd-modal"
				visible={this.props.visible}
			>
				<div className="appdm-container">
					<ReactIMG src="/img/appheader.webp" className="appdm-header" />
					<div className="appdm-content">
						<div className="appdm-row appdm-row2">
							<ReactIMG src="/img/appdb-icon.png" className="appdm-row-icon" />
							<div className="appdm-row-desc">
								<div className="appdm-row-desc-line1">乐天堂FUN88</div>
								<div className="appdm-row-desc-line2">行业领先游戏竞技平台</div>
							</div>
							<div
								className="appdm-row-button"
								onClick={() => {
									const affParam = getAffParam();
									window.location.href = '/vn/mobile/Appinstall.html' + affParam;
								}}
							>
								获取
							</div>
						</div>
						<div className="appdm-row">
							<ReactIMG src="/img/sportsAPP.webp" className="appdm-row-icon" />
							<div className="appdm-row-desc">
								<div className="appdm-row-desc-line1">乐体育</div>
								<div className="appdm-row-desc-line2">专注更多精彩体育赛事</div>
							</div>
							<div
								className="appdm-row-button"
								onClick={() => {
									const affParam = getAffParam();
									window.location.href =
										'https://sbone.fun88asia.com' + '/Appinstall.html' + affParam;
								}}
							>
								获取
							</div>
						</div>
					</div>
				</div>
				<div className="appdm-close-button-wrapper">
					<ReactSVG className="appdm-close-button" src="/img/svg/appdm-close.svg" onClick={this.props.onClose} />
				</div>
			</Modal>
		) : null;
	}
}

export default AppDownloadPopup;

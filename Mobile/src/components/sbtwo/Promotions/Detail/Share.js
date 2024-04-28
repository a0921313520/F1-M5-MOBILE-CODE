/* Nami賽事分析 */

import React from 'react';
import Toast from '$SBTWO/Toast';
import ReactModal from 'react-modal';
import { ReactSVG } from '@/components/View/ReactSVG';
import LazyImageForTeam from '$SBTWO/LazyLoad/LazyImageForTeam';
import { getAffParam } from '$SBTWOLIB/js/Helper';
import QRCode from 'qrcode.react';
import copy from 'copy-to-clipboard';
//import { toCanvas } from 'html-to-image'; //不要用html-to-image 在低版本safari(小於16)會有問題
import html2canvas from 'html2canvas';
import moment from 'moment';
const download = require('downloadjs');

ReactModal.setAppElement('#__next');

class SbShare extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showVsPopup: false //是否展示彈窗
		};
	}

	componentDidMount() {}

	//獲取分享鏈接
	getShareUrl = (EventData) => {
		if (typeof window !== 'undefined') {
			//mobile額外增加帶上affcode
			let affParam = getAffParam();
			if (affParam && affParam.length > 0) {
				affParam = affParam.replace('?', '&'); //開頭的問號換成&
			}
			return (
				window.location.origin +
				process.env.BASE_PATH +
				`/sbtwo/share/?deeplink=promo&pid=${EventData.promoId}${affParam}`
			);
		}
		return '';
	};

	//複製分享鏈接
	copyShareUrl = (shareUrl) => {
		copy(shareUrl);
		Toast.success('链接已复制');
	};

	//下載分享圖片
	downloadShareImage = async (EventData) => {
		html2canvas(document.querySelector('#GameDetailSharePopupShareBox'), { useCORS: true })
			.then((canvas) => {
				download(canvas.toDataURL('image/png'), `${EventData.promoTitle}.png`);
				Toast.success('图片已下载');
			})
			.catch((err) => {
				console.log(err);
			});
	};

	render() {
		const { EventDetail, isShowSharePopup } = this.props;
		const shareUrl = this.getShareUrl(EventDetail);
		return (
			<ReactModal
				isOpen={isShowSharePopup}
				className="GameDetailSharePopup"
				overlayClassName="GameDetailSharePopupOverlay"
			>
				{isShowSharePopup && EventDetail ? (
					<React.Fragment>
						<div className="GameDetailSharePopupTopBox">
							<div className="GameDetailSharePopupShareBox" id="GameDetailSharePopupShareBox">
								<div className="PromsDetailSharePopupShareBoxTop">
									<img src={EventDetail.image} />
								</div>
								<div className="GameDetailSharePopupShareBoxBottom">
									<div className="GameDetailSharePopupShareBoxBottomLeft">
										<div className="ShareLeagueName2">{EventDetail.promoTitle}</div>
										<div className="TimeShow">
											<p>活动时间（北京时间）：</p>
											<p>
												{moment(new Date(EventDetail.dateRange.split('-')[0])).format(
													'YYYY年MM月DD日'
												) + EventDetail.dateRange.split('-')[1]}{' '}
												至
											</p>
											<p>
												{moment(new Date(EventDetail.dateRange.split('-')[2])).format(
													'YYYY年MM月DD日'
												) + EventDetail.dateRange.split('-')[3]}
											</p>
										</div>
									</div>
									<div className="GameDetailSharePopupShareBoxBottomRight">
										<QRCode value={shareUrl} renderAs="canvas" size={75} />
									</div>
								</div>
							</div>
						</div>
						<div className="GameDetailSharePopupBottomBox PromsBoxBottom">
							<div className="GameDetailSharePopupBottomBoxTop">
								<div
									className="ShareButtonBox"
									onClick={() => {
										this.copyShareUrl(shareUrl);
									}}
								>
									<div className="ShareButton">
										<ReactSVG src="/img/svg/shareCopy.svg" />
									</div>
									<div className="ShareText">复制链接</div>
								</div>
								<div
									className="ShareButtonBox"
									onClick={() => {
										this.downloadShareImage(EventDetail);
									}}
								>
									<div className="ShareButton">
										<ReactSVG src="/img/svg/shareDownload.svg" />
									</div>
									<div className="ShareText">下载图片</div>
								</div>
							</div>
							<div className="GameDetailSharePopupBottomBoxBottom ">
								<div className="ShareCancelText" onClick={this.props.hideSharePopup}>
									取消
								</div>
								<div className="ShareCancelBar">&nbsp;</div>
							</div>
						</div>
					</React.Fragment>
				) : null}
			</ReactModal>
		);
	}
}

export default SbShare;

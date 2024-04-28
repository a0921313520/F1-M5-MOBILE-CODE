import Modal from "$SBTWO/Modal";
import { ReactSVG } from "$SBTWO/ReactSVG";
import HostConfig from "@/server/Host.config";
import React from "react";
import { getAffParam } from "$SBTWOLIB/js/Helper";
import ReactIMG from '$SBTWO/ReactIMG';

class AppDownloadPopup extends React.Component {
	render() {
		return this.props.visible ?
			<Modal
				closable={false}
				wrapClassName="sbtwo-appd-modal-wrapper"
				className="appd-modal"
				visible={this.props.visible}
			>
				<div className="appdm-container">
					<ReactIMG src="/img/appdm-header.png" className="appdm-header"/>
					<div className="appdm-content">
						<div className="appdm-row">
							<ReactIMG src="/img/appdb-icon.png" className="appdm-row-icon"/>
							<div className="appdm-row-desc">
								<div className="appdm-row-desc-line1">乐天堂FUN88</div>
								<div className="appdm-row-desc-line2">亚洲领先体育投注平台</div>
							</div>
							<div className="appdm-row-button" onClick={() => {
								const affParam = getAffParam();
								window.location.href = process.env.BASE_PATH + '/Appinstall.html' + affParam;
							}}>获取</div>
						</div>
					</div>
				</div>
				<div className="appdm-close-button-wrapper">
					<ReactSVG className="appdm-close-button" src="/img/svg/appdm-close.svg" onClick={this.props.onClose} />
				</div>
			</Modal>
		:null;
	}
}

export default AppDownloadPopup;

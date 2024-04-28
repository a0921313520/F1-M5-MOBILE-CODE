
import React from "react";
import Toast from '$SBTWO/Toast'
import { fetchRequest } from "$SBTWOLIB/SportRequest";
import { ApiPort } from "$SBTWOLIB/SPORTAPI";
import { Cookie } from "$SBTWOLIB/js/Helper";
import HostConfig from "@/server/Host.config";

class Service extends React.Component {
	constructor() {
		super();
		this.state = {
        };
        this.FUN88Live = null;
    }
    PopUpLiveChat = () => {
        this.FUN88Live && this.FUN88Live.close();
        this.FUN88Live = window.open(
            'about:blank',
            'chat',
            'toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=540, height=650'
        );
        fetchRequest(ApiPort.GETLiveChat).then((res) => {
            console.log(res)
            if (res) {
                localStorage.setItem('serverUrl', res.result);
                this.openServer(res.result);
            }
        });
    }
    openServer = (serverUrl) => {
        this.FUN88Live.document.title = 'FUN88在线客服';
        this.FUN88Live.location.href = serverUrl;
        this.FUN88Live.focus();
    }
	render() {

	  global.PopUpLiveChat = () => { this.PopUpLiveChat() }

		return (
            <div
				className="sport-sprite sport-service"
				onClick={this.PopUpLiveChat}
			>
				{/* 客服按钮 */}
			</div>
		);
	}
}

export default Service;

/*
 * @Author: Alan
 * @Date: 2022-03-14 16:07:12
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-28 00:46:24
 * @Description: 客服
 * @FilePath: \Mobile\src\components\Header\Service.js
 */
import React from 'react';
import Toast from '@/components/View/Toast'
import { fetchRequest } from "@/server/Request";
import { ApiPort } from "@/api/index";
import { Cookie } from "@/lib/js/Helper";
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
            //console.log(res)
            if (res.isSuccess) {
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
        const {pushPiwik} = this.props;
		return (
            <div
				className="sport-sprite sport-service"
				onClick={()=> {
                    pushPiwik && pushPiwik();
                    this.PopUpLiveChat();
                }}
			>
				{/* 客服按钮 */}
			</div>
		);
	}
}

export default Service;
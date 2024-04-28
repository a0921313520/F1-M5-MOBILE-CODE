/*
 * @Author: Alan
 * @Date: 2022-02-07 11:24:10
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-13 14:56:50
 * @Description: 打开乐天堂App
 * @FilePath: \Mobile\src\components\Me\DynamicOpenApp.js
 */
import React, { Component } from 'react';
import CallApp from 'callapp-lib';
import { getAffParam } from '@/lib/js/Helper';
import copy from 'copy-to-clipboard';

class CallApplib extends React.Component {
	componentDidMount() {
		const affParam = getAffParam();

		const callAppOptions = {
			scheme: {
				protocol: 'f1m1p5'
			},
			appstore: '/vn/mobile/Appinstall.html' + affParam,
			fallback: '/vn/mobile/Appinstall.html' + affParam,
			timeout: 2000
		};

		global.callApplib = new CallApp(callAppOptions);
		global.Copyaffcode = () => this.Copyaffcode();
	}

	//复制代理码
	Copyaffcode() {
		const affParam = getAffParam();
		if (affParam) {
			let ops = {};
			let affcode = affParam.split('?')[1].split('&').map((i) => (ops[i.split('=')[0]] = i.split('=')[1]));
			if (affcode) {
				copy('affcode&' + affcode);
			}
		}
	}

	render() {
		return null;
	}
}

export default CallApplib;

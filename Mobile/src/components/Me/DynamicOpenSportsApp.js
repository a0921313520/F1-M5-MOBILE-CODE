/*
 * @Author: Alan
 * @Date: 2022-02-07 11:24:10
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-28 21:25:53
 * @Description: 打开体育App
 * @FilePath: \Mobile\src\components\Me\DynamicOpenSportsApp.js
 */
import React, { Component } from 'react';
import CallApp from 'callapp-lib';
import { getAffParam } from '@/lib/js/Helper';
class CallApplib extends React.Component {
	componentDidMount() {
		const affParam = getAffParam();
		//let StagingTest = Boolean([ 'p5stag.fun88.biz' ].find((v) => global.location.href.includes(v)));
		let domain = 'https://sbone.' + location.host.split('.').slice(-2).join('.');
		const callAppOptions = {
			scheme: {
				protocol: 'sb20'
			},
			appstore: domain + '/Appinstall.html' + affParam,
			fallback: domain + '/Appinstall.html' + affParam,
			timeout: 2000
		};

		global.callSportsApplib = new CallApp(callAppOptions);
	}

	render() {
		return null;
	}
}

export default CallApplib;

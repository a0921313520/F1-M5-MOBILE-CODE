/*
 * @Author: Alan
 * @Date: 2022-03-28 13:53:18
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-28 01:02:41
 * @Description: 发送短信验证页面 手机和邮箱
 * @FilePath: \Mobile\pages\Verify\index.js
 */
import React, { Component } from 'react';
import dynamic from 'next/dynamic';
const Verify = dynamic(import('@/components/Verify/'), { ssr: false });
export default class VerifyPage extends Component {
	render() {
		return <Verify />;
	}
}

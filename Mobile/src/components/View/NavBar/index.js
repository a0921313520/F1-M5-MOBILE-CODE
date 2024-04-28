/*
 * @Author: Alan
 * @Date: 2022-03-29 21:28:29
 * @LastEditors: Alan
 * @LastEditTime: 2022-04-10 15:27:35
 * @Description: 导航栏
 * @FilePath: \Mobile\src\components\NavBar\index.js
 */
import React, { Component } from 'react';
export default class navbar extends Component {
	render() {
		const { leftContent, centerContent, rightContent } = this.props;
		return (
			<div id="nav-bar">
				<div className="nav-left">{leftContent}</div>
				<div className="nav-center">{centerContent}</div>
				<div className="nav-right">{rightContent}</div>
			</div>
		);
	}
}

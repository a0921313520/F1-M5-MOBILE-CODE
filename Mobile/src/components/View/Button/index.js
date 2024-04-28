/*
 * @Author: Alan
 * @Date: 2022-05-11 18:17:51
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-28 00:50:21
 * @Description: 按钮组件
 * @FilePath: \Mobile\src\components\View\Button\index.js
 */
import { ReactSVG } from '@/components/View/ReactSVG';
import button from './button.module.scss';
import React from 'react';
export default class Button extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.filterProps = {};
		Object.keys(this.props).forEach((v) => {
			if (!~[ 'ghost', 'inline', 'radius', 'loading' ].indexOf(v)) {
				this.filterProps[v] = this.props[v];
			}
		});
	}
	componentDidMount() {}
	render() {
		return (
			<button
				{...this.filterProps}
				disabled={this.props.disabled}
				className={`${button.sportBtn} ${this.props.ghost ? button.ghost : ''} ${this.props.radius
					? button.radius
					: ''} ${this.props.loading ? button.loading : ''} ${this.props.inline ? button.inline : ''}${this
					.props.className
					? ' ' + this.props.className
					: ''}`}
			>
				<span>
					{this.props.loading ? <ReactSVG className="loading" src="/img/svg/loading.svg" /> : null}
					{this.props.children}
				</span>
				{this.props.fufix ? this.props.fufix : null}
			</button>
		);
	}
}

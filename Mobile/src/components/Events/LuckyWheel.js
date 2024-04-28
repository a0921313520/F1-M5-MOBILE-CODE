/*
 * @Author: Alan
 * @Date: 2022-08-28 21:39:58
 * @LastEditors: Alan
 * @LastEditTime: 2022-09-01 21:16:13
 * @Description: 大转盘活动
 * @FilePath: \Mobile\src\components\Events\LuckyWheel.js
 */
import React from 'react';
import Flexbox from '@/components/View/Flexbox/';
import PropTypes from 'prop-types';
class Lottery extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			angle: 0,
			off: 1,
			WebkitTransform: '',
			WebkitTransition: ''
		};
		this.rotateRef = React.createRef();
	}

	componentDidMount() {
		console.log(this.props.bg);
	}

	start = (index, fn) => {
		if (!this.state.off) return;
		this.setState({
			off: 0
		});
		this.setState(
			{
				WebkitTransform: `rotateZ(${this.props.reset ? 0 : 360 - this.state.angle}deg)`,
				WebkitTransition: `-webkit-transform 0ms cubic-bezier(0.35, -0.005, 0.565, 1.005) 0s`,
				angle: 360 / this.props.size * index
			},
			() => {
				setTimeout(() => {
					this.setState({
						WebkitTransform: `rotateZ(${3600 - this.state.angle}deg)`,
						WebkitTransition: `-webkit-transform ${this.props.time ||
							4000}ms cubic-bezier(0.35, -0.005, 0.565, 1.005) 0s`
					});
				}, 25);
			}
		);
		let endFn = () => {
			this.rotateRef.current.removeEventListener('webkitTransitionEnd', endFn);
			fn && fn(index);
			this.setState({
				off: 1
			});
		};
		this.rotateRef.current.addEventListener('webkitTransitionEnd', endFn);
	};
	render() {
		return (
			<Flexbox
				className="LotteryBox"
				justifyContent="center"
				alignItems="center"
				style={{ width: this.props.width || '300px', height: this.props.height || '300px' }}
			>
				<div
					className="lotteryBg"
					ref={this.rotateRef}
					style={{
						backgroundImage: `url(${`${this.props.bg}`})`,
						WebkitTransform: this.state.WebkitTransform,
						WebkitTransition: this.state.WebkitTransition
					}}
				/>
				{this.props.children}
			</Flexbox>
		);
	}
}
Lottery.propTypes = {
	size: PropTypes.any.isRequired,
	bg: PropTypes.any.isRequired
};
export default Lottery;

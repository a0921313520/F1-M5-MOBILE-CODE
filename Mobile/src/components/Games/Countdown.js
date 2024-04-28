/*
 * @Author: Alan
 * @Date: 2022-02-08 17:48:31
 * @LastEditors: Alan
 * @LastEditTime: 2022-07-07 13:53:54
 * @Description: 奖池奖金滚动
 * @FilePath: \Mobile\src\components\Games\Countdown.js
 */
import React, { Component } from 'react';
class Countdown extends Component {
	constructor(props) {
		super(props);
		this.state = {
			JackpotNum: [ '0', ',', '0', '0', '0', ',', '0', '0', '0', '.', '0', '0' ],
			count: Math.round(Math.random() * 999999)
		};
		this.numberItem = React.createRef();
	}

	componentDidMount() {
		this.increaseNumber();
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	/**
     * @description: 设置动画
     * @param {*}
     * @return {*}
    */
	setNumberTransform() {
		if (this.numberItem.current.children) {
			const numberItems = this.numberItem.current.children; //计算元素数量
			const numberArr = this.state.JackpotNum; //.filter((item) => !isNaN(item));
			for (let index = 0; index < numberItems.length; index++) {
				const elem = numberItems[index].firstChild.firstChild;
				let number = numberArr[index];
				elem.style.transform = `translate(-50%, ${number * 10}%)`;
			}
		}
	}

	/**
     * @description: 处理奖池数字
     * @param {*} num
     * @return {*}
    */
	toJackpotNum(num) {
		num = num.toString();
		// 把奖池变成字符串
		if (num.length < 9) {
			num = '0' + num; // 如未满9位数，添加"0"补位
			this.toJackpotNum(num); // 递归添加"0"补位
		} else if (num.length === 9) {
			// 奖池数中加入逗号
			num = num.slice(0, 1) + ',' + num.slice(1, 4) + ',' + num.slice(4, 7) + '.' + num.slice(7, 9);
			this.setState({
				JackpotNum: num.split('')
			});
		}
	}

	/**
     * @description:定时器
     * @param {*}
     * @return {*}
    */
	increaseNumber() {
		this.timer = setInterval(() => {
			this.setState(
				{
					count:
						this.state.count +
						this.getRandomNumber(
							Math.round(Math.random() * this.getRandomNumber(1, 100)),
							Math.round(Math.random() * this.getRandomNumber(1, 99999999))
						)
				},
				() => {
					this.toJackpotNum(this.state.count);
					//this.setNumberTransform();
				}
			);
		}, 3000);
	}

	/**
     * @description: 生产区间随机数
     * @param {*} min 最低
     * @param {*} max 最大
     * @return {*}
    */
	getRandomNumber(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	render() {
		const { JackpotNum } = this.state;
		return (
			<ul className="box-item" ref={this.numberItem}>
				{JackpotNum.map((item, index) => {
					return (
						<li className={!isNaN(item) ? 'number-item' : 'mark-item'} key={index}>
							{
								<span className="comma">
									<i>{item}</i>
								</span>
							}
						</li>
					);
				})}
			</ul>
		);
	}
}

export default Countdown;

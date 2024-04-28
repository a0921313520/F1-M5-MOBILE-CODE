/*
 * @Author: Alan
 * @Date: 2023-01-05 16:20:05
 * @LastEditors: Alan
 * @LastEditTime: 2023-01-06 19:28:30
 * @Description: 红包雨
 * @FilePath: \Mobile\src\components\Events\Redpack-Rain\index.js
 */

import React from 'react';
export default class RedpackRain extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
		this.portalRef = React.createRef();
	}

	componentDidMount() {
		this.RedRain();
	}

	componentWillUnmount() {
		if (this.IntervalRedRain) {
			clearInterval(this.IntervalRedRain);
		}

		if (this.timer) {
			clearInterval(this.timer);
		}
	}

	int() {
		setTimeout(() => {
			this.rain.start([
				{ id: '001', amount: 0.1 },
				{ id: '002', amount: 0.2 },
				{ id: '003', amount: 0.1 },
				{ id: '004', amount: 0 },
				{ id: '005', amount: 0.1 },
				{ id: '006', amount: 0.1 },
				{ id: '007', amount: 0.1 },
				{ id: '008', amount: 0.1 },
				{ id: '009', amount: 0.1 },
				{ id: '010', amount: 0 },
				{ id: '011', amount: 0.1 },
				{ id: '012', amount: 0 },
				{ id: '013', amount: 0.1 },
				{ id: '014', amount: 0.1 },
				{ id: '015', amount: 0.1 },
				{ id: '016', amount: 0 },
				{ id: '017', amount: 0.1 },
				{ id: '018', amount: 0.1 },
				{ id: '019', amount: 0.1 },
				{ id: '020', amount: 0 },
				{ id: '021', amount: 0.1 },
				{ id: '022', amount: 0.1 },
				{ id: '023', amount: 0.1 },
				{ id: '024', amount: 0.1 },
				{ id: '025', amount: 0 },
				{ id: '026', amount: 0.1 },
				{ id: '027', amount: 0.1 },
				{ id: '028', amount: 0.1 },
				{ id: '029', amount: 0 },
				{ id: '030', amount: 0.1 },
				{ id: '031', amount: 0.1 },
				{ id: '032', amount: 0.1 },
				{ id: '033', amount: 0 },
				{ id: '034', amount: 0.1 },
				{ id: '035', amount: 0.1 },
				{ id: '036', amount: 0.1 },
				{ id: '037', amount: 0.1 },
				{ id: '038', amount: 0.1 },
				{ id: '039', amount: 0.1 },
				{ id: '040', amount: 0 },
				{ id: '041', amount: 0.1 },
				{ id: '042', amount: 0 },
				{ id: '043', amount: 0.1 },
				{ id: '044', amount: 0.1 },
				{ id: '045', amount: 0 },
				{ id: '046', amount: 0.1 },
				{ id: '047', amount: 0.1 },
				{ id: '048', amount: 0 },
				{ id: '049', amount: 0.1 },
				{ id: '050', amount: 0.1 },
				{ id: '051', amount: 0 },
				{ id: '052', amount: 0.1 },
				{ id: '053', amount: 0.1 },
				{ id: '054', amount: 0.1 },
				{ id: '055', amount: 0 },
				{ id: '056', amount: 0.1 },
				{ id: '057', amount: 0.1 },
				{ id: '058', amount: 0 },
				{ id: '059', amount: 0.1 },
				{ id: '060', amount: 0.1 },
				{ id: '061', amount: 0 },
				{ id: '062', amount: 0.1 },
				{ id: '063', amount: 0.1 },
				{ id: '064', amount: 0 },
				{ id: '065', amount: 0.1 },
				{ id: '066', amount: 0.1 },
				{ id: '067', amount: 0.1 },
				{ id: '068', amount: 0 },
				{ id: '069', amount: 0.1 },
				{ id: '070', amount: 0.1 },
				{ id: '071', amount: 0.1 },
				{ id: '072', amount: 0.1 },
				{ id: '073', amount: 0 },
				{ id: '074', amount: 0.1 },
				{ id: '075', amount: 0.1 },
				{ id: '076', amount: 0.1 },
				{ id: '077', amount: 0.1 },
				{ id: '078', amount: 0.1 },
				{ id: '079', amount: 0 },
				{ id: '080', amount: 0.1 },
				{ id: '081', amount: 0.1 },
				{ id: '082', amount: 0.1 },
				{ id: '083', amount: 0.1 },
				{ id: '084', amount: 0.1 },
				{ id: '085', amount: 0 },
				{ id: '086', amount: 0.1 },
				{ id: '087', amount: 0.1 },
				{ id: '088', amount: 0.1 },
				{ id: '089', amount: 0.1 },
				{ id: '090', amount: 0.1 },
				{ id: '091', amount: 0 },
				{ id: '092', amount: 0.1 },
				{ id: '093', amount: 0.1 },
				{ id: '094', amount: 0.1 },
				{ id: '095', amount: 0.1 },
				{ id: '096', amount: 0 },
				{ id: '097', amount: 0.1 },
				{ id: '098', amount: 0.1 },
				{ id: '099', amount: 0.1 },
				{ id: '0100', amount: 0.1 }
			]);
		}, 1000);
	}

	RedRain() {
		this.int();
		this.IntervalRedRain = setInterval(() => {
			this.rain.stop();
			this.rain.clear();
			this.int();
		}, 40000);
		let _this = this;
		function redPack(options) {
			this.el = options.el;
			this.rains = [];
			this.speed = options.speed; // 控制红包落下的速度
			this.density = options.density; // 红包密度
			this.callback = options.callback; // 回调
		}
		var flag = true;
		redPack.prototype.create = function(id, amount) {
			var el = this.el,
				This = this,
				// flag = true,
				fragment = document.createDocumentFragment(),
				nRed = document.createElement('span');

			// 添加自定义属性
			nRed.setAttribute('redId', id);
			nRed.setAttribute('redAmount', amount);
			nRed.className = 'redpack';
			nRed.style.left = Math.random() * (el.clientWidth - 30) + 'px';
			nRed.style.top = -el.clientHeight / 10 + 'px';
			nRed.onclick = () => {
				_this.props.gifClick();
			};

			fragment.appendChild(nRed);
			el.appendChild(fragment);
			this.rains.push(nRed);
			this.move(nRed);

			// 红包事件函数
			var handler = function(e) {
				// if (flag === true) {
				// 	var that = nRed;
				// 	e.target.className = 'redpack redpacked';
				// 	This.callback(e);
				// 	flag = false;
				// } else {
				// 	return;
				// }
				if (flag === true) {
					//flag = false;
					// e.preventDefault();
					// This.callback(e);
				}
				//e.target.className = 'redpack redpacked';

				//flag = false;
			};
			document.addEventListener('touchstart', function(e) {
				// if (e.target.className === 'redpack') {
				// 	handler(e);
				// 	alert(3);
				// } else if (e.target.getAttribute('redAmount') === '0') {
				// 	e.target.className = 'redPackNone';
				// 	handler(e);
				// 	alert(2);
				// }
				//e.target.className = 'redpack';
				// handler(e);
			});
		};
		redPack.prototype.start = function(data) {
			var that = this,
				i = 0;
			that.timer = setInterval(function() {
				if (i <= data.length - 1) {
					var id = data[i].id,
						amount = data[i].amount;
					that.create(id, amount);
					i++;
				}
			}, that.density);
		};
		redPack.prototype.stop = function() {
			var This = this;
			clearInterval(This.timer);
			for (var i = 0; i < This.rains.length; i++) {
				clearInterval(This.rains[i].timer);
			}
		};
		redPack.prototype.move = function(rains) {
			var el = this.el;
			var This = this;
			var diffY = Math.random() + 1; // 垂直上的轻微偏移
			var diffX = Math.random(); // 水平上的轻微偏移
			rains.timer = setInterval(function() {
				if (diffY > 1.5) {
					rains.style.left = parseInt(rains.style.left) + parseInt(diffX * rains.clientHeight / 30) + 'px';
				} else {
					rains.style.left = parseInt(rains.style.left) - parseInt(diffX * rains.clientHeight / 30) + 'px';
				}
				rains.style.top = parseInt(rains.style.top) + parseInt(diffY * rains.clientHeight / 20) + 'px';
				if (el.clientHeight < parseInt(rains.style.top)) {
					// 超出 区域过后，关闭定时器，删除红包
					clearInterval(rains.timer);
					el.removeChild(rains);
				}
			}, This.speed);
		};
		// 时间停止时清除剩余红包
		redPack.prototype.clear = function() {
			var container = g('box'),
				redItem = container.childNodes;
			for (var i = redItem.length - 1; i >= 0; i--) {
				container.removeChild(redItem[i]);
			}
		};

		var g = function(id) {
			return document.getElementById(id);
		};

		var el = g('box');
		this.rain = new redPack({
			el: el, // 容器
			//chance: 0.5,  // 几率,暂时不需要
			speed: 30, // 速度，越小越快
			density: 500, //  红包的密度，越小越多
			callback: function(e) {
				//_this.props.gifClick();
			}
		});
	}

	render() {
		return <div id="box" />;
	}
}

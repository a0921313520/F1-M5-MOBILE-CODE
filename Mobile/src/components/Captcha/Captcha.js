import React, { Component } from 'react';
import Modal from '@/components/View/Modal';
import Toast from '@/components/View/Toast';
import moment from 'moment';
import ReactIMG from '@/components/View/ReactIMG';
const STATUS_LOADING = 0; // 还没有图片
const STATUS_READY = 1; // 图片渲染完成,可以开始滑动
const STATUS_MATCH = 2; // 图片位置匹配成功
const STATUS_ERROR = 3; // 图片位置匹配失败
let ReladBa = true;
class ReactCaptcha extends React.Component {
	constructor(props) {
		super(props);
		this.options = {
			col: 10,
			row: 2,
			chartUri: '',
			shuffleMatrix: []
		};
		this.canvas = null;
		this.ctx = null;
		this.img = null;
		this.state = {
			isMovable: false,
			startX: 0, // 开始滑动的 x
			startY: 0, // 开始滑动的 y
			currX: 0, //当前的 x
			currY: 0, // 当前的 y
			status: STATUS_LOADING
			// currentLocale:this.props.currentLocale
		};
	}

	componentDidMount() {
		// this.createCanvas()
	}

	componentDidUpdate(prevProps) {
		// 当父组件传入新的图片后，开始渲染
		if (!!this.props.chartUri && prevProps.chartUri !== this.props.chartUri) {
			this.setState(
				{
					chartUri: this.props.chartUri,
					keyUri: this.props.keyUri,
					shuffleMatrix: this.props.shuffleMatrix
				},
				() => {
					let { chartUri, keyUri, shuffleMatrix } = this.state;
					this.createCanvas();
					this.renderImage({ chartUri, keyUri, shuffleMatrix });
				}
			);
		}
		if (prevProps.visible !== this.props.visible) {
			if (!this.props.visible) {
				this.onReset();
			}
		}
	}

	createCanvas() {
		// 创建canvas
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.canvas.width = '300';
		this.canvas.height = '150';
	}

	loadImage = () => {
		return new Promise((resolve, reject) => {
			var image = new Image();
			image.crossOrigin = '';
			image.src = this.options.chartUri;
			image.onload = (e) => {
				this.img = image;
				resolve(e);
			};
			image.onerror = (e) => {
				reject(e);
			};
		});
	};

	async renderImage(options) {
		this.options = { ...this.options, ...options };
		try {
			await this.loadImage();
			this.splitImg();
		} catch (e) {
			console.log(e);
		}
	}

	drawImg(list) {
		// 绘制图片
		// 清空画布
		if (this.ctx) {
			this.ctx.clearRect(0, 0, 300, 150);
		}
		for (let k = 0; k < list.length; k++) {
			let object = list[k];
			let dx, dy;
			if (k > 9) {
				dx = (k - 10) * 30;
				dy = 75;
			} else {
				dx = (k - 0) * 30;
				dy = 0;
			}
			if (this.ctx) {
				this.ctx.drawImage(
					this.img,
					object.x,
					object.y,
					object.width,
					object.height,
					dx,
					dy,
					object.width,
					object.height
				);
			}
		}
	}

	async setImgBase64(list) {
		try {
			await this.drawImg(list);
			console.log(this.canvas);
			const base64 = this.canvas.toDataURL();
			this.setState({
				imgSrc: base64,
				status: STATUS_READY
			});
		} catch (e) {
			console.log(e);
		}
	}

	splitImg() {
		// 切割图片
		let list = [];
		for (let y = 0; y < this.options.row; y++) {
			for (let x = 0; x < this.options.col; x++) {
				let simpleWidth = parseInt(this.img.width / this.options.col);
				let simpleHeight = parseInt(this.img.height / this.options.row);
				list.push({
					x: x * simpleWidth,
					y: y * simpleHeight,
					width: simpleWidth,
					height: simpleHeight
				});
			}
		}
		let sortList = this.sortList(list);
		this.setImgBase64(sortList);
	}

	sortList(list) {
		// 图片排序
		list.forEach((element, i) => {
			element.index = this.options.shuffleMatrix[i];
		});
		let newlist = list.sort((param1, param2) => {
			return param1.index - param2.index;
		});
		return newlist;
	}

	onTouchStart = (e) => {
		if (this.state.status !== STATUS_READY) {
			return;
		}
		// 记录滑动开始时的绝对坐标x
		let clientX = e.targetTouches[0].clientX;
		let clientY = e.targetTouches[0].clientY;
		const startTime = moment();
		this.setState({ isMovable: true, startX: clientX, startY: clientY, startTime: startTime });
	};

	onTouchMove = (e) => {
		if (this.state.status !== STATUS_READY || !this.state.isMovable) {
			return;
		}
		let clientX = e.targetTouches[0].clientX;
		let clientY = e.targetTouches[0].clientY;
		const distanceX = clientX - this.state.startX;
		let currX = distanceX;

		const distanceY = clientY - this.state.startY;
		let currY = distanceY;

		const minX = 0;
		// const maxX = this.props.imageWidth - this.props.fragmentSize
		const maxX = 300 - 60;
		const minY = 0;
		// const maxX = this.props.imageWidth - this.props.fragmentSize
		const maxY = 150 - 60;

		currX = currX < minX ? 0 : currX > maxX ? maxX : currX;

		currY = currY < minY ? 0 : currY > maxY ? maxY : currY;

		this.setState({ currX, currY });
	};

	onTouchEnd = () => {
		if (this.state.status !== STATUS_READY || !this.state.isMovable) {
			return;
		}
		let { startTime } = this.state;
		const nowTime = moment();
		const cost = new Date(nowTime).getTime() - new Date(startTime).getTime(); // 剩餘時間
		// 将旧的固定坐标x更新
		this.setState({
			isMovable: false
		});

		this.props.judgement({ x: this.state.currX, y: this.state.currY, cost: cost }, this.judgeResult);
		return;
	};

	judgeResult = (errorCode) => {
		if ([ '10001', '10002', '11001' ].includes(String(errorCode))) {
			this.onShowTips('showSuccessTip');
			this.props.onMatch(this.props.challengeUuid);
		} else {
			this.onShowTips('showFailTip');
			this.resetPosition();
			if (errorCode == '63403') {
				//超过解答上限
				this.props.onReload();
			}
		}
	};

	onShowTips = (type) => {
		this.setState(
			{
				[type]: true
			},
			() => {
				setTimeout(() => {
					this.setState({
						[type]: false
					});
				}, 3000);
			}
		);
	};

	resetPosition = () => {
		const timer = setTimeout(() => {
			this.setState({
				currX: 0,
				currY: 0,
				status: STATUS_READY
			});
			clearTimeout(timer);
		}, 1000);
	};

	onReload = () => {
		if (ReladBa == false) {
			//防惡意刷新
			Toast.error('Thao tác này quá thường xuyên, vui lòng thử lại sau.', 3);
			setTimeout(() => {
				ReladBa = true;
			}, 3000);
			return;
		}
		ReladBa = false;
		this.onReset();
		this.props.onReload();
	};

	onReset = () => {
		this.canvas = null;
		this.ctx = null;
		this.img = null;
		this.setState({
			imgSrc: '',
			isMovable: false,
			startX: 0,
			startY: 0, // 开始滑动的 x
			currX: 0, // 滑块当前 x,
			currY: 0, // 滑块当前 x,
			status: STATUS_LOADING
		});
	};

	render() {
		const { imgSrc, showDescription, showSuccessTip, showFailTip } = this.state;
		const { currentLocale, visible } = this.props;
		return (
			<Modal transparent maskClosable={false} closable={false} visible={visible} className="loginCaptcha">
				<div className="successCon">
					<span className="close" onClick={this.props.close} />
					<div className="title">{currentLocale && currentLocale.info}</div>
					<div className="imgCon">
						{imgSrc ? (
							<div className="imgBg" style={{ background: `url(${this.state.imgSrc}) no-repeat` }}>
								<div
									className="sliderBg"
									style={{
										background: `url(${this.state.keyUri}) no-repeat`,
										left: this.state.currX + 'px',
										top: this.state.currY + 'px'
									}}
									onTouchStart={this.onTouchStart}
									onTouchMove={this.onTouchMove}
									onTouchEnd={this.onTouchEnd}
								/>
							</div>
						) : (
							<div className="loadingBg" style={{ textAlign: 'center' }}>
								<div className="loading">
									{/* <ActivityIndicator size="large" /> */}
									<ReactIMG src="/img/loading.gif" />
								</div>
							</div>
						)}

						{/* {showSuccessTip && (
							<div className="successTipSet">
								<i className="icon" />
								<span>Xác Thực Thành Công</span>
							</div>
						)} */}
						{showFailTip && (
							<div className="failedTip">
								<i className="icon" />
								<span>Thất bại. Vui lòng thử lại</span>
							</div>
						)}
						{showDescription && (
							<div className="mask">
								<span
									className="maskCloseBtn"
									onClick={() => this.setState({ showDescription: false })}
								/>
								<div className="text">{currentLocale && currentLocale.description}</div>
							</div>
						)}
					</div>
					<div className="btnGroup">
						<span onClick={this.onReload} className="reload" />
						<span className="info" onClick={() => this.setState({ showDescription: true })} />
					</div>
				</div>
			</Modal>
		);
	}
}

export default ReactCaptcha;

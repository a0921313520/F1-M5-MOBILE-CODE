import React, { Component } from 'react';
import { GetProvinces, GetDistricts, GetTowns } from '@/api/promotions';
import Swiper from 'swiper';
import Flexbox from '@/components/View/Flexbox/';
import Toast from '@/components/View/Toast';
import { BsChevronDown } from 'react-icons/bs';
import classNames from 'classnames';
//地区选择组件
export default class AreaSelection extends Component {
	constructor(props) {
		super(props);
		console.log(props);
		this.state = {
			value: props.datavalue,
			show: props.show,
			activeIndex: [ 0, 0, 0 ], //回显时候的默认数据
			provinces: [], //省份
			citys: [], //城市
			districts: [] //区县
		};
	}

	initArea = async () => {
		console.log(this.props.value);
		//异步方法  获取省份 - 根据省份查城市 - 根据城市查区域
		//因为选中的数据为 [北京市,北京市,东城区] ,所以回显数据时要根据名称去匹配对应的id，name和index

		const self = this;
		//定义通用的swiper配置
		const options = {
			direction: 'vertical',
			speed: 300, //切换速度
			width: 130,
			spaceBetween: 0, //间距
			height: 100, // slide 高度,必要，否则会有滑动偏差问题
			slidesPerView: 3, //网格分布3个 https://www.swiper.com.cn/api/grid/24.html
			centeredSlides: true, //居中
			resistance: true, //边缘抵抗
			observer: true, //修改swiper自己或子元素时，自动初始化swiper 不加有滑动失效问题
			observeParents: true //修改swiper的父元素时，自动初始化swiper 不加有滑动失效问题
		};
		//获取省份
		Toast.loading();
		GetProvinces((res) => {
			if (res.isSuccess) {
				this.setState({
					provinces: res.result
				});
				console.log(provinces);
				new Swiper('#swiper1', provinces);
			}
		});

		const val = self.state.activeIndex;
		//省份配置
		const provinces = {
			...options,
			initialSlide: val[0] && val[0].index, //默认显示的下标位置
			on: {
				//初始化时候执行 只执行一次
				init: function() {
					let { provinces, value } = self.state;
					let { name, id } = provinces[this.activeIndex];
					let arr = [ ...value ];
					arr[0] = { name: name, id: id };
					self.setState({ value: arr });
					GetDistricts(id, (res) => {
						self.setState({
							citys: res.result
						});
						new Swiper('#swiper2', citys);
					});
				},
				//切换的时候执行
				slideChange: function() {
					let { provinces, value } = self.state;
					let { name, id } = provinces[this.activeIndex];
					let arr = [ ...value ];
					arr[0] = { name: name, id: id };
					self.setState({ value: arr });
					setTimeout(() => {
						GetDistricts(id, (res) => {
							self.setState({
								citys: res.result
							});
							new Swiper('#swiper2', citys);
						});
					}, 0);
				}
			}
		};
		//城市配置
		const citys = {
			...options,
			initialSlide: val[1] && val[1].index,
			on: {
				init: function() {
					let { citys, value } = self.state;
					let { name, id } = citys[this.activeIndex];
					let arr = [ ...value ];
					arr[1] = { name: name, id: id };
					self.setState({ value: arr });
					Toast.loading();
					GetTowns(id, (res) => {
						self.setState({
							districts: res.result
						});
						new Swiper('#swiper3', districts);
						Toast.destroy();
					});
				},
				slideChange: function() {
					let { citys, value } = self.state;
					let { name, id } = citys[this.activeIndex];
					let arr = [ ...value ];
					arr[1] = { name: name, id: id };
					self.setState({ value: arr });
					setTimeout(() => {
						Toast.loading();
						GetTowns(id, (res) => {
							self.setState({
								districts: res.result
							});
							new Swiper('#swiper3', districts);
							Toast.destroy();
						});
					}, 0);
				}
			}
		};
		//地区配置
		const districts = {
			...options,
			initialSlide: val[2] && val[2].index,
			on: {
				init: function() {
					let { districts, value } = self.state;
					let { name, id } = districts[this.activeIndex];
					let arr = [ ...value ];
					arr[2] = { name: name, id: id };
					self.setState({ value: arr });
				},
				slideChange: function() {
					let { districts, value } = self.state;
					let { name, id } = districts[this.activeIndex];
					let arr = [ ...value ];
					arr[2] = { name: name, id: id };
					self.setState({ value: arr });
				}
			}
		};
	};
	componentDidMount() {
		this.initArea();
	}
	render() {
		const { value, provinces, citys, districts } = this.state;
		const { show, datavalue, disabled } = this.props;
		return (
			<React.Fragment>
				<Flexbox
					onClick={() => {
						if (disabled) return;
						this.props.isShow(true);
					}}
				>
					<Flexbox flex="1" justifyContent="center">
						<Flexbox
							className={classNames({
								MginRit: true,
								ArddressVal: true,
								disband: disabled
							})}
							justifyContent="space-between"
						>
							{datavalue.length ? datavalue[0].name : 'Tỉnh'} <BsChevronDown color="#727272" />
						</Flexbox>
					</Flexbox>
					<Flexbox flex="1" justifyContent="center">
						<Flexbox
							className={classNames({
								MginRit: true,
								ArddressVal: true,
								disband: disabled || !datavalue.length
							})}
							justifyContent="space-between"
						>
							{datavalue.length ? datavalue[1].name : 'Quận'} <BsChevronDown color="#727272" />
						</Flexbox>
					</Flexbox>
					<Flexbox flex="1" justifyContent="center">
						<Flexbox
							className={classNames({
								MginRit: true,
								ArddressVal: true,
								disband: disabled || !datavalue.length
							})}
							justifyContent="space-between"
						>
							{datavalue.length ? datavalue[2].name : 'Phường'} <BsChevronDown color="#727272" />
						</Flexbox>
					</Flexbox>
				</Flexbox>
				<div id="SelectArddress" className={'page'} style={{ display: show ? 'block' : 'none' }}>
					<div
						className={'cover'}
						onClick={() => {
							this.props.isShow(false);
						}}
					/>
					<div id="AreaSelection" className={'AreaSelection'}>
						{/* 此处可加入标题头 */}
						<Flexbox className="Header__TOP">
							<Flexbox
								onClick={() => {
									this.props.isShow(false);
								}}
								className="blue"
							>
								取消
							</Flexbox>
							<Flexbox>
								<h3>选择地区</h3>
							</Flexbox>
							<Flexbox
								onClick={() => {
									this.props.onChange(value);
									this.props.isShow(false);
									console.log(value);
								}}
								className="blue"
							>
								确定
							</Flexbox>
						</Flexbox>
						<div className={'selectArr'}>
							{/* 选中横条框 */}
							<div
								className={'containerCover'}
								onClick={() => {
									this.props.isShow(false);
								}}
							/>
							<div className={'container'}>
								<div className="swiper-container" id="swiper1">
									<div className="swiper-wrapper">
										{provinces.map((pro, p) => (
											<div key={p} className="swiper-slide">
												{pro.name}
											</div>
										))}
									</div>
								</div>
							</div>
							<div className={'container'}>
								<div className="swiper-container" id="swiper2">
									<div className="swiper-wrapper">
										{citys.map((cit, c) => (
											<div key={c} className="swiper-slide">
												{cit.name}
											</div>
										))}
									</div>
								</div>
							</div>
							<div className={'container'}>
								<div className="swiper-container" id="swiper3">
									<div className="swiper-wrapper">
										{districts.map((cou, c) => (
											<div key={c} className="swiper-slide">
												{cou.name}
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

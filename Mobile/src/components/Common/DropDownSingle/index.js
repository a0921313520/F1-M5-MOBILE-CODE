// import stylesheet from '../../../styles/components/_DropdownSingle.scss';
import { ReactSVG } from '@/components/View/ReactSVG';
import React from 'react';
import { BsFillCircleFill } from 'react-icons/bs';
import { AiOutlineCheck } from "react-icons/ai";
class _DropDown extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// 显示下来选项
			showDrop: false,
			selItem: this.props.selItem || {},
			//下拉数据
			data: this.props.data || []
		};
	}

	componentDidMount() {}

	componentDidUpdate(prevProps) {
		if (this.props.data !== prevProps.data) {
			this.setState({
				data: this.props.data
			});
		}

		if (this.props.selItem !== prevProps.selItem) {
			this.setState({
				selItem: this.props.selItem
			});
		}
	}

	componentWillUnmount() {}

	// 收起
	fold = () => {
		this.setState({ showDrop: false });
	};

	// 切换选项展开收起
	toggle = () => {
		if (this.props.onClick) {
			this.props.onClick();
		}
		this.setState({ showDrop: !this.state.showDrop });
	};

	// 点击下拉
	changeSelection = (item, e) => {
		if (!item.isSpecial) {
			this.setState({
				selItem: item
			});
		}

		this.setState({
			// selItem: item,
			showDrop: false
		});
		this.props.changeSel(item);
	};

	render() {
		const { showDrop, selItem, data } = this.state;
		const { position, disabled, link, color,needBuleTick,radioValue } = this.props;
		let dropPosition = position ? position : 'left';
		return (
			<div className="dropdown-single">
				<div
					className={`selection ${showDrop ? 'blueBorder' : ''}`}
					onClick={() => {
						if (disabled) {
							return;
						}
						this.toggle();
					}}
					style={{ filter: disabled ? 'brightness(0.9)' : 'unset' }}
				>	
					{selItem && selItem.balance >= 0 ?
						<span className="select-text">
							<div><i><BsFillCircleFill size="8" style={{marginRight: '0.2rem'}} color={selItem.color} /></i>{selItem.label}</div>
							<div>
								{selItem.balance} đ
								<ReactSVG className="arrow" src={`/img/P5/home/${showDrop ? 'down' : 'up'}.svg`} />
							</div>
						</span>
						: 
						<span className="select-text">
							<span className="select-text">
								{selItem && selItem.img && <ReactSVG style={{marginRight: '0.1rem'}} src={selItem.img} />}
								{selItem ? selItem.label : ''}
							</span>
							<ReactSVG className="dropdown-arrow" src="/img/P5/i18/icon.svg" />
						</span>
					} 

				</div>
				<div className={`select-drop select-drop-${dropPosition}`} style={{ display: showDrop ? '' : 'none' }}>
					<ul>
						{data.map((item, index) => {
							if (link) {
								return (
									<a target="_self" rel="noopener noreferrer" href={item.id} onClick={(e) => this.changeSelection(item, e)}>
									{item && item.img && <ReactSVG style={{marginRight: '0.1rem', marginLeft: '0.1rem'}} src={item.img} />}
									{item.label}
								</a>
								)
							} else { 
								return (
									<li key={item.id} onClick={(e) => this.changeSelection(item, e)}>
										{item && item.color ? <div><i><BsFillCircleFill size="8" style={{marginRight: '0.2rem'}} color={item.color} /></i>{item.label}</div> : <span>{item.label}</span>}
										{item && item.balance >= 0 ? <span>{item.balance} đ</span> : ''}
										{needBuleTick && radioValue && radioValue === item.id && <span className='buleTick'><AiOutlineCheck size="14" style={{color:"#1C8EFF"}} /></span>}
									</li>
								);
							}
						})}
					</ul>
				</div>
				<style jsx>
					{`
						.dropdown-single {
							position: relative;
							height: 100%;
						}
						.readAllText .dropdown-single .selection {
							padding: 3px 25px;
						
						}
						.dropdown-single .selection {
							display: flex;
							padding: 3px 10px;
							background: #33b8ff;
							border-radius: 16px;
							font-size: 12px;
							align-items: center;
						}
						.dropdown-single .selection span {
							vertical-align: middle;
							display: inline-block;
						}
						.dropdown-single .selection .select-text {
							min-width: 32px;
							color: white;
							display: flex;
							align-items: center;
						}

						.dropdown-single .select-drop {
							position: absolute;
							top: 110%;
							min-width: 68px;
							border-radius: 16px;
							padding-top: 1px;
							padding-left: 1px;
							padding-right: 1px;
							z-index: 99;
						}
						.dropdown-single .select-drop ul {
							background-color: white;
							border-radius: 8px;
						}
						.dropdown-single .select-drop.select-drop-right {
							right: 0;
						}
						.dropdown-single .select-drop.select-drop-left {
							left: 0;
						}
						.dropdown-single .select-drop ul {
							max-height: 190px;
							overflow-y: auto;
						}
						.dropdown-single .select-drop ul li {
							height: 37px;
							line-height: 37px;
							padding: 0 10px;
							text-align: center;
							font-size: 12px;
							color: #6b6b6b;
							background: white;
							border: 1px solid #ebebeb;
							overflow: hidden;
						}
						.dropdown-single .select-drop ul li:first-child {
							border-radius: 8px 8px 0 0;
						}
						.dropdown-single .select-drop ul li:last-child {
							border-radius: 0 0 8px 8px;
						}
					`}
				</style>
			</div>
		);
	}
}

export default _DropDown;

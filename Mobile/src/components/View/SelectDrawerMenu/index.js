import React from 'react';
import Select, { Option } from 'rc-select';
import Input from '@/components/View/Input';
import Item from '@/components/View/FormItem';
import Drawer from '@/components/View/Drawer';
import { Fragment } from 'react';
import { ReactSVG } from '@/components/View/ReactSVG';
import classNames from 'classnames';
import bankJson from '@/lib/data/BankList.json';
import ReactIMG from '@/components/View/ReactIMG';
import { BsChevronDown, BsChevronRight, BsChevronUp } from 'react-icons/bs';
class BankAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			Visible: false,
			setCode: '',
			itemActive: {},
			searchValue: '',
			filterBank: []
		};
	}
	componentDidMount() {
		// let Code =
		// 	this.props.SetCodeState == '' || this.props.SetCodeState == 'all'
		// 		? ''
		// 		: this.props.SelectMenu[0][this.props.keyName[1]];
		// let item = this.props.SelectMenu.find((item) => item[this.props.keyName[1]] == Code);
		// Array.isArray(this.props.SelectMenu) && this.props.SelectMenu.length && this.props.setBankCode(Code, item);
		// this.setState({
		// 	setCode: Code
		// });
	}

	currentBankName = () => {
		const { keyName, SelectMenu, SetCodeState, Placeholder } = this.props;
		let bankName;
		SelectMenu &&
			SelectMenu.find((v) => {
				if (v[keyName[1]] === SetCodeState) {
					bankName = v[keyName[0]];
				}
			});
		return (bankName || Placeholder);
	};

	SetVisible() {
		this.setState({
			Visible: false
		});
	}
	onChangeSearch(e){
		this.setState({
			searchValue: e
		})
		const bankList = this.props.SelectMenu.filter((v) => {
			const name = (v.bankName || v.name).toLowerCase()
			return (name.includes(e.toLowerCase()))
		})
		this.setState({
			filterBank: bankList
		})

	}
	render() {
		const { keyName, SelectMenu, SetCodeState, labelName, MenuTitle, HideAll, searchBank, closeTitle } = this.props;
		const { setCode, itemActive, searchValue, filterBank } = this.state;
		const localLabelName = labelName || '';
		let obj = bankJson.find((item) => itemActive?.name !== "Vui lòng chọn Ngân hàng" && item.Name === itemActive.name);
		return (
			<div style={{ display: 'block' }} className="addBankAccountModal">
				{Array.isArray(SelectMenu) ? SelectMenu.length ? (
					<Fragment>
						{SelectMenu.length > 1 ? (
							<div>
								<Item label={!MenuTitle ? '' : localLabelName}>
									<div
										className={`rc-select rc-select-single rc-select-show-arrow`}
										onClick={() => {
											this.setState({
												Visible: true
											});
										}}
									>
										<div className="rc-select-selector">
											{this.props.bank &&
												<ReactIMG
													style={{ width: '24px', height: '24px' }}
													src={`/img/deposit/bankLogo/${obj ? obj.Img : 'card.png'}`}
													className="specialLogo"
												/>
											}
											
											<span className="rc-select-selection-placeholder">
												<span>{this.currentBankName()}</span>
											</span>
										</div>
										<span style={{right: '10px', position: 'relative'}} unselectable="on">
											{this.state.Visible ? 
											<BsChevronUp size={12} color="#222222" />
											: 
											<BsChevronDown size={12} color="#222222" />
											}
											
											{/* <ReactSVG className="dropdown-arrow" src="/img/P5/i18/icon.svg" /> */}
										</span>
									</div>
								</Item>
								<Drawer
									style={{ height: '70%' }}
									direction="bottom"
									className="transfer-drawer"
									onClose={() => {
										this.setState({ Visible: false });
									}}
									visible={this.state.Visible}
								>
									<div className="nav-bar">
										<div
											className="nav-left"
											onClick={() => {
												this.SetVisible();
											}}
										>
											
											{closeTitle ? closeTitle : 'Hủy'}
										</div>
										<div className="nav-center">{localLabelName == 'Ví Nhận Thưởng' ? 'Chọn Ví' : localLabelName }</div>
										<div
											className="nav-right"
											onClick={() => {
												this.props.setBankCode(setCode, itemActive);
												this.SetVisible();
											}}
										>	
											Chọn
										</div>
									</div>

									{searchBank && (
										<ul className="cap-list small-circle cap-distance">
											<div className='searchBank'>
												<Item>
													<Input
														style={{paddingLeft: '1.3rem'}}
														className="sport-input-disabled"
														size="large"
														placeholder="Tìm Kiếm"
														value={searchValue}
														onChange={(e) => { this.onChangeSearch(e.target.value) }}
														prefix={<ReactSVG style={{transform: 'scale(0.8)'}}src={"/img/svg/searchGrey.svg"}/>}
													/>
												</Item>
											</div>
											</ul>
										)
									}
									<ul className="cap-list small-circle cap-distance">
										{!HideAll && (
											<li
												className="cap-item"
												key={'LIST'}
												onClick={() => {
													this.setState({
														//Visible: false,
														setCode: ''
													});
												}}
											>
												<div>Tất Cả</div>
												<div>
													<div
														className={classNames({
															'cap-item-circle': true,
															curr: setCode === ''
														})}
													/>
												</div>
											</li>
										)}
										{searchValue && filterBank.length ? 										
											filterBank && filterBank.map((value, index) => {
												let obj = bankJson.find((item) => item.Name === value.name);
												return (
													<li
														className="cap-item"
														key={index + 'LIST'}
														onClick={() => {
															this.setState({
																setCode: value[keyName[1]],
																itemActive: value
															});
														}}
													>
														<div className='bankIconName'>
															{this.props.bank &&
																<ReactIMG
																	style={{ width: '24px', height: '24px' }}
																	src={`/img/deposit/bankLogo/${obj ? obj.Img : 'card.png'}`}
																	className="specialLogo"
																/>
															}
															<span  className='bankName'>{value[keyName[0]]}</span></div>
														<div>
															<div
																className={`cap-item-circle${value[keyName[1]] === setCode
																	? ' curr'
																	: ''}`}
															/>
														</div>
													</li>
												);
											}) 
										: 	searchValue && !filterBank.length ? 
												<div className="NullData">
												<ReactSVG style={{transform: 'scale(2.5)'}} src="/img/P5/svg/null-data.svg" />
												<p style={{marginTop: '1rem'}}>không có dữ liệu</p>
											</div>
										:	SelectMenu.map((value, index) => {
											let obj = bankJson.find((item) => item.Name === value.name);
												return (
													<li
														className="cap-item"
														key={index + 'LIST'}
														onClick={() => {
															this.setState({
																setCode: value[keyName[1]],
																itemActive: value
															});
														}}
													>
														<div className='bankIconName'>
															{this.props.bank &&
																<ReactIMG
																	style={{ width: '24px', height: '24px' }}
																	src={`/img/deposit/bankLogo/${obj ? obj.Img : 'card.png'}`}
																	className="specialLogo"
																/>
															}
															<span  className='bankName'>{value[keyName[0]]}</span></div>
														<div>
															<div
																className={`cap-item-circle${value[keyName[1]] === setCode
																	? ' curr'
																	: ''}`}
															/>
														</div>
													</li>
												);
											})
										}
									</ul>
								</Drawer>
							</div>
						) : (
							<Item label={localLabelName}>
								<Input
									className="sport-input-disabled"
									size="large"
									disabled={true}
									value={SelectMenu && SelectMenu[0][this.props.keyName[0]]}
								/>
							</Item>
						)}
					</Fragment>
				) : (
					<Item label={localLabelName} className="">
						<div className="disabled-input-box">Không có dữ liệu</div>
					</Item>
				) : (
					<Item label={localLabelName}>
						<Select size="large" value="Đang tải..." disabled={true} loading={true} />
					</Item>
				)}
			</div>
		);
	}
}
export default BankAccount;

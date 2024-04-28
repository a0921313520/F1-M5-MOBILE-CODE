import React from 'react';
import Select, { Option } from 'rc-select';
import Input from '@/components/View/Input';
import Item from './../Item';
import Drawer from '@/components/View/Drawer';
import { Fragment } from 'react';
import { ReactSVG } from '@/components/View/ReactSVG';
import classNames from 'classnames';
import bankJson from '@/lib/data/BankList.json';
import ReactIMG from '@/components/View/ReactIMG';
import Flexbox from '@/components/View/Flexbox/';
class BankAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			backListVisible: false,
			setCode: ''
		};
	}
	componentDidMount() {
		Array.isArray(this.props.bankAccounts) &&
			this.props.bankAccounts.length &&
			this.props.setBankCode(
				this.props.bankCodeState == '' || this.props.bankCodeState == 'all'
					? ''
					: this.props.bankAccounts[0][this.props.keyName[1]]
			);
	}

	componentDidUpdate(prevProps, prevState) {
		// 设置第一次进入充值的默认Code
		const { bankAccounts } = this.props;
		if (
			// 当前bank列表必须是数组并且必须有长度
			Array.isArray(bankAccounts) &&
			bankAccounts.length &&
			// 首次呼出钱包时的bank列表为undefined的情况
			(typeof prevProps.bankAccounts !== typeof bankAccounts ||
				// 银行长度不同或者第一个的code值不同（如果长度相同并且第一个值的code值相同还是不会设置默认值！！！）
				(Array.isArray(prevProps.bankAccounts) &&
					(prevProps.bankAccounts.length !== bankAccounts.length ||
						prevProps.bankAccounts[0][this.props.keyName[1]] !== bankAccounts[0][this.props.keyName[1]])))
		) {
			this.props.setBankCode(bankAccounts[0][this.props.keyName[1]]);
		}
	}

	currentBankName = () => {
		const { keyName, bankAccounts, bankCodeState } = this.props;
		console.log('---------------------->', bankCodeState);
		let bankName;
		let name;
		bankAccounts &&
			bankAccounts.find((v) => {
				if (v[keyName[1]] === bankCodeState) {
					bankName = v[keyName[0]];
					if (v.bankName) {
						name = v.bankName;
					}
				}
			});
		let obj = bankJson.find((item) => item.Name === name);

		return (
			<Fragment>
				{obj && (
					<ReactIMG
						style={{ width: '24px', height: '24px' }}
						src={`/img/deposit/bankLogo/${obj ? obj.Img : 'card.png'}`}
						className="specialLogo"
					/>
				)}

				{bankName || '全部'}
			</Fragment>
		);
	};
	render() {
		const { keyName, bankAccounts, bankCodeState, labelName, setting, MenuTitle, DrawerTitle } = this.props;
		const { setCode } = this.state;
		const localLabelName = labelName || '存款银行';
		console.log(this.currentBankName());
		console.log(bankAccounts);
		return (
			<div style={{ display: setting && setting.isAutoAssign == true ? 'none' : 'block' }}>
				{Array.isArray(bankAccounts) ? bankAccounts.length ? (
					<Fragment>
						{bankAccounts.length > 1 ? (
							<div>
								<Item label={!MenuTitle ? '' : localLabelName}>
									<div
										className={`rc-select rc-select-single rc-select-show-arrow`}
										onClick={() => {
											this.setState({
												backListVisible: true
											});
										}}
									>
										<div className="rc-select-selector">
											<span className="rc-select-selection-placeholder">
												<Flexbox alignItems="center"> {this.currentBankName()}</Flexbox>
											</span>
										</div>
										<span className="select-arrow" unselectable="on">
											<ReactSVG className="dropdown-arrow" src="/img/P5/i18/icon.svg" />
										</span>
									</div>
								</Item>
								<Drawer
									style={{ height: '70%' }}
									direction="bottom"
									className="transfer-drawer"
									onClose={() => {
										this.setState({ backListVisible: false });
									}}
									visible={this.state.backListVisible}
								>
									<h2 className="transfer-drawer-tit">{localLabelName}</h2>
									<ul className="cap-list small-circle cap-distance">
										{bankCodeState == 'all' && (
											<li
												className="cap-item"
												key={'LIST'}
												onClick={() => {
													this.props.setBankCode('');
													this.setState({
														backListVisible: false,
														setCode: ''
													});
												}}
											>
												<div>全部</div>
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

										{bankAccounts.map((value, index) => {
											let obj =
												value.bankName && bankJson.find((item) => item.Name === value.bankName);
											return (
												<li
													className="cap-item"
													key={index + 'LIST'}
													onClick={() => {
														this.props.setBankCode(value[keyName[1]]);
														this.setState({
															backListVisible: false,
															setCode: value[keyName[1]]
														});
													}}
												>
													<Flexbox alignItems="center">
														{obj && (
															<ReactIMG
																style={{ width: '24px', height: '24px' }}
																src={`/img/deposit/bankLogo/${obj
																	? obj.Img
																	: 'card.png'}`}
																className="specialLogo"
															/>
														)}

														{value[keyName[0]]}
													</Flexbox>
													<div>
														<div
															className={`cap-item-circle${value[keyName[1]] ===
															bankCodeState
																? ' curr'
																: ''}`}
														/>
													</div>
												</li>
											);
										})}
									</ul>
								</Drawer>
							</div>
						) : (
							<Item label={localLabelName}>
								<Input
									className="sport-input-disabled"
									size="large"
									disabled={true}
									value={bankAccounts && bankAccounts[0][this.props.keyName[0]]}
								/>
							</Item>
						)}
					</Fragment>
				) : (
					// <Item label={localLabelName} className="">
					// 	<div className="disabled-input-box">没有可使用的银行，请联系在线客服。</div>
					// </Item>
					<></>
				) : (
					<Item label={localLabelName}>
						<Select size="large" value="加载中..." disabled={true} loading={true} />
					</Item>
				)}
			</div>
		);
	}
}
export default BankAccount;

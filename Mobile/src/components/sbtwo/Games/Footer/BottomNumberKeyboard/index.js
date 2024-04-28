/* ------------------- 投注数字键盘 ------------------*/
import React from 'react';
import { ReactSVG } from '$SBTWO/ReactSVG';
import FreeBet from '../BottomFreeBet';
class BetKeyboard extends React.Component {
	constructor(props) {
		super();
		this.state = {
			amount1: 0,
			amount2: 0,
			amount3: 0
		};
		this._refsFreeBetState = React.createRef();
	}

	componentDidMount() {
		const Setting = this.props.Vendor.getMemberSetting();
		this.setState({
			amount1: Setting.amount1,
			amount2: Setting.amount2,
			amount3: Setting.amount3
		});
	}
	render() {
		const { amount1, amount2, amount3 } = this.state;
		const { BetSetting, BetAmountData, BetAmountDataKey } = this.props;
		let NumberList = [
			{
				name: '1',
				key: 1
			},
			{
				name: '2',
				key: 2
			},
			{
				name: '3',
				key: 3
			},
			{
				name: 'MAX',
				key: this.props.Balance > Max ? Max : this.props.Balance
			},
			{
				name: '4',
				key: 4
			},
			{
				name: '5',
				key: 5
			},
			{
				name: '6',
				key: 6
			},
			{
				name: amount1,
				key: 'add'
			},
			{
				name: '7',
				key: 7
			},
			{
				name: '8',
				key: 8
			},
			{
				name: '9',
				key: 9
			},
			{
				name: amount2,
				key: 'add'
			},
			{
				name: '00',
				key: '00'
			},
			{
				name: '0',
				key: 0
			},
			{
				name: '清除',
				key: 'clear'
			},
			{
				name: amount3,
				key: 'add'
			}
		];
		/* 是否有免费投注 */
		let ShowFreeBets = BetSetting != null ? BetSetting.FreeBets != '' : false;
		let Max = BetSetting ? BetSetting.MaxAmount : 0
		return (
			<div className="Bet-digit-keyboard_area">
				{/* 免费投注 */}
				{ShowFreeBets && (
					<FreeBet
						chooseFreeBet={this.props.chooseFreeBet}
						BetSetting={BetSetting}
						BetAmountData={BetAmountData}
						BetAmountDataKey={BetAmountDataKey}
						ref={this._refsFreeBetState}
					/>
				)}
				<div className="number-area">
					{/* 键盘列表 */}
					{NumberList.map((item, index) => {
						return (
							<div
								className={
									index == 3 ? (
										'item btn'
									) : index == 7 || index == 11 || index == 15 ? (
										'item orgColor '
									) : (
										'item'
									)
								}
								key={index}
								onClick={() => {
									this.props.modifyNum(item.key, index, BetAmountDataKey);
								}}
							>
								{index == 14 ? (
									/* 删除 */
									<ReactSVG className="Betting-dlt -svg" src={'/img/svg/betting/dlt.svg'} />
								) : (
									item.name
								)}
							</div>
						);
					})}
				</div>
			</div>
		);
	}
}
export default BetKeyboard;

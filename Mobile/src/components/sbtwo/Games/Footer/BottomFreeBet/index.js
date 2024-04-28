/* ---------------- 免费投注 ------------------ */
import React from 'react';
import { ReactSVG } from '$SBTWO/ReactSVG';
import dynamic from 'next/dynamic';
const Drawer = dynamic(import('ac-drawer'), { ssr: false });
import Picker from 'rmc-picker/lib/Picker';
class FreeBet extends React.Component {
	constructor(props) {
		super();
		this.state = {
			showmenu: false,
			selectedValue: null,
		};
	}

	render() {
		const { BetSetting, BetAmountData, BetAmountDataKey } = this.props;

		const targetAmountData = BetAmountData.find(v => v.key == BetAmountDataKey);
		let thisFreeBetToken = targetAmountData ? targetAmountData.freeBetToken : null;
		let thisFreeBetData = null;
		if (thisFreeBetToken) {
			thisFreeBetData = (BetSetting && BetSetting.FreeBets)
			? BetSetting.FreeBets.find(fb => fb.FreeBetToken == thisFreeBetToken)
			: null;
		}
		const thisFreeBetDesc = thisFreeBetToken ? thisFreeBetData.FreeBetAmount + '元串关免费彩金' : '';

		//已被選走的FreeTokens
		const choosedFreeBetTokens = BetAmountData.filter(v => v.freeBetToken !== null).map(v => v.freeBetToken);

		//還沒被選走的FreeBetDatas列表 + 加上已經選中的
		const availableFreeBetDatas = (BetSetting && BetSetting.FreeBets)
			?  BetSetting.FreeBets.filter(fb => choosedFreeBetTokens.indexOf(fb.FreeBetToken) === -1 || fb.FreeBetToken == thisFreeBetToken)
			: []

		const freeBetDataList = [{FreeBetToken: 'empty'},...availableFreeBetDatas]; //第一個默認空白

		const { showmenu } = this.state;

		return (availableFreeBetDatas && availableFreeBetDatas.length >0) && (
			<div className="FreeBetlist">
				<div>
					<label
						onClick={(e) => {
							this.setState({
								showmenu: true
							});
						}}
					>
						<span>{!thisFreeBetData ? '选择免费投注' : thisFreeBetDesc}</span>
						<ReactSVG src={'/img/svg/betting/d.svg'} />
					</label>
					<small>
						{thisFreeBetData && (
							<span>
								温馨提示：您已选择 {thisFreeBetDesc}，投注金额请大于或等于 {thisFreeBetData.FreeBetAmount} 元
							</span>
						)}
					</small>
					<Drawer
						onClose={() => {
							this.setState({
								showmenu: false
							});
						}}
						hasHeader={false}
						maskClosable
						show={showmenu}
						placement={'bottom'}
						height={250}
						className={'FreeBetbox'}
					>
						<div
							className="Header"
							onClick={() => {
								this.setState({
									showmenu: false
								});
							}}
						>
							<span>完成</span>
						</div>
						<Picker
							selectedValue={thisFreeBetToken}
							onValueChange={(value) => {
								if (value == 'empty') { //empty轉一下改帶null
									this.props.chooseFreeBet(BetAmountDataKey, null);
								} else {
									this.props.chooseFreeBet(BetAmountDataKey, value)
								}
							}}
						>
							{/* 第一個默認空白不可以這樣直接插在前面，要放在數組裡面一起處理，不然會變成兩群在選擇 只能選空白和第一個 */}
							{/*<Picker.Item value={'empty'}>*/}
							{/*	{'选择免费投注'}*/}
							{/*</Picker.Item>*/}
							{freeBetDataList.map((item, index) => {
								return (
									<Picker.Item value={item.FreeBetToken} key={item.FreeBetToken}>
										{item.FreeBetToken == 'empty' ? '选择免费投注' : item.FreeBetAmount + '元串关免费彩金'}
									</Picker.Item>
								);
							})}
						</Picker>
					</Drawer>
				</div>
			</div>
		);
	}
}
export default FreeBet;

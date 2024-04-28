import React from 'react';
import SelectionOdds from "./SelectionOdds";
import CorrectScoreSelectionBox from "./CorrectScoreSelectionBox";

class SelectionBox extends React.Component {
	render() {
		const { Vendor, IndexInArray, LineData, OddsUpData, OddsDownData, ClickOdds } = this.props;
		const { SelectionCountInLine, Selections } = LineData;

		//波膽特別處理
		if (Vendor.isCorrectScoreLine(LineData)) {
			return <CorrectScoreSelectionBox
				Vendor={Vendor}
				OddsUpData={OddsUpData}
				OddsDownData={OddsDownData}
				LineData={LineData}
				IndexInArray={IndexInArray}
				ClickOdds={ClickOdds}
			/>
		}

		//從LineData.SelectionCountInLine直接指定樣式
		const ulClassMapping = {
			1: 'Group-3', //這個class名字叫3  實際上是給 單一個投注選項 放一整行用的
			2: 'Group-2' //一行放2個
		};
		const ulClass = ulClassMapping[SelectionCountInLine] ? ulClassMapping[SelectionCountInLine] : ''; //默認  沒class的 支持一行放3個
		return (
			<div>
				{//這裡針對 主客隊 相關玩法(讓球,角球總數等) 展示隊伍名
				IndexInArray === 0 &&
				LineData.IsDisplayByTeam && (
					<ul className={ulClass + ' SelectionHeader'}>
						<li>
							<span>{LineData.HomeTeamName}</span>
						</li>
						{SelectionCountInLine == 3 ? (
							<li>
								<span>&nbsp;</span>
							</li>
						) : null //湊三個符合排版
						}
						<li>
							<span>{LineData.AwayTeamName}</span>
						</li>
					</ul>
				)}
				<ul className={ulClass}>
					{Selections.map((item, index) => {
						return <SelectionOdds
							key={index}
							Vendor={Vendor}
							SelectionData={item}
							LineIsLocked={LineData.IsLocked}
							OddsUpData={OddsUpData}
							OddsDownData={OddsDownData}
							ClickOdds={ClickOdds}
						/>
					})}
				</ul>
			</div>
		);
	}
}

export default SelectionBox;

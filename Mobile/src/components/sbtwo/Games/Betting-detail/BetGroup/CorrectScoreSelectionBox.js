//特例處理 波膽 展示
import React from 'react';
import SelectionOdds from "./SelectionOdds";

class CorrectScoreSelectionBox extends React.Component {
  render() {
    const { Vendor, LineData, OddsUpData, OddsDownData, ClickOdds } = this.props;

    let LineDataIsLocked = false;
    let CorrectScores4HomeWin = [];
    let CorrectScores4Tie = [];
    let CorrectScores4AwayWin = [];
    let CorrectScores4Other = null;
    const correctScoreInfo = Vendor.splitCorrectScoreSelectionsFromLine(LineData);
    if (correctScoreInfo) {
      LineDataIsLocked = correctScoreInfo.lineData.IsLocked;
      CorrectScores4HomeWin = correctScoreInfo.homes;
      CorrectScores4Tie = correctScoreInfo.ties;
      CorrectScores4AwayWin = correctScoreInfo.aways;
      CorrectScores4Other = correctScoreInfo.other;
    }

    return <>
      <div className="CorrectScoreOdds">
        { [CorrectScores4HomeWin, CorrectScores4Tie, CorrectScores4AwayWin].map((selections,index) => {
          return <ul className="CorrectScoreColumn" key={index}>
            {selections.map((item, selectionIndex) => {
              return <SelectionOdds
                key={selectionIndex}
                Vendor={Vendor}
                SelectionData={item}
                LineIsLocked={LineDataIsLocked}
                OddsUpData={OddsUpData}
                OddsDownData={OddsDownData}
                ClickOdds={ClickOdds}
              />
            })}
          </ul>
        })}
      </div>
      { CorrectScores4Other ?
        <ul className="CorrectScoreOther Group-3"> {/*用Group-3去實現整個佔據一行*/}
          <SelectionOdds
            Vendor={Vendor}
            SelectionData={CorrectScores4Other}
            LineIsLocked={LineDataIsLocked}
            OddsUpData={OddsUpData}
            OddsDownData={OddsDownData}
            ClickOdds={ClickOdds}
          />
        </ul> : null }
    </>;
  }
}

export default CorrectScoreSelectionBox;

/* Nami賽事分析 */

import React from 'react';
import ReactModal from 'react-modal';
import { ReactSVG } from '@/components/View/ReactSVG';
import LazyImageForTeam from '$SBTWO/LazyLoad/LazyImageForTeam';

ReactModal.setAppElement('#__next');

//共用的歷史交鋒模塊
const PastMatchResultVSItem = (props) => {
  const {Vendor, EventData, item, HideSeprator} = props;
  return <div className="NamiAnalysisVSBox">
    <div className="NamiAnalysisVSTitle">
      <div className="NamiAnalysisVSTitleDate">{item.matchDate}</div>
      <div className="NamiAnalysisVSTitleText">{item.namiLeagueName}</div>
    </div>
    <div className="NamiAnalysisVSRow">
      <div className="NamiAnalysisTeamLeft">
        <div className="NamiAnalysisTeamName">{item.isLeftHomeGame ? EventData.HomeTeamName : EventData.AwayTeamName}</div>
        <LazyImageForTeam Vendor={Vendor} TeamId={item.isLeftHomeGame ? EventData.HomeTeamId : EventData.AwayTeamId} thisClassName="NamiAnalysisTeamLogo" IconUrl={item.isLeftHomeGame ? EventData.HomeIconUrl : EventData.AwayIconUrl} overflow={true}/>
      </div>
      <div className="NamiAnalysisVSScoreBox">
        <div className="NamiAnalysisVSHomeScore">{item.homeScore}</div>
        <div className="NamiAnalysisVSScoreSep">&nbsp;:&nbsp;</div>
        <div className="NamiAnalysisVSAwayScore">{item.awayScore}</div>
      </div>
      <div className="NamiAnalysisTeamRight">
        <LazyImageForTeam Vendor={Vendor} TeamId={item.isLeftHomeGame ? EventData.AwayTeamId : EventData.HomeTeamId} thisClassName="NamiAnalysisTeamLogo" IconUrl={item.isLeftHomeGame ? EventData.AwayIconUrl : EventData.HomeIconUrl} overflow={true} />
        <div className="NamiAnalysisTeamName">{item.isLeftHomeGame ? EventData.AwayTeamName : EventData.HomeTeamName}</div>
      </div>
    </div>
    {/* for 彈窗展示 最後一個不顯示分隔線 */}
    {!HideSeprator ?
      <div className="NamiAnalysisVSBoxBottomLine"/>
      : null}
  </div>
}

class PastMatchResult extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      showVsPopup: false, //是否展示彈窗
    }
  }

  componentDidMount () {
  }

  render () {
    const { Vendor ,EventData, NamiAnalysisData } = this.props;
    if (!EventData || !NamiAnalysisData) { //有數據才render內容
      return null;
    }

    const vsFirst3 = NamiAnalysisData.vsList.filter((item,index)=> index < 3);
    const vsLeftFirst5 = NamiAnalysisData.leftVsList.filter((item,index)=> index < 5);
    const vsRightFirst5 = NamiAnalysisData.rightVsList.filter((item,index)=> index < 5);

    return <>
      <div className="NamiAnalysisContainer">
        {/*統計區*/}
        <div className="NamiAnalysisTotal">
          <div className="NamiAnalysisTotalHeader">
            <div className="NamiAnalysisTeamLeft">
              <div className="NamiAnalysisTeamName">{EventData.HomeTeamName}</div>
              <LazyImageForTeam Vendor={Vendor} TeamId={EventData.HomeTeamId} thisClassName="NamiAnalysisTeamLogo" IconUrl={EventData.HomeIconUrl} />
            </div>
            <div className="NamiAnalysisTeamRight">
              <LazyImageForTeam Vendor={Vendor} TeamId={EventData.AwayTeamId} thisClassName="NamiAnalysisTeamLogo" IconUrl={EventData.AwayIconUrl} />
              <div className="NamiAnalysisTeamName">{EventData.AwayTeamName}</div>
            </div>
          </div>
          <div className="NamiAnalysisTotalLine">
            <div className="NamiAnalysisTotalNumberLeft">{NamiAnalysisData.vsTotal.vsLeftWinCount}</div>
            <div className="NamiAnalysisTotalText">总胜数</div>
            <div className="NamiAnalysisTotalNumberRight">{NamiAnalysisData.vsTotal.vsRightWinCount}</div>
          </div>
          <div className="NamiAnalysisTotalLine">
            <div className="NamiAnalysisTotalNumberLeft">{NamiAnalysisData.vsTotal.vsLeftHomeWinCount}</div>
            <div className="NamiAnalysisTotalText">主场</div>
            <div className="NamiAnalysisTotalNumberRight">{NamiAnalysisData.vsTotal.vsRightHomeWinCount}</div>
          </div>
          <div className="NamiAnalysisTotalLine">
            <div className="NamiAnalysisTotalNumberLeft">{NamiAnalysisData.vsTotal.vsLeftAwayWinCount}</div>
            <div className="NamiAnalysisTotalText">客场</div>
            <div className="NamiAnalysisTotalNumberRight">{NamiAnalysisData.vsTotal.vsRightAwayWinCount}</div>
          </div>
          <div className="NamiAnalysisTotalLine">
            <div className="NamiAnalysisTotalDescLeft">
              <span className="NamiAnalysisTotalDescNumber">{NamiAnalysisData.vsTotal.vsCount}</span><span className="NamiAnalysisTotalDescText">&nbsp;场</span>
            </div>
            <div className="NamiAnalysisTotalDescRight">
              <span className="NamiAnalysisTotalDescNumber">{NamiAnalysisData.vsTotal.vsTieCount}</span><span className="NamiAnalysisTotalDescText">&nbsp;平</span>
            </div>
          </div>
        </div>
        {/*雙方歷史交鋒*/}
        <div className="NamiAnalysisVS">
          <div className="NamiAnalysisTitle">双方历史交锋</div>
          <div className="NamiAnalysisVSContainer">
          {
            vsFirst3.map((item,index) => {
              return <PastMatchResultVSItem key={index} Vendor={Vendor} EventData={EventData} item={item} HideSeprator={false} />
            })
          }
          { NamiAnalysisData.vsList.length >3 ?
            <div className="NamiAnalysisVSShowAllButton" onClick={() => this.setState({showVsPopup: true})}>查看全部</div>
            : null }
          </div>
        </div>
        {/*近期戰績*/}
        <div className="NamiAnalysisOther">
          <div className="NamiAnalysisTitle">近期战绩</div>
          <div className="NamiAnalysisOtherContainer">
            <div className="NamiAnalysisOtherLeftBox">
              <div className="NamiAnalysisTeamLeft">
                <div className="NamiAnalysisTeamName">{EventData.HomeTeamName}</div>
                <LazyImageForTeam Vendor={Vendor} TeamId={EventData.HomeTeamId} thisClassName="NamiAnalysisTeamLogo" IconUrl={EventData.HomeIconUrl} />
              </div>
              <div className="NamiAnalysisOtherInnerBox">
              {
                vsLeftFirst5.map((item,index) => {
                  return <div key={index} className="NamiAnalysisOtherRow">
                    <div className="NamiAnalysisOtherScore">{item.leftScore}-{item.rightScore}</div>
                    <div className="NamiAnalysisOtherVS">&nbsp;vs</div>
                    <div className="NamiAnalysisOtherNamiTeamName">{item.namiTeamName}</div>
                    <img alt={item.namiTeamId} src={item.namiTeamLogo} className="NamiAnalysisOtherNamiTeamLogo" />
                    <div className="NamiAnalysisOtherHomeOrAway">{item.isHomeGame ? '主' : '客'}</div>
                    <div className={"NamiAnalysisOtherWinOrLose" + (item.isTie ? ' NamiAnalysisOtherTie' : ( item.isWin ? ' NamiAnalysisOtherWin' : ' NamiAnalysisOtherLose'))}>
                      {item.isTie ? '平' : ( item.isWin ? '赢' : '输')}
                    </div>
                  </div>
                })
              }
              </div>
            </div>
            <div className="NamiAnalysisOtherCenterLine"/>
            <div className="NamiAnalysisOtherRightBox">
              <div className="NamiAnalysisTeamRight">
                <LazyImageForTeam Vendor={Vendor} TeamId={EventData.AwayTeamId} thisClassName="NamiAnalysisTeamLogo" IconUrl={EventData.AwayIconUrl} />
                <div className="NamiAnalysisTeamName">{EventData.AwayTeamName}</div>
              </div>
              <div className="NamiAnalysisOtherInnerBox">
              {
                vsRightFirst5.map((item,index) => {
                  return <div key={index} className="NamiAnalysisOtherRow">
                    <div className={"NamiAnalysisOtherWinOrLose" + (item.isTie ? ' NamiAnalysisOtherTie' : ( item.isWin ? ' NamiAnalysisOtherWin' : ' NamiAnalysisOtherLose'))}>
                      {item.isTie ? '平' : ( item.isWin ? '赢' : '输')}
                    </div>
                    <div className="NamiAnalysisOtherHomeOrAway">{item.isHomeGame ? '主' : '客'}</div>
                    <img alt={item.namiTeamId} src={item.namiTeamLogo} className="NamiAnalysisOtherNamiTeamLogo" />
                    <div className="NamiAnalysisOtherScore">{item.leftScore}-{item.rightScore}</div>
                    <div className="NamiAnalysisOtherVS">&nbsp;vs</div>
                    <div className="NamiAnalysisOtherNamiTeamName">{item.namiTeamName}</div>
                  </div>
                })
              }
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*雙方歷史交鋒的彈窗*/}
      <ReactModal
        isOpen={this.state.showVsPopup}
        className="NamiAnalysisPopup"
        overlayClassName="NamiAnalysisPopupOverlay"
      >
        <div className="NamiAnalysisPopupHeader">
          <ReactSVG className="NamiAnalysisPopupBackButton" src="/img/svg/LeftArrow.svg" onClick={() => this.setState({showVsPopup: false})} />
          <div className="NamiAnalysisPopupHeaderText">双方历史交锋</div>
        </div>
        <div className="NamiAnalysisPopupContainer">
          {
            NamiAnalysisData.vsList.map((item,index) => {
              return <PastMatchResultVSItem key={index} Vendor={Vendor} EventData={EventData} item={item} HideSeprator={index === (NamiAnalysisData.vsList.length-1)} />
            })
          }
        </div>
      </ReactModal>
    </>
  }
}

export default PastMatchResult;

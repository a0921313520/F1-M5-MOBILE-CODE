/* 首次進入的新手教學 小提示窗 */

import React from "react";
import cssStyles from './HomeTips.module.scss'
import HomeTipWindow from "./HomeTipWindow";

class HomeTips extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      currentStep: 1,
    }

    this.nextStep = this.nextStep.bind(this);
    this.closeTips = this.closeTips.bind(this);
  }

  componentDidMount () {
  }

  componentWillUnmount() {
  }

  nextStep(){
    this.setState({currentStep: this.state.currentStep+1});
  }

  closeTips() {
    this.setState({currentStep: 0},() => {
      this.props.onClickClose();
    })
  }

  render() {
    return this.props.visible &&
      <>
        <HomeTipWindow
          direction="topleft"
          classname={cssStyles.homeTiptep1}
          step={1}
          currentStep={this.state.currentStep}
          text="切换体育平台"
          buttonText="下一个"
          onClickClose={this.closeTips}
          onClickNextStep={this.nextStep}
        />
        <HomeTipWindow
          direction="topright"
          classname={cssStyles.homeTipStep2}
          step={2}
          currentStep={this.state.currentStep}
          text="快速搜索赛事"
          buttonText="下一个"
          onClickClose={this.closeTips}
          onClickNextStep={this.nextStep}
        />
        <HomeTipWindow
          direction="topleft"
          classname={cssStyles.homeTipStep3}
          step={3}
          currentStep={this.state.currentStep}
          text="体育分类导航 "
          buttonText="下一个"
          onClickClose={this.closeTips}
          onClickNextStep={this.nextStep}
        />
        <HomeTipWindow
          direction="bottom"
          classname={cssStyles.homeTipStep4}
          step={4}
          currentStep={this.state.currentStep}
          text="开始下注吧！"
          buttonText="完成"
          onClickClose={this.closeTips}
          onClickNextStep={this.closeTips}
        />
      </>
  }
}

export default HomeTips
/* 首次進入的新手教學 單個彈窗 */

import React from "react";
import Popover from "$SBTWO/Popover";
import cssStyles from './HomeTips.module.scss'

class HomeTipWindow extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      step: 0,
    }
  }

  componentDidMount () {
  }

  componentWillUnmount() {
  }

  render () {

    const getProgressItem = (thisStep) => {
      return <span className={ this.props.step === thisStep ? cssStyles.homeTipLine : cssStyles.homeTipDot}></span>
    }

    return <Popover
      direction={this.props.direction}
      closePosition="topClose"
      className={`${this.props.classname} ${cssStyles.homeTipBox}`}
      style={this.props.style}
      visible={this.props.currentStep === this.props.step}
      onClose={this.props.onClickClose}
    >
      <div className={cssStyles.homeTipText}>
        {this.props.text}
      </div>
      <div className={cssStyles.homeTipRow}>
        <div className={cssStyles.homeTipProgress}>
          { getProgressItem(1) }
          { getProgressItem(2) }
          { getProgressItem(3) }
          { getProgressItem(4) }
        </div>
        <div className={cssStyles.homeTipButton} onClick={this.props.onClickNextStep}>
          {this.props.buttonText}
        </div>
      </div>
    </Popover>
  }
}

export default HomeTipWindow

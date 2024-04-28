import React from "react";
import Modal from "$SBTWO/Modal";
import {connect} from "react-redux";
import moment from 'moment';

//自我限制彈窗
class SelfExclusionModal extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      ModalOpen: false,
    }

    //往父物件傳遞 公用函數
    //打開彈窗(轉帳金額限制)
    this.props.proxySetModalOpen && this.props.proxySetModalOpen(this.setModalOpen);
    //判斷自我限制 並 打開彈窗(存款 轉帳 投注 限制)
    this.props.proxyHasSelfExclusion && this.props.proxyHasSelfExclusion(this.hasSelfExclusion)
  }

  componentDidMount () {
  
  }

  componentWillUnmount() {
  }

  setModalOpen = () => {
  
    this.setState({ModalOpen: true});
  }

  //判斷自我限制(disableType 1:存款 2:轉帳 3:投注) 並 打開彈窗
  hasSelfExclusion = (disableType) => {
    if (this.props.ModalType == 1) {
      const info = this.props.userInfo.selfExclusionInfo;
      const isDisabled = info.Status && (
        (disableType == 1 && info.DisableDeposit)
        || (disableType == 2 && info.DisableFundIn)
        || (disableType == 3 && info.DisableBetting)
      )

      if (isDisabled) {
        this.setModalOpen();
        return true;
      }
    }
    return false;
  }

  render () {

    let setupDate = null;
    let dateDuration = '永久';
    if (this.props.ModalType == 1) {
      setupDate = moment(this.props.userInfo.selfExclusionInfo.SelfExcludeSetDate + '+08:00').format('YYYY/MM/DD');
      if( this.props.userInfo.selfExclusionInfo.SelfExclusionSettingID == 3) {
        dateDuration = '永久';
      } else {
        dateDuration = this.props.userInfo.selfExclusionInfo.SelfExcludeDuration + '天';
      }
    }

    return <Modal
      closable={false}
      className="SelfExclusionModal"
      title="自我限制"
      visible={this.state.ModalOpen}>
      <div className="SelfExclusionModalContent">
        { this.props.ModalType == 1 ? <>
          { `您在 ${setupDate} 已成功设定（${dateDuration}）自我行为控制，如需要任何帮助，请联系` }<span
            className="SelfExclusionModalCS"
            onClick={() => {
              global.PopUpLiveChat();
            }}
          >在线客服</span>。
        </> : null }
        { this.props.ModalType == 2 ? <>
          转帐金额已超过您的自我限制金额，若您需要任何帮助，请联系<span
            className="SelfExclusionModalCS"
            onClick={() => {
              global.PopUpLiveChat();
            }}
          >在线客服</span>。
        </> : null }
      </div>
      <div className="SelfExclusionModalButton"
        onClick={() => {
          this.setState({ModalOpen: false}, () => {
            this.props.afterCloseModal && this.props.afterCloseModal();
          });
        }}
      >
        知道了
      </div>
    </Modal>
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.userInfo,
});

export default connect(mapStateToProps)(SelfExclusionModal);

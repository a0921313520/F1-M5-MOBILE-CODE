/* Nami賽事分析 */

import React from 'react';
import Toast from '$SBTWO/Toast';
import ReactModal from 'react-modal';
import { ReactSVG } from '@/components/View/ReactSVG';
import LazyImageForTeam from '$SBTWO/LazyLoad/LazyImageForTeam';
import { getAffParam } from "$SBTWOLIB/js/Helper";
import QRCode from 'qrcode.react';
import copy from 'copy-to-clipboard';
//import { toCanvas } from 'html-to-image'; //不要用html-to-image 在低版本safari(小於16)會有問題
import html2canvas from 'html2canvas';

const download = require("downloadjs");

ReactModal.setAppElement('#__next');

class SbShare extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      showVsPopup: false, //是否展示彈窗
    }
  }

  componentDidMount () {
  }

  //獲取分享鏈接
  getShareUrl = (Vendor, EventData) => {
    if (typeof window !== 'undefined') {
      //mobile額外增加帶上affcode
      let affParam = getAffParam();
      if (affParam && affParam.length > 0) {
        affParam = affParam.replace('?', '&'); //開頭的問號換成&
      }
      return window.location.origin + process.env.BASE_PATH
        + `/sbtwo/share/?deeplink=${Vendor.configs.VendorName.toLowerCase()}&sid=${EventData.SportId}&eid=${EventData.EventId}&lid=${EventData.LeagueId}${affParam}`;
    }
    return '';
  }

  //複製分享鏈接
  copyShareUrl = (shareUrl) => {
    copy(shareUrl);
    Toast.success('链接已复制');
  }

  //下載分享圖片
  downloadShareImage = async (EventData) => {
    html2canvas(document.querySelector('#GameDetailSharePopupShareBox'),{useCORS: true})
      .then(canvas => {
        download(canvas.toDataURL('image/png'), `${EventData.LeagueName}-${EventData.HomeTeamName}-${EventData.AwayTeamName}.png`);
        Toast.success('图片已下载');
      })
      .catch((err) => {
        console.log(err)
      })
  }

  render () {
    const { Vendor , EventDetail, isShowSharePopup } = this.props;

    const shareUrl = this.getShareUrl(Vendor,EventDetail);

    return <ReactModal
      isOpen={isShowSharePopup}
      className="GameDetailSharePopup"
      overlayClassName="GameDetailSharePopupOverlay"
    >
      {isShowSharePopup && Vendor && EventDetail ? <>
        <div className="GameDetailSharePopupTopBox">
          <div className="GameDetailSharePopupShareBox" id="GameDetailSharePopupShareBox">
            <div className="GameDetailSharePopupShareBoxTop">
              <div className="GameDetailSharePopupShareBoxTopTeamBox">
                <LazyImageForTeam thisClassName="ShareTeamImage" Vendor={Vendor} TeamId={EventDetail.HomeTeamId} IconUrl={EventDetail.HomeIconUrl}/>
                <div className="ShareTeamName">{EventDetail.HomeTeamName}</div>
              </div>
              <div className="GameDetailSharePopupShareBoxTopLeagueBox">
                <div className="ShareLeagueName">{EventDetail.LeagueName}</div>
                <div className="ShareVS">VS</div>
              </div>
              <div className="GameDetailSharePopupShareBoxTopTeamBox">
                <LazyImageForTeam thisClassName="ShareTeamImage" Vendor={Vendor} TeamId={EventDetail.AwayTeamId} IconUrl={EventDetail.AwayIconUrl}/>
                <div className="ShareTeamName">{EventDetail.AwayTeamName}</div>
              </div>
            </div>
            <div className="GameDetailSharePopupShareBoxBottom">
              <div className="GameDetailSharePopupShareBoxBottomLeft">
                <div className="ShareLeagueName2">{EventDetail.LeagueName}</div>
                <div className="ShareVS2">{EventDetail.HomeTeamName}&nbsp;vs&nbsp;{EventDetail.AwayTeamName}</div>
              </div>
              <div className="GameDetailSharePopupShareBoxBottomRight">
                <QRCode value={shareUrl} renderAs="canvas" size={75} />
              </div>
            </div>
          </div>
        </div>
        <div className="GameDetailSharePopupBottomBox">
          <div className="GameDetailSharePopupBottomBoxTop">
            <div
              className="ShareButtonBox"
              onClick={() => {
                this.copyShareUrl(shareUrl);
              }}
            >
              <div className="ShareButton">
                <ReactSVG src="/img/svg/shareCopy.svg" />
              </div>
              <div className="ShareText">复制链接</div>
            </div>
            <div
              className="ShareButtonBox"
              onClick={() => {
                this.downloadShareImage(EventDetail);
              }}
            >
              <div className="ShareButton">
                <ReactSVG src="/img/svg/shareDownload.svg" />
              </div>
              <div className="ShareText">下载图片</div>
            </div>
          </div>
          <div className="GameDetailSharePopupBottomBoxBottom">
            <div
              className="ShareCancelText"
              onClick={this.props.hideSharePopup}
            >取消</div>
            <div className="ShareCancelBar">&nbsp;</div>
          </div>
        </div>
      </> : null}
    </ReactModal>
  }
}

export default SbShare;

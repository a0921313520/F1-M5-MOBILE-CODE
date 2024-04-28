/*
 * @Author: Alan
 * @Date: 2022-03-07 11:49:02
 * @LastEditors: Alan
 * @LastEditTime: 2023-02-02 17:10:05
 * @Description: Banner
 * @FilePath: \Mobile\src\components\Announcement\index.js
 */
import React from 'react';
import { ReactSVG } from '@/components/View/ReactSVG';
import Button from '@/components/View/Button';
import Modal from '@/components/View/Modal';
import { PopUpLiveChat, checkIsLogin } from '@/lib/js/util';
import { AnnouncementPopup } from '@/api/announcement';
import Flexbox from '@/components/View/Flexbox/';
import Checkbox from '@/components/View/Checkbox';
import { BsCheckSquareFill } from 'react-icons/bs';
import Toast from '@/components/View/Toast';
class WalletBanner extends React.Component {
  constructor() {
    super();
    this.state = {
      WalletCloseBanner: false,
      PopupContent: {},
      PopupVisible: false
    };
  }
  componentDidMount() {
    if (checkIsLogin()) {
      this.GetAnnouncementPopup();
    } else {
      this.setState({
        PopupVisible: false
      });
    }

    this.props.Check && this.props.Check(this);
  }

  /**
   * @description: 获取公告弹窗消息
   * @return {*}
   */

  GetAnnouncementPopup(type, Gameitem) {
    let optionType = this.props.optionType || type;

    if (optionType) {
      let hide;
      if (Gameitem) {
        hide = Toast.loading();
      }
      let params = {
        optionType: optionType == 'LiveCasino' ? 'Casino' : optionType
      };
      this.setState({
        Gameitem: Gameitem
      });
      AnnouncementPopup(params, (res) => {
        console.log(res);
        if (res.isSuccess) {
          Toast.destroy();
          if (JSON.stringify(res.result) != '{}' && res.result) {
            this.setState({
              PopupContent: res.result,
              PopupVisible: true
            });
          } else {
            if (Gameitem) {
              this.props.PlayGame(Gameitem);
            }
          }
        }
        Gameitem && hide();
      });
    }
  }

  /**
   * @description: 永久隐藏公告 除非清除缓存
   * @return {*}
   */
  setlocalStorage(PlayGame, Gameitem) {
    const { optionType, ProductPage } = this.props;
    let Page = ProductPage ? ProductPage : '';
    if (PlayGame && Gameitem) {
      localStorage.setItem(
        Gameitem.gameCatCode + 'HomeGamelocalStorageAnnouncement',
        true
      );
    } else {
      localStorage.setItem(
        Page + optionType + 'PagelocalStorageAnnouncement',
        true
      );
    }
  }

  /**
   * @description: 清除公告 不再显示 反选
   * @return {*}
   */
  clearlocalStorage(PlayGame, Gameitem) {
    const { optionType, ProductPage } = this.props;
    let Page = ProductPage ? ProductPage : '';
    if (PlayGame && Gameitem) {
      localStorage.removeItem(
        Gameitem.gameCatCode + 'HomeGamelocalStorageAnnouncement'
      );
    } else {
      localStorage.removeItem(
        Page + optionType + 'PagelocalStorageAnnouncement'
      );
    }
  }

  /**
   * @description: 临时关闭 公告  重新登录即可弹出
   * @return {*}
   */
  setsessionStorage(PlayGame, Gameitem) {
    const { optionType, ProductPage } = this.props;
    let Page = ProductPage ? ProductPage : '';
    if (PlayGame && Gameitem) {
      sessionStorage.setItem(
        Gameitem.gameCatCode + 'HomeGamelocalStorageAnnouncement',
        true
      );
    } else {
      sessionStorage.setItem(
        Page + optionType + 'PagelocalStorageAnnouncement',
        true
      );
    }
  }

  render() {
    const { PopupContent, PopupVisible, Gameitem } = this.state;
    const { PlayGame, optionType } = this.props;
    return (
      <>
        <>
          <Modal
            closable={true}
            onCancel={() => {
              this.setState({
                PopupVisible: false
              });
              if (PlayGame && Gameitem) {
                this.props.PlayGame(Gameitem);
              }
              this.setsessionStorage(PlayGame, Gameitem);
            }}
            className='commonModal Announcement-Modal'
            title='Thông Báo Quan Trọng'
            visible={PopupVisible}
          >
            {/* <center>
              <h3 dangerouslySetInnerHTML={{ __html: PopupContent.topic }} />
            </center>
            <br /> */}
            <center>
              <p dangerouslySetInnerHTML={{ __html: PopupContent.content }} />
            </center>
            <br />
            <Flexbox justifyContent='center'>
              <Checkbox
                icon={<BsCheckSquareFill color='#00A6FF' size={18} />}
                onChange={(value) => {
                  if (value) {
                    this.setlocalStorage(PlayGame, Gameitem);
                  } else {
                    this.clearlocalStorage(PlayGame, Gameitem);
                  }
                }}
                label='Không hiển thị trở lại'
              />
            </Flexbox>
            <br />
            <Button
              size='large'
              type='primary'
              onClick={() => {
                PopUpLiveChat();
              }}
            >
              <Flexbox alignItems='center' justifyContent='center'>
                <ReactSVG className='CSICON' src='/img/svg/cs.svg' />
                Liên Hệ Live Chat
              </Flexbox>
            </Button>
          </Modal>
        </>
      </>
    );
  }
}

export default WalletBanner;

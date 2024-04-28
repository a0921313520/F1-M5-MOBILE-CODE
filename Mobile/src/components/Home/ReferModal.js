import React from 'react';
import Router from 'next/router';
import Modal from '@/components/View/Modal/';
import { getUrlVars } from '@/lib/js/Helper';
import { connect } from 'react-redux';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import Button from '@/components/View/Button';
import { checkIsLogin } from '@/lib/js/util';
import ReactIMG from '@/components/View/ReactIMG';
import { PopUpLiveChat } from '@/lib/js/util';
import { ReactSVG } from '@/components/View/ReactSVG';
import LaunchGame from '@/components/Games/LaunchGame';
import Toast from '@/components/View/Toast';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import Flexbox from '@/components/View/Flexbox';
class ReferModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			//推荐好友 弹窗
			ReferPop: false
		};
	}
	componentDidMount() {
		this.CheckRef();
		if (checkIsLogin()) {
			this.setState({
				isLogin: true
			});

			this.ReferreeTaskStatus();
		} else {
			this.setState({
				isLogin: false
			});
		}
	}

	componentDidUpdate(nextProps) {
		if (this.props.userInfo.username !== nextProps.userInfo.username) {
			if (checkIsLogin()) {
				this.ReferreeTaskStatus();
			}
		}
	}

  /**
   * @description: 获取好友推荐来源 开启推荐还有弹窗
   * @return {*}
   */
  CheckRef() {
    var ReferCode = getUrlVars()["raf"];
    if (ReferCode) {
      // if (!sessionStorage.getItem('ReferCode')) {
      // 	this.ReferrerLinkActivity(ReferCode);
      // }
      sessionStorage.setItem("ReferCode", ReferCode);
      this.setState({
        ReferPop: true,
      });
    }
  }

	//获取推荐好友的状态
	GetThroughoutVerification() {
		if (!checkIsLogin()) {
			return;
		}
		Toast.loading();
		fetchRequest(ApiPort.ThroughoutVerification, 'POST')
			.then((data) => {
				Toast.destroy();
				let GameReferModal = localStorage.getItem(this.props.userInfo.memberInfo.userName + '_GameReferModal');
				if (GameReferModal) {
					return;
				}
				if (data.isSuccess && data.result) {
					this.setState({
						GameOpenModal: true
					});
				} else {
					//重置修改密码后，才弹下面的窗口，否则不弹
					if (data.errors && data.errors[0].errorCode == 'VAL99903') {
						return;
					}
					//弹出不符合资格弹窗
					this.setState({
						Referineligible: true
					});
				}
				this.setState({
					ReferPop: false
				});
			})
			.catch((error) => {
				console.log(error);
			});
	}
	/**
	* @description: 推荐好友状态
  	* @return {*}
  	*/

	ReferreeTaskStatus = () => {
		if (!checkIsLogin()) {
			return;
		}
		let displayReferee = localStorage.getItem(this.props.userInfo.memberInfo.userName + '_displayReferee');
		if (this.props.userInfo.memberInfo && this.props.userInfo.memberInfo.displayReferee && !displayReferee) {
			this.setState({
				ReferPop: true
			});
		}
		fetchRequest(ApiPort.ReferreeTaskStatus, 'GET')
			.then((data) => {
				//Toast.destroy();
				if (data.isSuccess) {
					this.setState({
						isDeposited: data.result.isDeposited,
						isContactVerified: data.result.isContactVerified,
						isRegistered: true
					});

					this.props.userInfo_getDetails().then((memberInfo) => {
						if (memberInfo) {
							if (
								data.result.isActiveCampaign &&
								data.result.isContactVerified &&
								!memberInfo.displayReferee
							) {
								this.GetThroughoutVerification();
							}
						}
					});
				}
			})
			.catch((error) => {
				console.log(error);
			});
	};

  ReferrerLinkActivity(referCode) {
    let data = {
      ReferrerId: referCode,
      LandingPage: ApiPort.LOCAL_HOST,
      BrowserType: this.getBrowser().BrowserType,
      BrowserName: this.getBrowser().BrowserName,
      BrowserVersion: this.getBrowser().BrowserVersion,
      BrowserPlatform: navigator.platform,
      UserAgent: navigator.userAgent,
      HttpReferer: ApiPort.LOCAL_HOST + "/?raf=" + referCode,
    };

    fetchRequest(ApiPort.ReferrerLinkActivity, "POST", data)
      .then((data) => {
        if (data.isSuccess) {
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  /**
   * @description: 获取设备信息
   * @return {*}
   */

  getBrowser = () => {
    var browser = {
        msie: false,
        firefox: false,
        opera: false,
        safari: false,
        chrome: false,
        netscape: false,
        appname: "unknown",
        version: 0,
      },
      ua = window.navigator.userAgent.toLowerCase();
    if (/(msie|firefox|opera|chrome|netscape)\D+(\d[\d.]*)/.test(ua)) {
      browser[RegExp.$1] = true;
      browser.appname = RegExp.$1;
      browser.version = RegExp.$2;
    } else if (/version\D+(\d[\d.]*).*safari/.test(ua)) {
      // safari
      browser.safari = true;
      browser.appname = "safari";
      browser.version = RegExp.$2;
    }
    return {
      BrowserType: browser.appname + browser.version,
      BrowserName: browser.appname,
      BrowserVersion: browser.version,
    };
  };

	/**
	 * @description: 写入打开Referee弹窗的状态
	 * @return {*}
  	*/

	SetdisplayRefereeStatus() {
		localStorage.setItem(this.props.userInfo.memberInfo.userName + '_displayReferee', true);
	}

	ClearHideRefereeStatus() {
		localStorage.removeItem(this.props.userInfo.memberInfo.userName + '_displayReferee');
	}

	render() {
		const {
			isLogin,
			isDeposited,
			isContactVerified,
			isRegistered,
			ReferPop,
			GameOpenModal,
			Referineligible
		} = this.state;
		const { Page } = this.props;
		console.log(isLogin + '---------------' + isContactVerified);
		console.log('充值状态---------->', isDeposited);
		return (
			<div>
				<Modal
					visible={
						ReferPop &&
						Page &&
						(Page == 'Home' || Page == 'Deposit' || Page == 'Me' || Page == 'Withdrawal')
					}
					className="referPop"
					maskClosable={false}
					onCancel={() => {
						this.setState({
							ReferPop: false
						});
						this.SetdisplayRefereeStatus();
					}}
				>
					<div>
						<p className="title">Thưởng Đăng Ký Đang Chờ Đón Bạn!</p>
						<div className="step">
							<div className="card">
								<div className="float_left">
									<p>Bước 1</p>
									<p className="txt">Nhấp "Đăng Ký Ngay" để trở thành thành viên của chúng tôi</p>
									<Button
										className="blueBtn"
										onClick={() => {
											// Pushgtagdata(`referral`, 'Click', `Registernow_referral`);
											if (!isRegistered) {
												Router.push('/register_login?type=Register');
											}
										}}
										style={{ backgroundColor: !isLogin && !isRegistered ? '#1C8EFF' : '#CCCCCC' }}
									>
										Đăng Ký Ngay
									</Button>
								</div>
								<span className={isRegistered ? 'checked' : 'check'} />
							</div>
							<div className="card">
								<div className="float_left">
									<p>Bước 2</p>
									<p className="txt">Tiến hành gửi tiền vào tài khoản</p>
									<Button
										className="blueBtn"
										onClick={() => {
											// Pushgtagdata(`referral`, 'Click', `Depositnow_referral`);
											if (Page == 'Deposit') {
												this.setState({
													ReferPop: false
												});
												this.SetdisplayRefereeStatus();
												return;
											}

											if (isLogin && isDeposited === false) {
												if (Page == 'Deposit') {
													this.SetdisplayRefereeStatus();
												}
												Router.push('/deposit');
											}
										}}
										key={JSON.stringify(isDeposited)}
										style={{
											backgroundColor: isLogin && isDeposited === false ? '#1C8EFF' : '#CCCCCC'
										}}
									>
										Gửi Tiền Ngay
									</Button>
								</div>
								<span className={isDeposited ? 'checked' : 'check'} />
							</div>
							<div className="card">
								<div className="float_left">
									<p>Bước 3</p>
									<p className="txt">Xác thực số điện thoại và email</p>
									<Button
										className="blueBtn"
										onClick={() => {
											// Pushgtagdata(`referral`, 'Click', `Verifynow_referral`);
											if (isLogin && !isContactVerified) {
												this.SetdisplayRefereeStatus();
												Router.push('/me/account-info');
												sessionStorage.setItem('RefereeVerify', 'TRUE');
											}
										}}
										key={JSON.stringify(isContactVerified)}
										style={{
											backgroundColor: isLogin && !isContactVerified ? '#1C8EFF' : '#CCCCCC'
										}}
									>
										Xác Thực Ngay
									</Button>
								</div>
								<span className={isContactVerified ? 'checked' : 'check'} />
							</div>
						</div>
						<div
							onClick={() => {
								// Pushgtagdata(`referral`, 'Click', `Close_referral`);
								this.setState({
									ReferPop: false
								});
								this.SetdisplayRefereeStatus();
							}}
							className="close"
						>
							Đóng
						</div>
					</div>
				</Modal>

				<Modal
					visible={GameOpenModal}
					className="ReferModal"
					maskClosable={false}
					onCancel={() => {
						this.setState({
							GameOpenModal: false
						});
						localStorage.setItem(this.props.userInfo.memberInfo.userName + '_GameReferModal', 'TRUE');
					}}
				>
					<React.Fragment>
						<center>
							<ReactSVG className="referGame" src="/img/svg/icon-reject.svg" />
							<h3 style={{ paddingTop: '10px' }}>恭喜您 ！</h3>
						</center>
						<div className="note" style={{ textAlign: 'left' }}>
							完成推荐好友活动条件，彩金将在24小时内到帐。
						</div>
						<h4>推荐游戏</h4>
						<br />
						<div className="GameReferImg">
							<LaunchGame
								item={{
									type: 'Game',
									name: '乐体育',
									code: 'SB2',
									imageUrl: `${process.env.BASE_PATH}` + '/img/game3.jpg',
									isMaintenance: true,
									isTournament: false,
									isHot: false,
									isNew: false
								}}
								GameType={'Sportsbook'}
								Category={''}
								height={'auto'}
							/>
							<LaunchGame
								item={{
									type: 'Game',
									name: '热门游戏',
									code: 'AVIATOR',
									imageUrl: `${process.env.BASE_PATH}` + '/img/game1.jpg',
									isMaintenance: false,
									isTournament: false,
									isHot: true,
									isNew: false
								}}
								GameType={'InstantGames'}
								Category={''}
								height={'auto'}
							/>
							<LaunchGame
								item={{
									type: 'Category',
									name: '至尊堂（AG）',
									code: 'AG',
									imageUrl: `${process.env.BASE_PATH}` + '/img/game2.jpg',
									isMaintenance: false,
									isTournament: false,
									isHot: false,
									isNew: false,
									gameCatCode: 'LiveCasino',
									gameCatId: 124
								}}
								GameType={'LiveCasino'}
								Category={{
									gameCatId: 124,
									gameCatCode: 'Casino'
								}}
								height={'auto'}
							/>
						</div>
					</React.Fragment>
				</Modal>

				<Modal
					visible={Referineligible}
					className="VerificationBankModal"
					maskClosable={false}
					onCancel={() => {
						this.setState({
							Referineligible: false
						});
					}}
				>
					<React.Fragment>
						<center>
							<ReactIMG src="/img/verify/warn.png" />
							<h3 style={{ paddingTop: '10px' }}>不符合资格</h3>
						</center>
						<div className="note" style={{ textAlign: 'left' }}>
							抱歉，目前您的账户不符合推荐好友活动的资格。请尝试申请其他优惠，或联系在线客服咨询。
						</div>
						<Flexbox>
							<Flexbox flex="1" margin="10px">
								<Button
									className="Btn-Common"
									onClick={() => {
										this.setState({
											Referineligible: false
										});
										localStorage.setItem(
											this.props.userInfo.memberInfo.userName + '_GameReferModal',
											'TRUE'
										);
									}}
									ghost
								>
									关闭
								</Button>
							</Flexbox>
							<Flexbox flex="1" margin="10px">
								<Button
									className="Btn-Common active"
									onClick={() => {
										PopUpLiveChat();
									}}
								>
									联系在线客服
								</Button>
							</Flexbox>
						</Flexbox>
					</React.Fragment>
				</Modal>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
  userInfo: state.userInfo,
});
const mapDispatchToProps = {
	userInfo_getDetails: () => ACTION_User_getDetails()
};
export default connect(mapStateToProps, mapDispatchToProps)(ReferModal);

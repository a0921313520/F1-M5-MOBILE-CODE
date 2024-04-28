import Drawer from '$SBTWO/Drawer';
import Popover from '$SBTWO/Popover';
import { ReactSVG } from '$SBTWO/ReactSVG';
import Router from 'next/router';
import { fetchRequest } from '$SBTWOLIB/SportRequest';
import { ApiPort } from '$SBTWOLIB/SPORTAPI';
import Toast from '$SBTWO/Toast';
import RecommendRace from './Recommend';
import VendorBTI from '$SBTWOLIB/vendor/bti/VendorBTI';
import VendorIM from '$SBTWOLIB/vendor/im/VendorIM';
import HostConfig from '@/server/Host.config';
import { backToMainsite } from '$SBTWOLIB/data/userinfo';
import { getMemberStorageKey } from '$SBTWOLIB/js/util';
import { numberWithCommas, cutTail, checkIsLogin, redirectToDeposit } from '$SBTWOLIB/js/util';
import { connect } from 'react-redux';
import React from 'react';
import { ACTION_UserSetting_ToggleListDisplayType } from '@/lib/redux/actions/UserSettingAction';
import EventData from '$SBTWOLIB/vendor/data/EventData';
import CallApp from 'callapp-lib';
import { getAffParam } from '$SBTWOLIB/js/Helper';
import ReactIMG from '$SBTWO/ReactIMG';
import { redirectToLogin } from '$SBTWOLIB/js/util';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import classNames from 'classnames';

class Slider extends React.Component {
	constructor() {
		super();
		this.state = {
			isShow1: true, //通知tip
			isShow2: true, //热门赛事tip
			isShow3: true, //推送设置tip
			isShow4: true, //維修時間表 已隱藏 暫時用不到
			isShow5: true, //盤口顯示切換
			isShow6: true, //新手教程,
			userName: '',
			hotEventsVisible: false,
			hotEvents: [],
			setOpen: true,
			tutorialOpen: true
		};

		this.timer = null; // 如果热门赛事显示，倒计时3秒隐藏。
		this.goPage = this.goPage.bind(this);
		this.showHotEvents = this.showHotEvents.bind(this);
	}
	componentDidMount() {
		//給上層的header使用
		this.props.connectShowHotEvents(this.showHotEvents);

		//處理小提示窗展示邏輯，有點過叉就不展示
		const sidebar_tip_status = this._getSidebarStatus();
		this.setState({ ...sidebar_tip_status });

		this.setState({
			userName: localStorage.getItem('username') ? JSON.parse(localStorage.getItem('username')) : ''
		});

		const affParam = getAffParam();

		const callAppOptions = {
			scheme: {
				protocol: 'f1m1p5'
			},
			appstore: '/vn/mobile/Appinstall.html' + affParam,
			fallback: '/vn/mobile/Appinstall.html' + affParam,
			timeout: 2000
		};

		this.callApplib = new CallApp(callAppOptions);
	}
	componentWillUnmount() {
		clearTimeout(this.timer);
	}

	_getSidebarStatus() {
		let result;
		const sidebar_tip_status_json = localStorage.getItem(getMemberStorageKey('sidebar_tip_status'));
		if (sidebar_tip_status_json) {
			result = JSON.parse(sidebar_tip_status_json);
		} else {
			//沒點過
			result = {
				isShow1: true, //通知tip
				isShow2: true, //热门赛事tip
				isShow3: true, //推送设置tip
				isShow4: true, //維修時間表 已隱藏 暫時用不到
				isShow5: true, //盤口顯示切換
				isShow6: true //新手教程
			};
		}
		//guest view 只有熱門賽事+盤口顯示有tip，其他全部false
		if (!checkIsLogin()) {
			result.isShow1 = false;
			//result.isShow2 = false; //热门赛事tip 不用動
			result.isShow3 = false;
			result.isShow4 = false;
			//result.isShow5 = false; //盤口顯示tip 不用動
			//result.isShow6 = false //新手教程tip
		}

		return result;
	}

	//處理小提示窗 點叉
	clickSidebarTip(index) {
		const stateName = 'isShow' + index;
		let setStateObj = {};
		setStateObj[stateName] = false;
		this.setState(setStateObj);

		let sidebar_tip_status = this._getSidebarStatus();
		sidebar_tip_status[stateName] = false;

		localStorage.setItem(getMemberStorageKey('sidebar_tip_status'), JSON.stringify(sidebar_tip_status));
	}

	checkMaintenanceStatus = (name) => {
		const { isBTI, isIM, isSABA, noTokenBTI, noTokenIM, noTokenSABA } = this.props.maintainStatus;
		const { isLogin } = this.props.userInfo; //有登入才額外判斷 token獲取狀態
		switch (name) {
			case 'bti':
				return isBTI || (isLogin && noTokenBTI);
			case 'im':
				return isIM || (isLogin && noTokenIM);
			case 'saba':
				return isSABA || (isLogin && noTokenSABA);
			default:
				return false;
		}
	};

	showHotEvents(autoClose = true) {
		const { hotEventsVendorName } = this.props;
		//維護就不展示
		if (this.checkMaintenanceStatus(hotEventsVendorName)) {
			//true表示維護中
			return;
		}

		//在點擊按鈕時 才查詢
		let hideLoading = Toast.loading();
		fetch(HostConfig.Config.CacheApi + '/hotevents/' + hotEventsVendorName)
			.then((response) => response.json())
			.then((jsonData) => {
				jsonData.data = jsonData.data.map((ev) => EventData.clone(ev)); //需要轉換一下
				console.log('hot events ', jsonData.data);

				//有數據才展示彈窗
				const hotEventsVisible = jsonData.data && jsonData.data.length > 0;
				if (autoClose) {
					hotEventsVisible &&
						(this.timer = setTimeout(() => {
							this.setState({ hotEventsVisible: false }, () => {
								this.props.onHotEventsClosed();
							});
						}, 3000));
				}
				this.setState({ hotEvents: jsonData.data, hotEventsVisible });
			})
			.catch(() => null)
			.finally(() => {
				hideLoading();
			});
	}

	goPage(url) {
		if (url == '/sbtwo/hotgame' || url == '/sbtwo/promotion') {
			Toast.success('即將到來');
			return;
		}

		this.props.onClose();

		const gotoUrl =
			checkIsLogin() ||
			url === '/sbtwo/rule' ||
			url === '/sbtwo/tutorial/handicap' ||
			url === '/sbtwo/tutorial/bet' ||
			url === '/sbtwo';

		if (gotoUrl) {
			Router.push(url);
		} else {
			redirectToLogin();
		}
	}

	render() {
		console.log(this.props);
		const { setOpen, tutorialOpen } = this.state;
		return (
			<React.Fragment>
				<RecommendRace
					Vendor={this.props.hotEventsVendorName === 'im' ? VendorIM : VendorBTI}
					visible={this.state.hotEventsVisible}
					hotEvents={this.state.hotEvents}
					onClose={() => {
						this.setState({ hotEventsVisible: false }, () => {
							this.props.onHotEventsClosed();
						});
					}}
				/>
				<Drawer
					style={this.props.isFirstEntry ? { width: '100%', transition: 'none' } : { width: '100%' }}
					onClose={this.props.onClose}
					visible={this.props.isSliderVisible}
				>
					<div className="sport-drawer-wrapper">
						<div className="sport-logo">
							<ReactSVG className="logo" src="/img/svg/Fun88Logo.svg" />
						</div>
						{/*
                            用户名太长超过10个字元的话将会是以 "..."  这样表示："1234567890..."   <==這樣是10
                            钱包金额最大到 123,456,789.00 加上小数点。若大于此数字，后面加上 “...” <==這樣是14
                        */}
						{this.props.isLogin ? (
							<div className="slider-user-brief has-login">
								<span className="sport-username">
									{cutTail(this.props.userName || this.state.userName, 10)}
								</span>
								<span className="sport-money">
									<i>￥</i>
									<span>{cutTail(numberWithCommas(this.props.balanceSB), 14)}</span>
								</span>
							</div>
						) : (
							<div className="slider-user-brief font-size-16">欢迎, 访客参访中...</div>
						)}
						<div className="border" />
						{//歐洲杯頭部
						HostConfig.Config.isEUROCUP2021 ? (
							<ReactIMG
								className="EUROCUP-slider-banner"
								src="/img/20210603/BGHomeHeader.jpg"
								onClick={() => {
									// Pushgtagdata(`Engagement Event`, 'Launch', 'Enter_EUROPage');
									window.location.href = '/ec2021';
								}}
							/>
						) : null}
						<ul className="sport-list">
							<li
								className="slider-item deposit"
								onClick={() => {
									// Pushgtagdata(`Deposit Nav`, 'Click', `Deposit_Sidenav_SB2.0`);
									redirectToDeposit();
								}}
							>
								<span>存款</span>
							</li>
							<li
								className="slider-item transfer"
								onClick={() => {
									if (global.hasSelfExclusion && global.hasSelfExclusion(2)) {
										return;
									}
									// Pushgtagdata(`Transfer Nav`, 'Click', `Transfer_Sidenav_SB2.0`);
									Router.push('/sbtwo/transfer');
								}}
							>
								<span>转账</span>
							</li>
							<div className="border" />
							<li
								className="slider-item notice"
								onClick={() => {
									// Pushgtagdata(`Account`, 'Click', `Notification_Sidenav_SB2.0`);
									this.goPage('/sbtwo/information');
								}}
							>
								<span className="news-wrap">
									<span>通知</span>
									{this.props.isLogin &&
									(this.props.StatisticsAll == 0 || this.props.StatisticsAll) && (
										<span className="news-count">
											<span className="counter">{this.props.StatisticsAll}</span>
										</span>
									)}
								</span>

								<Popover
									className="slider-prompt"
									visible={this.state.isShow1}
									onClose={() => {
										this.clickSidebarTip(1);
									}}
								>
									<div className="sport-popower-wrapper">查看赛事通知</div>
								</Popover>
							</li>

							<li
								className="slider-item hot-race"
								onClick={() => {
									this.showHotEvents(false); //點擊觸發的不自動關閉
									this.props.onClose();
									// Pushgtagdata(`Game Nav`, 'Click', `HotMatches_Sidenav_SB2.0`);
								}}
							>
								<span>热门赛事</span>
								<Popover
									className="slider-prompt"
									visible={this.state.isShow2}
									onClose={() => {
										this.clickSidebarTip(2);
									}}
								>
									<div className="sport-popower-wrapper">推荐热门赛事</div>
								</Popover>
							</li>
							<div className="border" />
							{/*<li*/}
							{/*    className="slider-item fun88-free-prize"*/}
							{/*    onClick={() => {*/}
							{/*        this.goPage("/sbtwo/promotion");*/}
							{/*    }}*/}
							{/*>*/}
							{/*    <span>乐天堂体育免费彩金</span>*/}
							{/*</li>*/}
							<li className="slider-item fun88-setting not-cursor">
								<span>设置</span>
								<span
									className="UpDownIcon"
									onClick={() => {
										this.setState({
											setOpen: !this.state.setOpen
										});
									}}
								>
									{!setOpen && <BsChevronDown size="17" color="#222222" />}
									{setOpen && <BsChevronUp size="17" color="#222222" />}
								</span>
								<ol
									className={classNames(
										{
											Hide: !setOpen
										},
										'static-item'
									)}
								>
									<li className="toggle-wrapper not-cursor">
										<div>盘口显示</div>
										<div className="Switchcontainer">
											<label>
												<input
													className="Game-switch"
													type="checkbox"
													hidden
													checked={this.props.userSetting.ListDisplayType === 2}
													readOnly="readOnly"
												/>
												<div
													className="Game-switch-text"
													onClick={() => {
														this.props.toggleListDisplayType();
														// if (this.props.userSetting.ListDisplayType === 2) {
														// 	Pushgtagdata(
														// 		`Navigation`,
														// 		'Click',
														// 		`VerticalDisplay_Sidenav_SB2.0`
														// 	);
														// } else {
														// 	Pushgtagdata(
														// 		`Navigation`,
														// 		'Click',
														// 		`HorizontalDisplay_Sidenav_ SB2.0`
														// 	);
														// }
													}}
												>
													<span>纵向</span>
													<span>横向</span>
												</div>
											</label>
										</div>
										{setOpen && (
											<Popover
												className="slider-prompt2"
												direction="top"
												visible={this.state.isShow5}
												onClose={() => {
													this.clickSidebarTip(5);
												}}
											>
												<div className="sport-popower-wrapper">盘口显示功能</div>
											</Popover>
										)}
									</li>
									<li
										onClick={() => {
											this.goPage('/sbtwo/setting/system');
											// Pushgtagdata(`Account`, 'Click', `Setting_Sidenav_SB2.0`);
										}}
									>
										系统设置
									</li>
									<li
										onClick={() => {
											this.goPage('/sbtwo/setting/push');
											// Pushgtagdata(`Account`, 'Click', `NotificationSetting_Sidenav_ SB2.0`);
										}}
									>
										<span>推送设置</span>
										{setOpen && (
											<Popover
												className="slider-prompt"
												visible={this.state.isShow3}
												onClose={() => {
													this.clickSidebarTip(3);
												}}
											>
												<div className="sport-popower-wrapper">赛事进球推送设置</div>
											</Popover>
										)}
									</li>
								</ol>
							</li>
							{/* <li className="slider-item maintain-time not-cursor">
                                <span>维修时间表</span>
                                <ol className="table-item">
                                    <li>
                                        <span>8/27</span>
                                        <span>沙巴</span>
                                        <span>15:30-16:00</span>
                                        <span className="slider-sport-maintain">维修中</span>
                                    </li>
                                    <li>
                                        <span>8/27</span>
                                        <span>沙巴</span>
                                        <span>15:30-16:00</span>
                                    </li>
                                    <li>
                                        <span>8/27</span>
                                        <span>沙巴</span>
                                        <span>15:30-16:00</span>
                                    </li>
                                </ol>
                                <Popover
                                    style={{ left: '3.2rem' }}
                                    className="slider-prompt"
                                    visible={this.state.isShow4}
                                    onClose={() => {
                                        this.clickSidebarTip(4);
                                    }}
                                >
                                    <div className="sport-popower-wrapper">体育平台维修时间表</div>
                                </Popover>
                            </li> */}
							<div className="border" />
							<li
								className="slider-item bet-rule"
								onClick={() => {
									this.goPage('/sbtwo/rule');
									// Pushgtagdata(`Navigation`, 'Click', `BettingRules_Sidenav_SB2.0`);
								}}
							>
								<span>投注规则</span>
							</li>
							<li className="slider-item user-tutorial not-cursor">
								<span>新手教程</span>
								<span
									className="UpDownIcon"
									onClick={() => {
										this.setState({
											tutorialOpen: !this.state.tutorialOpen
										});
									}}
								>
									{!tutorialOpen && <BsChevronDown size="17" color="#222222" />}
									{tutorialOpen && <BsChevronUp size="17" color="#222222" />}
								</span>
								<Popover
									className="slider-prompt"
									visible={this.state.isShow6}
									onClose={() => {
										this.clickSidebarTip(6);
									}}
								>
									<div className="sport-popower-wrapper">新手教程讲解</div>
								</Popover>
								<ol
									className={classNames(
										{
											Hide: !tutorialOpen
										},
										'static-item'
									)}
								>
									<li
										onClick={() => {
											this.goPage('/sbtwo/tutorial/handicap');
											// Pushgtagdata(`Navigation`, 'Click', `OddsTutorial_Sidenav_SB2.0`);
										}}
									>
										<span>盘口教程</span>
									</li>
									<li
										onClick={() => {
											this.goPage('/sbtwo/tutorial/bet');
											// Pushgtagdata(`Navigation`, 'Click', `BetTutorial_Sidenav_SB2.0`);
										}}
									>
										<span>投注教程</span>
									</li>
								</ol>
							</li>
							{/* <li
								className="slider-item open-app"
								onClick={() => {
									Pushgtagdata(`Download Nav`, 'Click', `Download_SideMenu`);
									this.callApplib.open({ path: '' });
								}}
							>
								<span>打开乐天堂APP</span>
							</li> */}
							<div className="border" />
							<li
								className="slider-item back-fun88"
								onClick={() => {
									Router.push('/');
									// Pushgtagdata(`Navigation`, 'Click', `Back_MainSite_SB2.0_Sidenav`);
								}}
							>
								<span>返回乐天堂</span>
							</li>
						</ul>
						<div className="sport-close" onClick={this.props.onClose}>
							<ReactSVG className="wrapper-class-name" src="/img/svg/icon-close.svg" />
						</div>
					</div>
				</Drawer>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo,
	userSetting: state.userSetting,
	maintainStatus: state.maintainStatus
});

const mapDispatchToProps = {
	toggleListDisplayType: () => ACTION_UserSetting_ToggleListDisplayType()
};

export default connect(mapStateToProps, mapDispatchToProps)(Slider);

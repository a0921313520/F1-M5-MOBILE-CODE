import React, { Component } from 'react';
import Tabs, { TabPane } from 'rc-tabs';
import Layout from '@/components/Layout';
import TabRegister from '@/components/register_login/TabregisteredBak';
import LoginTab from '@/components/register_login/LoginTab';
import Toast from '@/components/View/Toast';
import Modal from '@/components/View/Modal';
import Router from 'next/router';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import { connect } from 'react-redux';
import {
	ACTION_UserInfo_getBalance,
	ACTION_UserInfo_login,
	ACTION_User_getDetails,
	ACTION_UserInfo_logout
} from '@/lib/redux/actions/UserInfoAction';
import Service from '@/components/Header/Service';
import { ACTION_UserSetting_Update } from '@/lib/redux/actions/UserSettingAction';
import ReactIMG from '@/components/View/ReactIMG';
import { setIsLogin, getE2BBValue, setIsLogout, PopUpLiveChat, redirectToLogin } from '@/lib/js/util';
import { getUrlVars } from '@/lib/js/Helper';

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			key: '1',
			isWrongMarket:false, //帳密是否錯誤導致登入失敗,
			isPasswordIncorrect:false, //是否登入時密碼錯誤
			confiscatedAcc: false
		};
		this.fromUrl = null;
	}

	componentDidMount() {
		// 清空redux內的userInfo資料
		this.props.userInfo_logout();
		
		const urlVars = getUrlVars();

		if (urlVars && urlVars.type == 'Register') {
			this.changeTabKey('2');
		}

		if (urlVars && urlVars.from) {
			console.log('===login urlVars.from', urlVars.from);
			if (urlVars.from === 'sb20') {
				//從sb2.0來的 要返回去
				this.fromUrl = '/sbtwo';
			}
			if (urlVars.from === 'event_Anniversary') {
				this.fromUrl = '/event_15Anni';
			}
		}
	}

	changeTabKey = (key) => {
		this.setState({
			key: key,
			isWrongMarket:false,
			isPasswordIncorrect:false,
			confiscatedAcc: false
		});
		if(key==="1"){
			Pushgtagdata("Register", "Switch to Login", "Register_C_Login");
		}
		if(key==="2"){
			Pushgtagdata(`Login`, 'Switch to Register', `Login_C_Register`);
		}
	};


	PushLoginPiwik = (result) => {
		Pushgtagdata(
			`Login`, 
			'Password Login', 
			`Login_S_Login`,
			result ? 2 : 1, 
			[{
				customVariableKey: result ? false : "Login_S_Login_ErroMsg",
				customVariableValue: result ? false : "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้องโปรดลองอีกครั้ง!" 
			}]
		);
	}

	postLogin = (name, pwd, isFirstLogin) => {
		this.setState({
			isPasswordIncorrect:false,
			isWrongMarket:false,
			confiscatedAcc: false
		})
		let postData = {
			hostName: window.location.origin,
			grantType: 'password',
			clientId: 'Fun88.VN.App',
			clientSecret: 'FUNmuittenVN',
			scope: 'Mobile.Service offline_access',
			appId: 'net.funpodium.fun88',
			siteId: 38,
			username: name,
			password: pwd,
			e2: getE2BBValue()
		};
		Toast.loading('Đang đăng nhập, vui lòng đợi...');
		fetchRequest(ApiPort.Login, 'POST', postData)
			.then(async (data) => {
				Toast.destroy();
				if (data.isSuccess && data.result.memberInfo?.currency==="VND") {
					setIsLogin();
					ApiPort.Token = data.result.accessToken.tokenType + ' ' + data.result.accessToken.accessToken;
					localStorage.setItem(
						'memberToken',
						JSON.stringify(data.result.accessToken.tokenType + ' ' + data.result.accessToken.accessToken)
					);
					localStorage.setItem('refreshToken', JSON.stringify(data.result.accessToken.refreshToken));
					!isFirstLogin && this.PushLoginPiwik(true)
					this.setState({isWrongMarket:false})
					localStorage.setItem(
						'memberToken',
						JSON.stringify(data.result.accessToken.tokenType + ' ' + data.result.accessToken.accessToken)
					);
					localStorage.setItem('refreshToken', JSON.stringify(data.result.accessToken.refreshToken));
					this.props.userInfo_getDetails();
					this.props.userInfo_login('',!!isFirstLogin);
					//获取用户的余额
					this.props.userInfo_getBalance(true);
					//清除错误登录次数（滑动验证）
					if (localStorage.getItem(`${name}_errorTimes`)) {
						localStorage.removeItem(`${name}_errorTimes`);
					}
					
					//刷新令牌
					window.RefreshTokensetInterval = setInterval(() => {
						this.RefreshToken();
					}, 3300000);
					if (this.fromUrl) {
						Router.push(this.fromUrl);
					} else {
						Router.push('/').then(()=>{Toast.success(`Chào mừng bạn: ${name}`, 3)});
					}		
				} else {
					if(data?.result?.memberInfo?.currency && data.result.memberInfo?.currency!=="VND"){
						!isFirstLogin && this.PushLoginPiwik(false)
						// hide();
						this.setState({isWrongMarket:true})
						return
					}else if(data.result?.error_details?.code==="MEM00059"){  //密碼錯誤
						// hide();
						this.SeterrorTimes(name, data);
						this.setState({isPasswordIncorrect:true})
						return
					}else if(data.result?.errorCode ==="MEM00141"){ 
						this.setState({confiscatedAcc:true})
						return
					}else if(data.result?.errorCode==="MEM00060" || data.errors[0]?.errorCode==="MEM00061" ){
						Modal.info({
							wrapClassName:`loginFailModal`,
							className:'commonModal ConfirmModal noRAFModal ',
							type:"confirm",
							imageType:"info",
							closable:true,
							title: data.result?.errorCode==="MEM00060" ? "Vượt Quá Số Lần Đăng Nhập" : "Tài Khoản Vô Hiệu Hoá ",
							okText:"Liên Hệ Live Chat",  //聯絡服務人員
							onlyOKBtn:true,
							dontDestroyOk:true,
							onOk:PopUpLiveChat,
							content:(
								data.result?.errorCode==="MEM00060" ? (
									<div><ReactIMG src={'/img/verify/warn.png'}/><p>Bạn đăng nhập thất bại 5 lần, vui lòng liên hệ Live Chat để được hỗ trợ</p></div> //登入嘗試超過五次
									) : (
									<div><ReactIMG src={'/img/verify/warn.png'}/><p>Tài khoản của bạn không thể sử dụng, vui lòng liên hệ với Bộ phận chăm sóc khách hàng!</p></div> //登入嘗試超過五次

								)
							)
						})
						// hide()
						return;
					}else{
						!isFirstLogin && this.PushLoginPiwik(false)
						this.setState({isWrongMarket:true})
						this.SeterrorTimes(name, data);
						// hide();
					}
				}
			})
			.catch((error) => {
				// hide();
				// this.setState({isWrongMarket:false})
				// this.SeterrorTimes(name, error);
				// console.log('登录失败:', error);
			});
	};

	/**
  	* @description: 错误登录次数（滑动验证）
  	* @param {*} name
  	* @return {*}
  	*/
	SeterrorTimes(name, res) {
		let times = localStorage.getItem(`${name}_errorTimes`);
		if (times) {
			localStorage.setItem(`${name}_errorTimes`, String(Number(times) + 1));
		} else {
			localStorage.setItem(`${name}_errorTimes`, '1');
		}
		if (res.result.error_description!=="Authentication Failed") {
			Toast.error(res.result.error_details.message || 'Lỗi hệ thống，liên Hệ Live Chat', 2);
		}
	}
	/**
  * @description: 定时刷新令牌
  * @param {*}
  * @return {*}
  */
	RefreshToken = () => {
		var rstoken = JSON.parse(localStorage.getItem('refreshToken'));
		const postData = {
			grantType: 'refresh_token',
			clientId: 'Fun88.VN.App',
			clientSecret: 'FUNmuittenVN',
			refreshToken: rstoken
		};

		fetchRequest(ApiPort.RefreshTokenapi, 'POST', postData)
			.then((res) => {
				if (res.isSuccess && res.result) {
					if (res.result.accessToken && res.result.refreshToken) {
						localStorage.setItem('memberToken', JSON.stringify('Bearer ' + res.result.accessToken));
						ApiPort.Token = 'Bearer ' + res.result.accessToken;
						localStorage.setItem('refreshToken', JSON.stringify(res.result.refreshToken));
					} else {
						Toast.error('Vui lòng đăng nhập lại, quyền truy cập đã hết hạn', 3);
						setIsLogout();
						redirectToLogin();
					}
				}
			})
			.catch((error) => {
				console.log(error);
			});
	};

	render() {
		const { key, isWrongMarket, isPasswordIncorrect, confiscatedAcc } = this.state;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				status={0}
			>
				<div className="login__wrap">
					{/* <ReactSVG
						className="back-icon"
						src="/svg/LeftArrow.svg"
						onClick={() => {
							Router.back();
						}}
					/> */}
					<div
						className="login-cs-icon"
						onClick={() => {
							Pushgtagdata(`${key==="1" ? "Login" : "Register"}`,
							'Contact CS', 
							`${key==="1" ? "Login" : "Register"}_C_CS`);
						}}
					>
						<Service />
					</div>
					<ReactIMG className="login__header__img" src={`/img/P5/Login/${key}.jpg`} />

					<div className="login__main">
						<Tabs prefixCls="tabsOvalLogin" defaultActiveKey={key} key={key} onChange={this.changeTabKey}>
							<TabPane tab="Đăng Nhập" key="1">
								<LoginTab
									postLogin={(name, pwd) => {
										this.postLogin(name, pwd);
									}}
									tabKey={key}
									isWrongMarket={isWrongMarket}
									isPasswordIncorrect={isPasswordIncorrect}
									confiscatedAcc={confiscatedAcc}
									initHeadErrorMsg={()=>{
										this.setState({
											isWrongMarket:false,
											isPasswordIncorrect: false,
											confiscatedAcc: false
										})
									}}
								/>
							</TabPane>
							<TabPane tab="Đăng Ký" key="2">
								<TabRegister
									postLogin={(name, pwd, isFirstLogin) => {
										this.postLogin(name, pwd, isFirstLogin);
									}}
									tabKey={key}
								/>
							</TabPane>
						</Tabs>
					</div>
				</div>
			</Layout>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

const mapDispatchToProps = {
	userInfo_login: (username,isNewMemFirstLogin=false) => ACTION_UserInfo_login(username,isNewMemFirstLogin),
	userInfo_logout:()=>ACTION_UserInfo_logout(),
	userInfo_getDetails: () => ACTION_User_getDetails(),
	userInfo_getBalance: (forceUpdate = false) => ACTION_UserInfo_getBalance(forceUpdate),
	userSetting_updateListDisplayType: (currentType) => ACTION_UserSetting_Update({ ListDisplayType: currentType }),
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);

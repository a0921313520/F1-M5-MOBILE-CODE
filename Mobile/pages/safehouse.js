/*
 * @Author: Alan
 * @Date: 2022-06-08 17:40:44
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-22 20:42:16
 * @Description: 安全屋
 * @FilePath: \Mobile\pages\Safehouse.js
 */
import React, { Component, Fragment } from "react";
import Input from "@/components/View/Input";
import { Cookie } from "@/lib/js/Helper";
import { ReactSVG } from "@/components/View/ReactSVG";
import Router from "next/router";
import { fetchRequest } from "@/server/Request";
import ReactIMG from "@/components/View/ReactIMG";
import { checkIsLogin, setIsLogin, getE2BBValue } from "@/lib/js/util";
import Toast from "@/components/View/Toast";
import Layout from "@/components/Layout";
import ReactCaptcha from "@/components/Captcha/ReactCaptcha";
import { connect } from "react-redux";
import { ApiPort } from "@/api/index";
import {
  ACTION_UserInfo_getBalance,
  ACTION_UserInfo_login,
  ACTION_User_getDetails,
} from "@/lib/redux/actions/UserInfoAction";
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/safehouse'); //參數帶本頁的路徑
}
class Safehouse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      password: "",
      loginNameStatus: "",
      loginPwdStatus: "",
      btnStatus: false,
      loginError: "",
      errorMessage: "",
      iconName: "close",
      inputType: "password",
    };
  }

  componentDidMount() {
    if (checkIsLogin()) {
      const fromurl = localStorage.getItem("fromurl");
      if (fromurl && fromurl.length > 0) {
        localStorage.removeItem("fromurl"); //清除
        window.location.href = fromurl;
      } else {
        Router.push("/");
      }
    }
    // window.Pushgtagdata &&
    //   Pushgtagdata(window.location.origin, "Launch", `login`);
  }

  //登录
  login = (showCaptcha) => {
    const { name, password, btnStatus } = this.state;
    if (name.trim().length === 0) {
      this.setState({ loginError: "请输入您的用户名。" });
      return;
    }
    if (password.trim().length === 0) {
      this.setState({ loginError: "请输入您的密码。" });
      return;
    }

    if (!btnStatus) return;
    //alert(name)
    let Times = this.Captcha ? this.Captcha.state.attempts : 3;
    if (showCaptcha && localStorage.getItem(`${name}_errorTimes`) >= Times) {
      this.setState({
        captchaVisible: true,
      });
      return;
    }
    this.postLogin(name, password);
    if (this.Captcha) {
      this.Captcha.getCaptchaInfo(name);
    }
    let accountInfo = Boolean(Cookie.Get("accountInfo"));
    if (Boolean(accountInfo)) {
      this.handleChecked(true);
    }
  };

  changeIconName = () => {
    if (this.state.iconName === "open") {
      this.setState({
        iconName: "close",
        inputType: "password",
      });
    } else {
      this.setState({
        iconName: "open",
        inputType: "text",
      });
    }
  };

  changeBtnStatus = () => {
    const { name, password, loginError } = this.state;

    if (!name || !password || loginError !== "") {
      this.setState({
        btnStatus: false,
      });
      return;
    }
    this.setState({
      btnStatus: true,
    });
  };

  onChangeName = (e) => {
    this.setState(
      {
        name: e.target.value,
      },
      () => {
        this.checkInput("name");
      }
    );
  };

  onChangePwd = (e) => {
    //console.log(e.target.value);
    this.setState(
      {
        password: e.target.value,
      },
      () => {
        this.checkInput("password");
      }
    );
  };

  checkInput = (type) => {
    const { name, password, loginError } = this.state;

    if (type === "name") {
      if (password.trim().length !== 0) {
        this.setState({ loginError: "" }, () => {
          this.changeBtnStatus();
        });
      }
      if (name.trim().length === 0) {
        this.setState({ loginError: "用户名格式无效​" }, () => {
          this.changeBtnStatus();
        });
      }
    }

    if (type === "password") {
      if (name.trim().length !== 0) {
        this.setState({ loginError: "" }, () => {
          this.changeBtnStatus();
        });
      }
      if (password.trim().length === 0) {
        this.setState({ loginError: "请输入您的密码。" }, () => {
          this.changeBtnStatus();
        });
      }
    }
  };

  OnBlur = () => {
    const { name, password } = this.state;
    if (name.trim().length === 0 && password.trim().length === 0) {
      this.setState({ loginError: "请输入您的用户名或密码。" }, () =>
        this.changeBtnStatus()
      );
    } else if (name.trim().length === 0) {
      this.setState({ loginError: "用户名格式无效​" }, () =>
        this.changeBtnStatus()
      );
    } else if (password.trim().length === 0) {
      this.setState({ loginError: "请输入您的密码。" }, () =>
        this.changeBtnStatus()
      );
    } else {
      this.setState({ loginError: "" }, () => this.changeBtnStatus());
    }
  };

  onMatch = (challengeUuid) => {
    this.setState(
      {
        challengeUuid: challengeUuid,
        captchaVisible: false,
      },
      () => {
        this.login(false);
      }
    );
  };

  closeCaptcha = () => {
    this.setState({
      captchaVisible: false,
    });
  };

  postLogin = (name, pwd) => {
    let postData = {
      hostName: window.location.origin,
      grantType: "password",
      clientId: "Fun88.CN.App",
      clientSecret: "FUNmuittenCN",
      scope: "Mobile.Service offline_access",
      appId: "net.funpodium.fun88",
      siteId: 38,
      username: name,
      password: pwd,
      e2: getE2BBValue(),
    };
    Toast.loading("Đang đăng nhập...");
    fetchRequest(ApiPort.Login, "POST", postData)
      .then(async (data) => {
        if (data.isSuccess) {
          Toast.destroy();
          //存储设置已登录的标记
          setIsLogin();
          ApiPort.Token = data.result.tokenType + " " + data.result.accessToken;
          localStorage.setItem(
            "memberToken",
            JSON.stringify(
              data.result.tokenType + " " + data.result.accessToken
            )
          );
          localStorage.setItem(
            "refreshToken",
            JSON.stringify(data.result.refreshToken)
          );
          this.props.userInfo_login();
          this.props.userInfo_getDetails();
          //获取用户的余额
          this.props.userInfo_getBalance();
          //清除错误登录次数（滑动验证）
          if (localStorage.getItem(`${name}_errorTimes`)) {
            localStorage.removeItem(`${name}_errorTimes`);
          }

          Router.push("/");
        } else {
          this.SeterrorTimes(name, data);
          Toast.destroy();
        }
      })
      .catch((error) => {
        Toast.destroy();
        this.SeterrorTimes(name, error);
        console.log("登录失败:", error);
      });
  };

  /**
   * @description: 错误登录次数（滑动验证）
   * @param {*} name
   * @return {*}
   */
  SeterrorTimes(name, responseData) {
    let times = localStorage.getItem(`${name}_errorTimes`);
    if (times) {
      localStorage.setItem(`${name}_errorTimes`, String(Number(times) + 1));
    } else {
      localStorage.setItem(`${name}_errorTimes`, "1");
    }
    if (responseData.errors[0]) {
      Toast.error(
        responseData.errors[0].description || "Lỗi hệ thống，liên Hệ Live Chat",
        2
      );
    }
  }

  checkUserLogin = () => {
    Toast.loading("Đang đăng nhập...");
    fetchRequest(
      ApiPort.Safehouse +
        `username=${this.state.name}&domain=${window.location.origin}&`,
      "GET"
    )
      .then((data) => {
        if (data.isSuccess && data.result) {
          this.login(true);
        }
        Toast.destroy();
      })
      .catch((error) => {
        Toast.destroy();
      });
  };
  render() {
    const { name, password, btnStatus, loginError, iconName } = this.state;
    return (
      <Layout
        title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
        Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
        Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
        status={0}
        seoData={this.props.seoData}
      >
        <div className="header-wrapper header-bar">
          <ReactIMG className="icon-logo" src="/img/headerLogo.svg" />

          <span className="Header-title" />
        </div>
        <div className="SafehouseLogin">
          <center>
            <h3>Đăng Nhập</h3>
          </center>
          {loginError !== "" && (
            <div className="login__error">{loginError}</div>
          )}
          <label>Tên Đăng Nhập</label>
          <Input
            type="text"
            placeholder="Nhập tên đăng nhập"
            prefix={
              <ReactSVG className="loginSVG" src={`/img/svg/login/user.svg`} />
            }
            value={name}
            onChange={this.onChangeName}
            maxLength={20}
            onBlur={this.OnBlur}
            onFocus={this.OnBlur}
          />
          <br />
          <label>Mật Khẩu</label>
          <Input
            placeholder="Nhập mật khẩu"
            value={password}
            prefix={
              <ReactSVG className="loginSVG" src={`/img/svg/login/lock.svg`} />
            }
            suffix={
              <ReactSVG
                className={`loginSVG login__pwd__${iconName}`}
                src={`/img/svg/login/eyes-${iconName}.svg`}
                onClick={this.changeIconName}
              />
            }
            type={this.state.inputType}
            onChange={this.onChangePwd}
            maxLength={20}
            onBlur={this.OnBlur}
            onFocus={this.OnBlur}
          />

          <div className="login__button">
            <button
              className={`login__btn__submit ${
                !btnStatus ? "btn-disable" : ""
              }`}
              disabled={!btnStatus}
              onClick={() => {
                /* 直接登录 注释，增加一层先检查会员的流程，然后决定是否登录 */
                // this.login(true);
                this.checkUserLogin();
              }}
            >
              Gửi
            </button>
          </div>
        </div>
        {/* 滑动验证 */}
        <ReactCaptcha
          visible={this.state.captchaVisible}
          onMatch={(e) => {
            this.onMatch(e);
          }}
          close={this.closeCaptcha}
          getCaptchaInfo={(props) => {
            this.Captcha = props;
          }}
        />
      </Layout>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.userInfo,
});

const mapDispatchToProps = {
  userInfo_login: (username) => ACTION_UserInfo_login(username),
  userInfo_getDetails: () => ACTION_User_getDetails(),
  userInfo_getBalance: (forceUpdate = false) =>
    ACTION_UserInfo_getBalance(forceUpdate),
};

export default connect(mapStateToProps, mapDispatchToProps)(Safehouse);

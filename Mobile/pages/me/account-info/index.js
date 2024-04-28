import React from "react";
import Layout from "@/components/Layout";
import Flexbox from "@/components/View/Flexbox/";
import { ReactSVG } from "@/components/View/ReactSVG";
import { checkIsLogin } from "@/lib/js/util";
import Router from "next/router";
import { ACTION_User_getDetails } from "@/lib/redux/actions/UserInfoAction";
import { connect } from "react-redux";
import { withRouter } from "next/router";
import Skeleton from "react-loading-skeleton";
import classNames from "classnames";
import moment from "moment";
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/account-info'); //參數帶本頁的路徑
}

class AccountDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      memberInfo: {},
      fromWallet: [],
      walletList: [],
    };

  }

  componentDidMount() {
    if (checkIsLogin()) {
      this.GetUser();
	  
    } else {
      Router.push("/register_login");
    }
    let walletListdata = JSON.parse(localStorage.getItem("walletList"));
    if (walletListdata) {
      this.setState({
        walletList: walletListdata.result.fromWallet,
      });
    }
  }

  /**
   * @description: 获取会员详情
   * @param {*}
   * @return {*}
   */
  GetUser = () => {
    this.props.userInfo_getDetails();
  };

  /**
   * @description: 进行资料更新跳转和对应修改
   * @param {*} type 标记
   * @return {*}
   */
  UpdaeUserInfo(type) {
    switch (type) {
      case "showRealName":
        Router.push("/me/account-info/RealName");
        break;
      case "showIdentityCard":
        Router.push("/me/account-info/IdentityCard");
        break;
      case "showBirthday":
        Router.push("/me/account-info/Birthday");
        break;
      case "showGender":
        Router.push("/me/account-info/Gender");
        break;
      case "showEmail":
        Router.push("/me/account-info/Email");
        break;
      case "showPhone":
        Router.push("/me/account-info/Phone");
        break;
      case "showPassword":
        Router.push("/me/account-info/Password");
        break;
      case "showContact":
        Router.push("/me/account-info/Contact");
        break;
      case "showQQ":
        Router.push("/me/account-info/QQ");
        break;
      case "showTelegram":
        Router.push("/me/account-info/Telegram");
        break;
      case "showWeChat":
        Router.push("/me/account-info/WeChat");
        break;
      case "showSafeQuestion":
        Router.push("/me/account-info/SafeQuestion");
        break;
      case "Wallet":
        Router.push("/me/account-info/Wallet");
        break;

      default:
        break;
    }
  }

  /**
   * @description: 替换星号
   * @param {*} length
   * @return {*}
   */

  getMaskedText = (length) => {
    return "*".repeat(length);
  };

  render() {
    const { memberInfo } = this.props.userInfo;
    console.log(this.props.userInfo);
    return (
      <Layout
        title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
        Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
        Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
        BarTitle="Thông Tin Tài Khoản"
        status={2}
        hasServer={false}
        barFixed={true}
        seoData={this.props.seoData}
        // backEvent={() => {
        //   Router.push("/");
        // }}
      >
        <Flexbox id="Accountinfo">
          <label>Thông Tin Cá Nhân</label>
          {memberInfo && (
            <Flexbox className="list" flexFlow="column">
              <Flexbox
                className="item"
                onClick={() => {
                  this.UpdaeUserInfo("showRealName");
                }}
              >
                <Flexbox style={{white: '2rem'}}>Họ Tên Thật</Flexbox>
                <Flexbox>
                  {memberInfo.firstName
                    ? this.getMaskedText(memberInfo.firstName.length > 15 ? 15 : memberInfo.firstName.length )
                    : ""}
                </Flexbox>
              </Flexbox>
              {/* <Flexbox
                className="item"
                onClick={() => {
                  this.UpdaeUserInfo("showIdentityCard");
                }}
              >
                <Flexbox>身份证号码</Flexbox>
                <Flexbox>
                  {memberInfo.identityCard
                    ? memberInfo.identityCard.replace(/^.{12}/, "************")
                    : "--"}
                </Flexbox>
              </Flexbox> */}
              <Flexbox
                className="item"
                onClick={() => {
                  this.UpdaeUserInfo("showBirthday");
                }}
              >
                <Flexbox>Ngày Sinh</Flexbox>
                <Flexbox>
                  {memberInfo.dob
                    ? moment(memberInfo.dob)
                      .format('DD/MM/YYYY')
                      .replace(/\d{2}(?=\/)|\d{2}$/g,"**")
                    : ""}
                </Flexbox>
              </Flexbox>
              <Flexbox
                className="item"
                onClick={() => {
                  this.UpdaeUserInfo("showGender");
                }}
              >
                <Flexbox>Giới Tính</Flexbox>
                <Flexbox className="Data">
                  {memberInfo.gender
                    ? memberInfo.gender.toLowerCase() == "female"
                      ? "Nữ"
                      : "Nam"
                    : ""}
                </Flexbox>
              </Flexbox>
            </Flexbox>
          )}
          {!memberInfo && <Skeletons />}
          <p className="note">Tên/ngày sinh/giới tính chỉ cho phép cập nhật 1 lần duy nhất.</p>
          <label>Thông Tin Tài Khoản</label>
          {memberInfo && (
            <Flexbox className="list" flexFlow="column">
              <Flexbox className="item hide-icon">
                <Flexbox>Tên Đăng Nhập</Flexbox>
                <Flexbox className="Data">
                  {memberInfo.userName || ""}
                </Flexbox>
              </Flexbox>
              <Flexbox className="item hide-icon">
                <Flexbox>Mã Số Tài Khoản</Flexbox>
                <Flexbox className="Data">
                  {memberInfo.memberCode || ""}
                </Flexbox>
              </Flexbox>
              <Flexbox
                className={classNames({
                  item: true,
                  "hide-icon-mobile":
                    memberInfo.phoneNumber &&
                    memberInfo.phoneStatus == "Verified",
                })}
                onClick={() => {
                  if (
                    memberInfo.phoneNumber &&
                    memberInfo.phoneStatus == "Verified"
                  )
                    return;
                  this.UpdaeUserInfo("showPhone");
                }}
              >
                <Flexbox>Số Điện Thoại</Flexbox>
                <Flexbox alignItems="center" className="Data">
                  {memberInfo.phoneNumber.replace(/.(?=.{4})/g, "*") || ""}

                  {memberInfo.phoneNumber &&
                    memberInfo.phoneStatus !== "Verified" && (
                      <ReactSVG src="/img/svg/warn.svg" className="status" />
                    )}

                  {memberInfo.phoneNumber &&
                    memberInfo.phoneStatus == "Verified" && (
                      <ReactSVG src="/img/svg/done.svg" className="status" />
                    )}
                </Flexbox>
              </Flexbox>
              <Flexbox
                className={classNames({
                  item: true,
                  "hide-icon-mobile":
                    memberInfo.emailStatus &&
                    memberInfo.emailStatus == "Verified",
                })}
                onClick={() => {
                  if (
                    memberInfo.emailStatus &&
                    memberInfo.emailStatus == "Verified"
                  )
                    return;
                  this.UpdaeUserInfo("showEmail");
                }}
              >
                <Flexbox>Email</Flexbox>
                <Flexbox alignItems="center" className="Data">
                  {memberInfo.email ? (
                    <React.Fragment>
                      {memberInfo.email
                        .split("@")[0]
                        .replace(/.(?=.{3})/g, "*") +
                        "@" +
                        memberInfo.email.split("@")[1]}
                    </React.Fragment>
                  ) : (
                    ""
                  )}

                  {memberInfo.email &&
                    memberInfo.emailStatus !== "Verified" && (
                      <ReactSVG src="/img/svg/warn.svg" className="status" />
                    )}
                  {memberInfo.email && memberInfo.emailStatus == "Verified" && (
                    <ReactSVG src="/img/svg/done.svg" className="status" />
                  )}
                </Flexbox>
              </Flexbox>
              <Flexbox
                className="item"
                onClick={() => {
                  this.UpdaeUserInfo("showPassword");
                }}
              >
                Thay Đổi Mật Khẩu
              </Flexbox>
              <Flexbox
                className="item"
                onClick={() => {
                  this.UpdaeUserInfo("showContact");
                }}
              >
                Phương Thức Liên Lạc
              </Flexbox>
              <Flexbox
                className="item"
                onClick={() => {
                  this.UpdaeUserInfo("showTelegram");
                }}
              >
                Tài Khoản Telegram
              </Flexbox>
              {/* <Flexbox
                className="item"
                onClick={() => {
                  this.UpdaeUserInfo("showQQ");
                }}
              >
                QQ号
              </Flexbox>
              <Flexbox
                className="item"
                onClick={() => {
                  this.UpdaeUserInfo("showWeChat");
                }}
              >
                微信号
              </Flexbox> */}
            </Flexbox>
          )}
          {!memberInfo && <Skeletons />}

          <label>Thông Tin Khác</label>
          {memberInfo && (
            <Flexbox className="list" flexFlow="column">
              <Flexbox className="item hide-icon">
                <Flexbox>Ngôn Ngữ</Flexbox>
                <Flexbox className="Data">
                  {memberInfo.language == 'vi-vn' ? 'Tiếng Việt' : ''}
                </Flexbox>
              </Flexbox>
              <Flexbox className="item hide-icon">
                <Flexbox>Tiền Tệ Yêu Thích</Flexbox>
                <Flexbox className="Data">
                  {memberInfo.currency == 'VND' ?  'VND (đ)' : ''}
                </Flexbox>
              </Flexbox>
              <Flexbox
                className="item "
                onClick={() => {
                  this.UpdaeUserInfo("Wallet");
                }}
              >
                <Flexbox>Ví Tiền Yêu Thích</Flexbox>
                <Flexbox className="Data">
                  {(this.state.walletList.find(
                    (v) => v.key == memberInfo.preferWallet
                  ) &&
                    this.state.walletList.find(
                      (v) => v.key == memberInfo.preferWallet
                    ).name) ||
                    ""}
                </Flexbox>
              </Flexbox>
              <div>
                <Flexbox
                  className="item"
                  onClick={() => {
                    this.UpdaeUserInfo("showSafeQuestion");
                  }}
                >
                  Câu Hỏi Bảo Mật
                </Flexbox>
              </div>
            </Flexbox>
          )}
          {!memberInfo && <Skeletons />}
        </Flexbox>
      </Layout>
    );
  }
}
const Skeletons = () => {
  return (
    <div style={{ background: "white", padding: "10px", margin: "10px 0" }}>
      <Skeleton count={5} height="30px" />
    </div>
  );
};
const mapStateToProps = (state) => ({
  userInfo: state.userInfo,
});

const mapDispatchToProps = {
  userInfo_getDetails: () => ACTION_User_getDetails(),
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AccountDetails)
);

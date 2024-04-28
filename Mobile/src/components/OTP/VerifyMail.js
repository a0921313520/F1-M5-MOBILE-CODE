import React, { Component, Fragment } from "react";
import Button from "@/components/View/Button";
import Progressbar from "@/components/View/Progressbar";
import OtpInput from "react-otp-input";
import { fetchRequest } from "@/server/Request";
import { ApiPort } from "@/api/index";
import Toast from "@/components/View/Toast";
import Router from "next/router";
import moment from "moment";
import { PopUpLiveChat } from '@/lib/js/util';
export default class VerifyMail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      btnStatus: false,
      errorMessage: "",
      currentStep: 0,
      verifyCodeValue: "",
      verifyBtnStatus: false,
      verifyInputArea: false,
      verifyCodeError: false,
      verifyCodeErrorText: "",
    };
    this.emailInput = [];
  }

  componentDidMount() {
    if(this.props.type === "loginOTP"){
      global.Pushgtagpiwikurl && global.Pushgtagpiwikurl("login_security_verification_email_verification","Log in OTP")
    }
    if(this.props.type === "resetpwd"){
      global.Pushgtagpiwikurl && global.Pushgtagpiwikurl("reset_password_email_verification","Reset Password")
    }
    if (this.props.countdownNum !== -1) {
      this.setState({
        verifyInputArea: true,
        btnStatus: true,
      });
    } else {
      this.setState({
        btnStatus: "",
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.countdownNum !== prevProps.countdownNum) {
      if (this.props.countdownNum === -1) {
        this.setState({
          btnStatus: false,
        });
      }
    }
  }

  mailConversion = (email) => {
    //Mask & display last 3 characters before @ when length > 3 characters else no mask is required
    let head = email.split("@")[0];
    let tail = email.split("@")[1];
    let headArr = head.split("");
    if (headArr && headArr.length > 3) {
      const headsTail3 = head.slice(-3);
      return (
        [...Array(head.length - 3).fill("*"), ...headsTail3].join("") +
        "@" +
        tail
      );
    } else {
      return email;
    }
  };

  inputCode = (val) => {
    this.setState({
      verifyCodeValue: val,
    });
    if (val.toString().length == 6) {
      this.setState({
        verifyBtnStatus: true,
      });
    } else {
      if (this.state.verifyBtnStatus) {
        this.setState({
          verifyBtnStatus: false,
        });
      }
    }
  };

  getVerifyCode = () => {
    const { type, email, ServiceAction } = this.props;
    if (this.state.btnStatus) return;

    let postData = {
      serviceAction: ServiceAction,
      //memberCode: memberInfo.UserName,
      email: email,
      siteId: 38,
    };

    Toast.loading();
    //console.log(postData);
    fetchRequest(ApiPort.EmailOTP, "POST", postData)
      .then((data) => {
        Toast.destroy();
        if (data.isSuccess) {
          this.setState({
            btnStatus: true,
            verifyInputArea: true,
          });
          //data.result.attempt
          this.props.makeNumInterval("mail", data.result.resendCounter);
          Toast.success("Gửi Mã Thành Công", 3);
        } else {
          //console.log(data);
          this.props.limitMax();
          Toast.error(data.result.message, 2);
        }
      })
      .catch((err) => {
        Toast.destroy();
        //console.log(err);
      });

    if (this.props.type === "ProfileOTP") {
      if (this.props.isShowResendWord) {
        // Pushgtagdata(`Verification`, "Click", `ResendCode_Email_ProfilePage​`);
      } else {
        // Pushgtagdata(`Verification`, "Click", `SendCode_Email_ProfilePage​`);
      }
      return;
    }
    if (this.props.type == "withdraw-otp") {
      if (this.props.isShowResendWord) {
        // Pushgtagdata(`Verification`, "Click", `ResendCode_Email_WithdrawPage`);
      } else {
        // Pushgtagdata(`Verification`, "Click", `Send_Email_WithdrawPage`);
      }

      return;
    }

    if (this.props.isShowResendWord) {
      // Pushgtagdata(`Login OTP`, "Request", `ResendCode_Email`);
    } else {
      // Pushgtagdata(`Verification`, "Click", `SendCode_Email`);
    }
  };

  postVerify = () => {
    const { type, email, memberInfo, ServiceAction } = this.props;
    const { verifyCodeValue, verifyBtnStatus } = this.state;
    if (!verifyBtnStatus) return;

    let postData = {
      //memberCode: memberInfo.UserName,
      email: email,
      tac: verifyCodeValue,
      //ipAddress: '',
      //siteId: 16,
      ServiceAction: ServiceAction,
    };

    Toast.loading();
    //console.log(postData);

    fetchRequest(ApiPort.VerifyEmailOTP, "PATCH", postData)
      .then((data) => {
        Toast.destroy();
        Pushgtagdata (
          `OTP_Verfication`, 
          'Submit OTP', 
          `OTP_Verfication_S_EmailOTP`,
          data?.result?.isVerified ? 2 : 1, 
          [{
            customVariableKey:data?.result?.isVerified ? false : "OTP_Verfication_S_EmailOTP_ErrorMsg",
            customVariableValue: data?.result?.isVerified ? false : "Mã xác thực đã hết hạn, vui lòng nhấp GỬI LẠI MÃ để được gửi lại mã khác."
          }]
        );
        if (data.isSuccess && data.result.isVerified) {
          if (this.props.type === "resetpwd") {
            Toast.success({ content: "Xác Thực Thành Công", type: "loading" }, 3);
            setTimeout(() => {
              Toast.destroy();
            }, 3000)
          } else {
            Toast.success({ content: "Xác Thực Thành Công", type: "loading" }, 3);
            setTimeout(() => {
              Toast.destroy();
            }, 3000)
          }

          if (this.props.type === "resetpwd") {
            setTimeout(() => {
              this.props.goChangePwd();
            }, 2000)
          } 
          else if(type === "withdraw-otp"){
            if(memberInfo?.phoneStatus === "Unverified"){
              setTimeout(() => {
                Router.push('/me/account-info/Phone?from=WithdrawalPage');
              }, 3000)
            }else {
              setTimeout(() => {
                Router.push("/withdrawal");
              }, 3000)
            }
          } 
          else {
            fetchRequest(ApiPort.Member, "GET").then((res) => {
              if (res) {
                localStorage.setItem(
                  "LoginOTP",
                  res.result.memberInfo.loginOTP
                );
                localStorage.setItem(
                  "Revalidate",
                  res.result.memberInfo.revalidate
                );
                //localStorage.setItem('memberInfo', JSON.stringify(res.result.memberInfo));
                Router.push(this.props.RouterUrl);
              }
            });
          }
        } else {
          if (data.errors) {
            this.setState({
              verifyCodeErrorText: data.errors[0].description,
              verifyCodeError: true,
            });
          } else {
            this.setState({
              verifyCodeErrorText: data.result.message,
              verifyCodeError: true,
            });
          }
          // 超過5次
          if (data.result.errorCode === "REVA0001") {
            this.props.limitToZero();
          } 
          else if (data?.result?.remainingAttempt) {
            this.props.setEmailAttemptRemaining(data.result.remainingAttempt);
          } 
          else {
            typeof this.props.limitMax === "function" && this.props.limitMax() || this.props.mailTryCalc();
          }
        }
      })
      .catch((err) => {
        Toast.destroy();
        //console.log(err);
      });
  };

  changeVerifyType =()=> {
    if(this.props.type === "withdraw-otp"){
      Router.push("/withdrawal");
    } else {
      this.props.changeVerifyType()
    }
    switch(this.props.type){
      case "withdraw-otp":
        Router.push("/withdrawal");
        break;
      case "loginOTP":
      case "resetpwd":
        this.props.changeVerifyType();
      default:
        break;
    }
  }

  render() {
    const {
      type,
      changeVerifyType,
      mailTryLimit,
      email,
      countdownNum,
      isShowResendWord,
      checkMailLimit,
      changeVerify
    } = this.props;
    const {
      btnStatus,
      verifyCodeError,
      verifyBtnStatus,
      verifyInputArea,
      verifyCodeValue,
      verifyCodeErrorText,
    } = this.state;
    let time = moment.duration(countdownNum, "seconds");
    let minutes = time.minutes();
    let seconds = time.seconds();
    let Countdown = moment({ m: minutes, s: seconds }).format("s");
    return (
      <Fragment>
        <div className="verifyPhoneMail__main">
          {type === "resetpwd" && (
            <Fragment>
              <Progressbar activeStep={1} />
              <div className="verifyPhoneMail__heading"><h4>Xác thực địa chỉ email để tiếp tục</h4></div>
              <div className="verifyPhoneMail__text">
                Nhấp vào "Gửi Mã Xác Thực", bạn sẽ nhận được mã OTP dùng 1 lần trong hộp thư của mình
              </div>
            </Fragment>
          )}
          {(type === "loginOTP" || type === "ProfileOTP") && (
            <Fragment>
              <div className="verifyPhoneMail__heading"><h4>Xác thực địa chỉ email để tiếp tục</h4></div>
              <div className="verifyPhoneMail__text">
              Nhấp vào "Gửi Mã Xác Thực", bạn sẽ nhận được mã OTP dùng 1 lần trong hộp thư của mình
              </div>
            </Fragment>
          )}
          {type === "withdraw-otp" && (
            <Fragment>
              <Progressbar activeStep={1} />
              <div className="verifyPhoneMail__heading"><h4>Xác thực địa chỉ email để tiếp tục</h4></div>
              <div className="verifyPhoneMail__text">
              Nhấp vào "Gửi Mã Xác Thực", bạn sẽ nhận được mã OTP dùng 1 lần trong hộp thư của mình
              </div>
            </Fragment>
          )}
          <div className="verifyPhoneMail__line" />

          <div className="verifyPhoneMail__title">Email</div>
          <div className="verifyPhoneMail__phone__input">
            <div className="verifyPhoneMail__phone__number email_line">
              {this.mailConversion(email)}
            </div>
          </div>

          <div className="verifyPhoneMail__notice">
          Trong trường hợp bạn muốn cập nhật địa chỉ email. Vui lòng liên hệ&nbsp;
            <span
              className="blue Live_Chat"
              onClick={() => {
                Pushgtagdata("OTP_Verfication", "Contact CS", "OTP_Verfication_C_CS");
                PopUpLiveChat();
              }}
            >
               Live Chat
            </span>
          </div>

          <Button
            className={`getVerfiyCodeBtn ${btnStatus ? "disabledBtn" : ""}`}
            onClick={this.getVerifyCode}
            disabled={btnStatus}
          >
            {btnStatus
              ? `Gửi lại trong ${countdownNum !== -1 ? `${Countdown}s`: ""}`
              : isShowResendWord
              ? "Gửi Lại Mã"
              : "Gửi Mã Xác Thực"}
          </Button>
          {verifyInputArea && (
            <Fragment>
              <div className="verifyPhoneMail__code">
                <div className="verifyPhoneMail__input__heading">
                Nhập mã xác thực đã được cung cấp qua email
                </div>
                {/* <div className="verifyPhoneMail__input__text">
                  请注意：获取新的验证码前请查看您的垃圾箱
                  <br /> 若您在10分钟内尚未收到验证码，请点击”重新发送”
                </div> */}
                <div
                  className={`verifyPhoneMail__code__input ${
                    verifyCodeError ? "codeError" : ""
                  }`}
                >
                  <OtpInput
                    numInputs={6}
                    isInputNum
                    value={verifyCodeValue}
                    onChange={this.inputCode}
                    containerStyle="otp-input-container"
                  />
                </div>
                {verifyCodeError && (
                  <div className="warn-text">{verifyCodeErrorText}</div>
                )}

                <div
                  className="verifyPhoneMail__text text-center"
                  style={{ marginTop: "16px", justifyContent: "center" }}
                >
                  {"Bạn còn ("}
                  <span style={{ color: "#00A6FF" }}>{mailTryLimit}</span>
                  {") lần thử"}
                </div>

                <Button
                  className={`verifyBtn ${
                    !verifyBtnStatus ? "disabledBtn2" : ""
                  }`}
                  onClick={this.postVerify}
                >
                  Xác Thực Ngay
                </Button>
              </div>
            </Fragment>
          )}
        </div>
        {!changeVerify ? null : 
          <div className="underline_a text-center" style={{textDecoration: 'underline',fontWeight:"500"}} onClick={this.changeVerifyType}>
            {["loginOTP","resetpwd"].some((item)=>item === type) ? "Đổi Phương Thức Xác Thực" : null}
            {["withdraw-otp"].some((item)=>item === type)? "Xác Thực Sau" : null}
          </div>}
      </Fragment>
    );
  }
}

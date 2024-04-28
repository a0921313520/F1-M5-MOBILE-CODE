import React, { Component, Fragment } from "react";
import Button from "@/components/View/Button";
import OtpInput from "react-otp-input";
import Progressbar from "@/components/View/Progressbar";
import { fetchRequest } from "@/server/Request";
import { ApiPort } from "@/api/index";
import Toast from "@/components/View/Toast";
import Router from "next/router";
import moment from "moment";
import VerifyLimit from "./VerifyLimit";
import { PopUpLiveChat,getDisplayPublicError } from '@/lib/js/util';
import { getMemberInfo } from '@/api/userinfo';
export default class VerifyPhone extends Component {
  constructor(props) {
    super(props);
    this.state = {
      btnStatus: false,
      errorMessage: "",
      countdownNum: "",
      verifyCodeValue: "",
      verifyBtnStatus: false,
      verifyInputArea: false,
      verifyCodeError: false,
      verifyCodeErrorText: "",
      callOtp: false,
      requestSent: false,
    };
    this.emailInput = [];
  }

  componentDidMount() {
    if(this.props.type==="loginOTP"){
      global.Pushgtagpiwikurl && global.Pushgtagpiwikurl("login_security_verification_phone_verification","Log in OTP")
    }
    if(this.props.type==="resetpwd"){
      global.Pushgtagpiwikurl && global.Pushgtagpiwikurl("reset_password_phone_verification","Reset Password")
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
          verifyCodeValue:"",
          verifyCodeErrorText:"",
          verifyCodeError:false,
          verifyBtnStatus:false
        });
      }
    }
  }
  componentWillUnmount(){
    this.setState = ()=> false;
  }
  numberConversion = (number) => {
    // console.log(number);
    let numberDelPrefix = number.split("-")[1];
    let numberArr = numberDelPrefix.split("");
    //Mask & display last 4 characters when length > 4 characters else no mask is required
    if (numberArr && numberArr.length > 4) {
      const tail4 = numberArr.slice(-4);
      return [...Array(numberArr.length - 4).fill("*"), ...tail4].join("");
    } else {
      return numberArr.join("");
    }
  };

  getVerifyCode = (i) => {
    const { type, phoneNumber, memberInfo, ServiceAction } = this.props;
    if (this.state.btnStatus) return;
    let postData = {
      siteId: 16,
      MsIsdn: phoneNumber,
      isRegistration: false,
      isOneTimeService: false,
      memberCode: memberInfo.memberCode,
      CurrencyCode: "VND",
      isMandatoryStep: true,
      ServiceAction: ServiceAction,
    };

    Toast.loading();
    let requestURL;
    if(ServiceAction == "CryptoWallet" && !this.state.callOtp){
      //添加usdt钱包短信验证
      requestURL = ApiPort.VerificationPaymentPhone;
    }
    else if(!this.state.callOtp){
      //短信验证
      requestURL = ApiPort.PhoneOTP;
    }
    else {
      //语音验证
      requestURL = ApiPort.PhoneVoiceOTP;
    }
    fetchRequest(requestURL, "POST", postData)
      .then((data) => {
        Toast.destroy();
        if (data.isSuccess) {
          if(i == 'switch') {
            this.setState({
              callOtp: !this.state.callOtp
            })
          }
          this.setState({
            btnStatus: true,
            verifyInputArea: true,
            requestSent: true
          });
          this.props.makeNumInterval("phone", data.result.resendCounter);
          // this.props.phoneTryCalc(data.result.resendCounter);
        } else {
          if(data?.errors?.[0]?.errorCode && ["REVA0001","VAL18015"].some((v)=>v === data.errors[0].errorCode)){
            //开启限制页面
            this.props.limitMax()
          }
          else if((this.state.verifyInputArea) && data?.errors?.[0] && getDisplayPublicError(data)){
            this.setState({
              verifyCodeErrorText: getDisplayPublicError(data),
              verifyCodeError: true,
            });
          }
          else{
            Toast.error(data?.result?.message || getDisplayPublicError(data) || "Gửi thất bại", 3);
          }
        }
      }).catch((error) => {
        console.log("🚀 ~ VerifyPhone ~ .then ~ error:", error)
      });
    setTimeout(()=>{
      //双保险 
      // request.js 改变了400的判断
      Toast.destroy()
    },4000)
    if (this.props.type == "ProfileOTP") {
      if (this.props.isShowResendWord) {
        // Pushgtagdata(`Verification`, "Click", `ResendCode_Phone_ProfilePage​`);
      } else {
        // Pushgtagdata(`Verification`, "Click", `SendCode_Phone_ProfilePage​`);
      }
      return;
    }

    if (this.props.type == "withdraw-otp") {
      if (this.props.isShowResendWord) {
        // Pushgtagdata(`Verification`, "Click", `Send_Phone_WithdrawPage`);
      } else {
        // Pushgtagdata(`Verification`, "Click", `ResendCode_Phone_WithdrawPage`);
      }
      return;
    }

    if (this.props.isShowResendWord) {
      // Pushgtagdata(`Login OTP`, "Request", `ResendCode_Phone`);
    } else {
      // Pushgtagdata(`Verification`, "Click", `SendCode_Phone`);
    }
  };

  inputCode = (val) => {
    this.setState({
      verifyCodeValue: val,
    });
    if (val.length === 6) {
      this.setState({
        verifyBtnStatus: true,
      });
    } else {
      this.setState({
        verifyBtnStatus: false,
      });
    }
  };

  postVerify = () => {
    const { type, memberInfo, phoneNumber, ServiceAction } = this.props;
    const { verifyCodeValue, verifyBtnStatus, callOtp } = this.state;
    if (!verifyBtnStatus) return;

    let postData = {
      //memberCode: memberInfo.userName,
      msisdn: phoneNumber,
      verificationCode: verifyCodeValue,
      serviceAction: ServiceAction,
      //siteId: 16
    };

    Toast.loading();
    let requestURL;
    if(ServiceAction == "CryptoWallet" && !this.state.callOtp){
      //添加usdt钱包短信验证
      requestURL = ApiPort.VerificationPaymentPhone;
    }
    else if(!this.state.callOtp){
      //短信验证
      requestURL = ApiPort.VerifyPhoneOTP;
    }
    else {
      //语音验证
      requestURL = ApiPort.PhoneVoiceOTP;
    }
    fetchRequest(requestURL, "PATCH", postData)
      .then((data) => {
        Pushgtagdata(
					`OTP_Verfication`, 
					'Submit OTP', 
					`OTP_Verfication_S_${this.state.callOtp ? "Voice" : "SMS"}OTP`,
          data?.result?.isVerified ? 2 : 1, 
          [{
            customVariableKey:data?.result?.isVerified ? false : `OTP_Verfication_S_${this.state.callOtp ? "Voice" : "SMS"}OTP_ErrorMsg`,
            customVariableValue: data?.result?.isVerified ? false : "Mã xác thực không chính xác, vui lòng kiểm tra lại"
          }]
        );
        Toast.destroy();
        if (
          (data?.isSuccess && data.result?.isVerified)
        ) {
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
          else if (this.props.type === "loginOTP") {
            localStorage.setItem("LoginOTP", false);
            Router.push("/");
          }
          else if(type === "withdraw-otp"){
            Router.push("/withdrawal");
          }else if(this.props.type === "ProfileOTP"){
            Router.push("/me");
          } else {
            if (this.props.RouterUrl && this.props.RouterUrl !== "") {
              Router.push(this.props.RouterUrl);
            } else {
              this.props.onCancel(verifyCodeValue);
            }
          }
        } else {
          if (data?.errors) {
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
          if(type === "CryptoWallet"){
            // 添加usdt钱包otp验证
            if(!callOtp){
              //短信验证
              //短信验证API false的时候会返回400，不会返回次数，所以重新请求剩余次数API
              this.props.phoneTryCalc();
            } else {
              //语音验证
              if(data?.result?.remainingAttempt){
                this.props.setPhoneAttemptRemaining(data.result.remainingAttempt)
              }
              else if(data?.errors?.errorCode === "VAL18013" || data?.result?.remainingAttempt < 1){
                //data?.errors 和 data?.result 不会同时出现，情况不同
                //开启限制页面
                this.props.limitMax()
              }
              else {
                this.props.phoneTryCalc();
              }
            }
            return;
          } 
          else if(type === "resetpwd"){
            if(data?.errors?.errorCode && ["REVA0001","VAL18015"].some((item)=> item === data.errors.errorCode)){
              //开启限制页面
              this.props.limitMax()
            }
            return;
          }
          else if(data?.result?.remainingAttempt){
            this.props.setPhoneAttemptRemaining(data.result.remainingAttempt)
          } 
          else if(data?.result?.remainingAttempt < 1){
            //开启限制页面
            this.props.limitMax()
          } 
          else {
            this.props.phoneTryCalc();
          }
        }
      })
      .catch((err) => {
        Toast.destroy();
        console.log("err: ", err);
      });
  };

  changeVerifyType =()=>{
    if(this.props.type === "withdraw-otp"){
      Router.push("/withdrawal");
    } else {
      this.props.changeVerifyType()
    }
  }

  switchPhoneVerificationMethod =()=> {
    // this.setState({
    //   callOtp: !this.state.callOtp
    // },()=>{
      this.props.phoneTryCalc((res)=>{
        if(res > 0) return this.getVerifyCode('switch');
      });
    // })
  }
  render() {
    const {
      type,
      onClose,
      changeVerifyType,
      phoneNumber,
      countdownNum,
      isShowResendWord
    } = this.props;

    const {
      btnStatus,
      verifyCodeError,
      verifyBtnStatus,
      verifyInputArea,
      verifyCodeValue,
      verifyCodeErrorText,
      requestSent
    } = this.state;
      console.log("🚀 ~ file: VerifyPhone.js:311 ~ VerifyPhone ~ render ~ callOtp:", this.state.callOtp ? "语言":"短信","type:",type)

    let time = moment.duration(countdownNum, "seconds");
    let minutes = time.minutes();
    let seconds = time.seconds();
    let Countdown = moment({ m: minutes, s: seconds }).format("s");
    return (
      <Fragment>
        <div className="verifyPhoneMail__main">
          {type === "withdraw-otp" && (
            <Fragment>
              <Progressbar activeStep={2} />
              <div className="verifyPhoneMail__heading">Xác thực số điện thoại để tiếp tục</div>
              <div className="verifyPhoneMail__text">
                Mã xác thực OTP dùng 1 lần sẽ được gửi qua tin nhắn sms hoặc cuộc gọi qua số điện thoại của bạn
              </div>
            </Fragment>
          )}
          {type === "resetpwd" && (
            <Fragment>
              <Progressbar activeStep={1} />
              <div className="verifyPhoneMail__heading">Xác thực số điện thoại để tiếp tục</div>
              <div className="verifyPhoneMail__text">
                Mã xác thực OTP dùng 1 lần sẽ được gửi qua tin nhắn sms hoặc cuộc gọi qua số điện thoại của bạn
              </div>
            </Fragment>
          )}
          {(type === "loginOTP" || type === "ProfileOTP") && (
            <Fragment>
              <div className="verifyPhoneMail__heading">Xác thực số điện thoại để tiếp tục</div>
              <div className="verifyPhoneMail__text">
                Mã xác thực OTP dùng 1 lần sẽ được gửi qua tin nhắn sms hoặc cuộc gọi qua số điện thoại của bạn
              </div>
            </Fragment>
          )}
          {type === "CryptoWallet" && (
            <Fragment>
              <div className="verifyPhoneMail__heading">Xác thực số điện thoại để tiếp tục</div>
              <div className="verifyPhoneMail__text">
                Mã xác thực OTP dùng 1 lần sẽ được gửi qua tin nhắn sms hoặc cuộc gọi qua số điện thoại của bạn
              </div>
            </Fragment>
          )}
          <div className="verifyPhoneMail__line" />

          <div className="verifyPhoneMail__title">Số Điện Thoại</div>
          <div className="verifyPhoneMail__phone__input">
            <div className="verifyPhoneMail__phone__prefix">+84</div>
            <div className="verifyPhoneMail__phone__number">
              {phoneNumber && this.numberConversion(phoneNumber)}
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
            onClick={() => {Pushgtagdata(
              `OTP_Verfication`, 
              'Send OTP', 
              this.state.callOtp ? "OTP_Verfication_C_Voice" :"OTP_Verfication_C_SMS"
            ); this.getVerifyCode();}}
            disabled={btnStatus}
          >
            {btnStatus
              ? `Gửi lại trong ${countdownNum !== -1 ? `${Countdown}s` : ""}`
              : isShowResendWord
              ? "Gửi Mã Xác Thực"
              : "Gửi Mã OTP Qua SMS"
            }
          </Button>
          {verifyInputArea && (
            <Fragment>
              <div className="verifyPhoneMail__code">
                <div className="verifyPhoneMail__input__heading">
                  Nhập mã xác thực đã được cung cấp qua số điện thoại
                </div>
                {/* <div className="verifyPhoneMail__input__text">
                  注意：如果5分钟后仍未收到验证码，请点击“重新发送验证码”以获取新的验证码。
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
                  <span style={{ color: "#00A6FF" }}>
                    {this.props.phoneTryLimit}
                  </span>
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

          {/* 切换语音/短信 */}
          <div className={`changeVoiceOrSms ${ requestSent ? "graybg":""}`}>
            <Button
              className={`changePhoneOTP ${countdownNum > 0 ? "disabled" :""}`}
              onClick={()=>this.switchPhoneVerificationMethod()}
              disabled={ countdownNum>0 }
            >
              {this.state.callOtp ? 'Gửi Mã OTP Qua SMS' : 'Gửi Mã OTP Qua Cuộc Gọi'}
            </Button>
          </div>
          
          {/* 切换验证方式 / 稍后验证 */}
          {(["CryptoWallet","ProfileOTP"].every((item)=>item !== type)) && (
            <div
              className="underline_a text-center"
              style={{
                textDecoration: type === "withdraw-otp" ? "": 'underline',
                fontWeight:"500"
              }}
              onClick={this.changeVerifyType}
            >
              {["loginOTP","resetpwd"].some((item)=>item === type) ? "Đổi Phương Thức Xác Thực" : null}
              {["withdraw-otp"].some((item)=>item === type)? "Xác Thực Sau" : null}
            </div>
          )} 
        </div>
        {/* <VerifyLimit
          key={this.props.phoneTryLimit + "Limit"}
          phoneTryLimit={this.props.phoneTryLimit == 0}
          RouterUrl={this.props.RouterUrl}
          PopUpLiveChat={this.props.PopUpLiveChat}
        /> */}
      </Fragment>
    );
  }
}

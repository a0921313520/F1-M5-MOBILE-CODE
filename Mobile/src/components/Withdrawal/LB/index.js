import React from "react";
import Input from "@/components/View/Input";
import Toast from "@/components/View/Toast";
import Router from "next/router";
import Modal from "@/components/View/Modal";
import Flexbox from "@/components/View/Flexbox/";
import { numberWithCommas, PopUpLiveChat } from "@/lib/js/util";
import BankAccount from "@/components/Deposit/depositComponents/BankAccount";
import { ACTION_UserInfo_getBalance } from "@/lib/redux/actions/UserInfoAction";
import { connect } from "react-redux";
import classNames from "classnames";
import Checkbox from "@/components/View/Checkbox";
import Radio from "@/components/View/Radio";
import { BsCheckSquareFill } from "react-icons/bs";
import { WithdrawalApplications } from "@/api/wallet";
import ReactIMG from "@/components/View/ReactIMG";
import HostConfig from "@/server/Host.config";
import { fetchRequest } from "@/server/Request";
import { ApiPort } from "@/api/index";
const { LocalHost } = HostConfig.Config;

class LB extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Modalopen: false,
      userBankOpen: false,
      toWallet: "",
      payMoney: "",
      moneyError: "",
      withdrawalsAmountTip: "",
      bankCodeState: "",
      defaultAccount: false,
      AmountExist: false,
      Appointment: "",
      maxPayoutDurationInMins: "",
      payoutDurationRebatePercent: "",
    };
  }
  componentDidMount() {
    const { bankBox } = this.props;
    console.log("bankBox", bankBox);
    this.setState({
      bankCodeState: bankBox.length != 0 ? bankBox[0].bankAccountID : "",
    });


    if (this.props.AllpayoutDurations.length === 0) {
      this.setState({
        maxPayoutDurationInMins: "",
        payoutDurationRebatePercent: "",
      });
    }

    if (this.props.AllpayoutDurations.length === 1) {
      this.setState({
        maxPayoutDurationInMins:
          this.props.AllpayoutDurations[0].maxDurationInMins,
        payoutDurationRebatePercent:
          this.props.AllpayoutDurations[0].payoutDurationRebatePercent,
      });
    }
  }
  userBankOpen() {
    this.setState({
      userBankOpen: !this.state.userBankOpen,
    });
  }

  onChange(value, CheckPrefixAmount) {
    const { MaxBal, MinBal } = this.props;
    let newValue = value
      .replace(/[^\d.]/g, "")
      .replace(/^\./g, "")
      .replace(/\.{2,}/g, ".")
      .replace(".", "$#$")
      .replace(/\./g, "")
      .replace("$#$", ".");
    let reg = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/g;
    let text = "";
    if (newValue > MaxBal) {
      text = "金额必须为" + numberWithCommas(MaxBal) + "或以下的金额​​";
    } else if (newValue < MinBal) {
      text = "金额必须为" + numberWithCommas(MinBal) + "或以上的金额";
    } else if (!reg.test(newValue)) {
      text = "金额格式错误";
    }
    // let withdrawalsAmountTip = "";
    // if (newValue >= MinBal && newValue <= MaxBal && newValue < 5000) {
    //   withdrawalsAmountTip =
    //     "*注意：提现处理时间可能长达 3 小时，为了加快交易速度，建议您单笔提现金额大于 5,000 元。";
    // } else if (newValue >= MinBal && newValue <= MaxBal && newValue > 100000) {
    //   withdrawalsAmountTip =
    //     "*注意：提现处理时间可能长达 3 小时，为了加快交易速度，建议您单笔提现金额小于 100,000 元。";
    // } else {
    //   withdrawalsAmountTip = "";
    // }
    this.setState(
      {
        payMoney: newValue,
        moneyError: text,
        // withdrawalsAmountTip,
      },
      () => {
        if (CheckPrefixAmount) {
          this.Withdrawal();
        }
      }
    );
  }

  /**
   * @description: 跳转去文件验证页面 先传递 银行账户持有人名称
   * @param {*} accountHolderName  银行账户持有人名称
   * @return {*}
   */

  PostAccountHolderName(accountHolderName) {
    Toast.loading();
    fetchRequest(
      ApiPort.AccountHolderName + `?bankHolderName=${accountHolderName}&`,
      "POST"
    )
      .then((res) => {
        Toast.destroy();
        Router.push("/me/upload-files");
      })
      .catch((error) => {
        Toast.destroy();
        Router.push("/me/upload-files");
        console.log(error);
      });
  }

  Withdrawal = () => {
    const { bankBox } = this.props;
    console.log("bankBox", bankBox);
    let Bank = bankBox.find(
      (item) => item.bankAccountID == this.state.bankCodeState
    );
    let data = {
      accountNumber: Bank.accountNumber,
      accountHolderName: Bank.accountHolderName,
      bankName: Bank.bankName,
      city: Bank.city,
      province: Bank.province,
      branch: Bank.branch,
      language: "zh-cn",
      swiftCode: "Fun88Mobile",
      paymentMethod: "LB",
      charges: 0,
      amount: this.state.payMoney,
      transactionType: "Withdrawal",
      domainName: LocalHost,
      isMobile: true,
      isSmallSet: false,
      maxPayoutDurationInMins:
        this.props.AllpayoutDurations.length === 1
          ? this.props.AllpayoutDurations[0].maxDurationInMins
          : this.state.maxPayoutDurationInMins,
      payoutDurationRebatePercent:
        this.props.AllpayoutDurations.length === 1
          ? this.props.AllpayoutDurations[0].payoutDurationRebatePercent
          : this.state.payoutDurationRebatePercent,
    };
    Toast.loading("提款中,请稍候...", 200);
    WithdrawalApplications(data, (res) => {
      Toast.destroy();
      if (res.isSuccess) {
        Toast.success("提款申请提交成功", 2);
        this.props.userInfo_getBalance(true);
        this.props.showDonePage(
          res,
          this.state.payMoney,
          data.maxPayoutDurationInMins
        );
      } else {
        if (res.errors && res.errors[0].errorCode == "SNC0001") {
          Modal.info({
            title: "",
            centered: true,
            className: `commonModal`,
            footer: null,
            type: "confirm",
            okText: "马上验证",
            onlyOKBtn: true,
            onOk: () => {
              this.PostAccountHolderName(Bank.accountHolderName);
            },
            content: (
              <React.Fragment>
                <center>
                  <ReactIMG src="/img/verify/warn.png" />
                  <h2>身份验证所需文件</h2>
                  <p style={{ padding: "10px 0 25px 0px", lineHeight: "20px" }}>
                    我们注意到您帐户存在异常。
                    请在个人资料-“上传文件页面”上传所需文件以验证您的身份，或联系
                    <span
                      style={{ color: "#00A6FF" }}
                      onClick={() => {
                        PopUpLiveChat();
                      }}
                    >
                      在线客服
                    </span>
                    寻求协助。
                  </p>
                  <div
                    style={{
                      lineHeight: "20px",
                      paddingBottom: "20px",
                    }}
                  >
                    <p>提款账户名：{Bank.accountHolderName}</p>
                    <p>注册姓名：{this.props.userInfo.memberInfo.firstName}</p>
                  </div>
                </center>
              </React.Fragment>
            ),
          });
          return;
        }

        if (res.errors && res.errors[0].errorCode == "SNC0002") {
          Modal.info({
            title: "",
            centered: true,
            className: `commonModal`,
            footer: null,
            type: "confirm",
            okText: "马上验证",
            cancelText: "我已上传",
            //onlyOKBtn: true,
            onOk: () => {
              Router.push("/me/upload-files");
            },
            onCancel: () => {},
            content: (
              <React.Fragment>
                <center>
                  <ReactIMG src="/img/verify/warn.png" />
                  <h2>身份验证所需文件</h2>
                  <p style={{ padding: "10px 0 25px 0px", lineHeight: "20px" }}>
                    我们注意到您帐户存在异常。
                    请在个人资料-“上传文件页面”上传所需文件以验证您的身份，或联系
                    <span
                      style={{ color: "#00A6FF" }}
                      onClick={() => {
                        PopUpLiveChat();
                      }}
                    >
                      在线客服
                    </span>
                    寻求协助。
                  </p>
                </center>
              </React.Fragment>
            ),
          });
        }

        if (res.errors && res.errors[0].errorCode == "SNC0003") {
          Modal.info({
            title: "",
            centered: true,
            className: `commonModal`,
            footer: null,
            type: "confirm",
            okText: "知道了",
            onlyOKBtn: true,
            onOk: () => {
              //this.PostAccountHolderName(Bank.accountHolderName);
            },
            content: (
              <React.Fragment>
                <center>
                  <ReactIMG src="/img/verify/warn.png" />
                  <h2>待验证</h2>
                  <p style={{ padding: "10px 0 25px 0px", lineHeight: "20px" }}>
                    请耐心等待，您的新银行帐户名称正在验证中。如需了解更多详情，请联系
                    <span
                      style={{ color: "#00A6FF" }}
                      onClick={() => {
                        PopUpLiveChat();
                      }}
                    >
                      在线客服
                    </span>
                    寻求协助。
                  </p>
                </center>
              </React.Fragment>
            ),
          });
          return;
        }
        if (res.errors && res.errors[0].errorCode == "P101103") {
          Modal.info({
            title: "重要提示",
            centered: true,
            closable:false,
            className: `commonModal`,
            footer: null,
            type: "confirm",
            okText: "好的",
            onlyOKBtn: true,
            onOk: () => {},
            content: (
              <React.Fragment>
                <left>
                  <p>请耐心等待，您有一项提款申请正在处理中。</p>
                  <div
                    style={{
                      background: "#EFEFF4",
                      margin: "0.5rem 0",
                      padding: "0.5rem",
                      lineHeight: "0.6rem",
                      borderRadius: "0.2rem",
                    }}
                  >
                    <p>提款编号：{res.result.lastWithdrawalID}</p>
                    <p>
                      {" "}
                      提款金额：{parseFloat(res.result.lastWithdrawalAmount)}
                    </p>
                  </div>
                  <p>请等待处理完毕后，再提交其他提款申请。</p>
                  <br />
                </left>
              </React.Fragment>
            ),
          });
        } else {
          Toast.error(res.result.message, 2);
        }
      }
    });

    // Pushgtagdata(`Withdrawal`, "Submit", `Submit_LocalBank_Withdrawal​`);
  };

  timeChange(minDuration, maxDuration, payoutDurationRebate) {
    if (payoutDurationRebate > 0) {
      if (maxDuration / 60 >= 1) {
        if (maxDuration % 60 == 0) {
          return minDuration + "-" + maxDuration / 60 + "小时内提款 - ";
        } else {
          return (
            minDuration +
            "-" +
            parseInt(maxDuration / 60) +
            "小时" +
            (maxDuration % 60) +
            "分钟內提款 - "
          );
        }
      } else {
        return minDuration + "-" + (maxDuration % 60) + "分钟內提款 -";
      }
    } else {
      if (maxDuration / 60 >= 1) {
        if (maxDuration % 60 == 0) {
          return minDuration + "-" + maxDuration / 60 + "小时内提款";
        } else {
          return (
            minDuration +
            "-" +
            parseInt(maxDuration / 60) +
            "小时" +
            (maxDuration % 60) +
            "分钟內提款"
          );
        }
      } else {
        return minDuration + "-" + (maxDuration % 60) + "分钟內提款";
      }
    }
  }

  render() {
    //const { bankAccounts, setting } = this.props.currDepositDetail; // 当前支付方式的详情
    // const { getFieldsError, getFieldDecorator, getFieldValue, getFieldError, setFieldsValue } = this.props.form;
    const {
      toWallet,
      bankBox,
      DescriptionCode,
      MaxBal,
      MinBal,
      suggestedAmounts,
      AllpayoutDurations,
    } = this.props;
    const {
      userBankOpen,
      bankCodeState,
      payMoney,
      moneyError,
      defaultAccount,
      Appointment,
      maxPayoutDurationInMins,
      payoutDurationRebatePercent,
    } = this.state;
    let isSubmittable = 
     !!(payMoney &&  
     !moneyError  &&    
     bankCodeState && 
     (this.props.AllpayoutDurations.length < 2 ? true : maxPayoutDurationInMins!==""))     
    
    let ID = bankBox.length != 0 ? bankBox[0].bankAccountID : "";

    return (
      <React.Fragment>
        <Flexbox width="100%" flexFlow="column">
          <Flexbox flexFlow="column" marginBottom="10px">
            <p className="tip">
              {/* 2023/5/29 此段暫先不移除，後續有api優化，將以參數控制以下訊息是否顯示 */}
              {/* <span className="WarningNote">
                收到提款后，前往【交易记录】页面点击【确认到账】可享有最高返利
                 <span style={{color:"#00A6FF"}}> 0.4 %</span>
                <br />
              </span> */}
              <br />
            </p>
            <label>提款金额</label>
            <Flexbox className="Item">
              <Flexbox width="100%">
                <Input
                  clear="true"
                  type="text"
                  value={this.state.payMoney}
                  onChange={(value) => {
                    //判断是不是小数 是的话不准输入
                    if (Number(value.target.value) % 1 !== 0) {
                      return;
                    }
                    let val = JSON.stringify(value.target.value).replace(
                      /[^0-9]/g,
                      ""
                    ).replace(/^(0)([\d]+)/,"$2");

                    this.onChange(val);
                    this.setState({
                      fixedAmount: false,
                    });
                  }}
                  placeholder={`单笔提款 最低：${numberWithCommas(
                    MinBal
                  )}元起，最高：${numberWithCommas(MaxBal)}元。 `}
                />
              </Flexbox>
            </Flexbox>
            {this.state.moneyError && (
              <p className="ErrorNote">{this.state.moneyError}</p>
            )}
            {/* {this.state.withdrawalsAmountTip && (
              <p className="tip">
                <span className="WarningNote">
                  {this.state.withdrawalsAmountTip}
                  <br />
                </span>
                <br />
              </p>
            )} */}
          </Flexbox>
          <Flexbox flexFlow="column">
            {bankBox.length != 0 && (
              <BankAccount
                MenuTitle={true}
                labelName="银行账户"
                keyName={["name", "bankAccountID"]}
                bankAccounts={bankBox}
                bankCodeState={bankCodeState == "" ? ID : bankCodeState}
                setBankCode={(v) => {
                  this.setState({
                    bankCodeState: v,
                  });
                }}
                setting={undefined}
              />
            )}
            <Flexbox className="BankAccount">
              {bankBox.length == 0 && (
                <Flexbox flexFlow="column" width="100%">
                   <label>银行账户</label>
                  <Flexbox
                    className="AddBank"
                    onClick={() => {
                      if (bankBox && bankBox.length >= 5) {
                        Toast.error("最多只能拥有5张银行卡", 3);
                        return;
                      }
                      Router.push(`/me/BankAccount?type=${0}&page=withdrawals`);
                      // globalGtag("Addbcankcard_withdrawal_wallet");
                    }}
                  >
                    添加银行账户
                  </Flexbox>
                </Flexbox>
              )}
            </Flexbox>

            {DescriptionCode === "P108100" && (
              <p className="tip WarningNote">
                请注意：该账户已到达提款限额，为了您的账户安全起见，我们建议您添加新的提款银行账户进行提款。
              </p>
            )}
            {DescriptionCode === "P108101" && (
              <p className="tip WarningNote">
                请注意：该账户已到达提款限额。为了您的账户安全，我们建议您使用或添加其他银行账户再进行提款。
              </p>
            )}
            {DescriptionCode === "P108102" && (
              <p className="tip WarningNote">
                请注意：该银行账户已经提款限额，为了您的账户安全起见，建议您联系
                <span
                  style={{ color: "#00A6FF" }}
                  onClick={() => {
                    PopUpLiveChat();
                  }}
                >
                  在线客服
                </span>
                更新您的提款账户。
              </p>
            )}
            <Flexbox alignItems="center">
              <Checkbox
                icon={<BsCheckSquareFill color="#00A6FF" size={18} />}
                checked={defaultAccount}
                onChange={(value) => {
                  this.setState({
                    defaultAccount: value,
                  });
                }}
                label="设定为首选银行账户"
              />
            </Flexbox>
            {/* 新增預約提款時間 */}
            {AllpayoutDurations.length === 0 ? (
              <></>
            ) : AllpayoutDurations.length === 1 ? (
              <>
                <label>预约提款时间</label>
                <Flexbox alignItems="center">
                  <Flexbox flexFlow="column" marginBottom="10px" width="100%">
                    {AllpayoutDurations.map((item, index) => (
                      <>
                        {item.maxDurationInMins === 0 ? (
                          item.payoutDurationRebatePercent == 0 ? (
                            <Radio
                              RadioLength={AllpayoutDurations.length}
                              key={item.sortOrder}
                              label={"立即提款"}
                              id={item.sortOrder}
                              name="appointment" //等同群組名稱
                              value={item.sortOrder}
                              onChange={() => {}}
                            />
                          ) : (
                            <Radio
                              RadioLength={AllpayoutDurations.length}
                              key={item.sortOrder}
                              label={
                                "立即提款 - 加送" +
                                item.payoutDurationRebatePercent +
                                "%"
                              }
                              id={item.sortOrder}
                              name="appointment" //等同群組名稱
                              value={item.sortOrder}
                              onChange={() => {}}
                            />
                          )
                        ) : (
                          <Radio
                            RadioLength={AllpayoutDurations.length}
                            key={item.sortOrder}
                            label={this.timeChange(
                              item.minDurationInMins,
                              item.maxDurationInMins,
                              item.payoutDurationRebatePercent
                            )}
                            id={item.sortOrder}
                            name="appointment" //等同群組名稱
                            value={item.sortOrder}
                            onChange={() => {}}
                          />
                        )}
                      </>
                    ))}
                  </Flexbox>
                </Flexbox>
              </>
            ) : (
              <>
                <label>预约提款时间</label>
                <Flexbox alignItems="center">
                  <Flexbox flexFlow="column" marginBottom="10px" width="100%">
                    {AllpayoutDurations.map((item, index) => (
                      <>
                        {item.maxDurationInMins === 0 ? (
                          item.payoutDurationRebatePercent == 0 ? (
                            <Radio
                              RadioLength={AllpayoutDurations.length}
                              key={item.sortOrder}
                              label={"立即提款"}
                              id={item.sortOrder}
                              name="appointment" //等同群組名稱
                              value={item.sortOrder}
                              onChange={(e) => {
                                this.setState({
                                  Appointment: item.sortOrder,
                                  maxPayoutDurationInMins:
                                    item.maxDurationInMins,
                                  payoutDurationRebatePercent: 0,
                                });
                              }}
                            />
                          ) : (
                            <Radio
                              RadioLength={AllpayoutDurations.length}
                              key={item.sortOrder}
                              label={"立即提款 - "}
                              label2={
                                "加送" + item.payoutDurationRebatePercent + "%"
                              }
                              id={item.sortOrder}
                              name="appointment" //等同群組名稱
                              value={item.sortOrder}
                              onChange={(e) => {
                                this.setState({
                                  Appointment: item.sortOrder,
                                  maxPayoutDurationInMins:
                                    item.maxDurationInMins,
                                  payoutDurationRebatePercent:
                                    item.payoutDurationRebatePercent,
                                });
                              }}
                            />
                          )
                        ) : item.payoutDurationRebatePercent == 0 ? (
                          <Radio
                            RadioLength={AllpayoutDurations.length}
                            key={item.sortOrder}
                            label={this.timeChange(
                              item.minDurationInMins,
                              item.maxDurationInMins,
                              item.payoutDurationRebatePercent
                            )}
                            id={item.sortOrder}
                            name="appointment" //等同群組名稱
                            value={item.sortOrder}
                            onChange={(e) => {
                              this.setState({
                                Appointment: item.sortOrder,
                                maxPayoutDurationInMins: item.maxDurationInMins,
                                payoutDurationRebatePercent:
                                  item.payoutDurationRebatePercent,
                              });
                            }}
                          />
                        ) : (
                          <Radio
                            RadioLength={AllpayoutDurations.length}
                            key={item.sortOrder}
                            label={this.timeChange(
                              item.minDurationInMins,
                              item.maxDurationInMins,
                              item.payoutDurationRebatePercent
                            )}
                            label2={
                              " 加送" + item.payoutDurationRebatePercent + "%"
                            }
                            id={item.sortOrder}
                            name="appointment" //等同群組名稱
                            value={item.sortOrder}
                            onChange={(e) => {
                              this.setState({
                                Appointment: item.sortOrder,
                                maxPayoutDurationInMins: item.maxDurationInMins,
                                payoutDurationRebatePercent:
                                  item.payoutDurationRebatePercent,
                              });
                            }}
                          />
                        )}
                      </>
                    ))}
                  </Flexbox>
                </Flexbox>
              </>
            )}
            <Flexbox
              className={classNames({
                Submit: true,
                Active: isSubmittable,
              })}
              onClick={() => {
                isSubmittable && this.Withdrawal()
              }}
            >
              提交
            </Flexbox>
          </Flexbox>
        </Flexbox>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.userInfo,
});

const mapDispatchToProps = {
  userInfo_getBalance: (forceUpdate = false) =>
    ACTION_UserInfo_getBalance(forceUpdate),
};

export default connect(mapStateToProps, mapDispatchToProps)(LB);

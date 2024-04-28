import React from "react";
import Layout from "@/components/Layout";
import Toast from "@/components/View/Toast";
import Checkbox from "@/components/View/Checkbox";
import Flexbox from "@/components/View/Flexbox";
import Router from "next/router";
import InputItem from "@/components/View/Input";
import { getUrlVars } from "@/lib/js/Helper";
import { GetWithdrawDetails, AddMemberBank } from "@/api/wallet";
import Item from "@/components/Deposit/depositComponents/Item";
import {
  realyNameReg,
  idCard,
  depositMoneyInt,
  addressReg,
} from "@/lib/SportReg";
import { createForm } from "rc-form";
import BankAccount from "@/components/View/SelectDrawerMenu";
import classNames from "classnames";
import { BsCheckSquareFill } from "react-icons/bs";
import { withRouter } from "next/router";
import SelectArddress from "@/components/View/SelectArddress/";
class AddBank extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accountNumber: "",
      accountHolderName: "",
      Provincesx: "",
      city: "",
      branch: "",
      BankOpen: false,
      BankName: "",
      BankData: [],
      isChecked: false,
      router: "",
      bankCodeState: "",
      defaultAccount: false,
      datavalue: [],
      showArddress: false,
      bankNum: 1
    };
  }

  componentDidMount() {
    this.BankClick("LB");
    let router = getUrlVars()["router"];
    let bankNum = getUrlVars()['bank'];
    if (bankNum) {
      this.setState({
        bankNum: bankNum,
        defaultAccount: true
      });
    }
    if (router) {
      this.setState({
        router: router,
      });
    }
  }

  BankClick(key) {
    let params = {
      transactionType: "Withdrawal",
      method: key,
      isMobile: true,
      MethodCode: "DEFAULT",
    };
    let Paymentbanks = sessionStorage.getItem("Paymentbanks");
    if (Paymentbanks) {
      this.setState({
        BankData: JSON.parse(Paymentbanks),
      });
    } else {
      GetWithdrawDetails(params, (res) => {
        if (res.isSuccess && res.result) {
          this.setState({
            BankData: res.result.banks,
          });
        }
      });
    }
  }

  addCard() {
    Toast.loading("Đang gửi đi, xin vui lòng chờ...", 200);
    let Bank = this.state.BankData.find(
      (item) => item.id == this.state.bankCodeState
    );
    const { datavalue } = this.state;
    let params = {
      accountNumber: this.state.accountNumber,
      accountHolderName: this.state.userRealyNameState,
      bankName: Bank.name,
      // city: this.state.city,
      // province: datavalue[0].name + datavalue[1].name + datavalue[2].name,
      // branch: this.state.branch,
      type: "A",
      isDefault: this.state.defaultAccount,
    };
    // globalGtag("Submit_add_bankacc");
    AddMemberBank(params, (data) => {
      Toast.destroy();

      if (data.isSuccess == true) {
        let page = getUrlVars()["page"];
        if (page === "withdrawals") {
          Router.push("/withdrawal");
        } else {
          Router.push("/me/bank-account");
        }
        Toast.success("Thiết Lập Thành Công");
      } else {
        for (let i = 0; i < data.errors.length; i++) {
          let temp = data.errors[i];
          if (temp.errorCode == "PII00702") {
            Router.push("/illegal");
          } else {
            Router.push({
              pathname: "/addBankFail",
              query: {
                errorCode: temp.errorCode,
                description: temp.description,
                message: temp.message,
              },
            });
          }
        }
      }
    });
  }

  submitBtnEnable = () => {
    let { bankCodeState } = this.state;
    let error = Object.values(this.props.form.getFieldsError()).some(
      (v) => v !== undefined
    );
    let errors = Object.values(this.props.form.getFieldsValue()).some(
      (v) => v == "" || v == undefined
    );
    return bankCodeState !== "" && !errors && !error;
  };

  render() {
    const { defaultAccount, BankData, bankCodeState, datavalue, showArddress, bankNum } =
      this.state;
    const { getFieldDecorator, getFieldError, setFieldsValue } =
      this.props.form;
    return (
      <Layout
        Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
        Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
        BarTitle="Thêm Tài Khoản Nhân Hàng"
        status={2}
        hasServer={true}
        barFixed={true}
      >
        <div id="AddCard">
          {/* <BankAccount
						MenuTitle={true}
						labelName="银行名称"
						keyName={[ 'name', 'id' ]}
						bankAccounts={BankData}
						bankCodeState={bankCodeState}
						setBankCode={(v) => {
							console.log(v);
							this.setState({ bankCodeState: v });
							// this.setState({
							// 	BankName: ele.Name
							// });
						}}
						setting={undefined}
					/> */}
          <Item errorMessage={getFieldError("bankCodeState")}>
            {getFieldDecorator("bankCodeState", {
              rules: [
                { required: true, message: "Vui lòng chọn Ngân hàng" },
                {
                  validator: (rule, value, callback) => {
                    callback();
                  },
                },
              ],
            })(
              <BankAccount
                bank={true}
                searchBank={true}
                labelName={`Chọn Ngân Hàng`}
                Placeholder="Vui lòng chọn Ngân hàng"
                HideAll
                keyName={["name", "id"]}
                SelectMenu={BankData}
                SetCodeState={bankCodeState}
                setBankCode={(v) => {
                  this.setState({ bankCodeState: v });
                  setFieldsValue({
                    bankCodeState: v,
                  });
                }}
                MenuTitle
              />
            )}
          </Item>

          <Item
            label={`Chủ Tài Khoản`}
            errorMessage={getFieldError("userRealyNameState")}
          >
            {getFieldDecorator("userRealyNameState", {
              rules: [
                { required: true, message: "Vui lòng điền đầy đủ họ tên" },
                {
                  validator: (rule, value, callback) => {
                    if (value && !realyNameReg.test(value)) {
                      callback("Lỗi định dạng, tên thật cần có từ 2-50 ký tự chữ");
                    }
                    callback();
                  },
                },
              ],
            })(
              <InputItem
                size="large"
                placeholder="Chủ Tài Khoản"
                onChange={(v) => {
                  this.setState({
                    userRealyNameState: v.target.value,
                  });
                }}
                maxLength="50"
              />
            )}
          </Item>

          <Item
            label={`Số Tài Khoản`}
            errorMessage={getFieldError("accountNumber")}
          >
            {getFieldDecorator("accountNumber", {
              rules: [
                { required: true, message: "Vui lòng điền số tài khoản ngân hàng" },
                {
                  validator: (rule, value, callback) => {
                    if (value && !depositMoneyInt.test(value)) {
                      callback("Số tài khoản phải trong phạm vi từ 6 đến 19 số");
                    }
                    if (value && value.length < 7) {
                      callback("Số tài khoản phải trong phạm vi từ 6 đến 19 số");
                    }
                    callback();
                  },
                },
              ],
            })(
              <InputItem
                size="large"
                placeholder="Vui lòng điền Số tài khoản"
                onChange={(v) => {
                  this.setState({
                    accountNumber: v.target.value,
                  });
                }}
                maxLength="19"
              />
            )}
          </Item>

          {/* <Item errorMessage={getFieldError("Provincesx")} label="省市/自治市">
            {getFieldDecorator("Provincesx", {
              rules: [
                { required: true, message: "请输入省市/自治市" },
                {
                  validator: (rule, value, callback) => {
                    callback();
                  },
                },
              ],
            })(
              <React.Fragment>
                <SelectArddress
                  show={showArddress}
                  datavalue={datavalue}
                  isShow={(val) => {
                    this.setState({
                      showArddress: val,
                    });
                  }}
                  onChange={(val) => {
                    console.log(val);
                    this.setState({
                      datavalue: val,
                    });
                    setFieldsValue({
                      Provincesx: val[0].name + val[1].name + val[2].name,
                    });
                  }}
                />
              </React.Fragment>
            )}
          </Item>

          <Item label={`城市／城镇`} errorMessage={getFieldError("city")}>
            {getFieldDecorator("city", {
              rules: [
                { required: true, message: "请输入城市/城镇" },
                {
                  validator: (rule, value, callback) => {
                    if (
                      value &&
                      !/^[A-Za-z-\u4e00-\u9fa5]{1,20}$/.test(value)
                    ) {
                      callback("格式不正确");
                    }
                    callback();
                  },
                },
              ],
            })(
              <InputItem
                size="large"
                placeholder="请输入城市/城镇"
                onChange={(v) => {
                  this.setState({
                    city: v.target.value,
                  });
                }}
                maxLength="20"
              />
            )}
          </Item>

          <Item label={`分行`} errorMessage={getFieldError("branch")}>
            {getFieldDecorator("branch", {
              rules: [
                { required: true, message: "请输入分行" },
                {
                  validator: (rule, value, callback) => {
                    if (value && !addressReg.test(value)) {
                      callback("格式不正确");
                    }
                    callback();
                  },
                },
              ],
            })(
              <InputItem
                size="large"
                placeholder="请输入分行"
                onChange={(v) => {
                  this.setState({
                    branch: v.target.value,
                  });
                }}
                maxLength="20"
              />
            )}
          </Item> */}
          {bankNum != 0 &&
            <Flexbox alignItems="center">
              <Checkbox
                icon={<BsCheckSquareFill color="#00A6FF" size={18} />}
                checked={defaultAccount}
                onChange={(value) => {
                  this.setState({
                    defaultAccount: value,
                  });
                }}
                label="Đặt làm ngân hàng mặc định"
              />
            </Flexbox>
          }
          <button
            onClick={() => {
              if (this.submitBtnEnable()) {
                this.addCard();
              }
            }}
            className={classNames({
              active: this.submitBtnEnable(),
              submit: true,
            })}
          >
            Lưu
          </button>
        </div>
      </Layout>
    );
  }
}

export default withRouter(createForm({ fieldNameProp: "addbank" })(AddBank));

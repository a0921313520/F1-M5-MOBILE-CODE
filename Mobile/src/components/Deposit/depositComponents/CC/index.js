import React from 'react';
import { createForm } from "rc-form";
import Button from "@/components/View/Button";
import Input from "@/components/View/Input";
import MoneyInput from "./../MoneyInput";
import TargetAccount from "./../TargetAccount";
import HostConfig from "@/server/Host.config";
import { CommonPostPay,PromoPostApplications } from "@/api/wallet";
import Toast from "@/components/View/Toast";
import Item from "./../Item";
import Router from "next/router";
const { LocalHost } = HostConfig.Config;
import { formatSeconds, Cookie, getE2BBValue } from "@/lib/js/util";
import { ReactSVG } from "@/components/View/ReactSVG";

class CC extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            targetValue: "", // 目标账户State值
            targetName: "", // 目标账户名称
            bonusVal: 0, // 可申请优惠Val值
            bonusName: "", // 可申请优惠名称
            iconName: "close",
            inputType: "password",
        };

        this.payTypeCode = "CC"; // 当前支付方式Code
        this.tlcCardNumberReg = /^[a-zA-Z0-9_]{1,}$/;
        this.tlcCardPasswordReg = /^[a-zA-Z0-9_]{1,}$/;
    }
    componentDidMount() {}

    payConfirm = (e) => {
        e.preventDefault();
        if (!this.submitBtnEnable()) return;
        if (typeof this.props.depositStatusCheck() === "undefined") return; // 未完成真实姓名验证则呼出完善弹窗

        this.props.form.validateFields((err, values) => {
            if (!err) {
                const hide = Toast.loading();
                CommonPostPay(
                    {
                        accountHolderName: "",
                        accountNumber: "0",
                        amount: values.money,
                        bankName: "",
                        bonusId: this.state.bonusVal,
                        bonusCoupon: values.bonusCode || "",
                        cardExpiryDate: "",
                        cardName: "",
                        cardNumber: values.tlccardnumber,
                        cardPIN: values.tlccardpin,
                        charges: 0,
                        couponText: "",
                        depositingBankAcctNum: "",
                        depositingWallet: this.props.depositingWallet, // 目标账户Code,
                        domainName: LocalHost,
                        fileBytes: "",
                        fileName: "",
                        isMobile: false,
                        isPreferredWalletSet: false, // 是否设为默认目标账户,
                        isSmallSet: false,
                        language: "zh-cn",
                        mgmtRefNo: "Fun88Mobile",
                        offlineDepositDate: "",
                        offlineRefNo: "0",
                        paymentMethod: this.payTypeCode,
                        refNo: "0",
                        secondStepModel: null,
                        successUrl: LocalHost,
                        transactionType: "Deposit",
                        transferType: null,
                        blackBoxValue: getE2BBValue(),
                        e2BlackBoxValue: getE2BBValue(),
                    },
                    (res) => {
                        hide();
                        if (res.isSuccess) {
							res = res.result;
                            Toast.success("充值成功！");
                            this.props.form.resetFields();

                            /* -----------申请优惠---------- */
                            const { bonusVal } = this.state;
                            if (bonusVal && bonusVal != 0) {
                                PromoPostApplications(
                                    {
                                        bonusId: bonusVal,
                                        amount: values.money,
                                        bonusMode: 'Deposit',
                                        targetWallet: this.props.depositingWallet,
                                        couponText: '',
                                        isMax: false,
                                        depositBonus: {
                                            depositCharges: 0,
                                            depositId: res.transactionId
                                        },
                                        successBonusId: res.successBonusId,
                                        blackBox: getE2BBValue(),
                                        blackBoxValue: getE2BBValue(),
                                        e2BlackBoxValue: getE2BBValue(),
                                    },
                                    (res) => {
                                        //console.log(res);
                                        if (res.message == 'fun88_BonusApplySuccess') {
                                            Router.push(
                                                `/Deposit/promostatus/?id=${bonusVal}&wallet=${this.props
                                                    .depositingWallet}&value=${values.money}`
                                            );
                                        }
                                    }
                                );
                            }
                        }
                    }
                );
            }
        });
        // Pushgtagdata(`Deposit`, 'Submit', 'Submit_Cashcard_Deposit');
    };
    goHome = () => {
        clearInterval(this.timeTimer);
        Router.push("/");
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
    submitBtnEnable = () => {
        let errors = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined)
        let values = Object.values(this.props.form.getFieldsValue()).some((v) => v == "" || v == undefined)
        return  !values && !errors
    }
    render() {
        let { setting } = this.props.currDepositDetail; // 当前支付方式的详情
        const {
            getFieldsError,
            getFieldError,
            getFieldValue,
            getFieldDecorator,
        } = this.props.form;
        const {
            targetValue,
            bonusVal,
            iconName,
        } = this.state;

        return (
            <React.Fragment>
                <div className="form-wrap">
                    <MoneyInput
                        getFieldDecorator={getFieldDecorator}
                        payTypeCode={this.payTypeCode}
                        payMethodList={this.props.payMethodList}
                        setCurrDepositDetail={this.props.setCurrDepositDetail}
                        getFieldError={getFieldError}
                        setting={setting}
                        currDepositDetail={this.props.currDepositDetail}
                    />
                    <Item
                        errorMessage={this.props.form.getFieldError(
                            "tlccardnumber"
                        )}
                    >
                        {getFieldDecorator("tlccardnumber", {
                            rules: [
                                {
                                    required: true,
                                    message: "请填写现金卡序列号！",
                                },
                                {
                                    validator: (rule, value, callback) => {
                                        if (value) {
                                            if (
                                                !this.tlcCardNumberReg.test(
                                                    value
                                                )
                                            ) {
                                                callback(
                                                    "现金卡序列号不接受字母"
                                                );
                                            }
                                        }
                                        callback();
                                    },
                                },
                            ],
                        })(
                            <Input
                                size="large"
                                placeholder="现金卡序列号"
                                autoComplete="off"
                                maxLength={16}
                            />
                        )}
                    </Item>
                    <Item
                        errorMessage={this.props.form.getFieldError(
                            "tlccardpin"
                        )}
                    >
                        {getFieldDecorator("tlccardpin", {
                            rules: [
                                {
                                    required: true,
                                    message: "请填写现金卡密码！",
                                },
                                {
                                    validator: (rule, value, callback) => {
                                        if (value) {
                                            if (
                                                !this.tlcCardPasswordReg.test(
                                                    value
                                                )
                                            ) {
                                                callback(
                                                    "密码只能包含数字，字母或者下划线"
                                                );
                                            }
                                        }
                                        callback();
                                    },
                                },
                            ],
                        })(
                            <Input
                                size="large"
                                type={this.state.inputType}
                                placeholder="现金卡密码"
                                autoComplete="off"
                                maxLength={20}
                                suffix={
                                    <ReactSVG
                                        className={`loginSVG login__pwd__${iconName}`}
                                        src={`/img/svg/login/eyes-${iconName}.svg`}
                                        onClick={this.changeIconName}
                                    />
                                }
                            />
                        )}
                    </Item>
                    <TargetAccount
                        getFieldDecorator={getFieldDecorator}
                        getFieldValue={getFieldValue}
                        setLoading={this.props.setLoading}
                        targetValue={targetValue}
                        setTargetValue={(v, name) => { this.setState({ targetValue: v, targetName: name }) }}
                        bonusVal={bonusVal}
                        setBonusValue={(v, name) => { this.setState({ bonusVal: v, bonusName: name }) }}
                    />
                    <div>
                    <div className={`btn-wrap depo-btn-submit ${
                                        !this.submitBtnEnable() ? "btn-disable" : ""
                                    }`}>
                            <Button
                                size="large"
                                type="primary"
                                onClick={this.payConfirm}
                            >
                                提交
                            </Button>
                        </div>
                    </div>
                </div>
                {/* 温馨提示 */}
                    <div className="deposit-help-wrap">
                        <ul className="noStyle">
                            <li>乐天使温馨提醒：</li>
                            <li>
                                乐卡是一种充值预付卡，通过第三方平台轻松购买(乐卡)，无需激活，无需透露个人银行资料.
                                一般到帐时间约15分钟 使用乐卡存款更方便快捷.
                                如果您想了解更多关于乐卡的存款或购买详情,
                                欢迎咨询
                                <Button
                                    type="link"
                                    onClick={global.PopUpLiveChat}
                                >
                                    在线客服
                                </Button>
                                。
                            </li>
                        </ul>

                        <ul style={{ marginTop: "20px" }}>
                            <div className="li-title">
                                依照以下3个简单的步骤即可存上：
                            </div>
                            <li>从乐天堂指定合作伙伴购买乐。</li>
                            <li>确保乐卡的货币与乐天堂账户上的保持一致。</li>
                            <li>输入正确的乐卡序列号和密码。</li>
                        </ul>
                    </div>
            </React.Fragment>
        );
    }
}
export default createForm({ fieldNameProp: "cc" })(CC);

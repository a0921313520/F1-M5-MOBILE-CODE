/*
 * @Author: Alan
 * @Date: 2022-03-25 16:46:20
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-29 13:15:24
 * @Description: 提款页面
 * @FilePath: \Mobile\pages\Withdrawal\index.js
 */
import React from "react";
import Layout from "@/components/Layout";
import Flexbox from "@/components/View/Flexbox/";
import Toast from "@/components/View/Toast";
import { numberWithCommas, getE2BBValue } from "@/lib/js/util";
import Modal from "@/components/View/Modal";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { fetchRequest } from "@/server/Request";
import { ApiPort } from "@/api/index";
import Qs from "qs";
import {
  GetWithdrawalMethods,
  GetWithdrawDetails,
  GetWithdrawallBanks,
  GetMemberBanks,
  GetCheckWithdrawalThresholdDetails,
  GetAllBalance,
  TransferSubmit,
} from "@/api/wallet";
import { ReactSVG } from "@/components/View/ReactSVG";
import Popover from "@/components/View/Popover";
import classNames from "classnames";
import LB from "@/components/Withdrawal/LB";
import USDT from "@/components/Withdrawal/USDT";
import Loading from "../../src/components/Common/Loading";
import FinishStep from "@/components/Withdrawal/Components/FinishStep";
import {
  ACTION_User_getDetails,
  ACTION_UserInfo_getBalance,
} from "@/lib/redux/actions/UserInfoAction";
import { connect } from "react-redux";
import Router from "next/router";
import { CmsBanner } from "@/api/home";
import BannerBox from "@/components/Banner";
import { getDepositVerifyInfo } from "@/lib/js/util";
import ReactIMG from "@/components/View/ReactIMG";

const withdrawalBanner = {
  action:{
    actionId: 0,
    actionName: 'No Action'
  },
  body: '',
  category: 'withdraw',
  cmsImageUrl: '/img/withdrawalBanner.jpeg',
  title: 'withdraw test data -1'
}
class Withdrawals extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAll: false, //是否展開所有钱包
      WithdrawalBank: [], //提款方式列表
      SelectBankType: "", //当前选择的提款方式
      usdtWithdrawlModal: false, //虚拟币弹窗
      toWallet: "", //目标账户
      bankBox: [], //用户绑定的银行卡
      DescriptionCode: "", //银行卡的状态码
      coinTypes: [],
      otherWalletList: [],
      otherWalletTotal: 0,
      TotalBal: 0,
      MAINBal: 0,
      WithdrawalBeforeVerify: false,
      isIWMM: false, //是否展示 开启更多存款和提款方式 按鈕
      AllpayoutDurations: [],
      CCWSetting:null, //泰達幣提款相關參數，決定Crypto member type (Locked/Monitoring/Released),
      isLoadingDetail:false, //是否正在取得提款方式詳細參數
      isLoadingBalance:false,
    };
  }
  componentDidMount() {
    //this.props.userInfo_getDetails();//优化api性能 注释多余请求
    this.MemberFlagsStatus();
    this.WithdrawalMethods();
    this.AllBalance();
    this.WithdrawalVerify();
    // this.GetCmsBanne();
    // window.Pushgtagdata &&
    //   Pushgtagdata(window.location.origin, "Launch", `withdraw`);
    this.GetPayoutDurations();
  }

  //存款之前进行验证 是否受到限制，如果被限制 跳转到验证页面
  MemberFlagsStatus = async () => {
    //const hide = Toast.loading();
    return getDepositVerifyInfo()
      .then((info) => {
        const resultCode = info.code;
        //hide();
        if (resultCode === "NO_OTP_TIMES") {
          //沒剩餘次數，直接展示超過驗證次數頁
          // Router.push('/DepositVerify');
          this.setState({
            WithdrawalBeforeVerify: true,
          });
        } else if (resultCode === "HAS_OTP_TIMES") {
          //還有剩餘次數，進入手機驗證頁面
          // Router.push('/DepositVerify');
          this.setState({
            WithdrawalBeforeVerify: true,
          });
        } else {
          let newState = {};
          //不显示iwmm https://trello.com/c/z1sWgDkf/125-mobileapp-remove-pii-iwmm-checking-from-fe
          // if (resultCode === 'IS_IWMM') {
          // 	newState.isIWMM = true;
          // } else if (resultCode === 'NOT_IWMM') {
          // 	newState.isIWMM = false;
          // }
          //this.getDepositFrontData(); // Get会员信息
          this.props.userInfo_getDetails();
          newState.isDepositMethodsRestricted =
            info.flags.isDepositMethodsRestricted;
          this.setState(newState);
        }
        return true;
      })
      .catch((errorCode) => {
        console.log(errorCode);
        //hide();
        //提示不同的錯誤訊息 隱密的 判斷錯誤原因
        if (errorCode === "DATA_ERROR0") {
          Toast.error("验证请求失败，请刷新后重试.", 5);
        } else if (errorCode === "NET_ERROR0") {
          Toast.error("验证请求失败，请嘗試刷新页面.", 5);
        } else {
          Toast.error("验证请求失败，请嘗試刷新", 5);
        }
        return false;
      });
  };

  /**
   * @description:  获取banner
   * @param {*}
   * @return {*}
   */
  // GetCmsBanne = () => {
  //   CmsBanner("withdraw", (res) => {
  //     if (res.message) {
  //       return;
  //     }
  //     if (res) {
  //       this.setState({
  //         Banner: res,
  //       });
  //     }
  //   });
  // };

  componentDidUpdate(nextProps) {
    if (
      this.props.userInfo.memberInfo.WithdrawalBeforeVerify !==
      nextProps.userInfo.memberInfo.WithdrawalBeforeVerify
    ) {
      this.WithdrawalVerify();
    }
  }

  WithdrawalVerify() {
    let VerifyStep =
      this.props.userInfo.memberInfo.WithdrawalBeforeVerify !==
      "DoneVerifyStep";
    this.setState({
      WithdrawalBeforeVerify: VerifyStep,
    });
  }

  AllBalance() {
    this.setState({isLoadingBalance:true})
    GetAllBalance((res) => {
      if (res.isSuccess && res.result) {
        this.setState(
          {
            isLoadingBalance:false,
            balanceList: res.result,
            TotalBal: res.result.find((v) => v.name == "TotalBal").balance,
            MAINBal: res.result.find((v) => v.name == "MAIN").balance,
            otherWalletList: res.result.filter(
              (v) => v.state !== "UnderMaintenance" && (v.name !== "TotalBal" && v.name !== "MAIN")
            ),
          },
          () => {
            this.calcOtherWalletTotal();
          }
        );
      }
    });
  }

  calcOtherWalletTotal = () => {
    const { otherWalletList } = this.state;
    console.log(otherWalletList);
    if (!otherWalletList.length) {
      this.setState({
        otherWalletTotal: 0,
      });
      return;
    }
    const otherBal = otherWalletList.reduce(function (a, b) {
      return { balance: a.balance + b.balance };
    }).balance;

    this.setState({
      otherWalletTotal: otherBal,
    });
  };

  /**
   * @description: 获取提款方式/优先获取本地
   * @param {*}
   * @return {*}
   */
  WithdrawalMethods() {
    Toast.loading("请稍后...");
    let localData = localStorage.getItem("Withdrawal");
    if (localData) {
      let data = JSON.parse(localData);
      if (data) {
        this.setState(
          {
            WithdrawalBank: data,
          },
          () => {
            if (data && data.length) {
              this.BankTypeClick(data[0].code);
            }
          }
        );
      }
    }
    /**
     * @description: 请求获取当前类型的详情
     * @param {*}
     * @return {*}
     */
    GetWithdrawalMethods((data) => {
      if (data.isSuccess) {
        const { paymentMethods } = data.result;
        localStorage.setItem("Withdrawal", JSON.stringify(paymentMethods));
        let ccwObj = paymentMethods.find((ele) => ele.code === "CCW");
        let coinTypes = ccwObj?.availableCoinTypes?.coinTypes || [];
   
        let Bank;
        if (!coinTypes.length) {
          Bank = paymentMethods.filter((ele) => ele.code !== "CCW");
        } else {
          Bank = paymentMethods;
        }
        this.setState(
          {
            WithdrawalBank: Bank,
            coinTypes: coinTypes,
          },
          () => {
            if (
              this.state.WithdrawalBank &&
              this.state.WithdrawalBank.length &&
              this.state.SelectBankType == ""
            ) {
              this.BankTypeClick(this.state.WithdrawalBank[0].code);
            }
          }
        );
      }
      Toast.destroy();
    });
  }

  /**
   * @description: 切换提款方式
   * @param {*} Code 当前提款方式的类型Code
   * @param {*} update 提款成功後更新detail
   * @return {*}
   */
  BankTypeClick(Code, update = false ) {
    if (this.state.SelectBankType == Code && !update) {
      return;
    }
    if (Code === "CCW") {
      if (!localStorage.getItem("usdtWithdrawlModal")) {
        this.setState({
          usdtWithdrawlModal: true,
        });
      }
    }
    this.setState({
      SelectBankType: Code,
      userBankOpen: false,
      BankOpen: false,
      moneyError: "",
      CCWSetting:null,
      isLoadingDetail:true,
    });
    let params = {
      transactionType: "Withdrawal",
      method: Code,
      isMobile: true,
      MethodCode: "DEFAULT",
    };
    GetWithdrawDetails(params, (data) => {
      if (data.isSuccess) {
        const { result } = data;
        this.setState(prevState=>{
          return{
            ...prevState,
              isLoadingDetail:false,
              MaxBal: result.setting.maxBal,
              MinBal: result.setting.minBal,
              DayBal: result.setting.dayBal,
              suggestedAmounts: result.suggestedAmounts,
              CCWSetting: Code ==="CCW" ? result.setting :null
          }
        })
        if (Code == "LB") {
          this.BankAccountGet();
        }
        if (Code == "CCW") {
          let CoinsCurrency = this.state.coinTypes.length
            ? this.state.coinTypes[0]
            : "";
          if (CoinsCurrency) {
            this.setState(
              {
                CoinsCurrency: CoinsCurrency,
              }
              // () => {
              // 	this.GetExchangeRate(); //获取汇率
              // 	this.getWalletAddress(); //获取钱包地址
              // }
            );
          }
        }
      }
    });
  }

  /**
   * @description: 获取用户已绑定的银行卡列表
   * @param {*}
   * @return {*}
   */
  BankAccountGet() {
    GetMemberBanks((res) => {
      if (res.isSuccess) {
        const { result } = res;
        if (result.length) {
          let defaultBank = result.find((v) => v.isDefault);
          let notDefaultBank = result.filter((ele) => !ele.isDefault);
          let data = [defaultBank, ...notDefaultBank].filter((ele) => ele);
          this.setState(
            {
              bankBox: data.length > 5 ? data.slice(0, 5) : data,
              toWallet: defaultBank ? defaultBank.name : data[0].name,
              toWalletKey: 0,
            },
            () => {
              this.testBankCard(this.state.bankBox[0].bankAccountID);
            }
          );
        }
      }
    });
  }

  /**
   * @description: 获取单卡是否达到提现限制
   * @param {*} BankAccountID 银行卡ID
   * @return {*}
   */
  testBankCard = (BankAccountID) => {
    let params = {
      bankAccountNumber: BankAccountID,
    };
    GetCheckWithdrawalThresholdDetails(params, (res) => {
      if (res.isSuccess) {
        const { result } = res;
        this.setState({
          DescriptionCode: result.descriptionCode,
          IsExceedThreshold: result.withdrawalThresholdDetails
            ? result.withdrawalThresholdDetails.isExceedThreshold
            : false,
        });
      }
    });
  };

  handleTransfer(TotalBal) {
    Toast.loading();
    let DATA = {
      fromAccount: "ALL",
      toAccount: "MAIN",
      amount: TotalBal,
      bonusId: 0,
      bonusCoupon: "",
      blackBoxValue: getE2BBValue(),
      e2BlackBoxValue: getE2BBValue(),
    };

    TransferSubmit(DATA, (res) => {
      Toast.destroy();
      if (res.isSuccess && res.result) {
        if (res.result.status == 1) {
          Toast.success("转账成功!");
          this.AllBalance();
        } else {
          Toast.error(res.result.messages);
        }
      } else {
        Toast.error("转账出错，稍后重试！");
      }
    });
  }

  openIWMMModal = () => {
    // Pushgtagdata("Verification", "Click", "IWMM_PII_WithdrawalPage");
    Modal.info({
      title: "",
      centered: true,
      okText: "立即验证",
      cancelText: "稍后验证",
      className: `commonModal VerificationModal`,
      maskClosable: false,
      content: (
        <React.Fragment>
          <center>
            <ReactSVG src="/img/svg/note.svg" className="Modalicon" />
          </center>
          <div className="note">
            提醒您，完成验证后，即可享有更多存款 和提款方式。
          </div>
        </React.Fragment>
      ),
      onOk: () => {
        Router.push("/DepositVerify?IWMM=1&page=Withdrawal");
      },
      onCancel: () => {},
    });
  };

  getPrefixAmount(data) {
    let params = {
      transactionType: "Withdrawal",
      amount: data.amount,
      method: data.method,
      methodCode: data.methodCode,
    };
    const hide = Toast.loading();

    fetchRequest(
      ApiPort.ClosestPrefixAmount + Qs.stringify(params) + "&",
      "GET"
    )
      .then((res) => {
        hide();
        this.Submitinfo(res.result);
      })
      .catch((error) => {
        hide();
        console.log(error);
      });
  }

  Submitinfo(AmountInfo) {
    const { bankCodeState, payMoney, moneyError, fixedAmount } =
      this.Withdrawalinfo.state;
    if (AmountInfo.isExist) {
      Modal.info({
        title: "",
        centered: true,
        okText: "好的",
        cancelText: "取消",
        className: `VerificationBankModal`,
        content: (
          <React.Fragment>
            <center>
              <ReactIMG src="/img/verify/warn.png" />
            </center>
            <div className="note">
              快速提款 {AmountInfo.isExist ? AmountInfo.prefixAmount : payMoney}{" "}
              元，即刻体验推荐金额 ？
            </div>
          </React.Fragment>
        ),
        onOk: () => {
          this.Withdrawalinfo.onChange(
            AmountInfo.isExist ? AmountInfo.prefixAmount.toString() : payMoney,
            true
          );
        },
        onCancel: () => {
          this.Withdrawalinfo.onChange(payMoney, true);
        },
      });
      return;
    }

    let Submit = payMoney != "" && moneyError == "" && bankCodeState != "";
    if (Submit) {
      this.Withdrawalinfo.Withdrawal();
    }
  }
  // 拿預約時間的API
  GetPayoutDurations() {
    GetWithdrawallBanks((res) => {
      if (res.isSuccess && res.result) {
     
        this.setState({
          AllpayoutDurations: res.result.payoutDurations,
        });
      }
    });
  }
  render() {
    const {
      TotalBal,
      MAINBal,
      otherWalletTotal,
      balanceList,
      CoinsCurrency,
      coinTypes,
      showAll,
      WithdrawalBank,
      SelectBankType,
      toWallet,
      Banner,
      OpenFinishStep,
      FinishData,
	    maxDuration,
      payMoney,
      WithdrawalBeforeVerify, //提款验证弹出
      bankBox, //绑定的银行卡列表
      DescriptionCode, //银行卡状态码
      MaxBal, //最高金额
      MinBal, //最低金额
      DayBal, //日限额
      suggestedAmounts, //推荐金额
      AllpayoutDurations, //預約時間,
      CCWSetting,
      isLoadingDetail,
      isLoadingBalance
    } = this.state;
    console.log("AllpayoutDurations", AllpayoutDurations);
    const { memberInfo } = this.props.userInfo;
    console.log("---------------->会员信息", memberInfo);
    return (
      <Layout
        title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
        Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
        Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
        status={2}
        hasServer={true}
        barFixed={true}
        BarTitle={this.state.pageTitle || "提款"}
        backEvent={() => {
          Router.push("/");
        }}
      >
        {/* 寫死的Banner，不透過cms api */}
        {
          <BannerBox item={withdrawalBanner} type="Deposit" />
        }
        <Flexbox id="Withdrawal" flexDirection="column">
          <Flexbox className="Blance list" flexDirection="column">
            <Loading isLoading={isLoadingBalance}>
              <Flexbox className="MainBlance" justifyContent="space-between">
                <Flexbox flexDirection="column" flex="1">
                  <label>总余额</label>
                  <b>￥{numberWithCommas(TotalBal) || "0"}</b>
                </Flexbox>
                <Flexbox
                  alignItems="center"
                  flex="1"
                  justifyContent="flex-end"
                  className="right"
                >
                  <Flexbox flexDirection="column">
                    <label>主账户</label>
                    <b>￥{numberWithCommas(MAINBal) || "0"}</b>
                  </Flexbox>
                  <Flexbox>
                    <ReactSVG
                      className="Transfericon"
                      src="/img/P5/svg/transfericon.svg"
                      onClick={() => {
                        this.handleTransfer(TotalBal);
                        // Pushgtagdata(
                        //   `Transfer`,
                        //   "Submit",
                        //   `QuickTransfer_WithdrawPage`
                        // );
                      }}
                    />
                  </Flexbox>
                </Flexbox>
              </Flexbox>
                     
              <Flexbox
                className="WalletList"
                justifyContent="space-between"
                alignItems="center"
                onClick={() => {
                  this.setState({
                    showAll: !showAll,
                  });
                }}
              >
                <label>其他钱包</label>
                <Flexbox className="OtherBlance" alignItems="center">
                  ￥{numberWithCommas(otherWalletTotal)}{" "}
                  <ReactSVG className="Downicon" src="/img/svg/d.svg" />
                </Flexbox>
              </Flexbox>

              <Flexbox
                className="OtherWalletList bounceIn animated"
                flexWrap="wrap"
                justifyContent="center"
                style={{ display: showAll ? "flex" : "none" }}
              >
                {balanceList &&
                  balanceList.map((item, index) => {
                    if (item.category != "TotalBal" && item.category != "Main")
                      return (
                        <Flexbox
                          key={index + "list"}
                          className="Blancelist"
                          flexDirection="column"
                          flex="0 0 45%"
                        >
                          <Flexbox>
                            {item.localizedName}{" "}
                            {item.category == "Sportsbook" && (
                              <React.Fragment>
                                <ReactSVG
                                  onClick={() => {
                                    this.setState({
                                      isShowInfo: !this.state.isShowInfo,
                                    });
                                  }}
                                  className="tansfeinfo"
                                  src="/img/svg/TransferInfo.svg"
                                />
                                <Popover
                                  direction="top"
                                  className="Blance-popover"
                                  visible={this.state.isShowInfo}
                                  onClose={() => {
                                    this.setState({ isShowInfo: false });
                                  }}
                                >
                                  <span>
                                  包含 醉心体育,V2虚拟体育,沙巴体育, BTI体育,IM体育和电竞
                                  </span>
                                </Popover>
                              </React.Fragment>
                            )}
                            {item.category == "P2P" && item.name == "P2P" && (
                              <React.Fragment>
                                <ReactSVG
                                  onClick={() => {
                                    this.setState({
                                      isShowP2PInfo: !this.state.isShowP2PInfo,
                                    });
                                  }}
                                  className="tansfeinfo"
                                  src="/img/svg/TransferInfo.svg"
                                />
                                <Popover
                                  direction="top"
                                  className="BlanceP2P-popover"
                                  visible={this.state.isShowP2PInfo}
                                  onClose={() => {
                                    this.setState({ isShowP2PInfo: false });
                                  }}
                                >
                                  <span>
                                    包含双赢棋牌，开元棋牌和小游戏
                                  </span>
                                </Popover>
                              </React.Fragment>
                            )}
                          </Flexbox>
                          {item.state === 'UnderMaintenance' ? (
													  <p>维护中</p>
                          ) : (
                            <b>￥{numberWithCommas(item.balance)}</b>
                          )}
                        </Flexbox>
                      );
                  })}
              </Flexbox>
            </Loading> 
          </Flexbox>
          <div className="WithdrawalMethod" style={{ marginBottom: "10px" }}>
            {this.state.isIWMM && (
              <React.Fragment>
                <div
                  className="OpenMore"
                  onClick={() => {
                    this.openIWMMModal();
                  }}
                >
                  点击开启更多存款和提款方式
                </div>
                <div className="IWMMPopover">
                  点击上方按钮完成验证，网银转帐交易即可享有免5%手续费
                </div>
              </React.Fragment>
            )}

            <Flexbox className="Bank list">
              {WithdrawalBank.map((item, index) => {
                return (
                  <Flexbox
                    flexFlow="column"
                    className={classNames({
                      Active: SelectBankType == item.code,
                      bankitem: true,
                      new: item.isNew,
                      fast: item.isFast,
                    })}
                    key={index + "bank"}
                    onClick={() => {
                      this.BankTypeClick(item.code);
                      this.setState({
                        SelectBankType: item.code,
                      });
                      // Pushgtagdata(
                      //   `Withdrawal Nav`,
                      //   "Click",
                      //   `${
                      //     item.code == "CCW" ? "Crypto" : item.code
                      //   }_WithdrawPage`
                      // );
                    }}
                  >
                    <ReactSVG
                      src={`/img/svg/${
                        SelectBankType == item.code
                          ? item.code + "Active"
                          : item.code
                      }.svg`}
                      className={classNames({
                        iconActive: SelectBankType == item.code,
                      })}
                    />

                    <span>{item.name}</span>
                  </Flexbox>
                );
              })}
            </Flexbox>
          </div>

          {SelectBankType == "LB" && !isLoadingDetail && (
            <React.Fragment>
              <Flexbox className="Form list">
                <LB
                  toWallet={toWallet}
                  bankBox={bankBox}
                  DescriptionCode={DescriptionCode}
                  MaxBal={MaxBal}
                  MinBal={MinBal}
                  DayBal={DayBal}
				          AllpayoutDurations={AllpayoutDurations}
                  suggestedAmounts={suggestedAmounts}
                  showDonePage={(FinishData, payMoney,maxDuration) => {
                    this.setState({
                      OpenFinishStep: true,
                      FinishData: FinishData,
					            maxDuration:maxDuration,
                      payMoney: payMoney,
                    });
                  }}
                />
              </Flexbox>

              {/* <div className="deposit-help-wrap">
                <h4>乐天使温馨提醒：</h4>
                <ul>
                  <li>收到提款后，请前往【交易记录】页面点击【确认到账】。</li>
                </ul>
              </div> */}
            </React.Fragment>
          )}
          {SelectBankType == "CCW" && CoinsCurrency && CCWSetting && (
            <Flexbox className="Form list">
              <USDT
                toWallet={toWallet}
                bankBox={bankBox}
                DescriptionCode={DescriptionCode}
                MaxBal={MaxBal}
                MinBal={MinBal}
                DayBal={DayBal}
                CCWSetting={CCWSetting}
                CoinTypes={coinTypes}
                CoinsCurrency={CoinsCurrency}
                key={CoinsCurrency}
                CheckPrefixAmount={(DATA) => {
                  this.getPrefixAmount(DATA);
                }}
                Withdrawalinfo={(e) => {
                  this.Withdrawalinfo = e;
                }}
                onUpdateAfterSuccess={()=>{
                  this.BankTypeClick("CCW",true);
                  this.AllBalance();
                  this.props.userInfo_getBalance(true);
                }}
              />
            </Flexbox>
          )}

          {((SelectBankType == "CCW" && !CoinsCurrency ) || isLoadingDetail ) && (
            <SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
              <Skeleton count={1} height="78px" />
              <Skeleton count={4} height="44px" />
            </SkeletonTheme>
          )}
        </Flexbox>
        <Modal
          transparent
          maskClosable={false}
          visible={memberInfo && memberInfo.isDeposited == 0}
          className="OpenOtpModal"
          closable={false}
          title={<div>温馨提醒</div>}
        >
          <Flexbox
            className="Content"
            alignItems="center"
            justifyContent="space-around"
            flexDirection="column"
          >
            <Flexbox margin="10px">
              您还未存款，提款前请先进行存款和游戏。
            </Flexbox>
          </Flexbox>
          <Flexbox justifyContent="space-around">
            <Flexbox
              className="Cancel"
              onClick={() => {
                Router.push("/");
              }}
            >
              取消
            </Flexbox>
            <Flexbox
              className="Confirm"
              onClick={() => {
                Router.push("/DepositPage");
              }}
            >
              立即存款
            </Flexbox>
          </Flexbox>
        </Modal>

        <Modal
          transparent
          maskClosable={false}
          visible={
            memberInfo && memberInfo.isDeposited != 0 && WithdrawalBeforeVerify
          }
          className="OpenOtpModal"
          closable={false}
          title={<div>安全认证</div>}
        >
          <Flexbox
            className="Content"
            alignItems="flex-start"
            justifyContent="space-around"
            flexDirection="column"
          >
            <Flexbox>
              <b>为了您的账户安全，请先完成以下验证：</b>
              <br />
              <br />
            </Flexbox>
            <ol>
              <li>• 验证身份证号码</li>
              <li>• 完善个人资料</li>
              <li>• 验证手机号 </li>
              <li>• 验证电子邮箱</li>
            </ol>
            <br />
          </Flexbox>
          <Flexbox justifyContent="space-around">
            <Flexbox
              className="Cancel"
              onClick={() => {
                this.setState({
                  WithdrawalBeforeVerify: false,
                });
                Router.push("/");
              }}
            >
              取消提款
            </Flexbox>
            <Flexbox
              className="Confirm"
              onClick={() => {
                Router.push("/WithdrawalVerify");
              }}
            >
              立即验证
            </Flexbox>
          </Flexbox>
        </Modal>
        {/* 預約時間從這裡傳過去 */}
        {OpenFinishStep && (
          <FinishStep
            showModal={OpenFinishStep}
            FinishData={FinishData}
            payMoney={payMoney}
            CloseModal={() => {
              this.setState({
                OpenFinishStep: false,
              });
            }}
          />
        )}
      </Layout>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.userInfo,
});

const mapDispatchToProps = {
  userInfo_getDetails: () => ACTION_User_getDetails(),
  userInfo_getBalance: (forceUpdate = false) =>
    ACTION_UserInfo_getBalance(forceUpdate),
};

export default connect(mapStateToProps, mapDispatchToProps)(Withdrawals);
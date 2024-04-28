/*
 * @Author: Alan
 * @Date: 2022-05-10 22:05:09
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-14 16:28:31
 * @Description: 返水详情
 * @FilePath: \Mobile\src\components\transaction-record\Detail.js
 */
import React from "react";
import Modal from "@/components/View/Modal";
import Flexbox from "@/components/View/Flexbox/";
import BackBar from "@/components/Header/BackBar";
import classNames from "classnames";
import {
  ACTION_UserInfo_getBalance,
  ACTION_User_getDetails,
} from "@/lib/redux/actions/UserInfoAction";
import { connect } from "react-redux";
import Steps, { Step } from "rc-steps";
import Button from "@/components/View/Button";
import BackToTop from '$SBTWO/BackToTop';
import { ReactSVG } from "@/components/View/ReactSVG";
import copy from "copy-to-clipboard";
import { PopUpLiveChat, numberWithCommas } from "@/lib/js/util";
import Toast from "@/components/View/Toast";
import { BsFillRecord2Fill, BsRecord, BsChevronUp, BsChevronDown } from "react-icons/bs";
import { HiCheckCircle } from "react-icons/hi";
import { MemberCancellation, MemberCancelDeposit } from "@/api/wallet";
import moment from "moment";
import UploadFile from "./UploadFile";
import DetailResubmit from "./DetailResubmit";
import DrawerBankinfo from "./DrawerBankinfo";
import { IoCloseSharp } from "react-icons/io5";
import Router from "next/router";


class PromoInfo extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      //重新提交页面
      ResubmitVisible: false,
      isShowExpandBtn:false,
      isExpand: false, //是否展開split明細
      isWithdrawUpdated:false,
      uploaded: false
    };
  }
  componentDidMount() {
    if(this.props?.SRdetailData?.SubWithdrawalList?.length > 5){
      this.setState({isShowExpandBtn:true})
    }
  }

  componentWillUnmount(){
    if(this.state.isWithdrawUpdated){
      this.props.getWithdrawalData();
    }
  }

  oneKeyCopy(text) {
    copy(text);
    Toast.success("Sao Chép Thành Công");
    this.setState({
      copyTick: true
    })
    // globalGtag("Copy_crypto_deposit");
  }

  ToMemberCancel(DetailItem) {
    let data = {
      amount: DetailItem.amount,
      transactionId: DetailItem.transactionId,
      remark: "remark",
      transactionType: "Withdrawal",
    };
    Toast.loading();
    MemberCancellation(data, (res) => {
      if (res.isSuccess) {
        Toast.success("Gửi Lệnh Thành Công");
        setTimeout(() => {
          this.props.CloseDetail();
          this.props.getWithdrawalData();
        }, 3000);
      } else {
        Toast.error(res.result.message);
      }
      Toast.destroy();
    });
  }
  ToMemberCancelDeposit(DetailItem) {
    let params = {
      transactionId: DetailItem.transactionId,
    };
    Toast.loading();
    MemberCancelDeposit(params, (res) => {
      Toast.destroy();
      if (res.isSuccess) {
        Toast.success('Gửi Lệnh Thành Công');
        setTimeout(() => {
          this.props.CloseDetail();
          this.props.getDepositData();
        }, 3000);
      } else {
        Toast.error(res.result.message);
      }
    });
  }

  ToDoCancel(Type, DetailItem) {
    Modal.info({
      title: Type == "0" ? "Hủy Gửi Tiền" : "Hủy Rút Tiền",
      centered: true,
      okText: 'Chắc Chắn',
      cancelText: 'Không',
      className: `commonModal`,
      closable:false,
      content: (
        <React.Fragment>
          <p style={{ padding: "10px 0 25px 0px", textAlign: 'center',lineHeight:"20px" }}>
              {`Bạn chắc chắn muốn hủy giao dịch ${Type == '0' ? 'gửi' : 'rút'} tiền có số tiền ${DetailItem.amount} đ?`}
          </p>
        </React.Fragment>
      ),
      onOk: () => {
        if (Type == "0") {
          this.ToMemberCancelDeposit(DetailItem);
          // Pushgtagdata(
          //   `Transaction Record`,
          //   "Click",
          //   `Cancel_Deposit_TransactionRecord`
          // );
        } else {
          this.ToMemberCancel(DetailItem);
          // Pushgtagdata(
          //   `Transaction Record`,
          //   "Click",
          //   `Cancel_Withdraw_TransactionRecord​`
          // );
        }
      },
      onCancel: () => {
        if(Type == "0"){
            //仅关闭当前的弹窗，后面如果提款也只是关闭这个提示框就把这个 onCancel() 方法拿掉就好
        }
        else {
          this.props.CloseDetail();
        }
      },
    });

    // if (Type == "0") {
    //   Pushgtagdata(
    //     `Transaction Record`,
    //     "Click",
    //     `Cancel_Deposit_TransactionRecord`
    //   );
    // } else {
    //   Pushgtagdata(
    //     `Transaction Record`,
    //     "Click",
    //     `Cancel_Withdraw_TransactionRecord​`
    //   );
    // }
  }
  handleTime(time){
	if(time==0){
		return(`您的提现将于1小时内完成， 请您耐心等待！`)
	}
	if(time/60>=1){
		if(time%60==0){
			return (`此笔提款交易将于${time/60}小时内完成`)
		}else{
			return (`此笔提款交易将于${parseInt(time/60)}小时${time%60}分钟内完成`)
		}
	}else{
		return (`此笔提款交易将于${time%60}分钟内完成`)
	}
  }
  render() {
    const { ShowDetail, Type, DetailItem, CloseDetail, SRdetailData ,isAnyModalOpen } = this.props;
    const { ResubmitVisible, DrawerShow, isExpand,isShowExpandBtn } = this.state;
    console.log("DetailItem",DetailItem);
	  console.log("ShowDetail",ShowDetail);
    console.log("user info", this.props.userInfo);
    console.log("SRdetailData", SRdetailData, Type);
    console.log("clickedstate",isExpand)
    const withdrawStatus = [
      {statusId:1, statusName:"Pending", LocalizedName:"Đang Xử Lý", color:"#FABE47"},
      {statusId:2, statusName:"Processing", LocalizedName:"Đang Xử Lý", color:"#FABE47"},
      {statusId:3, statusName:"Rejected", LocalizedName:"提款失败", color:"#EB2121"},
      {statusId:4, statusName:"Approved", LocalizedName:"提款成功", color:"#0CCC3C"},
      {statusId:5, statusName:"VendorProcessing", LocalizedName:"Đang Xử Lý", color:"#FABE47"},
      {statusId:6, statusName:"Aprocessing", LocalizedName:"Đang Xử Lý", color:"#FABE47"},
      {statusId:7, statusName:"Locked", LocalizedName:"Đang Xử Lý", color:"#FABE47"},

    ]
    
    let TypeTitle = Type == "0" ? "Gửi Tiền" : "Rút Tiền";
    return (
      <div className="RebateDetail">
        <Modal
          wrapClassName={Type === "2" ? "withdraw-detail-modal" : ""}
          visible={ShowDetail}
          transparent
          maskClosable={false}
          closable={false}
          title={
            <BackBar
              key="main-bar-header"
              title={`Lịch Sử ${TypeTitle}`}
              backEvent={() => {
                CloseDetail();
              }}
              hasServer={true}
            />
          }
          className={classNames({
            "Fullscreen-Modal": true,
            TransactionModalDetail: true,
          })}
        >
          <Flexbox width="100%" className="DetailItem">
            <Flexbox justifyContent="space-between" className="LogInfo">
              <Flexbox flexFlow="column">
                <h3 style={{fontSize:"14px"}}>{DetailItem.paymentMethodName}</h3>
                <small style={{color:"#999999", fontSize:"12px"}}>
                  {moment(new Date(DetailItem.submittedAt)).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </small>
                <small style={{color:"#999999", fontSize:"12px"}}>
                  {DetailItem.transactionId}
                  <ReactSVG
                    src="/img/svg/copy.svg"
                    onClick={() => {
                      this.oneKeyCopy(DetailItem.transactionId);
                    }}
                    className="copy"
                  />
                  {this.state.copyTick && 
                    <span className='blueTick'>
                      <ReactSVG
                        src="/img/svg/blueTick.svg"
                      />
                    </span>
                  }
                </small>
                <Button
                  type="primary"
                  ghost
                  className="Checkinfo"
                  onClick={() => {
                    this.setState({
                      DrawerShow: true,
                    });
                  }}
                >
                  {/* {Type == 0 ? 'Xem chi tiết giao dịch' : 'Xem chi tiết giao dịch'} */}
                  Xem chi tiết giao dịch
                  {/* 查看{TypeTitle}信息 */}
                </Button>
              </Flexbox>
              <Flexbox>
                <b style={{ fontSize: "16px" }}>
                  {DetailItem.amount} đ
                </b>
              </Flexbox>
            </Flexbox>
            {/* 充值展开状态 */}
            {Type == 0 && (
              <Flexbox className="StepsInfo">
                {/* `error` `process` `finish` `wait` */}
                {/* 
								statusId == 1 待处理
								statusId == 2 处理成功
								statusId == 3 处理中
							*/}
                <Steps direction="vertical" size="small" className="deposit-step-box">
                  {/* 待处理 */}
                  {(DetailItem.statusId == 1 || DetailItem.statusId == 4) && (
                    <React.Fragment>
                      {/* <Step
                        title="待处理"
                        icon={<span className="step-icon"><HiCheckCircle size={16} color="#DCDCE0" /></span>}
                        description={moment(
                          new Date(DetailItem.processingDateTime)
                        ).format("YYYY-MM-DD HH:mm")}
                      /> */}
                      <Step
                        className="current-step processing"
                        icon={<span className="step-icon"><BsFillRecord2Fill size={26} color="#FABE47" /></span>}
                        title="Đang Xử Lý"
                        description={moment(
                          new Date(DetailItem.processingDateTime)
                        ).format("DD/MM/YYYY HH:mm")}
                      />
                      <Step
                        title={`Thành Công`}
                        icon={<span className="step-icon"><BsRecord size={18} /></span>}
                        description={""}
                      />
                    </React.Fragment>
                  )}

                  {/* 处理成功 */}
                  {DetailItem.statusId == 2 && (
                    <React.Fragment>
                      <Step
                        title="Đang Xử Lý"
                        icon={<span className="step-icon"><HiCheckCircle size={16} color="#DCDCE0" /></span>}
                        description={moment(
                          new Date(DetailItem.processingDateTime)
                        ).format("DD/MM/YYYY HH:mm")}
                      />
                      <Step
                        className="current-step success"
                        title={<div style={{color:"#0CCC3C"}}>Thành Công</div>}
                        icon={<span className="step-icon"><BsFillRecord2Fill size={22} color="#0CCC3C" /></span>}
                        description={moment(
                          new Date(DetailItem.approvedDateTime)
                        ).format("DD/MM/YYYY HH:mm")}
                      />
                    </React.Fragment>
                  )}

                  {/* 处理失败 */}
                  {DetailItem.statusId == 3 && (
                    <React.Fragment>
                      <Step
                        title="Đang Xử Lý"
                        icon={<span className="step-icon"><HiCheckCircle size={16} color="#DCDCE0" /></span>}
                        description={moment(
                          new Date(DetailItem.processingDateTime)
                        ).format("DD/MM/YYYY HH:mm")}
                      />
                      <Step
                       className="current-step failed"
                        icon={<span className="step-icon"><BsFillRecord2Fill size={26} color="#EB2121" /></span>}
                        title={`Thất Bại`}
                        description={moment(
                          new Date(DetailItem.rejectedDateTime)
                        ).format("DD/MM/YYYY HH:mm")}
                      />
                    </React.Fragment>
                  )}

                  {DetailItem.statusId == 5 && (
                    <React.Fragment>
                      <Step
                        title="Đang Xử Lý"
                        icon={<span className="step-icon"><HiCheckCircle size={16} color="#DCDCE0" /></span>}
                        description={moment(
                          new Date(DetailItem.processingDateTime)
                        ).format("DD/MM/YYYY HH:mm")}
                      />
                      <Step
                       className="current-step failed"
                        icon={<span className="step-icon"><BsFillRecord2Fill size={26} color="#EB2121" /></span>}
                        title={`Hết Thời Gian Chờ`}
                        description={moment(
                          new Date(DetailItem.timeoutDateTime)
                        ).format("DD/MM/YYYY HH:mm")}
                      />
                    </React.Fragment>
                  )}
                </Steps>
              </Flexbox>
            )}

            {/* 提款展开状态 */}
            {Type == 2 && (
              <Flexbox className="StepsInfo">
                {/* `error` `process` `finish` `wait` */}
                {/* 
								statusId == 1 待处理
								statusId == 2，4 处理成功
								statusId == 3 处理中
								statusId == 5,6 处理失败
							*/}
                <Steps direction="vertical" size="small" className="withdraw-step-box">
                  {/* 待处理 */}
                  {DetailItem.statusId === 1 && (
                    <React.Fragment>
                      <Step
                        className="current-step pending"
                        title="Đang Chờ Xử Lý"
                        icon={<span className="step-icon"><BsFillRecord2Fill size={26} /></span>}
                        description={moment(
                          new Date(DetailItem.processingDateTime)
                        ).format("DD-MM-YYYY HH:mm")}
                      />
                      <Step
                        title="Đang Xử Lý"
                        icon={<span className="step-icon"><BsRecord size={18} /></span>}
                        description={""}
                      />
                      <Step
                        title={`Thành Công`}
                        icon={<span className="step-icon"><BsRecord size={18} /></span>}
                        description={""}
                      />
                    </React.Fragment>
                  )}
                  {/* 处理中 */}
                  {(DetailItem.statusId === 2 || 
                    DetailItem.statusId === 3 ||
                    DetailItem.statusId === 7 ||
                    DetailItem.statusId === 8 ||
                    DetailItem.statusId === 9) && (
                    <React.Fragment>
                      <Step
                        title="Đang Chờ Xử Lý"
                        icon={<span className="step-icon"><HiCheckCircle size={16} color="#DCDCE0" /></span>}
                        description={moment(
                          new Date(DetailItem.pendingDateTime)
                        ).format("DD-MM-YYYY HH:mm")}
                      />
                      <Step
                        className="current-step processing"
                        title="Đang Xử Lý"
                        icon={<span className="step-icon"><BsFillRecord2Fill size={26} color="#FABE47" /></span>}
                        description={moment(
                          new Date(DetailItem.processingDateTime)
                        ).format("DD/MM/YYYY HH:mm")}
                      />
                      <Step
                        title={`Thành Công`}
                        icon={<span className="step-icon"><BsRecord size={18} /></span>}
                        description={""}
                      />
                    </React.Fragment>
                  )}
                  {/* 处理成功 */}
                  {(DetailItem.statusId === 4 || DetailItem.statusId === 10) && (
                    <React.Fragment>
                      <Step
                        title="Đang Chờ Xử Lý"
                        icon={<span className="step-icon"><HiCheckCircle size={16} color="#DCDCE0" /></span>}
                        description={moment(
                          new Date(DetailItem.pendingDateTime)
                        ).format("DD-MM-YYYY HH:mm")}
                      />
                      <Step
                        title="Đang Xử Lý"
                        icon={<span className="step-icon"><HiCheckCircle size={16} color="#DCDCE0" /></span>}
                        description={moment(
                          new Date(DetailItem.processingDateTime)
                          ).format("DD/MM/YYYY HH:mm")}
                          />
                      <Step
                        className="current-step success"
                        title={DetailItem.statusLocalizedName}
                        icon={
                          <span className="step-icon">
                            {DetailItem.statusId === 4 
                              ? <BsFillRecord2Fill size={26} color="#0CCC3C" /> 
                              : <ReactSVG className="success-part-icon" src="/img/svg/successPart.svg"/>}
                          </span>}
                        description={moment(
                          new Date(DetailItem.approvedDateTime)
                        ).format("DD/MM/YYYY HH:mm")}
                      />
                    </React.Fragment>
                  )}

                  {/* 处理失败 */}
                  {(DetailItem.statusId === 5 || DetailItem.statusId === 6) && (
                    <React.Fragment>
                      <Step
                        title="Đang Chờ Xử Lý"
                        icon={<span className="step-icon"><HiCheckCircle size={16} color="#DCDCE0" /></span>}
                        description={moment(
                          new Date(DetailItem.pendingDateTime)
                        ).format("DD-MM-YYYY HH:mm")}
                      />
                      <Step
                        title="Đang Xử Lý"
                        icon={<span className="step-icon"><HiCheckCircle size={16} color="#DCDCE0" /></span>}
                        description={moment(
                          new Date(DetailItem.processingDateTime)
                        ).format("DD/MM/YYYY HH:mm")}
                      />
                      <Step
                        className="current-step failed"
                        title={"Thất Bại"}
                        icon={<span className="step-icon"><BsFillRecord2Fill size={26} color="#EB2121" /></span>}
                        description={moment(
                          new Date(DetailItem.rejectedDateTime)
                        ).format("DD/MM/YYYY HH:mm")}
                      />
                    </React.Fragment>
                  )}
                </Steps>
              </Flexbox>
            )}

            <Flexbox flexFlow="column" className="SubmitInfo">
              {/* Deposite 存款 Message */}
              { Type === "0" &&      
                  <div className="withdrawal-help-wrap2" style={{marginTop: 0 }}>
                      <ul style={{paddingLeft: 0, paddingRight: 0}}>
                       {/* {(DetailItem.status === "Cancelled" || DetailItem.status === "Rejected")
                         && "您的交易已取消。"} */}

                        {DetailItem.resubmitDepositID ? 
                          <li>Bạn đã thực hiện giao dịch mới, vui lòng tham khảo mã giao dịch {DetailItem.resubmitDepositID} </li>
                        : 

                          DetailItem.resubmitFlag ? 
                          <li>Số tiền gửi của bạn khác với thông tin đã cung cấp, vui lòng nhấp vào nút “Thực Hiện Lại” để nhập lại số tiền chính xác.</li>
                          :
                          <>
                            {DetailItem.reasonMsg && <li>{DetailItem.reasonMsg}</li>}
                            {DetailItem.reasonMsgLine1 && <li>{DetailItem.reasonMsgLine1}</li>}
                          </> 
                        }
                        
                      </ul>
                  </div>
              }

              {/* Withdrawl remark */}
              {Type === "2" && (
                <div
                  className='withdrawal-help-wrap2 remarks'
                  style={{ marginTop: 0 }}
                >
                  <ol style={{ paddingLeft: 0, paddingRight: 0 
                  // display:
                  //   ((DetailItem.statusId === 1 || DetailItem.statusId === 5 ) && !SRdetailData.ReasonMsg)
                  //   ? "none" 
                  //   : "inherit" 
                  }}>
                    {/* cancelled / rejected message */}
                  {DetailItem.statusId === 6 && "Giao dịch của bạn đã được hủy theo yêu cầu"}

                    {(DetailItem.statusId !== 1 && DetailItem.statusId !== 5 && DetailItem.statusId !== 6) &&
                    <>
                      {/* Remarkl */}
                      {SRdetailData.Amount >= SRdetailData.MinWithdrawalAmount && (
                        <li>
                          当提款金额大于
                          <span> 
                            {` ${SRdetailData.MinWithdrawalAmount} `} 
                          </span>
                          时，系统将会拆分成
                          <span>{` ${SRdetailData.MinSplitWithdrawalCount} `}</span>
                          笔交易以上分批出款。
                        </li>
                      )}
                      {/* Remark2 */}
                      {SRdetailData.RebatePercentage ? (
                        <li>
                          此笔预约提款享有
                          <span> {SRdetailData.RebatePercentage}% </span>
                          红利，交易将于
                          <span> {Math.floor(SRdetailData.PayoutDuration / 60) }                        </span>
                          小时 <span>{SRdetailData.PayoutDuration % 60} </span>
                          分钟内完成，并于所有交易完成后一次性派发红利。
                        </li>
                      ) : (
                        <li>
                          交易将于
                          <span>
                            {Math.floor(SRdetailData.PayoutDuration / 60)}
                          </span>
                          小时 <span>{SRdetailData.PayoutDuration % 60}</span>{" "}
                          分钟内完成。
                        </li>
                      )}
                    </>
                    }
                    {/* Remark3 */}
                    { SRdetailData.ReasonMsg && DetailItem.paymentMethodId != 'CCW' && <li>{SRdetailData.ReasonMsg}</li>}
                  </ol>
                </div>
              )}

              {/* 小額提款分割明細 */}
              {(SRdetailData.SubWithdrawalList?.length && 
                (DetailItem.statusId !== 1 && DetailItem.statusId !== 5 && DetailItem.statusId !== 6)) 
                ? (
                  <div className='split-withdraw-amount-box'>
                    <header>
                      <div>
                        <p>处理中金额</p>
                        <p>
                          {SRdetailData.ProcessingSplitWithdrawalAmount} đ
                        </p>
                      </div>
                      <div>
                        <p>实际到账</p>
                        <p>
                          {SRdetailData.ApprovedSplitWithdrawalAmount} đ
                        </p>
                      </div>
                    </header>
                    <table className='split-withdraw-list'>
                      {SRdetailData.SubWithdrawalList.slice(
                        0,
                        isExpand ? SRdetailData.SubWithdrawalList.length : 5
                      ).map((item) => {
                        const statusConfig = withdrawStatus.find(
                          (statusItem) => statusItem.statusId === item.StatusId
                        );
                        return (
                          <tr>
                            <td>
                              <p className='amount'>
                                {item.SplitWithdrawalAmount} đ
                              </p>
                            </td>
                            <td>
                              {item.IsAllowUIComplete && !item.RebateAmount && (
                                <p className='label'>请点击 【确认到账】</p>
                              )}
                              {item.RebateAmount &&
                              (item.StatusId === 1 ||
                                item.StatusId === 2 ||
                                item.StatusId === 4 ||
                                item.StatusId === 5 ||
                                item.StatusId === 6 ||
                                item.StatusId === 7) ? (
                                <p className='label'>{`获得额外红利 ${item.RebateAmount} 元`}</p>
                              ) : (
                                ""
                              )}
                            </td>
                            <td style={{justifySelf:"end"}}>
                              {item.IsAllowUIComplete ? (
                                <button
                                  className='btn-confrim-withdraw'
                                  onClick={() => {
                                    this.props.SETConfirmWithdrawal(
                                      item,
                                      DetailItem.transactionId,
                                      ()=>{this.setState({isWithdrawUpdated: true})}
                                    );
                                  }}
                                >
                                  确认到账
                                </button>
                              ) : (
                                <p
                                  className='status'
                                  style={{ color: statusConfig.color }}
                                >
                                  {statusConfig.LocalizedName}
                                </p>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </table>

                    {isShowExpandBtn && (
                      <Button
                        style={{ color: "#00A6FF", background: "#FFFFFF" }}
                        size='large'
                        type='primary'
                        ghost
                        className='btn-expand'
                        onClick={() => {
                          this.setState((prev) => {
                            return { isExpand: !prev.isExpand };
                          });
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {isExpand ? (
                            <>
                              <span>隐藏部分</span>
                              <BsChevronUp size={16} />
                            </>
                          ) : (
                            <>
                              <span>显示全部</span>
                              <BsChevronDown size={16} />
                            </>
                          )}
                        </div>
                      </Button>
                    )}
                      <BackToTop style={{bottom:"40%", right: "-1%"}} targetWindow=".withdraw-detail-modal .modal-info-content" targetElement=".DetailItem" />
                  </div>
              ) : (
                ""
              )}
              <div className={classNames({
                button_box:true,
                reverse: (Type=== '0' && DetailItem.isContactCS && DetailItem.isAbleRequestRejectDeposit && !DetailItem.isUploadSlip && true) || (Type === '2' && DetailItem.status === "Pending" && !DetailItem.isUploadDocument),
                invisible: (Type==="2" && DetailItem.status === "Approved")
              })}>
                {(()=>{
                  //Type 0:Deposit 1:Transfer 2:Withdrawal
                  switch (Type) {
                    case "0":
                      switch (DetailItem.status){
                        case "Rejected":
                          return (
                            <>
                            {DetailItem.isContactCS && (
                              <Button
                                ghost={DetailItem.isSubmitNewTrans}
                                className={(!DetailItem.isSubmitNewTrans) ? "onwRowBtn" : "" }
                                onClick={PopUpLiveChat}
                              >
                                Liên Hệ Live Chat
                              </Button>
                            )}
                            {DetailItem.isSubmitNewTrans && (
                              <Button
                                className={(!DetailItem.isContactCS) ? "onwRowBtn" : "" }
                                onClick={()=>{Router.push("/deposit")}}
                              >
                                Thực Hiện Lại
                              </Button>
                            )}
                            </>
                          )
                        case "Timeout":
                          return (
                            <>
                            {DetailItem.isContactCS && (
                              <Button
                                ghost={DetailItem.resubmitFlag}
                                className={(!DetailItem.resubmitFlag) ? "onwRowBtn" : "" }
                                onClick={PopUpLiveChat}
                              >
                                Liên Hệ Live Chat
                              </Button>
                            )}
                              {
                                DetailItem.resubmitFlag && (
                                  <Button
                                  className={(!DetailItem.isContactCS) ? "onwRowBtn" : "" }
                                    onClick={() => {
                                      Pushgtagdata("Transaction", "Resubmit", "Transaction_C_Resubmit")
                                      Modal.info({
                                        closable:false,
                                        title: "Lưu Ý Quan Trọng",
                                        centered: true,
                                        okText: "Đã Hiểu, Tiếp Tục", //繼續
                                        cancelText: "Liên Hệ Live Chat",  //联系在线客服
                                        className: `commonModal resubmitDepositModal`,
                                        content: (
                                          <React.Fragment>
                                            <p>
                                              Để thực hiện lại giao dịch, vui lòng thao tác như sau:
                                            </p>
                                            <ol>
                                              <li >Nhấp "Đã Hiểu, Tiếp Tục”.</li>
                                              <li >Tiếp theo, nhấp nút “Thực Hiện”.</li>
                                              <li >
                                                Bạn không cần thực hiện chuyển khoản bất kỳ số tiền nào, vui lòng chờ trang giao dịch hiển thị và đóng trang.
                                              </li>
                                            </ol>
                                          </React.Fragment>
                                        ),
                                        onOk: () => {
                                          this.setState({
                                            // ShowDetail: false,
                                            ResubmitVisible: true,
                                          });
                                        },
                                        onCancel: () => {
                                          PopUpLiveChat();
                                        },
                                      });
            
                                      Pushgtagdata(
                                        `Deposit Nav`,
                                        "Click",
                                        `Resubmit_Deposit_TransactionRecord`
                                      );
                                    }}
                                  >
                                    Thực Hiện Lại
                                  </Button>
                                ) 
                              }
                            </>
                          )
                        case "Pending":
                        case "Processing":
                        case "VendorProcessing":
                        case "Vendor Processing":
                          return (
                            <>
                              {
                                DetailItem.isAbleRequestRejectDeposit && (
                                  <Button
                                    size="large"
                                    type="primary"
                                    className={(!DetailItem.isContactCS || DetailItem.isUploadSlip) ? "onwRowBtn" : "" }
                                    onClick={() => {
                                      this.ToDoCancel(Type, DetailItem);
                                    }}
                                  >
                                    Hủy Gửi Tiền
                                  </Button>
                              )}
                              {
                                DetailItem.isContactCS && (
                                  <Button
                                    ghost={DetailItem.isAbleRequestRejectDeposit || DetailItem.resubmitFlag || DetailItem.isUploadSlip}
                                    className={(!DetailItem.isAbleRequestRejectDeposit && !DetailItem.isUploadSlip && !DetailItem.resubmitFlag) ? "onwRowBtn" : "" }
                                    onClick={PopUpLiveChat}
                                  >
                                    Liên Hệ Live Chat
                                  </Button>
                                )
                              }
                              {
                                DetailItem.isUploadSlip && !this.state.uploaded && (
                                  <UploadFile
                                    type="1"
                                    PaymentMethod={DetailItem.paymentMethodId}
                                    RequestedBy={this.props.userInfo.memberInfo.memberCode}
                                    transactionId={DetailItem.transactionId}
                                    uploadedSlip={() => {this.setState({uploaded: true}) }}
                                    
                                  />
                                )
                              }
                              {
                                DetailItem.resubmitFlag && (
                                  <Button
                                    onClick={() => {
                                      Pushgtagdata("Transaction", "Resubmit", "Transaction_C_Resubmit")
                                      Modal.info({
                                        closable:false,
                                        title: "Lưu Ý Quan Trọng",
                                        centered: true,
                                        okText: "Đã Hiểu, Tiếp Tục", //繼續
                                        cancelText: "Liên Hệ Live Chat",  //联系在线客服
                                        className: `commonModal resubmitDepositModal`,
                                        content: (
                                          <React.Fragment>
                                            <p>
                                              Để thực hiện lại giao dịch, vui lòng thao tác như sau:
                                            </p>
                                            <ol>
                                              <li >Nhấp "Đã Hiểu, Tiếp Tục”.</li>
                                              <li >Tiếp theo, nhấp nút “Thực Hiện”.</li>
                                              <li >
                                                Bạn không cần thực hiện chuyển khoản bất kỳ số tiền nào, vui lòng chờ trang giao dịch hiển thị và đóng trang.
                                              </li>
                                            </ol>
                                          </React.Fragment>
                                        ),
                                        onOk: () => {
                                          this.setState({
                                            // ShowDetail: false,
                                            ResubmitVisible: true,
                                          });
                                        },
                                        onCancel: () => {
                                          PopUpLiveChat();
                                        },
                                      });
            
                                      Pushgtagdata(
                                        `Deposit Nav`,
                                        "Click",
                                        `Resubmit_Deposit_TransactionRecord`
                                      );
                                    }}
                                  >
                                    Thực Hiện Lại
                                  </Button>
                                ) 
                              }
                            </>
                          )
                        default:
                          return null;
                      }
                      break;
                    case "2":
                        switch (DetailItem.status){
                          case "Pending":
                            return (
                              <>
                                <Button
                                  className={(DetailItem.isContactCS && DetailItem.isUploadDocument) ? "onwRowBtn" : "" }
                                  onClick={() => {
                                    this.ToDoCancel(Type, DetailItem);
                                  }}
                                >
                                  Hủy Rút Tiền
                                </Button>
                                {
                                  DetailItem.isUploadSlip && ( 
                                    <UploadFile
                                      type="2"
                                      PaymentMethod={DetailItem.paymentMethodId}
                                      RequestedBy={this.props.userInfo.memberInfo.memberCode}
                                      transactionId={DetailItem.transactionId}
                                      uploadedSlip={() => { DetailItem.isUploadSlip = false}}
                                    />
                                  )
                                }
                                {
                                  DetailItem.isUploadDocument && ( 
                                    <Button
                                      ghost
                                      onClick={()=>{
                                        Router.push("/me/upload-files")
                                      }}
                                    >
                                      Đăng Tải Chứng Từ
                                    </Button>
                                  )
                                }
                                {
                                  DetailItem.isContactCS && (
                                    <Button
                                      ghost
                                      onClick={PopUpLiveChat}
                                    >
                                      Liên Hệ Live Chat
                                    </Button>
                                  )
                                }
                              </>
                            )
                          case "Processing":
                          case "Vendor Processing":
                          case "JarvisProcessing":
                          case "Escalated" :
                          case "Locked" :
                          case "Payout Agent":
                            return (
                             <> 
                             {DetailItem.isContactCS && (
                              <Button
                                onClick={PopUpLiveChat}
                              >
                                Liên Hệ Live Chat
                              </Button>
                             )}
                              </>
                            )
                          case "Rejected":
                          case "Cancelled":
                            return (
                              <>
                                {
                                  DetailItem.isContactCS && (
                                    <>
                                      <Button
                                        className={"onwRowBtn"}
                                        // ghost={DetailItem.paymentMethodId !== "CCW"}
                                        onClick={PopUpLiveChat}
                                      >
                                        Liên Hệ Live Chat
                                      </Button>
                                      {/* <Button
                                      onClick={()=>{Router.push("/withdrawal")}}
                                    >
                                      Rửi Tiền
                                    </Button> */}
                                    </>
                                  )
                                }
                              </>
                            )
                            break;
                        }
                    default:
                      break
                  }
                })()}
              </div>
            </Flexbox>
          </Flexbox>
          {/* 查看银行信息 */}
          {DrawerShow && (
            <DrawerBankinfo
              DrawerShow={DrawerShow}
              Type={Type}
              DetailItem={DetailItem}
              CloseDetail={() => {
                this.setState({ DrawerShow: false });
              }}
            />
          )}

          {/* 重新提交存款页面 */}
          <DetailResubmit
            ShowDetail={ResubmitVisible}
            DetailItem={DetailItem}
            Type={Type}
            CloseDetail={(v) => {
              this.setState({ResubmitVisible: false})
              v && this.props.getDepositData()
            }}
          />

        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userInfo: state.userInfo,
});

const mapDispatchToProps = {
  userInfo_getBalance: (forceUpdate = false) =>
    ACTION_UserInfo_getBalance(forceUpdate),
  userInfo_getDetails: () => ACTION_User_getDetails(),
};

export default connect(mapStateToProps, mapDispatchToProps)(PromoInfo);
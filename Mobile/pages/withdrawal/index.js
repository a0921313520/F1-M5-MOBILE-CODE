///// From Central Payment ↓
import "central-payment/dev/mob/Domain";
// // Product Start
import Withdrawal from "central-payment/Main/Mob/M23/Withdrawal";
// // Product End

// // Product Params Defined
import { setFEWalletParam, setFEWalletParams } from "central-payment/platform.pay.config"

import React, { useState, useEffect } from 'react';
import { fetchRequest } from '@/server/Request';
import HostConfig from '@/server/Host.config';
const { LocalHost, HostApi } = HostConfig.Config;
import ReactIMG from '@/components/View/ReactIMG';
import Modal from '@/components/View/Modal';
import { PopUpLiveChat } from "../../src/lib/js/util";
import Layout from '@/components/Layout';
import WalletInfo from "@/components/Withdrawal/Components/WalletInfo";
import Router from "next/router";
import Toast from '@/components/View/Toast';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';


export async function getStaticProps(context){
	return await getStaticPropsFromStrapiSEOSetting(`/withdrawal`); //參數帶本頁的路徑
}

const ToastHide = () => {
	var div = document.getElementsByClassName("sport-message-notice");
	if (div && div[0]) {
		div[0].remove();
	}
}

function WithdrawalPage(props){
  setFEWalletParams({
    device: 'MOB',
    platformType: 'F1',
    languageType: 'M3',
    domainName: LocalHost,
    ApiDomain: HostApi,
    successUrl: LocalHost,
    BackClick: () => { history.go(-1) },
    ApiGet: url => fetchRequest(HostApi + url, "GET", "", true),
    ApiPost: (url, postdata) => fetchRequest(HostApi + url, "POST", postdata, true),
    goDeposit: () => {Router.push("/deposit")},
    goVerifyContact: (type) => {
      switch(type){
        case "All":
        case "Email":
        Router.push(`/me/account-info/Email?from=WithdrawalPage&withdrawalVerifyType=${type}`);
        break;
        case "Phone":
          Router.push('/me/account-info/Phone?from=WithdrawalPage');
          break;
        default:
          break;
      }
    },
    goFinishKYCInfo: () => {
      Router.push('/me/upload-files');
    },
    goFinishMemberInfo: () => {alert("go to add member page.")},
    goAddBankInfo: (type, category) => { 
      switch(type) {
        case "usdt": 
          Router.push(`me/bank-account/?type=${category == 'USDT-TRC20' ? '2' : '1'}`);
          break;
          case "bank": 
          Router.push(`me/bank-account/AddBank`);
          break;
          default:
          break;
      }
    },
    openService: PopUpLiveChat,
    goRecord: () => {
      Router.push(`/transaction-record?page=withdraw`)
    },
    toastTip: {
		loading: (msg) => { Toast.loading(msg, 2) },
		success: (msg) => Toast.success(msg),
		error: (msg) => Toast.error(msg),
		hide: () => { ToastHide() },
    },
    modalTip: {
        info: (info) => {
          console.log(info, 'info')
          Modal.info(
            {
              ...info,
              wrapClassName:`withdrawModal ${info.wrapClassName || ''}`,
              className:"commonModal",
              closable:false,
              content:info.children,
              okText:info.okBtnTxt,
              onlyOKBtn:false,
              type:"confirm",
              onOk:info.okFunction,
              cancelText:info.noBtnTxt,
              onCancel:info.noFunction,
              imageType:"info",
              onCancel:info.noFunction,
            }
          );
        },
        confirm: (info) => {
          Modal.info(
            {
              ...info,
              wrapClassName:`withdrawModal ${info.wrapClassName || ''}`,
              className:"commonModal",
              closable:false,
              content:info.children,
              okText:info.okBtnTxt,
              onOk:info.okFunction,
              cancelText:info.noBtnTxt,
              onCancel:info.noFunction,
              onlyOKBtn:info.onlyOKBtn,
              type:info.type,
              maskClosable:info.maskClosable
            }
          );
        },
    },
    siteId: 38,
    webPiwikEvent:(eventCategory, action, name, value=false, customVariableArr = [])=>{Pushgtagdata(eventCategory, action, name, value, customVariableArr)},
    webPiwikUrl:(url,trackingTitle=false, isTrackPageView = true, isOnlyBaseUrl = false)=>{Pushgtagpiwikurl(url,trackingTitle, isTrackPageView, isOnlyBaseUrl)},
    appPiwikEvent: () => {},
    appPiwikUrl: () => {},
  });
  return (
    <Layout
      title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
      Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
      Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
      BarTitle="Rút Tiền"
      status={2}
      hasServer={true}
      barFixed={true}
      seoData={props.seoData}>
      <div className="withdrawalContainer">
        {/* <ReactIMG className="withdrawalBanner" src="/img/withdrawalBanner.jpeg" /> */}
        <WalletInfo/>
        <div className="withdrawalContent">
          <Withdrawal />
        </div>
      </div>
    </Layout>
  )
}

export default WithdrawalPage;
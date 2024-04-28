import React, { Component } from 'react';
import Layout from '@/components/Layout';
import Toast from '@/components/View/Toast';
import { setFEWalletParams, setFEWalletParam } from 'central-payment/platform.pay.config'
// import { setFEWalletParams, setFEWalletParam } from '../../Central-Payment/platform.pay.config'
import Deposit from '$Deposits/Mobile/deposit'
import { getE2BBValue, PopUpLiveChat } from '@/lib/js/util';
import RealNameVerify from '@/components/Verify/RealNameVerify';
import Router from 'next/router';
import Modal from '@/components/View/Modal';
import HostConfig from '@/server/Host.config';
import { fetchRequest } from '@/server/Request';
import SelfExclusionModal from '@/components/SelfExclusionModal/';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/deposit'); //參數帶本頁的路徑
}
const { LocalHost, HostApi, BFFSCApi } = HostConfig.Config;
// Ellietest01

//使用https://febff-api-staging-m2-instance01.fun88.biz
const paymentFebff = [
    '/api/Payment/DepositAccountByAmount',
]

export default class DepositPage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isRealNameVisible: false,
            loading: false,
        };
    }

    ToastHide = () => {
        var div = document.getElementsByClassName("sport-message-notice");
        if (div && div[0]) {
            div[0].remove();
        }
    }

    componentDidMount() {
        const { bonusId = '', promoTitle = '', bonusProduct = '', promoId = '' } = (localStorage.getItem("depositBonus") && JSON.parse(localStorage.getItem("depositBonus"))) || {}
        
        const privateParams = {
            device: 'MOB',
            platformType: 'F1',
            languageType: 'M3',
            ApiDomain: HostApi,
            domainName: LocalHost,
            successUrl: LocalHost,
            siteId: 40,
            bonusId: bonusId,
            bonusName: promoTitle,
            depositingWallet: bonusProduct,
            ActiveMethods: '',//指定存款,默认第一个
            firstName: 'zzz',
            BackClick: (v) => { this.nextSpte(v)},
            LivechatClick: PopUpLiveChat,
            goAddBankInfo: (callback, bankLength) => {
                Router.push(`/me/bank-account/AddBank?${bankLength === 0 ? '&bank=0' : ''}`);
            },
            goRecord: (type = 'Deposit') => { Router.push(`/transaction-record?page=${type}`) },//type = Deposit存款记录,Withdrawals提款记录
            ApiGet: (url) => {
                let apis = HostApi
                if(paymentFebff.includes(url.split('?')[0])) {
                    apis = BFFSCApi
                }
                return (fetchRequest(apis + url, "GET"))
            },
            ApiPost: (url, postdata = '') => {
                let apis = HostApi
                if(paymentFebff.includes(url.split('?')[0])) {
                    apis = BFFSCApi
                }
                return (fetchRequest(apis + url, "POST", postdata))
            },
            goVerifyContact: () => {},//OTP
            goFinishKYCInfo: () => {},//KYC
            goFinishMemberInfo: () => { this.rRealNameVisible() },//firstName
            toastTip: {
                loading: (msg) => { Toast.loading(msg, 2) },
                success: (msg) => Toast.success(msg),
                error: (msg) => Toast.error(msg),
                hide: () => { this.ToastHide() },
            },
            e2Backbox: getE2BBValue() || '',
            webPiwikEvent:(eventCategory, action, name, value=false, customVariableArr = [])=>{Pushgtagdata(eventCategory, action, name, value, customVariableArr)},
            webPiwikUrl:(url,trackingTitle=false, isTrackPageView = true, isOnlyBaseUrl = false)=>{Pushgtagpiwikurl(url,trackingTitle, isTrackPageView, isOnlyBaseUrl)},
            appPiwikEvent: () => {},
            appPiwikUrl: () => {},
        }
        setFEWalletParams(privateParams)
        this.setState({loading: true})
    }
    componentWillUnmount(){
        localStorage.removeItem("depositBonus")
    }

    nextSpte(v){
        console.log("🚀 ~ DepositPage ~ v:", v)
        if(v === "promotions"){
            Router.push("/promotions")
        }
        else if(v === "home"){
            Router.push("/")
        }
        else{
            history.go(-1)
        }
    }
    rRealNameVisible = () => {
        Modal.info(
            {
                wrapClassName:`withdrawModal realNameVisible`,
                className:"commonModal",
                title: 'Yêu Cầu Xác Thực',
                closable:false,
                content:`Để bảo mật tài khoản của bạn, vui lòng hoàn \ntất xác thực Họ Tên Thật để tiến hành gửi tiền`,
                cancelText:'Xác Thực Sau',
                okText:'Xác Thực Ngay',
                type:"confirm",
                onOk:() => {this.setState({isRealNameVisible: true})},
                onCancel:() => { history.go(-1) },
                imageType:"info",
            }
          )
    }

    render() {
        return (
            <Layout
                title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
                Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
                Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
                status={0}
                seoData={this.props.seoData}
            >
                <div>
                    {
                        this.state.loading && <Deposit />
                    }

                    {/* 真名驗證 */}
                    <RealNameVerify 
                        triggerFor={"deposit"}
                        visible={this.state.isRealNameVisible} 
                        onClose={()=>{ this.setState({isRealNameVisible: false})}}
                    />
                    <SelfExclusionModal
                        ModalType={1}
                        OpenModalUrl="Deposit"
                        afterCloseModal={() => {
                            Router.push('/');
                        }}
                    />
                </div>
            </Layout>
        );
    }
}

/*
 * @Author: Alan
 * @Date: 2022-02-07 11:24:10
 * @LastEditors: Alan
 * @LastEditTime: 2023-02-02 08:57:59
 * @Description: 充值
 * @FilePath: \Mobile\pages\Deposit\index.js
 */

import React, {Component} from 'react';
import Layout from '@/components/Layout';
import Deposit from '@/components/Deposit';
import Router from 'next/router';
import BannerBox from '@/components/Banner';
import {CmsBanner} from '@/api/home';
import {getUrlVars} from '@/lib/js/Helper';
import Announcement from '@/components/Announcement/';
import SelfExclusionModal from '@/components/SelfExclusionModal/';
import ReferModal from '@/components/Home/ReferModal';
//import '@/styles/deposit.scss';

const depositBanner = {
    action:{
        actionId: 0,
        actionName: 'No Action'
    },
    body: '',
    category: 'deposit',
    cmsImageUrl: '/img/depositBanner.jpg',
    title: 'deposit testing data -1'
}
export default class DepositPage extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            pageTitle: '',
            DepositVerify: false,
            isBackToHome: 0
        };
        this.staticBackEvent = () => {
            // history.go(-1);

            const urlVars = getUrlVars();

            if (urlVars && urlVars.goback) {
                Router.push(urlVars.goback);
                return;
            }
            Router.push('/');
        };
        this._backEvent = this.staticBackEvent;
    }

    componentDidMount() {
        // global.Pushgtagpiwikurl && global.Pushgtagpiwikurl("deposit");
        const urlVars = getUrlVars();
        if (urlVars && urlVars.from) {
            console.log('===deposit urlVars.from', urlVars.from);
            if (urlVars.from === 'sb20') {
                //從sb2.0來的 要返回去
                this.staticBackEvent = () => {
                    Router.push('/sbtwo');
                };
                this._backEvent = this.staticBackEvent;
            }
        }

        /**
         * @description: 如果未完成验证，则进入存款验证流程
         * @param {*}
         * @return {*}
         */

        let memberInfo = JSON.parse(localStorage.getItem('memberInfo'));
        let CheckAnnouncement = !localStorage.getItem('DepositPagelocalStorageAnnouncement');
        this.setState({
            DepositVerify: memberInfo && memberInfo.DepositBeforeVerify != 'DoneVerifyStep',
            CheckAnnouncement: CheckAnnouncement
        });
        // this.GetCmsBanne();
        // window.Pushgtagdata && Pushgtagdata(window.location.origin, 'Launch', `deposit`);
        if (memberInfo && memberInfo.DepositBeforeVerify != 'DoneVerifyStep') {
            Router.push('/DepositVerify');
        }
        console.log('testt 33333333')
    }

    /**
     * @description:  获取banner
     * @param {*}
     * @return {*}
     */
    // GetCmsBanne = () => {
    //     CmsBanner('deposit', (res) => {
    //         if (res.message) {
    //             return;
    //         }
    //         if (res) {
    //             this.setState({
    //                 Banner: res
    //             });
    //         }
    //     });
    // };

    callbackToHome = (home) => {
        console.log('callbackToHome by pages/index ======================> ', home);
        this.setState({
            isBackToHome: home
        })
    }

    render() {
        const {Banner, isBackToHome} = this.state;
        console.log('isBackToHome ========>', isBackToHome);
        return (
            <Layout
                title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
                Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
                Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
                status={2}
                hasServer={true}
                barFixed={true}
                BarTitle={this.state.pageTitle || '存款'}
                backEvent={() => {
                    if (isBackToHome === 3) {
                        window.location.reload()
                        return
                    }
                    this._backEvent();
                }}
            >
                {/* 寫死的Banner，不透過cms api */}
                {<BannerBox item={depositBanner} type="Deposit"/>}

                <div
                    onClick={() => {
                        if (this.state.DepositVerify) Router.push('/DepositVerify');
                    }}
                >
                    <Deposit
                        setBackEvent={(run) => {
                            this._backEvent = run || this.staticBackEvent;
                        }}
                        setBarTitle={(tit) => {
                            this.setState({pageTitle: tit});
                        }}
                        callbackToHome={this.callbackToHome}
                    />
                </div>
                {/* {this.state.DepositVerify && (
					<Modal
						className="Deposit__VerifyModal"
						visible={this.state.DepositVerify}
						closable={false}
						animation={false}
						mask={true}
					>
						<Flexbox flexFlow="column" justifyContent="center" alignItems="center">
							<ReactIMG src="/img/verify/warn.png" />
							<p className="content">您好，为了保障您账户资金的安全，请先完善个人资料，以便使用更多种存款方式。</p>
							<Flexbox className="footerBtn">
								<Button
									size="large"
									type="primary"
									className="whitebtn"
									onClick={() => {
										Router.push('/');
									}}
								>
									稍后验证
								</Button>
								<Button
									size="large"
									type="primary"
									onClick={() => {
										Router.push('/DepositVerify');
									}}
								>
									立即验证
								</Button>
							</Flexbox>
						</Flexbox>
					</Modal>
				)} */}
                {this.state.CheckAnnouncement && <Announcement optionType="Deposit"/>}
                <SelfExclusionModal
                    ModalType={1}
                    OpenModalUrl="Deposit"
                    afterCloseModal={() => {
                        Router.push('/');
                    }}
                />
                {/* 推荐好友弹窗 */}
                <ReferModal Page="Deposit"/>
            </Layout>
        );
    }
}

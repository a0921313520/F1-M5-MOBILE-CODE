/*
 * @Author: Alan
 * @Date: 2022-05-11 18:12:21
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-14 16:09:35
 * @Description: 404页面
 * @FilePath: \Mobile\pages\404.js
 */
import React, { Component } from 'react';
import Layout from "@/components/Layout";
import Button from "@/components/View/Button";
import { ReactSVG } from "@/components/View/ReactSVG";
import ReactIMG from '@/components/View/ReactIMG';
import { PopUpLiveChat, Refresh } from '@/lib/js/util';
export default class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <Layout
              title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
              Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
              Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
              status={0}
              hasServer={true}
              barFixed={true}
            >
                <div className="main-maintain" key="RestrictAccess">
                    <div className="page404__header header-wrapper">
                        <ReactSVG className="logo" src="/img/headerLogo.svg" />
                    </div>
                    <div className="page404__main">
                        <ReactIMG
                            className="page404__main__errImg"
                            src="/img/404.png"
                        />
                        <div
                            className="page404__main__desc"
                        >
                            Không thể được tìm thấy trang của bạn tại thời điểm này. Nếu bạn vẫn không thể mở trang, vui lòng liên hệ với bộ phận chăm sóc khách hàng.
                        </div>
                        {/* <Button
                            className="main__refresh"
                            onClick={Refresh}
                        >
                            Làm Mới Ứng Dụng
                        </Button> */}
                        <Button
                            // className="page404__main__csBtn"
                            className="main__refresh"
                            onClick={PopUpLiveChat}
                        >
                            Liên Hệ Live Chat
                        </Button>
                        <a className="page404__main__contact" href="mailto: cs.viet@fun88.com">
                            Email: cs.viet@fun88.com
                        </a>
                        <a
                            className="page404__main__contact"
                            href="tel:+84400842891"
                        >
                            Điện Thoại: +84 400 842 891
                        </a>
                        {/* <a
                            style={{ marginBottom: "16px" }}
                            className="page404__main__contact"
                            href="tel:+86 400 842 891"
                        >
                            热线电话: +86 400 842 891
                        </a> */}
                    </div>
                </div>
            </Layout>
        );
    }
}

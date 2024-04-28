import React, { Component, Fragment } from "react";
import { ReactSVG } from "@/components/View/ReactSVG";
import Service from "@/components/Header/Service";
import ReactIMG from '@/components/View/ReactIMG';

const loginOTP_text = () => {
    return (
        <Fragment>
            Thân gửi thành viên,            
            <div className="noticeSpace" />
            Fun88 luôn hướng tới tiêu chuẩn dịch vụ chất lượng tốt nhất. Nhằm tạo ra sân chơi uy tín và an toàn, Fun88 không ngừng nâng cao hệ thống bảo mật thông tin cho thành viên. Vì vậy, Fun88 khuyến khích thành viên xác thực email và số điện thoại để tăng cường tính năng bảo mật tài khoản. Fun88 sẽ gửi Mã Xác Nhận qua Email hoặc tin nhắn SMS sau khi thành viên đăng nhập.
            <div className="noticeSpace" />
            Trường hợp thành viên gặp vấn đề với Mã Xác Nhận, vui lòng liên hệ Hỗ Trợ Trực Tuyến.
            <div className="noticeSpace" />
            Fun88 luôn ngày càng hoàn thiện để mang đến trải nghiệm chơi mượt mà và an toàn. Trân trọng cảm ơn sự hợp tác và đồng hành của các thành viên trong suốt thời gian qua. 
            <div className="noticeSpace" />
            FUN88
        </Fragment>
    );
};

const resetPwd_text = () => {
    return (
        <Fragment>
            Thân gửi thành viên,            
            <div className="noticeSpace" />
            Fun88 luôn hướng tới tiêu chuẩn dịch vụ chất lượng tốt nhất. Nhằm tạo ra sân chơi uy tín và an toàn, Fun88 không ngừng nâng cao hệ thống bảo mật thông tin cho thành viên. Vì vậy, Fun88 khuyến khích thành viên xác thực email và số điện thoại để tăng cường tính năng bảo mật tài khoản. Fun88 sẽ gửi Mã Xác Nhận qua Email hoặc tin nhắn SMS sau khi thành viên đăng nhập.
            <div className="noticeSpace" />
            Trường hợp thành viên gặp vấn đề với Mã Xác Nhận, vui lòng liên hệ Hỗ Trợ Trực Tuyến.
            <div className="noticeSpace" />
            Fun88 luôn ngày càng hoàn thiện để mang đến trải nghiệm chơi mượt mà và an toàn. Trân trọng cảm ơn sự hợp tác và đồng hành của các thành viên trong suốt thời gian qua. 
            <div className="noticeSpace" />
            FUN88
        </Fragment>
    );
};

export default function SecurityNotice(props) {
    const { type, onCancel } = props;
    //console.log(props)
    return (
        <Fragment>
            <div className="header-wrapper header-bar">
                <ReactSVG
                    className="back-icon"
                    src="/img/svg/LeftArrow.svg"
                    onClick={onCancel}
                />
                <span>
                    {type === "loginOTP" ? "Xác Thực Tài Khoản" : "Xác Thực Tài Khoản"}
                </span>
                <div className="header-tools-wrapper">
                    <Service />
                </div>
            </div>
            <ReactIMG className="securityNotice__banner" src="/img/verify/NoPath.png" />
            <div className="securityNotice__main">
                {type === "loginOTP" ? loginOTP_text() : resetPwd_text()}
                <div className="login__button">
                    <button className="login__btn__submit" onClick={onCancel}>
                        Xác Thực Ngay
                    </button>
                </div>
            </div>
        </Fragment>
    );
}

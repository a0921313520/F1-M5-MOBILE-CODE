/*
 * @Author: Alan
 * @Date: 2022-03-07 11:49:02
 * @LastEditors: Alan
 * @LastEditTime: 2022-04-07 01:47:05
 * @Description: 访问受限
 * @FilePath: \Mobile\src\components\RestrictAccess\index.js
 */
import { ReactSVG } from "@/components/View/ReactSVG";
import { ApiPort } from "@/api/index";
import { fetchRequest } from "@/server/Request";
import Button from "@/components/View/Button";
import Toast from "@/components/View/Toast";
import ReactIMG from '@/components/View/ReactIMG';

/* 在线客服 */
const GETLiveChat = () => {
    const serverUrl = localStorage.getItem("serverUrl");
    if (!serverUrl) {
        fetchRequest(ApiPort.GETLiveChat, "GET").then((res) => {
            if (res.isSuccess) {
                showCS(res.result);
                localStorage.setItem("serverUrl", res.result);
            } else {
                Toast.error("哎呀！出现错误请稍后重试！");
            }
        });
    } else {
        showCS(serverUrl);
    }
};

const showCS = (serverUrl) => {
    const FUN88Live = window.open(
        "about:blank",
        "chat",
        "toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes"
    );
    FUN88Live.document.title = "FUN88在线客服";
    FUN88Live.location.href = serverUrl;
    FUN88Live.focus();
};


const RestrictAccess = () => [
    <div className="main-maintain" key="RestrictAccess">
        <div className="page404__header header-wrapper">
            <ReactSVG className="logo" src="/img/svg/Fun88Logo.svg" />
        </div>
        <div className="restrict-body">
            <ReactIMG className="restrict-img" src="/img/restrict.png" />
            <div className="maintain-heading">访问受限</div>
            <div className="maintain-desc">
                抱歉！您所在的地区受到限制,
                <br /> 无法正常游览我们的网站哦。若有不便之处, 请多多原谅。
                <br /> 若您有任何疑问, 请联系我们的在线客服或发邮件
            </div>
            <Button className="maintain-cs" onClick={GETLiveChat}>
                线上客服
            </Button>
            <a className="maintain-contact" href="mailto: cs@fun88.com">
                电邮: cs@fun88.com
            </a>
        </div>
    </div>,
];

export default RestrictAccess;

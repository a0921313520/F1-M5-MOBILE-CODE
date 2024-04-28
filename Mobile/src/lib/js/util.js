import { CLEAR_COOKIE_KEY } from "./constantsData";
import { Decimal } from "decimal.js";
import HostConfig from "@/server/Host.config";
// import { IconFontClassNames, IconFontNumberNames } from './iconfont';
import Router from "next/router";
import { fetchRequest } from "@/server/Request";
import { ApiPort } from "@/api/index";
import Toast from "@/components/View/Toast";
import {
    ACTION_UserInfo_getBalance,
    ACTION_UserInfo_login,
    ACTION_User_getDetails,
} from "@/lib/redux/actions/UserInfoAction";
import { nameReg } from "../SportReg";

import { connect } from "react-redux";
class Util {
    constructor() {}
    hasClass(elem, cls) {
        cls = cls || "";
        if (cls.replace(/\s/g, "").length == 0) return false;
        return new RegExp(" " + cls + " ").test(" " + elem.className + " ");
    }
    addClass(elem, cls) {
        if (!this.hasClass(elem, cls)) {
            ele.className =
                ele.className == "" ? cls : ele.className + " " + cls;
        }
    }
    removeClass(elem, cls) {
        if (this.hasClass(elem, cls)) {
            let newClass = " " + elem.className.replace(/[\t\r\n]/g, "") + " ";
            while (newClass.indexOf(" " + cls + " ") >= 0) {
                newClass = newClass.replace(" " + cls + " ", " ");
            }
            elem.className = newClass.replace(/^\s+|\s+$/g, "");
        }
    }
    parentsUtil(elem, cls) {
        if (elem) {
            while (elem && !this.hasClass(elem, cls)) {
                elem = elem.parentNode;
            }
            return elem;
        } else {
            return null;
        }
    }
}

export function formatAmount(num) {
    if (!num) {
        return 0;
    }
    let numCount = num.toString().split(".");
    const numCountVal =
        (numCount[0] + "").replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,") +
        (numCount[1] ? "." + numCount[1].toString().substr(0, 2) : "");
    return typeof num === "number" && isNaN(num) ? 0 : numCountVal;
}

export function Cookie(name, value, options) {
    // 如果第二个参数存在
    if (typeof value !== "undefined") {
        options = options || {};
        if (value === null) {
            // 设置失效时间
            options.expires = -1;
        }
        var expires = "";
        // 如果存在事件参数项，并且类型为 number，或者具体的时间，那么分别设置事件
        if (
            options.expires &&
            (typeof options.expires == "number" || options.expires.toUTCString)
        ) {
            var date;
            if (typeof options.expires == "number") {
                date = new Date();
                date.setTime(date.getTime() + options.expires * 60 * 1000);
            } else {
                date = options.expires;
            }
            expires = "; expires=" + date.toUTCString();
        }
        // var path = options.path ? '; path=' + options.path : '', // 设置路径
        var domain = options.domain ? "; domain=" + options.domain : "", // 设置域
            secure = options.secure ? "; secure" : ""; // 设置安全措施，为 true 则直接设置，否则为空

        // 如果第一个参数不存在则清空所有Cookie
        if (name === null) {
            const keys = document.cookie.match(/[^ =;]+(?=\=)/g);
            if (keys) {
                for (let i = keys.length; i--; ) {
                    if (~CLEAR_COOKIE_KEY.indexOf(keys[i])) {
                        document.cookie = [
                            keys[i],
                            "=",
                            encodeURIComponent(value),
                            expires,
                            "; path=/",
                            domain,
                            secure,
                        ].join("");
                    }
                }
            }
        } else {
            // 把所有字符串信息都存入数组，然后调用 join() 方法转换为字符串，并写入 Cookie 信息
            document.cookie = [
                name,
                "=",
                encodeURIComponent(value),
                expires,
                "; path=/",
                domain,
                secure,
            ].join("");
        }
    } else {
        // 如果第二个参数不存在
        var CookieValue = null;
        if (document.cookie && document.cookie != "") {
            var Cookie = document.cookie.split(";");
            for (var i = 0; i < Cookie.length; i++) {
                var CookieIn = (Cookie[i] || "").replace(/^\s*|\s*$/g, "");

                if (CookieIn.substring(0, name.length + 1) == name + "=") {
                    CookieValue = decodeURIComponent(
                        CookieIn.substring(name.length + 1)
                    );
                    break;
                }
            }
        }
        return CookieValue;
    }
}

export function formatSeconds(value) {
    function checkZero(str) {
        str = str.toString();
        return str.length === 1 ? "0" + str : str;
    }

    var seconds = parseInt(value); // 秒
    var minute = 0; // 分
    var hour = 0; // 小时

    if (seconds > 60) {
        minute = parseInt(seconds / 60);
        seconds = parseInt(seconds % 60);
        if (minute > 60) {
            hour = parseInt(minute / 60);
            minute = parseInt(minute % 60);
        }
    }
    var result = "" + checkZero(parseInt(seconds));
    if (minute > 0) {
        result = "" + checkZero(parseInt(minute)) + ":" + result;
    } else {
        result = "00:" + result;
    }
    if (hour > 0) {
        result = "" + checkZero(parseInt(hour)) + ":" + result;
    }
    return result;
}

// 获取本地格式化时间
export function dateFormat() {
    let date = new Date(Date.now() + 8 * 3600000);
    let str = date.toISOString().replace("T", " ");
    return str.substr(0, str.lastIndexOf("."));
}

// 浮点数计算
export function mul(a, b) {
    var c = 0,
        d = a.toString(),
        e = b.toString();
    try {
        c += d.split(".")[1].length;
    } catch (f) {}
    try {
        c += e.split(".")[1].length;
    } catch (f) {}
    return (
        (Number(d.replace(".", "")) * Number(e.replace(".", ""))) /
        Math.pow(10, c)
    );
}

export function add(a, b) {
    var c, d, e;
    try {
        c = a.toString().split(".")[1].length;
    } catch (f) {
        c = 0;
    }
    try {
        d = b.toString().split(".")[1].length;
    } catch (f) {
        d = 0;
    }
    return (e = Math.pow(10, Math.max(c, d))), (mul(a, e) + mul(b, e)) / e;
}
export function sub(a, b) {
    var c, d, e;
    try {
        c = a.toString().split(".")[1].length;
    } catch (f) {
        c = 0;
    }
    try {
        d = b.toString().split(".")[1].length;
    } catch (f) {
        d = 0;
    }
    return (e = Math.pow(10, Math.max(c, d))), (mul(a, e) - mul(b, e)) / e;
}

/**
 * 无缝滚动
 * @param {string/boolean} target 祖先React节点  [boolean] 是否清除定时器
 * @param {number} [sp=18] 速度
 * @param {string top/right} 移动方位
 * @return 返回 定时器状态
 */
var timer = null,
    onlyTimer = null;
export function marqueeAnimate(target, direction, sp, call) {
    // 如果定时器已存在，则退出函数
    // if (timer !== null || onlyTimer !== null) {
    //     return false
    // }
    // 清除定时器
    if (typeof target === "boolean" && target === true) {
        clearInterval(timer);
        clearTimeout(onlyTimer);
        return false;
    }
    var $container = target.childNodes[0],
        container = $container.childNodes[0],
        $marqueeItem =
            container.tagName === "UL"
                ? container.childNodes
                : $container.childNodes,
        last = $marqueeItem[$marqueeItem.length - 1],
        speed = sp || 18,
        dir = direction || "top";

    var rolling;
    if (dir == "top") {
        $container.appendChild(container.cloneNode(true));
        const len = $marqueeItem.length - 1;
        let index = 0;
        let height = last.offsetTop + last.offsetHeight;

        rolling = function () {
            if (index === len) {
                index = 0;
            }
            if (target.scrollTop == height) {
                target.scrollTop = 0;
            } else {
                target.scrollTop++;
            }
            if (target.scrollTop % last.offsetHeight === 0) {
                clearInterval(timer);
                onlyTimer = setTimeout(() => {
                    timer = setInterval(rolling, speed);
                    call(index++);
                }, 1000);
            }
        };
    } else if (dir == "right") {
        $container.appendChild(container.cloneNode(true));
        // 此处减去左边的图标显示所占的偏移值
        var width =
            last.offsetLeft + last.offsetWidth - $marqueeItem[0].offsetLeft;
        rolling = function () {
            if (target.scrollLeft == width) {
                target.scrollLeft = 0;
            } else {
                target.scrollLeft++;
            }
        };
    }

    timer = setInterval(rolling, speed); // 设置定时器
    container.addEventListener("mouseenter", function () {
        clearInterval(timer);
        clearTimeout(onlyTimer);
    });
    container.addEventListener("mouseleave", function () {
        onlyTimer = setTimeout(() => {
            // 鼠标移开时重设定时器
            timer = setInterval(rolling, speed);
        }, 1000);
    });

    return false;
}

export function resetRemSize(fixedWidth) {
    const width =
            document.documentElement.offsetWidth || document.body.offsetWidth,
        height =
            document.documentElement.offsetHeight || document.body.offsetHeight;

    if (width < height && !global.documentWidth) {
        (global.documentWidth = width), (global.documentHeight = height);
        resetRemSize(width);
    }

    let htmlWidth =
        fixedWidth ||
        (global.documentWidth
            ? Math.min(680, global.documentWidth, global.documentHeight)
            : Math.min(680, Math.min(width, height)));
    let htmlDom = document.getElementsByTagName("html")[0];
    htmlDom.style.fontSize = htmlWidth / 10 + "px";
}

export function _extends() {
    _extends =
        Object.assign ||
        function (target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        };
    return _extends.apply(this, arguments);
}

//獲取帶membercode的localstorage配置名稱 格式 {key}-{membercode}
export function getMemberStorageKey(key) {
    let memberCode = null;
    if (checkIsLogin()) {
        memberCode = localStorage.getItem("memberCode");
        if (memberCode) {
            memberCode = JSON.parse(memberCode); //處理一下，把雙引號去掉
        }
    }
    //  格式 {key}-{membercode}
    return key + (memberCode ? "-" + memberCode : "");
}

//逗號分隔，支持小數點
export function numberWithCommas(x, precision = 2) {
    if (!x) {
        return 0;
    }

    var parts = new Decimal(x).toFixed(precision).toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");

    //不能用這個 ios會報錯
    //return x ? new Decimal(x).toFixed(precision).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0;
}

//超過限制長度變成...
export function cutTail(x, maxlength = 10) {
    return x ? (x.length > maxlength ? x.substr(0, maxlength) + "..." : x) : x;
}

// const getRandomClassName = (num) => {
// 	const intNum = parseInt(num);

// 	const randomClassIndex = Math.floor(Math.random() * 10);
// 	const randomNameIndex = Math.floor(Math.random() * 10);

// 	return IconFontClassNames[intNum][randomClassIndex] + '-' + IconFontNumberNames[intNum][randomNameIndex];
// };

/* 数字替换成SVG */
// export function ChangeSvg(num) {
// 	if (num && num != null && num.length != 0) {
// 		var strnumber = num.toString(),
// 			str = '';
// 		for (var i = 0; i < strnumber.length; i++) {
// 			let number = strnumber.charAt(i) || -1;
// 			if ([ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ].indexOf(number) !== -1) {
// 				const thisClassName = getRandomClassName(number);
// 				str += '<span class="' + thisClassName + '"></span>';
// 			} else {
// 				if (number === '.') {
// 					str += '<span class="icon-spot">.</span>';
// 				} else if (number === '-') {
// 					str += '<span class="icon-minus">-</span>';
// 				} else {
// 					str += '<span class="icon-undefined">' + number + '</span>';
// 				}
// 			}
// 		}

// 		//除錯用
// 		if (!HostConfig.Config.isLIVE) {
// 			str += '<span style="display: none;">' + num + '</span>';
// 		}

// 		return str;
// 	}
// 	return '';
// }

//比較兩個object，指定要比較的prop
export function dataIsEqual(
    left,
    right,
    selectedProps = [],
    log = false,
    name = ""
) {
    let isEqual = true;

    if (left === right) {
        return true;
    }

    if (
        typeof left !== "object" ||
        left === null ||
        typeof right !== "object" ||
        right === null
    ) {
        if (log) {
            if (typeof left !== "object" || left === null) {
                console.log("===", name, "=== is not equal by left", left);
            }
            if (typeof right !== "object" || right === null) {
                console.log("===", name, "=== is not equal by right", right);
            }
        }

        return false;
    }

    for (let prop of selectedProps) {
        const r = left[prop] === right[prop];
        if (!r) {
            if (log) {
                console.log(
                    "===",
                    name,
                    "=>",
                    prop,
                    "=== is not equal",
                    left[prop],
                    " vs ",
                    right[prop]
                );
            }
            isEqual = false;
            break;
        }
    }
    return isEqual;
}

//清理登入信息
export function clearStorageForLogout() {
    let name = JSON.parse(localStorage.getItem("username"));
    localStorage.removeItem(`${name}_displayReferee`);
    localStorage.removeItem("memberToken");
    localStorage.removeItem("memberInfo");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("LocalMemberInfo");
    localStorage.removeItem("PreferWallet");
    localStorage.removeItem("username");
    localStorage.removeItem("memberCode");
    localStorage.removeItem("loginStatus");
    localStorage.removeItem("IM_Token");
    localStorage.removeItem("IM_MemberCode");
    localStorage.removeItem("IM_MemberType");
    localStorage.removeItem("IM_Token_ExpireTime");
    localStorage.removeItem("BTI_Token");
    localStorage.removeItem("BTI_MemberCode");
    localStorage.removeItem("BTI_JWT");
    localStorage.removeItem("BTI_Token_ExpireTime");
    localStorage.removeItem("SABA_Token");
    localStorage.removeItem("SABA_MemberCode");
    localStorage.removeItem("SABA_JWT");
    localStorage.removeItem("SABA_Token_ExpireTime");
    localStorage.removeItem("LoginOTP");
    localStorage.removeItem("Revalidate");
    localStorage.removeItem("domains");
    localStorage.removeItem("userIP");
    localStorage.removeItem("firstLoginToken");
    localStorage.removeItem("useTokeLogin");
    sessionStorage.clear();

    userInfo_logout(); //redux登出
}

//是否已登入判斷
export function checkIsLogin() {
    return localStorage.getItem("loginStatus") == 1;
}

//設置為已登入
export function setIsLogin() {
    localStorage.setItem("loginStatus", "1");
}

//登入跳轉判斷
export function redirectToLogin(urlParams = null, replace = false) {
    if (urlParams === null || urlParams.length <= 0) {
        urlParams = "";
    }

    if (replace) {
        //用replace避免 到登入頁後 點擊返回 又因為沒登入 被踢回去登入頁 造成循環卡住的問題
        Router.replace("/register_login" + urlParams);
    } else {
        Router.push("/register_login" + urlParams);
    }
}

//登出(清理登入信息)
export function setIsLogout() {
    clearStorageForLogout();
    window.RefreshTokensetInterval &&
        clearInterval(window.RefreshTokensetInterval);
}

//跳轉存款頁
export function redirectToDeposit(params = "", direct2deposit = false) {
    //自我限制檢查
    if (global.hasSelfExclusion && global.hasSelfExclusion(1)) {
        return;
    }

    if (direct2deposit) {
        Router.push(
            "/Deposit" + (params && params.length > 0 ? "?" + params : "")
        );
    } else {
        Router.push(
            "/DepositVerify" + (params && params.length > 0 ? "?" + params : "")
        );
    }

    //如果和主站共用存款頁，才改用下面的代碼
    //window.location.href = '/Deposit?from=sb20' + ((params && params.length > 0) ? '&' + params : ''); //主站的存款頁，記得帶參數讓存款完成後 跳回來
}

//獲取blackbox(device id)數據 舊版 已廢棄
export function getIovationBBValue() {
    return window.ioGetBlackbox
        ? window.ioGetBlackbox().blackbox == "" ||
          window.ioGetBlackbox().blackbox == undefined
            ? ""
            : window.ioGetBlackbox().blackbox
        : "";
}

//獲取blackbox(device id)數據 新版
export function getE2BBValue() {
    return window.E2GetBlackbox
        ? window.E2GetBlackbox().blackbox == "" ||
          window.E2GetBlackbox().blackbox == undefined
            ? ""
            : window.E2GetBlackbox().blackbox
        : "";
}

/**
 * @description:指定数组元素相加
 * @param undefined
 * @return {*}
 */
export function SumValue(arr, key) {
    if (Array.isArray(arr)) {
        let arrSum = 0;
        arr.forEach((item, index) => {
            arrSum += item[key];
        });
        return arrSum;
    }
    return 0;
}

/**
 * @description: 客服
 * @param {*}
 * @return {*}
 */
export function PopUpLiveChat() {
    FUN88Live && FUN88Live.close();
    let FUN88Live = window.open(
        "about:blank",
        "chat",
        "toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=540, height=650"
    );
    const openServer = (serverUrl) => {
        FUN88Live.document.title = "FUN88在线客服";
        FUN88Live.location.href = serverUrl;
        FUN88Live.focus();
    };

    let url = localStorage.getItem("serverUrl");
    if (url) {
        openServer(url);
    }
    fetchRequest(ApiPort.GETLiveChat).then((res) => {
        if (res.isSuccess) {
            localStorage.setItem("serverUrl", res.result);
            !url && openServer(res.result);
        }
    });
}

export function Refresh() {
    Router.push('/');
} 

const pad = (n) => ("0" + n).slice(-2);

export const millisecondsToTimer = (ms) => {
    if (ms < 0) {
        return "0:00";
    }
    const minutes = Math.floor(ms / 60000);
    const seconds = pad(Math.floor((ms - minutes * 60000) / 1000));
    return `${minutes < 10 ? "0" + minutes : minutes}:${seconds}`;
};

export const NumberReplace = (value) => {
    if (value && value.length > 8) {
        let reg = /^(\d{0})(\d*)(\d{6})$/;
        let str = value.replace(reg, (a, b, c, d) => {
            return b + c.replace(/\d/g, "*") + d;
        });
        return str;
    } else {
        return value;
    }
};

/**
 * @description: 回顶部
 * @param {*} value
 * @return {*}
 */
export const ToScrollTop = (value) => {
    const h = window,
        e = document.body,
        a = document.documentElement;
    let offsetY =
        Math.max(0, h.pageYOffset || a.scrollTop || e.scrollTop || 0) -
        (a.clientTop || 0);
    let scrollTimer = setInterval(() => {
        if (offsetY <= 0) {
            clearInterval(scrollTimer);
        }
        a.scrollTop = offsetY -= 20;
    }, 6);
};

/***
 * 用戶存款狀態檢查函數
 *
 * 返回 { code: 下面的結果碼, flags: api返回的result數據 }
 * NO_OTP_TIMES: 	未通過手機驗證，沒剩餘OTP次數 		=> 	展示超過驗證次數頁
 * HAS_OTP_TIMES: 未通過手機驗證，還有OTP剩餘次數 	=>	進入手機驗證頁面
 * IS_IWMM: 			已通過手機驗證，還沒驗證銀行卡		=>	只展示部分存款方式，和提示按鈕
 * NOT_IWMM: 			已通過手機驗證，已驗證銀行卡			=>  展示全部可用存款方式
 *
 * 錯誤(需要用catch抓)
 * DATA_ERROR0: 	CustomFlag API有通 但返回數據不對
 * NET_ERROR0: 		CustomFlag API請求報錯
 */
export function getDepositVerifyInfo() {
    return new Promise((resolve, reject) => {
        fetchRequest(
            ApiPort.MemberFlagsStatus + "flagKey=BankCardVerification&",
            "GET"
        )
            .then((data) => {
                if (data.isSuccess) {
                    //手机验证
                    if (data.result.isDepositVerificationOTP) {
                        //检查验证剩余次数
                        let channelType = "SMS";
                        let serviceAction = "DepositVerification";

                        fetchRequest(
                            ApiPort.VerificationAttempt +
                                `channelType=${channelType}&serviceAction=${serviceAction}&`,
                            "GET"
                        )
                            .then((data) => {
                                if (data) {
                                    if (data.remainingAttempt <= 0) {
                                        //沒剩餘次數，直接展示超過驗證次數頁
                                        resolve({
                                            code: "NO_OTP_TIMES",
                                            flags: data.result,
                                        });
                                    } else {
                                        //還有剩餘次數，進入手機驗證頁面
                                        resolve({
                                            code: "HAS_OTP_TIMES",
                                            flags: data.result,
                                        });
                                    }
                                } else {
                                    //reject('DATA_ERROR1'); 增加可用性：無數據或失敗 也當作有OTP次數，反正最後提交OTP API應該也不會過
                                    resolve({
                                        code: "HAS_OTP_TIMES",
                                        flags: data.result,
                                    });
                                }
                            })
                            .catch((err) => {
                                //reject('NET_ERROR1'); 增加可用性：無數據或失敗 也當作有OTP次數，反正最後提交OTP API應該也不會過
                                resolve({
                                    code: "HAS_OTP_TIMES",
                                    flags: data.result,
                                });
                            });
                    } else {
                        //已通過手機驗證
                        if (data.result.isIWMM) {
                            resolve({ code: "IS_IWMM", flags: data.result });
                        } else {
                            resolve({ code: "NOT_IWMM", flags: data.result });
                        }
                    }
                } else {
                    reject("DATA_ERROR0");
                }
            })
            .catch((err) => {
                reject("NET_ERROR0");
            });
    });
}

//自動重試 call異步函數
export async function retryCall(targetAsyncFunc, configs) {
    let defaultConfigs = {
        testResultFunc: null, //檢查異步函數執行結果, 返回true/false
        retryTimes: 3, //重試次數
        retryInterval: 1000, //重試間隔
        failResult: undefined, //重試全部失敗，返回何種結果，未配置則默認返回最後一次call異步函數的結果
    };

    let thisConfigs = Object.assign(defaultConfigs, configs);

    if (!targetAsyncFunc) {
        return thisConfigs.failResult !== undefined
            ? thisConfigs.failResult
            : null;
    }

    let result = undefined;
    while (thisConfigs.retryTimes > 0) {
        result = await targetAsyncFunc();
        if (thisConfigs.testResultFunc) {
            if (thisConfigs.testResultFunc(result)) {
                return result;
            }
        } else if (result !== undefined) {
            return result;
        }
        thisConfigs.retryTimes = thisConfigs.retryTimes - 1;
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, thisConfigs.retryInterval);
        });
    }

    if (thisConfigs.failResult !== undefined) {
        return thisConfigs.failResult;
    } else {
        return result;
    }
}

export const postLogin = (name, pwd) => {
    let postData = {
        hostName: window.location.origin,
        grantType: "password",
        clientId: "Fun88.CN.App",
        clientSecret: "FUNmuittenCN",
        scope: "Mobile.Service offline_access",
        appId: "net.funpodium.fun88",
        siteId: 38,
        username: name,
        password: pwd,
        e2: getE2BBValue(),
    };
    Toast.loading("Đang đăng nhập...");
    fetchRequest(ApiPort.Login, "POST", postData)
        .then(async (data) => {
            if (data.isSuccess) {
                Toast.destroy();
                //存储设置已登录的标记
                setIsLogin();
                ApiPort.Token =
                    data.result.tokenType + " " + data.result.accessToken;
                localStorage.setItem(
                    "memberToken",
                    JSON.stringify(
                        data.result.tokenType + " " + data.result.accessToken
                    )
                );
                localStorage.setItem(
                    "refreshToken",
                    JSON.stringify(data.result.refreshToken)
                );
                console.log("------------------------->", this);
                ACTION_UserInfo_login(name);
                ACTION_UserInfo_getBalance();
                ACTION_User_getDetails();
                Router.push("/");
            }
        })
        .catch((error) => {
            Toast.destroy();

            console.log("登录失败:", error);
        });
};

export function maskFunction(type, value) {
    const strValue = String(value);
    let maskedValue;

    function getStar(number) {
        const statString = Array.from(
            { length: number },
            (cur) => (cur = "*")
        ).join("");
        return statString;
    }

    if (!value) {
        return "";
    }

    switch (type) {
        case "RealName":
            maskedValue = getStar(strValue.length);
            break;
        case "FullName":
            const indexArray = [];
            const letterGroup = [];
            const maskedGroup = [];
            // 找出NSM letter之index
            if(nameReg.test(strValue)){
                [...strValue].forEach((letter,i)=>{
                    if(nameReg.test(letter)){
                        indexArray.push(i)
                    }
                })

                // 依據NSM letter位置將字母分組
                let n = 0
                while (n<strValue.length) {
                    if(indexArray.includes(n+1)){
                        letterGroup.push(strValue.slice(n,n+2))
                    }
                    if(indexArray.includes(n)){
                        n++;
                        continue;
                    }
                    if(!indexArray.includes(n+1)){
                        if(strValue[n]==="่"){
                            letterGroup[letterGroup.length-1]= [...letterGroup[letterGroup.length-1], strValue[n]].join("")
                        }else{
                            letterGroup.push(strValue[n])
                        }
                    }
                    n++;
                }
                // 將分組後的泰文上碼
                letterGroup.forEach((w,i)=>{
                    if(i===0||letterGroup[i-1]===" "){
                        maskedGroup.push(w)
                    }else{
                        if(letterGroup[i]===" "){
                            maskedGroup.push(" ")
                        }else{
                            maskedGroup.push("*")
                        }
                    }
                })

                maskedValue = maskedGroup.join("")
            }else{
                const strGroups = strValue.split(" ");
                maskedValue = strGroups.map(name=>name[0] + getStar(name.length-1)).join(" ");
            }
            break;
        case "cardID":
            maskedValue = getStar(12) + strValue.slice(12);
            break;
        case "Email":
            const [frontPart, rearPart] = strValue.split("@");
            if (frontPart.length < 3) {
                maskedValue = strValue;
            } else {
                maskedValue =
                    getStar(frontPart.length - 3) +
                    frontPart.slice(frontPart.length - 3) +
                    "@" +
                    rearPart;
            }
            break;
        case "Phone":
            maskedValue =
                getStar(strValue.length - 4) +
                strValue.slice(strValue.length - 4);
            break;
        case "Date":
            maskedValue = strValue.slice(0, 2) + "**年**月**日";
            break;
        case "Security answer":
            maskedValue = strValue.slice(0, 1) + getStar(strValue.length - 1);
            break;
        case "BankAccount":
            const numOfGroup = Math.ceil(strValue.length / 4);
            const accNumInArrayGroup = Array.from({length:numOfGroup},el=>[])
            const accNumInArray = [...strValue.replace(/.(?=.{3})/g,"•")]
            accNumInArray.forEach((n,i)=>{
                const index = Math.ceil((i + 1)/4) -1
                accNumInArrayGroup[index].push(n)
            })
            const formatAccWithoutMask = accNumInArrayGroup.map(group=>group.join("")).join(" ")
            maskedValue = formatAccWithoutMask;
            break;
        default:
            break;
    }

    return maskedValue;
}

/**
 * 公用处理 API Error 来显示
 * @param {Object} error API 返回的error
 * @returns 要显示的具体error内容
 */
export const getDisplayPublicError =(error={})=> {
    console.log("🚀 ~ file: helper.js:480 ~ getDisplayPublicError ~ error:", error)
    let Msg = "";
    if(error?.errors && Array.isArray(error.errors) && error.errors[0]){
        if(error.errors[0].description){
            Msg = error.errors[0].description
        } 
        else if(error.errors[0].message){
            Msg = error.errors[0].message
        }
    }
    return Msg;
}
export default Util;

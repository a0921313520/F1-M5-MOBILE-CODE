/*
 * @Author: Alan
 * @Date: 2022-05-11 18:12:23
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-06 15:02:52
 * @Description: 谷歌追踪
 * @FilePath: \Mobile\public\js\Piwki.js
 */

window.globalGtag = (eventCategory) => {
    if (eventCategory == undefined) {
        return;
    }
    let data = eventCategory.replace(/[&\|\\\*^%/$#@\-]/g, "");
    console.log(data, 'pwiki')
    if (typeof _paq === 'object') {
        _paq.push(["trackEvent", data, "touch"]);
    }
}

window.Pushgtagdata = (eventCategory, action, name) => {
    /*PiWA 追中*/
    console.log(eventCategory, '---------追中');
    if (eventCategory == undefined) {
        return;
    }
    let data = eventCategory.replace(/[&\|\\\*^%/$#@\-]/g, '');
    if (typeof _paq === 'object') {
        _paq.push([ 'trackEvent', data, action ? action : 'touch', name ]);
    }
};

/* 测试环境 */
if (
    window.location.host.search('p5stag.fun88.biz') != -1 ||
    window.location.host == 'p5stag.fun88.biz' ||
    window.location.host == 'p5stag1.fun88.biz' ||
    window.location.host == 'p5stag2.fun88.biz' ||
    window.location.host == 'p5stag3.fun88.biz' ||
    window.location.host == 'p5stag4.fun88.biz' ||
    window.location.host == 'p5stag5.fun88.biz' ||
    window.location.host == 'p5stag6.fun88.biz' ||
    window.location.host == 'p5stag7.fun88.biz' ||
    window.location.host == 'p5stag8.fun88.biz' ||
    window.location.host == 'localhost:5858' ||
    window.location.host == 'localhost:6868'
) {
    /*PiWA 追中*/
    (function (window, document, script, dataLayer, id) {
        function stgCreateCookie(a, b, c) { var d = ""; if (c) { var e = new Date; e.setTime(e.getTime() + 24 * c * 60 * 60 * 1e3), d = "; expires=" + e.toUTCString() } document.cookie = a + "=" + b + d + "; path=/" } var isStgDebug = (window.location.href.match("stg_debug") || window.document.cookie.match("stg_debug")) && !window.location.href.match("stg_disable_debug"); stgCreateCookie("stg_debug", isStgDebug ? 1 : "", isStgDebug ? 14 : -1);
        window[dataLayer] = window[dataLayer] || [], window[dataLayer].push({ start: (new Date).getTime(), event: "stg.start" }); var scripts = document.getElementsByTagName(script)[0], tags = document.createElement(script), dl = "dataLayer" != dataLayer ? "?dataLayer=" + dataLayer : ""; tags.async = !0, tags.src = "//analytics.ravelz.com/containers/" + id + ".js" + dl, isStgDebug && (tags.src = tags.src + "?stg_debug"), scripts.parentNode.insertBefore(tags, scripts);
        !function (a, n, i, t) { a[n] = a[n] || {}; for (var c = 0; c < i.length; c++)!function (i) { a[n][i] = a[n][i] || {}, a[n][i].api = a[n][i].api || function () { var a = [].slice.call(arguments, 0), t = a; "string" == typeof a[0] && (t = { event: n + "." + i + ":" + a[0], parameters: [].slice.call(arguments, 1) }), window[dataLayer].push(t) } }(i[c]) }(window, "ppms", ["tm", "cp", "cm"]);
    })(window, document, 'script', 'piwikDataLayer', '662ec2b9-18e7-4bdf-a58a-3184fa3205be');
    /*PiWA 追中*/
} else {
    /*PiWA 追中*/
    (function (window, document, script, dataLayer, id) {
        function stgCreateCookie(a, b, c) { var d = ""; if (c) { var e = new Date; e.setTime(e.getTime() + 24 * c * 60 * 60 * 1e3), d = "; expires=" + e.toUTCString() } document.cookie = a + "=" + b + d + "; path=/" } var isStgDebug = (window.location.href.match("stg_debug") || window.document.cookie.match("stg_debug")) && !window.location.href.match("stg_disable_debug"); stgCreateCookie("stg_debug", isStgDebug ? 1 : "", isStgDebug ? 14 : -1);
        window[dataLayer] = window[dataLayer] || [], window[dataLayer].push({ start: (new Date).getTime(), event: "stg.start" }); var scripts = document.getElementsByTagName(script)[0], tags = document.createElement(script), dl = "dataLayer" != dataLayer ? "?dataLayer=" + dataLayer : ""; tags.async = !0, tags.src = "//analytics.ravelz.com/containers/" + id + ".js" + dl, isStgDebug && (tags.src = tags.src + "?stg_debug"), scripts.parentNode.insertBefore(tags, scripts);
        !function (a, n, i, t) { a[n] = a[n] || {}; for (var c = 0; c < i.length; c++)!function (i) { a[n][i] = a[n][i] || {}, a[n][i].api = a[n][i].api || function () { var a = [].slice.call(arguments, 0), t = a; "string" == typeof a[0] && (t = { event: n + "." + i + ":" + a[0], parameters: [].slice.call(arguments, 1) }), window[dataLayer].push(t) } }(i[c]) }(window, "ppms", ["tm", "cp", "cm"]);
    })(window, document, 'script', 'piwikDataLayer', '86cde5a5-9489-4270-836d-a073944a3de3');
    /*PiWA 追中*/
}



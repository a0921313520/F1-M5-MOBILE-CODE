import * as React from 'react'
import Notification from 'rc-notification'
import { ReactSVG } from '@/components/View/ReactSVG'
import { _extends } from '@/lib/js/util'

var defaultDuration = 3;
var defaultTop = 30;
var messageInstance;
var loadingInstance;
var key = 1;
var prefixCls = 'sport-message';
var transitionName = 'move-up';
var getContainer;
var maxCount = 1;

function getMessageInstance(callback, isLoading) {
    if (loadingInstance && isLoading) {
        callback(loadingInstance);
        return;
    }
    if (messageInstance && !isLoading) {
        callback(messageInstance);
        return;
    }

    Notification.newInstance({
        prefixCls: prefixCls,
        transitionName: isLoading ? "" : transitionName,
        style: {
            top: isLoading ? 0 : defaultTop
        },
        getContainer: getContainer,
        maxCount: maxCount
    }, function (instance) {
        isLoading ? (loadingInstance = instance) : (messageInstance = instance);
        callback(instance);
    });
}

function notice(args) {
    const isLoading = args.type === "loading" || args.genre === "loading";
    var duration = args.type === "loading" ? 0 : (args.duration !== undefined ? args.duration : defaultDuration);
    var iconType = {
        info: 'Info',
        success: 'Success',
        error: 'Error',
        warning: 'exclamation-circle',
        loading: 'Loading'
    }[args.type];
    var target = args.key || key++;
    var closePromise = new Promise(function (resolve) {
        var callback = function callback() {
            if (typeof args.onClose === 'function') {
                args.onClose();
            }

            return resolve(true);
        };

        getMessageInstance(function (instance) {
            var iconNode = /*#__PURE__*/React.createElement(ReactSVG, {
                src: "/img/svg/" + iconType + ".svg",
            });
            var switchIconNode = iconType ? iconNode : '';
            instance.notice({
                key: target,
                duration: duration,
                style: {},
                content: /*#__PURE__*/React.createElement("div", {
                    className: "".concat(prefixCls, "-custom-content")
                        .concat(args.type ? " ".concat(prefixCls, "-").concat(args.type) : '')
                        .concat(args.genre ? " ".concat(prefixCls, "-").concat(args.genre) : '')
                }, React.createElement("div", null, args.icon ? args.icon : switchIconNode, /*#__PURE__*/React.createElement("span", null, args.type === "loading" && args.content === undefined ? "Đang tải..." : args.content))),
                onClose: callback
            });
        }, isLoading);
    });
    var result = function result() {
        messageInstance && messageInstance.removeNotice(target);
        loadingInstance && loadingInstance.removeNotice(target);
    };

    result.then = function (filled, rejected) {
        return closePromise.then(filled, rejected);
    };

    result.promise = closePromise;
    return result;
}

function isArgsProps(content) {
    return Object.prototype.toString.call(content) === '[object Object]' && !!content.content;
}

var api = {
    open: notice,
    config: function config(options) {
        if (options.top !== undefined) {
            defaultTop = options.top;
            messageInstance = null; // delete messageInstance for new defaultTop
            loadingInstance = null;
        }

        if (options.duration !== undefined) {
            defaultDuration = options.duration;
        }

        if (options.prefixCls !== undefined) {
            prefixCls = options.prefixCls;
        }

        if (options.getContainer !== undefined) {
            getContainer = options.getContainer;
        }

        if (options.transitionName !== undefined) {
            transitionName = options.transitionName;
            messageInstance = null; // delete messageInstance for new transitionName
            loadingInstance = null;
        }

        if (options.maxCount !== undefined) {
            maxCount = options.maxCount;
            messageInstance = null;
            loadingInstance = null;
        }
    },
    destroy: function destroy() {
        if (messageInstance) {
            messageInstance.destroy();
            messageInstance = null;
        }
        if (loadingInstance) {
            loadingInstance.destroy();
            loadingInstance = null;
        }
    }
};
['success', 'info', 'warning', 'error', 'loading'].forEach(function (type) {
    api[type] = function (content, duration, onClose) {
        if (isArgsProps(content)) {
            return api.open(_extends(_extends({}, content), {
                type: type,
                duration: duration,
                genre: "loading"
            }));
        }

        if (typeof duration === 'function') {
            onClose = duration;
            duration = undefined;
        }

        api.destroy();
        return api.open({
            content: content,
            duration: duration,
            type: type,
            onClose: onClose
        });
    };
});
export default api;
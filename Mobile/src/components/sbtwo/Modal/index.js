import ReactDOM from "react-dom";
import Button from "$SBTWO/Button";
import React, { Component, Fragment } from "react";

export default class Modal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isShow: false,
            animationType: "leave",
        };
    }
    componentDidMount() {
        if (this.props.visible) {
            this.enter();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.visible && !prevProps.visible) {
            this.enter();
        }

        if (!this.props.visible && prevProps.visible) {
            this.leave();
        }
    }

    enter() {
        this.setState({ isShow: true, animationType: "enter" });
    }

    leave() {
        this.setState({ animationType: "leave" });
    }

    animationEnd = () => {
        const { animationType } = this.state;
        if (animationType === "leave") {
            this.setState({ isShow: false });
        }
    };

    render() {
        const { isShow, animationType } = this.state;
        const {
            onCancel,
            children,
            wrapClassName = "",
            className,
            closable = true,
            mask = true,
            maskClosable,
            title = "",
            animation = true,
        } = this.props;
        const style = {
            animationDuration: animation ? "150ms" : "0ms",
            WebkitAnimationDuration: animation ? "150ms" : "0ms",
        };
        return isShow
            ? ReactDOM.createPortal(
                  <div
                      className={`${wrapClassName} modal modal-fade-${animationType}`}
                      onAnimationEnd={this.animationEnd}
                      style={style}
                  >
                      {mask && (
                          <div
                              className="modal-mask"
                              onClick={maskClosable ? onCancel : null}
                          />
                      )}
                      <div
                          style={style}
                          className={`${className} modal-dialog modal-zoom-${animationType}`}
                      >
                          {title?<div className="modal-info-title">{title}</div>:null}
                          <div className="modal-info-content">
                              {children ? children : ""}
                          </div>
                          {closable ? (
                              <div
                                  className="modal-close"
                                  onClick={onCancel}
                              ></div>
                          ) : null}
                      </div>
                  </div>,
                  (this.props.wrapDom && this.props.wrapDom.current) ||
                      document.body
              )
            : null;
    }
}

Modal.info = function (args) {
    console.log(args);
    let div = document.createElement("div");
    document.body.appendChild(div);
    let infoProps = {
        closable: false,
        className: `modal-info ${args.className}`,
        title: args.title || "",
        maskClosable: args.maskClosable === false? false : true,
        onCancel: cancelDestroy,
        onOk: handleOk,
    };

    function cancelDestroy() {
        destroy();
    }
    function destroy() {
        const { onCancel } = args;
        if (onCancel) {
            onCancel();
        }
        render(Object.assign(infoProps, { visible: false }));
        div.parentNode.removeChild(div);
    }

    function handleOk() {
        const { onOk } = args;
        if (onOk) {
            onOk();
        }
        render(Object.assign(infoProps, { visible: false }));
        div.parentNode.removeChild(div);
    }

    function render(props) {
        const cancelBtnComponent = (
            <Button ghost={true} onClick={cancelDestroy}>
                {args.cancelText || "返回"}
            </Button>
        );
        console.log(args)

        ReactDOM.render(
            React.createElement(
                Modal,
                props,
                <>
                    {args.content ? <div>{args.content}</div> : null}
                    {args.type === "confirm" ? (
                        <div
                            className={`confirm-btn-wrap${
                                args.btnBlock ? " block" : ""
                            }`}
                        >
                            {args.btnReverse ? null : args.onlyOKBtn?null:cancelBtnComponent}
                            <Button onClick={handleOk} style={ args.onlyOKBtn ? { width:'100%'} : {}}>
                                {args.okText || "确认"}
                            </Button>
                            {args.btnReverse ? args.onlyOKBtn?null:cancelBtnComponent : null}
                        </div>
                    ) : args.type === "cancel" ? (
                        <div
                            className={`confirm-btn-wrap${
                                args.btnBlock ? " block" : ""
                            }`}
                        >
                            {args.btnReverse ? null : args.onlyCancelBtn?null:cancelBtnComponent}
                            <Button onClick={cancelDestroy} style={ args.onlyCancelBtn ? { width:'100%'} : {}}>
                                {args.cancelText || "取消"}
                            </Button>
                            { args.btnReverse ? args.onlyCancelBtn?null:cancelBtnComponent : null}
                        </div>
                    ) : (
                        <div className="modalInfo-footer">
                            <Button className="modalInfo-footer-cancel" onClick={cancelDestroy}>
                                {args.cancelText || "取消"}
                            </Button>
                            <Button className="modalInfo-footer-confrim" onClick={handleOk}>
                                {args.okText || "确认"}
                            </Button>
                        </div>
                    )}
                </>
            ),
            div
        );
    }

    render(Object.assign(infoProps, { visible: true }));
};

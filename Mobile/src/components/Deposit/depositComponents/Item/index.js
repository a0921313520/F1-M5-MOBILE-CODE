/*
 * @Author: Alan
 * @Date: 2022-05-11 18:17:51
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-28 00:47:42
 * @Description: 表单组件
 * @FilePath: \Mobile\src\components\Deposit\depositComponents\Item\index.js
 */
import { CSSTransition } from "react-transition-group";
import React from 'react';
class Item extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: true,
            isAdded: false,
        };
    }
    componentDidUpdate(prevProps) {
        if (prevProps.errorMessage !== this.props.errorMessage) {
            if (
                this.props.errorMessage !== undefined &&
                this.props.errorMessage[0] !== "string"
            ) {
                this.setState({
                    isShow: !!this.props.errorMessage,
                    isAdded: this.props.errorMessage[0] === "string",
                });
            }
        }
    }
    render() {
        let { label, children, className, errorMessage } = this.props;
        console.log("🚀 ~ Item ~ render ~ errorMessage:", errorMessage,typeof errorMessage?.[0] !== "string")
        if (errorMessage && typeof errorMessage[0] !== "string") {
            errorMessage = undefined;
        }
        let isShowErrorMessage=true;
        if(errorMessage?.[0] === "error-usdt"){
            isShowErrorMessage=false;
        }
        return (
            <div
                className={`form-item${className ? " " + className : ""}`}
                style={this.props.style || null}
            >
                {label ? <label>{label}</label> : null}
                <div className={errorMessage ? "has-error" : ""}>
                    {children || ""}
                </div>
                {this.state.isAdded || (errorMessage && isShowErrorMessage) ? (
                    <CSSTransition
                        in={!!(errorMessage || this.state.isShow)}
                        appear={true}
                        classNames="sprot-bottom-scale"
                        timeout={160}
                        onExited={() => {
                            this.setState({ isAdded: false });
                        }}
                    >
                        <div className="input-error-message">
                            {errorMessage}
                        </div>
                    </CSSTransition>
                ) : null}
            </div>
        );
    }
}
export default Item;

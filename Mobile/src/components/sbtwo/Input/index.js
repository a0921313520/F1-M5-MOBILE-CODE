import React, { Component, Children } from "react";
import { ReactSVG } from '$SBTWO/ReactSVG'

export default class Input extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { prefix, suffix, prefixText, className, isClear, children, ...otherProps } = this.props;

        const prefixClass = (prefix && prefixText) ? 'input__withBoth' : (prefix || prefixText) ? 'input__withIcon' : ''
        return (
            <div className={`input__wrap ${className ? className : ""}`}>
                {prefix ? <div className="input__icon">{prefix}</div> : null}
                {prefixText ? <span className="input__prefixText">{prefixText}</span> : null}
                <input
                    {...otherProps}
                    type={this.props.type || "text"}
                    disabled={this.props.disabled || false}
                    autoComplete={this.props.autoComplete || "initial"}
                    maxLength={this.props.maxLength || 100}
                    placeholder={this.props.placeholder || ""}
                    value={this.props.value || ""}
                    onChange={this.props.onChange}
                    className={`${prefixClass}`}
                />
                {isClear ? <ReactSVG
                    onClick={() => {this.props.onChange({target: {value: ""}})}}
                    className={`clear-input-val${this.props.value ? " show" : ""}`}
                    src="/img/svg/close.svg"
                /> : null}
                {suffix ? suffix : null}
                {children ? children : null}
            </div>
        );
    }
}

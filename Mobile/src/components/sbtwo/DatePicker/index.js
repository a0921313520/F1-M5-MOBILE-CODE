import React from "react";
import DatePicker from './DatePicker';
import { CSSTransition } from 'react-transition-group'

class PopPicker extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            inProp: true,
            isAppend: false,
            date: null
        }

        this.openDatePicker = this.openDatePicker.bind(this);
        this.onChangeDate = this.onChangeDate.bind(this);
    }
    openDatePicker () {
        this.setState({
            isAppend: true,
        })
    }
    onChangeDate () {
        this.setState({inProp: false})
        this.props.onChange(this.state.date || this.props.datePickerProps.defaultDate);
    }
    render () {
        return <>
            <div onClick={this.openDatePicker}>{this.props.children}</div>
            {this.state.isAppend ? <div className="">
                <CSSTransition
                    in={this.state.inProp}
                    appear={true}
                    classNames="rmc-picker-popup-fade"
                    timeout={300}
                >
                    <div className="rmc-picker-popup-mask"></div>
                </CSSTransition>
                <CSSTransition
                    in={this.state.inProp}
                    appear={true}
                    classNames="rmc-picker-popup-slide-fade"
                    timeout={300}
                    onExited={() => {
                        this.setState({inProp: true, isAppend: false})
                    }}
                >
                    <div className="rmc-picker-popup-wrap" onClick={() => {this.setState({inProp: false})}}>
                        <div role="document" className="rmc-picker-popup" onClick={(e) => {e.stopPropagation()}}>
                            <div className="rmc-picker-popup-content">
                                <div className="rmc-picker-popup-body">
                                    <div>
                                        <div className="rmc-picker-popup-header">
                                            <div className="rmc-picker-popup-item rmc-picker-popup-header-left" onClick={() => {this.setState({inProp: false})}}>
                                                关闭
                                            </div>
                                            <div className="rmc-picker-popup-item rmc-picker-popup-title">
                                                {this.props.title || "请选择"}
                                            </div>
                                            <div className="rmc-picker-popup-item rmc-picker-popup-header-right" onClick={this.onChangeDate}>
                                                确认
                                            </div>
                                        </div>
                                        <DatePicker
                                            {...this.props.datePickerProps}
                                            onDateChange={(date) => {
                                                this.setState({date});
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CSSTransition>
            </div> : null}
        </>
    }
}

export default PopPicker;
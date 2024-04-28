
import React from "react";
import Drawer from '$SBTWO/Drawer'
import DateRangePicker from '@wojtekmaj/react-daterange-picker';

export default class DateRange extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
        }

        this.onHandle = this.onHandle.bind(this);
    }
    componentDidMount () {
    }
    onHandle () {
        this.props.onClose();
        typeof this.props.callBack === "function" && this.props.callBack(this.props.value);
    }
    render() {
        return <Drawer
            style={{height: "12.5rem", maxHeight: "480px"}}
            direction="bottom"
            onClose={this.props.onClose}
            visible={this.props.dateRangeVisible}
        >
            <div className="rmc-picker-popup-content drawer-content-background">
                <div className="rmc-picker-popup-body">
                    <div>
                        <div className="rmc-picker-popup-header">
                            <div className="rmc-picker-popup-item rmc-picker-popup-header-left" onClick={this.props.onClose}>
                                关闭
                            </div>
                            <div className="rmc-picker-popup-item rmc-picker-popup-title">
                                {this.props.title || "选择日期"}
                            </div>
                            <div className="rmc-picker-popup-item rmc-picker-popup-header-right" onClick={this.onHandle}>
                                确认
                            </div>
                        </div>
                        <div className="sport-calendar-wrap">
                            <DateRangePicker
                                rangeDivider=""
                                autoFocus={false}
                                className="always-show"
                                showLeadingZeros={true}
                                clearIcon={null}
                                calendarIcon={null}
                                isOpen={true}
                                onChange={this.props.onChange}
                                value={this.props.value}
                                maxDate={this.props.maxDate}
                                minDate={this.props.minDate}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Drawer>
    }
}

/*
 * @Author: Alan
 * @Date: 2022-03-07 11:49:02
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-27 23:25:22
 * @Description: 时间插件
 * @FilePath: \Mobile\src\components\View\DateRange\index.js
 */

import Drawer from '@/components/View/Drawer';
import DateRangePicker from '@wojtekmaj/react-daterange-picker/dist/entry.nostyle';
import React from 'react';
import Toast from '@/components/View/Toast';

export default class DateRange extends React.Component {
	static defaultProps = {
        dateRangeLimit: 90,
    };
	constructor(props) {
		super(props);
		this.state = {
			selectedDate: null
		};

		this.onHandle = this.onHandle.bind(this);
	}

	onHandle() {
		if(this.props.dateRangeLimit && this.props.value){
			const date = this.props.value;
			const start = new Date(date[0]).getTime();
			const end = new Date(date[1]).getTime(); 
			const now = new Date().getTime();
			if (start > end) {
                Toast.error("Thời gian bắt đầu không được lớn hơn thời gian kết thúc!");
                return;
            }
            if ((end - start) / 1000 / 60 / 60 / 24 > 7) {
				Toast.error("Phạm vi tìm kiếm được cố định trong khoản thời gian 7 ngày. Cho phép truy xuất thông tin tối đa 90 ngày.")
                return;
            }
			if((now - start) / 1000 / 60 / 60 / 24 >= this.props.dateRangeLimit){
				Toast.error("Ngày chọn phải trong vòng 90 ngày!");
                return;
			}
		}
		this.props.onClose();
		typeof this.props.callBack === 'function' && this.props.callBack(this.props.value);
	}

	render() {
		const { shorterRange } = this.props;
		const { selectedDate } = this.state;
		const [startDate, endDate] = selectedDate ? [selectedDate, null] : this.props.value;
		const selectableDate =  (shorterRange && selectedDate) ? new Date((new Date(selectedDate).getTime() + (shorterRange * 24 * 60 * 60 * 1000))) : new Date();
		const isSelectableDateOverToday = selectableDate > new Date(); 
		return (
			<Drawer
				style={{ height: '531px', maxHeight: '531px' }}
				direction="bottom"
				onClose={this.props.onClose}
				visible={this.props.dateRangeVisible}
			>
				<div className="rmc-picker-popup-content drawer-content-background">
					<div className="rmc-picker-popup-body">
						<div>
							<div className="rmc-picker-popup-header">
								<div
									className="rmc-picker-popup-item rmc-picker-popup-header-left"
									onClick={this.props.onClose}
								>
									Đóng
								</div>
								<div className="rmc-picker-popup-item rmc-picker-popup-title">
									{this.props.title || 'Chọn Thời Gian'}
								</div>
								<div
									className="rmc-picker-popup-item rmc-picker-popup-header-right"
									onClick={this.onHandle}
								>
									Chọn
								</div>
							</div>
							{(this.props.type == 'TransactionRecord' || (global && global.location && global.location.pathname.includes('daily-gift'))) && (
								<div className="timeTransactionRecord">Phạm vi tìm kiếm được cố định trong khoản thời gian 7 ngày. Cho phép truy xuất thông tin tối đa 90 ngày. </div>
							)}
							<div className="sport-calendar-wrap">
								<DateRangePicker
									dayPlaceholder=""
									monthPlaceholder=""
									yearPlaceholder=""
								    isOpen
									rangeDivider=""
									autoFocus={false}
									className={`always-show ${startDate ? 'startDate' : ''} ${endDate ? 'endDate' : ''}`} //set ClassName for startDate && endDate
									showLeadingZeros={true}
									clearIcon={null}
									calendarIcon={null}
									onChange={(value) => {
										this.props.onChange(value); //trigger onChange to clear startDate
										this.setState({
											selectedDate: null
										})
									}}
									formatMonthYear = {(locale, date)=>{
										const month = date.toLocaleString("en", { month: "numeric" });
										const year = date.toLocaleString("en", { year: "numeric" });
										return <b>{month}/{year}</b>
									}}
									format="dd/MM/y"
									value={[startDate, endDate]} //set startDate value, if has startDate, use startDate and set endDate null
									maxDate={isSelectableDateOverToday ? new Date() : selectableDate}
									minDate={selectedDate || this.props.minDate} //set minDate, if has startDate, use startDate, else use props minDate
									onClickDay={(value) => {
										this.setState({
											selectedDate: value //get startDate
										})
									}}
									// onCalendarClose={()=> {
									// 	this.setState({
									// 		selectedDate: null
									// 	})
									// }}
								/>
							</div>
						</div>
					</div>
				</div>
			</Drawer>
		);
	}
}

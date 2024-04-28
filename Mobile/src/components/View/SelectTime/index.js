/*
 * @Author: Alan
 * @Date: 2022-06-03 07:18:51
 * @LastEditors: Alan
 * @LastEditTime: 2022-09-28 12:07:53
 * @Description: 选择时间组件
 * @FilePath: \Mobile\src\components\View\SelectTime\index.js
 */
import React from 'react';
import moment from 'moment';
import DropDownSingle from '@/components/Common/DropDownSingle/';
import DateRange from '@/components/View/DateRange';
import Flexbox from '@/components/View/Flexbox/';
import { AiOutlineSwapRight } from 'react-icons/ai';
class TimeSelect extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			selItem: { id: '1', label: 'Hôm Nay' },
			Checkdate: [ new Date(moment().subtract(6, 'day')._d), new Date(moment()._d) ]
		};
		this.selectList = [
			{ id: '1', label: 'Hôm Nay', piwikId: 'Today_sorting_betrecord' },
			{ id: '7', label: 'Trong 7 Ngày', piwikId: '7daysrecord_sorting_betrecord' },
			{ id: '30', label: 'Trong 30 ngày', piwikId: '30daysrecord_sorting_betrecord' },
			{ id: '0', label: 'Tùy Chỉnh', isSpecial: true, piwikId: 'Customization_sorting_betrecord' }
		];
	}

	goSelect = (selItem) => {
		if (selItem.id === '0') {
			this.setState({
				showDateRange: true
			});
			return;
		}

		let dateFrom = moment()
			.day(moment().day() - (parseInt(selItem.id) - 1))
			.startOf('day')
			.format('YYYY-MM-DD HH:mm:ss');
		let dateTo = moment().format('YYYY-MM-DD HH:mm:ss');

		this.props.changeSel(dateFrom, dateTo);
	};

	render() {
		let { selItem, showDateRange, Checkdate } = this.state;
		return (
			<Flexbox className="TimeBox" justifyContent="flex-end" padding="5px 0 5px 0px">
				<DropDownSingle
					data={this.selectList}
					selItem={selItem}
					changeSel={this.goSelect}
					onClick={() => {
						//this.props.changeSel();
						//globalGtag && globalGtag('Sorting_betrecord_profilepage');
					}}
				/>
				<DateRange
					dateRangeVisible={showDateRange}
					onClose={() => {
						this.setState({ showDateRange: false });
					}}
					onChange={(date) => {
						this.setState({
							Checkdate: date
						});
					}}
					callBack={(date) => {
						let start = moment(new Date(date[0])).startOf('day');
						let end = moment(new Date(date[1]));
						this.props.changeSel(start.format('YYYY-MM-DD HH:mm:ss'), end.format('YYYY-MM-DD HH:mm:ss'));
						this.setState({
							selItem: {
								id: '0',
								label: (
									<React.Fragment>
										{start.format('DD-MM-YYYY')}
										<AiOutlineSwapRight color="#666666" size={18} style={{ margin: '0 10px' }} />
										{end.format('DD-MM-YYYY')}
									</React.Fragment>
								)
							}
						});
					}}
					value={Checkdate}
					maxDate={new Date()}
					shorterRange={this.props.shorterRange ? this.props.shorterRange : ''}
					minDate={this.props.minDate ? this.props.minDate : ''}
				/>
			</Flexbox>
		);
	}
}
export default TimeSelect;

/*
 * @Author: Alan
 * @Date: 2021-12-01 14:58:21
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-12 13:07:32
 * @Description: 更新 生日联系地址
 * @FilePath: \Mobile\src\components\WithdrawalVerify\Address.js
 */
import React from 'react';
import Toast from '@/components/View/Toast';
import { createForm } from 'rc-form';
import Item from '@/components/Deposit/depositComponents/Item';
import Input from '@/components/View/Input';
import Button from '@/components/View/Button';
import { setUserAddressInfo } from '@/api/userinfo';
import { addressReg } from '@/lib/SportReg';
import DatePicker from '@/components/View/DatePicker';
import { BiCalendar } from 'react-icons/bi';
import moment from 'moment';
import { now } from '@/lib/js/datePickerUtils';
import Flexbox from '@/components/View/Flexbox/';
import SelectArddress from '@/components/View/SelectArddress/';

class RealyName extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			Loading: false,
			showArddress: false,
			birthday: '',
			datavalue: []
		};

		this.handleOk = this.handleOk.bind(this);
	}
	componentDidMount() {
		this.props.onRef(this);
	}

	/**
	 * @description: 提交生日 联系地址
	 * @param {*}
	 * @return {*}
  	*/
	handleOk() {
		if (!this.submitBtnEnable()) return;
		const { birthday, userAddressState, datavalue } = this.state;
		this.setState({ Loading: true });
		let userInfo = {
			dob: moment(new Date(birthday)).format('YYYY-MM-DD'),
			addresses: {
				address: userAddressState,
				city: datavalue[0].name + datavalue[1].name + datavalue[2].name
				// zipCode: null,
				// country: null,
				// nationId: 0
			}
		};
		setUserAddressInfo(userInfo, (res) => {
			if (res.isSuccess) {
				Toast.success({ content: '提交成功', type: 'loading' }, 3);
				this.props.getMemberData();
			}
			this.setState({ Loading: false });
		});
		// Pushgtagdata(`Verification`, 'Submit', `Submit_DOB_WithdrawPage`);
	}

	/**
	 * @description: 信息验证
	 * @param {*}
	 * @return {*}
  	*/
	submitBtnEnable = () => {
		let errors = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let dAddress = this.props.form.getFieldValue('useridAddressState');
		console.log(dAddress);
		let idCard = this.props.form.getFieldValue('useridCardState');
		const { birthday } = this.state;
		return (
			birthday &&
			birthday !== '' &&
			dAddress &&
			dAddress !== '' &&
			idCard !== '' &&
			idCard !== undefined &&
			!errors
		);
	};

	render() {
		const { getFieldDecorator, getFieldError } = this.props.form;
		const { birthday, showArddress, datavalue } = this.state;
		const minDate = moment(new Date('1930-01-01'))._d;
		const maxDate = moment(new Date())._d;
		return (
			<div>
				<div className="list">
					<h3>完善个人资料</h3>
					<p className="note">填写您的出生日期及联系地址</p>
					<hr />
					<Item errorMessage={getFieldError('useridCardState')} label="出生日期">
						{getFieldDecorator('useridCardState', {
							rules: [
								{ required: true, message: '请输入出生日期' },
								{
									validator: (rule, value, callback) => {
										callback();
									}
								}
							]
						})(
							<DatePicker
								datePickerProps={{
									defaultDate: now,
									mode: 'date',
									maxDate: maxDate,
									minDate: minDate
								}}
								title="选择日期"
								isOpen={this.state.isOpen}
								onChange={(v) => {
									this.setState({
										birthday: moment(v).format('YYYY-MM-DD')
									});
								}}
								onClose={() => {
									this.setState({ isOpen: false });
								}}
							>
								<Flexbox
									onClick={() => {
										this.setState({
											isOpen: !this.state.isOpen
										});
									}}
									className="TimeBox"
								>
									<span>{birthday ? moment(new Date(birthday)).format('YYYY-MM-DD') : ''}</span>
									<BiCalendar color="#999999" size="20" />
								</Flexbox>
							</DatePicker>
						)}
					</Item>
					<br />
					<Item errorMessage={getFieldError('useridCityState')} label="省市/自治市">
						{getFieldDecorator('useridCityState', {
							rules: [
								{ required: true, message: '请输入省市/自治市' },
								{
									validator: (rule, value, callback) => {
										callback();
									}
								}
							]
						})(
							<React.Fragment>
								<SelectArddress
									show={showArddress}
									datavalue={datavalue}
									isShow={(val) => {
										this.setState({
											showArddress: val
										});
									}}
									onChange={(val) => {
										console.log(val);
										this.setState({
											datavalue: val
										});
									}}
								/>
								{/* <Flexbox
									onClick={() => {
										this.setState({
											showArddress: true
										});
									}}
									className="TimeBox AddressData"
								>
									{datavalue &&
									datavalue.length != 0 && (
										<React.Fragment>
											<span>{datavalue[0].name}</span>
											<span>{datavalue[1].name}</span>
											<span>{datavalue[2].name}</span>
										</React.Fragment>
									)}
								</Flexbox> */}
							</React.Fragment>
						)}
					</Item>
					<br />
					<Item errorMessage={getFieldError('useridAddressState')} label="联系地址">
						{getFieldDecorator('useridAddressState', {
							rules: [
								{ required: true, message: '请输入联系地址' },
								{
									validator: (rule, value, callback) => {
										//console.log(value);
										if (value && !addressReg.test(value)) {
											callback('联系地址格式错误');
										}
										callback();
									}
								}
							]
						})(
							<Input
								size="large"
								placeholder=""
								onChange={(e) => {
									this.setState({ userAddressState: e.target.value });
								}}
								maxLength="100"
							/>
						)}
					</Item>
				</div>

				<Button
					className={`${!this.submitBtnEnable() ? 'btn-disable' : 'btn-submit'}`}
					loading={this.state.Loading}
					onClick={this.handleOk}
				>
					提交
				</Button>
			</div>
		);
	}
}

export default createForm({ fieldNameProp: 'realyname' })(RealyName);

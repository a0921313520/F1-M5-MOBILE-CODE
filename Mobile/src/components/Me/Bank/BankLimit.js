import BackBar from '@/components/Header/BackBar';
import Router from 'next/router';
import InputItem from '@/components/View/Input';
import Toast from '@/components/View/Toast';
import Modal from '@/components/View/Modal';
import Flexbox from '@/components/View/Flexbox/';
import Item from '@/components/Deposit/depositComponents/Item';
import { createForm } from 'rc-form';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { UpdateMemberWithdrawalThreshold } from '@/api/wallet';
import { BsCheckCircleFill } from 'react-icons/bs';
import React from 'react';

class BankLimit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			WithdrawalThresholdCount: '',
			WithdrawalThresholdAmount: '',
			Threshold: '',
			memberCode: '',
			remind: false,
			successTip: ''
		};
	}

	handleSubmit() {
		const { WithdrawalThresholdCount, WithdrawalThresholdAmount, Threshold } = this.state;
		const { memberCode } = this.props.userInfo.memberInfo;
		const params = {
			WithdrawalThresholdAmount: WithdrawalThresholdAmount, //提款金额
			WithdrawalThresholdCount: WithdrawalThresholdCount, //提款次数
			Threshold: Threshold, //提款限额百分比
			UpdatedBy: memberCode
		};
		Toast.loading();
		UpdateMemberWithdrawalThreshold(params, (res) => {
			Toast.destroy();
			if (res.isSuccess == true) {
				this.props.CloseModal();
				Toast.success('Cập Nhật Thành Công');
			} else {
				Toast.error(res.result.message, 3);
			}
		});
		// globalGtag('Submit_resetPW');
	}

	submitBtnEnable = () => {
		let error = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let errors = Object.values(this.props.form.getFieldsValue()).some((v) => v == '' || v == undefined);
		return !errors && !error;
	};

	render() {
		const { WithdrawalThresholdCount, WithdrawalThresholdAmount, Threshold } = this.state;
		const { showLimitModal, CloseModal } = this.props;
		const { getFieldDecorator, getFieldError } = this.props.form;
		let error_1 = '只许使用数字1-999,999,999';
		let error_2 = '只许使用数字1-100%';
		return (
			<Modal
				visible={showLimitModal}
				transparent
				maskClosable={false}
				closable={false}
				title={
					<BackBar
						key="main-bar-header"
						title={'银行账户限额设置'}
						backEvent={() => {
							CloseModal();
						}}
						hasServer={true}
					/>
				}
				className="WhiteBg Fullscreen-Modal BankLimit"
			>
				<Item label={`提款次数`}>
					{getFieldDecorator('WithdrawalThresholdCount', {
						rules: [
							{ required: true, message: '请输入提款次数' },
							{
								validator: (rule, value, callback) => {
									if (value && !/^(?!0)(?:[0-9]{1,9}|999999999)$/.test(value)) {
										callback(error_1);
									}
									callback();
								}
							}
						]
					})(
						<InputItem
							size="large"
							placeholder="请输入提款次数"
							type="number"
							onChange={(v) => {
								this.setState({
									WithdrawalThresholdCount: v.target.value
								});
							}}
							maxLength="9"
						/>
					)}
				</Item>

				<Flexbox className="Error">
					<BsCheckCircleFill
						color={
							getFieldError('WithdrawalThresholdCount') ? (
								'#BCBEC3'
							) : WithdrawalThresholdCount == '' ? (
								'#BCBEC3'
							) : (
								'#0CCC3C'
							)
						}
						size={14}
					/>
					<span className="txt">{error_1}</span>
				</Flexbox>
				<Item label={`提款金额`}>
					{getFieldDecorator('WithdrawalThresholdAmount', {
						rules: [
							{ required: true, message: '请输入提款金额' },
							{
								validator: (rule, value, callback) => {
									if (value && !/^(?!0)(?:[0-9]{1,9}|999999999)$/.test(value)) {
										callback(error_1);
									}
									callback();
								}
							}
						]
					})(
						<InputItem
							size="large"
							placeholder="请输入提款金额"
							onChange={(v) => {
								this.setState({
									WithdrawalThresholdAmount: v.target.value
								});
							}}
							maxLength="9"
						/>
					)}
				</Item>
				<Flexbox className="Error">
					<BsCheckCircleFill
						color={
							getFieldError('WithdrawalThresholdAmount') ? (
								'#BCBEC3'
							) : WithdrawalThresholdAmount == '' ? (
								'#BCBEC3'
							) : (
								'#0CCC3C'
							)
						}
						size={14}
					/>
					<span className="txt">{error_1}</span>
				</Flexbox>
				<Item label={`限额百分比(%)`}>
					{getFieldDecorator('Threshold', {
						rules: [
							{ required: true, message: '请输入限额百分比(%)' },
							{
								validator: (rule, value, callback) => {
									if (value && !/^(?!0)(?:[0-9]{1,3}|100)$/.test(value)) {
										callback(error_2);
									}
									callback();
								}
							}
						]
					})(
						<InputItem
							size="large"
							placeholder="请输入限额百分比(%)"
							onChange={(v) => {
								this.setState({
									Threshold: v.target.value
								});
							}}
							maxLength="3"
						/>
					)}
				</Item>
				<Flexbox className="Error">
					<BsCheckCircleFill
						color={getFieldError('Threshold') ? '#BCBEC3' : Threshold == '' ? '#BCBEC3' : '#0CCC3C'}
						size={14}
					/>
					<span className="txt">{error_2}</span>
				</Flexbox>
				<div
					onClick={() => {
						if (this.submitBtnEnable()) {
							this.handleSubmit();
						}
					}}
					className={classNames({
						BtnActive: this.submitBtnEnable(),
						BtnSubmit: true
					})}
				>
					保存
				</div>
				<div className="Note">
					限额设置适用于所有提款银行账户。例：<br /> 提款次数= 50, <br />提款金额= 100,000 限额百分比= 50％ <br />当您成功提款25笔或提款总额达50,000元人民币至同一银行账户时,
					系统将会提醒您注意账户安全，建议您添加或更换新的银行账户。
				</div>
			</Modal>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});
const mapDispatchToProps = {
	userInfo_getDetails: () => ACTION_User_getDetails()
};

export default connect(mapStateToProps, mapDispatchToProps)(createForm({ fieldNameProp: 'banklimit' })(BankLimit));

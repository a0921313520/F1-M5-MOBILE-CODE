/*
 * @Author: Alan
 * @Date: 2021-12-01 14:58:21
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-12 13:06:44
 * @Description: 验证真实姓名
 * @FilePath: \Mobile\src\components\WithdrawalVerify\IDCard.js
 */
import React from 'react';
import Toast from '@/components/View/Toast';
import { createForm } from 'rc-form';
import Item from '@/components/Deposit/depositComponents/Item';
import Input from '@/components/View/Input';
import Button from '@/components/View/Button';
import { setUserInfo } from '@/api/userinfo';
import { realyNameReg, idCard } from '@/lib/SportReg';

class RealyName extends React.Component {
	constructor(props) {
		super(props);
		//console.log(props);
		this.state = {
			Loading: false,
			userRealyNameState: '',
			userIdState: ''
		};

		this.handleOk = this.handleOk.bind(this);
	}
	componentDidMount() {
		this.props.onRef(this);
	}

	handleOk() {
		if (!this.submitBtnEnable()) return;
		this.setState({ Loading: true });
		let userInfo = {
			key: 'IdentityCard',
			value1: this.state.userIdState
		};
		setUserInfo(userInfo, (res) => {
			if (res.isSuccess) {
				Toast.success({ content: '提交成功', type: 'loading' }, 3);
				setTimeout(() => {
					this.props.getMemberData();
				}, 1000);
			}
			this.setState({ Loading: false });
		});
		// Pushgtagdata(`Verification`, 'Submit', `Submit_NationalID_WithdrawPage`);
	}
	setidCardState = (e) => {
		this.setState({ userIdState: e.target.value });
	};

	submitBtnEnable = () => {
		let errors = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let idCard = this.props.form.getFieldValue('useridCardState');
		return idCard !== '' && idCard !== undefined && !errors;
	};

	render() {
		const { getFieldDecorator, getFieldError } = this.props.form;
		console.log(this.props.memberInfo);
		return (
			<div>
				<div className="list">
					<h3>验证身份证号码</h3>
					<p className="note">请输入您的有效身份证件以验证您的帐户</p>
					<hr />
					<Item errorMessage={getFieldError('useridCardState')} label="身份证号码 (18位）">
						{getFieldDecorator('useridCardState', {
							rules: [
								{ required: true, message: '请输入身份证号码' },
								{
									validator: (rule, value, callback) => {
										//console.log(value);
										if (value && !idCard.test(value)) {
											callback('身份证号码格式错误');
										}
										callback();
									}
								}
							]
						})(
							<Input
								size="large"
								placeholder=""
								disabled={
									this.props.memberInfo.identityCard && this.props.memberInfo.identityCard !== '' ? (
										true
									) : (
										false
									)
								}
								onChange={this.setidCardState}
								maxLength="18"
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

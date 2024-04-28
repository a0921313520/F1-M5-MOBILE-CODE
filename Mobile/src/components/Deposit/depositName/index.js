/*
 * @Author: Alan
 * @Date: 2022-03-07 11:49:02
 * @LastEditors: Alan
 * @LastEditTime: 2022-07-24 23:41:50
 * @Description:存款人姓名
 * @FilePath: \Mobile\src\components\Deposit\depositName\index.js
 */
import React from 'react';
import Input from '@/components/View/Input';
import Item from '../depositComponents/Item/';
import { realyNameReg } from '@/lib/SportReg';
class depositName extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fileName: '',
			filestatus: '3',
			visible: false,
			uploadSizeFlag: false
		};
	}

	componentDidMount() {}

	getMaskedText = (length) => {
		return '*'.repeat(length);
	};

	render() {
		const { getFieldError, getFieldDecorator, setting } = this.props;
		const { showDepositorNameField, prefillRegisteredName } = setting;
		return (
			<div>
				{showDepositorNameField && !prefillRegisteredName ? (
					<div>
						<label className="name-deposit-lb">存款人姓名</label>
						<Item errorMessage={getFieldError('lbRealName')}>
							{getFieldDecorator('lbRealName', {
								// initialValue: this.getMaskedText(
								// 	this.props.localMemberName ? this.props.localMemberName.length : 0
								// ),
								initialValue: this.props.localMemberName,
								rules: [
									{ required: true, message: '请输入全名' },
									{
										validator: (rule, value, callback) => {
											if (value && !realyNameReg.test(value)) {
												callback('格式不正确');
											}
											callback();
										}
									}
								]
							})(<Input size="large" placeholder="请输入姓名" />)}
						</Item>
						<div className="modal-prompt-info">请使用您本人账户进行转账，任何他人代付或转账将被拒绝且无法保证退款。</div>
					</div>
				) : showDepositorNameField && prefillRegisteredName ? (
					<div
						className="modal-prompt-info"
						style={{
							backgroundColor: '#EFEFF4',
							color: '#999999'
						}}
					>
						请确保您的存款账户姓名与注册姓名一致，任何他人代付或转账将被拒绝且无法保证退款。
					</div>
				) : (
					''
				)}
			</div>
		);
	}
}

export default depositName;

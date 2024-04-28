import React from 'react';
import Button from '@/components/View/Button';
import { createForm } from 'rc-form';
import { CommonPostConfirmPay, PostUploadAttachment } from '@/api/wallet';
import { Cookie, dateFormat } from '@/lib/js/util';
import OtherAccount from './../OtherAccount';
import UploadFile from '../../uploadFile/';
import Toast from '@/components/View/Toast';
import Copy from '../Copy';
import Modal from '@/components/View/Modal';
import Router from 'next/router';
class SecondStep extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isOtherAccount: false // 是否存入其它账号
		};
	}
	componentDidMount() {
		// 传递此方法到父元素
		this.props.setGoThirdStep(this.goThirdStep);
	}
	componentDidUpdate(prevProps, prevState) {}
	goThirdStep = (e) => {
		e.preventDefault();

		let hide = null;
		const sucessRun = (status) => {
			if (status) {
				Cookie('isThird', 'true', { expires: 15 });
				this.props.form.resetFields();
				this.props.setLbStep(3);
			}

			hide();
		};

		this.props.form.validateFields((err, values) => {
			if (!err) {
				hide = Toast.loading();
				const { currBankAccount } = this.props;
				let postOtherInfo = {
					transactionId: this.props.transactionId
				};

				// if (this.props.currBankAccount) {
				// 	postOtherInfo.depositingBankAcctNum = String(
				// 		currBankAccount.AccountNo.substring(currBankAccount.AccountNo.length - 6)
				// 	);
				// }

				if (this.state.isOtherAccount && values.lastSixNum) {
					postOtherInfo.depositingBankAcctNum = values.lastSixNum;
				} else {
					postOtherInfo.depositingBankAcctNum = '';
				}

				CommonPostConfirmPay(postOtherInfo, (res) => {
					sucessRun(res.isSuccess);
				});
			}
		});
		// Pushgtagdata(`Deposit`, 'Submit', 'Submit_Localbank_Deposit');
	};

	getMaskedText = (length) => {
		return '*'.repeat(length);
	};

	render() {
		const { getFieldDecorator, getFieldError } = this.props.form;
		const { currBankAccount } = this.props;
		const { isOtherAccount } = this.state;

		return (
			<div
				style={{
					display: this.props.lbStep === 2 ? 'block' : 'none'
				}}
			>
				<div className="form-wrap sport-deposit-container">
					<div className="modal-prompt-info">
						交易生成时间 {Cookie('dateTime') || dateFormat()} <br />
						请在{this.props.remainingTime}分钟内完成支付，或者系统自动延迟交易
					</div>

					<div className="sport-deposit-receipt">
						<div className="item-label">您的存款信息:</div>
						<ul>
							<li className="item-wrap">
								<span className="item-label">存款金额</span>
								<span className="item-content" style={{ color: '#000' }}>
									<span style={{ fontSize: '14px' }}>￥</span>
									<span style={{ fontSize: '20px' }}>{this.props.depositMoney}</span>
									<Copy targetText={this.props.depositMoney} />
								</span>
							</li>
							<li className="item-wrap">
								<span className="item-label">存款人姓名</span>
								<span className="item-content">
									{this.getMaskedText(
										this.props.localMemberName ? this.props.localMemberName.length : 0
									)}
								</span>
							</li>
							<li className="item-wrap">
								<span className="item-label">支付类型</span>
								<span className="item-content">银行卡</span>
							</li>
						</ul>
					</div>
					<div className="sport-deposit-receipt">
						<div className="item-label">我们的收款账户：</div>
						<ul>
							<li className="item-wrap" style={{ paddingTop: '17px' }}>
								<span className="item-label">银行名称</span>
								<span className="item-content">
									{currBankAccount && currBankAccount.BankName}
									<Copy targetText={currBankAccount && currBankAccount.BankName} />
								</span>
							</li>
							<li className="item-wrap">
								<span className="item-label">账户姓名</span>
								<span>{currBankAccount && currBankAccount.AccountHolderName}</span>
							</li>
							<li className="item-wrap">
								<span className="item-label">收款账号</span>
								<span className="item-content">
									{currBankAccount && currBankAccount.AccountNo}
									<Copy targetText={currBankAccount && currBankAccount.AccountNo} />
								</span>
							</li>

							<li>
								<div className="item-wrap">
									<span className="item-label">省/自治区</span>
									<span className="item-content">
										{currBankAccount && currBankAccount.Province}
										<Copy targetText={currBankAccount && currBankAccount.Province} />
									</span>
								</div>
							</li>
							<li>
								<div className="item-wrap">
									<span className="item-label">城市/城镇</span>
									<span className="item-content">
										{currBankAccount && currBankAccount.City}
										<Copy targetText={currBankAccount && currBankAccount.City} />
									</span>
								</div>
							</li>
							<li>
								<div className="item-wrap">
									<span className="item-label">分行</span>
									<span className="item-content">
										{currBankAccount && currBankAccount.Branch}
										<Copy targetText={currBankAccount && currBankAccount.Branch} />
									</span>
								</div>
							</li>
						</ul>
					</div>
				</div>
				<OtherAccount
					getFieldDecorator={getFieldDecorator}
					getFieldError={getFieldError}
					isOtherAccount={isOtherAccount}
					setOtherAccountStatus={() => {
						this.setState({ isOtherAccount: !isOtherAccount });
						// Pushgtagdata(`Deposit`, 'Submit', 'Submit_Otheracc_Localbank_Deposit');
					}}
				/>
				{/* 上传存款凭证 */}
				<UploadFile
					PaymentMethod="LB"
					RequestedBy={this.props.RequestedBy}
					transactionId={this.props.transactionId}
				/>
				<div style={{ marginTop: '16px' }}>
					<div className="btn-wrap">
						<Button size="large" type="primary" onClick={this.goThirdStep}>
							我已经成功存款
						</Button>
					</div>
				</div>
				<Modal closable={false} className="LB-Modal" title="错误提示" visible={this.props.Modalopen}>
					<div className="combo-bonus-wrap">很抱歉，目前暂无可存款的银行。此次交易将被取消，请尝试其他存款方式。</div>
					<Button
						size="large"
						type="primary"
						onClick={() => {
							//Router.push('/Deposit');
							this.props.setLbStep(1);
						}}
					>
						重新提交
					</Button>
				</Modal>
			</div>
		);
	}
}
export default createForm({ fieldNameProp: 'secondstep' })(SecondStep);

import React from 'react';
import Button from '@/components/View/Button';
import Input from '@/components/View/Input';
import { createForm } from 'rc-form';
import { CommonPostConfirmPay } from '@/api/wallet';
import { Cookie, dateFormat } from '@/lib/js/util';
import OtherAccount from './../OtherAccount';
import Toast from '@/components/View/Toast';
import Item from './../Item';
import Copy from '../Copy';

class SecondStep extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isOtherAccount: false, // 是否存入其它账号
			oldAccNo: ''
		};
	}
	componentDidMount() {}
	componentDidUpdate(prevProps, prevState) {}
	goThirdStep = (e) => {
		e.preventDefault();
		let hide = null;
		const sucessRun = (status) => {
			if (status) {
				Cookie('isWCThird', 'true', { expires: 15 });
				this.props.form.resetFields();
				this.props.setLbStep(3);
			}

			hide();
		};
		this.props.form.validateFields((err, values) => {
			console.log('WCLB 微信轉賬 values ===================' , values);
			if (!err) {
				hide = Toast.loading();
				let postOtherInfo = { transactionId: this.props.transactionId };
				// const { currBankAccount } = this.props;
				// if (currBankAccount) {
				// 	postOtherInfo.depositingBankAcctNum = String(
				// 		currBankAccount.accountNo.substring(currBankAccount.accountNo.length - 6)
				// 	);
				// }

				// 用戶有填 > 存到舊帳戶號碼 > 則顯示對應value，如果沒有給空字串
				if(!values.lastSixNum){
					postOtherInfo.depositingBankAcctNum = ''
				}

				if (values.lastSixNum) {
					postOtherInfo.depositingBankAcctNum = values.lastSixNum;
				}
				
				console.log('WCLB 微信轉賬 postOtherInfo ===================' , postOtherInfo);
				CommonPostConfirmPay(postOtherInfo, (res) => {
					sucessRun(res.isSuccess);
				});
			}
		});
		// Pushgtagdata(`Deposit`, 'Submit', 'Submit_LocalbankWechat_Deposit');
	};
	render() {
		const { getFieldDecorator, getFieldError } = this.props.form;
		const { currBankAccount, depositMoney } = this.props;
		const { isOtherAccount } = this.state;

		return (
			<div style={{ display: this.props.lbStep === 2 ? 'block' : 'none' }}>
				{/* <Item label="充值方式">
          <Input className="sport-input-disabled" size="large" disabled={true} value="支付宝转账" />
        </Item> */}
				<div className="">
					{currBankAccount !== null ? (
						<div>
							<div className="form-wrap sport-deposit-container">
								<div className="modal-prompt-info" style={{ marginBottom: '16px' }}>
									请在{this.props.remainingTime}分钟内完成支付，或者系统自动延迟交易
								</div>

								<div className="sport-deposit-receipt">
									<div className="item-label">您的存款信息:</div>
									<ul>
										<li className="item-wrap">
											<span className="item-label">存款金额</span>
											<span className="item-content" style={{ color: '#000' }}>
												<span style={{ fontSize: '14px' }}>￥</span>
												<span style={{ fontSize: '20px' }}>{depositMoney}</span>
												<Copy targetText={depositMoney} />
											</span>
										</li>
									</ul>
								</div>
								<div className="sport-deposit-receipt">
									<div className="item-label">我们的收款账户：</div>
									<ul>
										<li className="item-wrap">
											<span className="item-label">银行名称</span>
											<span className="item-content">
												{currBankAccount && currBankAccount.bankName}
												<Copy targetText={currBankAccount && currBankAccount.bankName} />
											</span>
										</li>
										<li className="item-wrap">
											<span className="item-label">账号</span>
											<span className="item-content">
												{currBankAccount && currBankAccount.accountNo}
												<Copy targetText={currBankAccount && currBankAccount.accountNo} />
											</span>
										</li>
										<li>
											<div className="item-wrap">
												<span className="item-label">省/自治区</span>
												<span className="item-content">
													{currBankAccount && currBankAccount.province}
													<Copy targetText={currBankAccount && currBankAccount.province} />
												</span>
											</div>
										</li>
										<li>
											<div className="item-wrap">
												<span className="item-label">城市/城镇</span>
												<span className="item-content">
													{currBankAccount && currBankAccount.city}
													<Copy targetText={currBankAccount && currBankAccount.city} />
												</span>
											</div>
										</li>
										<li>
											<div className="item-wrap">
												<span className="item-label">分行</span>
												<span className="item-content">
													{currBankAccount && currBankAccount.branch}
													<Copy targetText={currBankAccount && currBankAccount.branch} />
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
							<div>
								<div className="btn-wrap">
									<Button size="large" type="primary" onClick={this.goThirdStep}>
										我已经成功存款
									</Button>
								</div>
							</div>
						</div>
					) : null}
				</div>
			</div>
		);
	}
}
export default createForm({ fieldNameProp: 'wclbsecondstep' })(SecondStep);

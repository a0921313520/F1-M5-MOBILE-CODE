import QRCode from 'qrcode-react';
import { createForm } from 'rc-form';
import React from 'react';
import Button from '@/components/View/Button';
import { CommonPostConfirmPay } from '@/api/wallet';
import { Cookie, dateFormat } from '@/lib/js/util';
import OtherAccount from './../OtherAccount';
import Toast from '@/components/View/Toast';
import Copy from '../Copy';

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
		e && e.preventDefault();

		if (this.props.collectionInfo === null) return false;

		let hide = null;
		const sucessRun = (status) => {
			if (status) {
				Cookie('isAlbSecond', null);
				Cookie('isAlbThird', 'true', { expires: 15 });
				Cookie('dateTime', dateFormat(), { expires: 30 });

				this.props.setLbStep(3);
				this.props.form.resetFields();
			}

			hide();
		};

		this.props.form.validateFields((err, values) => {
			if (!err) {
				hide = Toast.loading();
				let AccountNumber = this.props.collectionInfo.returnedBankDetails.accountNumber;
				let postOtherInfo = {
					transactionId: this.props.transactionId
				};
				// if (this.props.collectionInfo.returnedBankDetails && AccountNumber) {
				// 	postOtherInfo.depositingBankAcctNum = String(AccountNumber).substring(AccountNumber.length - 6);
				// }

				// 用戶有填 > 存到舊帳戶號碼 > 則顯示對應value，如果沒有給空字串
				if(!values.lastSixNum){
					postOtherInfo.depositingBankAcctNum = ''
				}

				if (values.lastSixNum) {
					postOtherInfo.depositingBankAcctNum = values.lastSixNum;
				}

				if (this.props.showType == '1') {
					postOtherInfo.HasQR = true;
				}
				console.log('ALB 支付寶轉賬 postOtherInfo ===================' , postOtherInfo);
				CommonPostConfirmPay(postOtherInfo, (res) => {
					sucessRun(res.isSuccess);
				});
			}
		});
		// Pushgtagdata(`Deposit`, 'Submit', 'Submit_LocalbankAlipay_Deposit');
	};
	copySuccessCall() {
		Toast.success('复制成功！');
	}
	render() {
		const { getFieldDecorator, getFieldError } = this.props.form;
		const { collectionInfo, showType } = this.props;
		//console.log(this.state);
		//console.log(this.props);
		return (
			<div style={{ display: this.props.lbStep === 2 ? 'block' : 'none' }}>
				{/* <Item label="充值方式">
          <Input className="sport-input-disabled" size="large" disabled={true} value="支付宝转账" />
        </Item> */}
				<div>
					{collectionInfo !== null && showType === '1' ? (
						<React.Fragment>
							<div className="form-wrap sport-deposit-container">
								<div className="sport-deposit-receipt">
									<div className="modal-waining-info">
										二维码有效期{this.props.remainingTime}
										，请在有效期内完成支付
									</div>
									<ul>
										<li className="item-wrap">
											<span className="item-label">存款金额</span>
											<span className="item-content" style={{ color: '#000' }}>
												<span style={{ fontSize: '14px' }}>￥</span>
												<span style={{ fontSize: '20px' }}>{collectionInfo.uniqueAmount}</span>
												<Copy targetText={collectionInfo.uniqueAmount} />
											</span>
										</li>
										<li className="item-wrap" style={{ alignItems: 'flex-start' }}>
											<span className="item-label">二维码</span>
											<span className="item-content" style={{ color: '#000' }}>
												{collectionInfo.redirectUrl ? (
													<QRCode size={200} value={collectionInfo.redirectUrl} />
												) : null}
											</span>
										</li>
									</ul>
								</div>
							</div>
						</React.Fragment>
					) : null}
					{collectionInfo !== null && showType === '2' ? (
						<React.Fragment>
							<div className="form-wrap sport-deposit-container">
								<div className="modal-prompt-info" style={{ marginBottom: '16px' }}>
									请在{this.props.remainingTime}
									分钟内完成支付，或者系统自动延迟交易
								</div>
								<div className="sport-deposit-receipt">
									<div className="item-label">您的存款信息:</div>
									<ul>
										<li className="item-wrap">
											<span className="item-label">存款金额</span>
											<span className="item-content" style={{ color: '#000' }}>
												<span style={{ fontSize: '14px' }}>￥</span>
												<span style={{ fontSize: '20px' }}>{collectionInfo.uniqueAmount}</span>
												<Copy targetText={collectionInfo.uniqueAmount} />
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
												{collectionInfo.returnedBankDetails &&
													collectionInfo.returnedBankDetails.bankName}
												<Copy
													targetText={
														collectionInfo.returnedBankDetails &&
														collectionInfo.returnedBankDetails.bankName
													}
												/>
											</span>
										</li>
										<li className="item-wrap">
											<span className="item-label">账户名称</span>
											<span className="item-content">
												{collectionInfo.returnedBankDetails &&
													collectionInfo.returnedBankDetails.accountHolderName}
												<Copy
													targetText={
														collectionInfo.returnedBankDetails &&
														collectionInfo.returnedBankDetails.accountHolderName
													}
												/>
											</span>
										</li>
										<li className="item-wrap">
											<span className="item-label">账号</span>
											<span className="item-content">
												{collectionInfo.returnedBankDetails &&
													collectionInfo.returnedBankDetails.accountNumber}
												<Copy
													targetText={
														collectionInfo.returnedBankDetails &&
														collectionInfo.returnedBankDetails.accountNumber
													}
												/>
											</span>
										</li>
										<li>
											<div className="item-wrap">
												<span className="item-label">省/自治区</span>
												<span className="item-content">
													{collectionInfo.returnedBankDetails &&
														collectionInfo.returnedBankDetails.province}
													<Copy
														targetText={
															collectionInfo.returnedBankDetails &&
															collectionInfo.returnedBankDetails.province
														}
													/>
												</span>
											</div>
										</li>
										<li>
											<div className="item-wrap">
												<span className="item-label">城市/城镇</span>
												<span className="item-content">
													{collectionInfo.returnedBankDetails &&
														collectionInfo.returnedBankDetails.city}
													<Copy
														targetText={
															collectionInfo.returnedBankDetails &&
															collectionInfo.returnedBankDetails.city
														}
													/>
												</span>
											</div>
										</li>
										<li>
											<div className="item-wrap">
												<span className="item-label">分行</span>
												<span className="item-content">
													{collectionInfo.returnedBankDetails &&
														collectionInfo.returnedBankDetails.branch}
													<Copy
														targetText={
															collectionInfo.returnedBankDetails &&
															collectionInfo.returnedBankDetails.branch
														}
													/>
												</span>
											</div>
										</li>
									</ul>
								</div>
							</div>
						</React.Fragment>
					) : null}
					<OtherAccount
						getFieldDecorator={getFieldDecorator}
						getFieldError={getFieldError}
						isOtherAccount={this.state.isOtherAccount}
						setOtherAccountStatus={() => {
							this.setState({ isOtherAccount: !this.state.isOtherAccount });
							// Pushgtagdata(`Deposit`, 'Submit', 'Submit_Otheracc_Localalipay_Deposit');
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
			</div>
		);
	}
}
export default createForm({ fieldNameProp: 'albsecondstep' })(SecondStep);

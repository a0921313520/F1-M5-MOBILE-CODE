import React from "react";
import Button from '@/components/View/Button';
import Copy2 from '../Copy/copy2';
import QRCode from "qrcode-react";



class SecondStep extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		};
		this.copyRefs = [];
		for(let i = 0;i<8;i++) {
			this.copyRefs[i] = React.createRef();
		}
	}
	componentDidMount() {
	}

	setAllOtherCopyIconsUnclicked = (thisRef) => {
		this.copyRefs.map(item => {
			if (item !== thisRef) {
				item.current && item.current.setNotCopied();
			}
		})
	}

	render() {
		const { currBankAccount } = this.props;
		console.log(currBankAccount)
		return (
			<>
				<div className="form-wrap ppb-step2-info">
					<div className="modal-prompt-info">
						<div>交易生成时间 {this.props.submitTime}</div>
						<div>请在 <span className="sr-count-down">{this.props.countDownMinute}:{this.props.countDownSecond}</span> 分钟内完成支付，或者系统自动延迟交易</div>
					</div>
					<div className="ppb-deposit-amount-container">
							<div className="ppb-deposit-amount-wrapper">
								<span className="sr-deposit-amount-flag">￥</span>
								<span className="sr-deposit-amount">{this.props.depositMoney}</span>
								<span className="sr-deposit-amount-copy-container">
								<Copy2 ref={this.copyRefs[0]}
											 onCopyIconClicked={()=>{this.setAllOtherCopyIconsUnclicked(this.copyRefs[0])}}
											 targetText={this.props.depositMoney}
								/>
								</span>
							</div>
							<div className="sr-deposit-amount-desc">
								存款金额
							</div>
					</div>
					<div className="sport-deposit-receipt">
						<ul>
							<li className="item-wrap" style={{ paddingTop: '17px' }}>
								<span className="item-label">银行名称</span>
								<span className="item-content">
									{currBankAccount && currBankAccount.bankName}
									<Copy2 ref={this.copyRefs[1]}
												 onCopyIconClicked={()=>{this.setAllOtherCopyIconsUnclicked(this.copyRefs[1])}}
												 targetText={currBankAccount && currBankAccount.bankName}
									/>
								</span>
							</li>
							<li className="item-wrap">
								<span className="item-label">账号</span>
								<span className="item-content">
									{currBankAccount && currBankAccount.accountNumber}
									<Copy2 ref={this.copyRefs[2]}
												 onCopyIconClicked={()=>{this.setAllOtherCopyIconsUnclicked(this.copyRefs[2])}}
												 targetText={currBankAccount && currBankAccount.accountNumber}
									/>
								</span>
							</li>
							<li className="item-wrap">
								<span className="item-label">账户名称</span>
								<span className="item-content">
										{currBankAccount &&	currBankAccount.accountHolderName}
									<Copy2 ref={this.copyRefs[3]}
												 onCopyIconClicked={()=>{this.setAllOtherCopyIconsUnclicked(this.copyRefs[3])}}
												 targetText={currBankAccount && currBankAccount.accountHolderName}
									/>
								</span>
							</li>
							{ currBankAccount && currBankAccount.bankProvince && currBankAccount.bankProvince !== '' &&
							<li className="item-wrap">
								<span className="item-label">省/自治区</span>
								<span className="item-content">
									{currBankAccount.bankProvince}
									<Copy2 ref={this.copyRefs[4]}
												 onCopyIconClicked={()=>{this.setAllOtherCopyIconsUnclicked(this.copyRefs[4])}}
												 targetText={currBankAccount.bankProvince}
									/>
								</span>
							</li>
							}
							{currBankAccount && currBankAccount.bankCity && currBankAccount.bankCity !== '' &&
							<li className="item-wrap">
								<span className="item-label">城市/城镇</span>
								<span className="item-content">
									{currBankAccount.bankCity}
									<Copy2 ref={this.copyRefs[5]}
												 onCopyIconClicked={()=>{this.setAllOtherCopyIconsUnclicked(this.copyRefs[5])}}
												 targetText={currBankAccount.bankCity}
									/>
								</span>
							</li>
							}
							{currBankAccount && currBankAccount.bankBranch && currBankAccount.bankBranch !== '' &&
							<li className="item-wrap">
								<span className="item-label">分行</span>
								<span className="item-content">
									{currBankAccount.bankBranch}
									<Copy2 ref={this.copyRefs[6]}
												 onCopyIconClicked={()=>{this.setAllOtherCopyIconsUnclicked(this.copyRefs[6])}}
												 targetText={currBankAccount.bankBranch}
									/>
								</span>
							</li>
							}
							{/*<li className="item-wrap">*/}
							{/*	<span className="item-label">附言/备注</span>*/}
							{/*	<span className="item-content">*/}
							{/*		{(currBankAccount && currBankAccount.pgRemark) || ''}*/}
							{/*		<Copy2 ref={this.copyRefs[7]}*/}
							{/*					 onCopyIconClicked={()=>{this.setAllOtherCopyIconsUnclicked(this.copyRefs[7])}}*/}
							{/*					 targetText={(currBankAccount && currBankAccount.pgRemark) || ''}*/}
							{/*		/>*/}
							{/*	</span>*/}
							{/*</li>*/}
						</ul>
					</div>
					<div className="sr-deposit-notice">
						如果您存款至其他账户，请联系<span
						className="underline_a"
						onClick={() => {
							global.PopUpLiveChat();
						}}
					>
							在线客服
						</span>。
					</div>
				</div>
				<div style={{ marginTop: '16px' }}>
					<div className="btn-wrap ppb-step2-button">
						<Button size="large" type="primary" onClick={() => { this.props.goToStep3() }}>
							我已经成功存款
						</Button>
					</div>
				</div>
			</>
		);
	}
}
export default SecondStep;

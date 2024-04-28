import React from 'react';
import Button from '@/components/View/Button';
import Copy2 from '../Copy/copy2';
import QRCode from 'qrcode'; //更换此插件 react-qrcode 如果数据多会出现 扫不出来的情况
import CryptoJS from 'crypto-js';
import moment from 'moment';
const opts = {
	errorCorrectionLevel: 'H',
	type: 'image/jpeg',
	rendererOpts: {
		quality: 0.3
	}
};
class SecondStep extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.copyRefs = [];
		for (let i = 0; i < 8; i++) {
			this.copyRefs[i] = React.createRef();
		}
	}
	componentDidMount() {
		const { currBankAccount, submittedAt, timeoutSeconds } = this.props;
		let time = moment(new Date(submittedAt)).format('YYYY-MM-DDTHH:mm:ss');
		if (currBankAccount && document.getElementById('Qrcode')) {
			let data =
				`timeOutSec=${timeoutSeconds && timeoutSeconds != '0' ? timeoutSeconds : 300 }&` +
				`submittedAt=${encodeURIComponent(time)}&` +
				`transferAmount=${encodeURIComponent(
					currBankAccount.transferAmount ? currBankAccount.transferAmount : ''
				)}&` +
				`bankName=${encodeURIComponent(currBankAccount.bankName ? currBankAccount.bankName : '')}&` +
				`bankAccountName=${encodeURIComponent(
					currBankAccount.bankAccountName ? currBankAccount.bankAccountName : ''
				)}&` +
				`bankAccountNumber=${encodeURIComponent(
					currBankAccount.bankAccountNumber ? currBankAccount.bankAccountNumber : ''
				)}&` +
				`bankProvince=${encodeURIComponent(
					currBankAccount.bankProvince ? currBankAccount.bankProvince : ''
				)}&` +
				`bankCity=${encodeURIComponent(currBankAccount.bankCity ? currBankAccount.bankCity : '')}&` +
				`bankBranch=${encodeURIComponent(currBankAccount.bankBranch ? currBankAccount.bankBranch : '')}&` +
				`pgRemark=${encodeURIComponent(currBankAccount.pgRemark ? currBankAccount.pgRemark : '')}`;

			let newUrl = `${location.origin}/vn/mobile/Deposit/DetailsInfo?data=${this.encrypt(data)}`;
			console.log('-------------------------->', newUrl);
			QRCode.toDataURL(newUrl, opts, function(err, url) {
				if (err) throw err;
				var img = document.getElementById('Qrcode');
				img.src = url;
			});
		}
	}

	/**
	 * @description: 加密
	 * @param {*} str
	 * @return {*}
  	*/

	encrypt(str) {
		const wordArray = CryptoJS.enc.Utf8.parse(str);
		const base64 = CryptoJS.enc.Base64.stringify(wordArray);

		return base64;
	}

	setAllOtherCopyIconsUnclicked = (thisRef) => {
		this.copyRefs.map((item) => {
			if (item !== thisRef) {
				item.current && item.current.setNotCopied();
			}
		});
	};

	render() {
		const { currBankAccount } = this.props;
		console.log(this.state.qrUrl);
		return (
			<React.Fragment>
				<div className="form-wrap ppb-step2-info">
					<div className="modal-prompt-info">
						请在{' '}
						<span className="ppb-count-down">
							{this.props.countDownMinute}:{this.props.countDownSecond}
						</span>{' '}
						分钟内完成支付和点击“我已经成功存款”
					</div>
					<div className="ppb-deposit-amount-container">
						<div className="ppb-deposit-amount-wrapper">
							<span className="ppb-deposit-amount-flag">￥</span>
							<span className="ppb-deposit-amount">{this.props.depositMoney}</span>
							<Copy2
								ref={this.copyRefs[0]}
								onCopyIconClicked={() => {
									this.setAllOtherCopyIconsUnclicked(this.copyRefs[0]);
								}}
								targetText={this.props.depositMoney}
							/>
						</div>
						<div className="ppb-deposit-amount-desc">请依照上方显示的金额进行转账</div>
					</div>
					<div className="sport-deposit-receipt">
						<ul>
							<li className="item-wrap" style={{ paddingTop: '17px' }}>
								<span className="item-label">银行名称</span>
								<span className="item-content">
									{currBankAccount && currBankAccount.bankName}
									<Copy2
										ref={this.copyRefs[1]}
										onCopyIconClicked={() => {
											this.setAllOtherCopyIconsUnclicked(this.copyRefs[1]);
										}}
										targetText={currBankAccount && currBankAccount.bankName}
									/>
								</span>
							</li>
							<li className="item-wrap">
								<span className="item-label">账号</span>
								<span className="item-content">
									{currBankAccount && currBankAccount.bankAccountNumber}
									<Copy2
										ref={this.copyRefs[2]}
										onCopyIconClicked={() => {
											this.setAllOtherCopyIconsUnclicked(this.copyRefs[2]);
										}}
										targetText={currBankAccount && currBankAccount.bankAccountNumber}
									/>
								</span>
							</li>
							<li className="item-wrap">
								<span className="item-label">账户名称</span>
								<span className="item-content">
									{currBankAccount && currBankAccount.bankAccountName}
									<Copy2
										ref={this.copyRefs[3]}
										onCopyIconClicked={() => {
											this.setAllOtherCopyIconsUnclicked(this.copyRefs[3]);
										}}
										targetText={currBankAccount && currBankAccount.bankAccountName}
									/>
								</span>
							</li>
							{currBankAccount &&
							currBankAccount.bankProvince &&
							currBankAccount.bankProvince !== '' && (
								<li className="item-wrap">
									<span className="item-label">省/自治区</span>
									<span className="item-content">
										{currBankAccount.bankProvince}
										<Copy2
											ref={this.copyRefs[4]}
											onCopyIconClicked={() => {
												this.setAllOtherCopyIconsUnclicked(this.copyRefs[4]);
											}}
											targetText={currBankAccount.bankProvince}
										/>
									</span>
								</li>
							)}
							{currBankAccount &&
							currBankAccount.bankCity &&
							currBankAccount.bankCity !== '' && (
								<li className="item-wrap">
									<span className="item-label">城市/城镇</span>
									<span className="item-content">
										{currBankAccount.bankCity}
										<Copy2
											ref={this.copyRefs[5]}
											onCopyIconClicked={() => {
												this.setAllOtherCopyIconsUnclicked(this.copyRefs[5]);
											}}
											targetText={currBankAccount.bankCity}
										/>
									</span>
								</li>
							)}
							{currBankAccount &&
							currBankAccount.bankBranch &&
							currBankAccount.bankBranch !== '' && (
								<li className="item-wrap">
									<span className="item-label">分行</span>
									<span className="item-content">
										{currBankAccount.bankBranch}
										<Copy2
											ref={this.copyRefs[6]}
											onCopyIconClicked={() => {
												this.setAllOtherCopyIconsUnclicked(this.copyRefs[6]);
											}}
											targetText={currBankAccount.bankBranch}
										/>
									</span>
								</li>
							)}
							{currBankAccount &&
							currBankAccount.pgRemark && (
								<li className="item-wrap">
									<span className="item-label">附言/备注</span>
									<span className="item-content">
										{(currBankAccount && currBankAccount.pgRemark) || ''}
										<Copy2
											ref={this.copyRefs[7]}
											onCopyIconClicked={() => {
												this.setAllOtherCopyIconsUnclicked(this.copyRefs[7]);
											}}
											targetText={(currBankAccount && currBankAccount.pgRemark) || ''}
										/>
									</span>
								</li>
							)}
						</ul>
					</div>
					{currBankAccount &&
					currBankAccount.pgRemark && (
						<div className="ppb-deposit-notice">转账前请仔细核对以上所有信息，如有要求填写【附言】或【备注】，请务必填写，否则存款将无法到账。</div>
					)}
				</div>

				<div className="form-wrap ppb-step2-qr">
					<div className="ppb-qrcode-desc">您可以扫码查询银行账号和进行支付：</div>
					<div className="ppb-qrcode-wrapper">
						{/* <QRCode size={200} value={this.state.qrUrl} /> */}
						<img
							id="Qrcode"
							style={{ display: 'block', margin: '0 auto', width: '200px', height: '200px' }}
						/>
					</div>
				</div>

				<div style={{ marginTop: '16px' }}>
					<div className="btn-wrap ppb-step2-button">
						<Button
							size="large"
							type="primary"
							onClick={() => {
								this.props.goToStep3();
							}}
						>
							我已经成功存款
						</Button>
					</div>
				</div>
			</React.Fragment>
		);
	}
}
export default SecondStep;

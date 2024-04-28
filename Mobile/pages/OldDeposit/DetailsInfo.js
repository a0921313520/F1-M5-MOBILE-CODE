import React from 'react';
import Copy2 from '@/components/Deposit/depositComponents/Copy/copy2';
import { getUrlVars } from '@/lib/js/Helper';
import CryptoJS from 'crypto-js';
import moment from 'moment';
import Layout from '@/components/Layout';
import ReactIMG from '@/components/View/ReactIMG';
const padLeft = (str, length) => {
	if (str.length >= length) return str;
	else return padLeft('0' + str, length);
};
class DetailsInfo extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currBankAccount: {
				bankName: '--',
				bankAccountNumber: '--',
				bankAccountName: '--',
				bankProvince: '--',
				bankCity: '--',
				bankBranch: '--',
				pgRemark: '--',
				transferAmount: 0
			}
		};
		this.copyRefs = [];
		for (let i = 0; i < 8; i++) {
			this.copyRefs[i] = React.createRef();
		}
	}
	componentDidMount() {
		let data = getUrlVars()['data'];
		let newData = this.decrypt(data);
		let textArr = this.getUrlData(newData);
		let timeOutSec = textArr['timeOutSec'];
		let submittedAt = this.decode(textArr['submittedAt']);
		let transferAmount = this.decode(textArr['transferAmount']);
		let bankName = this.decode(textArr['bankName']);
		let bankAccountName = this.decode(textArr['bankAccountName']);
		let bankAccountNumber = this.decode(textArr['bankAccountNumber']);
		let bankProvince = this.decode(textArr['bankProvince']);
		let bankCity = this.decode(textArr['bankCity']);
		let bankBranch = this.decode(textArr['bankBranch']);
		let pgRemark = this.decode(textArr['pgRemark']);
		let Urldata = {
			bankName: bankName,
			bankAccountNumber: bankAccountNumber,
			bankAccountName: bankAccountName,
			bankProvince: bankProvince,
			bankCity: bankCity,
			bankBranch: bankBranch,
			pgRemark: pgRemark,
			transferAmount: transferAmount
		};
		this.setState({
			currBankAccount: Urldata
		});
		this.countDownCheck(submittedAt, timeOutSec);
	}

	componentWillUnmount() {
		this.clearTimeouts();
	}

	countDownCheck(submittedAt, timeOutSec) {
		console.log(submittedAt);
		let submitTime = moment(new Date(submittedAt));
		let targetTime = submitTime.clone().add(timeOutSec, 'seconds');
		const diffSeconds = targetTime.diff(moment(), 'seconds');
		if (diffSeconds > 0) {
			this.countDownTickerHandle = setInterval(() => {
				this.countDown(targetTime);
			}, 1000); //啟動倒計時每秒更新
			//打開彈窗並更新剩餘時間
			const duration = moment.duration(diffSeconds, 'seconds');
			this.setState({
				countDownMinute: padLeft(duration.minutes() + '', 2),
				countDownSecond: padLeft(duration.seconds() + '', 2)
			});
		} else {
			this.setState({ ModalTimeoutOpen: true });
		}
	}

	countDown = (targetTime) => {
		const diffSeconds = targetTime.diff(moment(), 'seconds');
		if (diffSeconds <= 0) {
			this.setState({ ModalTimeoutOpen: true });
			this.clearTimeouts();
		} else {
			const duration = moment.duration(diffSeconds, 'seconds');
			this.setState({
				countDownMinute: padLeft(duration.minutes() + '', 2),
				countDownSecond: padLeft(duration.seconds() + '', 2)
			});
		}
	};

	//清理定時器
	clearTimeouts = () => {
		if (this.countDownTickerHandle) {
			clearInterval(this.countDownTickerHandle);
		}
	};

	setAllOtherCopyIconsUnclicked = (thisRef) => {
		this.copyRefs.map((item) => {
			if (item !== thisRef) {
				item.current && item.current.setNotCopied();
			}
		});
	};

	getUrlData = (str) => {
		var vars = [],
			hash;
		var hashes = str.split('&');
		for (var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			if (hash[1]) {
				vars.push(hash[0]);
				vars[hash[0]] = hash[1].split('#')[0];
			}
		}
		return vars;
	};

	//解密
	decrypt(text) {
		const parsedWordArray = CryptoJS.enc.Base64.parse(text);
		const parsedStr = parsedWordArray.toString(CryptoJS.enc.Utf8);
		return parsedStr;
	}

	decode = (text) => {
		return text ? decodeURIComponent(text) : '';
	};

	render() {
		const { currBankAccount, countDownMinute, countDownSecond, ModalTimeoutOpen } = this.state;

		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				status={2}
				hasServer={true}
				BarTitle={'账户信息'}
				hideBack={true}
			>
				{!ModalTimeoutOpen && (
					<React.Fragment>
						<div className="form-wrap ppb-step2-info DetailsPageInfo">
							<div className="modal-prompt-info">
								请在{' '}
								<span className="ppb-count-down">
									{countDownMinute}:{countDownSecond}
								</span>{' '}
								分钟内完成支付和点击“我已经成功存款”
							</div>
							<div className="ppb-deposit-amount-container">
								<div className="ppb-deposit-amount-wrapper">
									<span className="ppb-deposit-amount-flag">￥</span>
									<span className="ppb-deposit-amount">
										{currBankAccount && currBankAccount.transferAmount}
									</span>
									<Copy2
										ref={this.copyRefs[0]}
										onCopyIconClicked={() => {
											this.setAllOtherCopyIconsUnclicked(this.copyRefs[0]);
										}}
										targetText={currBankAccount && currBankAccount.transferAmount}
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
												{currBankAccount.pgRemark}
												<Copy2
													ref={this.copyRefs[7]}
													onCopyIconClicked={() => {
														this.setAllOtherCopyIconsUnclicked(this.copyRefs[7]);
													}}
													targetText={currBankAccount.pgRemark}
												/>
											</span>
										</li>
									)}
								</ul>
							</div>
							{currBankAccount &&
							currBankAccount.pgRemark && (
								<div className="ppb-deposit-notice">
									转账前请仔细核对以上所有信息，如有要求填写【附言】或【备注】，请务必填写，否则存款将无法到账。
								</div>
							)}
						</div>
						<div className="deposit-help-wrap">
							<h4>乐天使温馨提醒：</h4>
							<ul>
								<li>转账时必须按照系统产生的银行账号和金额进行支付，并且建议您上传存款凭证，以利及时到账。</li>
								<li>收款账户不接受【微信】、【支付宝】及【云闪付】等APP转账，以上方式将导致存款无法到账。</li>
								<li>银行账号会不定期更换，请确保您使用的是存款页面上最新的账号，再进行转账。</li>
								<li>如有任何问题请联系在线客服。</li>
							</ul>
						</div>
					</React.Fragment>
				)}
				{ModalTimeoutOpen && (
					<div className="form-wrap ppb-step2-info DetailsPageInfo ">
						<div className="EndInfo">
							<ReactIMG src="/img/verify/warn.png" />
							<b>温馨提示</b>
							<center>抱歉，该账户信息已超时，请关闭此页面。若您已完成支付，请前往乐天堂交易记录查看交易状态。若您未完成支付，请重新提交存款，谢谢！</center>
						</div>
					</div>
				)}
			</Layout>
		);
	}
}
export default DetailsInfo;

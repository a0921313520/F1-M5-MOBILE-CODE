import React from 'react';
import QRCode from 'qrcode-react';
import { createForm } from 'rc-form';
import Button from '@/components/View/Button';
import Input from '@/components/View/Input';
import { Cookie, dateFormat } from '@/lib/js/util';
import Toast from '@/components/View/Toast';
import Item from './../Item';
import { Fragment } from 'react';
import Copy from '../Copy';
import { CommonPostConfirmPay } from '@/api/wallet';

class SecondStep extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.copySuccessCall = this.copySuccessCall.bind(this);
	}
	componentDidMount() {}
	componentDidUpdate(prevProps, prevState) {}
	goThirdStep = (e) => {
		e.preventDefault();

		let hide = null;
		const sucessRun = (status) => {
			if (status) {
				// Cookie("isWCThird", "true", {expires: 15});
				this.props.form.resetFields();
				this.props.setLbStep(3);
			}

			hide();
		};
		const { res } = this.props.resultData;
		this.props.form.validateFields((err, values) => {
			if (!err) {
				hide = Toast.loading();
				let postOtherInfo = { transactionId: res.transactionId };
				CommonPostConfirmPay(postOtherInfo, (res) => {
					sucessRun(res.isSuccess);
				});
			}
		});

		// Pushgtagdata('Depositsuccess_wechatSmilepay_deposit');
	};
	goBackStep = (e) => {
		e && typeof e !== 'string' && e.preventDefault();

		this.props.setLbStep(1);
		// Pushgtagdata('Close_onlinewechat_deposit');
		// e !== "notClear" && this.props.form.resetFields();
	};
	copySuccessCall() {
		Toast.info('已复制');
		// Pushgtagdata('Copy_onlinewechat_deposit');
	}
	render() {
		const { res } = this.props.resultData;
		//console.log(res);
		return (
			<div className={`form-wrap`} style={{ display: this.props.lbStep === 2 ? 'block' : 'none' }}>
				<div className="sport-deposit-receipt ctc-pay-receipt">
					{res ? (
						<Fragment>
							<ul>
								<li className="item-wrap" style={{ alignItems: 'flex-start' }}>
									<span className="item-label">二维码</span>
									<QRCode size={160} value={res.qrDeepLink} />
								</li>
								<li className="item-wrap">
									<span className="item-label">存款金额</span>
									<span className="item-content" style={{ color: '#000' }}>
										<span style={{ fontSize: '14px' }}>￥</span>
										<span style={{ fontSize: '20px' }}>{res.uniqueAmount}</span>
										<Copy targetText={res.uniqueAmount} />
									</span>
								</li>
								<li className="item-wrap">
									<span className="item-label">备注</span>
									<span className="item-content" style={{ color: '#000' }}>
										<span style={{ fontSize: '20px' }}>
											{res.transactionId.substring(res.transactionId.length - 6)}
										</span>
										<Copy targetText={res.transactionId.substring(res.transactionId.length - 6)} />
									</span>
									<div className="input-info-message">请务必于微信App交易页面填写备注代码​</div>
								</li>
							</ul>
						</Fragment>
					) : null}
				</div>
				<div gutter={20}>
					<div span={12}>
						<Button size="large" type="primary" onClick={this.goThirdStep}>
							我已经成功存款
						</Button>
					</div>
				</div>
			</div>
		);
	}
}
export default createForm({ fieldNameProp: 'WCsecondstep' })(SecondStep);

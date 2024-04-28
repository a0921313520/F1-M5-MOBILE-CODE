import React from "react";
import Layout from '$SBTWO/Layout'
import Button from "$SBTWO/Button"
import Input from "$SBTWO/Input"
import Toast from '$SBTWO/Toast'
import Router from 'next/router'
import { withBetterRouter } from '$SBTWOLIB/js/withBetterRouter';
import { fetchRequest } from '$SBTWOLIB/SportRequest'
import { ApiPort } from '$SBTWOLIB/SPORTAPI'
import ReactIMG from '$SBTWO/ReactIMG';

class FastMoney extends React.PureComponent {
	constructor(props) {
		super(props);
		this.defaultCurrency = this.props.router && this.props.router.query && this.props.router.query.currency ? this.props.router.query.currency.split(",") : 0;
		this.state = {
			amount1: this.defaultCurrency && this.defaultCurrency[0],
			amount2: this.defaultCurrency && this.defaultCurrency[1],
			amount3: this.defaultCurrency && this.defaultCurrency[2],
		};

		this.simpleRequest = {};
		this.onChangeVal = this.onChangeVal.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
	}
	componentDidMount () {
		Toast.loading();

		fetchRequest(`${ApiPort.GetMemberNotificationSetting}`, "GET").then((res) => {
			Toast.destroy();
			if(res.result){
				const notificationSetting = res.result.notificationSetting;
				this.simpleRequest = notificationSetting;
				this.setState({
					amount1: notificationSetting.amount1,
					amount2: notificationSetting.amount2,
					amount3: notificationSetting.amount3,
				})
			}
		
		});


	}
	onChangeVal (v, type) {
		const parseVal = parseFloat(v);
		parseVal < 10 && Toast.error("最低金额是￥10");
		parseVal > 99999 && Toast.error("最高金额是￥99,999");
		this.setState({[type]: parseVal});
	}
	onSubmit () {
		const {amount1, amount2, amount3} = this.state;
		const val1 = parseInt(amount1), val2 = parseInt(amount2), val3 = parseInt(amount3);
		if (val1 < 10 || val2 < 10 || val3 < 10) {
			Toast.error("最低金额是￥10");
			return;
		}
		if (val1 > 99999 || val2 > 99999 || val3 > 99999) {
			Toast.error("最高金额是￥99,999");
			return;
		}
		if (val1 < val2 || val1 < val3) {
			Toast.error("快捷金额1必须大于快捷金额2和快捷金额3");
			return;
		}
		if (val2 > val1 || val2 < val3) {
			Toast.error("快捷金额2必须小于快捷金额1且大于快捷金额3");
			return;
		}
		if (val3 > val1 || val3 > val2) {
			Toast.error("快捷金额3必须小于快捷金额1和快捷金额2");
			return;
		}
		Toast.loading();
		const updateData = {
			amount1: amount1,
			amount2: amount2,
			amount3: amount3,
			oddsType: this.simpleRequest.oddsType,
			alwaysAcceptBetterOdds: this.simpleRequest.alwaysAcceptBetterOdds,
			betSlipVibration: this.simpleRequest.betSlipVibration,
			betSlipSound: this.simpleRequest.betSlipSound,
			goalNotification: this.simpleRequest.goalNotification,
			goalMyFavorite: this.simpleRequest.goalMyFavorite,
			goalIBet: this.simpleRequest.goalIBet,
			goalAllRB: this.simpleRequest.goalAllRB,
			goalSound: this.simpleRequest.goalSound,
			goalSoundType: this.simpleRequest.goalSoundType,
			goalVibration: this.simpleRequest.goalVibration,
			listDisplayType: this.simpleRequest.listDisplayType ?? 1,
		};

		fetchRequest(ApiPort.EditMemberNotificationSetting, "POST", updateData)
			.then((res) => {
				Toast.destroy();
				if (res.isSuccess == true) {
					//更新緩存
					localStorage.setItem('NotificationSetting-' + res.result.memberCode, JSON.stringify(updateData));
					Toast.success("成功保存");
				}
			}).catch((err) => {
				Toast.destroy();
				console.log(err)
			});
		// Pushgtagdata(`Game Feature`, 'Submit', `Setting_BetAmount_SB2.0`);
	}
	render() {
		return (
			<Layout
				status={10}
                BarTitle="自定义快捷金额"
			>
				<div className="common-distance fast-momey">
					<div>
						<ReactIMG src="/img/setting-event.png" />
					</div>
					<div className="fast-set-content">
						<ul className="fast-set-list">
							<li>
								<div>
									<span>金额1</span>
								</div>
								<div>
									<Input
										type="text"
										maxLength={5}
										onChange={({target: {value: v}}) => {this.onChangeVal(v, 'amount1')}}
										value={this.state.amount1}
									/>
								</div>
							</li>
							<li>
								<div>
									<span>金额2</span>
								</div>
								<div>
									<Input
										type="text"
										maxLength={5}
										onChange={({target: {value: v}}) => {
											this.onChangeVal(v, 'amount2')
										}}
										value={this.state.amount2}
									/>
								</div>
							</li>
							<li>
								<div>
									<span>金额3</span>
								</div>
								<div>
									<Input
										type="text"
										maxLength={5}
										onChange={({target: {value: v}}) => {this.onChangeVal(v, 'amount3')}}
										value={this.state.amount3}
									/>
								</div>
							</li>
						</ul>
						<p>最低:￥10 最高:￥99,999</p>
					</div>
					<Button onClick={this.onSubmit}>保存</Button>
				</div>
			</Layout>
		);
	}
}

export default withBetterRouter(FastMoney)

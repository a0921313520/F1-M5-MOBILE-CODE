import React from "react";
import Layout from '$SBTWO/Layout';
import Switch from '$SBTWO/SwitchUi';
import { ReactSVG } from '$SBTWO/ReactSVG';
import Router from 'next/router';
import { fetchRequest } from '$SBTWOLIB/SportRequest';
import { ApiPort } from '$SBTWOLIB/SPORTAPI';
import oddsTypeData from '$SBTWOLIB/data/odds.type.static';
import Toast from '$SBTWO/Toast';

export default class System extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			alwaysAcceptBetterOdds: true,
			betSlipSound: false,
			betSlipVibration: false,
			oddValue: ''
		};

		this.simpleRequest = {};
		this.defaultBetCurrency = [ 0, 0, 0 ];
		this.onSubmit = this.onSubmit.bind(this);
	}
	componentDidMount() {
		Toast.loading();

		fetchRequest(`${ApiPort.GetMemberNotificationSetting}`, 'GET').then((res) => {
			Toast.destroy();
			//console.log('GetMemberNotificationSetting', res);
			if(res.result){
				const notificationSetting = res.result.notificationSetting;
				this.simpleRequest = notificationSetting;
				this.defaultBetCurrency = [
					notificationSetting.amount1,
					notificationSetting.amount2,
					notificationSetting.amount3
				];
				this.setState({
					oddValue: notificationSetting.oddsType,
					alwaysAcceptBetterOdds: notificationSetting.alwaysAcceptBetterOdds,
					betSlipVibration: notificationSetting.betSlipVibration,
					betSlipSound: notificationSetting.betSlipSound
				});
			}
		
		});

	}
	onSubmit(assign) {
		Toast.loading();
		let updateData = {
			amount1: this.simpleRequest.amount1,
			amount2: this.simpleRequest.amount2,
			amount3: this.simpleRequest.amount3,
			oddsType: this.simpleRequest.oddsType,
			alwaysAcceptBetterOdds: this.state.alwaysAcceptBetterOdds,
			betSlipVibration: this.state.betSlipVibration,
			betSlipSound: this.state.betSlipSound,
			goalNotification: this.simpleRequest.goalNotification,
			goalMyFavorite: this.simpleRequest.goalMyFavorite,
			goalIBet: this.simpleRequest.goalIBet,
			goalAllRB: this.simpleRequest.goalAllRB,
			goalSound: this.simpleRequest.goalSound,
			goalSoundType: this.simpleRequest.goalSoundType,
			goalVibration: this.simpleRequest.goalVibration,
			listDisplayType: this.simpleRequest.listDisplayType ?? 1,
		};

		updateData = Object.assign(updateData,assign);

		fetchRequest(ApiPort.EditMemberNotificationSetting, 'POST', updateData)
			.then((res) => {
				Toast.destroy();
				if (res.isSuccess == true) {
					//更新緩存
					localStorage.setItem('NotificationSetting-' + res.result.memberCode, JSON.stringify(updateData));
					this.setState(assign);
				}
			})
			.catch((err) => {
				Toast.destroy();
				console.log(err);
			});
	}
	handleChange_alwaysAcceptBetterOdds = (v) => {
		this.onSubmit({ alwaysAcceptBetterOdds: v });
	};
	handleChange_betSlipSound = (v) => {
		this.onSubmit({ betSlipSound: v });
	};
	handleChange_betSlipVibration = (v) => {
		this.onSubmit({ betSlipVibration: v });
	};
	render() {
		return (
			<Layout status={10} BarTitle="系统设置">
				<ul className="s-list">
					<li
						className="s-item"
						onClick={() => {
							Router.push('/sbtwo/setting/handicap');
						}}
					>
						<div>盘口设置</div>
						<div>
							<span>
								{this.state.oddValue ? (
									oddsTypeData.find((val) => val.value === this.state.oddValue).name
								) : (
									''
								)}
							</span>
							<ReactSVG src="/img/svg/RightArrow.svg" />
						</div>
					</li>
					<li className="s-item" disabled>
						<div>自动接受更好的赔率</div>
						<div>
							<Switch
								uncheckedIcon={false}
								checkedIcon={false}
								onChange={this.handleChange_alwaysAcceptBetterOdds}
								checked={this.state.alwaysAcceptBetterOdds}
								className="sport-switch"
								activeBoxShadow="0 0 2px 3px #ddd"
							/>
						</div>
					</li>
				</ul>
				<ul className="s-list">
					<li className="s-item" disabled>
						<div>震动</div>
						<div>
							<span>注单震动提醒</span>
							<Switch
								uncheckedIcon={false}
								checkedIcon={false}
								onChange={this.handleChange_betSlipVibration}
								checked={this.state.betSlipVibration}
								className="sport-switch"
								activeBoxShadow="0 0 2px 3px #ddd"
							/>
						</div>
					</li>
					<li className="s-item" disabled>
						<div>提示音</div>
						<div>
							<span>注单提示音</span>
							<Switch
								uncheckedIcon={false}
								checkedIcon={false}
								onChange={this.handleChange_betSlipSound}
								checked={this.state.betSlipSound}
								className="sport-switch"
								activeBoxShadow="0 0 2px 3px #ddd"
							/>
						</div>
					</li>
				</ul>
				{/* <ul className="s-list">
					<li className="s-item" onClick={() => {Router.push("/sbtwo/setting/race-filter")}}>
						<div>联赛筛选</div>
						<div>
							<ReactSVG src="/svg/RightArrow.svg" />
						</div>
					</li>
					<li className="s-item" onClick={() => {Router.push("/sbtwo/setting/team-filter")}}>
						<div>队伍筛选</div>
						<div>
							<ReactSVG src="/svg/RightArrow.svg" />
						</div>
					</li>
				</ul> */}
				<ul className="s-list">
					<li
						className="s-item"
						onClick={() => {
							Router.push({
								asPath: '/sbtwo/setting/fast-money',
								pathname: '/sbtwo/setting/fast-money',
								query: { currency: this.defaultBetCurrency.toString() }
							});
						}}
					>
						<div>自定义快捷金额</div>
						<div>
							<ReactSVG src="/img/svg/RightArrow.svg" />
						</div>
					</li>
				</ul>
			</Layout>
		);
	}
}

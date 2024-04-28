import React from "react";
import Layout from '$SBTWO/Layout'
import Switch from "$SBTWO/SwitchUi"
import { ReactSVG } from '$SBTWO/ReactSVG'
import Router from 'next/router';
import { fetchRequest } from '$SBTWOLIB/SportRequest';
import { ApiPort } from '$SBTWOLIB/SPORTAPI';
import Toast from '$SBTWO/Toast';

export default class Push extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			goalNotification: true,
			goalMyFavorite: true,
			goalIBet: true,
			goalAllRB: false,
			goalSound: true,
			goalSoundType: 1,
			goalVibration: true
		};

		this.simpleRequest = {};
		this.onSubmit = this.onSubmit.bind(this);
	}
	componentDidMount () {
		Toast.loading();

		fetchRequest(`${ApiPort.GetMemberNotificationSetting}`, "GET").then((res) => {
			Toast.destroy();
			//console.log('GetMemberNotificationSetting', res)
			if(res.result){
				const notificationSetting = res.result.notificationSetting;
				this.simpleRequest = notificationSetting;
				this.setState({
					goalNotification: notificationSetting.goalNotification,
					goalMyFavorite: notificationSetting.goalMyFavorite,
					goalIBet: notificationSetting.goalIBet,
					goalAllRB: notificationSetting.goalAllRB,
					goalSound: notificationSetting.goalSound,
					goalSoundType: notificationSetting.goalSoundType,
					goalVibration: notificationSetting.goalVibration
				})
			}
			
		});


	}
	onSubmit (assign) {
		Toast.loading();
		let updateData = {
			amount1: this.simpleRequest.amount1,
			amount2: this.simpleRequest.amount2,
			amount3: this.simpleRequest.amount3,
			oddsType: this.simpleRequest.oddsType,
			alwaysAcceptBetterOdds: this.simpleRequest.alwaysAcceptBetterOdds,
			betSlipVibration: this.simpleRequest.betSlipVibration,
			betSlipSound: this.simpleRequest.betSlipSound,
			goalNotification: this.state.goalNotification,
			goalMyFavorite: this.state.goalMyFavorite,
			goalIBet: this.state.goalIBet,
			goalAllRB: this.state.goalAllRB,
			goalSound: this.state.goalSound,
			goalSoundType: this.state.goalSoundType,
			goalVibration: this.state.goalVibration,
			listDisplayType: this.simpleRequest.listDisplayType ?? 1,
		};

		updateData = Object.assign(updateData,assign);

		fetchRequest(ApiPort.EditMemberNotificationSetting, "POST", updateData)
			.then((res) => {
				Toast.destroy();
				if (res.isSuccess == true) {
					//更新緩存
					localStorage.setItem('NotificationSetting-' + res.result.memberCode, JSON.stringify(updateData));
					this.setState(assign);
				}
			}).catch((err) => {
				Toast.destroy();
				console.log(err)
			});
	}
	handleChange_goalNotification = (v) => {
		this.onSubmit({goalNotification: v});
	}
	handleChange_goalMyFavorite = (v) => {
		this.onSubmit({goalMyFavorite: v})
	}
	handleChange_goalIBet = (v) => {
		this.onSubmit({goalIBet: v})
	}
	handleChange_goalAllRB = (v) => {
		this.onSubmit({goalAllRB: v})
	}
	handleChange_goalSound = (v) => {
		this.onSubmit({goalSound: v})
	}
	handleChange_goalSoundType = (v) => {
		this.onSubmit({goalSoundType: v})
	}
	handleChange_goalVibration = (v) => {
		this.onSubmit({goalVibration: v})
	}
	render() {
		const { goalNotification, goalMyFavorite, goalIBet, goalAllRB, goalSound, goalSoundType, goalVibration } = this.state;
		return (
			<Layout
                status={10}
                BarTitle="推送设置"
			>
				<div className="push-setting">
					<ul className="s-list s-list-title-1 border-bottom">
						<li className="s-item" disabled>
							<div>进球推送</div>
							<div>
								<Switch
									uncheckedIcon={false}
									checkedIcon={false}
									onChange={this.handleChange_goalNotification}
									checked={goalNotification}
									className="sport-switch"
									activeBoxShadow="0 0 2px 3px #ddd"
								/>
							</div>
						</li>
					</ul>
					<ul className="s-list padding-2">
						<li className="s-item" disabled onClick={() => {this.handleChange_goalMyFavorite(!this.state.goalMyFavorite)}}>
							<div>我收藏的赛事</div>
							<div className={`${!goalNotification ? "" : (!goalMyFavorite ? "" : " curr")}`}>
								<ReactSVG className="s-item-check" src="/img/svg/Success.svg" />
							</div>
						</li>
						<li className="s-item" disabled onClick={() => {this.handleChange_goalIBet(!this.state.goalIBet)}}>
							<div>我投注的赛事</div>
							<div className={`${!goalNotification ? "" : (!goalIBet ? "" : " curr")}`}>
								<ReactSVG className="s-item-check" src="/img/svg/Success.svg" />
							</div>
						</li>
						<li className="s-item" disabled onClick={() => {this.handleChange_goalAllRB(!this.state.goalAllRB)}}>
							<div>全部滚球</div>
							<div className={`${!goalNotification ? "" : (!goalAllRB ? "" : " curr")}`}>
								<ReactSVG className="s-item-check" src="/img/svg/Success.svg" />
							</div>
						</li>
					</ul>
					<ul className="s-list s-list-title-2 padding-3">
						<li className="s-item" disabled>
							<div>声音</div>
							<div>
								<Switch
									uncheckedIcon={false}
									checkedIcon={false}
									onChange={this.handleChange_goalSound}
									checked={goalNotification && goalSound}
									className="sport-switch"
									activeBoxShadow="0 0 2px 3px #ddd"
								/>
							</div>
						</li>
					</ul>
					{/*<ul className="cap-list padding-4">*/}
					{/*	<li className="cap-item" disabled onClick={() => {this.handleChange_goalSoundType(this.state.goalSoundType === 1 ? 2 : 1)}}>*/}
					{/*		<div>欢呼声</div>*/}
					{/*		<div className={`cap-item-circle${!goalNotification || !goalSound ? "" : (goalSoundType !== 1 ? "" : " curr")}`}></div>*/}
					{/*	</li>*/}
					{/*	<li className="cap-item" disabled onClick={() => {this.handleChange_goalSoundType(this.state.goalSoundType === 2 ? 1 : 2)}}>*/}
					{/*		<div>哨声</div>*/}
					{/*		<div className={`cap-item-circle${!goalNotification || !goalSound ? "" : (goalSoundType !== 2 ? "" : " curr")}`}></div>*/}
					{/*	</li>*/}
					{/*</ul>*/}
					<ul className="s-list s-list-title-2 padding-3">
						<li className="s-item" disabled>
							<div>震动</div>
							<div>
								<Switch
									uncheckedIcon={false}
									checkedIcon={false}
									onChange={this.handleChange_goalVibration}
									checked={goalNotification && goalVibration}
									className="sport-switch"
									activeBoxShadow="0 0 2px 3px #ddd"
								/>
							</div>
						</li>
					</ul>
				</div>
			</Layout>
		);
	}
}

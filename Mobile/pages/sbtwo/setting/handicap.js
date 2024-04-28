/*
 * @Author: Alan
 * @Date: 2022-10-28 13:49:32
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-29 13:08:42
 * @Description: 盘口
 * @FilePath: \Mobile\pages\sbtwo\setting\handicap.js
 */
import React from "react";
import Layout from '$SBTWO/Layout'
import Switch from "$SBTWO/SwitchUi"
import { ReactSVG } from '$SBTWO/ReactSVG'
import HandicapList from '$SBTWOLIB/data/odds.type.static'
import { fetchRequest } from '$SBTWOLIB/SportRequest'
import { ApiPort } from '$SBTWOLIB/SPORTAPI'
import Toast from '$SBTWO/Toast'

export default class Handicap extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			currentChecked: HandicapList[0].value
		};

		this.simpleRequest = {};
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
					currentChecked: notificationSetting.oddsType,
				})
			}
		
		});


	}
	onSubmit (v) {
		Toast.loading();
		const updateData = {
			amount1: this.simpleRequest.amount1,
			amount2: this.simpleRequest.amount2,
			amount3: this.simpleRequest.amount3,
			oddsType: v,
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
					this.setState({currentChecked: v})
				}
			}).catch((err) => {
				Toast.destroy();
				console.log(err)
			});
	}
	render() {
		return (
			<Layout
                status={10}
                BarTitle="盘口设置"
			>
				<ul className="cap-list">
					{HandicapList.map((val, idx) => {
						return <li className="cap-item" key={idx} onClick={() => {this.onSubmit(val.value)}}>
							<div>{val.name}</div>
							<div className={`cap-item-circle${val.value === this.state.currentChecked ? " curr" : ""}`}></div>
						</li>
					})}
				</ul>
			</Layout>
		);
	}
}

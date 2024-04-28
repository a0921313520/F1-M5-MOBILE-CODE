import React from "react";
import Layout from '$SBTWO/Layout';
import Toast from '$SBTWO/Toast';
import Router from 'next/router';
import { withBetterRouter } from '$SBTWOLIB/js/withBetterRouter';
import { ApiPort } from "$SBTWOLIB/SPORTAPI";
import { fetchRequest } from '$SBTWOLIB/SportRequest';
import moment from 'moment';

class NotificationDetail extends React.PureComponent {
	static getInitialProps({ query,pathname }) {
		return { query,pathname };
	}
	constructor(props) {
		super(props);
		this.state = {
			detailData: null
		}
	}
	componentDidMount() {
		this.getDetail();
	}
	getDetail = () => {
		let id, type;
		if (this.props.router && this.props.router.query.id && this.props.router.query.type) {
			id = this.props.router.query.id;
			type = this.props.router.query.type;
		} else {
			return;
		}
        const fetchurl = ApiPort.GetMessageDetail + "?MessageID=" + id + "&";
        Toast.loading();
        fetchRequest(fetchurl, "GET")
            .then((res) => {
                if (res) {
									if (res.PersonalMessage.SendOn
										&& res.PersonalMessage.SendOn.indexOf('T') !== -1
										&& res.PersonalMessage.SendOn.indexOf('Z') === -1) {  //有T沒Z 補Z 並format
										res.PersonalMessage.SendOn = moment(res.PersonalMessage.SendOn + 'Z').format('YYYY-MM-DD HH:mm:ss');
									}

                    this.setState({
                        detailData: res.PersonalMessage,
                    },() => {
                    	this.UpdatePersonalData(res.PersonalMessage);
										});
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                Toast.destroy();
            });
    };

	// 更新消息已读
	UpdatePersonalData = (data) => {
		let fetchData = this.getSingleFetchData(data);
		this.update("Personal", fetchData, data, true);
	};

	getSingleFetchData = (data) => {
		return {
			personalMessageUpdateItem: [
				{
					MessageID: data.MessageID,
					MemberNotificationID: data.MemberNotificationID,
					IsRead: true,
					IsOpen: data.IsOpen,
				},
			],
			actionBy: localStorage.getItem("memberCode"),
			timestamp: new Date().toJSON(),
		};
	};

	update = (type, fetchData, data, isSingle) => {
		let fetchstring = type === "Announcement" ? "Announcement" : "Message";
		fetchRequest(ApiPort[`Update${fetchstring}`], "PATCH", fetchData)
			.then((res) => {
			})
			.catch((error) => {
				console.log(error);
			})
	};

	render() {
		const type= this.props.router ? this.props.router.query : null;
		let layoutStatus = 10; //帶back按鈕
		if (type === "broadcastSBMessage" || type === "privateSBMessage") {
			layoutStatus = 11; //帶back按鈕，點擊是跳到 通知頁
		}

		return (
			<Layout
				status={layoutStatus}
				BarTitle="消息详情"
			>
                {this.state.detailData ? <div className="noti-wrapper">
					<div className="noti-detail-header">
						<h4 className="noti-title">{this.state.detailData.Title || this.state.detailData.Topic || ""}</h4>
						<p className="noti-time">{this.state.detailData.SendOn}</p>
					</div>
					<div className="noti-detail-content">
						{/* <img src="/img/Rectangle.png" /> */}
						<p className="noti-detail-article" dangerouslySetInnerHTML={{
							__html: this.state.detailData.Content,
						}}></p>
						{/* <p className="noti-detail-link">链接：<a href="http://www.tcsports.com.cn/zhongchaotiyu/16279.html">http://www.tcsports.com.cn/zhongchaotiyu/16279.html</a></p> */}
					</div>
					<p className="noti-bottom-sign">情报推荐内容来源于第三方，仅供参考,会员产生输赢与乐天堂无关！</p>
				</div> : null}
			</Layout>
		);
	}
}

export default withBetterRouter(NotificationDetail)

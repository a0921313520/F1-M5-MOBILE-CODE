import React, { Component } from 'react';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import Toast from '@/components/View/Toast';
import Captcha from './Captcha';

class ReactCaptcha extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			attempts: 3,
			apiUrl: 'https://tkscp-captcha.funpo.com:2041/captcha-pro-service'
		};
	}

	componentDidMount() {
		this.props.getCaptchaInfo(this);
	}

	getCaptchaInfo(name) {
		fetchRequest(ApiPort.CaptchaInfo + `username=${name}&`, 'GET')
			.then((data) => {
				if (data.isSuccess) {
					this.setState({
						attempts: data.result.attempts,
						apiUrl: data.result.serviceUrl,
						isEnabled: data.result.isEnabled //是否开启了 滑动验证
					});
				}
			})
			.catch((error) => {
				Toast.error('网络错误，请重试', 3);
				console.log(error);
			});
	}

	componentDidUpdate(prevProps) {
		// 当父组件传入新的图片后，开始渲染
		const {visible, tabKey} = this.props;
		if (prevProps.visible !== visible) {
			if(visible === true){
				this.getChallengeId();
				global.Pushgtagpiwikurl && global.Pushgtagpiwikurl("captcha_code","Register Capcha Verification")
			}else{
				global.Pushgtagpiwikurl && global.Pushgtagpiwikurl(
					`${ tabKey === '1' ? "login" : "register"}`,
					`${ tabKey === '1' ? "Login" : "Register"}`
				)	
			}
		}
	}

	onReload = () => {
		//刷新加载img
		const { apiUrl, challengeUuid } = this.state;
		let fetchData = {
			applicationLanguage: 'vi',
			device: {}
		};

		fetch(`${apiUrl}/api/v1.0/chart/${challengeUuid}`, {
			method: 'POST',
			body: JSON.stringify(fetchData),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((res) => {
				res.json().then((data) => {
					if ([ '10001', '10002', '11001' ].includes(String(data.code))) {
						let keyUri = data.keyUri;
						let chartUri = data.chartUri;
						let shuffleMatrix = data.shuffleMatrix;
						let createTime = data.createTime;
						this.setState({
							chartUri,
							keyUri,
							shuffleMatrix,
							createTime
						});
					} else {
						//63301:超过可换图次数  63302:Challenge過期或不存在（验证逾时）
						this.getChallengeId();
					}
				});
			})
			.catch(function(error) {
				Toast.error('网络错误，请重试', 3);
				console.log('get banner error', error.message);
			});
	};

	firstLoadImg = () => {
		//首次加载img
		const { apiUrl, challengeUuid } = this.state;
		let fetchData = {
			applicationLanguage: 'vi',
			device: {}
		};
		fetch(`${apiUrl}/api/v1.0/challenge/${challengeUuid}`, {
			method: 'POST',
			body: JSON.stringify(fetchData),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((res) => {
				res.json().then((data) => {
					if ([ '10001', '10002', '11001' ].includes(String(data.code))) {
						let keyUri = data.keyUri;
						let chartUri = data.chartUri;
						let shuffleMatrix = data.shuffleMatrix;
						let createTime = data.createTime;
						let currentLocale = data.currentLocale;
						this.setState({
							chartUri,
							keyUri,
							shuffleMatrix,
							createTime,
							currentLocale
						});
					} else {
						//63301:超过可换图次数  63302:Challenge過期或不存在（验证逾时）
						this.getChallengeId();
					}
				});
			})
			.catch(function(error) {
				Toast.error('网络错误，请重试', 3);
				console.log('get banner error', error.message);
			});
	};

	judgement = ({ x, y, cost }, callback) => {
		//判断坐标正确
		const { apiUrl, challengeUuid } = this.state;
		let fetchData = {
			challengeUuid: challengeUuid,
			activity: {
				answers: { x, y },
				cost: cost
			},
			applicationLanguage: 'vi',
			device: {}
		};
		fetch(`${apiUrl}/api/v1.0/judgement`, {
			method: 'POST',
			body: JSON.stringify(fetchData),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((res) => {
				res.json().then((data) => {
					callback(data.code);
				});
			})
			.catch(function(error) {
				Toast.error('网络错误，请重试', 3);
				console.log('get banner error', error.message);
			});
	};

	getChallengeId = () => {
		//获取id
		let fetchData = {
			captchaType: 'SLIDE',
			applicationLanguage: 'vi',
			siteId: 38
		};
		fetchRequest(ApiPort.CaptchaChallengeId, 'POST', fetchData)
			.then((data) => {
				if (data.isSuccess) {
					this.setState(
						{
							//apiUrl: data.apiUrl,
							challengeUuid: data.result.challengeUuId
						},
						() => {
							this.firstLoadImg();
						}
					);
				} else {
				}
			})
			.catch((error) => {
				Toast.error('网络错误，请重试', 3);
				console.log(error);
			});
	};

	render() {
		let { challengeUuid, chartUri, keyUri, shuffleMatrix, currentLocale, isEnabled } = this.state;
		return isEnabled ? (
			<Captcha
				challengeUuid={challengeUuid}
				chartUri={chartUri}
				keyUri={keyUri}
				shuffleMatrix={shuffleMatrix}
				currentLocale={currentLocale}
				onReload={this.onReload}
				judgement={this.judgement}
				visible={this.props.visible}
				getChallengeId={this.getChallengeId}
				close={this.props.close}
				onMatch={(e) => {
					console.log(this.props);
					this.props.onMatch(e);
				}}
			/>
		) : null;
	}
}

export default ReactCaptcha;

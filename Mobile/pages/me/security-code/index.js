import React from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/View/Modal';
import Toast from '@/components/View/Toast';
import Router from 'next/router';
import copy from 'copy-to-clipboard';
import { PopUpLiveChat, checkIsLogin } from '@/lib/js/util';
import { SecurityCodeInfo } from '@/api/securitycode';
import { ReactSVG } from '@/components/View/ReactSVG';
import classNames from 'classnames';
import Flexbox from '@/components/View/Flexbox/';
import moment from 'moment';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/security-code'); //參數帶本頁的路徑
}
class SecurityCode extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			securityCode: '', //安全码
			showText: false, //红色提示字
			showModal: false, //联系客服弹窗
			countdownNumMMSS: '00:00', //时间倒计时
			isCountDown: true, //按钮是否可以点击
			showCopyButton: true, //复制按钮显示与隐藏
			isFiexd: false,
			textCode: 'Mã Bảo Mật đã hết hạn' //已复制或是已失效
		};
		this.timer = null;
	}

	componentDidMount() {
		if (!checkIsLogin()) {
			Router.push('/register_login');
		}

		if (localStorage.securityCodeData) {
			let data = JSON.parse(localStorage.securityCodeData);
			// let userName =
			if (data.userName == localStorage.username) {
				console.log('data1:', data.userName);
				console.log('data2:', localStorage.username);
				let endTime = data.endTime.split('.')[0].replace('T', ' ').replace(/\-/g, '/');
				endTime = new Date(endTime).getTime();
				let nowTime = new Date().getTime();
				if (endTime > nowTime) {
					this.setState({ securityCode: data.securityCode, isCountDown: false });
					this.makeNumInterval(endTime);
				}
			}
		}
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	makeNumInterval = (endTime, isFirstGenerate = false) => {
		let time = Number(new Date(endTime).getTime()) - Number(new Date().getTime());
		this.timer = setInterval(() => {
			// 防止倒计时出现负数
			if (time > 1000) {
				time -= 1000;
				this.setState({
					countdownNumMMSS: moment(new Date(time)).format('mm:ss'),
					showText: isFirstGenerate ? false : true
				});
			} else clearInterval(this.timer);
			// 距离结束时，调用提示
			if (time < 1000) {
				this.setState(
					{
						isCountDown: true,
						textCode: 'Mã Bảo Mật đã hết hạn',
						securityCode: '您的安全码已失效',
						showCopyButton: false,
						isFiexd: true,
						showText: false,
						countdownNumMMSS: '00:00'
					},
					() => {
						clearInterval(this.timer);
					}
				);
			}
		}, 1000);
	};

	getSecurityCode() {
		if (!this.state.isCountDown) {
			//表示按钮置灰状态
			return;
		}
		this.setState({ isCountDown: false });
		Toast.loading();

		SecurityCodeInfo((data) => {
			if (data.isSuccess == true) {
				let endTime = data.result.expiredDateTime.split('.')[0].replace('T', ' ').replace(/\-/g, '/');
				endTime = new Date(endTime).getTime();
				if (this.state.securityCode && this.state.securityCode == data.result.passcode) {
					console.log('两次安全码相同');
				} else {
					this.setState(
						{
							securityCode: data.result.passcode,
							isCountDown: false,
							textCode: '',
							isFiexd: false,
							showCopyButton: true,
							showText: false
						},
						() => {
							let endTime = data.result.expiredDateTime
								.split('.')[0]
								.replace('T', ' ')
								.replace(/\-/g, '/');
							this.makeNumInterval(endTime, true);
							const localStorageData = {
								securityCode: data.result.passcode,
								endTime: endTime,
								userName: localStorage.username
							};
							localStorage.setItem('securityCodeData', JSON.stringify(localStorageData));
						}
					);
				}
			} else if (data.isSuccess == false) {
				this.setState({
					showModal: true
				});
			}
			Toast.destroy();
		});
	}

	//点击按钮
	creatCode() {
		if (this.state.isCountDown) {
			this.getSecurityCode();
		} else {
			this.setState({
				showText: true
			});
		}
	}

	copyBtn(value) {
		// globalGtag('Copy_passcode_profilepage');
		copy(value);
		Toast.success('Sao Chép Thành Công');
	}

	renderHtml() {
		const { securityCode, showText, countdownNumMMSS, showCopyButton, isFiexd, textCode, isCountDown } = this.state;
		let content;
		if (securityCode == '') {
			content = (
				<div
					className="creatCodeBtn"
					onClick={() => {
						// globalGtag('Generate_passcode_profilepage');
						this.creatCode();
						// Pushgtagdata(`Verification`, 'Click', `Generate_Passcode`);
					}}
				>
					Tạo Mã Bảo Mật
				</div>
			);
			return content;
		} else {
			content = (
				<div className="securityCodeWrap">
					<Flexbox className="numberInput" justifyContent="center" alignItems="center">
						<div className="number_wrap">
							{securityCode != '您的安全码已失效' && (
								<span
									className={classNames({
										span1: true,
										heid: isFiexd,
										show: !isFiexd
									})}
								>
									{securityCode.split('').join(' ')}
								</span>
							)}

							<span
								className={classNames({
									span2: true,
									yesFiexd: isFiexd,
									noFiexd: !isFiexd,
									red: true
								})}
							>
								<ReactSVG src="/img/svg/Rederror.svg" />
								{textCode}
							</span>
						</div>
						{showCopyButton && (
							<i onClick={() => this.copyBtn(securityCode)}>
								<ReactSVG src="/img/svg/copy.svg" />
							</i>
						)}
					</Flexbox>
					{!isFiexd && (
						<p className="timer">
							Mã Bảo Mật sẽ hết hạn trong vòng<span className="red">{countdownNumMMSS}</span>phút
						</p>
					)}
					{showText && <p className="tip">Mã bảo mật này vẫn có thể được sử dụng. Vui lòng sử dụng mã bảo mật này hoặc đợi cho đến khi hết thời gian để tạo mã mới.</p>}

					<p
						className={classNames({
							creatNewCode: true,
							active: isCountDown,
							noActive: !isCountDown
						})}
						onClick={() => {
							this.creatCode();
							// Pushgtagdata(`Verification`, 'Click', `Regenerate_Passcode`);
						}}
					>
						Tạo Mã Bảo Mật Mới
					</p>
				</div>
			);
			return content;
		}
	}

	render() {
		const { showModal } = this.state;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="Tạo Mã Bảo Mật"
				status={2}
				hasServer={false}
				barFixed={true}
				seoData={this.props.seoData}
			>
				<Flexbox id="securityCode">
					<Modal visible={showModal} transparent className="securityCodeModal ConfirmModal" closable={false} maskClosable={false} title="Tạo Mã Bảo Mật Thất Bại">
						<Flexbox className="modalContent" justifyContent="center" alignItems="center" flexFlow="column">
							<ReactSVG src="/img/svg/note.svg" className="note" />
							<p className="text">Rất tiếc, hiện chúng tôi không thể tạo mã bảo mật. Vui lòng thử lại sau hoặc liên hệ Live Chat để được trợ giúp.</p>
							<div className='btnCon'>
								<div
									className="close"
									onClick={() => {
										this.setState({
											showModal: false
										});
									}}
								>
									Đóng
								</div>
								<div
									className="submit"
									onClick={() => {
										PopUpLiveChat();
										this.setState({
											showModal: false
										});
									}}
								>
									Liên Hệ Live Chat
								</div>
							</div>
						</Flexbox>
					</Modal>

					<div className="securityCodeWrap">
						<p className="text">
							Cần hủy Khuyến Mãi, Kiểm Tra Doanh Thu, Tiền Cược Thắng Thua hoặc Cài Đặt Tự Loại Trừ? Vui lòng nhấp vào mục tạo mã bảo mật và cung cấp mã này cho bộ phận <span
								className="csBtn"
								onClick={() => {
									//  this.goTOPageCs('yes');
									PopUpLiveChat();
									// globalGtag('Contactcs_passcode_profilepage');
									// setTimeout(() => {
									// 	this.setState({
									// 		isCountDown: true,
									// 		showText: false
									// 	});
									// }, 2000);
								}}
							>
								Live Chat
							</span>
						</p>
						{/* <h3 className="title">产生安全码</h3> */}
						{this.renderHtml()}
					</div>
				</Flexbox>
			</Layout>
		);
	}
}

export default SecurityCode;

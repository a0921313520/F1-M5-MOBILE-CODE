import React, { Component } from 'react';
import Layout from '@/components/Layout';
import Router from 'next/router';
import { checkIsLogin, redirectToLogin, getGameWalletType } from '@/lib/js/util';
import Toast from '@/components/View/Toast';
import Modal from '@/components/View/Modal';
import Flexbox from '@/components/View/Flexbox/';
import Service from '@/components/Header/Service';
import { ReactSVG } from '@/components/View/ReactSVG';
import { ACTION_UserInfo_getBalance } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import LaunchGame from '@/components/Games/LaunchGame';
import BackBar from '@/components/Header/BackBar';
import BalanceDropdown from '@/components/sbtwo/Balance-Dropdown';
import { OpenPlayGame } from '@/api/game';
class GameIframe extends Component {
	constructor(props) {
		super(props);
		this.state = {
			GameOpenUrl: '',
			landscapeTip: false,
			isRefreshing:false, //是否正在刷新遊戲,
			walletMappingData:null //遊戲provider & wallet配對之資料
		};
	}

	componentDidMount(props) {
		if (!checkIsLogin()) {
			redirectToLogin();
			return;
		}

		this.setState({
			GameOpenUrl: JSON.parse(localStorage.getItem('NowPlayGameUrl')),
			walletMappingData:JSON.parse(sessionStorage.getItem("gameWalletMap")),
		});

		let GamesOpenData = JSON.parse(localStorage.getItem('GamesOpenData'));
		if (GamesOpenData) {
			this.setState(
				{
					GamesOpenData: GamesOpenData
				},
				() => {
					this.QuickStartGame.OpenGame(GamesOpenData);
				}
			);
		}
		window.addEventListener('orientationchange', this.orientationchange);
	}

	componentDidUpdate(nextProps) {
		if (this.props.userInfo.username !== nextProps.userInfo.username) {
			this.props.userInfo_getBalance(true);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('click', this.orientationchange);
	}

	/**
	 * @description: 启动游戏
	 * @return {*}
	*/
	OpenGame(Url) {
		Toast.loading(); //游戏载入中
		//直接用存储的url打开游戏
		let IframeDom = document.getElementById('IframeDom');
		if (IframeDom) {
			IframeDom.src = Url; //JSON.parse(localStorage.getItem('NowPlayGameUrl'));
			if (IframeDom.attachEvent) {
				IframeDom.attachEvent('onload', function() {
					Toast.destroy();
				});
			} else {
				IframeDom.onload = function() {
					Toast.destroy();
				};
			}
		}
	}

	/**
	 * @description: 用于判断横屏
	 * @return {*}
  	*/

	orientationchange = () => {
		// if (window.orientation == 0 || window.orientation == 180) {
		// 	this.setState({
		// 		landscapeTip: false
		// 	});
		// }
		// if (window.orientation == 90 || window.orientation == -90) {
		// 	this.setState({
		// 		landscapeTip: true
		// 	});
		// }

		//如果发现禁止横屏dom 就移除
		let dom = document.getElementById('orientLayer');
		if (dom) {
			dom.remove();
		}
	};

	PlayGame = (item) => {
		OpenPlayGame((data) => {
			if (data) {
				if (data.isSuccess) {
					if (!data.result.isGameMaintenance && data.result.gameLobbyUrl && data.result.gameLobbyUrl != '') {
						this.setState({
							GameOpenUrl: data.result.gameLobbyUrl
						});
						let Iframe = document.getElementById('IframeDom');
						if (Iframe) {
							Iframe.onload = Iframe.onreadystatechange = function() {
								if (this.readyState && this.readyState != 'complete') return;
								else {
									Toast.destroy();
								}
							};
						}
					} else {
						Toast.error('Trò chơi bạn mở đang được bảo trì. Vui lòng thử lại sau. ', 3);
					}
				} else {
					Toast.error(data.message, 3);
				}
			}
			this.setState({isRefreshing:false})
		}, item);
	}

	RefreshGame = () => {
		this.setState(
			{
				GameOpenUrl: '',
				isRefreshing:true
			},
			() => {
				this.PlayGame(this.state.GamesOpenData);
			}
		);
	}

	render() {
		const { GameOpenUrl, GamesOpenData, walletMappingData } = this.state;
		const {ProvidersSequence} = this.props
		console.log('游戏链接--------->', GameOpenUrl, GamesOpenData);
		if(!GamesOpenData){
			return null
		}
		
		let wallet = "MAIN";
		if(walletMappingData){
			for(const [key, value] of Object.entries(walletMappingData)){
				if(value.includes(GamesOpenData?.code||GamesOpenData?.provider||GamesOpenData?.providerCode)){
					wallet = key
				}
			}
		}
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="乐天堂"
				status={0}
				barFixed={true}
			>
				<BackBar
					key="main-bar-header"
					wrapClassName="game_iframe_header"
					hasServer={true}
					title={
						<>
							<label>{ProvidersSequence.result.find(cat=>cat.subProviders.some(
								sub=>sub.code===(GamesOpenData?.code||GamesOpenData?.provider||GamesOpenData?.providerCode)))?.name
								||"cannot find the provider in gameSequence (FE)"}
							</label>
							<ReactSVG  
								className={ `${this.state.isRefreshing ? 'refresh-loading' : 'refresh'} icon_loading`} 
								onClick={this.RefreshGame}
								src="/img/P5/svg/refresh.svg" 
							/>
						</>
					}
					addToLeft={
						<>
						<BalanceDropdown 
							className="game_iframe_wallet" 
							type={wallet}
							content="WalletModule"
						/>
						</>
					}
				/>
				<div id="gameOpen" style={{ position: 'relative' }}>
					<div className="iframe_game_box">
						<iframe
							src={GameOpenUrl}
							width="100%"
							height="100%"
							id="IframeDom"
							position="relative"
							allowFullScreen
						/>
					</div>
				</div>
				{/* <Modal transparent maskClosable={false} visible={this.state.landscapeTip} className="landscapeTip">
					<div className="" style={{ color: 'white' }}>
						不支持横屏
					</div>
				</Modal> */}
				{GamesOpenData && (
					<LaunchGame
						item={GamesOpenData}
						IframeOpenGame={(Url) => {
							this.OpenGame(Url);
						}}
						OnRef={(QuickStartGame) => (this.QuickStartGame = QuickStartGame)}
					/>
				)}
			</Layout>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo,
	ProvidersSequence: state.GamesList.GameDetailsDescAndBanner
});

const mapDispatchToProps = {
	userInfo_getBalance: (forceUpdate = false) => ACTION_UserInfo_getBalance(forceUpdate)
};

export default connect(mapStateToProps, mapDispatchToProps)(GameIframe);
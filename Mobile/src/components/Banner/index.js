/*
 * @Author: Alan
 * @Date: 2022-03-07 11:49:02
 * @LastEditors: Alan
 * @LastEditTime: 2023-01-16 15:17:30
 * @Description: Banner
 * @FilePath: \F1-M1-Code\Mobile\src\components\Banner\index.js
 */
import React from 'react';
import { ReactSVG } from '@/components/View/ReactSVG';
import ReactIMG from '@/components/View/ReactIMG';
import Router from 'next/router';
import LaunchGame from '@/components/Games/LaunchGame';
import Image from 'next/image';
import { PopUpLiveChat, checkIsLogin } from '@/lib/js/util';
import { connect } from 'react-redux';
import { gamePage } from '@/lib/data/DataList';
// import LazyLoad from 'react-lazyload';

class WalletBanner extends React.Component {
	constructor() {
		super();
		this.state = {
			WalletCloseBanner: false
		};
	}
	componentDidMount() {
		this.setState({
			WalletCloseBanner: sessionStorage.getItem('WalletCloseBanner')
		});
	}

	CloseBanner() {
		sessionStorage.setItem('WalletCloseBanner', true);
		this.setState({
			WalletCloseBanner: true
		});
	}

	/**
	 * @description: 轮播图跳转动作
	 * @param {*} data
	 * @return {*}
	*/

	BannerAction(data) {
		const {ProvidersSequence} = this.props;
		let item = data.action;
		if (!item.actionId || item.actionId == 0) {
			return;
		}
		if (!(item.actionId == 28 || item.actionId == 29 || item.actionId== 33)) {
			if (!checkIsLogin()) {
				Router.push('/register_login');
				return;
			}
		}
		console.log('BannerAction item----------------->', item);
		switch (item.actionId) {
			case 28:
				if (item.url == '/vn/mobile/event_MidAutumn2022') {
					// Pushgtagdata('Engagement_Event', 'Click', 'Enter_MidAutumn2022​');
				}

				if (item.url == '/event/WC2022') {
					Router.push('/event_WC2022');
					// Pushgtagdata('Engagement_Event', 'Click', 'Enter_WCPage2022​​');
					return;
				}

				if (item.url == '/nationalday2022') {
					Router.push('/event_nationalday2022');
					// Pushgtagdata('Engagement_Event', 'Click', 'Enter_ NationalDay2022​');
					return;
				}

				if (item.url == '/CNY2023') {
					Router.push('/event_CNY2023');
					// Pushgtagdata('Engagement_Event', 'Click', 'Enter_ChineseNewYear23​');
					return;
				}
				if (item.url == '/LaborDay2023') {
					Router.push('/event_LaborDay2023');
					// Pushgtagdata('Engagement_Event', 'Click', 'Enter_LaborDay2023');
					return;
				}
				if (item.url == "/event_15thAnni2023") {
					Router.push('/event_15Anni');
					// global.Pushgtagpiwikurl && global.Pushgtagpiwikurl(`event_15thAnni2023`,false); 
					// Pushgtagdata('Engagement_Event', 'Click', 'Enter_15thAnni2023');
					return;
				}

				location.href = item.url;
				//window.open(item.url, '_blank');
				break;
			case 29:
				if (data.category == 'worldcup_main') {
					// Pushgtagdata('Promo Nav​', 'View', item.ID + '_PromoTnC_WCPage2022​​');
				}
				Router.push(`/promotions?id=${item.ID}&jumpfrom=BANNER`);
				break;
			case 30:
				Router.push('/help/sponsorship');
				break;
			case 31:
				Router.push('/DepositPage');
				break;
			case 32:
			case 34:
				const gameParentCategory = (ProvidersSequence.result).find(cat=>cat.subProviders.some(sub=>sub.code===item.cgmsVendorCode))?.code || ""
				this.setState({gameVendor:gameParentCategory})
				let GameData = {
					code: item.cgmsVendorCode,
					providerId: item.gameId,
					type: 'Game'
				};

				if(item.cgmsVendorCode === 'SPR'){
					this.QuickStartGame.OpenSPR();
					return;
				}

				if (item.launchMode == 'game_id') {
					this.QuickStartGame.OpenGame(GameData);
					return;
				}
				
				if (item.launchMode == 'lobby') {
					if(gameParentCategory){
						Router.push(`/Games/${gamePage.find(item=>item.productCode === gameParentCategory).name}/${item.cgmsVendorCode}`);
					}else{
						Toast.error(`"${item.cgmsVendorCode}" is not included in gameSequence, cannot redirect to lobby (FE)`)
					}
					return;
				}

				if(item.launchMode == 'web_view'){
					switch(item.cgmsVendorCode){
						case "BTI":
						case "OWS":
						case "CML":
						case "IPSB":
						case "SBT":
						case "TFG":
						case "IPES":
						case "SPR":
						case "AVIATOR":
						case "TCG":
						case "GPK":
						case "SLC":
							this.QuickStartGame.OpenGame(GameData);
							break;
						default:
							if(gameParentCategory){
								Router.push(`/Games/${gamePage.find(item=>item.productCode === gameParentCategory).name}/${item.cgmsVendorCode}`);
							}else{
								Toast.error(`"${item.cgmsVendorCode}" is not included in gameSequence, cannot redirect to lobby (FE)`)
							}
							break;
					}
					return
				}
				
				break;
			case 33:
				PopUpLiveChat();
				break;
			case 202211:
				// Pushgtagdata('Game​', 'View', item.matchInfo.match_id + '_IMSP_WCPage2022​​');
				Router.push(`/sbtwo/sports-im/detail/?sid=1&eid=${item.matchInfo.event_id}&lid=${30455}&OE=false`);
				break;

			default:
				break;
		}
	}

	render() {
		const { WalletCloseBanner } = this.state;
		const { item, type, height, width, imgType, bannerFlag, bannerList } = this.props;
		return (
			<React.Fragment>
				{!WalletCloseBanner && (
					<div className="WalletBanner" style={{ padding: !type || type == 'home' ? '0' : '' }}>
						<React.Fragment>
							{type &&
							type != 'home' &&
							type != 'Sponsorship' && (
								<ReactSVG
									className="recommend"
									src="/img/svg/close.svg"
									onClick={() => {
										this.CloseBanner();
									}}
								/>
							)}
							{type == 'home' ? (
								<Image
									src={bannerFlag ? item.cmsImageUrl : bannerList[0].cmsImageUrl}
									loading={'lazy'}
									width={330}
									height={imgType == 'CenterBanner' ? 70 : 160}
									onClick={() => {
										this.BannerAction(item);
										if(item.action.url=== '/event_15thAnni2023') return
										if(item.title==="WEC Feature Banner"){
											// Pushgtagdata(`FeatureBanner`, 'Click', `${item.action.cgmsVendorCode}_FeatureBanner_Home`);
											return
										}
										if (imgType === 'TopBanner') {
											Pushgtagdata(
												'Home', 
												'Click Banner',
												'Home_C_Banner_Promotion',
												false,
												[{
													customVariableKey:"Home_C_Banner_Promotion",
													customVariableValue: item.title
												}]
											)
										} 
										if (imgType === 'CenterBanner') {
											Pushgtagdata(
												'Home', 
												'Launch Activity',
												'Home_C_FeatureBanner',
												false,
												[{
													customVariableKey:"Home_C_FeatureBanner_ActivityName",
													customVariableValue: item.title
												}]
											);
										}
									}}
									alt={item ? item.title : ''}
								/>
							) : type == 'Deposit' ? (
								<React.Fragment>
									<ReactIMG
										src={item ? item.cmsImageUrl : ''}
										loading={'lazy'}
										width={width ? width : 360}
										height={height ? height : 70}
										onClick={() => {
											this.BannerAction(item);
											// Pushgtagdata(
											// 	`Banner`,
											// 	'Click',
											// 	`${item.action.actionName}_${item.category}Page`
											// );
										}}
										alt={item ? item.title : ''}
									/>
								</React.Fragment>
							):
								// 默認圖片
								(
									<React.Fragment>
										<Image
											src={item ? item.cmsImageUrl : ''}
											loading={'lazy'}
											width={width ? width : 360}
											height={height ? height : 70}
											onClick={() => {
												console.log('askdsjd')
												if(type == 'profile') {
													console.log('asdasd')
													Pushgtagdata(
														`MemberCenter`, 
														'Click Banner', 
														`MemberCenter_C_Banner`,
														// 1, 
														[{
															customVariableKey: 'MemberCenter_C_Banner_PromotionName',
															customVariableValue: item.title 
														}]
													);	
												}
												this.BannerAction(item);
												// Pushgtagdata(
												// 	`Banner`,
												// 	'Click',
												// 	`${item.action.actionName}_${item.category}Page`
												// );
											}}
											alt={item ? item.title : ''}
										/>
												{/* <LazyLoadImage
											src={item ? item.cmsImageUrl : ''}
											onClick={() => {
												this.BannerAction(item);
												Pushgtagdata(
													`Banner`,
													'Click',
													`${item.action.actionName}_${item.category}Page`
												);
											}}
											alt={item ? item.title : ''}
											width={width ? width : '100%'}
											height={height ? height : 'auto'}
											effect="blur"
											onError={({ currentTarget }) => {
												currentTarget.onerror = null;
											}}
									/> */}
									</React.Fragment>
								)
							}
						</React.Fragment>
					</div>
				)}
				<LaunchGame QuickStartGame={true} OnRef={(QuickStartGame) => (this.QuickStartGame = QuickStartGame)} />
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	ProvidersSequence: state.GamesList.GameDetailsDescAndBanner
});

export default connect(mapStateToProps)(WalletBanner);

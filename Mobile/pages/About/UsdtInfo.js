import React from 'react';
import Modal from '@/components/View/Modal';
import Toast from '@/components/View/Toast';
import Layout from '@/components/Layout';
import ReactIMG from '@/components/View/ReactIMG';
let namereg = /^[a-zA-Z0-9]{5,16}$/;
import NavBar from '@/components/View/NavBar/';
import classNames from 'classnames';
import { ReactSVG } from '@/components/View/ReactSVG';
import { GetUsdtFaqDetail, Feedbackform } from '@/api/about';
import Flexbox from '@/components/View/Flexbox/';
import { checkIsLogin } from '@/lib/js/util';
import CTCWithdrawalTutorial from './CTCWithdrawalTutorial';
import WalletDifferences from './WalletDifferences';
import UsdtQustion from './UsdtQustion';
import CTCDepositTutorial from '@/components/Deposit/depositComponents/CTC/CTCDepositTutorial';
import Router from 'next/router';
class USDT extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			bannerList: [ 1, 2, 3 ],
			InfoVisible: false,
			questionVisible: false,
			nowOpen: '',
			userNameTip: '',
			userName: '',
			feedbackTip: '',
			feedback: '',
			disabled: false,
			successTip: '',
			usdtInfo: '',
			active: 0,
			questionList: [],
			allQuestionList:[
				{
					id: "8479",
					title: "什么是加密货币？",
					body: "<div class=\"usdtApiFaq\"><p>加密货币是一种使用区块链技术，来确保交易安全及快速稳定地转移资金，而创建发行的加密货币。</p></div>"
				},
				{
					id: "8480",
					title: "什么是泰达币?",
					body: "<div class=\"usdtApiFaq\"><p>USDT是一种将加密货币与法定货币美元挂钩的虚拟货币，以开放的区块链为底层技术，具有安全性和透明度，由 Tether 公司推出，Tether 将现金转换为数字货币，锚定于美元、欧元和日元等国家法币的价格，因此定价相对稳定。目前FUN88乐天堂支持TRC20以及ER20协议。</p></div>"
				},
				{
					id: "8575",
					title: "如何购买加密/虚拟货币？",
					body: "<div class=\"usdtApiFaq\"><style>.usdtApiFaq a{color:#1c8eff!important}</style><p>乐天使推荐以下第三方平台，可到其网站或APP开户购买加密/虚拟货币哦。更多第三平台的操作详情可以直接到以下的第三方平台官网查询。</p><p>虎符: <a href=\"https://hoo.com/\" target=\"_blank\">https://hoo.com/</a></p><p>币赢: <a href=\"https://www.coinwcn.com/\" target=\"_blank\">https://www.coinwcn.com/</a></p><p>币汇: <a href=\"https://www.coinhui.net/\" target=\"_blank\">https://www.coinhui.net/</a></p><p>&nbsp;</p><p>&nbsp;</p></div>"
				},
				{
					id: "8810",
					title: "为什么使用加密货币？",
					body: "<div class=\"usdtApiFaq\"><p>点对点支付，无需经过银行等任何中间机构，钱直接给对方，大大降低了交易费率。<br />加密货币安全性高，能够保障客户资金隐私。<br />大额单笔转账，额度无上限，到账迅速。<br />24小时随时交易，可以随意和外汇资金兑换.</p></div>"
				},
				{
					id: "8811",
					title: "加密货币的汇率是固定的吗？",
					body: "<div class=\"usdtApiFaq\"><p>加密货币兑换汇率是按照实时汇率随时变动。</p></div>"
				},
				{
					id: "8818",
					title: "转账后订单迟迟未显示成功怎么办？",
					body: "<div class=\"usdtApiFaq\"><p>加密货币转账需要区块全部确认，才会判定转账成功。您可以先查看钱包的转账详情页面是否已显示转账完成，<br />若未完成，请耐心等待；<br />若已完成，系统在检测到打币后会及时响应并更改订单状态。<br />若已完成，网站还未到账金额，请联系在线客服提供相应转账凭证寻求协助。</p></div>"
				},
				{
					id: "8819",
					title: "支付成功了，订单显示失败怎么处理？",
					body: "<div class=\"usdtApiFaq\"><p>产生这种情况的原因是：1、支付金额不对 2、订单超时 3、币价突然波动过大，系统停止处理。请联系平台或在线客服进行处理。</p></div>"
				},
				{
					id: "8820",
					title: "加密货币交易是否会产生手续费用？",
					body: "<div class=\"usdtApiFaq\"><p>部分平台会产生交易费用，供应商页面将显示交易金额+手续费，您在转账时请输入总金额即可。</p></div>"
				}
			]
		};
	}

	bindHandleScroll = (e) => {
		// 滚动的高度
		const scrollTop =
			(e.srcElement ? e.srcElement.documentElement.scrollTop : false) ||
			window.pageYOffset ||
			(e.srcElement ? e.srcElement.body.scrollTop : 0);

		// const scrollLeft =
		// 	(e.srcElement ? e.srcElement.documentElement.scrollLeft : false) ||
		// 	window.pageXOffset ||
		// 	(e.srcElement ? e.srcElement.body.scrollLeft : 0);
		let autoheight = document.body.scrollHeight / 6 - 100;

		if (scrollTop > 0 && scrollTop <= autoheight) {
			this.setState({
				active: 0
			});
		} else if (scrollTop > autoheight && scrollTop <= autoheight * 2) {
			this.setState({
				active: 1
			});
		} else if (scrollTop > autoheight * 2 && scrollTop <= autoheight * 3) {
			this.setState({
				active: 2
			});
		} else if (scrollTop > autoheight * 3 && scrollTop <= autoheight * 4) {
			this.setState({
				active: 3
			});
		} else if (scrollTop > autoheight * 4 && scrollTop <= autoheight * 5) {
			this.setState({
				active: 4
			});
		} else if (scrollTop > autoheight * 5 && scrollTop <= autoheight * 6) {
			this.setState({
				active: 5
			});
		}
	};
	//scroll事件注销
	componentWillUnmount() {
		window.removeEventListener('scroll', this.bindHandleScroll);
	}

	componentDidMount() {
		window.addEventListener('scroll', this.bindHandleScroll);
		if (checkIsLogin()) {
			let name = JSON.parse(localStorage.getItem('memberInfo')).userName;
			this.setState({
				userName: name,
				userNameTip: !namereg.test(name) ? '5 - 16个字母或数字组合，中间不得有任何特殊符号' : '',
				disabled: true
			});
		}

		this.setState({questionList:this.state.allQuestionList.slice(0,3)})

	// // CMS api轉Hardcode，未來可能會提供其他api fetch資料，先保留。
		// this.GetQuestions();
		// window.Pushgtagdata && Pushgtagdata(window.location.origin, 'Launch', 'USDT_info');
	}

	/**
  * @description:获取常见问题列表
  * @param {*}
  * @return {*}
  */

// // CMS api轉Hardcode，未來可能會提供其他api fetch資料，先保留。
	// GetQuestions() {
	// 	const hide = Toast.loading('玩命加载中...');
	// 	GetUsdtFaqDetail((res) => {
	// 		if (res) {
	// 			hide();
	// 			console.log(res);
	// 			this.setState({
	// 				questionList: res.length > 3 ? res.slice(0, 3) : res,
	// 				allQuestionList: res
	// 			});
	// 		}
	// 	});
	// }

	/**
  * @description: 提交问题反馈
  * @param {*}
  * @return {*}
  */
	feedbackSubmit = () => {
		let postData = {
			userName: this.state.userName.trim(),
			feedback: this.state.feedback.trim()
		};
		const hide = Toast.loading('请稍后...', 0);
		Feedbackform(postData, (res) => {
			hide();
			if (res.isSuccess == true && res.result) {
				this.setState({
					feedback: '',
					feedbackTip: ''
				});
				Toast.success(res.result.message, 5);
			} else {
				if (res.result && res.result.message === '您的反馈已收到！如需更多支持，请联系在线客服及时为您解决问题！') {
					this.setState({
						successTip: res.result.message,
						feedback: '',
						feedbackTip: ''
					});
					setTimeout(() => {
						this.setState({
							successTip: ''
						});
					}, 5000);
					return;
				}
				Toast.error(res.result.message, 5);
			}
		});
	};

	scrollTo = (anchorName) => {
		if (anchorName) {
			let anchorElement = document.getElementById(anchorName);
			if (anchorElement) {
				anchorElement.scrollIntoView({ behavior: 'smooth' });
			}
		}
	};

	render() {
		const {
			bannerList,
			userNameTip,
			userName,
			feedbackTip,
			feedback,
			disabled,
			usdtInfo,
			questionList,
			allQuestionList,
			InfoVisible,
			DepositVisible,
			WithdrawalVisible,
			questionVisible,
			nowOpen
		} = this.state;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="USDT介绍"
				status={2}
				//hasServer={false}
				barFixed={true}
			>
				<div id="introduction">
					<a href="#" id="screens0" className="screens">
						&nbsp;
					</a>
					{this.state.successTip && <div className="successTip">{this.state.successTip}</div>}
					<ReactIMG src="/img/about/main-page.jpg" />
					<div className="content">
						<a href="#" id="screens1" className="screens">
							&nbsp;
						</a>
						<p className="title">您必须了解的加密货币</p>
						<p className="title2">加密货币是现代社会中最有价值的发明之一，其颠覆传统的去中心化交易模式及安全、稳定、隐秘之特性， 广受企业机构的青睐，成为现今市场交易的主流。</p>
						<div className="guideList">
							<div className="item">
								<div className="clearfix">
									<ReactIMG src="/img/about/one.png" className="fl" />
									<div className="fr">
										<p className="p1">安全有保障</p>
										<p className="p2">与银行卡等传统支付方式相比，玩家不需要给出自己的姓名或卡号即可完成加密货币交易，避免了敏感信息泄漏。</p>
									</div>
								</div>
							</div>
							<div className="item">
								<div className="clearfix">
									<ReactIMG src="/img/about/two.png" className="fl" />
									<div className="fr">
										<p className="p1">交易速度快</p>
										<p className="p2">虚拟货币所采用的区块链技术具有去中心化特点，不需要清算中心机构来处理数据，交易时间将被缩短。</p>
									</div>
								</div>
							</div>
							<div className="item">
								<div className="clearfix">
									<ReactIMG src="/img/about/three.png" className="fl" />
									<div className="fr">
										<p className="p1">高度匿名性</p>
										<p className="p2">不由央行或当局发行，不受银行监管，玩家可以随心所欲地使用存放在自己加密钱包里的资金。</p>
									</div>
								</div>
							</div>
						</div>
						<a href="#" id="screens2" className="screens">
							&nbsp;
						</a>
						<p className="title1" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
							<span className="content">USDT 泰达币的优势</span>
						</p>
						<p className="title2">泰达币（Tether）也被称为USDT，其价值与美元对等 1USDT=1美元。作为最稳定且保值的币种，在加密货币中独占鳌头。</p>

						<div className="advantageList clearfix">
							<div className="item fl" style={{ marginLeft: '0' }}>
								<ReactIMG src="/img/about/user.svg" />
								<p>匿名买卖</p>
							</div>

							<div className="item fl">
								<ReactIMG src="/img/about/Icon_Time.svg" />
								<p>24小时</p>
							</div>
							<div className="item fl">
								<ReactIMG src="/img/about/Icon_Stable.svg" />
								<p>价格稳定</p>
							</div>
							<div className="item fl" style={{ marginLeft: '0' }}>
								<ReactIMG src="/img/about/Icon_Fast.svg" />
								<p>快速到账</p>
							</div>
							<div className="item fl">
								<ReactIMG src="/img/about/Icon_Regulated.svg" />
								<p>不受银行监管</p>
							</div>
							<div className="item fl">
								<ReactIMG src="/img/about/Icon_Coins.svg" />
								<p>额度无上限</p>
							</div>
						</div>
						<a href="#" id="screens3" className="screens">
							&nbsp;
						</a>
						<p
							className="button1"
							onClick={() => {
								this.setState({
									InfoVisible: true
								});
							}}
						>
							钱包协议使的区别 &gt;&gt;
						</p>

						<p className="title1" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
							<span className="content">FUN88 USDT 存款支付方式</span>
						</p>

						<table className="table1">
							<tbody>
								<tr className="TOP">
									<td className="no_left no_top">极速虚拟币</td>
									<td className="no_right no_top">虚拟币支付</td>
								</tr>
								<tr>
									<td className="no_left">以实时兑换率来进行交易。</td>
									<td className="no_right">以锁定的交易时间内的兑换率来进行交易。</td>
								</tr>
								<tr>
									<td className="no_left">您的专属存款二维码和钱包地址， 可储存于第三方平台重复使用</td>
									<td className="no_right">每次您提交存款交易请求时， 所产生的二维码和收款地址仅限一次使用。</td>
								</tr>
								<tr>
									<td className="no_left">您无需浏览乐天堂的泰达币存款页面， 亦能直接从第三方平台直接进行存款</td>
									<td className="no_right">您需要浏览乐天堂的泰达币 存款页面才能进行存款</td>
								</tr>
								<tr>
									<td className="no_left">您的交易单号会在您的泰达币入账后才产生</td>
									<td className="no_right">一旦完成提交存款后， 您即可获得交易单号</td>
								</tr>
								<tr>
									<td className="no_left no_bottom">您可以随时随地进行存款</td>
									<td className="no_right no_bottom">您必须在交易限定的时间内完成存款</td>
								</tr>
							</tbody>
						</table>
						<a href="#" id="screens4" className="screens">
							&nbsp;
						</a>
						<div className="btnGroup clearfix">
							<p
								className="button2 fl"
								onClick={() => {
									this.setState({
										DepositVisible: true
									});
								}}
							>
								存款教程 &gt;
							</p>
							<p
								className="button2 fr"
								onClick={() => {
									this.setState({
										WithdrawalVisible: true
									});
								}}
							>
								提款教程 &gt;
							</p>
						</div>
						{usdtInfo && (
							<React.Fragment>
								<p className="title1" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
									<span className="content">{usdtInfo.title}</span>
								</p>
								<p className="title2" style={{ marginBottom: '1rem', textAlign: 'center' }}>
									<span className="content">{usdtInfo.subTitle}</span>
								</p>
								<div className="usdtInfoList">
									{usdtInfo.icons &&
									usdtInfo.icons.length && (
										<div>
											{usdtInfo.icons.map((item, i) => {
												return (
													<div key={i} className="usdtInfoItem">
														<img src={item.src} className="logo" />
														<p>{item.title}</p>
														<img
															src={'/static/images/introduction/arrow.png'}
															className="arrow"
															onClick={() => {
																if (
																	global.SetConfirmModal &&
																	typeof global.SetConfirmModal === 'function'
																) {
																	global.SetConfirmModal(item.href);
																}
															}}
														/>
													</div>
												);
											})}
										</div>
									)}
								</div>
							</React.Fragment>
						)}

						<p className="title1" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
							<span className="content">常见问题</span>
						</p>

						<div className="questionList" style={{ padding: '1rem' }}>
							{questionList && questionList.length ? (
								questionList.map((ele, index) => {
									return (
										<div className="item" key={index}>
											<Flexbox
												justifyContent="space-between"
												className={classNames({
													header: true,
													borderRadius: this.state.nowOpen !== ele.id
												})}
												onClick={() => {
													if (this.state.nowOpen === ele.id) {
														this.setState({
															nowOpen: ''
														});
													} else {
														this.setState({
															nowOpen: ele.id
														});
													}
												}}
											>
												<p>{ele.title}</p>
												<ReactSVG
													src={'/img/svg/RightArrow.svg'}
													className={classNames({
														Arrow: true,
														Active: this.state.nowOpen === ele.id
													})}
												/>
											</Flexbox>
											{this.state.nowOpen === ele.id && (
												<div className="body" dangerouslySetInnerHTML={{ __html: ele.body }} />
											)}
										</div>
									);
								})
							) : null}
						</div>
						<p
							className="button1"
							onClick={() => {
								this.setState({
									questionVisible: true
								});
							}}
						>
							查看更多 &gt;&gt;
						</p>
						<p className="title1">
							<span className="content">问题反馈</span>
						</p>
						<div className="inputList">
							<div style={{ position: 'relative' }}>
								<input
									value={this.state.userName || ''}
									maxLength={16}
									onChange={(e) => {
										if (e.target.value.trim()) {
											this.setState({
												userName: e.target.value,
												userNameTip: !namereg.test(e.target.value)
													? '5 - 16个字母或数字组合，中间不得有任何特殊符号'
													: ''
											});
										} else {
											this.setState({
												userName: e.target.value,
												userNameTip: '用户名不得为空'
											});
										}
									}}
									disabled={disabled}
									placeholder="请输入您的用户名"
								/>
							</div>
							{userNameTip && (
								<div style={{ fontSize: '12px', color: '#00A6FF', paddingLeft: '0.5rem' }}>
									{userNameTip}
								</div>
							)}
							<div style={{ position: 'relative', marginTop: '1rem' }}>
								<textarea
									value={this.state.feedback}
									rows={5}
									onChange={(v) => {
										if (v.target.value.trim()) {
											this.setState({
												feedback: v.target.value,
												feedbackTip:
													v.target.value.trim().length > 200 ? '问题反馈仅限 200 字符以内。' : ''
											});
										} else {
											this.setState({
												feedback: v.target.value,
												feedbackTip: '问题反馈内容不得为空'
											});
										}
									}}
									placeholder="请输入您的问题或意见"
									style={{ resize: 'none' }}
								/>
							</div>
							{feedbackTip && (
								<div style={{ fontSize: '12px', color: '#00A6FF', paddingLeft: '0.5rem' }}>
									{feedbackTip}
								</div>
							)}
							<p className="desc">我们期待倾听您使用加密货币过程中遇到的问题与宝贵意见。</p>
							<p
								className="submit"
								style={{
									backgroundColor:
										!userNameTip && userName.trim() && !feedbackTip && feedback.trim()
											? '#00A6FF'
											: '#CCCCCC'
								}}
								onClick={() => {
									if (!userNameTip && userName.trim() && !feedbackTip && feedback.trim()) {
										this.feedbackSubmit();
									}
								}}
							>
								提交
							</p>
						</div>
					</div>
				</div>
				<a href="#" id="screens5" className="screens">
					&nbsp;
				</a>
				<div className="btnFixed" style={{ padding: '0 10px' }}>
					<div
						className="btn"
						style={{ backgroundColor: '#0CCC3C' }}
						onClick={() => {
							sessionStorage.setItem('depositCTC', 'true');
							Router.push('/deposit');
						}}
					>
						立即存款
					</div>
				</div>

				<ul className="PageChange">
					{[ ...Array(6) ].map((i, k) => {
						return (
							<li
								key={k}
								className={classNames({
									active: this.state.active === k
								})}
								onClick={() => {
									// this.setState({
									// 	active: k
									// });
									this.scrollTo('screens' + k);
								}}
							/>
						);
					})}
				</ul>

				<UsdtQustion
					visible={questionVisible}
					closeModal={() => {
						this.setState({
							questionVisible: false
						});
					}}
					allQuestionList={allQuestionList}
					nowOpen={nowOpen}
					Openset={(v) => {
						this.setState(v);
					}}
				/>

				{/* 钱包协议区别 */}
				<WalletDifferences
					visible={InfoVisible}
					closeModal={() => {
						this.setState({
							InfoVisible: false
						});
					}}
				/>
				{/* 提款教程 */}
				<CTCWithdrawalTutorial
					visible={WithdrawalVisible}
					closeModal={() => {
						this.setState({
							WithdrawalVisible: false
						});
					}}
				/>
				{/* 充值教程 */}
				<CTCDepositTutorial
					visible={DepositVisible}
					closeModal={() => {
						this.setState({ DepositVisible: false 
						})
					}}
				/>
			</Layout>
		);
	}
}
export default USDT;

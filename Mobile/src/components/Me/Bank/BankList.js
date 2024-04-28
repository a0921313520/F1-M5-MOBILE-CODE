import React, { Component } from 'react';
import Toast from '@/components/View/Toast';
import Router from 'next/router';
import bankJson from '@/lib/data/BankList.json';
import BankDetailModal from './BankDetailModal';
import BankLimit from './BankLimit';
import { MemberWithdrawalThreshold, GetMemberBanks, SetMemberBanksDefault } from '@/api/wallet';
import { PopUpLiveChat, NumberReplace } from '@/lib/js/util';
import ReactIMG from '@/components/View/ReactIMG';
import Flexbox from '@/components/View/Flexbox/';
import Popover from '@/components/View/Popover';
import { ReactSVG } from '@/components/View/ReactSVG';
import { BsChevronRight, BsPlusLg, BsCheckCircleFill } from 'react-icons/bs';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { getUrlVars } from '@/lib/js/Helper';
import { maskFunction } from '../../../lib/js/util';
import {connect} from 'react-redux';
class BankList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			Banksfirst: [],
			BanksDefault: '',
			actionType: '',
			selectId: '',
			cardDetail: '',
			Threshold: '',
			WithdrawalThresholdAmount: '',
			WithdrawalThresholdCount: '',
			remind: false,
			showDetailModal: false,
			showLimitModal: false,
			loading: true
		};
	}

	componentDidMount() {
		this.getCardList();
		this.GetMemberWithdrawalThreshold();
	}

	/**
	 * @description: 查询设置的最大提款的金额，以及最多提款的次数，和百分比
	 * @param {*}
	 * @return {*}
  	*/
	GetMemberWithdrawalThreshold = () => {
		MemberWithdrawalThreshold((res) => {
			if (res.isSuccess && res.result) {
				this.setState({
					Threshold: res.result.threshold,
					WithdrawalThresholdAmount: res.result.withdrawalThresholdAmount,
					WithdrawalThresholdCount: res.result.withdrawalThresholdCount
				});
			}
		});
	};

	/**
	 * @description: 获取会员已经绑定的银行卡
	 * @param {*}
	 * @return {*}
  	*/

	getCardList() {
		this.setState({
			loading: true
		});
		GetMemberBanks((data) => {
			// data = {
			// 	"result": [
			// 		{
			// 			"iidd": "aa148f06-1395-4e1a-af53-ffaff5909be0",
			// 			"code": "121370",
			// 			"name": "工商银行-873621876321",
			// 			"bankAccountID": 121370,
			// 			"memberCode": "sbdo7U8XLYP2F",
			// 			"accountHolderName": "体育域名",
			// 			"accountNumber": "873621876321",
			// 			"bankName": "工商银行",
			// 			"bankNameEn": "Industrial and Commercial Bank(ICBC)",
			// 			"bankNameLocal": "工商银行",
			// 			"province": "天津市",
			// 			"city": "体育域名",
			// 			"branch": "体育域名",
			// 			"swiftCode": "",
			// 			"bankAddress": "",
			// 			"bankTelNo": "",
			// 			"currencyCode": "CNY",
			// 			"updateBy": "sbdo7U8XLYP2F",
			// 			"updateAt": "2023-08-18T01:47:00.673",
			// 			"nationID": 0,
			// 			"isChineseBank": false,
			// 			"isDefault": true,
			// 			"type": "W",
			// 			"isActive": true,
			// 			"isVerify": false,
			// 			"isReachThreshold": false,
			// 			"isPopup": true
			// 		},
			// 		{
			// 			"iidd": "c9e82f59-dbec-43f5-8bcf-819e6190e739",
			// 			"code": "123512",
			// 			"name": "中国银行-112312312321123",
			// 			"bankAccountID": 123512,
			// 			"memberCode": "sbdo7U8XLYP2F",
			// 			"accountHolderName": "于新起",
			// 			"accountNumber": "112312312321123",
			// 			"bankName": "中国银行",
			// 			"bankNameEn": "Bank of China(BOC)",
			// 			"bankNameLocal": "中国银行",
			// 			"province": "辽宁",
			// 			"city": "营口市",
			// 			"branch": "tessst",
			// 			"swiftCode": "",
			// 			"bankAddress": "",
			// 			"bankTelNo": "",
			// 			"currencyCode": "CNY",
			// 			"updateBy": "sbdo7U8XLYP2F",
			// 			"updateAt": "2023-08-18T14:08:09.113",
			// 			"nationID": 0,
			// 			"isChineseBank": false,
			// 			"isDefault": false,
			// 			"type": "W",
			// 			"isActive": true,
			// 			"isVerify": false,
			// 			"isReachThreshold": false,
			// 			"isPopup": true
			// 		},
			// 		{
			// 			"iidd": "98329f29-8900-49ee-9e11-4f21c77de398",
			// 			"code": "121341",
			// 			"name": "工商银行-123456789",
			// 			"bankAccountID": 121341,
			// 			"memberCode": "sbdo7U8XLYP2F",
			// 			"accountHolderName": "提示",
			// 			"accountNumber": "123456789",
			// 			"bankName": "工商银行",
			// 			"bankNameEn": "Industrial and Commercial Bank(ICBC)",
			// 			"bankNameLocal": "工商银行",
			// 			"province": "天津市",
			// 			"city": "提示",
			// 			"branch": "提示",
			// 			"swiftCode": "",
			// 			"bankAddress": "",
			// 			"bankTelNo": "",
			// 			"currencyCode": "CNY",
			// 			"updateBy": "sbdo7U8XLYP2F",
			// 			"updateAt": "2023-08-18T01:46:52.22",
			// 			"nationID": 0,
			// 			"isChineseBank": false,
			// 			"isDefault": false,
			// 			"type": "W",
			// 			"isActive": true,
			// 			"isVerify": false,
			// 			"isReachThreshold": false,
			// 			"isPopup": true
			// 		},
			// 		{
			// 			"iidd": "8414e7cc-3d40-4d51-a0af-f049ccfb1c3b",
			// 			"code": "121371",
			// 			"name": "招商银行-5550522020012000000",
			// 			"bankAccountID": 121371,
			// 			"memberCode": "sbdo7U8XLYP2F",
			// 			"accountHolderName": "体育域名",
			// 			"accountNumber": "5550522020012000000",
			// 			"bankName": "招商银行",
			// 			"bankNameEn": "China Merchant Bank(CMB)",
			// 			"bankNameLocal": "Ngân hàng Quốc tế (VIB)",
			// 			"province": "北京市",
			// 			"city": "体育域名",
			// 			"branch": "体育域名",
			// 			"swiftCode": "",
			// 			"bankAddress": "",
			// 			"bankTelNo": "",
			// 			"currencyCode": "CNY",
			// 			"updateBy": "sbdo7U8XLYP2F",
			// 			"updateAt": "2023-08-17T23:13:40.023",
			// 			"nationID": 0,
			// 			"isChineseBank": false,
			// 			"isDefault": false,
			// 			"type": "W",
			// 			"isActive": true,
			// 			"isVerify": false,
			// 			"isReachThreshold": false,
			// 			"isPopup": true
			// 		},
			// 		// {
			// 		// 	"iidd": "3b9972a3-aa47-4ab1-a885-f23ff1d379ec",
			// 		// 	"code": "114025",
			// 		// 	"name": "建设银行-6217002210031635755",
			// 		// 	"bankAccountID": 114025,
			// 		// 	"memberCode": "sbdo7U8XLYP2F",
			// 		// 	"accountHolderName": "于新起",
			// 		// 	"accountNumber": "6217002210031635755",
			// 		// 	"bankName": "建设银行",
			// 		// 	"bankNameEn": "China Construction Bank(CCB)",
			// 		// 	"bankNameLocal": "建设银行",
			// 		// 	"province": "",
			// 		// 	"city": "",
			// 		// 	"branch": "",
			// 		// 	"swiftCode": "",
			// 		// 	"bankAddress": "",
			// 		// 	"bankTelNo": "",
			// 		// 	"currencyCode": "CNY",
			// 		// 	"updateBy": "sbdo7U8XLYP2F",
			// 		// 	"updateAt": "2022-05-05T15:41:17.573",
			// 		// 	"nationID": 0,
			// 		// 	"isChineseBank": false,
			// 		// 	"isDefault": false,
			// 		// 	"type": "W",
			// 		// 	"isActive": true,
			// 		// 	"isVerify": false,
			// 		// 	"securityKey": "ffdae9bf0935b71f4d4e6a59815bbd15",
			// 		// 	"isReachThreshold": false,
			// 		// 	"isPopup": false
			// 		// }
			// 	],
			// 	"isSuccess": true
			// }
			if (data.isSuccess && data.result.length != 0) {
				let res =  data.result;
				let DefaultCard = res.find((vitem) => vitem.isDefault);
				// if (!DefaultCard && res.length) {
				// 	this.MemberBanksDefault(res[0]['bankAccountID']);
				// 	return;
				// }
				if (DefaultCard) {
					let notDefaultCard = res.filter((vitem) => !vitem.isDefault);
					let BanksArr = notDefaultCard.length ? [ DefaultCard, ...notDefaultCard ] : [ DefaultCard ];
					this.setState({
						Banksfirst: BanksArr,
						BanksDefault: DefaultCard.bankAccountID,
						remind: true
					});
				} else {
					this.setState({
						Banksfirst: data.result,
						BanksDefault: '',
						remind: true
					});
				}

			}
			this.setState({
				loading: false
			});
		});
	}

	/**
	 * @description:  设置默认银行账户
	 * @param {*} id
	 * @return {*}
	*/
	MemberBanksDefault(id) {
		Toast.loading();
		let params = {
			bankId: id
		};
		SetMemberBanksDefault(params, (res) => {
			Toast.destroy();
			if (res.isSuccess == true) {
				Toast.success('Thiết Lập Thành Công');
				this.getCardList();
			} else {
				Toast.error('Thiết Lập Không Thành Công');
			}
		});
	}

	addCard = () => {
		// globalGtag('Add_bankacc_profilepage');
		// if (this.state.Banksfirst && this.state.Banksfirst.length >= 5) {
		// 	Toast.error('最多只能拥有5张银行卡', 3);
		// 	return;
		// }
		let bank = this.state.Banksfirst.length
		let page = getUrlVars()['page'];
		Router.push(`/me/bank-account/AddBank?page=${page}${bank == 0 ? '&bank=0' : ''}`);
	};
	render() {
		const {
			Banksfirst,
			BanksDefault,
			Threshold,
			WithdrawalThresholdAmount,
			WithdrawalThresholdCount,
			showLimitModal,
			loading
		} = this.state;
		const {isSingleDeposit} = this.props.userInfo.memberInfo
		return (
			<div className="bankList" key={BanksDefault}>
				{/* <div className="limit">
					<Flexbox className="DataInfo">
						<Flexbox flex="1">
							<b>银行账户限额设置</b>
							<ReactSVG
								src="/img/svg/noteinfo.svg"
								className="noteinfo"
								onClick={() => {
									this.setState({
										ShowPopover: true
									});
								}}
							/>
						</Flexbox>
						<Flexbox
							onClick={() => {
								this.setState({
									showLimitModal: true
								});
							}}
						>
							<ReactSVG src="/img/svg/edit.svg" className="edit" />
						</Flexbox>
					</Flexbox>
					<Flexbox justifyContent="space-between">
						<Flexbox className="DataInfo" flexFlow="column" alignItems="center">
							<span className="rt">{WithdrawalThresholdCount || '--'} 次</span>
							<span className="lf">提款次数</span>
						</Flexbox>
						<Flexbox className="DataInfo" flexFlow="column" alignItems="center">
							<span className="rt"> {WithdrawalThresholdAmount || '--'} 元</span>
							<span className="lf">提款金额</span>
						</Flexbox>
						<Flexbox className="DataInfo" flexFlow="column" alignItems="center">
							<span className="rt">{Threshold || '--'}%</span>
							<span className="lf">限额百分比</span>
						</Flexbox>
					</Flexbox>
					<Popover
						direction="top"
						className="Bankinfo-popover"
						visible={this.state.ShowPopover}
						onClose={() => {
							this.setState({ ShowPopover: false });
						}}
					>
						<span>
							限额设置适用于所有提款银行账户。例： <br />
							提款次数= 50, <br />
							提款金额= 100,000 <br />
							限额百分比= 50％ <br />
							当您成功提款25笔或提款总额达50,000元人民币至同一银行账户时, 系统将会提醒您注意账户安全，建议您添加或更换新的银行账户。
						</span>
					</Popover>
				</div> */}
				{loading && (
					<div className="SkeletonTheme">
						<SkeletonTheme baseColor="#dbdbdb" highlightColor="#ffffff">
							<Skeleton count={3} height="120px" />
						</SkeletonTheme>
					</div>
				)}
				{/* {Banksfirst && Banksfirst.length ? ( */}
					{Banksfirst.map((vitem, index) => {
						let obj = bankJson.find((item) => item.Name === vitem.bankNameLocal);
						return (
							<Flexbox flexFlow="column" className="BankList" key={index + 'BankList'}>
								<Flexbox justifyContent="space-between" alignItems="center">
									<Flexbox alignItems="center">
										<ReactIMG
											style={{ width: '24px', height: '24px' }}
											src={`/img/deposit/bankLogo/${obj ? obj.Img : 'card.png'}`}
											className="specialLogo"
										/>
										{vitem.bankNameLocal}
									</Flexbox>
									<Flexbox alignItems="center">
										{vitem.isDefault && (
											<React.Fragment>
												<BsCheckCircleFill color="#0CCC3C" size={14} />
												<span className="setDefault">
													{vitem.isDefault && <span className="default">Mặc Định</span>}
												</span>
											</React.Fragment>
										)}
										{!vitem.isDefault && (
											<React.Fragment>
												<span
													className="ToDodefault"
													onClick={() => {
														this.MemberBanksDefault(vitem.bankAccountID);
													}}
												>
													Cài Đặt Mặc Định
												</span>
											</React.Fragment>
										)}
									</Flexbox>
								</Flexbox>
								<Flexbox justifyContent="space-between" alignItems="center">
									<Flexbox>{maskFunction("BankAccount", vitem.accountNumber)}</Flexbox>
									<Flexbox
										onClick={() => {
											this.setState({
												showDetailModal: true,
												cardDetail: vitem
											});
										}}
									>
										<BsChevronRight color="#999999" size={14} />
									</Flexbox>
								</Flexbox>
							</Flexbox>
						);
					})}
				{/* ) : (
					!loading && (
						<Flexbox className="norecord" flexFlow="column" alignItems="center" margin="60px 10px">
							<ReactIMG src="/img/emptybox.png" style={{ width: '100px' }} />
							<p className="norecord-text">暂未绑定银行卡</p>
						</Flexbox>
					)
				)} */}
				{/* {isSingleDeposit ? Banksfirst.length < 1 : Banksfirst.length < 5 && ( */}
					<div
						className="newCard"
						onClick={() => {
							this.addCard();
						}}
					>
						<BsPlusLg color="#00A6FF" size={12} />
						<span className="ToDoAddBank">Thêm Tài Khoản Ngân Hàng</span>
					</div>
				{/* )} */}

				<p className="note">
					Nếu bạn cần xóa thẻ ngân hàng, vui lòng <label
						onClick={() => {
							Pushgtagdata(`AccountManagement`,"Contact CS",`AccountManagement_C_CS`)
							PopUpLiveChat();
						}}
					>
						Liên Hệ Live Chat
					</label>
				</p>
				{/* 提款银行账户详情 */}
				{this.state.showDetailModal && (
					<BankDetailModal
						showAddModal={this.state.showDetailModal}
						getCardList={this.getCardList.bind(this)}
						GETLiveChat={() => {
							PopUpLiveChat();
						}}
						CloseModal={() => {
							this.setState({
								showDetailModal: false
							});
						}}
						bankCardItem={this.state.cardDetail}
					/>
				)}
				{/* 提款限额配置 */}
				{this.state.showLimitModal && (
					<BankLimit
						showLimitModal={showLimitModal}
						CloseModal={() => {
							this.setState({
								showLimitModal: false
							});
						}}
					/>
				)}
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

export default connect(mapStateToProps)(BankList);

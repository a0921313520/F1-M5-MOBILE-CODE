import React from 'react';
import RecordItem from '@/components/transaction-record/RecordItem';
import Tabs, { TabPane } from 'rc-tabs';
import moment from 'moment';
import Flexbox from '@/components/View/Flexbox/';
import Toast from '@/components/View/Toast';
import Layout from '@/components/Layout';
import { ReactSVG } from '@/components/View/ReactSVG';
import { GetTransferHistory, GetBankingHistory, GetWithdrawalMethods } from '@/api/wallet';
import { GetPayList } from '@/api/wallet';
import BankAccount from '@/components/View/SelectDrawerMenu';
import { AiOutlineSwapRight } from 'react-icons/ai';
import { RiCalendarTodoFill } from 'react-icons/ri';
import DateRange from '@/components/View/DateRange';
import { getUrlVars } from '@/lib/js/Helper';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/transaction-record'); //參數帶本頁的路徑
}
class Records extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			Checkdate: [
				moment(new Date(moment().startOf('day').subtract(6, 'day').format('YYYY/MM/DD HH:mm:ss'))),
				moment(new Date(moment().format('YYYY/MM/DD HH:mm:ss')))
			],
			depositSelectList: [],
			withdrawalSelectList: [],
			page: 0,
			depositInfo: [],
			withdrawalInfo: [],
			transferInfo: [],
			tempDepositInfo: [],
			tempWithdrawalInfo: [],
			tempTransferInfo: [],
			dateSwitch: 0,
			selectDateVisible: false,
			checkTimeStatus: true,
			checkTimeText: '',
			Tabskey: '0',
			bankCodeState: 'all',
			showDateRange: false
		};
	}
	
	componentDidMount() {
		this.GetPaymentMethods();
		// window.Pushgtagdata && Pushgtagdata(window.location.origin, 'Launch', 'transaction_record');
		const page = getUrlVars()['page'];
		if (page) {
			this.TabPaneChange(page.toLowerCase() == 'withdraw' ? '2' : page.toLowerCase() == 'deposit' ? '0' : '1', true);
		} else {
			this.getDepositData();
		}
	}


	
	/**
	 * @description: 获取充值方式
	 * @param {*}
	 * @return {*}
  	*/

	GetPaymentMethods() {
		let PaymentMethods = JSON.parse(sessionStorage.getItem('paymentMethods'));
		if (PaymentMethods) {
			this.setState({
				depositSelectList: PaymentMethods
			});
		}
		GetPayList((res) => {
			if (res.isSuccess && res.result) {
				if (!PaymentMethods) {
					this.setState({
						depositSelectList: res.result.paymentMethods
					});
				}
				sessionStorage.setItem('paymentMethods', JSON.stringify(res.result.paymentMethods));
			}
		});
	}

	/**
  	* @description: 获取提款方式
  	* @param {*}
  	* @return {*}
  	*/
	WithdrawalMethods() {
		Toast.loading();
		GetWithdrawalMethods((data) => {
			if (data.isSuccess) {
				const { paymentMethods } = data.result;
				this.setState({
					withdrawalSelectList: paymentMethods
				});
			}
			Toast.destroy();
		});
	}

	/**
	 * @description: 获取充值交易记录
	 * @param {*} paymentMethod 充值方式
	 * @return {*}
	*/

	getDepositData = (paymentMethod) => {
		this.setState({
			depositInfo: [],
			tempDepositInfo: []
		});
		let params = {
			transactionType: 'deposit',
			method: paymentMethod && paymentMethod != 'all' ? paymentMethod : '',
			dateFrom: moment(this.state.Checkdate[0]).format('YYYY/MM/DD'),
			dateTo: moment(this.state.Checkdate[1]).format('YYYY/MM/DD')
		};
		Toast.loading();
		GetBankingHistory(params, (data) => {
			if (data.isSuccess) {
				this.setState({
					tempDepositInfo: data.result
				});
			}
			Toast.destroy();
		});
	};

	/**
  	* @description: 获取提款交易
  	* @param {*} paymentMethod 提款方式
		* @param {*} isFromOutside 是否為指定網址前來 /?page={TransactionMethod}
  	* @return {*}
 	*/
	getWithdrawalData = (paymentMethod, isFromOutside=false) => {
		!isFromOutside && Toast.loading();
		this.setState({
			tempWithdrawalInfo: [],
			withdrawalInfo: []
		});
		let params = {
			transactionType: 'Withdrawal',
			method: paymentMethod && paymentMethod != 'all' ? paymentMethod : '',
			dateFrom: moment(this.state.Checkdate[0]).startOf('day').format('YYYY/MM/DD'),
			dateTo: moment(this.state.Checkdate[1]).format('YYYY/MM/DD')
		};

		GetBankingHistory(params, (data) => {
			Toast.destroy();
			if (data.isSuccess) {
				this.setState({
					tempWithdrawalInfo: data.result
				});
			} else {
				Toast.error(data.result.message, 2);
				console.log('pages --> Transaction --> 150行 error訊息 !!',data.result.message);
			}
		});
	};

	/**
	 * @description: 获取转账交易记录
	 * @param {*}
	 * @return {*}
	*/

	getTransferData = () => {
		this.setState({
			transferInfo: [],
			tempTransferInfo: []
		});

		let params = {
			dateFrom: moment(this.state.Checkdate[0]).startOf('day').format('YYYY/MM/DD HH:mm:ss'),
			// +10秒是為了確保能抓取到最新加入的提款返水轉帳紀錄 (會有1~3秒誤差，保險起見10秒)
			dateTo: moment(this.state.Checkdate[1]).add(10,"seconds").format('YYYY/MM/DD HH:mm:ss')
		};
		Toast.loading();
		GetTransferHistory(params, (data) => {
			Toast.destroy();
			this.setState({
				tempTransferInfo: data.result
			});
		});
	};

	/**
	 * @description: 切换不同类型
	 * @param {*} key Tab类型
	 * @param {*} isFromOutside 是否為指定網址前來 /?page={TransactionMethod}
	 * @return {*}
  	*/
	TabPaneChange = (key, isFromOutside=false) => {
		this.setState({
			Tabskey: key,
			Checkdate: [
				moment(new Date(moment().startOf('day').subtract(6, 'day').format('YYYY/MM/DD HH:mm:ss'))),
				moment(new Date(moment().format('YYYY/MM/DD HH:mm:ss')))
			],
		});
		if (key == 0) {
			this.getDepositData();
			Pushgtagdata("Transaction", "Swithch to Deposit", "Transaction_C_Deposit")
		}
		if (key == 1) {
			this.getTransferData();
			Pushgtagdata("Transaction", "Swithch to Transfer", "Transaction_C_Transfer")
		}
		if (key == 2) {
			this.WithdrawalMethods();
			Pushgtagdata("Transaction", "Swithch to Withdrawal", "Transaction_C_Withdrawal")
			this.getWithdrawalData(undefined,isFromOutside);
		}
	}
	render() {
		const {
			depositSelectList,
			withdrawalSelectList,
			Tabskey,
			Checkdate,
			showDateRange,
			bankCodeState,
			tempDepositInfo,
			tempWithdrawalInfo,
			tempTransferInfo
		} = this.state;
		let RecordData = Tabskey == 0 ? tempDepositInfo : Tabskey == 1 ? tempTransferInfo : tempWithdrawalInfo;
		let SelectList = Tabskey == 0 ? depositSelectList : withdrawalSelectList;
		console.log("RecordData", RecordData);
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="Lịch Sử"
				status={2}
				hasServer={true}
				barFixed={true}
				seoData={this.props.seoData}
			>
				<div id="TransactionRecord" className="DefaultTabs" style={{height:RecordData.length? "unset":"90vh"}}>
					<Tabs
						prefixCls="TransactionRecord"
						defaultActiveKey={Tabskey}
						key={Tabskey}
						onChange={(v) => {
							this.TabPaneChange(v);
						}}
					>
						{[
							{
								name: 'Gửi Tiền',
								type: 'deposit',
								path: '/depositDetail',
								gtag: 'Filter_withdrawal_transactionrecord'
							},
							{
								name: 'Chuyển Quỹ',
								type: 'withdrawal',
								path: '/transferDetail',
								gtag: 'Filter_withdrawal_transactionrecord'
							},
							{
								name: 'Rút Tiền',
								type: 'transfer',
								path: '/withdrawalDetail',
								gtag: 'Filter_withdrawal_transactionrecord'
							}
						].map((items, index) => {
							return (
								<TabPane tab={<div className="notice_tab">{items.name}</div>} key={index}>
									<div className="tab-content">
										<Flexbox className="select" alignItems="center" justifyContent="space-between">
											<Flexbox className="typeSelect">
												{Tabskey != 1 &&
												SelectList.length != 0 && (
													<BankAccount
														searchBank={true}
														bank={false}
														closeTitle="Đóng"
														labelName={`Phương Thức ${Tabskey == 0 ? 'Gửi Tiền' : 'Rút Tiền'}`}
														Placeholder="Tất Cả"
														keyName={[ 'name', 'code' ]}
														SelectMenu={SelectList}
														SetCodeState={bankCodeState}
														setBankCode={(v, obj) => {
															this.setState({
																bankCodeState: v
															});

															if (Tabskey == 0) {
																this.getDepositData(v);
															} else if (Tabskey == 2) {
																this.getWithdrawalData(v);
															}
														}}
													/>
												)}
											</Flexbox>
											<Flexbox
												className="timeSelect"
												onClick={() => this.setState({ showDateRange: true })}
											>
												<span>{moment(Checkdate[0]).format('YYYY/MM/DD')}</span>
												<AiOutlineSwapRight color="#666666" size={18} className="ToIcon" />
												<span>{moment(Checkdate[1]).format('YYYY/MM/DD')}</span>
												<RiCalendarTodoFill color="#666666" size={18} className="TimeIcon" />
											</Flexbox>
										</Flexbox>

										{RecordData.length ? (
											<div className="message-wrap">
												{RecordData.map((item, index) => (
													<RecordItem
														key={index + 'list' + Tabskey}
														item={item}
														type={Tabskey}
														path={items.path}
														dateFrom={moment(this.state.Checkdate[0])
															.startOf('day')
															.format('YYYY/MM/DD HH:mm:ss')}
														dateTo={moment(this.state.Checkdate[1]).format(
															'YYYY/MM/DD HH:mm:ss'
														)}
														getDepositData={() => {
															this.getDepositData();
														}}
														getWithdrawalData={this.getWithdrawalData}
														TabPaneChange={this.TabPaneChange}
													/>
												))}
											</div>
										) : (
											<Flexbox className="Null-Box" paddingTop="20%">
												<ReactSVG src="/img/P5/icon/null.svg" />
												<p>không có dữ liệu</p>
											</Flexbox>
										)}
									</div>
								</TabPane>
							);
						})}
					</Tabs>
				</div>
				<DateRange
					dateRangeVisible={showDateRange}
					onClose={() => {
						this.setState({ showDateRange: false });
					}}
					onChange={(date) => {
						console.log("date", date);
						this.setState({
							Checkdate: date
						});
					}}
					callBack={(date) => {
						console.log("callBack date", date);
						this.setState(
							{
								Checkdate: date
							},
							() => {
								if (Tabskey == 0) {
									this.getDepositData(this.state.bankCodeState);
								} else if (Tabskey == 2) {
									this.getWithdrawalData(this.state.bankCodeState);
								} else {
									this.getTransferData(this.state.bankCodeState);
								}
							}
						);
					}}
					value={[ new Date(Checkdate[0]), new Date(Checkdate[1]) ]}
					maxDate={new Date()}
					type="TransactionRecord"
					shorterRange={6}
				/>
			</Layout>
		);
	}
}

export default Records;

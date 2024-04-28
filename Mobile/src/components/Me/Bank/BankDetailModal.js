import React from 'react';
import Toast from '@/components/View/Toast';
import Modal from '@/components/View/Modal';
import Flexbox from '@/components/View/Flexbox/';
import moment from 'moment';
import BackBar from '@/components/Header/BackBar';
import bankJson from '@/lib/data/BankList.json';
import ReactIMG from '@/components/View/ReactIMG';
import DateRange from '@/components/View/DateRange';
import { AiOutlineSwapRight } from 'react-icons/ai';
import { RiCalendarTodoFill } from 'react-icons/ri';
import classNames from 'classnames';
import { GetWithdrawalThresholdLimit, GetWithdrawalThresholdHistory, DeleteMemberBank } from '@/api/wallet';
import { maskFunction } from '../../../lib/js/util';
import Button from "@/components/View/Button";
import {connect} from 'react-redux';
class _AddModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			AccountNumber: '',
			Checkdate: [ new Date(new Date().getTime() - 24 * 60 * 60 * 1000), new Date() ],
			recordObj: '',
			visible: true,
			showDateRange: false,
			WithdrawalThresholdLimitAmount: '',
			WithdrawalThresholdLimitCount: ''
		};

		this.dataList = [
			{ type: 'bankName', leftTitle: 'Tên Ngân Hàng', placehoder: '请输入银行名称' },
			{ type: 'accountNumber', leftTitle: 'Số Tài Khoản', placehoder: '请输入银行帐号' },
			{ type: 'accountHolderName', leftTitle: 'Chủ Tài Khoản', placehoder: '请输入姓名' },
			// { type: 'province', leftTitle: '省/自治区', placehoder: '请输入省/自治区' },
			// { type: 'city', leftTitle: '城市/城镇', placehoder: '请输入城市/城镇' },
			// { type: 'branch', leftTitle: '分行', placehoder: '请输入分行' }
		];
	}

	componentDidMount() {
		// this.GetWithdrawalThresholdLimit();
		this.getHistoryData();
	}

	/**
  	* @description: 获取提款历史
  	* @param {*} date
  	* @return {*}
  	*/
	getHistoryData = (date) => {
		console.log(date);
		let params = {
			startDate: date
				? moment(date[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss')
				: moment(this.state.Checkdate[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
			endDate: date
				? moment(date[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss')
				: moment(this.state.Checkdate[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss')
		};
		GetWithdrawalThresholdHistory(params, (res) => {
			if (res.isSuccess && res.length) {
				let AccountNumber = this.props.bankCardItem.accountNumber;
				let recordObj = res.find((ele) => ele.bankAccountNum === AccountNumber);
				console.log(recordObj);
				if (recordObj) {
					this.setState({
						recordObj
					});
				}
			} else {
				this.setState({
					recordObj: ''
				});
			}
		});
	};

	/**
	 * @description: 获取提款门槛限额
	 * @param {*}
	 * @return {*}
	*/
	// GetWithdrawalThresholdLimit = () => {
	// 	GetWithdrawalThresholdLimit((res) => {
	// 		if (res.isSuccess && res.result) {
	// 			this.setState({
	// 				WithdrawalThresholdLimitAmount: res.result.withdrawalThresholdLimitAmount,
	// 				WithdrawalThresholdLimitCount: res.result.withdrawalThresholdLimitCount
	// 			});
	// 		}
	// 	});
	// };

	ShowRemoveConfirmModal = () =>{
		Modal.info({
			closable: false,
			title:"Xoá Tài Khoản Ngân Hàng", //訊息
			okText:"Chắc Chắn", //確認
			cancelText:"Không", //取消
			className:"commonModal",
			content:<p style={{textAlign:"start", marginBottom: '0.5rem'}}>Bạn có chắc chắn muốn xóa tài khoản không?</p>,
			onOk:this.RomoveBankCard
		})
	}

	RomoveBankCard = () => {
		Toast.loading();
		const {bankCardItem, CloseModal, getCardList} = this.props;
		const {bankAccountID} = bankCardItem
		DeleteMemberBank(bankAccountID, (res)=>{
			Toast.destroy();
			if(res.isSuccess && res.result){
				Toast.success("Xoá Thành Công") //刪除成功
				getCardList();
				CloseModal();
			}
		});
	}

	render() {
		const { bankCardItem, showAddModal, CloseModal, userInfo } = this.props;
		const {
			recordObj,
			WithdrawalThresholdLimitAmount,
			WithdrawalThresholdLimitCount,
			showDateRange,
			Checkdate
		} = this.state;
		return (
			<React.Fragment>
				<Modal
					visible={showAddModal}
					transparent
					maskClosable={false}
					closable={false}
					title={
						<BackBar
							key="main-bar-header"
							title={'Tài Khoản Ngân Hàng'}
							backEvent={() => {
								CloseModal();
							}}
							hasServer={true}
						/>
					}
					className={classNames({
						'Fullscreen-Modal': true,
						ShowMask: showDateRange ? true : false
					})}
				>
					<Flexbox className="BankDetail" flexFlow="column">
						{this.dataList.map((item, index) => {
							let checkLogo = bankJson.find((item) => item.Name === bankCardItem.bankName);
							return (
								<Flexbox key={index + 'list'}>
									<label>{item.leftTitle}</label>
									<Flexbox className="value" alignItems="center">
										{item.type == 'bankName' && (
											<ReactIMG
												style={{ width: '24px', height: '24px', marginRight: '5px' }}
												src={`/img/deposit/bankLogo/${checkLogo ? checkLogo.Img : 'card.png'}`}
												className="specialLogo"
											/>
										)}

										{item.type === "accountHolderName"  
										? maskFunction("FullName",bankCardItem.accountHolderName)
										: item.type === "accountNumber"
										? maskFunction("BankAccount", bankCardItem.accountNumber)
										: (bankCardItem[item.type] || '')}
										
									</Flexbox>
								</Flexbox>
							);
						})}
						{console.log(userInfo, 'userinfo')}

					</Flexbox>
					{
						!userInfo.memberInfo.isSingleDeposit && (
							<div className='buttonBox'>
								<Button 
									onClick={this.ShowRemoveConfirmModal}
								>
									Xoá
								</Button>
							</div>
						)
					}
					{/* <Flexbox className="BankDetail HistoryDetail" flexFlow="column">
						<h4>提款记录</h4>
						<p>可查询一年之内14日间数据记录。</p>
						<p>最近更新时间：{(recordObj && recordObj.latestWithdrawalUpdateDate) || '暂无更新'}</p>
						<Flexbox
							className="History"
							onClick={() => {
								this.setState({
									showDateRange: true
								});
							}}
						>
							<span>{moment(Checkdate[0]).format('YYYY-MM-DD')}</span>
							<AiOutlineSwapRight color="#666666" size={18} />
							<span>{moment(Checkdate[1]).format('YYYY-MM-DD')}</span>
							<RiCalendarTodoFill color="#666666" size={18} />
						</Flexbox>
						<hr />
						<Flexbox>
							<label>通过审核的提款总次数</label>
							<span className="number">{recordObj ? recordObj.totalCountThreshold : 0}</span>
						</Flexbox>
						<Flexbox>
							<label>通过审核的提款总额</label>
							<span className="number">{recordObj ? recordObj.totalAmountThreshold : 0}</span>
						</Flexbox>
						<hr />
						<Flexbox className="note">
							<p>
								当您使用同一账户提款 {WithdrawalThresholdLimitCount || '--'} 次或达到提款{' '}
								{WithdrawalThresholdLimitAmount || '--'} 总额时, 为了您银行账户安全起见, 建议您更换或添加新的银行账户进行提款。
							</p>
						</Flexbox>
					</Flexbox> */}
				</Modal>
				<DateRange
					dateRangeVisible={showDateRange}
					onClose={() => {
						this.setState({ showDateRange: false });
					}}
					onChange={(date) => {
						//获取当前时间
						let m1 = moment(date[0]);
						//获取需要对比的时间
						let m2 = moment(date[1]);
						if (m2.diff(m1, 'day') > 14) {
							Toast.error('最多只可以选择14天', 5);
							return;
						}
						this.setState({
							Checkdate: date
						});
					}}
					callBack={(date) => {
						this.getHistoryData(date);
					}}
					value={Checkdate}
					maxDate={new Date()}
				/>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

export default connect(mapStateToProps)(_AddModal);

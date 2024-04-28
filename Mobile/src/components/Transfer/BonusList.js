import React from 'react';
import { GetWalletBonus, GetTransferWalletBonus } from '@/api/wallet';
import Toast from '@/components/View/Toast';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import SelectDrawerMenu from "@/components/View/SelectDrawerMenu";
class BonusList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bonusList: [], // 可申请优惠列表
			bonusLoading: false, // 是否加载优惠中
			previewMessage: '',
			selectedBonusId:null,
		};

		this.getDepositWalletBonus = this.getDepositWalletBonus.bind(this); // 获取当前目标账户的优惠列表
		this.setBonusName = this.setBonusName.bind(this); // 设置当前选中的优惠名称和优惠值
		this.setWalletBonus = this.setWalletBonus.bind(this); // 获取当前账户优惠列表成功回调
		this.hide = null;
	}
	componentDidMount() {
		this.getDepositWalletBonus(this.props.targetValue);
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.targetValue !== this.props.targetValue) {
			this.getDepositWalletBonus(this.props.targetValue);
		}
		if(prevState.bonusList !== this.state.bonusList){
			this.setState({selectedBonusId:null})
		}
	}
	componentWillUnmount() {
		this.setWalletBonus = null; // 卸载优惠列表回调
	}
	setBonusName(v) {
		const currVal = this.state.bonusList.find((val) => val.id === v);
		if (currVal) {
				this.props.setBonusValue(v, currVal && currVal.title);
				// 依PM指示先註解掉但不刪除，以防後續追加此功能
				// this.bonusChange(currVal.id, parseInt(this.props.getFieldValue('money')));
		}
	}
	/**
   * 获取当前账户优惠列表成功回调
   * @param {object} res 获取到的返回数据
   */
	setWalletBonus(res) {

		this.setState({
			bonusLoading: false,
			bonusList: res,
		});

		if(res?.length){
			this.props.setBonusValue(res[res.length-1].id, res[res.length-1].title);
		}else{
			this.props.setBonusValue(0,"");
		}
		this.props.CallBonusdata && this.props.CallBonusdata(res);

		// 父级传递默认优惠ID修改默认优惠ID
		const bonusId = this.props.bonusId;

		!this.props.ispromo && this.setBonusName(this.props.targetValue === this.props.targetAccount ? bonusId : 0);
		// this.hide(); // 关闭父级Modal Loading状态
	}
	// 获取当前目标账户的优惠列表
	getDepositWalletBonus(type) {
		this.setState({ bonusLoading: true });
		// this.hide = Toast.loading();
		if (this.props.type == 'deposit') {
			/* -------------充值红利列表---------- */
			GetWalletBonus(type, (res) => {
				// 因为获取优惠列表未加Loading，此处为了便面内存泄漏，卸载组件会清空此方法
				typeof this.setWalletBonus === 'function' && this.setWalletBonus(res.result);
			});
		} else {
			/* --------------转账红利列表---------- */
			GetTransferWalletBonus(type, (res) => {
				// 因为获取优惠列表未加Loading，此处为了便面内存泄漏，卸载组件会清空此方法
				typeof this.setWalletBonus === 'function' && this.setWalletBonus(res.result);
			});
		}
	}


	//检查优惠是否可用  	// 依PM指示先註解掉但不刪除，以防後續追加此功能
	// bonusChange = (id, money) => {
	// 	if (!money || money == '') {
	// 		return;
	// 	}
	// 	if (id == 0) {
	// 		return;
	// 	}
	// 	let data = {
	// 		transactionType: 'Deposit',
	// 		bonusId: id,
	// 		amount: money,
	// 		wallet: this.props.targetValue,
	// 		couponText: 'string'
	// 	};
	// 	Toast.loading('确认优惠中...', 200);
	// 	fetchRequest(ApiPort.PromoCalculate, 'POST', data)
	// 		.then((data) => {
	// 			Toast.destroy();
	// 			if (data.result.previewMessage != '') {
	// 				this.setState({
	// 					previewMessage: data.result.previewMessage
	// 				});
	// 			} else if (data.result.errorMessage != '') {
	// 				this.setState({
	// 					previewMessage: data.result.errorMessage
	// 				});
	// 			}
	// 		})
	// 		.catch(() => {
	// 			Toast.destroy();
	// 		});
	// };
	render() {
		const { bonusVal } = this.props;
		const { bonusList, bonusLoading, previewMessage, selectedBonusId } = this.state;
		let MessageCss =
			previewMessage != ''
				? {
						color: 'red',
						background: '#ececec',
						padding: '4.3248px',
						borderRadius: '2.1616px',
						fontSize: '12px',
						lineHeight: '15px',
						marginBottom: '10px',
						marginTop: '10px'
					}
				: null;
		return (
			<div className='bonusListContainer' style={{display:this.props.isFromPromotion?"none":"block"}}>
					{/* --------优惠检查错误信息展示------- */}
					{/* {bonusVal !== 0 && previewMessage != '' && <p style={MessageCss}>{previewMessage}</p>} */}
					<SelectDrawerMenu
							MenuTitle="Khuyến Mãi"
							labelName="Khuyến Mãi"
							Placeholder="Chọn khuyến mãi"  //请选择bonus
							className="back_selector_drawer"
							HideAll={true}
							searchable={false}
							closeTitle="Đóng"
							keyName={["title", "id"]}
							SelectMenu={bonusList}
							SetCodeState={selectedBonusId}
							isLoading={bonusLoading}
							setBankCode={(v) => {
								this.setState({ selectedBonusId: v });
								this.setBonusName(v)
							}}
					/>
				{/* {targetValue && bonusVal === 0 && parseInt(getFieldValue('money')) > 99 ? (
					<div className="modal-prompt-info">
						{targetValue == 'MAIN' ? '提示: 您已达到参加优惠活动的要求,请切换目标账户。' : '提示: 你已达到参加优惠活动的要求,请选择相应优惠。'}
					</div>
				) : null} */}
			</div>
		);
	}
}
export default BonusList;

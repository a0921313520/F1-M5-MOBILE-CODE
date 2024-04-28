import React from 'react';
import Select, { Option } from 'rc-select';
import Input from '@/components/View/Input';
import { GetWalletBonus, GetTransferWalletBonus } from '@/api/wallet';
import Item from './../Item';
import Toast from '@/components/View/Toast';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
class BonusList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bonusList: [], // 可申请优惠列表
			bonusLoading: false, // 是否加载优惠中
			BonusCodeOpen: false, // 是否需要输入优惠券代码
			previewMessage: ''
		};

		this.getDepositWalletBonus = this.getDepositWalletBonus.bind(this); // 获取当前目标账户的优惠列表
		this.setBonusName = this.setBonusName.bind(this); // 设置当前选中的优惠名称和优惠值
		this.setWalletBonus = this.setWalletBonus.bind(this); // 获取当前账户优惠列表成功回调
		this.hide = null;
	}
	componentDidMount() {
		this.getDepositWalletBonus(this.props.targetValue);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.targetValue !== this.props.targetValue) {
			this.getDepositWalletBonus(this.props.targetValue);
		}
	}
	componentWillUnmount() {
		this.setWalletBonus = null; // 卸载优惠列表回调
	}
	setBonusName(v) {
		console.log(v);
		const currVal = this.state.bonusList.find((val) => val.id === v);
		if (currVal) {
			if (!isNaN(parseInt(this.props.getFieldValue('money')))) {
				this.props.setBonusValue(v, currVal && currVal.title);
				this.bonusChange(currVal.id, parseInt(this.props.getFieldValue('money')));
			}
		}
	}
	/**
   * 获取当前账户优惠列表成功回调
   * @param {string} type 需要获取的目标账户类型
   * @param {object} res 获取到的返回数据
   */
	setWalletBonus(type, res) {
		const inputBonus = res.filter((item) => item.id == type); // 是否需要输入优惠券代码筛选

		this.setState({
			bonusLoading: false,
			bonusList: res,
			BonusCodeOpen: inputBonus.length && inputBonus[0].bonusCouponID !== '0' // 设置是否需要输入优惠券代码
		});

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
				typeof this.setWalletBonus === 'function' && this.setWalletBonus(type, res.result);
			});
		} else {
			/* --------------转账红利列表---------- */
			GetTransferWalletBonus(type, (res) => {
				// 因为获取优惠列表未加Loading，此处为了便面内存泄漏，卸载组件会清空此方法
				typeof this.setWalletBonus === 'function' && this.setWalletBonus(type, res.result);
			});
		}
	}

	//检查优惠是否可用
	bonusChange = (id, money) => {
		if (!money || money == '') {
			return;
		}
		if (id == 0) {
			return;
		}
		let data = {
			transactionType: 'Deposit',
			bonusId: id,
			amount: money,
			wallet: this.props.targetValue,
			couponText: 'string'
		};
		Toast.loading('确认优惠中...', 200);
		fetchRequest(ApiPort.PromoCalculate, 'POST', data)
			.then((data) => {
				Toast.destroy();
				if (data.result.previewMessage != '') {
					this.setState({
						previewMessage: data.result.previewMessage
					});
				} else if (data.result.errorMessage != '') {
					this.setState({
						previewMessage: data.result.errorMessage
					});
				}
			})
			.catch(() => {
				Toast.destroy();
			});
	};
	render() {
		const { getFieldValue, targetValue, bonusVal } = this.props;
		const { bonusList, BonusCodeOpen, bonusLoading, previewMessage } = this.state;
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
			<React.Fragment>
				{bonusList.length ? (
					<Item label="Khuyến Mãi">
						{bonusLoading ? (
							<Select size="large" value="加载中..." disabled={true} loading={true} />
						) : (
							<Select
								size="large"
								value={bonusVal}
								onChange={this.setBonusName}
								//disabled={this.props.ispromo}
							>
								{bonusList.map((value) => {
									return (
										<Option value={value.id} key={value.id}>
											{value.title}
										</Option>
									);
								})}
							</Select>
						)}
						{/* --------优惠检查错误信息展示------- */}
						{bonusVal !== 0 && previewMessage != '' && <p style={MessageCss}>{previewMessage}</p>}
					</Item>
				) : null}
				{/* {targetValue && bonusVal === 0 && parseInt(getFieldValue('money')) > 99 ? (
					<div className="modal-prompt-info">
						{targetValue == 'MAIN' ? '提示: 您已达到参加优惠活动的要求,请切换目标账户。' : '提示: 你已达到参加优惠活动的要求,请选择相应优惠。'}
					</div>
				) : null} */}
				{BonusCodeOpen ? (
					<Item label="优惠券代码" errorMessage={this.props.form.getFieldError('bonusCode')}>
						{this.props.getFieldDecorator('bonusCode', {
							rules: [ { required: true, message: '请输入优惠券代码！' } ]
						})(<Input size="large" placeholder="请输入优惠券代码！" autoComplete="off" maxLength={20} />)}
					</Item>
				) : null}
			</React.Fragment>
		);
	}
}
export default BonusList;

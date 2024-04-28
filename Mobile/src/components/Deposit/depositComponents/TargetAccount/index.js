import React from 'react';
import Select, { Option } from 'rc-select';
import Router from 'next/router';
import Input from '@/components/View/Input';
import { createForm } from 'rc-form';
import { GetWalletList } from '@/api/wallet';
import BonusList from './BonusList';
import Item from './../Item';
import { createRef } from 'react';

class TargetAccount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			toWalletList: [] // 目标账户列表
		};

		this.getDepositWallet = this.getDepositWallet.bind(this); // 获取目标账户列表
		this.setTargetName = this.setTargetName.bind(this); // 设置当前选中的目标账户名称和目标账户值
		this.defaultToWallet = 'MAIN';
		this.Bonuslistdata = createRef();
	}
	componentDidMount() {
		this.getDepositWallet(); // Get目标账户
	}
	componentDidUpdate(prevProps, prevState) {
		// 设置第一次进入目标账户的默认Code
		if (prevState.toWalletList.length !== this.state.toWalletList.length) {
			const { toWalletList } = this.state; // 当前支付方式的详情
			console.log(toWalletList)
			if (toWalletList.length) {
				const targetAccount = this.props.targetAccount ? this.props.targetAccount : this.defaultToWallet;
				let targetVal = toWalletList[0].key,
					targetName = toWalletList[0].name;
				// 父级传递默认目标账户修改默认目标账户
				if (targetAccount) {
					(targetVal = targetAccount),
						(targetName = toWalletList.find((val) => val.key === targetAccount).name);
				}
				this.ec2021Promo(toWalletList);
			}
		}
	}

	setTargetName(v) {
		const currVal = this.state.toWalletList.find((val) => val.key === v);
		this.props.setTargetValue(v, currVal && currVal.name);
	}
	// 获取目标账户列表
	getDepositWallet() {
		GetWalletList((res) => {
			this.setState({
				toWalletList: res.result.fromWallet
			});
			console.log(res)
			this.ec2021Promo(res.result.fromWallet);
		});
	}

	/**
     * @description: 检测EC2021优惠申请
     * @param {*}
     * @return {*}
    */

	ec2021Promo = (toWalletList) => {
		console.log(toWalletList)
		const { id, wallet } = Router.router.query;
		if (id && wallet) {
			const { key, name } = toWalletList.find((val) => val.key === wallet);
			this.props.setTargetValue(key, name);
			this.Bonuslistdata.current.setBonusName(Number(id));
			this.setState({
				ispromo: true
			});
		} else {
			const PREFER_WALLET = localStorage.getItem('PreferWallet');
			PREFER_WALLET && (this.defaultToWallet = PREFER_WALLET);
			this.props.setTargetValue(toWalletList[0].key, toWalletList[0].name);
		}
	};

	render() {
		const {
			getFieldDecorator,
			getFieldValue,
			targetAccount,
			targetValue,
			setBonusValue,
			bonusId,
			bonusVal
		} = this.props;
		const { toWalletList, ispromo } = this.state;

		return (
			<React.Fragment>
				{/* <Item label="目标账户">
					{toWalletList.length ? (
						<Select animation="slide-up" size="large" value={targetValue} onChange={this.setTargetName}>
							{toWalletList.map((value, index) => {
								return (
									<Option value={value.key} key={value.key + index}>
										{value.name}
									</Option>
								);
							})}
						</Select>
					) : (
						<Select size="large" value="加载中..." disabled={true} loading={true} />
					)}
				</Item> */}
				{/* {this.props.depositMethod !== 'CTC' && (
					<BonusList
						setLoading={this.props.setLoading}
						getFieldDecorator={getFieldDecorator}
						getFieldValue={getFieldValue}
						bonusId={bonusId}
						bonusVal={bonusVal}
						setBonusValue={setBonusValue}
						targetValue={targetValue}
						targetAccount={targetAccount}
						ref={this.Bonuslistdata}
						ispromo={ispromo}
						type={'deposit'}
					/>
				)} */}
			</React.Fragment>
		);
	}
}
export default TargetAccount;

/*
 * @Author: Alan
 * @Date: 2022-03-14 16:07:12
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-31 13:16:03
 * @Description: 客服
 * @FilePath: \Mobile\src\components\sbtwo\Balance-Dropdown\index.js
 */
import React from 'react';
import ReactDOM from "react-dom";
import Collapse, { Panel } from 'rc-collapse';
import { connect } from 'react-redux';
import { ACTION_UserInfo_getBalance } from '@/lib/redux/actions/UserInfoAction';
import BalanceList from './BalanceList';
import Wallet from '@/components/Games/Wallet';
import { numberWithCommas } from '@/lib/js/util';
class BalanceDropdown extends React.Component {
	constructor() {
		super();
		this.state = {
			OpenBlance: []
		};
	}
	componentDidMount() {
		const { BalanceInit } = this.props.userInfo;
		const {type, content} = this.props

		//获取钱包余额
		this.props.userInfo_getBalance(true);
		const targetWallet = BalanceInit.find((item) => item.name == type);
		if((BalanceInit.find(item=>item.name==="TotalBal").balance < 20 || targetWallet.balance < 20) && content==="WalletModule"){
				this.onOpenChange();
		}
	}

	onOpenChange = () => {
		this.setState({
			OpenBlance: this.state.OpenBlance.length == 0 ? [ '1' ] : []
		},
		()=>{
			if(this.state.OpenBlance.length){
				document.body.style.overflow ="hidden"
			}else{
				document.body.style.overflow ="unset"
			}
		});
	};

	render() {
		const { BalanceInit } = this.props.userInfo;
		const {className, content, type} = this.props
		let Details = BalanceInit.find((item) => item.name == type);
		console.log(type, 'type')
		console.log(BalanceInit, 'BalanceInit')
		return (
			<div className={`wallet_dropdown ${className}`}>
				<Collapse
					activeKey={this.state.OpenBlance}
					onChange={() => {
						this.onOpenChange();
					}}
				>
					<Panel
						key="1"
						header={
							<div className="title">
								<p className="name">{Details?.localizedName}</p>
								<p>
									<b>{numberWithCommas(Details?.balance,2)} đ</b>
								</p>
							</div>
						}
					>
						{content==="WalletList" && (
							<div className="Transferauto">
								<BalanceList type={type}/>
							</div>
						)}
						{content === "WalletModule" && (
							<Wallet closeCollapse={this.onOpenChange} toWalletDetail={Details}/>
						)}
						{!!this.state.OpenBlance.length && ReactDOM.createPortal(
							<div 
								style={{display:!this.state.OpenBlance.length &&"none"}}
								className="balance-dropdown_mask"
								onClick={()=>{this.onOpenChange();}}
							/> ,
							document.body
						)}
					</Panel>
				</Collapse>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

const mapDispatchToProps = {
	userInfo_getBalance: (newBalanceSB) => ACTION_UserInfo_getBalance(newBalanceSB)
};

export default connect(mapStateToProps, mapDispatchToProps)(BalanceDropdown);

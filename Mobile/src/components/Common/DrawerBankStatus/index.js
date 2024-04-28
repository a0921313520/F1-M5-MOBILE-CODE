/*
 * @Author: Alan
 * @Date: 2022-05-10 22:05:09
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-20 21:47:53
 * @Description: 银行信息
 * @FilePath: \Mobile\src\components\TransactionRecord\DrawerBankinfo.js
 */
import React from 'react';
import Modal from '@/components/View/Modal';
import Flexbox from '@/components/View/Flexbox/';
import BackBar from '@/components/Header/BackBar';
import classNames from 'classnames';
import { ACTION_UserInfo_getBalance, ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import Button from '@/components/View/Button';
import { PopUpLiveChat, numberWithCommas, maskFunction } from '@/lib/js/util';
import Toast from '@/components/View/Toast';
import Drawer from '@/components/View/Drawer';
import { TransactionHistory } from '@/api/wallet';
import ReactIMG from '@/components/View/ReactIMG';
import bankJson from '@/lib/data/BankList.json';

class DrawerBankinfo extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
		};
	}
	componentDidMount() {
	}



	

	render() {
		const { bankStatusInfo, showbankStatus, CloseDetail} = this.props;
		return (
			<Drawer
				style={{ height: '70%' }}
				direction="bottom"
				className="TransactionRecord-drawer"
				onClose={() => {
					CloseDetail();
				}}
				visible={showbankStatus}
			>
				<p className='exit' onClick={() => CloseDetail()}>Đóng</p>
				<h2 className="transfer-drawer-tit">Trạng Thái Ngân Hàng</h2>
				{bankStatusInfo && bankStatusInfo.length && bankStatusInfo.map((item) => {
					return (
						<div className=''>
							{item.enName}
						</div>
					)
				})}

			</Drawer>
		);
	}
}

export default DrawerBankinfo;

/*
 * @Author: Alan
 * @Date: 2022-03-03 12:34:20
 * @LastEditors: Alan
 * @LastEditTime: 2022-09-28 18:03:15
 * @Description: 投注记录
 * @FilePath: \Mobile\src\components\betting-record\Item.js
 */
//import stylesheet from '../../styles/components/_BetRecord.scss';
import React from 'react';
import moment from 'moment';
import { numberWithCommas } from '@/lib/js/util';
import Flexbox from '@/components/View/Flexbox/';
import ReactIMG from '@/components/View/ReactIMG';
import { BsChevronRight } from 'react-icons/bs';
class _BetRecordItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {}

	goDetail = (name, list) => {
		if (!this.props.isDetail) {
			// sessionStorage.setItem('walletType', code);
			// sessionStorage.setItem('walletName', name);
			this.props.setValue(name, list);
			// Router.push('/user/bettingdetail?type=bet');
		}
	};

	render() {
		let { isDetail, Data, fiterList, definedDate, ItemData } = this.props;
		//筛选每组类型的列表数据
		let List = Data.filter(
			(item) => item.providerCode + item.productType == ItemData.providerCode + ItemData.productType
		);
		//图标
		//let walletsIcon = fiterList.find((v) => v.key !== 'All' && ~v.wallets.indexOf(ItemData.providerCode)) || {};
		//总投注金额
		let TotalbetAmount = List.reduce((c, R) => c + R.betAmount, 0);
		// //总输赢金额
		let TotalwinLoss = List.reduce((c, R) => c + R.winLoss, 0);
		return (
			<div
				className={`Shadow-wrapper betrecord-item ${isDetail}`}
				onClick={() => this.goDetail(ItemData.providerCodeLocalizedName, List)}
			>
				<Flexbox className="Title">
					<Flexbox flex="0 0 13%">
						<ReactIMG
							className="Set_GameIcon"
							src={`/img/P5/GameIcon/icon-${ItemData.productType}.png?v=123`}
						/>
					</Flexbox>
					<Flexbox flex="0 0 77%" flexFlow="column" justifyContent="space-between" paddingLeft="20px">
						<h2 className="color-grey">{ItemData.providerCodeLocalizedName || ''}</h2>
						<div className="dl-time color-grey">
							{moment(definedDate[0]).format('YYYY/MM/DD') +
								'~' +
								moment(definedDate[1]).format('YYYY/MM/DD')}
						</div>
					</Flexbox>
					<Flexbox flex="0 0 10%" alignItems="center">
						<BsChevronRight size={17} color="#CCCCCC" />
					</Flexbox>
				</Flexbox>
				{/* <Icon type="right" /> */}
				<Flexbox className="textAlign-center">
					<Flexbox flex={'1'} justifyContent="center">
						<ul className="betrecord-amount-wrap">
							<li className="betrecord-amount-title">Tổng tiền cược</li>
							<li className={`color-grey  betrecord-amount`}>
								{Number(TotalbetAmount) < 0 ? '-' : '+'}{Math.abs(TotalbetAmount) ? (
									numberWithCommas(Math.abs(TotalbetAmount))
								) : (
									'0.00'
								)} đ
							</li>
						</ul>
					</Flexbox>
					<Flexbox flex={'1'} justifyContent="center">
						<ul className="betrecord-amount-wrap">
							<li>Tổng tiền thắng/thua</li>
							<li className={`betrecord-amount ${TotalwinLoss < 0 ? 'color-red' : 'color-green'}`}>
								{Number(TotalwinLoss) < 0 ? '-' : '+'}{Math.abs(TotalwinLoss) ? (
									numberWithCommas(Math.abs(TotalwinLoss))
								) : (
									'0.00'
								)} đ
							</li>
						</ul>
					</Flexbox>
				</Flexbox>
			</div>
		);
	}
}

export default _BetRecordItem;

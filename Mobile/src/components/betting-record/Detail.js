/*
 * @Author: Alan
 * @Date: 2022-05-10 22:05:09
 * @LastEditors: Alan
 * @LastEditTime: 2022-09-28 18:04:10
 * @Description: 返水详情
 * @FilePath: \Mobile\src\components\betting-record\Detail.js
 */
import React from 'react';
import Modal from '@/components/View/Modal';
import Flexbox from '@/components/View/Flexbox/';
import BackBar from '@/components/Header/BackBar';
import classNames from 'classnames';
import { ACTION_UserInfo_getBalance, ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import moment from 'moment';
import { numberWithCommas } from '@/lib/js/util';
class PromoInfo extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {};
	}
	componentDidMount() {}

	render() {
		const { ShowDetail, CloseDetail, DetailItem, DetailInfo } = this.props;
		console.log('投注记录详情--------->>>>', DetailItem);
		console.log('投注记录标题--------->>>>', DetailInfo);
		return (
			<div className="RebateDetail">
				<Modal
					visible={ShowDetail}
					transparent
					maskClosable={false}
					closable={false}
					title={
						<BackBar
							key="main-bar-header"
							title={DetailInfo.name}
							backEvent={() => {
								CloseDetail();
							}}
							hasServer={true}
						/>
					}
					className={classNames({
						'Fullscreen-Modal': true,
						RebateModalDetail: true
					})}
				>
					{DetailInfo.list.map((item, i) => {
						return (
							<Flexbox
								width="100%"
								key={i + 'list'}
								className="itemList"
								flexFlow="column"
								marginBottom="10px"
							>
								<Flexbox justifyContent="space-between">
									<span className="gray">Ngày</span>
									<span>{moment(new Date(item.dateLabel)).format('DD/MM/YYYY')}</span>
								</Flexbox>
								<Flexbox justifyContent="space-between">
									<span className="gray">Tiền cược</span>
									<span>{numberWithCommas(item.betAmount)} đ</span>
								</Flexbox>
								<Flexbox justifyContent="space-between">
									<span className="gray">Doanh thu cược</span>
									<span>{numberWithCommas(item.validTurnoverAmount)} đ</span>
								</Flexbox>
								<Flexbox justifyContent="space-between">
									<span className="gray">Tiền thắng/thua</span>
									<span
										className={classNames({
											green: item.winLoss >= 0,
											red: item.winLoss < 0
										})}
									>
										{Number(item.winLoss) < 0 ? '-' : '+'}{Math.abs(item.winLoss) ? numberWithCommas(Math.abs(item.winLoss)) : '0.00'} đ
									</span>
								</Flexbox>
							</Flexbox>
						);
					})}
				</Modal>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

const mapDispatchToProps = {
	userInfo_getBalance: (forceUpdate = false) => ACTION_UserInfo_getBalance(forceUpdate),
	userInfo_getDetails: () => ACTION_User_getDetails()
};

export default connect(mapStateToProps, mapDispatchToProps)(PromoInfo);

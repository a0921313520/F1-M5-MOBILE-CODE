/*
 * @Author: Alan
 * @Date: 2022-05-10 22:05:09
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-23 18:24:12
 * @Description: 返水详情
 * @FilePath: \Mobile\src\components\Promotions\Rebate\Detail.js
 */
import React from 'react';
import Modal from '@/components/View/Modal';
import Flexbox from '@/components/View/Flexbox/';
import BackBar from '@/components/Header/BackBar';
import classNames from 'classnames';
import { ACTION_UserInfo_getBalance, ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import moment from 'moment';
class PromoInfo extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {};
	}
	componentDidMount() {}

	render() {
		const { ShowDetail, CloseDetail, DetailItem } = this.props;
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
							title={this.props.detailTitle}
							backEvent={() => {
								CloseDetail();
							}}
							// hasServer={true}
						/>
					}
					className={classNames({
						'Fullscreen-Modal': true,
						RebateModalDetail: true
					})}
				>
					{DetailItem.map((item, i) => {
						return (
							<Flexbox
								width="100%"
								key={i + 'list'}
								className="itemList"
								flexFlow="column"
								marginBottom="10px"
							>
								<Flexbox justifyContent="space-between">
									<span className="gray">Hoàn Trả Tại</span>
									<span>{this.props.detailTitle}</span>
								</Flexbox>
								<Flexbox justifyContent="space-between">
									<span className="gray">Yêu cầu</span>
									<span>{item.totalBetAmount}</span>
								</Flexbox>
								<Flexbox justifyContent="space-between">
									<span className="gray">Tiền thưởng</span>
									<span>{item.totalGivenAmount} đ</span>
								</Flexbox>
								<Flexbox justifyContent="space-between">
									<span className="gray">Số tham chiếu</span>
									<span>{item.rebateId}</span>
								</Flexbox>
								<Flexbox justifyContent="space-between">
									<span className="gray">Ngày</span>
									<span>{moment(new Date(item.applyDate)).format('DD/MM/YYYY')}</span>
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

/* 串关购物车浮窗 */
import React from 'react';
import { ReactSVG } from '$SBTWO/ReactSVG';
import Toast from '$SBTWO/Toast';
import Router from 'next/router';
import { connect } from 'react-redux';
import { ACTION_BetCart_setIsComboBet } from '@/lib/redux/actions/BetCartAction';

class _BetCartPopup extends React.Component {
	state = {};
	render() {
		const { Vendor } = this.props;
		const isComboBet = this.props.betCartInfo['isComboBet' + Vendor.configs.VendorName];
		const betCartData = this.props.betCartInfo['betCart' + Vendor.configs.VendorName];
		return (
			<div
				className="BetCartPopup"
				onClick={async () => {
					let betCartTabId = isComboBet == true ? 2 : 1; //1單注2串關
					if (isComboBet == true && betCartData.length < 2) {
						//投注選項不滿兩個，就切回單注模式
						await this.props.betCart_setIsComboBet(false, Vendor.configs.VendorName);
						betCartTabId = 1;
					}
					this.props.ShowBottomSheet(betCartTabId);
					if (Router.router.pathname.indexOf('/detail') == -1) {
						// Pushgtagdata(`Game Nav`, 'Click', 'Betcart_MainPage_SB2.0');
					} else {
						// Pushgtagdata(`Game Nav`, 'Click', 'Betcart_MatchPage_SB2.0');
					}
				}}
			>
				<div className="Content">
					<ReactSVG className="BetCartIcon" src="/img/svg/betting/Group.svg" />
					<span className="num">{betCartData.length}</span>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	betCartInfo: state.betCartInfo,
});

const mapDispatchToProps = {
	betCart_setIsComboBet: ACTION_BetCart_setIsComboBet,
};

export default connect(mapStateToProps, mapDispatchToProps)(_BetCartPopup);

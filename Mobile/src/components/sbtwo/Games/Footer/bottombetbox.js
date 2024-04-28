import React from 'react';
import dynamic from 'next/dynamic';
import BetCart from './BetCart';
import Sheet, { SheetRef } from 'react-modal-sheet';
class _Bottombetbox extends React.Component {
	constructor(props) {
		super();
		this.state = {
			isBottomSheetVisible: false,
			active: 0,
			BetType: 1 /* 1 默认 2 串关 3 系统串关 */
		};
		this._refCheckBetting = React.createRef();
	}

	componentDidMount() {
		this.props.BetCartRef && this.props.BetCartRef(this);
	}

	/* 打开投注窗 */
	ShowBottomSheet = (type) => {
		this.setState({ isBottomSheetVisible: true, BetType: type });
		setTimeout(() => {
			/* 防止ipone失效 */
			document.getElementsByTagName('html')[0].style.position = 'fixed';
			document.body.style.overflowY = 'hidden';
		}, 50);
	};

	/* 关闭投注窗  */
	CloseBottomSheet = () => {
		/* 投注等待中 禁止关闭投注窗口 防止意外的错误 */
		if (this._refCheckBetting.current && this._refCheckBetting.current.state.StartBettingloading == 1)
			return;
		this.setState({ isBottomSheetVisible: false });
		setTimeout(() => {
			document.getElementsByTagName('html')[0].style.position = 'unset';
			const isOnlyASheet = document.querySelectorAll(".react-modal-sheet-content").length <=1 ;
			const isNoModal = document.querySelectorAll(".modal").length <1 ;
			if(isOnlyASheet && isNoModal){
				document.body.style.overflowY = 'auto';
			}
		}, 50);
	};

	render() {
		/* 会员投注选择的盘口数据 */
		const { isBottomSheetVisible, BetType } = this.state;

		return (
			<div className="BetContent">
				<Sheet isOpen={isBottomSheetVisible} onClose={() => this.CloseBottomSheet()}>
					<Sheet.Container>
						<Sheet.Content>
							<div className="BottomBetSheet">
								<div className="Center">
									<BetCart
										/* 传递 */
										ref={this._refCheckBetting}
										/* 厂商数据回调模块 */
										Vendor={this.props.Vendor}
										/* 投注类型 */
										BetType={BetType}
										/* 详情页 布尔 */
										DetailPage={this.props.DetailPage}
										/* 删除购物车 */
										RemoveBetCart={this.props.RemoveBetCart}
										/* 关闭弹窗 */
										CloseBottomSheet={this.CloseBottomSheet}
										isBottomSheetVisible={isBottomSheetVisible}
									/>
								</div>
							</div>
						</Sheet.Content>
					</Sheet.Container>
					<Sheet.Backdrop onClick={() => this.CloseBottomSheet()} />
				</Sheet> 
			</div>
		);
	}
}
export default _Bottombetbox;

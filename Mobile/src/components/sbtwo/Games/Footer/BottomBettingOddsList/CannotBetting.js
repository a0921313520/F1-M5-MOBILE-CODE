/*----------- 当投注条件不成立时 无法投注时 显示 ---------- */
import React from 'react';
import Toast from '$SBTWO/Toast';
class CannotBetting extends React.Component {
	render() {
		const { type, isNotEnoughSelections } = this.props;
		let message = () => {
			if (type == 2 && isNotEnoughSelections) {
				return '混合过关最少需要选取两个以上的有效投注选项呦';
			}
			if (type == 3 && isNotEnoughSelections) {
				return '系统混合过关最少需要选取三个以上的有效投注选项呦';
			}
			return '暂时无法投注';
		};
		return (
			<div className="Bottom-flex">
				<div className="total-amount">
					<label className="gray">总投注额</label>
					<b>￥ 0</b>
				</div>
				<div className="total-amount">
					<label className="gray">可赢金额</label>
					<b>￥ 0</b>
				</div>
				<div className="BetingBtn">
					<button
						className="Btn-left"
						onClick={() => {
							this.props.RemoveBetCart();
							// Pushgtagdata(`Game Feature`, 'Click', 'Clear_BetCart_SB2.0');
						}}
					>
						全部清除
					</button>

					<button
						className="Btn-right"
						style={{
							color: '#ccc'
						}}
						onClick={() => {
							Toast.error(message());
						}}
					>
						<big>投注</big>
					</button>
				</div>
			</div>
		);
	}
}
export default CannotBetting;

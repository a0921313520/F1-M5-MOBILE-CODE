{
	/* 點擊菜單的「更多」出現的下浮窗 列表頁 和 詳情頁 都有使用  */
}

import React from 'react';
import dynamic from 'next/dynamic';
const SwipeableBottomSheet = dynamic(import('react-swipeable-bottom-sheet'), { ssr: false });
export default class _Bottomsheet extends React.Component {
	state = {
		isBottomSheetVisible: false
	};

	show = () => {
		this.setState({ isBottomSheetVisible: true });
		setTimeout(() => {
			document.body.style.overflow = 'hidden';
		}, 50);
	};
	render() {
		const {
			hasDefaultButton,
			defaultButtonText,
			items,
			selectedItem,
			formatItem,
			getItemKey,
			headerName,
			isLandscape
		} = this.props;
		const { isBottomSheetVisible } = this.state;
		return items && items.length > 0 ? (
			<div>
				<SwipeableBottomSheet
					style={{
						zIndex: 1060,
						width: isLandscape ? '40%' : '100vw',
						right: 0,
						left: isLandscape ? 'auto' : 0,
						display: isBottomSheetVisible ? 'initial' : 'none', //處理safari 下巴網址列問題
					}}
					bodyStyle={{
						height: '50vh'
					}}
					overflowHeight={0}
					marginTop={128}
					open={isBottomSheetVisible}
					onChange={(isOpen) => {
						this.setState({
							isBottomSheetVisible: isOpen
						});
						setTimeout(() => {
							document.body.style.overflow = 'unset';
						}, 50);
					}}
					key={isBottomSheetVisible}
				>
					<div className="BottomSheet">
						<div className="Header">
							<h3>{headerName}</h3>
						</div>
						<ul>
							{hasDefaultButton ? ( //默認按鈕(詳情頁使用)
								<li
									className={selectedItem === null ? 'active' : ''}
									onClick={() => {
										this.setState({
											isBottomSheetVisible: false
										});
										this.props.onClickItem(null, -1);
										setTimeout(() => {
											document.body.style.overflow = 'unset';
										}, 50);
									}}
								>
									{defaultButtonText}
								</li>
							) : null}
							{items.map((item, index) => {
								const itemKey = getItemKey(item);
								const selectedItemKey = selectedItem ? getItemKey(selectedItem) : null;
								return (
									<li
										key={itemKey}
										className={selectedItemKey === itemKey ? 'active' : ''}
										onClick={() => {
											this.setState({
												isBottomSheetVisible: false
											});
											this.props.onClickItem(item, index);
											setTimeout(() => {
												document.body.style.overflow = 'unset';
											}, 50);
										}}
									>
										{formatItem(item)}
									</li>
								);
							})}
						</ul>
					</div>
				</SwipeableBottomSheet>
			</div>
		) : null;
	}
}

import React from 'react';
import dynamic from 'next/dynamic';
import { ReactSVG } from '$SBTWO/ReactSVG';
import moment from 'moment';
const SwipeableBottomSheet = dynamic(import('react-swipeable-bottom-sheet'), { ssr: false });
export default class _Bottomtime extends React.Component {
	state = {
		isBottomSheetVisible: false,
		active: 0
	};

	ShowBottomSheet = () => {
		this.setState({ isBottomSheetVisible: true });
		setTimeout(() => {
			document.body.style.overflow = 'hidden';
		}, 50);
	};
	render() {
		const { Selectdate, SportId } = this.props;
		const { isBottomSheetVisible } = this.state;
		/* 未来10天 */
		let Nextdays = [];
		for (var i = 0; i < 10; i++) {
			Nextdays.unshift(moment(new Date(new Date().setDate(new Date().getDate() + i))).format('YYYY/MM/DD'));
		}

		//格式不一樣，要轉一下，傳入的格式是 YYYY-MM-DD
		let SelectdateFormated = null;
		if (Selectdate) {
			SelectdateFormated = moment(Selectdate).format('YYYY/MM/DD');
		}
		return (
			<div>
				<SwipeableBottomSheet
					style={{
						zIndex: 999
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
					<div className="BottomtimeSheet">
						<div className="Header">
							<h3>选择日期</h3>
						</div>
						<ul>
							{Nextdays.sort().map((item, index) => {
								return (
									<li
										key={index}
										className={
											/* 只有足球默认日期是后天 */
											SportId == 1 && index == 0 && !Selectdate ? (
												'active'
											) : SportId != 1 && index == 2 && !Selectdate ? (
												'active'
											) : SelectdateFormated === item ? (
												'active'
											) : (
												''
											)
										}
										onClick={() => {
											this.setState({
												active: index
											});
											this.props.ChangeGame(item);
										}}
									>
										{item.substring(5)}
									</li>
								);
							})}
						</ul>
					</div>
				</SwipeableBottomSheet>
				<div
					className="Bottomtime"
					onClick={() => {
						this.setState({
							isBottomSheetVisible: true
						});
					}}
				>
					日期<ReactSVG className="Betting-Bottomtime-svg" src={'/img/svg/betting/calendar.svg'} />
				</div>
			</div>
		);
	}
}

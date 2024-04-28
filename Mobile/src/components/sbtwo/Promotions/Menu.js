import React from 'react';
import Collapse, { Panel } from 'rc-collapse';
import ReactIMG from '@/components/View/ReactIMG';
import Flexbox from '@/components/View/Flexbox/';
import { IoCloseCircle } from 'react-icons/io5';
import classNames from 'classnames';
import { BsFilter } from 'react-icons/bs';

class PromotionsMenu extends React.Component {
	render() {
		const {
			PromotionCategories,
			selectValue,
			selectTabFlag,
			selectFilterName,
			piwikObj,
			openfilterList,
			categories
		} = this.props;
		console.log(categories);
		return (
			<div className="wrapContain">
				<Collapse
					activeKey={openfilterList}
					onChange={() => {
						this.props.openfilter();
						// globalGtag('Filter_promopage');
					}}
				>
					<Panel
						key="1"
						header={
							<div className="promoteFilter">
								<span>筛选</span>
								<BsFilter size="20" color="white" />
							</div>
						}
					>
						<Flexbox className="Title">优惠种类</Flexbox>
						<Flexbox flexFlow="wrap">
							<div className="filterIcon">
								<div
									className={classNames({
										Active: selectValue == 'all',
										selectCircle: true
									})}
									onClick={() => {
										this.setState({
											selectValue: 'all'
										});
										this.props.setSelectValue('all');
										// globalGtag('All_filter_promopage');
									}}
								>
									<ReactIMG src="/img/icon-all.png" alt="全部" className="All" />
								</div>
								<div>全部</div>
							</div>
							{categories &&
								categories.map((item, i) => {
									return (
										<div className="filterIcon" key={i}>
											<div>
												<div
													className={classNames({
														Active: selectValue == item.PromoCatCode,
														selectCircle: true
													})}
													onClick={() => {
														this.props.setSelectValue(item.PromoCatCode);
														// globalGtag(
														// 	piwikObj.find((ele) => ele.id === item.PromoCatID)
														// 		? piwikObj.find((ele) => ele.id === item.PromoCatID)
														// 				.key1
														// 		: ''
														// );
													}}
												>
													<img
														src={item.promoCatImageUrl}
														alt={item.resourcesName}
														width="40px"
														height="40px"
													/>
												</div>
											</div>
											<div>{item.resourcesName}</div>
										</div>
									);
								})}
						</Flexbox>
						<div
							className="filterSubmitBtn"
							onClick={() => {
								this.props.onfilterData();
							}}
						>
							提交
						</div>
						<div className="Mask" />
					</Panel>
				</Collapse>
				{/* 筛选标签 */}
				{selectTabFlag && (
					<div onClick={() => this.props.selectType()}>
						<div className="selectTab">
							<span> {selectFilterName}</span>
							<IoCloseCircle size="12" color="#ffffffb5" />
						</div>
					</div>
				)}
			</div>
		);
	}
}
export default PromotionsMenu;

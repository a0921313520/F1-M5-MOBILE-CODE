/*
 * @Author: Alan
 * @Date: 2022-05-15 13:51:41
 * @LastEditors: Alan
 * @LastEditTime: 2022-05-17 13:05:55
 * @Description: 我的优惠
 * @FilePath: \Mobile\src\components\Promotions\MyPromotions\index.js
 */
import React from 'react';
import Tabs, { TabPane } from 'rc-tabs';
import AppliedHistory from './AppliedHistory';
import AppliedFreebet from './AppliedFreebet';
class MyPromotionsHistory extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tab:'1', //1 My promotion (History) 2 Freebet
			HideInvalid: true,
			openedAppliedPopoverIndex:false, //My Promotion 內開啟的popover index
			openedFreebetPopoverIndex:false, // My promotion Freebet頁面開啟的popover index
		};
	}
	tabChangeHandler = (e)=>{
		this.setState({
			openedAppliedPopoverIndex:false,
			openedFreebetPopoverIndex:false,
			tab:e
		})
		if(e==='1'){
			Pushgtagdata("Promotion_MyPromotion", "Switch to Applied Promotion", "My_Promotion_C_Applied")
		}
		if(e==='2'){
			Pushgtagdata("Promotion_MyPromotion", "Switch to Freebet", "My_Promotion_C_FreeBet")
		}
		window.scrollTo({top:0})
	}

	render() {
		const {openedFreebetPopoverIndex, openedAppliedPopoverIndex, tab} = this.state;
		return (
			<div className="PromotionsTabs">
				<Tabs prefixCls="tabsNormal" defaultActiveKey="1" activeKey={tab}  onChange={this.tabChangeHandler}>
					<TabPane tab="Khuyến mãi đã tham gia" key="1" >
						<AppliedHistory 
							setOpenPopoverIndex={(index)=>{this.setState({openedAppliedPopoverIndex:index})}} 
							openedAppliedPopoverIndex={openedAppliedPopoverIndex}
							tab={tab}
						/>
					</TabPane>
					<TabPane tab="Thưởng miễn phí của tôi" key="2" >
						<AppliedFreebet 
							setOpenPopoverIndex={(index)=>{this.setState({openedFreebetPopoverIndex:index})}} 
							openedFreebetPopoverIndex={openedFreebetPopoverIndex}
							tabChangeHandler={this.tabChangeHandler} 
						/>
					</TabPane>
				</Tabs>
			</div>
		);
	}
}

export default MyPromotionsHistory;

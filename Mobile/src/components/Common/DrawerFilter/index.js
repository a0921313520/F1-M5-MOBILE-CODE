/*
 * @Author: Alan
 * @Date: 2022-03-03 00:07:25
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-26 17:38:30
 * @Description: 抽屉组件
 * @FilePath: \Mobile\src\components\Common\DrawerFilter\index.js
 */
import React from 'react';
import ReactIMG from '@/components/View/ReactIMG';
class _DrawerFilter extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// seletId:'All',
			// fiterList:[]
		};
	}

	componentDidMount() {
		// this.getWalletType();
	}

	// getWalletType=()=>{
	// 	Toast.loading('加载中...',3)
	// 	fetchRequest(ApiPort.GetProductCategories, 'GET')
	// 		.then((res) => {
	//             Toast.hide();
	//             if( res && res.length ){

	//                 for(let i=0; i < res.length; i++){
	//                     if(res[i].key=='All'){
	//                         res = res.splice(i,1).concat(res)
	//                     }
	//                 }

	//                 //console.log(444,res)

	//                 this.setState({
	//                     fiterList:res
	//                 })
	//             }
	// 		})
	// 		.catch((error) => {
	// 			//console.log(error);
	// 		});
	// }

	chooseType = (seletId) => {
		this.props.walletTypeChg(seletId);
	};

	closeDrawer = () => {
		this.props.changeDrawer();
	};

	submit = () => {
		this.props.submit(this.state.seletId);
	};

	render() {
		const { seletId, data } = this.props;
		return (
			<div className="drawerfilter-wrap">
				{/* <Flex className='drawerfilter-header'>
					<Flex.Item>
						<div className='filter-wrap'
							onClick={this.closeDrawer}
						>
							<span >筛选</span>
							<span className='icon-filter'></span>
						</div>
					</Flex.Item>
				</Flex> */}
				<div className="drawerfilter-container">
					<h2>Chọn Sản Phẩm</h2>
					<ul className="filter-list">
						{data.map((item, index) => {
							return (
								<li
									key={item.productType}
									className={`${seletId == item.productType ? 'active' : ''}`}
									onClick={() => this.chooseType(item.productType)}
								>
									<dl>
										<dt>
											<div className='setICON'>
												<ReactIMG
													className="Set_GameIcon"
													src={`/img/P5/GameIcon/icon-${item.productType.toLowerCase()}.png`}
												/>
											</div>
										</dt>
										<dd>{item.localizedName}</dd>
									</dl>
								</li>
							);
						})}
					</ul>
					<div className="filter-button" onClick={this.submit}>
						<span>Chọn</span>
					</div>
				</div>
			</div>
		);
	}
}

export default _DrawerFilter;

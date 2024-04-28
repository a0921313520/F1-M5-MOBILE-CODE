/*
 * @Author: Alan
 * @Date: 2022-02-08 17:48:31
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-13 10:24:34
 * @Description: 游戏平台
 * @FilePath: \Mobile\src\components\Games\DrawerCategories.js
 */
import React, { Component } from 'react';
import Flexbox from '@/components/View/Flexbox/';
class PublicViewSecond extends Component {
	render() {
		const { GamesList, ProviderMenuActive, setProviderMenuActive, TypeName, Type } = this.props;
		console.log(this.props, 'props')

		return (
			<React.Fragment>
				<h3>
					<b>{TypeName}</b>
				</h3>
				<div className={`MenuType  ${Type == 'Slot' ? 'Game-type' : ''}`}>
					<div
						className="ProviderMenu Radio-Type-list"
						onClick={() => {
							setProviderMenuActive('');
						}}
					>
						<div>Tất cả</div>
						<div className={`cap-item-circle${ProviderMenuActive === '' ? ' curr' : ''}`} />
					</div>
					{GamesList.ProvidersList &&
						GamesList.ProvidersList.map((item, index) => {
							console.log(item);
							return (
								<div
									className="ProviderMenu Radio-Type-list"
									key={index}
									onClick={() => {
										let setitem = {
											name: item.providerName,
											type: item.providerCode,
											menu: 'provider'
										};

										setProviderMenuActive(item.providerCode, setitem);
									}}
								>
									<Flexbox>
										{item.providerName}{' '}
										{item.isNew && (
											<div className="New">
												<div>New</div>
											</div>
										)}
										{item.isHot && (
											<div className="Hot">
												<div>Hot</div>
											</div>
										)}
									</Flexbox>

									<div
										className={`cap-item-circle${ProviderMenuActive === item.providerCode
											? ' curr'
											: ''}`}
									/>
								</div>
							);
						})}
				</div>
			</React.Fragment>
		);
	}
}

export default PublicViewSecond;

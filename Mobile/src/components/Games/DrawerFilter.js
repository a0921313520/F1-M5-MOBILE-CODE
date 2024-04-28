/*
 * @Author: Alan
 * @Date: 2022-02-08 17:48:31
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-13 23:12:32
 * @Description: 游戏类型
 * @FilePath: \Mobile\src\components\Games\DrawerFilter.js
 */
import React, { Component } from 'react';
class PublicViewSecond extends Component {
	componentDidUpdate(prevProps){
		const { setCategoriesMenuActive, Type,filteringItem } = this.props;
		if(prevProps.isFilterEditing!==this.props.isFilterEditing){
			if(!this.props.isFilterEditing){
				if(filteringItem){
					setCategoriesMenuActive(filteringItem.type, filteringItem);
				}else{
					setCategoriesMenuActive('',{name:"All", type:"", menu: Type});
				}
			}
		}
	}
	render() {
		const { GamesList, CategoriesMenuActive, setCategoriesMenuActive, TypeName, Type, isFilterEditing, onFilterEditing,	filteringItem,gameType } = this.props;
		return (
			<React.Fragment>
				<h3>{TypeName}</h3>
				<div className={`MenuType Game-type ${gameType}`}>
				{Type !== "Line" && //陪付線已回傳全部類型
					<>
						<div
						className="Radio-Type-list"
						onClick={() => {
							onFilterEditing()
							setCategoriesMenuActive('',{name:"All", type:"", menu:Type});
						}}
						>						
							<div>Tất cả</div>
							<div className={`cap-item-circle${isFilterEditing && CategoriesMenuActive === '' ? ' curr' : ''} ${(!isFilterEditing && (filteringItem?.name==="All"||!filteringItem?.type)) ? "selected" : "" } `} />
					</div>
					</>}
					{GamesList.CategoriesList &&
						GamesList.CategoriesList.map((item, index) => {
							if (item.categoryType == Type) {
								return (
									<div
										className="Radio-Type-list"
										key={index}
										onClick={() => {
											onFilterEditing()
											let setitem = {
												name: item.name,
												type: item.category,
												menu: Type
											};

											setCategoriesMenuActive(item.category, setitem);
										}}
									>
										<div>{item.name}</div>
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
										<div
											className={`cap-item-circle${isFilterEditing && CategoriesMenuActive === item.category
												? ' curr'
												: ''} ${(!isFilterEditing && filteringItem?.type===item.category || (!isFilterEditing && !filteringItem && item.category === "AllPaylines")) ? "selected" : "" }`}
										/>
									</div>
								);
							}
						})}
				</div>
			</React.Fragment>
		);
	}
}

export default PublicViewSecond;

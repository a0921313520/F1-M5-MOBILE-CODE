export const ACTION_BETCART_UPDATE = 'ACTION_BETCART_UPDATE';

//設定是否 串關模式
export const ACTION_BetCart_setIsComboBet = (isComboBet = false, vendorName) => {
	let action = {
		type: ACTION_BETCART_UPDATE,
		payload: {},
	};

	action.payload['isComboBet' + vendorName] = isComboBet;

	return action;
}

//添加一個項目 到 投注購物車 中
export const ACTION_BetCart_add = (selectionData, vendorName) => {
	return async (dispatch, getState) => { //用async實現 可用 then 或 await 去等數據變更後的結果
		const betCartInfo = getState().betCartInfo;
		const betCartPropName = 'betCart' + vendorName;
		const thisBetCart =  betCartInfo[betCartPropName] ?? [];

		let addedBetCart = [...thisBetCart];
		//如果有同EventId的盤口，取代
		const sameEventIdIndex = thisBetCart.findIndex(item => item.EventId == selectionData.EventId);
		if (sameEventIdIndex !== -1) {
			addedBetCart.splice(sameEventIdIndex, 1,selectionData); //取代
		} else {
			//記得不要用array.push，會變成直接修改原數組，redux正確的用法是要用新的數組取代
			addedBetCart = thisBetCart.concat([selectionData]);
		}

		let action = {
			type: ACTION_BETCART_UPDATE,
			payload: {},
		};

		action.payload[betCartPropName] = addedBetCart;

		return dispatch(action);
	}
}

//從 投注購物車 中 刪除單個項目
export const ACTION_BetCart_remove = (selectionData, vendorName) => {
	return async (dispatch, getState) => {  //用async實現 可用 then 或 await 去等數據變更後的結果
		const betCartInfo = getState().betCartInfo;
		const betCartPropName = 'betCart' + vendorName;
		const thisBetCart =  betCartInfo[betCartPropName];
		if (!thisBetCart || thisBetCart.length <= 0) {
			return Promise.resolve();
		}

		const filteredBetCart = thisBetCart.filter(item => item.EventId != selectionData.EventId);

		let action = {
			type: ACTION_BETCART_UPDATE,
			payload: {},
		};

		action.payload[betCartPropName] = filteredBetCart;

		return dispatch(action);
	}
}

//清理 投注購物車
export const ACTION_BetCart_clear = (vendorName) => {
	return async (dispatch, getState) => { //用async實現 可用 then 或 await 去等數據變更後的結果
		const betCartInfo = getState().betCartInfo;
		const betCartPropName = 'betCart' + vendorName;
		const thisBetCart =  betCartInfo[betCartPropName];
		if (!thisBetCart || thisBetCart.length <= 0) {
			return Promise.resolve();
		}

		let action = {
			type: ACTION_BETCART_UPDATE,
			payload: {},
		};

		action.payload[betCartPropName] = [];

		return dispatch(action);
	}
}
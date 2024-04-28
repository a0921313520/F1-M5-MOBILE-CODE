import { ACTION_BETCART_UPDATE } from '../actions/BetCartAction';

export const getInitialState = () => ({
	//選擇的投注購物車,SelectionData數組
	betCartIM: [],
	betCartBTI: [],
	betCartSABA: [],

	//是否串關模式
	isComboBetIM: false,
	isComboBetBTI: false,
	isComboBetSABA: false,
});

const BetCartReducer = (state = getInitialState(), action) => {
	switch (action.type) {
		case ACTION_BETCART_UPDATE:
			return { ...state, ...action.payload };
		default:
			return state;
	}
};

export default BetCartReducer;

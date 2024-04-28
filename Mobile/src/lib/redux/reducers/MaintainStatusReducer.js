import {ACTION_MAINTAINSTATUS_UPDATE} from '../actions/MaintainStatusAction';

//維護狀態，true表示維護中
//noToken表示獲取VendorToken失敗，視為維護中，但需要和維護狀態分開保存
export const getInitialState = () => ({
	isBTI: false,
	isIM: false,
	isSABA: false,
	noTokenBTI: false,
	noTokenIM: false,
	noTokenSABA: false,
});

const MaintainStatusReducer = (state = getInitialState(), action) => {
	switch (action.type) {
		case ACTION_MAINTAINSTATUS_UPDATE:
			return { ...state, ...action.payload };
		default:
			return state;
	}
};

export default MaintainStatusReducer;

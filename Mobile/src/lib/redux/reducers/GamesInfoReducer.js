/*
 * @Author: Alan
 * @Date: 2022-03-21 17:19:40
 * @LastEditors: Alan
 * @LastEditTime: 2022-03-21 21:23:08
 * @Description: 游戏相关
 * @FilePath: \Mobile\src\lib\redux\reducers\GamesInfoReducer.js
 */
import { ACTION_GAMESINFO_UPDATE } from '../actions/GamesInfoAction';

//用戶設置 全域數據
export const getInitialState = () => ({
	GameDetailsDescAndBanner:[]
});

const GamesInfoReducer = (state = getInitialState(), action) => {
	switch (action.type) {
		case ACTION_GAMESINFO_UPDATE: //更新數據
			//console.log('===usersetting update to : ', action.payload);
			return { ...state, ...action.payload };
		default:
			return state;
	}
};

export default GamesInfoReducer;

//紀錄路由變化
import {ACTION_ROUTERLOG_LOG} from '../actions/RouterLogAction';

export const getInitialState = () => ({});

const RouterLogReducer = (state = getInitialState(), action) => {
  switch (action.type) {
    case ACTION_ROUTERLOG_LOG: //更新數據
      //console.log('===userinfo update to : ', action.payload);
      return {...state, ...action.payload};
    default:
      return state;
  }
};

export default RouterLogReducer;

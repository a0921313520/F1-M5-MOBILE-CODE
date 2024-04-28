import thunk from "redux-thunk";
import { createStore, applyMiddleware } from "redux";
import {createWrapper, HYDRATE} from 'next-redux-wrapper'; //HYDRATE是 server rendering 才有用
import RootReducer from './reducers/RootReducer';
import HostConfig from '@/server/Host.config';
import SelectionData from "$SBTWOLIB/vendor/data/SelectionData";
import { getInitialState as getInitialStateOfUserInfo } from "./reducers/UserInfoReducer";
import { getInitialState as getInitialStateOfBetCart } from "./reducers/BetCartReducer";

// BINDING MIDDLEWARE
const bindMiddleware = (middleware) => {
  if (!HostConfig.Config.isLIVE) {
    const { composeWithDevTools } = require("redux-devtools-extension");
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

const makeStore = ({ isServer }) => {
  if (isServer) {
    //If it's on server side, create a store
    return createStore(RootReducer, bindMiddleware([thunk]));
  } else {
    //If it's on client side, create a store which will persist
    const { persistStore, persistReducer, createTransform, createMigrate } = require("redux-persist");
    const storage = require("redux-persist/lib/storage").default;

    //特別處理投注購物車，因為redux-persist取出時 需要轉換為SelectionData
    const betCartTransform = createTransform(
      // transform state on its way to being serialized and persisted.
      null,
      // transform state being rehydrated
      (outboundState, key) => {
        // convert mySet back to a Set.
        return {
          //選擇的投注購物車,SelectionData數組
          betCartIM: (outboundState.betCartIM && outboundState.betCartIM.length > 0) ? outboundState.betCartIM.map(item => SelectionData.clone(item)) : [],
          betCartBTI: (outboundState.betCartBTI && outboundState.betCartBTI.length > 0) ? outboundState.betCartBTI.map(item => SelectionData.clone(item)) : [],
          betCartSABA: (outboundState.betCartSABA && outboundState.betCartSABA.length > 0) ? outboundState.betCartSABA.map(item => SelectionData.clone(item)) : [],

          //是否串關模式
          isComboBetIM: !!outboundState.isComboBetIM,
          isComboBetBTI: !!outboundState.isComboBetBTI,
          isComboBetSABA: !!outboundState.isComboBetSABA,
        };
      },
      // define which reducers this transform gets called for.
      { whitelist: ['betCartInfo'] }
    )

    const initialStateOfUserInfo = getInitialStateOfUserInfo();
    const initialStateOfBetCart = getInitialStateOfBetCart();

    //處理接入sb2.0之後的數據結構升級
    const migrations = createMigrate({
      1: (state) => {
        return {
          ...state,
          userInfo : {
            ...state.userInfo,
            balanceSB: initialStateOfUserInfo.balanceSB,
            isGettingBalanceSB: initialStateOfUserInfo.isGettingBalanceSB,
            selfExclusionInfo: {
              ...initialStateOfUserInfo.selfExclusionInfo
            }
          },
          betCartInfo : initialStateOfBetCart,
        }
      },
    });

    const persistConfig = {
      key: "redux_persist",
      storage, // if needed, use a safer storage
      transforms: [betCartTransform],
      version: 1,
      migrate: migrations,
    };

    const persistedReducer = persistReducer(persistConfig, RootReducer); // Create a new reducer with our existing reducer

    const store = createStore(
      persistedReducer,
      bindMiddleware([thunk])
    ); // Creating the store again

    store.__persistor = persistStore(store); // This creates a persistor object & push that persisted object to .__persistor, so that we can avail the persistability feature

    return store;
  }
};

// export an assembled wrapper
export const storeWrapper = createWrapper(makeStore);

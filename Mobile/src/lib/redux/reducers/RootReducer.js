/*
 * @Author: Alan
 * @Date: 2022-03-07 11:49:02
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-27 23:55:28
 * @Description: 状态管理
 * @FilePath: \Mobile\src\lib\redux\reducers\RootReducer.js
 */
import { combineReducers } from 'redux';

import UserInfoReducer from './UserInfoReducer';
import BetCartReducer from './BetCartReducer';
import MaintainStatus from './MaintainStatusReducer';
import RouterLogReducer from './RouterLogReducer';
import UserSettingReducer from './UserSettingReducer';
import GamesInfoReducer from './GamesInfoReducer';

//存款
import {
	MethodsDetails,
	Methods,
	MethodsActive,
	DepositMoneyStatus,
	DepositMemberBanks,
	BanksBankAccounts,
	DepositBankSearch,
	DepositBankActive,
	DepositMemberBanksActive,
	DepositDateSelect,
	UploadFileList,
	UploadFileErr,
	DepositTimeSelect,
	DepositPayments,
	DepositNextStep,
	MethodCodeActive,
	DepositSuccessPage,
	UploadFileStatus,
	DepositCardNumber_CC,
	DepositCardPIN_CC,
	SuggestedAmounts,
	MemberCancelDeposit,
	DepositOldBank,
	DepositOldBankSixNumberStatus,
	LBOfflineRefNo,
	RemoveAllReducersState,
	CopyKey,
	DepositAccountByAmount,
	MemberInfo,
	Announcement,
	LoginOTP,
	DepositBouns
  } from '$Deposits/store/reducers/DepositReducer'

const RootReducer = combineReducers({
	//中心化s t r
	MethodsDetails: MethodsDetails,
	Methods: Methods,
	MethodsActive: MethodsActive,
	DepositMoneyStatus: DepositMoneyStatus,
	DepositMemberBanks: DepositMemberBanks,
	BanksBankAccounts: BanksBankAccounts,
	DepositBankSearch: DepositBankSearch,
	DepositBankActive: DepositBankActive,
	DepositMemberBanksActive: DepositMemberBanksActive,
	DepositDateSelect: DepositDateSelect,
	UploadFileList: UploadFileList,
	UploadFileErr: UploadFileErr,
	DepositTimeSelect: DepositTimeSelect,
	DepositPayments: DepositPayments,
	DepositNextStep: DepositNextStep,
	MethodCodeActive: MethodCodeActive,
	DepositSuccessPage: DepositSuccessPage,
	UploadFileStatus: UploadFileStatus,
	DepositCardNumber_CC: DepositCardNumber_CC,
	DepositCardPIN_CC: DepositCardPIN_CC,
	SuggestedAmounts: SuggestedAmounts,
	MemberCancelDeposit: MemberCancelDeposit,
	DepositOldBank: DepositOldBank,
	DepositOldBankSixNumberStatus: DepositOldBankSixNumberStatus,
	LBOfflineRefNo: LBOfflineRefNo,
	RemoveAllReducersState: RemoveAllReducersState,
	CopyKey: CopyKey,
	DepositAccountByAmount: DepositAccountByAmount,
	MemberInfo: MemberInfo,
	Announcement: Announcement,
	LoginOTP: LoginOTP,
	DepositBouns:DepositBouns,
	//中心化end




	userInfo: UserInfoReducer,
	userSetting: UserSettingReducer,
	betCartInfo: BetCartReducer,
	maintainStatus: MaintainStatus,
	routerLog: RouterLogReducer,
	GamesList: GamesInfoReducer



});

export default RootReducer;

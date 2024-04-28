import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import HostConfig from '@/server/Host.config';
import Toast from '@/components/View/Toast';
import Qs from 'qs';

// 获取余额
export function GetAllBalance(call) {
	fetchRequest(ApiPort.GETBalance, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetAllBalance error:', error);
			Toast.error('获取余额异常');
			return null;
		});
}

// 获取支付方式
export function GetPayList(call) {
	fetchRequest(ApiPort.GETPaymentlistAPI, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetPayList error:', error);
			return null;
		});
}

// 获取支付方式的详情
export function GetPayDetail(type, call, payListOrValue) {
	let MethodCode = '';
	if (Array.isArray(payListOrValue)) {
		const payMethodsDetail = payListOrValue.find((item) => item.code === type);
		if (
			payMethodsDetail &&
			Array.isArray(payMethodsDetail.availableMethods) &&
			payMethodsDetail.availableMethods.length
		) {
			//支付渠道
			let payMethod = payMethodsDetail.availableMethods;
			//判断是否含有 DEFAULT
			let HaveDEFAULT = payMethod.find((item) => item.methodCode == 'DEFAULT') ? true : false;
			//如果有支付渠道
			if (payMethod.length == 1) {
				MethodCode = payMethod[0].methodCode;
			} else {
				//如果支付渠道 不含有 DEFAULT
				if (!HaveDEFAULT && payMethod.length != 0) {
					MethodCode = payMethod[0].methodCode;
				} else if (payMethod.length == 2) {
					MethodCode = payMethod[1].methodCode;
				} else if (payMethod.length >= 2) {
					MethodCode = payMethod[1].methodCode;
				} else {
					MethodCode = payMethod[0].methodCode;
				}
			}

			// if (payMethodsDetail.availableMethods.length >= 2 && type !== 'CTC') {
			// 	MethodCode = payMethodsDetail.availableMethods[1].methodCode;
			// } else {
			// 	MethodCode = payMethodsDetail.availableMethods[0].methodCode;
			// }
		}
	} else if (typeof payListOrValue === 'string') {
		MethodCode = payListOrValue;
	}

	fetchRequest(
		ApiPort.GETDepositDetailsAPI +
			'method=' +
			type +
			'&MethodCode=' +
			MethodCode +
			'&isMobile=' +
			(type === 'BCM' ? 'true' : 'false') +
			'&hostName=' +
			HostConfig.Config.LocalHost +
			'&',
		'GET'
	)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetPayDetail error:', error);
			return null;
		});
}

// 获取目标账户列表
export function GetWalletList(call) {
	const localWalletList = localStorage.getItem('walletList');
	localWalletList === null || localWalletList === ''
		? fetchRequest(ApiPort.GETWallets, 'GET')
				.then((res) => {
					if (res) {
						localStorage.setItem('walletList', JSON.stringify(res));
						call(res);
					}
				})
				.catch((error) => {
					console.log('GetWalletList error:', error);
					Toast.error('获取钱包异常');
					return null;
				})
		: call(JSON.parse(localWalletList));
}

// 获取可申请优惠列表
export function GetWalletBonus(AccountType, call) {
	fetchRequest(ApiPort.GETBonuslistAPI + 'wallet=' + AccountType + '&', 'GET')
		.then((res) => {
			res && call(res);
		})
		.catch((error) => {
			console.log('GetWalletBonus error:', error);
			return null;
		});
}

// 获取转账可申请优惠列表
export function GetTransferWalletBonus(AccountType, call) {
	fetchRequest(ApiPort.GETTransferBonuslistAPI + 'wallet=' + AccountType + '&', 'GET')
		.then((res) => {
			res && call(res);
		})
		.catch((error) => {
			console.log('GetWalletBonus error:', error);
			return null;
		});
}

// 优惠申请
export function PromoPostApplications(data, call) {
	fetchRequest(ApiPort.PromoApplications, 'POST', data)
		.then((res) => {
			//{ message: 'fun88_BonusApplySuccess', bonusResult: { message: 'Success' } };
			// if (res.message == 'fun88_BonusApplyFail') {
			// 	call(res);
			// 	return Toast.error('优惠申请失败，请联系在线客服！');
			// }
			call(res);
		})
		.catch((error) => {
			console.log('CommonPostPay error:', error);
			return null;
		});
}

// 上传文件 本地银行
export function PostUploadAttachment(data, call) {
	fetchRequest(ApiPort.UploadAttachment, 'POST', data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('CommonPostPay error:', error);
			return null;
		});
}

// 提交充值 || 提交提款
export function CommonPostPay(data, call) {
	fetchRequest(ApiPort.POSTApplications, 'POST', data)
		.then((res) => {
			call(res);
			if (!res.isSuccess) {
				if(data.transactionType !== 'Withdrawal'){
					switch (res.errors[0].errorCode) {
						case "P111001":
							return Toast.error("目前没有合适的金额，请尝试使用不同的存款提交方法")
					
						case "P101116":
						case "P111004":
							break;

						default:
							return Toast.error(res.errors[0].message || res.errorMessage || '数据异常，请联系在线客服！')
					}
				}
			}			
		})
		.catch((error) => {
			console.log('CommonPostPay error:', error);
			return null;
		});
}

// 提交充值确认
export function CommonPostConfirmPay(data, call) {
	fetchRequest(ApiPort.POSTPaymentConfirmStep + `ConfirmStep?transactionId=${data.transactionId}&`, 'POST', data)
		.then((res) => {
			res && call(res);
			if (res.isSuccess) {
				Toast.success('订单成立！交易正在进行中，您的存款将在指定时间内到账，感谢您的耐心等待！', 5);
			} else {
				Toast.error('输入的旧账号错误！');
			}
		})
		.catch((error) => {
			console.log('CommonPostConfirmPay error:', error);
			return null;
		});
}

// 提交转账
export function TransferSubmit(data, call) {
	fetchRequest(ApiPort.POSTTransfer, 'POST', data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('TransferSubmit error:', error);
			return null;
		});
}

// 获取用户已绑定银行卡
export function GetMemberBanks(call) {
	fetchRequest(ApiPort.GETMemberBanksfirst, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetMemberBanks error:', error);
			return null;
		});
}

// 获取提款方式
export function GetWithdrawalMethods(call) {
	fetchRequest(ApiPort.GETCanWithdrawalPay, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetWithdrawalMethods error:', error);
			return null;
		});
}

/**
 * @description: 获取选择的钱包类型详情信息
 * @param {*} params query 参数
 * @param {*} call	返回的数据
 * @return {*}
 */
export function GetWithdrawDetails(params, call) {
	params.hostName = HostConfig.Config.LocalHost;
	fetchRequest(ApiPort.GETWithdrawDetailsAPI + Qs.stringify(params) + '&', 'GET')
		.then((res) => {
			if (res.isSuccess) {
				//把获取到的各大银行列表存到本地
				sessionStorage.setItem('Paymentbanks', JSON.stringify(res.result.banks));
			}
			call(res);
		})
		.catch((error) => {
			console.log('GETWithdrawDetailsAPI error:', error);
			Toast.error('获取获取选择的钱包类型详情信息异常');
			return null;
		});
}

/**
 * @description: 获取虚拟币的时时汇率
 * @param {*} params 传参
 * @param {*} call	返回的数据
 * @return {*}
 */
export function GetExchangeRateDetails(params, call) {
	fetchRequest(ApiPort.getExchangeRate + Qs.stringify(params) + '&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetExchangeRateDetailsAPI error:', error);
			Toast.error('获取虚拟币的时时汇率详情信息异常');
			return null;
		});
}

/**
 * @description: 获取虚拟币钱包地址列表
 * @param {*} params
 * @param {*} call
 * @return {*}
 */
export function GetCryptocurrencyWalletAddressDetails(params, call) {
	console.log(params);
	fetchRequest(ApiPort.GetCryptocurrencyWalletAddress + Qs.stringify(params) + '&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetCryptocurrencyWalletAddress error:', error);
			Toast.error('获取虚拟币钱包地址列表信息异常');
			return null;
		});
}

/**
 * @description: 新增虚拟币钱包地址
 * @param {*} params
 * @param {*} call
 * @return {*}
 */
export function AddCryptocurrencyWalletAddress(data, call) {
	fetchRequest(ApiPort.AddCryptocurrencyWalletAddress, 'POST', data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('AddCryptocurrencyWalletAddress error:', error);
			Toast.error('新增虚拟币钱包地址出现异常');
			return null;
		});
}

/**
 * @description: 设置默认虚拟币钱包地址
 * @param {*} params
 * @param {*} call
 * @return {*}
 */
export function SetDefaultWalletAddress(params, call) {
	fetchRequest(ApiPort.SetDefaultWalletAddress + Qs.stringify(params) + '&', 'PATCH')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('SetDefaultWalletAddress error:', error);
			return null;
		});
}

/**
 * @description: 查询一张银行卡是否已经达到限制条件和已提款的金额，以及已提款的次数
 * @param {*} params 
 * @param {*} call
 * @return {*}
 */
export function GetCheckWithdrawalThresholdDetails(params, call) {
	fetchRequest(ApiPort.CheckWithdrawalThreshold + Qs.stringify(params) + '&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetCheckWithdrawalThresholdDetails error:', error);
			Toast.error('获取银行卡信息异常');
			return null;
		});
}

/**
 * @description: 查询交易记录 充值 提款 
 * @param {*} params 
 * @param {*} call
 * @return {*}
 */
export function GetBankingHistory(params, call) {
	fetchRequest(ApiPort.BankingHistory + Qs.stringify(params) + '&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetBankingHistory error:', error);
			Toast.error('获取交易记录信息异常');
			return null;
		});
}

/**
 * @description: 查询交易记录 转账
 * @param {*} params 
 * @param {*} call
 * @return {*}
 */
export function GetTransferHistory(params, call) {
	fetchRequest(ApiPort.TransferHistory + Qs.stringify(params) + '&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetTransferHistory error:', error);
			Toast.error('获取转账交易记录信息异常');
			return null;
		});
}

/**
 * @description: 查询设置的最大提款的金额，以及最多提款的次数，和百分比
 * @param {*} params
 * @param {*} call
 * @return {*}
 */
export function MemberWithdrawalThreshold(call) {
	fetchRequest(ApiPort.GetMemberWithdrawalThreshold, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetMemberWithdrawalThreshold error:', error);
			return null;
		});
}

/**
 * @description: 设置会员默认银行卡
 * @param {*} params 银行卡id
 * @param {*} call
 * @return {*}
 */
export function SetMemberBanksDefault(params, call) {
	fetchRequest(ApiPort.SetMemberBankDefault + Qs.stringify(params) + '&', 'PATCH')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('SetMemberBanksDefault error:', error);
			return null;
		});
}

/**
 * @description: 新增提款卡
 * @param {*} data 新的提款卡信息
 * @param {*} call
 * @return {*}
 */
export function AddMemberBank(data, call) {
	fetchRequest(ApiPort.AddMemberBank, 'POST', data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetMemberBanks error:', error);
			return null;
		});
}

/**
 * @description:获取提款门槛限额
 * @param {*} call
 * @return {*}
 */
export function GetWithdrawalThresholdLimit(call) {
	fetchRequest(ApiPort.GetWithdrawalThresholdLimit, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetWithdrawalThresholdLimit error:', error);
			return null;
		});
}

/**
 * @description: 获取提款历史记录金额和次数
 * @param {*} params 时间区间
 * @param {*} call
 * @return {*}
 */
export function GetWithdrawalThresholdHistory(params, call) {
	fetchRequest(ApiPort.GetWithdrawalThresholdHistory + Qs.stringify(params) + '&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetWithdrawalThresholdHistory error:', error);
			return null;
		});
}

/**
 * @description: 设置提款限额
 * @param {*} params 提款限额参数 
 * @param {*} call
 * @return {*}
 */
export function UpdateMemberWithdrawalThreshold(data, call) {
	fetchRequest(ApiPort.UpdateMemberWithdrawalThreshold, 'PATCH', data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('UpdateMemberWithdrawalThreshold error:', error);
			return null;
		});
}

/**
 * @description: 申请提款
 * @param {*} data 收款卡信息
 * @param {*} call
 * @return {*}
 */
export function WithdrawalApplications(data, call) {
	fetchRequest(ApiPort.WithdrawalApplications, 'POST', data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('WithdrawalApplications error:', error);
			return null;
		});
}

//获取银卡列表 用于验证会员信息
export function GetWithdrawallBanks(call) {
	fetchRequest(ApiPort.GETWithdrawalBank + '&method=LB&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetWithdrawallBanks error:', error);
			return null;
		});
}

//取消存款
export function MemberCancelDeposit(params, call) {
	fetchRequest(ApiPort.MemberCancelDeposit + Qs.stringify(params) + '&', 'POST')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('MemberCancelDeposit error:', error);
			return null;
		});
}

//取消交易
export function MemberCancellation(data, call) {
	fetchRequest(ApiPort.MemberCancellation + 'transactionId=' + data.transactionId + '&', 'POST', data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('MemberCancelDeposit error:', error);
			return null;
		});
}

//重新提存款
export function ResubmitOnlineDeposit(params, call) {
	fetchRequest(ApiPort.ResubmitOnlineDeposit + Qs.stringify(params) + '&', 'POST')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('ResubmitOnlineDeposit error:', error);
			return null;
		});
}

//交易记录 银行详情
export function TransactionHistory(params, call) {
	fetchRequest(ApiPort.TransactionHistory + Qs.stringify(params) + '&', 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('TransactionHistory error:', error);
			return null;
		});
}

/**
 * @description: 确认提款到账
 * @param {*} params
 * @param {*} call
 * @return {*}
 */
export function ConfirmWithdrawalComplete(params, call) {
	fetchRequest(ApiPort.ConfirmWithdrawalComplete + Qs.stringify(params) + '&', 'POST')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('ConfirmWithdrawalComplete error:', error);
			return null;
		});
}

/**
 * @description: 確認提款拆分小額(SR)
 * @param {*} transactionID
 * @param {*} call
 * @return {*}
 */
export function SubWithdrawalTransactionDetails(transactionID, call) {
	fetchRequest(ApiPort.SubWithdrawalTransactionDetails + `${transactionID}/SubWithdrawalTransactionDetails?`, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('SubWithdrawalTransactionDetails error:', error);
			return null;
		});
}

/**
 * @description: 刪除銀行卡
 * @param {*} bankId 欲刪除銀行卡之bankId
 * @param {*} call
 * @return {*}
 */
export function DeleteMemberBank(bankId, call) {
	fetchRequest(ApiPort.DeleteMemberBank+bankId+"&", 'DELETE')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('DeleteMemberBank error:', error);
			return null;
		});
}

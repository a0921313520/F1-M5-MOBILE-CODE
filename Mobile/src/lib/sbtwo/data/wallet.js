import { fetchRequest } from '$SBTWOLIB/SportRequest';
import { ApiPort } from '$SBTWOLIB/SPORTAPI';
import HostConfig from '@/server/Host.config';
import Toast from '$SBTWO/Toast';
import Modal from "$SBTWO/Modal";

// 获取余额
export function GetAllBalance(call) {
	fetchRequest(ApiPort.GETBalance, 'GET')
		.then((res) => {
			if (res && res.isSuccess && res.result) {
				call(res);
			} else {
				throw 'GetAllBalance empty??'
			}
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
			if (payMethodsDetail.availableMethods.length >= 2 && type !== 'CTC') {
				MethodCode = payMethodsDetail.availableMethods[1].MethodCode;
			} else {
				MethodCode = payMethodsDetail.availableMethods[0].MethodCode;
			}
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
			if (res && res.isSuccess && res.result) {
				call(res);
			} else {
				throw 'GetWalletBonus empty??'
			}
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
			if (res && res.isSuccess && res.result) {
				call(res);
			} else {
				throw 'GetTransferWalletBonus empty??'
			}
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
			if (!res.isSuccess) {
				call(res);
				return (
				data.transactionType !== 'Withdrawal'
					&& !(data.paymentMethod == 'PPB' && res.errorCode =='P103001') //有彈窗所以不報錯
					&& !(data.paymentMethod == 'SR' && (res.errorCode =='P111001' || res.errorCode =='P111004' || res.errorCode =='P101116')) //有彈窗所以不報錯
					&& Toast.error(res.errorMessage || '数据异常，请联系在线客服！')
				)
			}
			call(res);
		})
		.catch((error) => {
			console.log('CommonPostPay error:', error);
			return null;
		});
}

// 提交充值确认
export function CommonPostConfirmPay(data, call) {
	fetchRequest(ApiPort.POSTPaymentConfirmStep + data.transactionId + '/ConfirmStep?', 'POST', data)
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

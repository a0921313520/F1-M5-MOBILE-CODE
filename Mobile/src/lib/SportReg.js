/*
 * @Author: Alan
 * @Date: 2021-11-08 14:02:33
 * @LastEditors: Alan
 * @LastEditTime: 2022-04-12 00:47:20
 * @Description: 正则
 * @FilePath: \Mobile\src\lib\SportReg.js
 */

// 公用正则表达式

export const password_reg = /^(?=.{6,20}$)(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[\^#$@]*)([\^#$@]*[a-zA-Z0-9][\^#$@]*)+$/;
export const userName_reg = /^[a-zA-Z0-9]{6,14}$/;
export const phone_reg = /^(0|17951)?(13[0-9]|15[0-9]|16[0-9]|17[0135678]|18[0-9]|19[0-9]|14[57])[0-9]{8}$/;
export const email_reg = /^[A-Za-z0-9_]+[a-zA-Z0-9_\.\-]{0,}@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
export const email_reg_2 = /^[^_.-].*[^/_.-]$/; // 不能以_.-開頭結尾

// 用户真实姓名
export const realyNameReg = /^[a-zA-Z_ƢƣÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêếìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹý\s]{2,50}$/
// telegram
export const telegramReg = /^[0-9a-zA-Z_]*$/
// 充值账号后6位
export const sixLastNumReg = /^[0-9]{6}$/;
// 充值金额限制小数后两位
export const depositMoneyDecimal = /^(([1-9][0-9]*)|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/;
// 充值金额限制整数
export const depositMoneyInt = /^[0-9]*$/;
export const amountReg = /^(0|([1-9][0-9]*))$/;
//身份证  18位
export const idCard = /^[0-9]\d{16}(\d|x|X)$/;
///^[1-9][0-9]{5}(19[0-9]{2}|200[0-9]|2010)(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[0-9]{3}[0-9xX]$/
// QQ
export const qqReg = /^[0-9]{1,30}$/;
// wechat
export const wechatReg = /^[-_a-zA-Z0-9]{1,60}$/;
// 姓名（中文）
export const nameReg = /^[a-zA-Z0-9'\u4e00-\u9fa5\u0E00-\u0E7F ]{2,50}$/;
//地址 中英文 + 数字 +常用的标点符号
export const addressReg = /^[\u4E00-\u9FA5A-Za-z0-9\@\.\,\?\。\，\-\——\=\;\@\！\!\_\+]{2,100}$/;
//泰达币名称
export const usdtNameReg =/^[0-9a-zA-Z_ƢƣÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêếìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹý\s]{1,20}$/;
//泰达币ERC20
export const usdtERC20Reg = /^(0x|0X)[a-fA-F0-9]{40}$/;
//泰达币TRC20
export const usdtTRC20Reg = /^(T)[a-zA-Z0-9]{33}$/;
//银行卡号  14-19位
export const BankCard =  /^[0-9]{14,19}$/;

//用户名称
export const bankNameReg = /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{1,}$/;

export const pickNotNumberWithFirstNumberNon_zero = /^0|[^\d]/g //逐字選取非數字，且第一位不可為0
export const moneyAmountAllow2Decimal = /^\d+(\.\d{2})?$/ //驗證金額為整數或小數點後兩位(一位也算錯)
export const pickNotNumberAllowDecimal= /^[^0-9]|^0*(?=[^\.])|[^0-9\.]|\.(?=.*\.)/g 
// 只允許輸入整數且第一位不可為0
export const nonNumericWithoutDecimal = /^0|[\D]/
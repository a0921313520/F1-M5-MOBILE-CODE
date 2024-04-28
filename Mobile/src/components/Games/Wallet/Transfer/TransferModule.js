import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect} from "react";
import { createForm } from 'rc-form';
import BalanceList from "@/components/sbtwo/Balance-Dropdown/BalanceList";
import Item from '@/components/View/FormItem';
import Input from '@/components/View/Input';
import Button from '@/components/View/Button';
import Toast from '@/components/View/Toast';
import { walletIconColor } from "@/lib/data/DataList.js";
import { BsChevronDown, BsChevronUp, BsFillCircleFill } from "react-icons/bs";
import { numberWithCommas, getE2BBValue } from '@/lib/js/util';
import { TransferSubmit } from '@/api/wallet';
import { ACTION_UserInfo_getBalance } from '@/lib/redux/actions/UserInfoAction';
import {pickNotNumberWithFirstNumberNon_zero, moneyAmountAllow2Decimal, pickNotNumberAllowDecimal} from "@/lib/SportReg"
import { GetTransferWalletBonus } from '@/api/wallet';
import Flexbox from '@/components/View/Flexbox/';
import SelectDrawerMenu from "@/components/View/SelectDrawerMenu";

function TransferModule(props){
  const {userInfo} = useSelector(state=>state)
  const dispatch = useDispatch();
  const { BalanceInit } = userInfo;
  const [isFromWalletListOpen, setIsFromWalletListOpen] = useState(false)
  const [bonusList, setBonusList] = useState([])
  const [selectBonus, setSelectBonus] = useState(0)
  const [selectedFromWallet, setSelectFromWallet] = useState(BalanceInit.find(item=>item.name!=="TotalBal" && item.balance)||BalanceInit[0])
  const {type, form, closeCollapse, toWalletDetail} = props;
  const {getFieldError, getFieldsError, getFieldDecorator, getFieldsValue, resetFields} = form;
  
  useEffect(()=>{
    getDepositWalletBonus()
    setSelectFromWallet(BalanceInit.find(item=>item?.name===selectedFromWallet?.name))
  },[BalanceInit])


  function getDepositWalletBonus() {
    GetTransferWalletBonus(toWalletDetail.name, (res) => {
      setBonusList(res.result)
    });
  }


  function handleTransfer(type) {
		Toast.loading();
		let DATA =
			type == 'ALL'
				? {
						fromAccount: 'ALL',
						toAccount: toWalletDetail.name,
						amount: BalanceInit.find((item) => item.name == 'TotalBal').balance,
						bonusId: selectBonus ? selectBonus : 0,
						bonusCoupon: '',
						blackBoxValue: getE2BBValue(),
						e2BlackBoxValue: getE2BBValue()
					}
				: {
						fromAccount: selectedFromWallet.name,
						toAccount: toWalletDetail.name,
						amount: getFieldsValue().amount,
						bonusId: selectBonus ? selectBonus : 0,
						bonusCoupon: "",
						blackBoxValue: getE2BBValue(),
						e2BlackBoxValue: getE2BBValue()
					};

		TransferSubmit(DATA, (res) => {
			Toast.destroy();
			if (res.isSuccess && res.result) {
				// 0 – failed 失败
				// 1 - success 成功
				// 2 – pending  等待
				if (res.result.status == 1) {
					Toast.success(res.result.messages, 3);
					resetFields();
					dispatch(ACTION_UserInfo_getBalance(true));
					return;
				} else {
          // UI Flow看不出遊戲內的轉帳是否需觸發以下條件，暫先註解
					// if (
					// 	res.result.status == 2 &&
					// 	res.result.selfExclusionOption &&
					// 	res.result.selfExclusionOption.isExceedLimit
					// ) {
					// 	//自我限制彈窗
					// 	this.setState({
					// 		showExceedLimit: true
					// 	});
					// } else if (res.result.status == 2 && res.result.unfinishedGamesMessages) {
					// 	//未完成游戏列表弹窗
					// 	if (res.result.unfinishedGames.length != 0) {
					// 		//如果含有游戏列表
					// 		this.setState({
					// 			unfinishedGames: res.result.unfinishedGames
					// 		});
					// 	}
					// 	this.setState({
					// 		visiblePopUp: true,
					// 		unfinishedGamesMessages: res.result.unfinishedGamesMessages
					// 	});
					// } else {
					// 	Toast.error(res.result.messages, 2);
					// }
				}
			} else {
				Toast.error('转账出错，稍后重试！');
			}
		});
		Pushgtagdata(`Transfer`, 'Submit', `${type == 'ALL' ? toWalletDetail.name : getFieldsValue().amount}_QuickTransfer`);
	}
  
  
  function isSubmittable(){
    const hasValue = Object.values(getFieldsValue()).every(value=>value)
    const noError = Object.values(getFieldsError()).every(value=>value===undefined)
    const totalBal = BalanceInit.find(item=>item.name==="TotalBal").balance
    return hasValue && noError && totalBal;
  }

  const selectFromList = function(item){
    if(type==="Normal"){
      setSelectFromWallet(item);
      setIsFromWalletListOpen()
      resetFields();
    }
  }

  function getWalletUIText(item, disabled){
      return (
        <div className="account_selection" 
          onClick={()=>{!disabled && setIsFromWalletListOpen(prev=>!prev)}}
          style={{
            borderColor:!disabled && isFromWalletListOpen && "#00A6FF",
            backgroundColor:disabled && "#EFEFF4",
          }}
        >
          <p>
            <BsFillCircleFill className="wallet_dot" size='8' color={walletIconColor[item.category]} />
            <span>{item.localizedName}</span>
            <span className="from_amount">{numberWithCommas(item.balance)} đ</span>
          </p>
          {!disabled &&  (isFromWalletListOpen ? <BsChevronUp size={14} /> : <BsChevronDown size={14} />)}
        </div>
      )
  }
  
  return(
    <div className="transfer_module">
      <div className="form-item fromWallet">
          <label data-CN="來自帳戶">Từ tài khoản</label>
          {type==="Normal" && getWalletUIText(selectedFromWallet)}
          {(type==="OneClick" || isFromWalletListOpen) && (
            <BalanceList 
              className={
                type==="OneClick" 
                ? "OneClick_list" 
                : isFromWalletListOpen 
                ? "Normal_list"
                : ""
              }
              toWalletDetail={toWalletDetail}
              filter={isFromWalletListOpen ? "withoutTotal" : "oneClickTransfer"}
              onSelect={(item)=>{selectFromList(item)}}
            /> 
          )}
      </div>
        <Item label="Đến tài khoản" data-CN="轉入帳戶">
          {getWalletUIText(toWalletDetail, "disabled")}
        </Item>
        {type==="Normal" && (
           <Item label="Số Tiền Chuyển" data-CN="金額" errorMessage={getFieldError("amount")}>
           { getFieldDecorator("amount", {
													getValueFromEvent: (event) => {
														const formatValue =event.target.value.replace(pickNotNumberAllowDecimal,"")
														const hasDecimal = formatValue.split(".")?.[1]
														if(hasDecimal?.length>2){
															return Number(formatValue).toFixed(2)
														}
														return formatValue
													},
               rules:[
                { required: true, message: 'Vui lòng nhập số tiền' },
                 {
                   validator: (rule, value, callback) => {
                    // if(!value){
                    //   callback('Vui lòng nhập số tiền');
                    //   return
                    // }
                     if (value && !new RegExp(moneyAmountAllow2Decimal).test(value)) {
                      callback('9/6 Mockup未提供 => 转帐金额格式若有小数点，需完整填写小数点后两位，例如: ¥100.10');
                    }
                     if(value > selectedFromWallet.balance){
                       callback('Vượt quá số dư trong ví'); //錢包餘額不足
                     }
                     callback();
                   }
                 }
               ]
             })(
               <Input
               />
             )
           }
         </Item>
        )}
        {type==="Normal" && bonusList.length ? 
          <SelectDrawerMenu
              labelName="Khuyến Mãi"
              Placeholder="Chọn khuyến mãi"  //请选择bonus
              className="back_selector_drawer"
              HideAll={true}
              searchable={false}
              MenuTitle="เลือกโบนัส"
              okText="ยืนยัน"
              cancelText="ยกเลิก"
              disabledText="ไม่มีโบนัสสำหรับบัญชีนี้"
              keyName={["title", "id"]}
              SelectMenu={bonusList}
              SetCodeState={selectBonus}
              isLoading={false}
              setBankCode={(v) => {
                setSelectBonus(v)
              }}
          />
        :  null
        }
        <Button
          wallet={selectedFromWallet}
          className="submitButton" 
          data-CN="轉帳"
          disabled={!isSubmittable()}
          onClick={()=>{
            if(type==="Normal"){
              handleTransfer()
            }else{
              handleTransfer("ALL")
            }
          }}
        >
          Chuyển
        </Button>
        <button onClick={closeCollapse} className="btn_closeCollapse"/>
    </div>
  )
}

export default createForm({ fieldNameProp: 'iframe_transfer'})(TransferModule);
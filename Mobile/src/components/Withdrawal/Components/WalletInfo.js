import ReactIMG from '@/components/View/ReactIMG';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BsChevronDown } from 'react-icons/bs';
import { TransferSubmit } from "@/api/wallet";
import Toast from "@/components/View/Toast";
import { numberWithCommas, getE2BBValue } from "@/lib/js/util";
import { ACTION_UserInfo_getBalance } from '@/lib/redux/actions/UserInfoAction';

function WalletInfo(){
  const dispatch = useDispatch();
  const {userInfo} = useSelector(state=>state)
  const [isWalletListVisible, setIsWalletListVisible] = useState(false)
  const {Balance, BalanceInit} = userInfo
  const otherWallets = BalanceInit.filter(wallet=> wallet.name!=="TotalBal" && wallet.name!=="MAIN" && wallet.state !== "UnderMaintenance");
  const otherWalletsBalance = otherWallets.reduce((acc, wallet)=>acc+wallet.balance, 0);

  function handleTransfer() {
    const hide = Toast.loading();
    let DATA = {
      fromAccount: "ALL",
      toAccount: "MAIN",
      amount: Balance.TotalBal,
      bonusId: 0,
      bonusCoupon: "",
      blackBoxValue: getE2BBValue(),
      e2BlackBoxValue: getE2BBValue(),
    };

    TransferSubmit(DATA, (res) => {
      hide();
      if (res.isSuccess && res.result) {
        if (res.result.status == 1) {
          Toast.success("Chuyển Quỹ Thành Công");
          dispatch(ACTION_UserInfo_getBalance())
        } else {
          Toast.error(res.result.messages);
        }
      } else {
        Toast.error("转账出错，稍后重试！");
      }
    });
  }

  return (
   <div className="walletInfoBox">
      <div className="walletInfoItem totalAmountBox">
        <label >Tổng số dư</label>
        <p className="amount">{numberWithCommas(Balance.TotalBal)} đ</p>
      </div>
      <div className="walletInfoItem mainWalletBox">
        <div className="walletProfile">
          <label >Tài khoản chính</label>
          <p className="amount">{numberWithCommas(Balance.MAIN)} đ</p>
        </div>
        <button className="oneClickTransfer">
          <ReactIMG src='/img/P5/svg/transfericon.svg' onClick={handleTransfer}/>
        </button>
      </div>
      <div className="walletInfoItem otherWalletBox" onClick={()=>{setIsWalletListVisible(prevState=>!prevState)}}>
        <label>Ví khác</label>
        <p className="amount">{numberWithCommas(otherWalletsBalance)} đ</p>
        <BsChevronDown color='#999' size={12}/>
      </div>
      {isWalletListVisible && (
        <div className='otherWalletLists'>
          {otherWallets.map(item=>{
              return (
                <div className='otherWalletItem'>
                  <label>{item.localizedName}</label>
                  <p className='amount'>{numberWithCommas(item.balance)} đ</p>
                </div>
              )
            })} 
        </div>

      )}
  </div>
  )
}

export default WalletInfo;
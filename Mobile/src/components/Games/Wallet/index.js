import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Tabs, { TabPane } from 'rc-tabs';
import TransferInGame from '@/components/Games/Wallet/Transfer/TransferInGame';
import DepositInGame from '@/components/Games/Wallet/Deposit/DepositInGame';

function Wallet(props){
  const [tabKey, setTabKey] = useState("1")
  const {closeCollapse, toWalletDetail} = props
  const {userInfo} = useSelector(state=>state)
  const { BalanceInit } = userInfo;
  const needDeposit = BalanceInit.find(item=>item.name==="TotalBal").balance < 20;
  const needOneClick = !needDeposit && toWalletDetail.balance < 20;
  
  useEffect(()=>{
    if(needDeposit){
      setTabKey("2")
    }else{
      if(needOneClick){
        setTabKey("1")
      }
    }
  },[])
  
  useEffect(()=>{
    setActiveTabInk();
  },[tabKey])
  
  
  function changeTabKey(tabkey){
    setTabKey(tabkey)
  }
  
  function setActiveTabInk(){
    const root = document.querySelector(":root");
    const activeEl = document.querySelector(".tabsNormal_iframe_game_wallet-tab-active > div")
    const width = activeEl.getBoundingClientRect().width;
    const left = activeEl.getBoundingClientRect().left;
    root.style.setProperty("--tabsNormal_iframe_game_wallet-ink-bar__width",`${width}px`)
    root.style.setProperty("--tabsNormal_iframe_game_wallet-ink-bar__left",`${left}px`)
  }

  return(
    <div className={`iframe_game_wallet_container ${needDeposit? "hideTabNav" : ""}`}>
      {needDeposit &&  
        <p className="yellowNote" dataCN="餘額不足，請存款">Số dư không đủ, vui lòng gửi tiền</p>
      }
      {needOneClick &&
        <p className="yellowNote" dataCN="餘額不足，請存款或轉帳">Số dư không đủ, vui lòng chuyển quỹ hoặc gửi tiền</p>
      }
     
      <Tabs 
        prefixCls="tabsNormal_iframe_game_wallet"
        activeKey={tabKey}
        onChange={changeTabKey}
        destroyInactiveTabPane={true}
      >
        <TabPane tab="Chuyển Quỹ" data-CN="轉帳" key="1">
          <TransferInGame 
            closeCollapse={closeCollapse} 
            toWalletDetail={toWalletDetail} 
          />
        </TabPane>
        <TabPane tab="Gửi Tiền" data-CN="存款" key="2">
          <DepositInGame closeCollapse={closeCollapse} />
        </TabPane>
      </Tabs>
    </div>
  )

}

export default Wallet;
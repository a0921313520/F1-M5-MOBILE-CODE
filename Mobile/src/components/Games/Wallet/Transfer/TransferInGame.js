import Tabs, { TabPane } from 'rc-tabs';
import TransferModule from "@/components/Games/Wallet/Transfer/TransferModule";

function TransferInGame(props){
  const {closeCollapse, toWalletDetail} = props;
  
  return (
    <div className="transferInGame_container">
      <Tabs prefixCls="tabsOval" defaultActiveKey="1" destroyInactiveTabPane={true}>
        <TabPane tab="Chuyển Quỹ Nhanh" data-CN="一键转账" key="1">
          <TransferModule 
            type="OneClick" 
            closeCollapse={closeCollapse}
            toWalletDetail={toWalletDetail}
          />
        </TabPane>
        <TabPane tab="Chuyển Quỹ Thường" data-CN="普通转账" key="2">
          <TransferModule 
            type="Normal" 
            closeCollapse={closeCollapse}
            toWalletDetail={toWalletDetail}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}

export default TransferInGame;
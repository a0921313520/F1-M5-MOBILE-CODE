import React from 'react';
import Deposit from '../../../../../pages/deposit/index'

function DepositInGame(props){
  const {closeCollapse} = props;


  return (
    <div className="depositInGameContainer">
      <Deposit />
      <button onClick={closeCollapse} className="btn_closeCollapse"/>
    </div>
  )
}

export default DepositInGame;
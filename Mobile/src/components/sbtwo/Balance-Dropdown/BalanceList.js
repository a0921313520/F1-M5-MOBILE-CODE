import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import Flexbox from '@/components/View/Flexbox/';
import { BsFillCircleFill } from 'react-icons/bs';
import { numberWithCommas, getE2BBValue } from '@/lib/js/util';
import { ReactSVG } from '@/components/View/ReactSVG';
import Popover from '@/components/View/Popover';
import classNames from 'classnames';
import Toast from '@/components/View/Toast';
import { TransferSubmit } from '$SBTWOLIB/data/wallet';
import SelfExclusionModal from '$SBTWO/SelfExclusion';
import { ACTION_UserInfo_getBalance } from '@/lib/redux/actions/UserInfoAction';
import { walletIconColor } from "@/lib/data/DataList.js";

function BalanceList(props) {

  const { userInfo } = useSelector(state=>state);
  const dispatch = useDispatch();
  const [isShowInfo, setIsShowInfo] = useState(false);
  const {type, className, refreshBalance, filter, onSelect, toWalletDetail} = props;
  const { BalanceInit } = userInfo;
  const filteredBalanceList = getFilteredBalanceList();

  /**
        * @description: 一键转入指定账户钱包
        * @return {*}
    */
	const handleTransfer= function(){
		Toast.loading();
		let TotalBalBalance = BalanceInit.find((item) => item.category == 'TotalBal').balance;
		TransferSubmit(
			{
				fromAccount: 'ALL',
				toAccount: type,
				amount: TotalBalBalance,
				bonusId: 0,
				bonusCoupon: '',
				blackBoxValue: getE2BBValue()
			},
			(res) => {
				Toast.destroy();
				if (res && res.result) {
					// 0 – failed 失败
					// 1 - success 成功
					// 2 – pending  等待
					if (res.result.status == 1) {
						Toast.success('转账成功!', 1);

						setTimeout(() => {
              dispatch(ACTION_UserInfo_getBalance(true));
              refreshBalance();
						}, 1000);
					} else {
						if (
							res.result.status == 2 &&
							res.result.selfExclusionOption &&
							res.result.selfExclusionOption.isExceedLimit &&
							window.selfExclusionModalOpen
						) {
							//自我限制彈窗
							window.selfExclusionModalOpen();
						} else {
							Toast.error(res.result.messages, 1);
						}
					}
				} else {
					Toast.error('转账出错，稍后重试！');
				}
			}
		);
	}

  function getFilteredBalanceList(){
    const filteredList = BalanceInit.filter(
      item=>{
        switch(filter){
          case "hasValue":
            return item.balance
          case "withoutTotal":
            return item.name!=="TotalBal";
          case "oneClickTransfer":
            return item.name!==toWalletDetail.name && item.balance && item.name!=="TotalBal";
          default:
            return item;
        }
    })
    return filteredList
  }
  return (
    <Flexbox 
      flexFlow='column' 
      className={`OneTransfer ${className}`}
      style={{backgroundColor:!filteredBalanceList.length && "rgb(239, 239, 244)"}}
    >
      {!!filteredBalanceList.length && 
        filteredBalanceList.map((item, index) => {
          return (
            <Flexbox
              className="balance_item"
              key={index + "list"}
              justifyContent='space-between'
              style={{ position: "relative" }}
              onClick={()=>{
                if(onSelect){
                  onSelect(item)
                }}
              }
            >
              <Flexbox alignItems='center' className="balance_name">
                <i>
                  <BsFillCircleFill size='8' color={walletIconColor[item.category]} />
                </i>
                <label>{item?.localizedName}</label>
                {item.category == "Sportsbook" && (
                  <>
                    <ReactSVG
                      onClick={() => {
                        setIsShowInfo(prevState=>!prevState)
                      }}
                      className='tansfeinfo'
                      src='/svg/TransferInfo.svg'
                    />
                    <Popover
                      direction='top'
                      className='Blance-popover'
                      visible={isShowInfo}
                      onClose={() => {
                        setIsShowInfo(false)
                      }}
                    >
                      <span>
                        包含 V2 虚拟体育, 沙巴体育, BTI 体育，IM 体育和电竞​
                      </span>
                    </Popover>
                  </>
                )}
              </Flexbox>
              <Flexbox className="balance_amount">
                {numberWithCommas(item.balance)} đ
                {item.name == type && (
                  <ReactSVG
                    className={classNames({
                      Hide: item.name == "TotalBal",
                      Transfericon: true,
                    })}
                    src='/img/P5/svg/transfericon.svg'
                    onClick={() => {
                      handleTransfer();
                      Pushgtagdata(
                        `Transfer`,
                        `Submit`,
                        `${
                            type == "SB"
                            ? "Sports_Transfer_SB2.0"
                            : "InstantGames_Transfer_SB2.0​"
                        }​`
                      );
                    }}
                  />
                )}
                {item.name != type && (
                  <div className="space" style={{ width: "30px" }} />
                )}
              </Flexbox>
            </Flexbox>
          );
        })
      }
      {!filteredBalanceList.length && <p style={{textAlign:"center"}}>Please Doposit, no available wallets</p>}
      {/* 自我限制彈窗 轉帳限額 由api返回錯誤訊息發起 */}
      <SelfExclusionModal
      ModalType={2}
      proxySetModalOpen={(func)=>window.selfExclusionModalOpen = func}
    />
      
    </Flexbox>
  );
}

export default BalanceList;

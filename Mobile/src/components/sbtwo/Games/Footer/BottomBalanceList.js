import React from "react";
import Sheet from "react-modal-sheet";
import BalanceList from "../../Balance-Dropdown/BalanceList";
import Button from "@/components/View/Button";
import Flexbox from "@/components/View/Flexbox/";
import Router from "next/router";
import { connect } from "react-redux";
import Loading from "../../../Common/Loading";

class BottomBalanceList extends React.Component {
  constructor(props) {
    super();
    this.state = {
      isBottomSheetVisible: false,
    };
    this._refCheckBetting = React.createRef();
  }

  componentDidMount() {
    this.props.BottomBalanceRef && this.props.BottomBalanceRef(this);
  }

  /* 打开投注窗 */
  ShowBottomSheet = () => {
    this.setState({ isBottomSheetVisible: true });
    setTimeout(() => {
      /* 防止ipone失效 */
      document.getElementsByTagName("html")[0].style.position = "fixed";
      document.body.style.overflowY = "hidden";
    }, 50);
  };

  /* 关闭投注窗  */
  CloseBottomSheet = () => {
    /* 投注等待中 禁止关闭投注窗口 防止意外的错误 */
    if (
      this._refCheckBetting.current &&
      this._refCheckBetting.current.state.StartBettingloading == 1
    )
      return;
    this.setState({ isBottomSheetVisible: false });
    setTimeout(() => {
      document.getElementsByTagName("html")[0].style.position = "unset";
			const isOnlyASheet = document.querySelectorAll(".react-modal-sheet-content").length <=1 ;
			const isNoModal = document.querySelectorAll(".modal").length <1 ;
			if(isOnlyASheet && isNoModal){
				document.body.style.overflowY = 'auto';
			}
    }, 50);
  };

  render() {
    /* 会员投注选择的盘口数据 */
    const { isBottomSheetVisible } = this.state;

    return (
      <div>
        <Sheet
          className='BottomBalanceListContainer'
          isOpen={isBottomSheetVisible}
          onClose={() => this.CloseBottomSheet()}
        >
          <Sheet.Container>
            <Sheet.Content>
              <div className='BottomBalanceListContent'>
                <Loading className='' isLoading={this.props.isGettingBalance}>
                  <h2>钱包余额</h2>
                  <div className='listBox'>
                    <BalanceList
                      type='SB'
                      refreshBalance={this.props.refreshBalance}
                    />
                    <Flexbox className='ActionBtn'>
                      <Button
                        size='large'
                        type='primary'
                        onClick={() => {
                          this.CloseBottomSheet();
                          // Pushgtagdata(
                          //   `Deposit Nav​`,
                          //   `View`,
                          //   `DepositPage_SB2.0​​​`
                          // );
                          Router.push("/Deposit?from=sb20");
                        }}
                      >
                        存款
                      </Button>
                    </Flexbox>
                  </div>
                </Loading>
              </div>
            </Sheet.Content>
          </Sheet.Container>
          <Sheet.Backdrop onClick={() => this.CloseBottomSheet()} />
        </Sheet>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isGettingBalance: state.userInfo.isGettingBalance,
  };
}

export default connect(mapStateToProps)(BottomBalanceList);

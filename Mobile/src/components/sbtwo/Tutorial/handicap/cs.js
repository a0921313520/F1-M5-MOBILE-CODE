import React from "react";
import { BorderWrap, LeftBet, Score } from "$SBTWO/Tutorial/commomUI";

export default function CS() {
  return (
    <React.Fragment>
      <BorderWrap isThreeBox={true} borderHidden={true}>
        <div className="tutorial__heading" style={{marginBottom: '25px'}}>
          竞猜完场赛果比分，投注项与赛果完全一致全赢，反之全输
        </div>
        <Score title="赛果" left="1" right="0" />
        <div className="tutorial__box tutorial__threeBox">
          <LeftBet oddTitle="投1-0" imgType={"win"} />
          <LeftBet colorStyle={"gray"} oddTitle="投0-0" imgType={"lose"} />
          <LeftBet colorStyle={"red"} oddTitle="投0-1" imgType={"lose"} />
        </div>
        <div className="tutorial__box tutorial__threeBox">
          <LeftBet oddTitle="投2-0" imgType={"lose"} />
          <LeftBet colorStyle={"gray"} oddTitle="投1-1" imgType={"lose"} />
          <LeftBet colorStyle={"red"} oddTitle="投0-2" imgType={"lose"} />
        </div>
        <div className="tutorial__box tutorial__threeBox">
          <LeftBet oddTitle="投2-1" imgType={"lose"} />
          <LeftBet colorStyle={"gray"} oddTitle="其他比分" imgType={"lose"} />
          <LeftBet colorStyle={"red"} oddTitle="投1-2" imgType={"lose"} />
        </div>
      </BorderWrap>
    </React.Fragment>
  );
}

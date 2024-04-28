import React from "react";
import { BorderWrap, LeftBet, Score, RightBet } from "$SBTWO/Tutorial/commomUI";

export default function OU() {
  return (
    <React.Fragment>
      <BorderWrap borderHidden={true}>
        <div className="tutorial__heading">
          总进球数大于投项，投注大球全赢，投注小球全输
        </div>
        <div className="tutorial__box">
          <LeftBet odd="大 1.5" oddTitle="投大球" imgType={"win"} />
          <Score title="赛果" left="1" right="1" />
          <RightBet odd="小 1.5" oddTitle="投小球" imgType={"lose"} />
        </div>
        <div className="tutorial__box">
          <LeftBet odd="大 1.5/2" oddTitle="投大球" imgType={"winHalf"} />
          <Score title="赛果" left="1" right="1" />
          <RightBet odd="小 1.5/2" oddTitle="投小球" imgType={"loseHalf"} />
        </div>
      </BorderWrap>
      <BorderWrap borderHidden={true}>
        <div className="tutorial__heading">
          总进球数等于投项，退回本金（走水）
        </div>
        <div className="tutorial__box">
          <LeftBet odd="大 2" oddTitle="投大球" imgType={"returnPrincipal"} />
          <Score title="赛果" left="1" right="1" />
          <RightBet odd="小 2" oddTitle="投小球" imgType={"returnPrincipal"} />
        </div>
      </BorderWrap>
    </React.Fragment>
  );
}

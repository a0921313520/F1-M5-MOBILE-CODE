import React from "react";
import { BorderWrap, LeftBet, Score, RightBet } from "$SBTWO/Tutorial/commomUI";

export default function OE() {
  return (
    <React.Fragment>
      <BorderWrap borderHidden={true}>
        <div className="tutorial__heading">
          总进球数为单数，投注“单”全赢，投注“双”全输
        </div>
        <div className="tutorial__box">
          <LeftBet odd="单" oddTitle="投“单”" imgType={"win"} />
          <Score title="赛果" left="1" right="0" />
          <RightBet odd="双" oddTitle="投“双”" imgType={"lose"} />
        </div>
      </BorderWrap>
      <BorderWrap borderHidden={true}>
        <div className="tutorial__heading">
          总进球数为双数，投注“单”全输，投注“双”全赢 （0-0）为双
        </div>
        <div className="tutorial__box">
          <LeftBet odd="单" oddTitle="投“单”" imgType={"lose"} />
          <Score title="赛果" left="0" right="0" />
          <RightBet odd="单" oddTitle="投“双”" imgType={"win"} />
        </div>
      </BorderWrap>
    </React.Fragment>
  );
}

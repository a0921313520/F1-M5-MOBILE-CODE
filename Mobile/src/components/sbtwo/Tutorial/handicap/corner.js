import React from "react";
import { BorderWrap, LeftBet, Score, RightBet } from "$SBTWO/Tutorial/commomUI";

export default function Corner() {
  return (
    <React.Fragment>
      <BorderWrap tagText="角球-让球" borderHidden={true}>
        <div className="tutorial__box">
          <LeftBet odd="-1.5" oddTitle="投主队" imgType={"win"} />
          <Score title="角球赛果" left="7" right="5" />
          <RightBet odd="+1.5" oddTitle="投客队" imgType={"lose"} />
        </div>
      </BorderWrap>
      <BorderWrap tagText="角球-大小">
        <div className="tutorial__box">
          <LeftBet odd="大 11.5" oddTitle="投大球" imgType={"win"} />
          <Score title="角球赛果" left="7" right="5" />
          <RightBet odd="小 11.5" oddTitle="投小球" imgType={"lose"} />
        </div>
      </BorderWrap>
      <BorderWrap isThreeBox={true} tagText="角球-独赢">
        <Score title="角球赛果" left="7" right="5" />
        <div className="tutorial__box tutorial__threeBox">
          <LeftBet oddTitle="投主胜" imgType={"win"} />
          <LeftBet colorStyle={"gray"} oddTitle="投和局" imgType={"lose"} />
          <LeftBet colorStyle={"red"} oddTitle="投客胜" imgType={"lose"} />
        </div>
      </BorderWrap>
      <BorderWrap tagText="角球-单双">
        <div className="tutorial__box">
          <LeftBet odd="单" oddTitle="投“单”" imgType={"win"} />
          <Score title="角球赛果" left="7" right="5" />
          <RightBet odd="双" oddTitle="投“双”" imgType={"lose"} />
        </div>
      </BorderWrap>
    </React.Fragment>
  );
}

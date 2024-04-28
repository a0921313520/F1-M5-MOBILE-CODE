/*
 * @Author: Alan
 * @Date: 2022-10-28 13:49:34
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-06 15:27:36
 * @Description: 盘口教程
 * @FilePath: \Mobile\src\components\sbtwo\Tutorial\handicap\single.js
 */
import React from "react";
import { BorderWrap, LeftBet, Score } from "$SBTWO/Tutorial/commomUI";

export default function Single() {
  return (
    <React.Fragment>
      <BorderWrap isThreeBox={true} borderHidden={true}>
        <div className="tutorial__heading" style={{marginBottom: '25px'}}>
          竞猜完场胜/负/平，投注项与赛果完全一致全赢，反之全输
        </div>
        <Score title="赛果" left="1" right="1" />
        <div className="tutorial__box tutorial__threeBox">
          <LeftBet oddTitle="投主胜" imgType={"win"} />
          <LeftBet colorStyle={"gray"} oddTitle="投和局" imgType={"lose"} />
          <LeftBet colorStyle={"red"} oddTitle="投客胜" imgType={"lose"} />
        </div>
      </BorderWrap>
      <BorderWrap isThreeBox={true} borderHidden={true}>
        <Score title="赛果" left="1" right="1" />
        <div className="tutorial__box tutorial__threeBox">
          <LeftBet oddTitle="投主胜" imgType={"lose"} />
          <LeftBet colorStyle={"gray"} oddTitle="投和局" imgType={"win"} />
          <LeftBet colorStyle={"red"} oddTitle="投客胜" imgType={"lose"} />
        </div>
      </BorderWrap>
      <BorderWrap isThreeBox={true} borderHidden={true}>
        <Score title="赛果" left="0" right="1" />
        <div className="tutorial__box tutorial__threeBox">
          <LeftBet oddTitle="投主胜" imgType={"lose"} />
          <LeftBet colorStyle={"gray"} oddTitle="投和局" imgType={"lose"} />
          <LeftBet colorStyle={"red"} oddTitle="投客胜" imgType={"win"} />
        </div>
      </BorderWrap>
    </React.Fragment>
  );
}

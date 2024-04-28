import React from 'react';
import { BorderWrap, LeftBet, Score, RightBet } from '$SBTWO/Tutorial/commomUI';

export default function Handicap() {
	return (
		<div style={{ paddingTop: '8px' }}>
			<div className="modal-prompt-info">滚球-让球赛果为投注后的进球比分。例如：投注时比分1-0，完场比分2-1，则滚球-让球盘赛果为1-1</div>
			<BorderWrap tagText="0 (平手盘)">
				<div className="tutorial__heading">主客队实力相当，均不让球，投注赢球方全赢</div>
				<div className="tutorial__box">
					<LeftBet odd="0" oddTitle="投主队" imgType={'win'} />
					<Score title="赛果" left="1" right="0" />
					<RightBet odd="0" oddTitle="投客队" imgType={'lose'} />
				</div>
				<div className="tutorial__box">
					<LeftBet odd="0" oddTitle="投主队" imgType={'returnPrincipal'} />
					<Score title="赛果" left="1" right="1" />
					<RightBet odd="0" oddTitle="投客队" imgType={'returnPrincipal'} />
				</div>
			</BorderWrap>
			<BorderWrap tagText="0/0.5 (平手盘/半球盘)">
				<div className="tutorial__heading">让球方赢1球或以上，投注让球方全赢，投注受让方全输</div>
				<div className="tutorial__box">
					<LeftBet odd="-0/0.5" oddTitle="投主队" imgType={'win'} />
					<Score title="赛果" left="1" right="0" />
					<RightBet odd="+0/0.5" oddTitle="投客队" imgType={'lose'} />
				</div>
				<div className="tutorial__box">
					<LeftBet odd="-0/0.5" oddTitle="投主队" imgType={'loseHalf'} />
					<Score title="赛果" left="0" right="0" />
					<RightBet odd="+0/0.5" oddTitle="投客队" imgType={'winHalf'} />
				</div>
				<div className="tutorial__box">
					<LeftBet odd="-0/0.5" oddTitle="投主队" imgType={'lose'} />
					<Score title="赛果" left="0" right="1" />
					<RightBet odd="+0/0.5" oddTitle="投客队" imgType={'win'} />
				</div>
			</BorderWrap>
			<BorderWrap tagText="0.5 (半手盘)">
				<div className="tutorial__heading">让球方赢1球或以上，投注让球方全赢，投注受让球方全输</div>
				<div className="tutorial__box">
					<LeftBet odd="-0.5" oddTitle="投主队" imgType={'win'} />
					<Score title="赛果" left="1" right="0" />
					<RightBet odd="+0.5" oddTitle="投客队" imgType={'lose'} />
				</div>
				<div className="tutorial__heading">让球方赢1球或以上，投注让球方全赢，投注受让方全输</div>
				<div className="tutorial__box">
					<LeftBet odd="-0.5" oddTitle="投主队" imgType={'lose'} />
					<Score title="赛果" left="0" right="0" />
					<RightBet odd="0" oddTitle="投客队" imgType={'win'} />
				</div>
			</BorderWrap>
			<BorderWrap tagText="0.5/1 (半球/一球盘)">
				<div className="tutorial__heading">让球方赢2球或以上，投注让球方全赢，投注受让方全输</div>
				<div className="tutorial__box">
					<LeftBet odd="-0.5/1" oddTitle="投主队" imgType={'win'} />
					<Score title="赛果" left="2" right="0" />
					<RightBet odd="+0.5/1" oddTitle="投客队" imgType={'lose'} />
				</div>
				<div className="tutorial__heading">让球方赢1球或以上，投注让球方赢一半，投注受让方输一半</div>
				<div className="tutorial__box">
					<LeftBet odd="-0.5/1" oddTitle="投主队" imgType={'winHalf'} />
					<Score title="赛果" left="1" right="0" />
					<RightBet odd="+0.5/1" oddTitle="投客队" imgType={'loseHalf'} />
				</div>
				<div className="tutorial__heading">打平或让球方输球，投注让球方全输，投注受让方全赢</div>
				<div className="tutorial__box">
					<LeftBet odd="-0.5/1" oddTitle="投主队" imgType={'lose'} />
					<Score title="赛果" left="0" right="0" />
					<RightBet odd="+0.5/1" oddTitle="投客队" imgType={'win'} />
				</div>
			</BorderWrap>
			<BorderWrap tagText="1 (一球盘)">
				<div className="tutorial__heading">让球方赢2球或以上，投注让球方全赢，投注受让方全输</div>
				<div className="tutorial__box">
					<LeftBet odd="-1" oddTitle="投主队" imgType={'win'} />
					<Score title="赛果" left="2" right="0" />
					<RightBet odd="+1" oddTitle="投客队" imgType={'lose'} />
				</div>
				<div className="tutorial__heading">让球方赢1球，投注主客均退回本金 （走水）</div>
				<div className="tutorial__box">
					<LeftBet odd="-1" oddTitle="投主队" imgType={'returnPrincipal'} />
					<Score title="赛果" left="1" right="0" />
					<RightBet odd="+1" oddTitle="投客队" imgType={'returnPrincipal'} />
				</div>
				<div className="tutorial__heading">打平或让球方输球，投注让球方全输，投注受让方全赢</div>
				<div className="tutorial__box">
					<LeftBet odd="-1" oddTitle="投主队" imgType={'lose'} />
					<Score title="赛果" left="0" right="0" />
					<RightBet odd="+1" oddTitle="投客队" imgType={'win'} />
				</div>
			</BorderWrap>
			<BorderWrap tagText="1/1.5 (一球/球半盘)">
				<div className="tutorial__heading">让球方赢2球或以上，投注让球方全赢，投注受让方全输</div>
				<div className="tutorial__box">
					<LeftBet odd="-1/1.5" oddTitle="投主队" imgType={'win'} />
					<Score title="赛果" left="2" right="0" />
					<RightBet odd="+1/1.5" oddTitle="投客队" imgType={'lose'} />
				</div>
				<div className="tutorial__heading">让球方赢1球或以上，投注让球方输一半，投注受让方赢一半</div>
				<div className="tutorial__box">
					<LeftBet odd="-1/1.5" oddTitle="投主队" imgType={'loseHalf'} />
					<Score title="赛果" left="1" right="0" />
					<RightBet odd="+1/1.5" oddTitle="投客队" imgType={'winHalf'} />
				</div>
				<div className="tutorial__heading">打平或让球方输球，投注让球方全输，投注受让方全赢</div>
				<div className="tutorial__box">
					<LeftBet odd="-1/1.5" oddTitle="投主队" imgType={'lose'} />
					<Score title="赛果" left="0" right="0" />
					<RightBet odd="+1/1.5" oddTitle="投客队" imgType={'win'} />
				</div>
			</BorderWrap>
			<BorderWrap tagText="1.5 (球半盘)">
				<div className="tutorial__heading">让球方赢2球或以上，投注让球方全赢，投注受让方全输</div>
				<div className="tutorial__box">
					<LeftBet odd="-1.5" oddTitle="投主队" imgType={'win'} />
					<Score title="赛果" left="2" right="0" />
					<RightBet odd="+1.5" oddTitle="投客队" imgType={'lose'} />
				</div>
				<div className="tutorial__heading">让球方赢1球，投注让球全输，投注受让方全赢</div>
				<div className="tutorial__box">
					<LeftBet odd="-1.5" oddTitle="投主队" imgType={'lose'} />
					{/* <LeftBet odd="-1.5" oddTitle="投主队" imgType={"loseHalf"} /> */} {/* 输/半 */}
					<Score title="赛果" left="1" right="0" />
					<RightBet odd="+1.5" oddTitle="投客队" imgType={'win'} />
					{/* <RightBet odd="+1.5" oddTitle="投客队" imgType={"winHalf"} /> */} {/* 赢/半 */}
				</div>
				<div className="tutorial__heading">打平或让球方输球，投注让球方全输，投注受让方全赢</div>
				<div className="tutorial__box">
					<LeftBet odd="-1.5" oddTitle="投主队" imgType={'lose'} />
					<Score title="赛果" left="0" right="0" />
					<RightBet odd="+1.5" oddTitle="投客队" imgType={'win'} />
				</div>
			</BorderWrap>
			<BorderWrap tagText="1.5/2 (球半盘)">
				<div className="tutorial__heading">让球方赢3球或以上，投注让球方全赢，投注受让方全输</div>
				<div className="tutorial__box">
					<LeftBet odd="-1.5/2" oddTitle="投主队" imgType={'win'} />
					<Score title="赛果" left="3" right="0" />
					<RightBet odd="+1.5/2" oddTitle="投客队" imgType={'lose'} />
				</div>
				<div className="tutorial__heading">让球方赢2球，投注让球赢一半，投注受让方输一半</div>
				<div className="tutorial__box">
					<LeftBet odd="-1.5/2" oddTitle="投主队" imgType={'winHalf'} />
					<Score title="赛果" left="2" right="0" />
					<RightBet odd="+1.5/2" oddTitle="投客队" imgType={'loseHalf'} />
				</div>
				<div className="tutorial__heading">让球方赢1球或打平或输球，投注让球方全输，投注受让方全赢</div>
				<div className="tutorial__box">
					<LeftBet odd="-1.5/2" oddTitle="投主队" imgType={'lose'} />
					<Score title="赛果" left="1" right="0" />
					<RightBet odd="+1.5/2" oddTitle="投客队" imgType={'win'} />
				</div>
			</BorderWrap>
		</div>
	);
}

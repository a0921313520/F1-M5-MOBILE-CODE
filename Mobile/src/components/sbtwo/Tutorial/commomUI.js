import ReactIMG from '$SBTWO/ReactIMG';

const BorderWrap = (props) => {
  return (
    <div
      className={`tutorial__border__wrap ${
        props.borderHidden ? "border-hide" : ""
      } ${props.tagText ? "" : "noTitle"} ${
        props.isThreeBox ? "three-box" : ""
      }`}
    >
      {props.tagText && <div className="tutorial__tag">{props.tagText}</div>}
      {props.children}
    </div>
  );
};

const LeftBet = (props) => {
  return (
    <div className="tutorial__betLeft">
      <div className="tutorial__betLeft__odd">{props.odd}</div>
      <div
        className={`tutorial__betLeft__title ${
          props.colorStyle === "gray" ? "grayStyle" : ""
        } ${props.colorStyle === "red" ? "redStyle" : ""}`}
      >
        {props.oddTitle}{" "}
        <ReactIMG
          className="tutorial__betLeft__img"
          style={{width: '40px', height: '40px'}}
          src={`/img/tutorial/${props.imgType}.png`}
        />
      </div>
    </div>
  );
};

const RightBet = (props) => {
  return (
    <div className="tutorial__betRight">
      <div className="tutorial__betRight__odd">{props.odd}</div>
      <div className="tutorial__betRight__title">
        {props.oddTitle}{" "}
        <ReactIMG
          className="tutorial__betRight__img"
          style={{width: '40px', height: '40px'}}
          src={`/img/tutorial/${props.imgType}.png`}
        />
      </div>
    </div>
  );
};

const Score = (props) => {
  return (
    <div className="tutorial__score__wrap">
      <div className="tutorial__score__title">{props.title}</div>
      <div className="tutorial__score">
        {props.left} - {props.right}
      </div>
    </div>
  );
};

const MockTitle = () => {
  return (
    <div className="mockBetting__header">
      <div className="mockBetting__header__title">单选项</div>
      <div className="mockBetting__header__content">
        根据赛果选择会盈利的投注选项
      </div>
    </div>
  );
};

const MockScoreBox = (props) => {
  return (
    <div className="mockScoreBox__wrap">
      <div className="mockScoreBox__team">
        纽卡斯尔联
        <ReactIMG className="" src={`/img/tutorial/teamHome.png`} style={{marginLeft: '8px'}} />
      </div>
      <Score title="赛果" left={props.leftScore} right={props.rightScore} />
      <div className="mockScoreBox__team">
        <ReactIMG className="" src={`/img/tutorial/teamAway.png`} style={{marginRight: '10px'}} />
        热刺
      </div>
    </div>
  );
};

export { BorderWrap, LeftBet, RightBet, Score, MockTitle, MockScoreBox };

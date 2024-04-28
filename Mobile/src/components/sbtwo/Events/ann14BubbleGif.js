import React from "react";

export default class Ann14BubbleGif extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    }

    this.gifMap = [
      '/img/events/ann14/Popping/Popping_Casino.gif',
      '/img/events/ann14/Popping/Popping_Slot.gif',
      '/img/events/ann14/Popping/Popping_Sport.gif',
    ];

    this.portalRef = React.createRef();
    this.timeoutHandle = null;
  }

  componentDidMount() {
    if (this.props.noGif) {
      this.clearTimeouts();
    } else {
      this.ShowGifRandomly(true);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.noGif !== prevProps.noGif) {
      if (this.props.noGif) {
        this.clearTimeouts();
        if (this.portalRef && this.portalRef.current) {
          const portalNode = this.portalRef.current;

          //清理
          while (portalNode.firstChild) {
            portalNode.removeChild(portalNode.lastChild);
          }
        }
      } else {
        this.ShowGifRandomly(true);
      }
    }
  }

  componentWillUnmount() {
    this.clearTimeouts();
  }

  clearTimeouts = () => {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }
  }

  ShowGifRandomly = (isInit = false) => {
    this.clearTimeouts();

    const randomMiliSeconds = Math.round(this.randomNum(isInit ? 0 : 3,10) * 1000);
    this.timeoutHandle = setTimeout(this.ShowGifRandomly, randomMiliSeconds);
    if (isInit) return;

    if (this.portalRef && this.portalRef.current) {
      const portalNode = this.portalRef.current;

      //清理
      while (portalNode.firstChild) {
        portalNode.removeChild(portalNode.lastChild);
      }

      const randomIndex = this.randomInt(0,2);
      const gifNode = this.createGifNode(randomIndex);
      portalNode.appendChild(gifNode);
    }
  }

  createGifNode = (index) => {
    const gifSrc = this.gifMap[index];
    const imgEle = document.createElement('img');
    //增加 ?日期數字 用來強制加載動畫
    imgEle.src = `${process.env.BASE_PATH}` + gifSrc + '?' + new Date().getTime();
    imgEle.setAttribute("class", this.props.gifClassName);
    imgEle.addEventListener('load', () => {
      setTimeout(() => { if (imgEle) imgEle.remove(); } ,1500); //自動刪除
    });
    imgEle.addEventListener( 'click' , (e) => {
      e.stopPropagation(); //禁止穿透點擊
      this.props.gifClick();
    });
    return imgEle;
  }

  randomNum = (min, max) => {
    return Math.random() * (max - min) + min;
  }

  randomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  render() {
    return <span ref={this.portalRef} className={this.props.className} />
  }
}

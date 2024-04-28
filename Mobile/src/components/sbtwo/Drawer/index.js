import React from "react";
import ReactDOM from 'react-dom'
import drawer from './drawer.module.scss'

/*
 * className[type String]: Support
 * wrapDom[type React.createRef()]: 是否需要加载到指定容器中
 * direction[type StringSingle[top,left,right,bottom]]: 窗口弹出方向，默认左侧
 */

export default class Drawer extends React.Component {
    static defaultProps = {
		direction: "left",
	}
    constructor (props) {
        super(props)
        this.state = {
            visibleClass: false,
            isVisible: false,
        }

        this.changeDrawer = this.changeDrawer.bind(this)
        this.drawerContent = React.createRef()
        this.timer = null;
        this.timerAnimate = null;
    }
    componentDidMount () {
        this.scrollWidth = this.getScrollWidth()
    }
    componentDidUpdate (prevProps, prevState) {
        if (prevProps.visible !== this.props.visible //如果初始visible = true 會因為無變化，造成不展示
          || this.props.visible !== this.state.isVisible)  //<=多加一個內部屬性檢查
        {
            this.changeDrawer(this.props.visible);
        }
    }
    componentWillUnmount () {
        clearTimeout(this.timer);
        clearTimeout(this.timerAnimate);
        this.changeDrawer(false, true);
    }
    getScrollWidth () {
        let noScroll, scroll, oDiv = document.createElement("DIV");
        oDiv.style.cssText = "position:absolute; top:-9999px; width:100px; height:100px; overflow:hidden;";
        noScroll = document.body.appendChild(oDiv).clientWidth;
        oDiv.style.overflowY = "scroll";
        scroll = oDiv.clientWidth;
        document.body.removeChild(oDiv);
        return noScroll - scroll;
    }
    changeDrawer (status, isClear) {
        const body = document.body
        // 如果是默认加载Drawer组件，此处调用过早会导致动画失效，需要把这个事件排到队列最后执行
        isClear ? this.setState({visibleClass: status}) : (this.timer = setTimeout(() => {this.setState({visibleClass: status})}));
        this.setState({isVisible: status});

        const BodyClassName = body.getAttribute("class"), ScrollLocked = " scrolling-effect " + this.props.className;
        if (status) {
            body.setAttribute("style", "position: relative; overflow-y: hidden; touch-action: none; width:calc(100% - " + this.scrollWidth + "px);");
            body.setAttribute("class",  BodyClassName + ScrollLocked);
        } else {
            if (isClear) {
                body.setAttribute("style", "");
                body.setAttribute("class", BodyClassName.replace(ScrollLocked, ""));
            } else {
                this.timerAnimate = setTimeout(() => {
                    body.setAttribute("style", "");
                    body.setAttribute("class", BodyClassName.replace(ScrollLocked, ""));
                }, 300);
            }
        }
    }
    render() {
        const { visible, children, onClose } = this.props
        return visible || this.drawerContent.current && this.drawerContent.current.childNodes.length ? ReactDOM.createPortal(
            <div className={`${drawer.drawerWrap} ${this.state.visibleClass ? drawer.drawerOpen : "" } ${this.props.className ? this.props.className : ""} ${drawer[this.props.direction]}`}>
                <div className={`${drawer.drawerMask}` + ' drawer-custom-mask'} onClick={() => {
                    onClose();
                }}></div>
                <div className={`${drawer.drawerContentWrapper}` + ' drawer-custom-content-wrapper'} style={this.props.style}>
                    <div ref={this.drawerContent} className={`${drawer.drawerContent}`  + ' drawer-custom-content'}>
                        { children }
                    </div>
                </div>
            </div>,
            (this.props.wrapDom && this.props.wrapDom.current) || document.body
        ) : null
    }
}
